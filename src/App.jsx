import { useMemo, useState, useEffect } from "react";
import "./styles/app.css";
import TopBar from "./components/TopBar";
import DotPlot from "./components/DotPlot";
import ResultsTable from "./components/ResultsTable";

export default function App() {
  const [term, setTerm] = useState("market");
  const [selectedBookIds, setSelectedBookIds] = useState([3300, 33310, 30107, 12001, 22314, 9981]);
  const [topN, setTopN] = useState(25);
  const [rankBy, setRankBy] = useState("avg"); // avg | max | min
  const [activeTerm, setActiveTerm] = useState(null);
  const [allBooks, setAllBooks] = useState([]);

  useEffect(() => {
    get_books();
  }, []);

  const get_books = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/books");
      if (!response.ok) throw new Error(`Books fetch failed: ${response.status}`);
      setAllBooks(await response.json());
    } catch (error) {
      console.error(error);
      setAllBooks([]);
    }
  };

  const selectedBooks = useMemo(
    () => allBooks.filter((b) => selectedBookIds.includes(b.id)),
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
        books={allBooks}
        selectedBookIds={selectedBookIds}
        onSelectedBookIdsChange={setSelectedBookIds}
      />

      <main className="content">
        <section className="panel">
          <div className="panelHeader">
            <div>
              <h1 className="title">Similar terms across selected books</h1>
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
