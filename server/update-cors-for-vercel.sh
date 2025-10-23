#!/bin/bash

# Quick script to update CORS settings for Vercel frontend

echo "=== Updating CORS for Vercel Frontend ==="
echo ""

# Check if config.env exists
if [ ! -f "config/config.env" ]; then
    echo "Error: config/config.env not found!"
    echo "Please make sure you're in the server directory"
    exit 1
fi

# Update FRONTEND_URL
echo "Updating FRONTEND_URL in config.env..."

# Backup original config
cp config/config.env config/config.env.backup

# Update or add FRONTEND_URL
if grep -q "^FRONTEND_URL=" config/config.env; then
    # Replace existing
    sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=https://library-management-system-gamma-sable.vercel.app|' config/config.env
else
    # Add new
    echo "" >> config/config.env
    echo "FRONTEND_URL=https://library-management-system-gamma-sable.vercel.app" >> config/config.env
fi

echo "✓ Updated FRONTEND_URL"
echo ""
echo "Restarting backend server..."

# Check if pm2 is running the app
if pm2 list | grep -q "online"; then
    pm2 restart all
    echo "✓ PM2 processes restarted"
else
    echo "PM2 not running. Please start your server manually:"
    echo "  pm2 start ecosystem.config.js"
fi

echo ""
echo "=== CORS Update Complete! ==="
echo ""
echo "⚠️  IMPORTANT: This does NOT fix the HTTPS issue!"
echo ""
echo "You still need to set up HTTPS on your backend."
echo "See HTTPS_SETUP_GUIDE.md for instructions."
echo ""




