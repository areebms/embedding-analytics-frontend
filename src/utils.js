import { SERIES_IDS, SERIES_COLORS } from './constants';

/**
 * Builds chart datasets from raw similarity data
 * @param {Array} payload - Array of similarity data objects
 * @returns {Array} Chart.js compatible datasets
 */
export const buildDatasets = (payload) =>
  SERIES_IDS.map((id, index) => {
    const palette = SERIES_COLORS[index % SERIES_COLORS.length];
    return {
      label: id,
      data: [...payload].reverse().map((item, idx) => ({
        x: item[id]?.similarity ?? null,
        y: idx,
        term: item.term,
      })),
      borderColor: palette.border,
      backgroundColor: palette.background,
    };
  });

/**
 * Extracts the term parameter from URL search params
 * @returns {string|null} The term parameter value
 */
export const getTermFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('term');
};

/**
 * Creates tooltip callback configuration
 * @returns {Object} Tooltip callbacks object
 */
export const createTooltipCallbacks = () => ({
  title: (items) => {
    const item = items?.[0];
    return item?.raw?.term ?? item?.label ?? 'Term';
  },
  label: (item) => {
    const xValue = item?.raw?.x ?? item?.parsed?.x;
    return `Similarity: ${xValue.toFixed(2)}`;
  },
});
