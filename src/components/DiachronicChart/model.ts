import { generateLinearTicks } from "../charts/layout";
import type { BookResponse } from "../../types/api";
import type { Series } from "../charts/types";
import type { ChartModel, ChartRow } from "./types";

const MIN_Y_SPAN = 1.00;

export function buildChartModel(
  series: Series[],
  roster: BookResponse[],
): ChartModel {
  const similarities = series
    .flatMap((s) => s.byText)
    .map((t) => t.similarity)
    .filter((v) => v !== undefined);
  if (!similarities.length || !roster.length) return EMPTY_MODEL;

  const chartData: ChartRow[] = roster.map((book) => ({
    year: book.published_year,
    book: book.label,
    values: {},
  }));

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

  for (const s of series) {
    s.byText.forEach(({ similarity }, i) => {
      if (similarity !== undefined) chartData[i].values[s.term] = similarity;
    });
  }

  return {
    chartData,
    xDomain: [yearMin, yearMax],
    yDomain: [yMin, yMax],
    xTicks: generateYearTicks(yearMin, yearMax),
    yTicks: generateLinearTicks(yMin, yMax),
  };
}

const EMPTY_MODEL: ChartModel = {
  chartData: [],
  xDomain: [0, 1],
  yDomain: [0, 1],
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
