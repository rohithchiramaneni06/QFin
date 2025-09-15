import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { portfolioService } from '../api/api';

function CreatePortfolio() {
  const [form, setForm] = useState({
    numStocks: '',
    risk: 50,
    tenure: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const optimizePortfolio = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const stockDataResponse = await portfolioService.fetchStockData(true);
      const rawData = stockDataResponse.data;
      const parsed = typeof rawData === "string" ? JSON.parse(rawData) : rawData;

      const availableTickers = parsed?.data?.tickers || [];
      if (!availableTickers.length) {
        throw new Error("No stock tickers available from backend");
      }

      const tickerList = availableTickers.slice(0, Number(formData.numStocks));

      const optimizeResponse = await portfolioService.optimizePortfolio(
        formData.risk / 100,
        Number(formData.amount),
        Number(formData.tenure),
        Number(formData.numStocks)
      );

      const { weights, optimization_metrics, portfolio_projection } = optimizeResponse.data;

      const tableDataResponse = await portfolioService.getTableData(
        weights,
        Number(formData.amount),
        Number(formData.tenure)
      );

      const allocation = Object.entries(weights).map(([ticker, weight], i) => ({
        company: ticker,
        stock: ticker,
        weight: (weight * 100).toFixed(2),
        return: (optimization_metrics?.expected_returns?.[i] || 0).toFixed(2),
        volatility: (portfolio_projection?.volatility * 100).toFixed(2),
        beta: (0.8 + i * 0.1).toFixed(2)
      }));

      const metrics = {
        expectedReturn: (optimization_metrics?.annual_expected_return * 100).toFixed(2),
        volatility: (optimization_metrics?.annual_volatility * 100).toFixed(2),
        sharpeRatio: optimization_metrics?.sharpe_ratio?.toFixed(2) || "N/A",
        var: optimization_metrics?.VaR_loss || "N/A",
        portfolio_beta: portfolio_projection?.portfolio_beta?.toFixed(2) || "N/A",
        roi: portfolio_projection?.ROI?.toFixed(2),
        expectedReturnAmount: portfolio_projection?.projected_value?.toFixed(2),
        totalInvestment: portfolio_projection?.total_investment?.toFixed(2),
        tenure: portfolio_projection?.investment_horizon,
        rangeLower: portfolio_projection?.range_lower?.toFixed(2),
        rangeUpper: portfolio_projection?.range_upper?.toFixed(2)
      };

      const simulationResponse = await portfolioService.simulatePortfolio(
        formData.risk / 100,
        Number(formData.amount),
        Number(formData.tenure),
        Number(formData.numStocks)
      );

      navigate('/portfolio-allocation', {
        state: {
          allocation: allocation,
          metrics: metrics,
          risk: formData.risk,
          k: Number(formData.numStocks),
          amount: Number(formData.amount),
          time: Number(formData.tenure),
          tableData: tableDataResponse.data,
          simulationData: simulationResponse.data
        }
      });

    } catch (err) {
      console.error('Portfolio optimization failed:', err);
      setError(err.message || 'Failed to optimize portfolio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.numStocks || Number(form.numStocks) <= 0) {
      setError('Please enter a valid number of stocks');
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Please enter a valid investment amount');
      return;
    }
    if (!form.tenure || Number(form.tenure) <= 0) {
      setError('Please enter a valid tenure in years');
      return;
    }

    optimizePortfolio(form);
  };

  return (
    <>
      <Navbar />
      <div className="bg-[#121212] min-h-screen text-white font-sans flex items-center justify-center px-6 py-10">
        <div className="max-w-lg w-full bg-[#1A1A1A] p-8 rounded-xl shadow-md transition-all duration-300 space-y-6">
          <h2 className="text-3xl font-bold text-center text-white tracking-wide">
            Create Portfolio
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="number"
              placeholder="No. of Stocks"
              className="w-full px-4 py-3 bg-[#2A2A2A] text-white placeholder-gray-400
                         border border-gray-600 rounded-lg focus:outline-none focus:ring-[1px] focus:ring-gray-500
                         transition duration-200"
              value={form.numStocks}
              onChange={e => setForm({ ...form, numStocks: e.target.value })}
            />

            <input
              type="number"
              placeholder="Risk Level (%)"
              min="0"
              max="100"
              value={form.risk}
              className="w-full px-4 py-3 bg-[#2A2A2A] text-white placeholder-gray-400
                         border border-gray-600 rounded-lg focus:outline-none focus:ring-[1px] focus:ring-gray-500
                         transition duration-200"
              onChange={e => setForm({ ...form, risk: Number(e.target.value) })}
            />

            <input
              type="number"
              placeholder="Tenure (Years)"
              className="w-full px-4 py-3 bg-[#2A2A2A] text-white placeholder-gray-400
                         border border-gray-600 rounded-lg focus:outline-none focus:ring-[1px] focus:ring-gray-500
                         transition duration-200"
              value={form.tenure}
              onChange={e => setForm({ ...form, tenure: e.target.value })}
            />

            <input
              type="number"
              placeholder="Investment Amount"
              className="w-full px-4 py-3 bg-[#2A2A2A] text-white placeholder-gray-400
                         border border-gray-600 rounded-lg focus:outline-none focus:ring-[1px] focus:ring-gray-500
                         transition duration-200"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
            />

            {error && <p className="text-[#EF4444] text-sm text-center animate-pulse">{error}</p>}

            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold transition duration-300 ${
                loading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-[#1CA65D] hover:bg-[#178e4b] text-white'
              }`}
              disabled={loading}
            >
              {loading ? 'Optimizing...' : 'Optimize Portfolio'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreatePortfolio;
