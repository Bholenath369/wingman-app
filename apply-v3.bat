@echo off
REM ──────────────────────────────────────────────────────────────
REM Wingman v3 — Visual & Animation Upgrade (Windows)
REM
REM HOW TO USE:
REM 1. Place wingman-v3-visual.zip in your project root
REM 2. Run: apply-v3.bat
REM ──────────────────────────────────────────────────────────────

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ╔══════════════════════════════════════════════╗
echo ║   Wingman v3 — Visual ^& Emotion Upgrade      ║
echo ╚══════════════════════════════════════════════╝
echo.

REM ── Safety checks ──────────────────────────────────────────
if not exist "package.json" (
  echo ❌ No package.json. Run from project root.
  pause
  exit /b 1
)

if not exist "wingman-v3-visual.zip" (
  echo ❌ wingman-v3-visual.zip not found.
  pause
  exit /b 1
)

if not exist "src\index.css" (
  echo ❌ src\index.css not found. Is v1 installed?
  pause
  exit /b 1
)

echo ✓ All checks passed
echo.

REM ── Backup ─────────────────────────────────────────────────
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set BACKUP=.backup-v3-%mydate%-%mytime%

echo → Creating backup in %BACKUP% ...
if not exist "%BACKUP%\src\components" mkdir "%BACKUP%\src\components"
if not exist "%BACKUP%\src\screens" mkdir "%BACKUP%\src\screens"
if not exist "%BACKUP%\src\lib" mkdir "%BACKUP%\src\lib"

if exist "src\components" xcopy "src\components" "%BACKUP%\src\components\" /e /i /y >nul 2>&1
if exist "src\screens" xcopy "src\screens" "%BACKUP%\src\screens\" /e /i /y >nul 2>&1
if exist "src\lib" xcopy "src\lib" "%BACKUP%\src\lib\" /e /i /y >nul 2>&1
if exist "src\App.jsx" copy "src\App.jsx" "%BACKUP%\src\" >nul 2>&1
if exist "src\index.css" copy "src\index.css" "%BACKUP%\src\" >nul 2>&1

echo ✓ Backup: %BACKUP%
echo.

REM ── Extract ────────────────────────────────────────────────
echo → Extracting wingman-v3-visual.zip...
if exist ".tmp-v3" rmdir /s /q ".tmp-v3" >nul 2>&1

powershell -Command "Expand-Archive -Path 'wingman-v3-visual.zip' -DestinationPath '.tmp-v3' -Force" >nul 2>&1

if not exist ".tmp-v3\v3" (
  echo ❌ Zip structure wrong.
  pause
  exit /b 1
)

set SRC=.tmp-v3\v3
echo ✓ Extracted
echo.

REM ── Install ────────────────────────────────────────────────
echo → Installing animation engine...
if exist "%SRC%\src\lib\animations.js" (
  copy "%SRC%\src\lib\animations.js" "src\lib\animations.js" >nul
  echo   ✓ src/lib/animations.js (new^)
)

echo.
echo → Installing new components...
if not exist "src\components" mkdir "src\components"

if exist "%SRC%\src\components\ParticleBackground.jsx" (
  copy "%SRC%\src\components\ParticleBackground.jsx" "src\components\ParticleBackground.jsx" >nul
  echo   ✓ ParticleBackground (particle network^)
)

if exist "%SRC%\src\components\TabTransition.jsx" (
  copy "%SRC%\src\components\TabTransition.jsx" "src\components\TabTransition.jsx" >nul
  echo   ✓ TabTransition (blur morphing^)
)

if exist "%SRC%\src\components\ReplyCard.jsx" (
  copy "%SRC%\src\components\ReplyCard.jsx" "src\components\ReplyCard.jsx" >nul
  echo   ✓ ReplyCard (spring physics + confetti^)
)

if exist "%SRC%\src\components\MatchScore.jsx" (
  copy "%SRC%\src\components\MatchScore.jsx" "src\components\MatchScore.jsx" >nul
  echo   ✓ MatchScore (heartbeat + count-up^)
)

if exist "%SRC%\src\components\SkeletonLoader.jsx" (
  copy "%SRC%\src\components\SkeletonLoader.jsx" "src\components\SkeletonLoader.jsx" >nul
  echo   ✓ SkeletonLoader (shimmer cards^)
)

