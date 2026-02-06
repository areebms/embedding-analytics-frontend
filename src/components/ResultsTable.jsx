export default function ResultsTable({ rows, selectedBooks, activeTerm, onActiveTermChange }) {
  return (
    <div className="tableWrap">
      <table className="tbl">
        <thead>
          <tr>
            <th style={{ width: 50 }}>#</th>
            <th style={{ width: 220 }}>Term</th>
            <th style={{ width: 140 }}>Avg similarity</th>
            {selectedBooks.map((b) => (
              <th key={b.id} title={`${b.id} — ${b.title}`}>
                <div className="thTop">{b.id}</div>
                <div className="thSub">{b.title}</div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => {
            const isActive = activeTerm === r.term;
            return (
              <tr key={r.term} className={isActive ? "activeRow" : ""} onClick={() => onActiveTermChange(r.term)}>
                <td>{i + 1}</td>
                <td className="termCell">{r.term}</td>
                <td>{r.avg.toFixed(3)}</td>
                {selectedBooks.map((b) => {
                  const cell = r.byBook[b.id];
                  return (
                    <td key={b.id} className="numCell">
                      {cell ? (
                        <>
                          <div className="sim">{cell.sim.toFixed(3)}</div>
                          <div className="meta">
                            {cell.conf.toFixed(1)}% (n={cell.n})
                          </div>
                        </>
                      ) : (
                        <div className="missing">—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}