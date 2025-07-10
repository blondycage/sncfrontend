# 🤖 Telegram Bot Setup Guide

## The "Bot domain invalid" Error

This error occurs because Telegram OAuth requires a valid domain (not localhost) for security reasons. Here's how to fix it:

## 🔧 **Current Status**

- ✅ **Development**: Using mock authentication (works on localhost)
- ⚠️ **Production**: Requires proper domain configuration

## 🛠️ **Setup Instructions**

### 1. **For Development (Current Working Solution)**

The app now automatically uses mock Telegram authentication when running on localhost:

```bash
# Backend (Terminal 1)
cd backend
npm start

# Frontend (Terminal 2) - Requires Node.js 18+
npm run dev
```

**Mock User Data:**
- ID: `123456789`
- Name: `Test User`
- Username: `testuser`
- This allows you to test the complete flow locally

### 2. **For Production Setup**

#### Step 1: Configure Bot Domain in BotFather

1. **Open Telegram** and search for `@BotFather`
2. **Send** `/setdomain` command
3. **Select your bot**: `bot7906063270`
4. **Set domain**: Enter your production domain (e.g., `https://searchnorthcyprus.com`)

#### Step 2: Configure Environment Variables

Update your production `.env` file:

```env
# Production Domain
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# Telegram Bot
NEXT_PUBLIC_TELEGRAM_BOT_NAME=bot7906063270
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

#### Step 3: Update Bot Settings

In BotFather, also configure:

```
/setdomain - Set your production domain
/setprivacy - Disable (to receive all messages)
/setcommands - Optional: Set bot commands
```

### 3. **Testing the Flow**

#### Development Testing (Current)
1. Click "Login with Telegram (Demo)"
2. Automatically redirected with mock data
3. Select your role
4. Complete registration/login

#### Production Testing (After Domain Setup)
1. Click "Login with Telegram"
2. Telegram popup opens
3. Authorize in Telegram
4. Return to your app
5. Select role and complete

## 🔍 **Troubleshooting**

### Common Issues:

1. **"Bot domain invalid"**
   - ✅ **Solution**: Use development mode (already implemented)
   - 🔧 **For Production**: Configure domain in BotFather

2. **"Unauthorized"**
   - Check bot token in backend `.env`
   - Verify bot is active in BotFather

3. **"Network Error"**
   - Ensure backend is running on port 5000
   - Check API URL configuration

## 🚀 **Current Implementation Status**

### ✅ **Working Features:**
- Mock Telegram authentication for development
- Complete role selection flow
- User registration and login
- JWT token generation
- Dashboard integration

### 🔧 **Backend API:**
- `POST /api/auth/telegram` - Telegram authentication
- Telegram data validation
- User creation/login logic
- Token generation

### 🎨 **Frontend:**
- Telegram login button with development mode
- Role selection page
- Error handling
- Success/loading states

## 📝 **Next Steps**

1. **For Local Development**: Everything works! Use the demo mode
2. **For Production**: 
   - Set up proper domain
   - Configure BotFather settings
   - Update environment variables
   - Test with real Telegram OAuth

## 🔒 **Security Notes**

- Mock mode is only enabled for development
- Production uses real Telegram OAuth
- All user data is properly validated
- JWT tokens are securely generated

The system is now fully functional for development and ready for production deployment! 🎉 