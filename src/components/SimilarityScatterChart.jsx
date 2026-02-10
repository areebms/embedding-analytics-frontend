import { useMemo } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import {
  Box,
  Chip,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

// Register Chart.js components
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

// ============================================================================
// Constants
// ============================================================================

const COLOR_PALETTE = [
  "#e15759", // Red
  "#4e79a7", // Blue
  "#59a14f", // Green
  "#f28e2b", // Orange
  "#edc948", // Yellow
  "#b07aa1", // Purple
  "#76b7b2", // Teal
  "#ff9da7", // Pink
  "#9c755f", // Brown
  "#bab0ab", // Gray
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get color for a book by its index
 */
function getColorForBook(bookIndex) {
  return COLOR_PALETTE[bookIndex % COLOR_PALETTE.length];
}

/**
 * Transform rows data into Chart.js dataset format
 */
function createChartDatasets(rows, selectedBooks) {

  // Create a dataset for each book
  const datasets = selectedBooks.map((book) => {
    const dataPoints = rows
      .map((row, rowIndex) => {
        const bookData = row.byBook[book.id];
        if (!bookData) return null;

        return {
          x: bookData.similarity,
          y: rowIndex,
          term: row.term,
          bookId: book.id,
          n: bookData.n,
          coherence: bookData.coherence,
        };
      })
      .filter(Boolean);

    return {
      label: `${book.id} - ${book.label}`,
      data: dataPoints,
      backgroundColor: getColorForBook(book.position),
      borderColor: getColorForBook(book.position),
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: getColorForBook(book.position),
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      opacity: 1,
    };
  });

  return datasets;
}

/**
 * Create Chart.js options configuration
 */
function createChartOptions(rows) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll use our custom legend
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const point = context.raw;
            return [
              `Term: ${point.term}`,
              `Similarity: ${point.x.toFixed(3)}`,
              `Occurrence: ${point.n}`,
              `Coherence: ${point.coherence.toFixed(1)}%`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        min: 0,
        max: 0.55,
        title: {
          display: true,
          text: "Similarity",
          font: {
            size: 14,
            weight: 600,
          },
        },
        grid: {
          color: "#e5e7eb",
        },
      },
      y: {
        type: "linear",
        reverse: true,
        min: 0,
        max: Math.max(0, rows.length - 1),
        ticks: {
          autoSkip: false,
          stepSize: 1,
          precision: 0,
          maxRotation: 0,
          minRotation: 0,
          callback: (value, index) => {
            const rowIndex = Math.round(value);
            if (rowIndex >= 0 && rowIndex < rows.length) {
              return rows[rowIndex].term;
            }
            return "";
          },
          font: {
            size: 12,
          },
        },
        grid: {
          color: "#f1f5f9",
        },
      },
    },
  };
}

// ============================================================================
// Component
// ============================================================================

/**
 * SimilarityScatterChart Component
 * Displays similarity scores as a scatter plot using Chart.js
 */
export default function SimilarityScatterChart({
  rows,
  selectedBooks,
  isLoading,
  setTopN,
  rankBy,
  setRankBy,
  topN,
}) {
  // ============================================================================
  // Computed Values
  // ============================================================================

  const chartData = useMemo(() => {
    const datasets = createChartDatasets(rows, selectedBooks);
    return {
      datasets,
    };
  }, [rows, selectedBooks]);

  const chartOptions = useMemo(() => {
    return createChartOptions(rows);
  }, [rows]);

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const renderLegend = () => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
      {selectedBooks.map((book, index) => (
        <Chip
          key={book.id}
          label={book.label}
          size="small"
          sx={{
            bgcolor: getColorForBook(book.position),
            color: "#fff",
            fontWeight: 600,
            "& .MuiChip-label": {
              px: 1.5,
            },
          }}
        />
      ))}
    </Box>
  );

  const renderLoadingState = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 400,
      }}
    >
      <CircularProgress />
    </Box>
  );

  const renderEmptyState = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 400,
      }}
    >
      <Typography variant="body1" color="text.secondary">
        No data to display. Select books and enter a search term.
      </Typography>
    </Box>
  );

  const renderChart = () => (
    <Box sx={{ height: Math.max(400, rows.length * 12 + 80) }}>
      <Scatter data={chartData} options={chartOptions} />
    </Box>
  );

  // ============================================================================
  // Main Render
  // ============================================================================

  if (isLoading) {
    return renderLoadingState();
  }

  if (rows.length === 0) {
    return renderEmptyState();
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1,
          pb: 1,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {renderLegend()}
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Ranking selector */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Ranked by</InputLabel>
            <Select
              value={rankBy}
              label="Ranked by"
              onChange={(e) => setRankBy(e.target.value)}
            >
              <MenuItem value="avg">Average similarity</MenuItem>
              <MenuItem value="max">Max similarity</MenuItem>
              <MenuItem value="min">Min similarity</MenuItem>
            </Select>
          </FormControl>

          {/* Top N selector */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Showing top</InputLabel>
            <Select
              value={topN}
              label="Showing top"
              onChange={(e) => setTopN(Number(e.target.value))}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      {renderChart()}
    </Box>
  );
}
