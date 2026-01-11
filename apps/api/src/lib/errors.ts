export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(opts: { status: number; code: string; message: string; details?: unknown }) {
    super(opts.message);
    this.status = opts.status;
    this.code = opts.code;
    this.details = opts.details;
  }
}

export function isAppError(err: unknown): err is AppError {
  return typeof err === 'object' && err !== null && 'status' in err && 'code' in err;
}

