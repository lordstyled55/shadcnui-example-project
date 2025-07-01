# Deployment Guide

This Laravel application includes automated deployment workflows using GitHub Actions and Docker containerization. This guide explains how to set up and use the deployment system.

## GitHub Actions Workflows

### 1. Standard Deployment (`deploy.yml`)

This workflow automatically:
- Runs tests on every push and pull request
- Builds and deploys the application when code is pushed to `main` or `master`
- Installs PHP and Node.js dependencies
- Builds frontend assets with Vite
- Creates deployment artifacts

**Triggers:**
- Push to `main` or `master` branches
- Pull requests to `main` or `master` branches

**What it does:**
1. **Test Job**: Runs PHPUnit tests with MySQL database
2. **Deploy Job**: Creates production-ready build artifacts

### 2. Docker Deployment (`docker-deploy.yml`)

This workflow:
- Builds Docker images and pushes to GitHub Container Registry
- Supports staging and production deployments
- Uses semantic versioning for releases

**Triggers:**
- Push to `main` or `master` branches (staging)
- Tags matching `v*.*.*` pattern (production)

## Setup Instructions

### 1. Basic GitHub Actions Setup

1. **Push your code to GitHub** - The workflows will automatically trigger on push to main/master branches.

2. **Environment Variables** (if needed):
   - Go to your repository → Settings → Secrets and Variables → Actions
   - Add any necessary secrets like:
     - `HOST` - Your server hostname
     - `USERNAME` - SSH username
     - `KEY` - SSH private key
     - `PORT` - SSH port (default: 22)

### 2. Server Deployment Setup

To deploy to your own server, uncomment and configure the SSH deployment section in `.github/workflows/deploy.yml`:

```yaml
- name: Deploy to server
  uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${{ secrets.HOST }}
    username: ${{ secrets.USERNAME }}
    key: ${{ secrets.KEY }}
    port: ${{ secrets.PORT }}
    script: |
      cd /path/to/your/app
      wget https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}/artifacts/app-build
      tar -xzf app-build.tar.gz
      php artisan migrate --force
      php artisan config:cache
      php artisan route:cache
      php artisan view:cache
      sudo systemctl restart php8.2-fpm
      sudo systemctl restart nginx
```

### 3. Docker Deployment

#### Using Docker Compose (Local Development)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

Access your application:
- **Application**: http://localhost:8000
- **phpMyAdmin**: http://localhost:8080

#### Production Docker Deployment

The Docker workflow automatically builds and pushes images to GitHub Container Registry. You can pull and run these images:

```bash
# Pull the latest image
docker pull ghcr.io/your-username/your-repo:main

# Run the container
docker run -d -p 80:80 ghcr.io/your-username/your-repo:main
```

### 4. Environment Setup

Create appropriate `.env` files for different environments:

#### Production `.env` example:
```env
APP_NAME="Your App"
APP_ENV=production
APP_KEY=your-app-key
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=your-database
DB_USERNAME=your-username
DB_PASSWORD=your-password

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=your-redis-host
REDIS_PASSWORD=null
REDIS_PORT=6379
```

## Deployment Strategies

### 1. Automatic Deployment
- Every push to `main`/`master` automatically triggers deployment
- Tests run first; deployment only happens if tests pass
- Suitable for development and staging environments

### 2. Manual Deployment
- Use GitHub repository dispatch events
- Deploy specific commits or branches
- Better control over production deployments

### 3. Tag-based Releases
- Create tags following semantic versioning (`v1.0.0`, `v1.1.0`, etc.)
- Automatically triggers production deployment
- Recommended for production releases

## Customization

### Adding Custom Deployment Steps

Modify the workflow files to add custom deployment steps:

1. **Database migrations**: Already included with `php artisan migrate --force`
2. **Cache clearing**: Included with config, route, and view caching
3. **Queue workers**: Add restart commands for your queue system
4. **Custom scripts**: Add any post-deployment scripts

### Environment-Specific Configurations

Create different workflow files for different environments:
- `.github/workflows/staging.yml`
- `.github/workflows/production.yml`

### Notifications

Add Slack or email notifications:

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    channel: '#deployments'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## Troubleshooting

### Common Issues

1. **Build fails**: Check PHP/Node.js versions in workflow
2. **Permission errors**: Ensure proper file permissions in deployment script
3. **Database issues**: Verify database credentials and connectivity
4. **Asset build errors**: Check for missing Node.js dependencies

### Monitoring

- Check GitHub Actions tab for workflow execution logs
- Monitor server logs for application errors
- Use application monitoring tools (Laravel Telescope, etc.)

## Security Considerations

1. **Secrets Management**: Store sensitive data in GitHub Secrets
2. **Environment Variables**: Never commit `.env` files
3. **SSH Keys**: Use dedicated deployment keys with limited permissions
4. **Docker Images**: Regularly update base images for security patches

## Support

For issues with the deployment setup:
1. Check GitHub Actions logs
2. Verify server configuration
3. Ensure all required secrets are set
4. Test Docker builds locally first