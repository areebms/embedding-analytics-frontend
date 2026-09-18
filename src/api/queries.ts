import { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { stringifyExpression } from "../utils/vectorExpressionParser";
import { ApiError, unwrapReason } from "./errors";
import type { ErrorKind } from "./errors";
import type { OperationTree } from "../types/vectorExpression";
import type {
  BookResponse,
  ParseDescribeResponse,
  Reason,
  SemanticDriftRequestBody,
  SemanticDriftResponse,
  TermResponse,
} from "../types/api";

const API_URL = import.meta.env.VITE_API_URL;

interface RequestOptions extends RequestInit {
  reasons?: Reason[];
  statusKinds?: Record<number, ErrorKind>;
}

async function request<T>(
  path: string,
  { reasons = [], statusKinds = {}, ...options }: RequestOptions = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, options);
  } catch (cause) {
    throw new ApiError("network", { cause });
  }

  if (res.ok) return res.json() as Promise<T>;

  const body = await res.json().catch(() => null);

  const reason = res.status === 404 ? unwrapReason(body) : null;
  if (reason && reasons.includes(reason.reason)) {
    throw new ApiError(reason.reason, { status: 404, data: reason });
  }

  const kinds: Record<number, ErrorKind> = {
    422: "invalid_request",
    ...statusKinds,
  };
  throw new ApiError(kinds[res.status] ?? "http", {
    status: res.status,
    data: body,
  });
}

function postJson<T>(path: string, payload: unknown, opts?: RequestOptions) {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    ...opts,
  });
}

const selectBooks = (books: BookResponse[]): BookResponse[] =>
  [...books].sort((a, b) => a.published_year - b.published_year);

const selectTerms = (terms: TermResponse[]): TermResponse[] =>
  [...terms].sort((a, b) => b.books.length - a.books.length);

export function useBooks() {
  return useQuery<BookResponse[], ApiError, BookResponse[]>({
    queryKey: ["books"],
    queryFn: () => request<BookResponse[]>("/books"),
    staleTime: Infinity,
    select: selectBooks,
  });
}

export function useTerms() {
  return useQuery<TermResponse[], ApiError, TermResponse[]>({
    queryKey: ["terms"],
    queryFn: () => request<TermResponse[]>("/terms"),
    staleTime: Infinity,
    select: selectTerms,
  });
}

export function useSemanticDrift(
  bookIds: number[],
  tree: OperationTree | null,
  sourceBookId: number | null = null,
) {
  const targetIds = useMemo(
    () => bookIds.filter((id) => id !== sourceBookId),
    [bookIds, sourceBookId],
  );

  const drift = useQuery<SemanticDriftResponse, ApiError>({
    queryKey: ["semantic-drift", sourceBookId, tree, targetIds],
    queryFn: () => {
      const path =
        sourceBookId !== null
          ? `/semantic-drift/${sourceBookId}`
          : "/semantic-drift";

      const body: SemanticDriftRequestBody = {
        tree: tree!,
        book_ids: targetIds,
      };
      return postJson<SemanticDriftResponse>(path, body, {
        reasons: ["expression_absent", "query_in_too_few_books"],
      });
    },
    enabled: tree !== null && targetIds.length >= 1,
    staleTime: Infinity,
  });

  return {
    payload: drift.data ?? null,
    isLoading: drift.isFetching,
    error: drift.error,
    queryLabel: drift.data?.expr.expr ?? stringifyExpression(tree),
  };
}

export function useParseDescribeQuery() {
  return useMutation<ParseDescribeResponse, ApiError, string>({
    mutationFn: (message: string) =>
      postJson<ParseDescribeResponse>(
        "/parse-describe",
        { message },
        { reasons: ["term_resolution"], statusKinds: { 400: "unparseable" } },
      ),
  });
}
