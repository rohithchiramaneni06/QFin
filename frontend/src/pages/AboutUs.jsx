import Navbar from '../components/Navbar';

const TEAM_MEMBERS = [
  { name: "Bhargavi N", role: "Frontend Developer", image: "https://i.pravatar.cc/150?img=5", },
  { name: "Vijaya Laksmi G", role: "Backend Developer", image: "https://i.pravatar.cc/150?img=2" },
  { name: "Nikhil M", role: "Data Analyst & Feature Engineer", image: "https://i.pravatar.cc/150?img=6" },
  { name: "Madhu Sudhan CH", role: "UI/UX Designer", image: "https://i.pravatar.cc/150?img=4" },
  { name: "Adhiksha Reddy U", role: "Data Scientist & Quantum Engineer", image: "https://i.pravatar.cc/150?img=1" },
  { name: "Rohith CH", role: "Project Manager & Finance Analyst", image: "https://i.pravatar.cc/150?img=3" }
];

function AboutUs() {
  return (
    <>
      <Navbar />
      <div className="bg-gray-950 min-h-screen text-gray-200 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Project Overview */}
          <h2 className="text-3xl font-bold text-indigo-400 mb-2">About QFIN</h2>
          <p className="text-lg leading-relaxed">
            QFIN is a cutting-edge investment platform that leverages both classical financial models and quantum computing algorithms to optimize portfolios.
            Over the past few days, we have developed a system capable of:
          </p>
          <ul className="list-disc list-inside text-lg space-y-1">
            <li>Fetching live market data for a wide range of assets including equities, ETFs, bonds, and cryptocurrencies.</li>
            <li>Performing portfolio optimization with classical and quantum-inspired algorithms to maximize returns for a given risk tolerance.</li>
            <li>Simulating portfolio performance over time using Monte Carlo simulations for better risk assessment.</li>
            <li>Visualizing portfolio allocation, projected growth, and market index comparisons through interactive charts.</li>
            <li>Providing a sleek, dark-themed dashboard that is both user-friendly and informative.</li>
          </ul>

          <p className="text-lg leading-relaxed">
            Our platform is designed for both novice and experienced investors. Users can select assets, adjust risk preferences, and explore projected portfolio performance, all powered by data-driven insights.
          </p>

          {/* Developed By Section */}
          <h2 className="text-3xl font-bold text-indigo-400 mt-10 mb-4">Developed By</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM_MEMBERS.map((member, idx) => (
              <div key={idx} className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-indigo-500 transition flex flex-col items-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-indigo-400">{member.name}</h3>
                <p className="text-gray-300">{member.role}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-gray-400 text-sm text-center">
            © 2025 QFIN. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}

export default AboutUs;
