import type { TermType } from "../types/api";

export const labels = {
  // Pinned or not, every point is the term's own adjusted cosine to the query
  // in that book; a pin changes which books and terms appear, not the measure.
  similarity: {
    label: "Adjusted cosine similarity",
    pointTitle: (term: string, bookLabel: string) =>
      `Usage of ${term} in ${bookLabel}`,
  },

  comparativeTerms: {
    types: {
      consistent: "Consistent",
      contested: "Contested",
    } satisfies Record<TermType, string>,
  },

  gap: {
    short: "not in text",
    detail: (terms: string[]) =>
      `This book never uses ${terms.map((t) => `"${t}"`).join(" or ")}.`,
  },

  columns: {
    consistent: {
      short: "Consistency",
      help:
        "Mean adjusted cosine similarity to your query. " +
        "How closely the term is tied to the query across the collection.",
    },
    contested: {
      short: "Contestation",
      help:
        "Standard deviation of that adjusted cosine similarity to your query. " +
        "How much the definition shifts across the collection.",
    },
  } satisfies Record<TermType, { short: string; help: string }>,

  diachronic: {
    empty: (term: string) => `'${term}' could not be compared across books.`,
  },

  booksGroup: "Definitional agreement, by book",
};
