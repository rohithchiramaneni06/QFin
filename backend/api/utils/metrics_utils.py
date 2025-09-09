import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import numpy as np
from scipy.optimize import minimize
from  ..utils.portfolio_utils import calculate_portfolio_beta

# def calculate_efficient_frontier(mu, cov, points=20, risk_free=0.02):
#     """
#     Calculate efficient frontier points
    
#     Args:
#         mu: Expected returns
#         cov: Covariance matrix
#         points: Number of points on the frontier
#         risk_free: Risk-free rate
        
#     Returns:
#         returns: List of returns
#         volatilities: List of volatilities
#         sharpe_ratios: List of Sharpe ratios
#     """
#     from scipy.optimize import minimize
    
#     n = len(mu)
    
#     def portfolio_volatility(weights):
#         return np.sqrt(weights @ cov.values @ weights)
    
#     def portfolio_return(weights):
#         return np.dot(weights, mu)
    
#     def negative_sharpe(weights):
#         return -(portfolio_return(weights) - risk_free) / portfolio_volatility(weights)
    
#     # Constraints
#     constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})
#     bounds = tuple((0, 1) for _ in range(n))
    
#     # Find minimum volatility portfolio
#     min_vol_result = minimize(
#         portfolio_volatility,
#         np.ones(n) / n,
#         bounds=bounds,
#         constraints=constraints
#     )
#     min_vol_weights = min_vol_result['x']
#     min_vol_return = portfolio_return(min_vol_weights)
#     min_vol_volatility = portfolio_volatility(min_vol_weights)
    
#     # Find maximum Sharpe ratio portfolio
#     max_sharpe_result = minimize(
#         negative_sharpe,
#         np.ones(n) / n,
#         bounds=bounds,
#         constraints=constraints
#     )
#     max_sharpe_weights = max_sharpe_result['x']
#     max_sharpe_return = portfolio_return(max_sharpe_weights)
#     max_sharpe_volatility = portfolio_volatility(max_sharpe_weights)
    
#     # Generate efficient frontier
#     target_returns = np.linspace(min_vol_return, max(mu) * 0.9, points)
#     efficient_volatilities = []
#     efficient_weights = []
    
#     for target_return in target_returns:
#         constraints = (
#             {'type': 'eq', 'fun': lambda x: np.sum(x) - 1},
#             {'type': 'eq', 'fun': lambda x: portfolio_return(x) - target_return}
#         )
#         result = minimize(
#             portfolio_volatility,
#             np.ones(n) / n,
#             bounds=bounds,
#             constraints=constraints
#         )
#         efficient_volatilities.append(result['fun'])
#         efficient_weights.append(result['x'])
    
#     # Calculate Sharpe ratios
#     sharpe_ratios = [(r - risk_free) / v for r, v in zip(target_returns, efficient_volatilities)]
    
#     return target_returns.tolist(), efficient_volatilities, sharpe_ratios, efficient_weights

def get_weights_from_selection(selection_vec, mu, cov, tickers, user_risk=1.0, min_weight=0.01):
    """
    Optimize weights so that all selected assets get non-zero weights, Sharpe ratio is maximized,
    and portfolio volatility scales smoothly with user_risk.

    Args:
        selection_vec : list/array, binary output from QAOA
        mu : pd.Series, expected returns of assets
        cov : pd.DataFrame, covariance matrix
        tickers : list of asset names
        user_risk : float in [0,1], 0 = lowest risk, 1 = highest risk
        min_weight : float, minimum allocation per asset

    Returns:
        np.array : optimized portfolio weights
        pd.Series : selected expected returns
        pd.DataFrame : selected covariance matrix
    """

    selection = np.array([1 if float(x) > 0 else 0 for x in selection_vec])
    idx = np.where(selection == 1)[0].tolist()
    if len(idx) == 0:
        return None, None, None

    selected_mu = mu.iloc[idx]
    selected_cov = cov.iloc[idx, idx].values
    n = len(idx)

    # Minimum weight for each asset to avoid zero allocation
    bounds = [(min_weight, 1) for _ in range(n)]

    # Constraint: sum of weights = 1
    cons = [{'type': 'eq', 'fun': lambda w: np.sum(w) - 1}]

    # Starting point: equal weights
    x0 = np.ones(n) / n

    # Soft target volatility based on user_risk
    ones = np.ones(n)
    inv_cov = np.linalg.pinv(selected_cov)
    gmv_weights = inv_cov @ ones / (ones @ inv_cov @ ones)   # global minimum variance
    min_vol = np.sqrt(gmv_weights @ selected_cov @ gmv_weights)
    max_vol = np.sqrt(np.max(np.diag(selected_cov)))
    target_vol = min_vol + user_risk * (max_vol - min_vol)

    # Objective: maximize Sharpe ratio with penalty for deviation from target_vol
    def objective(w):
        port_return = w @ selected_mu.values
        port_vol = np.sqrt(w @ selected_cov @ w)
        sharpe = port_return / port_vol
        vol_penalty = ((port_vol - target_vol) / target_vol)**2  # soft penalty
        return -sharpe + 0.1 * vol_penalty  # minimize negative Sharpe + penalty

    res = minimize(objective, x0, bounds=bounds, constraints=cons)

    if not res.success:
        print("Optimization failed:", res.message)
        return None, None, None

    return res.x, selected_mu, cov.iloc[idx, idx]

