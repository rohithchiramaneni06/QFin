
import matplotlib.pyplot as plt
import seaborn as sns
from AQVH1 import *
# -----------------------------
# 1. Correlation Heatmap
# -----------------------------
plt.figure(figsize=(30, 15))
sns.heatmap(returns.corr(), cmap="coolwarm", annot=True, cbar=True)
plt.title("Asset Correlation Heatmap", fontsize=16)
plt.show()

# -----------------------------
# 2. Risk-Return Scatter Plot
# -----------------------------
plt.figure(figsize=(10, 6))
plt.scatter(sigma, mu, s=100)

for i, txt in enumerate(mu.index):
    plt.annotate(txt, (sigma[i], mu[i]), fontsize=9)

plt.xlabel("Volatility (Risk)", fontsize=12)
plt.ylabel("Annualized Return", fontsize=12)
plt.title("Risk vs Return (17-asset portfolio)", fontsize=16)
plt.grid(True, linestyle="--", alpha=0.6)
plt.show()

