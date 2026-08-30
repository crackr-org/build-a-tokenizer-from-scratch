import type { ReactNode } from "react";
import { LessonCodeBlock } from "../../components/LessonCodeBlock";
import { LessonInlineCode } from "../../components/LessonInlineCode";
import { LessonNote } from "../../components/LessonNote";
import { LessonReferenceLink } from "../../components/LessonReferenceLink";
import { BpeEncodeDecodeComplexityVisual } from "./BpeEncodeDecodeComplexityVisual";
import { BpeTrainingComplexityVisual } from "./BpeTrainingComplexityVisual";

const bodyClassName =
  "text-[16px] font-medium leading-[1.85] text-cr-text-2 sm:text-[17px]";
const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

const profileCommand = [
  "time python bpe_tokenizer.py",
  "python -m cProfile -s cumulative bpe_tokenizer.py",
].join("\n");

const benchmarkOutput = [
  "tokens: 459,792",
  "compression: 2.43x",
  "median of 3 complete runs: 16.517s",
].join("\n");

const profilerOutput = [
  "ncalls    tottime  cumtime  function",
  "1           5.378   44.103  bpe_tokenizer.py:116(train)",
  "1           0.607    3.591  bpe_tokenizer.py:163(encode)",
  "1           0.000    0.069  bpe_tokenizer.py:184(decode)",
].join("\n");

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="pt-8 text-[27px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[31px]">
      {children}
    </h2>
  );
}

function ComplexityTerm({
  symbol,
  title,
  children,
}: {
  symbol: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-cr-border px-1 py-5 last:border-b-0 sm:px-5 sm:[&:nth-child(odd)]:border-r sm:[&:nth-last-child(-n+2)]:border-b-0">
      <div className="flex items-baseline gap-3">
        <span
          className="text-[15px] font-black text-cr-accent"
          style={monoStyle}
        >
          {symbol}
        </span>
        <p className="text-[14px] font-extrabold text-cr-text">{title}</p>
      </div>
      <p className="mt-2 text-[12px] font-semibold leading-5 text-cr-text-2 sm:pl-7">
        {children}
      </p>
    </div>
  );
}

