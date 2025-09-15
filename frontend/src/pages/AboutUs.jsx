import Navbar from '../components/Navbar';

const TEAM_MEMBERS = [
  { name: "Bhargavi N", role: "Frontend Developer", image: "https://i.pravatar.cc/150?img=5" },
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
      <div className="bg-[#121212] min-h-screen text-white font-sans px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Project Overview */}
          <h2 className="text-3xl font-bold text-white tracking-wide">About QFIN</h2>
          <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-md space-y-4">
            <p className="text-base leading-relaxed text-gray-300">
              QFIN is a cutting-edge investment platform that leverages both classical financial models and quantum computing algorithms to optimize portfolios.
              Over the past few days, we have developed a system capable of:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 text-sm">
              <li>Fetching live market data for a wide range of assets including equities, ETFs, bonds, and cryptocurrencies.</li>
              <li>Performing portfolio optimization with classical and quantum-inspired algorithms to maximize returns for a given risk tolerance.</li>
              <li>Simulating portfolio performance over time using Monte Carlo simulations for better risk assessment.</li>
              <li>Visualizing portfolio allocation, projected growth, and market index comparisons through interactive charts.</li>
              <li>Providing a sleek, dark-themed dashboard that is both user-friendly and informative.</li>
            </ul>
            <p className="text-base leading-relaxed text-gray-300">
              Our platform is designed for both novice and experienced investors. Users can select assets, adjust risk preferences, and explore projected portfolio performance, all powered by data-driven insights.
            </p>
          </div>

          {/* Developed By Section */}
          <h2 className="text-3xl font-bold text-white tracking-wide">Developed By</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM_MEMBERS.map((member, idx) => (
              <div
                key={idx}
                className="bg-[#1A1A1A] p-6 rounded-xl shadow-md hover:shadow-gray-600 transition duration-200 flex flex-col items-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mb-4 object-cover border border-gray-600"
                />
                <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-gray-400">{member.role}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <p className="mt-10 text-center text-sm text-gray-500">
            © 2025 QFIN. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}

export default AboutUs;
