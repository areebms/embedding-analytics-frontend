import type {
  BookResponse,
  BookSimilarity,
  TermSimilarityData,
} from "../../types/api";

export interface SeriesPoint {
  id: number;
  label: string;
  year: number;
  /** Definitional agreement: the API's `similarity`, read. */
  agreement: number;
  measurement: BookSimilarity | null;
}

export type GapCause = "absent" | "unscored";

export interface SeriesGap {
  id: number;
  cause: GapCause;
  missingTerms: string[];
}

type TermStats = Omit<TermSimilarityData, "term" | "book_similarities">;

export interface Series {
  term: string;
  isQuery: boolean;
  color: string;
  rank: number;
  stats: TermStats | null;
  points: SeriesPoint[];
  gaps: SeriesGap[];
}

export interface DiachronicSeries {
  series: Series[];
  roster: BookResponse[];
}

interface TermValue {
  agreement: number;
}

export interface ChartRow {
  year: number;
  bookId: number;
  book: string;
  values: Record<string, TermValue>;
}

export interface ChartModel {
  chartData: ChartRow[];
  xDomain: [number, number];
  yMin: number;
  yMax: number;
  xTicks: number[];
  yTicks: number[];
}

export interface LabelAnchor {
  y: number;
  height: number;
  rank: number;
}
