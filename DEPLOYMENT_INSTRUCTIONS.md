# GUARD Reporting Platform Deployment Instructions

These instructions are tailored for deploying to your specific DigitalOcean environment.

## Prerequisites

You already have:
- A DigitalOcean Droplet at IP: 209.38.0.26
- A DigitalOcean Managed Database (PostgreSQL)

## Deployment Steps

### 1. Run the Deployment Script

From your local machine, navigate to the project directory and run:

```bash
# Make the script executable
chmod +x deploy_to_digitalocean.sh

# Run it
./deploy_to_digitalocean.sh
```

The script will:
- Build the React frontend
- Upload all files to your Droplet
- Configure Nginx and Gunicorn
- Start all necessary services

### 2. Verify Deployment

Once the script completes, visit:
- http://209.38.0.26

You should see the GUARD Reporting Platform frontend.

### 3. Securing Your Deployment

After confirming everything works:

1. **Remove credentials from scripts**:
   Edit all configuration files to remove any passwords or sensitive information.

2. **Set up SSH keys** for more secure access:
   ```bash
   # Generate SSH key on your local machine (if you don't have one)
   ssh-keygen -t rsa
   
   # Copy your public key to the server
   ssh-copy-id root@209.38.0.26
   ```

3. **Consider setting up a domain name and SSL**:
   If you have a domain, you can set it up by:
   - Adding DNS records pointing to 209.38.0.26
   - Updating the DOMAIN variable in the deployment script
   - Running the commented SSL commands in the script

### 4. Maintenance

1. **Monitor your application**:
   - Check logs: `journalctl -u gunicorn`, `cat /var/log/nginx/error.log`
   - Set up monitoring via DigitalOcean dashboard

2. **Backup your database**:
   - Use DigitalOcean's managed database backup features
   - Set up automated backups in the database control panel

3. **Updates and changes**:
   - For code updates, simply run the deployment script again
   - For database schema changes, SSH into the server and run migrations manually

### Troubleshooting

If you encounter issues:

1. **Check application logs**:
   ```bash
   ssh root@209.38.0.26
   journalctl -u gunicorn --since "1 hour ago"
   ```

2. **Check Nginx logs**:
   ```bash
   ssh root@209.38.0.26
   cat /var/log/nginx/error.log
   ```

3. **Restart services**:
   ```bash
   ssh root@209.38.0.26
   systemctl restart gunicorn
   systemctl restart nginx
   ```

## Important Security Notice

After deployment:
1. Remove all credentials from scripts and configuration files
2. Consider changing passwords for additional security
3. Set up SSH keys to avoid password-based authentication 