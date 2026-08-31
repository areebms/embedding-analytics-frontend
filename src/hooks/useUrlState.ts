import { useCallback } from "react";
import {
  useSearchParams,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { TERM_RANKINGS, DEFAULT_TERM_RANKING } from "../types/api";
import type { TermRanking } from "../types/api";

const DEFAULT_EXPRESSION = "market";
const VIEW = "overview";

// The code calls this "ranking"; the query param stays `sort` because links
// people have already shared carry it. Rename the symbol, never the string.
const RANKING_PARAM = "sort";

function toRanking(value: string | null): TermRanking {
  return (TERM_RANKINGS as readonly string[]).includes(value ?? "")
    ? (value as TermRanking)
    : DEFAULT_TERM_RANKING;
}

export default function useUrlState() {
  const [params, setParams] = useSearchParams();
  const { bookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const setParam = useCallback(
    (key: string, value: string, defaultValue: string) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === defaultValue) next.delete(key);
          else next.set(key, value);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const expression = params.get("q") ?? DEFAULT_EXPRESSION;
  const setExpression = useCallback(
    (value: string) => setParam("q", value, DEFAULT_EXPRESSION),
    [setParam],
  );

  const ranking = toRanking(params.get(RANKING_PARAM));
  const setRanking = useCallback(
    (value: TermRanking) =>
      setParam(RANKING_PARAM, value, DEFAULT_TERM_RANKING),
    [setParam],
  );

  const selectedBookId = bookId ?? null;

  const setSelectedBookId = useCallback(
    (book: number | null) => {
      navigate(
        {
          pathname: book !== null ? `/${VIEW}/${book}` : "/",
          search: location.search,
        },
        { replace: true },
      );
    },
    [navigate, location.search],
  );

  return {
    expression,
    setExpression,
    ranking,
    setRanking,
    selectedBookId,
    setSelectedBookId,
  };
}
