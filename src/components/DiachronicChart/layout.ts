import { measureLabel } from "../charts/layout";
import { isQuery } from "../charts/series";
import type { Series } from "../charts/types";
import type { LabelAnchor } from "./types";

export const QUERY_DOT_R = 7.5;
export const NEIGHBOUR_DOT_R = 6;
export const DOT_FADED_OPACITY = 0.25;

export const QUERY_STROKE_W = 3.25;
export const NEIGHBOUR_STROKE_W = 1;

export const Y_AXIS_PAD = 12;
export const X_AXIS_PAD_RIGHT = 12;

export const LABEL_GAP_X = 12;
export const LABEL_LINE_H = 14;

const LABEL_GAP_Y = 6;
const LABEL_PAD = 4;
const LABEL_COLUMN_MAX = 132;
const LABEL_GAP_Y_TIGHT = 2;

export function labelColumnWidth(
  series: Pick<Series, "term" | "type">[],
): number {
  let widest = 0;
  for (const s of series) {
    const query = isQuery(s);
    const unbreakable = Math.max(
      ...s.term.split(/\s+/).map((word) => measureLabel(word, query)),
    );
    const whole = Math.min(measureLabel(s.term, query), LABEL_COLUMN_MAX);
    widest = Math.max(widest, unbreakable, whole);
  }
  return widest + LABEL_PAD;
}

export function labelLines(
  term: string,
  query: boolean,
  width: number,
): number {
  const space = measureLabel(" ", query);
  let lines = 1;
  let filled = 0;
  for (const word of term.split(/\s+/)) {
    const w = measureLabel(word, query);
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
