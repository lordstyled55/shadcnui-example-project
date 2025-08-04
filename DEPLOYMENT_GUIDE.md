# DOS Monitor Dashboard - Deployment Guide

This guide covers all the different ways to deploy your DOS monitoring dashboard using the GitHub Actions workflow.

## 🚀 Quick Start

### 1. GitHub Repository Setup

1. **Fork or clone this repository**
2. **Set up GitHub Secrets** (see section below)
3. **Push to main/master branch** - Automatic production deployment
4. **Use manual deployment** for staging/development

### 2. GitHub Secrets Configuration

Go to your repository → Settings → Secrets and variables → Actions, and add these secrets:

#### For VPS/Server Deployment:
```
HOST=your-server-ip
USERNAME=your-username
SSH_KEY=your-private-ssh-key
PORT=22
```

#### For Staging Environment:
```
STAGING_HOST=your-staging-server-ip
STAGING_USERNAME=your-staging-username
STAGING_SSH_KEY=your-staging-private-ssh-key
STAGING_PORT=22
```

#### For Docker Hub:
```
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-password
```

#### For Railway:
```
RAILWAY_TOKEN=your-railway-token
```

#### For Vercel:
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
```

#### For Notifications (Optional):
```
SLACK_WEBHOOK=your-slack-webhook-url
DISCORD_WEBHOOK=your-discord-webhook-url
```

## 📋 Deployment Options

### 1. Automatic Production Deployment

**Trigger:** Push to `main` or `master` branch

**What happens:**
- Runs tests
- Deploys to your VPS via SSH
- Restarts services (nginx, php-fpm)
- Sends notifications

**Requirements:**
- VPS with SSH access
- PHP 8.4, Node.js 18, Composer, NPM
- Nginx configured
- Git repository on server

### 2. Manual Deployment

**Trigger:** GitHub Actions → Run workflow → Manual deployment

**Options:**
- **Production**: Deploy to production server
- **Staging**: Deploy to staging server
- **Development**: Deploy to various platforms

### 3. Docker Deployment

**Trigger:** Manual deployment → Development

**What happens:**
- Builds Docker image
- Pushes to Docker Hub
- Tags with latest and commit SHA

**Usage:**
```bash
# Pull and run the image
docker pull your-username/dos-monitor:latest
docker run -p 8000:80 your-username/dos-monitor:latest
```

### 4. Platform Deployments

#### Railway
- **Trigger:** Manual deployment → Development
- **Requirements:** Railway account and token
- **Result:** Automatic deployment to Railway

#### Vercel
- **Trigger:** Manual deployment → Development
- **Requirements:** Vercel account and project setup
- **Result:** Automatic deployment to Vercel

## 🐳 Local Docker Development

### Quick Start with Docker Compose

```bash
# Production build
docker-compose up -d

# Development with hot reload
docker-compose --profile dev up -d

# With MySQL
docker-compose --profile mysql up -d
```

### Manual Docker Build

```bash
# Build the image
docker build -t dos-monitor .

# Run the container
docker run -p 8000:80 dos-monitor

# Run with custom environment
docker run -p 8000:80 \
  -e APP_ENV=production \
  -e APP_DEBUG=false \
  dos-monitor
```

## 🖥️ VPS Server Setup

### 1. Server Requirements

- Ubuntu 20.04+ or CentOS 8+
- PHP 8.4 with extensions: mbstring, xml, ctype, iconv, intl, pdo_sqlite, curl, zip
- Node.js 18+
- Nginx
- Git
- Composer

### 2. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP 8.4
sudo apt install software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install php8.4-fpm php8.4-mysql php8.4-xml php8.4-curl php8.4-mbstring php8.4-zip php8.4-sqlite3

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Nginx
sudo apt install nginx

# Install Git
sudo apt install git
```

### 3. Project Setup

