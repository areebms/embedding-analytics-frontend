import { TERM_TYPES, TERM_TYPE_LIST } from "../../types/api";
import type {
  BookResponse,
  BookSimilarity,
  SemanticDriftResponse,
} from "../../types/api";
import type { DiachronicSeries, Series, BookData } from "./types";

export const isQuery = ({ type }: Pick<Series, "type">) => type === "query";

export function buildSeries(
  payload: SemanticDriftResponse | null,
  allBooks: BookResponse[],
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

  // A term in both lists keeps its first type: consistent wins.
  const seen = new Set<string>();
  const ranked = TERM_TYPES.flatMap((type) =>
    payload[TERM_TYPE_LIST[type]]
      .filter(({ term }) => !seen.has(term) && seen.add(term))
      .map(({ term, book_similarities, ...overall }, i) =>
        toSeries({ term, rank: i + 1, type, overall }, book_similarities),
      ),
  );

  const query = toSeries(
    {
      term: payload.expr.expr,
      rank: 0,
      type: "query",
      overall: null,
    },
    payload.expr.book_similarities,
  );

  const series = [...ranked.reverse(), query].filter((s) => s !== null);

  return { series, roster };
}

const byPublishedYear = (a: BookResponse, b: BookResponse) =>
  a.published_year - b.published_year || a.label.localeCompare(b.label);
