import { AppError } from '../lib/errors';
import { LocalStorage } from './local';
import { S3Storage } from './s3';
import type { Storage } from './types';

let local: Storage | null = null;
let s3: Storage | null = null;

export function getStorage(provider: 'LOCAL' | 'S3'): Storage {
  if (provider === 'LOCAL') {
    if (!local) local = new LocalStorage();
    return local;
  }
  if (provider === 'S3') {
    if (!s3) s3 = new S3Storage();
    return s3;
  }
  throw new AppError({ status: 400, code: 'BAD_STORAGE_PROVIDER', message: 'Unknown storage provider' });
}

