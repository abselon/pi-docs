'use client';

import { getToken, setToken, clearToken } from './auth';

type ApiError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function apiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url) throw new Error('NEXT_PUBLIC_API_BASE_URL is not set (see apps/web/env.example)');
  return url.replace(/\/+$/, '');
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set('accept', 'application/json');
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
  if (token) headers.set('authorization', `Bearer ${token}`);

  const res = await fetch(`${apiBaseUrl()}${path}`, { ...init, headers });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // If response is not JSON, use text as message
  }

  if (!res.ok) {
    const err = (json ?? { error: { code: 'HTTP_ERROR', message: res.statusText } }) as ApiError;
    const error = new Error(`${err.error.code}: ${err.error.message}`);
    // Add status code to error for better handling
    (error as any).status = res.status;
    throw error;
  }
  return json as T;
}

export type User = { id: string; email: string; name: string; emailVerified?: boolean };

export async function login(email: string, password: string) {
  const data = await apiFetch<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data.user;
}

export async function register(email: string, password: string, name: string) {
  const data = await apiFetch<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
  setToken(data.token);
  return data.user;
}

export async function getMe() {
  return apiFetch<{ user: User }>('/users/me');
}

export async function logout() {
  await apiFetch<{ message: string }>('/auth/logout', { method: 'POST' });
  clearToken();
}

export async function sendVerificationEmail() {
  return apiFetch<{ message: string }>('/auth/send-verification', { method: 'POST' });
}

export async function verifyEmail(token: string) {
  return apiFetch<{ message: string }>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function forgotPassword(email: string) {
  return apiFetch<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string) {
  return apiFetch<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export async function getOverview() {
  return apiFetch<{ overview: { total: number; active: number; expiring: number } }>('/stats/overview');
}

export async function getCategories() {
  return apiFetch<{ categories: Array<{ id: string; name: string; icon: string; documentsCount: number }> }>(
    '/categories',
  );
}

export async function createCategory(data: { name: string; icon?: string }) {
  return apiFetch<{ category: { id: string; name: string; icon: string; createdAt: string; updatedAt: string } }>(
    '/categories',
    {
      method: 'POST',
      body: JSON.stringify({ name: data.name, icon: data.icon || 'folder' }),
    },
  );
}

export async function getSettings() {
  return apiFetch<{
    settings: { darkMode: boolean; biometricEnabled: boolean; autoLockMinutes: number; storageProvider?: 'LOCAL' | 'S3' };
  }>('/settings');
}

export async function patchSettings(
  patch: Partial<{ darkMode: boolean; biometricEnabled: boolean; autoLockMinutes: number; storageProvider: 'LOCAL' | 'S3' }>,
) {
  return apiFetch<{
    settings: { darkMode: boolean; biometricEnabled: boolean; autoLockMinutes: number; storageProvider?: 'LOCAL' | 'S3' };
  }>('/settings', { method: 'PATCH', body: JSON.stringify(patch) });
}

export type Document = {
  id: string;
  userId: string;
  categoryId: string | null;
  title: string;
  description: string | null;
  status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED';
  issuedAt: string | null;
  expiresAt: string | null;
  fileName: string | null;
  fileMime: string | null;
  fileSize: number | null;
  storageProvider: 'LOCAL' | 'S3';
  storageKey: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getDocuments(params?: { categoryId?: string; search?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.search) queryParams.append('search', params.search);
  const queryString = queryParams.toString();
  return apiFetch<{ documents: Document[] }>(`/documents${queryString ? `?${queryString}` : ''}`);
}

export async function getDocument(documentId: string) {
  return apiFetch<{ document: Document }>(`/documents/${documentId}`);
}

export async function createDocument(data: {
  title: string;
  description?: string;
  categoryId?: string;
  issuedAt?: Date;
  expiresAt?: Date;
  file?: File;
}) {
  const token = getToken();
  const formData = new FormData();
  formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  if (data.categoryId) formData.append('categoryId', data.categoryId);
  if (data.issuedAt) formData.append('issuedAt', data.issuedAt.toISOString());
  if (data.expiresAt) formData.append('expiresAt', data.expiresAt.toISOString());
  if (data.file) formData.append('file', data.file);

  const headers = new Headers();
  headers.set('accept', 'application/json');
  if (token) headers.set('authorization', `Bearer ${token}`);

  const res = await fetch(`${apiBaseUrl()}/documents`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // If response is not JSON, use text as message
  }

  if (!res.ok) {
    const err = (json ?? { error: { code: 'HTTP_ERROR', message: res.statusText } }) as ApiError;
    const error = new Error(`${err.error.code}: ${err.error.message}`);
    (error as any).status = res.status;
    throw error;
  }

  return json as { document: Document };
}

export function getDocumentDownloadUrl(documentId: string): string {
  return `${apiBaseUrl()}/documents/${documentId}/download`;
}
