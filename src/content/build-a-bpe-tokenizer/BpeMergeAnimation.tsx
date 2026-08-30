import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

type Token = {
  id: string;
  symbol: string;
  expansion?: string;
};

type Round = {
  before: Token[];
  after: Token[];
  replacement: string;
  replacementStarts: number[];
};

type Phase = "count" | "max" | "replace";

const token = (symbol: string, id: string, expansion?: string): Token => ({
  id,
  symbol,
  expansion,
});

const rounds: Round[] = [
  {
    before: [
      token("a", "a-1"),
      token("a", "a-2"),
      token("a", "a-3"),
      token("b", "b-1"),
      token("d", "d-1"),
      token("a", "a-4"),
      token("a", "a-5"),
      token("a", "a-6"),
      token("b", "b-2"),
      token("a", "a-7"),
      token("c", "c-1"),
    ],
    after: [
      token("Z", "z-1", "aa"),
      token("a", "a-3"),
      token("b", "b-1"),
      token("d", "d-1"),
      token("Z", "z-2", "aa"),
      token("a", "a-6"),
      token("b", "b-2"),
      token("a", "a-7"),
      token("c", "c-1"),
    ],
    replacement: "Z",
    replacementStarts: [0, 5],
  },
  {
    before: [
      token("Z", "z-1", "aa"),
      token("a", "a-3"),
      token("b", "b-1"),
      token("d", "d-1"),
      token("Z", "z-2", "aa"),
      token("a", "a-6"),
      token("b", "b-2"),
      token("a", "a-7"),
      token("c", "c-1"),
    ],
    after: [
      token("Z", "z-1", "aa"),
      token("Y", "y-1", "ab"),
      token("d", "d-1"),
      token("Z", "z-2", "aa"),
      token("Y", "y-2", "ab"),
      token("a", "a-7"),
      token("c", "c-1"),
    ],
    replacement: "Y",
    replacementStarts: [1, 5],
  },
  {
    before: [
      token("Z", "z-1", "aa"),
      token("Y", "y-1", "ab"),
      token("d", "d-1"),
      token("Z", "z-2", "aa"),
      token("Y", "y-2", "ab"),
      token("a", "a-7"),
      token("c", "c-1"),
    ],
    after: [
      token("X", "x-1", "ZY"),
      token("d", "d-1"),
      token("X", "x-2", "ZY"),
      token("a", "a-7"),
      token("c", "c-1"),
    ],
    replacement: "X",
    replacementStarts: [0, 3],
  },
];

const phaseLabels: { phase: Phase; label: string }[] = [
  { phase: "count", label: "Count pairs" },
  { phase: "max", label: "Find max" },
  { phase: "replace", label: "Replace" },
];

