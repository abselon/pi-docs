'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/Screen';
import { SurfaceCard, Button } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { createDocument, getCategories } from '@/lib/api';
import { getToken } from '@/lib/auth';

type Category = { id: string; name: string; icon: string; documentsCount: number };

export default function AddDocumentPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [issuedAt, setIssuedAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    getCategories()
      .then((d) => setCategories(d.categories))
      .catch(() => {
        // Silently fail - categories are optional
      });
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    try {
      await createDocument({
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId: categoryId || undefined,
        issuedAt: issuedAt ? new Date(issuedAt) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        file: file || undefined,
      });
      router.push('/browse');
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Failed to create document');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Add Document" subtitle="Upload a new document to your vault">
      <SurfaceCard className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <div className="mb-1 text-sm text-white/70">Title *</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[var(--brand)]"
              placeholder="e.g., Driver's License"
            />
          </label>

          <label className="block">
            <div className="mb-1 text-sm text-white/70">Description</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[var(--brand)] resize-none"
              placeholder="Optional description..."
            />
          </label>

          <label className="block">
            <div className="mb-1 text-sm text-white/70">Category</div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[var(--brand)]"
            >
              <option value="">None</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <div className="mb-1 text-sm text-white/70">Issued Date</div>
              <input
                type="date"
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[var(--brand)]"
              />
            </label>

            <label className="block">
              <div className="mb-1 text-sm text-white/70">Expires Date</div>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[var(--brand)]"
              />
            </label>
          </div>

          <label className="block">
            <div className="mb-1 text-sm text-white/70">File</div>
            <div className="relative">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[var(--brand)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[var(--brand)] file:text-black hover:file:opacity-90"
              />
            </div>
            {file && (
              <div className="mt-2 flex items-center gap-2 text-sm text-white/70">
                <Icon name="upload" className="h-4 w-4" />
                <span>{file.name}</span>
                <span className="text-white/50">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </label>

          {error ? <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm">{error}</div> : null}

          <div className="flex gap-3">
            <Button type="button" onClick={() => router.back()} className="flex-1 bg-white/10 text-white hover:bg-white/20">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Adding...' : 'Add Document'}
            </Button>
          </div>
        </form>
      </SurfaceCard>
    </Screen>
  );
}
