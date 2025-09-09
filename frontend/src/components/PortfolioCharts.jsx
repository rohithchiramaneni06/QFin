import { Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const generateColors = (count) => {
  const palette = [
    '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316',
    '#22D3EE', '#A3E635', '#F43F5E', '#EAB308', '#14B8A6', '#7C3AED', '#D946EF', '#4ADE80', '#FACC15'
  ];
  return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
};

function PortfolioCharts({ data, monteCarloData, marketIndexData }) {
  // ================================
  // 1. Portfolio Pie Chart
  // ================================
  let pieData = null;
  if (data && data.allocation && data.allocation.length > 0) {
    pieData = {
      labels: data.allocation.map((a) => a.name),
      datasets: [
        {
          data: data.allocation.map((a) => Number(a.weight)),
          backgroundColor: generateColors(data.allocation.length)
        }
      ]
    };
  }

  // ================================
  // 2. Monte Carlo Simulation Chart
  // ================================
  let lineData = null;
  if (monteCarloData && monteCarloData.visualization) {
    const { time_points, paths, percentile_paths } = monteCarloData.visualization;
    const datasets = [];

    paths.forEach((path) =>
      datasets.push({
        data: path,
        borderColor: 'rgba(99,102,241,0.1)',
        fill: false,
        borderWidth: 1,
        pointRadius: 0,
        label: '',
        datalabels: { display: false },
        showLine: true
      })
    );

    const percentileColors = {
      5: '#F87171',
      25: '#FBBF24',
      50: '#34D399',
      75: '#60A5FA',
      95: '#FACC15'
    };
    Object.entries(percentile_paths).forEach(([p, path]) =>
      datasets.push({
        label: `${p}th Percentile`,
        data: path,
        borderColor: percentileColors[p] || '#D1D5DB',
        fill: false,
        borderWidth: 2,
        pointRadius: 0
      })
    );

    datasets.push({
      label: 'Initial Investment',
      data: Array(time_points.length).fill(monteCarloData.initial_investment),
      borderColor: '#9CA3AF',
      borderWidth: 2,
      borderDash: [5, 5],
      fill: false,
      pointRadius: 0
    });

    lineData = { labels: time_points, datasets };
  }

  // ================================
  // 3. Market Index Chart
  // ================================
  let marketIndexChart = null;
  if (marketIndexData && marketIndexData.length > 0) {
    const labels = marketIndexData.map((d) => d.Date || d.date); // backend sends "Date"
    const prices = marketIndexData.map((d) => d.Close || d.close);

    const dataset = {
      labels,
      datasets: [
        {
          label: "Close Price",
          data: prices,
          borderColor: "#4ADE80", // green-400
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        }
      ]
    };

    marketIndexChart = (
      <div className="bg-gray-900 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-indigo-400">
          Market Index (Last 100 Days)
        </h3>
        <div className="h-80">
          <Line
            data={dataset}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: { color: "#E5E7EB" }
                }
              },
              scales: {
                y: {
                  title: {
                    display: true,
                    text: "Closing Price",
                    color: "#E5E7EB"
                  },
                  ticks: { color: "#9CA3AF", maxTicksLimit: 6 },
                  grid: { color: "rgba(229,231,235,0.1)" }
                },
                x: {
                  title: {
                    display: true,
                    text: "Date",
                    color: "#E5E7EB"
                  },
                  ticks: { color: "#9CA3AF", maxTicksLimit: 10 },
                  grid: { color: "rgba(229,231,235,0.1)" }
                }
              }
            }}
          />
        </div>
      </div>
    );
  }

  // ================================
  // Render Charts
  // ================================
  return (
    <div className="space-y-8">
      {/* Grid for Pie & Monte Carlo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        {pieData && (
          <div className="bg-gray-900 p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4 text-indigo-400">
              Portfolio Allocation
            </h3>
            <div className="h-80">
              <Pie
                data={pieData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { color: "#E5E7EB" }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Monte Carlo Simulation */}
        {lineData && (
          <div className="bg-gray-900 p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4 text-indigo-400">
              Monte Carlo Simulation
            </h3>
            <div className="h-80">
              <Line
                data={lineData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: "bottom",
                      labels: {
                        color: "#E5E7EB",
                        filter: (legendItem) => legendItem.text !== ""
                      }
                    }
                  },
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: "Portfolio Value ($)",
                        color: "#E5E7EB"
                      },
                      ticks: { color: "#9CA3AF", maxTicksLimit: 6 },
                      grid: { color: "rgba(229,231,235,0.1)" }
                    },
                    x: {
                      title: {
                        display: true,
                        text: "Time Points",
                        color: "#E5E7EB"
                      },
                      ticks: { color: "#9CA3AF", maxTicksLimit: 9 },
                      grid: { color: "rgba(229,231,235,0.1)" }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Market Index Chart full width */}
      {marketIndexChart && (
        <div className="mx-auto max-w-6xl w-full">{marketIndexChart}</div>
      )}
    </div>
  );

}

export default PortfolioCharts;
