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
import { Box, CircularProgress, Typography } from "@mui/material";
import { getColorForBook } from "../utils/bookColors";

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
      order: 1,
    };
  });

  return datasets;
}

/**
 * Create line datasets that show min/max similarity range per term
 */
function createRangeDatasets(rows, selectedBooks) {
  return rows
    .map((row, rowIndex) => {
      const similarities = selectedBooks
        .map((book) => row.byBook[book.id]?.similarity)
        .filter((value) => typeof value === "number");

      if (similarities.length === 0) {
        return null;
      }

      const min = Math.min(...similarities);
      const max = Math.max(...similarities);

      return {
        label: `range-${rowIndex}`,
        type: "line",
        data: [
          { x: min, y: rowIndex },
          { x: max, y: rowIndex },
        ],
        borderColor: "#000",
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 0,
        showLine: true,
        fill: false,
        order: 0,
      };
    })
    .filter(Boolean);
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
}) {
  // ============================================================================
  // Computed Values
  // ============================================================================

  const chartData = useMemo(() => {
    const rangeDatasets = createRangeDatasets(rows, selectedBooks);
    const datasets = createChartDatasets(rows, selectedBooks);
    return {
      datasets: [...rangeDatasets, ...datasets],
    };
  }, [rows, selectedBooks]);

  const chartOptions = useMemo(() => {
    return createChartOptions(rows);
  }, [rows]);

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
      {renderChart()}
    </Box>
  );
}
