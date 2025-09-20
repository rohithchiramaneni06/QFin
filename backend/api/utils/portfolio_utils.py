import numpy as np
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
import time

# Core portfolio optimization functions
# Updated
def fetch_data(tickers, start='2018-01-01', end=None, seed=42):
    """
    Fetch stock data from Yahoo Finance
    
    Args:
        tickers: List of stock tickers
        start: Start date for data fetching
        end: End date for data fetching
        use_synthetic: Whether to use synthetic data (not implemented)
        seed: Random seed for reproducibility
        
    Returns:
        DataFrame of stock returns
    """
    data = yf.download(tickers, start=start, end=end)['Close']
    if data.empty or data.shape[1] < len(tickers):
        missing = set(tickers) - set(data.columns)
        raise ValueError(f"Failed to fetch data for tickers: {missing}")

    data = data.interpolate(method='time', limit_direction='both', axis=0)
    returns = data.pct_change().dropna()
    return returns

def calculate_portfolio_beta(weights, tickers):
    """
    Calculate portfolio beta from weights and stock betas
    
    Args:
        weights: Dictionary of {ticker: weight}
        tickers: List of tickers
        
    Returns:
        float: Portfolio beta
    """
    yesterday = (datetime.today() - timedelta(days=1)).strftime('%Y-%m-%d')
    data = []

    for ticker in tickers:
        stock = yf.Ticker(ticker)
        info = stock.info
        beta = info.get("beta")
        data.append({"Ticker": ticker, "Beta": beta})

    df = pd.DataFrame(data)
    betas = df.set_index("Ticker")["Beta"]
    total_beta = 0.0
    total_weight = 0.0

    for t, w in weights.items():
        b = betas.get(t, None)
        if b is not None and not pd.isna(b):  # only include valid betas
            total_beta += w * b
            total_weight += w

    if total_weight == 0:
        return float(total_weight)  # no valid betas found

    return total_beta / total_weight  # normalize by valid weights