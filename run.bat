@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   WINGMAN APP STARTUP
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
  echo ERROR: package.json not found!
  echo Please run this script from the project root folder.
  pause
  exit /b 1
)

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js not installed or not in PATH
  echo Download from: https://nodejs.org/
  pause
  exit /b 1
)

echo Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
  echo ERROR: npm not installed
  pause
  exit /b 1
)

echo ✓ Node.js and npm found
echo.
echo Installing dependencies (this may take a minute)...
call npm install

echo.
echo ========================================
echo   Starting Development Server...
echo ========================================
echo.
echo Once it starts, open your browser to:
echo   http://localhost:5173
echo.
echo Press Ctrl+C to stop the server.
echo ========================================
echo.

call npm run dev
pause
