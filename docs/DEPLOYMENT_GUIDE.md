# Travel Booking System - Deployment Guide

## Overview
This guide covers deploying the Travel Booking System to production environments, including cloud platforms, containerization, and CI/CD setup.

## Prerequisites

### System Requirements
- Node.js 16+ 
- MongoDB 5+
- Redis (for session management and caching)
- SSL Certificate (for HTTPS)
- Domain name
- Cloud storage (for file uploads)

### Development Tools
- Git
- Docker & Docker Compose
- PM2 (for process management)
- Nginx (reverse proxy)

## Environment Setup

### Production Environment Variables

Create `.env` files for each component:

**Backend (.env)**
```env
# Database
MONGO=mongodb://username:password@host:port/travel_booking_prod
MONGO_TEST=mongodb://username:password@host:port/travel_booking_test

# Authentication
JWT=your_super_secure_jwt_secret_key_minimum_32_characters
JWT_EXPIRE=7d

# Server
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com

# Redis (for caching and sessions)
REDIS_URL=redis://username:password@host:port

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Travel Booking <noreply@yourdomain.com>

# Payment Gateway (Example: Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

**Frontend (.env)**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=Travel Booking System
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_ANALYTICS_ID=your_google_analytics_id
```

## Docker Deployment

### Dockerfile - Backend
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000

CMD ["npm", "start"]
```

### Dockerfile - Frontend
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  backend:
    build: ./Final_Backend
    restart: always
    environment:
      - NODE_ENV=production
      - MONGO=${MONGO_URI}
      - JWT=${JWT_SECRET}
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
    depends_on:
      - mongodb
      - redis
    ports:
      - "5000:5000"
    volumes:
      - ./logs:/app/logs

  frontend:
    build: ./Final_Frontend
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend

  admin:
    build: ./Final_Admin
    restart: always
    ports:
      - "3001:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
  redis_data:
```

## Cloud Platform Deployment

### AWS Deployment

#### Using AWS ECS (Elastic Container Service)
1. **Create ECR repositories**
```bash
aws ecr create-repository --repository-name travel-booking-backend
aws ecr create-repository --repository-name travel-booking-frontend
aws ecr create-repository --repository-name travel-booking-admin
```

2. **Build and push Docker images**
```bash
# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Build and tag images
docker build -t travel-booking-backend ./Final_Backend
docker tag travel-booking-backend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/travel-booking-backend:latest

# Push images
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/travel-booking-backend:latest
```

3. **Create ECS task definitions and services**
4. **Set up Application Load Balancer**
5. **Configure Auto Scaling**

#### Using AWS Elastic Beanstalk
1. **Install EB CLI**
```bash
pip install awsebcli
```

2. **Initialize and deploy**
```bash
cd Final_Backend
eb init
eb create production
eb deploy
```

### Google Cloud Platform

#### Using Google Cloud Run
```bash
# Build and deploy backend
gcloud builds submit --tag gcr.io/PROJECT_ID/travel-booking-backend ./Final_Backend
gcloud run deploy travel-booking-backend --image gcr.io/PROJECT_ID/travel-booking-backend --platform managed

# Build and deploy frontend
gcloud builds submit --tag gcr.io/PROJECT_ID/travel-booking-frontend ./Final_Frontend
gcloud run deploy travel-booking-frontend --image gcr.io/PROJECT_ID/travel-booking-frontend --platform managed
```

### Heroku Deployment

#### Backend Deployment
```bash
cd Final_Backend
heroku create travel-booking-api
heroku addons:create mongolab:sandbox
heroku addons:create heroku-redis:hobby-dev
heroku config:set NODE_ENV=production
heroku config:set JWT=your_jwt_secret
git push heroku main
```

#### Frontend Deployment
```bash
cd Final_Frontend
heroku create travel-booking-app
heroku buildpacks:set mars/create-react-app
heroku config:set VITE_API_URL=https://travel-booking-api.herokuapp.com
git push heroku main
```

