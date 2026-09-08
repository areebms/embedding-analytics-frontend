import { useMemo } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import { buildDiachronicSeries, isDrawn } from "./DiachronicChart/series";
import { QUERY_STROKE_W, NEIGHBOUR_STROKE_W } from "./DiachronicChart/layout";
import { labels } from "../content/labels";
import { TERM_RANKINGS } from "../types/api";

export default function ResultsTable({ payload, allBooks, ranking }) {
  const { series, roster } = useMemo(
    () => buildDiachronicSeries(payload, allBooks, null, ranking),
    [payload, allBooks, ranking],
  );

  if (!series.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, px: 1 }}>
        Nothing to tabulate yet.
      </Typography>
    );
  }

  const rows = series.filter(isDrawn).sort((a, b) => a.rank - b.rank);

  return (
    <TableContainer>
      <Table size="small" sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell rowSpan={2} sx={{ ...HEAD, ...CELL }}>
              Expression
            </TableCell>
            <TableCell rowSpan={2} align="right" sx={{ ...HEAD, ...CELL }}>
              <HelpLabel {...labels.columns[ranking]} />
            </TableCell>
            <TableCell
              colSpan={roster.length}
              align="center"
              sx={{ ...HEAD, ...CELL }}
            >
              {labels.booksGroup}
            </TableCell>
          </TableRow>
          <TableRow>
            {roster.map((b) => (
              <TableCell key={b.id} align="right" sx={{ ...HEAD, ...CELL }}>
                {b.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((s) => {
            const byBook = new Map(s.points.map((p) => [p.id, p]));
            const gapByBook = new Map(s.gaps.map((g) => [g.id, g]));
            return (
              <TableRow key={s.term} hover>
                <TableCell sx={CELL}>
                  <TermCell series={s} ranking={ranking} />
                </TableCell>
                <TableCell align="right" sx={CELL}>
                  <RankStatCell stats={s.stats} stat={ranking} />
                </TableCell>
                {roster.map((b) => {
                  const p = byBook.get(b.id);
                  const gap = gapByBook.get(b.id);
                  return (
                    <TableCell key={b.id} align="right" sx={CELL}>
                      {p ? (
                        <MeasurementValue point={p} />
                      ) : gap ? (
                        <GapText
                          cause={gap.cause}
                          missingTerms={gap.missingTerms}
                        />
                      ) : (
                        <Dash />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const SWATCH_MIN_H = 2;

function SeriesSwatch({ color, isQuery }) {
  return (
    <Box
      sx={{
        width: 14,
        height: Math.max(
          SWATCH_MIN_H,
          isQuery ? QUERY_STROKE_W : NEIGHBOUR_STROKE_W,
        ),
        bgcolor: color,
        borderRadius: 1,
        flex: "0 0 auto",
      }}
    />
  );
}

// Only the sorted-on statistic gets a column, so the other one has nowhere else
// to appear. It goes here rather than being dropped: the two are read against
// each other -- a term can be stable and still be the one the books disagree
// about -- and losing half that comparison to a dropdown toggle costs more than
// a tooltip line.
function TermCell({ series, ranking }) {
  const term = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <SeriesSwatch color={series.color} isQuery={series.isQuery} />
      <Typography
        variant="body2"
        sx={{ fontWeight: series.isQuery ? 700 : 500 }}
      >
        {series.term}
      </Typography>
    </Box>
  );

  if (!series.stats) return term;

  const { n_books_in } = series.stats;
  const others = TERM_RANKINGS.filter((r) => r !== ranking);
  return (
    <Tooltip
      title={
        others
          .map((r) => `${labels.columns[r].short} ${series.stats[r].toFixed(3)}`)
          .join(" · ") +
        ` · measured across the ${n_books_in} ` +
        `book${n_books_in === 1 ? "" : "s"} that use it.`
      }
    >
      <Box sx={{ cursor: "help", display: "inline-block" }}>{term}</Box>
    </Tooltip>
  );
}

function RankStatCell({ stats, stat }) {
  if (!stats) return <Dash />;
  return (
    <Typography variant="body2" sx={NUM}>
      {stats[stat].toFixed(3)}
    </Typography>
  );
}

function MeasurementValue({ point }) {
  const value = (
    <Typography variant="body2" sx={NUM}>
      {point.agreement.toFixed(3)}
    </Typography>
  );
  if (!point.measurement) return value;

  const { occurrences } = point.measurement;
  return (
    <Tooltip
      title={
        <Box sx={{ fontVariantNumeric: "tabular-nums" }}>
          {occurrences.toLocaleString()} uses
        </Box>
      }
    >
      <Box sx={{ cursor: "help", display: "inline-block" }}>{value}</Box>
    </Tooltip>
  );
}

// The dotted underline is the only thing marking a cell as hoverable, so it
// and the tooltip stay in one place -- a column header and an empty cell are
// both making the same promise to the reader.
function Hint({ title, children, ...props }) {
  return (
    <Tooltip title={title}>
      <Box component="span" sx={HELP} {...props}>
        {children}
      </Box>
    </Tooltip>
  );
}

function GapText({ cause, missingTerms }) {
  const copy = labels.gaps[cause];
  return (
    <Hint
      title={`${copy.short} — ${copy.detail(missingTerms)}`}
      color="text.disabled"
    >
      {DASH}
    </Hint>
  );
}

function HelpLabel({ short, help }) {
  return <Hint title={help}>{short}</Hint>;
}

const Dash = () => (
  <Typography variant="body2" color="text.disabled">
    {DASH}
  </Typography>
);

const DASH = "\u2014";
const HELP = { cursor: "help", borderBottom: "1px dotted currentColor" };
const HEAD = { fontWeight: 700 };
const NUM = { fontVariantNumeric: "tabular-nums" };
const CELL = { py: 0.5 };
