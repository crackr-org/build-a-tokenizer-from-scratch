const monoStyle = { fontFamily: "'JetBrains Mono', monospace" };

const chart = {
  width: 720,
  height: 330,
  left: 64,
  right: 660,
  top: 30,
  bottom: 248,
};

// Counted from the trained BPETokenizer on growing Tiny Shakespeare prefixes.
const measuredPrefixes = [
  { bytes: 0, encodeVisits: 0, decodeVisits: 0 },
  { bytes: 131072, encodeVisits: 879003, decodeVisits: 185122 },
  { bytes: 262144, encodeVisits: 1773999, decodeVisits: 369463 },
  { bytes: 393216, encodeVisits: 2676640, decodeVisits: 554233 },
  { bytes: 524288, encodeVisits: 3531177, decodeVisits: 739505 },
  { bytes: 655360, encodeVisits: 4393997, decodeVisits: 924369 },
  { bytes: 786432, encodeVisits: 5270671, decodeVisits: 1109133 },
  { bytes: 917504, encodeVisits: 6135615, decodeVisits: 1294057 },
  { bytes: 1048576, encodeVisits: 7007108, decodeVisits: 1479590 },
];

const maximumBytes = 1048576;
const maximumVisits = 8000000;
const xTicks = [0, 262144, 524288, 786432, 1048576];
const yTicks = [0, 2000000, 4000000, 6000000, 8000000];

function xPosition(bytes: number) {
  return chart.left + (bytes / maximumBytes) * (chart.right - chart.left);
}

function yPosition(visits: number) {
  return (
    chart.bottom -
    (visits / maximumVisits) * (chart.bottom - chart.top)
  );
}

function pointsFor(metric: "encodeVisits" | "decodeVisits") {
  return measuredPrefixes
    .map((measurement) => {
      return [
        xPosition(measurement.bytes),
        yPosition(measurement[metric]),
      ].join(",");
    })
    .join(" ");
}

const encodePoints = pointsFor("encodeVisits");
const decodePoints = pointsFor("decodeVisits");
const finalMeasurement = measuredPrefixes[measuredPrefixes.length - 1];

export function BpeEncodeDecodeComplexityVisual() {
  return (
    <figure className="my-10 border-y-2 border-cr-border-light py-7 [--chart-axis:#10162f] [--chart-decode:#10162f] [--chart-decode-label:#10162f] [--chart-decode-point:#ffffff] [--chart-encode-label:#10162f] [--chart-encode-point:#10162f] [--chart-grid:#d7dbe4] [--chart-label:#9ba3b3] [--chart-tick:#6f7788] dark:[--chart-axis:#ffffff] dark:[--chart-decode:#afc9fa] dark:[--chart-decode-label:#afc9fa] dark:[--chart-decode-point:#0f1014] dark:[--chart-encode-label:#ffc107] dark:[--chart-encode-point:#0f1014] dark:[--chart-grid:#484b55] dark:[--chart-label:#dfe9ff] dark:[--chart-tick:#afc9fa]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-cr-text-3"
            style={monoStyle}
          >
            Actual run · Tiny Shakespeare · vocab 1,024
          </p>
          <h3 className="mt-2 text-[22px] font-extrabold tracking-[-0.03em] text-cr-text sm:text-[25px]">
            Encoding/Decoding Complexity
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
        aria-labelledby="bpe-encode-decode-title bpe-encode-decode-description"
      >
        <title id="bpe-encode-decode-title">
          Measured work performed by BPE encoding and decoding
        </title>
        <desc id="bpe-encode-decode-description">
          A tokenizer trained with a vocabulary of 1024 processes growing
          prefixes of Tiny Shakespeare. At one megabyte, encoding performs 7
          million counted visits while decoding performs 1.48 million.
        </desc>

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
                {tick === 0 ? "0" : tick / 1000000 + "M"}
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
                {tick === 0 ? "0" : tick / 1024 + "K"}
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

        <polyline
          points={encodePoints}
          fill="none"
          stroke="#ffbf00"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={decodePoints}
          fill="none"
          stroke="var(--chart-decode)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {measuredPrefixes.slice(1).map((measurement) => (
          <g key={measurement.bytes}>
            <circle
              cx={xPosition(measurement.bytes)}
              cy={yPosition(measurement.encodeVisits)}
              r="3"
              fill="var(--chart-encode-point)"
              stroke="#ffbf00"
              strokeWidth="2"
            />
            <circle
              cx={xPosition(measurement.bytes)}
              cy={yPosition(measurement.decodeVisits)}
              r="2.5"
              fill="var(--chart-decode-point)"
              stroke="var(--chart-decode)"
              strokeWidth="2"
            />
          </g>
        ))}

        <text
          x={xPosition(finalMeasurement.bytes) - 10}
          y={yPosition(finalMeasurement.encodeVisits) - 12}
          textAnchor="end"
          fill="var(--chart-encode-label)"
          fontSize="10"
          fontWeight="900"
          style={monoStyle}
        >
          encode · 7.01M
        </text>

        <text
          x={xPosition(finalMeasurement.bytes) - 10}
          y={yPosition(finalMeasurement.decodeVisits) - 10}
          textAnchor="end"
          fill="var(--chart-decode-label)"
          fontSize="10"
          fontWeight="900"
          style={monoStyle}
        >
          decode · 1.48M
        </text>

        <text
          x={(chart.left + chart.right) / 2}
          y={chart.bottom + 49}
          textAnchor="middle"
          fill="var(--chart-label)"
          fontSize="8"
          fontWeight="800"
          letterSpacing="1.2"
          style={monoStyle}
        >
          TINY SHAKESPEARE PREFIX · BYTES
        </text>
        <text
          x="14"
          y={(chart.top + chart.bottom) / 2}
          textAnchor="middle"
          fill="var(--chart-label)"
          fontSize="8"
          fontWeight="800"
          letterSpacing="1.2"
          style={monoStyle}
          transform={
            "rotate(-90 14 " + (chart.top + chart.bottom) / 2 + ")"
          }
        >
          COUNTED VISITS
        </text>
      </svg>

      <figcaption className="mt-2 grid gap-3 border-t border-cr-border pt-4 text-[11px] font-semibold leading-5 text-cr-text-2 sm:grid-cols-2">
        <p>
          Every point comes from the actual tokenizer after training it on Tiny
          Shakespeare with 1,024 vocabulary entries.
        </p>
        <p>
          Encoding counts pair positions, candidate-pair checks, and merge-pass
          positions. Decoding counts token lookups and reconstructed bytes.
        </p>
      </figcaption>
    </figure>
  );
}
