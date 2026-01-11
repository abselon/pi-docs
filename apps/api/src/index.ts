import express from 'express';
import cors from 'cors';
import { corsOrigins, env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { categoriesRouter } from './routes/categories';
import { documentsRouter } from './routes/documents';
import { statsRouter } from './routes/stats';
import { usersRouter } from './routes/users';
import { settingsRouter } from './routes/settings';

const app = express();

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: '5mb' }));

app.get('/', (_req, res) => res.json({ name: 'pi-docs-api', status: 'ok' }));
app.get('/api', (_req, res) => res.json({ message: 'Welcome to Pi Docs API' }));

app.use(healthRouter);
app.use('/api', authRouter);
app.use('/api', usersRouter);
app.use('/api', settingsRouter);
app.use('/api', categoriesRouter);
app.use('/api', documentsRouter);
app.use('/api', statsRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${env.PORT}`);
});

