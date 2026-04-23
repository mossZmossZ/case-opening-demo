import React, { useState, useRef, useCallback, useEffect } from 'react';
import { gameApi } from '../lib/api';
import { TIER_META, REEL_LEN } from '../lib/constants';
import { burst } from '../lib/particles';

const CARD_W    = 200;
const CARD_GAP  = 16;        // gap-4 = 16 px
const CARD_STEP = CARD_W + CARD_GAP; // 216 px per slot
const SPIN_DURATION = 5500;  // ms — CS:GO slow-reveal

// Short white-noise burst → mechanical click (CS:GO tick)
function playTick(audioCtx) {
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const sr     = audioCtx.sampleRate;
    const bufLen = Math.round(sr * 0.025);
    const buf    = audioCtx.createBuffer(1, bufLen, sr);
    const data   = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 8);
    }
    const src  = audioCtx.createBufferSource();
    src.buffer = buf;
    const gain = audioCtx.createGain();
    gain.gain.value = 0.12;
    src.connect(gain);
    gain.connect(audioCtx.destination);
    src.start();
  } catch { /* audio unavailable */ }
}

// Sentinel for blank filler slots in the reel
const EMPTY = { _empty: true };

// Real prizes appear roughly 1-in-4 slots; rest are blank fillers.
// This prevents repetition when the prize pool is small.
function buildReel(allPrizes, winPrize) {
  const pool = allPrizes.length > 0 ? allPrizes : [winPrize];
  const winIdx = REEL_LEN - 10;

  const items = Array.from({ length: REEL_LEN }, (_, i) => {
    if (i === winIdx) return winPrize;
    // Keep 2 slots either side of the win blank so the winner stands out
    if (Math.abs(i - winIdx) <= 2) return EMPTY;
    return Math.random() < 0.25
      ? pool[Math.floor(Math.random() * pool.length)]
      : EMPTY;
  });

  return { items, winIdx };
}

// Guarantee at least 1 empty slot between every prize card so the reel
// never looks like a repeated list, even with a pool of 1 prize.
function makeInitialReel(prizes) {
  const items = [];
  for (let i = 0; i < 20; i++) {
    // Prize slot: place a real prize, then always follow with at least 1 empty
    if (i % 4 === 1) {
      items.push(prizes[Math.floor(Math.random() * prizes.length)]);
    } else {
      items.push(EMPTY);
    }
  }
  return items;
}

function ReelCard({ prize }) {
  if (prize._empty) {
    return (
      <div className="shrink-0 w-[200px] aspect-square bg-surface-container-low border border-outline-variant flex items-center justify-center shadow-sm">
        <div className="w-12 h-12 border-2 border-dashed border-outline rounded-sm opacity-20" />
      </div>
    );
  }

  const c = TIER_META[prize.tier]?.color || '#5A6A8A';
  let rarityClass = 'border-b-4 border-outline-variant';
  if (prize.tier === 'rare')      rarityClass = 'rarity-blue';
  if (prize.tier === 'epic')      rarityClass = 'rarity-purple';
  if (prize.tier === 'legendary') rarityClass = 'rarity-gold glow-gold';

  return (
    <div className={`shrink-0 w-[200px] aspect-square bg-white border border-outline-variant ${rarityClass} flex flex-col items-center justify-center p-4 transition-colors shadow-sm`}>
      {prize.imageUrl ? (
        <img
          src={prize.imageUrl}
          alt={prize.name}
          width={120}
          height={120}
          className="w-[120px] h-[120px] object-contain mb-3"
        />
      ) : null}
      <span className="font-body font-bold uppercase text-xs tracking-wide text-center text-on-surface" style={{ color: prize.tier === 'legendary' ? c : undefined }}>
        {prize.name}
      </span>
    </div>
  );
}

