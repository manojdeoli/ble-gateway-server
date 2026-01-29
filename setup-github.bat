@echo off
echo ========================================
echo BLE Gateway Server - GitHub Setup
echo ========================================
echo.
echo This will prepare your code for cloud deployment
echo.

cd "c:\My Work\OneDrive_1_15-1-2026\ble-gateway-server"

echo Step 1: Initializing Git repository...
git init

echo.
echo Step 2: Adding files...
git add .

echo.
echo Step 3: Creating commit...
git commit -m "Initial commit - BLE Gateway Server for cloud deployment"

echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo 1. Create GitHub repository:
echo    https://github.com/new
echo    Name: ble-gateway-server
echo    Make it PUBLIC
echo.
echo 2. Run these commands (replace YOUR_USERNAME):
echo    git remote add origin https://github.com/YOUR_USERNAME/ble-gateway-server.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Deploy to Render.com:
echo    https://render.com
echo    Sign up → New Web Service → Connect GitHub repo
echo.
echo 4. You'll get a URL like:
echo    https://ble-gateway-server.onrender.com
echo.
echo 5. Use that URL in your BLE Scanner App!
echo.
pause
