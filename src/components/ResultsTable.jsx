import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";


export default function ResultsTable({ rows, selectedBooks, calcStats, onClick }) {

  const renderBookTooltip = (bookId) => {
    const stats = calcStats?.[bookId];

    if (!stats) {
      return `Book ID: ${bookId}`;
    }

    return (
      <Box>
        <Typography variant="body2" fontWeight={600}>
          Terms removed: {stats.removed}
        </Typography>
        <Typography variant="caption" color="inherit">
          Showing {stats.shown} of {stats.total}
        </Typography>
      </Box>
    );
  };

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
          Mean Similarity
        </TableCell>
        {selectedBooks.map((book) => (
          <TableCell key={book.id} sx={{ fontWeight: 700 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <span>{book.label}</span>
              <Tooltip title={renderBookTooltip(book.id)} arrow>
                
                <IconButton
                  size="small"
                  aria-label={`Book ID ${book.id}`}
                  sx={{ color: "text.secondary" }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
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
          <Typography fontWeight={700} color="primary" onClick={() => onClick(row.term)}>
            {row.term}
          </Typography>
        </TableCell>

        {/* Average similarity */}
        <TableCell>{row.mean.toFixed(3)}</TableCell>

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
        {data.similarity.toFixed(3)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {data.coherence.toFixed(1)}% (n={data.n})
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
