import type { ReactNode } from "react";

type LessonTaskSectionProps = {
  number: string;
  title: string;
  children: ReactNode;
};

export function LessonTaskSection({
  number,
  title,
  children,
}: LessonTaskSectionProps) {
  return (
    <section className="pt-7">
      <div className="mb-5 flex items-center gap-3">
        <span
          className="flex size-8 shrink-0 items-center justify-center border-2 border-cr-brand bg-cr-accent text-[10px] font-extrabold text-cr-on-accent"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {number}
        </span>
        <h2 className="text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-cr-text sm:text-[30px]">
          {title}
        </h2>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
