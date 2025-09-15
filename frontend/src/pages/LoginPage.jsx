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
      const { token, user } = await authService.login({
        username: form.username,
        password: form.password,
        otp: form.otp
      });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
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

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans flex items-center justify-center px-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-[#1A1A1A] p-8 rounded-xl shadow-md transition-all duration-300 space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-white tracking-wide">
          Welcome to QFIN
        </h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full px-4 py-3 bg-[#2A2A2A] text-white placeholder-gray-400
                     border border-gray-600 rounded-lg focus:outline-none focus:ring-[1px] focus:ring-gray-500
                     transition duration-200"
          onChange={e => setForm({ ...form, username: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 bg-[#2A2A2A] text-white placeholder-gray-400
                     border border-gray-600 rounded-lg focus:outline-none focus:ring-[1px] focus:ring-gray-500
                     transition duration-200"
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        {showOtpField && (
          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full px-4 py-3 bg-[#2A2A2A] text-white placeholder-gray-400
                       border border-gray-600 rounded-lg focus:outline-none focus:ring-[1px] focus:ring-gray-500
                       transition duration-200"
            onChange={e => setForm({ ...form, otp: e.target.value })}
          />
        )}

        {error && (
          <p className="text-[#EF4444] text-sm text-center animate-pulse">{error}</p>
        )}

        <button
          type="submit"
          className={`w-full py-3 rounded-lg font-semibold transition duration-300 ${
            loading
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-[#1CA65D] hover:bg-[#178e4b] text-white'
          }`}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Login'}
        </button>

        {showOtpField && (
          <button
            type="button"
            className={`w-full py-3 rounded-lg font-semibold transition duration-300 ${
              loading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-[#2D4733] hover:bg-[#1f3a2a] text-white'
            }`}
            onClick={handleResendOtp}
            disabled={loading}
          >
            Resend OTP
          </button>
        )}

        <p className="text-center text-sm text-gray-400">
          Don’t have an account?{' '}
          <Link
            to="/register"
            className="text-[#1CA65D] font-semibold hover:underline transition duration-200"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
