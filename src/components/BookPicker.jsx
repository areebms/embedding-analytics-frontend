import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/**
 * BookPicker Component
 * Modal dialog for selecting which books to compare
 */
export default function BookPicker({
  books,
  selectedBookIds,
  onSelectedBookIdsChange,
  onClose,
}) {
  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Toggle selection of a single book
   */
  const handleToggleBook = (bookId) => {
    if (selectedBookIds.includes(bookId)) {
      // Remove from selection
      const updatedIds = selectedBookIds.filter((id) => id !== bookId);
      onSelectedBookIdsChange(updatedIds);
    } else {
      // Add to selection
      const updatedIds = [...selectedBookIds, bookId];
      onSelectedBookIdsChange(updatedIds);
    }
  };

  /**
   * Select all books
   */
  const handleSelectAll = () => {
    const allBookIds = books.map((book) => book.id);
    onSelectedBookIdsChange(allBookIds);
  };

  /**
   * Clear all selections
   */
  const handleClearAll = () => {
    onSelectedBookIdsChange([]);
  };

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" fontWeight={700}>
            Select books to compare
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: 400 }}>
        <FormGroup>
          {books.map((book) => (
            <FormControlLabel
              key={book.id}
              control={
                <Checkbox
                  checked={selectedBookIds.includes(book.id)}
                  onChange={() => handleToggleBook(book.id)}
                />
              }
              label={
                <Typography fontWeight={600}>
                  {book.id} - {book.label}
                </Typography>
              }
            />
          ))}
        </FormGroup>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClearAll} variant="outlined">
          Clear
        </Button>
        <Button onClick={handleSelectAll} variant="outlined">
          Select all
        </Button>
        <Button onClick={onClose} variant="contained">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
