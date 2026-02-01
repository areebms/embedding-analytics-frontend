import PropTypes from 'prop-types';

/**
 * Loading state component for the chart
 */
export const ChartLoading = ({ message = 'Loading chart data...' }) => {
  return (
    <div className="line-chart line-chart--loading" role="status">
      <p>{message}</p>
    </div>
  );
};

ChartLoading.propTypes = {
  message: PropTypes.string,
};
