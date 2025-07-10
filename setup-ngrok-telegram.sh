#!/bin/bash

echo "🚀 Setting up ngrok for Real Telegram Authentication"
echo "=================================================="

# Check if backend is running
if ! curl -s http://localhost:5000/api/health > /dev/null; then
    echo "❌ Backend not running. Please start it first:"
    echo "   cd backend && npm start"
    exit 1
fi

# Check Node.js version for frontend
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Node.js version is $NODE_VERSION. Next.js requires 18+"
    echo "   You can still use the backend API, but frontend needs Node.js 18+"
    echo ""
fi

echo "📋 Setup Steps:"
echo "1. Start ngrok tunnel"
echo "2. Configure BotFather with ngrok URL"
echo "3. Update environment variables"
echo "4. Test real Telegram authentication"
echo ""

# Start ngrok tunnel
echo "🌐 Starting ngrok tunnel..."
echo "This will create a public URL for your local app"
echo ""
echo "⚠️  IMPORTANT: After ngrok starts:"
echo "   1. Copy the https URL (e.g., https://abc123.ngrok.io)"
echo "   2. Message @BotFather on Telegram"
echo "   3. Send: /setdomain"
echo "   4. Select your bot: bot7906063270"
echo "   5. Enter the ngrok URL"
echo ""
echo "Press Enter to start ngrok..."
read

# Start ngrok (this will run in foreground)
ngrok http 3000 