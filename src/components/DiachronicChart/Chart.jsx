import { useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ErrorBar,
  Tooltip,
  Label,
} from "recharts";

import ChartMessage, { ChartSpinner } from "./ChartMessage";
import { INK } from "./palette";
import { buildDiachronicSeries, buildChartModel, isDrawn } from "./series";
import { SeriesDot, DotTooltip, SeriesLabels } from "./marks";
import { labels } from "../../content/labels";
import {
  CHART_HEIGHT,
  CHART_MARGIN,
  Y_AXIS_WIDTH,
  AXIS_LABEL_SIZE,
  TICK_LABEL_SIZE,
  QUERY_DOT_R,
  NEIGHBOUR_DOT_R,
  QUERY_STROKE_W,
  NEIGHBOUR_STROKE_W,
  Y_AXIS_PAD,
  X_AXIS_PAD_RIGHT,
  LABEL_GAP_X,
  labelColumnWidth,
} from "./layout";

const AXIS_TITLE_STYLE = {
  textAnchor: "middle",
  fill: INK.title,
  fontWeight: 600,
  fontSize: AXIS_LABEL_SIZE,
};

const formatTick = (v) => v.toFixed(2);

const X_AXIS_TITLE = (
  <Label
    value="Publication year"
    position="insideBottom"
    offset={-2}
    style={AXIS_TITLE_STYLE}
  />
);

export default function DiachronicChart({
  payload,
  refBook,
  term,
  isLoading,
  hasError,
  allBooks,
  ranking,
}) {
  const [activeTerm, setActiveTerm] = useState(null);

  const { series: allSeries, roster } = useMemo(
    () => buildDiachronicSeries(payload, allBooks, refBook, ranking),
    [payload, allBooks, refBook, ranking],
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
        series.map((s) => [
          s.term,
          {
            agreement: (row) => row.values[s.term]?.agreement,
            band: (row) => row.values[s.term]?.band,
            ci: (row) => row.values[s.term]?.ci,
          },
        ]),
      ),
    [series],
  );

  if (isLoading) return <ChartSpinner />;

  if (!series.length) {
    return (
      <ChartMessage height={CHART_HEIGHT}>
        <Typography variant="body1" color="text.secondary" align="center">
          {emptyStateMessage({ term, hasError, payload })}
        </Typography>
      </ChartMessage>
    );
  }

  const yTitle = refBook
    ? labels.agreement.pinned(refBook.label)
    : labels.agreement.label;
  const querySeries = series.find((s) => s.isQuery);
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
            type="number"
            dataKey="year"
            domain={xDomain}
            ticks={xTicks}
            niceTicks="none"
            padding={{
              left: labelColumn + LABEL_GAP_X,
              right: X_AXIS_PAD_RIGHT,
            }}
            allowDecimals={false}
            height={38}
            tick={{ fontSize: TICK_LABEL_SIZE, fill: INK.tick }}
            axisLine={{ stroke: INK.axis }}
            tickLine={{ stroke: INK.axis }}
          >
            {X_AXIS_TITLE}
          </XAxis>
          <YAxis
            type="number"
            domain={[yMin, yMax]}
            padding={{ top: Y_AXIS_PAD, bottom: Y_AXIS_PAD }}
            ticks={yTicks}
            niceTicks="none"
            tickFormatter={formatTick}
            width={Y_AXIS_WIDTH}
            tick={{
              fontSize: TICK_LABEL_SIZE,
              fill: INK.tick,
              fontVariantNumeric: "tabular-nums",
            }}
            axisLine={{ stroke: INK.axis }}
            tickLine={{ stroke: INK.axis }}
          >
            <Label
              value={yTitle}
              angle={-90}
              position="insideLeft"
              style={AXIS_TITLE_STYLE}
            />
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

          {querySeries && (
            <Area
              type="linear"
              dataKey={accessors.get(querySeries.term).band}
              stroke="none"
              fill={querySeries.color}
              fillOpacity={0.15}
              connectNulls={false}
              isAnimationActive={false}
              activeDot={false}
              tooltipType="none"
            />
          )}

          {series.map((s) => {
            const revealed = s.isQuery || activeTerm === s.term;
            return (
              <Line
                key={s.term}
                type="linear"
                dataKey={accessors.get(s.term).agreement}
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
              >
                {!s.isQuery && revealed && (
                  <ErrorBar
                    dataKey={accessors.get(s.term).ci}
                    direction="y"
                    width={4}
                    strokeWidth={1}
                    stroke={s.color}
                    strokeOpacity={0.45}
                  />
                )}
              </Line>
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
  if (!payload?.books?.length) return "No books to compare.";
  return `'${term}' could not be compared across books.`;
}
