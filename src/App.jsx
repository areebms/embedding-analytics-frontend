import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Alert,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import TopBar from "./components/TopBar";
import SimilarityScatterChart from "./components/SimilarityScatterChart";
import ResultsTable from "./components/ResultsTable";

// ============================================================================
// Theme Configuration
// ============================================================================

const theme = createTheme({
  palette: {
    primary: {
      main: "#4e79a7",
    },
    secondary: {
      main: "#e15759",
    },
    background: {
      default: "#f6f7fb",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
});

// ============================================================================
// Constants
// ============================================================================

const API_BASE_URL = "http://127.0.0.1:8000";

export default function App() {
  // Search and filtering state
  const [term, setTerm] = useState("market");
  const [selectedBookIds, setSelectedBookIds] = useState([3300]);
  const [selectedBookId, setSelectedBookId] = useState(null);

  const [topN, setTopN] = useState(25);
  const [rankBy, setRankBy] = useState("max"); // max | min

  // Data state
  const [allBooks, setAllBooks] = useState([]);
  const [calculatedRowData, setCalculatedRowData] = useState([]);
  const [bookCalculationStats, setBookCalculationStats] = useState({});
  const [rowsError, setRowsError] = useState(null);
  const [similarityCache, setSimilarityCache] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch all available books on component mount
   */
  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    setSimilarityCache({});
    setSelectedBookIds([3300]);
    setCalculatedRowData([]);
  }, [term]);

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/books`);
      if (!response.ok) {
        throw new Error(`Books fetch failed: ${response.status}`);
      }
      const books = await response.json();
      books.sort((a, b) => a.id - b.id);
      books.forEach((book, index) => {
        book.position = index;
      });

      setAllBooks(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      setAllBooks([]);
    }
  };

  /**
   * Fetch similarity data for selected books when selection changes
   */
  useEffect(() => {
    let cancelled = false;

    const loadSimilarityData = async () => {
      try {
        setRowsError(null);

        // Find which books need data fetched
        const pendingBookIds = selectedBookIds.filter(
          (bookId) => !similarityCache[bookId],
        );

        // All data is already cached
        if (pendingBookIds.length === 0) {
          setIsLoading(false);
          return;
        }

        setIsLoading(true);

        // Fetch missing similarity data
        fetchMissingSimilarityData(pendingBookIds, cancelled);
      } catch (error) {
        if (!cancelled) {
          console.error("Error loading similarity data:", error);
          setRowsError(error);
          setCalculatedRowData([]);
          setIsLoading(false);
        }
      }
    };

    // Only load if we have selections and a search term
    if (selectedBookIds.length) {
      loadSimilarityData();
    } else {
      setCalculatedRowData([]);
      setIsLoading(false);
    }

    // Cleanup function to prevent state updates after unmount
    return () => {
      cancelled = true;
    };
  }, [selectedBookIds, similarityCache]);

  /**
   * Fetch similarity data for books not in cache
   */
  const fetchMissingSimilarityData = async (pendingBookIds, cancelled) => {
    try {
      const fetchPromises = pendingBookIds.map(async (bookId) => {
        const url = `${API_BASE_URL}/similarity/${bookId}/${encodeURIComponent(term)}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Similarity fetch failed (${bookId}): ${response.status}`,
          );
        }

        const items = await response.json();
        return { bookId, items };
      });

      const fetchedData = await Promise.all(fetchPromises);

      // Update cache and compute rows if component is still mounted
      if (!cancelled) {
        setSimilarityCache((previousCache) => {
          const updatedCache = { ...previousCache };

          // Add newly fetched data to cache
          for (const { bookId, items } of fetchedData) {
            updatedCache[bookId] = items;
          }

          setIsLoading(false);

          return updatedCache;
        });
      }
    } catch (error) {
      if (!cancelled) {
        console.error("Error fetching missing similarity data:", error);
        setRowsError(error);
        setCalculatedRowData([]);
        setIsLoading(false);
      }
    }
  };

  // ============================================================================
  // Data Processing
  // ============================================================================

  /**
   * Compute rows from cached similarity data
   * Groups data by term and calculates statistics across selected books
   */
  const computeRows = (bookIds, cache) => {
    // Group similarity data by term
    const termDataMap = new Map();

    const getOrCreateTermRow = (term) => {
      if (!termDataMap.has(term)) {
        termDataMap.set(term, { term, byBook: {} });
      }
      return termDataMap.get(term);
    };

    for (const bookId of bookIds) {
      for (const item of cache[bookId] || []) {
        const row = getOrCreateTermRow(item.term);
        row.byBook[bookId] = {
          similarity: Number(item.similarity),
          n: Number(item.count),
          coherence: Number(item.coherence) * 100,
        };
      }
    }

    // Calculate aggregate statistics for each term
    const rows = Array.from(termDataMap.values()).map((row) => {
      const similarities = Object.entries(row.byBook)
        .filter(([bookId]) => String(bookId) !== selectedBookId)
        .map(([, data]) => data.similarity);

      const total = similarities.reduce(
        (sum, similarity) => sum + similarity,
        0,
      );

      const count = similarities.length;

      return {
        ...row,
        mean: count ? total / count : 0,
      };
    });

    setCalculatedRowData(rows);
  };

  /**
   * Recompute rows whenever the selected reference book changes
   * and all required similarity data is available.
   */
  useEffect(() => {
    if (!selectedBookIds.length) {
      setCalculatedRowData([]);
      return;
    }

    const hasAllSimilarityData = selectedBookIds.every(
      (bookId) => similarityCache[bookId],
    );

    if (hasAllSimilarityData) {
      computeRows(selectedBookIds, similarityCache);
    }
  }, [selectedBookId, selectedBookIds, similarityCache]);

  // ============================================================================
  // Derived State
  // ============================================================================

  /**
   * Filter all books to only those currently selected
   */
  const selectedBooks = useMemo(
    () => allBooks.filter((book) => selectedBookIds.includes(book.id)),
    [allBooks, selectedBookIds],
  );

  /**
   * Sort and limit rows based on current ranking and display preferences
   */
  const displayRowsData = useMemo(() => {
    const bookData = {};
    const removedTerms = [];
    selectedBookIds.forEach((bookId) => {
      bookData[bookId] = {
        total: similarityCache[bookId]?.length ?? 0,
        removed: 0,
        shown: topN,
      };
    });

    const shouldKeepRow = (row) => {
      const hasAllBooks = selectedBookIds.every((bookId) => row.byBook[bookId]);
      const meetsMinCount = selectedBookIds.every(
        (bookId) => (row.byBook[bookId]?.n ?? 0) >= 5,
      );
      return hasAllBooks && meetsMinCount;
    };

    const sortedRows = calculatedRowData
      .map((row) => ({ ...row, sortable: !selectedBookId ? row.mean : row.byBook[selectedBookId]?.similarity - row.mean }))
      .sort((a, b) => (rankBy === "max" ? b.sortable - a.sortable : a.sortable - b.sortable));

    const filteredRows = sortedRows.filter((row) => {
      const shouldKeep = shouldKeepRow(row);
      if (!shouldKeep) {
        removedTerms.push(row.term);
      }
      return shouldKeep;
    });

    const filteredSlicedRows = filteredRows.slice(0, topN);
    const slicedRows = sortedRows.slice(0, topN);

    selectedBookIds.forEach((bookId) => {
      bookData[bookId]["removed"] = slicedRows.reduce((count, item) => {
        if (shouldKeepRow(item)) {
          return count;
        }

        const bookEntry = item.byBook[bookId];
        const missing = !bookEntry;
        const belowMin = (bookEntry?.n ?? 0) < 5;

        return missing || belowMin ? count + 1 : count;
      }, 0);
    });

    return { rows: filteredSlicedRows, stats: bookData };
  }, [
    calculatedRowData,
    rankBy,
    topN,
    selectedBookId,
    selectedBookIds,
    similarityCache,
  ]);

  useEffect(() => {
    setBookCalculationStats(displayRowsData.stats);
  }, [displayRowsData.stats]);

  const displayRows = displayRowsData.rows;

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <TopBar
          term={term}
          onTermChange={setTerm}
          books={allBooks}
          selectedBookIds={selectedBookIds}
          onSelectedBookIdsChange={setSelectedBookIds}
          selectedBooks={selectedBooks}
          selectedBookId={selectedBookId}
          setSelectedBookId={setSelectedBookId}
          rankBy={rankBy}
          onRankByChange={setRankBy}
          topN={topN}
          onTopNChange={setTopN}
        />

        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Error message */}
          {rowsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load similarity data.
            </Alert>
          )}
          {/* Chart Panel */}
          <Paper elevation={0} sx={{ mb: 2, p: 3, borderRadius: 3 }}>
            <SimilarityScatterChart
              rows={displayRows.slice(1)}
              selectedBooks={selectedBooks}
              isLoading={isLoading}
            />
          </Paper>

          {/* Table Panel */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <ResultsTable
              rows={displayRows}
              selectedBooks={selectedBooks}
              calcStats={bookCalculationStats}
              onClick={setTerm}
            />
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
