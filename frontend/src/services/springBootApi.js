import axios from "axios";

// Spring Boot API URL - Use environment variable with fallback
const SPRING_API_URL = import.meta.env.VITE_SPRING_API_URL || "http://localhost:8080/api";

// Create axios instance for Spring Boot API
const springBootApi = axios.create({
  baseURL: SPRING_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token automatically to requests
springBootApi.interceptors.request.use(
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
      if (!config.url.includes('/auth/login')) {
        console.warn(`Request to ${config.url} has no JWT token`);
      }
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
springBootApi.interceptors.response.use(
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
        // Forbidden - possibly OTP required
        return Promise.reject({
          message: error.response.data?.message || "Authentication required.",
          originalError: error.response.data,
          status: 403
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

export { springBootApi };
export default springBootApi;