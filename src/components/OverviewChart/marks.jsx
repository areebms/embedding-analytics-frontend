import { useMemo } from "react";
import { Text, usePlotArea, useXAxisScale, useYAxisScale } from "recharts";

import { TERM_TYPE_COLOR } from "../charts/palette";
import {
  LABEL_FONT_SIZE,
  NEIGHBOUR_TERM_WEIGHT,
  TERM_LABEL_HALO,
} from "../charts/layout";
import { TooltipCard, TooltipTitle, TooltipRow } from "../charts/tooltip";
import { labels } from "../../content/labels";
import { dotSpec, DOT_R, project, placeLabels } from "./model";

export function ScatterDot({ cx, cy, payload }) {
  if (cx == null || cy == null || !payload) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      {...dotSpec(TERM_TYPE_COLOR[payload.type])}
      style={{ pointerEvents: "none" }}
    />
  );
}

const HIT_RADIUS = 16;

export function HoverSurface({ points, onHover }) {
  const plot = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();

  const geometry = useMemo(
    () => (xScale && yScale ? project(points, xScale, yScale) : []),
    [points, xScale, yScale],
  );

  if (!plot) return null;

  const onMouseMove = (event) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const box = svg.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;

    let best = null;
    let bestDistance = HIT_RADIUS * HIT_RADIUS;
    for (const g of geometry) {
      const d = (g.cx - x) ** 2 + (g.cy - y) ** 2;
      if (d <= bestDistance) {
        best = g;
        bestDistance = d;
      }
    }
    onHover(best);
  };

  return (
    <rect
      x={plot.x}
      y={plot.y}
      width={plot.width}
      height={plot.height}
      fill="transparent"
      pointerEvents="all"
      onMouseMove={onMouseMove}
      onMouseLeave={() => onHover(null)}
    />
  );
}

const TOOLTIP_GAP = 8;
const FLIP_BELOW_ABOVE_Y = 90;

export function ScatterTooltip({ point, cx, cy }) {
  if (!point) return null;
  const below = cy < FLIP_BELOW_ABOVE_Y;
  return (
    <TooltipCard
      sx={{
        position: "absolute",
        left: cx,
        top: below
          ? cy + DOT_R + TOOLTIP_GAP
          : cy - DOT_R - TOOLTIP_GAP,
        transform: below ? "translate(-50%, 0)" : "translate(-50%, -100%)",
        zIndex: 1,
      }}
    >
      <TooltipTitle>{point.term}</TooltipTitle>
      <TooltipRow
        marker={TERM_TYPE_COLOR[point.type]}
        label={labels.columns.consistent.short}
      >
        {point.overall.similarity_mean.toFixed(3)}
      </TooltipRow>
      <TooltipRow label={labels.columns.contested.short} indent>
        {point.overall.similarity_std.toFixed(3)}
      </TooltipRow>
      <div style={{ fontSize: 11, marginTop: 4, opacity: 0.75 }}>
        {labels.scatter.pointBooks(point.overall.n_books_in)}
      </div>
    </TooltipCard>
  );
}

export function PointLabels({ points }) {
  const plot = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();

  const placed = useMemo(
    () =>
      plot && xScale && yScale
        ? placeLabels(project(points, xScale, yScale), plot)
        : null,
    [points, plot, xScale, yScale],
  );

  if (!placed) return null;

  return (
    <g className="term-overview-labels" pointerEvents="none">
      {placed.map((p) => (
        <Text
          key={p.term}
          x={p.x}
          y={p.y}
          textAnchor={p.anchor}
          verticalAnchor="middle"
          fontSize={LABEL_FONT_SIZE}
          fontWeight={NEIGHBOUR_TERM_WEIGHT}
          fill={TERM_TYPE_COLOR[p.type]}
          {...TERM_LABEL_HALO}
        >
          {p.term}
        </Text>
      ))}
    </g>
  );
}
