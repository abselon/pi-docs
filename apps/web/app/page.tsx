'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Screen } from '@/components/Screen';
import { Icon } from '@/components/Icon';
import { SurfaceCard } from '@/components/ui';
import { getOverview } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function Home() {
  const [overview, setOverview] = useState<{ total: number; active: number; expiring: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch overview if user is authenticated
    const token = getToken();
    if (!token) {
      // User not authenticated, show empty state
      return;
    }

    getOverview()
      .then((d) => setOverview(d.overview))
      .catch((e) => {
        // Silently handle 401 errors (user not authenticated)
        const errorMessage = e instanceof Error ? e.message : 'Failed to load';
        if (errorMessage.includes('UNAUTHENTICATED')) {
          // User not authenticated, clear overview
          setOverview(null);
        } else {
          setError(errorMessage);
        }
      });
  }, []);

  return (
    <Screen
      title="PiDocs"
      subtitle="Your documents, secured"
      right={
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70">
          <Icon name="shield" className="h-4 w-4 text-[var(--brand)]" />
          Secured
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Link href="/add-document" className="surface rounded-3xl border border-white/10 p-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--surface-2)]">
            <Icon name="plus" className="h-7 w-7 text-[var(--brand)]" />
          </div>
          <div className="mt-3 font-semibold">Add Document</div>
        </Link>
        <Link href="/browse" className="surface rounded-3xl border border-white/10 p-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--surface-2)]">
            <Icon name="camera" className="h-7 w-7 text-green-400" />
          </div>
          <div className="mt-3 font-semibold">Scan ID</div>
        </Link>
        <Link href="/settings" className="surface rounded-3xl border border-white/10 p-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--surface-2)]">
            <Icon name="upload" className="h-7 w-7 text-indigo-300" />
          </div>
          <div className="mt-3 font-semibold">Backup</div>
        </Link>
        <Link href="/settings" className="surface rounded-3xl border border-white/10 p-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--surface-2)]">
            <Icon name="settings" className="h-7 w-7 text-amber-300" />
          </div>
          <div className="mt-3 font-semibold">Settings</div>
        </Link>
      </div>

      <div className="mt-8">
        <SurfaceCard className="p-6">
          <div className="text-xl font-semibold">Overview</div>
          {error ? <div className="mt-2 text-sm text-red-400">{error}</div> : null}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-semibold text-[var(--brand)]">{overview?.total ?? '—'}</div>
              <div className="text-sm text-white/60">Total</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-emerald-300">{overview?.active ?? '—'}</div>
              <div className="text-sm text-white/60">Active</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-amber-300">{overview?.expiring ?? '—'}</div>
              <div className="text-sm text-white/60">Expiring</div>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </Screen>
  );
}
