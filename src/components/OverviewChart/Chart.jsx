import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Label,
} from "recharts";

import { ChartEmpty } from "../charts/ChartArea";
import { INK } from "../charts/palette";
import { buildSeries } from "../charts/series";
import {
  CHART_HEIGHT,
  CHART_MARGIN,
  X_AXIS,
  Y_AXIS,
} from "../charts/layout";
import { buildScatterModel } from "./model";
import { ScatterDot, ScatterTooltip, HoverSurface, PointLabels } from "./marks";
import { labels } from "../../content/labels";

const SCATTER_MARGIN = { ...CHART_MARGIN, top: 16, right: 32 };

export default function TermOverviewChart({ payload, allBooks }) {
  const [hovered, setHovered] = useState(null);

  const { series } = useMemo(
    () => buildSeries(payload, allBooks),
    [payload, allBooks],
  );

  const { points, xDomain, yDomain, xTicks, yTicks, xDecimals, yDecimals } =
    useMemo(() => buildScatterModel(series), [series]);

  if (!points.length) return <ChartEmpty message={labels.scatter.empty} />;

  const crossesZero = xDomain[0] < 0 && xDomain[1] > 0;

  return (
    <Box
      sx={{ position: "relative", width: "100%" }}
      onMouseLeave={() => setHovered(null)}
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <ScatterChart margin={SCATTER_MARGIN}>
          <CartesianGrid stroke={INK.grid} strokeDasharray="3 3" />
          <XAxis
            {...X_AXIS.props}
            dataKey={(p) => p.overall.similarity_mean}
            domain={xDomain}
            ticks={xTicks}
            tickFormatter={(v) => v.toFixed(xDecimals)}
          >
            <Label value={labels.scatter.axes.consistent} {...X_AXIS.title} />
          </XAxis>
          <YAxis
            {...Y_AXIS.props}
            dataKey={(p) => p.overall.similarity_std}
            domain={yDomain}
            ticks={yTicks}
            tickFormatter={(v) => v.toFixed(yDecimals)}
          >
            <Label value={labels.scatter.axes.contested} {...Y_AXIS.title} />
          </YAxis>

          {crossesZero && (
            <ReferenceLine x={0} stroke={INK.axis} strokeWidth={1} />
          )}

          <Scatter
            data={points}
            isAnimationActive={false}
            shape={ScatterDot}
          />

          <PointLabels points={points} />
          <HoverSurface points={points} onHover={setHovered} />
        </ScatterChart>
      </ResponsiveContainer>
      {hovered && (
        <ScatterTooltip
          point={hovered.point}
          cx={hovered.cx}
          cy={hovered.cy}
        />
      )}
    </Box>
  );
}
