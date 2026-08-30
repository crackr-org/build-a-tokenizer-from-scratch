type LessonBehaviorExampleProps = {
  input: string;
  output: string;
  inputLabel?: string;
  outputLabel?: string;
};

export function LessonBehaviorExample({
  input,
  output,
  inputLabel = "Input",
  outputLabel = "Expected",
}: LessonBehaviorExampleProps) {
  return (
    <div className="my-7 overflow-hidden rounded-xl border-2 border-cr-border bg-cr-card">
      <ExampleRow label={inputLabel} value={input} />
      <ExampleRow label={outputLabel} value={output} accented />
    </div>
  );
}

function ExampleRow({
  label,
  value,
  accented = false,
}: {
  label: string;
  value: string;
  accented?: boolean;
}) {
  return (
    <div
      className={`grid gap-3 px-5 py-5 sm:grid-cols-[92px_minmax(0,1fr)] sm:items-start sm:px-6 ${
        accented ? "border-t-2 border-cr-border-light bg-cr-border-faint" : ""
      }`}
    >
      <div className="flex items-center gap-2 pt-0.5">
        <span
          className={
            accented
              ? "size-2 shrink-0 border border-cr-brand bg-cr-accent"
              : "size-2 shrink-0 bg-cr-accent"
          }
        />
        <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-cr-text-3">
          {label}
        </p>
      </div>
      <code
        className="block whitespace-pre-wrap break-words text-[12px] font-bold leading-6 text-cr-text sm:text-[13px]"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {value}
      </code>
    </div>
  );
}
