import { Box, CircularProgress, Typography } from "@mui/material";

import { CHART_HEIGHT } from "./layout";

export default function ChartArea({
  isLoading,
  term,
  hasError,
  payload,
  sx,
  children,
}) {
  const empty = !term
    ? "Select a term to plot."
    : hasError
      ? "Nothing to plot."
      : !payload?.book_stats?.length
        ? "No books to compare."
        : null;
  return (
    <Box sx={{ flex: 1, minWidth: 0, ...sx }}>
      {isLoading ? (
        <ChartSpinner />
      ) : empty ? (
        <ChartEmpty message={empty} />
      ) : (
        children
      )}
    </Box>
  );
}

export function ChartSpinner() {
  return (
    <ChartMessage>
      <CircularProgress />
    </ChartMessage>
  );
}

export function ChartEmpty({ message }) {
  return (
    <ChartMessage>
      <Typography variant="body1" color="text.secondary" align="center">
        {message}
      </Typography>
    </ChartMessage>
  );
}

function ChartMessage({ children }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: CHART_HEIGHT,
        width: "100%",
      }}
    >
      {children}
    </Box>
  );
}
