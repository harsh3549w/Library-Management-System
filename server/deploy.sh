#!/bin/bash

# AWS Deployment Script for Library Management System
# Run this script on your EC2 instance after cloning the repository

echo "🚀 Starting AWS deployment for Library Management System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root. Use a regular user with sudo privileges."
    exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
print_status "Installing PM2..."
sudo npm install -g pm2

# Install Nginx
print_status "Installing Nginx..."
sudo apt install nginx -y

# Install Git (if not already installed)
print_status "Installing Git..."
sudo apt install git -y

# Navigate to server directory
print_status "Setting up application..."
cd /home/ubuntu/Library-Management-System/server

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install

# Create logs directory
print_status "Creating logs directory..."
mkdir -p logs

# Set up environment variables
print_status "Setting up environment variables..."
if [ ! -f "config/config.env" ]; then
    if [ -f "config/config.prod.env.template" ]; then
        cp config/config.prod.env.template config/config.env
        print_warning "Please edit config/config.env with your actual values:"
        print_warning "nano config/config.env"
    else
        print_error "Environment template not found. Please create config/config.env manually."
    fi
fi

# Create Nginx configuration
print_status "Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/library-management > /dev/null <<EOF
server {
    listen 80;
    server_name _;  # Replace with your domain or EC2 public IP

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

# Enable Nginx site
print_status "Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/library-management /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    print_status "Nginx configuration is valid. Restarting Nginx..."
    sudo systemctl restart nginx
    sudo systemctl enable nginx
else
    print_error "Nginx configuration test failed. Please check the configuration."
fi

# Configure firewall
print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Start application with PM2
print_status "Starting application with PM2..."
npm run pm2:start

# Configure PM2 auto-start
print_status "Configuring PM2 auto-start..."
pm2 save
pm2 startup

print_status "✅ Deployment script completed!"
print_warning "Next steps:"
print_warning "1. Edit config/config.env with your actual values"
print_warning "2. Run: pm2 restart library-management-api"
print_warning "3. Test your application: curl http://localhost:4000/health"
print_warning "4. Check PM2 status: pm2 status"
print_warning "5. View logs: pm2 logs library-management-api"

echo ""
print_status "🎉 Your Library Management System backend is now deployed on AWS!"
print_status "Access your API at: http://your-ec2-ip"
print_status "Health check: http://your-ec2-ip/health"






