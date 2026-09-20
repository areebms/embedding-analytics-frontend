import type { BookResponse, TermSimilarityData } from "../../types/api";

export type OverallData = Omit<TermSimilarityData, "term" | "book_similarities">;

export interface BookData extends BookResponse {
  similarity?: number;
  occurrences?: number;
}

export interface Series {
  term: string;
  isQuery: boolean;
  color: string;
  rank: number;
  overall: OverallData | null;
  byText: BookData[];
}

export interface DiachronicSeries {
  series: Series[];
  roster: BookResponse[];
}
