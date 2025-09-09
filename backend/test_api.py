import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base URL for API
BASE_URL = "http://localhost:5000"

def test_auth_endpoints():
    print("\n===== Testing Authentication Endpoints =====")
    
    # Test registration
    print("\nTesting registration...")
    register_data = {
        "username": "testuser",
        "password": "password123",
        "email": "testuser@example.com"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test login
    print("\nTesting login...")
    login_data = {
        "username": "test",  # Using the default test user
        "password": "12345"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Status code: {response.status_code}")
        result = response.json()
        print(f"Response: {result}")
        
        # Save token for subsequent requests
        if "token" in result:
            token = result["token"]
            return token
        else:
            print("No token received")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_portfolio_endpoints(token):
    print("\n===== Testing Portfolio Endpoints =====")
    
    if not token:
        print("No authentication token available. Skipping portfolio tests.")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test fetch-data endpoint
    print("\nTesting fetch-data endpoint...")
    fetch_data = {
        "tickers": ["AAPL", "MSFT", "GOOGL"],
        "start_date": "2022-01-01",
        "end_date": "2022-12-31"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/portfolio/fetch-data", json=fetch_data, headers=headers)
        print(f"Status code: {response.status_code}")
        result = response.json()
        print(f"Response keys: {list(result.keys())}")
        print(f"Number of data points: {len(result.get('data', []))}")
        
        # Save data for optimize endpoint
        if "data" in result:
            stock_data = result
        else:
            print("No stock data received")
            return
    except Exception as e:
        print(f"Error: {e}")
        return
    
    # Test optimize endpoint
    print("\nTesting optimize endpoint...")
    optimize_data = {
        "tickers": ["AAPL", "MSFT", "GOOGL"],
        "risk_tolerance": 0.5,
        "start_date": "2022-01-01",
        "end_date": "2022-12-31"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/portfolio/optimize", json=optimize_data, headers=headers)
        print(f"Status code: {response.status_code}")
        result = response.json()
        print(f"Response keys: {list(result.keys())}")
        print(f"Weights: {result.get('weights', [])}")
        
        # Save weights for metrics endpoint
        if "weights" in result:
            weights = result["weights"]
        else:
            print("No weights received")
            return
    except Exception as e:
        print(f"Error: {e}")
        return
    
    # Test metrics endpoint
    print("\nTesting metrics endpoint...")
    metrics_data = {
        "tickers": ["AAPL", "MSFT", "GOOGL"],
        "weights": weights,
        "start_date": "2022-01-01",
        "end_date": "2022-12-31"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/portfolio/metrics", json=metrics_data, headers=headers)
        print(f"Status code: {response.status_code}")
        result = response.json()
        print(f"Response keys: {list(result.keys())}")
        print(f"Expected Return: {result.get('expected_return', 'N/A')}")
        print(f"Volatility: {result.get('volatility', 'N/A')}")
        print(f"Sharpe Ratio: {result.get('sharpe_ratio', 'N/A')}")
    except Exception as e:
        print(f"Error: {e}")

def main():
    print("Starting API tests...")
    token = test_auth_endpoints()
    test_portfolio_endpoints(token)
    print("\nAPI tests completed.")

if __name__ == "__main__":
    main()