def compute_portfolio_stats(weights, mu, cov, risk_free=0.02):
    """
    Compute portfolio statistics
    
    Args:
        weights: Portfolio weights
        mu: Expected returns
        cov: Covariance matrix
        risk_free: Risk-free rate
        
    Returns:
        exp_return: Expected portfolio return
        vol: Portfolio volatility
        sharpe: Sharpe ratio
    """
    weights = np.array(weights)
    exp_return = float(np.dot(weights, mu))
    vol = float(np.sqrt(weights @ cov.values @ weights))
    sharpe = float((exp_return - risk_free) / (vol + 1e-12))
    return exp_return, vol, sharpe


def normalize_weights(weights):
    """Normalize user-provided weights to sum to 1."""
    weights = np.array(weights)
    return weights / weights.sum()

# ======================================================
# 3. Downside risk
# ======================================================
def compute_sortino_ratio(weights, returns, tickers, risk_free=0.02):
    """Sortino ratio and downside deviation using historical returns."""
    port_rets = returns[tickers] @ weights
    downside_returns = np.minimum(port_rets - risk_free, 0)
    downside_dev = np.sqrt((downside_returns**2).mean())
    sortino = None
    if downside_dev > 0:
        sortino = float((port_rets.mean() - risk_free) / downside_dev)
    return sortino, downside_dev

# ======================================================
# 4. Monte Carlo Simulation
# ======================================================

def monte_carlo_portfolio(mu, cov, weights, horizon_days=30, n_sims=5000, alpha=0.05, seed=123):
    """
    Monte Carlo simulation for VaR and CVaR
    
    Args:
        mu: Expected returns
        cov: Covariance matrix
        weights: Portfolio weights
        horizon_days: Time horizon in days
        n_sims: Number of simulations
        alpha: Confidence level for VaR/CVaR
        seed: Random seed
        
    Returns:
        mean_sim: Mean simulated return
        std_sim: Standard deviation of simulated returns
        var_ret: Value at Risk (return)
        cvar_ret: Conditional Value at Risk (return)
        sim_port_rets: Simulated portfolio returns
    """
    np.random.seed(seed)
    h = max(1, int(horizon_days))
    mu_h = mu * (h / 252.0)
    cov_h = cov * (h / 252.0)

    sims = np.random.multivariate_normal(mean=mu_h, cov=cov_h, size=n_sims)
    sim_port_rets = sims.dot(weights)

    mean_sim = float(np.mean(sim_port_rets))
    std_sim = float(np.std(sim_port_rets))
    var_ret = float(np.percentile(sim_port_rets, 100 * alpha))
    cvar_ret = float(np.mean(sim_port_rets[sim_port_rets <= var_ret])) if np.any(sim_port_rets <= var_ret) else var_ret

    # Convert sim_port_rets to a Python list for JSON serialization
    return mean_sim, std_sim, var_ret, cvar_ret, sim_port_rets.tolist()

def compute_blended_stats(weights_risky, mu, cov, user_risk, risk_free):
    """
    Scale a risky portfolio by user_risk via cash mixing (two-fund separation).
    Returns portfolio (exp_return, vol, sharpe) after blending with cash.
    """
    # risky portfolio stats
    mu_risky = float(weights_risky @ mu.values)
    vol_risky = float(np.sqrt(weights_risky @ cov.values @ weights_risky))

    # blend with cash
    exp_return = (1 - user_risk) * risk_free + user_risk * mu_risky
    vol = user_risk * vol_risky
    excess = exp_return - risk_free
    sharpe = excess / vol if vol > 0 else 0.0
    return exp_return, vol, sharpe


