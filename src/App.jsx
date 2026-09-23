import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Alert,
  Typography,
  CssBaseline,
  ThemeProvider,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import TopBar from "./components/TopBar";
import CompareBar, { RAIL_WIDTH } from "./components/CompareBar";
import ChartArea from "./components/charts/ChartArea";
import ResultsTable from "./components/ResultsTable";
import DiachronicChart from "./components/DiachronicChart";
import TermOverviewChart from "./components/OverviewChart";
import {
  useBooks,
  useSemanticDrift,
  useParseDescribeQuery,
} from "./api/queries";
import { describeDriftError } from "./api/errors";
import useUrlState, { CHART_TABS } from "./hooks/useUrlState";
import { parseExpression } from "./utils/vectorExpressionParser";
import { labels } from "./content/labels";
import { theme } from "./theme";

const GuideModal = lazy(() => import("./components/GuideModal"));

const DIACHRONIC_TAB = "diachronic";
const tabId = (tab) => `chart-tab-${tab}`;
const CHART_PANEL_ID = "chart-panel";

const PANEL_GAP = 16;
const RAIL_LESS_CHART_SX = {
  maxWidth: { md: `calc(100% - ${RAIL_WIDTH + PANEL_GAP}px)` },
  mx: { md: "auto" },
};

export default function App() {
  const {
    expression,
    setExpression,
    chartTab,
    setChartTab,
    selectedBookId,
    setSelectedBookId,
  } = useUrlState();
  const parsedExpression = useMemo(
    () => parseExpression(expression),
    [expression],
  );

  const [guideOpen, setGuideOpen] = useState(true);

  const { data: allBooks = [], isSuccess: booksLoaded } = useBooks();

  const describeMutation = useParseDescribeQuery();

  const handleDescribeSubmit = async (message) => {
    const result = await describeMutation.mutateAsync(message);
    setExpression(result.expression);
    return result;
  };

  const allBookIds = useMemo(() => allBooks.map((b) => b.id), [allBooks]);

  const refBook = useMemo(
    () => allBooks.find((b) => String(b.id) === selectedBookId) ?? null,
    [allBooks, selectedBookId],
  );
  const pinnedBookId = refBook?.id ?? null;

  useEffect(() => {
    if (booksLoaded && selectedBookId && !refBook) setSelectedBookId(null);
  }, [booksLoaded, selectedBookId, refBook, setSelectedBookId]);

  const {
    payload: driftPayload,
    isLoading: driftLoading,
    error: driftError,
    queryLabel: driftQueryLabel,
  } = useSemanticDrift(allBookIds, parsedExpression, pinnedBookId);

  const missingBookIds = useMemo(() => {
    if (!driftPayload) return new Set();
    const returnedBookIds = new Set(
      driftPayload.expr.book_similarities.map((b) => b.book_id),
    );
    return new Set(
      allBookIds.filter(
        (id) => !returnedBookIds.has(id) && id !== pinnedBookId,
      ),
    );
  }, [allBookIds, driftPayload, pinnedBookId]);

  const driftAlert = useMemo(
    () =>
      driftError
        ? describeDriftError(driftError, {
            books: allBooks,
            refBook,
            queryLabel: driftQueryLabel,
          })
        : null,
    [driftError, allBooks, refBook, driftQueryLabel],
  );

  const expressionLabel = driftQueryLabel || "...";
  const heading =
    chartTab !== DIACHRONIC_TAB
      ? `Consistent and contested related terms to '${expressionLabel}'`
      : refBook
        ? `Adjusted similarity to '${expressionLabel}' in ${refBook.label} by text`
        : `Adjusted mean similarity to '${expressionLabel}' by text`;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <GitHubLink />
        <TopBar
          expression={expression}
          onExpressionChange={setExpression}
          onDescribeSubmit={handleDescribeSubmit}
          describeSubmitting={describeMutation.isPending}
          onHelpClick={() => setGuideOpen(true)}
        />

        <Container maxWidth="xl" sx={{ py: 3 }}>
          {driftAlert && (
            <Alert severity={driftAlert.severity} sx={{ mb: 2 }}>
              {driftAlert.message}
            </Alert>
          )}

          <Paper elevation={0} sx={{ borderRadius: 3, mb: 2 }}>
            <Tabs
              value={chartTab}
              onChange={(_, value) => setChartTab(value)}
              aria-label="Chart view"
              sx={{ px: 3, pt: 1, borderBottom: 1, borderColor: "divider" }}
            >
              {CHART_TABS.map((tab) => (
                <Tab
                  key={tab}
                  label={labels.chartTabs[tab]}
                  value={tab}
                  id={tabId(tab)}
                  aria-controls={CHART_PANEL_ID}
                />
              ))}
            </Tabs>

            <Box
              sx={{
                px: 3,
                pt: 3,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {heading}
              </Typography>
              <Typography
                component="a"
                href="#results-table"
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("results-table")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Table &rarr;
              </Typography>
            </Box>

            <Box
              role="tabpanel"
              id={CHART_PANEL_ID}
              aria-labelledby={tabId(chartTab)}
              sx={{
                p: 3,
                pt: 2,
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: `${PANEL_GAP}px`,
                alignItems: { xs: "stretch", md: "flex-start" },
              }}
            >
              {chartTab === DIACHRONIC_TAB && (
                <CompareBar
                  bookData={allBooks}
                  missingBookIds={missingBookIds}
                  selectedBookId={pinnedBookId}
                  setSelectedBookId={setSelectedBookId}
                />
              )}

              <ChartArea
                isLoading={driftLoading}
                term={expression.trim()}
                hasError={Boolean(driftAlert)}
                payload={driftPayload}
                sx={
                  chartTab !== DIACHRONIC_TAB ? RAIL_LESS_CHART_SX : undefined
                }
              >
                {chartTab === DIACHRONIC_TAB ? (
                  <DiachronicChart
                    payload={driftPayload}
                    term={expression.trim()}
                    allBooks={allBooks}
                  />
                ) : (
                  <TermOverviewChart
                    payload={driftPayload}
                    allBooks={allBooks}
                  />
                )}
              </ChartArea>
            </Box>
          </Paper>

          <Paper
            id="results-table"
            elevation={0}
            sx={{ p: 3, borderRadius: 3 }}
          >
            <ResultsTable payload={driftPayload} allBooks={allBooks} />
          </Paper>
        </Container>

        <Suspense fallback={null}>
          <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
        </Suspense>
      </Box>
    </ThemeProvider>
  );
}

function GitHubLink() {
  return (
    <IconButton
      component="a"
      href="https://github.com/areebms/embedding-analytics"
      target="_blank"
      rel="noopener noreferrer"
      size="small"
      sx={{
        position: "fixed",
        bottom: 10,
        right: 10,
        color: "black",
        "& svg": { fontSize: 50 },
        zIndex: 1300,
      }}
    >
      <GitHubIcon />
    </IconButton>
  );
}
