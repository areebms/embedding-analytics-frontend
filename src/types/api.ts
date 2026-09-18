import type { OperationTree } from "./vectorExpression";

export interface BookResponse {
  id: number;
  label: string;
  author: string;
  title: string;
  published_year: number;
}

export interface TermResponse {
  term: string;
  books: number[];
}

export interface SemanticDriftRequestBody {
  tree: OperationTree;
  book_ids: number[];
}

export interface BookSimilarity {
  book_id: number;
  similarity: number;
  occurrences: number;
}

export interface ExprSimilarityData {
  expr: string;
  terms: string[];
  book_similarities: BookSimilarity[];
}

export interface TermSimilarityData {
  term: string;
  similarity_mean: number;
  similarity_variance: number;
  n_books_in: number;
  n_books_local_in: number;
  book_similarities: BookSimilarity[];
}

// Keys appear in shared `?sort=` links: don't rename them. When the backend
// renames a field, change only the values.
export const RANKING_FIELD = {
  persistent: "similarity_mean",
  transient: "similarity_variance",
} as const;
export type TermRanking = keyof typeof RANKING_FIELD;
export type TermStatField = (typeof RANKING_FIELD)[TermRanking];
export const TERM_RANKINGS = Object.keys(RANKING_FIELD) as TermRanking[];
export const DEFAULT_TERM_RANKING: TermRanking = "persistent";

// Only books the backend scored get a row. `missing_terms`: which of the
// returned related terms this book never uses.
export interface BookSummary {
  id: number;
  n_shared_terms: number;
  missing_terms?: string[];
}

export interface SemanticDriftResponse {
  expr: ExprSimilarityData;
  comparative_terms: TermSimilarityData[];
  book_stats: BookSummary[];
}

export interface SubstitutionResponse {
  original: string;
  resolved: string;
}

export interface ParseDescribeResponse {
  expression: string;
  terms: string[];
  substitutions: SubstitutionResponse[];
}

export interface ExpressionAbsentResponse {
  reason: "expression_absent";
  book_id: number;
  terms: string[];
}

export interface QueryInTooFewBooksResponse {
  reason: "query_in_too_few_books";
  book_id?: number | null;
}

export interface TermResolutionResponse {
  reason: "term_resolution";
  message: string;
  term: string;
  candidates: string[];
}

export type ReasonBody =
  | ExpressionAbsentResponse
  | QueryInTooFewBooksResponse
  | TermResolutionResponse;

export type Reason = ReasonBody["reason"];
