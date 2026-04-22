@echo off
REM ============================================
REM Wingman v3 - Complete Startup & Fix Script
REM ============================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

cls
echo.
echo ============================================
echo   WINGMAN v3 - Development Server
echo ============================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
  echo Installing dependencies first...
  echo This may take 2-3 minutes...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo ERROR: npm install failed
    echo Make sure Node.js is installed: https://nodejs.org
    pause
    exit /b 1
  )
)

echo.
echo ============================================
echo   Starting Vite Dev Server
echo ============================================
echo.
echo Server will be available at: http://localhost:5173
echo.
echo V3 Features Active:
echo   • Particle network background
echo   • Tab transition animations
echo   • Spring physics reply cards
echo   • Confetti celebrations
echo   • Skeleton loaders
echo   • Heartbeat score animations
echo   • Magnetic button effects
echo.
echo Press Ctrl+C to stop
echo.
echo ============================================
echo.

call npm run dev

pause
