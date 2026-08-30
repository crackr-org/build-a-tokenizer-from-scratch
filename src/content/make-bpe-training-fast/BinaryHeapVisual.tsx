import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

const positions = {
  root: { x: 360, y: 62 },
  left: { x: 220, y: 170 },
  right: { x: 500, y: 170 },
  leaf: { x: 145, y: 278 },
} as const;

const steps = [
  { label: "valid max-heap", active: [] as number[] },
  { label: "insert 12", active: [12] },
  { label: "12 > 4 · compare", active: [12, 4] },
  { label: "swap 12 with 4", active: [12] },
  { label: "12 > 9 · compare", active: [12, 9] },
  { label: "12 becomes the root", active: [12] },
] as const;

type PositionName = keyof typeof positions;

function positionFor(value: number, step: number): PositionName {
  if (value === 7) return "right";
  if (value === 12) {
    if (step <= 2) return "leaf";
    if (step <= 4) return "left";
    return "root";
  }
  if (value === 9) return step === 5 ? "left" : "root";
  return step >= 3 ? "leaf" : "left";
}

export function BinaryHeapVisual() {
  const [stepIndex, setStepIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const visibleStep = reduceMotion ? steps.length - 1 : stepIndex;
  const step = steps[visibleStep];
  const values = visibleStep === 0 ? [9, 4, 7] : [9, 4, 7, 12];

  useEffect(() => {
    if (reduceMotion) return;

    const delay = stepIndex === 0 || stepIndex === steps.length - 1 ? 2200 : 1400;
    const timer = window.setTimeout(
      () => setStepIndex((current) => (current + 1) % steps.length),
      delay,
    );

    return () => window.clearTimeout(timer);
  }, [reduceMotion, stepIndex]);

  const firstPathActive = visibleStep === 2 || visibleStep === 3;
  const secondPathActive = visibleStep === 4 || visibleStep === 5;

  return (
    <figure className="my-8 py-7 sm:py-8">
      <div className="flex items-center justify-between gap-4">
        <p
          className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-cr-text-3"
          style={monoStyle}
        >
          Bubble up
        </p>
        <motion.p
          key={step.label}
          initial={reduceMotion ? false : { opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] font-bold text-cr-text"
          style={monoStyle}
        >
          {step.label}
        </motion.p>
      </div>

      <svg
        viewBox="0 0 720 340"
        className="mx-auto mt-4 block h-auto w-full max-w-[650px]"
        role="img"
        aria-label="Animation of the value 12 bubbling to the root of a max-heap"
      >
        <g className="stroke-cr-border" fill="none" strokeWidth="2">
          <line x1="360" y1="62" x2="220" y2="170" />
          <line x1="360" y1="62" x2="500" y2="170" />
          <motion.line
            x1="220"
            y1="170"
            x2="145"
            y2="278"
            strokeDasharray="5 7"
            initial={false}
            animate={{ opacity: visibleStep === 0 ? 0 : 1 }}
          />
        </g>

        <motion.line
          x1="220"
          y1="170"
          x2="145"
          y2="278"
          className="stroke-cr-accent"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          initial={false}
          animate={{ opacity: firstPathActive ? 1 : 0 }}
        />
        <motion.line
          x1="360"
          y1="62"
          x2="220"
          y2="170"
          className="stroke-cr-accent"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          initial={false}
          animate={{ opacity: secondPathActive ? 1 : 0 }}
        />

        {values.map((value) => {
          const positionName = positionFor(value, visibleStep);
          const position = positions[positionName];
          const active = (step.active as readonly number[]).includes(value);
          const root = positionName === "root";

          return (
            <motion.g
              key={value}
              initial={{ opacity: 0, x: position.x, y: position.y }}
              animate={{ opacity: 1, x: position.x, y: position.y }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
            >
              <motion.circle
                r="32"
                className={
                  active
                    ? "fill-cr-accent-bg stroke-cr-accent"
                    : root
                      ? "fill-cr-brand stroke-cr-brand"
                      : "fill-cr-card stroke-cr-border"
                }
                strokeWidth="3"
                animate={{ scale: active ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                className={root && !active ? "fill-white" : "fill-cr-text"}
                style={{ ...monoStyle, fontSize: 18, fontWeight: 900 }}
              >
                {value}
              </text>
            </motion.g>
          );
        })}
      </svg>

      <div className="mx-auto -mt-1 flex max-w-[560px] items-center justify-between border-t border-cr-border-light pt-4">
        <span
          className="text-[9px] font-bold uppercase tracking-[0.1em] text-cr-text-3"
          style={monoStyle}
        >
          parent ≥ child
        </span>
        <span
          className="text-[9px] font-bold uppercase tracking-[0.1em] text-cr-text-3"
          style={monoStyle}
        >
          root = max
        </span>
      </div>
    </figure>
  );
}
