@echo off
echo.
echo ========================================
echo    CONJURATION - BUILD EXECUTABLE
echo ========================================
echo.

echo Installing/updating dependencies...
npm install

echo.
echo Building Windows executable and installer...
echo This may take a few minutes...
echo.

npm run build:win

echo.
echo ========================================
echo Build complete!
echo.
echo Files created in 'dist' folder:
echo - Conjuration Setup.exe (Installer)
echo - Conjuration.exe (Portable)
echo ========================================
echo.

pause