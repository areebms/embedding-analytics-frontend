import {
  LABEL_FONT_SIZE,
  generateLinearTicks,
  measureLabel,
} from "../charts/layout";
import { INK } from "../charts/palette";
import type { Series, SeriesType, OverallData } from "../charts/types";

type Scale = (value: number) => number;

interface PlotArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const DOT_R = 6;
const SURFACE_RING_W = 2;

export function dotSpec(color: string): {
  r: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
} {
  return {
    r: DOT_R,
    fill: color,
    stroke: INK.surface,
    strokeWidth: SURFACE_RING_W,
  };
}
export type ScoredSeries = Series & { overall: OverallData };

export interface ScatterModel {
  points: ScoredSeries[];
  xDomain: [number, number];
  yDomain: [number, number];
  xTicks: number[];
  yTicks: number[];
  xDecimals: number;
  yDecimals: number;
}

const EMPTY_SCATTER_MODEL: ScatterModel = {
  points: [],
  xDomain: [0, 1],
  yDomain: [0, 1],
  xTicks: [],
  yTicks: [],
  xDecimals: 2,
  yDecimals: 2,
};

const PAD_FRACTION = 0.08;
const MIN_SPAN = 0.01;

export function buildScatterModel(series: Series[]): ScatterModel {
  const points = series
    .filter((s): s is ScoredSeries => s.overall !== null)
    .sort((a, b) => byMean(b, a));

  if (!points.length) return EMPTY_SCATTER_MODEL;

  const xDomain = paddedDomain(points.map((p) => p.overall.similarity_mean));
  const yDomain = paddedDomain(
    points.map((p) => p.overall.similarity_std),
    SPREAD_FLOOR,
  );
  const xTicks = generateLinearTicks(xDomain[0], xDomain[1]);
  const yTicks = generateLinearTicks(yDomain[0], yDomain[1]);

  return {
    points,
    xDomain,
    yDomain,
    xTicks,
    yTicks,
    xDecimals: tickDecimals(xTicks),
    yDecimals: tickDecimals(yTicks),
  };
}

const SPREAD_FLOOR = 0;

function paddedDomain(
  values: number[],
  floor = -Infinity,
): [number, number] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max - min < MIN_SPAN) {
    const low = Math.max(floor, (min + max) / 2 - MIN_SPAN / 2);
    return [low, low + MIN_SPAN];
  }
  const pad = (max - min) * PAD_FRACTION;
  return [Math.max(floor, min - pad), max + pad];
}

function byMean(a: ScoredSeries, b: ScoredSeries): number {
  return (
    b.overall.similarity_mean - a.overall.similarity_mean ||
    a.term.localeCompare(b.term)
  );
}

const MAX_DECIMALS = 4;

function tickDecimals(ticks: number[]): number {
  if (ticks.length < 2) return 2;
  const step = Math.abs(ticks[1] - ticks[0]);
  if (!(step > 0)) return 2;
  return Math.min(MAX_DECIMALS, Math.max(0, Math.ceil(-Math.log10(step))));
}

export interface PlacedPoint {
  point: ScoredSeries;
  cx: number;
  cy: number;
}

export function project(
  points: ScoredSeries[],
  xScale: Scale,
  yScale: Scale,
): PlacedPoint[] {
  return points
    .map((point) => ({
      point,
      cx: xScale(point.overall.similarity_mean),
      cy: yScale(point.overall.similarity_std),
    }))
    .filter((p) => Number.isFinite(p.cx) && Number.isFinite(p.cy));
}

const LABEL_GAP = 6;
const LABEL_PAD = 2;

const ABOVE_BELOW_DY = DOT_R + LABEL_FONT_SIZE / 2 + 2;
const CANDIDATES = [
  { side: 1, dy: 0 },
  { side: -1, dy: 0 },
  { side: 0, dy: -ABOVE_BELOW_DY },
  { side: 0, dy: ABOVE_BELOW_DY },
  { side: 1, dy: -LABEL_FONT_SIZE },
  { side: -1, dy: -LABEL_FONT_SIZE },
  { side: 1, dy: LABEL_FONT_SIZE },
  { side: -1, dy: LABEL_FONT_SIZE },
];

type Anchor = "start" | "middle" | "end";

interface Box {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

export interface LabelPlacement {
  term: string;
  x: number;
  y: number;
  anchor: Anchor;
  type: SeriesType;
}

export function placeLabels(
  projected: PlacedPoint[],
  plot: PlotArea,
): LabelPlacement[] {
  const dotBoxes = projected.map((p) => ({
    term: p.point.term,
    x1: p.cx - DOT_R,
    x2: p.cx + DOT_R,
    y1: p.cy - DOT_R,
    y2: p.cy + DOT_R,
  }));

  const ordered = [...projected].sort((a, b) => byMean(a.point, b.point));

  const placed: LabelPlacement[] = [];
  const taken: Box[] = [];

  for (const { point, cx, cy } of ordered) {
    const width = measureLabel(point.term, false);
    const boxes = CANDIDATES.map(({ side, dy }) => {
      const x = cx + side * (DOT_R + LABEL_GAP);
      const y = cy + dy;
      const x1 = side > 0 ? x : side < 0 ? x - width : x - width / 2;
      return {
        x,
        y,
        anchor: (side > 0 ? "start" : side < 0 ? "end" : "middle") as Anchor,
        x1,
        x2: x1 + width,
        y1: y - LABEL_FONT_SIZE / 2,
        y2: y + LABEL_FONT_SIZE / 2,
      };
    });

    const fits = (b: (typeof boxes)[number]) =>
      b.x1 >= plot.x &&
      b.x2 <= plot.x + plot.width &&
      b.y1 >= plot.y &&
      b.y2 <= plot.y + plot.height &&
      !taken.some((t) => overlaps(t, b)) &&
      !dotBoxes.some((d) => d.term !== point.term && overlaps(d, b));

    const box =
      boxes.find(fits) ??
      boxes.find((b) => !taken.some((t) => overlaps(t, b))) ??
      boxes[0];
    taken.push(box);
    placed.push({
      term: point.term,
      x: box.x,
      y: box.y,
      anchor: box.anchor,
      type: point.type,
    });
  }

  return placed;
}

const overlaps = (a: Box, b: Box) =>
  a.x1 - LABEL_PAD < b.x2 &&
  b.x1 - LABEL_PAD < a.x2 &&
  a.y1 - LABEL_PAD < b.y2 &&
  b.y1 - LABEL_PAD < a.y2;
