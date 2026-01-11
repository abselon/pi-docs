'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname.startsWith('/login');
  return (
    <>
      {children}
      {!hideNav ? <BottomNav /> : null}
    </>
  );
}

