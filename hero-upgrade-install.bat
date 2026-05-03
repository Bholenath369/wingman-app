@echo off
REM Hero Upgrade Installation Script
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ================================================
echo        Hero Upgrade Installation
echo ================================================
echo.

REM Verify we have the zip file
if not exist "hero update.zip" (
    echo ERROR: "hero update.zip" not found in current directory
    pause
    exit /b 1
)

echo - Extracting "hero update.zip"...
if exist ".tmp-hero-upgrade" rmdir /s /q ".tmp-hero-upgrade" 2>nul
mkdir ".tmp-hero-upgrade"

REM Extract using Windows built-in shell
powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory((Resolve-Path 'hero update.zip').Path, (Resolve-Path '.tmp-hero-upgrade').Path)" 2>nul

if errorlevel 1 (
    echo ERROR: Failed to extract zip file
    rmdir /s /q ".tmp-hero-upgrade" 2>nul
    pause
    exit /b 1
)

echo  OK - Extracted

REM Determine the root folder (may be nested)
set EXTRACTED_ROOT=.tmp-hero-upgrade
for /d %%D in (.tmp-hero-upgrade\*) do (
    if exist "%%D\public\images" (
        set EXTRACTED_ROOT=%%D
        goto :found_root
    )
    if exist "%%D\src\components" (
        set EXTRACTED_ROOT=%%D
        goto :found_root
    )
)

:found_root
echo  Using: %EXTRACTED_ROOT%
echo.

REM =====================================================
REM Copy image files
REM =====================================================
echo - Copying image files...
if not exist "public\images" mkdir "public\images"

setlocal enabledelayedexpansion
set COPIED=0

for %%f in ("%EXTRACTED_ROOT%\public\images\*.jpg") do (
    if exist "%%f" (
        copy /y "%%f" "public\images\%%~nf" >nul 2>&1
        if not errorlevel 1 (
            echo   + %%~nf
            set /a COPIED=!COPIED!+1
        )
    )
)

for %%f in ("%EXTRACTED_ROOT%\public\images\*.webp") do (
    if exist "%%f" (
        copy /y "%%f" "public\images\%%~nf" >nul 2>&1
        if not errorlevel 1 (
            echo   + %%~nf
            set /a COPIED=!COPIED!+1
        )
    )
)

echo.

REM =====================================================
REM Copy Hero.jsx
REM =====================================================
echo - Copying Hero.jsx...
if not exist "src\components" mkdir "src\components"

if exist "%EXTRACTED_ROOT%\src\components\Hero.jsx" (
    copy /y "%EXTRACTED_ROOT%\src\components\Hero.jsx" "src\components\Hero.jsx" >nul
    echo   + src/components/Hero.jsx
) else (
    echo   ! Warning: Hero.jsx not found
)

echo.

REM =====================================================
REM Append CSS
REM =====================================================
echo - Appending CSS...

REM Check if CSS already present
findstr /m "Brain Hero Image Polish" "src\index.css" >nul 2>&1
if errorlevel 1 (
    REM Not found, append it
    if exist "%EXTRACTED_ROOT%\src\index-additions-hero.css" (
        echo. >> src\index.css
        type "%EXTRACTED_ROOT%\src\index-additions-hero.css" >> src\index.css
        echo   + CSS appended to src/index.css
    ) else (
        echo   ! Warning: index-additions-hero.css not found
    )
) else (
    echo   - CSS already present (skipped)
)

echo.

REM =====================================================
REM Delete old SVG heroes
REM =====================================================
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

echo.

REM =====================================================
REM Clean temp directory
REM =====================================================
echo - Cleaning temp directory...
rmdir /s /q ".tmp-hero-upgrade" 2>nul
echo   OK
echo.

REM =====================================================
REM Verify files exist
REM =====================================================
echo - Verifying...
set MISSING=0

if not exist "public\images\hero-analyze.jpg" (
    echo   ! hero-analyze.jpg
    set MISSING=1
)
if not exist "public\images\hero-coach.jpg" (
    echo   ! hero-coach.jpg
    set MISSING=1
)
if not exist "public\images\hero-simulate.jpg" (
    echo   ! hero-simulate.jpg
    set MISSING=1
)
if not exist "public\images\hero-profile.jpg" (
    echo   ! hero-profile.jpg
    set MISSING=1
)
if not exist "src\components\Hero.jsx" (
    echo   ! src/components/Hero.jsx
    set MISSING=1
)

if %MISSING% equ 0 (
    echo   OK - All required files present
) else (
    echo   ERROR - Some files missing
)

echo.
echo ================================================
echo        Git Operations
echo ================================================
echo.

if exist ".git" (
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
    echo ✅ Complete! Vercel is building...
) else (
    echo Git not available - skipping commit and push
)

echo.
echo ================================================
echo        Installation Complete!
echo ================================================
echo.