export function BenchmarkBpePage({
  estimatedMinutes,
}: {
  estimatedMinutes: number;
}) {
  return (
    <article className="mx-auto w-full max-w-[920px] pb-20 pt-4 sm:pt-8">
      <header className="mx-auto max-w-[740px] pb-12 sm:pb-14">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <span className="size-2 border border-cr-brand bg-cr-accent" />
            <p
              className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-cr-text-3"
              style={monoStyle}
            >
              Build a BPE tokenizer
            </p>
          </div>
          <p className="text-[10px] font-bold text-cr-text-3" style={monoStyle}>
            {estimatedMinutes} min
          </p>
        </div>

        <div className="mt-6 h-[2px] bg-cr-border-light">
          <div className="h-[2px] w-40 bg-cr-accent" />
        </div>

        <h1
          className="mt-10 max-w-[720px] text-[44px] font-extrabold leading-[1.02] tracking-[-0.05em] text-cr-text sm:text-[60px]"
          style={{ textWrap: "balance" }}
        >
          Benchmark your BPE implementation
        </h1>

        <p
          className="mt-6 max-w-[710px] text-[19px] font-medium leading-8 tracking-[-0.015em] text-cr-text-2 sm:text-[21px]"
          style={{ textWrap: "balance" }}
        >
          Before we make the trainer fast, we need to know exactly what is
          slow. Work out the cost of the current loop, measure it on Tiny
          Shakespeare, and keep the result as our baseline.
        </p>
      </header>

      <div className="mx-auto max-w-[740px] border-t-2 border-cr-border-light pt-10">
        <div className="space-y-5">
          <p className={bodyClassName}>
            In the previous substage, as an example, we asked our tokenizer to
            learn 20 merges. That is small enough to hide a bad algorithm. If
            you have not tried it yet, increase the vocabulary size. A good
            target for Tiny Shakespeare is 1,024. That should make the problem
            much easier to see.
          </p>

          <p className={bodyClassName}>
            Needless to say, our algorithm is pretty slow. In the next stage,
            we&apos;ll try to optimize it. But before making any changes to the
            implementation, <strong className="font-bold text-cr-text">we need
            a baseline</strong>. The corpus, vocabulary size, Python environment,
            and correctness check must stay fixed.
            Otherwise, it is hard to tell whether a change actually made the
            tokenizer faster.
          </p>

          <SectionTitle>Terminology</SectionTitle>

          <p className={bodyClassName}>
            Let&apos;s give names to the values that control the current trainer:
          </p>

          <div className="my-7 grid border-y-2 border-cr-border-light sm:grid-cols-2">
            <ComplexityTerm symbol="n" title="Corpus size">
              The size of the training text, measured here in UTF-8 bytes.
              Pretokenization processes it once before the merge loop begins.
            </ComplexityTerm>
            <ComplexityTerm symbol="Sᵢ" title="Stored token positions">
              At merge round i, add up the current lengths of all unique
              pretokens. Repeated pretokens are stored once, so they do not add
              positions to Sᵢ, but their frequency still weights the pair
              counts.
            </ComplexityTerm>
            <ComplexityTerm symbol="Pᵢ" title="Distinct adjacent pairs">
              The number of keys in the pair-frequency table at round i. Every
              key must occur at an adjacent position, so Pᵢ cannot be larger
              than Sᵢ.
            </ComplexityTerm>
            <ComplexityTerm symbol="M" title="Requested merges">
              The target vocabulary size minus the 256 starting byte tokens.
              The trainer may learn fewer only if no adjacent pair remains.
            </ComplexityTerm>
          </div>

          <p className={bodyClassName}>
            Pretokenization processes the corpus once, so it costs{" "}
            <LessonInlineCode>O(n)</LessonInlineCode>. During merge round i,
            the trainer counts every adjacent pair in{" "}
            <LessonInlineCode>O(Sᵢ)</LessonInlineCode>, scans the pair table to
            choose the winner in <LessonInlineCode>O(Pᵢ)</LessonInlineCode>, and
            walks every stored pretoken again to apply that winner in{" "}
            <LessonInlineCode>O(Sᵢ)</LessonInlineCode>.
          </p>

          <p className={bodyClassName}>
            We can see that waste in the first Tiny Shakespeare merge. The
            trainer stores 15,057 unique pretokens and checks every one of them
            during replacement, even though only 543 contain the winning pair.
            In other words, 96.4% of those checks cannot change anything. After
            applying the merge, this implementation throws away the entire
            pair-frequency table. The next round rebuilds it by scanning every
            stored pretoken again.
          </p>

          <BpeTrainingComplexityVisual />

          <p className={bodyClassName}>
            In round i, pair counting visits fewer than Sᵢ adjacent positions,
            replacement visits Sᵢ token positions, and choosing the winner
            visits Pᵢ pair-table entries. The scanning work for that round is
            therefore bounded by{" "}
            <LessonInlineCode>2Sᵢ + Pᵢ</LessonInlineCode>. The sequences shrink
            as merges are applied, so later rounds can be a little cheaper. But
            because{" "}
            <LessonInlineCode>Pᵢ ≤ Sᵢ ≤ S₀</LessonInlineCode>, the useful
            worst-case bound is{" "}
            <strong className="font-bold text-cr-text">O(M · S₀)</strong>. Add
            pretokenization and the whole training run is{" "}
            <strong className="font-bold text-cr-text">O(n + M · S₀)</strong>.
          </p>

          <p className={bodyClassName}>
            This is the expensive part: after one pair is merged, most pairs in
            the corpus have not changed, yet we throw the entire frequency table
            away and rebuild it. Then we walk every pretoken, including the ones
            that never contained the winning pair. The next stage will remove
            that repeated work. For now, we want to see it clearly.
          </p>

          <SectionTitle>What about encode and decode?</SectionTitle>

          <p className={bodyClassName}>
            Training is our obvious slowdown, but nonetheless our encoder
            repeats a smaller version of the same work. For example, take one
            pre-token containing L byte IDs. The encoder scans its current pairs
            to find the learned merge with the lowest rank. If it finds one, it
            walks the sequence again to apply that merge, then starts over with
            the shorter result.
          </p>

          <p className={bodyClassName}>
            There can be at most <LessonInlineCode>min(M, L - 1)</LessonInlineCode>{" "}
            successful rounds, followed by one last scan that finds nothing
            else to merge. The resulting upper bound is{" "}
            <strong className="font-bold text-cr-text">
              O(L · (1 + min(M, L)))
            </strong>
            . When the number of learned merges is at least as large as the
            pretoken, that approaches <strong className="font-bold text-cr-text">O(L²)</strong>.
          </p>

          <p className={bodyClassName}>
            Each token ID already points to its original bytes, so the decoder
            looks up those bytes, joins them in order, and decodes the complete
            UTF-8 stream once. If that stream contains B bytes, decoding costs{" "}
            <strong className="font-bold text-cr-text">O(B)</strong>.
          </p>

          <BpeEncodeDecodeComplexityVisual />

          <p className={bodyClassName}>
            The trainer&apos;s working memory holds the pretokens and their
            frequencies, the pair table, the merge table, and the vocabulary.
            That is roughly{" "}
            <LessonInlineCode>O(S + P + M)</LessonInlineCode> entries. Remember
            that vocabulary entries contain byte strings of different lengths,
            so counting dictionary entries alone does not describe every byte
            allocated.
          </p>

          <SectionTitle>Benchmark the program</SectionTitle>

          <p className={bodyClassName}>
            Use a vocabulary size of 1,024 in{" "}
            <LessonInlineCode>bpe_tokenizer.py</LessonInlineCode> to benchmark
            your tokenizer. Then run these commands using the training example
            from the previous substage.
          </p>

          <p className={bodyClassName}>
            The first command runs the Tiny Shakespeare training example once
            and reports how long the complete run takes. The second repeats
            that same run through{" "}
            <LessonReferenceLink href="https://docs.python.org/3/library/profile.html">
              cProfile
            </LessonReferenceLink>
            {" "}and sorts the result by cumulative time. This is a deliberately
            simple benchmark, but enough to give us a baseline.
          </p>

          <LessonCodeBlock
            code={profileCommand}
            language="bash"
            label="Terminal"
          />

          <p className={bodyClassName}>
            I ran the complete program three times against our actual tokenizer
            on my MacBook Pro (12-core Apple M2 Pro, 32 GB of memory) and kept
            the median. Needless to say, your time will differ because it
            depends on your machine, but the token count and compression should
            match.
          </p>

          <LessonCodeBlock
            code={benchmarkOutput}
            language="text"
            label="Benchmark output"
          />

          <p className={bodyClassName}>
            The profiler produces a much longer table. These are the relevant
            rows that we care about:
          </p>

          <LessonCodeBlock
            code={profilerOutput}
            language="text"
            label="Public-method excerpt"
          />

          <p className={bodyClassName}>
            In our run, training owns 44.103 seconds of cumulative time, while
            encoding is much smaller and decoding is almost negligible.
          </p>

          <LessonNote label="Implementation details may differ">
            Everything below <LessonInlineCode>train</LessonInlineCode> depends
            on how you designed the implementation. Pair counting and
            replacement may be methods, standalone helpers, local functions,
            or code written directly inside <LessonInlineCode>train</LessonInlineCode>.
            If they are helpers, inspect the rows with the largest{" "}
            <LessonInlineCode>cumtime</LessonInlineCode> and{" "}
            <LessonInlineCode>ncalls</LessonInlineCode>. If the work is inline,
            it remains inside <LessonInlineCode>train</LessonInlineCode>&apos;s{" "}
            <LessonInlineCode>tottime</LessonInlineCode>.
          </LessonNote>

          <p className={bodyClassName}>
            Save the benchmark somewhere, copy it or take a screenshot.
            We&apos;ll need it later to compare with future benchmarks when we
            optimize our algorithm.
          </p>

        </div>
      </div>
    </article>
  );
}
