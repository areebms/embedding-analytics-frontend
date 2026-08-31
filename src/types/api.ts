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

export const LOCAL_ANCHOR_FLOOR = 75;

export const MIN_BOOKS_FOR_COMPARISON = 4;

export interface SemanticDriftRequestBody {
  tree: OperationTree;
  book_ids: number[];
}

// One book's agreement reading. `n_books` is present only on the to-corpus
// variant; nothing here branches on it, so it stays optional rather than
// splitting the type -- a union of an interface with its own subtype narrows
// to nothing without a discriminant.
export interface BookAgreement {
  book_id: number;
  mean_local_similarity: number;
  ci: [number, number];
  occurrences: number;
  n_seeds: number;
  n_books?: number;
}

export interface ExprData {
  expr: string;
  terms: string[];
  books: BookAgreement[];
}

export interface TermData {
  term: string;
  stability: number;
  instability: number;
  n_books_in: number;
  n_books_as_top50: number;
  n_books_as_top100: number;
  books: BookAgreement[];
}

// Client-side ranking only -- both fields are present on every TermData the
// backend returns, so which one sorts/draws the chart is a display choice,
// not a request parameter.
export const TERM_RANKINGS = ["stability", "instability"] as const;
export type TermRanking = (typeof TERM_RANKINGS)[number];
export const DEFAULT_TERM_RANKING: TermRanking = "stability";

export interface BookSummary {
  id: number;
  n_shared_terms: number;
  missing_terms?: string[];
}

export interface SemanticDriftResponse {
  expr: ExprData;
  comparative_terms: TermData[];
  books: BookSummary[];
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
