import axios from "axios";

// Flask API URL - Use environment variable with fallback
const FLASK_API_URL = import.meta.env.VITE_FLASK_API_URL || "http://localhost:5000/api";

// Create axios instance for Flask API
const flaskApi = axios.create({
  baseURL: FLASK_API_URL,
  headers: {
    "Content-Type": "application/json",
  }
});

// Add auth token automatically to requests
// This will use the same JWT token obtained from Spring Boot
flaskApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      // Add logging to verify JWT token is being sent
      // console.log(`JWT token added to ${config.url} request:`, {
      //   url: config.url,
      //   method: config.method,
      //   hasToken: !!token,
      //   tokenPrefix: token ? token.substring(0, 10) + '...' : null
      // });
    } else {
      console.warn(`Request to ${config.url} has no JWT token`);
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
flaskApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error("Network Error:", error.message);
      return Promise.reject({
        message: "Network error. Please check your connection and try again.",
        originalError: error
      });
    }
    
    // Handle specific status codes
    switch (error.response.status) {
      case 401:
        // Unauthorized - token expired or invalid
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login?session=expired";
        return Promise.reject({
          message: "Your session has expired. Please log in again.",
          originalError: error.response.data
        });
      case 403:
        // Forbidden
        return Promise.reject({
          message: "You don't have permission to access this resource.",
          originalError: error.response.data
        });
      case 404:
        // Not found
        return Promise.reject({
          message: "The requested resource was not found.",
          originalError: error.response.data
        });
      case 500:
        // Server error
        return Promise.reject({
          message: "An internal server error occurred. Please try again later.",
          originalError: error.response.data
        });
      default:
        // Other errors
        return Promise.reject({
          message: error.response.data?.message || "An unexpected error occurred.",
          originalError: error.response.data
        });
    }
  }
);

export { flaskApi };
export default flaskApi;