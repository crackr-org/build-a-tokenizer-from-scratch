import type { ReactNode } from "react";

type LessonNoteProps = {
  children: ReactNode;
  label?: string;
};

export function LessonNote({ children, label = "Note" }: LessonNoteProps) {
  return (
    <aside className="my-5 flex items-start gap-3 rounded-lg border border-cr-border-light bg-cr-border-faint px-4 py-3.5">
      <span className="mt-2 size-2 shrink-0 bg-cr-accent" />
      <div className="min-w-0">
        <p
          className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-cr-text-3"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {label}
        </p>
        <div className="mt-1 text-[13px] font-semibold leading-6 text-cr-text-2 sm:text-[14px]">
          {children}
        </div>
      </div>
    </aside>
  );
}
