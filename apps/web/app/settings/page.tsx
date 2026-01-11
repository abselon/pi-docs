'use client';

import { useEffect, useState } from 'react';
import { Screen } from '@/components/Screen';
import { SurfaceCard, Row } from '@/components/ui';
import { useTheme } from '@/app/providers';
import { getSettings, patchSettings } from '@/lib/api';
import { getToken } from '@/lib/auth';

function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full border border-white/10 ${checked ? 'bg-[var(--brand)]' : 'bg-white/10'}`}
    >
      <span
        className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-black transition-all ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [biometric, setBiometric] = useState(false);
  const [storageProvider, setStorageProvider] = useState<'LOCAL' | 'S3'>('LOCAL');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }

    getSettings()
      .then((d) => {
        setBiometric(d.settings.biometricEnabled);
        setStorageProvider(d.settings.storageProvider ?? 'LOCAL');
      })
      .catch((e) => {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load settings';
        if (!errorMessage.includes('UNAUTHENTICATED')) {
          setError(errorMessage);
        }
      });
  }, []);

  return (
    <Screen title="Settings" subtitle="Customize your app experience">
      {error ? <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm">{error}</div> : null}

      <div>
        <div className="mb-3 text-sm font-semibold tracking-wide text-white/70">Appearance</div>
        <SurfaceCard className="divide-y divide-white/10">
          <Row
            icon="moon"
            title="Dark Mode"
            right={
              <Switch
                checked={theme === 'dark'}
                onChange={(v) => {
                  setTheme(v ? 'dark' : 'light');
                  patchSettings({ darkMode: v }).catch(() => undefined);
                }}
              />
            }
          />
          <Row icon="settings" title="Theme" />
        </SurfaceCard>
      </div>

      <div className="mt-8">
        <div className="mb-3 text-sm font-semibold tracking-wide text-white/70">Security</div>
        <SurfaceCard className="divide-y divide-white/10">
          <Row
            icon="fingerprint"
            title="Biometric Authentication"
            right={
              <Switch
                checked={biometric}
                onChange={(v) => {
                  setBiometric(v);
                  patchSettings({ biometricEnabled: v }).catch(() => undefined);
                }}
              />
            }
          />
          <Row icon="lock" title="Auto-Lock" />
          <Row icon="lock" title="Change Password" />
        </SurfaceCard>
      </div>

      <div className="mt-8">
        <div className="mb-3 text-sm font-semibold tracking-wide text-white/70">Data & Storage</div>
        <SurfaceCard className="divide-y divide-white/10">
          <Row
            icon="folder"
            title="Storage"
            subtitle={storageProvider === 'S3' ? 'Cloud (S3)' : 'Local (server disk)'}
            onClick={() => {
              const next = storageProvider === 'LOCAL' ? 'S3' : 'LOCAL';
              setStorageProvider(next);
              patchSettings({ storageProvider: next }).catch((e) => {
                setError(e instanceof Error ? e.message : 'Failed to update storage');
                setStorageProvider(storageProvider);
              });
            }}
          />
          <Row icon="refresh" title="Backup & Restore" />
          <Row icon="trash" title="Clear Cache" />
        </SurfaceCard>
      </div>
    </Screen>
  );
}

