@echo off
SETLOCAL EnableDelayedExpansion

echo ==================================================
echo   BIJLI WALA AYA - FULL SYSTEM AUTO-RECOVERY
echo ==================================================

:: 1. Force kill everything to avoid port conflicts
echo [1/6] Force killing existing Node/PM2 processes...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM pm2.exe /T 2>nul

:: 2. Clean up PM2 locks (Anti-EPERM)
echo [2/6] Cleaning up PM2 lock files...
del /F /Q "C:\Users\Kishan\.pm2\pm2.pid" 2>nul
del /F /Q "C:\Users\Kishan\.pm2\rpc.sock" 2>nul
del /F /Q "C:\Users\Kishan\.pm2\pub.sock" 2>nul
rmdir /S /Q "C:\Users\Kishan\.pm2\pids" 2>nul

:: 3. Start Backend API (Port 5009)
echo [3/6] Starting Backend API (Port 5009)...
cd /d "D:\backend new 13-02-2026\backend-main\backend-main"
pm2 start index.js --name "backend-api-5009" --env PORT=5009 --watch

:: 4. Start Admin App (Port 3001)
echo [4/6] Starting Admin App (Port 3001)...
cd /d "D:\backend new 13-02-2026\Admin-App-4\Admin App (4)\Admin App"
pm2 start "npm" --name "admin-app-3001" -- run dev -- -p 3001

:: 5. Start Frontend App (Port 4001)
echo [5/6] Starting Frontend App (Port 4001)...
cd /d "D:\BIJLI WALA AYA V2 DATE 13"
pm2 start "npm" --name "frontend-app-4001" -- run dev -- -p 4001

:: 6. Start Partner App (Port 3000)
echo [6/6] Starting Partner App (Port 3000)...
cd /d "D:\Web aprtner BWa\bijli-wala-aya-partner-app"
pm2 start "npm" --name "partner-app-3000" -- run dev -- -p 3000

:: Save and Persist
echo ==================================================
echo Saving PM2 process list...
pm2 save

echo ==================================================
echo ALL SERVERS STARTED SUCCESSFULLY!
echo --------------------------------------------------
echo Backend:  http://localhost:5009
echo Admin:    http://localhost:3001
echo Frontend: http://localhost:4001 (test.bijliwalaaya.in)
echo Partner:  http://localhost:3000
echo --------------------------------------------------
echo Note: This script is configured for Windows Startup.
echo ==================================================
timeout /t 10
