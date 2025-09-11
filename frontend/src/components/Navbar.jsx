import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/qfin-logo.png';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/home');
  };

  const handleOverlayClick = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="bg-gray-900 shadow-md px-4 py-4 flex items-center justify-between relative">

      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img src={logo} alt="QFIN" className="h-8" />
        <span className="text-1xl font-bold text-indigo-400"><span className="text-4xl">Q</span>FIN</span>
      </div>

      {/* Hamburger button */}
      <button
        className="text-gray-300 md:hidden text-2xl cursor-pointer hover:bg-gray-800 px-4 py-1 rounded"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        &#9776;
      </button>

      {/* Overlay (click to close menu) */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-15 bg-black opacity-25"
          onClick={handleOverlayClick}
        ></div>
      )}

      {/* Menu Links */}
      <div className={`absolute top-full right-4 bg-gray-900 rounded-md shadow-lg p-4 space-y-4 md:space-y-0 md:p-0 md:shadow-none md:relative md:flex md:flex-row md:items-center md:space-x-8 ${menuOpen ? 'block' : 'hidden'} md:block z-20`}>

        <Link to="/home" className="block text-gray-300 font-medium hover:text-indigo-400 hover:bg-gray-800 px-3 py-2 rounded transition">
          Home
        </Link>

        {token ? (
          <>
            <Link to="/create-portfolio" className="block text-gray-300 font-medium hover:text-indigo-400 hover:bg-gray-800 px-3 py-2 rounded transition">
              Create Portfolio
            </Link>
            <Link
                to="/comparison"
                className="text-gray-300 font-medium hover:text-indigo-400 transition"
              >
                Compare Portfolios
              </Link>
            <Link to="/about" className="block text-gray-300 font-medium hover:text-indigo-400 hover:bg-gray-800 px-3 py-2 rounded transition">
              About Us
            </Link>
            <Link to="/contact" className="block text-gray-300 font-medium hover:text-indigo-400 hover:bg-gray-800 px-3 py-2 rounded transition">
              Contact Us
            </Link>
            <Link to="/auth-test" className="block text-gray-300 font-medium hover:text-indigo-400 hover:bg-gray-800 px-3 py-2 rounded transition">
              Auth Test
            </Link>
            <button
              onClick={logout}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/create-portfolio" className="block text-gray-300 font-medium hover:text-indigo-400 hover:bg-gray-800 px-3 py-2 rounded transition" onClick={() => navigate('/login')}>
              Create Portfolio
            </Link>
            <Link to="/about" className="block text-gray-300 font-medium hover:text-indigo-400 hover:bg-gray-800 px-3 py-2 rounded transition">
              About Us
            </Link>
            <Link to="/contact" className="block text-gray-300 font-medium hover:text-indigo-400 hover:bg-gray-800 px-3 py-2 rounded transition">
              Contact Us
            </Link>

            {/* Sign In and Sign Up side by side with gap */}
            <div className="flex space-x-2">
              <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition text-center">
                Sign In
              </Link>
              <Link to="/signup" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition text-center">
                Sign Up
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
