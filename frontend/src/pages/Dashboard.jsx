import PortfolioForm from '../components/PortfolioForm';
import PortfolioCharts from '../components/PortfolioCharts';
import { useState } from 'react';
import Navbar from '../components/Navbar';

function Dashboard() {
  const [portfolioData, setPortfolioData] = useState(null);

  return (
  
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">Create Your Portfolio</h2>
      <PortfolioForm setPortfolioData={setPortfolioData} />
      {portfolioData && <PortfolioCharts data={portfolioData} />}
    </div>
  );
}

export default Dashboard;
