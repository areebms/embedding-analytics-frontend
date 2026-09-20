import type { TermRanking } from "../types/api";

export const labels = {
  // Pinned or not, every point is the term's own adjusted cosine to the query
  // in that book; a pin changes which books and terms appear, not the measure.
  similarity: {
    label: "Semantic similarity to query",
    pointTitle: (term: string, bookLabel: string) =>
      `Usage of ${term} in ${bookLabel}`,
  },

  comparativeTerms: {
    label: "Comparative Terms",
    rankings: {
      persistent: "Persistent",
      transient: "Transient",
    } satisfies Record<TermRanking, string>,
  },

  gap: {
    short: "not in text",
    detail: (terms: string[]) =>
      `This book never uses ${terms.map((t) => `"${t}"`).join(" or ")}.`,
  },

  // Indexed by ranking at two call sites in ResultsTable, so the `satisfies`
  // is what keeps a new TermRanking from reaching the table with no column
  // copy behind it.
  columns: {
    persistent: {
      short: "Persistence",
      help:
        "Mean relative cosine similarity to your query across the books that " +
        "use this term. Higher means it belongs to the core, invariant part of " +
        "the query's definition.",
    },
    transient: {
      short: "Transience",
      help:
        "Variance of that relative cosine similarity from book to book. Higher " +
        "means the term's closeness to the query shifts across the corpus: a " +
        "semantic shift.",
    },
  } satisfies Record<TermRanking, { short: string; help: string }>,

  diachronic: {
    empty: (term: string) => `'${term}' could not be compared across books.`,
  },

  booksGroup: "Definitional agreement, by book",
};
