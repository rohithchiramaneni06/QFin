import { Link } from 'react-router-dom';
import heroImage from '../assets/hero-finance.jpeg';

function LandingPage() {
  return (
    <div className="bg-[#040D07] text-white font-sans">
      {/* Header */}
      <header className="max-w-screen-2xl mx-auto flex justify-between items-center px-6 py-6">
        <h1 className="text-2xl font-bold">QFIN</h1>
        <nav className="flex items-center gap-3 text-sm font-medium">
          <Link to="/login" className="bg-[#1CA65D] hover:bg-[#178e4b] text-white px-4 py-2 rounded-lg transition font-bold text-center w-[100px]">
            Login
          </Link>
          <Link to="/register" className="bg-[#1CA65D] hover:bg-[#178e4b] text-white px-4 py-2 rounded-lg transition font-bold text-center w-[100px]">
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center px-6 py-20 gap-12">
        {/* Text Side */}
        <div className="md:pl-12">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Optimize Your Portfolio With <span className="text-[#1CA65D]">Quantum Precision</span>
          </h2>
          <p className="text-gray-400 mb-6 text-sm">
            Quantum Portfolio Optimization uses advanced quantum algorithms to generate risk-aware, high-performance investment strategies tailored to your financial goals.
          </p>
          <Link
            to="/register"
            className="inline-block bg-[#1CA65D] hover:bg-[#178e4b] px-6 py-3 rounded-lg font-bold transition transform hover:scale-105"
          >
            Get Started
          </Link>
        </div>

        {/* Image Side */}
        <div className="flex justify-center relative -mt-6">
          <img
            src={heroImage}
            alt="Quantum Finance Visual"
            className="w-[400px] h-[400px] object-cover rounded-xl transition duration-300 ease-in-out hover:scale-105"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#051610] px-6 py-14">
        <div className="max-w-screen-2xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-16 text-white">HOW IT WORKS</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { title: 'Acquire', desc: 'Gather historical asset prices and financial data.' },
              { title: 'Analyze', desc: 'Compute expected returns and risk metrics.' },
              { title: 'Model', desc: 'Formulate the return-risk tradeoff as an optimization problem.' },
              { title: 'Transform', desc: 'Convert the model into a QUBO for quantum processing.' },
              { title: 'Execute', desc: 'Run quantum algorithms to explore optimal portfolios.' },
              { title: 'Select', desc: 'Reveal the best-performing asset mix based on user-defined risk.' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-[#040D07] p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg hover:scale-105 transition transform"
              >
                <div className="bg-[#1CA65D] w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg">
                  {item.title[0]}
                </div>
                <h4 className="text-xl font-bold mb-2 text-[#1CA65D]">{item.title}</h4>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#051610] px-6 py-14">
        <div className="max-w-screen-2xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-16 text-white">FEATURES</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { title: 'Quantum Optimization', desc: 'Cutting-edge algorithms for smarter investing.' },
              { title: 'Interactive Charts', desc: 'Explore your data with powerful visual tools.' },
              { title: 'Precision', desc: 'Delivering mathematically optimized portfolios with quantum-level accuracy.' },
              { title: 'RiskSlider', desc: 'Adjust your risk tolerance to instantly reshape portfolio recommendations.' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-[#040D07] p-6 rounded-xl shadow-md flex flex-col justify-center items-center aspect-square text-center cursor-pointer hover:shadow-lg hover:scale-105 transition transform"
              >
                <h4 className="text-xl font-bold mb-2 text-[#1CA65D]">{item.title}</h4>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#040D07] text-gray-400 py-10">
        <div className="max-w-screen-2xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Brand Info */}
          <div>
            <h4 className="text-xl font-bold text-white mb-2">QFIN</h4>
            <p className="text-sm text-gray-400">Quantum-powered portfolio optimization for smarter investing.</p>
          </div>

          {/* Navigation Links */}
          <div>
            <h5 className="text-md font-semibold text-white mb-2">Explore</h5>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-[#1CA65D] transition">Login</Link></li>
              <li><Link to="/register" className="hover:text-[#1CA65D] transition">Sign Up</Link></li>
            </ul>
          </div>

          {/* Social or Contact */}
          <div>
            <h5 className="text-md font-semibold text-white mb-2">Connect</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-[#1CA65D] transition">LinkedIn</a></li>
              <li><a href="#" className="hover:text-[#1CA65D] transition">GitHub</a></li>
              <li><a href="#" className="hover:text-[#1CA65D] transition">Contact Us</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-10 text-center text-xs text-gray-500">
          © 2025 QFIN. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
