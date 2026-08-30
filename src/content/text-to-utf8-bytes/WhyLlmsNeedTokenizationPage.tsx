import type { ReactNode } from "react";
import { Quote } from "lucide-react";

const bodyClassName =
  "text-[16px] font-medium leading-[1.85] text-cr-text-2 sm:text-[17px]";

export function WhyLlmsNeedTokenizationPage({
  estimatedMinutes,
}: {
  estimatedMinutes: number;
}) {
  return (
    <article className="mx-auto w-full max-w-[920px] pb-20 pt-4 sm:pt-8">
      <header className="mx-auto max-w-[740px] pb-14 sm:pb-16">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <span className="size-2 border border-cr-brand bg-cr-accent" />
            <p
              className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-cr-text-3"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Build a simple tokenizer
            </p>
          </div>
          <p
            className="text-[10px] font-bold text-cr-text-3"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {estimatedMinutes} min
          </p>
        </div>

        <div className="mt-6 h-[2px] bg-cr-border-light">
          <div className="h-[2px] w-16 bg-cr-accent" />
        </div>

        <h1
          className="mt-10 text-[48px] font-extrabold leading-[1.02] tracking-[-0.05em] text-cr-text sm:text-[64px]"
          style={{ textWrap: "balance" }}
        >
          LLMs can’t read
        </h1>

        <p
          className="mt-6 max-w-[640px] text-[19px] font-medium leading-8 tracking-[-0.015em] text-cr-text-2 sm:text-[21px]"
          style={{ textWrap: "balance" }}
        >
          Language models work with numbers. Tokenization is the translation
          layer that translates text into a numerical representation the model
          understands.
        </p>
      </header>

      <div className="mx-auto max-w-[740px] border-t-2 border-cr-border-light pt-10">
        <div className="space-y-5">
          <p className={bodyClassName}>
            Large language models such as ChatGPT are often described as
            systems that take the current sequence of words and predict what
            comes next. That is a useful description, but it begins one step
            too late.
          </p>

          <p className={bodyClassName}>
            An LLM, like any deep neural network, cannot process raw text
            directly. Before it can calculate or predict anything, our language
            must be translated into numbers.
          </p>

          <h2 className="pt-6 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
            LLMs don’t understand text
          </h2>

          <p className={bodyClassName}>
            Text is categorical. A sentence is made of discrete symbols: words,
            word pieces, punctuation marks, and spaces. These symbols have
            identities, but they do not carry useful numerical values.
          </p>

          <p className={bodyClassName}>
            We cannot add words or matrix-multiply punctuation. Those
            operations require of course numbers, and raw text is not compatible
            with the mathematics used to implement and train a neural network.
          </p>

          <blockquote className="my-8 border-l-[3px] border-cr-accent pl-6">
            <p className="max-w-[610px] text-[22px] font-semibold leading-9 tracking-[-0.025em] text-cr-text sm:text-[25px]">
              We need a layer that translates our language into something a
              model can compute with.
            </p>
          </blockquote>

          <p className={`${bodyClassName} font-semibold text-cr-text`}>
            That translation layer is called <Term>tokenization</Term>.
          </p>

          <h2 className="pt-6 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
            A mapping: numbers ↔ pieces of text
          </h2>

          <p className={`${bodyClassName} font-semibold text-cr-text`}>
            At its core, tokenization is a mapping between pieces of text and
            numbers. Text becomes numbers so the model can perform its
            calculations. The numbers it predicts become text again so we can
            read the result.
          </p>

          <div
            className="my-8 overflow-x-auto rounded-xl border-2 border-cr-border bg-cr-card px-5 py-6"
            aria-label="Text is mapped to token IDs, processed by the model, and mapped back to text"
          >
            <div className="mx-auto flex min-w-[560px] max-w-[620px] items-center justify-between">
              <FlowItem label="Text" detail="human input" />
              <FlowArrow />
              <FlowItem label="Token IDs" detail="numbers" accent />
              <FlowArrow />
              <FlowItem label="Model" detail="calculation" />
              <FlowArrow />
              <FlowItem label="Text" detail="human output" />
            </div>
          </div>

          <h2 className="pt-6 text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
            Tokens and vocabulary
          </h2>

          <p className={`${bodyClassName} font-semibold text-cr-text`}>
            We call each unit in this mapping a <Term>token</Term>. For now,
            imagining one word as one token is a useful simplification. Real
            tokenizers are more flexible: a token may be a whole word, part of
            a word, punctuation, or whitespace.
          </p>

          <p className={`${bodyClassName} font-semibold text-cr-text`}>
            A token is the smallest piece of information the model is allowed
            to see at one time. Before the neural network does any math or any
            “thinking”, raw text must become a sequence of tokens.
          </p>

          <p className={`${bodyClassName} font-semibold text-cr-text`}>
            The tokenizer stores this mapping in a <Term>vocabulary</Term>: a
            fixed dictionary that assigns every known token a unique number,
            called a token ID.
          </p>

          <div className="my-8 overflow-hidden rounded-xl border-2 border-cr-brand bg-cr-brand text-cr-on-brand shadow-[3px_3px_0px_0px_var(--cr-shadow)] dark:border-cr-border dark:bg-cr-card dark:text-cr-text">
            <div className="border-b border-current/15 px-6 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cr-on-brand/60 dark:text-cr-accent">
                Example mapping
              </p>
            </div>
            <div
              className="grid gap-3 px-6 py-6 text-[13px] font-medium sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-6 sm:text-[14px]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <code className="overflow-x-auto whitespace-nowrap text-cr-on-brand dark:text-cr-text">
                [&quot;hello&quot;, &quot;,&quot;, &quot; world&quot;,
                &quot;!&quot;]
              </code>
              <span className="hidden text-cr-on-brand dark:text-cr-accent sm:block" aria-hidden="true">
                →
              </span>
              <code className="text-cr-on-brand dark:text-cr-text">[1842, 11, 995, 0]</code>
            </div>
          </div>

          <p className={`${bodyClassName} font-semibold text-cr-text`}>
            The token IDs themselves are arbitrary labels. The number 1842 does
            not mean &ldquo;hello&rdquo; on its own. It only works because the tokenizer
            assigns that ID to &ldquo;hello&rdquo; and the model was trained using the same
            assignment. Those IDs are then used to retrieve the numerical
            representations the model actually processes.
          </p>

          <aside className="relative mt-10 overflow-hidden border-2 border-cr-brand bg-cr-accent px-6 py-6 shadow-[4px_4px_0px_0px_var(--cr-shadow)] dark:border-cr-border dark:bg-cr-card-accent sm:px-7">
            <div className="absolute right-0 top-0 h-3 w-3 border-b-2 border-l-2 border-cr-brand bg-cr-card dark:border-cr-border dark:bg-cr-accent" />
            <p
              className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-cr-brand/60 dark:text-cr-accent"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              The core idea
            </p>
            <div className="mt-3 flex items-start gap-3.5">
              <Quote
                size={25}
                strokeWidth={2.5}
                fill="currentColor"
                className="mt-1 shrink-0 text-cr-brand dark:text-cr-accent"
                aria-hidden="true"
              />
              <p className="max-w-[620px] text-[19px] font-extrabold leading-8 tracking-[-0.02em] text-cr-brand dark:text-cr-text sm:text-[22px]">
                A tokenizer translates between human-readable text and the
                numerical language of a neural network.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}

function Term({ children }: { children: ReactNode }) {
  return (
    <strong className="font-semibold text-cr-text underline decoration-cr-accent decoration-2 underline-offset-4">
      {children}
    </strong>
  );
}

function FlowItem({
  label,
  detail,
  accent = false,
}: {
  label: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className={
          accent
            ? "mx-auto flex h-10 items-center rounded-full bg-cr-accent px-4 text-[12px] font-bold text-cr-on-accent"
            : "mx-auto flex h-10 items-center rounded-full bg-cr-border-faint px-4 text-[12px] font-bold text-cr-text"
        }
      >
        {label}
      </div>
      <p className="mt-2 text-[10px] font-semibold text-cr-text-3">{detail}</p>
    </div>
  );
}

function FlowArrow() {
  return (
    <span className="-mt-5 text-[16px] text-cr-text-3" aria-hidden="true">
      →
    </span>
  );
}