export default function GameScreen({ session, prizes, onResult, onRefreshPrizes, onBackHome }) {
  const [phase, setPhase]         = useState('idle');
  const [reelItems, setReelItems] = useState([]);
  const [stats, setStats]         = useState({ liveDrops: [] });
  const [spinError, setSpinError] = useState('');
  const trackRef    = useRef();
  const audioCtxRef = useRef(null);
  const tickRafRef  = useRef(null);

  useEffect(() => {
    if (prizes.length > 0) setReelItems(makeInitialReel(prizes));
    gameApi.getStats().then(setStats).catch(console.error);
  }, [prizes]);

  useEffect(() => { document.title = 'Open Your Case — Zenith Comp Co.'; }, []);

  // Cleanup tick RAF if component unmounts mid-spin
  useEffect(() => () => { cancelAnimationFrame(tickRafRef.current); }, []);

  const attemptsUsed = session.results ? session.results.length : 0;
  const attemptsLeft = session.totalAttempts - attemptsUsed;

  const openCase = useCallback(async () => {
    if (phase !== 'idle') return;

    // Create AudioContext inside the user-gesture handler (browser autoplay policy)
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch { /* unavailable */ }
    }

    const prefersReducedMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 800 : SPIN_DURATION;

    setPhase('spinning');
    setSpinError('');

    try {
      const result   = await gameApi.spin(session.sessionId);
      const winPrize = result.prize;

      const { items, winIdx } = buildReel(prizes, winPrize);
      setReelItems(items);

      // Two rAF frames so React flushes the new items before we animate
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!trackRef.current) return;

        const vw     = trackRef.current.parentElement?.offsetWidth || 860;
        const center = vw / 2 - 100;
        const target = -(winIdx * (200 + 16) - center);

        trackRef.current.style.transition = 'none';
        trackRef.current.style.transform  = 'translateX(0)';

        requestAnimationFrame(() => {
          if (!trackRef.current) return;

          // CS:GO easing: rockets off fast, then long dramatic deceleration
          trackRef.current.style.transition =
            `transform ${duration}ms cubic-bezier(0.03,0.95,0.2,1)`;
          trackRef.current.style.transform = `translateX(${target}px)`;

          // Tick sound loop — fires each time a card crosses the centre marker
          if (!prefersReducedMotion && audioCtxRef.current) {
            let lastCardIdx = -1;
            let lastTickAt  = 0;

            const tickLoop = () => {
              if (!trackRef.current) return;
              const tStr = window.getComputedStyle(trackRef.current).transform;
              const tx   = tStr === 'none' ? 0 : new DOMMatrix(tStr).m41;
              const cardIdx = Math.round(-tx / CARD_STEP);
              const now     = performance.now();

              // Throttle: min 30 ms between ticks keeps fast phase as a blur,
              // slow phase as clear individual clicks
              if (cardIdx !== lastCardIdx && cardIdx > 0 && now - lastTickAt > 30) {
                lastCardIdx = cardIdx;
                lastTickAt  = now;
                playTick(audioCtxRef.current);
              }
              tickRafRef.current = requestAnimationFrame(tickLoop);
            };
            tickRafRef.current = requestAnimationFrame(tickLoop);
          }
        });
      }));

      setTimeout(() => {
        cancelAnimationFrame(tickRafRef.current);
        const reelEl = document.querySelector('.reel-wrap');
        if (reelEl) {
          const r     = reelEl.getBoundingClientRect();
          const count = winPrize.tier === 'legendary' ? 60 : winPrize.tier === 'epic' ? 44 : 28;
          burst(r.left + r.width / 2, r.top + r.height / 2, TIER_META[winPrize.tier].color, count);
        }
        setPhase('done');
        setTimeout(() => onResult(result), 500);
      }, duration + 200);

    } catch (err) {
      cancelAnimationFrame(tickRafRef.current);
      setPhase('idle');
      // Always refresh prizes — if pool is now empty, the empty state renders automatically
      onRefreshPrizes();
      // Only surface non-stock errors as an inline message (no alert)
      if (!err.message?.includes('No prizes available')) {
        setSpinError(err.message || 'Something went wrong. Please try again.');
      }
    }
  }, [phase, session.sessionId, prizes, onResult, onRefreshPrizes]);

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

        {prizes.length === 0 ? (
          /* ── Empty State: no prizes in stock ── */
          <div className="w-full max-w-7xl flex flex-col items-center justify-center gap-6 py-20 border border-outline-variant bg-surface-container-low">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 0" }}>inventory_2</span>
            <div className="text-center">
              <h2 className="font-headline text-2xl font-bold text-on-surface tracking-tight">All Prizes Claimed</h2>
              <p className="mt-2 text-sm text-on-surface-variant uppercase tracking-widest">The prize pool is currently empty. Check back soon.</p>
            </div>
            <button
              type="button"
              onClick={onBackHome}
              className="flex items-center gap-2 px-6 h-11 bg-primary text-on-primary text-sm font-bold uppercase tracking-wide hover:bg-primary-fixed transition-colors shadow-[0_2px_12px_rgba(224,96,32,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">home</span>
              Back to Home
            </button>
          </div>
        ) : (
          /* ── Reel Container ── */
          <div className="w-full max-w-7xl relative group reel-wrap">

            {/* Centre Indicator — shadow widens while spinning for drama */}
            <div className={`absolute left-1/2 top-[-20px] bottom-[-20px] w-0.5 bg-primary z-40 -translate-x-1/2 transition-shadow duration-500 ${
              isSpinning
                ? 'shadow-[0_0_28px_8px_rgba(224,96,32,0.65)]'
                : 'shadow-[0_0_12px_rgba(224,96,32,0.5)]'
            }`}>
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
        )}

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
              disabled={phase === 'done' || attemptsLeft === 0 || prizes.length === 0}
              className="group relative px-12 py-5 bg-primary text-on-primary hover:bg-primary-fixed transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:hover:scale-100 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(224,96,32,0.3)] hover:shadow-[0_8px_30px_rgba(224,96,32,0.45)]"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                <span className="font-headline font-bold text-xl uppercase tracking-tight">Spin</span>
              </div>
            </button>
          )}
          {spinError && (
            <p className="mt-4 text-sm text-red-600 font-medium text-center max-w-xs">{spinError}</p>
          )}
          <p className="mt-6 text-on-surface-variant text-xs uppercase tracking-widest font-medium">Attempt {attemptsUsed + 1} of {session.totalAttempts}</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#1A1410] mt-auto">
        <div className="font-body text-xs uppercase tracking-widest text-neutral-400">
          © 2026 Zenith Comp Co., Ltd. — Nutanix Cloud Native &amp; AI Innovation Day
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
