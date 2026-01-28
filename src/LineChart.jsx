import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { DataTable } from './DataTable';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Chart.js Line Chart',
    },
  },
};

const seriesColors = [
  { border: 'rgb(228, 26, 28)', background: 'rgba(228, 26, 28, 0.35)' },
  { border: 'rgb(55, 126, 184)', background: 'rgba(55, 126, 184, 0.35)' },
  { border: 'rgb(77, 175, 74)', background: 'rgba(77, 175, 74, 0.35)' },
  { border: 'rgb(152, 78, 163)', background: 'rgba(152, 78, 163, 0.35)' },
  { border: 'rgb(255, 127, 0)', background: 'rgba(255, 127, 0, 0.35)' },
];

const seriesIds = ['3300', '33310', '30107'];

export function LineChart() {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [tableData, setTableData] = useState([]);

  const params = new URLSearchParams(window.location.search);
  const term = params.get('term');
  const chartOptions = {
    ...options,
    plugins: {
      ...options.plugins,
      title: {
        ...options.plugins.title,
        text: `Terms most semantically similar to term "${term}"`,
      },
    },
  };

  useEffect(() => {

    const load = async () => {
            const response = await fetch(`/similarity/${term}?ids=${seriesIds.join(',')}`);
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      const payload = await response.json();

      setTableData(payload);
      setChartData({
        labels: payload.map((item) => item.term),
        datasets: seriesIds.map((id, index) => {
          const palette = seriesColors[index % seriesColors.length];
          return {
            label: id,
            data: payload.map((item) => item[id]?.similarity ?? null),
            borderColor: palette.border,
            backgroundColor: palette.background,
          };
        }),
      });

    }

    load();


  }, []);

  return (
    <div className="line-chart">
      <div className="line-chart__chart">
        <Line options={chartOptions} data={chartData} />
      </div>
      <div className="line-chart__table">
        <DataTable data={tableData} />
      </div>
    </div>
  );
}
