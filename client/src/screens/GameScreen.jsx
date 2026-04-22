import React, { useState, useRef, useCallback, useEffect } from 'react';
import { gameApi } from '../lib/api';
import { TIER_META, REEL_CARD_W, REEL_CARD_GAP, REEL_CARD_STEP, REEL_LEN } from '../lib/constants';
import { burst } from '../lib/particles';

function buildReel(allPrizes, winPrize) {
  const items = Array.from({ length: REEL_LEN }, () =>
    allPrizes[Math.floor(Math.random() * allPrizes.length)]
  );
  const winIdx = REEL_LEN - 10;
  items[winIdx] = winPrize;
  return { items, winIdx };
}

function ReelCard({ prize }) {
  const c = TIER_META[prize.tier]?.color || '#5A6A8A';
  let rarityClass = 'rarity-blue';
  if (prize.tier === 'rare') rarityClass = 'rarity-blue';
  if (prize.tier === 'epic') rarityClass = 'rarity-purple';
  if (prize.tier === 'legendary') rarityClass = 'rarity-gold glow-gold';
  if (prize.tier === 'common') rarityClass = 'border-b-4 border-outline-variant';

  return (
    <div className={`shrink-0 w-[200px] aspect-square bg-white border border-outline-variant ${rarityClass} flex flex-col items-center justify-center p-4 transition-colors shadow-sm`}>
      <span className="material-symbols-outlined text-5xl mb-4 text-on-surface-variant" style={{ color: prize.tier === 'legendary' ? c : undefined }}>
        {prize.iconKey || 'token'}
      </span>
      <span className="font-body font-bold uppercase text-xs tracking-wide text-center text-on-surface" style={{ color: prize.tier === 'legendary' ? c : undefined }}>
        {prize.name}
      </span>
    </div>
  );
}

