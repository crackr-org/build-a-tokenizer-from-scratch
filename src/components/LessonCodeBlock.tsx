import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type LessonCodeBlockProps = {
  code: string;
  output?: string;
  outputTone?: "default" | "error";
  language?: string;
  label?: string;
};

type PseudocodeTokenKind =
  | "comment"
  | "function"
  | "identifier"
  | "keyword"
  | "number"
  | "operator"
  | "plain"
  | "string";

type PseudocodeToken = {
  kind: PseudocodeTokenKind;
  value: string;
};

const pseudocodeKeywords = new Set([
  "and",
  "break",
  "continue",
  "do",
  "else",
  "every",
  "for",
  "from",
  "if",
  "in",
  "not",
  "or",
  "repeat",
  "return",
  "save",
  "then",
  "to",
  "until",
  "while",
]);

const pseudocodeTokenColors: Record<PseudocodeTokenKind, string> = {
  comment: "#6A9955",
  function: "#DCDCAA",
  identifier: "#9CDCFE",
  keyword: "#C586C0",
  number: "#B5CEA8",
  operator: "#D4D4D4",
  plain: "#D4D4D4",
  string: "#CE9178",
};

function tokenizePseudocode(code: string): PseudocodeToken[] {
  const tokens: PseudocodeToken[] = [];
  const matcher =
    /#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|==|!=|<=|>=|->|=>|[=+*/<>-]|[A-Za-z_][A-Za-z0-9_]*|\s+|./g;

  for (const match of code.matchAll(matcher)) {
    const value = match[0];
    let kind: PseudocodeTokenKind = "plain";

    if (value.startsWith("#")) {
      kind = "comment";
    } else if (value.startsWith('"') || value.startsWith("'")) {
      kind = "string";
    } else if (/^\d/.test(value)) {
      kind = "number";
    } else if (/^(?:==|!=|<=|>=|->|=>|[=+*/<>-])$/.test(value)) {
      kind = "operator";
    } else if (/^[A-Za-z_]/.test(value)) {
      const nextCharacter = code.slice((match.index ?? 0) + value.length).match(/^\s*(.)/)?.[1];

      if (pseudocodeKeywords.has(value)) {
        kind = "keyword";
      } else if (nextCharacter === "(") {
        kind = "function";
      } else {
        kind = "identifier";
      }
    }

    tokens.push({ kind, value });
  }

  return tokens;
}

function PseudocodeBlock({ code }: { code: string }) {
  return (
    <pre
      className="m-0 overflow-x-auto bg-[#11131a] p-5 text-[13px] leading-6"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      <code style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {tokenizePseudocode(code).map((token, index) => (
          <span key={`${index}-${token.value}`} style={{ color: pseudocodeTokenColors[token.kind] }}>
            {token.value}
          </span>
        ))}
      </code>
    </pre>
  );
}

export function LessonCodeBlock({
  code,
  output,
  outputTone = "default",
  language = "python",
  label = "Python",
}: LessonCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="my-7 overflow-hidden rounded-lg border-2 border-cr-brand bg-[#11131a] dark:border-cr-border">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-2.5">
        <p
          className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-white/45"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {label}
        </p>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-white/55 transition-colors hover:text-cr-accent"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          aria-label={"Copy " + label + " code"}
        >
          {copied ? (
            <Check size={13} aria-hidden="true" />
          ) : (
            <Copy size={13} aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {language === "pseudocode" ? (
        <PseudocodeBlock code={code} />
      ) : (
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            background: "#11131a",
            padding: "20px",
            fontSize: "13px",
            lineHeight: "24px",
            fontFamily: "'JetBrains Mono', monospace",
          }}
          codeTagProps={{
            style: { fontFamily: "'JetBrains Mono', monospace" },
          }}
        >
          {code}
        </SyntaxHighlighter>
      )}

      {output && (
        <pre
          className={`overflow-x-auto whitespace-pre border-t border-white/10 px-5 py-3 text-[11px] font-bold leading-5 ${
            outputTone === "error" ? "text-[#ffb4ab]" : "text-cr-accent"
          }`}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {output}
        </pre>
      )}
    </div>
  );
}
