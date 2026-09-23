import type {
  BookResponse,
  TermType,
  TermSimilarityData,
} from "../../types/api";

export type OverallData = Omit<TermSimilarityData, "term" | "book_similarities">;

export type SeriesType = TermType | "query";

export interface BookData extends BookResponse {
  similarity?: number;
  occurrences?: number;
}

export interface Series {
  term: string;
  type: SeriesType;
  rank: number;
  overall: OverallData | null;
  byText: BookData[];
}

export interface DiachronicSeries {
  series: Series[];
  roster: BookResponse[];
}
