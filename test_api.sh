#!/bin/bash

# Test script for DOS Monitor API using curl
# Run this to verify the dashboard API is working correctly.

BASE_URL=${1:-"http://localhost:8000"}

echo "🧪 Testing API at: $BASE_URL"
echo "=================================================="

# Test health endpoint
echo "1. Testing health endpoint..."
if curl -s -f "$BASE_URL/api/dos/health" > /dev/null; then
    echo "✅ Health check passed"
    curl -s "$BASE_URL/api/dos/health" | jq . 2>/dev/null || curl -s "$BASE_URL/api/dos/health"
else
    echo "❌ Health check failed"
fi

echo

# Test status endpoint
echo "2. Testing status endpoint..."
if curl -s -f "$BASE_URL/api/dos/status" > /dev/null; then
    echo "✅ Status check passed"
    curl -s "$BASE_URL/api/dos/status" | jq . 2>/dev/null || curl -s "$BASE_URL/api/dos/status"
else
    echo "❌ Status check failed"
fi

echo

# Test metrics endpoint
echo "3. Testing metrics endpoint..."
if curl -s -f "$BASE_URL/api/dos/metrics" > /dev/null; then
    echo "✅ Metrics retrieval passed"
    RESPONSE=$(curl -s "$BASE_URL/api/dos/metrics")
    echo "   Response received"
    if command -v jq >/dev/null 2>&1; then
        echo "   Current metrics: $(echo "$RESPONSE" | jq -r '.current // "None"')"
        echo "   History entries: $(echo "$RESPONSE" | jq -r '.history | length // 0')"
    fi
else
    echo "❌ Metrics retrieval failed"
fi

echo

# Test posting metrics
echo "4. Testing metrics posting..."
TEST_METRICS='{
  "requests_per_second": 1000,
  "total_requests": 5000,
  "active_connections": 250,
  "average_response_time": 75.5,
  "success_rate": 95.0,
  "error_rate": 5.0,
  "target_url": "http://test-server.com",
  "status": "running",
  "start_time": "2024-01-15T10:00:00Z",
  "errors": [{"type": "connection_timeout", "count": 10}],
  "response_codes": [{"code": "200", "count": 950, "percentage": 95.0}]
}'

if curl -s -f -X POST "$BASE_URL/api/dos/metrics" \
    -H "Content-Type: application/json" \
    -d "$TEST_METRICS" > /dev/null; then
    echo "✅ Metrics posting passed"
    RESPONSE=$(curl -s -X POST "$BASE_URL/api/dos/metrics" \
        -H "Content-Type: application/json" \
        -d "$TEST_METRICS")
    if command -v jq >/dev/null 2>&1; then
        echo "$RESPONSE" | jq .
    else
        echo "$RESPONSE"
    fi
else
    echo "❌ Metrics posting failed"
fi

echo

# Test dashboard page
echo "5. Testing dashboard page..."
if curl -s -f "$BASE_URL/dos-monitor" > /dev/null; then
    echo "✅ Dashboard page accessible"
else
    echo "❌ Dashboard page failed"
fi

echo
echo "=================================================="
echo "🎯 Test completed!"
echo "If all tests passed, your dashboard is ready to use."
echo "You can now run the dos_metrics_sender.py on your friend's server."