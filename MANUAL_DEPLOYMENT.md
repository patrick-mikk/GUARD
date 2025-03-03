# Manual Deployment Guide for GUARD Reporting Platform

This guide provides step-by-step instructions for manually deploying the GUARD Reporting Platform to your DigitalOcean environment.

## Your Environment Details

- **Droplet IP**: 209.38.0.26
- **Droplet User**: root
- **Managed Database**:
  - Host: guarddb-do-user-19424359-0.e.db.ondigitalocean.com
  - Port: 25060
  - Username: doadmin
  - Password: YOUR_DB_PASSWORD
  - Database: defaultdb
  - SSL Mode: REQUIRED

## Step 1: Build the Frontend

On your local machine, navigate to the project's frontend directory and build the React application:

```bash
cd guard_reporting_project/frontend
npm install
npm run build
```

## Step 2: Connect to Your Droplet

```bash
ssh root@209.38.0.26
# Enter your password when prompted
```

## Step 3: Prepare the Server

Once connected to the server, run the following commands:

```bash
# Update the system
apt-get update && apt-get upgrade -y

# Install required packages
apt-get install -y python3-pip python3-venv nginx

# Create directory for the application
mkdir -p /opt/guard_reporting_project
```

## Step 4: Upload the Application Files

Open a new terminal window on your local machine (keep the SSH session open in the first terminal).

```bash
# Navigate to the project directory
cd guard_reporting_project

# Upload the files
# You'll be prompted for your password
scp -r * root@209.38.0.26:/opt/guard_reporting_project/
```

## Step 5: Configure the Backend

Switch back to the SSH session and run:

```bash
# Navigate to the backend directory
cd /opt/guard_reporting_project/backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create the environment file
cat > .env << 'EOF'
DEBUG=False
SECRET_KEY=your_production_secret_key
ALLOWED_HOSTS=209.38.0.26,your-domain.com
DATABASE_URL=postgresql://doadmin:YOUR_DB_PASSWORD@guarddb-do-user-19424359-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require
EOF
```

## Step 6: Configure Nginx

```bash
# Create Nginx configuration
cat > /etc/nginx/sites-available/guard_app << 'EOF'
server {
    listen 80;
    server_name 209.38.0.26;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /opt/guard_reporting_project/backend;
    }

    location /api {
        include proxy_params;
        proxy_pass http://127.0.0.1:8000;
    }
    
    location / {
        root /opt/guard_reporting_project/frontend/build;
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Create symbolic link
ln -s /etc/nginx/sites-available/guard_app /etc/nginx/sites-enabled/

# Remove default site if it exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi
```

## Step 7: Set Up Gunicorn Service

```bash
# Create Gunicorn systemd service
cat > /etc/systemd/system/gunicorn.service << 'EOF'
[Unit]
Description=gunicorn daemon for GUARD API
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/guard_reporting_project/backend
ExecStart=/opt/guard_reporting_project/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 app:app

[Install]
WantedBy=multi-user.target
EOF
```

## Step 8: Set Permissions and Start Services

```bash
# Set proper permissions
chown -R www-data:www-data /opt/guard_reporting_project

# Reload systemd, enable and start Gunicorn
systemctl daemon-reload
systemctl enable gunicorn
systemctl start gunicorn

# Test and restart Nginx
nginx -t
systemctl restart nginx

# Set up basic firewall
apt-get install -y ufw
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable
```

## Step 9: Verify the Deployment

Visit your application at:
- http://209.38.0.26

If everything is working correctly, you should see the GUARD Reporting Platform frontend.

## Troubleshooting

If you encounter any issues:

1. **Check Gunicorn logs**:
   ```bash
   journalctl -u gunicorn --since "1 hour ago"
   ```

2. **Check Nginx logs**:
   ```bash
   cat /var/log/nginx/error.log
   ```

3. **Check if Gunicorn is running**:
   ```bash
   systemctl status gunicorn
   ```

4. **Check if the database connection works**:
   ```bash
   apt-get install -y postgresql-client
   psql "postgresql://doadmin:YOUR_DB_PASSWORD@guarddb-do-user-19424359-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require" -c "SELECT 1;"
   ```

## Security Reminder

After your deployment is working:
1. Consider changing your root password
2. Set up SSH key-based authentication
3. Remove credentials from all configuration files
4. Consider setting up a domain name and SSL 