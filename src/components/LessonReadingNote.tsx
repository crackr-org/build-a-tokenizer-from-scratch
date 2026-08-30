import type { ReactNode } from "react";
import { LessonReferenceLink } from "./LessonReferenceLink";

const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

export type LessonReading = {
  author: string;
  title: string;
  href: string;
};

export function LessonReadingNote({
  label,
  children,
  readings,
}: {
  label: string;
  children: ReactNode;
  readings: readonly LessonReading[];
}) {
  return (
    <aside className="my-8 border-2 border-cr-border bg-cr-accent-bg px-5 py-5 dark:bg-cr-card sm:px-6 sm:py-6">
      <p
        className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-cr-text-3"
        style={monoStyle}
      >
        {label}
      </p>

      <div className="mt-3 space-y-3 text-[14px] font-semibold leading-6 text-cr-text-2 sm:text-[15px]">
        {children}
      </div>

      <ul className="mt-5 divide-y divide-cr-border-light border-y border-cr-border-light">
        {readings.map((reading) => (
          <li key={reading.href} className="flex items-start gap-3 py-3.5">
            <span
              className="mt-2 size-2 shrink-0 border border-cr-brand bg-cr-accent"
              aria-hidden="true"
            />
            <div>
              <LessonReferenceLink href={reading.href}>
                {reading.title}
              </LessonReferenceLink>
              <p
                className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-cr-text-3"
                style={monoStyle}
              >
                {reading.author}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
