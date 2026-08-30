const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

const chart = {
  width: 720,
  height: 330,
  left: 66,
  right: 696,
  top: 34,
  bottom: 254,
};

// Counted from BPETokenizer while training on the full Tiny Shakespeare file.
const measuredTrainingRuns = [
  { vocabulary: 256, visits: 0 },
  { vocabulary: 276, visits: 3.809967 },
  { vocabulary: 320, visits: 10.785659 },
  { vocabulary: 384, visits: 19.711081 },
  { vocabulary: 512, visits: 35.723346 },
  { vocabulary: 768, visits: 64.625766 },
  { vocabulary: 1024, visits: 91.513272 },
];

const yTicks = [0, 25, 50, 75, 100];
const xTicks = [256, 512, 768, 1024];

function xPosition(vocabulary: number) {
  const ratio = (vocabulary - 256) / (1024 - 256);
  return chart.left + ratio * (chart.right - chart.left);
}

function yPosition(visits: number) {
  const ratio = visits / 110;
  return chart.bottom - ratio * (chart.bottom - chart.top);
}

const linePoints = measuredTrainingRuns
  .map(({ vocabulary, visits }) =>
    [xPosition(vocabulary), yPosition(visits)].join(","),
  )
  .join(" ");

const areaPoints = [
  [chart.left, chart.bottom].join(","),
  linePoints,
  [chart.right, chart.bottom].join(","),
].join(" ");

export function BpeTrainingComplexityVisual() {
  const chartCenterY = (chart.top + chart.bottom) / 2;

  return (
    <figure className="my-10 border-y-2 border-cr-border-light py-7 [--chart-axis:#10162f] [--chart-grid:#d7dbe4] [--chart-label:#9ba3b3] [--chart-point:#10162f] [--chart-tick:#6f7788] dark:[--chart-axis:#ffffff] dark:[--chart-grid:#484b55] dark:[--chart-label:#dfe9ff] dark:[--chart-point:#0f1014] dark:[--chart-tick:#afc9fa]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-cr-text-3"
            style={monoStyle}
          >
            Actual run · Tiny Shakespeare
          </p>
          <h3 className="mt-2 text-[22px] font-extrabold tracking-[-0.03em] text-cr-text sm:text-[25px]">
            Training Complexity
          </h3>
        </div>
        <p className="text-[10px] font-black text-cr-text-3" style={monoStyle}>
          counted visits, not seconds
        </p>
      </div>

      <svg
        className="mt-5 block h-auto w-full"
        viewBox={["0", "0", chart.width, chart.height].join(" ")}
        role="img"
        aria-labelledby="bpe-complexity-title bpe-complexity-description"
      >
        <title id="bpe-complexity-title">
          Cumulative work performed by naive BPE training
        </title>
        <desc id="bpe-complexity-description">
          On Tiny Shakespeare, cumulative full-scan work rises from 3.8 million
          visits at vocabulary size 276 to 91.5 million visits at vocabulary
          size 1024.
        </desc>

        <defs>
          <linearGradient id="bpeWorkArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffbf00" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#ffbf00" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y = yPosition(tick);
          return (
            <g key={tick}>
              <line
                x1={chart.left}
                x2={chart.right}
                y1={y}
                y2={y}
                stroke="var(--chart-grid)"
                strokeWidth="1"
              />
              <text
                x={chart.left - 12}
                y={y + 4}
                textAnchor="end"
                fill="var(--chart-tick)"
                fontSize="9"
                fontWeight="700"
                style={monoStyle}
              >
                {tick === 0 ? "0" : tick + "M"}
              </text>
            </g>
          );
        })}

        {xTicks.map((tick) => {
          const x = xPosition(tick);
          return (
            <g key={tick}>
              <line
                x1={x}
                x2={x}
                y1={chart.bottom}
                y2={chart.bottom + 5}
                stroke="var(--chart-axis)"
                strokeWidth="1"
              />
              <text
                x={x}
                y={chart.bottom + 22}
                textAnchor="middle"
                fill="var(--chart-tick)"
                fontSize="9"
                fontWeight="700"
                style={monoStyle}
              >
                {tick}
              </text>
            </g>
          );
        })}

        <line
          x1={chart.left}
          x2={chart.left}
          y1={chart.top}
          y2={chart.bottom}
          stroke="var(--chart-axis)"
          strokeWidth="1.5"
        />
        <line
          x1={chart.left}
          x2={chart.right}
          y1={chart.bottom}
          y2={chart.bottom}
          stroke="var(--chart-axis)"
          strokeWidth="1.5"
        />

        <polygon points={areaPoints} fill="url(#bpeWorkArea)" />
        <polyline
          points={linePoints}
          fill="none"
          stroke="#ffbf00"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {measuredTrainingRuns.slice(1).map(({ vocabulary, visits }) => (
          <circle
            key={vocabulary}
            cx={xPosition(vocabulary)}
            cy={yPosition(visits)}
            r={vocabulary === 1024 ? 5 : 3.5}
            fill="var(--chart-point)"
            stroke="#ffbf00"
            strokeWidth="2"
          />
        ))}

        <line
          x1={xPosition(1024)}
          x2={xPosition(1024) - 72}
          y1={yPosition(91.513272)}
          y2={yPosition(91.513272) - 13}
          stroke="var(--chart-axis)"
          strokeWidth="1"
        />
        <text
          x={xPosition(1024) - 78}
          y={yPosition(91.513272) - 17}
          textAnchor="end"
          fill="var(--chart-axis)"
          fontSize="10"
          fontWeight="800"
          style={monoStyle}
        >
          91.5M visits
        </text>
        <text
          x={xPosition(1024) - 78}
          y={yPosition(91.513272) - 4}
          textAnchor="end"
          fill="var(--chart-label)"
          fontSize="8"
          fontWeight="700"
          style={monoStyle}
        >
          768 merges
        </text>

        <text
          x={(chart.left + chart.right) / 2}
          y={chart.bottom + 48}
          textAnchor="middle"
          fill="var(--chart-label)"
          fontSize="8"
          fontWeight="800"
          letterSpacing="1.2"
          style={monoStyle}
        >
          TARGET VOCABULARY SIZE
        </text>
        <text
          x="14"
          y={chartCenterY}
          textAnchor="middle"
          fill="var(--chart-label)"
          fontSize="8"
          fontWeight="800"
          letterSpacing="1.2"
          style={monoStyle}
          transform={"rotate(-90 14 " + chartCenterY + ")"}
        >
          CUMULATIVE VISITS
        </text>
      </svg>

      <figcaption className="mt-2 grid gap-3 border-t border-cr-border pt-4 text-[11px] font-semibold leading-5 text-cr-text-2 sm:grid-cols-2">
        <p>
          These are not points generated from the complexity formula. At 276
          vocabulary entries, the real 20-merge run performs about{" "}
          <strong className="font-bold text-cr-text">3.8 million</strong> adjacent
          position, token position, and pair-table visits.
        </p>
        <p>
          At 1,024 entries, the real 768-merge run pushes the same corpus past{" "}
          <strong className="font-bold text-cr-text">91 million</strong>. This
          graph counts work, not machine-dependent seconds.
        </p>
      </figcaption>
    </figure>
  );
}
