# QFin Portfolio Optimization Application

## Overview
This is a simplified version of the QFin Portfolio Optimization Application. The application consists of a React frontend and a Flask backend for portfolio optimization. Authentication is handled with JWT tokens.

## Project Structure
```
QFin/
├─ frontend/       (React + Vite)
└─ backend/        (Python Flask)
   ├─ api/
   │  ├─ models/   (Data models)
   │  ├─ routes/   (API endpoints)
   │  ├─ services/ (Business logic)
   │  └─ utils/    (Utility functions)
   ├─ app.py       (Main application)
   └─ requirements.txt
```

## Setup Instructions

### Prerequisites

- Node.js and npm (for React frontend)
- Python 3.8+ and pip (for Flask backend)

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following content:
   ```
   VITE_FLASK_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```
   npm run dev
   ```



### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update values as needed

5. Run the Flask application:
   ```
   python app.py
   ```
   The backend will be available at http://localhost:5000

## Usage

### Authentication
The application uses JWT authentication with the following test credentials:
- Username: `test`
- Password: `12345`

The backend handles authentication through the `/auth/login` and `/auth/register` endpoints.

### Portfolio Optimization
After logging in, you can:
1. Navigate to the portfolio creation page
2. Enter stock tickers, investment amounts, and risk tolerance
3. Submit the form to get optimized portfolio allocations

## API Documentation

### Backend API Endpoints

#### Authentication

- `POST /auth/login` - Login with username and password
  - Request: `{ "username": "test", "password": "12345" }`
  - Response: `{ "token": "jwt-token", "user": {...} }`

- `POST /auth/register` - Register a new user
  - Request: `{ "username": "newuser", "password": "password", "email": "user@example.com" }`

- `GET /auth/me` - Get current user profile (requires JWT)

#### Portfolio

- `POST /portfolio/fetch-data` - Fetches historical stock data and information for the specified tickers
  - Request: `{ "tickers": ["AAPL", "MSFT"], "start_date": "2020-01-01", "end_date": "2021-01-01" }`
  - Response: Returns historical returns data and stock information

- `POST /portfolio/optimize` - Optimizes portfolio allocation based on risk tolerance
  - Request: `{ "tickers": ["AAPL", "MSFT"], "risk_tolerance": 0.5, "start_date": "2020-01-01", "end_date": "2021-01-01", "use_quantum": false }`
  - Response: Returns optimized weights, portfolio metrics, and asset metrics
  - Optional: Set `use_quantum: true` to use quantum optimization (if Qiskit is available)

- `POST /portfolio/metrics` - Calculates portfolio metrics based on historical data and weights
  - Request: `{ "tickers": ["AAPL", "MSFT"], "weights": {"AAPL": 0.5, "MSFT": 0.5}, "start_date": "2020-01-01", "end_date": "2021-01-01" }`
  - Response: Returns portfolio metrics (return, volatility, Sharpe ratio, VaR, CVaR) and asset metrics

- `POST /portfolio/info` - Gets detailed information about specified stocks
  - Request: `{ "tickers": ["AAPL", "MSFT"] }`
  - Response: Returns detailed stock information (name, sector, beta, market cap, etc.)

## Technologies Used

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Chart.js

### Spring Boot Backend (Authentication)
- Spring Boot - Web framework
- Spring Security - Authentication and security
- JWT - JSON Web Tokens for authentication
- Spring Data JPA - Database access
- MySQL - Database
- SendGrid - Email service

### Flask Backend (Portfolio Optimization)
- Flask - Web framework
- Flask-JWT-Extended - Authentication
- Flask-CORS - Cross-origin resource sharing
- NumPy & Pandas - Data processing
- SciPy - Scientific computing
- yfinance - Yahoo Finance API
- Qiskit (optional) - Quantum computing optimization

### Backend Architecture
- Models: Data structures
- Routes: API endpoints
- Services: Business logic
- Utils: Helper functions for portfolio optimization, data processing, and metrics calculation

## API Separation

This application uses a dual-backend architecture:
- Spring Boot handles all authentication and user management
- Flask handles all portfolio optimization and financial calculations

For detailed documentation on the API separation, please see [API_SEPARATION.md](./API_SEPARATION.md).