```bash
# Create project directory
sudo mkdir -p /var/www/dos-monitor
sudo chown $USER:$USER /var/www/dos-monitor

# Clone repository
cd /var/www/dos-monitor
git clone https://github.com/your-username/dos-monitor.git .

# Install dependencies
composer install --optimize-autoloader --no-dev
npm ci
npm run build

# Set permissions
sudo chown -R www-data:www-data /var/www/dos-monitor
sudo chmod -R 755 /var/www/dos-monitor
sudo chmod -R 775 /var/www/dos-monitor/storage
sudo chmod -R 775 /var/www/dos-monitor/bootstrap/cache

# Create database
touch database/database.sqlite
sudo chown www-data:www-data database/database.sqlite

# Run migrations
php artisan migrate --force

# Generate key
php artisan key:generate
```

### 4. Nginx Configuration

Create `/etc/nginx/sites-available/dos-monitor`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/dos-monitor/public;
    index index.php index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\. {
        deny all;
    }

    location ~ /\.env {
        deny all;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/dos-monitor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL Setup (Optional)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Environment Configuration

### Production Environment Variables

```env
APP_NAME="DOS Monitor"
APP_ENV=production
APP_KEY=base64:your-generated-key
APP_DEBUG=false
APP_URL=https://your-domain.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=sqlite
DB_DATABASE=/var/www/dos-monitor/database/database.sqlite

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
```

### Development Environment Variables

```env
APP_NAME="DOS Monitor"
APP_ENV=local
APP_KEY=base64:your-generated-key
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=sqlite
DB_DATABASE=/var/www/dos-monitor/database/database.sqlite

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
```

## 🔍 Monitoring and Maintenance

### Health Checks

The dashboard includes health checks:

```bash
# Check if the application is running
curl -f http://your-domain.com/dos-monitor

# Check API endpoints
curl -f http://your-domain.com/api/dos-metrics/current
```

### Log Monitoring

```bash
# Laravel logs
tail -f /var/www/dos-monitor/storage/logs/laravel.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PHP-FPM logs
sudo tail -f /var/log/php8.4-fpm.log
```

### Backup Strategy

```bash
# Create backup script
cat > /var/www/dos-monitor/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/dos-monitor"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/dos-monitor/database/database.sqlite $BACKUP_DIR/database_$DATE.sqlite

# Backup storage
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz -C /var/www/dos-monitor storage/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sqlite" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /var/www/dos-monitor/backup.sh

# Add to crontab for daily backups
echo "0 2 * * * /var/www/dos-monitor/backup.sh" | sudo crontab -
```

## 🚨 Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   sudo chown -R www-data:www-data /var/www/dos-monitor
   sudo chmod -R 755 /var/www/dos-monitor
   sudo chmod -R 775 /var/www/dos-monitor/storage
   ```

2. **Database Issues**
   ```bash
   php artisan migrate:fresh --force
   php artisan config:clear
   php artisan cache:clear
   ```

3. **Asset Build Issues**
   ```bash
   npm ci
   npm run build
   ```

4. **Service Restart Issues**
   ```bash
   sudo systemctl restart nginx
   sudo systemctl restart php8.4-fpm
   sudo systemctl status nginx
   sudo systemctl status php8.4-fpm
   ```

### Debug Mode

For troubleshooting, temporarily enable debug mode:

```env
APP_DEBUG=true
LOG_LEVEL=debug
```

## 📞 Support

If you encounter issues:

1. Check the logs: `/var/www/dos-monitor/storage/logs/laravel.log`
2. Verify GitHub Actions workflow status
3. Check server resources and permissions
4. Ensure all required services are running

## 🔄 Update Process

The GitHub Actions workflow automatically handles updates:

1. **Push changes** to main/master branch
2. **Tests run** automatically
3. **Deployment occurs** if tests pass
4. **Services restart** automatically
5. **Notifications sent** on completion

For manual updates:

```bash
cd /var/www/dos-monitor
git pull origin main
composer install --optimize-autoloader --no-dev
npm ci
npm run build
php artisan migrate --force
php artisan config:clear
php artisan cache:clear
sudo systemctl restart nginx
sudo systemctl restart php8.4-fpm
```