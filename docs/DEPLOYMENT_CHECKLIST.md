# Deployment Checklist

Use this checklist to ensure a smooth deployment process.

## Pre-Deployment

### Code Preparation
- [ ] All code is committed and pushed to repository
- [ ] Code is tested locally
- [ ] Environment variables are documented
- [ ] Database migrations are ready
- [ ] Build process works locally (`npm run build`)

### Account Setup
- [ ] Railway account created (or alternative)
- [ ] Vercel account created (or alternative)
- [ ] Domain purchased/configured in Hostinger
- [ ] Email service configured (SendGrid/Gmail/etc.)
- [ ] GitHub repository is public or Railway/Vercel has access

## Backend Deployment (Railway)

### Initial Setup
- [ ] Railway project created
- [ ] GitHub repository connected
- [ ] PostgreSQL database added
- [ ] API service created
- [ ] Root directory set to `apps/api`
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`

### Environment Variables
- [ ] `DATABASE_URL` (from PostgreSQL service)
- [ ] `JWT_SECRET` (strong random string generated)
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001` (or Railway's assigned port)
- [ ] `CORS_ORIGINS` (frontend domain)
- [ ] `FRONTEND_URL` (frontend domain)
- [ ] `UPLOAD_DIR=./uploads`
- [ ] `SMTP_HOST` (if using email)
- [ ] `SMTP_PORT` (if using email)
- [ ] `SMTP_SECURE` (if using email)
- [ ] `SMTP_USER` (if using email)
- [ ] `SMTP_PASS` (if using email)
- [ ] `SMTP_FROM` (if using email)

### Database
- [ ] Database migrations run successfully
- [ ] Prisma client generated
- [ ] Database connection tested
- [ ] Can create test user

### Verification
- [ ] API is accessible at Railway URL
- [ ] Health check endpoint works: `GET /health`
- [ ] API logs show no errors
- [ ] Custom domain configured (if applicable)

## Frontend Deployment (Vercel)

### Initial Setup
- [ ] Vercel project created
- [ ] GitHub repository connected
- [ ] Root directory set to `apps/web`
- [ ] Framework preset: Next.js
- [ ] Build command: `npm run build` (default)

### Environment Variables
- [ ] `NEXT_PUBLIC_API_BASE_URL` (API URL + `/api`)

### Verification
- [ ] Frontend builds successfully
- [ ] Frontend is accessible at Vercel URL
- [ ] No build errors in logs
- [ ] Custom domain configured (if applicable)

## Domain Configuration (Hostinger)

### DNS Setup
- [ ] Logged into Hostinger hPanel
- [ ] DNS Zone Editor accessed
- [ ] CNAME record added for frontend (@ or www)
- [ ] CNAME record added for API subdomain (api)
- [ ] DNS records saved

### Domain Verification
- [ ] Domain added in Vercel (for frontend)
- [ ] Domain added in Railway (for API)
- [ ] SSL certificates issued (automatic)
- [ ] Domain resolves correctly (check with `nslookup`)

### Environment Updates
- [ ] Updated `CORS_ORIGINS` in API to include custom domain
- [ ] Updated `FRONTEND_URL` in API to custom domain
- [ ] Updated `NEXT_PUBLIC_API_BASE_URL` in frontend to `https://api.yourdomain.com/api`

## Post-Deployment Testing

### Functionality Tests
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Email verification sent (if configured)
- [ ] Password reset works (if configured)
- [ ] Profile page loads
- [ ] Documents can be created
- [ ] Documents can be viewed
- [ ] File uploads work
- [ ] Logout works

### Performance Tests
- [ ] Page load times are acceptable
- [ ] API response times are acceptable
- [ ] Images/assets load correctly
- [ ] No console errors in browser

### Security Checks
- [ ] HTTPS is enabled everywhere
- [ ] No sensitive data in client-side code
- [ ] CORS is configured correctly
- [ ] Environment variables are not exposed
- [ ] JWT_SECRET is strong and secure

## Monitoring Setup

### Error Tracking
- [ ] Error tracking service configured (Sentry, etc.)
- [ ] Error alerts configured
- [ ] Test error reporting works

### Uptime Monitoring
- [ ] Uptime monitoring service configured (UptimeRobot, etc.)
- [ ] Monitoring endpoints added
- [ ] Alert notifications configured

### Logging
- [ ] Logs are accessible
- [ ] Log retention configured
- [ ] Important events are logged

## Backup & Recovery

### Database Backups
- [ ] Automated backups enabled (Railway/Render)
- [ ] Backup frequency configured
- [ ] Backup retention period set
- [ ] Test restore procedure documented

### File Backups (if using local storage)
- [ ] File backup strategy defined
- [ ] Backup process automated
- [ ] Backup location configured

## Documentation

### Internal Docs
- [ ] Deployment process documented
- [ ] Environment variables documented
- [ ] Database schema documented
- [ ] API endpoints documented

### Runbooks
- [ ] Rollback procedure documented
- [ ] Troubleshooting guide created
- [ ] Emergency contacts listed

## Final Verification

### Smoke Tests
- [ ] All critical paths work
- [ ] No errors in production logs
- [ ] Performance is acceptable
- [ ] Security headers are set

### Team Communication
- [ ] Team notified of deployment
- [ ] Deployment notes shared
- [ ] Known issues documented

## Rollback Plan

If something goes wrong:
- [ ] Know how to rollback Railway deployment
- [ ] Know how to rollback Vercel deployment
- [ ] Have previous working commit hash ready
- [ ] Database rollback procedure documented

---

## Quick Reference

### Railway Commands
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Run migrations
railway run npm run prisma:migrate deploy

# View logs
railway logs
```

### Vercel Commands
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# View logs
vercel logs
```

### Useful URLs
- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Hostinger hPanel: https://hpanel.hostinger.com

---

**Last Updated**: Check this checklist before each deployment to ensure nothing is missed.
