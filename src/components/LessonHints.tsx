import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export type LessonHint = {
  title: string;
  body: ReactNode;
};

type LessonHintsProps = {
  hints: LessonHint[];
  encouragement?: string;
};

export function LessonHints({
  hints,
  encouragement = "Try to struggle with the problem first. Open these only when you are genuinely stuck.",
}: LessonHintsProps) {
  return (
    <details className="group mt-10">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
        <div>
          <p className="text-[20px] font-extrabold tracking-[-0.025em] text-cr-text">
            Stuck?
          </p>
          <p className="mt-1 text-[12px] font-semibold leading-5 text-cr-text-3 sm:text-[13px]">
            {encouragement}
          </p>
        </div>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border-2 border-cr-border bg-cr-card text-cr-text transition-transform group-open:rotate-180">
          <ChevronDown size={16} strokeWidth={2.5} aria-hidden="true" />
        </span>
      </summary>

      <div className="border-t-2 border-cr-border-light pb-2 pt-1">
        <ul className="divide-y divide-cr-border-light">
          {hints.map((hint, index) => (
            <li key={hint.title} className="grid gap-3 py-5 sm:grid-cols-[36px_1fr]">
              <span
                className="flex size-7 items-center justify-center border border-cr-border bg-cr-border-faint text-[9px] font-extrabold text-cr-text-3"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-[14px] font-extrabold text-cr-text sm:text-[15px]">
                  {hint.title}
                </p>
                <div className="mt-1.5 text-[13px] font-medium leading-6 text-cr-text-2 sm:text-[14px]">
                  {hint.body}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
