import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
    <nav className="bg-[#121212] text-white font-sans shadow-md px-6 py-4 flex items-center justify-between relative">

      {/* Brand Title */}
      <div className="text-2xl font-bold text-[#1CA65D] tracking-wide">
        QFIN
      </div>

      {/* Hamburger button */}
      <button
        className="text-gray-300 md:hidden text-2xl cursor-pointer hover:bg-[#1A1A1A] px-4 py-1 rounded"
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
      <div className={`absolute top-full right-6 bg-[#1A1A1A] rounded-md shadow-lg p-4 space-y-4 md:space-y-0 md:p-0 md:shadow-none md:relative md:flex md:flex-row md:items-center md:space-x-8 ${menuOpen ? 'block' : 'hidden'} md:block z-20`}>

        <Link to="/home" className="block text-gray-300 font-medium hover:text-[#1CA65D] hover:bg-[#2A2A2A] px-3 py-2 rounded transition">
          Home
        </Link>

        {token ? (
          <>
            <Link to="/create-portfolio" className="block text-gray-300 font-medium hover:text-[#1CA65D] hover:bg-[#2A2A2A] px-3 py-2 rounded transition">
              Create Portfolio
            </Link>
            <Link to="/about" className="block text-gray-300 font-medium hover:text-[#1CA65D] hover:bg-[#2A2A2A] px-3 py-2 rounded transition">
              About Us
            </Link>
            <Link to="/contact" className="block text-gray-300 font-medium hover:text-[#1CA65D] hover:bg-[#2A2A2A] px-3 py-2 rounded transition">
              Contact Us
            </Link>
            <Link to="/auth-test" className="block text-gray-300 font-medium hover:text-[#1CA65D] hover:bg-[#2A2A2A] px-3 py-2 rounded transition">
              Auth Test
            </Link>
            <button
              onClick={logout}
              className="bg-[#1CA65D] text-white px-4 py-2 rounded-md hover:bg-[#178e4b] transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/create-portfolio" className="block text-gray-300 font-medium hover:text-[#1CA65D] hover:bg-[#2A2A2A] px-3 py-2 rounded transition" onClick={() => navigate('/login')}>
              Create Portfolio
            </Link>
            <Link to="/about" className="block text-gray-300 font-medium hover:text-[#1CA65D] hover:bg-[#2A2A2A] px-3 py-2 rounded transition">
              About Us
            </Link>
            <Link to="/contact" className="block text-gray-300 font-medium hover:text-[#1CA65D] hover:bg-[#2A2A2A] px-3 py-2 rounded transition">
              Contact Us
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
