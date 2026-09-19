import { FONT_FAMILY } from "../../theme";
import { INK } from "./palette";

export const CHART_HEIGHT = 400;
export const CHART_MARGIN = { top: 12, right: 24, left: 8, bottom: 8 };
export const Y_AXIS_WIDTH = 55;
export const AXIS_LABEL_SIZE = 13;
export const TICK_LABEL_SIZE = 11;

export const QUERY_TERM_WEIGHT = 700;
export const NEIGHBOUR_TERM_WEIGHT = 500;

export const termWeight = (isQuery: boolean): number =>
  isQuery ? QUERY_TERM_WEIGHT : NEIGHBOUR_TERM_WEIGHT;

export const AXIS_TITLE_STYLE = {
  textAnchor: "middle",
  fill: INK.title,
  fontWeight: 600,
  fontSize: AXIS_LABEL_SIZE,
};

export const AXIS_LINE = { stroke: INK.axis };

export const TICK = { fontSize: TICK_LABEL_SIZE, fill: INK.tick };

// For axes whose ticks are decimals that must not jitter column to column.
export const NUMERIC_TICK = { ...TICK, fontVariantNumeric: "tabular-nums" };

// The white outline that keeps a term legible where it crosses a grid line or a
// mark. Drawn under the glyph via paintOrder, so it never eats the letterforms.
export const TERM_LABEL_HALO = {
  stroke: INK.surface,
  strokeWidth: 3,
  strokeLinejoin: "round",
  paintOrder: "stroke",
};

export const LABEL_FONT_SIZE = 11;

const QUERY_FONT = `${QUERY_TERM_WEIGHT} ${LABEL_FONT_SIZE}px ${FONT_FAMILY}`;
const NEIGHBOUR_FONT = `${NEIGHBOUR_TERM_WEIGHT} ${LABEL_FONT_SIZE}px ${FONT_FAMILY}`;

const widths = {
  query: new Map<string, number>(),
  neighbour: new Map<string, number>(),
};
let measurer: CanvasRenderingContext2D | null | undefined;

export function measureLabel(term: string, isQuery: boolean): number {
  const cache = isQuery ? widths.query : widths.neighbour;
  const cached = cache.get(term);
  if (cached != null) return cached;

  measurer ??= document.createElement("canvas").getContext("2d");
  const width = measurer
    ? ((measurer.font = isQuery ? QUERY_FONT : NEIGHBOUR_FONT),
      measurer.measureText(term).width)
    : term.length * LABEL_FONT_SIZE * 0.6;
  cache.set(term, width);
  return width;
}

const TARGET_TICKS = 6;

export function generateLinearTicks(min: number, max: number): number[] {
  const span = max - min;
  if (!(span > 0)) return [min];

  const rough = span / (TARGET_TICKS - 1);
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalised = rough / magnitude;
  const step =
    (normalised >= 7.07
      ? 10
      : normalised >= 3.16
        ? 5
        : normalised >= 1.41
          ? 2
          : 1) * magnitude;

  const ticks: number[] = [];
  for (
    let t = Math.ceil(min / step) * step;
    t <= max + step * 1e-9;
    t += step
  ) {
    ticks.push(Math.round(t / step) * step);
  }
  return ticks;
}
