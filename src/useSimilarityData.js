import { useState, useEffect } from 'react';
import { SERIES_IDS } from './constants';
import { buildDatasets } from './utils';

/**
 * Custom hook to fetch and manage similarity data
 * @param {string} term - The search term
 * @param {string} apiBaseUrl - Base URL for the API
 * @returns {Object} { chartData, tableData, loading, error }
 */
export const useSimilarityData = (term, apiBaseUrl = '') => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!term) {
      setError('No term provided in URL');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `${apiBaseUrl}/similarity/${term}?ids=${SERIES_IDS.join(',')}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();

        if (!Array.isArray(payload)) {
          throw new Error('Invalid response format');
        }

        setTableData(payload);
        setChartData({
          labels: [...payload].reverse().map((item) => item.term),
          datasets: buildDatasets(payload),
        });
      } catch (err) {
        setError(err.message || 'Failed to load data');
        console.error('Error fetching similarity data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [term, apiBaseUrl]);

  return { chartData, tableData, loading, error };
};
