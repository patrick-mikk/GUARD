#!/bin/bash

# GUARD Reporting App - DigitalOcean deployment script
# Variables are set to use the existing Droplet and database
DROPLET_IP="209.38.0.26"
SSH_USER="root"
# SSH_PASSWORD="YOUR_PASSWORD"  # For security, don't store passwords in scripts
PROJECT_DIR="/opt/guard_reporting_project"
DOMAIN="" # Set this if you have a domain

echo "=== Deploying GUARD Reporting App to DigitalOcean ==="

# Build the React frontend
echo "Building React frontend..."
cd frontend
npm install
npm run build
cd ..

# Upload files to server
echo "Uploading files to $DROPLET_IP..."
# If you don't have SSH keys set up, you'll be prompted for a password
rsync -avz --exclude 'node_modules' --exclude 'venv' --exclude '.git' ./ $SSH_USER@$DROPLET_IP:$PROJECT_DIR

# Connect to the server and set up the environment
echo "Setting up the server environment..."
ssh $SSH_USER@$DROPLET_IP << 'EOF'
    # Update system and install dependencies
    apt-get update && apt-get upgrade -y
    apt-get install -y python3-pip python3-venv nginx

    # Set up backend
    cd $PROJECT_DIR/backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cp .env.production .env
    
    # Set up Nginx
    cat > /etc/nginx/sites-available/guard_app << 'NGINX'
server {
    listen 80;
    server_name $DOMAIN 209.38.0.26;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root $PROJECT_DIR/backend;
    }

    location /api {
        include proxy_params;
        proxy_pass http://127.0.0.1:8000;
    }
    
    location / {
        root $PROJECT_DIR/frontend/build;
        try_files $uri $uri/ /index.html;
    }
}
NGINX

    ln -s /etc/nginx/sites-available/guard_app /etc/nginx/sites-enabled/
    # Only remove default if it exists
    if [ -f /etc/nginx/sites-enabled/default ]; then
        rm /etc/nginx/sites-enabled/default
    fi
    
    # Set up gunicorn service
    cat > /etc/systemd/system/gunicorn.service << 'GUNICORN'
[Unit]
Description=gunicorn daemon for GUARD API
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=$PROJECT_DIR/backend
ExecStart=$PROJECT_DIR/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 app:app

[Install]
WantedBy=multi-user.target
GUNICORN

    # Ensure proper permissions
    chown -R www-data:www-data $PROJECT_DIR
    
    # Start the services
    systemctl daemon-reload
    systemctl enable gunicorn
    systemctl start gunicorn
    systemctl restart nginx
    
    # Optional: Set up SSL with Let's Encrypt (if you have a domain)
    # apt-get install -y certbot python3-certbot-nginx
    # certbot --nginx -d $DOMAIN
    
    # Basic firewall setup
    apt-get install -y ufw
    ufw allow 22
    ufw allow 80
    ufw allow 443
    ufw --force enable
EOF

echo "=== Deployment completed! ==="
echo "Your app should be live at http://$DROPLET_IP"
if [ ! -z "$DOMAIN" ]; then
    echo "or at http://$DOMAIN (once DNS is configured)"
fi 