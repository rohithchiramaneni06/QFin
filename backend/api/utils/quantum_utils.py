import numpy as np
import pandas as pd

from qiskit_optimization import QuadraticProgram
from qiskit_optimization.converters import QuadraticProgramToQubo
from qiskit_optimization.algorithms import MinimumEigenOptimizer
from qiskit.primitives import Sampler
from qiskit_algorithms import QAOA
from qiskit_algorithms.optimizers import COBYLA

def build_qubo(mu, cov_matrix, user_risk, k, assets):
    """
    Select a subset of assets using QAOA to maximize return and minimize volatility.

    Args:
        mu : pd.Series of expected returns
        cov_matrix : pd.DataFrame covariance matrix
        user_risk : float in [0,1], higher → more risk tolerance
        k : int, number of assets to pick
        assets : list of asset names
        reps : QAOA repetitions
        maxiter : classical optimizer max iterations

    Returns:
        selection_vec : binary vector indicating selected assets
        selected_assets : list of selected asset names
    """
    n = len(assets)
    qp = QuadraticProgram()

    # Create binary variables for each asset
    for t in assets:
        qp.binary_var(name=t)

    # Adaptive lambda scaling: lower user_risk → higher penalty on variance
    lam_min, lam_max = 0.1, 10
    lam = lam_min + (1 - user_risk)**2 * (lam_max - lam_min)
    # Linear term: reward for return
    linear = {assets[i]: -mu.iloc[i] for i in range(n)}

    # Quadratic term: penalize variance
    quadratic = {(assets[i], assets[j]): lam * cov_matrix.iloc[i, j] for i in range(n) for j in range(n)}

    # Scale linear term by lambda/avg_vol to normalize return vs risk
    avg_vol = np.sqrt(np.mean(np.diag(cov_matrix)))
    linear_scaled = {asset: val * (lam / avg_vol) for asset, val in linear.items()}
    quadratic_scaled = {key: val * lam for key, val in quadratic.items()}

    qp.minimize(linear=linear_scaled, quadratic=quadratic_scaled)

    # Constraint: select exactly k assets
    qp.linear_constraint(
        linear={t: 1 for t in assets},
        sense="==",
        rhs=k,
        name="pick_k_assets"
    )

    # Convert to QUBO
    qubo = QuadraticProgramToQubo().convert(qp)

    return qubo

def solve_qubo_with_qaoa(qubo, assets, reps=2, maxiter=200):
    optimizer = COBYLA(maxiter=maxiter)

    # Sampler does not take a seed
    sampler = Sampler()  # exact expectation-based

    # Initialize QAOA
    qaoa = QAOA(sampler=sampler, reps=reps, optimizer=optimizer)

    # Solve with MinimumEigenOptimizer
    solver = MinimumEigenOptimizer(qaoa)
    result = solver.solve(qubo)

    selection_vec = np.array([int(result[x.name]) for x in qubo.variables])
    selected_assets = [assets[i] for i, v in enumerate(selection_vec) if v > 0]

    return selection_vec, selected_assets

def build_and_solve_qubo(mu, cov, tickers, k, risk_tolerance):
    """
    Perform quantum portfolio optimization
    
    Args:
        mu: Expected returns
        cov: Covariance matrix
        tickers: List of tickers
        risk_tolerance: Risk tolerance parameter (0-1)
        k: Number of assets to select
        
    Returns:
        weights: Optimized portfolio weights
        selected_tickers: Selected tickers
    """
    try:
        # Build QUBO
        qubo = build_qubo(mu, cov, risk_tolerance, k, tickers)
        # Solve with QAOA
        selected_vec, selected_assets = solve_qubo_with_qaoa(qubo, tickers, reps=2, maxiter=150)
        
        return selected_vec, selected_assets
    except Exception as e:
        print(f"Error in quantum optimization: {e}")
