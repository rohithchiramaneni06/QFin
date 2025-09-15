import React, { useEffect, useState } from 'react';
import axios from 'axios';

function StockDataGrid() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/portfolio/stocks')
      .then(res => {
        setStocks(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching stock data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-6">
        Loading market data...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-[#1A1A1A] rounded-xl shadow-md p-6">
      <table className="min-w-full table-auto border-collapse text-sm text-white font-sans">
        <thead className="bg-[#2A2A2A] text-[#1CA65D]">
          <tr>
            {["Company", "Ticker", "Close", "Market Cap", "Beta", "P/E", "Dividend Yield", "ROE"].map((header) => (
              <th key={header} className="px-4 py-3 text-left font-semibold tracking-wide">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock, idx) => (
            <tr key={idx} className="hover:bg-[#2D2D2D] transition duration-200">
              <td className="px-4 py-3 text-gray-300">{stock.Company}</td>
              <td className="px-4 py-3 text-gray-300">{stock.Ticker}</td>
              <td className="px-4 py-3 text-gray-300">${stock.Close?.toFixed(2)}</td>
              <td className="px-4 py-3 text-gray-300">
                {stock.Market_Cap >= 1e12
                  ? `$${(stock.Market_Cap / 1e12).toFixed(2)}T`
                  : stock.Market_Cap >= 1e9
                  ? `$${(stock.Market_Cap / 1e9).toFixed(2)}B`
                  : stock.Market_Cap >= 1e6
                  ? `$${(stock.Market_Cap / 1e6).toFixed(2)}M`
                  : `$${stock.Market_Cap.toFixed(0)}`}
              </td>
              <td className="px-4 py-3 text-gray-300">{stock.Beta}</td>
              <td className="px-4 py-3 text-gray-300">{stock.P_E?.toFixed(2)}</td>
              <td className="px-4 py-3 text-gray-300">{stock.Dividend_Yield}</td>
              <td className="px-4 py-3 text-gray-300">{stock.ROE?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StockDataGrid;
