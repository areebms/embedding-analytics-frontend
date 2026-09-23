import type { SeriesType } from "./types";

export const QUERY_COLOR = "#111827";

export const TERM_TYPE_COLOR = {
  query: QUERY_COLOR,
  consistent: "#1f5c9e",
  contested: "#c62828",
} as const satisfies Record<SeriesType, string>;

export const INK = {
  grid: "#e1e0d9",
  axis: "#c3c2b7",
  tick: "#6b7280",
  title: "#374151",
  surface: "#fff",
};
