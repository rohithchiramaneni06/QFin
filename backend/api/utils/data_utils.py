import numpy as np
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta

def get_stock_info(tickers):
    """
    Get basic information about stocks
    
    Args:
        tickers: List of stock tickers
        
    Returns:
        DataFrame with stock information
    """
    
    yesterday = (datetime.today() - timedelta(days=1)).strftime('%Y-%m-%d')

    data = []
    for ticker in tickers:
        stock = yf.Ticker(ticker)

        # Price history
        hist = stock.history(start=yesterday, end=datetime.today().strftime('%Y-%m-%d'))
        close_price = hist['Close'].iloc[-1] if not hist.empty else None

        # Fundamentals
        info = stock.info
        company_name = info.get("longName", ticker)  # fallback to ticker if not available
        market_cap = info.get("marketCap")
        beta = info.get("beta")
        pe_ratio = info.get("trailingPE")
        dividend_yield = info.get("dividendYield")
        roe = info.get("returnOnEquity")

        data.append({
            "Company": company_name if pd.notna(company_name) else None,
            "Close": close_price if pd.notna(close_price) else 0,
            "Ticker": ticker if pd.notna(ticker) else None,
            "Market_Cap": market_cap,
            "Beta": beta if pd.notna(beta) else 0,
            "P_E": pe_ratio if pd.notna(pe_ratio) else 0,
            "Dividend_Yield": dividend_yield if pd.notna(dividend_yield) else 0,
            "ROE": roe if pd.notna(roe) else 0,
        })
    
    stock_info = pd.DataFrame(data)
    stock_info = stock_info.where(pd.notna(stock_info), None)
    return stock_info

def calculate_metrics(returns):
    """
    Calculate various metrics for stock returns
    
    Args:
        returns: DataFrame of stock returns
        
    Returns:
        DataFrame with calculated metrics
    """
    metrics = pd.DataFrame()
    metrics["Annual Return"] = returns.mean() * 252
    metrics["Annual Volatility"] = returns.std() * np.sqrt(252)
    metrics["Sharpe Ratio"] = metrics["Annual Return"] / metrics["Annual Volatility"]
    metrics["Max Drawdown"] = (returns.cumsum() - returns.cumsum().cummax()).min()
    metrics["Skewness"] = returns.skew()
    metrics["Kurtosis"] = returns.kurtosis()
    return metrics

def calculate_correlation_matrix(returns):
    """
    Calculate correlation matrix for stock returns
    
    Args:
        returns: DataFrame of stock returns
        
    Returns:
        DataFrame with correlation matrix
    """
    return returns.corr()

def calculate_rolling_metrics(returns, window=30):
    """
    Calculate rolling metrics for stock returns
    
    Args:
        returns: DataFrame of stock returns
        window: Rolling window size
        
    Returns:
        Dictionary of DataFrames with rolling metrics
    """
    rolling_metrics = {}
    rolling_metrics["Rolling Return"] = returns.rolling(window).mean() * 252
    rolling_metrics["Rolling Volatility"] = returns.rolling(window).std() * np.sqrt(252)
    rolling_metrics["Rolling Sharpe"] = rolling_metrics["Rolling Return"] / rolling_metrics["Rolling Volatility"]
    return rolling_metrics

def calculate_var_cvar(returns, alpha=0.05):
    """
    Calculate Value at Risk (VaR) and Conditional Value at Risk (CVaR)
    
    Args:
        returns: DataFrame of stock returns
        alpha: Confidence level
        
    Returns:
        DataFrame with VaR and CVaR
    """
    var = returns.quantile(alpha)
    cvar = returns[returns <= var].mean()
    metrics = pd.DataFrame()
    metrics["VaR"] = var
    metrics["CVaR"] = cvar
    return metrics

def get_historical_prices(tickers, start='2010-01-01', end=None):
    """
    Get historical prices for tickers
    
    Args:
        tickers: List of stock tickers
        start: Start date
        end: End date
        
    Returns:
        DataFrame with historical prices
    """
    if end is None:
        end = datetime.today().strftime('%Y-%m-%d')
    data = yf.download(tickers, start=start, end=end)['Close']
    return data

def get_market_index_data(ticker):
    end = datetime.today().strftime('%Y-%m-%d')
    start = (datetime.today() - timedelta(days=150)).strftime('%Y-%m-%d')

    data = yf.download(ticker, start=start, end=end)['Close'].tail(100)
    df = data.reset_index()  # convert DatetimeIndex to column
    df.columns = ['date', 'close']
    df['date'] = df['date'].dt.strftime('%Y-%m-%d')  # make JSON serializable
    return df

def calculate_annual_returns(assets):
  # Download 3 years of historical data
  prices = yf.download(assets, period="3y")["Close"]

  # Daily returns
  daily_returns = prices.pct_change().dropna()

  # --- Annualized Mean Return ---
  annualized_returns = daily_returns.mean() * 252

  # --- Annualized Volatility ---
  annual_volatility = daily_returns.std() * np.sqrt(252)

  # Combine into DataFrame
  df = pd.DataFrame({
      "Annualized Return": annualized_returns.round(4),
      "Annual Volatility": annual_volatility.round(4)
  })

  return df

def create_table_values(weights, investment_amount, investment_horizon, risk_free=0.02):
    tickers = list(weights.keys())
    
    df = get_stock_info(tickers)
    annual_data = calculate_annual_returns(tickers)
    df["Returns"] = annual_data["Annualized Return"].values * 100
    df["Volatility"] = annual_data["Annual Volatility"].values * 100
    df["Sharpe_Ratio"] = (df['Returns'] - risk_free * 100)/df["Volatility"]
    df["Investment_Amount"] = df["Ticker"].map(weights) * float(investment_amount)
    df["Returned_Amount"] = df['Investment_Amount'] * ((1+ (df['Returns']/100)) ** investment_horizon)
    return df