# ======================================================
# 5. Wrapper function
# ======================================================
def unified_portfolio_metrics(
    selection_vec=None,
    selected_assets=None,
    mu=None,
    cov=None,
    tickers=None,
    user_risk=1.0,       # tilt allocation aggressiveness
    risk_free=0.02,
    returns=None,
    horizon_days=252,
    n_sims=5000,
    alpha=0.05,
    seed=123
):
    """
    Unified function where the entire portfolio is invested in selected assets.
    Takes both selection_vec and selected_assets directly (no recomputation).
    No cash allocation: maximizes expected return given selected stocks.
    """

    # --------------------------------------------------
    # Step 1. Get risky portfolio weights
    # --------------------------------------------------
    if selection_vec is not None and selected_assets is not None:
        weights_risky, mu, cov = get_weights_from_selection(
            selection_vec, mu, cov, tickers, user_risk
        )
        tickers_selected = selected_assets
    else:
        raise ValueError("Both selection_vec and selected_assets must be provided.")

    # --------------------------------------------------
    # Step 2. Ensure full investment
    # --------------------------------------------------
    total = weights_risky.sum()
    if total <= 0:
        raise ValueError("Sum of weights is zero, cannot normalize.")
    weights_risky = weights_risky / total
    weights_final = {t: float(w) for t, w in zip(tickers_selected, weights_risky)}

    # --------------------------------------------------
    # Step 3. Portfolio statistics
    # --------------------------------------------------
    exp_return, vol, sharpe = compute_blended_stats(weights_risky, mu, cov,user_risk, risk_free)

    sortino, downside_dev = None, None
    if returns is not None and tickers_selected is not None:
        sortino, downside_dev = compute_sortino_ratio(weights_risky, returns, tickers_selected, risk_free)

    # --------------------------------------------------
    # Step 4. Monte Carlo simulation
    # --------------------------------------------------
    mean_sim, std_sim, var_ret, cvar_ret, sim_rets = monte_carlo_portfolio(
        mu, cov, weights_risky, horizon_days, n_sims, alpha, seed
    )

    # --------------------------------------------------
    # Step 5. Collect results
    # --------------------------------------------------
    results = {
        "selected_assets": tickers_selected,
        "weights": weights_final,
        "annual_expected_return": exp_return,
        "annual_volatility": vol,
        "sharpe_ratio": sharpe,
        "sortino_ratio": sortino,
        "downside_deviation": downside_dev,
        "mean_sim_return": mean_sim,
        "std_sim_return": std_sim,
        "VaR_return": var_ret,
        "CVaR_return": cvar_ret,
        "VaR_loss": -var_ret,
        "CVaR_loss": -cvar_ret,
        "sim_returns": sim_rets,
    }

    return results

def project_portfolio(weights_fractional, mu, cov_matrix, user_risk, investment_amount, investment_horizon, risk_free=0.02):
    """
    Project portfolio value over a specified horizon with risk range and key metrics.

    Args:
        weights_fractional : pd.Series of fractional weights (selected assets only)
        mu : pd.Series of expected returns (annualized)
        cov_matrix : pd.DataFrame of covariance matrix (annualized, matching weights_fractional)
        investment_amount : float, total amount to invest
        investment_horizon : int, investment horizon in years
        risk_free : float, risk-free rate (optional, for Sharpe/Sortino calculation)

    Returns:
        dict with projected value, range, expected return, volatility, ROI, ROE, CAGR, and per-asset projection
    """
    # Align mu and cov to selected assets
    selected_mu = mu[weights_fractional.index]
    selected_cov = cov_matrix.loc[weights_fractional.index, weights_fractional.index]

    portfolio_beta = calculate_portfolio_beta(weights_fractional, list(selected_mu.index));
    # Portfolio metrics
    expected_annual_return, _, _ = compute_blended_stats(weights_fractional, selected_mu, selected_cov,user_risk, risk_free)
    expected_return = float(np.dot(weights_fractional.values, selected_mu))
    portfolio_variance = float(weights_fractional.values @ selected_cov.values @ weights_fractional.values)
    portfolio_risk = np.sqrt(portfolio_variance)

    # Projected value assuming annual compounding
    projected_value = investment_amount * ((1 + expected_annual_return) ** investment_horizon)

    # 1-sigma range (risk)
    upper_value = investment_amount * ((1 + expected_return + portfolio_risk) ** investment_horizon)
    lower_value = investment_amount * ((1 + expected_return - portfolio_risk) ** investment_horizon)

    # Per-asset projected values
    asset_values = weights_fractional * projected_value

    # --- New Metrics ---
    roi = (projected_value - investment_amount) / investment_amount
    roe = roi  # proxy for portfolio-level ROE
    cagr = (projected_value / investment_amount) ** (1 / investment_horizon) - 1

    metrics = {
        "total_investment": float(investment_amount),
        "investment_horizon": int(investment_horizon),
        "expected_return": float(expected_return),
        "portfolio_volatility": float(portfolio_risk),
        "projected_value": float(projected_value),
        "portfolio_beta": float(portfolio_beta),
        "range_lower": float(lower_value),
        "range_upper": float(upper_value),
        "asset_values": asset_values.to_dict() if hasattr(asset_values, "to_dict") else dict(asset_values),
        "ROI": float(roi),
        "ROE": float(roe),
        "CAGR": float(cagr),
    }

    return metrics

