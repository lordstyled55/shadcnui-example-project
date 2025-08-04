# DOS Attack Monitoring Dashboard

A real-time monitoring dashboard built with Laravel, React, and shadcn/ui to track and visualize DOS attack metrics from a remote server.

## Features

- 🎯 **Real-time Metrics**: Live updates of requests per second, total requests, response times
- 📊 **Interactive Charts**: Beautiful visualizations using Recharts
- 🔄 **Status Monitoring**: Track attack status (running/stopped/paused)
- 📈 **Performance Analytics**: Detailed performance metrics and error analysis
- 🌐 **Remote Integration**: API endpoints for external DOS tools to send metrics
- 🎨 **Modern UI**: Clean, responsive interface built with shadcn/ui components

## Architecture

```
┌─────────────────┐    HTTP API    ┌─────────────────┐
│   DOS Tool      │ ──────────────► │   Dashboard     │
│ (Friend's House)│                │  (Your House)   │
└─────────────────┘                └─────────────────┘
```

## Setup Instructions

### 1. Dashboard Server (Your House)

#### Prerequisites
- PHP 8.1+
- Composer
- Node.js 18+
- Laravel project (already set up)

#### Installation

1. **Install Dependencies**
   ```bash
   composer install
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Database Setup**
   ```bash
   php artisan migrate
   ```

4. **Build Assets**
   ```bash
   npm run build
   ```

5. **Start the Server**
   ```bash
   php artisan serve --host=0.0.0.0 --port=8000
   ```

#### Access the Dashboard
- **URL**: `http://your-server-ip:8000/dos-monitor`
- **API Endpoint**: `http://your-server-ip:8000/api/dos/metrics`

### 2. DOS Tool Server (Friend's House)

#### Prerequisites
- Python 3.7+
- `requests` library

#### Installation

1. **Install Python Dependencies**
   ```bash
   pip install requests
   ```

2. **Download the Metrics Sender**
   ```bash
   # Copy the dos_metrics_sender.py file to the friend's server
   ```

3. **Make it Executable**
   ```bash
   chmod +x dos_metrics_sender.py
   ```

## Usage

### Starting the Metrics Sender

On your friend's server, run:

```bash
# Basic usage
python3 dos_metrics_sender.py --dashboard http://your-server-ip:8000 --target http://target-server.com

# Start attack immediately
python3 dos_metrics_sender.py --dashboard http://your-server-ip:8000 --target http://target-server.com --start

# Custom update interval (default: 2 seconds)
python3 dos_metrics_sender.py --dashboard http://your-server-ip:8000 --target http://target-server.com --interval 1.0
```

### Dashboard Features

#### Control Panel
- **Start Attack**: Begin sending metrics
- **Pause**: Temporarily stop metrics
- **Stop**: End the attack
- **Reset**: Clear all metrics

#### Real-time Metrics
- **Requests/sec**: Current request rate
- **Total Requests**: Cumulative request count
- **Active Connections**: Number of concurrent connections
- **Avg Response Time**: Average server response time

#### Charts & Analytics
- **Overview Tab**: Requests per second chart and success rate
- **Performance Tab**: Response time trends and performance metrics
- **Error Analysis Tab**: Error rate charts and error type breakdown

## API Endpoints

### POST `/api/dos/metrics`
Send metrics from the DOS tool.

**Request Body:**
```json
{
  "requests_per_second": 1500,
  "total_requests": 45000,
  "active_connections": 750,
  "average_response_time": 125.5,
  "success_rate": 85.2,
  "error_rate": 14.8,
  "target_url": "http://target-server.com",
  "status": "running",
  "start_time": "2024-01-15T10:30:00Z",
  "errors": [
    {"type": "connection_timeout", "count": 45}
  ],
  "response_codes": [
    {"code": "200", "count": 1275, "percentage": 85.0}
  ]
}
```

### GET `/api/dos/metrics`
Retrieve current metrics and history.

### GET `/api/dos/status`
Get current attack status.

### DELETE `/api/dos/metrics`
Clear all stored metrics.

## Security Considerations

⚠️ **Important Security Notes:**

1. **No Authentication**: The API endpoints are intentionally open for external access. In production, consider adding API keys or authentication.

2. **Firewall Configuration**: Ensure your server allows incoming connections on port 8000.

3. **Rate Limiting**: Consider implementing rate limiting to prevent abuse.

4. **HTTPS**: For production use, enable HTTPS for secure communication.

## Customization

### Modifying the Dashboard

The dashboard is built with:
- **Frontend**: React + TypeScript + shadcn/ui
- **Backend**: Laravel + PHP
- **Charts**: Recharts library
- **Styling**: Tailwind CSS

### Adding New Metrics

1. **Backend**: Update `DosMonitorController.php` to handle new fields
2. **Frontend**: Modify `DosMonitor.tsx` to display new metrics
3. **API**: Update the metrics sender to include new data

### Styling Changes

The dashboard uses shadcn/ui components. To customize:
- Edit `tailwind.config.js` for theme changes
- Modify component styles in `resources/js/Components/ui/`
- Update the main dashboard layout in `DosMonitor.tsx`

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check if the dashboard server is running
   - Verify the dashboard URL is correct
   - Ensure port 8000 is open on the firewall

2. **No Data Displayed**
   - Check browser console for JavaScript errors
   - Verify the API endpoints are responding
   - Check Laravel logs for backend errors

3. **Charts Not Updating**
   - Ensure the metrics sender is running
   - Check the update interval setting
   - Verify network connectivity between servers

### Debug Commands

```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Test API endpoint
curl -X GET http://your-server-ip:8000/api/dos/health

# Check if metrics are being stored
curl -X GET http://your-server-ip:8000/api/dos/metrics
```

## Performance Optimization

- **Caching**: Metrics are cached in Laravel's cache system
- **Polling**: Frontend polls every 2 seconds for updates
- **History**: Limited to last 100 entries to prevent memory issues
- **Responsive**: Dashboard works on desktop and mobile devices

## License

This project is for educational and testing purposes only. Ensure you have permission to perform load testing on target servers.