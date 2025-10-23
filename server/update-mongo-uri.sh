#!/bin/bash

# Quick script to update MongoDB URI to use MERN_STACK_LIBRARY_MANAGEMENT database
# Run this on your AWS EC2 instance

echo "🔄 Updating MongoDB URI to use MERN_STACK_LIBRARY_MANAGEMENT database..."

CONFIG_FILE="config/config.env"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Error: $CONFIG_FILE not found!"
    exit 1
fi

# Backup the original file
cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup created"

# Update the MONGO_URI line
# This adds /MERN_STACK_LIBRARY_MANAGEMENT before the query parameters
sed -i 's|mongodb+srv://\([^/]*\)/\??\(.*\)|mongodb+srv://\1/MERN_STACK_LIBRARY_MANAGEMENT?\2|g' "$CONFIG_FILE"

echo "✅ MongoDB URI updated"

# Show the updated line
echo ""
echo "Updated MONGO_URI:"
grep "MONGO_URI=" "$CONFIG_FILE"
echo ""

# Ask to restart PM2
read -p "Do you want to restart PM2 now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🔄 Restarting PM2..."
    pm2 restart library-management-api
    echo ""
    echo "✅ PM2 restarted!"
    echo ""
    echo "📊 PM2 Status:"
    pm2 status
    echo ""
    echo "📝 Checking logs (Ctrl+C to exit)..."
    sleep 2
    pm2 logs library-management-api --lines 20
else
    echo "⏭️  Skipped PM2 restart. Remember to restart manually with:"
    echo "   pm2 restart library-management-api"
fi

