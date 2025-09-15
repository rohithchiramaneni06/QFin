import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Navbar from '../components/Navbar';
import PortfolioCharts from '../components/PortfolioCharts';
import { portfolioService } from '../api/api';

function PortfolioAllocation() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state) {
    navigate('/');
    return null;
  }

  const {
    allocation: initialAllocation,
    metrics: initialMetrics,
    risk: initialRisk,
    k: initialNumAssets,
    amount: initialAmount,
    time: initialTime,
    simulationData: initialSimulationData,
    tableData: initialTableData,
  } = location.state;

  const [risk, setRisk] = useState(initialRisk || 0);
  const [allocation, setAllocation] = useState(initialAllocation || []);
  const [metrics, setMetrics] = useState(initialMetrics || {});
  const [monteCarloData, setMonteCarloData] = useState(initialSimulationData || null);
  const [tableData, setTableData] = useState(initialTableData || null);
  const [loading, setLoading] = useState(false);
  const [numAssets] = useState(initialNumAssets || 0);
  const [amount] = useState(initialAmount || 0);
  const [time] = useState(initialTime || 0);

  const debounceRef = useRef(null);

  const updatePortfolio = async (riskLevel) => {
    setLoading(true);
    try {
      const response = await portfolioService.optimizePortfolio(
        riskLevel / 100,
        amount,
        time,
        numAssets
      );

      const { weights, optimization_metrics, portfolio_projection } = response.data;

      const newAllocation = Object.entries(weights).map(([ticker, weight], i) => ({
        name: ticker,
        weight: (weight * 100).toFixed(2),
        expectedReturn: (optimization_metrics?.expected_returns?.[i] || 0).toFixed(2),
        volatility: (portfolio_projection?.volatility * 100).toFixed(2),
        beta: (0.8 + i * 0.1).toFixed(2),
      }));

      const newMetrics = {
        expectedReturn: (optimization_metrics?.annual_expected_return * 100).toFixed(2),
        volatility: (optimization_metrics?.annual_volatility * 100).toFixed(2),
        sharpeRatio: optimization_metrics?.sharpe_ratio?.toFixed(2) || 'N/A',
        var: optimization_metrics?.VaR_loss || 'N/A',
        portfolio_beta: portfolio_projection?.portfolio_beta?.toFixed(2) || 'N/A',
        roi: portfolio_projection?.ROI,
        expectedReturnAmount: portfolio_projection?.projected_value?.toFixed(2),
        totalInvestment: portfolio_projection?.total_investment?.toFixed(2),
        tenure: portfolio_projection?.investment_horizon,
        rangeLower: portfolio_projection?.range_lower?.toFixed(2),
        rangeUpper: portfolio_projection?.range_upper?.toFixed(2),
      };

      setAllocation(newAllocation);
      setMetrics(newMetrics);

      const tableResponse = await portfolioService.getTableData(weights, amount, time);
      setTableData(tableResponse.data.data);

      const simulationresponse = await portfolioService.simulatePortfolio(
        riskLevel / 100,
        amount,
        time,
        numAssets
      );
      if (simulationresponse.data.success) {
        setMonteCarloData(simulationresponse.data.data);
      }
    } catch (error) {
      console.error('Error updating portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Portfolio Metrics', 14, 30);

    const metricsText = Object.entries(metrics)
      .map(([key, val]) => `${key}: ${val}`)
      .join('\n');
    
    doc.setFontSize(12);
    doc.text(metricsText, 14, 40);

    const startTableY = (Object.keys(metrics).length + 1) * 9 + 5;

    if (tableData && tableData.length) {
      doc.setFontSize(18);
      doc.text('Portfolio Composition', 14, startTableY - 5);
      const tableHeaders = [
        'Company',
        'Market Cap',
        'Returns',
        'Volatility',
        'Sharpe',
        'ROI',
        'Beta',
        'Investment Amount',
      ];

      const tableRows = tableData.map((row) => [
        row.Company,
        row.Market_Cap >= 1e12
          ? `$${(row.Market_Cap / 1e12).toFixed(2)}T`
          : row.Market_Cap >= 1e9
            ? `$${(row.Market_Cap / 1e9).toFixed(2)}B`
            : row.Market_Cap >= 1e6
              ? `$${(row.Market_Cap / 1e6).toFixed(2)}M`
              : `$${row.Market_Cap.toFixed(0)}`,
        row.Returns.toFixed(2),
        row.Volatility.toFixed(2),
        row.Sharpe_Ratio.toFixed(2),
        row.ROE.toFixed(2),
        row.Beta.toFixed(2),
         `$${row.Investment_Amount.toFixed(2)}`,
      ]);
      autoTable(doc, {
        title: 'Portfolio Composition',
        head: [tableHeaders],
        body: tableRows,
        startY: startTableY,
      });
    }

    doc.save('portfolio-report.pdf');
  };


  useEffect(() => {
    if (risk !== initialRisk) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => updatePortfolio(risk), 300);
    }
  }, [risk]);

  useEffect(() => {
    updatePortfolio(risk);
  }, []);

  return (
    <>
      <Navbar />
      <div className="bg-[#121212] min-h-screen p-6 text-white font-sans">
        <div className="max-w-6xl mx-auto space-y-8">

          <h1 className="text-3xl font-bold text-center mb-6 text-white tracking-wide">
            Portfolio Optimization Dashboard
          </h1>

          {/* Risk Slider */}
          <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-md space-y-4">
            <label className="block font-medium text-gray-300">
              Risk Level: {risk}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={risk}
              onChange={(e) => setRisk(Number(e.target.value))}
              className="w-full accent-[#1CA65D]"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>Conservative</span>
              <span>Balanced</span>
              <span>Aggressive</span>
            </div>
          </div>

          {loading && (
            <div className="text-center text-gray-400 py-4">
              Processing...
            </div>
          )}

          {/* Portfolio Metrics */}
          {!loading && (
            <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-6 text-[#1CA65D]">
                Portfolio Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Investment Amount", value: metrics.totalInvestment },
                  { label: "Tenure", value: metrics.tenure },
                  { label: "Expected Return Amount", value: metrics.expectedReturnAmount },
                  { label: "Expected Return per Year", value: `${metrics.expectedReturn}%` },
                  { label: "Volatility per Year", value: `${metrics.volatility}%` },
                  { label: "Sharpe Ratio", value: metrics.sharpeRatio },
                  { label: "Value at Risk (VaR)", value: `${(metrics.var * 100).toFixed(2)}%` },
                  { label: "Beta", value: metrics.portfolio_beta },
                  { label: "Expected ROI", value: `+${(metrics.roi * 100).toFixed(2)}%` },
                ].map((m, i) => (
                  <div key={i} className="p-6 rounded-xl bg-[#2A2A2A] text-center border border-gray-600">
                    <p className="text-sm text-gray-400">{m.label}</p>
                    <h3 className="text-xl font-bold text-[#1CA65D]">{m.value}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && (
            <PortfolioCharts
              data={{ allocation, metrics }}
              monteCarloData={monteCarloData}
            />
          )}

          {/* Stock Allocation Table */}
          {!loading && tableData && tableData.length > 0 && (
            <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-6 text-[#1CA65D]">
                Stock Allocation Details
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#2A2A2A] text-[#1CA65D] text-left text-xs uppercase tracking-wider">
                      <th className="px-6 py-3 border-b border-gray-700">Company</th>
                      <th className="px-6 py-3 border-b border-gray-700">Market Cap</th>
                      <th className="px-6 py-3 border-b border-gray-700">Expected Returns</th>
                      <th className="px-6 py-3 border-b border-gray-700">Volatility</th>
                      <th className="px-6 py-3 border-b border-gray-700">Sharpe Ratio</th>
                      <th className="px-6 py-3 border-b border-gray-700">ROI</th>
                      <th className="px-6 py-3 border-b border-gray-700">Beta</th>
                      <th className="px-6 py-3 border-b border-gray-700">Investment Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((a, idx) => (
                      <tr
                        key={idx}
                        className={`${idx % 2 === 0 ? "bg-[#1A1A1A]" : "bg-[#2A2A2A]"
                          } hover:bg-[#333333] transition`}
                      >
                        <td className="px-6 py-3 border-b border-gray-700 font-medium text-white">
                          {a.Company}
                        </td>
                        <td className="px-6 py-3 border-b border-gray-700 text-gray-400">
                          {a.Market_Cap >= 1e12
                            ? `$${(a.Market_Cap / 1e12).toFixed(2)}T`
                            : a.Market_Cap >= 1e9
                              ? `$${(a.Market_Cap / 1e9).toFixed(2)}B`
                              : a.Market_Cap >= 1e6
                                ? `$${(a.Market_Cap / 1e6).toFixed(2)}M`
                                : `$${a.Market_Cap.toFixed(0)}`}
                        </td>
                        <td className="px-6 py-3 border-b border-gray-700 text-[#1CA65D] font-medium">
                          {a.Returns.toFixed(2)}%
                        </td>
                        <td className="px-6 py-3 border-b border-gray-700 text-[#EF4444]">
                          {a.Volatility.toFixed(2)}%
                        </td>
                        <td className="px-6 py-3 border-b border-gray-700 text-gray-300">
                          {a.Sharpe_Ratio.toFixed(2)}
                        </td>
                        <td className="px-6 py-3 border-b border-gray-700 text-gray-300">
                          {a.ROE.toFixed(2)}
                        </td>
                        <td className="px-6 py-3 border-b border-gray-700 text-gray-300">
                          {a.Beta.toFixed(2)}
                        </td>
                        <td className="px-6 py-3 border-b border-gray-700 text-gray-300">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(a.Investment_Amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && (
            <div className="flex flex-row justify-between mt-4">
              {/* Back Button */}
              <div className="text-left">
                <button
                  onClick={() => navigate('/')}
                  className="bg-[#1CA65D] hover:bg-[#178e4b] text-white px-6 py-3 rounded-lg transition shadow-md"
                >
                  Back to Create Portfolio
                </button>
              </div>

              {/* Export PDF Button */}
              <div className="text-right">
                <button
                  onClick={exportPDF}
                  className="bg-[#2D4733] hover:bg-[#1f3a2a] text-white px-6 py-3 rounded-lg transition shadow-md"
                >
                  Export as PDF
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
export default PortfolioAllocation;
