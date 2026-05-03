@echo off
REM ============================================
REM CLEAN INSTALL - Remove node_modules and reinstall
REM ============================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ============================================
echo   CLEAN INSTALL
echo ============================================
echo.

echo Checking Node.js...
node --version
if errorlevel 1 (
  echo ERROR: Node.js not found!
  echo Download from: https://nodejs.org/
  pause
  exit /b 1
)

echo Checking npm...
npm --version
if errorlevel 1 (
  echo ERROR: npm not found!
  pause
  exit /b 1
)

echo.
echo Removing old node_modules and cache...
if exist "node_modules" (
  echo Deleting node_modules folder...
  rmdir /s /q "node_modules" 2>nul
  if exist "node_modules" (
    echo WARNING: Could not fully delete node_modules
    echo You may need to restart your computer and try again
  )
)

echo Removing package-lock.json...
if exist "package-lock.json" del package-lock.json

echo Clearing npm cache...
call npm cache clean --force

echo.
echo ============================================
echo   FRESH INSTALL
echo ============================================
echo.
echo This will download ~200MB of dependencies.
echo This may take 3-5 minutes...
echo.

call npm install --legacy-peer-deps

if errorlevel 1 (
  echo.
  echo ERROR: npm install failed!
  echo.
  echo Troubleshooting steps:
  echo   1. Check your internet connection
  echo   2. Try running as Administrator
  echo   3. Check disk space (need ~500MB free)
  echo   4. Restart your computer
  echo   5. Try again
  echo.
  pause
  exit /b 1
)

echo.
echo ✓ Installation complete!
echo.
echo ============================================
echo   STARTING DEV SERVER
echo ============================================
echo.
echo Server will run on: http://localhost:5173
echo Press Ctrl+C to stop
echo.

call npm run dev

pause
