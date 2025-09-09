import axios from "axios";
import springBootApi from "../services/springBootApi";

// Flask API URL (kept for non-auth endpoints)
const FLASK_API_URL = "http://localhost:5000/api";

// Save token + user in localStorage
const setSession = (token, user) => {
  if (token) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }
};

// Register a new user
const register = async (userData) => {
  try {
    const response = await springBootApi.post("/auth/signup", userData);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    if (error.originalError) {
      // This is our formatted error from the interceptor
      throw error;
    } else {
      throw {
        message: error.response?.data?.message || "Registration failed. Please try again.",
        originalError: error.response?.data
      };
    }
  }
};

// Login user
const login = async (credentials) => {
  try {
    const response = await springBootApi.post("/auth/login", credentials);

    // Spring Boot returns just the token in AuthResponse
    const { token } = response.data;
    
    // Create a user object with username from credentials
    const user = {
      username: credentials.username,
    };

    setSession(token, user);
    return { token, user };
  } catch (error) {
    console.error("Login error:", error);
    if (error.originalError) {
      // This is our formatted error from the interceptor
      throw error;
    } else {
      throw {
        message: error.response?.data?.message || "Login failed. Please check your credentials.",
        originalError: error.response?.data
      };
    }
  }
};

// Verify OTP
const verifyOtp = async (username, otp) => {
  try {
    const response = await springBootApi.post("/auth/verify-otp", { username, otp });
    
    // If verification is successful and returns a token, save it
    if (response.data.token) {
      const user = { username };
      setSession(response.data.token, user);
    }
    
    return response.data;
  } catch (error) {
    console.error("OTP verification error:", error);
    if (error.originalError) {
      // This is our formatted error from the interceptor
      throw error;
    } else {
      throw {
        message: error.response?.data?.message || "OTP verification failed. Please try again.",
        originalError: error.response?.data
      };
    }
  }
};

// Resend OTP
const resendOtp = async (username) => {
  try {
    const response = await springBootApi.post("/auth/resend-otp", { username });
    return response.data;
  } catch (error) {
    console.error("Resend OTP error:", error);
    if (error.originalError) {
      // This is our formatted error from the interceptor
      throw error;
    } else {
      throw {
        message: error.response?.data?.message || "Failed to resend OTP. Please try again.",
        originalError: error.response?.data
      };
    }
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // Redirect to login page
  window.location.href = "/login";
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token; // Return true if token exists
};

// Get current user
const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error("Error parsing user from localStorage", e);
    return null;
  }
};

export const authService = {
  register,
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  verifyOtp,
  resendOtp
};

export default authService;
