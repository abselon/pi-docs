'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Screen } from '@/components/Screen';
import { SurfaceCard, Button } from '@/components/ui';
import { resetPassword } from '@/lib/api';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing reset token');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <Screen title="Reset Password" subtitle="Invalid reset link">
        <SurfaceCard className="p-6">
          <div className="text-center">
            <div className="mb-4 text-lg font-semibold text-red-400">Invalid Reset Link</div>
            <div className="mb-6 text-sm text-white/70">
              This password reset link is invalid or has expired. Please request a new one.
            </div>
            <div className="space-y-2">
              <Button onClick={() => router.push('/forgot-password')} className="w-full">
                Request New Reset Link
              </Button>
              <Link href="/login" className="block w-full text-center text-sm text-white/70 hover:text-white">
                Back to Sign In
              </Link>
            </div>
          </div>
        </SurfaceCard>
      </Screen>
    );
  }

  return (
    <Screen title="Reset Password" subtitle="Create a new password for your account">
      <SurfaceCard className="p-6">
        {success ? (
          <div className="text-center">
            <div className="mb-4 text-lg font-semibold text-green-400">Password Reset Successful!</div>
            <div className="mb-6 text-sm text-white/70">Your password has been updated. You can now sign in with your new password.</div>
            <Button onClick={() => router.push('/login')} className="w-full">
              Continue to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <div className="mb-1 text-sm text-white/70">New Password</div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[var(--brand)]"
                placeholder="Enter new password"
              />
              <div className="mt-1 text-xs text-white/50">Min 8 characters</div>
            </label>

            <label className="block">
              <div className="mb-1 text-sm text-white/70">Confirm Password</div>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[var(--brand)]"
                placeholder="Confirm new password"
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm">{error}</div>
            ) : null}

            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>

            <Link href="/login" className="block w-full text-center text-sm text-white/70 hover:text-white">
              Back to Sign In
            </Link>
          </form>
        )}
      </SurfaceCard>
    </Screen>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Screen title="Reset Password" subtitle="Loading...">
        <SurfaceCard className="p-6">
          <div className="text-center py-8 text-white/60">Loading...</div>
        </SurfaceCard>
      </Screen>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
