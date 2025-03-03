# Deploying the GUARD Reporting Platform to DigitalOcean

This guide provides step-by-step instructions for deploying the GUARD Reporting Platform to DigitalOcean.

## Step 1: Create a DigitalOcean Account

If you don't already have a DigitalOcean account, sign up at [https://www.digitalocean.com/](https://www.digitalocean.com/).

## Step 2: Create a Droplet

1. Log in to your DigitalOcean account and click on "Create" > "Droplets".
2. Choose an image: Select Ubuntu 22.04 LTS x64.
3. Choose a plan: For a small to medium workload, the Basic $12/month (2GB RAM / 1 CPU) plan should be sufficient.
4. Choose a datacenter region close to your target audience.
5. Add SSH keys (recommended) or choose password authentication.
6. Choose a hostname (e.g., guard-reporting-app).
7. Click "Create Droplet".

## Step 3: Connect to Your Droplet

After your droplet is created, you'll get an IP address. Connect to it via SSH:

```bash
ssh root@your_droplet_ip
```

## Step 4: Prepare the Deployment Script

1. Edit the `deploy_to_digitalocean.sh` script in the project root directory.
2. Update the following variables at the top of the script:
   - `DROPLET_IP`: Set to your DigitalOcean droplet's IP address
   - `SSH_USER`: Usually "root" for a new droplet
   - `PROJECT_DIR`: The directory where you want to deploy the app on the server
   - `DOMAIN`: If you have a domain name to use (optional)

3. If you're using a database password other than the default in the script, update the PostgreSQL command in the script that creates the database user.

## Step 5: Run the Deployment Script

From your local machine, in the project root directory, make the script executable and run it:

```bash
chmod +x deploy_to_digitalocean.sh
./deploy_to_digitalocean.sh
```

This script will:
- Build the React frontend
- Upload files to your DigitalOcean droplet
- Set up the server environment (install required packages)
- Configure PostgreSQL database
- Set up Nginx as a web server
- Configure Gunicorn to run the Flask application
- Start all required services

## Step 6: Configure DNS (Optional)

If you have a domain name and want to use it for your application:

1. Go to your domain registrar's website.
2. Update the DNS settings to point to your DigitalOcean droplet's IP address.
   - For the root domain (@): Create an A record pointing to your droplet's IP.
   - For the www subdomain: Create an A record or CNAME record.

It may take up to 48 hours for DNS changes to propagate globally.

## Step 7: Set Up SSL (Optional but Recommended)

The deployment script includes commented lines for setting up SSL with Let's Encrypt. To enable SSL:

1. SSH into your droplet.
2. Run the following commands:

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts from Certbot to set up SSL.

## Step 8: Post-Deployment Tasks

1. Set up regular database backups:
   ```bash
   apt-get install postgresql-client
   ```
   Create a backup script and set it up as a cron job.

2. Monitor your application:
   - Install and configure monitoring tools like Prometheus, Grafana, or use DigitalOcean's built-in monitoring.

3. Set up a firewall:
   ```bash
   ufw allow 22
   ufw allow 80
   ufw allow 443
   ufw enable
   ```

## Troubleshooting

1. **Application Not Loading**: Check Nginx and Gunicorn logs:
   ```bash
   cat /var/log/nginx/error.log
   journalctl -u gunicorn
   ```

2. **Database Errors**: Check PostgreSQL logs:
   ```bash
   cat /var/log/postgresql/postgresql-14-main.log
   ```

3. **Permission Issues**: Make sure file permissions are set correctly:
   ```bash
   chown -R www-data:www-data /opt/guard_reporting_project
   ```

## Scaling (Future Considerations)

1. **Vertical Scaling**: Increase the droplet size if you need more resources.
2. **Horizontal Scaling**: Set up multiple droplets and a load balancer.
3. **Database Scaling**: Consider using a managed database service like DigitalOcean Managed Databases.

## Contact & Support

If you encounter issues with deployment, please contact the GUARD technical team at support@example.com. 