import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Menu, Moon, Sun, X } from "lucide-react";
import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { EvaluationCallout } from "./components/EvaluationCallout";
import { GUIDE_LESSONS, GUIDE_STAGES, findLesson } from "./guide";

export function App() {
  return (
    <Routes>
      <Route element={<GuideLayout />}>
        <Route index element={<GuideHomePage />} />
        <Route path="guide/:lessonSlug" element={<LessonRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function GuideLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false,
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-cr-page text-cr-text">
      <header className="sticky top-0 z-40 border-b border-cr-border bg-cr-page/95 backdrop-blur md:pl-[310px]">
        <div className="mx-auto flex h-14 max-w-[1160px] items-center justify-between px-4 sm:px-7">
          <button
            type="button"
            className="flex size-9 items-center justify-center border border-cr-border bg-cr-card md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle guide navigation"
          >
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>

          <Link
            to="/"
            className="text-[11px] font-black uppercase tracking-[0.1em] text-cr-text"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Build a tokenizer from scratch
          </Link>

          <button
            type="button"
            className="flex size-9 items-center justify-center border border-cr-border bg-cr-card text-cr-text-2 transition-colors hover:border-cr-text hover:text-cr-text"
            onClick={() => setDark((current) => !current)}
            aria-label={dark ? "Use light theme" : "Use dark theme"}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <GuideSidebar open={menuOpen} />

      <main className="md:pl-[310px]">
        <div className="mx-auto max-w-[1160px] px-4 sm:px-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function GuideSidebar({ open }: { open: boolean }) {
  const location = useLocation();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-[310px] overflow-y-auto border-r border-cr-border bg-cr-card px-5 pb-8 pt-20 transition-transform md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <Link to="/" className="block border-b-2 border-cr-text pb-5">
        <p
          className="text-[9px] font-black uppercase tracking-[0.15em] text-cr-text-3"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Open guide
        </p>
        <p className="mt-2 text-[19px] font-black leading-tight tracking-[-0.03em]">
          From text to a trained tokenizer
        </p>
      </Link>

      <nav className="mt-6 space-y-7" aria-label="Guide chapters">
        {GUIDE_STAGES.map((stage, stageIndex) => (
          <section key={stage.title}>
            <p
              className="mb-2 text-[9px] font-black uppercase tracking-[0.13em] text-cr-text-3"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {String(stageIndex + 1).padStart(2, "0")} · {stage.title}
            </p>
            <ol className="space-y-1">
              {stage.lessons.map((lesson) => {
                const active = location.pathname === `/guide/${lesson.slug}`;
                return (
                  <li key={lesson.slug}>
                    <Link
                      to={`/guide/${lesson.slug}`}
                      className={`grid grid-cols-[1fr_auto] items-center gap-3 border-l-2 px-3 py-2 text-[12px] font-semibold leading-5 transition-colors ${
                        active
                          ? "border-cr-accent bg-cr-card-accent text-cr-text"
                          : "border-transparent text-cr-text-2 hover:border-cr-border hover:bg-cr-card-hover hover:text-cr-text"
                      }`}
                    >
                      <span>{lesson.title}</span>
                      <span
                        className="text-[8px] font-bold text-cr-text-3"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {lesson.minutes}m
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </nav>
    </aside>
  );
}

function GuideHomePage() {
  return (
    <article className="mx-auto max-w-[920px] pb-24 pt-14 sm:pt-20">
      <p
        className="text-[10px] font-black uppercase tracking-[0.16em] text-cr-text-3"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        Complete project guide
      </p>
      <h1 className="mt-5 max-w-[820px] text-[clamp(44px,7vw,78px)] font-black leading-[0.98] tracking-[-0.06em] text-cr-text">
        Build a tokenizer from scratch.
      </h1>
      <p className="mt-7 max-w-[720px] text-[19px] font-medium leading-8 text-cr-text-2 sm:text-[21px]">
        Start with a tiny word tokenizer, move down to Unicode and UTF-8 bytes,
        implement byte pair encoding, optimize training, then save and ship the
        encoding you trained.
      </p>

      <div className="mt-12 grid gap-4 border-y-2 border-cr-border py-6 sm:grid-cols-3">
        <GuideStat value="5" label="stages" />
        <GuideStat value="16" label="chapters" />
        <GuideStat value="~9h" label="guided work" />
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {GUIDE_STAGES.map((stage, index) => (
          <Link
            key={stage.title}
            to={`/guide/${stage.lessons[0].slug}`}
            className="group border-2 border-cr-border bg-cr-card p-5 shadow-[4px_4px_0_0_var(--cr-shadow)] transition-transform hover:-translate-y-0.5"
          >
            <p
              className="text-[9px] font-black uppercase tracking-[0.12em] text-cr-text-3"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Stage {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-3 text-[21px] font-black tracking-[-0.03em] text-cr-text">
              {stage.title}
            </h2>
            <p className="mt-2 text-[12px] font-semibold text-cr-text-2">
              {stage.lessons.length} {stage.lessons.length === 1 ? "chapter" : "chapters"}
            </p>
          </Link>
        ))}
      </div>

      <Link
        to="/guide/project-setup"
        className="mt-10 inline-flex items-center gap-3 border-2 border-cr-text bg-cr-text px-5 py-3 text-[10px] font-black uppercase tracking-[0.09em] text-cr-page shadow-[4px_4px_0_0_var(--cr-accent)]"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        Start the guide <ArrowRight size={16} />
      </Link>
    </article>
  );
}

function GuideStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <strong
        className="block text-[27px] font-black text-cr-text"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {value}
      </strong>
      <span
        className="text-[9px] font-black uppercase tracking-[0.12em] text-cr-text-3"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {label}
      </span>
    </div>
  );
}

function LessonRoute() {
  const { lessonSlug } = useParams();
  const lesson = findLesson(lessonSlug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [lessonSlug]);

  if (!lesson) {
    return <Navigate to="/" replace />;
  }

  const lessonIndex = GUIDE_LESSONS.findIndex((item) => item.slug === lesson.slug);
  const previous = GUIDE_LESSONS[lessonIndex - 1];
  const next = GUIDE_LESSONS[lessonIndex + 1];
  const LessonComponent = lesson.component;

  return (
    <>
      <LessonComponent key={lesson.slug} estimatedMinutes={lesson.minutes} />
      {lesson.evaluated && <EvaluationCallout />}
      <nav className="mx-auto mb-24 grid max-w-[920px] gap-3 border-t-2 border-cr-border pt-7 sm:grid-cols-2">
        {previous ? (
          <Link
            to={`/guide/${previous.slug}`}
            className="flex items-center gap-3 border border-cr-border bg-cr-card px-4 py-4 text-[12px] font-bold text-cr-text-2 hover:border-cr-text hover:text-cr-text"
          >
            <ArrowLeft size={16} /> {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            to={`/guide/${next.slug}`}
            className="flex items-center justify-end gap-3 border border-cr-border bg-cr-card px-4 py-4 text-right text-[12px] font-bold text-cr-text-2 hover:border-cr-text hover:text-cr-text"
          >
            {next.title} <ArrowRight size={16} />
          </Link>
        )}
      </nav>
    </>
  );
}
