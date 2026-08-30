import type { ReactNode } from "react";

const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

type LessonQuoteProps = {
  children: ReactNode;
  label?: string;
  attribution?: string;
  href?: string;
};

export function LessonQuote({
  children,
  label,
  attribution,
  href,
}: LessonQuoteProps) {
  return (
    <figure className="my-9 border-y-2 border-cr-brand py-6 sm:py-7">
      <div className="grid grid-cols-[36px_1fr] gap-3 sm:grid-cols-[44px_1fr] sm:gap-4">
        <span
          aria-hidden="true"
          className="text-[48px] font-black leading-[0.8] text-cr-accent sm:text-[58px]"
        >
          “
        </span>

        <div>
          {label && (
            <p
              className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-cr-text-3"
              style={monoStyle}
            >
              {label}
            </p>
          )}

          <blockquote cite={href} className={label ? "mt-3" : undefined}>
            <p className="max-w-[620px] text-[20px] font-semibold leading-[1.5] tracking-[-0.025em] text-cr-text sm:text-[23px]">
              <span className="sr-only">“</span>
              {children}
              <span className="sr-only">”</span>
            </p>
          </blockquote>

          {attribution && (
            <figcaption className="mt-4 flex items-center gap-2.5">
              <span
                className="h-[2px] w-5 shrink-0 bg-cr-accent"
                aria-hidden="true"
              />
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold uppercase tracking-[0.1em] text-cr-text-3 underline decoration-cr-accent decoration-2 underline-offset-4 transition-colors hover:text-cr-text"
                  style={monoStyle}
                >
                  {attribution}
                </a>
              ) : (
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.1em] text-cr-text-3"
                  style={monoStyle}
                >
                  {attribution}
                </span>
              )}
            </figcaption>
          )}
        </div>
      </div>
    </figure>
  );
}
