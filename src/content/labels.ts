import { LOCAL_ANCHOR_FLOOR } from "../types/api";
import type { TermRanking } from "../types/api";

export const labels = {
  agreement: {
    label: "Definitional agreement",
    pinned: (bookLabel: string) => `Definitional agreement with ${bookLabel}`,
    pointTitle: (term: string, bookLabel: string) =>
      `Usage of ${term} in ${bookLabel}`,
  },

  comparativeTerms: {
    label: "Comparative Terms",
    rankings: {
      stability: "Stable",
      instability: "Unstable",
    } satisfies Record<TermRanking, string>,
  },

  gaps: {
    absent: {
      short: "not in text",
      detail: (terms: string[]) =>
        `This book never uses ${terms.map((t) => `"${t}"`).join(" or ")}.`,
    },
    too_few_anchors: {
      short: "too few shared words",
      detail: () =>
        `This book uses every word of the query, but shares fewer than ` +
        `${LOCAL_ANCHOR_FLOOR} other words with any book it could be read ` +
        `against — too little common ground to place them.`,
    },
    unscored: {
      short: "not measured",
      detail: () =>
        "This book has the vocabulary, but no comparison against it produced " +
        "a score.",
    },
  },

  // Indexed by ranking at two call sites in ResultsTable, so the `satisfies`
  // is what keeps a new TermRanking from reaching the table with no column
  // copy behind it.
  columns: {
    stability: {
      short: "Stability",
      help:
        "How consistently this term sits near your query across the corpus. " +
        "Higher values mean that this aspect of the definition is constant across the corpus.",
    },
    instability: {
      short: "Instability",
      help:
        "How much that closeness varies from book to book. Higher means the " +
        "books disagree about this aspect of the definition.",
    },
  } satisfies Record<TermRanking, { short: string; help: string }>,

  booksGroup: "Definitional agreement, by book",
};
