@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

REM Try PowerShell 5 (built into Windows 10/11)
echo Attempting extraction with PowerShell...

powershell -Command ^
  "$source = 'hero update.zip'; " ^
  "$destination = '.tmp-hero'; " ^
  "if (Test-Path $destination) { Remove-Item $destination -Recurse -Force }; " ^
  "Add-Type -AssemblyName System.IO.Compression.FileSystem; " ^
  "[System.IO.Compression.ZipFile]::ExtractToDirectory((Resolve-Path $source).Path, (Resolve-Path $destination -PathType Leaf) + '\') " ^
  2>nul

if errorlevel 1 (
    echo PowerShell extraction failed, trying COM object...
    
    REM Fallback: Use Windows COM object
    powershell -Command ^
      "$shell = New-Object -COM Shell.Application; " ^
      "$zip = $shell.NameSpace((Resolve-Path 'hero update.zip').Path); " ^
      "$dest = $shell.NameSpace('.'); " ^
      "if (-not (Test-Path '.tmp-hero')) { mkdir '.tmp-hero' | Out-Null }; " ^
      "$dest = $shell.NameSpace((Resolve-Path '.tmp-hero').Path); " ^
      "$dest.CopyHere($zip.Items(), 16); " ^
      "Start-Sleep -Milliseconds 1000 " ^
      2>nul
    
    if errorlevel 1 (
        echo ERROR: Both extraction methods failed
        exit /b 1
    )
)

echo Extraction successful!
dir /s ".tmp-hero" | findstr /c:"Hero.jsx" 
if errorlevel 1 (
    echo Warning: Could not find Hero.jsx in extraction
) else (
    echo Hero.jsx found in extraction
)

pause
