export const SERIES_IDS = ['3300', '33310', '30107'];

export const SERIES_COLORS = [
  { border: 'rgb(228, 26, 28)', background: 'rgba(228, 26, 28, 0.35)' },
  { border: 'rgb(55, 126, 184)', background: 'rgba(55, 126, 184, 0.35)' },
  { border: 'rgb(77, 175, 74)', background: 'rgba(77, 175, 74, 0.35)' },
  { border: 'rgb(152, 78, 163)', background: 'rgba(152, 78, 163, 0.35)' },
  { border: 'rgb(255, 127, 0)', background: 'rgba(255, 127, 0, 0.35)' },
];

export const TERM_LABEL_SETTINGS = {
  fontSize: 11,
  offset: 8,
  color: '#000',
  lineColor: 'rgba(26, 26, 26, 0.3)',
  lineWidth: 1,
};

export const BASE_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Chart.js Scatter Plot',
    },
  },
};