## Database Setup

### MongoDB Atlas (Recommended)
1. Create MongoDB Atlas cluster
2. Configure network access
3. Create database user
4. Get connection string
5. Set up automated backups

### Self-hosted MongoDB
```bash
# Install MongoDB
sudo apt-get install mongodb

# Configure replica set for production
mongod --replSet rs0

# Initialize replica set
mongo --eval "rs.initiate()"

# Create admin user
mongo admin --eval 'db.createUser({user:"admin",pwd:"password",roles:["root"]})'
```

## Nginx Configuration

### Reverse Proxy Setup
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Frontend
    location / {
        root /var/www/travel-booking/frontend;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Admin Panel
    location /admin/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
}
```

## Process Management with PM2

### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'travel-booking-api',
      script: './index.js',
      cwd: './Final_Backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    },
    {
      name: 'travel-booking-admin',
      script: 'serve',
      args: '-s build -l 3001',
      cwd: './Final_Admin',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

### PM2 Commands
```bash
# Install PM2
npm install -g pm2

# Start applications
pm2 start ecosystem.config.js

# Monitor applications
pm2 monit

# View logs
pm2 logs

# Restart applications
pm2 restart all

# Save PM2 configuration
pm2 save
pm2 startup
```

## SSL Certificate Setup

### Using Let's Encrypt (Certbot)
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logging

### Application Monitoring
```javascript
// Add to backend index.js
import Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Error handling middleware
app.use(Sentry.Handlers.errorHandler());
```

### Log Management
```javascript
// Winston logger configuration
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

## CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd Final_Backend && npm ci
          cd ../Final_Frontend && npm ci
      
      - name: Run tests
        run: |
          cd Final_Backend && npm test
          cd ../Final_Frontend && npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/travel-booking
            git pull origin main
            docker-compose down
            docker-compose up -d --build
```

## Security Checklist

### Production Security
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Set secure environment variables
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Use strong database passwords
- [ ] Enable MongoDB authentication
- [ ] Set up regular backups
- [ ] Configure security headers
- [ ] Enable audit logging
- [ ] Set up intrusion detection
- [ ] Regular security updates

### Application Security
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Secure session management
- [ ] Password hashing (bcrypt)
- [ ] JWT token security
- [ ] File upload restrictions
- [ ] API rate limiting
- [ ] Error handling (no sensitive data exposure)

## Performance Optimization

### Backend Optimization
- Enable gzip compression
- Implement caching (Redis)
- Database indexing
- Connection pooling
- Load balancing
- CDN for static assets

### Frontend Optimization
- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization
- Service worker for caching
- Performance monitoring

## Backup Strategy

### Database Backup
```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="mongodb://user:pass@host:port/travel_booking" --out="/backups/mongo_$DATE"
tar -czf "/backups/mongo_$DATE.tar.gz" "/backups/mongo_$DATE"
rm -rf "/backups/mongo_$DATE"

# Keep only last 7 days of backups
find /backups -name "mongo_*.tar.gz" -mtime +7 -delete
```

### Automated Backup
```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

## Troubleshooting

### Common Issues
1. **Database connection errors**: Check MongoDB URI and network access
2. **CORS errors**: Verify CORS_ORIGIN environment variable
3. **JWT errors**: Ensure JWT secret is set and consistent
4. **File upload issues**: Check file permissions and storage configuration
5. **Performance issues**: Monitor database queries and enable caching

### Health Check Endpoints
```javascript
// Add to backend
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

## Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Database sharding
- Microservices architecture
- Container orchestration (Kubernetes)
- Auto-scaling policies

### Vertical Scaling
- Server resource monitoring
- Database optimization
- Caching strategies
- CDN implementation

This deployment guide provides a comprehensive approach to deploying the Travel Booking System in production environments with security, performance, and scalability considerations.
