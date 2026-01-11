'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Screen } from '@/components/Screen';
import { Icon, type IconName } from '@/components/Icon';
import { SurfaceCard, IconBadge, Button } from '@/components/ui';
import { getCategories, createCategory, getDocuments, getDocumentDownloadUrl, type Document } from '@/lib/api';
import { getToken } from '@/lib/auth';

type Category = { id: string; name: string; icon: string; documentsCount: number };

const AVAILABLE_ICONS: IconName[] = ['folder', 'id-card', 'bank', 'medical', 'graduation-cap', 'shield', 'gavel'];

function iconFromApi(icon: string): IconName {
  // Keep server flexible; fall back to folder if unknown
  const known = new Set(AVAILABLE_ICONS);
  return (known.has(icon as IconName) ? icon : 'folder') as IconName;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusColor(status: Document['status']): string {
  switch (status) {
    case 'ACTIVE':
      return 'text-green-400';
    case 'EXPIRING':
      return 'text-yellow-400';
    case 'EXPIRED':
      return 'text-red-400';
    default:
      return 'text-white/60';
  }
}

function isImageFile(mimeType: string | null): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith('image/');
}

export default function BrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<IconName>('folder');
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});

  const loadCategories = () => {
    const token = getToken();
    if (!token) {
      return;
    }

    getCategories()
      .then((d) => {
        setCategories(d.categories);
        // If viewing a category, find and set it
        if (categoryId) {
          const cat = d.categories.find((c) => c.id === categoryId);
          setSelectedCategory(cat || null);
        } else {
          setSelectedCategory(null);
        }
      })
      .catch((e) => {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load';
        if (errorMessage.includes('UNAUTHENTICATED')) {
          setCategories([]);
        } else {
          setError(errorMessage);
        }
      });
  };

  const loadDocuments = (catId: string) => {
    const token = getToken();
    if (!token || !catId) {
      return;
    }

    setLoadingDocuments(true);
    setError(null);
    getDocuments({ categoryId: catId })
      .then((d) => {
        setDocuments(d.documents);
        // Load image previews for image documents
        const token = getToken();
        if (token) {
          d.documents.forEach((doc) => {
            if (doc.storageKey && isImageFile(doc.fileMime)) {
              const url = getDocumentDownloadUrl(doc.id);
              fetch(url, {
                headers: {
                  authorization: `Bearer ${token}`,
                },
              })
                .then((res) => {
                  if (res.ok) {
                    return res.blob();
                  }
                  throw new Error('Failed to load preview');
                })
                .then((blob) => {
                  const blobUrl = window.URL.createObjectURL(blob);
                  setImagePreviews((prev) => ({ ...prev, [doc.id]: blobUrl }));
                })
                .catch(() => {
                  // Silently fail - preview is optional
                });
            }
          });
        }
      })
      .catch((e) => {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load documents';
        setError(errorMessage);
      })
      .finally(() => setLoadingDocuments(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(imagePreviews).forEach((url) => {
        window.URL.revokeObjectURL(url);
      });
    };
  }, [imagePreviews]);

  useEffect(() => {
    if (categoryId) {
      // Load categories first to get the selected category name, then load documents
      const token = getToken();
      if (token) {
        setLoadingDocuments(true);
        Promise.all([
          getCategories(),
          getDocuments({ categoryId }),
        ])
          .then(([categoriesData, documentsData]) => {
            const cat = categoriesData.categories.find((c) => c.id === categoryId);
            setSelectedCategory(cat || null);
            setDocuments(documentsData.documents);
            setError(null);
            // Load image previews for image documents
            documentsData.documents.forEach((doc) => {
              if (doc.storageKey && isImageFile(doc.fileMime)) {
                const url = getDocumentDownloadUrl(doc.id);
                fetch(url, {
                  headers: {
                    authorization: `Bearer ${token}`,
                  },
                })
                  .then((res) => {
                    if (res.ok) {
                      return res.blob();
                    }
                    throw new Error('Failed to load preview');
                  })
                  .then((blob) => {
                    const blobUrl = window.URL.createObjectURL(blob);
                    setImagePreviews((prev) => ({ ...prev, [doc.id]: blobUrl }));
                  })
                  .catch(() => {
                    // Silently fail - preview is optional
                  });
              }
            });
          })
          .catch((e) => {
            const errorMessage = e instanceof Error ? e.message : 'Failed to load';
            setError(errorMessage);
          })
          .finally(() => setLoadingDocuments(false));
      }
    } else {
      setDocuments([]);
      setSelectedCategory(null);
    }
  }, [categoryId]);

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);

    if (!categoryName.trim()) {
      setCreateError('Category name is required');
      return;
    }

    setCreating(true);
    try {
      await createCategory({ name: categoryName.trim(), icon: selectedIcon });
      setCategoryName('');
      setSelectedIcon('folder');
      setShowAddForm(false);
      loadCategories();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to create category';
      setCreateError(errorMessage);
    } finally {
      setCreating(false);
    }
  }

  const handleDownload = async (documentId: string, fileName: string | null) => {
    const token = getToken();
    if (!token) return;
    
    try {
      const url = getDocumentDownloadUrl(documentId);
      const response = await fetch(url, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to download document');
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', fileName || 'document');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to download document');
    }
  };

  // If viewing documents in a category
  if (categoryId) {
    return (
      <Screen
        title={selectedCategory?.name || 'Loading...'}
        subtitle={
          loadingDocuments
            ? 'Loading documents...'
            : `${documents.length} document${documents.length !== 1 ? 's' : ''}`
        }
        left={
          <button
            onClick={() => router.push('/browse')}
            className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <Icon name="arrow-left" className="h-6 w-6" />
          </button>
        }
        right={
          <button
            onClick={() => router.push('/add-document')}
            className="grid h-12 w-12 place-items-center rounded-full bg-[var(--brand)] text-black hover:opacity-90"
          >
            <Icon name="plus" className="h-6 w-6" />
          </button>
        }
      >
        {error ? <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm">{error}</div> : null}

        {loadingDocuments ? (
          <div className="text-center py-8 text-white/60">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="file" className="mx-auto mb-4 h-12 w-12 text-white/40" />
            <div className="text-white/60 mb-2">No documents in this category</div>
            <Button onClick={() => router.push('/add-document')} className="mt-4">
              Add Document
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const hasImagePreview = isImageFile(doc.fileMime) && imagePreviews[doc.id];
              return (
                <SurfaceCard key={doc.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/document/${doc.id}`} className="flex-1 min-w-0 cursor-pointer">
                      <div className="flex gap-3">
                        {hasImagePreview && (
                          <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-black/20 border border-white/10">
                            <img
                              src={imagePreviews[doc.id]}
                              alt={doc.title}
                              className="w-full h-full object-cover"
                              onError={() => {
                                // Remove failed preview
                                setImagePreviews((prev) => {
                                  const updated = { ...prev };
                                  delete updated[doc.id];
                                  return updated;
                                });
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{doc.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full bg-white/10 ${getStatusColor(doc.status)}`}>
                              {doc.status}
                            </span>
                          </div>
                          {doc.description && (
                            <p className="text-sm text-white/70 mb-2 line-clamp-2">{doc.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-xs text-white/60">
                            {doc.fileName && (
                              <div className="flex items-center gap-1">
                                <Icon name="file" className="h-3 w-3" />
                                <span>{doc.fileName}</span>
                                {doc.fileSize && <span>({formatFileSize(doc.fileSize)})</span>}
                              </div>
                            )}
                            {doc.issuedAt && (
                              <div className="flex items-center gap-1">
                                <Icon name="calendar" className="h-3 w-3" />
                                <span>Issued: {formatDate(doc.issuedAt)}</span>
                              </div>
                            )}
                            {doc.expiresAt && (
                              <div className="flex items-center gap-1">
                                <Icon name="clock" className="h-3 w-3" />
                                <span>Expires: {formatDate(doc.expiresAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                    {doc.storageKey && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDownload(doc.id, doc.fileName);
                        }}
                        className="flex-shrink-0 grid place-items-center h-10 w-10 rounded-full bg-[var(--brand)] text-black hover:opacity-90"
                        title="Download"
                      >
                        <Icon name="download" className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </SurfaceCard>
              );
            })}
          </div>
        )}
      </Screen>
    );
  }

  // Default view: show categories
  return (
    <Screen
      title="Browse"
      subtitle="All your documents by category"
      right={
        <button
          onClick={() => router.push('/add-document')}
          className="grid h-12 w-12 place-items-center rounded-full bg-[var(--brand)] text-black hover:opacity-90"
        >
          <Icon name="plus" className="h-6 w-6" />
        </button>
      }
    >
      {error ? <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm">{error}</div> : null}

      {showAddForm ? (
        <SurfaceCard className="mb-4 p-6">
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Category</h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setCategoryName('');
                  setSelectedIcon('folder');
                  setCreateError(null);
                }}
                className="text-white/60 hover:text-white"
              >
                <Icon name="plus" className="h-5 w-5 rotate-45" />
              </button>
            </div>

            <label className="block">
              <div className="mb-1 text-sm text-white/70">Category Name *</div>
              <input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[var(--brand)]"
                placeholder="e.g., Personal Documents"
                autoFocus
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm text-white/70">Icon</div>
              <div className="grid grid-cols-4 gap-3">
                {AVAILABLE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`grid place-items-center rounded-2xl border p-4 transition-all ${
                      selectedIcon === icon
                        ? 'border-[var(--brand)] bg-[var(--brand)]/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <Icon name={icon} className="h-6 w-6" />
                  </button>
                ))}
              </div>
            </label>

            {createError ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm">{createError}</div>
            ) : null}

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setCategoryName('');
                  setSelectedIcon('folder');
                  setCreateError(null);
                }}
                className="flex-1 bg-white/10 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={creating}>
                {creating ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </form>
        </SurfaceCard>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-4 w-full rounded-3xl border border-dashed border-white/20 bg-white/5 p-6 text-center transition-colors hover:bg-white/10"
        >
          <Icon name="plus" className="mx-auto mb-2 h-8 w-8 text-white/60" />
          <div className="font-semibold text-white/80">Add Category</div>
        </button>
      )}

      <div className="grid grid-cols-2 gap-4">
        {categories.map((c) => (
          <Link key={c.id} href={`/browse?categoryId=${c.id}`}>
            <SurfaceCard className="p-6">
              <IconBadge icon={iconFromApi(c.icon)} />
              <div className="mt-3 font-semibold">{c.name}</div>
              <div className="mt-1 text-sm text-white/60">{c.documentsCount} documents</div>
            </SurfaceCard>
          </Link>
        ))}
      </div>
    </Screen>
  );
}

