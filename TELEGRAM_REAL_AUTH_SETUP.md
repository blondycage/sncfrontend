# 🤖 Real Telegram Authentication Setup Guide

## 🚨 **Important: Why Mock Data is Currently Used**

Telegram OAuth **does not work with localhost** for security reasons. The current mock implementation allows development and testing, but for real Telegram authentication, you need:

1. **A proper domain** (e.g., `https://yourdomain.com`)
2. **HTTPS certificate** (required by Telegram)
3. **Domain configured in BotFather**

## 🌐 **Option 1: Deploy to Production Domain**

### Step 1: Get a Domain
- Purchase a domain (e.g., from Namecheap, GoDaddy, etc.)
- Or use a free subdomain service like:
  - Netlify: `yourapp.netlify.app`
  - Vercel: `yourapp.vercel.app`
  - Railway: `yourapp.railway.app`

### Step 2: Deploy Your App
Deploy both frontend and backend to your domain:

```bash
# Frontend (Next.js) - Deploy to Vercel/Netlify
npm run build
# Follow deployment instructions

# Backend (Node.js) - Deploy to Railway/Heroku
# Follow deployment instructions
```

### Step 3: Configure BotFather
1. Open Telegram and message `@BotFather`
2. Send `/setdomain`
3. Select your bot: `bot7906063270`
4. Enter your domain: `https://yourdomain.com`

### Step 4: Update Environment Variables
```env
# Production .env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
TELEGRAM_BOT_TOKEN=7906063270:AAH_your_actual_token_here
```

### Step 5: Update Frontend Code
The frontend will automatically use real Telegram OAuth when not on localhost:

```typescript
// components/telegram-login-button.tsx
// This code already exists and will work automatically:
if (process.env.NODE_ENV === "development" || window.location.hostname === "localhost") {
  // Use mock data
} else {
  // Use real Telegram OAuth (will work on production domain)
}
```

## 🔧 **Option 2: Local Development with Tunneling**

For testing real Telegram auth locally, use a tunnel service:

### Using ngrok (Recommended)
1. **Install ngrok:**
   ```bash
   # Install ngrok
   npm install -g ngrok
   # or download from https://ngrok.com/
   ```

2. **Start your backend:**
   ```bash
   cd backend && npm start
   ```

3. **Start your frontend (upgrade Node.js first):**
   ```bash
   # You need Node.js 18+ for this
   npm run dev
   ```

4. **Create tunnel:**
   ```bash
   # In a new terminal
   ngrok http 3000
   ```

5. **Configure BotFather:**
   - Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
   - Message `@BotFather` → `/setdomain` → Select your bot → Enter ngrok URL

6. **Update environment:**
   ```env
   NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
   NEXT_PUBLIC_API_URL=https://abc123.ngrok.io/api
   ```

### Using Cloudflare Tunnel (Alternative)
```bash
# Install cloudflared
npm install -g cloudflared

# Create tunnel
cloudflared tunnel --url http://localhost:3000
```

## 🔧 **Option 3: Modify for Real Telegram Data**

If you want to test with real Telegram data but keep the current setup, you can modify the mock data:

### Step 1: Get Your Telegram User Data
1. Message `@userinfobot` on Telegram
2. It will show your user ID and other details

### Step 2: Update Mock Data
```typescript
// components/telegram-login-button.tsx
const mockTelegramData = {
  id: "YOUR_REAL_TELEGRAM_ID", // Replace with your actual ID
  first_name: "YOUR_REAL_FIRST_NAME",
  last_name: "YOUR_REAL_LAST_NAME", 
  username: "YOUR_REAL_USERNAME",
  photo_url: "YOUR_REAL_PHOTO_URL",
  auth_date: Math.floor(Date.now() / 1000).toString(),
  hash: "mock_hash_for_development",
}
```

## 🎯 **Recommended Approach**

For **development**: Keep using mock data (current setup works perfectly)
For **production**: Deploy to a real domain and configure BotFather

## 🚀 **Quick Production Deployment**

### Using Vercel (Frontend) + Railway (Backend)

1. **Deploy Frontend to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Deploy Backend to Railway:**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Deploy
   railway deploy
   ```

3. **Configure BotFather:**
   - Use your Vercel URL: `https://yourapp.vercel.app`
   - Message `@BotFather` → `/setdomain` → Enter your URL

4. **Update Environment Variables:**
   - In Vercel dashboard: Add environment variables
   - In Railway dashboard: Add environment variables

## 🔐 **Security Notes**

- **Never expose your bot token** in frontend code
- **Use HTTPS only** for production
- **Validate Telegram data** on the backend (implement proper hash verification)
- **Use environment variables** for sensitive data

## ✅ **Testing Checklist**

- [ ] Domain has HTTPS certificate
- [ ] BotFather domain is configured
- [ ] Environment variables are set
- [ ] Backend validates Telegram data
- [ ] Frontend redirects to auth page correctly
- [ ] User data is stored properly

## 🆘 **Need Help?**

If you want to proceed with any of these options, let me know which approach you prefer:

1. **Deploy to production** (recommended for real users)
2. **Use ngrok for local testing** (good for development)
3. **Update mock data with real info** (quick test)

I can help you implement whichever option you choose! 