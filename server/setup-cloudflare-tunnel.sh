#!/bin/bash

# Cloudflare Tunnel Setup for Library Management System Backend
# This gives you FREE HTTPS without needing a domain!

echo "=== Cloudflare Tunnel Setup (FREE HTTPS) ==="
echo ""
echo "This will give your backend a free HTTPS URL like:"
echo "https://random-name.trycloudflare.com"
echo ""

# Detect system architecture
ARCH=$(uname -m)
case $ARCH in
    x86_64)
        CLOUDFLARED_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
        ;;
    aarch64|arm64)
        CLOUDFLARED_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64"
        ;;
    *)
        echo "Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

echo "Step 1: Downloading cloudflared..."
wget -O cloudflared $CLOUDFLARED_URL
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

echo "Step 2: Creating tunnel configuration..."
cat > cloudflared-config.yml <<EOF
tunnel: auto
credentials-file: /tmp/tunnel.json
ingress:
  - service: http://localhost:4000
EOF

echo "Step 3: Creating systemd service..."
sudo tee /etc/systemd/system/cloudflared-tunnel.service > /dev/null <<EOF
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/local/bin/cloudflared tunnel --no-autoupdate --url http://localhost:4000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "Step 4: Starting Cloudflare Tunnel..."
sudo systemctl daemon-reload
sudo systemctl enable cloudflared-tunnel
sudo systemctl start cloudflared-tunnel

echo ""
echo "Waiting for tunnel to start (10 seconds)..."
sleep 10

echo ""
echo "=== Getting your HTTPS URL ==="
sudo journalctl -u cloudflared-tunnel -n 50 | grep -i "https://" | tail -1

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Your tunnel is running! To see your HTTPS URL, run:"
echo "  sudo journalctl -u cloudflared-tunnel -f | grep 'https://'"
echo ""
echo "Look for a line like: https://random-name.trycloudflare.com"
echo ""
echo "Next steps:"
echo "1. Copy the HTTPS URL from the logs"
echo "2. Update Vercel VITE_API_URL to: https://your-url.trycloudflare.com/api/v1"
echo "3. Update backend config.env FRONTEND_URL to your Vercel URL"
echo "4. Restart backend: pm2 restart all"
echo ""
echo "To view logs: sudo journalctl -u cloudflared-tunnel -f"
echo "To stop: sudo systemctl stop cloudflared-tunnel"
echo "To restart: sudo systemctl restart cloudflared-tunnel"
echo ""




