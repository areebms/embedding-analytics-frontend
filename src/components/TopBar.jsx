import { useState } from "react";
import {
  AppBar,
  Toolbar,
  TextField,
  Button,
  Box,
  InputAdornment,
  IconButton,
  Badge,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import BookPicker from "./BookPicker";

/**
 * TopBar Component
 * Application header with search term input and book selection controls
 */
export default function TopBar({
  term,
  onTermChange,
  books,
  selectedBookIds,
  onSelectedBookIdsChange,
}) {
  // ============================================================================
  // State
  // ============================================================================

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // ============================================================================
  // Computed Values
  // ============================================================================

  const selectedCount = selectedBookIds.length;
  const totalCount = books.length;

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleTermChange = (event) => {
    onTermChange(event.target.value);
  };

  const togglePicker = () => {
    setIsPickerOpen((isOpen) => !isOpen);
  };

  const closePicker = () => {
    setIsPickerOpen(false);
  };

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ gap: 2, justifyContent: "space-between" }}>
        {/* Search Box */}
        <TextField
          value={term}
          onChange={handleTermChange}
          placeholder="Term (e.g. market)"
          size="small"
          sx={{
            minWidth: 380,
            "& .MuiOutlinedInput-root": {
              bgcolor: "background.paper",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {/* Book Selector */}
          <Box sx={{ position: "relative" }}>
            <Button
              variant="outlined"
              onClick={togglePicker}
              sx={{
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Compare Books: {selectedCount} / {totalCount}
            </Button>

            {isPickerOpen && (
              <BookPicker
                books={books}
                selectedBookIds={selectedBookIds}
                onSelectedBookIdsChange={onSelectedBookIdsChange}
                onClose={closePicker}
              />
            )}
          </Box>

          {/* Settings Button */}
          <IconButton aria-label="Settings">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
