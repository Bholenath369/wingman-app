@echo off
REM Hero Upgrade Installation Script
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ================================================
echo        Hero Upgrade Installation
echo ================================================

REM Extract zip file
echo.
echo - Extracting hero update.zip...
if exist ".tmp-hero-upgrade" rmdir /s /q ".tmp-hero-upgrade" 2>nul
mkdir ".tmp-hero-upgrade"

REM Use PowerShell to extract (works on all Windows versions)
powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory((Resolve-Path 'hero update.zip').Path, (Resolve-Path '.tmp-hero-upgrade').Path)" 2>nul

if not exist ".tmp-hero-upgrade" (
    echo Error: Failed to extract zip
    pause
    exit /b 1
)

echo   OK - Extracted

REM Find the actual root (it might be nested)
set EXTRACTED_ROOT=.tmp-hero-upgrade
if exist ".tmp-hero-upgrade\hero update\public\images" set EXTRACTED_ROOT=.tmp-hero-upgrade\hero update
if exist ".tmp-hero-upgrade\public\images" set EXTRACTED_ROOT=.tmp-hero-upgrade

echo   Using: %EXTRACTED_ROOT%

REM Copy image files
echo.
echo - Copying image files...
if not exist "public\images" mkdir "public\images"

REM Copy JPG files
for %%f in ("%EXTRACTED_ROOT%\public\images\*.jpg") do (
    copy /y "%%f" "public\images\%%~nf" >nul 2>&1
    if not errorlevel 1 echo   + %%~nf
)

REM Copy WEBP files
for %%f in ("%EXTRACTED_ROOT%\public\images\*.webp") do (
    copy /y "%%f" "public\images\%%~nf" >nul 2>&1
    if not errorlevel 1 echo   + %%~nf
)

REM Copy Hero.jsx
echo.
echo - Copying Hero.jsx...
if not exist "src\components" mkdir "src\components"

if exist "%EXTRACTED_ROOT%\src\components\Hero.jsx" (
    copy /y "%EXTRACTED_ROOT%\src\components\Hero.jsx" "src\components\Hero.jsx" >nul
    echo   + src/components/Hero.jsx
)

REM Append CSS
echo.
echo - Appending CSS...

REM Check if already present
findstr /m "Brain Hero Image Polish" "src\index.css" >nul 2>&1
if errorlevel 1 (
    if exist "%EXTRACTED_ROOT%\src\index-additions-hero.css" (
        echo. >> src\index.css
        type "%EXTRACTED_ROOT%\src\index-additions-hero.css" >> src\index.css
        echo   + CSS appended
    )
) else (
    echo   - CSS already present
)

REM Delete old SVG heroes
echo.
echo - Removing old SVG heroes...

if exist "public\images\hero-analyze.svg" (
    del /q "public\images\hero-analyze.svg"
    echo   - hero-analyze.svg
)
if exist "public\images\hero-profile.svg" (
    del /q "public\images\hero-profile.svg"
    echo   - hero-profile.svg
)
if exist "public\images\hero-coach.svg" (
    del /q "public\images\hero-coach.svg"
    echo   - hero-coach.svg
)
if exist "public\images\hero-simulate.svg" (
    del /q "public\images\hero-simulate.svg"
    echo   - hero-simulate.svg
)

REM Clean temp
echo.
echo - Cleaning temp directory...
rmdir /s /q ".tmp-hero-upgrade" 2>nul
echo   OK

REM Git operations
echo.
echo ================================================
echo        Git Operations
echo ================================================
echo.
echo - Current status:
git status --short

echo.
echo - Adding files...
git add .

echo.
echo - Committing...
git commit -m "Replace SVG heroes with brain-connection imagery — WebP+JPG responsive"

echo.
echo - Pushing...
git push origin HEAD

echo.
echo ================================================
echo        Installation Complete!
echo ================================================
echo.

pause
