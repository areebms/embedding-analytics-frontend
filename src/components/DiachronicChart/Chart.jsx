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

import { ChartEmpty } from "../charts/ChartArea";
import { INK, TERM_TYPE_COLOR } from "../charts/palette";
import { buildSeries, isQuery } from "../charts/series";
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

export default function DiachronicChart({ payload, term, allBooks }) {
  const [activeTerm, setActiveTerm] = useState(null);

  const { series, roster } = useMemo(
    () => buildSeries(payload, allBooks),
    [payload, allBooks],
  );

  const { chartData, xDomain, yDomain, xTicks, yTicks } = useMemo(
    () => buildChartModel(series, roster),
    [series, roster],
  );

  const labelColumn = useMemo(() => labelColumnWidth(series), [series]);

  const accessors = useMemo(
    () =>
      new Map(
        series.map((s) => [s.term, (row) => row.values[s.term]]),
      ),
    [series],
  );

  if (!series.length) {
    return <ChartEmpty message={labels.diachronic.empty(term)} />;
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
            <Label value="Publication year" {...X_AXIS.title} />
          </XAxis>
          <YAxis
            {...Y_AXIS.props}
            domain={yDomain}
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
                color={activeSeries && TERM_TYPE_COLOR[activeSeries.type]}
                measure={yTitle}
              />
            }
          />

          {series.map((s) => {
            const emphasised = isQuery(s) || activeTerm === s.term;
            const color = TERM_TYPE_COLOR[s.type];
            return (
              <Line
                key={s.term}
                type="linear"
                dataKey={accessors.get(s.term)}
                name={s.term}
                stroke={color}
                strokeWidth={isQuery(s) ? QUERY_STROKE_W : NEIGHBOUR_STROKE_W}
                strokeOpacity={emphasised ? 1 : 0}
                connectNulls
                isAnimationActive={false}
                activeDot={false}
                dot={(props) => (
                  <SeriesDot
                    {...props}
                    color={color}
                    r={isQuery(s) ? QUERY_DOT_R : NEIGHBOUR_DOT_R}
                    faded={!emphasised}
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
