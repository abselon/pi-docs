import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';
import { AppError } from '../lib/errors';
import type { PutObjectInput, Storage, StoredObject } from './types';

function requireS3Config() {
  if (!env.S3_REGION || !env.S3_BUCKET) {
    throw new AppError({
      status: 400,
      code: 'S3_NOT_CONFIGURED',
      message: 'S3 is not configured. Set S3_REGION and S3_BUCKET in apps/api/.env',
    });
  }
  return { region: env.S3_REGION, bucket: env.S3_BUCKET, prefix: env.S3_PREFIX };
}

function streamToBuffer(stream: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (c: Buffer) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

export class S3Storage implements Storage {
  private client: S3Client;
  private bucket: string;
  private prefix: string;

  constructor() {
    const cfg = requireS3Config();
    this.client = new S3Client({ region: cfg.region });
    this.bucket = cfg.bucket;
    this.prefix = cfg.prefix;
  }

  async putObject(input: PutObjectInput): Promise<StoredObject> {
    const key = `${this.prefix}/${input.userId}/${cryptoRandomId()}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: input.bytes,
        ContentType: input.mimeType,
        // Encryption at rest (SSE-S3 by default, SSE-KMS if key configured)
        ServerSideEncryption: env.S3_KMS_KEY_ID ? 'aws:kms' : 'AES256',
        SSEKMSKeyId: env.S3_KMS_KEY_ID,
      }),
    );
    return { provider: 'S3', key };
  }

  async getObjectBytes(input: { key: string }) {
    const out = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: input.key }));
    if (!out.Body) throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Object not found' });
    const bytes = await streamToBuffer(out.Body);
    return { bytes, mimeType: out.ContentType };
  }

  async deleteObject(input: { key: string }) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: input.key }));
  }
}

function cryptoRandomId() {
  // keep keys compact; enough entropy for object names
  return `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
}

