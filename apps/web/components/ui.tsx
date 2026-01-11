import React from 'react';
import { Icon, type IconName } from './Icon';

export function SurfaceCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`surface rounded-3xl border border-white/10 ${className ?? ''}`}>{children}</div>;
}

export function IconBadge({ icon }: { icon: IconName }) {
  return (
    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--surface-2)]">
      <Icon name={icon} className="h-6 w-6 text-[var(--brand)]" />
    </div>
  );
}

export function Button({
  children,
  onClick,
  className,
  type,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button
      type={type ?? 'button'}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${className ?? ''}`}
    >
      {children}
    </button>
  );
}

export function Row({
  icon,
  title,
  subtitle,
  right,
  onClick,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onClick?: () => void;
}) {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      onClick={onClick as any}
      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
    >
      <div className="flex items-center gap-4">
        <IconBadge icon={icon} />
        <div>
          <div className="font-medium">{title}</div>
          {subtitle ? <div className="text-sm text-white/60">{subtitle}</div> : null}
        </div>
      </div>
      {right ?? <div className="text-white/40">›</div>}
    </Component>
  );
}

