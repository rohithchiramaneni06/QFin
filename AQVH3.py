from AQVH1 import *
from qiskit.algorithms.minimum_eigen_solvers import QAOA
from qiskit.algorithms.optimizers import COBYLA
from qiskit_optimization import QuadraticProgram
from qiskit_optimization.algorithms import MinimumEigenOptimizer
from qiskit.utils import QuantumInstance, algorithm_globals
from qiskit import Aer

# -------------------------------
# QAOA Portfolio Optimization
# -------------------------------

# User Inputs
k = int(input("Enter the number of assets to include in the portfolio: "))
user_risk_percent = float(input("Enter the desired risk percentage (0-100): "))
user_risk = user_risk_percent / 100  # convert to fraction

# Set random seed for reproducibility
algorithm_globals.random_seed = 42

# Define assets and statistics
assets = returns.columns.tolist()
n = len(assets)

# Create a Quadratic Program
qp = QuadraticProgram()

# Add binary variables for each asset
for asset in assets:
    qp.binary_var(name=asset)

# Define lambda using user-specified risk
# Scale λ so that higher user_risk increases weight on variance
# Annualized mean return and annualized volatility of all assets
# avg_return = mu.mean()
# avg_vol = np.sqrt(np.mean(np.diag(cov_matrix)))  # std dev, not variance
#
# # Lambda: scale ratio of risk to return
# lam = user_risk * (avg_return / avg_vol)
# lam = user_risk * (avg_return / avg_vol)
# lam = user_risk * (np.max(cov_matrix.values) / np.mean(mu.values))

# -------------------------------
# Define lambda (risk appetite scaling)
# -------------------------------

avg_return = mu.mean()
avg_vol = np.sqrt(np.mean(np.diag(cov_matrix)))  # portfolio average volatility

# Invert lambda: low user_risk → high penalty on variance, high user_risk → low penalty
# Added non-linear scaling for better spread
# Scale factor to give more weight to return when user selects higher risk
# Map user risk (0-1) to lambda (0.1 – 10) non-linearly
lam_min, lam_max = 0.1, 10
lam = lam_min + (1 - user_risk)**2 * (lam_max - lam_min)

# multiply by factor 10 to amplify impact
print(f"Lambda scaling factor: {lam:.4f}")


 # scaling factor 10 to adjust impact

# Objective: Minimize variance - lambda * return
linear = {assets[i]: -mu.iloc[i] for i in range(n)}
quadratic = {(assets[i], assets[j]): lam * cov_matrix.iloc[i, j] for i in range(n) for j in range(n)}
avg_vol = np.sqrt(np.mean(np.diag(cov_matrix)))
norm_factor = lam / avg_vol  # normalize return by volatility

# Step 3: scale linear part by normalized factor
linear_scaled = {asset: val * norm_factor for asset, val in linear.items()}

# Step 4: scale quadratic part by lambda
quadratic_scaled = {key: val * lam for key, val in quadratic.items()}
qp.minimize(linear=linear_scaled, quadratic=quadratic_scaled)

# Constraint: select exactly k assets
qp.linear_constraint(linear={asset: 1 for asset in assets}, sense='==', rhs=k, name='pick_k_assets')

# Set up the quantum instance
backend = Aer.get_backend('aer_simulator')
quantum_instance = QuantumInstance(backend, seed_simulator=42, seed_transpiler=42)

# Set up the QAOA algorithm
qaoa = QAOA(optimizer=COBYLA(maxiter=200), reps=3, quantum_instance=quantum_instance)

# Solve the problem using QAOA
optimizer = MinimumEigenOptimizer(qaoa)
result = optimizer.solve(qp)


# Selected assets
selected_assets = [assets[i] for i in range(n) if result.x[i] > 0]
print("\n=== QAOA Selected Assets ===")
print(selected_assets)

# -------------------------------
# Step 2: Fractional Allocation for selected assets
# -------------------------------
selected_mu = mu[selected_assets]
selected_cov = cov_matrix.loc[selected_assets, selected_assets]

# Compute preliminary weights proportional to mu / variance
weights_raw = selected_mu / np.diag(selected_cov)
weights_fractional = weights_raw / weights_raw.sum()  # normalize to 1

# Scale weights to match user risk
portfolio_variance = weights_fractional.values @ selected_cov.values @ weights_fractional.values
portfolio_vol = np.sqrt(portfolio_variance)
scaling_factor = user_risk / portfolio_vol
weights_fractional = weights_fractional * scaling_factor

# Normalize again to sum to 1
weights_fractional = weights_fractional / weights_fractional.sum()

print("\n=== Fractional Portfolio Allocation (%) ===")
print((weights_fractional * 100).sort_values(ascending=False).round(2))
# User input for risk-free rate
# risk_free_rate_percent = float(input("Enter the risk-free rate (in %): "))
risk_free_rate = 0.02

# Sharpe ratio adjusted
portfolio_returns = returns[selected_assets] @ weights_fractional

# Step 2: downside deviation
downside_returns = np.minimum(portfolio_returns - risk_free_rate, 0)
downside_deviation = np.sqrt((downside_returns**2).mean())

# Step 3: Sortino Ratio

# Portfolio metrics
expected_return = np.dot(weights_fractional.values, selected_mu)
portfolio_risk = np.sqrt(weights_fractional.values @ selected_cov.values @ weights_fractional.values)
sharpe_ratio = (expected_return - risk_free_rate) / portfolio_risk if portfolio_risk > 0 else 0
sortino_ratio = (expected_return - risk_free_rate) / downside_deviation if downside_deviation > 0 else 0


print(f"\nExpected Return: {expected_return:.4f}")
print(f"Portfolio Risk (Volatility): {portfolio_risk:.4f}")
print(f"Sharpe Ratio (Rf={risk_free_rate:.2%}): {sharpe_ratio:.4f}")
print(f"Sortino Ratio (Rf={risk_free_rate:.2%}): {sortino_ratio:.4f}")