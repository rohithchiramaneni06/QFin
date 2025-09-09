import yfinance as yf
from datetime import datetime, timedelta

end = datetime.today()
start = end - timedelta(days=365)  # last 1 year

data = yf.download("AAPL", start=start.strftime('%Y-%m-%d'), end=end.strftime('%Y-%m-%d'))
print(data.head())
print(data.index)
print(data.shape)
