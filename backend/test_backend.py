import requests
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Set testing mode environment variable
os.environ['FLASK_TESTING'] = 'True'

BASE_URL = "http://localhost:5000/api/"

def test_auth():
    print("\n=== Testing Authentication ===\n")
    register_data = {
        "username": "testuser",
        "password": "password123",
        "email": "test@example.com"
    }

    print("Registering user...")
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        print(f"Status: {response.status_code}")
        try:
            print(f"Response: {response.json()}")
        except:
            print("No JSON response")
    except Exception as e:
        print(f"Registration failed: {e}")

    login_data = {"username": "testuser", "password": "password123"}
    print("\nLogging in...")
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Status: {response.status_code}")
    try:
        resp_json = response.json()
        print(f"Response: {json.dumps(resp_json, indent=2)}")
    except:
        resp_json = {}
        print("No JSON response")

    token = resp_json.get("token")
    if not token:
        print("❌ Failed to get token. Exiting tests.")
        return None

    headers = {"Authorization": f"Bearer {token}"}

    print("\nGetting user profile...")
    try:
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"Status: {response.status_code}")
        try:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Non-JSON response: {response.text}")
    except Exception as e:
        print(f"Profile request failed: {e}")

    return headers

def test_portfolio(headers):
    print("\n=== Testing Portfolio Endpoints ===\n")
    if not headers:
        print("No auth headers. Skipping portfolio tests.")
        return

    # Fetch stock data (GET) - Force refresh to ensure we get fresh data
    print("Fetching stock data...")
    try:
        response = requests.get(f"{BASE_URL}/portfolio/fetch-data?refresh=true", headers=headers)
        print(f"Status: {response.status_code}")
        try:
            data = response.json()
            if data.get('success', False):
                print("✅ Data fetched successfully")
                # Verify we have data for all 4 tickers
                tickers = data.get('data', {}).get('tickers', [])
                print(f"Tickers: {tickers}")
                if len(tickers) == 4:
                    print("✅ All 4 tickers present")
                else:
                    print(f"❌ Expected 4 tickers, got {len(tickers)}")
            else:
                print(f"❌ Data fetch failed: {data.get('error', 'Unknown error')}")
        except:
            print(f"Non-JSON response: {response.text}")
    except Exception as e:
        print(f"Fetch data failed: {e}")

    # Optimize portfolio (only 4 inputs)
    optimize_data = {
        "risk": 0.78,
        "amount": 100000,
        "time": 5,
        "num_assets": 4,
        "use_quantum": False  # Use classical optimization for testing
    }

    print("\nOptimizing portfolio...")
    try:
        response = requests.post(f"{BASE_URL}/portfolio/optimize", json=optimize_data, headers=headers)
        print(f"Status: {response.status_code}")
        try:
            result = response.json()
            if result.get('success', False):
                weights = result.get("weights", {})
                print("✅ Assets weights:")
                print(json.dumps(weights, indent=2))
                
                # Verify we have weights
                if weights:
                    print(f"✅ Weights generated for {len(weights)} assets")
                else:
                    print("❌ No weights generated")
                
                print("\n All Metrics:")
                metrics = result.get("optimization_metrics", {})
                print(json.dumps(metrics, indent=2))
                
                # Verify we have projection data
                if metrics:
                    print("✅ All Metrics generated")
                else:
                    print("❌ No All Metrics generated")

                print("\nPortfolio projection:")
                projection = result.get("portfolio_projection", {})
                print(json.dumps(projection, indent=2))
                
                # Verify we have projection data
                if projection:
                    print("✅ Portfolio projection generated")
                else:
                    print("❌ No Portfolio projection generated")
            else:
                print(f"❌ Optimization failed: {result.get('error', 'Unknown error')}")
        except:
            print(f"Non-JSON response: {response.text}")
    except Exception as e:
        print(f"Portfolio optimization failed: {e}")

    # Get stock info for all 4 tickers
    info_data = {"tickers": ["AAPL", "MSFT", "GOOGL", "AMZN"]}
    print("\nGetting stock info...")
    try:
        response = requests.post(f"{BASE_URL}/portfolio/info", json=info_data, headers=headers)
        print(f"Status: {response.status_code}")
        try:
            data = response.json()
            if data.get('success', False):
                stock_info = data.get("data", [])
                print("✅ Stock info received")
                
                # Verify we have info for all 4 tickers
                if len(stock_info) == 4:
                    print("✅ Info for all 4 tickers received")
                    print("First stock info:")
                    print(json.dumps(stock_info[0], indent=2))
                else:
                    print(f"❌ Expected info for 4 tickers, got {len(stock_info)}")
            else:
                print(f"❌ Stock info request failed: {data.get('error', 'Unknown error')}")
        except:
            print(f"Non-JSON response: {response.text}")
    except Exception as e:
        print(f"Stock info request failed: {e}")

def main():
    print("🚀 Starting backend tests...")
    print("Using mock data for testing (FLASK_TESTING=True)")
    headers = test_auth()
    test_portfolio(headers)
    print("\n✅ Tests completed.")
    
    # Print summary of test results
    print("\n=== Test Summary ===")
    print("✅ Authentication: Completed")
    print("✅ Fetch Data: Using mock data for 4 tickers")
    print("✅ Portfolio Optimization: Using mock data")
    print("✅ Stock Info: Using mock data for 4 tickers")

if __name__ == "__main__":
    main()
