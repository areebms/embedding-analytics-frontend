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
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import TopBar from "./components/TopBar";
import CompareBar from "./components/CompareBar";
import ChartArea from "./components/charts/ChartArea";
import ResultsTable from "./components/ResultsTable";
import DiachronicChart from "./components/DiachronicChart";
import {
  useBooks,
  useSemanticDrift,
  useParseDescribeQuery,
} from "./api/queries";
import { describeDriftError } from "./api/errors";
import useUrlState from "./hooks/useUrlState";
import { parseExpression } from "./utils/vectorExpressionParser";
import { theme } from "./theme";

const GuideModal = lazy(() => import("./components/GuideModal"));

export default function App() {
  const {
    expression,
    setExpression,
    selectedBookId,
    setSelectedBookId,
  } = useUrlState();
  const parsedExpression = useMemo(
    () => parseExpression(expression),
    [expression],
  );

  const [guideOpen, setGuideOpen] = useState(null);

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
    const measured = new Set(
      driftPayload.expr.book_similarities.map((b) => b.book_id),
    );
    return new Set(
      allBookIds.filter((id) => !measured.has(id) && id !== pinnedBookId),
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
  const heading = refBook
    ? `Comparing to the definition of '${expressionLabel}' in ${refBook.label}`
    : `How much do the authors agree on the corpus definition of '${expressionLabel}'?`;

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

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              alignItems: { xs: "stretch", md: "flex-start" },
              mb: 2,
            }}
          >
            <CompareBar
              bookData={allBooks}
              missingBookIds={missingBookIds}
              selectedBookId={pinnedBookId}
              setSelectedBookId={setSelectedBookId}
            />

            <Paper elevation={0} sx={{ flex: 1, minWidth: 0, borderRadius: 3 }}>
              <Box sx={{ p: 3 }}>
                <ChartArea
                  isLoading={driftLoading}
                  term={expression.trim()}
                  hasError={Boolean(driftAlert)}
                  payload={driftPayload}
                >
                  <DiachronicChart
                    payload={driftPayload}
                    refBook={refBook}
                    term={expression.trim()}
                    allBooks={allBooks}
                  />
                </ChartArea>
              </Box>
            </Paper>
          </Box>

          <Paper
            id="results-table"
            elevation={0}
            sx={{ p: 3, borderRadius: 3 }}
          >
            <ResultsTable payload={driftPayload} allBooks={allBooks} />
          </Paper>
        </Container>

        {guideOpen !== null && (
          <Suspense fallback={null}>
            <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
          </Suspense>
        )}
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
