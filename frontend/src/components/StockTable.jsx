import { useEffect, useState } from 'react';
import axios from 'axios';

function StockTable() {
  const [stocks, setStocks] = useState([]);

  {/*useEffect(() => {
    axios.get('http://localhost:8080/api/stocks')
      .then(res => setStocks(res.data))
      .catch(err => console.error('Error fetching stocks:', err));
  }, []);*/}

useEffect(() => {
  setStocks([
    { name: 'AAPL', equity: 'Tech', marketCap: '2.5T', price: '189.23' },
    { name: 'MSFT', equity: 'Tech', marketCap: '2.3T', price: '328.45' },
    { name: 'JPM', equity: 'Finance', marketCap: '500B', price: '145.67' },
    { name: 'XOM', equity: 'Energy', marketCap: '400B', price: '112.34' },
    // Add 13 more to total 17 stocks
  ]);
}, []);



  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead className="bg-indigo-100">
          <tr>
            <th className="px-4 py-2 text-left">Stock</th>
            <th className="px-4 py-2 text-left">Equity</th>
            <th className="px-4 py-2 text-left">Market Cap</th>
            <th className="px-4 py-2 text-left">Live Price</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-2">{s.name}</td>
              <td className="px-4 py-2">{s.equity}</td>
              <td className="px-4 py-2">{s.marketCap}</td>
              <td className="px-4 py-2">{s.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StockTable;
