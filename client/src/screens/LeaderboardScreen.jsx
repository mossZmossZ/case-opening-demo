import React, { useState, useEffect } from 'react';
import { gameApi } from '../lib/api';
import { censorName } from '../lib/utils';
import { TIER_META, TIER_ORDER } from '../lib/constants';

// Descending tier order: legendary → epic → rare → common
const DISPLAY_ORDER = [...TIER_ORDER].reverse();

export default function LeaderboardScreen({ onBack, onAdmin }) {
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'Leaderboard — Zenith Comp Co.'; }, []);

  useEffect(() => {
    const fetchData = () => {
      gameApi.getLeaderboard()
        .then(data => { setDrops(data); setLoading(false); })
        .catch(() => setLoading(false));
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Group drops by tier, preserving DISPLAY_ORDER
  const grouped = DISPLAY_ORDER.reduce((acc, tier) => {
    acc[tier] = drops.filter(d => d.tier === tier);
    return acc;
  }, {});

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface font-body">

      {/* Skip link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-on-primary focus:text-sm focus:font-semibold">
        Skip to main content
      </a>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur-xl border-b border-outline-variant shadow-sm">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-lg font-black tracking-tight uppercase font-headline">
              <span className="text-primary">Zenith</span> Comp Co.
            </span>
            <nav aria-label="Primary" className="hidden md:flex gap-6">
              <button
                onClick={onBack}
                className="text-xs font-semibold tracking-wide uppercase transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none text-on-surface-variant hover:text-on-surface"
              >
                Cases
              </button>
              <span className="text-xs font-semibold tracking-wide uppercase text-primary border-b-2 border-primary pb-0.5">
                Leaderboard
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden xl:block text-[10px] tracking-[0.18em] text-on-surface-variant uppercase">
              Nutanix Cloud Native &amp; AI Innovation Day
            </span>
            <button
              onClick={onAdmin}
              className="text-xs font-semibold tracking-wide uppercase px-3 sm:px-4 py-2 border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Admin
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main id="main-content" className="flex-1 pt-16 flex flex-col">
        <div className="max-w-3xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6">

          {/* Heading */}
          <div className="text-center animate-screen-in">
            <span className="inline-block text-[10px] font-bold tracking-[0.28em] uppercase text-primary mb-2">
              Nutanix Cloud Native &amp; AI Innovation Day
            </span>
            <h1 className="text-2xl lg:text-3xl font-bold font-headline tracking-tight text-on-surface leading-tight" style={{ textWrap: 'balance' }}>
              Prize Drops
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              All drops sorted by prize tier — best first
            </p>
          </div>

          {/* Content */}
          <div className="animate-screen-in" style={{ animationDelay: '80ms' }}>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined animate-spin-loader" aria-hidden="true">progress_activity</span>
                Loading…
              </div>
            ) : drops.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant/50">
                <span className="material-symbols-outlined text-3xl mb-2" aria-hidden="true">emoji_events</span>
                <p className="text-sm italic">No drops yet. Be the first to open a case!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {/* Total count */}
                <p className="text-sm text-on-surface-variant mb-3">
                  <span className="font-bold text-on-surface tabular-nums">{drops.length}</span> total drops
                </p>

                {/* Tier sections */}
                <div className="bg-white border border-outline-variant shadow-md overflow-hidden" aria-live="polite">

                  {DISPLAY_ORDER.map((tier, sectionIdx) => {
                    const items = grouped[tier];
                    if (!items || items.length === 0) return null;
                    const meta = TIER_META[tier];

                    return (
                      <section key={tier} aria-label={`${meta.label} drops`}>
                        {/* Tier section header */}
                        <div className={`flex items-center gap-3 px-3 sm:px-5 py-2.5 border-b border-outline-variant/60 ${sectionIdx > 0 ? 'border-t border-outline-variant/40' : ''}`}
                          style={{ background: `${meta.color}12` }}
                        >
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.color }} aria-hidden="true" />
                          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: meta.color }}>
                            {meta.label}
                          </span>
                          <span className="text-[10px] text-on-surface-variant tabular-nums ml-auto">
                            {items.length} {items.length === 1 ? 'drop' : 'drops'}
                          </span>
                        </div>

                        {/* Column header */}
                        <div className="grid grid-cols-[1fr_1fr] sm:grid-cols-[1fr_1fr_64px] px-3 sm:px-5 py-2 bg-surface-container-low border-b border-outline-variant/40">
                          {['Player', 'Prize', 'Time'].map((col, i) => (
                            <span key={col} className={`text-[9px] font-bold tracking-[0.16em] uppercase text-on-surface-variant ${i === 2 ? 'text-right hidden sm:block' : ''}`}>
                              {col}
                            </span>
                          ))}
                        </div>

                        {/* Drop rows */}
                        <ul>
                          {items.map((drop, idx) => (
                            <li
                              key={idx}
                              className="grid grid-cols-[1fr_1fr] sm:grid-cols-[1fr_1fr_64px] px-3 sm:px-5 py-2.5 sm:py-3 items-center hover:bg-surface-container-low/50 transition-colors border-b border-outline-variant/20 last:border-0"
                            >
                              <span className="text-sm font-medium text-on-surface truncate min-w-0 pr-2" translate="no">
                                {censorName(drop.user)}
                              </span>
                              <span className="text-sm text-on-surface-variant truncate pr-2">
                                {drop.prizeName}
                              </span>
                              <span className="font-mono text-[10px] text-on-surface-variant/50 text-right tabular-nums hidden sm:block">
                                {drop.time
                                  ? new Date(drop.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : '—'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    );
                  })}

                </div>
              </div>
            )}
          </div>

          {/* Back */}
          <div className="flex justify-center animate-screen-in" style={{ animationDelay: '160ms' }}>
            <button
              onClick={onBack}
              className="text-sm font-semibold tracking-wide uppercase px-6 py-2.5 border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              ← Back to Cases
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 bg-[#1A1410]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500">
            © 2026 Zenith Comp Co., Ltd. — Nutanix Cloud Native &amp; AI Innovation Day
          </p>
        </div>
      </footer>

    </div>
  );
}
