@echo off
REM ──────────────────────────────────────────────────────────────
REM Wingman v2 — Effectiveness Upgrade Apply Script (Windows)
REM
REM HOW TO USE:
REM 1. Save as `apply-v2.bat` in your project root (same folder as package.json)
REM 2. Put `wingman-v2-upgrade.zip` in the same folder
REM 3. Run: apply-v2.bat
REM ──────────────────────────────────────────────────────────────

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ╔══════════════════════════════════════════════╗
echo ║   Wingman v2 — Effectiveness Upgrade         ║
echo ╚══════════════════════════════════════════════╝
echo.

REM ── Safety checks ──────────────────────────────────────────
if not exist "package.json" (
  echo ❌ No package.json found. Run this from your project root.
  pause
  exit /b 1
)

if not exist "wingman-v2-upgrade.zip" (
  echo ❌ wingman-v2-upgrade.zip not found in this folder.
  pause
  exit /b 1
)

if not exist "src\index.css" (
  echo ❌ src\index.css not found. Did v1 install correctly?
  pause
  exit /b 1
)

echo ✓ Project structure looks good
echo.

REM ── Backup ─────────────────────────────────────────────────
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set BACKUP_DIR=.backup-v2-%mydate%-%mytime%

echo → Creating backup in %BACKUP_DIR% ...
if not exist "%BACKUP_DIR%\src" mkdir "%BACKUP_DIR%\src"
if not exist "%BACKUP_DIR%\api" mkdir "%BACKUP_DIR%\api"

if exist "api\claude.js" copy "api\claude.js" "%BACKUP_DIR%\api\" >nul
if exist "src\App.jsx" copy "src\App.jsx" "%BACKUP_DIR%\src\" >nul
if exist "src\index.css" copy "src\index.css" "%BACKUP_DIR%\src\" >nul
if exist "src\lib" xcopy "src\lib" "%BACKUP_DIR%\src\lib\" /e /i >nul
if exist "src\screens" xcopy "src\screens" "%BACKUP_DIR%\src\screens\" /e /i >nul
if exist "src\components" xcopy "src\components" "%BACKUP_DIR%\src\components\" /e /i >nul

echo ✓ Backup saved
echo.

REM ── Extract ────────────────────────────────────────────────
REM Note: Requires PowerShell or built-in unzip capability
REM Windows 11 has built-in tar support; Windows 10/earlier needs 7-Zip or similar
echo → Extracting wingman-v2-upgrade.zip...

REM Try using PowerShell's Expand-Archive if available
powershell -Command "Expand-Archive -Path 'wingman-v2-upgrade.zip' -DestinationPath '.tmp-v2' -Force" >nul 2>&1

if not exist ".tmp-v2" (
  echo.
  echo ⚠️  PowerShell unzip failed. You need one of these:
  echo    • Windows 11 (built-in tar): Use this script as-is
  echo    • 7-Zip installed: Manually extract wingman-v2-upgrade.zip to .tmp-v2\wingman-v2-upgrade\
  echo    • Other tools: Extract and run this script again
  pause
  exit /b 1
)

if not exist ".tmp-v2\wingman-v2-upgrade" (
  echo ❌ Zip structure unexpected. Expected: wingman-v2-upgrade.zip
  pause
  exit /b 1
)

echo ✓ Extracted
echo.

REM ── Replace files ──────────────────────────────────────────
echo → Installing API upgrade...
if exist ".tmp-v2\wingman-v2-upgrade\api\claude.js" (
  copy ".tmp-v2\wingman-v2-upgrade\api\claude.js" "api\claude.js" >nul
  echo   ✓ api/claude.js (streaming + retry^)
) else (
  echo   ❌ Missing: api/claude.js
)

echo.
echo → Installing frontend upgrades...

if exist ".tmp-v2\wingman-v2-upgrade\src\App.jsx" (
  copy ".tmp-v2\wingman-v2-upgrade\src\App.jsx" "src\App.jsx" >nul
  echo   ✓ src/App.jsx (onboarding hook^)
) else (
  echo   ❌ Missing: src/App.jsx
)

if exist ".tmp-v2\wingman-v2-upgrade\src\lib\claude.js" (
  copy ".tmp-v2\wingman-v2-upgrade\src\lib\claude.js" "src\lib\claude.js" >nul
  echo   ✓ src/lib/claude.js (two-step, streaming, vibe^)
) else (
  echo   ❌ Missing: src/lib/claude.js
)

if exist ".tmp-v2\wingman-v2-upgrade\src\lib\deepLinks.js" (
  copy ".tmp-v2\wingman-v2-upgrade\src\lib\deepLinks.js" "src\lib\deepLinks.js" >nul
  echo   ✓ src/lib/deepLinks.js (new^)
) else (
  echo   ❌ Missing: src/lib/deepLinks.js
)

