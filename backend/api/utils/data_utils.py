import numpy as np
import pandas as pd
import yfinance as yf
import joblib
from datetime import datetime, timedelta


def get_stock_info(tickers, pkl_file):
    """
    Get basic information about stocks
    
    Args:
        tickers: List of stock tickers
        pkl_file: Path to joblib .pkl file
        
    Returns:
        DataFrame with stock information
    """
    
    data = joblib.load(pkl_file)
    rows = []
    for ticker in tickers:
        asset_data = data.get(ticker, {})
        
        # Latest close price (from history)
        hist = asset_data.get("history")
        close_price = hist["Close"].iloc[-1]
        if isinstance(close_price, pd.Series):  
            close_price = close_price.squeeze()  # reduce Series to scalar
        close_price = float(close_price) if pd.notna(close_price) else 0

        # Fundamentals (cached in pkl)
        info = asset_data.get("info", {})
        company_name = info.get("longName", ticker)
        market_cap = info.get("marketCap")
        beta = info.get("beta")
        pe_ratio = info.get("trailingPE")
        dividend_yield = info.get("dividendYield")
        roe = info.get("returnOnEquity")

        rows.append({
            "Company": company_name if pd.notna(company_name) else None,
            "Close": close_price if pd.notna(close_price) else 0,
            "Ticker": ticker,
            "Market_Cap": market_cap,
            "Beta": beta if pd.notna(beta) else 0,
            "P_E": pe_ratio if pd.notna(pe_ratio) else 0,
            "Dividend_Yield": dividend_yield if pd.notna(dividend_yield) else 0,
            "ROE": roe if pd.notna(roe) else 0,
        })

    stock_info = pd.DataFrame(rows)
    stock_info = stock_info.where(pd.notna(stock_info), None)
    return stock_info

# Updated
def get_market_index_data(ticker):
    end = datetime.today().strftime('%Y-%m-%d')
    start = (datetime.today() - timedelta(days=150)).strftime('%Y-%m-%d')

    data = yf.download(ticker, start=start, end=end)['Close'].tail(100)
    df = data.reset_index()  # convert DatetimeIndex to column
    df.columns = ['date', 'close']
    df['date'] = df['date'].dt.strftime('%Y-%m-%d')  # make JSON serializable
    return df
    
def calculate_annual_returns(assets, pkl_file):
    """
    Calculate annualized returns and volatility for given assets
    using cached historical data from joblib file.
    """
    # Load cached data
    data = joblib.load(pkl_file)
    print(assets)
    # Collect closing prices
    prices = pd.DataFrame()
    for ticker in assets:
        asset_data = data.get(ticker, {})
        hist = asset_data.get("history")
        if hist is None or hist.empty:
            raise ValueError(f"No cached history found for {ticker}")

        if "Close" not in hist.columns:
            raise ValueError(f"No 'Close' data for {ticker}")

        prices[ticker] = hist["Close"].tail(252)

    # --- Daily returns ---
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

def create_table_values(pkl_file, weights, investment_amount, investment_horizon, risk_free=0.02):
    tickers = list(weights.keys())
    
    df = get_stock_info(tickers, pkl_file)
    annual_data = calculate_annual_returns(tickers, pkl_file)
    df["Returns"] = annual_data["Annualized Return"].values * 100
    df["Volatility"] = annual_data["Annual Volatility"].values * 100
    df["Sharpe_Ratio"] = (df['Returns'] - risk_free * 100)/df["Volatility"]
    df["Investment_Amount"] = df["Ticker"].map(weights) * float(investment_amount)
    df["Returned_Amount"] = df['Investment_Amount'] * ((1+ (df['Returns']/100)) ** investment_horizon)
    return df
