from datetime import datetime
from ..utils.portfolio_utils import fetch_data
from ..utils.quantum_utils import build_and_solve_qubo
from ..utils.data_utils import get_stock_info, calculate_annual_returns, create_table_values, get_market_index_data
from ..utils.metrics_utils import project_portfolio, unified_portfolio_metrics, monte_carlo_simulation
import pandas as pd
import numpy as np


class PortfolioService:
    """
    Service for portfolio operations
    """

    @staticmethod
    def fetch_stock_data():
        """
        Fetch stock data for the predefined tickers.

        Returns:
            returns (pd.DataFrame): Stock returns
            assets (list): List of stock tickers
        """
        # ASSETS = [
        #     "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META",
        #     "JNJ", "KO", "JPM", "BRK-B", "ORCL", "GE",  # Equities
        #     "IEF", "HYG",  # Debt (Treasuries & Corporate Bonds)
        #     "GLD", "IAU",  # Gold ETFs
        #     "BTC-USD"      # Bitcoin (Crypto)
        # ]
        
        ASSETS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'BTC-USD', 'GLD', 'HYG', 'META']
        START = '2010-01-01'
        END = datetime.today().strftime('%Y-%m-%d')

        returns = fetch_data(ASSETS, start=START, end=END)
        
        # Convert columns to string for JSON serialization
        returns.columns = returns.columns.astype(str)
        return returns, ASSETS

    @staticmethod
    def compute_mu_cov(returns):
        """
        Compute expected returns and covariance matrix
        
        Args:
            returns: DataFrame of stock returns
            
        Returns:
            mu: Expected returns (annualized)
            cov: Covariance matrix (annualized)
        """
        mu = returns.mean(axis=0) * 252.0  # Annualized returns
        cov = returns.cov() * 252.0  # Annualized covariance
        return mu, cov

    @staticmethod
    def get_stock_information(tickers):
        """
        Get information about stocks.

        Args:
            tickers (list): List of stock tickers

        Returns:
            pd.DataFrame: Stock information
        """
        return get_stock_info(tickers)

    @staticmethod
    def calculate_portfolio_metrics(mu, cov, user_risk, k, risk_free=0.02):
        """
        Optimize portfolio using quantum-inspired methods.

        Args:
            mu (pd.Series): Expected returns
            cov (pd.DataFrame): Covariance matrix
            user_risk (float): Risk tolerance parameter (0–1)
            k (int): Number of assets to select
            risk_free (float): Risk-free rate

        Returns:
            dict: Portfolio metrics
            dict: Selected weights keyed by ticker
        """
        
        selection_vec, selected_assets = build_and_solve_qubo(mu, cov, list(mu.index), k, user_risk)
        metrics = unified_portfolio_metrics(
            selection_vec=selection_vec,
            selected_assets=selected_assets,
            mu=mu,
            cov=cov,
            tickers=list(mu.index),
            user_risk=user_risk,
            risk_free=risk_free,
        )
        weights_dict = {ticker: w for ticker, w in metrics["weights"].items()}
        return metrics, weights_dict

    @staticmethod
    def get_portfolio_metrics(metrics, mu, cov, user_risk, investment_amount, investment_horizon):
        """
        Compute portfolio projection metrics.

        Args:
            metrics (dict): Optimization results
            mu (pd.Series): Expected returns
            cov (pd.DataFrame): Covariance matrix
            investment_amount (float): Investment capital
            investment_horizon (int): Time horizon in years

        Returns:
            dict: Projected portfolio performance metrics
        """
        weights_series = pd.Series(metrics['weights'], index=metrics['selected_assets'])
        portfolio_metrics = project_portfolio(weights_series, mu, cov, user_risk,  investment_amount, investment_horizon)
        return portfolio_metrics

    @staticmethod
    def get_selected_assets(metrics):
        """
        Get selected assets from metrics.

        Args:
            metrics (dict): Portfolio metrics

        Returns:
            list: Selected tickers
        """
        return metrics['selected_assets']

    @staticmethod
    def get_monte_carlo_simulation(weights, cov, investment_amount, investment_horizon):
        """
        Compute portfolio projection metrics using Monte Carlo simulation.

        Args:
            weights (dict): Asset weights
            cov (pd.DataFrame): Covariance matrix
            investment_amount (float): Investment capital
            investment_horizon (int): Time horizon in years
            num_simulations (int): Number of Monte Carlo simulations

        Returns:
            dict: Projected portfolio performance metrics
        """
        selected_assets = list(weights.keys())
        returns = calculate_annual_returns(selected_assets)["Annualized Return"]
        selected_cov = cov.loc[selected_assets, selected_assets]

        simulation_results = monte_carlo_simulation(
            np.array(list(weights.values())),
            returns,
            selected_cov,
            initial_investment=investment_amount,
            time_horizon=252 * investment_horizon,  # 1 year of trading days
            num_simulations=1000,
            percentiles=[5, 25, 50, 75, 95]
        )
        return simulation_results
    @staticmethod
    def get_table_data(weights, investment_amount, investment_horizon):
        """
        Get table data from metrics.

        Args:
            metrics (dict): Portfolio metrics

        Returns:
            list: Table data
        """
        table_data = create_table_values(weights, investment_amount, investment_horizon)
        return table_data

    @staticmethod
    def get_market_index_data(ticker):
        """
        Get last 100 days of market index data.

        Args:
            ticker: Market index ticker (e.g., "^GSPC" for S&P 500)

        Returns:
            DataFrame with last 100 trading days of close prices
        """
        return get_market_index_data(ticker)