def monte_carlo_simulation(weights, returns, cov_matrix, initial_investment,
                          time_horizon=252, num_simulations=1000, percentiles=[5, 25, 50, 75, 95]):
    """
    Perform Monte Carlo simulation for portfolio performance with enhanced risk metrics.

    Args:
        weights (np.array): Portfolio weights
        returns (np.array): Expected returns for each asset
        cov_matrix (np.array): Covariance matrix of returns
        initial_investment (float): Initial investment amount
        time_horizon (int): Time horizon in days
        num_simulations (int): Number of simulations to run
        percentiles (list): Percentiles to calculate for the final portfolio value

    Returns:
        dict: Simulation results with enhanced risk metrics
    """
    # Calculate daily mean and covariance
    daily_returns = returns / 252  # Convert annual returns to daily
    daily_cov = cov_matrix / 252  # Convert annual covariance to daily

    # Initialize array to store simulation results
    simulation_results = np.zeros((time_horizon, num_simulations))
    daily_returns_results = np.zeros((time_horizon-1, num_simulations))

    # Initial portfolio value
    portfolio_value = initial_investment

    # Run simulations
    for i in range(num_simulations):
        # Initialize array to store daily portfolio values for this simulation
        daily_portfolio_values = np.zeros(time_horizon)
        daily_portfolio_values[0] = portfolio_value

        # Generate random returns for each day
        random_returns = np.random.multivariate_normal(daily_returns, daily_cov, time_horizon)
        portfolio_daily_returns = np.sum(random_returns * weights, axis=1)

        # Calculate portfolio value for each day
        for t in range(1, time_horizon):
            daily_portfolio_values[t] = daily_portfolio_values[t-1] * (1 + portfolio_daily_returns[t])
            # Store daily returns for later calculations
            if t > 0:
                daily_returns_results[t-1, i] = (daily_portfolio_values[t] / daily_portfolio_values[t-1]) - 1

        # Store this simulation's results
        simulation_results[:, i] = daily_portfolio_values

    # Calculate percentiles of final portfolio value
    final_values = simulation_results[-1, :]
    percentile_values = np.percentile(final_values, percentiles)

    # Calculate max drawdown across all simulations
    max_drawdowns = []
    recovery_times = []
    underwater_periods = []

    for i in range(num_simulations):
        # Calculate drawdown for this simulation
        simulation = simulation_results[:, i]
        drawdowns = np.zeros(len(simulation))
        peak = simulation[0]
        in_drawdown = False
        drawdown_start = 0
        current_underwater = 0
        underwater_periods_sim = []

        for t, value in enumerate(simulation):
            if value > peak:
                # New peak
                peak = value
                if in_drawdown:
                    # End of drawdown period
                    recovery_time = t - drawdown_start
                    recovery_times.append(recovery_time)
                    in_drawdown = False
                    underwater_periods_sim.append(current_underwater)
                    current_underwater = 0
            else:
                # In drawdown
                drawdown = (peak - value) / peak
                drawdowns[t] = drawdown

                if not in_drawdown and drawdown > 0.05:  # Start tracking significant drawdowns (>5%)
                    in_drawdown = True
                    drawdown_start = t

                if in_drawdown:
                    current_underwater += 1

        # If still in drawdown at end of simulation
        if in_drawdown and current_underwater > 0:
            underwater_periods_sim.append(current_underwater)
            # No recovery time calculated as it didn't recover

        max_drawdowns.append(np.max(drawdowns))
        if underwater_periods_sim:
            underwater_periods.extend(underwater_periods_sim)

    # Calculate daily returns statistics
    daily_returns_mean = np.mean(daily_returns_results, axis=1)
    daily_volatility = np.std(daily_returns_results, axis=1)

    # Calculate VaR and CVaR at different confidence levels
    var_levels = [0.95, 0.99]
    var_results = {}
    cvar_results = {}

    for level in var_levels:
        # Calculate VaR for final values
        var_threshold = np.percentile(final_values, 100 * (1 - level))
        var_results[str(int(level * 100))] = float(initial_investment - var_threshold)

        # Calculate CVaR (Expected Shortfall)
        tail_values = final_values[final_values <= var_threshold]
        if len(tail_values) > 0:
            cvar = np.mean(tail_values)
            cvar_results[str(int(level * 100))] = float(initial_investment - cvar)
        else:
            cvar_results[str(int(level * 100))] = float(var_results[str(int(level * 100))])

    # Calculate annualized return and volatility
    annualized_returns = []
    for i in range(num_simulations):
        final_value = simulation_results[-1, i]
        years = time_horizon / 252  # Convert days to years
        annualized_return = ((final_value / initial_investment) ** (1 / years)) - 1
        annualized_returns.append(annualized_return)

    # Prepare results
    results = {
        'percentiles': {
            str(p): float(v) for p, v in zip(percentiles, percentile_values)
        },
        'max_drawdown': {
            'mean': float(np.mean(max_drawdowns)),
            'median': float(np.median(max_drawdowns)),
            'max': float(np.max(max_drawdowns)),
            'min': float(np.min(max_drawdowns)),
            'percentiles': {
                str(p): float(np.percentile(max_drawdowns, p)) for p in [5, 25, 50, 75, 95]
            }
        },
        'recovery_time': {
            'mean': float(np.mean(recovery_times)) if recovery_times else None,
            'median': float(np.median(recovery_times)) if recovery_times else None,
            'max': float(np.max(recovery_times)) if recovery_times else None
        },
        'underwater_periods': {
            'mean': float(np.mean(underwater_periods)) if underwater_periods else None,
            'median': float(np.median(underwater_periods)) if underwater_periods else None,
            'max': float(np.max(underwater_periods)) if underwater_periods else None
        },
        'final_value': {
            'mean': float(np.mean(final_values)),
            'median': float(np.median(final_values)),
            'min': float(np.min(final_values)),
            'max': float(np.max(final_values)),
            'std': float(np.std(final_values))
        },
        'annualized_return': {
            'mean': float(np.mean(annualized_returns)),
            'median': float(np.median(annualized_returns)),
            'min': float(np.min(annualized_returns)),
            'max': float(np.max(annualized_returns))
        },
        'var': var_results,
        'cvar': cvar_results,
        'initial_investment': float(initial_investment),
        'time_horizon_days': int(time_horizon),
        'num_simulations': int(num_simulations)
    }

    # Sample of the simulation paths (for visualization)
    sample_indices = np.random.choice(num_simulations, min(10, num_simulations), replace=False)
    sample_paths = simulation_results[:, sample_indices]

    # Create time points for x-axis (days)
    time_points = list(range(time_horizon))

    # Prepare visualization data
    visualization_data = {
        'time_points': time_points,
        'paths': sample_paths.tolist(),
        'percentile_paths': {
            str(p): np.percentile(simulation_results, p, axis=1).tolist() for p in [5, 25, 50, 75, 95]
        }
    }

    results['visualization'] = visualization_data

    return results

