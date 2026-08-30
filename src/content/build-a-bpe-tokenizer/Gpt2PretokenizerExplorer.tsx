import { useState } from "react";

type PretokenRule = {
  fragment: string;
  label: string;
  description: string;
  example: string;
};

const rules: PretokenRule[] = [
  {
    fragment: "'s|'t|'re|'ve|'m|'ll|'d",
    label: "Contractions",
    description:
      "The | symbol means OR. This branch matches one of seven lowercase English contraction endings. Because it comes first, I'll is split into I and 'll before the letters branch can claim the letters.",
    example: "I'll  →  I | 'll",
  },
  {
    fragment: " ?\\p{L}+",
    label: "Letters",
    description:
      "The first literal space is optional because of ?. The \\p{L} property means any Unicode letter, and + means one or more. A word therefore stays together with one leading space when present.",
    example: "·hello  →  ·hello",
  },
  {
    fragment: " ?\\p{N}+",
    label: "Numbers",
    description:
      "This follows the same shape as the letter branch, but \\p{N} means any Unicode number. It groups one or more numbers and may attach one ordinary leading space.",
    example: "·123  →  ·123",
  },
  {
    fragment: " ?[^\\s\\p{L}\\p{N}]+",
    label: "Punctuation and symbols",
    description:
      "Inside [...], the leading ^ means NOT. This branch accepts a run of characters that are not whitespace, Unicode letters, or Unicode numbers. That includes punctuation, emoji, and symbols.",
    example: "!!!  →  !!!",
  },
  {
    fragment: "\\s+(?!\\S)|\\s+",
    label: "Whitespace",
    description:
      "\\s+ means one or more whitespace characters. The negative lookahead (?!\\S) helps leave one space available for the following chunk, while the final |\\s+ catches any whitespace left over.",
    example: "···hello  →  ·· | ·hello",
  },
];

const regexGridColumns =
  "minmax(0, 1.45fr) minmax(0, 0.8fr) minmax(0, 0.8fr) minmax(0, 1.45fr) minmax(0, 1fr)";

const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };
const connectorStarts = [132, 336, 482, 686, 909];
const connectorEnds = [173, 128, 137, 188, 168];

export function Gpt2PretokenizerExplorer() {
  const [selectedRuleIndex, setSelectedRuleIndex] = useState(1);
  const selectedRule = rules[selectedRuleIndex];
  const connectorStart = connectorStarts[selectedRuleIndex];
  const connectorEnd = connectorEnds[selectedRuleIndex];
  const connectorPath = `M ${connectorStart} 0 C ${connectorStart} 34, ${connectorEnd} 22, ${connectorEnd} 70`;

  return (
    <section className="my-9 overflow-hidden border-2 border-cr-brand bg-cr-card shadow-[4px_4px_0px_0px_#FFBE0B] dark:border-cr-border dark:shadow-[4px_4px_0px_0px_var(--cr-shadow)]">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-cr-brand px-5 py-4 dark:border-cr-border sm:px-6">
        <div>
          <p
            className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-cr-text-3"
            style={monoStyle}
          >
            GPT-2 pretokenizer
          </p>
          <h3 className="mt-1.5 text-[20px] font-extrabold tracking-[-0.03em] text-cr-text sm:text-[22px]">
            What each part of the regex does
          </h3>
        </div>
        <p
          className="text-[10px] font-bold uppercase tracking-[0.1em] text-cr-text-3"
          style={monoStyle}
        >
          Select a fragment
        </p>
      </header>

      <div className="px-5 py-5 sm:px-6">
        <p
          className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-cr-text-3"
          style={monoStyle}
        >
          The complete pattern
        </p>

        <div
          className="grid border-2 border-cr-brand bg-cr-brand px-2 text-cr-on-brand dark:border-cr-border dark:bg-[#11131a]"
          style={{ gridTemplateColumns: regexGridColumns }}
          aria-label="The complete GPT-2 pretokenization regex split into five parts"
        >
          {rules.map((rule, index) => (
            <button
              type="button"
              key={rule.label}
              onClick={() => setSelectedRuleIndex(index)}
              aria-pressed={selectedRuleIndex === index}
              className={`relative flex min-w-0 items-center justify-center px-2.5 py-3.5 transition-colors ${
                selectedRuleIndex === index
                  ? "bg-white/[0.07] text-cr-accent"
                  : "text-white hover:bg-white/[0.04] hover:text-cr-accent"
              }`}
            >
              {index > 0 && (
                <span
                  className="absolute left-0 text-[18px] font-bold text-cr-accent"
                  aria-hidden="true"
                >
                  |
                </span>
              )}
              <code
                className="whitespace-nowrap text-[11px] font-bold sm:text-[12px]"
                style={monoStyle}
              >
                {rule.fragment}
              </code>
              <span
                className={`absolute inset-x-3 bottom-0 h-[3px] transition-colors ${
                  selectedRuleIndex === index
                    ? "bg-cr-accent"
                    : "bg-transparent"
                }`}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>

        <svg
          className="block h-[70px] w-full overflow-visible"
          viewBox="0 0 1000 70"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d={connectorPath}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="3 6"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="text-cr-accent"
          />
          <rect
            x={connectorEnd - 5}
            y="65"
            width="10"
            height="10"
            fill="currentColor"
            className="text-cr-accent"
            transform={`rotate(45 ${connectorEnd} 70)`}
          />
        </svg>

        <div className="ml-[6.2%] pb-1 pr-2">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <div className="flex items-center gap-2.5">
              <span
                className="text-[10px] font-extrabold text-cr-accent"
                style={monoStyle}
              >
                0{selectedRuleIndex + 1}
              </span>
              <h4 className="text-[17px] font-extrabold text-cr-text">
                {selectedRule.label}
              </h4>
            </div>
            <code
              className="text-[11px] font-bold text-cr-text-3"
              style={monoStyle}
            >
              {selectedRule.fragment}
            </code>
          </div>

          <p className="mt-2 max-w-[720px] text-[13px] font-medium leading-6 text-cr-text-2">
            {selectedRule.description}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <span
              className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-cr-text-3"
              style={monoStyle}
            >
              Example
            </span>
            <code
              className="border-l-2 border-cr-accent pl-3 text-[10px] font-bold text-cr-text-3"
              style={monoStyle}
            >
              {selectedRule.example}
            </code>
          </div>
        </div>
      </div>
    </section>
  );
}
