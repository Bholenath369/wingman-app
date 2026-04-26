@echo off
setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║   Auth Upgrade — Google + Apple + Email Login     ║
echo ╚═══════════════════════════════════════════════════╝
echo.

if not exist "package.json" (
    echo ❌ Run from project root.
    exit /b 1
)
if not exist "wingman-auth.zip" (
    echo ❌ wingman-auth.zip not found.
    exit /b 1
)

:: Backup
for /f "tokens=1-5 delims=/ " %%a in ("%date%") do set D=%%c%%a%%b
for /f "tokens=1-3 delims=:." %%a in ("%time: =0%") do set T=%%a%%b%%c
set BACKUP=.backup-auth-%D%-%T%

mkdir "%BACKUP%\src\components" 2>nul
mkdir "%BACKUP%\src\screens" 2>nul
mkdir "%BACKUP%\src\lib" 2>nul
mkdir "%BACKUP%\api" 2>nul

if exist "src\App.jsx"             copy /y "src\App.jsx"             "%BACKUP%\src\" >nul
if exist "src\main.jsx"            copy /y "src\main.jsx"            "%BACKUP%\src\" >nul
if exist "src\lib\useUsage.js"     copy /y "src\lib\useUsage.js"     "%BACKUP%\src\lib\" >nul
if exist "api\usage.js"            copy /y "api\usage.js"            "%BACKUP%\api\" >nul
if exist "api\create-checkout.js"  copy /y "api\create-checkout.js"  "%BACKUP%\api\" >nul
if exist "api\upgrade-redeem.js"   copy /y "api\upgrade-redeem.js"   "%BACKUP%\api\" >nul
echo ✓ Backup: %BACKUP%
echo.

:: Extract zip
if exist ".tmp-auth" rmdir /s /q ".tmp-auth"
powershell -NoProfile -Command "Expand-Archive -Path 'wingman-auth.zip' -DestinationPath '.tmp-auth' -Force"
if errorlevel 1 ( echo ❌ Failed to extract wingman-auth.zip & exit /b 1 )

set SRC=.tmp-auth\auth-upgrade
if not exist "%SRC%" (
    echo ❌ Zip structure wrong. Expected folder: auth-upgrade inside zip.
    exit /b 1
)
echo ✓ Extracted
echo.

:: Install Clerk package
echo → Installing @clerk/clerk-react...
powershell -NoProfile -Command "if ((Get-Content 'package.json' -Raw) -match '""@clerk/clerk-react""') { exit 0 } else { exit 1 }"
if errorlevel 1 (
    call npm install @clerk/clerk-react --save
    echo   ✓ Clerk added to package.json
) else (
    echo   ⚠️  Already installed
)
echo.

:: Install API files
echo → Installing API endpoints...
copy /y "%SRC%\api\usage.js"           "api\usage.js"           >nul && echo   ✓ api/usage.js (Clerk JWT verification)
copy /y "%SRC%\api\create-checkout.js" "api\create-checkout.js" >nul && echo   ✓ api/create-checkout.js (links to Clerk user)
copy /y "%SRC%\api\upgrade-redeem.js"  "api\upgrade-redeem.js"  >nul && echo   ✓ api/upgrade-redeem.js (per-user upgrade)
echo.

:: Install frontend files
echo → Installing frontend files...
if not exist "src\components" mkdir "src\components"
if not exist "src\screens"   mkdir "src\screens"
if not exist "src\lib"       mkdir "src\lib"

copy /y "%SRC%\src\main.jsx"                    "src\main.jsx"                    >nul && echo   ✓ src/main.jsx (ClerkProvider wrapper)
copy /y "%SRC%\src\App.jsx"                     "src\App.jsx"                     >nul && echo   ✓ src/App.jsx (auth gating + UserMenu)
copy /y "%SRC%\src\lib\useUsage.js"             "src\lib\useUsage.js"             >nul && echo   ✓ src/lib/useUsage.js (auth-aware hook)
copy /y "%SRC%\src\components\UserMenu.jsx"     "src\components\UserMenu.jsx"     >nul && echo   ✓ src/components/UserMenu.jsx (new)
copy /y "%SRC%\src\screens\LoginScreen.jsx"     "src\screens\LoginScreen.jsx"     >nul && echo   ✓ src/screens/LoginScreen.jsx (new)
copy /y "%SRC%\src\screens\SSOCallback.jsx"     "src\screens\SSOCallback.jsx"     >nul && echo   ✓ src/screens/SSOCallback.jsx (new)
echo.

:: Copy setup guide
copy /y "%SRC%\AUTH-SETUP.md" "AUTH-SETUP.md" >nul
echo → Setup guide saved as AUTH-SETUP.md
echo.

:: Cleanup
rmdir /s /q ".tmp-auth"

:: Verify all files landed
set MISSING=0
for %%f in (
    "api\usage.js"
    "src\main.jsx"
    "src\App.jsx"
    "src\screens\LoginScreen.jsx"
    "src\screens\SSOCallback.jsx"
    "src\components\UserMenu.jsx"
    "src\lib\useUsage.js"
) do (
    if not exist %%f (
        echo   ❌ Missing: %%f
        set MISSING=1
    )
)
if "!MISSING!"=="1" exit /b 1
echo ✓ All files in place
echo.

echo ╔═══════════════════════════════════════════════════╗
echo ║              IMPORTANT — DO THIS NEXT             ║
echo ╠═══════════════════════════════════════════════════╣
echo ║                                                     ║
echo ║  1. Sign up at https://clerk.com (free)            ║
echo ║                                                     ║
echo ║  2. Create an application named 'Wingman'          ║
echo ║                                                     ║
echo ║  3. Enable: Email + Google + Apple                 ║
echo ║                                                     ║
echo ║  4. Copy your Publishable Key + JWKS URL           ║
echo ║                                                     ║
echo ║  5. Add to Vercel env vars (Settings):             ║
echo ║     VITE_CLERK_PUBLISHABLE_KEY=pk_test_...         ║
echo ║     CLERK_ISSUER=https://your-app.clerk.accounts.dev║
echo ║                                                     ║
echo ║  6. Also add to .env.local for local dev           ║
echo ║                                                     ║
echo ║  7. Read AUTH-SETUP.md for full instructions       ║
echo ║                                                     ║
echo ╚═══════════════════════════════════════════════════╝
echo.

:: Git
if exist ".git" (
    git status --short
    echo.
    set /p REPLY="Commit and push? (y/n): "
    if /i "!REPLY!"=="y" (
        git add .
        git commit -m "Add Clerk auth: Google + Apple + Email login, per-user usage tracking"
        for /f %%b in ('git branch --show-current') do git push origin %%b
        echo.
        echo ✅ Pushed!
        echo ⚠️  IMPORTANT: Vercel build will fail until you add the env vars above.
        echo    Add them at vercel.com → your project → Settings → Environment Variables
        echo    then redeploy.
    )
)

echo.
echo Backup: %BACKUP%
echo.
endlocal
