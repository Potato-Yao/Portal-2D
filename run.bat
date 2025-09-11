@echo off
npm --version >nul 2>nul
if errorlevel 1 (
    echo Error: npm is not installed
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

npm install -g anywhere
anywhere
