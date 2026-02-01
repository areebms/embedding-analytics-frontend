import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import { termLabelPlugin } from './termLabelPlugin';

ChartJS.register(LinearScale, PointElement, Title, Tooltip, Legend);

/**
 * Scatter chart component that displays similarity data
 */
export const SimilarityScatterChart = ({ options, data, term }) => {
  return (
    <div
      className="line-chart__chart"
      role="img"
      aria-label={`Scatter chart showing terms similar to ${term}`}
    >
      <Scatter options={options} data={data} plugins={[termLabelPlugin]} />
    </div>
  );
};

SimilarityScatterChart.propTypes = {
  options: PropTypes.object.isRequired,
  data: PropTypes.shape({
    labels: PropTypes.array.isRequired,
    datasets: PropTypes.array.isRequired,
  }).isRequired,
  term: PropTypes.string.isRequired,
};
