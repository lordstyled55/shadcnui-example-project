#!/bin/bash

# DOS Tool Metrics Test Script
# This script sends test metrics to your monitoring dashboard

DASHBOARD_URL="http://localhost:8000"  # Change this to your dashboard URL
TARGET_URL="http://example.com"        # Change this to your target URL

echo "Sending test metrics to DOS Monitor Dashboard..."
echo "Dashboard URL: $DASHBOARD_URL"
echo "Target URL: $TARGET_URL"
echo ""

# Function to send metrics
send_metrics() {
    local rps=$1
    local connections=$2
    local total_requests=$3
    local response_time=$4
    local success_rate=$5
    local error_count=$6
    local bytes_sent=$7
    local bytes_received=$8
    
    curl -X POST "$DASHBOARD_URL/api/dos-metrics" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        -d "{
            \"requests_per_second\": $rps,
            \"total_requests\": $total_requests,
            \"active_connections\": $connections,
            \"target_url\": \"$TARGET_URL\",
            \"timestamp\": $(date +%s),
            \"response_time_avg\": $response_time,
            \"success_rate\": $success_rate,
            \"error_count\": $error_count,
            \"bytes_sent\": $bytes_sent,
            \"bytes_received\": $bytes_received
        }"
    
    echo ""
}

# Send a few test metrics
echo "Sending test metric 1..."
send_metrics 150 25 1000 45.5 95.2 48 50000 250000

sleep 1

echo "Sending test metric 2..."
send_metrics 275 42 1500 38.2 97.8 33 75000 375000

sleep 1

echo "Sending test metric 3..."
send_metrics 420 68 2200 52.1 93.5 143 110000 550000

sleep 1

echo "Sending test metric 4..."
send_metrics 380 55 2800 41.8 96.1 109 95000 475000

sleep 1

echo "Sending test metric 5..."
send_metrics 500 85 3500 67.3 91.2 308 125000 625000

echo ""
echo "Test metrics sent! Check your dashboard at: $DASHBOARD_URL/dos-monitor"