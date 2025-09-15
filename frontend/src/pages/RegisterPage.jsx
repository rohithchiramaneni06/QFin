import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authservice';
import springBootApi from '../services/springBootApi';

function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    dob: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showOtpField, setShowOtpField] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (showOtpField) return handleVerifyOtp();

    const requiredFields = ['name', 'email', 'password', 'confirmPassword'];
    for (let field of requiredFields) {
      if (!form[field]) {
        setError(`Please fill in your ${field.replace(/([A-Z])/g, ' $1')}`);
        return;
      }
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const payload = {
      username: form.name,
      email: form.email,
      phone: form.phone || '',
      password: form.password,
      dob: form.dob || ''
    };

    setLoading(true);
    try {
      await authService.register(payload);
      setShowOtpField(true);
      setError('');
    } catch (err) {
      console.error('Registration failed:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter the OTP sent to your email');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyOtp(form.name, otp);
      if (response.token) {
        alert('Registration successful! You are now logged in.');
        navigate('/');
      } else {
        alert('Registration successful! Please login with your credentials.');
        navigate('/login');
      }
    } catch (err) {
      console.error('OTP verification failed:', err);
      setError(
        err.message ||
        err.response?.data?.message ||
        'OTP verification failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans flex items-center justify-center px-6">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-[#1A1A1A] p-8 rounded-xl shadow-md transition-all duration-300 space-y-4"
      >
        <h2 className="text-3xl font-bold text-center text-white tracking-wide mb-4">
          Create Your QFIN Account
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          className="w-full px-4 py-3 bg-[#2A2A2A] text-white placeholder-gray-400
                     border border-gray-600 rounded-lg focus:outline-none focus:ring-[1px] focus:ring-gray-500
                     transition duration-200"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="date"
          value={form.dob}
          className="w-full px-4 py-3 bg-[#2A2A2A] text-white
                     border border-gray-600 rounded-lg focus:outline-none focus:ring-[1px] focus:ring-gray-500
                     transition duration-200"
          onChange={(e) => setForm({ ...form, dob: e.target.value })}
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={form.phone}
          className="w-full px-4 py-3 bg-[#2A2A2A] text-white placeholder-gray-400
                     border border-gray-600 rounded-lg focus:outline-none focus:ring-[1px] focus:ring-gray-500
                     transition duration-200"
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          className="w-full px-4 py-3 bg-[#2A2A2A] text-white placeholder-gray-400
                     border border-gray-600 rounded-lg focus:outline-none focus:ring-[1px] focus:ring-gray-500
                     transition duration-200"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          className="w-full px-4 py-3 bg-[#2A2A2A] text-white placeholder-gray-400
                     border border-gray-600 rounded-lg focus:outline-none focus:ring-[1px] focus:ring-gray-500
                     transition duration-200"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          className="w-full px-4 py-3 bg-[#2A2A2A] text-white placeholder-gray-400
                     border border-gray-600 rounded-lg focus:outline-none focus:ring-[1px] focus:ring-gray-500
                     transition duration-200"
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        />

        {showOtpField && (
          <input
            type="text"
            placeholder="Enter OTP sent to your email"
            value={otp}
            className="w-full px-4 py-3 bg-[#2A2A2A] text-white placeholder-gray-400
                       border border-gray-600 rounded-lg focus:outline-none focus:ring-[1px] focus:ring-gray-500
                       transition duration-200"
            onChange={(e) => setOtp(e.target.value)}
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
          {loading ? 'Processing...' : showOtpField ? 'Verify OTP' : 'Register'}
        </button>

        {showOtpField && (
          <button
            type="button"
            className={`w-full py-3 rounded-lg font-semibold transition duration-300 ${
              loading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-[#2D4733] hover:bg-[#1f3a2a] text-white'
            }`}
            onClick={async () => {
              try {
                setLoading(true);
                await authService.resendOtp(form.name);
                alert('OTP has been resent to your email');
              } catch (err) {
                setError(err.message || 'Failed to resend OTP. Please try again.');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            Resend OTP
          </button>
        )}

        <p className="text-sm text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1CA65D] font-semibold hover:underline transition duration-200">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
