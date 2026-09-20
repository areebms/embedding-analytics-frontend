import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
} from "recharts";

import { ChartEmpty, ChartSpinner } from "../charts/ChartArea";
import { INK } from "../charts/palette";
import { buildSeries, isDrawn } from "../charts/series";
import {
  CHART_HEIGHT,
  CHART_MARGIN,
  X_AXIS,
  Y_AXIS,
} from "../charts/layout";
import { buildChartModel } from "./model";
import { SeriesDot, DotTooltip, SeriesLabels } from "./marks";
import { labels } from "../../content/labels";
import {
  QUERY_DOT_R,
  NEIGHBOUR_DOT_R,
  QUERY_STROKE_W,
  NEIGHBOUR_STROKE_W,
  Y_AXIS_PAD,
  X_AXIS_PAD_RIGHT,
  LABEL_GAP_X,
  labelColumnWidth,
} from "./layout";

const formatTick = (v) => v.toFixed(2);

const X_AXIS_TITLE = <Label value="Publication year" {...X_AXIS.title} />;

export default function DiachronicChart({
  payload,
  term,
  isLoading,
  hasError,
  allBooks,
  ranking,
}) {
  const [activeTerm, setActiveTerm] = useState(null);

  const { series: allSeries, roster } = useMemo(
    () => buildSeries(payload, allBooks, ranking),
    [payload, allBooks, ranking],
  );

  const series = useMemo(() => allSeries.filter(isDrawn), [allSeries]);

  const { chartData, xDomain, yMin, yMax, xTicks, yTicks } = useMemo(
    () => buildChartModel(series, roster),
    [series, roster],
  );

  const labelColumn = useMemo(() => labelColumnWidth(series), [series]);

  const accessors = useMemo(
    () =>
      new Map(
        series.map((s) => [s.term, (row) => row.values[s.term]?.similarity]),
      ),
    [series],
  );

  if (isLoading) return <ChartSpinner />;

  if (!series.length) {
    return (
      <ChartEmpty message={emptyStateMessage({ term, hasError, payload })} />
    );
  }

  const yTitle = labels.similarity.label;
  const activeSeries = series.find((s) => s.term === activeTerm);

  return (
    <Box sx={{ width: "100%" }}>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <ComposedChart data={chartData} margin={CHART_MARGIN}>
          <CartesianGrid
            vertical={false}
            stroke={INK.grid}
            strokeDasharray="3 3"
          />
          <XAxis
            {...X_AXIS.props}
            dataKey="year"
            domain={xDomain}
            ticks={xTicks}
            padding={{
              left: labelColumn + LABEL_GAP_X,
              right: X_AXIS_PAD_RIGHT,
            }}
            allowDecimals={false}
          >
            {X_AXIS_TITLE}
          </XAxis>
          <YAxis
            {...Y_AXIS.props}
            domain={[yMin, yMax]}
            padding={{ top: Y_AXIS_PAD, bottom: Y_AXIS_PAD }}
            ticks={yTicks}
            tickFormatter={formatTick}
          >
            <Label value={yTitle} {...Y_AXIS.title} />
          </YAxis>

          <Tooltip
            cursor={false}
            isAnimationActive={false}
            content={
              <DotTooltip
                activeTerm={activeTerm}
                color={activeSeries?.color}
                measure={yTitle}
              />
            }
          />

          {series.map((s) => {
            const revealed = s.isQuery || activeTerm === s.term;
            return (
              <Line
                key={s.term}
                type="linear"
                dataKey={accessors.get(s.term)}
                name={s.term}
                stroke={s.color}
                strokeWidth={s.isQuery ? QUERY_STROKE_W : NEIGHBOUR_STROKE_W}
                strokeOpacity={revealed ? 1 : 0}
                connectNulls={false}
                isAnimationActive={false}
                activeDot={false}
                dot={(props) => (
                  <SeriesDot
                    {...props}
                    color={s.color}
                    r={s.isQuery ? QUERY_DOT_R : NEIGHBOUR_DOT_R}
                    onEnter={() => setActiveTerm(s.term)}
                    onLeave={() => setActiveTerm(null)}
                  />
                )}
              />
            );
          })}

          <SeriesLabels
            series={series}
            width={labelColumn}
            onHover={setActiveTerm}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
}

function emptyStateMessage({ term, hasError, payload }) {
  if (!term) return "Select a term to plot.";
  if (hasError) return "Nothing to plot.";
  if (!payload?.book_stats?.length) return "No books to compare.";
  return `'${term}' could not be compared across books.`;
}
