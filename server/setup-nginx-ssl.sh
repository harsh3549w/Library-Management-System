#!/bin/bash

# Setup Script for Library Management System Backend with NGINX + SSL
# This script sets up NGINX as a reverse proxy with SSL/TLS for your Node.js backend

echo "=== Library Management System - NGINX + SSL Setup ==="
echo ""
echo "Prerequisites:"
echo "1. You must have a domain name pointing to this server's IP"
echo "2. Ports 80 and 443 must be open in your EC2 Security Group"
echo ""
read -p "Enter your domain name (e.g., api.yourdomain.com): " DOMAIN_NAME
read -p "Enter your email for Let's Encrypt: " EMAIL

if [ -z "$DOMAIN_NAME" ] || [ -z "$EMAIL" ]; then
    echo "Error: Domain name and email are required!"
    exit 1
fi

echo ""
echo "Setting up NGINX and SSL for domain: $DOMAIN_NAME"
echo ""

# Update system
echo "Step 1: Updating system packages..."
sudo apt update

# Install NGINX
echo "Step 2: Installing NGINX..."
sudo apt install -y nginx

# Install Certbot for Let's Encrypt
echo "Step 3: Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Stop NGINX temporarily
sudo systemctl stop nginx

# Create NGINX configuration
echo "Step 4: Creating NGINX configuration..."
sudo tee /etc/nginx/sites-available/library-backend > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN_NAME;

    # SSL certificates will be added by Certbot

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/library-backend /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test NGINX configuration
echo "Step 5: Testing NGINX configuration..."
sudo nginx -t

# Start NGINX
echo "Step 6: Starting NGINX..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Obtain SSL certificate
echo "Step 7: Obtaining SSL certificate from Let's Encrypt..."
sudo certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos -m $EMAIL --redirect

# Set up auto-renewal
echo "Step 8: Setting up SSL certificate auto-renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test auto-renewal
sudo certbot renew --dry-run

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Your backend is now accessible at: https://$DOMAIN_NAME"
echo ""
echo "Next steps:"
echo "1. Update your Vercel environment variable VITE_API_URL to: https://$DOMAIN_NAME/api/v1"
echo "2. Update your backend's FRONTEND_URL in config.env to your Vercel URL"
echo "3. Restart your backend: pm2 restart all"
echo ""
echo "SSL certificate will auto-renew every 90 days."
echo ""




