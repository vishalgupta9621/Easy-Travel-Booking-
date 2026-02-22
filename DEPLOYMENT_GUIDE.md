# 🚀 Deployment Guide - Travel Booking System

## 📋 **Pre-Deployment Checklist**

### **System Requirements**
- [ ] Node.js 18.x or higher
- [ ] MongoDB 6.x or higher
- [ ] npm 8.x or higher
- [ ] Git version control
- [ ] SSL certificate (for production)
- [ ] Domain name (for production)

### **Environment Preparation**
- [ ] Production server setup
- [ ] Database server configuration
- [ ] Email service configuration
- [ ] CDN setup (optional)
- [ ] Monitoring tools installation
- [ ] Backup strategy implementation

## 🔧 **Local Development Setup**

### **1. Clone Repository**
```bash
git clone <repository-url>
cd cdac_final
```

### **2. Backend Setup**
```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
nano .env
```

**Environment Variables (.env):**
```env
# Database
MONGO=mongodb://localhost:27017/travel_booking
MONGODB_URI=mongodb://localhost:27017/travel_booking

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@travelbooking.com

# Server Configuration
PORT=8800
NODE_ENV=development

# API Keys (if needed)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### **3. Database Setup**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Seed sample data
npm run seed
npm run seed-contacts

# Start backend server
npm start
```

### **4. Frontend Setup**
```bash
# Open new terminal
cd ../PN_2_Travel_Frontend
npm install

# Start development server
npm start
```

### **5. Admin Panel Setup**
```bash
# Open new terminal
cd ../PN_2_Travel_Admin
npm install

# Start admin development server
npm start
```

### **6. Verify Installation**
- **Customer Portal**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001
- **API Server**: http://localhost:8800
- **Database**: mongodb://localhost:27017

## 🌐 **Production Deployment**

### **Option 1: Traditional Server Deployment**

#### **Server Setup (Ubuntu 20.04 LTS)**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Nginx
sudo apt install nginx -y

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

#### **Application Deployment**
```bash
# Clone repository
git clone <repository-url> /var/www/travel-booking
cd /var/www/travel-booking

# Backend deployment
cd backend
npm install --production
cp .env.example .env
# Configure production environment variables
nano .env

# Frontend build
cd ../PN_2_Travel_Frontend
npm install
npm run build

# Admin build
cd ../PN_2_Travel_Admin
npm install
npm run build
```

#### **PM2 Configuration**
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'travel-booking-api',
    script: './backend/src/index.js',
    cwd: '/var/www/travel-booking',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 8800
    },
    error_file: './logs/api-error.log',
    out_file: './logs/api-out.log',
    log_file: './logs/api-combined.log',
    time: true
  }]
};
```

```bash
# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### **Nginx Configuration**
```bash
sudo nano /etc/nginx/sites-available/travel-booking
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Customer Portal
    location / {
        root /var/www/travel-booking/PN_2_Travel_Frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    # Admin Panel
    location /admin {
        alias /var/www/travel-booking/PN_2_Travel_Admin/build;
        try_files $uri $uri/ /admin/index.html;
    }
    
    # API Proxy
    location /api/ {
        proxy_pass http://localhost:8800;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/travel-booking /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### **SSL Certificate (Let's Encrypt)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Option 2: Cloud Deployment (Heroku)**

#### **Backend Deployment**
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create travel-booking-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGO=mongodb+srv://username:password@cluster.mongodb.net/travel_booking
heroku config:set JWT_SECRET=your_production_jwt_secret

# Deploy
git subtree push --prefix backend heroku main
```

#### **Frontend Deployment (Netlify)**
```bash
# Build frontend
cd PN_2_Travel_Frontend
npm run build

# Deploy to Netlify (drag & drop build folder)
# Or use Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

### **Option 3: Docker Deployment**

#### **Docker Compose Setup**
```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: travel-booking-db
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    container_name: travel-booking-api
    restart: always
    environment:
      NODE_ENV: production
      MONGO: mongodb://admin:password@mongodb:27017/travel_booking?authSource=admin
      JWT_SECRET: your_jwt_secret
    ports:
      - "8800:8800"
    depends_on:
      - mongodb

  frontend:
    build: ./PN_2_Travel_Frontend
    container_name: travel-booking-frontend
    restart: always
    ports:
      - "3000:80"

  nginx:
    image: nginx:alpine
    container_name: travel-booking-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend

volumes:
  mongodb_data:
```

```bash
# Deploy with Docker Compose
docker-compose up -d
```

## 📊 **Database Configuration**

### **MongoDB Production Setup**
```bash
# Create database user
mongo
use travel_booking
db.createUser({
  user: "travel_user",
  pwd: "secure_password",
  roles: [
    { role: "readWrite", db: "travel_booking" }
  ]
})
```

### **Database Optimization**
```javascript
// Create indexes for performance
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "username": 1 }, { unique: true })
db.bookings.createIndex({ "bookingNumber": 1 }, { unique: true })
db.bookings.createIndex({ "userId": 1 })
db.bookings.createIndex({ "travelDate": 1 })
db.hotels.createIndex({ "city": 1 })
db.flights.createIndex({ "route.origin": 1, "route.destination": 1 })
```

### **Backup Strategy**
```bash
# Create backup script
nano /opt/backup-mongodb.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/mongodb"
mkdir -p $BACKUP_DIR

mongodump --host localhost:27017 --db travel_booking --out $BACKUP_DIR/backup_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

```bash
# Make executable and schedule
chmod +x /opt/backup-mongodb.sh
crontab -e
# Add: 0 2 * * * /opt/backup-mongodb.sh
```

## 🔍 **Monitoring & Logging**

### **Application Monitoring**
```bash
# Install monitoring tools
npm install -g pm2-logrotate
pm2 install pm2-server-monit
```

### **Log Management**
```javascript
// Add to backend/src/index.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### **Health Check Endpoint**
```javascript
// Add to backend routes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

## 🔒 **Security Configuration**

### **Production Security Checklist**
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] API rate limiting implemented
- [ ] CORS properly configured
- [ ] Security headers added
- [ ] Input validation enabled
- [ ] Error messages sanitized

### **Security Headers (Nginx)**
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## 📈 **Performance Optimization**

### **Frontend Optimization**
```bash
# Build optimization
npm run build -- --analyze

# Enable gzip compression in Nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### **Backend Optimization**
```javascript
// Add compression middleware
import compression from 'compression';
app.use(compression());

// Connection pooling
mongoose.connect(process.env.MONGO, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

## 🚨 **Troubleshooting**

### **Common Deployment Issues**

#### **Port Already in Use**
```bash
# Find process using port
sudo lsof -i :8800
# Kill process
sudo kill -9 <PID>
```

#### **Permission Issues**
```bash
# Fix file permissions
sudo chown -R www-data:www-data /var/www/travel-booking
sudo chmod -R 755 /var/www/travel-booking
```

#### **MongoDB Connection Issues**
```bash
# Check MongoDB status
sudo systemctl status mongod
# Restart MongoDB
sudo systemctl restart mongod
```

#### **Nginx Configuration Issues**
```bash
# Test Nginx configuration
sudo nginx -t
# Reload Nginx
sudo systemctl reload nginx
```

### **Rollback Strategy**
```bash
# PM2 rollback
pm2 stop all
git checkout previous-stable-commit
npm install
pm2 restart all

# Database rollback
mongorestore --drop /opt/backups/mongodb/backup_YYYYMMDD_HHMMSS/travel_booking
```

---

**This deployment guide provides comprehensive instructions for deploying the Travel Booking System in various environments. Follow the appropriate section based on your deployment strategy.** 🚀✨
