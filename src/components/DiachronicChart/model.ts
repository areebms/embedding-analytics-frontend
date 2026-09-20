import { generateLinearTicks } from "../charts/layout";
import type { BookResponse } from "../../types/api";
import type { Series } from "../charts/types";
import type { ChartModel, ChartRow } from "./types";

const MIN_Y_SPAN = 1.00;

export function buildChartModel(
  series: Series[],
  roster: BookResponse[],
): ChartModel {
  const allPoints = series.flatMap((s) => s.points);
  if (!allPoints.length || !roster.length) return EMPTY_MODEL;

  const chartData: ChartRow[] = roster.map((book) => ({
    year: book.published_year,
    bookId: book.id,
    book: book.label,
    values: {},
  }));

  const similarities = allPoints.map((d) => d.similarity);
  const years = chartData.map((r) => r.year);
  const yearMin = Math.min(...years);
  const yearMax = Math.max(...years);
  const similarityMin = Math.min(...similarities);
  const similarityMax = Math.max(...similarities);

  // Not clamped to [-1, 1]: an adjusted cosine is shifted by its book's
  // baseline, so it can land just outside the cosine range.
  let [yMin, yMax] = [similarityMin, similarityMax];
  if (yMax - yMin < MIN_Y_SPAN) {
    const mid = (yMin + yMax) / 2;
    [yMin, yMax] = [mid - MIN_Y_SPAN / 2, mid + MIN_Y_SPAN / 2];
  }

  const rowByBookId = new Map(chartData.map((row) => [row.bookId, row]));

  for (const s of series) {
    for (const p of s.points) {
      const row = rowByBookId.get(p.id);
      if (!row) continue;
      row.values[s.term] = { similarity: p.similarity };
    }
  }

  return {
    chartData,
    xDomain: [yearMin, yearMax],
    yMin,
    yMax,
    xTicks: generateYearTicks(yearMin, yearMax),
    yTicks: generateLinearTicks(yMin, yMax),
  };
}

const EMPTY_MODEL: ChartModel = {
  chartData: [],
  xDomain: [0, 1],
  yMin: 0,
  yMax: 1,
  xTicks: [],
  yTicks: [],
};

function generateYearTicks(min: number, max: number): number[] {
  const span = max - min;
  const step = span > 200 ? 50 : span > 100 ? 25 : span > 50 ? 10 : 5;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= max; t += step) ticks.push(t);
  return ticks;
}
