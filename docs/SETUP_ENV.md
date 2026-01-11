# Environment Variables Setup Guide

This guide explains how to configure environment variables for the Pi Docs application.

## Quick Start

1. **API Setup**: Copy `apps/api/env.example` to `apps/api/.env` and fill in required values
2. **Web Setup**: Copy `apps/web/env.example` to `apps/web/.env.local` and fill in required values

## Required Configuration

### API Server (`apps/api/.env`)

#### ✅ Required Variables

1. **DATABASE_URL** - PostgreSQL connection string
   ```bash
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/pidocs_db
   ```
   - **How to get**: Set up a PostgreSQL database (local or cloud)
   - **Local PostgreSQL**: Install PostgreSQL, create database, use connection string
   - **Cloud options**: Supabase, Railway, Neon, AWS RDS, Heroku Postgres

2. **JWT_SECRET** - Secret key for JWT tokens
   ```bash
   # Generate a secure secret:
   openssl rand -base64 32
   ```
   - **Development**: Can use `dev_change_me` (not secure!)
   - **Production**: MUST use a strong random string

#### 🔧 Optional but Recommended

3. **SMTP_*** - Email configuration (for email verification & password reset)
   - Without this, emails will be logged to console (development only)
   - See email provider setup below

### Web Application (`apps/web/.env.local`)

#### ✅ Required Variables

1. **NEXT_PUBLIC_API_BASE_URL** - API server URL
   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
   ```
   - Must match where your API server is running
   - Must be included in API's `CORS_ORIGINS`

## Detailed Setup Instructions

### 1. Database Setup (PostgreSQL)

#### Option A: Local PostgreSQL

1. **Install PostgreSQL**
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql@14`
   - Linux: `sudo apt-get install postgresql`

2. **Create Database**
   ```sql
   CREATE DATABASE pidocs_db;
   CREATE USER pidocs_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE pidocs_db TO pidocs_user;
   ```

3. **Update DATABASE_URL**
   ```bash
   DATABASE_URL=postgresql://pidocs_user:your_secure_password@localhost:5432/pidocs_db
   ```

#### Option B: Supabase (Free Tier Available)

1. Go to [supabase.com](https://supabase.com) and create account
2. Create a new project
3. Go to Project Settings > Database
4. Copy the connection string (use "Connection pooling" for production)
5. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

#### Option C: Railway

1. Go to [railway.app](https://railway.app) and create account
2. Create new project > Add PostgreSQL
3. Copy the connection string from the PostgreSQL service

#### Option D: Neon

1. Go to [neon.tech](https://neon.tech) and create account
2. Create a new project
3. Copy the connection string from the dashboard

### 2. Email Setup (SMTP)

#### Option A: Gmail (Development)

1. Enable 2-Step Verification in Google Account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Use these settings:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password-here
   SMTP_FROM=your-email@gmail.com
   ```

#### Option B: SendGrid (Production Recommended)

1. Sign up at [sendgrid.com](https://sendgrid.com) (free tier available)
2. Create API Key: Settings > API Keys > Create API Key
3. Verify sender email: Settings > Sender Authentication
4. Use these settings:
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   SMTP_FROM=verified-email@yourdomain.com
   ```

#### Option C: AWS SES

1. Set up AWS SES in your AWS account
2. Verify email address or domain
3. Create SMTP credentials in SES console
4. Use these settings:
   ```bash
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com  # Use your region
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-smtp-username
   SMTP_PASS=your-smtp-password
   SMTP_FROM=verified-email@yourdomain.com
   ```

#### Option D: Mailgun

1. Sign up at [mailgun.com](https://www.mailgun.com)
2. Verify your domain
3. Get SMTP credentials from dashboard
4. Use these settings:
   ```bash
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=postmaster@yourdomain.com
   SMTP_PASS=your-mailgun-password
   SMTP_FROM=noreply@yourdomain.com
   ```

### 3. AWS S3 Setup (Optional - for cloud file storage)

Only needed if you want to store uploaded files in S3 instead of locally.

1. **Create S3 Bucket**
   - Go to AWS Console > S3
   - Create bucket (choose region)
   - Enable versioning (optional)
   - Set bucket policy for your application

2. **Create IAM User**
   - Create IAM user with S3 permissions
   - Attach policy: `AmazonS3FullAccess` (or create custom policy)
   - Create access key

3. **Configure Environment Variables**
   ```bash
   S3_REGION=us-east-1
   S3_BUCKET=your-bucket-name
   S3_PREFIX=pi-docs
   # Optional: For encryption
   S3_KMS_KEY_ID=arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012
   ```

4. **Set AWS Credentials**
   - Use AWS CLI: `aws configure`
   - Or set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in environment

### 4. Security Best Practices

#### Development
- Use `dev_change_me` for JWT_SECRET (not secure, but fine for local dev)
- Use local PostgreSQL database
- Email can be logged to console (no SMTP needed)

#### Production
- **MUST** generate strong JWT_SECRET:
  ```bash
  openssl rand -base64 32
  ```
- Use managed database service (Supabase, RDS, etc.)
- Configure SMTP for email functionality
- Use HTTPS URLs in CORS_ORIGINS and FRONTEND_URL
- Never commit `.env` files to git (already in `.gitignore`)

## Verification

After setting up environment variables:

1. **API Server**
   ```bash
   cd apps/api
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev
   ```

2. **Web Application**
   ```bash
   cd apps/web
   npm run dev
   ```

3. **Test Database Connection**
   ```bash
   cd apps/api
   npm run prisma:check
   ```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready` or check service status
- Check DATABASE_URL format matches: `postgresql://user:pass@host:port/db`
- Test connection: `psql "postgresql://user:pass@host:port/db"`

### Email Not Sending
- Check SMTP credentials are correct
- Verify sender email is verified (for SendGrid/SES)
- Check firewall/network allows SMTP ports (587, 465)
- Review API server logs for SMTP errors

### CORS Errors
- Ensure `NEXT_PUBLIC_API_BASE_URL` matches API's `CORS_ORIGINS`
- Include protocol (`http://` or `https://`)
- For production, include all domains (with/without www)

### Prisma Errors
- Run `npm run prisma:generate` after schema changes
- Ensure DATABASE_URL is set correctly
- Run migrations: `npm run prisma:migrate`

## Example Complete Configurations

### Development (Local)
```bash
# apps/api/.env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/pidocs_db
JWT_SECRET=dev_change_me
CORS_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=./uploads
# SMTP not needed - emails logged to console
```

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### Production
```bash
# apps/api/.env
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db.example.com:5432/pidocs_prod
JWT_SECRET=<generated-with-openssl-rand-base64-32>
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com
UPLOAD_DIR=./uploads
S3_REGION=us-east-1
S3_BUCKET=your-bucket-name
S3_PREFIX=pi-docs
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com
```

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
```
