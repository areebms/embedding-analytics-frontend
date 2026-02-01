import { Chart as ChartJS } from 'chart.js';

/**
 * Custom Chart.js plugin that draws term labels on the rightmost points
 * and connecting lines from the y-axis
 */
export const termLabelPlugin = {
  id: 'termLabels',
  
  afterDatasetsDraw(chart, _args, pluginOptions = {}) {
    const { ctx, data, scales } = chart;
    const {
      fontSize = 11,
      offset = 6,
      color = '#1a1a1a',
      lineColor = 'rgba(26, 26, 26, 0.3)',
      lineWidth = 1,
    } = pluginOptions;

    const fontFamily = ChartJS.defaults.font.family ?? 'sans-serif';

    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';

    // Find the rightmost point for each y-index across all datasets
    const maxPointsByIndex = this._findMaxPointsByIndex(data, chart);

    // Draw connecting lines from y-axis to points
    this._drawConnectingLines(ctx, scales, maxPointsByIndex, lineColor, lineWidth);

    // Draw term labels
    this._drawTermLabels(ctx, maxPointsByIndex, offset, fontSize);

    ctx.restore();
  },

  /**
   * Finds the rightmost (max x-value) point for each y-index
   * @private
   */
  _findMaxPointsByIndex(data, chart) {
    const maxPointsByIndex = [];

    data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      
      meta.data.forEach((element, index) => {
        const point = dataset.data?.[index];
        if (point?.x == null || point?.y == null) {
          return;
        }

        const current = maxPointsByIndex[index];
        if (!current || point.x > current.x) {
          maxPointsByIndex[index] = {
            x: point.x,
            label: point.term,
            element,
          };
        }
      });
    });

    return maxPointsByIndex;
  },

  /**
   * Draws horizontal lines from y-axis to the rightmost points
   * @private
   */
  _drawConnectingLines(ctx, scales, maxPointsByIndex, lineColor, lineWidth) {
    const xScale = scales?.x;
    const xAxisStartValue = Number.isFinite(xScale?.min) ? xScale.min : null;
    const xAxisStart = Number.isFinite(xAxisStartValue)
      ? xScale?.getPixelForValue?.(xAxisStartValue)
      : xScale?.left;

    if (!Number.isFinite(xAxisStart)) {
      return;
    }

    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;

    maxPointsByIndex.forEach((point) => {
      if (!point?.element) return;

      ctx.beginPath();
      ctx.moveTo(xAxisStart, point.element.y);
      ctx.lineTo(point.element.x, point.element.y);
      ctx.stroke();
    });

    ctx.restore();
  },

  /**
   * Draws term labels next to the rightmost points
   * @private
   */
  _drawTermLabels(ctx, maxPointsByIndex, offset, fontSize) {
    maxPointsByIndex.forEach((point) => {
      if (!point?.label || !point?.element) return;

      ctx.fillText(
        point.label,
        point.element.x + offset,
        point.element.y + fontSize / 2
      );
    });
  },
};
