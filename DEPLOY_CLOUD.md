# Deploy Gateway Server to Render.com (FREE)

## Why Render.com?
- ✅ Free tier with WebSocket support
- ✅ No credit card required
- ✅ HTTPS included (secure connection)
- ✅ Always online (no sleep like Heroku free tier)

## Step-by-Step Deployment

### Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `ble-gateway-server`
3. Make it **Public** (required for free tier)
4. Click "Create repository"

### Step 2: Push Code to GitHub
```bash
cd "c:\My Work\OneDrive_1_15-1-2026\ble-gateway-server"

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - BLE Gateway Server"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ble-gateway-server.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Render.com
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub
4. Click "New +" → "Web Service"
5. Connect your `ble-gateway-server` repository
6. Settings:
   - **Name:** `ble-gateway-server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`
7. Click "Create Web Service"

### Step 4: Wait for Deployment
- Takes 2-3 minutes
- You'll get a URL like: `https://ble-gateway-server.onrender.com`

### Step 5: Test Your Deployment
Open in browser:
```
https://ble-gateway-server.onrender.com/health
```

Should see:
```json
{
  "status": "ok",
  "devices": 0,
  "webClients": 0,
  "timestamp": "..."
}
```

### Step 6: Update BLE Scanner App
In the app, change Gateway URL to:
```
https://ble-gateway-server.onrender.com
```

**Important:** Use `https://` (not `http://`) for Render.com

### Step 7: Update React App
Edit `Wipro Code - Hotel MDU\.env`:
```
REACT_APP_GATEWAY_URL=https://ble-gateway-server.onrender.com
```

## Alternative: Railway.app

### Quick Deploy to Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `ble-gateway-server`
5. Railway auto-detects Node.js
6. Get URL like: `https://ble-gateway-server.up.railway.app`

## Alternative: Glitch.com

### Quick Deploy to Glitch
1. Go to https://glitch.com
2. Click "New Project" → "Import from GitHub"
3. Paste: `https://github.com/YOUR_USERNAME/ble-gateway-server`
4. Get URL like: `https://ble-gateway-server.glitch.me`

## Troubleshooting

### Issue: "Cannot connect to server"
- Check server logs in Render dashboard
- Verify URL uses `https://` (not `http://`)
- Test `/health` endpoint first

### Issue: "WebSocket connection failed"
- Render.com supports WebSocket on all plans
- Make sure Socket.io client uses same protocol (https → wss)

### Issue: Server sleeps after inactivity (Render free tier)
- Free tier may sleep after 15 min inactivity
- First request wakes it up (takes 30 seconds)
- Upgrade to paid tier ($7/month) for always-on

## Benefits of Cloud Deployment

✅ **No firewall issues** - Works from any network
✅ **HTTPS included** - Secure connections
✅ **Always accessible** - No need to keep laptop running
✅ **Multiple devices** - All phones can connect
✅ **Production ready** - Same setup for final deployment
