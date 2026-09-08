const SERIES_COLOR = [255, 74, 3];

const OPACITY_MAX = 1;
const OPACITY_MIN = 0.2;

const seriesHue = (opacity: string): string =>
  `rgba(${SERIES_COLOR[0]}, ${SERIES_COLOR[1]}, ${SERIES_COLOR[2]}, ${opacity})`;

export function seriesColor(rank: number, total: number): string {
  const t = total > 1 ? Math.min(rank - 1, total - 1) / (total - 1) : 0;
  const opacity = OPACITY_MAX * (OPACITY_MIN / OPACITY_MAX) ** t;
  return seriesHue(opacity.toFixed(2));
}

export const QUERY_COLOR = "#1f5c9e";

export const INK = {
  grid: "#e1e0d9",
  axis: "#c3c2b7",
  tick: "#6b7280",
  title: "#374151",
  surface: "#fff",
};

export const CONTEXT_STROKE = seriesHue("0.5");
