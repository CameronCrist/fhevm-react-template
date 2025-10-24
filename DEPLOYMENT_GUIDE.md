# 🚀 Deployment Guide - Universal FHEVM SDK

Complete guide for deploying the SDK and example applications.

## 📦 Publishing SDK to NPM

### Prerequisites

- NPM account
- Verified email
- 2FA enabled (recommended)

### Steps

1. **Build the package**
   ```bash
   cd packages/fhevm-sdk
   npm run build
   ```

2. **Update version**
   ```bash
   npm version patch  # or minor, major
   ```

3. **Login to NPM**
   ```bash
   npm login
   ```

4. **Publish**
   ```bash
   npm publish --access public
   ```

5. **Verify**
   ```bash
   npm info @fhevm/sdk
   ```

## 🌐 Deploying Examples

### Next.js Showcase (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to example**
   ```bash
   cd examples/nextjs-showcase
   ```

3. **Build locally (test)**
   ```bash
   npm run build
   ```

4. **Deploy to Vercel**
   ```bash
   vercel deploy --prod
   ```

5. **Set environment variables in Vercel dashboard**
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_CHAIN_ID`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### Parking Reservation (Vercel)

Same steps as Next.js showcase:

```bash
cd examples/parking-reservation
npm run build
vercel deploy --prod
```

## 📝 Environment Variables

### Development (.env.local)

```env
# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Contract Address
NEXT_PUBLIC_CONTRACT_ADDRESS=0x78257622318fC85f2a9c909DD7aF9d0142cd90ce

# App Configuration
NEXT_PUBLIC_APP_NAME=Universal FHEVM SDK
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production (Vercel)

Add in Vercel dashboard under Settings → Environment Variables:

| Key | Value | Description |
|-----|-------|-------------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0x78257622318fC85f2a9c909DD7aF9d0142cd90ce` | Deployed contract |
| `NEXT_PUBLIC_CHAIN_ID` | `11155111` | Sepolia testnet |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Your project ID | From WalletConnect Cloud |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production URL |

## 🔗 Custom Domains

### Vercel Custom Domain

1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add your domain
4. Update DNS records:
   - Type: `CNAME`
   - Name: `@` or subdomain
   - Value: `cname.vercel-dns.com`

### Example Domains

- Main SDK Demo: `fhevm-sdk.example.com`
- Parking App: `parking.fhevm-sdk.example.com`

## 📊 Analytics Setup

### Vercel Analytics

1. Enable in Vercel dashboard
2. Add to Next.js app:
   ```typescript
   import { Analytics } from '@vercel/analytics/react';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

## 🔒 Security Checklist

- [ ] Environment variables secured
- [ ] No private keys in code
- [ ] HTTPS enforced
- [ ] Content Security Policy configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Dependencies updated
- [ ] Security headers set

## 📹 Demo Video Hosting

### YouTube Upload

1. **Prepare video**
   - Format: MP4
   - Resolution: 1080p
   - Max size: 128GB (YouTube limit)

2. **Upload steps**
   - Go to YouTube Studio
   - Click "Create" → "Upload videos"
   - Select `demo.mp4`
   - Add title: "Universal FHEVM SDK - Demo"
   - Add description with links
   - Set visibility: Public

3. **Update README with YouTube link**

### Alternative: Loom

1. Record with Loom desktop app
2. Upload to loom.com
3. Get shareable link
4. Update README

## 🧪 Pre-Deployment Testing

### Build Test

```bash
# Test SDK build
cd packages/fhevm-sdk
npm run build
npm run typecheck

# Test Next.js build
cd examples/nextjs-showcase
npm run build
npm run lint

# Test parking app build
cd examples/parking-reservation
npm run build
npm run lint
```

### Functionality Test

- [ ] SDK initializes correctly
- [ ] Encryption works
- [ ] Decryption works
- [ ] Wallet connection works
- [ ] Contract interaction works
- [ ] Error handling works
- [ ] Loading states display
- [ ] Mobile responsive

## 📈 Monitoring

### Vercel Dashboard

Monitor:
- Deployment status
- Build logs
- Error rates
- Performance metrics
- Bandwidth usage

### Setup Alerts

1. Configure Vercel notifications
2. Set up email alerts for:
   - Failed deployments
   - High error rates
   - Performance degradation

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Build SDK
        run: npm run build

      - name: Run tests
        run: npm test

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 📦 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Build succeeds locally
- [ ] Dependencies updated
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Domain configured (if custom)

### Deployment

- [ ] Deploy to Vercel
- [ ] Verify deployment URL
- [ ] Test all functionality
- [ ] Check error logs
- [ ] Monitor performance

### Post-Deployment

- [ ] Update README with live URL
- [ ] Announce on social media
- [ ] Submit to competition
- [ ] Monitor for issues

## 🎯 Competition Submission

### Final Steps

1. **Verify all links work**
   - [ ] GitHub repository accessible
   - [ ] NPM package published (or ready)
   - [ ] Live demos working
   - [ ] Video demo uploaded

2. **Update README**
   - [ ] Add deployment URLs
   - [ ] Add video demo link
   - [ ] Verify all examples work

3. **Submit to Zama**
   - [ ] Fill submission form
   - [ ] Provide repository link
   - [ ] Provide demo links
   - [ ] Include video link

## 🆘 Troubleshooting

### Build Failures

**Issue**: Build fails on Vercel
```bash
# Solution: Check build logs
vercel logs [deployment-url]

# Common fixes:
- Update Node.js version in vercel.json
- Clear build cache
- Check environment variables
```

### Runtime Errors

**Issue**: App crashes in production
```bash
# Solution: Check runtime logs
vercel logs [deployment-url] --follow

# Common causes:
- Missing environment variables
- Incorrect contract address
- Network configuration issues
```

### Wallet Connection Issues

**Issue**: MetaMask not connecting
```bash
# Solution:
- Verify WalletConnect Project ID
- Check HTTPS enabled
- Ensure correct network configured
```

## 📞 Support

- **Vercel Support**: https://vercel.com/support
- **NPM Support**: https://npm.community/
- **WalletConnect**: https://docs.walletconnect.com/

---

**Deployment Status**: Ready for production 🚀
