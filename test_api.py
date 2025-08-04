#!/usr/bin/env python3
"""
Test script for DOS Monitor API
Run this to verify the dashboard API is working correctly.
"""

import requests
import json
import time

def test_api(base_url):
    """Test all API endpoints"""
    print(f"🧪 Testing API at: {base_url}")
    print("=" * 50)
    
    # Test health endpoint
    print("1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/api/dos/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
    
    print()
    
    # Test status endpoint
    print("2. Testing status endpoint...")
    try:
        response = requests.get(f"{base_url}/api/dos/status", timeout=5)
        if response.status_code == 200:
            print("✅ Status check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Status check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Status check error: {e}")
    
    print()
    
    # Test metrics endpoint
    print("3. Testing metrics endpoint...")
    try:
        response = requests.get(f"{base_url}/api/dos/metrics", timeout=5)
        if response.status_code == 200:
            print("✅ Metrics retrieval passed")
            data = response.json()
            print(f"   Current metrics: {data.get('current', 'None')}")
            print(f"   History entries: {len(data.get('history', []))}")
        else:
            print(f"❌ Metrics retrieval failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Metrics retrieval error: {e}")
    
    print()
    
    # Test posting metrics
    print("4. Testing metrics posting...")
    test_metrics = {
        "requests_per_second": 1000,
        "total_requests": 5000,
        "active_connections": 250,
        "average_response_time": 75.5,
        "success_rate": 95.0,
        "error_rate": 5.0,
        "target_url": "http://test-server.com",
        "status": "running",
        "start_time": "2024-01-15T10:00:00Z",
        "errors": [
            {"type": "connection_timeout", "count": 10}
        ],
        "response_codes": [
            {"code": "200", "count": 950, "percentage": 95.0}
        ]
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/dos/metrics",
            json=test_metrics,
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        if response.status_code == 200:
            print("✅ Metrics posting passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Metrics posting failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Metrics posting error: {e}")
    
    print()
    
    # Test dashboard page
    print("5. Testing dashboard page...")
    try:
        response = requests.get(f"{base_url}/dos-monitor", timeout=5)
        if response.status_code == 200:
            print("✅ Dashboard page accessible")
        else:
            print(f"❌ Dashboard page failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Dashboard page error: {e}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Test DOS Monitor API')
    parser.add_argument('--url', default='http://localhost:8000', 
                       help='Dashboard URL (default: http://localhost:8000)')
    
    args = parser.parse_args()
    
    test_api(args.url)
    
    print("\n" + "=" * 50)
    print("🎯 Test completed!")
    print("If all tests passed, your dashboard is ready to use.")
    print("You can now run the dos_metrics_sender.py on your friend's server.")

if __name__ == "__main__":
    main()