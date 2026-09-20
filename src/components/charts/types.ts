import type {
  BookResponse,
  BookSimilarity,
  TermSimilarityData,
} from "../../types/api";

export interface SeriesPoint {
  id: number;
  label: string;
  year: number;
  similarity: number;
  measurement: BookSimilarity;
}

/** A roster book off this line, which only happens when it lacks the term. */
export interface SeriesGap {
  id: number;
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
