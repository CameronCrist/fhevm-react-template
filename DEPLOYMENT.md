# 🚀 Deployment Guide - Universal FHEVM SDK

Complete guide for deploying FHEVM SDK applications to production.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Environment Setup](#environment-setup)
- [Vercel Deployment](#vercel-deployment)
- [Docker Deployment](#docker-deployment)
- [Node.js Server Deployment](#nodejs-server-deployment)
- [Environment Variables](#environment-variables)
- [Production Checklist](#production-checklist)
- [Monitoring & Debugging](#monitoring--debugging)

---

## 🌐 Overview

The Universal FHEVM SDK supports multiple deployment strategies:

| Platform | Best For | Complexity | Example |
|----------|----------|------------|---------|
| **Vercel** | Next.js/React apps | ⭐ Easy | [Parking Reservation](https://arking-reservation.vercel.app/) |
| **Docker** | Any framework | ⭐⭐ Medium | Node.js API Server |
| **VPS/Cloud** | Node.js services | ⭐⭐⭐ Advanced | Custom deployment |
| **Serverless** | Edge functions | ⭐⭐ Medium | API routes |

---

## 🔧 Environment Setup

### Development Environment

```bash
# Clone repository
git clone https://github.com/CameronCrist/fhevm-react-template.git
cd fhevm-react-template

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables Template

Create `.env.local` (or `.env` for Node.js):

```env
# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY

# FHEVM Configuration
NEXT_PUBLIC_GATEWAY_URL=https://gateway.sepolia.zama.ai
NEXT_PUBLIC_CONTRACT_ADDRESS=0x78257622318fC85f2a9c909DD7aF9d0142cd90ce

# WalletConnect (Optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Server-Side Only (NEVER expose to client)
PRIVATE_KEY=your_private_key_here
RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
```

---

## ☁️ Vercel Deployment

### Quick Deploy (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CameronCrist/fhevm-react-template)

### Manual Deployment

#### 1. Install Vercel CLI

```bash
npm i -g vercel
```

#### 2. Configure Project

```bash
cd examples/parking-reservation

# Login to Vercel
vercel login

# Initialize project
vercel
```

#### 3. Set Environment Variables

**Via Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`

**Via CLI:**

```bash
# Add environment variables
vercel env add NEXT_PUBLIC_CHAIN_ID
vercel env add NEXT_PUBLIC_GATEWAY_URL
vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

# Add server-side secrets
vercel env add PRIVATE_KEY
vercel env add RPC_URL
```

#### 4. Deploy to Production

```bash
# Deploy to production
vercel --prod
```

### Vercel Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_CHAIN_ID": "11155111",
    "NEXT_PUBLIC_GATEWAY_URL": "https://gateway.sepolia.zama.ai"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_CHAIN_ID": "11155111"
    }
  }
}
```

### Post-Deployment

✅ Verify environment variables are set
✅ Test wallet connection
✅ Test encryption/decryption flows
✅ Check browser console for errors
✅ Verify contract interactions

---

## 🐳 Docker Deployment

### Node.js API Server

#### Dockerfile

Create `Dockerfile` in `examples/nodejs-api-server/`:

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["npm", "start"]
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  fhevm-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
      - CHAIN_ID=${CHAIN_ID}
      - RPC_URL=${RPC_URL}
      - GATEWAY_URL=${GATEWAY_URL}
      - CONTRACT_ADDRESS=${CONTRACT_ADDRESS}
      - PRIVATE_KEY=${PRIVATE_KEY}
    env_file:
      - .env
    restart: unless-stopped
    networks:
      - fhevm-network

networks:
  fhevm-network:
    driver: bridge
```

#### Build and Run

```bash
# Build image
docker build -t fhevm-api-server .

# Run container
docker run -p 3000:3000 --env-file .env fhevm-api-server

# Or use docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop container
docker-compose down
```

### Vue Application Docker

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (if needed)
    location /api {
        proxy_pass http://fhevm-api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🖥️ Node.js Server Deployment

### VPS/Cloud Deployment (Ubuntu)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx (optional)
sudo apt install -y nginx
```

#### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/CameronCrist/fhevm-react-template.git
cd fhevm-react-template/examples/nodejs-api-server

# Install dependencies
npm ci --production

# Build application
npm run build

# Set up environment
cp .env.example .env
nano .env  # Edit with your configuration
```

#### 3. PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'fhevm-api',
    script: './dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

#### 4. Start with PM2

```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup

# Monitor application
pm2 monit

# View logs
pm2 logs fhevm-api

# Restart application
pm2 restart fhevm-api
```

#### 5. Nginx Reverse Proxy

Edit `/etc/nginx/sites-available/fhevm-api`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/fhevm-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

---

## 🔐 Environment Variables

### Client-Side Variables (Public)

These can be exposed to the browser:

```env
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_GATEWAY_URL=https://gateway.sepolia.zama.ai
NEXT_PUBLIC_CONTRACT_ADDRESS=0x78257622318fC85f2a9c909DD7aF9d0142cd90ce
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Server-Side Variables (Secret)

**NEVER expose these to the client:**

```env
PRIVATE_KEY=0x...  # Your wallet private key
RPC_URL=https://sepolia.infura.io/v3/YOUR_PRIVATE_KEY
API_KEY=your_secret_api_key
DATABASE_URL=postgresql://...
```

### Security Best Practices

✅ Use environment-specific `.env` files
✅ Never commit `.env` files to git
✅ Use secrets management (Vercel Secrets, AWS Secrets Manager)
✅ Rotate API keys regularly
✅ Use different keys for dev/staging/prod
❌ Never hardcode secrets in code
❌ Never expose `PRIVATE_KEY` to client
❌ Never log sensitive information

---

## ✅ Production Checklist

### Before Deployment

- [ ] Environment variables configured
- [ ] API keys secured
- [ ] TypeScript compilation passes (`npm run build`)
- [ ] Tests passing (`npm test`)
- [ ] Linting clean (`npm run lint`)
- [ ] Dependencies updated (`npm audit fix`)
- [ ] Error boundaries implemented
- [ ] Loading states added
- [ ] Rate limiting configured
- [ ] CORS configured properly

### After Deployment

- [ ] Health endpoint responding
- [ ] Wallet connection works
- [ ] Encryption/decryption flows tested
- [ ] Contract interactions verified
- [ ] Error handling tested
- [ ] Performance acceptable (<3s load time)
- [ ] Mobile responsive
- [ ] Browser compatibility checked
- [ ] SSL certificate valid
- [ ] Monitoring set up

### Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables not exposed
- [ ] API authentication enabled
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] CORS whitelist configured
- [ ] Error messages don't leak info
- [ ] Dependency vulnerabilities fixed
- [ ] CSP headers configured
- [ ] Security headers set

---

## 📊 Monitoring & Debugging

### Logging

**Next.js/React:**

```typescript
// Add error logging
useEffect(() => {
  if (error) {
    console.error('[FHEVM]', error);
    // Send to error tracking service
  }
}, [error]);
```

**Node.js:**

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

logger.info('Encryption successful', { value: encrypted });
```

### Health Checks

```typescript
// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    chainId: process.env.CHAIN_ID,
  });
});
```

### Performance Monitoring

```typescript
// Measure encryption time
const start = performance.now();
const encrypted = await encrypt(value, type, options);
const duration = performance.now() - start;

console.log(`Encryption took ${duration}ms`);
```

### Error Tracking

Integrate with services like:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - APM and logging
- **New Relic** - Performance monitoring

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## 🔗 Deployment Examples

### Live Deployments

| Application | Platform | URL |
|-------------|----------|-----|
| Parking Reservation | Vercel | [arking-reservation.vercel.app](https://arking-reservation.vercel.app/) |
| Vue Voting App | Local/VPS | `npm run dev` |
| Node.js API | Docker/VPS | `docker-compose up` |

### Deployment Scripts

**package.json:**

```json
{
  "scripts": {
    "deploy:vercel": "vercel --prod",
    "deploy:docker": "docker-compose up -d --build",
    "deploy:pm2": "pm2 start ecosystem.config.js --env production"
  }
}
```

---

## 🆘 Troubleshooting

### Common Issues

**Issue: Environment variables not loading**
```bash
# Solution: Check .env file location and naming
# Next.js: .env.local
# Node.js: .env
```

**Issue: CORS errors**
```typescript
// Solution: Configure CORS in Express
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
}));
```

**Issue: Build fails**
```bash
# Solution: Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

---

## 📞 Support

- **Documentation**: [Full Docs](./README.md)
- **Issues**: [GitHub Issues](https://github.com/CameronCrist/fhevm-react-template/issues)
- **Discussions**: [GitHub Discussions](https://github.com/CameronCrist/fhevm-react-template/discussions)

---

**Built with ❤️ for the Zama FHE Challenge**
