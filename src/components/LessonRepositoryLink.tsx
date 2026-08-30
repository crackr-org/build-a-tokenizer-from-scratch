import { ArrowUpRight, Github } from "lucide-react";

type LessonRepositoryLinkProps = {
  actionLabel?: string;
  href: string;
  label?: string;
  repository: string;
};

export function LessonRepositoryLink({
  actionLabel = "Open",
  href,
  label = "Repository",
  repository,
}: LessonRepositoryLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group my-7 flex items-center justify-between gap-4 border-y border-cr-border-light py-4 transition-colors hover:border-cr-text-3"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Github
          size={18}
          strokeWidth={1.8}
          className="shrink-0 text-cr-text"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p
            className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-cr-text-3"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {label}
          </p>
          <p
            className="mt-1 truncate text-[12px] font-semibold text-cr-text sm:text-[13px]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {repository}
          </p>
        </div>
      </div>

      <span
        className="flex shrink-0 items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-cr-text-3 transition-colors group-hover:text-cr-text"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {actionLabel}
        <ArrowUpRight size={13} aria-hidden="true" />
      </span>
    </a>
  );
}
