#!/bin/bash

# VPS Setup Script for Discord Bot
# Run this on your VPS as root or with sudo

echo "🚀 Starting VPS Setup..."

# 1. Update System
echo "🔄 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js (v18 or later)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install MongoDB
echo "🍃 Installing MongoDB..."
sudo apt install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# 4. Install PM2 (Process Manager)
echo "⚙️ Installing PM2..."
sudo npm install -g pm2

# 5. Setup Bot
echo "🤖 Setting up Bot..."
# Assuming files are already uploaded to current directory
npm install

# 6. Start Bot
echo "▶️ Starting Bot with PM2..."
pm2 start index.js --name "discord-bot"
pm2 save
pm2 startup

echo "✅ Deployment Complete! Your bot should be online."
echo "Use 'pm2 logs' to see the bot logs."
