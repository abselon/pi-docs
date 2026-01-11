import React from 'react';

type IconName =
  | 'user'
  | 'settings'
  | 'home'
  | 'grid'
  | 'plus'
  | 'shield'
  | 'folder'
  | 'id-card'
  | 'bank'
  | 'medical'
  | 'graduation-cap'
  | 'gavel'
  | 'moon'
  | 'bell'
  | 'lock'
  | 'fingerprint'
  | 'camera'
  | 'upload'
  | 'refresh'
  | 'trash'
  | 'arrow-left'
  | 'file'
  | 'calendar'
  | 'clock'
  | 'download'
  | 'expand';

const paths: Record<IconName, string> = {
  home: 'M4 10.5 12 4l8 6.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20v-9.5Z',
  grid: 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z',
  user: 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 9a7 7 0 0 1 14 0',
  settings:
    'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8.2 3.2-.9-.5.1-1.1-1.4-2.4-1 .3-.8-.8.3-1-2.4-1.4-1.1.1-.5-.9h-2.8l-.5.9-1.1-.1-2.4 1.4.3 1-.8.8-1-.3-1.4 2.4.1 1.1-.9.5v2.8l.9.5-.1 1.1 1.4 2.4 1-.3.8.8-.3 1 2.4 1.4 1.1-.1.5.9h2.8l.5-.9 1.1.1 2.4-1.4-.3-1 .8-.8 1 .3 1.4-2.4-.1-1.1.9-.5v-2.8Z',
  plus: 'M12 5v14m-7-7h14',
  shield:
    'M12 3 20 6v7c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V6l8-3Z',
  folder: 'M3 7a2 2 0 0 1 2-2h5l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z',
  'id-card': 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Zm4 4h4m-4 4h8',
  bank: 'M4 10h16M6 10v10m4-10v10m4-10v10m4-10v10M3 20h18M5 8l7-4 7 4',
  medical:
    'M10 4h4v4h4v4h-4v4h-4v-4H6V8h4V4Zm-6 16h16',
  'graduation-cap': 'M12 4 2 9l10 5 10-5-10-5Zm-7 8v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5',
  gavel: 'M9 7l6 6m-4-8 4 4m-9 9 8-8m-9 9 3 3m10-10 3 3M4 20h8',
  moon: 'M21 14.5A7.5 7.5 0 0 1 9.5 3 6.5 6.5 0 1 0 21 14.5Z',
  bell: 'M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5L4 18v1h16v-1l-2-2Z',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3m-11 0h12v10H6V11Z',
  fingerprint:
    'M12 3a7 7 0 0 0-7 7v2m14-2a7 7 0 0 0-7-7m-5 9v2c0 4 2 8 5 8m2-8v3c0 3 1 5 3 5m-2-12a4 4 0 0 1 4 4v2',
  camera: 'M4 7h3l2-2h6l2 2h3v14H4V7Zm8 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  upload: 'M12 16V4m0 0 4 4m-4-4-4 4M4 20h16',
  refresh: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v6h-6',
  trash: 'M6 7h12m-9 0V5h6v2m-8 0 1 14h8l1-14',
  'arrow-left': 'M19 12H5m7-7-7 7 7 7',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z M14 2v6h6',
  calendar: 'M8 2v4m8-4v4M4 10h16M5 4h14a1 1 0 0 1 1v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z',
  clock: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Zm1-13h-2v6l5.5 3.3 1-1.7-4.5-2.7V7Z',
  download: 'M12 15V3m0 0-4 4m4-4 4 4M4 17h16v4H4v-4Z',
  expand: 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3',
};

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <path d={paths[name]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type { IconName };

