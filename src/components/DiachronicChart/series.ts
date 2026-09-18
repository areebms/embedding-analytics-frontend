import { seriesColor, QUERY_COLOR } from "./palette";
import { generateLinearTicks } from "./layout";
import { DEFAULT_TERM_RANKING, RANKING_FIELD } from "../../types/api";
import type {
  BookResponse,
  TermRanking,
  SemanticDriftResponse,
} from "../../types/api";
import type {
  ChartModel,
  ChartRow,
  DiachronicSeries,
  GapCause,
  Series,
  SeriesGap,
  SeriesPoint,
} from "./types";

export const CHART_TERM_LIMIT = 5;

export const isDrawn = (s: Series) => s.isQuery || s.rank <= CHART_TERM_LIMIT;

export function buildDiachronicSeries(
  payload: SemanticDriftResponse | null,
  allBooks: BookResponse[],
  pinnedBook: BookResponse | null = null,
  ranking: TermRanking = DEFAULT_TERM_RANKING,
): DiachronicSeries {
  if (!payload?.book_stats.length || !allBooks.length) {
    return { series: [], roster: [] };
  }
  const bookMap = new Map(allBooks.map((b) => [b.id, b]));
  const summaryById = new Map(payload.book_stats.map((s) => [s.id, s]));

  const roster = payload.book_stats
    .filter((summary) => bookMap.has(summary.id))
    .map((summary) => bookMap.get(summary.id)!)
    .sort(byPublishedYear);

  const ranked = [...payload.comparative_terms].sort(
    (a, b) => b[RANKING_FIELD[ranking]] - a[RANKING_FIELD[ranking]],
  );

  const rankedColorCount = Math.min(ranked.length, CHART_TERM_LIMIT);

  const rankedLines = ranked.map(({ term, book_similarities, ...stats }, i) => ({
    term,
    isQuery: false,
    rank: i + 1,
    terms: [term],
    stats,
    rows: book_similarities,
  }));

  const lines = [
    ...rankedLines.slice().reverse(),
    {
      term: payload.expr.expr,
      isQuery: true,
      rank: 0,
      terms: payload.expr.terms,
      stats: null,
      rows: payload.expr.book_similarities,
    },
  ];

  const built: Series[] = [];

  for (const line of lines) {
    const measured = new Map(line.rows.map((r) => [r.book_id, r]));
    const points: SeriesPoint[] = [];
    const gaps: SeriesGap[] = [];

    for (const book of roster) {
      const base = {
        id: book.id,
        label: book.label,
        year: book.published_year,
      };
      const raw = measured.get(book.id);
      if (raw) {
        points.push({
          ...base,
          agreement: raw.similarity,
          measurement: raw,
        });
      } else {
        const summary = summaryById.get(book.id);
        const missingTerms = line.terms.filter((t) =>
          summary?.missing_terms?.includes(t),
        );
        gaps.push({
          id: book.id,
          cause: gapCause(missingTerms),
          missingTerms,
        });
      }
    }

    points.sort(byYear);

    if (!points.length) {
      continue;
    }

    built.push({
      term: line.term,
      isQuery: line.isQuery,
      color: line.isQuery
        ? QUERY_COLOR
        : seriesColor(line.rank, rankedColorCount),
      rank: line.rank,
      stats: line.stats,
      points,
      gaps,
    });
  }

  if (pinnedBook) {
    for (const s of built) {
      if (s.points.some((p) => p.id === pinnedBook.id)) continue;
      s.points = [
        ...s.points,
        {
          id: pinnedBook.id,
          label: pinnedBook.label,
          year: pinnedBook.published_year,
          agreement: 1,
          measurement: null,
        },
      ].sort(byYear);
    }

    if (!roster.some((b) => b.id === pinnedBook.id)) {
      roster.push(pinnedBook);
      roster.sort(byPublishedYear);
    }
  }

  return { series: built, roster };
}

function gapCause(missingTerms: string[]): GapCause {
  if (missingTerms.length) return "absent";
  return "unscored";
}

const byYear = (
  a: { year: number; label: string },
  b: { year: number; label: string },
) => a.year - b.year || a.label.localeCompare(b.label);

const byPublishedYear = (a: BookResponse, b: BookResponse) =>
  a.published_year - b.published_year || a.label.localeCompare(b.label);

const MIN_Y_SPAN = 0.04;

export function buildChartModel(
  series: Series[],
  roster: BookResponse[],
): ChartModel {
  const allPoints = series.flatMap((s) => s.points);
  if (!allPoints.length || !roster.length) return EMPTY_MODEL;

  const chartData: ChartRow[] = roster.map((book) => ({
    year: book.published_year,
    bookId: book.id,
    book: book.label,
    values: {},
  }));

  const agreements = allPoints.map((d) => d.agreement);
  const years = chartData.map((r) => r.year);
  const yearMin = Math.min(...years);
  const yearMax = Math.max(...years);
  const agreementMin = Math.min(...agreements);
  const agreementMax = Math.max(...agreements);

  let [yMin, yMax] = [Math.max(-1, agreementMin), Math.min(1, agreementMax)];
  if (yMax - yMin < MIN_Y_SPAN) {
    const mid = (yMin + yMax) / 2;
    [yMin, yMax] = [
      Math.max(-1, mid - MIN_Y_SPAN / 2),
      Math.min(1, mid + MIN_Y_SPAN / 2),
    ];
  }

  const rowByBookId = new Map(chartData.map((row) => [row.bookId, row]));

  for (const s of series) {
    for (const p of s.points) {
      const row = rowByBookId.get(p.id);
      if (!row) continue;
      row.values[s.term] = { agreement: p.agreement };
    }
  }

  return {
    chartData,
    xDomain: [yearMin, yearMax],
    yMin,
    yMax,
    xTicks: generateYearTicks(yearMin, yearMax),
    yTicks: generateLinearTicks(yMin, yMax),
  };
}

const EMPTY_MODEL: ChartModel = {
  chartData: [],
  xDomain: [0, 1],
  yMin: 0,
  yMax: 1,
  xTicks: [],
  yTicks: [],
};

function generateYearTicks(min: number, max: number): number[] {
  const span = max - min;
  const step = span > 200 ? 50 : span > 100 ? 25 : span > 50 ? 10 : 5;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= max; t += step) ticks.push(t);
  return ticks;
}
