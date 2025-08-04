#!/bin/bash

# DOS Monitor Dashboard - Quick Deploy Script
# This script sets up the DOS monitor dashboard on a fresh Ubuntu server

set -e

echo "🚀 DOS Monitor Dashboard - Quick Deploy Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Get project directory
PROJECT_DIR="/var/www/dos-monitor"
DOMAIN=${1:-"localhost"}

print_status "Setting up DOS Monitor Dashboard on domain: $DOMAIN"

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y software-properties-common curl git unzip

# Install PHP 8.4
print_status "Installing PHP 8.4..."
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.4-fpm php8.4-mysql php8.4-xml php8.4-curl php8.4-mbstring php8.4-zip php8.4-sqlite3 php8.4-intl

# Install Node.js 18
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Composer
print_status "Installing Composer..."
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Nginx
print_status "Installing Nginx..."
sudo apt install -y nginx

# Create project directory
print_status "Creating project directory..."
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

# Clone repository (if not already present)
if [ ! -d "$PROJECT_DIR/.git" ]; then
    print_status "Cloning repository..."
    git clone https://github.com/your-username/dos-monitor.git $PROJECT_DIR
else
    print_status "Repository already exists, pulling latest changes..."
    cd $PROJECT_DIR
    git pull origin main
fi

# Navigate to project directory
cd $PROJECT_DIR

# Install PHP dependencies
print_status "Installing PHP dependencies..."
composer install --optimize-autoloader --no-dev

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm ci

# Build assets
print_status "Building assets..."
npm run build

# Set proper permissions
print_status "Setting permissions..."
sudo chown -R www-data:www-data $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR
sudo chmod -R 775 $PROJECT_DIR/storage
sudo chmod -R 775 $PROJECT_DIR/bootstrap/cache

# Create database
print_status "Setting up database..."
touch database/database.sqlite
sudo chown www-data:www-data database/database.sqlite

# Copy environment file
if [ ! -f .env ]; then
    print_status "Setting up environment file..."
    cp .env.example .env
    php artisan key:generate
fi

# Run migrations
print_status "Running database migrations..."
php artisan migrate --force

# Clear caches
print_status "Clearing caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Create Nginx configuration
print_status "Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/dos-monitor > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    root $PROJECT_DIR/public;
    index index.php index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Handle Laravel routes
    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    # Handle PHP files
    location ~ \.php\$ {
        fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ /\.env {
        deny all;
    }

    location ~ /\.git {
        deny all;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
EOF

# Enable the site
print_status "Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/dos-monitor /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

# Restart services
print_status "Restarting services..."
sudo systemctl restart nginx
sudo systemctl restart php8.4-fpm

# Enable services to start on boot
sudo systemctl enable nginx
sudo systemctl enable php8.4-fpm

# Create backup script
print_status "Creating backup script..."
sudo tee $PROJECT_DIR/backup.sh > /dev/null <<'EOF'
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

echo "Backup completed: $BACKUP_DIR"
EOF

sudo chmod +x $PROJECT_DIR/backup.sh

# Add backup to crontab
print_status "Setting up automatic backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * $PROJECT_DIR/backup.sh") | crontab -

# Final status
echo ""
echo "🎉 Deployment completed successfully!"
echo "====================================="
echo "Dashboard URL: http://$DOMAIN/dos-monitor"
echo "API Endpoint: http://$DOMAIN/api/dos-metrics"
echo ""
echo "📋 Next steps:"
echo "1. Test the dashboard: http://$DOMAIN/dos-monitor"
echo "2. Send test metrics using the provided scripts"
echo "3. Set up SSL certificate (recommended for production)"
echo "4. Configure GitHub Actions for automatic deployments"
echo ""
echo "🔧 Useful commands:"
echo "- View logs: sudo tail -f $PROJECT_DIR/storage/logs/laravel.log"
echo "- Restart services: sudo systemctl restart nginx php8.4-fpm"
echo "- Manual backup: $PROJECT_DIR/backup.sh"
echo "- Update application: cd $PROJECT_DIR && git pull && composer install && npm ci && npm run build"
echo ""
echo "📚 Documentation: See DEPLOYMENT_GUIDE.md for detailed instructions"