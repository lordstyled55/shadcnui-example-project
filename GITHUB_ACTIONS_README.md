# GitHub Actions Setup for DOS Monitor

This repository includes comprehensive GitHub Actions workflows for automated testing, building, and deployment of the DOS Monitor application.

## 🚀 Available Workflows

### 1. **Test Workflow** (`.github/workflows/test.yml`)
- **Triggers**: Push to `main`, `master`, `develop` branches and Pull Requests
- **Purpose**: Run tests and validate code quality
- **Features**:
  - PHP 8.2 with all required extensions
  - Node.js 18 for frontend builds
  - MySQL 8.0 for database testing
  - Automated API endpoint testing
  - Asset building verification

### 2. **Deploy Workflow** (`.github/workflows/deploy.yml`)
- **Triggers**: Push to `main` or `master` branches only
- **Purpose**: Full deployment to production server
- **Features**:
  - Complete testing pipeline
  - Production asset building
  - SSH deployment to server
  - Automatic service restart
  - Slack notifications

### 3. **Docker Workflow** (`.github/workflows/docker.yml`)
- **Triggers**: Push to `main`, `master` branches and version tags
- **Purpose**: Build and deploy Docker containers
- **Features**:
  - Multi-platform Docker builds (AMD64, ARM64)
  - Docker Hub integration
  - Automated container deployment
  - Version tagging support

## 🔧 Setup Instructions

### 1. Repository Secrets

Add these secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

#### Required Secrets for All Workflows:
```bash
# Server SSH Access
HOST=your-server-ip
USERNAME=your-ssh-username
SSH_KEY=your-private-ssh-key
PORT=22

# Database Configuration
DB_HOST=your-database-host
DB_DATABASE=dos_monitor
DB_USERNAME=dos_monitor_user
DB_PASSWORD=your-secure-db-password
```

#### Additional Secrets for Docker Workflow:
```bash
# Docker Hub Access
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-password
```

#### Optional Secrets for Notifications:
```bash
# Slack Notifications
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### 2. Server Preparation

#### For Traditional Deployment:
1. **Install required software**:
   ```bash
   sudo apt update
   sudo apt install -y nginx php8.2-fpm php8.2-mysql composer mysql-server
   ```

2. **Create application directory**:
   ```bash
   sudo mkdir -p /var/www/dos-monitor
   sudo chown $USER:$USER /var/www/dos-monitor
   ```

3. **Set up systemd service**:
   ```bash
   sudo cp dos-monitor.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable dos-monitor
   ```

#### For Docker Deployment:
1. **Install Docker**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

2. **Create deployment script**:
   ```bash
   # Create /opt/dos-monitor/deploy.sh
   #!/bin/bash
   docker pull $DOCKER_USERNAME/dos-monitor:latest
   docker stop dos-monitor || true
   docker rm dos-monitor || true
   docker run -d --name dos-monitor --restart unless-stopped -p 8000:8000 $DOCKER_USERNAME/dos-monitor:latest
   ```

## 📋 Workflow Usage

### Manual Trigger
You can manually trigger workflows from the GitHub Actions tab:
1. Go to `Actions` tab in your repository
2. Select the workflow you want to run
3. Click `Run workflow`
4. Choose branch and click `Run workflow`

### Branch Protection
Set up branch protection rules for `main` and `master`:
1. Go to `Settings > Branches`
2. Add rule for `main` and `master`
3. Enable:
   - Require status checks to pass
   - Require branches to be up to date
   - Include administrators

### Environment Variables
For different environments, you can set up environment-specific secrets:
1. Go to `Settings > Environments`
2. Create environments: `staging`, `production`
3. Add environment-specific secrets

## 🔍 Monitoring and Debugging

### Workflow Logs
- View logs in the `Actions` tab
- Download artifacts for debugging
- Check specific job outputs

### Common Issues

#### SSH Connection Failed
```bash
# Test SSH connection manually
ssh -i ~/.ssh/your-key your-username@your-server-ip
```

#### Database Connection Issues
```bash
# Check database connectivity
mysql -h your-db-host -u your-user -p your-database
```

#### Permission Issues
```bash
# Fix file permissions on server
sudo chown -R www-data:www-data /var/www/dos-monitor
sudo chmod -R 755 /var/www/dos-monitor
```

### Debug Commands
```bash
# Check service status
sudo systemctl status dos-monitor
sudo systemctl status nginx

# View logs
sudo journalctl -u dos-monitor -f
sudo tail -f /var/log/nginx/error.log

# Test API endpoints
curl http://your-server/api/dos/health
curl http://your-server/api/dos/status
```

## 🚀 Deployment Strategies

### 1. Blue-Green Deployment
For zero-downtime deployments:
```bash
# Create blue and green environments
# Deploy to inactive environment
# Switch traffic when ready
```

### 2. Rolling Deployment
Update containers one by one:
```bash
# Update containers gradually
# Health checks between updates
# Rollback on failure
```

### 3. Canary Deployment
Deploy to subset of users first:
```bash
# Deploy to small percentage
# Monitor metrics
# Gradually increase traffic
```

## 📊 Performance Optimization

### Workflow Optimization
- Use caching for dependencies
- Parallel job execution
- Optimize Docker layers
- Use matrix builds for testing

### Application Optimization
- Enable OPcache
- Use Redis for caching
- Optimize database queries
- Enable gzip compression

## 🔒 Security Considerations

### Secrets Management
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly
- Use least privilege principle
- Monitor secret usage

### Server Security
- Use SSH keys instead of passwords
- Enable firewall rules
- Regular security updates
- Monitor access logs

## 📈 Monitoring and Alerts

### GitHub Actions Monitoring
- Set up repository notifications
- Monitor workflow success rates
- Track deployment frequency
- Alert on failures

### Application Monitoring
- Set up health checks
- Monitor API response times
- Track error rates
- Set up uptime monitoring

## 🛠️ Customization

### Adding New Workflows
1. Create new `.yml` file in `.github/workflows/`
2. Define triggers and jobs
3. Add to repository secrets if needed
4. Test in development branch

### Modifying Existing Workflows
1. Update workflow files
2. Test changes in feature branch
3. Create pull request
4. Review and merge

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Laravel Deployment Guide](https://laravel.com/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx Configuration](https://nginx.org/en/docs/)

## 🆘 Troubleshooting

### Workflow Fails
1. Check workflow logs
2. Verify secrets are set correctly
3. Test server connectivity
4. Check application logs

### Deployment Issues
1. Verify server requirements
2. Check file permissions
3. Test database connection
4. Review service configuration

### Performance Issues
1. Monitor resource usage
2. Check application logs
3. Optimize database queries
4. Review caching configuration

For additional help, create an issue in the repository or contact the development team.