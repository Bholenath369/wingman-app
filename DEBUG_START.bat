@echo off
REM ============================================
REM DEBUG: Shows exactly what's happening
REM ============================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ====== NODE & NPM CHECK ======
echo.
node --version
npm --version
echo.

echo ====== CHECKING DEPENDENCIES ======
echo.
if exist "node_modules" (
  echo node_modules exists: YES
  dir /b node_modules | find /c ":" >nul && (
    echo Number of packages: (checking...)
  ) || (
    echo Some packages present
  )
) else (
  echo node_modules exists: NO - WILL DOWNLOAD
)
echo.

echo ====== CHECKING VITE ======
where vite >nul 2>&1
if errorlevel 1 (
  echo vite command: NOT FOUND in PATH
) else (
  echo vite command: FOUND
)
echo.

echo ====== CHECKING REACT ======
if exist "node_modules\react" (
  echo react package: FOUND
) else (
  echo react package: NOT FOUND
)
echo.

echo ====== CHECKING vite.config.js ======
if exist "vite.config.js" (
  echo vite.config.js: FOUND
) else (
  echo vite.config.js: NOT FOUND - ERROR!
)
echo.

echo ====== INSTALLING (if needed) ======
echo.
call npm install --no-save

if errorlevel 1 (
  echo.
  echo npm install FAILED - Check error above
  pause
  exit /b 1
)

echo.
echo ====== STARTING VITE ======
echo.
echo Expected output should show:
echo   "Local:   http://localhost:5173"
echo.

call npm run dev

pause
