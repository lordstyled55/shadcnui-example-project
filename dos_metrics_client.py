#!/usr/bin/env python3
"""
DOS Tool Metrics Client
Send metrics from your DOS tool to the monitoring dashboard
"""

import requests
import time
import json
import threading
from datetime import datetime
from typing import Dict, Any, Optional

class DosMetricsClient:
    def __init__(self, dashboard_url: str, target_url: str):
        """
        Initialize the DOS metrics client
        
        Args:
            dashboard_url: URL of your monitoring dashboard (e.g., 'http://your-server.com')
            target_url: The target URL being tested
        """
        self.dashboard_url = dashboard_url.rstrip('/')
        self.target_url = target_url
        self.metrics_endpoint = f"{self.dashboard_url}/api/dos-metrics"
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'DOS-Tool-Metrics-Client/1.0'
        })
        
        # Metrics tracking
        self.total_requests = 0
        self.error_count = 0
        self.bytes_sent = 0
        self.bytes_received = 0
        self.response_times = []
        
    def send_metrics(self, 
                    requests_per_second: float,
                    active_connections: int,
                    response_time_avg: Optional[float] = None,
                    success_rate: Optional[float] = None,
                    error_count: Optional[int] = None,
                    bytes_sent: Optional[int] = None,
                    bytes_received: Optional[int] = None) -> bool:
        """
        Send metrics to the dashboard
        
        Args:
            requests_per_second: Current requests per second
            active_connections: Number of active connections
            response_time_avg: Average response time in milliseconds
            success_rate: Success rate percentage (0-100)
            error_count: Number of errors
            bytes_sent: Total bytes sent
            bytes_received: Total bytes received
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            metrics = {
                'requests_per_second': requests_per_second,
                'total_requests': self.total_requests,
                'active_connections': active_connections,
                'target_url': self.target_url,
                'timestamp': int(time.time()),
                'response_time_avg': response_time_avg or 0,
                'success_rate': success_rate or 100.0,
                'error_count': error_count or self.error_count,
                'bytes_sent': bytes_sent or self.bytes_sent,
                'bytes_received': bytes_received or self.bytes_received,
            }
            
            response = self.session.post(self.metrics_endpoint, json=metrics)
            
            if response.status_code == 200:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Metrics sent successfully: {requests_per_second:.1f} RPS")
                return True
            else:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Failed to send metrics: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Error sending metrics: {e}")
            return False
    
    def update_metrics(self, 
                      requests_per_second: float,
                      active_connections: int,
                      response_time: Optional[float] = None,
                      success: bool = True,
                      bytes_sent: int = 0,
                      bytes_received: int = 0):
        """
        Update internal metrics and send to dashboard
        
        Args:
            requests_per_second: Current requests per second
            active_connections: Number of active connections
            response_time: Response time in milliseconds
            success: Whether the request was successful
            bytes_sent: Bytes sent in this request
            bytes_received: Bytes received in this request
        """
        self.total_requests += 1
        self.bytes_sent += bytes_sent
        self.bytes_received += bytes_received
        
        if not success:
            self.error_count += 1
            
        if response_time is not None:
            self.response_times.append(response_time)
            # Keep only last 100 response times for average calculation
            if len(self.response_times) > 100:
                self.response_times = self.response_times[-100:]
        
        # Calculate averages
        response_time_avg = sum(self.response_times) / len(self.response_times) if self.response_times else 0
        success_rate = ((self.total_requests - self.error_count) / self.total_requests * 100) if self.total_requests > 0 else 100
        
        # Send metrics
        self.send_metrics(
            requests_per_second=requests_per_second,
            active_connections=active_connections,
            response_time_avg=response_time_avg,
            success_rate=success_rate,
            error_count=self.error_count,
            bytes_sent=self.bytes_sent,
            bytes_received=self.bytes_received
        )


def example_usage():
    """
    Example of how to use the DOS metrics client
    """
    # Initialize the client
    client = DosMetricsClient(
        dashboard_url='http://your-server.com',  # Replace with your dashboard URL
        target_url='http://target-website.com'   # Replace with your target URL
    )
    
    # Simulate sending metrics every second
    import random
    
    for i in range(60):  # Run for 60 seconds
        rps = random.uniform(100, 1000)  # Random RPS between 100-1000
        connections = random.randint(50, 200)  # Random connections between 50-200
        response_time = random.uniform(10, 500)  # Random response time 10-500ms
        success = random.random() > 0.1  # 90% success rate
        
        client.update_metrics(
            requests_per_second=rps,
            active_connections=connections,
            response_time=response_time,
            success=success,
            bytes_sent=random.randint(100, 1000),
            bytes_received=random.randint(500, 5000)
        )
        
        time.sleep(1)  # Wait 1 second


if __name__ == "__main__":
    print("DOS Metrics Client")
    print("==================")
    print("This script demonstrates how to send metrics to your DOS monitoring dashboard.")
    print("Modify the dashboard_url and target_url in example_usage() to match your setup.")
    print()
    
    # Uncomment the line below to run the example
    # example_usage()