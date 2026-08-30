import { useState } from "react";
import { Check, Copy } from "lucide-react";

type LessonCorpusUrlProps = {
  url: string;
};

export function LessonCorpusUrl({ url }: LessonCorpusUrlProps) {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="my-6 overflow-hidden rounded-xl border-2 border-cr-border bg-cr-card">
      <div className="flex items-center justify-between border-b-2 border-cr-border-light px-5 py-3">
        <p
          className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-cr-text-3"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Corpus URL
        </p>
        <button
          type="button"
          onClick={copyUrl}
          className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-cr-text-3 transition-colors hover:text-cr-text"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          aria-label="Copy corpus URL"
        >
          {copied ? (
            <Check size={13} aria-hidden="true" />
          ) : (
            <Copy size={13} aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy URL"}
        </button>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="block overflow-x-auto whitespace-nowrap px-5 py-4 text-[12px] font-semibold text-cr-text underline decoration-cr-accent decoration-2 underline-offset-4 hover:text-cr-text-2 sm:text-[13px]"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {url}
      </a>
    </div>
  );
}
