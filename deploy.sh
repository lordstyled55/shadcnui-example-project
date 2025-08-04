#!/bin/bash

# DOS Monitor Deployment Script
# Run this script on your server to set up the application

set -e

echo "🚀 Starting DOS Monitor deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="dos-monitor"
APP_DIR="/var/www/$APP_NAME"
SERVICE_NAME="$APP_NAME"
NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"
NGINX_ENABLED="/etc/nginx/sites-enabled/$APP_NAME"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y nginx php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip php8.2-gd php8.2-bcmath php8.2-soap php8.2-intl php8.2-ldap php8.2-imap php8.2-pspell php8.2-snmp php8.2-tidy php8.2-xmlrpc php8.2-xsl php8.2-opcache composer mysql-server certbot python3-certbot-nginx

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Copy application files (assuming they're in current directory)
print_status "Copying application files..."
cp -r . $APP_DIR/
cd $APP_DIR

# Set proper permissions
print_status "Setting permissions..."
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR
sudo chmod -R 777 $APP_DIR/storage
sudo chmod -R 777 $APP_DIR/bootstrap/cache

# Install PHP dependencies
print_status "Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

# Install Node.js dependencies and build assets
print_status "Installing Node.js dependencies..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm ci
npm run build

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file..."
    cp .env.example .env
    php artisan key:generate
fi

# Configure database
print_status "Configuring database..."
read -p "Enter database name [dos_monitor]: " DB_NAME
DB_NAME=${DB_NAME:-dos_monitor}

read -p "Enter database username [dos_monitor_user]: " DB_USER
DB_USER=${DB_USER:-dos_monitor_user}

read -s -p "Enter database password: " DB_PASS
echo

# Create database and user
sudo mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
sudo mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
sudo mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Update .env file with database credentials
sed -i "s/DB_DATABASE=.*/DB_DATABASE=$DB_NAME/" .env
sed -i "s/DB_USERNAME=.*/DB_USERNAME=$DB_USER/" .env
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env
sed -i "s/APP_ENV=.*/APP_ENV=production/" .env
sed -i "s/APP_DEBUG=.*/APP_DEBUG=false/" .env

# Run database migrations
print_status "Running database migrations..."
php artisan migrate --force

# Clear caches
print_status "Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Install systemd service
print_status "Installing systemd service..."
sudo cp dos-monitor.service /etc/systemd/system/
sudo sed -i "s|your-domain.com|$(hostname -f)|g" /etc/systemd/system/dos-monitor.service
sudo sed -i "s|your_secure_password|$DB_PASS|g" /etc/systemd/system/dos-monitor.service
sudo systemctl daemon-reload
sudo systemctl enable dos-monitor

# Configure Nginx
print_status "Configuring Nginx..."
sudo cp nginx-dos-monitor.conf $NGINX_CONF
sudo sed -i "s|your-domain.com|$(hostname -f)|g" $NGINX_CONF

# Enable site
sudo ln -sf $NGINX_CONF $NGINX_ENABLED
sudo nginx -t
sudo systemctl restart nginx

# Start the application
print_status "Starting the application..."
sudo systemctl start dos-monitor

# Check if services are running
print_status "Checking service status..."
if sudo systemctl is-active --quiet dos-monitor; then
    print_status "DOS Monitor service is running"
else
    print_error "DOS Monitor service failed to start"
    sudo systemctl status dos-monitor
fi

if sudo systemctl is-active --quiet nginx; then
    print_status "Nginx is running"
else
    print_error "Nginx failed to start"
    sudo systemctl status nginx
fi

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)

print_status "Deployment completed successfully!"
echo
echo "🎉 Your DOS Monitor is now running!"
echo "📊 Dashboard: http://$SERVER_IP/dos-monitor"
echo "🔌 API Endpoint: http://$SERVER_IP/api/dos/metrics"
echo
echo "📋 Next steps:"
echo "1. Configure your domain name in Nginx config"
echo "2. Set up SSL certificate with Let's Encrypt:"
echo "   sudo certbot --nginx -d your-domain.com"
echo "3. Send the dos_metrics_sender.py to your friend's server"
echo "4. Test the API: curl http://$SERVER_IP/api/dos/health"
echo
echo "🔧 Useful commands:"
echo "   sudo systemctl status dos-monitor"
echo "   sudo systemctl restart dos-monitor"
echo "   sudo journalctl -u dos-monitor -f"
echo "   sudo nginx -t && sudo systemctl reload nginx"