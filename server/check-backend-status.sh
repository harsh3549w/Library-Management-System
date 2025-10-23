#!/bin/bash

# Script to check if Library Management System backend is running

echo "=== Library Management System Backend Status Check ==="
echo ""

# Check 1: PM2 Process Status
echo "1️⃣  Checking PM2 processes..."
if command -v pm2 &> /dev/null; then
    pm2 list
    echo ""
else
    echo "⚠️  PM2 not installed"
    echo ""
fi

# Check 2: Port 4000 Status
echo "2️⃣  Checking if port 4000 is in use..."
if sudo lsof -i :4000 &> /dev/null; then
    echo "✅ Port 4000 is ACTIVE"
    sudo lsof -i :4000
else
    echo "❌ Port 4000 is NOT in use (backend not running)"
fi
echo ""

# Check 3: Node Process
echo "3️⃣  Checking Node.js processes..."
if pgrep -f "node.*server.js\|node.*app.js" > /dev/null; then
    echo "✅ Node backend process found:"
    ps aux | grep -E "node.*server.js|node.*app.js" | grep -v grep
else
    echo "❌ No Node backend process found"
fi
echo ""

# Check 4: API Health Check
echo "4️⃣  Testing API endpoint..."
if curl -s http://localhost:4000/api/v1 > /dev/null 2>&1; then
    echo "✅ API is responding!"
    curl -s http://localhost:4000/api/v1 | head -n 5
else
    echo "❌ API is NOT responding"
fi
echo ""

# Check 5: PM2 Logs (last 20 lines)
echo "5️⃣  Recent PM2 logs..."
if command -v pm2 &> /dev/null; then
    pm2 logs --lines 20 --nostream
else
    echo "PM2 not available"
fi
echo ""

echo "=== Status Check Complete ==="
echo ""
echo "Quick Commands:"
echo "  View live logs: pm2 logs"
echo "  Restart backend: pm2 restart all"
echo "  Stop backend: pm2 stop all"
echo "  Start backend: pm2 start ecosystem.config.js"
echo ""




