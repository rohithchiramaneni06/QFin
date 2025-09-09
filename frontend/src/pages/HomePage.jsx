import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import StockDataGrid from "../components/StockDataGrid";
import PortfolioCharts from "../components/PortfolioCharts";

// Mapping of ticker -> full company/asset name
const ASSETS = [
  { ticker: "AAPL", name: "Apple Inc." },
  { ticker: "MSFT", name: "Microsoft Corp." },
  { ticker: "NVDA", name: "NVIDIA Corp." },
  { ticker: "GOOGL", name: "Alphabet Inc." },
  { ticker: "AMZN", name: "Amazon.com Inc." },
  { ticker: "META", name: "Meta Platforms Inc." },
  { ticker: "JNJ", name: "Johnson & Johnson" },
  { ticker: "KO", name: "Coca-Cola Co." },
  { ticker: "JPM", name: "JPMorgan Chase & Co." },
  { ticker: "BRK-B", name: "Berkshire Hathaway Inc. (B)" },
  { ticker: "ORCL", name: "Oracle Corp." },
  { ticker: "GE", name: "General Electric Co." },
  { ticker: "IEF", name: "iShares 7-10 Year Treasury Bond ETF" },
  { ticker: "HYG", name: "iShares iBoxx $ High Yield Corporate Bond ETF" },
  { ticker: "GLD", name: "SPDR Gold Shares" },
  { ticker: "IAU", name: "iShares Gold Trust" },
  { ticker: "BTC-USD", name: "Bitcoin" }
];

function HomePage() {
  const [selectedAsset, setSelectedAsset] = useState("GLD");   // default asset
  const [marketIndexData, setMarketIndexData] = useState([]);  // index data

  useEffect(() => {
    if (!selectedAsset) return;

    axios
      .post("http://localhost:5000/api/portfolio/market-index", { ticker: selectedAsset })
      .then((res) => {
        if (res.data.success) {
          setMarketIndexData(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching market index:", err);
      });
  }, [selectedAsset]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-950 p-6">
        
        {/* Page Title */}
        <h2 className="mb-6 text-center text-3xl font-bold text-indigo-400">
          Live Market Overview
        </h2>

        {/* Asset Selector */}
        <div className="mb-6 flex justify-center">
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="rounded-md border border-gray-700 bg-gray-900 px-8 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {ASSETS.map((asset) => (
              <option key={asset.ticker} value={asset.ticker}>
                {asset.name}
              </option>
            ))}
          </select>
        </div>

        {/* Market Index Chart */}
        <div className="mx-auto max-w-6xl mt-10">
          <PortfolioCharts marketIndexData={marketIndexData} />
        </div>

        {/* Stock Data Table */}
        <div className="mx-auto max-w-6xl mt-10">
          <StockDataGrid />
        </div>
      </div>
    </>
  );
}

export default HomePage;
