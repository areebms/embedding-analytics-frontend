import PropTypes from 'prop-types';

/**
 * Error state component for the chart
 */
export const ChartError = ({ error }) => {
  return (
    <div className="line-chart line-chart--error" role="alert">
      <p>Error: {error}</p>
    </div>
  );
};

ChartError.propTypes = {
  error: PropTypes.string.isRequired,
};
