#!/bin/bash

# SignaturePro Startup Script
# This script starts both the backend and frontend servers

echo "🚀 Starting SignaturePro..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file with default values"
    echo ""
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
    echo ""
fi

# Activate virtual environment
echo "🐍 Activating Python virtual environment..."
source venv/bin/activate

# Check if Python dependencies are installed
if ! python -c "import flask" 2>/dev/null; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
    echo "✅ Python dependencies installed"
    echo ""
fi

# Check if Node dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node dependencies..."
    npm install
    echo "✅ Node dependencies installed"
    echo ""
fi

# Create necessary directories
mkdir -p uploads storage/signatures storage/watermarks

echo "✨ Starting servers..."
echo ""
echo "Backend will run on: http://localhost:5000"
echo "Frontend will run on: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
python app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend in background
npm run dev &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup INT TERM

# Wait for both processes
wait
