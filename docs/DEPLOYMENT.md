# Deployment Guide

This guide covers deploying Pi Docs to production. Since you're using Hostinger for your domain, we'll cover multiple deployment strategies from easiest to most advanced.

## Table of Contents

1. [Recommended: Easiest Setup](#recommended-easiest-setup)
2. [Alternative: Render Deployment](#alternative-render-deployment)
3. [Hostinger Static Hosting](#hostinger-static-hosting)
4. [Advanced: AWS Deployment](#advanced-aws-deployment)
5. [Domain Configuration](#domain-configuration)
6. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Recommended: Easiest Setup

**Best for**: Quick deployment, minimal configuration, free tier available

### Architecture
- **Frontend**: Vercel (automatic deployments, CDN, free SSL)
- **Backend API**: Railway (includes PostgreSQL database)
- **Database**: Railway PostgreSQL (included)
- **Domain**: Hostinger (configured via DNS)

### Step 1: Deploy Database & Backend API (Railway)

1. **Sign up for Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub (recommended)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   - Select the repository

3. **Add PostgreSQL Database**
   - In your Railway project, click "+ New"
   - Select "Database" → "Add PostgreSQL"
   - Railway will automatically create a PostgreSQL database
   - Copy the connection string (you'll need this)

4. **Deploy API Backend**
   - In Railway project, click "+ New" → "GitHub Repo"
   - Select your repository
   - Railway will detect it's a Node.js project
   - Configure the service:
     - **Root Directory**: `apps/api`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Watch Paths**: `apps/api/**`

5. **Configure Environment Variables**
   - Go to your API service → "Variables" tab
   - Add these variables:
     ```bash
     PORT=3001
     NODE_ENV=production
     DATABASE_URL=<railway-postgres-connection-string>
     JWT_SECRET=<generate-strong-secret>
     CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
     FRONTEND_URL=https://yourdomain.com
     UPLOAD_DIR=./uploads
     SMTP_HOST=smtp.sendgrid.net
     SMTP_PORT=587
     SMTP_SECURE=false
     SMTP_USER=apikey
     SMTP_PASS=<your-sendgrid-api-key>
     SMTP_FROM=noreply@yourdomain.com
     ```
   - **Generate JWT_SECRET**:
     ```bash
     openssl rand -base64 32
     ```

6. **Run Database Migrations**
   - Railway provides a web terminal or you can use Railway CLI
   - In the API service, go to "Deployments" → Click on latest deployment → "View Logs"
   - Or use Railway CLI:
     ```bash
     # Install Railway CLI
     npm i -g @railway/cli
     
     # Login
     railway login
     
     # Link to your project
     railway link
     
     # Run migrations
     railway run npm run prisma:migrate deploy
     ```

7. **Get API URL**
   - Railway will provide a URL like: `https://your-api.up.railway.app`
   - Note this URL (you'll need it for frontend)

### Step 2: Deploy Frontend (Vercel)

1. **Sign up for Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure project:
     - **Framework Preset**: Next.js
     - **Root Directory**: `apps/web`
     - **Build Command**: `npm run build` (default)
     - **Output Directory**: `.next` (default, but Next.js handles this)

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add:
     ```bash
     NEXT_PUBLIC_API_BASE_URL=https://your-api.up.railway.app/api
     ```
   - Make sure to select "Production", "Preview", and "Development"

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - You'll get a URL like: `https://your-project.vercel.app`

### Step 3: Configure Domain (Hostinger)

See [Domain Configuration](#domain-configuration) section below.

---

## Alternative: Render Deployment

**Best for**: All-in-one platform, simpler than AWS

### Architecture
- **Frontend**: Render Static Site
- **Backend API**: Render Web Service
- **Database**: Render PostgreSQL

### Step 1: Deploy Database (Render PostgreSQL)

1. **Sign up for Render**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - Dashboard → "New +" → "PostgreSQL"
   - Name: `pi-docs-db`
   - Database: `pidocs`
   - Region: Choose closest to you
   - Plan: Free (or paid for production)
   - Click "Create Database"
   - Copy the "Internal Database URL" and "External Database URL"

### Step 2: Deploy Backend API (Render Web Service)

1. **Create Web Service**
   - Dashboard → "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `pi-docs-api`
     - **Region**: Same as database
     - **Branch**: `main` (or your main branch)
     - **Root Directory**: `apps/api`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`

2. **Environment Variables**
   ```bash
   PORT=10000
   NODE_ENV=production
   DATABASE_URL=<render-postgres-external-url>
   JWT_SECRET=<generate-strong-secret>
   CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   FRONTEND_URL=https://yourdomain.com
   UPLOAD_DIR=./uploads
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=<your-sendgrid-api-key>
   SMTP_FROM=noreply@yourdomain.com
   ```

3. **Run Migrations**
   - Use Render Shell (in service dashboard) or Render CLI:
     ```bash
     render run npm run prisma:migrate deploy
     ```

### Step 3: Deploy Frontend (Render Static Site)

1. **Create Static Site**
   - Dashboard → "New +" → "Static Site"
   - Connect repository
   - Configure:
     - **Name**: `pi-docs-web`
     - **Root Directory**: `apps/web`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `out` (Next.js static export)

2. **Environment Variables**
   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://pi-docs-api.onrender.com/api
   ```

---

## Hostinger Static Hosting

**Best for**: Using Hostinger's hosting services, cost-effective

### Architecture
- **Frontend**: Hostinger Static Hosting (or VPS)
- **Backend API**: Railway/Render (as above)
- **Database**: Railway/Render PostgreSQL

### Option A: Static Site on Hostinger

Since Next.js exports static files, you can host them on Hostinger:

1. **Build Frontend Locally**
   ```bash
   cd apps/web
   npm install
   npm run build
   ```
   - This creates an `out` directory with static files

2. **Upload to Hostinger**
   - Log into Hostinger hPanel
   - Go to File Manager
   - Navigate to `public_html` (or your domain folder)
   - Upload all files from `apps/web/out` directory
   - Ensure `index.html` is in the root

3. **Configure Environment Variables**
   - Since it's static, you need to set `NEXT_PUBLIC_API_BASE_URL` at build time
   - Build with:
     ```bash
     NEXT_PUBLIC_API_BASE_URL=https://your-api.up.railway.app/api npm run build
     ```

### Option B: Hostinger VPS (Advanced)

If you have Hostinger VPS, you can run both frontend and backend:

1. **SSH into VPS**
2. **Install Node.js and PostgreSQL**
3. **Clone repository**
4. **Set up PM2 for process management**
5. **Configure Nginx as reverse proxy**

See [Advanced Setup](#advanced-setup) section for details.

---

## Advanced: AWS Deployment

**Best for**: Enterprise scale, full control, existing AWS infrastructure

### Prerequisites
- AWS Account
- AWS CLI configured
- CDK CLI installed

### Step 1: Set Up AWS Infrastructure

1. **Install AWS CDK**
   ```bash
   npm install -g aws-cdk
   ```

2. **Configure AWS Credentials**
   ```bash
   aws configure
   ```

3. **Bootstrap CDK** (first time only)
   ```bash
   cd infrastructure
   cdk bootstrap
   ```

4. **Deploy Infrastructure**
   ```bash
   npm install
   npm run deploy
   ```

### Step 2: Deploy Backend (AWS Elastic Beanstalk or ECS)

#### Option A: Elastic Beanstalk (Easier)

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB**
   ```bash
   cd apps/api
   eb init -p node.js pi-docs-api --region us-east-1
   eb create pi-docs-api-prod
   ```

3. **Configure Environment Variables**
   - Use EB Console or `.ebextensions/environment.config`:
     ```yaml
     option_settings:
       aws:elasticbeanstalk:application:environment:
         NODE_ENV: production
         DATABASE_URL: <your-rds-url>
         JWT_SECRET: <your-secret>
         # ... other vars
     ```

#### Option B: ECS with Fargate (More Scalable)

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name pi-docs-api
   ```

2. **Build and Push Docker Image**
   ```bash
   docker build -t pi-docs-api .
   docker tag pi-docs-api:latest <account>.dkr.ecr.us-east-1.amazonaws.com/pi-docs-api:latest
   docker push <account>.dkr.ecr.us-east-1.amazonaws.com/pi-docs-api:latest
   ```

3. **Create ECS Task Definition and Service**
   - Use AWS Console or CDK

### Step 3: Deploy Frontend (S3 + CloudFront)

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://pi-docs-web --region us-east-1
   ```

2. **Build and Upload**
   ```bash
   cd apps/web
   npm run build
   aws s3 sync out/ s3://pi-docs-web --delete
   ```

3. **Configure CloudFront**
   - Create CloudFront distribution
   - Origin: S3 bucket
   - Enable HTTPS
   - Set up custom domain

---

## Domain Configuration

### Setting Up Hostinger Domain

1. **Get API URLs**
   - Backend API URL: `https://your-api.up.railway.app` (or Render URL)
   - Frontend URL: `https://your-project.vercel.app` (or Render URL)

2. **Configure DNS in Hostinger**
   - Log into Hostinger hPanel
   - Go to "Domains" → "DNS Zone Editor"
   - Add/Edit records:

   **For Frontend (Vercel/Render):**
   ```
   Type: CNAME
   Name: @ (or www)
   Value: cname.vercel-dns.com (Vercel) or your-render-url.onrender.com (Render)
   TTL: 3600
   ```

   **For API Subdomain:**
   ```
   Type: CNAME
   Name: api
   Value: your-api.up.railway.app (or your Render API URL)
   TTL: 3600
   ```

3. **Configure in Vercel/Render**
   - **Vercel**: Project Settings → Domains → Add your domain
   - **Render**: Service Settings → Custom Domain → Add domain
   - **Railway**: Service Settings → Networking → Add Custom Domain

4. **Update Environment Variables**
   - Update `CORS_ORIGINS` in API to include your domain
   - Update `FRONTEND_URL` in API
   - Update `NEXT_PUBLIC_API_BASE_URL` in frontend to `https://api.yourdomain.com/api`

### SSL Certificates

- **Vercel/Render/Railway**: Automatic SSL via Let's Encrypt
- **Hostinger**: Usually included with hosting plan
- **AWS**: Use ACM (AWS Certificate Manager)

---

## Post-Deployment Checklist

### ✅ Backend API

- [ ] API is accessible at expected URL
- [ ] Database migrations are applied
- [ ] Environment variables are set correctly
- [ ] CORS is configured for frontend domain
- [ ] Health check endpoint works: `GET /health`
- [ ] Authentication endpoints work
- [ ] File uploads work (if using S3, verify credentials)

### ✅ Frontend

- [ ] Frontend is accessible at domain
- [ ] API calls are working (check browser console)
- [ ] Authentication flow works (login/register)
- [ ] Static assets load correctly
- [ ] No CORS errors in console

### ✅ Database

- [ ] Database connection is working
- [ ] Can create users
- [ ] Can query data
- [ ] Backups are configured (if using managed service)

### ✅ Email

- [ ] Email verification emails are sent
- [ ] Password reset emails are sent
- [ ] SMTP credentials are correct
- [ ] Sender email is verified (for SendGrid/SES)

### ✅ Security

- [ ] JWT_SECRET is strong and secure
- [ ] HTTPS is enabled everywhere
- [ ] Environment variables are not exposed
- [ ] Database credentials are secure
- [ ] CORS only allows your domain

### ✅ Monitoring

- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure logging
- [ ] Set up alerts for downtime

---

## Troubleshooting

### API Not Accessible

1. **Check Service Status**
   - Railway: Check deployment logs
   - Render: Check service logs
   - AWS: Check CloudWatch logs

2. **Verify Environment Variables**
   - Ensure all required variables are set
   - Check for typos in variable names

3. **Check Database Connection**
   - Verify DATABASE_URL is correct
   - Test connection: `npm run prisma:check`

### Frontend Can't Connect to API

1. **Check CORS Configuration**
   - Ensure frontend URL is in `CORS_ORIGINS`
   - Check API logs for CORS errors

2. **Verify API URL**
   - Check `NEXT_PUBLIC_API_BASE_URL` is correct
   - Ensure API URL includes `/api` suffix

3. **Check Network Tab**
   - Open browser DevTools → Network
   - Look for failed API requests
   - Check error messages

### Database Migration Issues

1. **Run Migrations Manually**
   ```bash
   # Railway
   railway run npm run prisma:migrate deploy
   
   # Render
   render run npm run prisma:migrate deploy
   
   # Local (for testing)
   npm run prisma:migrate deploy
   ```

2. **Check Prisma Schema**
   - Ensure schema matches database
   - Regenerate Prisma client: `npm run prisma:generate`

### Build Failures

1. **Check Build Logs**
   - Review full error messages
   - Check for missing dependencies

2. **Test Build Locally**
   ```bash
   cd apps/web
   npm run build
   ```

---

## Cost Estimates

### Recommended Setup (Railway + Vercel)

- **Railway**: $5/month (Hobby plan) or free tier available
- **Vercel**: Free (Hobby) or $20/month (Pro)
- **SendGrid**: Free (100 emails/day) or $15/month
- **Domain**: ~$10-15/year (Hostinger)
- **Total**: ~$5-35/month

### Render Setup

- **Render Web Service**: $7/month (Starter) or free tier
- **Render PostgreSQL**: $7/month (Starter) or free tier
- **Render Static Site**: Free
- **Total**: ~$0-14/month

### AWS Setup

- **EC2/ECS**: ~$15-50/month
- **RDS PostgreSQL**: ~$15-100/month
- **S3**: ~$1-5/month
- **CloudFront**: ~$1-10/month
- **Total**: ~$32-165/month

---

## Recommended Next Steps

1. **Set up CI/CD**
   - GitHub Actions for automated deployments
   - Auto-deploy on push to main branch

2. **Add Monitoring**
   - Error tracking (Sentry)
   - Analytics (Google Analytics, Plausible)
   - Uptime monitoring

3. **Configure Backups**
   - Database backups (automated with Railway/Render)
   - File backups (if using local storage)

4. **Optimize Performance**
   - Enable CDN caching
   - Optimize images
   - Enable compression

5. **Security Hardening**
   - Set up rate limiting
   - Enable DDoS protection
   - Regular security updates

---

## Support & Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **AWS CDK Docs**: https://docs.aws.amazon.com/cdk
- **Next.js Deployment**: https://nextjs.org/docs/deployment
