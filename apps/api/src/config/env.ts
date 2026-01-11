import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  PORT: z.coerce.number().int().positive().optional(),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().min(1).optional(),
  CORS_ORIGINS: z.string().optional(),
  UPLOAD_DIR: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_PREFIX: z.string().optional(),
  S3_KMS_KEY_ID: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_SECURE: z.coerce.boolean().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  FRONTEND_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  NODE_ENV: parsed.data.NODE_ENV ?? 'development',
  PORT: parsed.data.PORT ?? 3001,
  DATABASE_URL: parsed.data.DATABASE_URL,
  JWT_SECRET: parsed.data.JWT_SECRET ?? 'dev_change_me',
  CORS_ORIGINS: parsed.data.CORS_ORIGINS ?? 'http://localhost:3000',
  UPLOAD_DIR: parsed.data.UPLOAD_DIR ?? './uploads',
  S3_REGION: parsed.data.S3_REGION,
  S3_BUCKET: parsed.data.S3_BUCKET,
  S3_PREFIX: parsed.data.S3_PREFIX ?? 'pi-docs',
  S3_KMS_KEY_ID: parsed.data.S3_KMS_KEY_ID,
  SMTP_HOST: parsed.data.SMTP_HOST,
  SMTP_PORT: parsed.data.SMTP_PORT ?? 587,
  SMTP_SECURE: parsed.data.SMTP_SECURE ?? false,
  SMTP_USER: parsed.data.SMTP_USER,
  SMTP_PASS: parsed.data.SMTP_PASS,
  SMTP_FROM: parsed.data.SMTP_FROM ?? 'noreply@pi-docs.com',
  FRONTEND_URL: parsed.data.FRONTEND_URL ?? 'http://localhost:3000',
} as const;

export const corsOrigins = env.CORS_ORIGINS.split(',')
  .map((s) => s.trim())
  .filter(Boolean);

