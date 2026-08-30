import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LessonCodeBlock } from "../../components/LessonCodeBlock";
import { LessonInlineCode } from "../../components/LessonInlineCode";
import { LessonQuote } from "../../components/LessonQuote";
import { LessonReferenceLink } from "../../components/LessonReferenceLink";

const bodyClassName =
  "text-[16px] font-medium leading-[1.85] text-cr-text-2 sm:text-[17px]";
const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

const currentSearch = [
  "for pretoken in all_pretokens:",
  "    if winner not in adjacent_pairs(pretoken):",
  "        continue",
  "",
  "    repair_counts_and_merge(pretoken)",
].join("\n");

const searchSequence =
  "(t, h) → inspect 0 → inspect 1 → inspect 2 → inspect 3";

const indexedMerge = [
  "affected_ids = pair_index[winner]",
  "",
  "for pretoken_id in affected_ids:",
  "    remove the pretoken's old pairs from the counts and index",
  "    apply the winning merge",
  "    add the pretoken's new pairs to the counts and index",
].join("\n");

const benchmarkCommands = [
  "time python bpe_tokenizer.py",
  "python -m cProfile -s cumulative bpe_tokenizer.py",
].join("\n");

const benchmarkComparison = [
  "                         before     pair index",
  "complete run              9.70s          2.71s",
  "tokens                   459,792        459,792",
  "compression                2.43x          2.43x",
].join("\n");

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="pt-7 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
      {children}
    </h2>
  );
}

