import type { ReactNode } from "react";
import { LessonCodeBlock } from "../../components/LessonCodeBlock";
import { LessonInlineCode } from "../../components/LessonInlineCode";
import { PairCountChangeVisual } from "./PairCountChangeVisual";

const bodyClassName =
  "text-[16px] font-medium leading-[1.85] text-cr-text-2 sm:text-[17px]";
const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

const benchmarkCommands = [
  "time python bpe_tokenizer.py",
  "python -m cProfile -s cumulative bpe_tokenizer.py",
].join("\n");

const benchmarkComparison = [
  "                         before     after",
  "complete run             16.52s      9.63s",
  "tokens                   459,792    459,792",
  "compression                2.43x      2.43x",
].join("\n");

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="pt-7 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
      {children}
    </h2>
  );
}

export function UpdatePairCountsPage({
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
              Make BPE training fast
            </p>
          </div>
          <p className="text-[10px] font-bold text-cr-text-3" style={monoStyle}>
            {estimatedMinutes} min
          </p>
        </div>

        <div className="mt-6 h-[2px] bg-cr-border-light">
          <div className="h-[2px] w-28 bg-cr-accent" />
        </div>

        <h1
          className="mt-10 max-w-[700px] text-[46px] font-extrabold leading-[1.02] tracking-[-0.05em] text-cr-text sm:text-[62px]"
          style={{ textWrap: "balance" }}
        >
          Update pair counts
        </h1>

        <p
          className="mt-6 max-w-[710px] text-[19px] font-medium leading-8 tracking-[-0.015em] text-cr-text-2 sm:text-[21px]"
          style={{ textWrap: "balance" }}
        >
          Keep one pair-frequency table alive throughout training, and update
          only the counts changed by each merge.
        </p>
      </header>

      <div className="mx-auto max-w-[740px] border-t-2 border-cr-border-light pt-10">
        <div className="space-y-5">
          <aside className="mb-10">
            <div className="flex items-center gap-2.5">
              <span
                className="size-2 border border-cr-brand bg-cr-accent"
                aria-hidden="true"
              />
              <p
                className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-cr-text-3"
                style={monoStyle}
              >
                Before we start
              </p>
            </div>
            <p className="mt-3 max-w-[690px] text-[14px] font-medium leading-7 text-cr-text-2 sm:text-[15px]">
              Performance work is hard to test without forcing everyone into
              the same implementation. This stage therefore has no automated
              evaluation. We&apos;ll explain one optimization at a time, but how
              you structure it is up to you. Add the optimization trick, rerun
              the benchmark, then complete each substage manually.
            </p>
          </aside>

          <p className={bodyClassName}>
            Let&apos;s first identify the problem we&apos;re trying to solve.
            Currently, our algorithm pretokenizes the corpus, counts every
            adjacent pair, and stores those counts in a pair-frequency table.
            That table is what we use to choose the most frequent pair. We
            merge it, then calculate the complete table again before choosing
            the next winner.
          </p>

          <p className={bodyClassName}>
            But since we already calculated the table, why not just keep it and
            use it for every merge round? It is a simple but important question
            we might ask. The reason is that once we apply a merge, that table
            no longer describes the pretokens we have.
          </p>

          <SectionTitle>Why do we count again?</SectionTitle>

          <p className={bodyClassName}>
            Take one tiny pretoken: <LessonInlineCode>[a, b, a, b]</LessonInlineCode>.
            Its pair table says that <LessonInlineCode>(a, b)</LessonInlineCode>{" "}
            appears twice and <LessonInlineCode>(b, a)</LessonInlineCode>{" "}
            appears once. So <LessonInlineCode>(a, b)</LessonInlineCode> wins.
            We mint token <LessonInlineCode>256</LessonInlineCode> for it and
            replace both nonoverlapping occurrences. The pretoken becomes{" "}
            <LessonInlineCode>[256, 256]</LessonInlineCode>.
          </p>

          <PairCountChangeVisual />

          <p className={bodyClassName}>
            The old table would still say that{" "}
            <LessonInlineCode>(a, b)</LessonInlineCode> and{" "}
            <LessonInlineCode>(b, a)</LessonInlineCode> exist, but after the
            merge neither exists anymore. It also knows nothing about the new
            pair <LessonInlineCode>(256, 256)</LessonInlineCode>. It is an old
            snapshot of the trainer&apos;s state, per se. That is why we need to
            calculate the table again after every merge in our implementation.
            It is correct, but rather wasteful.
          </p>

          <SectionTitle>Reuse what we counted</SectionTitle>

          <p className={bodyClassName}>
            Now our optimization is pretty simple. We keep the same table. When
            a pretoken is modified, we subtract the pairs contributed by its old
            form, apply the merge, then add the pairs contributed by its new
            form. So we{" "}
            <strong className="font-semibold text-cr-text">
              only repair the counts contributed by pretokens that actually
              changed
            </strong>
            . Pretokens that did not change do not need to be counted again
            because their existing counts are still correct.
          </p>

          <p className={bodyClassName}>
            Update <LessonInlineCode>BPETokenizer.train</LessonInlineCode> to do
            this. How you organize the update is up to you.
          </p>

          <SectionTitle>Run the benchmark again</SectionTitle>

          <p className={bodyClassName}>
            After you implement the optimization, open the benchmark you saved
            in the previous substage and run the same benchmarks against the
            optimized tokenizer. Keep the Tiny Shakespeare corpus, vocabulary
            size of 1,024, and Python environment unchanged. Both versions
            should, of course, produce{" "}
            <LessonInlineCode>459,792</LessonInlineCode> tokens and{" "}
            <LessonInlineCode>2.43x</LessonInlineCode> compression.
          </p>

          <LessonCodeBlock
            code={benchmarkCommands}
            language="bash"
            label="Terminal"
          />

          <p className={bodyClassName}>
            I ran the original version and the optimized version on the same
            machine. Here is the comparison:
          </p>

          <LessonCodeBlock
            code={benchmarkComparison}
            language="text"
            label="Our before and after"
          />

          <p className={bodyClassName}>
            The complete run dropped from{" "}
            <LessonInlineCode>16.52s</LessonInlineCode> to{" "}
            <LessonInlineCode>9.63s</LessonInlineCode>. That is 6.89 seconds
            saved, about 42% less time, or a{" "}
            <strong className="font-semibold text-cr-text">1.71x speedup</strong>.
          </p>

          <p className={bodyClassName}>
            Compare your new result with the baseline you saved rather than
            with ours, of course. We stopped rebuilding the entire pair table,
            but training still scans every stored pretoken to find the few that
            contain the winning pair and can change. That is a separate piece
            of unnecessary work, and we will remove it shortly. First, the next
            substage takes one independent piece of work, the initial
            pretokenization pass, and spreads it across CPU processes.
          </p>
        </div>
      </div>
    </article>
  );
}
