@echo off
echo.
echo ========================================
echo    CONJURATION (VOIDSKETCH) LAUNCHER
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

echo Starting Conjuration...
echo.
echo Press Ctrl+C to stop the application
echo.

npm start

pause