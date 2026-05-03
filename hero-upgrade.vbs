' Extract ZIP and copy hero files
' Usage: cscript hero-upgrade.vbs

Dim objShell, objFSO, strSource, strDest, objShellApp
Dim strTempDir, strExtractedRoot, objFolder, objFile
Dim arrFiles, strFile, i

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")
Set objShellApp = CreateObject("Shell.Application")

' Change to script directory
strScriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
objShell.CurrentDirectory = strScriptPath

WScript.Echo "==============================================="
WScript.Echo "       Hero Upgrade Installation"
WScript.Echo "==============================================="
WScript.Echo ""

' Verify zip exists
If Not objFSO.FileExists("hero update.zip") Then
    WScript.Echo "ERROR: 'hero update.zip' not found"
    WScript.Quit(1)
End If

' Create temp directory
strTempDir = ".tmp-hero-upgrade"
If objFSO.FolderExists(strTempDir) Then
    objFSO.DeleteFolder strTempDir
End If
objFSO.CreateFolder strTempDir

' Extract ZIP
WScript.Echo "- Extracting 'hero update.zip'..."
strSource = objFSO.GetAbsolutePathName("hero update.zip")
strDest = objFSO.GetAbsolutePathName(strTempDir)

Set objZipFile = objShellApp.NameSpace(strSource)
Set objTargetFolder = objShellApp.NameSpace(strDest)
objTargetFolder.CopyHere objZipFile.Items(), 16

' Wait a moment for extraction to complete
WScript.Sleep 2000

WScript.Echo "  OK - Extracted"
WScript.Echo ""

' Find the extracted root (may be nested)
strExtractedRoot = strTempDir

' Check for nested folder structure
Set objFolder = objFSO.GetFolder(strTempDir)
For Each objSubFolder In objFolder.SubFolders
    If objFSO.FolderExists(objSubFolder.Path & "\public\images") Then
        strExtractedRoot = objSubFolder.Path
        Exit For
    End If
    If objFSO.FolderExists(objSubFolder.Path & "\src\components") Then
        strExtractedRoot = objSubFolder.Path
        Exit For
    End If
Next

WScript.Echo "  Using: " & strExtractedRoot
WScript.Echo ""

' Copy image files
WScript.Echo "- Copying image files..."
If Not objFSO.FolderExists("public\images") Then
    objFSO.CreateFolder "public\images"
End If

' Copy JPG files
Set objImageFolder = objFSO.GetFolder(strExtractedRoot & "\public\images")
For Each objFile In objImageFolder.Files
    If Right(LCase(objFile.Name), 4) = ".jpg" Or Right(LCase(objFile.Name), 5) = ".webp" Then
        objFSO.CopyFile objFile.Path, "public\images\" & objFile.Name, True
        WScript.Echo "  + " & objFile.Name
    End If
Next

WScript.Echo ""

' Copy Hero.jsx
WScript.Echo "- Copying Hero.jsx..."
If Not objFSO.FolderExists("src\components") Then
    objFSO.CreateFolder "src\components"
End If

If objFSO.FileExists(strExtractedRoot & "\src\components\Hero.jsx") Then
    objFSO.CopyFile strExtractedRoot & "\src\components\Hero.jsx", "src\components\Hero.jsx", True
    WScript.Echo "  + src/components/Hero.jsx"
End If

WScript.Echo ""

' Append CSS
WScript.Echo "- Appending CSS..."

' Read existing CSS to check if already present
Dim strCSSContent
Set objCSSFile = objFSO.OpenTextFile("src\index.css", 1)
strCSSContent = objCSSFile.ReadAll()
objCSSFile.Close

If InStr(strCSSContent, "Brain Hero Image Polish") = 0 Then
    ' Not found, append it
    If objFSO.FileExists(strExtractedRoot & "\src\index-additions-hero.css") Then
        Dim strAdditions
        Set objAddFile = objFSO.OpenTextFile(strExtractedRoot & "\src\index-additions-hero.css", 1)
        strAdditions = objAddFile.ReadAll()
        objAddFile.Close
        
        ' Append to CSS
        Set objCSSFile = objFSO.OpenTextFile("src\index.css", 8)  ' 8 = ForAppending
        objCSSFile.WriteBlankLines(2)
        objCSSFile.Write(strAdditions)
        objCSSFile.Close
        
        WScript.Echo "  + CSS appended"
    End If
Else
    WScript.Echo "  - CSS already present"
End If

WScript.Echo ""

' Delete old SVG files
WScript.Echo "- Removing old SVG heroes..."
Dim arrSVGFiles
arrSVGFiles = Array( _
    "public\images\hero-analyze.svg", _
    "public\images\hero-profile.svg", _
    "public\images\hero-coach.svg", _
    "public\images\hero-simulate.svg" _
)

For i = 0 To UBound(arrSVGFiles)
    If objFSO.FileExists(arrSVGFiles(i)) Then
        objFSO.DeleteFile arrSVGFiles(i)
        WScript.Echo "  - " & objFSO.GetFileName(arrSVGFiles(i))
    End If
Next

WScript.Echo ""

' Clean temp
WScript.Echo "- Cleaning temp directory..."
objFSO.DeleteFolder strTempDir
WScript.Echo "  OK"
WScript.Echo ""

' Verify
WScript.Echo "- Verifying..."
Dim bMissing
bMissing = False

Dim arrRequired
arrRequired = Array( _
    "public\images\hero-analyze.jpg", _
    "public\images\hero-coach.jpg", _
    "public\images\hero-simulate.jpg", _
    "public\images\hero-profile.jpg", _
    "src\components\Hero.jsx" _
)

For i = 0 To UBound(arrRequired)
    If Not objFSO.FileExists(arrRequired(i)) Then
        WScript.Echo "  ! " & arrRequired(i)
        bMissing = True
    End If
Next

If Not bMissing Then
    WScript.Echo "  OK - All files present"
End If

WScript.Echo ""
WScript.Echo "==============================================="
WScript.Echo "            Git Operations"
WScript.Echo "==============================================="
WScript.Echo ""

' Try to run git commands
On Error Resume Next

' Get git status
WScript.Echo "- Git status:"
objShell.Run "cmd /c git status --short", 1, True

WScript.Echo ""
WScript.Echo "- Adding files..."
objShell.Run "cmd /c git add .", 1, True

WScript.Echo ""
WScript.Echo "- Committing..."
objShell.Run "cmd /c git commit -m ""Replace SVG heroes with brain-connection imagery — WebP+JPG responsive""", 1, True

WScript.Echo ""
WScript.Echo "- Pushing..."
objShell.Run "cmd /c git push origin HEAD", 1, True

On Error GoTo 0

WScript.Echo ""
WScript.Echo "==============================================="
WScript.Echo "        Installation Complete!"
WScript.Echo "==============================================="
WScript.Echo ""
