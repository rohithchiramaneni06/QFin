# Authentication Service (Spring Boot)

## Overview
This Spring Boot application serves as the authentication and user management service for the Portfolio Optimizer application. It handles user registration, login, JWT token generation/validation, and email verification.

## Architecture
The application follows a clear separation of concerns:

### Spring Boot Backend (Authentication Service)
- **User Authentication**: Handles login, signup, token validation, and logout
- **JWT Token Management**: Issues and validates JWT tokens
- **User Management**: Stores and manages user profiles
- **Email Verification**: Sends OTP emails for account verification

### Flask Backend (Portfolio Optimization Service)
- **Stock Data Fetching**: Retrieves stock market data
- **Portfolio Optimization**: Implements optimization algorithms
- **Monte Carlo Simulations**: Runs financial simulations
- **Table Data Generation**: Creates data tables for frontend visualization

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/verify`: Verify user with OTP
- `POST /api/auth/resend-otp`: Resend OTP for verification
- `POST /api/auth/login`: Authenticate user and issue JWT token
- `GET /api/auth/test`: Test endpoint for checking authentication service

## Security
The application uses Spring Security with JWT for stateless authentication. All endpoints except the authentication endpoints require a valid JWT token.

## Configuration
Configuration is managed through environment variables or application.properties:

```properties
# Database Configuration
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/qfin}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:12345678}

# JWT Configuration
jwt.secret=${JWT_SECRET:defaultSecretKeyForDevelopmentEnvironmentOnly}
jwt.expiration=${JWT_EXPIRATION:86400000}

# Email Configuration
sendgrid.api.key=${SENDGRID_API_KEY:your-api-key}
sendgrid.from.email=${SENDGRID_FROM_EMAIL:noreply@qfin.com}

# Server Configuration
server.port=${SERVER_PORT:8080}

# CORS Configuration
cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173}
```

## Development

### Prerequisites
- Java 17+
- Maven
- MySQL

### Running the Application
```bash
mvn spring-boot:run
```

### Testing
```bash
mvn test
```