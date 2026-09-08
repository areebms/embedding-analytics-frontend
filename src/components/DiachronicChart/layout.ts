import { FONT_FAMILY } from "../../theme";
import { INK } from "./palette";
import type { LabelAnchor } from "./types";

export const CHART_HEIGHT = 400;
export const CHART_MARGIN = { top: 12, right: 24, left: 8, bottom: 8 };
export const Y_AXIS_WIDTH = 55;
export const AXIS_LABEL_SIZE = 13;
export const TICK_LABEL_SIZE = 11;
export const QUERY_DOT_R = 7.5;
export const NEIGHBOUR_DOT_R = 6;

export const QUERY_STROKE_W = 3.25;
export const NEIGHBOUR_STROKE_W = 1;
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

export const Y_AXIS_PAD = 12;
export const X_AXIS_PAD_RIGHT = 12;

export const LABEL_GAP_X = 12;
export const LABEL_LINE_H = 14;
export const LABEL_FONT_SIZE = 11;

const LABEL_GAP_Y = 6;
const LABEL_PAD = 4;
const LABEL_COLUMN_MAX = 132;
const LABEL_GAP_Y_TIGHT = 2;

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

export function labelColumnWidth(
  series: { term: string; isQuery: boolean }[],
): number {
  let widest = 0;
  for (const s of series) {
    const unbreakable = Math.max(
      ...s.term.split(/\s+/).map((word) => measureLabel(word, s.isQuery)),
    );
    const whole = Math.min(measureLabel(s.term, s.isQuery), LABEL_COLUMN_MAX);
    widest = Math.max(widest, unbreakable, whole);
  }
  return widest + LABEL_PAD;
}

export function labelLines(
  term: string,
  isQuery: boolean,
  width: number,
): number {
  const space = measureLabel(" ", isQuery);
  let lines = 1;
  let filled = 0;
  for (const word of term.split(/\s+/)) {
    const w = measureLabel(word, isQuery);
    if (filled === 0) {
      filled = w;
    } else if (filled + space + w <= width) {
      filled += space + w;
    } else {
      lines++;
      filled = w;
    }
  }
  return lines;
}

export function stackLabels(
  anchors: LabelAnchor[],
  bounds: { top: number; bottom: number },
): (number | null)[] {
  const available = bounds.bottom - bounds.top;
  const height = (subset: LabelAnchor[], gap: number) =>
    subset.reduce((sum, a) => sum + a.height, 0) +
    Math.max(0, subset.length - 1) * gap;

  let gap = LABEL_GAP_Y;
  let kept = anchors;
  if (height(kept, gap) > available) {
    gap = LABEL_GAP_Y_TIGHT;
    // Tighten first, then drop the least-missed labels until the rest fit.
    kept = [...anchors].sort((a, b) => a.rank - b.rank);
    while (kept.length > 1 && height(kept, gap) > available)
      kept = kept.slice(0, -1);
    const survivors = new Set(kept);
    kept = anchors.filter((a) => survivors.has(a));
  }

  const placed = new Map<LabelAnchor, number>();
  const order = [...kept].sort((a, b) => a.y - b.y);

  let cursor = bounds.top;
  for (const a of order) {
    const y = Math.max(a.y, cursor);
    placed.set(a, y);
    cursor = y + a.height + gap;
  }

  let ceiling = bounds.bottom;
  for (let i = order.length - 1; i >= 0; i--) {
    const a = order[i];
    const y = Math.min(placed.get(a)!, ceiling - a.height);
    placed.set(a, y);
    ceiling = y - gap;
  }

  return anchors.map((a) => placed.get(a) ?? null);
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
