# 🚀 Bijli Wala Deployment Guide

## Quick Deployment Steps

### 1. Extract ZIP File
```bash
unzip bijli-wala-advance-payment-*.zip -d /path/to/deployment
cd /path/to/deployment
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
nano .env
```

**Required ENV Variables:**
```
NEXT_PUBLIC_API_BASE_URL=https://api.bijliwalaaya.in
NEXT_PUBLIC_API_TOKEN=super_secure_token
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

### 4. Build Production
```bash
npm run build
```

### 5. Start with PM2
```bash
pm2 start ecosystem.linux.config.js
pm2 save
```

### 6. Setup Cloudflare Tunnel (Optional)
```bash
./setup_tunnel.sh
```

## Features Included

✅ **Login Validation** - Orders require proper authentication  
✅ **Advance Payment** - Dynamic payment modes based on backend config  
✅ **Direct Paygic Integration** - No proxy, direct API calls  
✅ **Conditional Payment Buttons** - Smart UI based on advance %  

## Port Configuration

- **Frontend:** Port 3005  
- **Tunnel:** Port 3006 (if using Cloudflare)

## Troubleshooting

**Build fails?**
```bash
rm -rf .next node_modules
npm install
npm run build
```

**PM2 not starting?**
```bash
pm2 delete all
pm2 start ecosystem.linux.config.js --update-env
```

**Payment not working?**
- Ensure user is logged in (userId + authToken in localStorage)
- Check backend API is accessible
- Verify Paygic credentials in code

## Support
For issues, check logs:
```bash
pm2 logs frontend-test-prod
```
