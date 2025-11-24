@echo off
REM KIMU Transport & Multiservices - Vercel Deployment Script for Windows
echo 🚀 Starting Vercel deployment for KIMU Transport & Multiservices...

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Check if user is logged in to Vercel
vercel whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo 🔐 Please log in to Vercel...
    vercel login
)

REM Build the project
echo 📦 Building the project...
npm run build

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

echo ✅ Deployment complete!
echo 🌐 Your application is now live on Vercel!
pause
