import { useMemo, useCallback } from 'react';
import { Chart as ChartJS } from 'chart.js';
import {
  BASE_CHART_OPTIONS,
  TERM_LABEL_SETTINGS,
} from './constants';
import { createTooltipCallbacks } from './utils';

/**
 * Custom hook to manage chart configuration
 * @param {string} term - The search term
 * @param {Object} chartData - The chart data object
 * @param {string|null} corpus - Currently selected corpus
 * @param {Function} setCorpus - Function to update corpus selection
 * @returns {Object} Chart options configuration
 */
export const useChartConfig = (term, chartData, corpus, setCorpus) => {
  // Legend click handler
  const handleLegendClick = useCallback(
    (_event, legendItem) => {
      if (legendItem?.text?.startsWith('None')) {
        setCorpus(null);
        return;
      }

      const dataset = chartData.datasets?.[legendItem?.datasetIndex];
      setCorpus(dataset?.label ?? null);
    },
    [chartData.datasets, setCorpus]
  );

  // Build legend labels with selection state
  const buildLegendLabels = useCallback(
    (chart) => {
      const defaultLabels =
        ChartJS.defaults.plugins.legend.labels.generateLabels(chart);

      const labelsWithState = defaultLabels.map((label) => ({
        ...label,
        text: label.text,
        color: label.text === corpus ? '#000' : label.color,
        fontColor: label.text === corpus ? '#000' : label.fontColor,
        lineWidth: label.text === corpus ? 3 : label.lineWidth,
      }));

      const noneSelected = corpus == null;
      labelsWithState.push({
        text: 'None',
        fillStyle: 'transparent',
        strokeStyle: '#777',
        lineWidth: noneSelected ? 3 : 1,
        color: '#777',
        fontColor: '#777',
        hidden: false,
        datasetIndex: null,
      });

      return labelsWithState;
    },
    [corpus]
  );

  // Legend configuration
  const legendConfig = useMemo(
    () => ({
      ...BASE_CHART_OPTIONS.plugins.legend,
      onClick: handleLegendClick,
      labels: {
        ...BASE_CHART_OPTIONS.plugins.legend?.labels,
        generateLabels: buildLegendLabels,
      },
    }),
    [buildLegendLabels, handleLegendClick]
  );

  // Title configuration
  const titleConfig = useMemo(
    () => ({
      ...BASE_CHART_OPTIONS.plugins.title,
      text: term
        ? `Terms most semantically similar to term "${term}"`
        : 'Semantic Similarity Chart',
    }),
    [term]
  );

  // Tooltip configuration
  const tooltipConfig = useMemo(
    () => ({
      callbacks: createTooltipCallbacks(),
    }),
    []
  );

  // Y-axis configuration
  const yAxisConfig = useMemo(
    () => ({
      grid: {
        display: false,
      },
      ticks: {
        autoSkip: false,
        stepSize: 1,
        color: '#000',
        font: {
          size: TERM_LABEL_SETTINGS.fontSize,
          family: ChartJS.defaults.font.family ?? 'sans-serif',
        },
        callback: (value) => {
          const index = Number(value);
          return chartData.labels?.[index] ?? '';
        },
      },
    }),
    [chartData.labels]
  );

  // X-axis configuration
  const xAxisConfig = useMemo(
    () => ({
      type: 'linear',
      ticks: {
        autoSkip: true,
      },
      title: {
        display: true,
        text: 'Similarity',
      },
    }),
    []
  );

  // Scales configuration
  const scalesConfig = useMemo(
    () => ({
      x: xAxisConfig,
      y: yAxisConfig,
    }),
    [xAxisConfig, yAxisConfig]
  );

  // Plugins configuration
  const pluginsConfig = useMemo(
    () => ({
      ...BASE_CHART_OPTIONS.plugins,
      legend: legendConfig,
      title: titleConfig,
      tooltip: tooltipConfig,
      termLabels: TERM_LABEL_SETTINGS,
    }),
    [legendConfig, titleConfig, tooltipConfig]
  );

  // Complete chart options
  const chartOptions = useMemo(
    () => ({
      ...BASE_CHART_OPTIONS,
      plugins: pluginsConfig,
      scales: scalesConfig,
    }),
    [pluginsConfig, scalesConfig]
  );

  return chartOptions;
};
