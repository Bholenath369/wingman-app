@echo off
REM ============================================
REM Wingman - Comprehensive Startup Troubleshooting
REM ============================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

cls
echo.
echo ============================================
echo   WINGMAN - STARTUP TROUBLESHOOTING
echo ============================================
echo.

REM ── Check Node.js ──────────────────────────
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js not found!
  echo.
  echo SOLUTION: Download and install Node.js from:
  echo   https://nodejs.org/ (LTS version recommended)
  echo.
  echo After installing, restart Command Prompt and try again.
  pause
  exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODEVERSION=%%i
echo   Found: %NODEVERSION%
echo.

REM ── Check npm ──────────────────────────────
echo Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
  echo ERROR: npm not found!
  pause
  exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPMVERSION=%%i
echo   Found: %NPMVERSION%
echo.

REM ── Check package.json ──────────────────────
echo Checking project files...
if not exist "package.json" (
  echo ERROR: package.json not found!
  pause
  exit /b 1
)
echo   package.json: OK
echo.

REM ── Install/Verify dependencies ─────────────
echo Installing dependencies (this may take 2-3 minutes)...
echo.
call npm install

if errorlevel 1 (
  echo.
  echo ERROR: npm install failed!
  echo.
  echo Possible solutions:
  echo   1. Check your internet connection
  echo   2. Delete node_modules folder and package-lock.json
  echo   3. Run: npm cache clean --force
  echo   4. Try again: npm install
  echo.
  pause
  exit /b 1
)

echo.
echo ============================================
echo   STARTING DEVELOPMENT SERVER
echo ============================================
echo.

REM ── Start dev server ──────────────────────
echo Starting Vite dev server...
echo.
echo IMPORTANT:
echo   • Server will start on http://localhost:5173
echo   • Open your browser and go to that address
echo   • Press Ctrl+C to stop the server
echo.
echo ============================================
echo.

call npm run dev

if errorlevel 1 (
  echo.
  echo ERROR: Dev server failed to start!
  echo.
  echo Check for error messages above.
  echo Common issues:
  echo   • Port 5173 already in use
  echo   • Missing or invalid files
  echo   • Node.js version incompatibility
  echo.
  pause
  exit /b 1
)

pause
