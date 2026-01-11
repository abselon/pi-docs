import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../lib/errors';

export type AuthUser = {
  id: string;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const tokenPayloadSchema = (payload: unknown): payload is { sub: string } =>
  typeof payload === 'object' && payload !== null && 'sub' in payload && typeof (payload as any).sub === 'string';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
  if (!token) {
    return next(new AppError({ status: 401, code: 'UNAUTHENTICATED', message: 'Missing bearer token' }));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (!tokenPayloadSchema(payload)) {
      return next(new AppError({ status: 401, code: 'UNAUTHENTICATED', message: 'Invalid token payload' }));
    }
    req.user = { id: payload.sub };
    return next();
  } catch {
    return next(new AppError({ status: 401, code: 'UNAUTHENTICATED', message: 'Invalid token' }));
  }
}

export function issueToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '7d' });
}

