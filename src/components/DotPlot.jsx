import { useMemo, useState } from "react";

function colorForIndex(i) {
  // fixed palette for up to 10 books
  const palette = ["#e15759", "#4e79a7", "#59a14f", "#f28e2b", "#edc948", "#b07aa1", "#76b7b2", "#ff9da7", "#9c755f", "#bab0ab"];
  return palette[i % palette.length];
}

export default function DotPlot({ rows, selectedBooks, activeTerm, onActiveTermChange }) {
  const [hover, setHover] = useState(null);

  const width = 980;
  const rowH = 26;
  const topPad = 30;
  const leftPad = 140;
  const rightPad = 18;
  const height = Math.max(220, topPad + rows.length * rowH + 30);

  const xMin = 0;
  const xMax = 0.55; // you can compute from data if you want

  const bookIndex = useMemo(() => new Map(selectedBooks.map((b, i) => [b.id, i])), [selectedBooks]);

  const x = (v) => leftPad + ((v - xMin) / (xMax - xMin)) * (width - leftPad - rightPad);

  return (
    <div className="plotWrap">
      <div className="legendRow">
        {selectedBooks.map((b, i) => (
          <div key={b.id} className="legendItem" title={`${b.id} — ${b.title}`}>
            <span className="swatch" style={{ background: colorForIndex(i) }} />
            <span className="legendText">{b.id}</span>
          </div>
        ))}
      </div>

      <svg className="plot" viewBox={`0 0 ${width} ${height}`} onMouseLeave={() => setHover(null)}>
        {/* grid + axis */}
        {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((tick) => (
          <g key={tick}>
            <line x1={x(tick)} x2={x(tick)} y1={topPad - 10} y2={height - 26} className="gridLine" />
            <text x={x(tick)} y={height - 8} textAnchor="middle" className="axisText">
              {tick.toFixed(1)}
            </text>
          </g>
        ))}
        <text x={(leftPad + width - rightPad) / 2} y={height - 2} textAnchor="middle" className="axisLabel">
          Similarity
        </text>

        {/* rows */}
        {rows.map((r, rowIdx) => {
          const y = topPad + rowIdx * rowH;
          const isActive = activeTerm === r.term;

          return (
            <g key={r.term} onClick={() => onActiveTermChange(r.term)} style={{ cursor: "pointer" }}>
              <text x={leftPad - 10} y={y + 5} textAnchor="end" className={`termLabel ${isActive ? "active" : ""}`}>
                {r.term}
              </text>

              {/* baseline */}
              <line x1={leftPad} x2={width - rightPad} y1={y} y2={y} className="rowLine" />

              {/* dots */}
              {Object.entries(r.byBook).map(([bookIdStr, v]) => {
                const bookId = Number(bookIdStr);
                const bi = bookIndex.get(bookId);
                if (bi === undefined) return null;

                const cx = x(v.sim);
                const cy = y;
                return (
                  <circle
                    key={bookId}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={colorForIndex(bi)}
                    opacity={activeTerm && !isActive ? 0.25 : 1}
                    onMouseMove={() =>
                      setHover({
                        term: r.term,
                        bookId,
                        sim: v.sim,
                        n: v.n,
                        conf: v.conf,
                      })
                    }
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {hover && (
        <div className="tooltip">
          <div className="ttTitle">
            <b>{hover.term}</b>
          </div>
          <div className="ttRow">Book: {hover.bookId}</div>
          <div className="ttRow">Similarity: {hover.sim.toFixed(3)}</div>
          <div className="ttRow">Occurrences: {hover.n}</div>
          <div className="ttRow">Confidence: {hover.conf.toFixed(1)}%</div>
        </div>
      )}
    </div>
  );
}