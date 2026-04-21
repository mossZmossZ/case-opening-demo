import React from 'react';
import { TIER_META } from '../lib/constants';

const ICONS = {
  consolation: (c) => (
    <svg viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="20" stroke={c} strokeWidth="2" opacity="0.5"/>
      <path d="M22 32l6 6 14-14" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  sticker: (c) => (
    <svg viewBox="0 0 64 64" fill="none">
      <path d="M32 10l5 10 11 1.6-8 7.8 1.9 11L32 35l-9.9 5.4 1.9-11-8-7.8L27 20z" fill={c} opacity="0.85"/>
      <circle cx="32" cy="48" r="5" fill={c} opacity="0.5"/>
    </svg>
  ),
  tshirt: (c) => (
    <svg viewBox="0 0 64 64" fill="none">
      <path d="M14 18l10-6s1 5 8 5 8-5 8-5l10 6-6 8h-5v20H23V26h-5z" fill={c} opacity="0.85"/>
    </svg>
  ),
  powerbank: (c) => (
    <svg viewBox="0 0 64 64" fill="none">
      <rect x="14" y="20" width="36" height="24" rx="4" stroke={c} strokeWidth="2" fill={c} fillOpacity="0.15"/>
      <rect x="50" y="27" width="4" height="10" rx="2" fill={c} opacity="0.6"/>
      <path d="M30 32l-4 6h8l-4 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  hoodie: (c) => (
    <svg viewBox="0 0 64 64" fill="none">
      <path d="M20 14c0 0-8 4-8 12v18h10V28h4v16h8V28h4v16h10V26c0-8-8-12-8-12s-2 8-10 8-10-8-10-8z" fill={c} opacity="0.85"/>
    </svg>
  ),
  backpack: (c) => (
    <svg viewBox="0 0 64 64" fill="none">
      <rect x="16" y="20" width="32" height="32" rx="6" fill={c} opacity="0.85"/>
      <path d="M24 20v-4a8 8 0 0116 0v4" stroke={c} strokeWidth="2" fill="none"/>
      <rect x="22" y="28" width="20" height="8" rx="3" fill={c} fillOpacity="0.3" stroke={c} strokeWidth="1.5"/>
    </svg>
  ),
  swagbox: (c) => (
    <svg viewBox="0 0 64 64" fill="none">
      <path d="M32 10L54 22v20L32 54 10 42V22z" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="1.5"/>
      <path d="M10 22l22 12 22-12M32 34v20" stroke={c} strokeWidth="1.5"/>
      <circle cx="32" cy="22" r="5" fill={c} opacity="0.9"/>
    </svg>
  ),
  vip: (c) => (
    <svg viewBox="0 0 64 64" fill="none">
      <path d="M32 8l6 12 14 2-10 10 2 14-12-6-12 6 2-14L12 22l14-2z" fill={c} opacity="0.9"/>
      <circle cx="32" cy="32" r="22" stroke={c} strokeWidth="1" opacity="0.3" strokeDasharray="4 3"/>
    </svg>
  ),
};

export default function PrizeIcon({ iconKey, tier, size = 52 }) {
  const c = TIER_META[tier]?.color || '#5A6A8A';
  const Icon = ICONS[iconKey] || ICONS.consolation;
  return <div style={{ width: size, height: size }}>{Icon(c)}</div>;
}
