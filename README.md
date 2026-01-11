# Pi Docs

A web application with API backend built with Next.js and Node.js Express.

## Project Structure

```
pi-docs/
├── apps/
│   ├── web/          # Next.js frontend application
│   ├── api/          # Node.js Express API backend
│   └── testing/      # Shared testing utilities
├── infrastructure/   # AWS CDK infrastructure code
├── docs/            # Project documentation
│   ├── features/    # Feature documentation
│   ├── technical/   # Technical documentation
│   ├── architecture/# Architecture documentation
│   └── api-docs/    # API documentation
└── .cursor/         # Cursor IDE configuration
```

## Tech Stack

- **Frontend**: Next.js (static export), TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Infrastructure**: AWS CDK (TypeScript)

## Getting Started

### Prerequisites

- Node.js (latest LTS version)
- npm or yarn
- PostgreSQL database
- AWS account (for infrastructure deployment)

### Installation

1. **Install web app dependencies:**
```bash
cd apps/web
npm install
```

2. **Install API dependencies:**
```bash
cd apps/api
npm install
```

3. **Environment variables**
   - API: create `apps/api/.env` (see `apps/api/env.example`)
   - Web: create `apps/web/.env.local` (see `apps/web/env.example`)

4. **Database / Prisma (API)**
```bash
cd apps/api
npm run prisma:generate
npm run prisma:migrate
```

3. **Install infrastructure dependencies:**
```bash
cd infrastructure
npm install
```

### Development

1. **Start the web app:**
```bash
cd apps/web
npm run dev
```
The app will be available at http://localhost:3000

2. **Start the API server:**
```bash
cd apps/api
npm run dev
```
The API will be available at http://localhost:3001

3. **Configure environment variables:**
   - API: `apps/api/.env` (see `apps/api/env.example`)
   - Web: `apps/web/.env.local` (see `apps/web/env.example`)

### Building

**Build web app for production:**
```bash
cd apps/web
npm run build
```

**Build API for production:**
```bash
cd apps/api
npm run build
```

### Infrastructure Deployment

See `infrastructure/README.md` for detailed instructions on deploying AWS infrastructure.

## Deployment

**Quick Start**: See [Deployment Quick Start Guide](./docs/DEPLOYMENT_QUICKSTART.md) for fastest deployment.

**Full Guide**: See [Deployment Guide](./docs/DEPLOYMENT.md) for comprehensive deployment options including:
- Railway + Vercel (Recommended - Easiest)
- Render (Alternative)
- Hostinger Static Hosting
- AWS (Advanced)

**Environment Setup**: See [Environment Variables Guide](./docs/SETUP_ENV.md) for configuring all required credentials.

## Documentation

- **Deployment**: [Quick Start](./docs/DEPLOYMENT_QUICKSTART.md) | [Full Guide](./docs/DEPLOYMENT.md)
- **Environment Setup**: [SETUP_ENV.md](./docs/SETUP_ENV.md)
- **Project Structure**: [Monorepo vs Separate Repos](./docs/MONOREPO_VS_SEPARATE.md) - Why we use a monorepo
- **API Documentation**: 
  - [Full API Docs](./docs/api-docs/API.md) - Complete reference with examples
  - [Quick Reference](./docs/api-docs/QUICK_REFERENCE.md) - Quick lookup table
  - [Swagger UI](./docs/api-docs/swagger-ui.html) - Interactive API testing (see [Setup Guide](./docs/api-docs/SWAGGER_SETUP.md))
  - [OpenAPI Spec](./docs/api-docs/swagger.yaml) - Enhanced specification with examples
- Features: `docs/features/`
- Technical: `docs/technical/`
- Architecture: `docs/architecture/`

## License

ISC

