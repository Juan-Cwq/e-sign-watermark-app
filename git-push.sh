#!/bin/bash

echo "🚀 Git Push Script for SignaturePro"
echo "=========================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo "📦 Initializing Git repository..."
  git init
  echo "✅ Git repository initialized"
  echo ""
fi

# Configure git user if not set
if [ -z "$(git config user.name)" ]; then
  echo "⚙️  Configuring Git user..."
  read -p "Enter your Git username: " git_username
  read -p "Enter your Git email: " git_email
  git config user.name "$git_username"
  git config user.email "$git_email"
  echo "✅ Git user configured"
  echo ""
fi

echo "🔗 Setting remote repository to https://github.com/Juan-Cwq/e-sign-watermark-app..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/Juan-Cwq/e-sign-watermark-app.git
echo "✅ Remote repository set"
echo ""

echo "📊 Checking current status..."
git status
echo ""

echo "📝 Adding all files except those in .gitignore..."
git add .
echo "✅ Files staged"
echo ""

echo "💾 Committing changes..."
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
  commit_msg="Initial commit: SignaturePro - Digital Signature & Watermark App

Features:
- AI-powered signature digitization with background removal
- Custom watermark creator (text and image-based)
- Document editor with drag-and-drop positioning
- Secure library management with encryption
- Modern React frontend with professional UI
- Flask backend with comprehensive API"
fi

git commit -m "$commit_msg"
echo "✅ Changes committed"
echo ""

echo "⚠️  WARNING: This will FORCE PUSH to the repository!"
echo "This will overwrite any existing content on the remote repository."
echo "Remote: https://github.com/Juan-Cwq/e-sign-watermark-app"
echo ""
read -p "Are you sure you want to force push? (Y/N): " confirm

if [[ "$confirm" =~ ^[Yy]$ ]]; then
  echo ""
  echo "🚀 Pushing to GitHub..."
  
  # Try to push to main branch, if it fails, try master
  if git push -f -u origin main 2>/dev/null; then
    echo "✅ Successfully pushed to main branch!"
  elif git push -f -u origin master 2>/dev/null; then
    echo "✅ Successfully pushed to master branch!"
  else
    echo "❌ Push failed. Trying to create main branch..."
    git branch -M main
    git push -f -u origin main
    echo "✅ Successfully pushed to main branch!"
  fi
else
  echo "❌ Force push canceled."
  exit 1
fi

echo ""
echo "🎉 Done! Your code is now on GitHub!"
echo "🔗 View at: https://github.com/Juan-Cwq/e-sign-watermark-app"
echo ""
