# API Separation Documentation

## Overview

This document outlines the separation of API responsibilities between the Spring Boot and Flask backends in the QFin Portfolio Optimization Application. The application uses a dual-backend architecture where:

- **Spring Boot**: Handles all authentication and user management
- **Flask**: Handles all portfolio optimization and financial calculations

## Architecture Diagram

```
┌─────────────┐      ┌───────────────┐      ┌────────────────┐
│             │      │               │      │                │
│   React     │─────▶│  Spring Boot  │─────▶│  User Database │
│  Frontend   │      │  (Auth API)   │      │                │
│             │      │               │      │                │
└─────────────┘      └───────────────┘      └────────────────┘
       │                                             
       │                                             
       │              ┌───────────────┐      ┌────────────────┐
       │              │               │      │                │
       └─────────────▶│     Flask    │─────▶│  Financial Data │
                      │  (Portfolio) │      │                │
                      │               │      │                │
                      └───────────────┘      └────────────────┘
```

## API Endpoints

### Spring Boot API (Authentication)

Base URL: `http://localhost:8080`

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/auth/register` | POST | Register a new user | `{"username": "string", "password": "string", "email": "string"}` | `{"message": "User registered successfully"}` |
| `/auth/login` | POST | Authenticate user | `{"username": "string", "password": "string"}` | `{"token": "JWT_TOKEN"}` |
| `/auth/verify` | POST | Verify OTP code | `{"email": "string", "otp": "string"}` | `{"message": "Email verified successfully"}` |
| `/auth/resend-otp` | POST | Resend OTP code | `{"email": "string"}` | `{"message": "OTP sent successfully"}` |

### Flask API (Portfolio Optimization)

Base URL: `http://localhost:5000/api`

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/portfolio/fetch-data` | POST | Fetch stock data | `{"tickers": ["AAPL", "MSFT"], "start_date": "2020-01-01", "end_date": "2021-01-01"}` | Historical stock data |
| `/portfolio/optimize` | POST | Optimize portfolio | `{"tickers": ["AAPL", "MSFT"], "risk_tolerance": 0.5, "start_date": "2020-01-01", "end_date": "2021-01-01"}` | Optimized portfolio weights and metrics |
| `/portfolio/metrics` | POST | Calculate metrics | `{"tickers": ["AAPL", "MSFT"], "weights": [0.5, 0.5], "start_date": "2020-01-01", "end_date": "2021-01-01"}` | Portfolio performance metrics |
| `/portfolio/info` | POST | Get stock info | `{"tickers": ["AAPL", "MSFT"]}` | Detailed stock information |

## Authentication Flow

1. User registers or logs in through the Spring Boot API
2. Spring Boot validates credentials and issues a JWT token
3. Frontend stores the JWT token in localStorage
4. Frontend includes the JWT token in the Authorization header for all API requests
5. Both Spring Boot and Flask APIs validate the JWT token before processing requests

## Environment Variables

### Frontend (.env)

```
REACT_APP_SPRING_API_URL=http://localhost:8080
REACT_APP_FLASK_API_URL=http://localhost:5000/api
```

### Spring Boot (application.properties)

```
# Server Configuration
server.port=${SERVER_PORT:8080}

# CORS Configuration
cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173}

# JWT Configuration
jwt.secret=${JWT_SECRET:your_jwt_secret_key}

# Email Configuration
sendgrid.api.key=${SENDGRID_API_KEY:your_sendgrid_api_key}
sendgrid.from.email=${SENDGRID_FROM_EMAIL:noreply@example.com}

# Database Configuration
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/qfin}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:password}
```

### Flask (.env)

```
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your_flask_secret_key
JWT_SECRET_KEY=your_jwt_secret_key  # Must match Spring Boot's jwt.secret
CORS_ORIGINS=http://localhost:5173
```

## API Client Implementation

The frontend uses two separate Axios instances to communicate with the backends:

### Spring Boot API Client (springBootApi.js)

```javascript
import axios from 'axios';

const springBootApi = axios.create({
  baseURL: process.env.REACT_APP_SPRING_API_URL || 'http://localhost:8080',
  timeout: 10000
});

// Add JWT token to requests
springBootApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
springBootApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        originalError: error
      });
    }
    
    // Handle specific HTTP status codes
    switch (error.response.status) {
      case 401:
        return Promise.reject({
          message: 'Authentication failed. Please log in again.',
          originalError: error.response.data
        });
      case 403:
        return Promise.reject({
          message: 'You do not have permission to perform this action.',
          originalError: error.response.data
        });
      default:
        return Promise.reject({
          message: error.response.data?.message || 'An error occurred with the authentication service.',
          originalError: error.response.data
        });
    }
  }
);

export default springBootApi;
```

### Flask API Client (flaskApi.js)

```javascript
import axios from 'axios';

const flaskApi = axios.create({
  baseURL: process.env.REACT_APP_FLASK_API_URL || 'http://localhost:5000/api',
  timeout: 10000
});

// Add JWT token to requests
flaskApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
flaskApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        originalError: error
      });
    }
    
    // Handle specific HTTP status codes
    switch (error.response.status) {
      case 401:
        return Promise.reject({
          message: 'Authentication failed. Please log in again.',
          originalError: error.response.data
        });
      case 403:
        return Promise.reject({
          message: 'You do not have permission to perform this action.',
          originalError: error.response.data
        });
      case 500:
        return Promise.reject({
          message: 'Portfolio optimization service error. Please try again later.',
          originalError: error.response.data
        });
      default:
        return Promise.reject({
          message: error.response.data?.message || 'An error occurred with the portfolio service.',
          originalError: error.response.data
        });
    }
  }
);

export default flaskApi;
```

## Best Practices

1. **Authentication**: Always use Spring Boot for user authentication and management
2. **Portfolio Operations**: Always use Flask for financial calculations and portfolio optimization
3. **JWT Token**: Use the same JWT secret key for both backends to ensure token compatibility
4. **Error Handling**: Implement consistent error handling across both backends
5. **Environment Variables**: Use environment variables for configuration to support different deployment environments
6. **API Versioning**: Consider adding API versioning (e.g., `/v1/auth/login`) for future compatibility

## Deployment Considerations

1. Both backends can be deployed separately, allowing for independent scaling
2. Ensure CORS is properly configured on both backends to allow requests from the frontend
3. Use a reverse proxy (e.g., Nginx) in production to route requests to the appropriate backend
4. Consider containerizing the applications with Docker for easier deployment