import { generateLinearTicks } from "../charts/layout";
import type { BookResponse } from "../../types/api";
import type { Series } from "../charts/types";
import type { ChartModel, ChartRow } from "./types";

const MIN_Y_SPAN = 0.04;

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

  const agreements = allPoints.map((d) => d.agreement);
  const years = chartData.map((r) => r.year);
  const yearMin = Math.min(...years);
  const yearMax = Math.max(...years);
  const agreementMin = Math.min(...agreements);
  const agreementMax = Math.max(...agreements);

  let [yMin, yMax] = [Math.max(-1, agreementMin), Math.min(1, agreementMax)];
  if (yMax - yMin < MIN_Y_SPAN) {
    const mid = (yMin + yMax) / 2;
    [yMin, yMax] = [
      Math.max(-1, mid - MIN_Y_SPAN / 2),
      Math.min(1, mid + MIN_Y_SPAN / 2),
    ];
  }

  const rowByBookId = new Map(chartData.map((row) => [row.bookId, row]));

  for (const s of series) {
    for (const p of s.points) {
      const row = rowByBookId.get(p.id);
      if (!row) continue;
      row.values[s.term] = { agreement: p.agreement };
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
