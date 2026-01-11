import type { NextFunction, Request, Response } from 'express';
import { isAppError } from '../lib/errors';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status = isAppError(err) ? err.status : 500;
  const code = isAppError(err) ? err.code : 'INTERNAL_SERVER_ERROR';
  const message = err instanceof Error ? err.message : 'Unknown error';
  const details = isAppError(err) ? err.details : undefined;

  res.status(status).json({
    error: {
      code,
      message,
      details,
    },
  });
}

