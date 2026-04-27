import React, { useEffect, useState } from 'react';
import { TIER_META, TIER_ORDER } from '../lib/constants';
import PrizeIcon from '../components/PrizeIcon';

export default function SummaryScreen({ session, onPlayAgain }) {
  const [traceCopied, setTraceCopied] = useState(false);

  useEffect(() => { document.title = 'Your Results — Zenith Comp Co.'; }, []);

  function handleCopyTrace() {
    navigator.clipboard.writeText(session.traceId).catch(() => {});
    setTraceCopied(true);
    setTimeout(() => setTraceCopied(false), 2000);
  }
  const results = session.results || [];

  // Index-based best to handle identical-object edge cases
  const bestIdx = results.length > 0
    ? results.reduce((bi, r, i) =>
      TIER_ORDER.indexOf(r.tier) > TIER_ORDER.indexOf(results[bi].tier) ? i : bi
      , 0)
    : -1;
  const best = bestIdx >= 0 ? results[bestIdx] : null;
  const bestMeta = TIER_META[best?.tier] || TIER_META.common;

  function badgeClass(tier) {
    if (tier === 'rare') return 'bg-blue-500 text-white';
    if (tier === 'epic') return 'bg-purple-600 text-white';
    if (tier === 'legendary') return 'bg-primary text-on-primary';
    return 'bg-surface-container-highest text-on-surface';
  }

  return (
    <div className="min-h-dvh flex flex-col overflow-x-hidden lg:h-screen lg:overflow-hidden bg-background text-on-surface font-body selection:bg-primary/20 animate-screen-in">

      {/* ── Header ── fixed 64px, matches all other screens ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur-xl border-b border-outline-variant shadow-sm">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <div className="max-w-[116px] sm:max-w-none truncate whitespace-nowrap text-base sm:text-lg font-black tracking-tight uppercase font-headline">
              <span className="text-primary">Zenith</span> Comp Co.
            </div>
            <span className="hidden md:block text-[10px] font-bold tracking-[0.25em] uppercase text-on-surface-variant border-l border-outline-variant pl-6">
              Session Complete
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest truncate max-w-[80px] sm:max-w-[180px]">
              {session.playerName}
            </span>
            <div className="px-3 py-1 bg-primary/10 border border-primary/20">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                {results.length} Open{results.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── viewport-locked on desktop ── */}
      <main className="flex-1 pt-16 flex flex-col lg:overflow-hidden">
        <div className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-4 sm:px-8 py-4 sm:py-6 flex flex-col gap-5 lg:grid lg:grid-cols-[2fr_3fr] lg:gap-8">

          {/* ── Left — Best Reward Card ── */}
          {best ? (
            <div className="relative min-h-[260px] sm:min-h-[360px] lg:min-h-0 animate-result-pop">
              {/* Ambient glow */}
              <div
                className="absolute inset-0 blur-[80px] rounded-full opacity-20 pointer-events-none"
                style={{ backgroundColor: `${bestMeta.color}40` }}
              />

              {/* Card fills column height */}
              <div className="relative h-full flex flex-col bg-white border border-outline-variant shadow-xl overflow-hidden">
                <div className="absolute inset-0 metallic-glare pointer-events-none z-10" />

                {/* Section label */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 pt-5 pb-4 border-b border-outline-variant relative z-20">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                    Best Reward
                  </p>
                  <div className={`flex items-center gap-1 px-3 py-1 font-body font-bold text-xs uppercase tracking-widest ${badgeClass(best.tier)}`}>
                    <span className="material-symbols-outlined text-sm" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    {bestMeta.label}
                  </div>
                </div>

                {/* Image area */}
                <div className="flex-grow relative bg-surface-container-low overflow-hidden flex items-center justify-center">
                  {best.imageUrl ? (
                    <img
                      src={best.imageUrl}
                      alt={best.name}
                      width={240}
                      height={240}
                      className="w-[240px] h-[240px] object-contain relative z-10"
                    />
                  ) : (
                    <div className="relative z-10">
                      <PrizeIcon iconKey={best.iconKey || 'consolation'} tier={best.tier} size={120} />
                    </div>
                  )}

                  {/* Corner accents */}
                  <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
                    <div className="border-t-2 border-l-2 w-8 h-8" style={{ borderColor: `${bestMeta.color}60` }} />
                    <div className="self-end border-b-2 border-r-2 w-8 h-8" style={{ borderColor: `${bestMeta.color}60` }} />
                  </div>
                </div>

                {/* Prize info strip */}
                <div className="flex-shrink-0 p-6 bg-white border-t border-outline-variant relative z-20">
                  <p className="font-body text-xs font-bold uppercase tracking-widest mb-1" style={{ color: bestMeta.color }}>
                    Item Unlocked
                  </p>
                  <h2 className="font-headline text-xl font-bold text-on-surface tracking-tight leading-tight truncate">
                    {best.name}
                  </h2>
                  {best.description && (
                    <p className="mt-1 text-xs text-on-surface-variant uppercase tracking-wide truncate">
                      {best.description}
                    </p>
                  )}
                </div>

                {/* Legendary accent stripes */}
                {best.tier === 'legendary' && (
                  <>
                    <div className="absolute -bottom-3 -left-3 w-20 h-3 bg-[repeating-linear-gradient(45deg,#E06020,#E06020_8px,#FAF8F6_8px,#FAF8F6_16px)] opacity-50" />
                    <div className="absolute -top-3 -right-3 w-20 h-3 bg-[repeating-linear-gradient(45deg,#E06020,#E06020_8px,#FAF8F6_8px,#FAF8F6_16px)] opacity-50" />
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden lg:block" />
          )}

          {/* ── Right — All Unlocks + CTA ── */}
          <div className="flex flex-col min-h-0 gap-4 animate-screen-in" style={{ animationDelay: '150ms' }}>

            {/* Section header */}
            <div className="flex-shrink-0 flex items-end justify-between border-b border-outline-variant pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant mb-1">Your Unlocks</p>
                <h2 className="font-headline text-xl font-bold text-on-surface tracking-tight">
                  {results.length} Prize{results.length !== 1 ? 's' : ''} Revealed
                </h2>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{session.playerName}</p>
                <p className="text-xs font-bold text-on-surface uppercase tracking-widest">
                  {session.totalAttempts} Attempt{session.totalAttempts !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Attempt cards — scrollable safety net */}
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 pr-1">
              {results.map((r, i) => {
                const meta = TIER_META[r.tier] || TIER_META.common;
                const isBest = i === bestIdx;

                return (
                  <div
                    key={i}
                    className="flex-shrink-0 relative flex items-center gap-3 p-3 sm:gap-4 sm:p-4 bg-white border border-outline-variant shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Best prize left accent strip */}
                    {isBest && (
                      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: meta.color }} />
                    )}

                    {/* Attempt number */}
                    <div className="flex-shrink-0 w-6 sm:w-8 text-center pl-1">
                      <span className="font-mono text-xs font-bold text-on-surface-variant">#{i + 1}</span>
                    </div>

                    {/* Prize image or icon */}
                    <div
                      className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-surface-container-low border flex items-center justify-center overflow-hidden"
                      style={{ borderColor: `${meta.color}40` }}
                    >
                      {r.imageUrl ? (
                        <img
                          src={r.imageUrl}
                          alt={r.name}
                          width={56}
                          height={56}
                          className="w-12 h-12 sm:w-[56px] sm:h-[56px] object-contain"
                        />
                      ) : (
                        <PrizeIcon iconKey={r.iconKey || 'consolation'} tier={r.tier} size={36} />
                      )}
                    </div>

                    {/* Prize name + description */}
                    <div className="flex-1 min-w-0">
                      <p className="font-headline font-bold text-sm text-on-surface truncate">{r.name}</p>
                      {r.description && (
                        <p className="text-xs text-on-surface-variant truncate mt-0.5">{r.description}</p>
                      )}
                      <div className="mt-1 flex items-center gap-2 sm:hidden">
                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 font-body font-bold text-[9px] uppercase tracking-wide ${badgeClass(r.tier)}`}>
                          <span className="material-symbols-outlined text-[10px]" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                          {meta.label}
                        </div>
                        {isBest && (
                          <span
                            className="text-[9px] font-bold uppercase tracking-wide flex items-center gap-0.5"
                            style={{ color: meta.color }}
                          >
                            <span className="material-symbols-outlined text-[10px]" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                            Best
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tier badge + best indicator */}
                    <div className="hidden flex-shrink-0 sm:flex flex-col items-end gap-1">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 font-body font-bold text-[10px] uppercase tracking-widest ${badgeClass(r.tier)}`}>
                        <span className="material-symbols-outlined text-[10px]" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                        {meta.label}
                      </div>
                      {isBest && (
                        <span
                          className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-0.5"
                          style={{ color: meta.color }}
                        >
                          <span className="material-symbols-outlined text-[10px]" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                          Best
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="flex-shrink-0 pt-3 border-t border-outline-variant flex flex-col gap-2">

              {/* Jaeger trace ID — always visible; shows "none" when Istio is absent */}
              <div className="flex items-center gap-2 px-1 min-w-0">
                <span className="flex-shrink-0 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Jaeger ID:
                </span>
                {session.traceId ? (
                  <>
                    <span
                      translate="no"
                      title={session.traceId}
                      className="font-mono text-[10px] text-primary truncate min-w-0"
                    >
                      {session.traceId}
                    </span>
                    <button
                      onClick={handleCopyTrace}
                      aria-label={traceCopied ? 'Copied!' : 'Copy Jaeger trace ID'}
                      className="flex-shrink-0 flex items-center justify-center w-5 h-5 text-on-surface-variant hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
                    >
                      <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
                        {traceCopied ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </>
                ) : (
                  <span className="font-mono text-[10px] text-on-surface-variant/40">none</span>
                )}
              </div>

              <button
                onClick={onPlayAgain}
                className="w-full h-12 bg-primary text-on-primary font-headline font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary-fixed active:scale-[0.98] transition-[background-color,box-shadow,transform] shadow-[0_2px_12px_rgba(224,96,32,0.25)] hover:shadow-[0_4px_20px_rgba(224,96,32,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                Back to Home
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* ── Footer ── slim, matches all other screens ── */}
      <footer className="flex-shrink-0 bg-[#1A1410]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="font-body text-[10px] uppercase tracking-widest text-neutral-500">
            © 2026 Zenith Comp Co., Ltd. — Nutanix Cloud Native &amp; AI Innovation Day
          </p>

        </div>
      </footer>

    </div>
  );
}
