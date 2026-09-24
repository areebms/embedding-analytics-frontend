import { useCallback } from "react";
import {
  useSearchParams,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";

const DEFAULT_EXPRESSION = "market";
const VIEW = "overview";

export const CHART_TABS = ["scatter", "diachronic"] as const;
export type ChartTab = (typeof CHART_TABS)[number];
const CHART_TAB_PARAM = "chart";

function toToken<T extends string>(
  tokens: readonly T[],
  value: string | null,
  fallback: T,
): T {
  return (tokens as readonly string[]).includes(value ?? "")
    ? (value as T)
    : fallback;
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

  const chartTab = toToken(
    CHART_TABS,
    params.get(CHART_TAB_PARAM),
    CHART_TABS[0],
  );
  const setChartTab = useCallback(
    (value: ChartTab) => setParam(CHART_TAB_PARAM, value, CHART_TABS[0]),
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
    chartTab,
    setChartTab,
    selectedBookId,
    setSelectedBookId,
  };
}
