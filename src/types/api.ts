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
  similarity_std: number;
  n_books_in: number;
  book_similarities: BookSimilarity[];
}

// Keys are the UI's term types; values are the backend's wire names.
export const TERM_TYPE_STAT = {
  consistent: "similarity_mean",
  contested: "similarity_std",
} as const;
export type TermType = keyof typeof TERM_TYPE_STAT;
export type TermStatField = (typeof TERM_TYPE_STAT)[TermType];
export const TERM_TYPES = Object.keys(TERM_TYPE_STAT) as TermType[];

// Only books the backend scored get a row. `missing_terms`: which of the
// returned related terms this book never uses.
export interface BookSummary {
  id: number;
  n_shared_terms: number;
  missing_terms?: string[];
}

// Each list is already ranked by the backend, best first.
export interface SemanticDriftResponse {
  expr: ExprSimilarityData;
  top_mean: TermSimilarityData[];
  top_std: TermSimilarityData[];
  book_stats: BookSummary[];
}

export const TERM_TYPE_LIST = {
  consistent: "top_mean",
  contested: "top_std",
} as const satisfies Record<TermType, keyof SemanticDriftResponse>;

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