def plot_simulation_results(simulation_results):
    """
    Plot the Monte Carlo simulation results.
    """
    plt.figure(figsize=(12, 8))

    # Get visualization data
    viz_data = simulation_results['visualization']
    time_points = viz_data['time_points']

    # Convert paths to numpy array for easier handling
    paths_array = np.array(viz_data['paths'])

    # Transpose if necessary to ensure correct dimensions
    if paths_array.shape[0] != len(time_points):
        paths_array = paths_array.T

    # Plot sample paths
    for i in range(paths_array.shape[1]):
        plt.plot(time_points, paths_array[:, i], 'b-', alpha=0.1)

    # Plot percentile paths
    percentile_colors = {
        '5': 'r',
        '25': 'orange',
        '50': 'g',
        '75': 'blue',
        '95': 'yellow'
    }

    for percentile, path in viz_data['percentile_paths'].items():
        path_array = np.array(path)
        plt.plot(time_points, path_array, color=percentile_colors.get(percentile, 'k'),
                 linewidth=2, label=f"{percentile}th Percentile")

    # Add initial investment line
    plt.axhline(y=simulation_results['initial_investment'], color='k', linestyle='--',
                label='Initial Investment')

    # Add labels and title
    plt.xlabel('Days')
    plt.ylabel('Portfolio Value ($)')
    plt.title('Monte Carlo Simulation of Portfolio Performance')
    plt.legend()
    plt.grid(True)

    # Save the figure
    plt.savefig('monte_carlo_simulation.png')

    # Show the plot
    plt.show()
