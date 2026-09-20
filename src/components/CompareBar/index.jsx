import { Stack, Typography } from "@mui/material";
import BookChip from "./BookChip";
import { CHART_HEIGHT } from "../charts/layout";

export const RAIL_WIDTH = 160;

export default function CompareBar({
  bookData,
  missingBookIds,
  selectedBookId,
  setSelectedBookId,
}) {
  return (
    <Stack
      spacing={1}
      sx={{ flexShrink: 0, width: { xs: "100%", md: RAIL_WIDTH } }}
    >
      <Typography variant="body2" color="text.secondary">
        Click to compare:
      </Typography>
      <Stack
        direction={{ xs: "row", md: "column" }}
        spacing={1}
        sx={{
          overflowX: { xs: "auto", md: "hidden" },
          overflowY: { xs: "hidden", md: "auto" },
          maxHeight: { md: CHART_HEIGHT },
          pb: { xs: 0.5, md: 0 },
          pr: { md: 0.5 },
        }}
      >
        {bookData.map((book) => {
          const selected = selectedBookId === book.id;
          const active = !missingBookIds.has(book.id);
          return (
            <BookChip
              key={book.id}
              label={book.label}
              selected={selected}
              active={active}
              clickable={selected || (active && bookData.length > 1)}
              onSelect={() => setSelectedBookId(selected ? null : book.id)}
            />
          );
        })}
      </Stack>
    </Stack>
  );
}