export function BuildPairIndexPage({
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
          <div className="h-[2px] w-52 bg-cr-accent" />
        </div>

        <h1
          className="mt-10 max-w-[700px] text-[46px] font-extrabold leading-[1.02] tracking-[-0.05em] text-cr-text sm:text-[62px]"
          style={{ textWrap: "balance" }}
        >
          Build a pair index
        </h1>

        <p
          className="mt-6 max-w-[710px] text-[19px] font-medium leading-8 tracking-[-0.015em] text-cr-text-2 sm:text-[21px]"
          style={{ textWrap: "balance" }}
        >
          Stop searching every stored pretoken after each merge and go directly
          to the few that contain the winning pair.
        </p>
      </header>

      <div className="mx-auto max-w-[740px] border-t-2 border-cr-border-light pt-10">
        <div className="space-y-5">
          <p className={bodyClassName}>
            In our simple optimization,{" "}
            <Link
              to="/guide/update-pair-counts"
              className="font-semibold text-cr-text underline decoration-cr-accent decoration-2 underline-offset-4 transition-colors hover:text-cr-text-2"
            >
              &ldquo;Update Pair Counts&rdquo;
            </Link>
            {", "}we stopped throwing away the pair-frequency table after every
            merge. We kept it and repaired only the contributions of pretokens
            that changed. So we stopped doing a lot of repeated counting, and
            that, courtesy of this optimization, dropped our runtime from
            16.52 seconds to 9.63 seconds. We&apos;ll happily take that. But
            still, there is room for improvement, as our trainer is still doing
            a rather expensive search operation.
          </p>

          <p className={bodyClassName}>
            Taking the same example again, say the pair{" "}
            <LessonInlineCode>(t, h)</LessonInlineCode> wins in round{" "}
            <LessonInlineCode>i</LessonInlineCode>. The pair-frequency table
            tells us how many times that pair appears across the corpus, but it
            does not tell us which pretokens contain it. To find them, our
            current trainer still walks every stored pretoken:
          </p>

          <LessonCodeBlock
            code={currentSearch}
            language="pseudocode"
            label="The remaining scan"
          />

          <p className={bodyClassName}>
            Update Pair Counts removed the repeated counting, but it did not
            remove the search. A pretoken that does not contain the winning
            pair no longer has all of its adjacent pairs counted again. But our
            trainer still has to inspect that pretoken to ask whether it
            contains the winner. That is to say, if{" "}
            <strong className="font-semibold text-cr-text">
              we have 15,000 stored pretokens and only 500 contain the winning
              pair, we still perform 15,000 checks just to discover those 500.
            </strong>
          </p>

          <SectionTitle>Build an index</SectionTitle>

          <p className={bodyClassName}>
            There is this famous maxim in CS, grandly known as the{" "}
            <LessonReferenceLink href="https://en.wikipedia.org/wiki/Fundamental_theorem_of_software_engineering">
              &ldquo;Fundamental Theorem of Software Engineering&rdquo;
            </LessonReferenceLink>{" "}
            usually attributed to{" "}
            <LessonReferenceLink href="https://www2.dmst.aueb.gr/dds/pubs/inbook/beautiful_code/html/Spi07g.html">
              David Wheeler
            </LessonReferenceLink>, a maxim that I find amusing at times:
          </p>

          <LessonQuote
            label="The fundamental theorem of software engineering"
            attribution="Attributed to David Wheeler"
            href="https://www2.dmst.aueb.gr/dds/pubs/inbook/beautiful_code/html/Spi07g.html"
          >
            All problems in computer science can be solved by another level of
            indirection.
          </LessonQuote>

          <p className={bodyClassName}>
            It fits our optimization unusually well, so we might as well cash
            it in for some intellectual credibility without sounding
            pretentious.
          </p>

          <p className={bodyClassName}>
            A level of indirection simply means putting something in the middle
            that tells us where to go. One simple way to visualize it, if you
            are not familiar with an index, is to think of the index at the back
            of a book. Instead of searching every page for a word, you look up
            the word in the index, and it gives you the relevant page numbers.
            We&apos;ll do the same thing with our pretokens.
          </p>

          <p className={bodyClassName}>
            Right now, when the pair from our example,{" "}
            <LessonInlineCode>(t, h)</LessonInlineCode>, wins, we search every
            pretoken to find the ones containing it:
          </p>

          <LessonCodeBlock
            code={searchSequence}
            language="text"
            label="Without the index"
          />

          <p className={bodyClassName}>
            Suppose only pretokens <LessonInlineCode>0</LessonInlineCode> and{" "}
            <LessonInlineCode>2</LessonInlineCode> contain the pair. The core
            idea is that we can remember that ahead of time by using another
            dictionary to store these locations:
          </p>

          <p className={bodyClassName}>
            That dictionary is our{" "}
            <strong className="font-semibold text-cr-text">pair index</strong>.
            It sits between the pair and the pretokens containing it, which is
            the extra level of indirection Wheeler&apos;s quote is talking about.
            And so, when <LessonInlineCode>(t, h)</LessonInlineCode> wins, we
            look it up in the index and go directly to pretokens{" "}
            <LessonInlineCode>0</LessonInlineCode> and{" "}
            <LessonInlineCode>2</LessonInlineCode>.
          </p>

          <p className={bodyClassName}>
            The index, of course, should describe the pretokens as they exist
            right now, so it must change with them. When a pair wins, copy its
            affected IDs before modifying the index. For each of those
            pretokens, remove its old pairs from both dictionaries, apply the
            merge, then add its new pairs back:
          </p>

          <LessonCodeBlock
            code={indexedMerge}
            language="pseudocode"
            label="The indexed update"
          />

          <p className={bodyClassName}>
            With the index, finding the affected set should be one dictionary
            lookup. We still have to update the pretokens that actually contain
            the winner, of course.
          </p>

          <p className={bodyClassName}>
            Update <LessonInlineCode>BPETokenizer.train</LessonInlineCode> to
            build and maintain this pair index. Keep the incremental count
            updates from the first substage.
          </p>

          <SectionTitle>Benchmark again!</SectionTitle>

          <p className={bodyClassName}>
            Keep Tiny Shakespeare, the vocabulary size of 1,024, your Python
            environment, and the parallel pretokenization path unchanged. Run
            the same benchmark again and compare it with the result you saved
            from the previous substage:
          </p>

          <LessonCodeBlock
            code={benchmarkCommands}
            language="bash"
            label="Terminal"
          />

          <p className={bodyClassName}>
            I ran the version from the previous substage and the new pair-index
            version on the same machine. Here is the comparison:
          </p>

          <LessonCodeBlock
            code={benchmarkComparison}
            language="text"
            label="My benchmark"
          />

          <p className={bodyClassName}>
            The complete run dropped from{" "}
            <LessonInlineCode>9.70s</LessonInlineCode> to{" "}
            <LessonInlineCode>2.71s</LessonInlineCode>, a{" "}
            <strong className="font-semibold text-cr-text">3.58x speedup</strong>
            .
          </p>

          <p className={bodyClassName}>
            We can now choose the winning pair and go directly to the pretokens
            that contain it. But we still have to decide which pair won. Our
            pair-frequency table is a dictionary from each pair to its current
            count, which it stores unsorted. So at every merge round, we call{" "}
            <LessonInlineCode>max(...)</LessonInlineCode> and linearly walk the
            dictionary again to rediscover the pair with the largest count.
            That repeated search is our last bottleneck.
          </p>
        </div>
      </div>
    </article>
  );
}
