import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Paper,
} from "@mui/material";

/**
 * ResultsTable Component
 * Displays similarity data in a tabular format with sortable columns
 */
export default function ResultsTable({ rows, selectedBooks }) {

  // ============================================================================
  // Render Helpers
  // ============================================================================

  /**
   * Render table header with book columns
   */
  const renderTableHeader = () => (
    <TableHead>
      <TableRow>
        <TableCell width={50} sx={{ fontWeight: 700 }}>
          #
        </TableCell>
        <TableCell width={220} sx={{ fontWeight: 700 }}>
          Term
        </TableCell>
        <TableCell width={140} sx={{ fontWeight: 700 }}>
          Avg similarity
        </TableCell>
        {selectedBooks.map((book) => (
          <TableCell key={book.id} sx={{ fontWeight: 700 }}>
            {book.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  /**
   * Render a single table row for a term
   */
  const renderTermRow = (row, index) => {

    return (
      <TableRow
        key={row.term}
        hover
        sx={{
          cursor: "pointer",
          "&:hover": {
            bgcolor: "action.hover",
          },
        }}
      >
        {/* Row number */}
        <TableCell>{index + 1}</TableCell>

        {/* Term name */}
        <TableCell>
          <Typography fontWeight={700} color="primary">
            {row.term}
          </Typography>
        </TableCell>

        {/* Average similarity */}
        <TableCell>{row.avg.toFixed(3)}</TableCell>

        {/* Book-specific data cells */}
        {selectedBooks.map((book) => renderBookCell(book.id, row.byBook[book.id]))}
      </TableRow>
    );
  };

  /**
   * Render a cell with book-specific similarity data
   */
  const renderBookCell = (bookId, cellData) => (
    <TableCell key={bookId}>
      {cellData ? renderCellWithData(cellData) : renderEmptyCell()}
    </TableCell>
  );

  /**
   * Render cell content when data is available
   */
  const renderCellWithData = (data) => (
    <Box>
      <Typography fontWeight={700} variant="body2">
        {data.sim.toFixed(3)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {data.conf.toFixed(1)}% (n={data.n})
      </Typography>
    </Box>
  );

  /**
   * Render empty cell when no data is available
   */
  const renderEmptyCell = () => (
    <Typography variant="body2" color="text.disabled">
      —
    </Typography>
  );

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} size="small">
        {renderTableHeader()}
        <TableBody>{rows.map(renderTermRow)}</TableBody>
      </Table>
    </TableContainer>
  );
}
