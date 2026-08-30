import type { ReactNode } from "react";

type LessonLeadProps = {
  children: ReactNode;
};

export function LessonLead({ children }: LessonLeadProps) {
  return (
    <div className="flex items-start gap-4 py-0.5">
      <span className="mt-[11px] size-2 shrink-0 border border-cr-brand bg-cr-accent" />
      <p className="text-[16px] font-semibold leading-[1.85] text-cr-text-2 sm:text-[17px]">
        {children}
      </p>
    </div>
  );
}
