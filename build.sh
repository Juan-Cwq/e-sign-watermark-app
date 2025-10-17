#!/bin/bash
# Build script for Render deployment

echo "🚀 Starting build process..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
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
