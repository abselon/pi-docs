# Quick Deployment Guide

**Fastest way to get Pi Docs live in production.**

## 🚀 5-Minute Deployment (Recommended)

### Prerequisites
- GitHub account
- Domain from Hostinger
- 15 minutes

### Step 1: Deploy Backend + Database (Railway) - 5 min

1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add PostgreSQL: "+ New" → "Database" → "Add PostgreSQL"
5. Add API Service: "+ New" → "GitHub Repo" → Select repo
   - Set Root Directory: `apps/api`
   - Set Build Command: `npm install && npm run build`
   - Set Start Command: `npm start`
6. Add Environment Variables (in API service → Variables):
   ```bash
   DATABASE_URL=<copy-from-postgres-service>
   JWT_SECRET=<run: openssl rand -base64 32>
   CORS_ORIGINS=https://yourdomain.com
   FRONTEND_URL=https://yourdomain.com
   NODE_ENV=production
   ```
7. Copy API URL (e.g., `https://your-api.up.railway.app`)

### Step 2: Deploy Frontend (Vercel) - 3 min

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. "Add New" → "Project" → Import your repo
3. Configure:
   - Root Directory: `apps/web`
   - Framework: Next.js (auto-detected)
4. Add Environment Variable:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://your-api.up.railway.app/api
   ```
5. Click "Deploy"
6. Copy Frontend URL (e.g., `https://your-project.vercel.app`)

### Step 3: Configure Domain (Hostinger) - 5 min

1. Log into Hostinger hPanel
2. Go to "Domains" → "DNS Zone Editor"
3. Add CNAME record:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. In Vercel: Project Settings → Domains → Add `yourdomain.com`
5. Update API environment variables:
   - Railway: Update `CORS_ORIGINS` to include your domain
   - Vercel: Update `NEXT_PUBLIC_API_BASE_URL` to `https://api.yourdomain.com/api`
6. In Railway: Add custom domain `api.yourdomain.com`

### Step 4: Run Database Migrations - 2 min

In Railway API service:
- Use Railway CLI or web terminal:
  ```bash
  railway run npm run prisma:migrate deploy
  ```

**Done!** Your app should be live at `https://yourdomain.com`

## 📋 Environment Variables Checklist

### Railway (API)
- [ ] `DATABASE_URL` (from PostgreSQL service)
- [ ] `JWT_SECRET` (generate with `openssl rand -base64 32`)
- [ ] `CORS_ORIGINS` (your frontend domain)
- [ ] `FRONTEND_URL` (your frontend domain)
- [ ] `NODE_ENV=production`
- [ ] `SMTP_*` (optional, for emails)

### Vercel (Frontend)
- [ ] `NEXT_PUBLIC_API_BASE_URL` (your API URL + `/api`)

## 🔧 Common Issues

**API returns 500 errors**
→ Check Railway logs, verify DATABASE_URL is correct

**Frontend can't connect to API**
→ Check CORS_ORIGINS includes frontend domain, verify API URL

**Database connection fails**
→ Verify DATABASE_URL format, check Railway PostgreSQL is running

**Domain not working**
→ Wait 5-10 minutes for DNS propagation, check DNS records

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Alternative deployment options (Render, AWS)
- Detailed troubleshooting
- Advanced configurations
- Cost estimates
