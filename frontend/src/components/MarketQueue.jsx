import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const MarketQueue = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarketTrends = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/portfolio/market-trends');
        setMarketData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching market trends:', err);
        setError('Unable to load market data');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketTrends();

    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchMarketTrends, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 text-white py-2 px-4 overflow-hidden">
        <div className="flex items-center justify-center h-8">
          <div className="animate-pulse flex space-x-4">
            <div className="h-3 w-24 bg-gray-700 rounded"></div>
            <div className="h-3 w-12 bg-gray-700 rounded"></div>
            <div className="h-3 w-24 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 text-white py-2 px-4 overflow-hidden">
        <div className="flex items-center justify-center h-8">
          <span className="text-red-400">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 text-white py-2 px-4 overflow-hidden border-b border-gray-800">
      <div className="mx-auto max-w-6xl w-full bg-gray-950">
        <marquee behavior="scroll" direction="left" scrollamount="5" onMouseOver={(e) => e.target.stop()} onMouseOut={(e) => e.target.start()}>
          {marketData.map((item, index) => (
            <span key={index} className="mx-8 inline-flex items-center">
              <span className="font-medium">{item.symbol}</span>
              <span className={`flex items-center ml-2 ${item.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {item.trend === 'up' ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                {item.change}
              </span>
            </span>
          ))}
        </marquee>
      </div>
    </div>
  );
};

export default MarketQueue;
