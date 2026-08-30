import type { ReactNode } from "react";
import { LessonInlineCode } from "../../components/LessonInlineCode";
import { LessonReferenceLink } from "../../components/LessonReferenceLink";

const bodyClassName =
  "text-[16px] font-medium leading-[1.85] text-cr-text-2 sm:text-[17px]";
const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

type Paper = {
  author: string;
  href: string;
  title: string;
  year: string;
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="pt-7 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
      {children}
    </h2>
  );
}

function ResearchDirection({
  number,
  title,
  children,
  papers,
}: {
  number: string;
  title: string;
  children: ReactNode;
  papers: Paper[];
}) {
  return (
    <section className="grid gap-5 border-t border-cr-border-light py-8 sm:grid-cols-[46px_1fr] sm:gap-6">
      <span
        className="text-[10px] font-extrabold tracking-[0.1em] text-cr-accent"
        style={monoStyle}
      >
        {number}
      </span>

      <div>
        <h3 className="text-[21px] font-extrabold tracking-[-0.025em] text-cr-text sm:text-[23px]">
          {title}
        </h3>
        <div className="mt-3 space-y-4 text-[15px] font-medium leading-[1.8] text-cr-text-2 sm:text-[16px]">
          {children}
        </div>

        <div className="mt-5 space-y-2">
          {papers.map((paper) => (
            <div
              key={paper.href}
              className="flex flex-wrap items-baseline gap-x-2 gap-y-1"
            >
              <LessonReferenceLink href={paper.href}>
                {paper.title}
              </LessonReferenceLink>
              <span
                className="text-[9px] font-bold uppercase tracking-[0.1em] text-cr-text-3"
                style={monoStyle}
              >
                {paper.author} · {paper.year}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhereToGoFromHerePage({
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
              Ship your tokenizer
            </p>
          </div>
          <p className="text-[10px] font-bold text-cr-text-3" style={monoStyle}>
            {estimatedMinutes} min
          </p>
        </div>

        <div className="mt-6 h-[2px] bg-cr-border-light">
          <div className="h-[2px] w-64 bg-cr-accent" />
        </div>

        <h1
          className="mt-10 max-w-[700px] text-[46px] font-extrabold leading-[1.02] tracking-[-0.05em] text-cr-text sm:text-[62px]"
          style={{ textWrap: "balance" }}
        >
          Where to go from here
        </h1>

        <p
          className="mt-6 max-w-[710px] text-[19px] font-medium leading-8 tracking-[-0.015em] text-cr-text-2 sm:text-[21px]"
          style={{ textWrap: "balance" }}
        >
          We will stop building here. The tokenizer is trained, saved, and
          online. Now you know enough to see where the field is still
          unfinished.
        </p>
      </header>

      <div className="mx-auto max-w-[740px] border-t-2 border-cr-border-light pt-10">
        <div className="space-y-5">
          <p className={bodyClassName}>
            We started this project with a simple question: how do we turn text
            into numbers a language model can work with? From there, we built a
            word tokenizer, ran into its limits, went down to Unicode and UTF-8
            bytes, understood why feeding those bytes to a Transformer one by
            one is too expensive, and found the middle ground in BPE.
          </p>

          <p className={bodyClassName}>
            Then we trained our tokenizer on Tiny Shakespeare, added
            GPT-2&apos;s pretokenization rules, implemented encoding and
            decoding, measured where the time went, and worked through the
            bottlenecks one by one. We reused the pair counts, parallelized the
            independent work, indexed where each pair appears, and kept the
            next winner in a heap.
          </p>

          <p className={bodyClassName}>
            In the final stage, we left Shakespeare behind. We trained on a
            larger multilingual corpus, preserved the learned ranks in a{" "}
            <LessonInlineCode>.tiktoken</LessonInlineCode> file, loaded them
            through <LessonInlineCode>tiktoken</LessonInlineCode>, and verified
            that both implementations produced the same token IDs. Then we
            wrapped the finished encoding in FastAPI and deployed a playground
            where anyone can inspect its token boundaries, IDs, and raw bytes.
          </p>

          <p className={bodyClassName}>
            Although our trainer is reasonable, it is still small. It does not
            include every feature, safety check, or optimization of a
            production tokenizer training pipeline. But it can learn a working
            encoding, save the state{" "}
            <LessonInlineCode>tiktoken</LessonInlineCode> needs, and hand
            that state to an established runtime.{" "}
            <strong className="font-semibold text-cr-text">
              Things are simply easier to understand once you&apos;ve built
              them yourself, and now BPE is one of those things for you.
            </strong>{" "}
            What used to be a black-box preprocessing step between text and an
            LLM is now machinery you recognize and can explain. The next time
            you prompt ChatGPT or Claude, you will know exactly how that text
            could have been broken into token IDs and then mapped to the vectors
            the model receives. You now have a tokenizer you can tinker with,
            inspect, benchmark, and improve.
          </p>

          <SectionTitle>Research worth exploring</SectionTitle>

          <p className={bodyClassName}>
            We will stop our implementation here, but tokenization research
            certainly does not. The papers below take the ideas we worked with
            in several different directions: alternative ways to segment text,
            better ways to evaluate a tokenizer, multilingual efficiency,
            dynamic compression, and models that try to remove the tokenizer
            altogether. If you want to keep going, these are good places to
            start.
          </p>

          <div className="pt-4">
            <ResearchDirection
              number="01"
              title="Alternative segmentation algorithms"
              papers={[
                {
                  author: "Kudo",
                  title: "Subword Regularization",
                  year: "ACL 2018",
                  href: "https://aclanthology.org/P18-1007/",
                },
                {
                  author: "Provilkov et al.",
                  title: "BPE-Dropout",
                  year: "ACL 2020",
                  href: "https://aclanthology.org/2020.acl-main.170/",
                },
              ]}
            >
              <p>
                BPE commits to one deterministic merge history. The Unigram
                model starts from a large candidate vocabulary and removes
                pieces instead, while subword regularization can deliberately
                expose a model to several valid segmentations of the same text.
                Implementing either one would force us to rethink both training
                and encoding rather than merely optimize the loop we already
                have.
              </p>
            </ResearchDirection>

            <ResearchDirection
              number="02"
              title="Tokenizer evaluation beyond compression"
              papers={[
                {
                  author: "Schmidt et al.",
                  title: "Tokenization Is More Than Compression",
                  year: "EMNLP 2024",
                  href: "https://aclanthology.org/2024.emnlp-main.40/",
                },
                {
                  author: "Altıntaş et al.",
                  title: "TokSuite",
                  year: "2025",
                  href: "https://arxiv.org/abs/2512.20757",
                },
              ]}
            >
              <p>
                We used compression because it is immediate and measurable,
                but fewer tokens do not automatically produce a better language
                model. Recent work isolates tokenizer choices while holding the
                architecture, data, and training budget fixed, then measures
                robustness and downstream behavior instead of stopping at
                tokens per byte.
              </p>
            </ResearchDirection>

            <ResearchDirection
              number="03"
              title="Pretokenization boundaries"
              papers={[
                {
                  author: "Liu et al.",
                  title: "SuperBPE: Space Travel for Language Models",
                  year: "2025",
                  href: "https://arxiv.org/abs/2503.13423",
                },
              ]}
            >
              <p>
                We used GPT-2&apos;s regex to stop merges from crossing character
                categories. SuperBPE deliberately relaxes one of those old
                assumptions: it first learns subwords, then allows later merges
                to cross whitespace and capture recurring multi-word pieces.
                The wall that saved vocabulary slots in one tokenizer may limit
                another.
              </p>
            </ResearchDirection>

            <ResearchDirection
              number="04"
              title="Multilingual efficiency and fairness"
              papers={[
                {
                  author: "Ahia et al.",
                  title: "Do All Languages Cost the Same?",
                  year: "EMNLP 2023",
                  href: "https://aclanthology.org/2023.emnlp-main.614/",
                },
                {
                  author: "Foroutan et al.",
                  title: "Parity-Aware Byte-Pair Encoding",
                  year: "ACL 2026",
                  href: "https://aclanthology.org/2026.acl-long.342/",
                },
              ]}
            >
              <p>
                Our max pair always rewards whatever appears most often in the
                corpus. In multilingual training, dominant languages therefore
                win more vocabulary slots while other languages fracture into
                longer sequences. Parity-aware BPE changes the merge objective
                itself, choosing merges that improve the worst-compressed
                languages instead of chasing only the global maximum.
              </p>
            </ResearchDirection>

            <ResearchDirection
              number="05"
              title="Dynamic, learned compression"
              papers={[
                {
                  author: "Kallini et al.",
                  title: "MrT5: Dynamic Token Merging",
                  year: "ICLR 2025",
                  href: "https://openreview.net/forum?id=VYWBMq1L7H",
                },
                {
                  author: "Pagnoni et al.",
                  title: "Byte Latent Transformer",
                  year: "ACL 2025",
                  href: "https://aclanthology.org/2025.acl-long.453/",
                },
                {
                  author: "Hwang et al.",
                  title: "Dynamic Chunking for End-to-End Hierarchical Sequence Modeling",
                  year: "2025",
                  href: "https://arxiv.org/abs/2507.07955",
                },
              ]}
            >
              <p>
                Our merge rules are learned once and frozen before the language
                model sees any data. Dynamic approaches move compression into
                the model itself: deleting unneeded byte positions, grouping
                bytes into patches based on local difficulty, or learning
                context-dependent boundaries end to end. The representation can
                then change with the text instead of obeying one permanent
                vocabulary.
              </p>
            </ResearchDirection>

            <ResearchDirection
              number="06"
              title="Tokenizer-free language models"
              papers={[
                {
                  author: "Wang et al.",
                  title: "MambaByte",
                  year: "COLM 2024",
                  href: "https://openreview.net/forum?id=X1xNsuKssb",
                },
                {
                  author: "Deng et al.",
                  title: "ByteFlow",
                  year: "ICLR 2026",
                  href: "https://arxiv.org/abs/2603.03583",
                },
                {
                  author: "Kallini et al.",
                  title: "Fast Byte Latent Transformer",
                  year: "2026",
                  href: "https://arxiv.org/abs/2605.08044",
                },
              ]}
            >
              <p>
                This is the direction we pointed toward when the project began:
                feed raw bytes to the model and remove the fixed vocabulary
                entirely. The hard part was never representing the bytes; it was
                processing and generating their much longer sequences
                efficiently. State-space models, hierarchical byte models, and
                newer generation methods are now attacking exactly that cost.
              </p>
            </ResearchDirection>
          </div>

          <p className={bodyClassName}>
            Expand the multilingual corpus and measure which languages still
            pay the most. Change the language distribution and watch where the
            merge budget moves. Swap BPE for Unigram. Let merges cross spaces
            and inspect what the vocabulary spends its new freedom on. Or train
            a tiny byte-level model and measure the sequence-length problem
            directly. Any one of those is a great continuation if you want to
            keep digging into tokenization.
          </p>
        </div>
      </div>
    </article>
  );
}
