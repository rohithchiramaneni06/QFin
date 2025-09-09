# API Separation Documentation

## Overview
This document outlines the separation of concerns between the Spring Boot authentication service and the Flask portfolio optimization service.

## Service Responsibilities

### Spring Boot Authentication Service

**Responsibility**: User authentication, registration, and session management

#### Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/auth/register` | POST | Register a new user | `{"username": "string", "email": "string", "password": "string", "phone": "string", "dob": "string"}` | OTP generation confirmation |
| `/api/auth/verify` | POST | Verify user with OTP | `{"email": "string", "otp": "string"}` | Verification status |
| `/api/auth/resend-otp` | POST | Resend OTP for verification | `{"email": "string"}` | OTP resend confirmation |
| `/api/auth/login` | POST | Authenticate user and issue JWT token | `{"username": "string", "password": "string"}` | JWT token |
| `/api/auth/test` | GET | Test endpoint | None | Service status |

### Flask Portfolio Optimization Service

**Responsibility**: Portfolio optimization, stock data fetching, and financial calculations

#### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/portfolio/optimize` | POST | Optimize portfolio based on parameters |
| `/api/stocks/fetch` | GET | Fetch stock data |
| `/api/simulation/monte-carlo` | POST | Run Monte Carlo simulations |
| `/api/data/tables` | GET | Generate data tables for visualization |

## Authentication Flow

1. User registers through Spring Boot service
2. User verifies email with OTP
3. User logs in and receives JWT token
4. Frontend stores JWT token
5. JWT token is included in requests to both services:
   - Spring Boot validates token for its protected endpoints
   - Flask validates token for its protected endpoints (if applicable)

## Cross-Service Communication

- **No direct communication** between Spring Boot and Flask services
- All communication flows through the frontend
- Each service maintains its own database for its domain

## Security Considerations

- Both services should implement CORS with appropriate origins
- JWT token validation should use the same secret key or public/private key pair
- Consider implementing API gateway for production deployment

## Development Guidelines

1. Keep authentication logic in Spring Boot service only
2. Keep portfolio optimization logic in Flask service only
3. Avoid duplicating user data between services
4. Use consistent error handling and response formats across services