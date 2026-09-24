export interface ChartRow {
  year: number;
  book: string;
  values: Record<string, number>;
}

export interface ChartModel {
  chartData: ChartRow[];
  xDomain: [number, number];
  yDomain: [number, number];
  xTicks: number[];
  yTicks: number[];
}

export interface LabelAnchor {
  y: number;
  height: number;
  rank: number;
}
