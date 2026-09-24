import { lazy, Suspense } from "react";

import { ChartSpinner } from "../charts/ChartArea";

const Chart = lazy(() => import("./Chart"));

export default function TermOverviewChart(props) {
  return (
    <Suspense fallback={<ChartSpinner />}>
      <Chart {...props} />
    </Suspense>
  );
}
