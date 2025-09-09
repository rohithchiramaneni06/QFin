import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import authService from '../services/authservice';
import springBootApi from '../services/springBootApi';

function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '', otp: '' });
  const [showOtpField, setShowOtpField] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  
  // Check for session=expired in URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('session') === 'expired') {
      setSessionExpired(true);
      setError('Your session has expired. Please log in again.');
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // If OTP field is shown, include it in the login request
      const { token, user } = await authService.login({
        username: form.username,
        password: form.password,
        otp: form.otp
      });
      
      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      navigate('/dashboard');
    } catch (err) {
      // Check if the error is due to OTP requirement
      if (err.response?.status === 403 && err.response?.data?.message?.includes('OTP')) {
        setShowOtpField(true);
        setError('Please enter the OTP sent to your email');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOtp = async () => {
    if (!form.username) {
      setError('Please enter your username');
      return;
    }
    
    setLoading(true);
    try {
      await authService.resendOtp(form.username);
      alert('OTP has been resent to your email');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // No longer need OTP for dummy authentication

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f4f8] via-[#e2ecf3] to-[#d6e4f0]">
      <form onSubmit={handleLogin} className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md transition-all duration-300">
        <h2 className="text-3xl font-bold mb-6 text-center text-[#1e3a8a]">Welcome to QFIN</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] transition duration-200"
          onChange={e => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] transition duration-200"
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        
        {showOtpField && (
          <input
            type="text"
            placeholder="Enter OTP sent to your email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] transition duration-200"
            onChange={e => setForm({ ...form, otp: e.target.value })}
          />
        )}
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <button
          type="submit"
          className="w-full bg-[#1e3a8a] text-white py-2 rounded-md hover:bg-[#1c2f6e] transition duration-300"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Login'}
        </button>
        
        {showOtpField && (
          <button
            type="button"
            className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition duration-300"
            onClick={handleResendOtp}
            disabled={loading}
          >
            Resend OTP
          </button>
        )}
        <p className="text-sm mt-4 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#1e3a8a] font-semibold hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
export default LoginPage;

