import { seriesColor, QUERY_COLOR } from "./palette";
import { DEFAULT_TERM_RANKING, RANKING_FIELD } from "../../types/api";
import type {
  BookResponse,
  BookSimilarity,
  TermRanking,
  SemanticDriftResponse,
} from "../../types/api";
import type { DiachronicSeries, Series, BookData } from "./types";

export const CHART_TERM_LIMIT = 5;

export function buildSeries(
  payload: SemanticDriftResponse | null,
  allBooks: BookResponse[],
  ranking: TermRanking = DEFAULT_TERM_RANKING,
): DiachronicSeries {
  if (!payload || !allBooks.length) {
    return { series: [], roster: [] };
  }
  const bookMap = new Map(allBooks.map((b) => [b.id, b]));
  const roster = payload.book_stats
    .map((summary) => bookMap.get(summary.id)!)
    .sort(byPublishedYear);

  const toSeries = (
    line: Omit<Series, "byText">,
    rows: BookSimilarity[],
  ): Series | null => {
    const measured = new Map(rows.map((r) => [r.book_id, r]));
    const byText: BookData[] = roster.map((book) => {
      const row = measured.get(book.id);
      if (!row) return book;
      const { similarity, occurrences } = row;
      return { ...book, similarity, occurrences };
    });
    return byText.some((t) => t.similarity !== undefined)
      ? { ...line, byText }
      : null;
  };

  const stat = RANKING_FIELD[ranking];
  const ranked = [...payload.comparative_terms].sort(
    (a, b) => b[stat] - a[stat],
  );
  const rankedColorCount = Math.min(ranked.length, CHART_TERM_LIMIT);

  const rankedLines = ranked.map(({ term, book_similarities, ...overall }, i) =>
    toSeries(
      {
        term,
        isQuery: false,
        rank: i + 1,
        color: seriesColor(i + 1, rankedColorCount),
        overall,
      },
      book_similarities,
    ),
  );

  const query = toSeries(
    {
      term: payload.expr.expr,
      isQuery: true,
      rank: 0,
      color: QUERY_COLOR,
      overall: null,
    },
    payload.expr.book_similarities,
  );

  const series = [...rankedLines.reverse(), query].filter((s) => s !== null);

  return { series, roster };
}

const byPublishedYear = (a: BookResponse, b: BookResponse) =>
  a.published_year - b.published_year || a.label.localeCompare(b.label);
