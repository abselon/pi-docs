import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { env } from '../config/env';
import type { PutObjectInput, Storage, StoredObject } from './types';

function ensureDir() {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

function safeExt(filename: string) {
  const ext = path.extname(filename);
  return ext.length <= 12 ? ext : '';
}

export class LocalStorage implements Storage {
  async putObject(input: PutObjectInput): Promise<StoredObject> {
    ensureDir();
    const fileName = `${crypto.randomUUID()}${safeExt(input.originalName)}`;
    const absPath = path.resolve(env.UPLOAD_DIR, fileName);
    await fs.promises.writeFile(absPath, input.bytes);
    return { provider: 'LOCAL', key: fileName };
  }

  async getObjectBytes(input: { key: string }) {
    const absPath = path.resolve(env.UPLOAD_DIR, input.key);
    const bytes = await fs.promises.readFile(absPath);
    return { bytes };
  }

  async deleteObject(input: { key: string }) {
    const absPath = path.resolve(env.UPLOAD_DIR, input.key);
    await fs.promises.unlink(absPath).catch(() => undefined);
  }
}

