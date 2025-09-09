import { useState } from 'react';
import { portfolioService } from '../api/api';

function PortfolioForm({ setPortfolioData }) {
  const [form, setForm] = useState({
    amount: '',
    years: '',
    risk: '',
    tickers: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!form.tickers) {
      setError('Please enter stock tickers');
      return;
    }
    
    if (!form.startDate || !form.endDate) {
      setError('Please select start and end dates');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Parse tickers from comma-separated string
      const tickerList = form.tickers.split(',').map(ticker => ticker.trim());
      
      // First fetch stock data
      await portfolioService.fetchStockData(
        tickerList,
        form.startDate,
        form.endDate
      );
      
      // Then optimize portfolio
      const optimizeResponse = await portfolioService.optimizePortfolio(
        tickerList,
        null, // Let the backend calculate weights
        parseFloat(form.risk) / 100, // Convert risk percentage to 0-1 scale
        form.startDate,
        form.endDate
      );
      
      // Get portfolio metrics
      const metricsResponse = await portfolioService.getPortfolioMetrics(
        tickerList,
        optimizeResponse.data.weights,
        form.startDate,
        form.endDate
      );
      
      // Format the data for the frontend
      const allocation = tickerList.map((ticker, i) => ({
        company: ticker,
        stock: ticker,
        weight: (optimizeResponse.data.weights[i] * 100).toFixed(2),
        return: (metricsResponse.data.expected_returns[i] * 100).toFixed(2),
        volatility: (metricsResponse.data.volatility * 100).toFixed(2),
        beta: (0.8 + i * 0.1).toFixed(2) // Placeholder as beta might not be provided
      }));
      
      const metrics = {
        expectedReturn: (metricsResponse.data.portfolio_return * 100).toFixed(2),
        volatility: (metricsResponse.data.portfolio_volatility * 100).toFixed(2),
        sharpeRatio: metricsResponse.data.sharpe_ratio.toFixed(2),
        var95: metricsResponse.data.var_95.toFixed(2),
        cvar95: metricsResponse.data.cvar_95.toFixed(2),
        roi5yr: ((Math.pow(1 + metricsResponse.data.portfolio_return, 5) - 1) * 100).toFixed(2)
      };
      
      setPortfolioData({ allocation, metrics });
    } catch (err) {
      console.error('Portfolio optimization failed:', err);
      // Use the formatted error message from our API interceptors if available
      if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to optimize portfolio. Please check your inputs and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="number" placeholder="Investment Amount" className="w-full px-4 py-2 border rounded-md" onChange={e => setForm({ ...form, amount: e.target.value })} />
        <input type="number" placeholder="Years" className="w-full px-4 py-2 border rounded-md" onChange={e => setForm({ ...form, years: e.target.value })} />
        <input type="number" placeholder="Risk %" className="w-full px-4 py-2 border rounded-md" onChange={e => setForm({ ...form, risk: e.target.value })} />
        <input type="text" placeholder="Stock Tickers (comma separated)" className="w-full px-4 py-2 border rounded-md" onChange={e => setForm({ ...form, tickers: e.target.value })} />
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Start Date</label>
          <input type="date" className="w-full px-4 py-2 border rounded-md" onChange={e => setForm({ ...form, startDate: e.target.value })} />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">End Date</label>
          <input type="date" className="w-full px-4 py-2 border rounded-md" onChange={e => setForm({ ...form, endDate: e.target.value })} />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md mt-6 w-full hover:bg-indigo-700" disabled={loading}>
        {loading ? 'Optimizing...' : 'Optimize Portfolio'}
      </button>
    </form>
  );
}

export default PortfolioForm;
