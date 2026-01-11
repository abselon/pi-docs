import React from 'react';

export function Screen({
  title,
  subtitle,
  left,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="mx-auto w-full max-w-3xl px-6 pt-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {left}
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
              {subtitle ? <p className="mt-2 text-white/70">{subtitle}</p> : null}
            </div>
          </div>
          {right}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

