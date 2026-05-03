@echo off
REM ============================================
REM Wingman Living Hero — Animated Brain Upgrade
REM ============================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

cls
echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║   Living Hero — Sparks, Particles, Scan Reveal    ║
echo ╚═══════════════════════════════════════════════════╝
echo.

REM ── Safety checks ──────────────────────────────────────────
if not exist "package.json" (
  echo ❌ Run from project root.
  pause
  exit /b 1
)

if not exist "wingman-living-hero.zip" (
  echo ❌ wingman-living-hero.zip not found in project folder.
  pause
  exit /b 1
)

if not exist "public\images\hero-analyze.jpg" (
  echo ⚠️  public\images\hero-analyze.jpg not found.
  echo    You need to run the hero-upgrade step first.
  pause
  exit /b 1
)

if not exist "src\components\Hero.jsx" (
  echo ⚠️  src\components\Hero.jsx not found.
  echo    Run apply-hero-upgrade first.
  pause
  exit /b 1
)

echo ✓ All checks passed
echo.

REM ── Backup ─────────────────────────────────────────────────
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set BACKUP=.backup-livinghero-%mydate%-%mytime%

echo Creating backup in %BACKUP%...
if not exist "%BACKUP%\src\components" mkdir "%BACKUP%\src\components"
if not exist "%BACKUP%\src\screens" mkdir "%BACKUP%\src\screens"

xcopy /q /y src\components\Hero.jsx "%BACKUP%\src\components\" 2>nul
xcopy /q /y src\index.css "%BACKUP%\src\" 2>nul
xcopy /q /y src\screens\AnalyzeScreen.jsx "%BACKUP%\src\screens\" 2>nul
xcopy /q /y src\screens\PersonalityScreen.jsx "%BACKUP%\src\screens\" 2>nul
xcopy /q /y src\screens\CoachScreen.jsx "%BACKUP%\src\screens\" 2>nul
xcopy /q /y src\screens\SimulateScreen.jsx "%BACKUP%\src\screens\" 2>nul
xcopy /q /y src\screens\ProfileScreen.jsx "%BACKUP%\src\screens\" 2>nul

echo ✓ Backup saved: %BACKUP%
echo.

REM ── Extract ────────────────────────────────────────────────
echo Extracting living hero files...
if exist ".tmp-livinghero" rmdir /s /q ".tmp-livinghero" 2>nul
mkdir ".tmp-livinghero"
powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('wingman-living-hero.zip', '.tmp-livinghero')" 2>nul

if not exist ".tmp-livinghero\hero-fx" (
  echo ❌ Zip structure wrong - hero-fx folder not found.
  pause
  exit /b 1
)

echo ✓ Extracted
echo.

REM ── Install components ─────────────────────────────────────
echo → Installing living hero components...

if exist ".tmp-livinghero\hero-fx\src\components\HeroCanvas.jsx" (
  copy /y ".tmp-livinghero\hero-fx\src\components\HeroCanvas.jsx" "src\components\HeroCanvas.jsx" >nul
  echo   ✓ HeroCanvas.jsx ^(animated particles + sparks^)
) else (
  echo   ❌ HeroCanvas.jsx not found in zip
)

if exist ".tmp-livinghero\hero-fx\src\components\Hero.jsx" (
  copy /y ".tmp-livinghero\hero-fx\src\components\Hero.jsx" "src\components\Hero.jsx" >nul
  echo   ✓ Hero.jsx ^(updated with canvas layer^)
) else (
  echo   ❌ Hero.jsx not found in zip
)

echo.

REM ── Append CSS ─────────────────────────────────────────────
echo → Appending living hero CSS...

findstr /m "Living Hero Effects" src\index.css >nul 2>&1
if errorlevel 1 (
  if exist ".tmp-livinghero\hero-fx\src\index-additions-living-hero.css" (
    echo. >> src\index.css
    type ".tmp-livinghero\hero-fx\src\index-additions-living-hero.css" >> src\index.css
    echo   ✓ CSS appended
  ) else (
    echo   ⚠️  CSS file not found in zip
  )
) else (
  echo   ⚠️  Living hero CSS already present — skipping
)

echo.

REM ── Cleanup ────────────────────────────────────────────────
rmdir /s /q ".tmp-livinghero" 2>nul

REM ── Verify ─────────────────────────────────────────────────
set MISSING=0
if not exist "src\components\HeroCanvas.jsx" (
  echo   ❌ Missing: src\components\HeroCanvas.jsx
  set MISSING=1
)
if not exist "src\components\Hero.jsx" (
  echo   ❌ Missing: src\components\Hero.jsx
  set MISSING=1
)

if %MISSING% equ 1 (
  echo.
  echo ❌ Some files missing — check errors above.
  pause
  exit /b 1
)

echo ✓ All files in place
echo.

REM ── Git ────────────────────────────────────────────────────
if exist ".git" (
  echo.
  git status --short
  echo.
  set /p COMMIT="Commit and push? (y/n): "
  if /i "!COMMIT!"=="y" (
    git add .
    git commit -m "Living hero: canvas overlay with sparks, particles, Ken Burns drift, scan reveal"
    git push origin HEAD
    echo.
    echo ✅ Pushed! Vercel is building.
  ) else (
    echo Skipped. When ready: git add . && git commit && git push
  )
)

echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║              WHAT USERS WILL FEEL                  ║
echo ╠═══════════════════════════════════════════════════╣
echo ║                                                     ║
echo ║  On mount:                                          ║
echo ║  • Image fades in from blur + brightness darkening ║
echo ║  • Soft scan line sweeps top→bottom ^(1.6s^)         ║
echo ║  • Title text slides up after image lands          ║
echo ║                                                     ║
echo ║  Always breathing:                                  ║
echo ║  • Image slowly drifts ^(Ken Burns, 18s loop^)       ║
echo ║  • Particles float + glow with breathing pulse     ║
echo ║  • Both brains have breathing aura                 ║
echo ║                                                     ║
echo ║  Periodic sparks:                                   ║
echo ║  • Synaptic bolts arc between the two brains       ║
echo ║  • Leave a glowing curved trail                    ║
echo ║  • Blue→orange→blue, emotional back-and-forth      ║
echo ║                                                     ║
echo ║  Connection beam:                                   ║
echo ║  • Rhythmic pulse every 3s between both brains     ║
echo ║  • Goes blue → purple center → orange              ║
echo ║                                                     ║
echo ║  Performance:                                       ║
echo ║  • Pure canvas, ~60fps, no libraries               ║
echo ║  • ~5KB extra JS, negligible battery impact        ║
echo ║  • Respects prefers-reduced-motion                 ║
echo ║                                                     ║
echo ╚═══════════════════════════════════════════════════╝
echo.
echo Backup: %BACKUP%
echo.
pause
