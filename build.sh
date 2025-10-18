#!/bin/bash
# Build script for Render deployment

set -e  # Exit on error

echo "🚀 Starting build process..."

# Check Python version
echo "🐍 Python version:"
python --version

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip setuptools wheel

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Install Node dependencies and build frontend
echo "📦 Installing Node dependencies..."
npm install

echo "🏗️  Building frontend..."
npm run build

# Create necessary directories
echo "📁 Creating storage directories..."
mkdir -p uploads
mkdir -p storage/signatures
mkdir -p storage/watermarks

echo "✅ Build complete!"
