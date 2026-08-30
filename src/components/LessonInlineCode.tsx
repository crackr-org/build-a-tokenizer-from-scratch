import type { ReactNode } from "react";

type LessonInlineCodeProps = {
  children: ReactNode;
};

export function LessonInlineCode({ children }: LessonInlineCodeProps) {
  return (
    <code
      className="mx-1 rounded bg-cr-border-faint px-1.5 py-0.5 text-[0.88em] font-bold text-cr-text"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {children}
    </code>
  );
}
