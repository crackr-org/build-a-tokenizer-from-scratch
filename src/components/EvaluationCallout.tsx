import { ArrowUpRight } from "lucide-react";

export function EvaluationCallout() {
  const evaluationUrl = import.meta.env.VITE_EVALUATION_URL as string | undefined;

  return (
    <aside className="mx-auto mb-16 max-w-[920px] border-2 border-cr-border bg-cr-card p-6 shadow-[5px_5px_0_0_var(--cr-shadow)] sm:p-8">
      <p
        className="text-[9px] font-black uppercase tracking-[0.14em] text-cr-text-3"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        Ready to check your implementation?
      </p>
      <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[24px] font-black tracking-[-0.035em] text-cr-text">
            Run the automated evaluation.
          </h2>
          <p className="mt-2 max-w-[620px] text-[14px] font-medium leading-6 text-cr-text-2">
            The hosted evaluator checks the behavior of your repository and
            returns every passing check and failure in one report.
          </p>
        </div>
        {evaluationUrl && (
          <a
            href={evaluationUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 border-2 border-cr-text bg-cr-text px-4 py-3 text-[9px] font-black uppercase tracking-[0.08em] text-cr-page"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Open evaluator <ArrowUpRight size={15} />
          </a>
        )}
      </div>
    </aside>
  );
}
