import { useMemo, useState } from "react";
import "./styles/app.css";
import TopBar from "./components/TopBar";
import DotPlot from "./components/DotPlot";
import ResultsTable from "./components/ResultsTable";

// Example books (max 10 total)
const ALL_BOOKS = [
  { id: 3300, title: "Book One" },
  { id: 33310, title: "Book Two" },
  { id: 30107, title: "Book Three" },
  { id: 12001, title: "Book Four" },
  { id: 11029, title: "Book Five" },
  { id: 22314, title: "Book Six" },
  { id: 89811, title: "Book Seven" },
  { id: 9981, title: "Book Eight" },
  { id: 10677, title: "Book Nine" },
  { id: 19077, title: "Book Ten" },
];

export default function App() {
  const [term, setTerm] = useState("market");
  const [selectedBookIds, setSelectedBookIds] = useState([3300, 33310, 30107, 12001, 22314, 9981]);
  const [topN, setTopN] = useState(25);
  const [rankBy, setRankBy] = useState("avg"); // avg | max | min
  const [activeTerm, setActiveTerm] = useState(null);

  const selectedBooks = useMemo(
    () => ALL_BOOKS.filter((b) => selectedBookIds.includes(b.id)),
    [selectedBookIds]
  );

  // TODO: Replace this with your real API call.
  // Expected shape: rows = [{ term, avg, byBook: { [bookId]: { sim, n, conf } } }]
  const rows = useMemo(() => mockResults(term, selectedBooks, topN, rankBy), [term, selectedBooks, topN, rankBy]);

  return (
    <div className="app">
      <TopBar
        term={term}
        onTermChange={setTerm}
        books={ALL_BOOKS}
        selectedBookIds={selectedBookIds}
        onSelectedBookIdsChange={setSelectedBookIds}
      />

      <main className="content">
        <section className="panel">
          <div className="panelHeader">
            <div>
              <h1 className="title">Similar terms across selected books</h1>
              <div className="subtitle">Dot distribution + table (no heatmap)</div>
            </div>

            <div className="controls">
              <label className="control">
                Ranked by
                <select value={rankBy} onChange={(e) => setRankBy(e.target.value)}>
                  <option value="avg">Average similarity</option>
                  <option value="max">Max similarity</option>
                  <option value="min">Min similarity</option>
                </select>
              </label>

              <label className="control">
                Showing top
                <select value={topN} onChange={(e) => setTopN(Number(e.target.value))}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </label>
            </div>
          </div>

          <DotPlot
            rows={rows}
            selectedBooks={selectedBooks}
            activeTerm={activeTerm}
            onActiveTermChange={setActiveTerm}
          />
        </section>

        <section className="panel">
          <ResultsTable
            rows={rows}
            selectedBooks={selectedBooks}
            activeTerm={activeTerm}
            onActiveTermChange={setActiveTerm}
          />
        </section>
      </main>
    </div>
  );
}

// ------------------------
// Mock data (replace w/ API)
// ------------------------
function mockResults(query, books, topN, rankBy) {
  const seedTerms = ["home", "agree", "effectual", "compel", "avoid", "deal", "growth", "clearly", "producer", "aid"];
  const terms = Array.from({ length: topN }, (_, i) => seedTerms[i % seedTerms.length] + (i >= seedTerms.length ? `_${i}` : ""));

  const rows = terms.map((t) => {
    const byBook = {};
    const sims = [];

    for (const b of books) {
      // randomly omit some points to simulate missing values
      if ((hash(`${query}-${t}-${b.id}`) % 7) === 0) continue;

      const sim = clamp01(((hash(`${query}-${t}-${b.id}`) % 1000) / 1000) * 0.55);
      const n = 10 + (hash(`n-${query}-${t}-${b.id}`) % 400);
      const conf = 85 + (hash(`c-${query}-${t}-${b.id}`) % 15);
      byBook[b.id] = { sim, n, conf };
      sims.push(sim);
    }

    const avg = sims.length ? sims.reduce((a, x) => a + x, 0) / sims.length : 0;
    const max = sims.length ? Math.max(...sims) : 0;
    const min = sims.length ? Math.min(...sims) : 0;

    return { term: t, avg, max, min, byBook };
  });

  rows.sort((a, b) => (b[rankBy] ?? 0) - (a[rankBy] ?? 0));
  return rows.slice(0, topN);
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}