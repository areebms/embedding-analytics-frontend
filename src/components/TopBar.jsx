import { useState } from "react";
import {
  AppBar,
  Toolbar,
  TextField,
  Button,
  Box,
  InputAdornment,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import BookPicker from "./BookPicker";
import { getColorForBook } from "../utils/bookColors";

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
  selectedBooks = [],
  rankBy,
  onRankByChange,
  topN,
  onTopNChange,
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

  const renderLegend = () => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {selectedBooks.map((book) => (
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
      <Toolbar sx={{ gap: 2, alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            component="span"
            sx={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 0.3,
              color: "text.primary",
              whiteSpace: "nowrap",
            }}
          >
            Embedding Analytics
          </Box>

          <Box sx={{ position: "relative" }}>
            <Button
              variant="outlined"
              onClick={togglePicker}
              sx={{
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Select Books: {selectedCount} / {totalCount}
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

          {renderLegend()}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            marginLeft: "auto",
          }}
        >
          {/* Search Box */}
          <TextField
            value={term}
            onChange={handleTermChange}
            placeholder="Term (e.g. market)"
            size="small"
            sx={{
              minWidth: 200,
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

          {/* Ranking selector */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Ranked by</InputLabel>
            <Select
              value={rankBy}
              label="Ranked by"
              onChange={(e) => onRankByChange(e.target.value)}
            >
              <MenuItem value="max">Max similarity</MenuItem>
              <MenuItem value="min">Min similarity</MenuItem>
            </Select>
          </FormControl>

          {/* Top N selector */}
          <FormControl size="small" sx={{ minWidth: 85 }}>
            <InputLabel>Show top</InputLabel>
            <Select
              value={topN}
              label="Showing top"
              onChange={(e) => onTopNChange(Number(e.target.value))}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
          <IconButton aria-label="Settings">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
