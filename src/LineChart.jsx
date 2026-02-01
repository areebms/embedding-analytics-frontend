import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { DataTable } from './DataTable';
import { ChartLoading } from './ChartLoading';
import { ChartError } from './ChartError';
import { SimilarityScatterChart } from './SimilarityScatterChart';
import { useSimilarityData } from './useSimilarityData';
import { useChartConfig } from './useChartConfig';
import { getTermFromURL } from './utils';

/**
 * Main LineChart component that displays similarity data
 * as both a scatter plot and a data table
 */
export function LineChart({ apiBaseUrl = '' }) {
  const [corpus, setCorpus] = useState(null);
  const term = useMemo(() => getTermFromURL(), []);
  
  // Fetch data
  const { chartData, tableData, loading, error } = useSimilarityData(
    term,
    apiBaseUrl
  );

  // Configure chart
  const chartOptions = useChartConfig(term, chartData, corpus, setCorpus);

  // Render loading state
  if (loading) {
    return <ChartLoading />;
  }

  // Render error state
  if (error) {
    return <ChartError error={error} />;
  }

  // Render chart and table
  return (
    <div className="line-chart">
      <SimilarityScatterChart
        options={chartOptions}
        data={chartData}
        term={term}
      />
      <div className="line-chart__table">
        <DataTable data={tableData} />
      </div>
    </div>
  );
}

LineChart.propTypes = {
  apiBaseUrl: PropTypes.string,
};
