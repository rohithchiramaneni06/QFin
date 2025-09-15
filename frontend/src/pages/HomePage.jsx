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
  const [selectedAsset, setSelectedAsset] = useState("GLD");
  const [marketIndexData, setMarketIndexData] = useState([]);

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
      <div className="min-h-screen bg-[#121212] text-white font-sans px-6 py-10">

        {/* Page Title */}
        <h2 className="text-center text-3xl font-bold text-white tracking-wide mb-10">
          Live Market Overview
        </h2>

        {/* Asset Selector */}
        <div className="flex justify-center mb-10">
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="bg-[#2A2A2A] text-white border border-gray-600 rounded-lg px-6 py-3
                       focus:outline-none focus:ring-[1px] focus:ring-gray-500 transition duration-200"
          >
            {ASSETS.map((asset) => (
              <option key={asset.ticker} value={asset.ticker} className="bg-[#2A2A2A] text-white">
                {asset.name}
              </option>
            ))}
          </select>
        </div>

        {/* Market Index Chart */}
        {marketIndexData.length > 0 && (
          <div className="mx-auto max-w-6xl bg-[#1A1A1A] p-6 rounded-xl shadow-md mb-10">
            <PortfolioCharts marketIndexData={marketIndexData} />
          </div>
        )}

        {/* Stock Data Table */}
        <div className="mx-auto max-w-6xl bg-[#1A1A1A] p-6 rounded-xl shadow-md">
          <StockDataGrid />
        </div>
      </div>
    </>
  );
}

export default HomePage;
