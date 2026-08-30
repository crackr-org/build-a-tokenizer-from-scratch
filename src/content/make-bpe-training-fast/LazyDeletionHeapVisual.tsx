import { Pause, Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

const slots = {
  root: { x: 360, y: 65 },
  left: { x: 230, y: 175 },
  right: { x: 490, y: 175 },
  leafLeft: { x: 160, y: 285 },
  leafRight: { x: 300, y: 285 },
} as const;

type Slot = keyof typeof slots;
type CandidateId = "th-old" | "he-old" | "new-e" | "he-live" | "er-live";

const candidates: Record<
  CandidateId,
  { pair: string; count: number }
> = {
  "th-old": { pair: "t + h", count: 100 },
  "he-old": { pair: "h + e", count: 95 },
  "new-e": { pair: "256 + e", count: 92 },
  "he-live": { pair: "h + e", count: 80 },
  "er-live": { pair: "e + r", count: 72 },
};

const layouts: Array<Partial<Record<CandidateId, Slot>>> = [
  {
    "th-old": "root",
    "he-old": "left",
    "new-e": "right",
    "he-live": "leafLeft",
    "er-live": "leafRight",
  },
  {
    "he-old": "root",
    "new-e": "left",
    "he-live": "right",
    "er-live": "leafLeft",
  },
  {
    "new-e": "root",
    "he-live": "left",
    "er-live": "right",
  },
];

const steps = [
  {
    layout: 0,
    root: "th-old" as CandidateId,
    status: "check the root",
    truth: "pair table: missing",
    verdict: "stale",
  },
  {
    layout: 0,
    root: "th-old" as CandidateId,
    status: "discard t + h · 100",
    truth: "pair table: missing",
    verdict: "discard",
  },
  {
    layout: 1,
    root: "he-old" as CandidateId,
    status: "check the next root",
    truth: "pair table: h + e · 80",
    verdict: "stale",
  },
  {
    layout: 1,
    root: "he-old" as CandidateId,
    status: "discard h + e · 95",
    truth: "pair table: h + e · 80",
    verdict: "discard",
  },
  {
    layout: 2,
    root: "new-e" as CandidateId,
    status: "check the next root",
    truth: "pair table: 256 + e · 92",
    verdict: "matches",
  },
  {
    layout: 2,
    root: "new-e" as CandidateId,
    status: "accept 256 + e · 92",
    truth: "pair table: 256 + e · 92",
    verdict: "current max",
  },
] as const;

export function LazyDeletionHeapVisual() {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reduceMotion = useReducedMotion();
  const visibleStep = reduceMotion ? steps.length - 1 : stepIndex;
  const step = steps[visibleStep];
  const layout = layouts[step.layout];

  useEffect(() => {
    if (reduceMotion || !playing) return;

    const timer = window.setTimeout(
      () => setStepIndex((current) => (current + 1) % steps.length),
      visibleStep === steps.length - 1 ? 2400 : 1700,
    );

    return () => window.clearTimeout(timer);
  }, [playing, reduceMotion, visibleStep]);

  return (
    <figure className="my-9 bg-cr-card-muted px-4 py-6 sm:px-7 sm:py-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p
            className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-cr-text-3"
            style={monoStyle}
          >
            Lazy deletion
          </p>
          <motion.p
            key={step.status}
            initial={reduceMotion ? false : { opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-[14px] font-bold text-cr-text"
            style={monoStyle}
          >
            {step.status}
          </motion.p>
        </div>

        {!reduceMotion && (
          <button
            type="button"
            onClick={() => setPlaying((current) => !current)}
            aria-label={playing ? "Pause heap animation" : "Play heap animation"}
            className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.12em] text-cr-text-3 transition-colors hover:text-cr-text"
            style={monoStyle}
          >
            {playing ? (
              <Pause size={12} strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <Play size={12} strokeWidth={2.5} aria-hidden="true" />
            )}
            {playing ? "Pause" : "Play"}
          </button>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-y border-cr-border-light py-3">
        <span
          className="text-[9px] font-extrabold uppercase tracking-[0.11em] text-cr-text-3"
          style={monoStyle}
        >
          heap root
        </span>
        <motion.span
          key={`${step.truth}-${step.verdict}`}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-right text-[11px] font-bold text-cr-text"
          style={monoStyle}
        >
          {step.truth} · {step.verdict}
        </motion.span>
      </div>

      <svg
        viewBox="0 0 720 350"
        className="mx-auto block h-auto w-full max-w-[650px]"
        role="img"
        aria-label="A max-heap discarding stale pair-frequency entries until its root agrees with the current pair table"
      >
        <g className="stroke-cr-border" fill="none" strokeWidth="2">
          <line x1="360" y1="65" x2="230" y2="175" />
          <line x1="360" y1="65" x2="490" y2="175" />
          {step.layout < 2 && (
            <>
              <line x1="230" y1="175" x2="160" y2="285" />
              {step.layout === 0 && (
                <line x1="230" y1="175" x2="300" y2="285" />
              )}
            </>
          )}
        </g>

        {(Object.keys(candidates) as CandidateId[]).map((id) => {
          const slotName = layout[id];
          const position = slotName ? slots[slotName] : slots.root;
          const isRoot = id === step.root;
          const isDiscarding = isRoot && step.verdict === "discard";
          const isValid = isRoot && step.verdict === "current max";

          return (
            <motion.g
              key={id}
              initial={false}
              animate={{
                x: position.x,
                y: position.y,
                opacity: slotName ? (isDiscarding ? 0.3 : 1) : 0,
                scale: isDiscarding ? 0.88 : 1,
              }}
              transition={{ type: "spring", stiffness: 170, damping: 23 }}
            >
              <motion.circle
                r="39"
                className={
                  isValid
                    ? "fill-cr-brand stroke-cr-brand"
                    : isRoot
                      ? "fill-cr-accent-bg stroke-cr-accent"
                      : "fill-cr-card stroke-cr-border"
                }
                strokeWidth="2.5"
              />
              <text
                y="-4"
                textAnchor="middle"
                className={isValid ? "fill-white" : "fill-cr-text"}
                style={{ ...monoStyle, fontSize: 13, fontWeight: 800 }}
              >
                {candidates[id].pair}
              </text>
              <text
                y="17"
                textAnchor="middle"
                className={isValid ? "fill-white/70" : "fill-cr-text-3"}
                style={{ ...monoStyle, fontSize: 11, fontWeight: 800 }}
              >
                {candidates[id].count}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </figure>
  );
}
