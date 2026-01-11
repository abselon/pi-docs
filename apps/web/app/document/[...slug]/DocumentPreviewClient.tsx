'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/Screen';
import { Icon } from '@/components/Icon';
import { SurfaceCard, Button } from '@/components/ui';
import { getDocument, getDocumentDownloadUrl, type Document } from '@/lib/api';
import { getToken } from '@/lib/auth';

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

function isPdfFile(mimeType: string | null): boolean {
  if (!mimeType) return false;
  return mimeType === 'application/pdf';
}

function canPreview(mimeType: string | null): boolean {
  return isImageFile(mimeType) || isPdfFile(mimeType);
}

export default function DocumentPreviewClient() {
  const router = useRouter();
  // Extract document ID from URL pathname (works with static export)
  // Read directly from window.location since Next.js params don't work for dynamic routes in static export
  const [documentId, setDocumentId] = useState<string | null>(null);

  const [document, setDocument] = useState<Document | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Extract document ID from URL on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      // Extract ID from /document/[...slug] - take the first segment after /document/
      const segments = path.replace('/document/', '').split('/').filter(Boolean);
      const id = segments[0] || null;
      setDocumentId(id);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    if (!documentId) {
      // If documentId is still null, check if it's a valid path
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const segments = path.replace('/document/', '').split('/').filter(Boolean);
        const id = segments[0];
        if (!id || id === 'index') {
          setError('Document ID is required');
          setLoading(false);
        }
      }
      return;
    }

    getDocument(documentId)
      .then((data) => {
        setDocument(data.document);
        // If document has a file and it's previewable, we'll load preview on demand
        // since we need to fetch with authentication
        if (data.document.storageKey && canPreview(data.document.fileMime)) {
          // Create a blob URL for preview
          const url = getDocumentDownloadUrl(data.document.id);
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
              setPreviewUrl(blobUrl);
            })
            .catch((err) => {
              setPreviewError('Failed to load preview');
              console.error('Preview error:', err);
            });
        }
      })
      .catch((e) => {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load document';
        setError(errorMessage);
      })
      .finally(() => setLoading(false));
  }, [documentId, router]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDownload = async () => {
    if (!document || !document.storageKey) return;

    const token = getToken();
    if (!token) return;

    try {
      const url = getDocumentDownloadUrl(document.id);
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
      const link = window.document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', document.fileName || 'document');
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to download document');
    }
  };

  if (loading) {
    return (
      <Screen title="Loading..." subtitle="Please wait">
        <div className="text-center py-12 text-white/60">Loading document...</div>
      </Screen>
    );
  }

  if (error || !document) {
    return (
      <Screen title="Error" subtitle="Failed to load document">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm">{error || 'Document not found'}</div>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </Screen>
    );
  }

  const canPreviewFile = document.storageKey && canPreview(document.fileMime);
  const isImage = isImageFile(document.fileMime);
  const isPdf = isPdfFile(document.fileMime);

  return (
    <Screen
      title={document.title}
      subtitle={document.description || undefined}
      left={
        <button
          onClick={() => router.back()}
          className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <Icon name="arrow-left" className="h-6 w-6" />
        </button>
      }
      right={
        document.storageKey ? (
          <button
            onClick={handleDownload}
            className="grid h-12 w-12 place-items-center rounded-full bg-[var(--brand)] text-black hover:opacity-90"
            title="Download"
          >
            <Icon name="download" className="h-6 w-6" />
          </button>
        ) : null
      }
    >
      <div className="space-y-4">
        {/* Document Info */}
        <SurfaceCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`text-sm px-3 py-1 rounded-full bg-white/10 ${getStatusColor(document.status)}`}>
                {document.status}
              </span>
            </div>

            {document.description && (
              <div>
                <div className="text-sm text-white/70 mb-1">Description</div>
                <div className="text-white/90">{document.description}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {document.fileName && (
                <div>
                  <div className="text-white/70 mb-1">File Name</div>
                  <div className="flex items-center gap-2">
                    <Icon name="file" className="h-4 w-4 text-white/60" />
                    <span className="text-white/90">{document.fileName}</span>
                  </div>
                </div>
              )}

              {document.fileSize && (
                <div>
                  <div className="text-white/70 mb-1">File Size</div>
                  <div className="text-white/90">{formatFileSize(document.fileSize)}</div>
                </div>
              )}

              {document.issuedAt && (
                <div>
                  <div className="text-white/70 mb-1">Issued Date</div>
                  <div className="flex items-center gap-2">
                    <Icon name="calendar" className="h-4 w-4 text-white/60" />
                    <span className="text-white/90">{formatDate(document.issuedAt)}</span>
                  </div>
                </div>
              )}

              {document.expiresAt && (
                <div>
                  <div className="text-white/70 mb-1">Expires Date</div>
                  <div className="flex items-center gap-2">
                    <Icon name="clock" className="h-4 w-4 text-white/60" />
                    <span className="text-white/90">{formatDate(document.expiresAt)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SurfaceCard>

        {/* File Preview */}
        {canPreviewFile && previewUrl && (
          <SurfaceCard className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-white/90">Preview</div>
              {isImage && (
                <button
                  onClick={() => {
                    // Open image in new tab for full view
                    window.open(previewUrl, '_blank');
                  }}
                  className="flex items-center gap-2 text-xs text-white/70 hover:text-white/90 transition-colors"
                  title="Open in full screen"
                >
                  <Icon name="expand" className="h-4 w-4" />
                  <span>Full Screen</span>
                </button>
              )}
            </div>
            <div className="rounded-lg overflow-hidden bg-black/20">
              {isImage && (
                <div className="w-full flex justify-center items-center bg-gradient-to-b from-black/30 to-black/10 p-4">
                  <img
                    src={previewUrl}
                    alt={document.title}
                    className="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-2xl cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => {
                      // Open image in new tab for full view
                      window.open(previewUrl, '_blank');
                    }}
                    onError={() => setPreviewError('Failed to load image preview')}
                    style={{
                      filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))',
                    }}
                  />
                </div>
              )}
              {isPdf && (
                <iframe
                  src={previewUrl}
                  className="w-full h-[600px] border-0"
                  title={document.title}
                  onError={() => setPreviewError('Failed to load PDF preview')}
                />
              )}
            </div>
            {previewError && (
              <div className="mt-2 text-sm text-red-400">{previewError}</div>
            )}
          </SurfaceCard>
        )}

        {document.storageKey && !canPreviewFile && (
          <SurfaceCard className="p-6 text-center">
            <Icon name="file" className="mx-auto mb-4 h-12 w-12 text-white/40" />
            <div className="text-white/70 mb-4">
              Preview not available for this file type ({document.fileMime || 'unknown'})
            </div>
            <Button onClick={handleDownload}>Download File</Button>
          </SurfaceCard>
        )}

        {!document.storageKey && (
          <SurfaceCard className="p-6 text-center">
            <Icon name="file" className="mx-auto mb-4 h-12 w-12 text-white/40" />
            <div className="text-white/70">No file attached to this document</div>
          </SurfaceCard>
        )}
      </div>
    </Screen>
  );
}
