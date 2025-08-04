# DOS Tool Monitoring Dashboard

A real-time monitoring dashboard built with Laravel, React, and shadcn/ui to track and visualize metrics from your DOS testing tool.

## Features

- **Real-time Metrics Display**: Live updates of requests per second, total requests, active connections, and more
- **Interactive Charts**: Multiple chart types showing trends over time
- **Performance Statistics**: Peak RPS, average response times, success rates, and more
- **Data Transfer Tracking**: Monitor bytes sent/received
- **Auto-refresh**: Configurable automatic updates
- **Responsive Design**: Works on desktop and mobile devices
- **No Request Blocking**: Accepts all incoming requests for comprehensive monitoring

## Dashboard URL

Once deployed, access your dashboard at:
```
http://your-server.com/dos-monitor
```

## API Endpoints

### Send Metrics
```
POST /api/dos-metrics
```

**Request Body:**
```json
{
    "requests_per_second": 150.5,
    "total_requests": 1000,
    "active_connections": 25,
    "target_url": "http://target-website.com",
    "timestamp": 1703123456,
    "response_time_avg": 45.2,
    "success_rate": 95.5,
    "error_count": 45,
    "bytes_sent": 50000,
    "bytes_received": 250000
}
```

### Get Current Metrics
```
GET /api/dos-metrics/current
```

### Get Historical Data
```
GET /api/dos-metrics/historical
```

### Get Statistics
```
GET /api/dos-metrics/stats
```

## Setup Instructions

### 1. Deploy to Your Server

1. Upload the Laravel project to your server
2. Install dependencies:
   ```bash
   composer install
   npm install
   ```

3. Set up environment:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. Build assets:
   ```bash
   npm run build
   ```

5. Configure your web server to point to the `public` directory

### 2. Configure Your DOS Tool

#### Option A: Using the Python Client

1. Install the Python client:
   ```bash
   pip install requests
   ```

2. Use the provided `dos_metrics_client.py`:
   ```python
   from dos_metrics_client import DosMetricsClient
   
   # Initialize client
   client = DosMetricsClient(
       dashboard_url='http://your-server.com',
       target_url='http://target-website.com'
   )
   
   # Send metrics
   client.update_metrics(
       requests_per_second=150.5,
       active_connections=25,
       response_time=45.2,
       success=True,
       bytes_sent=1000,
       bytes_received=5000
   )
   ```

#### Option B: Using cURL

```bash
curl -X POST "http://your-server.com/api/dos-metrics" \
  -H "Content-Type: application/json" \
  -d '{
    "requests_per_second": 150.5,
    "total_requests": 1000,
    "active_connections": 25,
    "target_url": "http://target-website.com",
    "timestamp": 1703123456,
    "response_time_avg": 45.2,
    "success_rate": 95.5,
    "error_count": 45,
    "bytes_sent": 50000,
    "bytes_received": 250000
  }'
```

#### Option C: Using the Test Script

1. Edit `test_metrics.sh` and update the URLs:
   ```bash
   DASHBOARD_URL="http://your-server.com"
   TARGET_URL="http://target-website.com"
   ```

2. Run the test script:
   ```bash
   ./test_metrics.sh
   ```

## Integration Examples

### Python Integration

```python
import requests
import time

def send_dos_metrics(dashboard_url, target_url, rps, connections, total_requests):
    metrics = {
        'requests_per_second': rps,
        'total_requests': total_requests,
        'active_connections': connections,
        'target_url': target_url,
        'timestamp': int(time.time()),
        'response_time_avg': 45.2,
        'success_rate': 95.5,
        'error_count': 45,
        'bytes_sent': 50000,
        'bytes_received': 250000
    }
    
    response = requests.post(f"{dashboard_url}/api/dos-metrics", json=metrics)
    return response.status_code == 200

# Usage in your DOS tool
while True:
    # Your DOS tool logic here
    rps = calculate_current_rps()
    connections = get_active_connections()
    total_requests = get_total_requests()
    
    send_dos_metrics(
        dashboard_url='http://your-server.com',
        target_url='http://target-website.com',
        rps=rps,
        connections=connections,
        total_requests=total_requests
    )
    
    time.sleep(1)  # Send metrics every second
```

### Node.js Integration

```javascript
const axios = require('axios');

async function sendDosMetrics(dashboardUrl, targetUrl, rps, connections, totalRequests) {
    const metrics = {
        requests_per_second: rps,
        total_requests: totalRequests,
        active_connections: connections,
        target_url: targetUrl,
        timestamp: Math.floor(Date.now() / 1000),
        response_time_avg: 45.2,
        success_rate: 95.5,
        error_count: 45,
        bytes_sent: 50000,
        bytes_received: 250000
    };
    
    try {
        const response = await axios.post(`${dashboardUrl}/api/dos-metrics`, metrics);
        return response.status === 200;
    } catch (error) {
        console.error('Error sending metrics:', error);
        return false;
    }
}

// Usage
setInterval(async () => {
    await sendDosMetrics(
        'http://your-server.com',
        'http://target-website.com',
        currentRps,
        activeConnections,
        totalRequests
    );
}, 1000);
```

## Dashboard Features

### Real-time Metrics Cards
- **Requests/sec**: Current requests per second with peak indicator
- **Total Requests**: Running total of all requests
- **Active Connections**: Current concurrent connections
- **Success Rate**: Percentage of successful requests with progress bar

### Target Information
- Target URL being tested
- Average response time
- Error count

### Data Transfer
- Bytes sent and received
- Total data transfer

### Interactive Charts
- **Requests/sec**: Area chart showing RPS trends
- **Connections**: Line chart of active connections
- **Response Time**: Line chart of average response times
- **Success Rate**: Bar chart of success rates

### Performance Statistics
- Peak RPS achieved
- Average RPS
- Maximum connections
- Average response time
- Average success rate
- Total requests

## Security Considerations

⚠️ **Important**: This dashboard is designed for testing purposes and does not block any requests. Do not expose this to the public internet without proper security measures.

### Recommended Security Measures

1. **Use HTTPS**: Always use HTTPS in production
2. **Firewall Rules**: Restrict access to your server's IP only
3. **Authentication**: Consider adding authentication if needed
4. **Rate Limiting**: Implement rate limiting on the API endpoints
5. **VPN Access**: Use VPN for secure access

## Troubleshooting

### Dashboard Not Loading
1. Check if Laravel is running properly
2. Verify the route exists: `php artisan route:list | grep dos-monitor`
3. Check browser console for JavaScript errors

### Metrics Not Updating
1. Verify the API endpoint is accessible
2. Check server logs: `tail -f storage/logs/laravel.log`
3. Ensure your DOS tool is sending the correct JSON format

### Charts Not Displaying
1. Check if recharts is installed: `npm list recharts`
2. Verify the data format in browser console
3. Check for JavaScript errors

## Support

For issues or questions:
1. Check the Laravel logs in `storage/logs/`
2. Verify your server configuration
3. Test the API endpoints with curl or Postman

## License

This project is for educational and testing purposes only. Use responsibly and in accordance with applicable laws and regulations.