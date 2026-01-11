# Pi Docs API

Node.js Express API backend for Pi Docs.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (see `env.example`):
```
PORT=3001
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=dev_change_me
CORS_ORIGINS=http://localhost:3000
UPLOAD_DIR=./uploads
```

3. Start development server:
```bash
npm run dev
```

4. Prisma (first time):
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Build for production:
```bash
npm run build
npm start
```

## Database

This API uses PostgreSQL. Configure your database connection in the `.env` file.

### Troubleshooting Prisma Issues

If signup or database operations are failing:

1. **Check database connection:**
   ```bash
   npm run prisma:check
   ```
   This will verify your DATABASE_URL and check if migrations are applied.

2. **Ensure Prisma client is generated:**
   ```bash
   npm run prisma:generate
   ```

3. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   ```
   This creates all required tables in your database.

4. **Verify DATABASE_URL format:**
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/database_name
   ```
   Make sure:
   - PostgreSQL server is running
   - Database exists
   - User has proper permissions
   - Connection string is correct

5. **Common error codes:**
   - `P1001`: Can't reach database server - check DATABASE_URL and server status
   - `P1008`: Connection timeout - check network/firewall
   - `P2002`: Unique constraint violation - email already exists
   - `P1017`: Server closed connection - database may be restarting
