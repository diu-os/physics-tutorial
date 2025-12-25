#!/bin/bash

# Build script for Cloudflare Pages
# This script fixes the npm lock file sync issue

echo "🚀 Starting custom build process..."

# Navigate to frontend directory if it exists
if [ -d "frontend" ]; then
    cd frontend
    echo "📁 Changed to frontend directory"
fi

# Remove lock file to avoid conflicts
echo "🗑️ Removing old package-lock.json..."
rm -f package-lock.json

# Install dependencies with npm install (not ci)
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

echo "✅ Build completed successfully!"
