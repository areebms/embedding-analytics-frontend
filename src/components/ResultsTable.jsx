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
import { buildSeries, isQuery } from "./charts/series";
import { TERM_TYPE_COLOR } from "./charts/palette";
import { QUERY_STROKE_W, NEIGHBOUR_STROKE_W } from "./DiachronicChart/layout";
import { labels } from "../content/labels";
import { TERM_TYPES, TERM_TYPE_STAT } from "../types/api";

export default function ResultsTable({ payload, allBooks }) {
  const { series, roster } = useMemo(
    () => buildSeries(payload, allBooks),
    [payload, allBooks],
  );
  const missingById = useMemo(
    () =>
      new Map(
        (payload?.book_stats ?? []).map((b) => [b.id, b.missing_terms ?? []]),
      ),
    [payload],
  );

  if (!series.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, px: 1 }}>
        Nothing to tabulate yet.
      </Typography>
    );
  }

  const rows = [...series].sort(byTypeThenRank);

  return (
    <TableContainer>
      <Table size="small" sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell rowSpan={2} sx={{ ...HEAD, ...CELL }}>
              Term
            </TableCell>
            {TERM_TYPES.map((r) => (
              <TableCell
                key={r}
                rowSpan={2}
                align="right"
                sx={{ ...HEAD, ...CELL }}
              >
                <HelpLabel {...labels.columns[r]} />
              </TableCell>
            ))}
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
            const terms = isQuery(s) ? payload.expr.terms : [s.term];
            return (
              <TableRow key={s.term} hover>
                <TableCell sx={CELL}>
                  <TermCell series={s} />
                </TableCell>
                {TERM_TYPES.map((r) => (
                  <TableCell key={r} align="right" sx={CELL}>
                    <StatCell overall={s.overall} stat={r} />
                  </TableCell>
                ))}
                {s.byText.map((text) => {
                  const missing = missingById.get(text.id) ?? [];
                  return (
                    <TableCell key={text.id} align="right" sx={CELL}>
                      {text.similarity !== undefined ? (
                        <MeasurementValue point={text} />
                      ) : (
                        <GapText
                          missingTerms={terms.filter((t) =>
                            missing.includes(t),
                          )}
                        />
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

// Query first, then each type's terms in the backend's order.
const byTypeThenRank = (a, b) =>
  isQuery(b) - isQuery(a) ||
  TERM_TYPES.indexOf(a.type) - TERM_TYPES.indexOf(b.type) ||
  a.rank - b.rank;

const SWATCH_MIN_H = 2;

function SeriesSwatch({ color, query }) {
  return (
    <Box
      sx={{
        width: 14,
        height: Math.max(
          SWATCH_MIN_H,
          query ? QUERY_STROKE_W : NEIGHBOUR_STROKE_W,
        ),
        bgcolor: color,
        borderRadius: 1,
        flex: "0 0 auto",
      }}
    />
  );
}

function TermCell({ series }) {
  const color = TERM_TYPE_COLOR[series.type];
  const term = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <SeriesSwatch color={color} query={isQuery(series)} />
      <Typography
        variant="body2"
        sx={{ fontWeight: isQuery(series) ? 700 : 500, color }}
      >
        {series.term}
      </Typography>
    </Box>
  );

  if (!series.overall) return term;

  const { n_books_in } = series.overall;
  return (
    <Tooltip
      title={`Measured in ${n_books_in} book${n_books_in === 1 ? "" : "s"}`}
    >
      <Box sx={{ cursor: "help", display: "inline-block" }}>{term}</Box>
    </Tooltip>
  );
}

function StatCell({ overall, stat }) {
  if (!overall) return <Dash />;
  return (
    <Typography variant="body2" sx={NUM}>
      {overall[TERM_TYPE_STAT[stat]].toFixed(3)}
    </Typography>
  );
}

function MeasurementValue({ point }) {
  return (
    <Tooltip
      title={
        <Box sx={{ fontVariantNumeric: "tabular-nums" }}>
          {point.occurrences.toLocaleString()} uses
        </Box>
      }
    >
      <Box sx={{ cursor: "help", display: "inline-block" }}>
        <Typography variant="body2" sx={NUM}>
          {point.similarity.toFixed(3)}
        </Typography>
      </Box>
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

function GapText({ missingTerms }) {
  const copy = labels.gap;
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
