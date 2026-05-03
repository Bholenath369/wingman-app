@echo off
REM ============================================
REM Wingman Hero Image Upgrade
REM ============================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

cls
echo.
echo ╔══════════════════════════════════════════════╗
echo ║   Hero Image Upgrade — Brain Connection      ║
echo ╚══════════════════════════════════════════════╝
echo.

REM ── Safety checks ──────────────────────────────────────────
if not exist "package.json" (
  echo ❌ Run from project root.
  pause
  exit /b 1
)

if not exist "wingman-hero-upgrade.zip" (
  echo ❌ wingman-hero-upgrade.zip not found in project folder.
  pause
  exit /b 1
)

echo ✓ All checks passed
echo.

REM ── Backup ─────────────────────────────────────────────────
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set BACKUP=.backup-hero-%mydate%-%mytime%

echo Creating backup in %BACKUP%...
if not exist "%BACKUP%\public\images" mkdir "%BACKUP%\public\images"
if not exist "%BACKUP%\src\screens" mkdir "%BACKUP%\src\screens"
if not exist "%BACKUP%\src\components" mkdir "%BACKUP%\src\components"

xcopy /q /y /s "public\images" "%BACKUP%\public\images\" 2>nul
xcopy /q /y "src\screens\AnalyzeScreen.jsx" "%BACKUP%\src\screens\" 2>nul
xcopy /q /y "src\screens\PersonalityScreen.jsx" "%BACKUP%\src\screens\" 2>nul
xcopy /q /y "src\screens\CoachScreen.jsx" "%BACKUP%\src\screens\" 2>nul
xcopy /q /y "src\screens\SimulateScreen.jsx" "%BACKUP%\src\screens\" 2>nul
xcopy /q /y "src\screens\ProfileScreen.jsx" "%BACKUP%\src\screens\" 2>nul
xcopy /q /y "src\index.css" "%BACKUP%\src\" 2>nul

echo ✓ Backup saved: %BACKUP%
echo.

REM ── Extract ────────────────────────────────────────────────
echo Extracting hero images and components...
if exist ".tmp-hero" rmdir /s /q ".tmp-hero" 2>nul
mkdir ".tmp-hero"
powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('wingman-hero-upgrade.zip', '.tmp-hero')" 2>nul

if not exist ".tmp-hero\hero-upgrade" (
  echo ❌ Zip structure wrong - hero-upgrade folder not found.
  pause
  exit /b 1
)

echo ✓ Extracted
echo.

REM ── Copy images ────────────────────────────────────────────
echo → Installing brain hero images...
if not exist "public\images" mkdir "public\images"

if exist ".tmp-hero\hero-upgrade\public\images\hero-analyze.jpg" (
  copy /y ".tmp-hero\hero-upgrade\public\images\hero-analyze.jpg" "public\images\hero-analyze.jpg" >nul
  echo   ✓ hero-analyze.jpg ^(both brains^)
)
if exist ".tmp-hero\hero-upgrade\public\images\hero-analyze.webp" copy /y ".tmp-hero\hero-upgrade\public\images\hero-analyze.webp" "public\images\hero-analyze.webp" >nul

if exist ".tmp-hero\hero-upgrade\public\images\hero-profile.jpg" (
  copy /y ".tmp-hero\hero-upgrade\public\images\hero-profile.jpg" "public\images\hero-profile.jpg" >nul
  echo   ✓ hero-profile.jpg ^(both brains, closer^)
)
if exist ".tmp-hero\hero-upgrade\public\images\hero-profile.webp" copy /y ".tmp-hero\hero-upgrade\public\images\hero-profile.webp" "public\images\hero-profile.webp" >nul

if exist ".tmp-hero\hero-upgrade\public\images\hero-coach.jpg" (
  copy /y ".tmp-hero\hero-upgrade\public\images\hero-coach.jpg" "public\images\hero-coach.jpg" >nul
  echo   ✓ hero-coach.jpg ^(left/blue brain^)
)
if exist ".tmp-hero\hero-upgrade\public\images\hero-coach.webp" copy /y ".tmp-hero\hero-upgrade\public\images\hero-coach.webp" "public\images\hero-coach.webp" >nul

