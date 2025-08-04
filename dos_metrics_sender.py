#!/usr/bin/env python3
"""
DOS Metrics Sender
This script sends metrics from a DOS tool to the monitoring dashboard.
Run this on the server where your DOS tool is running.
"""

import requests
import time
import json
import random
import argparse
from datetime import datetime
from typing import Dict, Any

class DosMetricsSender:
    def __init__(self, dashboard_url: str, target_url: str):
        self.dashboard_url = dashboard_url.rstrip('/')
        self.target_url = target_url
        self.start_time = None
        self.total_requests = 0
        self.is_running = False
        
    def start_attack(self):
        """Start the attack simulation"""
        self.is_running = True
        self.start_time = datetime.now().isoformat()
        print(f"🚀 Starting attack on {self.target_url}")
        print(f"📊 Sending metrics to {self.dashboard_url}")
        
    def stop_attack(self):
        """Stop the attack simulation"""
        self.is_running = False
        print("🛑 Attack stopped")
        
    def generate_metrics(self) -> Dict[str, Any]:
        """Generate realistic DOS metrics"""
        if not self.is_running:
            return {
                'requests_per_second': 0,
                'total_requests': self.total_requests,
                'active_connections': 0,
                'average_response_time': 0,
                'success_rate': 100,
                'error_rate': 0,
                'target_url': self.target_url,
                'status': 'stopped',
                'start_time': self.start_time,
                'errors': [],
                'response_codes': []
            }
        
        # Simulate realistic DOS metrics
        base_rps = random.randint(500, 2000)
        # Add some variation
        rps_variation = random.uniform(0.8, 1.2)
        requests_per_second = int(base_rps * rps_variation)
        
        # Update total requests
        self.total_requests += requests_per_second
        
        # Simulate response times (higher under load)
        base_response_time = 50
        load_factor = requests_per_second / 1000  # Higher load = slower responses
        average_response_time = base_response_time + (load_factor * 150)
        
        # Simulate success/error rates
        success_rate = max(70, 100 - (load_factor * 20))  # Higher load = more errors
        error_rate = 100 - success_rate
        
        # Simulate active connections
        active_connections = int(requests_per_second * random.uniform(0.3, 0.7))
        
        # Generate error breakdown
        errors = [
            {'type': 'connection_timeout', 'count': int(requests_per_second * error_rate * 0.4 / 100)},
            {'type': 'server_error_500', 'count': int(requests_per_second * error_rate * 0.3 / 100)},
            {'type': 'rate_limited_429', 'count': int(requests_per_second * error_rate * 0.2 / 100)},
            {'type': 'other_errors', 'count': int(requests_per_second * error_rate * 0.1 / 100)}
        ]
        
        # Generate response codes
        response_codes = [
            {'code': '200', 'count': int(requests_per_second * success_rate / 100), 'percentage': success_rate},
            {'code': '500', 'count': int(requests_per_second * error_rate * 0.3 / 100), 'percentage': error_rate * 0.3},
            {'code': '429', 'count': int(requests_per_second * error_rate * 0.2 / 100), 'percentage': error_rate * 0.2},
            {'code': 'timeout', 'count': int(requests_per_second * error_rate * 0.4 / 100), 'percentage': error_rate * 0.4},
            {'code': 'other', 'count': int(requests_per_second * error_rate * 0.1 / 100), 'percentage': error_rate * 0.1}
        ]
        
        return {
            'requests_per_second': requests_per_second,
            'total_requests': self.total_requests,
            'active_connections': active_connections,
            'average_response_time': round(average_response_time, 2),
            'success_rate': round(success_rate, 1),
            'error_rate': round(error_rate, 1),
            'target_url': self.target_url,
            'status': 'running' if self.is_running else 'stopped',
            'start_time': self.start_time,
            'errors': errors,
            'response_codes': response_codes
        }
    
    def send_metrics(self, metrics: Dict[str, Any]) -> bool:
        """Send metrics to the dashboard"""
        try:
            response = requests.post(
                f"{self.dashboard_url}/api/dos/metrics",
                json=metrics,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            
            if response.status_code == 200:
                return True
            else:
                print(f"❌ Failed to send metrics: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Network error: {e}")
            return False
    
    def run(self, interval: float = 2.0):
        """Main loop to continuously send metrics"""
        print("📡 Starting DOS metrics sender...")
        print(f"🎯 Target: {self.target_url}")
        print(f"📊 Dashboard: {self.dashboard_url}")
        print(f"⏱️  Update interval: {interval}s")
        print("=" * 50)
        
        try:
            while True:
                if self.is_running:
                    metrics = self.generate_metrics()
                    success = self.send_metrics(metrics)
                    
                    if success:
                        print(f"✅ Sent: {metrics['requests_per_second']} RPS, "
                              f"{metrics['total_requests']} total, "
                              f"{metrics['success_rate']}% success")
                    else:
                        print("❌ Failed to send metrics")
                
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\n🛑 Stopping metrics sender...")
            # Send final stopped state
            final_metrics = self.generate_metrics()
            final_metrics['status'] = 'stopped'
            self.send_metrics(final_metrics)
            print("👋 Goodbye!")

def main():
    parser = argparse.ArgumentParser(description='DOS Metrics Sender')
    parser.add_argument('--dashboard', required=True, help='Dashboard URL (e.g., http://your-server.com)')
    parser.add_argument('--target', required=True, help='Target URL to attack')
    parser.add_argument('--interval', type=float, default=2.0, help='Update interval in seconds (default: 2.0)')
    parser.add_argument('--start', action='store_true', help='Start attack immediately')
    
    args = parser.parse_args()
    
    sender = DosMetricsSender(args.dashboard, args.target)
    
    if args.start:
        sender.start_attack()
    
    sender.run(args.interval)

if __name__ == "__main__":
    main()