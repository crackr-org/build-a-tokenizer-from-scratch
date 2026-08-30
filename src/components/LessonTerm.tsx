import { useId, type ReactNode } from "react";

type LessonTermProps = {
  children: ReactNode;
  definition: ReactNode;
};

export function LessonTerm({ children, definition }: LessonTermProps) {
  const tooltipId = useId();

  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-describedby={tooltipId}
        className="cursor-help font-semibold text-cr-text underline decoration-cr-text-3 decoration-dotted underline-offset-[3px] outline-none transition-colors hover:decoration-cr-accent focus-visible:decoration-cr-accent"
      >
        {children}
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-[calc(100%+9px)] left-1/2 z-50 w-max max-w-[250px] -translate-x-1/2 translate-y-1 rounded-md bg-cr-brand px-3 py-2.5 text-left text-[11px] font-medium leading-[1.55] text-cr-on-brand/85 opacity-0 shadow-[0_10px_30px_rgba(16,22,47,0.18)] transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 sm:text-[11.5px]"
      >
        {definition}
        <span className="absolute left-1/2 top-full size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-cr-brand" />
      </span>
    </span>
  );
}