if exist ".tmp-v2\wingman-v2-upgrade\src\components\SendToApp.jsx" (
  copy ".tmp-v2\wingman-v2-upgrade\src\components\SendToApp.jsx" "src\components\SendToApp.jsx" >nul
  echo   ✓ src/components/SendToApp.jsx (new^)
) else (
  echo   ❌ Missing: src/components/SendToApp.jsx
)

if exist ".tmp-v2\wingman-v2-upgrade\src\components\OnboardingModal.jsx" (
  copy ".tmp-v2\wingman-v2-upgrade\src\components\OnboardingModal.jsx" "src\components\OnboardingModal.jsx" >nul
  echo   ✓ src/components/OnboardingModal.jsx (new^)
) else (
  echo   ❌ Missing: src/components/OnboardingModal.jsx
)

if exist ".tmp-v2\wingman-v2-upgrade\src\screens\AnalyzeScreen.jsx" (
  copy ".tmp-v2\wingman-v2-upgrade\src\screens\AnalyzeScreen.jsx" "src\screens\AnalyzeScreen.jsx" >nul
  echo   ✓ src/screens/AnalyzeScreen.jsx (smart analysis^)
) else (
  echo   ❌ Missing: src/screens/AnalyzeScreen.jsx
)

if exist ".tmp-v2\wingman-v2-upgrade\src\screens\SimulateScreen.jsx" (
  copy ".tmp-v2\wingman-v2-upgrade\src\screens\SimulateScreen.jsx" "src\screens\SimulateScreen.jsx" >nul
  echo   ✓ src/screens/SimulateScreen.jsx (streaming^)
) else (
  echo   ❌ Missing: src/screens/SimulateScreen.jsx
)

REM ── Append CSS (instead of replacing) ──────────────────────
echo.
echo → Appending CSS additions to src/index.css...

findstr /m "Blinking cursor for streaming text" "src\index.css" >nul 2>&1
if not errorlevel 1 (
  echo   ⚠️  CSS already contains v2 additions — skipping append
) else (
  if exist ".tmp-v2\wingman-v2-upgrade\src\index-additions.css" (
    echo. >> src\index.css
    type ".tmp-v2\wingman-v2-upgrade\src\index-additions.css" >> src\index.css
    echo   ✓ CSS additions appended
  ) else (
    echo   ❌ Missing: src/index-additions.css
  )
)

REM ── Cleanup ────────────────────────────────────────────────
rmdir /s /q .tmp-v2 >nul 2>&1
echo.
echo ✓ All files installed
echo.

REM ── Verify ─────────────────────────────────────────────────
set MISSING=0
for %%f in (
  "api\claude.js"
  "src\App.jsx"
  "src\lib\claude.js"
  "src\lib\deepLinks.js"
  "src\components\SendToApp.jsx"
  "src\components\OnboardingModal.jsx"
  "src\screens\AnalyzeScreen.jsx"
  "src\screens\SimulateScreen.jsx"
) do (
  if not exist %%f (
    echo   ❌ Missing: %%f
    set MISSING=1
  )
)

if !MISSING! equ 1 (
  echo Some files missing — check errors above.
  pause
  exit /b 1
)
echo ✓ All 8 files verified
echo.

REM ── Git ────────────────────────────────────────────────────
if exist ".git" (
  echo → Git status:
  git status --short
  echo.
  
  set /p COMMIT="Commit and push to trigger Vercel deploy? (y/n): "
  
  if /i "!COMMIT!"=="y" (
    git add .
    git commit -m "v2: smart two-step analysis, streaming, vibe onboarding, send-to-app, thumbs feedback"
    
    for /f %%i in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%i
    echo.
    echo → Pushing to origin/!CURRENT_BRANCH!...
    git push origin !CURRENT_BRANCH!
    echo.
    echo ✅ Pushed! Vercel is building. Check: https://vercel.com/dashboard
  ) else (
    echo Skipped. When ready: git add . ^&^& git commit ^&^& git push
  )
)

echo.
echo ╔══════════════════════════════════════════════╗
echo ║              WHAT TO TEST                     ║
echo ╠══════════════════════════════════════════════╣
echo ║                                                ║
echo ║  1. Open your app in incognito —^> onboarding ║
echo ║     modal should appear                        ║
echo ║                                                ║
echo ║  2. Analyze —^> you should see:                ║
echo ║     • Context chips (stage, vibe, feeling)    ║
echo ║     • 4 replies with thumbs + send buttons    ║
echo ║     • Thumbs down regenerates                  ║
echo ║                                                ║
echo ║  3. Simulate —^> AI replies stream word-by-word║
echo ║                                                ║
echo ║  4. No env vars changed — no Vercel config   ║
echo ║     needed. Pure code deploy.                  ║
echo ║                                                ║
echo ╚══════════════════════════════════════════════╝
echo.
echo Backup: %BACKUP_DIR% (delete after confirming working^)
echo.
pause
