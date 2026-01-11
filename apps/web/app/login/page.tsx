'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Screen } from '@/components/Screen';
import { SurfaceCard, Button } from '@/components/ui';
import { login, register } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password, name);
      router.push('/');
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title={mode === 'login' ? 'Sign In' : 'Create Account'} subtitle="Access your secure document vault">
      <SurfaceCard className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'register' ? (
            <label className="block">
              <div className="mb-1 text-sm text-white/70">Name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[var(--brand)]"
              />
            </label>
          ) : null}
          <label className="block">
            <div className="mb-1 text-sm text-white/70">Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[var(--brand)]"
            />
          </label>
          <label className="block">
            <div className="mb-1 text-sm text-white/70">Password</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[var(--brand)]"
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-white/50">Min 8 characters</span>
              {mode === 'login' && (
                <Link href="/forgot-password" className="text-xs text-white/70 hover:text-white">
                  Forgot password?
                </Link>
              )}
            </div>
          </label>

          {error ? <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm">{error}</div> : null}

          <Button type="submit" className="w-full py-3">
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>

          <button
            type="button"
            onClick={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}
            className="w-full text-sm text-white/70 hover:text-white"
          >
            {mode === 'login' ? 'Create an account' : 'Already have an account? Sign in'}
          </button>
        </form>
      </SurfaceCard>
    </Screen>
  );
}

