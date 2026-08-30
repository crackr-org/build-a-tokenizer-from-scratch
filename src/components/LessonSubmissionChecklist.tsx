import { Check } from "lucide-react";

type LessonSubmissionChecklistProps = {
  items: string[];
};

export function LessonSubmissionChecklist({
  items,
}: LessonSubmissionChecklistProps) {
  return (
    <ul
      className="my-7 divide-y-2 divide-cr-border-light border-y-2 border-cr-border"
      aria-label="Submission checklist"
    >
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center gap-4 py-4 text-[14px] font-semibold leading-6 text-cr-text-2 sm:text-[15px]"
        >
          <span className="flex size-6 shrink-0 items-center justify-center border-2 border-cr-brand bg-cr-accent text-cr-on-accent shadow-[2px_2px_0px_0px_var(--color-cr-border)]">
            <Check size={13} strokeWidth={3} aria-hidden="true" />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
