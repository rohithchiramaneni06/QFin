import matplotlib.pyplot as plt
from AQVH1 import mu,cov_matrix
from AQVH3 import weights_fractional
import numpy as np
# User Inputs
investment_amount = float(input("Enter the total amount to invest (in USD): "))
investment_horizon = int(input("Enter the investment horizon (in years): "))
# Expected portfolio return and risk (annualized)
selected_mu = mu[weights_fractional.index]
selected_cov = cov_matrix.loc[weights_fractional.index, weights_fractional.index]

expected_return_annual = np.dot(weights_fractional.values, selected_mu)
portfolio_variance_annual = weights_fractional.values @ selected_cov.values @ weights_fractional.values
portfolio_risk_annual = np.sqrt(portfolio_variance_annual)

# Projected portfolio value over the investment horizon
# Assuming returns compound annually
projected_value = investment_amount * ((1 + expected_return_annual) ** investment_horizon)

# Optional: include risk range (1 std deviation)
upper_value = investment_amount * ((1 + expected_return_annual + portfolio_risk_annual) ** investment_horizon)
lower_value = investment_amount * ((1 + expected_return_annual - portfolio_risk_annual) ** investment_horizon)
print("\n=== Portfolio Metrics ===")
print(f"Total Investment Amount: ${investment_amount:,.2f}")
print(f"Investment Horizon: {investment_horizon} years")
print(f"Expected Annual Return: {expected_return_annual:.4f}")
print(f"Annualized Portfolio Risk (Volatility): {portfolio_risk_annual:.4f}")
print(f"Projected Portfolio Value: ${projected_value:,.2f}")
print(f"Range (1σ): ${lower_value:,.2f} - ${upper_value:,.2f}")

print("\n=== Fractional Allocation ===")
print((weights_fractional * 100).sort_values(ascending=False).round(2))
asset_values = weights_fractional * projected_value
asset_values.plot(kind='bar', figsize=(10,6), title="Projected Value per Asset")
plt.ylabel("USD")
plt.show()
# Pie chart of portfolio allocation
plt.figure(figsize=(10, 8))
plt.pie(weights_fractional * 100, labels=weights_fractional.index, autopct='%1.1f%%', startangle=90, pctdistance=0.8)
plt.title("QAOA Optimized Portfolio Allocation (%)", fontsize=16)
plt.axis('equal')  # Equal aspect ratio ensures the pie is circular
plt.show()
