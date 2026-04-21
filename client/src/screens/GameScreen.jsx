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
  if (prize.tier === 'common') rarityClass = 'border-b-4 border-surface-container-highest';

  return (
    <div className={`shrink-0 w-[200px] aspect-square bg-surface-container-high ${rarityClass} flex flex-col items-center justify-center p-4 transition-colors`}>
      <span className="material-symbols-outlined text-5xl mb-4 text-on-surface-variant" style={{ color: prize.tier === 'legendary' ? c : undefined }}>
        {prize.iconKey || 'token'}
      </span>
      <span className="font-headline font-bold uppercase text-xs tracking-tighter text-center" style={{ color: prize.tier === 'legendary' ? c : undefined }}>
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
        const center = vw / 2 - 100; // 200px / 2
        const target = -(winIdx * (200 + 16) - center); // 200px width + 16px gap

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
    <div className="bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary overflow-x-hidden min-h-screen flex flex-col">
      {/* TopAppBar Shell */}
      <header className="fixed top-0 w-full flex items-center justify-between px-8 py-4 bg-neutral-950/80 backdrop-blur-xl z-50 shadow-[0_4px_20px_rgba(255,107,0,0.1)]">
        <div className="text-2xl font-black tracking-tighter text-orange-500 uppercase font-headline">Zenith Comp Co.</div>
        <nav className="hidden md:flex items-center gap-8 font-headline tracking-tighter uppercase">
          <a className="text-orange-500 border-b-2 border-orange-500 pb-1" href="#">Cases</a>
          <a className="text-neutral-400 font-medium hover:text-neutral-200 transition-all duration-150" href="#">Inventory</a>
          <a className="text-neutral-400 font-medium hover:text-neutral-200 transition-all duration-150" href="#">Leaderboard</a>
          <a className="text-neutral-400 font-medium hover:text-neutral-200 transition-all duration-150" href="#">Hardware</a>
        </nav>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase text-on-surface-variant mr-4">{session.playerName}</span>
          <div className="flex gap-1.5">
            {Array.from({ length: session.totalAttempts }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${i < attemptsUsed ? 'bg-primary shadow-[0_0_6px_#ff9159]' : 'bg-outline-variant/30'}`} />
            ))}
          </div>
        </div>
      </header>
      <div className="fixed top-[72px] bg-gradient-to-b from-neutral-800 to-transparent h-px w-full z-50"></div>

      <main className="pt-32 pb-24 px-4 md:px-12 flex-grow flex flex-col items-center justify-center relative overflow-hidden animate-screen-in">
        {/* Ambient Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full -z-10"></div>

        {/* Case Header */}
        <div className="w-full max-w-6xl mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-on-surface-variant font-headline uppercase tracking-[0.2em] text-sm mb-2">Operation: Cloud Native</h2>
            <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter uppercase">Titan Innovation Case</h1>
          </div>
          <div className="text-right hidden md:block">
            <span className="text-primary font-headline text-2xl font-bold tracking-tighter">LEVEL 42 ACCESS</span>
            <p className="text-on-surface-variant text-xs uppercase tracking-widest mt-1">Nutanix AI Integration Tier</p>
          </div>
        </div>

        {/* The Kinetic Foundry Reel Container */}
        <div className="w-full max-w-7xl relative group reel-wrap">
          {/* Center Indicator */}
          <div className="absolute left-1/2 top-[-20px] bottom-[-20px] w-1 bg-primary z-40 -translate-x-1/2 shadow-[0_0_15px_#ff9159]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rotate-45"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rotate-45"></div>
          </div>
          {/* Fade Edges */}
          <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-surface to-transparent z-30 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-surface to-transparent z-30 pointer-events-none"></div>

          {/* The Reel */}
          <div className="bg-surface-container-lowest overflow-hidden border-y border-outline-variant/20 py-8 relative">
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
              <span className="font-headline text-primary-fixed-dim text-xl font-bold uppercase tracking-[0.3em]">Spinning...</span>
              <div className="w-64 h-1 bg-surface-container-high mt-4">
                <div className="h-full bg-gradient-to-r from-primary to-primary-fixed-dim w-3/4 animate-scan"></div>
              </div>
            </div>
          ) : (
            <button
              onClick={openCase}
              disabled={phase === 'done' || attemptsLeft === 0}
              className="group relative px-12 py-5 bg-primary-container hover:bg-primary-fixed transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:bg-surface-container-high disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined font-bold" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>
                <span className="font-headline font-black text-2xl uppercase tracking-tighter">Execute Innovation Spin</span>
              </div>
              <div className="absolute -inset-1 bg-primary/20 blur-xl group-hover:bg-primary/40 -z-10 transition-all"></div>
            </button>
          )}
          <p className="mt-6 text-on-surface-variant text-xs uppercase tracking-widest font-medium">Attempt {attemptsUsed + 1} of {session.totalAttempts}</p>
        </div>

        {/* Inventory Preview (Bento Grid Style) */}
        <section className="w-full max-w-6xl mt-32 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 bg-surface-container-high p-8 flex flex-col justify-between min-h-[240px]">
            <div>
              <h3 className="font-headline font-bold text-2xl uppercase tracking-tighter mb-2">Terminal Analytics</h3>
              <p className="text-on-surface-variant text-sm">System performance during current session.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-surface-container-lowest p-4">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Luck Modifier</p>
                <p className="text-xl font-headline font-black text-primary">+1.4x</p>
              </div>
              <div className="bg-surface-container-lowest p-4">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Global Drops</p>
                <p className="text-xl font-headline font-black">1.2M</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low p-8 border-l-4 border-primary">
            <h3 className="font-headline font-bold text-lg uppercase tracking-tighter mb-4">Live Drops</h3>
            <div className="space-y-4">
              {stats.liveDrops.slice(0, 3).map((drop, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${drop.tier === 'legendary' ? 'bg-primary' : drop.tier === 'epic' ? 'bg-purple-500' : drop.tier === 'rare' ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
                  <span className="text-xs font-bold font-headline uppercase truncate w-[140px] text-on-surface-variant">
                    {drop.user} • <span className="text-on-surface">{drop.name}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-highest p-8 relative overflow-hidden group">
            <div className="absolute inset-0 opacity-20 transition-transform duration-700 group-hover:scale-110">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-transparent"></div>
              <img alt="Cyberpunk tech texture" className="w-full h-full object-cover mix-blend-overlay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTBwCfWtlY03DUpwVBVt3bLi4oExwL22T5xEblOEQksT9DaJzTkrO5iMDU_GPi70-lDYpD8RYJzE515tvptPus6lJ-0YWmH04CEmNpwTseOl1lYay721a-3zIHFjewQAr-8B5AQo3D2ynzH-bl7g89XW3z-JBj9HRy2O1SVh1JGFo4oqRUtR_U3Lh5UEa9wOInm4iWs98kjwaJiUsdBcdqfJEoVwm4NZM35LpqZwp1_ElSAICwgACgRNBGY1AtqRm3W2PqRAeLZARw"/>
            </div>
            <div className="relative z-10">
              <h3 className="font-headline font-bold text-lg uppercase tracking-tighter mb-2">Upgrade Slot</h3>
              <p className="text-xs text-on-surface-variant mb-4">Enhance your drop rates with kinetic cores.</p>
              <button className="text-[10px] font-bold uppercase tracking-widest border border-outline px-3 py-2 hover:bg-on-surface hover:text-surface transition-colors">Install Core</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Shell */}
      <footer className="w-full py-6 px-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-neutral-950 border-t border-neutral-900 mt-auto">
        <div className="font-body text-xs uppercase tracking-widest text-neutral-600">
            © 2024 Zenith Comp Co., Ltd. - Nutanix Cloud Native & AI Innovation Day
        </div>
        <div className="flex gap-8">
          <a className="font-body text-xs uppercase tracking-widest text-neutral-600 hover:text-orange-400 transition-colors" href="#">Privacy Protocol</a>
          <a className="font-body text-xs uppercase tracking-widest text-neutral-600 hover:text-orange-400 transition-colors" href="#">Service Terms</a>
          <a className="font-body text-xs uppercase tracking-widest text-neutral-600 hover:text-orange-400 transition-colors" href="#">Terminal Support</a>
        </div>
      </footer>
    </div>
  );
}
