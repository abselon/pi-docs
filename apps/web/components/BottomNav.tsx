'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './Icon';

const items = [
  { href: '/', label: 'Home', icon: 'home' as const },
  { href: '/browse', label: 'Browse', icon: 'grid' as const },
  { href: '/profile', label: 'Profile', icon: 'user' as const },
  { href: '/settings', label: 'Settings', icon: 'settings' as const },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
        {items.map((it) => {
          const active = pathname === it.href || (it.href !== '/' && pathname.startsWith(it.href));
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-1 flex-col items-center gap-1 text-xs ${
                active ? 'text-white' : 'text-white/60'
              }`}
            >
              <Icon name={it.icon} className={`h-6 w-6 ${active ? 'text-[var(--brand)]' : ''}`} />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

