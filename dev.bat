@echo off
REM Start Wingman Dev Server

cd /d "%~dp0"

echo.
echo ======================================
echo   Wingman Dev Server with v3 Upgrade
echo ======================================
echo.

echo Installing dependencies...
call npm install

echo.
echo ======================================
echo Starting development server...
echo ======================================
echo.
echo Server available at: http://localhost:5173
echo.
echo Test the new v3 features:
echo   • Particle background animation
echo   • Tab transition blur morphs
echo   • Spring physics reply cards
echo   • Confetti on copy button
echo   • Skeleton loaders
echo   • Heartbeat score animations
echo.
echo Press Ctrl+C to stop.
echo.

call npm run dev
