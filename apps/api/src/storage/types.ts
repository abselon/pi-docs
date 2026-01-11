export type StoredObject = {
  provider: 'LOCAL' | 'S3';
  key: string;
};

export type PutObjectInput = {
  userId: string;
  originalName: string;
  mimeType: string;
  bytes: Buffer;
};

export interface Storage {
  putObject(input: PutObjectInput): Promise<StoredObject>;
  getObjectBytes(input: { key: string }): Promise<{ bytes: Buffer; mimeType?: string }>;
  deleteObject(input: { key: string }): Promise<void>;
}

