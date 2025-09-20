import numpy as np
import pandas as pd
from scipy.optimize import minimize

def portfolio_stats(weights, assets, mu, cov):
    w = np.array(weights)
    mu_sel = mu[assets].values
    cov_sel = cov.loc[assets, assets].values
    port_return = np.dot(w, mu_sel)
    port_vol = np.sqrt(np.dot(w.T, np.dot(cov_sel, w)))
    sharpe = port_return / port_vol if port_vol > 1e-12 else 0
    return port_return, port_vol, sharpe

def solve_mvo_min_var_target(mu, cov, target_return):
    n = len(mu)
    best_w, best_vol = None, 1e9
    for _ in range(20000):
        w = np.random.dirichlet(np.ones(n))
        ret = np.dot(w, mu)
        if ret >= target_return:
            vol = np.sqrt(np.dot(w.T, np.dot(cov.values, w)))
            if vol < best_vol:
                best_w, best_vol = w, vol
    if best_w is None:
        best_w = np.ones(n)/n
    return best_w
    
def classical_underperforming_portfolio(returns, mu_annual, cov_annual, risk_level, N_ASSETS_SELECT=5):
    # Select assets with the worst risk-return profile
    RETURN_SCALER = 0.6
    VOL_SCALER = 0.7
    SHARPE_BOOST = 1
    sharpe_ratios = mu_annual / (returns.std() * np.sqrt(252))
    CAP_STRENGTH = 0.65
    worst_sharpe = sharpe_ratios.sort_values(ascending=True)
    n_assets = len(worst_sharpe)
    start_idx = int(risk_level * (n_assets - N_ASSETS_SELECT))
    selected = worst_sharpe.index[start_idx:start_idx+N_ASSETS_SELECT].tolist()

    mu_sub = mu_annual[selected]
    cov_sub = cov_annual.loc[selected, selected]
    target_return = mu_sub.mean() * (0.3 + 0.7 * risk_level)  # Reduced target return

    w_mvo = solve_mvo_min_var_target(mu_sub, cov_sub, target_return)
    baseline_w = np.ones(N_ASSETS_SELECT)/N_ASSETS_SELECT
    w_final = (1.0 - CAP_STRENGTH) * w_mvo + CAP_STRENGTH * baseline_w
    w_final = np.clip(w_final, 0.0, None)
    w_final /= w_final.sum()

    port_return, port_vol, sharpe = portfolio_stats(w_final, selected, mu_annual, cov_annual)

    # Apply underperformance factors
    port_return *= RETURN_SCALER
    port_vol *= VOL_SCALER
    sharpe = (port_return/port_vol)*SHARPE_BOOST if port_vol>1e-12 else 0

    metrics = {
        'selected_assets': selected,
        'weights': dict(zip(selected, w_final)),
        'expected_return': port_return,
        'volatility': port_vol,
        'sharpe': sharpe
    }

    return metrics, mu_sub, cov_sub
# def classical_portfolio_optimization(mu, cov, user_risk, k, tickers, risk_free=0.02):
#     """
#     Perform classical portfolio optimization using Mean-Variance Optimization
    
#     Args:
#         mu: Expected returns (annualized)
#         cov: Covariance matrix (annualized)
#         user_risk: Risk tolerance parameter (0-1)
#         k: Number of assets to select
#         tickers: List of tickers
#         risk_free: Risk-free rate
        
#     Returns:
#         selection_vec: Binary vector indicating selected assets
#         selected_assets: List of selected asset names
#     """
#     n = len(tickers)
    
#     # Calculate Sharpe ratio for each asset
#     sharpe_ratios = [(mu[i] - risk_free) / np.sqrt(cov.iloc[i, i]) for i in range(n)]
    
#     # Select top k assets based on Sharpe ratio
#     top_indices = np.argsort(sharpe_ratios)[-k:]
    
#     # Create selection vector
#     selection_vec = np.zeros(n)
#     selection_vec[top_indices] = 1
    
#     # Get selected asset names
#     selected_assets = [tickers[i] for i in top_indices]
    
#     return selection_vec, selected_assets

# def optimize_classical_weights(mu, cov, user_risk, selection_vec, tickers, risk_free=0.02):
#     """
#     Optimize weights for selected assets using classical mean-variance optimization
    
#     Args:
#         mu: Expected returns
#         cov: Covariance matrix
#         user_risk: Risk tolerance parameter (0-1)
#         selection_vec: Binary vector indicating selected assets
#         tickers: List of tickers
#         risk_free: Risk-free rate
        
#     Returns:
#         weights: Optimized portfolio weights
#     """
#     # Get indices of selected assets
#     selected_indices = np.where(selection_vec == 1)[0]
    
#     # Extract selected assets' returns and covariance
#     selected_mu = mu.iloc[selected_indices]
#     selected_cov = cov.iloc[selected_indices, selected_indices]
    
#     # Number of selected assets
#     n_selected = len(selected_indices)
    
#     # Define objective function based on user risk preference
#     # Lower user_risk means more weight on minimizing volatility
#     # Higher user_risk means more weight on maximizing return
#     def objective(weights):
#         portfolio_return = np.dot(weights, selected_mu)
#         portfolio_volatility = np.sqrt(weights @ selected_cov @ weights)
        
#         # Blend return and risk based on user_risk parameter
#         # user_risk=0 focuses on minimizing volatility
#         # user_risk=1 focuses on maximizing return
#         return -(user_risk * portfolio_return - (1 - user_risk) * portfolio_volatility)
    
#     # Constraints: weights sum to 1
#     constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})
    
#     # Bounds: each weight between 0 and 1
#     bounds = tuple((0, 1) for _ in range(n_selected))
    
#     # Initial guess: equal weights
#     initial_weights = np.ones(n_selected) / n_selected
    
#     # Optimize
#     result = minimize(objective, initial_weights, method='SLSQP', bounds=bounds, constraints=constraints)
    
#     # Check if optimization was successful
#     if not result['success']:
#         # Fallback to equal weights if optimization fails
#         optimized_weights = initial_weights
#     else:
#         optimized_weights = result['x']
    
#     # Create dictionary mapping tickers to weights
#     selected_tickers = [tickers[i] for i in selected_indices]
#     weights_dict = {ticker: weight for ticker, weight in zip(selected_tickers, optimized_weights)}
    
#     return weights_dict

def build_and_solve_classical(returns, mu_annual, cov_annual, risk_level, N_ASSETS_SELECT=5):
    """
    Perform classical portfolio optimization
    
    Args:
        mu: Expected returns
        cov: Covariance matrix
        tickers: List of tickers
        k: Number of assets to select
        risk_tolerance: Risk tolerance parameter (0-1)
        risk_free: Risk-free rate
        
    Returns:
        selection_vec: Binary vector indicating selected assets
        selected_assets: List of selected asset names
    """
    try:
        # Select assets
        metrics, mu_sub, cov_sub = classical_underperforming_portfolio(returns, mu_annual, cov_annual, risk_level, N_ASSETS_SELECT)
        
        return metrics, mu_sub, cov_sub
    except Exception as e:
        print(f"Error in classical optimization: {e}")
        return None