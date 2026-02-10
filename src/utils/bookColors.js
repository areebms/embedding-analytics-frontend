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

export function getColorForBook(bookIndex) {
  return COLOR_PALETTE[bookIndex % COLOR_PALETTE.length];
}
