import { useState } from "react";
import { Check, ChevronRight, Copy, FileText } from "lucide-react";

type LessonFilePreviewProps = {
  content: string;
  directory?: string;
  filename: string;
};

export function LessonFilePreview({
  content,
  directory,
  filename,
}: LessonFilePreviewProps) {
  const [copied, setCopied] = useState(false);
  const lines = content.split("\n");

  async function copyFile() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <figure className="my-7 overflow-hidden rounded-lg border border-[#3c3c3c] bg-[#1e1e1e] shadow-[0_14px_36px_rgba(16,22,47,0.14)]">
      <figcaption className="flex h-10 items-stretch justify-between border-b border-[#2b2b2b] bg-[#181818]">
        <div className="flex min-w-0 items-center gap-2 border-t-2 border-t-cr-accent bg-[#1e1e1e] px-4 text-[#cccccc]">
          <FileText
            size={14}
            strokeWidth={2}
            className="shrink-0 text-cr-accent"
            aria-hidden="true"
          />
          <span
            className="truncate text-[11px] font-semibold sm:text-[12px]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {filename}
          </span>
        </div>

        <button
          type="button"
          onClick={copyFile}
          className="inline-flex shrink-0 items-center gap-1.5 px-4 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#858585] transition-colors hover:text-white"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          aria-label={`Copy ${filename}`}
        >
          {copied ? (
            <Check size={13} aria-hidden="true" />
          ) : (
            <Copy size={13} aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy file"}
        </button>
      </figcaption>

      <div
        className="flex h-8 items-center gap-1.5 border-b border-[#2b2b2b] bg-[#1e1e1e] px-4 text-[10px] text-[#858585]"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {directory && (
          <>
            <span>{directory}</span>
            <ChevronRight size={11} aria-hidden="true" />
          </>
        )}
        <FileText size={11} className="text-cr-accent" aria-hidden="true" />
        <span className="text-[#b9b9b9]">{filename}</span>
      </div>

      <div className="overflow-x-auto bg-[#1e1e1e] py-3">
        <ol className="min-w-max">
          {lines.map((line, index) => (
            <li
              key={`${index}-${line}`}
              className={`grid grid-cols-[42px_minmax(0,1fr)] text-[12px] leading-6 sm:text-[13px] ${
                index === 0 ? "bg-[#2a2d2e]" : ""
              }`}
            >
              <span
                className={`select-none pr-3 text-right font-medium tabular-nums ${
                  index === 0 ? "text-[#c6c6c6]" : "text-[#858585]"
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <code
                className="block whitespace-pre pr-6 font-medium text-[#d4d4d4]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {line || " "}
              </code>
            </li>
          ))}
        </ol>
      </div>

      <div
        className="flex h-6 items-center justify-end gap-4 bg-[#007acc] px-3 text-[9px] font-semibold text-white"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        <span>UTF-8</span>
        <span>LF</span>
        <span>Plain Text</span>
      </div>
    </figure>
  );
}
