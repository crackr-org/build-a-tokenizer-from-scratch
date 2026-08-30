import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

type DemoToken = {
  id: number;
  text: string;
  kind: "base" | "merge";
};

type TokenInstance = {
  instanceId: number;
  tokenId: number;
};

type PairStat = {
  left: number;
  right: number;
  count: number;
  order: number;
};

type DemoRule = {
  round: number;
  left: number;
  right: number;
  result: number;
  frequency: number;
  replacements: number;
};

type DemoSession = {
  source: string;
  initialLength: number;
  baseVocabularySize: number;
  tokens: TokenInstance[];
  definitions: Record<number, DemoToken>;
  rules: DemoRule[];
  nextInstanceId: number;
};

type Feedback = {
  kind: "correct" | "wrong";
  message: string;
};

type BpeCompressionPlaygroundProps = {
  defaultSequence?: string;
  defaultMergeLimit?: number;
  maxSequenceLength?: number;
  maxMergeLimit?: number;
};

export function BpeCompressionPlayground({
  defaultSequence = "banana_bandana",
  defaultMergeLimit = 6,
  maxSequenceLength = 36,
  maxMergeLimit = 12,
}: BpeCompressionPlaygroundProps) {
  const [sequenceInput, setSequenceInput] = useState(defaultSequence);
  const [mergeLimitInput, setMergeLimitInput] = useState(defaultMergeLimit);
  const [mergeLimit, setMergeLimit] = useState(defaultMergeLimit);
  const [session, setSession] = useState(() => createSession(defaultSequence));
  const [selectedPairKey, setSelectedPairKey] = useState<string>();
  const [attemptedPairKey, setAttemptedPairKey] = useState<string>();
  const [feedback, setFeedback] = useState<Feedback>();
  const [lastMintedTokenId, setLastMintedTokenId] = useState<number>();
  const [hasStarted, setHasStarted] = useState(false);
  const [editingSetup, setEditingSetup] = useState(true);
  const [runId, setRunId] = useState(0);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const inputLength = Array.from(sequenceInput).length;
  const validInput = inputLength >= 2 && inputLength <= maxSequenceLength;
  const pairStats = useMemo(() => countPairs(session.tokens), [session.tokens]);
  const winner = findWinner(pairStats);
  const reachedMergeLimit = session.rules.length >= mergeLimit;
  const noAdjacentPair = !winner;
  const finished = reachedMergeLimit || noAdjacentPair;
  const selectedPair = pairStats.find(
    (pair) => pairKey(pair) === selectedPairKey,
  );
  const selectedStarts = selectedPair
    ? findReplacementStarts(session.tokens, selectedPair)
    : [];
  const nextTokenId = session.baseVocabularySize + session.rules.length;

  useEffect(() => {
    if (!hasStarted) return;

    workspaceRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [hasStarted, runId]);

  function startTraining(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validInput) return;

    setSession(createSession(sequenceInput));
    setMergeLimit(mergeLimitInput);
    setHasStarted(true);
    setEditingSetup(false);
    setRunId((current) => current + 1);
    clearChoice();
    setLastMintedTokenId(undefined);
  }

  function clearChoice() {
    setSelectedPairKey(undefined);
    setAttemptedPairKey(undefined);
    setFeedback(undefined);
  }

  function choosePair(pair: PairStat) {
    if (!winner || finished) return;

    const key = pairKey(pair);
    setAttemptedPairKey(key);
    setLastMintedTokenId(undefined);

    if (pair.left === winner.left && pair.right === winner.right) {
      setSelectedPairKey(key);
      setFeedback({
        kind: "correct",
        message: `Correct. Token ${nextTokenId} will represent ${pairText(pair, session.definitions)}.`,
      });
      return;
    }

    setSelectedPairKey(undefined);
    const tied = pair.count === winner.count;
    setFeedback({
      kind: "wrong",
      message: tied
        ? `Tied at ${pair.count}. First seen wins: ${pairText(winner, session.definitions)}.`
        : `Count ${pair.count}, not ${winner.count}. Try another pair.`,
    });
  }

  function applyMerge() {
    if (!winner || !selectedPair || finished) return;

    const newToken: DemoToken = {
      id: nextTokenId,
      text:
        session.definitions[selectedPair.left].text +
        session.definitions[selectedPair.right].text,
      kind: "merge",
    };
    const replacementStarts = findReplacementStarts(
      session.tokens,
      selectedPair,
    );
    const replacement = replacePair(
      session.tokens,
      selectedPair,
      newToken.id,
      session.nextInstanceId,
    );

    setSession((current) => ({
      ...current,
      tokens: replacement.tokens,
      definitions: { ...current.definitions, [newToken.id]: newToken },
      rules: [
        ...current.rules,
        {
          round: current.rules.length + 1,
          left: selectedPair.left,
          right: selectedPair.right,
          result: newToken.id,
          frequency: selectedPair.count,
          replacements: replacementStarts.length,
        },
      ],
      nextInstanceId: replacement.nextInstanceId,
    }));
    setLastMintedTokenId(newToken.id);
    clearChoice();
  }

  return (
    <section
      data-testid="bpe-compression-playground"
      className="my-9 overflow-hidden border-2 border-cr-brand bg-cr-card shadow-[5px_5px_0px_0px_var(--cr-shadow)] dark:border-cr-border"
      aria-label="Interactive Byte Pair Encoding playground"
    >
      {hasStarted && !editingSetup ? (
        <div className="flex items-center justify-between gap-4 border-b-2 border-cr-brand px-5 py-4 dark:border-cr-border sm:px-6">
          <div className="min-w-0">
            <p
              className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-cr-text-3"
              style={monoStyle}
            >
              BPE playground
            </p>
            <p
              className="mt-1 truncate text-[13px] font-extrabold text-cr-text"
              style={monoStyle}
            >
              {printable(session.source)} · {mergeLimit} merges
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditingSetup(true)}
            className="shrink-0 border border-cr-border px-3 py-2 text-[8px] font-extrabold uppercase tracking-[0.08em] text-cr-text transition-colors hover:border-cr-brand"
            style={monoStyle}
          >
            New run
          </button>
        </div>
      ) : (
        <form
          onSubmit={startTraining}
          className="border-b-2 border-cr-brand px-5 py-5 dark:border-cr-border sm:px-6"
        >
        <div>
          <p
            className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-cr-text-3"
            style={monoStyle}
          >
            BPE playground
          </p>
          <h3 className="mt-1.5 text-[20px] font-extrabold tracking-[-0.025em] text-cr-text sm:text-[22px]">
            Try the merge loop yourself
          </h3>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_112px_auto] sm:items-end">
          <label className="block">
            <span
              className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-cr-text-3"
              style={monoStyle}
            >
              Training sequence
            </span>
            <input
              data-testid="bpe-sequence-input"
              value={sequenceInput}
              onChange={(event) => setSequenceInput(event.target.value)}
              maxLength={maxSequenceLength}
              spellCheck={false}
              className="mt-2 h-11 w-full border-2 border-cr-border bg-cr-card px-3 text-[14px] font-bold text-cr-text outline-none transition-colors focus:border-cr-brand"
              style={monoStyle}
              aria-invalid={!validInput}
            />
          </label>

          <label className="block">
            <span
              className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-cr-text-3"
              style={monoStyle}
            >
              Merge limit
            </span>
            <input
              type="number"
              min={1}
              max={maxMergeLimit}
              value={mergeLimitInput}
              onChange={(event) =>
                setMergeLimitInput(
                  Math.max(
                    1,
                    Math.min(maxMergeLimit, Number(event.target.value) || 1),
                  ),
                )
              }
              className="mt-2 h-11 w-full border-2 border-cr-border bg-cr-card px-3 text-[14px] font-bold text-cr-text outline-none transition-colors focus:border-cr-brand"
              style={monoStyle}
            />
          </label>

          <button
            data-testid="bpe-start-compression"
            type="submit"
            disabled={!validInput}
            className="inline-flex h-11 items-center justify-center gap-2 bg-cr-accent px-4 text-[10px] font-extrabold uppercase tracking-[0.06em] text-cr-on-accent shadow-[2px_2px_0px_0px_var(--cr-shadow)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
            style={monoStyle}
          >
            Start
            <ArrowRight size={14} strokeWidth={2.6} aria-hidden="true" />
          </button>
        </div>

        {!validInput && (
          <p
            className="mt-2 text-[8px] font-bold text-red-600 dark:text-cr-error"
            style={monoStyle}
          >
            Use between 2 and {maxSequenceLength} characters.
          </p>
        )}
        </form>
      )}

      <AnimatePresence>
        {hasStarted && !editingSetup && (
          <motion.div
            key={runId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="px-5 py-6 sm:px-6"
            ref={workspaceRef}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cr-border-light pb-3">
              <p
                className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-cr-text-3"
                style={monoStyle}
              >
                {finished
                  ? reachedMergeLimit
                    ? "Complete · merge limit reached"
                    : "Complete · no adjacent pair remains"
                  : `Merge ${session.rules.length + 1} of ${mergeLimit}`}
              </p>

              <p
                className="text-[8px] font-bold text-cr-text-3"
                style={monoStyle}
              >
                tokens = {session.tokens.length} · vocab ={" "}
                {session.baseVocabularySize + session.rules.length}
              </p>
            </div>

            <TokenArray
              session={session}
              selectedStarts={selectedStarts}
              lastMintedTokenId={lastMintedTokenId}
            />

            {!finished && winner ? (
              <div className="mt-5">
                <div className="flex items-center gap-2">
                  <span className="size-2 border border-cr-brand bg-cr-accent" />
                  <p className="text-[12px] font-extrabold text-cr-text">
                    {feedback?.kind === "correct"
                      ? "Maximum pair selected"
                      : "Click the pair with the largest count"}
                  </p>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
              {pairStats.map((pair) => {
                const key = pairKey(pair);
                const selected = key === selectedPairKey;
                const wrong = key === attemptedPairKey && feedback?.kind === "wrong";

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => choosePair(pair)}
                    className={
                      "inline-flex cursor-pointer items-center gap-2 border px-3 py-2 transition-colors hover:bg-cr-border-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cr-brand " +
                      (selected
                        ? "border-cr-accent bg-cr-accent-bg dark:border-[#8e7625] dark:bg-[#211d0f]"
                        : wrong
                          ? "border-red-500 bg-red-50 dark:border-[#8f4650] dark:bg-[#25171b] dark:text-[#f1bac0]"
                          : "border-cr-border-light bg-cr-card hover:border-cr-brand")
                    }
                    aria-pressed={selected}
                    aria-label={`Choose pair ${pairText(pair, session.definitions)} with count ${pair.count}`}
                  >
                    <PairTokens pair={pair} definitions={session.definitions} />
                    <span
                      className="border-l border-cr-border-light pl-2 text-[10px] font-extrabold text-cr-text"
                      style={monoStyle}
                    >
                      {pair.count}
                    </span>
                  </button>
                );
              })}
                </div>

                <AnimatePresence mode="wait">
              {feedback && (
                <motion.div
                  key={feedback.message}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22 }}
                  className={
                    "mt-4 flex flex-col gap-3 border-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between " +
                    (feedback.kind === "correct"
                      ? "border-cr-border bg-cr-card-hover"
                      : "border-red-300 bg-red-50 dark:border-[#8f4650] dark:bg-[#25171b]")
                  }
                  aria-live="polite"
                >
                  <div className="flex items-start gap-3">
                    {feedback.kind === "correct" && (
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center bg-cr-accent text-cr-on-accent">
                        <Check size={13} strokeWidth={3} aria-hidden="true" />
                      </span>
                    )}
                    <p
                      className={
                        "text-[12px] font-semibold leading-6 text-cr-text-2 " +
                        (feedback.kind === "wrong" ? "dark:text-[#f1bac0]" : "")
                      }
                    >
                      {feedback.message}
                    </p>
                  </div>

                  {feedback.kind === "correct" && selectedPair && (
                    <button
                      data-testid="bpe-apply-merge"
                      type="button"
                      onClick={applyMerge}
                      className="inline-flex shrink-0 items-center justify-center gap-2 bg-cr-brand px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.05em] text-cr-on-brand shadow-[2px_2px_0px_0px_var(--cr-shadow)] transition-transform hover:-translate-y-0.5"
                      style={monoStyle}
                    >
                      Mint {nextTokenId} and merge
                      <ArrowRight size={14} strokeWidth={2.6} aria-hidden="true" />
                    </button>
                  )}
                </motion.div>
              )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="mt-5 border-2 border-cr-accent bg-cr-accent-bg px-4 py-3 dark:border-cr-border dark:bg-cr-card-hover">
            <p
              className="text-[8px] font-extrabold uppercase tracking-[0.11em] text-cr-text-3"
              style={monoStyle}
            >
              Final sequence
            </p>
            <p className="mt-2 text-[13px] font-extrabold text-cr-text">
              {session.tokens
                .map((item) => printable(session.definitions[item.tokenId].text))
                .join(" · ")}
            </p>
              </div>
            )}

            <RuleLedger session={session} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function TokenArray({
  session,
  selectedStarts,
  lastMintedTokenId,
}: {
  session: DemoSession;
  selectedStarts: number[];
  lastMintedTokenId?: number;
}) {
  const highlightedIndices = new Set(
    selectedStarts.flatMap((start) => [start, start + 1]),
  );

  return (
    <div className="mt-4">
      <div className="flex min-h-[78px] items-center overflow-x-auto border-2 border-cr-border bg-cr-border-faint px-3 py-3 sm:overflow-hidden sm:px-4">
        <span
          className="mr-2 text-[22px] font-medium text-cr-text-3/35"
          style={monoStyle}
        >
          [
        </span>
        <div className="flex min-w-max items-center gap-1 sm:min-w-0 sm:flex-1 sm:justify-center">
          <AnimatePresence initial={false} mode="popLayout">
            {session.tokens.map((instance, index) => {
              const definition = session.definitions[instance.tokenId];
              const selected = highlightedIndices.has(index);
              const minted = instance.tokenId === lastMintedTokenId;

              return (
                <motion.span
                  layout
                  key={instance.instanceId}
                  initial={{ opacity: 0, scale: 0.55 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.42 }}
                  transition={{
                    opacity: { duration: 0.24 },
                    scale: { duration: 0.3, ease: "easeOut" },
                    layout: { type: "spring", stiffness: 330, damping: 30 },
                  }}
                  className={
                    "flex size-9 shrink-0 flex-col items-center justify-center border font-extrabold sm:size-10 " +
                    (minted
                      ? "border-cr-accent bg-cr-brand text-cr-on-brand shadow-[0_0_0_2px_#FFC107] dark:border-[#8e7625] dark:bg-[#2b250e] dark:text-cr-text dark:shadow-[0_0_0_1px_#8e7625]"
                      : selected
                        ? "border-cr-accent bg-cr-accent-bg text-cr-text dark:border-[#8e7625] dark:bg-[#211d0f]"
                        : definition.kind === "merge"
                          ? "border-cr-brand bg-cr-brand text-cr-on-brand dark:border-[#8e7625] dark:bg-[#2b250e] dark:text-cr-text"
                          : "border-cr-border bg-cr-card text-cr-text")
                  }
                  style={monoStyle}
                  title={`${printable(definition.text)} · ID ${definition.id}`}
                >
                  <span className="max-w-8 truncate text-[13px] leading-none">
                    {printable(definition.text)}
                  </span>
                  <span
                    className={
                      "mt-1 text-[6px] font-bold leading-none " +
                      (definition.kind === "merge"
                        ? "text-white/45"
                        : "text-cr-text-3")
                    }
                  >
                    {definition.id}
                  </span>
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
    </div>
  );
}

function PairTokens({
  pair,
  definitions,
}: {
  pair: PairStat;
  definitions: Record<number, DemoToken>;
}) {
  return (
    <span className="inline-flex items-center gap-1.5" style={monoStyle}>
      <span className="text-[10px] font-extrabold text-cr-text">
        {printable(definitions[pair.left].text)}
      </span>
      <span className="text-[9px] text-cr-text-3">+</span>
      <span className="text-[10px] font-extrabold text-cr-text">
        {printable(definitions[pair.right].text)}
      </span>
    </span>
  );
}

function RuleLedger({ session }: { session: DemoSession }) {
  if (session.rules.length === 0) return null;

  return (
    <div className="mt-6 border-t border-cr-border-light pt-5">
      <div className="flex items-center justify-between gap-4">
        <p
          className="text-[9px] font-extrabold uppercase tracking-[0.11em] text-cr-text-3"
          style={monoStyle}
        >
          Learned merge rules
        </p>
        <p className="text-[8px] font-bold text-cr-text-3" style={monoStyle}>
          {session.rules.length} saved
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {session.rules.map((rule) => (
          <motion.div
            layout
            key={rule.round}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 border border-cr-border-light bg-cr-border-faint px-3 py-2"
            style={monoStyle}
          >
            <span className="text-[8px] font-bold text-cr-text-3">
              #{rule.round}
            </span>
            <span className="text-[9px] font-extrabold text-cr-text">
              {printable(session.definitions[rule.left].text)} +{" "}
              {printable(session.definitions[rule.right].text)}
            </span>
            <span className="text-cr-accent">→</span>
            <span className="text-[9px] font-extrabold text-cr-text">
              {printable(session.definitions[rule.result].text)}
            </span>
            <span className="text-[8px] font-bold text-cr-text-3">
              ID {rule.result}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function createSession(source: string): DemoSession {
  const characters = Array.from(source);
  const definitions: Record<number, DemoToken> = {};
  const characterIds = new Map<string, number>();

  const tokens = characters.map((character, instanceId) => {
    let tokenId = characterIds.get(character);

    if (tokenId === undefined) {
      tokenId = characterIds.size;
      characterIds.set(character, tokenId);
      definitions[tokenId] = {
        id: tokenId,
        text: character,
        kind: "base",
      };
    }

    return { instanceId, tokenId };
  });

  return {
    source,
    initialLength: characters.length,
    baseVocabularySize: characterIds.size,
    tokens,
    definitions,
    rules: [],
    nextInstanceId: characters.length,
  };
}

function countPairs(tokens: TokenInstance[]) {
  const pairs = new Map<string, PairStat>();
  let order = 0;

  for (let index = 0; index < tokens.length - 1; index += 1) {
    const left = tokens[index].tokenId;
    const right = tokens[index + 1].tokenId;
    const key = `${left}:${right}`;
    const existing = pairs.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      pairs.set(key, { left, right, count: 1, order });
      order += 1;
    }
  }

  return [...pairs.values()];
}

function findWinner(pairStats: PairStat[]) {
  return pairStats.reduce<PairStat | undefined>(
    (winner, pair) =>
      !winner || pair.count > winner.count ? pair : winner,
    undefined,
  );
}

function findReplacementStarts(tokens: TokenInstance[], pair: PairStat) {
  const starts: number[] = [];

  for (let index = 0; index < tokens.length; ) {
    if (
      tokens[index].tokenId === pair.left &&
      tokens[index + 1]?.tokenId === pair.right
    ) {
      starts.push(index);
      index += 2;
    } else {
      index += 1;
    }
  }

  return starts;
}

function replacePair(
  tokens: TokenInstance[],
  pair: PairStat,
  newTokenId: number,
  firstInstanceId: number,
) {
  const replaced: TokenInstance[] = [];
  let nextInstanceId = firstInstanceId;

  for (let index = 0; index < tokens.length; ) {
    if (
      tokens[index].tokenId === pair.left &&
      tokens[index + 1]?.tokenId === pair.right
    ) {
      replaced.push({ instanceId: nextInstanceId, tokenId: newTokenId });
      nextInstanceId += 1;
      index += 2;
    } else {
      replaced.push(tokens[index]);
      index += 1;
    }
  }

  return { tokens: replaced, nextInstanceId };
}

function pairKey(pair: PairStat) {
  return `${pair.left}:${pair.right}`;
}

function pairText(
  pair: PairStat,
  definitions: Record<number, DemoToken>,
) {
  return `${printable(definitions[pair.left].text)} + ${printable(definitions[pair.right].text)}`;
}

function printable(value: string) {
  if (value === " ") return "␠";
  if (value === "\t") return "⇥";
  return value.replaceAll(" ", "␠").replaceAll("\t", "⇥");
}
