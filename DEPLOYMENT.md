# GUARD Reporting Platform Deployment Guide

This guide provides instructions for deploying the GUARD Reporting Platform to production.

## Prerequisites

- A server or cloud platform (e.g., AWS, Heroku, DigitalOcean)
- Domain name (optional, but recommended)
- SSL certificate (required for production)
- PostgreSQL database (recommended for production)

## Backend Deployment (Django)

### Option 1: Deploy to a VPS (e.g., DigitalOcean, AWS EC2)

1. **Set up a virtual environment:**

```bash
cd guard_reporting_project/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure production settings:**

Create a `.env` file in the backend directory with the following variables:

```
DEBUG=False
SECRET_KEY=your_secure_secret_key
ALLOWED_HOSTS=your_domain.com,www.your_domain.com
DATABASE_URL=postgres://username:password@host:port/database_name
```

3. **Set up Gunicorn and Nginx:**

Install Nginx on your server and create a configuration file for your Django app.

Create a systemd service file for Gunicorn:

```
[Unit]
Description=gunicorn daemon for GUARD API
After=network.target

[Service]
User=your_user
Group=www-data
WorkingDirectory=/path/to/guard_reporting_project/backend
ExecStart=/path/to/guard_reporting_project/backend/venv/bin/gunicorn --workers 3 --bind unix:/path/to/guard_api.sock guard_api.wsgi:application

[Install]
WantedBy=multi-user.target
```

4. **Configure Nginx:**

```
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /path/to/guard_reporting_project/backend;
    }

    location /api {
        include proxy_params;
        proxy_pass http://unix:/path/to/guard_api.sock;
    }
    
    location /admin {
        include proxy_params;
        proxy_pass http://unix:/path/to/guard_api.sock;
    }
}
```

5. **Set up SSL with Let's Encrypt:**

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com -d www.your_domain.com
```

6. **Collect static files and run migrations:**

```bash
python manage.py collectstatic
python manage.py migrate
```

7. **Create a superuser:**

```bash
python manage.py createsuperuser
```

8. **Start the services:**

```bash
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
sudo systemctl restart nginx
```

### Option 2: Deploy to Heroku

1. **Install the Heroku CLI and create a new app:**

```bash
heroku create guard-reporting-api
```

2. **Create a Procfile in the backend directory:**

```
web: gunicorn guard_api.wsgi --log-file -
```

3. **Add the PostgreSQL add-on:**

```bash
heroku addons:create heroku-postgresql:hobby-dev
```

4. **Configure environment variables:**

```bash
heroku config:set SECRET_KEY=your_secure_secret_key
heroku config:set DEBUG=False
heroku config:set ALLOWED_HOSTS=your-app-name.herokuapp.com
```

5. **Deploy the application:**

```bash
git subtree push --prefix guard_reporting_project/backend heroku main
```

6. **Run migrations and create a superuser:**

```bash
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```

## Frontend Deployment (React)

### Option 1: Deploy to a static hosting service (e.g., Netlify, Vercel)

1. **Build the React app:**

```bash
cd guard_reporting_project/frontend
npm install
npm run build
```

2. **Configure the API endpoint:**

Create a `.env` file in the frontend directory:

```
REACT_APP_API_URL=https://your-api-domain.com/api
```

3. **Deploy to Netlify:**

Install the Netlify CLI:

```bash
npm install -g netlify-cli
netlify init
netlify deploy --prod
```

### Option 2: Serve the React app from the same server as the Django backend

1. **Build the React app:**

```bash
cd guard_reporting_project/frontend
npm install
npm run build
```

2. **Copy the build files to the server:**

```bash
scp -r build/* user@your_server:/path/to/react/app
```

3. **Configure Nginx to serve the React app:**

```
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /path/to/guard_reporting_project/backend;
    }

    location /api {
        include proxy_params;
        proxy_pass http://unix:/path/to/guard_api.sock;
    }
    
    location /admin {
        include proxy_params;
        proxy_pass http://unix:/path/to/guard_api.sock;
    }
    
    location / {
        root /path/to/react/app;
        try_files $uri $uri/ /index.html;
    }
}
```

4. **Restart Nginx:**

```bash
sudo systemctl restart nginx
```

## Continuous Deployment

For a more automated deployment workflow, consider setting up a CI/CD pipeline using GitHub Actions, GitLab CI, or Jenkins.

### Example GitHub Actions workflow:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        cd guard_reporting_project/backend
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        cd guard_reporting_project/backend
        python manage.py test
    
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install frontend dependencies
      run: |
        cd guard_reporting_project/frontend
        npm install
    
    - name: Build frontend
      run: |
        cd guard_reporting_project/frontend
        npm run build
    
    - name: Deploy to Heroku (backend)
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: "guard-reporting-api"
        heroku_email: ${{ secrets.HEROKU_EMAIL }}
        appdir: "guard_reporting_project/backend"
    
    - name: Deploy to Netlify (frontend)
      uses: nwtgck/actions-netlify@v1.2
      with:
        publish-dir: './guard_reporting_project/frontend/build'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions"
        netlify-config-path: ./netlify.toml
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Post-Deployment Tasks

1. Set up regular database backups
2. Configure monitoring tools (e.g., Sentry, New Relic)
3. Set up a security scanner to regularly check for vulnerabilities
4. Configure analytics (e.g., Google Analytics, Plausible)
5. Set up a Content Security Policy (CSP) 