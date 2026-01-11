'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Screen } from '@/components/Screen';
import { SurfaceCard, Button, Row } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { getMe, logout, sendVerificationEmail } from '@/lib/api';
import { getToken, clearToken } from '@/lib/auth';

type User = { id: string; email: string; name: string; emailVerified?: boolean };

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sendingVerification, setSendingVerification] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }

    getMe()
      .then((d) => setUser(d.user))
      .catch((e) => {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load';
        if (errorMessage.includes('UNAUTHENTICATED')) {
          setUser(null);
        } else {
          setError(errorMessage);
        }
      });
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } catch (e) {
      // Even if logout fails, clear token and redirect
      clearToken();
    }
    router.push('/login');
  }

  async function handleSendVerification() {
    setSendingVerification(true);
    setError(null);
    try {
      await sendVerificationEmail();
      // Refresh user data to get updated verification status
      const data = await getMe();
      setUser(data.user);
      alert('Verification email sent! Please check your inbox.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send verification email');
    } finally {
      setSendingVerification(false);
    }
  }

  return (
    <Screen title="Profile" subtitle="Manage your account and preferences">
      <SurfaceCard className="p-6">
        <div className="flex flex-col items-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-[var(--brand)]/20">
            <Icon name="user" className="h-10 w-10 text-[var(--brand)]" />
          </div>
          <div className="mt-4 text-xl font-semibold">{user?.name ?? 'Guest'}</div>
          <div className="text-sm text-white/60">{user?.email ?? 'Not signed in'}</div>
          {user && user.emailVerified === false && (
            <div className="mt-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-400">
              Email not verified. Check your inbox or{' '}
              <button
                onClick={handleSendVerification}
                disabled={sendingVerification}
                className="underline hover:no-underline"
              >
                {sendingVerification ? 'Sending...' : 'resend verification email'}
              </button>
            </div>
          )}
          {user && user.emailVerified === true && (
            <div className="mt-2 text-xs text-green-400">✓ Email verified</div>
          )}
          <div className="mt-4 flex gap-2">
            {user ? (
              <>
                <Button className="px-6">Edit Profile</Button>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login">
                <Button className="px-6">Sign In</Button>
              </Link>
            )}
          </div>
          {error ? <div className="mt-3 text-sm text-red-400">{error}</div> : null}
        </div>
      </SurfaceCard>

      <div className="mt-8">
        <div className="mb-3 text-sm font-semibold tracking-wide text-white/70">Account</div>
        <SurfaceCard className="divide-y divide-white/10">
          <Row icon="user" title="Personal Information" />
          <Row icon="lock" title="Security" />
          <Row icon="bell" title="Notifications" />
        </SurfaceCard>
      </div>
    </Screen>
  );
}

