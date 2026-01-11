'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Screen } from '@/components/Screen';
import { SurfaceCard, Button } from '@/components/ui';
import { verifyEmail } from '@/lib/api';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token');
      return;
    }

    verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Email verified successfully! You can now use all features.');
      })
      .catch((e) => {
        setStatus('error');
        setMessage(e instanceof Error ? e.message : 'Failed to verify email');
      });
  }, [token]);

  return (
    <Screen title="Verify Email" subtitle="Confirming your email address">
      <SurfaceCard className="p-6">
        {status === 'loading' && (
          <div className="text-center">
            <div className="mb-4 text-lg">Verifying your email...</div>
            <div className="text-sm text-white/60">Please wait</div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mb-4 text-lg font-semibold text-green-400">✓ Email Verified!</div>
            <div className="mb-6 text-sm text-white/70">{message}</div>
            <Button onClick={() => router.push('/login')} className="w-full">
              Continue to Sign In
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mb-4 text-lg font-semibold text-red-400">Verification Failed</div>
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm">{message}</div>
            <div className="space-y-2">
              <Button onClick={() => router.push('/login')} className="w-full">
                Go to Sign In
              </Button>
              <button
                onClick={() => router.push('/')}
                className="w-full text-sm text-white/70 hover:text-white"
              >
                Go to Home
              </button>
            </div>
          </div>
        )}
      </SurfaceCard>
    </Screen>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <Screen title="Verify Email" subtitle="Loading...">
        <SurfaceCard className="p-6">
          <div className="text-center py-8 text-white/60">Loading...</div>
        </SurfaceCard>
      </Screen>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
