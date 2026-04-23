import React, { useEffect } from 'react';
import { TIER_META } from '../lib/constants';
import PrizeIcon from '../components/PrizeIcon';

export default function ResultScreen({ prize, attemptsLeft, onContinue }) {
  useEffect(() => { document.title = `${prize.name} — Zenith Comp Co.`; }, [prize.name]);

  const m = TIER_META[prize.tier];

  let badgeColor = 'bg-surface-container-highest text-on-surface';
  if (prize.tier === 'rare') badgeColor = 'bg-blue-500 text-white';
  if (prize.tier === 'epic') badgeColor = 'bg-purple-600 text-white';
  if (prize.tier === 'legendary') badgeColor = 'bg-primary text-on-primary';

  return (
    <div className="flex flex-col lg:h-screen lg:overflow-hidden bg-background text-on-surface font-body selection:bg-primary/20 selection:text-on-surface">

      {/* ── Header ── fixed 64px, matches WelcomeScreen ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur-xl border-b border-outline-variant shadow-sm">
        <div className="max-w-7xl mx-auto h-full px-8 flex items-center justify-between">
          <div className="text-lg font-black tracking-tight text-on-surface uppercase font-headline">
            <span className="text-primary">Zenith</span> Comp Co.
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-on-surface-variant font-medium hover:text-on-surface font-body tracking-wide uppercase text-xs transition-colors" href="#">Cases</a>
          </nav>
        </div>
      </header>

      {/* ── Main ── flex-1 fills between header and footer, locked on desktop ── */}
      <main className="flex-1 pt-16 lg:overflow-hidden lg:flex lg:flex-col">
        {/* Inner: two-column grid on desktop, stacked on mobile */}
        <div className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-8 py-6 flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-8 animate-screen-in">

          {/* ── Left — Prize Card (fills column height) ── */}
          <div className="relative min-h-[420px] lg:min-h-0 animate-result-pop">
            {/* Ambient glow */}
            <div
              className="absolute inset-0 blur-[80px] rounded-full opacity-20 pointer-events-none"
              style={{ backgroundColor: `${m.color}40` }}
            />

            {/* Card: h-full so it fills the grid cell */}
            <div className="relative h-full flex flex-col bg-white border border-outline-variant shadow-xl overflow-hidden">
              {/* Metallic glare */}
              <div className="absolute inset-0 metallic-glare pointer-events-none z-10" />

              {/* Rarity badge */}
              <div className="absolute top-0 right-0 p-4 z-20">
                <div className={`flex items-center gap-1 px-3 py-1 font-body font-bold text-xs uppercase tracking-widest ${badgeColor}`}>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                  {m.label}
                </div>
              </div>

              {/* Image area — flex-grow fills available card height */}
              <div className="flex-grow relative bg-surface-container-low overflow-hidden flex items-center justify-center">
                {prize.imageUrl ? (
                  <img
                    src={prize.imageUrl}
                    alt={prize.name}
                    width={280}
                    height={280}
                    className="w-[280px] h-[280px] object-contain relative z-10"
                  />
                ) : (
                  <div className="relative z-10">
                    <PrizeIcon iconKey={prize.iconKey || 'consolation'} tier={prize.tier} size={140} />
                  </div>
                )}

                {/* Corner accents */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
                  <div className="border-t-2 border-l-2 w-8 h-8" style={{ borderColor: `${m.color}60` }} />
                  <div className="self-end border-b-2 border-r-2 w-8 h-8" style={{ borderColor: `${m.color}60` }} />
                </div>
              </div>

              {/* Prize info strip at bottom of card */}
              <div className="flex-shrink-0 p-6 bg-white border-t border-outline-variant relative z-20">
                <p className="font-body text-xs font-bold uppercase tracking-widest mb-1" style={{ color: m.color }}>
                  Item Unlocked
                </p>
                <h3 className="font-headline text-xl font-bold text-on-surface tracking-tight leading-tight">
                  {prize.name}
                </h3>
                {prize.description && (
                  <p className="mt-1 text-xs text-on-surface-variant uppercase tracking-wide truncate">
                    {prize.description}
                  </p>
                )}
              </div>

              {/* Legendary accent stripes */}
              {prize.tier === 'legendary' && (
                <>
                  <div className="absolute -bottom-3 -left-3 w-20 h-3 bg-[repeating-linear-gradient(45deg,#E06020,#E06020_8px,#FAF8F6_8px,#FAF8F6_16px)] opacity-50" />
                  <div className="absolute -top-3 -right-3 w-20 h-3 bg-[repeating-linear-gradient(45deg,#E06020,#E06020_8px,#FAF8F6_8px,#FAF8F6_16px)] opacity-50" />
                </>
              )}
            </div>
          </div>

          {/* ── Right — Congratulations + Action ── */}
          <div className="flex flex-col justify-center gap-6 px-2 animate-result-pop" style={{ animationDelay: '150ms' }}>

            {/* Subtitle + heading */}
            <div>
              <p className="font-body text-xs font-bold uppercase tracking-[0.4em] mb-3" style={{ color: m.color }}>
                System Unlock Successful
              </p>
              <h1 className="font-headline text-5xl lg:text-6xl font-bold tracking-tight text-on-surface leading-none">
                CONGRATULATIONS!
              </h1>
              <div className="h-0.5 w-20 mt-5" style={{ backgroundColor: m.color }} />
            </div>

            {/* Tier badge */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className={`inline-flex items-center gap-1.5 px-4 py-2 font-body font-bold text-sm uppercase tracking-widest ${badgeColor}`}>
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                {m.label} Tier
              </div>
              <span className="text-xs text-on-surface-variant uppercase tracking-widest">Event Exclusive</span>
            </div>

            {/* Prize name with left accent border */}
            <div className="border-l-4 pl-5" style={{ borderColor: m.color }}>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Prize Unlocked</p>
              <h2 className="font-headline text-3xl lg:text-4xl font-bold text-on-surface tracking-tight">
                {prize.name}
              </h2>
              {prize.description && (
                <p className="mt-2 text-sm text-on-surface-variant">{prize.description}</p>
              )}
            </div>

            {/* CTA */}
            <div>
              <button
                onClick={onContinue}
                className="px-10 py-4 bg-primary text-on-primary font-headline font-bold text-base uppercase tracking-wide hover:bg-primary-fixed active:scale-95 transition-all shadow-[0_4px_16px_rgba(224,96,32,0.3)] hover:shadow-[0_6px_24px_rgba(224,96,32,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {attemptsLeft > 0 ? `CONTINUE · ${attemptsLeft} LEFT` : 'VIEW SUMMARY'}
              </button>
            </div>

            {/* Decorative accent bar */}
            <div className="flex items-center gap-2 opacity-30 pointer-events-none">
              <div className="h-0.5 w-12 bg-primary" />
              <div className="h-0.5 w-4 bg-primary/50" />
              <div className="h-0.5 w-1 bg-primary/30" />
            </div>

          </div>

        </div>
      </main>

      {/* ── Footer ── slim, matches WelcomeScreen ── */}
      <footer className="flex-shrink-0 bg-[#1A1410]">
        <div className="max-w-7xl mx-auto px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="font-body text-[10px] uppercase tracking-widest text-neutral-500">
            © 2026 Zenith Comp Co., Ltd. — Nutanix Cloud Native &amp; AI Innovation Day
          </p>
          <nav className="flex gap-6">
            {['Privacy Protocol', 'Service Terms', 'Terminal Support'].map(link => (
              <a key={link} href="#" className="text-[10px] uppercase tracking-widest text-neutral-600 hover:text-orange-400 transition-colors">
                {link}
              </a>
            ))}
          </nav>
        </div>
      </footer>

    </div>
  );
}
