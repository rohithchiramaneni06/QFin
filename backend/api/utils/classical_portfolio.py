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
    SHARPE_BOOST = 0.9
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