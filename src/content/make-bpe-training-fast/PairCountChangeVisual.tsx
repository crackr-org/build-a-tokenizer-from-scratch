const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

function Token({ children, merged = false }: { children: string; merged?: boolean }) {
  return (
    <span
      className={
        "flex h-11 min-w-11 items-center justify-center border px-3 text-[13px] font-extrabold "
        + (merged
          ? "border-cr-brand bg-cr-brand text-cr-on-brand"
          : "border-cr-border bg-cr-card text-cr-text")
      }
      style={monoStyle}
    >
      {children}
    </span>
  );
}

function TokenSequence({ tokens, merged = false }: { tokens: string[]; merged?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="mr-1 text-lg text-cr-text-3">[</span>
      {tokens.map((token, index) => (
        <Token key={`${token}-${index}`} merged={merged}>
          {token}
        </Token>
      ))}
      <span className="ml-1 text-lg text-cr-text-3">]</span>
    </div>
  );
}

export function PairCountChangeVisual() {
  return (
    <figure className="my-8 border-y-2 border-cr-border-light py-7">
      <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
        <div>
          <TokenSequence tokens={["a", "b", "a", "b"]} />
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[12px] font-bold text-cr-text" style={monoStyle}>
            (a, b)
          </span>
          <span className="text-xl font-black text-cr-accent">→</span>
          <span
            className="border border-cr-brand bg-cr-brand px-2.5 py-1.5 text-[12px] font-extrabold text-cr-on-brand"
            style={monoStyle}
          >
            256
          </span>
        </div>

        <div>
          <TokenSequence tokens={["256", "256"]} merged />
        </div>
      </div>
    </figure>
  );
}
