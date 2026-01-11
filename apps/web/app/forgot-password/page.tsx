'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Screen } from '@/components/Screen';
import { SurfaceCard, Button } from '@/components/ui';
import { forgotPassword } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Forgot Password" subtitle="Reset your account password">
      <SurfaceCard className="p-6">
        {success ? (
          <div className="text-center">
            <div className="mb-4 text-lg font-semibold text-green-400">Check your email</div>
            <div className="mb-6 text-sm text-white/70">
              If an account with that email exists, we've sent a password reset link. Please check your inbox and follow
              the instructions.
            </div>
            <Button onClick={() => router.push('/login')} className="w-full">
              Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <div className="mb-1 text-sm text-white/70">Email</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[var(--brand)]"
                placeholder="your.email@example.com"
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm">{error}</div>
            ) : null}

            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
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
