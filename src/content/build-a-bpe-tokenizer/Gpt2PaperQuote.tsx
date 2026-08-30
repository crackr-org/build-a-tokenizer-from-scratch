const paperUrl =
  "https://cdn.openai.com/better-language-models/language-models.pdf";

export function Gpt2PaperQuote() {
  return (
    <figure className="relative my-8 max-w-[760px] py-2">
      <blockquote cite={paperUrl} className="relative pl-11 sm:pl-14">
        <span
          aria-hidden="true"
          className="absolute -top-1 left-0 text-[56px] font-black leading-none text-cr-accent"
        >
          “
        </span>

        <p className="text-[17px] font-medium italic leading-[1.7] tracking-[-0.01em] text-cr-text sm:text-[18px]">
          <span className="sr-only">“</span>
          We observed BPE includes many versions of common words like ‘dog’
          since they occur in many contexts (e.g., ‘dog.’, ‘dog!’, ‘dog?’,
          etc.). This results in a sub-optimal allocation of limited vocabulary
          slots and model capacity. To avoid this, we prevent BPE from merging
          across character categories for any byte sequence.
          <span className="ml-0.5 font-bold not-italic text-cr-accent" aria-hidden="true">
            ”
          </span>
          <span className="sr-only">”</span>
        </p>
      </blockquote>

      <figcaption className="mt-4 flex items-start gap-2.5 pl-11 sm:pl-14">
        <span className="mt-2 h-[2px] w-6 shrink-0 bg-cr-accent" aria-hidden="true" />
        <div>
          <a
            href={paperUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[13px] font-semibold text-cr-text-2 underline decoration-cr-accent decoration-2 underline-offset-4 transition-colors hover:text-cr-text"
          >
            Language Models are Unsupervised Multitask Learners
          </a>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-cr-text-3">
            OpenAI, 2019
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
