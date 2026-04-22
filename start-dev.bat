@echo off
REM Start the Wingman dev server

cd /d "%~dp0"

echo.
echo ======================================
echo   Wingman Dev Server
echo ======================================
echo.

echo Installing dependencies...
call npm install

echo.
echo ======================================
echo Starting development server...
echo ======================================
echo.
echo Open your browser to: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server.
echo.

call npm run dev

pause
