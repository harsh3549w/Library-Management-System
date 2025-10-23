#!/bin/bash

# ngrok Setup for Library Management System Backend
# Quick HTTPS tunnel (FREE tier available)

echo "=== ngrok Setup for HTTPS ==="
echo ""

# Check if already installed
if command -v ngrok &> /dev/null; then
    echo "ngrok is already installed!"
else
    echo "Step 1: Installing ngrok..."
    
    # Download ngrok
    wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
    tar xvzf ngrok-v3-stable-linux-amd64.tgz
    sudo mv ngrok /usr/local/bin/
    rm ngrok-v3-stable-linux-amd64.tgz
    
    echo "✓ ngrok installed"
fi

echo ""
echo "Step 2: Authentication"
echo ""
echo "You need a FREE ngrok account to get an authtoken."
echo ""
echo "1. Go to: https://dashboard.ngrok.com/signup"
echo "2. Sign up (free)"
echo "3. Copy your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken"
echo ""
read -p "Enter your ngrok authtoken: " AUTHTOKEN

if [ -z "$AUTHTOKEN" ]; then
    echo "No authtoken provided. Exiting..."
    exit 1
fi

ngrok config add-authtoken $AUTHTOKEN

echo ""
echo "Step 3: Creating systemd service..."

sudo tee /etc/systemd/system/ngrok.service > /dev/null <<EOF
[Unit]
Description=ngrok HTTPS tunnel
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/local/bin/ngrok http 4000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ngrok
sudo systemctl start ngrok

echo ""
echo "Waiting for ngrok to start..."
sleep 5

echo ""
echo "=== Getting your HTTPS URL ==="
echo ""

# Try to get URL from ngrok API
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | grep -o 'https://[^"]*' | head -1)

if [ -n "$NGROK_URL" ]; then
    echo "Your HTTPS URL is: $NGROK_URL"
else
    echo "Couldn't automatically detect URL. Please run:"
    echo "  curl -s http://localhost:4040/api/tunnels | grep public_url"
fi

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "📱 ngrok Web Interface: http://localhost:4040"
echo ""
echo "Next steps:"
echo "1. Get your HTTPS URL from: http://localhost:4040"
echo "2. Update Vercel VITE_API_URL to: YOUR_NGROK_URL/api/v1"
echo "3. Restart when needed: sudo systemctl restart ngrok"
echo ""
echo "⚠️  FREE TIER NOTES:"
echo "- URL changes every time you restart ngrok"
echo "- Sessions expire after 8 hours"
echo "- For a permanent URL, upgrade to ngrok Pro ($8/mo)"
echo ""