export function BpeMergeAnimation() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("count");
  const [scanIndex, setScanIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const round = rounds[roundIndex];
  const displayedTokens = phase === "replace" ? round.after : round.before;
  const lastPairIndex = round.before.length - 2;

  const pairCounts = useMemo(
    () =>
      countPairs(
        round.before,
        phase === "count" ? scanIndex : lastPairIndex,
      ),
    [lastPairIndex, phase, round.before, scanIndex],
  );
  const maxPair = findMaxPair(pairCounts);
  const maxPairTies = pairCounts.filter(
    (item) => item.count === maxPair.count,
  ).length;
  const currentPair = pairAt(round.before, scanIndex);

  useEffect(() => {
    if (!playing) return;

    let delay = 650;
    if (phase === "count" && scanIndex === lastPairIndex) delay = 1100;
    if (phase === "max") delay = 2500;
    if (phase === "replace") delay = roundIndex === rounds.length - 1 ? 3400 : 2600;

    const timer = window.setTimeout(() => {
      if (phase === "count") {
        if (scanIndex < lastPairIndex) {
          setScanIndex((current) => current + 1);
        } else {
          setPhase("max");
        }
        return;
      }

      if (phase === "max") {
        setPhase("replace");
        return;
      }

      setRoundIndex((current) => (current + 1) % rounds.length);
      setPhase("count");
      setScanIndex(0);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [lastPairIndex, phase, playing, roundIndex, scanIndex]);

  const title =
    phase === "count"
      ? `Count ${currentPair} · pair ${scanIndex + 1} of ${round.before.length - 1}`
      : phase === "max"
        ? `max_pair = ${maxPair.pair} · count ${maxPair.count}`
        : `Replace ${round.replacementStarts.length} nonoverlapping ${maxPair.pair} pairs with ${round.replacement}`;

  return (
    <section
      data-testid="bpe-merge-animation"
      className="my-9 overflow-hidden border-2 border-cr-brand bg-cr-card shadow-[4px_4px_0px_0px_#FFC107]"
      aria-label="Animated Byte Pair Encoding example"
    >
      <header className="px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5">
              <p
                className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-cr-text-3"
                style={monoStyle}
              >
                BPE training loop
              </p>
              <span className="h-3 w-px bg-cr-border" />
              <p
                className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-cr-text-3"
                style={monoStyle}
              >
                Merge {roundIndex + 1} of 3
              </p>
            </div>
            <p className="mt-1.5 text-[17px] font-extrabold tracking-[-0.02em] text-cr-text sm:text-[19px]">
              {title}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPlaying((current) => !current)}
            className={
              "inline-flex shrink-0 items-center gap-2 border-2 px-3 py-2 text-[9px] font-extrabold uppercase tracking-[0.09em] transition-colors " +
              (playing
                ? "border-cr-brand bg-cr-brand text-cr-on-brand hover:border-cr-accent"
                : "border-cr-accent bg-cr-accent text-cr-on-accent")
            }
            style={monoStyle}
            aria-label={playing ? "Stop BPE animation" : "Play BPE animation"}
          >
            {playing ? (
              <Pause size={13} strokeWidth={2.6} aria-hidden="true" />
            ) : (
              <Play size={13} strokeWidth={2.6} aria-hidden="true" />
            )}
            {playing ? "Stop" : "Play"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-1.5">
          {phaseLabels.map((item, index) => {
            const activeIndex = phaseLabels.findIndex(
              (candidate) => candidate.phase === phase,
            );
            const active = item.phase === phase;

            return (
              <div key={item.phase}>
                <span
                  className={
                    "block h-1 transition-colors duration-200 " +
                    (index <= activeIndex ? "bg-cr-accent" : "bg-cr-border-light")
                  }
                />
                <span
                  className={
                    "mt-1.5 block text-[7px] font-extrabold uppercase tracking-[0.08em] sm:text-[8px] " +
                    (active ? "text-cr-text" : "text-cr-text-3")
                  }
                  style={monoStyle}
                >
                  {index + 1}. {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </header>

      <div className="border-t-2 border-cr-brand bg-cr-card px-4 py-5 text-cr-text sm:px-6 sm:py-6">
        <div className="mx-auto max-w-[650px]">
          <div className="flex items-center justify-between gap-4">
            <p
              className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-cr-text-3"
              style={monoStyle}
            >
              tokens
            </p>
            <p
              className="text-[9px] font-bold text-cr-text-3"
              style={monoStyle}
            >
              length = {displayedTokens.length}
            </p>
          </div>

          <div className="mt-3 flex min-h-[72px] items-center overflow-x-auto border border-cr-border-light bg-cr-border-faint px-3 py-3 sm:overflow-hidden sm:px-4">
            <span
              className="mr-2 text-[22px] font-medium text-cr-text-3/35"
              style={monoStyle}
            >
              [
            </span>
            <div className="flex min-w-max items-center gap-1 sm:min-w-0 sm:flex-1 sm:justify-center">
              <AnimatePresence initial={false} mode="popLayout">
                {displayedTokens.map((item, index) => {
                  const scanning =
                    phase === "count" &&
                    (index === scanIndex || index === scanIndex + 1);
                  const selected =
                    phase === "max" &&
                    round.replacementStarts.some(
                      (start) => index === start || index === start + 1,
                    );
                  const minted =
                    phase === "replace" && item.symbol === round.replacement;

                  return (
                    <motion.span
                      layout
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.55 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{ opacity: 0, scale: 0.45 }}
                      transition={{
                        opacity: { duration: 0.25 },
                        scale: { duration: 0.32, ease: "easeOut" },
                        layout: {
                          type: "spring",
                          stiffness: 330,
                          damping: 30,
                        },
                      }}
                      className={
                        "flex size-8 shrink-0 flex-col items-center justify-center border font-extrabold sm:size-9 " +
                        (minted
                          ? "border-cr-accent bg-cr-brand text-cr-on-brand shadow-[0_0_0_2px_#FFC107]"
                          : selected
                            ? "border-cr-accent bg-cr-accent-bg text-cr-text"
                            : scanning
                              ? "border-cr-brand bg-cr-brand/5 text-cr-text"
                            : item.expansion
                              ? "border-cr-brand bg-cr-brand text-cr-on-brand"
                              : "border-cr-border bg-cr-card text-cr-text")
                      }
                      style={monoStyle}
                    >
                      <span className="text-[14px] leading-none">
                        {item.symbol}
                      </span>
                      {item.expansion && (
                        <span
                          className={
                            "mt-0.5 text-[6px] font-bold leading-none " +
                            (minted ? "text-white/55" : "text-white/45")
                          }
                        >
                          {item.expansion}
                        </span>
                      )}
                    </motion.span>
                  );
                })}
              </AnimatePresence>
            </div>
            <span
              className="ml-2 text-[22px] font-medium text-cr-text-3/35"
              style={monoStyle}
            >
              ]
            </span>
          </div>

          <div className="mt-5 border-t border-cr-border-light pt-4">
            <div className="grid gap-3 sm:grid-cols-[92px_minmax(0,1fr)] sm:items-start">
              <p
                className="pt-1 text-[8px] font-extrabold uppercase tracking-[0.1em] text-cr-text-3"
                style={monoStyle}
              >
                pair_counts
              </p>
              <div className="flex min-h-8 flex-wrap gap-1.5">
                <AnimatePresence initial={false}>
                  {pairCounts.map((item) => (
                    <motion.span
                      layout
                      key={item.pair}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={
                        "inline-flex items-center gap-1.5 border px-2 py-1 text-[9px] font-bold " +
                        (phase === "count" && item.pair === currentPair
                          ? "border-cr-brand bg-cr-brand/5 text-cr-text"
                          : "border-cr-border-light bg-cr-card text-cr-text-2")
                      }
                      style={monoStyle}
                    >
                      <span>{item.pair}</span>
                      <span className="text-cr-text-3">:</span>
                      <motion.span
                        key={`${item.pair}-${item.count}`}
                        initial={{ scale: 1.35, color: "#FFC107" }}
                        animate={{ scale: 1, color: "#10162F" }}
                        transition={{ duration: 0.25 }}
                      >
                        {item.count}
                      </motion.span>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-3 grid gap-3 border-t border-cr-border-light pt-3 sm:grid-cols-[92px_minmax(0,1fr)] sm:items-center">
              <p
                className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-cr-text-3"
                style={monoStyle}
              >
                max_pair
              </p>
              <div className="flex min-h-8 items-center gap-3">
                <p
                  className={
                    "text-[12px] font-extrabold " +
                    (phase === "count" ? "text-cr-text-3/35" : "text-cr-text")
                  }
                  style={monoStyle}
                >
                  {phase === "count"
                    ? "—"
                    : `(${maxPair.pair})  count = ${maxPair.count}`}
                </p>
                {phase === "replace" && (
                  <motion.p
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-l border-cr-border-light pl-3 text-[10px] font-bold text-cr-text-2"
                    style={monoStyle}
                  >
                    new_token ={" "}
                    <span className="text-cr-text">
                      {round.replacement} = {maxPair.pair}
                    </span>
                    <span className="ml-3 text-cr-text-3">
                      replacements = {round.replacementStarts.length}
                    </span>
                  </motion.p>
                )}
                {phase === "max" && maxPairTies > 1 && (
                  <motion.p
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-l border-cr-border-light pl-3 text-[9px] font-bold text-cr-text-3"
                    style={monoStyle}
                  >
                    tie resolved by a fixed order
                  </motion.p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function pairAt(tokens: Token[], index: number) {
  return `${tokens[index]?.symbol ?? ""}${tokens[index + 1]?.symbol ?? ""}`;
}

function countPairs(tokens: Token[], lastIndex: number) {
  const counts = new Map<string, number>();

  for (let index = 0; index <= lastIndex; index += 1) {
    const pair = pairAt(tokens, index);
    counts.set(pair, (counts.get(pair) ?? 0) + 1);
  }

  return Array.from(counts, ([pair, count]) => ({ pair, count }));
}

function findMaxPair(counts: { pair: string; count: number }[]) {
  return counts.reduce(
    (winner, item) => (item.count >= winner.count ? item : winner),
    { pair: "", count: 0 },
  );
}