export default function GameScreen({ session, prizes, onResult }) {
  const [phase, setPhase] = useState('idle');
  const [reelItems, setReelItems] = useState([]);
  const [stats, setStats] = useState({ liveDrops: [] });
  const trackRef = useRef();

  useEffect(() => {
    if (prizes.length > 0) {
      setReelItems(Array.from({ length: 20 }, () =>
        prizes[Math.floor(Math.random() * prizes.length)]
      ));
    }
    gameApi.getStats().then(setStats).catch(console.error);
  }, [prizes]);

  const attemptsUsed = session.results ? session.results.length : 0;
  const attemptsLeft = session.totalAttempts - attemptsUsed;

  const openCase = useCallback(async () => {
    if (phase !== 'idle') return;
    setPhase('spinning');

    try {
      const result = await gameApi.spin(session.sessionId);
      const winPrize = result.prize;

      const { items, winIdx } = buildReel(prizes, winPrize);
      setReelItems(items);

      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!trackRef.current) return;
        const vw = trackRef.current.parentElement?.offsetWidth || 860;
        const center = vw / 2 - 100;
        const target = -(winIdx * (200 + 16) - center);

        trackRef.current.style.transition = 'none';
        trackRef.current.style.transform = 'translateX(0)';
        requestAnimationFrame(() => {
          trackRef.current.style.transition = 'transform 3800ms cubic-bezier(0.08,1,0.2,1)';
          trackRef.current.style.transform = `translateX(${target}px)`;
        });
      }));

      setTimeout(() => {
        const reelEl = document.querySelector('.reel-wrap');
        if (reelEl) {
          const r = reelEl.getBoundingClientRect();
          const count = winPrize.tier === 'legendary' ? 60 : winPrize.tier === 'epic' ? 44 : 28;
          burst(r.left + r.width / 2, r.top + r.height / 2, TIER_META[winPrize.tier].color, count);
        }
        setPhase('done');
        setTimeout(() => onResult(result), 500);
      }, 3900);
    } catch (err) {
      setPhase('idle');
      alert(err.message);
    }
  }, [phase, session.sessionId, prizes, onResult]);

  const isSpinning = phase === 'spinning';

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/20 selection:text-on-surface overflow-x-hidden min-h-screen flex flex-col">

      {/* Header */}
      <header className="fixed top-0 w-full flex items-center justify-between px-8 py-4 bg-white/95 backdrop-blur-xl z-50 border-b border-outline-variant shadow-sm">
        <div className="text-xl font-black tracking-tight text-on-surface uppercase font-headline">
          <span className="text-primary">Zenith</span> Comp Co.
        </div>
        <nav className="hidden md:flex items-center gap-8 font-body tracking-wide uppercase text-xs">
          <a className="text-primary border-b-2 border-primary pb-1 font-bold" href="#">Cases</a>
        </nav>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase text-on-surface-variant mr-4">{session.playerName}</span>
          <div className="flex gap-1.5">
            {Array.from({ length: session.totalAttempts }).map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all border ${i < attemptsUsed ? 'bg-primary border-primary shadow-[0_0_6px_rgba(224,96,32,0.4)]' : 'bg-transparent border-outline-variant'}`} />
            ))}
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 px-4 md:px-12 flex-grow flex flex-col items-center justify-center relative overflow-hidden animate-screen-in">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/6 blur-[140px] rounded-full -z-10"></div>

        {/* Case Header */}
        <div className="w-full max-w-6xl mb-12 flex justify-between items-end border-b border-outline-variant pb-6">
          <div>
            <h2 className="text-on-surface-variant font-body uppercase tracking-[0.2em] text-xs mb-2">Operation: Cloud Native</h2>
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-on-surface">Innovation Case</h1>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-on-surface-variant text-xs uppercase tracking-widest mt-1">Nutanix AI Integration Tier</p>
          </div>
        </div>

        {/* Reel Container */}
        <div className="w-full max-w-7xl relative group reel-wrap">
          {/* Center Indicator */}
          <div className="absolute left-1/2 top-[-20px] bottom-[-20px] w-0.5 bg-primary z-40 -translate-x-1/2 shadow-[0_0_12px_rgba(224,96,32,0.5)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45"></div>
          </div>
          {/* Fade edges */}
          <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-surface to-transparent z-30 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-surface to-transparent z-30 pointer-events-none"></div>

          {/* The Reel */}
          <div className="bg-surface-container-low overflow-hidden border border-outline-variant py-8 relative shadow-inner">
            <div className="overflow-hidden no-scrollbar px-4">
              <div ref={trackRef} className="flex gap-4 will-change-transform" style={{ width: 'max-content' }}>
                {reelItems.map((p, i) => (
                  <ReelCard key={i} prize={p} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interaction Zone */}
        <div className="mt-16 flex flex-col items-center">
          {isSpinning ? (
            <div className="mb-8 text-center animate-pulse">
              <span className="font-body text-primary text-lg font-bold uppercase tracking-[0.3em]">Spinning...</span>
              <div className="w-64 h-0.5 bg-outline-variant mt-4">
                <div className="h-full bg-gradient-to-r from-primary to-primary-fixed w-3/4 animate-scan"></div>
              </div>
            </div>
          ) : (
            <button
              onClick={openCase}
              disabled={phase === 'done' || attemptsLeft === 0}
              className="group relative px-12 py-5 bg-primary text-on-primary hover:bg-primary-fixed transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:hover:scale-100 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(224,96,32,0.3)] hover:shadow-[0_8px_30px_rgba(224,96,32,0.45)]"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                <span className="font-headline font-bold text-xl uppercase tracking-tight">Spin</span>
              </div>
            </button>
          )}
          <p className="mt-6 text-on-surface-variant text-xs uppercase tracking-widest font-medium">Attempt {attemptsUsed + 1} of {session.totalAttempts}</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#1A1410] mt-auto">
        <div className="font-body text-xs uppercase tracking-widest text-neutral-400">
          © 2024 Zenith Comp Co., Ltd. — Nutanix Cloud Native &amp; AI Innovation Day
        </div>
        <div className="flex gap-8">
          <a className="font-body text-xs uppercase tracking-widest text-neutral-500 hover:text-orange-400 transition-colors" href="#">Privacy Protocol</a>
          <a className="font-body text-xs uppercase tracking-widest text-neutral-500 hover:text-orange-400 transition-colors" href="#">Service Terms</a>
          <a className="font-body text-xs uppercase tracking-widest text-neutral-500 hover:text-orange-400 transition-colors" href="#">Terminal Support</a>
        </div>
      </footer>
    </div>
  );
}
