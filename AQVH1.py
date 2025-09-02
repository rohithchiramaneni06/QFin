# ============================================================
# QFin: Quantum-Inspired Portfolio Optimization & Risk Metrics
# ============================================================

import numpy as np
import pandas as pd
import yfinance as yf
import datetime
from scipy.stats import norm
import numpy as np
import pandas as pd
from qiskit.algorithms.minimum_eigen_solvers import QAOA
from qiskit.algorithms.optimizers import COBYLA
from qiskit_optimization import QuadraticProgram
from qiskit_optimization.algorithms import MinimumEigenOptimizer
from qiskit.utils import QuantumInstance, algorithm_globals
from qiskit import Aer



# ------------------------------------------------------------
# 1. Asset Universe
# ------------------------------------------------------------
assets = [
    "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META",
    "JNJ", "KO", "JPM", "BRK-B", "ORCL", "GE",     # 12 equities
    "IEF",  # US Treasuries ETF (Debt)
    "HYG",  # High Yield Corporate Bond ETF (Debt)
    "GLD", "IAU",  # Gold ETFs
    "BTC-USD"  # Bitcoin (Crypto)
]

start = "2010-01-01"
end = datetime.datetime.today().strftime('%Y-%m-%d')

# ------------------------------------------------------------
# 2. Download Data
# ------------------------------------------------------------
print("Downloading price data from Yahoo Finance...")
data = yf.download(assets, start=start, end=end,threads=False)['Close']
data = data.interpolate(method='time', limit_direction='both', axis=0)
returns = data.pct_change().dropna()

# ------------------------------------------------------------
# 3. Annualized Statistics (Per Asset)
# ------------------------------------------------------------
mu = returns.mean() * 252                   # Annualized Expected Return
sigma = returns.std() * np.sqrt(252)        # Annualized Volatility
risk_free_rate = 0.03                       # 3% annual risk-free rate
sharpe = (mu - risk_free_rate) / sigma      # Sharpe Ratio
cov_matrix = returns.cov() * 252
corr_matrix = returns.corr()

asset_stats = pd.DataFrame({
    "Expected Return (μ)": mu,
    "Volatility (σ)": sigma,
    "Sharpe Ratio": sharpe
}).sort_values(by="Sharpe Ratio", ascending=False)

print("\n=== Asset Statistics since 2010 ===")
print(asset_stats.round(4))

