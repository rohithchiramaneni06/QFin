import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { portfolioService } from '../api/api';

function Comparison() {
  const navigate = useNavigate();
  
  // State variables
  const [risk, setRisk] = useState(50); // Default risk level (0-100)
  const [amount, setAmount] = useState(10000); // Default investment amount
  const [time, setTime] = useState(5); // Default investment horizon in years
  const [numAssets, setNumAssets] = useState(4); // Default number of assets to select
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to calculate portfolio comparison
  const calculateComparison = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await portfolioService.comparePortfolios(
        risk / 100, // Convert to 0-1 scale
        amount,
        time,
        numAssets
      );
      
      if (response.data.success) {
        setComparisonData(response.data.data);
      } else {
        setError('Failed to calculate portfolio comparison');
      }
    } catch (err) {
      console.error('Error calculating portfolio comparison:', err);
      setError('An error occurred while calculating portfolio comparison');
    } finally {
      setLoading(false);
    }
  };

  // Format percentage values for display
  const formatPercent = (value) => {
    return (value * 100).toFixed(2) + '%';
  };

  // Format currency values for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Quantum vs Classical Portfolio Comparison</h1>
        
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Risk Tolerance ({risk}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={risk}
                onChange={(e) => setRisk(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Investment Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Horizon (years)</label>
              <input
                type="number"
                value={time}
                onChange={(e) => setTime(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Assets</label>
              <input
                type="number"
                value={numAssets}
                onChange={(e) => setNumAssets(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={calculateComparison}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Calculating...' : 'Calculate Portfolio Comparison'}
            </button>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8" role="alert">
            <p>{error}</p>
          </div>
        )}
      
        {/* Results Comparison */}
        {comparisonData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quantum Portfolio Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-purple-600 text-white px-6 py-4">
                <h2 className="text-xl font-bold">Quantum Portfolio</h2>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Selected Assets</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {comparisonData.quantum.selected_assets.map((asset, index) => (
                    <div key={index} className="bg-gray-100 rounded-md p-3">
                      <p className="font-medium">{asset}</p>
                      <p className="text-sm text-gray-600">
                        Weight: {formatPercent(comparisonData.quantum.weights[asset] || 0)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Expected Return</p>
                      <p className="font-semibold">{formatPercent(comparisonData.quantum.expected_return)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Portfolio Volatility</p>
                      <p className="font-semibold">{formatPercent(comparisonData.quantum.volatility)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sharpe Ratio</p>
                      <p className="font-semibold">{comparisonData.quantum.sharpe_ratio.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Portfolio Beta</p>
                      <p className="font-semibold">{comparisonData.quantum.portfolio_beta.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Value at Risk (VaR)</p>
                      <p className="font-semibold">{formatPercent(comparisonData.quantum.var)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Classical Portfolio Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-600 text-white px-6 py-4">
                <h2 className="text-xl font-bold">Classical Portfolio</h2>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Selected Assets</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {comparisonData.classical.selected_assets.map((asset, index) => (
                    <div key={index} className="bg-gray-100 rounded-md p-3">
                      <p className="font-medium">{asset}</p>
                      <p className="text-sm text-gray-600">
                        Weight: {formatPercent(comparisonData.classical.weights[asset] || 0)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Expected Return</p>
                      <p className="font-semibold">{formatPercent(comparisonData.classical.expected_return)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Portfolio Volatility</p>
                      <p className="font-semibold">{formatPercent(comparisonData.classical.volatility)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sharpe Ratio</p>
                      <p className="font-semibold">{comparisonData.classical.sharpe_ratio.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Portfolio Beta</p>
                      <p className="font-semibold">{comparisonData.classical.portfolio_beta.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Value at Risk (VaR)</p>
                      <p className="font-semibold">{formatPercent(comparisonData.classical.var)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Investment Details */}
            {comparisonData.investment_details && (
              <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Investment Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Investment Amount</p>
                    <p className="font-semibold">{formatCurrency(comparisonData.investment_details.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Investment Horizon</p>
                    <p className="font-semibold">{comparisonData.investment_details.horizon} years</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Comparison;