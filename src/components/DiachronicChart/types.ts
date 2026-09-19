interface TermValue {
  agreement: number;
}

export interface ChartRow {
  year: number;
  bookId: number;
  book: string;
  values: Record<string, TermValue>;
}

export interface ChartModel {
  chartData: ChartRow[];
  xDomain: [number, number];
  yMin: number;
  yMax: number;
  xTicks: number[];
  yTicks: number[];
}

export interface LabelAnchor {
  y: number;
  height: number;
  rank: number;
}
