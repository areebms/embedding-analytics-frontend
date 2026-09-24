import {
  type BookResponse,
  type Reason,
  type ReasonBody,
  type ExpressionAbsentResponse,
  type QueryInTooFewBooksResponse,
  type TermResolutionResponse,
} from "../types/api";

export type ErrorKind =
  | Reason
  | "unparseable"
  | "invalid_request"
  | "http"
  | "network";

export class ApiError extends Error {
  kind: ErrorKind;
  status: number;
  data: unknown;
  cause: unknown;

  constructor(
    kind: ErrorKind,
    {
      status = 0,
      data = null,
      cause = null,
    }: { status?: number; data?: unknown; cause?: unknown } = {},
  ) {
    super(`${kind} (${status})`);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.data = data;
    this.cause = cause;
  }
}

export function unwrapReason(body: unknown): ReasonBody | null {
  return (body as ReasonBody | null)?.reason ? (body as ReasonBody) : null;
}

function quoteList(terms: string[] | undefined): string {
  const quoted = (terms ?? []).map((t) => `'${t}'`);
  if (quoted.length <= 1) return quoted[0] ?? "";
  return `${quoted.slice(0, -1).join(", ")} and ${quoted[quoted.length - 1]}`;
}

export interface DriftAlert {
  severity: "info" | "error";
  message: string;
}

export function describeDriftError(
  error: ApiError | null,
  {
    books = [],
    refBook = null,
    queryLabel = "",
  }: {
    books?: BookResponse[];
    refBook?: BookResponse | null;
    queryLabel?: string;
  } = {},
): DriftAlert {
  const labelOf = (id: number | null | undefined) =>
    books.find((b) => b.id === id)?.label ?? null;

  switch (error?.kind) {
    case "expression_absent": {
      const data = error.data as ExpressionAbsentResponse | null;
      const label =
        labelOf(data?.book_id) ?? refBook?.label ?? "The pinned book";
      const missing = quoteList(data?.terms);
      return {
        severity: "info",
        message: missing
          ? `${label} never uses ${missing}, so '${queryLabel}' cannot be measured there. Pin a different book, or drop that term.`
          : `'${queryLabel}' cannot be measured in ${label}. Pin a different book, or try another expression.`,
      };
    }

    case "query_in_too_few_books": {
      const data = error.data as QueryInTooFewBooksResponse | null;
      const label = labelOf(data?.book_id);
      return {
        severity: "info",
        message: label
          ? `Too few of the books use '${queryLabel}', so there is nothing to compare with ${label}. Try a more common term, or unpin ${label}.`
          : `Too few of these books use '${queryLabel}', so there is nothing to compare. Try a more common term.`,
      };
    }

    case "invalid_request":
      console.error("[drift] 422 rejected the request", error.data);
      return {
        severity: "error",
        message: "Couldn't load these results: the request was rejected.",
      };

    case "network":
      return {
        severity: "error",
        message:
          "Couldn't reach the server — it may be busy or offline. Try again in a moment.",
      };

    default:
      console.error("[drift] request failed", error);
      return { severity: "error", message: "Couldn't load these results." };
  }
}

export interface DescribeNotice {
  severity: "info" | "warning" | "error";
  text: string;
  term?: string;
  candidates?: string[];
}

export function describeDescribeError(error: ApiError | null): DescribeNotice {
  switch (error?.kind) {
    case "term_resolution": {
      const data = error.data as TermResolutionResponse | null;
      const candidates = data?.candidates ?? [];
      const message =
        data?.message ?? "That word isn't in the corpus vocabulary.";
      return {
        severity: "warning",
        text: candidates.length ? message : `${message} Try a different word.`,
        term: data?.term,
        candidates,
      };
    }

    case "unparseable": {
      const detail = (error.data as { detail?: string } | null)?.detail;
      const attempt = detail?.match(/'(.*)'$/)?.[1];
      return {
        severity: "warning",
        text: attempt
          ? `That description came back as '${attempt}', which isn't a valid expression. Try naming the concepts directly — e.g. "labour minus capital".`
          : 'That description couldn\'t be turned into an expression. Try naming the concepts directly — e.g. "labour minus capital".',
      };
    }

    case "invalid_request":
      console.warn("[parse-describe] 422 rejected the message", error.data);
      return {
        severity: "error",
        text: "That message couldn't be processed. Try rephrasing it.",
      };

    case "network":
      return {
        severity: "error",
        text: "Couldn't reach the describe service — it may be busy or offline.",
      };

    default:
      console.error("[parse-describe] request failed", error);
      return {
        severity: "error",
        text: "The describe service is unavailable. Try again, or switch to Vector mode.",
      };
  }
}