if exist "%SRC%\src\components\OnboardingModal.jsx" (
  copy "%SRC%\src\components\OnboardingModal.jsx" "src\components\OnboardingModal.jsx" >nul
  echo   ✓ OnboardingModal (animated illus.^)
)

if exist "%SRC%\src\components\PremiumGate.jsx" (
  copy "%SRC%\src\components\PremiumGate.jsx" "src\components\PremiumGate.jsx" >nul
  echo   ✓ PremiumGate (magnetic + celebration^)
)

echo.
echo → Updating screens...
if exist "%SRC%\src\screens\AnalyzeScreen.jsx" (
  copy "%SRC%\src\screens\AnalyzeScreen.jsx" "src\screens\AnalyzeScreen.jsx" >nul
  echo   ✓ AnalyzeScreen (skeleton + spring reveals^)
)

if exist "%SRC%\src\screens\PersonalityScreen.jsx" (
  copy "%SRC%\src\screens\PersonalityScreen.jsx" "src\screens\PersonalityScreen.jsx" >nul
  echo   ✓ PersonalityScreen (animated scores^)
)

echo.
echo → Updating App shell...
if exist "%SRC%\src\App.jsx" (
  copy "%SRC%\src\App.jsx" "src\App.jsx" >nul
  echo   ✓ App.jsx (particle bg + tab transitions^)
)

REM ── Append CSS ─────────────────────────────────────────────
echo.
echo → Appending CSS animations...

findstr /m "WINGMAN v3" "src\index.css" >nul 2>&1
if not errorlevel 1 (
  echo   ^⚠️  v3 CSS already present — skipping
) else (
  if exist "%SRC%\src\index-additions-v3.css" (
    echo. >> src\index.css
    type "%SRC%\src\index-additions-v3.css" >> src\index.css
    echo   ✓ CSS appended
  )
)

REM ── Cleanup ────────────────────────────────────────────────
rmdir /s /q ".tmp-v3" >nul 2>&1
echo.

REM ── Verify ─────────────────────────────────────────────────
set MISSING=0
for %%f in (
  "src\lib\animations.js"
  "src\components\ParticleBackground.jsx"
  "src\components\TabTransition.jsx"
  "src\components\ReplyCard.jsx"
  "src\components\MatchScore.jsx"
  "src\components\SkeletonLoader.jsx"
  "src\screens\AnalyzeScreen.jsx"
  "src\screens\PersonalityScreen.jsx"
) do (
  if not exist %%f (
    echo   ❌ Missing: %%f
    set MISSING=1
  )
)

if !MISSING! equ 1 (
  echo Missing files — check above.
  pause
  exit /b 1
)
echo ✓ All 10 files verified
echo.

REM ── Git ────────────────────────────────────────────────────
if exist ".git" (
  echo → Git status:
  git status --short
  echo.
  
  set /p COMMIT="Commit and push? (y/n): "
  
  if /i "!COMMIT!"=="y" (
    git add .
    git commit -m "v3: particle bg, spring physics, confetti, skeleton loaders, tab transitions, heartbeat scores"
    
    for /f %%i in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%i
    echo.
    echo → Pushing to origin/!CURRENT_BRANCH!...
    git push origin !CURRENT_BRANCH!
    echo.
    echo ✅ Pushed! Vercel is building.
  )
)

echo.
echo ╔══════════════════════════════════════════════╗
echo ║              WHAT TO TEST                     ║
echo ╠══════════════════════════════════════════════╣
echo ║  • Particle network lives behind the app      ║
echo ║  • Tab switches have blur morph transition    ║
echo ║  • Reply cards spring in with stagger         ║
echo ║  • Copy button fires confetti burst           ║
echo ║  • Thumbs up floats emoji + heart             ║
echo ║  • Loading shows shimmer skeleton cards       ║
echo ║  • Personality shows count-up scores          ║
echo ║  • Onboarding has animated SVG illustrations  ║
echo ║  • Premium button is magnetic on hover        ║
echo ║  • Premium unlock = full-screen celebration   ║
echo ╚══════════════════════════════════════════════╝
echo.
echo Backup: %BACKUP%
echo.
pause
