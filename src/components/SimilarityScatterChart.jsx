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
import { Box, Chip, CircularProgress, Typography } from "@mui/material";

// Register Chart.js components
ChartJS.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
  const bookColorMap = new Map(
    selectedBooks.map((book, index) => [book.id, { index, label: book.label }])
  );

  // Create a dataset for each book
  const datasets = selectedBooks.map((book, index) => {
    const dataPoints = rows
      .map((row, rowIndex) => {
        const bookData = row.byBook[book.id];
        if (!bookData) return null;

        return {
          x: bookData.sim,
          y: rowIndex,
          term: row.term,
          bookId: book.id,
          n: bookData.n,
          conf: bookData.conf,
        };
      })
      .filter(Boolean);

    return {
      label: `${book.id} - ${book.label}`,
      data: dataPoints,
      backgroundColor: getColorForBook(index),
      borderColor: getColorForBook(index),
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: getColorForBook(index),
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
              `Occurrences: ${point.n}`,
              `Confidence: ${point.conf.toFixed(1)}%`,
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
        min: -0.5,
        max: rows.length - 0.5,
        ticks: {
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
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const element = elements[0];
        const dataPoint = element.element.$context.raw;
      }
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
          label={`${book.id} - ${book.label}`}
          size="small"
          sx={{
            bgcolor: getColorForBook(index),
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
    <Box sx={{ height: Math.max(400, rows.length * 30 + 100) }}>
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
      {renderLegend()}
      {renderChart()}
    </Box>
  );
}
