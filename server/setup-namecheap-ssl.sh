#!/bin/bash

# Setup Script for Namecheap PositiveSSL Certificate
# This is MORE COMPLEX than Let's Encrypt - only use if you specifically want Namecheap SSL

echo "=== Namecheap PositiveSSL Setup ==="
echo ""
echo "⚠️  WARNING: This is more complex than Let's Encrypt!"
echo "You need to:"
echo "1. Generate a CSR (Certificate Signing Request)"
echo "2. Submit CSR to Namecheap"
echo "3. Verify domain ownership"
echo "4. Download certificate files"
echo "5. Install on NGINX"
echo "6. Manually renew every year"
echo ""
echo "Let's Encrypt does all this automatically!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONTINUE

if [ "$CONTINUE" != "yes" ]; then
    echo "Exiting... Consider using setup-nginx-ssl.sh instead (uses Let's Encrypt)"
    exit 0
fi

read -p "Enter your domain name (e.g., api.yourdomain.me): " DOMAIN_NAME

if [ -z "$DOMAIN_NAME" ]; then
    echo "Error: Domain name is required!"
    exit 1
fi

echo ""
echo "Step 1: Installing NGINX..."
sudo apt update
sudo apt install -y nginx

echo ""
echo "Step 2: Creating SSL directory..."
sudo mkdir -p /etc/nginx/ssl
cd /etc/nginx/ssl

echo ""
echo "Step 3: Generating Private Key and CSR..."
sudo openssl req -new -newkey rsa:2048 -nodes \
    -keyout $DOMAIN_NAME.key \
    -out $DOMAIN_NAME.csr \
    -subj "/C=IN/ST=YourState/L=YourCity/O=YourOrg/CN=$DOMAIN_NAME"

echo ""
echo "=== IMPORTANT: Copy this CSR ==="
echo ""
sudo cat $DOMAIN_NAME.csr
echo ""
echo "=== End of CSR ==="
echo ""

echo "Step 4: Activate SSL on Namecheap:"
echo ""
echo "1. Go to: https://ap.www.namecheap.com/Domains/SslCertificateList"
echo "2. Click 'Activate' next to your PositiveSSL"
echo "3. Paste the CSR above"
echo "4. Complete domain verification (email or DNS)"
echo "5. Download the certificate files (you'll get a .crt and .ca-bundle)"
echo ""
echo "Step 5: Upload certificate files to this server:"
echo "   /etc/nginx/ssl/$DOMAIN_NAME.crt"
echo "   /etc/nginx/ssl/$DOMAIN_NAME.ca-bundle"
echo ""
echo "Step 6: Create NGINX configuration:"

sudo tee /etc/nginx/sites-available/library-backend > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN_NAME;

    ssl_certificate /etc/nginx/ssl/$DOMAIN_NAME.crt;
    ssl_certificate_key /etc/nginx/ssl/$DOMAIN_NAME.key;
    
    # Optional: Include CA bundle
    # ssl_trusted_certificate /etc/nginx/ssl/$DOMAIN_NAME.ca-bundle;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

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

sudo ln -sf /etc/nginx/sites-available/library-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

echo ""
echo "=== Next Steps (MANUAL) ==="
echo ""
echo "1. Complete SSL activation on Namecheap"
echo "2. Download the certificate files (.crt and .ca-bundle)"
echo "3. Upload them to this server:"
echo "   sudo nano /etc/nginx/ssl/$DOMAIN_NAME.crt"
echo "   (Paste certificate content)"
echo ""
echo "   sudo nano /etc/nginx/ssl/$DOMAIN_NAME.ca-bundle"
echo "   (Paste CA bundle content)"
echo ""
echo "4. Test NGINX config: sudo nginx -t"
echo "5. Start NGINX: sudo systemctl start nginx"
echo "6. Enable on boot: sudo systemctl enable nginx"
echo ""
echo "⚠️  Remember: You need to manually renew this certificate every year!"
echo ""
echo "Private key location: /etc/nginx/ssl/$DOMAIN_NAME.key"
echo "Keep this file secure!"
echo ""




