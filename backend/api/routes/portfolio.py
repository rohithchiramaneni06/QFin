from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import yfinance as yf

# Import services
from ..services.portfolio_service import PortfolioService

portfolio_bp = Blueprint('portfolio', __name__)

# -------------------------------
# Global cache for stock data
# -------------------------------
cached_returns = None
cached_tickers = None
cached_stock_info = None

# -------------------------------
# Fetch & cache stock data
# -------------------------------
def fetch_and_cache_data(force_refresh=False):
    """Fetch stock data once and store in global cache."""
    global cached_returns, cached_tickers, cached_stock_info

    if cached_returns is None or cached_tickers is None or cached_stock_info is None or force_refresh:
        # Fetch live stock data
        returns, tickers = PortfolioService.fetch_stock_data()
        stock_info = PortfolioService.get_stock_information(tickers)

        cached_returns = returns
        cached_tickers = tickers
        cached_stock_info = stock_info

    return cached_returns, cached_tickers, cached_stock_info

# -------------------------------
# Fetch Stock Data Endpoint
# -------------------------------
@portfolio_bp.route('/fetch-data', methods=['GET'])
@jwt_required()
def fetch_stock_data_endpoint():
    """Endpoint to fetch stock data and cache it.
    Returns:
        JSON response with stock data and cache status.
    """

    try:
        returns, tickers, stock_info = fetch_and_cache_data()

        # Convert returns to dict for JSON
        returns_dict = returns.to_dict(orient='list')  # keys are tickers, values are lists of returns
        
        stock_info_dict = stock_info.to_dict(orient='records')
        return jsonify({
            'success': True,
            'message': 'Data fetched successfully',
            'data': {
                'returns': returns_dict,
                'tickers': tickers,
                'stock_info': stock_info_dict
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# -------------------------------
# Optimize Portfolio Endpoint
# -------------------------------
@portfolio_bp.route('/optimize', methods=['POST'])
@jwt_required()
def optimize():
    try:
        data = request.get_json()
        risk_tolerance = data.get('risk')
        investment_amount = data.get('amount')
        investment_horizon = data.get('time')
        k = data.get('num_assets')

        if None in (risk_tolerance, investment_amount, investment_horizon, k):
            return jsonify({'error': 'Missing required parameters: risk, amount, time, num_assets'}), 400

        # Fetch cached returns and tickers
        returns, tickers, _ = fetch_and_cache_data()

        # Compute expected returns and covariance
        mu, cov = PortfolioService.compute_mu_cov(returns)

        # Calculate portfolio metrics and optimized weights
        metrics, weights_dict = PortfolioService.calculate_portfolio_metrics(returns, mu, cov, risk_tolerance, k, method="quantum")
        # Compute portfolio projection (value over time)
        portfolio_metrics = PortfolioService.get_portfolio_metrics(
            metrics, mu, cov,risk_tolerance, investment_amount, investment_horizon
        )

        # Ensure all numpy/pandas objects are converted to native types for JSON
        metrics_native = {k: float(v) if np.isscalar(v) else v for k, v in metrics.items()}
        portfolio_metrics_native = portfolio_metrics.to_dict() if isinstance(portfolio_metrics, pd.DataFrame) else portfolio_metrics
        weights_native = {k: float(v) for k, v in weights_dict.items()}
        response_data = {
            'success': True,
            'weights': weights_native,
            'optimization_metrics': metrics_native,
            'portfolio_projection': portfolio_metrics_native
        }

        return jsonify(response_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# -------------------------------
# Stock Info Endpoint
# -------------------------------
@portfolio_bp.route('/info', methods=['POST'])
@jwt_required()
def get_stock_info():
    try:
        data = request.get_json()
        tickers = data.get('tickers')

        if not tickers:
            return jsonify({'error': 'Missing tickers'}), 400

        _, _, stock_info_cache = fetch_and_cache_data()

        # Filter requested tickers
        stock_info_filtered = stock_info_cache[stock_info_cache['Ticker'].isin(tickers)]

        return jsonify({
            'success': True,
            'data': stock_info_filtered.to_dict(orient='records')
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# -------------------------------
# Monte Carlo Simulation Endpoint
# -------------------------------
@portfolio_bp.route('/monte-carlo', methods=['POST'])
@jwt_required()
def simulate_portfolio():
    try:
        data = request.get_json()
        risk_tolerance = data.get('risk')
        investment_amount = data.get('amount')
        investment_horizon = data.get('time')
        k = data.get('num_assets')

        if None in (investment_amount, investment_horizon):
            return jsonify({'error': 'Missing required parameters: weights, cov, amount, time'}), 400

        returns, _, _ = fetch_and_cache_data()

        # Compute expected returns and covariance
        mu, cov = PortfolioService.compute_mu_cov(returns)
        # Convert weights to numpy array
        _, weights_dict = PortfolioService.calculate_portfolio_metrics(returns, mu, cov, risk_tolerance, k)

        # Run Monte Carlo simulation
        simulation_results = PortfolioService.get_monte_carlo_simulation(
            weights_dict, cov, investment_amount, investment_horizon
        )

        return jsonify({    
            'success': True,
            'data': simulation_results
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@portfolio_bp.route('/table-data', methods=['POST'])
@jwt_required()
def get_table_data():
    try:
        data = request.get_json()
        investment_amount = data.get('amount')
        investment_horizon = data.get('time')
        weights_dict = data.get('weights')

        table_data = PortfolioService.get_table_data(weights_dict, investment_amount, investment_horizon)
        table_data = table_data.to_dict(orient='records')
        return jsonify({
            'success': True,
            'data': table_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@portfolio_bp.route('/stocks', methods=['GET'])
def get_stocks():
    try:
        _, _, stock_info = fetch_and_cache_data()

        return jsonify({
            'success': True,
            'data': stock_info.to_dict(orient='records')
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@portfolio_bp.route('/market-index', methods=['POST'])
def get_market_index():
    try:
        data = request.get_json()
        ticker = data.get('ticker')
        if not ticker:
            return jsonify({'error': 'Missing ticker'}), 400

        market_index_data = PortfolioService.get_market_index_data(ticker)

        return jsonify({
            'success': True,
            'data': market_index_data.to_dict(orient='records')  # now works
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@portfolio_bp.route('/market-trends', methods=['GET'])
def get_market_trends_endpoint():
    try:
        ASSETS = ["AAPL", "MSFT", "GOOGL", "AMZN", "BTC-USD", "GLD", "HYG", "META"]
        
        end_date = datetime.today().strftime('%Y-%m-%d')
        start_date = (datetime.today() - timedelta(days=4)).strftime('%Y-%m-%d')
        
        trends = []
        for ticker in ASSETS:
            try:
                stock_data = yf.download(ticker, start=start_date, end=end_date)
                
                if 'Close' in stock_data.columns and len(stock_data['Close']) >= 2:
                    latest_close = float(stock_data['Close'].iloc[-1])
                    previous_close = float(stock_data['Close'].iloc[-2])
                    percent_change = ((latest_close - previous_close) / previous_close) * 100
                    
                    trends.append({
                        "symbol": ticker,
                        "change": f"{percent_change:.2f}%",
                        "trend": "up" if percent_change >= 0 else "down"
                    })
                else:
                    print(f"Not enough data for {ticker} or missing 'Close' column.")
            except Exception as e:
                print(f"Error fetching data for {ticker}: {str(e)}")

        return jsonify(trends)
    
    except Exception as e:
        print(f"Error in get_market_trends_endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# -------------------------------
# Classical Portfolio Optimization Endpoint
# -------------------------------
@portfolio_bp.route('/classical', methods=['POST'])
@jwt_required()
def classical_optimize():
    try:
        data = request.get_json()
        risk_tolerance = data.get('risk')
        investment_amount = data.get('amount')
        investment_horizon = data.get('time')
        k = data.get('num_assets')

        if None in (risk_tolerance, investment_amount, investment_horizon, k):
            return jsonify({'error': 'Missing required parameters: risk, amount, time, num_assets'}), 400

        # Fetch cached returns and tickers
        returns, tickers, _ = fetch_and_cache_data()

        # Compute expected returns and covariance
        mu, cov = PortfolioService.compute_mu_cov(returns)
        # Calculate portfolio metrics and optimized weights using classical method
        metrics, weights_dict = PortfolioService.calculate_portfolio_metrics(
            returns, mu, cov, risk_tolerance, k, method="classical"
        )
        
        # Compute portfolio projection (value over time)
        portfolio_metrics = PortfolioService.get_portfolio_metrics(
            metrics, mu, cov, risk_tolerance, investment_amount, investment_horizon
        )

        # Ensure all numpy/pandas objects are converted to native types for JSON
        metrics_native = {k: float(v) if np.isscalar(v) else v for k, v in metrics.items()}
        portfolio_metrics_native = portfolio_metrics.to_dict() if isinstance(portfolio_metrics, pd.DataFrame) else portfolio_metrics
        weights_native = {k: float(v) for k, v in weights_dict.items()}
        
        response_data = {
            'success': True,
            'weights': weights_native,
            'optimization_metrics': metrics_native,
            'portfolio_projection': portfolio_metrics_native
        }

        return jsonify(response_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# -------------------------------
# Portfolio Comparison Endpoint
# -------------------------------
@portfolio_bp.route('/comparison', methods=['POST'])
@jwt_required()
def compare_portfolios():
    try:
        data = request.get_json()
        risk_tolerance = data.get('risk')
        investment_amount = data.get('amount')
        investment_horizon = data.get('time')
        k = data.get('num_assets')

        if None in (risk_tolerance, investment_amount, investment_horizon, k):
            return jsonify({'error': 'Missing required parameters: risk, amount, time, num_assets'}), 400

        # Fetch cached returns and tickers
        returns, tickers, _ = fetch_and_cache_data()

        # Compute expected returns and covariance
        mu, cov = PortfolioService.compute_mu_cov(returns)

        # Get comparison metrics for both quantum and classical methods
        comparison = PortfolioService.calculate_comparison_metrics( 
            returns, mu, cov, risk_tolerance, k, investment_amount, investment_horizon
        )
        
        # Add investment details to the response
        comparison['investment_details'] = {
            'amount': investment_amount,
            'horizon': investment_horizon
        }
        
        return jsonify({
            'success': True,
            'data': comparison
        })
    except Exception as e:
        print("Error in compare_portfolios:", e)
        return jsonify({'error': str(e)}), 500