if exist ".tmp-hero\hero-upgrade\public\images\hero-simulate.jpg" (
  copy /y ".tmp-hero\hero-upgrade\public\images\hero-simulate.jpg" "public\images\hero-simulate.jpg" >nul
  echo   ✓ hero-simulate.jpg ^(right/orange brain^)
)
if exist ".tmp-hero\hero-upgrade\public\images\hero-simulate.webp" copy /y ".tmp-hero\hero-upgrade\public\images\hero-simulate.webp" "public\images\hero-simulate.webp" >nul

echo.

REM ── Install Hero component ─────────────────────────────────
echo → Installing Hero component...
if not exist "src\components" mkdir "src\components"

if exist ".tmp-hero\hero-upgrade\src\components\Hero.jsx" (
  copy /y ".tmp-hero\hero-upgrade\src\components\Hero.jsx" "src\components\Hero.jsx" >nul
  echo   ✓ src\components\Hero.jsx
)

echo.

REM ── Append CSS ─────────────────────────────────────────────
echo → Appending hero CSS polish...

findstr /m "Brain Hero Image Polish" src\index.css >nul 2>&1
if errorlevel 1 (
  if exist ".tmp-hero\hero-upgrade\src\index-additions-hero.css" (
    echo. >> src\index.css
    type ".tmp-hero\hero-upgrade\src\index-additions-hero.css" >> src\index.css
    echo   ✓ CSS appended
  )
) else (
  echo   ⚠️  Hero CSS already present — skipping
)

echo.

REM ── Clean up old SVG heroes ────────────────────────────────
echo → Cleaning up old SVG heroes...
if exist "public\images\hero-analyze.svg" (
  del "public\images\hero-analyze.svg"
  echo   ✓ removed hero-analyze.svg
)
if exist "public\images\hero-profile.svg" (
  del "public\images\hero-profile.svg"
  echo   ✓ removed hero-profile.svg
)
if exist "public\images\hero-coach.svg" (
  del "public\images\hero-coach.svg"
  echo   ✓ removed hero-coach.svg
)
if exist "public\images\hero-simulate.svg" (
  del "public\images\hero-simulate.svg"
  echo   ✓ removed hero-simulate.svg
)

echo.

REM ── Cleanup temp files ─────────────────────────────────────
rmdir /s /q ".tmp-hero" 2>nul

REM ── Verify ─────────────────────────────────────────────────
echo → Verifying...
set MISSING=0

if not exist "public\images\hero-analyze.jpg" (
  echo   ❌ Missing: public\images\hero-analyze.jpg
  set MISSING=1
)
if not exist "public\images\hero-analyze.webp" (
  echo   ⚠️  Missing: public\images\hero-analyze.webp
)
if not exist "public\images\hero-coach.jpg" (
  echo   ❌ Missing: public\images\hero-coach.jpg
  set MISSING=1
)
if not exist "public\images\hero-simulate.jpg" (
  echo   ❌ Missing: public\images\hero-simulate.jpg
  set MISSING=1
)
if not exist "public\images\hero-profile.jpg" (
  echo   ❌ Missing: public\images\hero-profile.jpg
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
    git commit -m "Replace SVG heroes with brain-connection imagery — WebP+JPG responsive"
    git push origin HEAD
    echo.
    echo ✅ Pushed! Vercel is building.
  ) else (
    echo Skipped. When ready: git add . && git commit && git push
  )
)

echo.
echo ╔══════════════════════════════════════════════╗
echo ║              WHAT CHANGED                     ║
echo ╠══════════════════════════════════════════════╣
echo ║                                                ║
echo ║  Hero images now use the brain photo:         ║
echo ║  • Analyze  → both brains connecting          ║
echo ║  • Decode   → both brains ^(tighter crop^)      ║
echo ║  • Coach    → blue brain ^(user learning^)      ║
echo ║  • Practice → orange brain ^(AI persona^)       ║
echo ║  • Profile  → both brains                     ║
echo ║                                                ║
echo ║  Format: WebP ^(modern^) + JPG ^(fallback^)       ║
echo ║  Size:   ~70KB each ^(vs original 500KB PNG^)   ║
echo ║                                                ║
echo ║  Bonus: hero image now has a gentle zoom-in   ║
echo ║  reveal animation + subtle hover zoom.        ║
echo ║                                                ║
echo ╚══════════════════════════════════════════════╝
echo.
echo Backup: %BACKUP%
echo.
pause
