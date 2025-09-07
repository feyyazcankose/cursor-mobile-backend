#!/bin/bash

echo "🚀 Starting Cursor Mobile Backend Setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies with yarn..."
yarn install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Server Configuration
PORT=3001
HOST=0.0.0.0

# Cursor Configuration
CURSOR_WORKSPACE_PATH=/Users/feyyazcankose/Workspace
CURSOR_CLI_PATH=/usr/local/bin/cursor

# Git Configuration
GIT_AUTHOR_NAME="Mobile Backend"
GIT_AUTHOR_EMAIL="mobile-backend@cursor.local"

# File Watching
WATCH_INTERVAL=1000
MAX_FILE_SIZE=10485760

# Security
CORS_ORIGIN=*
JWT_SECRET=your-secret-key-here

# Development Servers
DEFAULT_DEV_PORTS=3000,3001,8080,8000,5000
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Build the project
echo "🔨 Building the project..."
yarn build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Project built successfully"

# Start the application
echo "🚀 Starting Cursor Mobile Backend..."
echo "📱 WebSocket will be available at ws://0.0.0.0:3001/mobile"
echo "🔧 API will be available at http://0.0.0.0:3001"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

yarn start:prod
