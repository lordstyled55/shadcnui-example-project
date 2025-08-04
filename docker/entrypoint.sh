#!/bin/bash

# Exit on any error
set -e

# Create necessary directories
mkdir -p /var/log/supervisor
mkdir -p /var/www/storage/logs
mkdir -p /var/www/storage/framework/cache
mkdir -p /var/www/storage/framework/sessions
mkdir -p /var/www/storage/framework/views

# Set proper permissions
chown -R www-data:www-data /var/www/storage
chown -R www-data:www-data /var/www/bootstrap/cache

# Generate application key if not exists
if [ ! -f /var/www/.env ]; then
    cp /var/www/.env.example /var/www/.env
    php /var/www/artisan key:generate
fi

# Run database migrations
php /var/www/artisan migrate --force

# Clear caches
php /var/www/artisan config:clear
php /var/www/artisan route:clear
php /var/www/artisan view:clear
php /var/www/artisan cache:clear

# Start supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf