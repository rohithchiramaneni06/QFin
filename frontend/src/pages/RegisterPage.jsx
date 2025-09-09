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

    // If OTP field is shown, verify OTP
    if (showOtpField) {
      return handleVerifyOtp();
    }

    // ✅ Basic validation
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

    // ✅ Prepare payload (adjust keys to match backend)
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
      
      // If we got a token, user is verified and logged in
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f4f8] via-[#e2ecf3] to-[#d6e4f0]">
      <form
        onSubmit={handleRegister}
        className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md transition-all duration-300"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-[#1e3a8a]">
          Create Your QFIN Account
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="date"
          value={form.dob}
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
          onChange={(e) => setForm({ ...form, dob: e.target.value })}
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={form.phone}
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
        />

        {showOtpField && (
          <input
            type="text"
            placeholder="Enter OTP sent to your email"
            value={otp}
            className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
            onChange={(e) => setOtp(e.target.value)}
          />
        )}

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-[#1e3a8a] text-white py-2 rounded-md hover:bg-[#1c2f6e] transition duration-300"
          disabled={loading}
        >
          {loading ? 'Processing...' : showOtpField ? 'Verify OTP' : 'Register'}
        </button>
        
        {showOtpField && (
          <button
            type="button"
            className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition duration-300"
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

        <p className="text-sm mt-4 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1e3a8a] font-semibold hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
