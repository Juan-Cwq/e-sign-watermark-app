@echo off
REM SignaturePro Startup Script for Windows
REM This script starts both the backend and frontend servers

echo 🚀 Starting SignaturePro...
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  No .env file found. Creating from template...
    copy .env.example .env
    echo ✅ Created .env file with default values
    echo.
)

REM Check if virtual environment exists
if not exist venv (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
    echo ✅ Virtual environment created
    echo.
)

REM Activate virtual environment
echo 🐍 Activating Python virtual environment...
call venv\Scripts\activate.bat

REM Install Python dependencies if needed
pip show flask >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing Python dependencies...
    pip install -r requirements.txt
    echo ✅ Python dependencies installed
    echo.
)

REM Check if Node dependencies are installed
if not exist node_modules (
    echo 📦 Installing Node dependencies...
    call npm install
    echo ✅ Node dependencies installed
    echo.
)

REM Create necessary directories
if not exist uploads mkdir uploads
if not exist storage mkdir storage
if not exist storage\signatures mkdir storage\signatures
if not exist storage\watermarks mkdir storage\watermarks

echo ✨ Starting servers...
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start backend
start "SignaturePro Backend" cmd /k python app.py

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend
start "SignaturePro Frontend" cmd /k npm run dev

echo.
echo ✅ Both servers are starting in separate windows
echo Close the terminal windows to stop the servers
echo.
pause
