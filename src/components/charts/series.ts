import { seriesColor, QUERY_COLOR } from "./palette";
import { DEFAULT_TERM_RANKING, RANKING_FIELD } from "../../types/api";
import type {
  BookResponse,
  TermRanking,
  SemanticDriftResponse,
} from "../../types/api";
import type {
  DiachronicSeries,
  Series,
  SeriesGap,
  SeriesPoint,
} from "./types";

export const CHART_TERM_LIMIT = 5;

export const isDrawn = (s: Series) => s.isQuery || s.rank <= CHART_TERM_LIMIT;

export function buildSeries(
  payload: SemanticDriftResponse | null,
  allBooks: BookResponse[],
  ranking: TermRanking = DEFAULT_TERM_RANKING,
): DiachronicSeries {
  if (!payload || !allBooks.length) {
    return { series: [], roster: [] };
  }
  const bookMap = new Map(allBooks.map((b) => [b.id, b]));
  const missingById = new Map(
    payload.book_stats.map((s) => [s.id, s.missing_terms ?? []]),
  );

  const roster = payload.book_stats
    .map((summary) => bookMap.get(summary.id)!)
    .sort(byPublishedYear);

  const stat = RANKING_FIELD[ranking];
  const ranked = [...payload.comparative_terms].sort(
    (a, b) => b[stat] - a[stat],
  );

  const rankedColorCount = Math.min(ranked.length, CHART_TERM_LIMIT);

  const rankedLines = ranked.map(({ term, book_similarities, ...stats }, i) => ({
    term,
    isQuery: false,
    rank: i + 1,
    color: seriesColor(i + 1, rankedColorCount),
    terms: [term],
    stats,
    rows: book_similarities,
  }));

  const lines = [
    ...rankedLines.reverse(),
    {
      term: payload.expr.expr,
      isQuery: true,
      rank: 0,
      color: QUERY_COLOR,
      terms: payload.expr.terms,
      stats: null,
      rows: payload.expr.book_similarities,
    },
  ];

  const built: Series[] = [];

  for (const { terms, rows, ...line } of lines) {
    const measured = new Map(rows.map((r) => [r.book_id, r]));
    const points: SeriesPoint[] = [];
    const gaps: SeriesGap[] = [];

    for (const book of roster) {
      const raw = measured.get(book.id);
      if (raw) {
        points.push({
          id: book.id,
          label: book.label,
          year: book.published_year,
          similarity: raw.similarity,
          measurement: raw,
        });
      } else {
        const missing = missingById.get(book.id)!;
        gaps.push({
          id: book.id,
          missingTerms: terms.filter((t) => missing.includes(t)),
        });
      }
    }

    if (points.length) {
      built.push({ ...line, points, gaps });
    }
  }

  return { series: built, roster };
}

const byPublishedYear = (a: BookResponse, b: BookResponse) =>
  a.published_year - b.published_year || a.label.localeCompare(b.label);
