import React, { useState, useRef, useCallback, useEffect } from 'react';
import { gameApi } from '../lib/api';
import { TIER_META, REEL_CARD_W, REEL_CARD_GAP, REEL_CARD_STEP, REEL_LEN } from '../lib/constants';
import { burst } from '../lib/particles';
import PrizeIcon from '../components/PrizeIcon';
import Topbar from '../components/Topbar';
import Spinner from '../components/Spinner';

// Build a reel of random items with the winning prize placed near the end
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
  return (
    <div
      className="shrink-0 w-[108px] h-[148px] rounded-[10px] border flex flex-col items-center justify-center gap-2.5 relative overflow-hidden"
      style={{
        borderColor: `${c}40`,
        background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
      <PrizeIcon iconKey={prize.iconKey} tier={prize.tier} size={44} />
      <span className="font-mono text-[0.6rem] font-bold tracking-[0.1em] uppercase" style={{ color: c, opacity: 0.9 }}>
        {TIER_META[prize.tier]?.label}
      </span>
    </div>
  );
}

export default function GameScreen({ session, prizes, onResult }) {
  const [phase, setPhase] = useState('idle');
  const [reelItems, setReelItems] = useState([]);
  const trackRef = useRef();

  // Initialize reel with random items for visual display
  useEffect(() => {
    if (prizes.length > 0) {
      setReelItems(Array.from({ length: 20 }, () =>
        prizes[Math.floor(Math.random() * prizes.length)]
      ));
    }
  }, [prizes]);

  const attemptsUsed = session.results ? session.results.length : 0;
  const attemptsLeft = session.totalAttempts - attemptsUsed;

  const openCase = useCallback(async () => {
    if (phase !== 'idle') return;
    setPhase('spinning');

    try {
      // Call server for the spin result
      const result = await gameApi.spin(session.sessionId);
      const winPrize = result.prize;

      // Build the reel with the server-determined winner
      const { items, winIdx } = buildReel(prizes, winPrize);
      setReelItems(items);

      // Animate after state update
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!trackRef.current) return;
        const vw = trackRef.current.parentElement?.offsetWidth || 860;
        const center = vw / 2 - REEL_CARD_W / 2;
        const target = -(winIdx * REEL_CARD_STEP - center);

        trackRef.current.style.transition = 'none';
        trackRef.current.style.transform = 'translateX(0)';
        requestAnimationFrame(() => {
          trackRef.current.style.transition = 'transform 3800ms cubic-bezier(0.08,1,0.2,1)';
          trackRef.current.style.transform = `translateX(${target}px)`;
        });
      }));

      // After animation finishes
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
    <div className="animate-screen-in flex flex-col min-h-screen">
      <Topbar
        left={<span className="text-sm font-semibold text-on-surface">{session.playerName}</span>}
        right={
          <div className="flex items-center gap-2">
            {Array.from({ length: session.totalAttempts }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < attemptsUsed
                    ? 'bg-primary shadow-[0_0_6px_var(--tw-shadow-color)]'
                    : 'bg-outline-variant/30'
                }`}
                style={{ '--tw-shadow-color': '#ff9159' }}
              />
            ))}
            <span className="font-mono text-xs text-on-surface-variant ml-2">
              {attemptsLeft} left
            </span>
          </div>
        }
      />

      <div className="flex-1 flex flex-col items-center justify-center w-full px-10 gap-8 pt-16">
        {/* Title */}
        <div className="text-center">
          <p className="text-[0.7rem] font-bold tracking-[0.14em] uppercase text-on-surface-variant mb-2">
            Attempt {attemptsUsed + 1} of {session.totalAttempts}
          </p>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight font-headline">
            {isSpinning ? 'Spinning...' : 'Open Your Case'}
          </h2>
        </div>

        {/* Reel */}
        <div className="w-full max-w-[860px]">
          <div className="reel-wrap relative h-[168px] rounded-2xl border border-outline-variant/30 overflow-hidden flex items-center"
               style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)' }}>
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-[140px] bg-gradient-to-r from-background to-transparent z-[2] pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-[140px] bg-gradient-to-l from-background to-transparent z-[2] pointer-events-none" />

            {/* Center marker */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 z-[3] -translate-x-1/2"
                 style={{ background: 'linear-gradient(180deg, transparent, #ff9159 30%, #ff9159 70%, transparent)', boxShadow: '0 0 16px rgba(232,97,26,0.5)' }} />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] pointer-events-none"
                 style={{ width: REEL_CARD_W + 8, height: REEL_CARD_W + 32, border: '2px solid rgba(232,97,26,0.4)', borderRadius: 12, boxShadow: '0 0 24px rgba(232,97,26,0.15), inset 0 0 24px rgba(232,97,26,0.05)' }} />

            {/* Scan line */}
            {isSpinning && (
              <div className="absolute left-0 right-0 h-0.5 z-[4] animate-scan"
                   style={{ background: 'linear-gradient(90deg, transparent, rgba(232,97,26,0.6), transparent)' }} />
            )}

            {/* Track */}
            <div className="pl-5 overflow-visible relative z-[1] w-full">
              <div ref={trackRef} className="flex gap-[10px] will-change-transform">
                {reelItems.map((p, i) => (
                  <ReelCard key={i} prize={p} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tier legend */}
        <div className="flex gap-5 items-center flex-wrap justify-center">
          {Object.entries(TIER_META).map(([tier, m]) => (
            <div key={tier} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: m.color, boxShadow: `0 0 6px ${m.glow}` }} />
              <span className="text-[0.7rem] font-semibold text-on-surface-variant tracking-[0.08em] uppercase">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="w-full max-w-[360px]">
          <button
            onClick={openCase}
            disabled={isSpinning || phase === 'done'}
            className="w-full h-14 rounded-xl bg-gradient-to-br from-primary to-primary-fixed text-black font-headline font-extrabold text-base tracking-[0.1em] transition-all hover:shadow-[0_0_32px_rgba(232,97,26,0.35),0_4px_16px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:shadow-none disabled:translate-y-0"
          >
            {isSpinning ? (
              <span className="flex items-center gap-2.5 justify-center">
                <Spinner /> OPENING...
              </span>
            ) : 'OPEN CASE'}
          </button>
        </div>
      </div>
    </div>
  );
}
