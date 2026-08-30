import type { ReactNode } from "react";

type LessonReferenceLinkProps = {
  href: string;
  children: ReactNode;
};

export function LessonReferenceLink({
  href,
  children,
}: LessonReferenceLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-cr-text underline decoration-cr-accent decoration-2 underline-offset-4 transition-colors hover:text-cr-text-2"
    >
      {children}
    </a>
  );
}
