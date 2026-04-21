import React from 'react';
import { TIER_META, TIER_ORDER } from '../lib/constants';
import PrizeIcon from '../components/PrizeIcon';
import Topbar from '../components/Topbar';

export default function SummaryScreen({ session, onPlayAgain }) {
  const results = session.results || [];

  // Find best result by tier rank
  const best = results.reduce((b, r) =>
    TIER_ORDER.indexOf(r.tier) > TIER_ORDER.indexOf(b.tier) ? r : b
  , results[0]);

  const bestMeta = TIER_META[best?.tier] || TIER_META.common;

  return (
    <div className="animate-screen-in flex flex-col min-h-screen">
      <Topbar
        left={<span className="text-sm font-semibold text-on-surface">Summary</span>}
        right={<span className="text-xs text-on-surface-variant">{session.playerName}</span>}
      />

      <div className="flex-1 flex justify-center px-6 pt-20 pb-10 overflow-y-auto">
        <div className="w-full max-w-[560px]">

          {/* Best reward hero */}
          {best && (
            <div
              className="glass-panel border rounded-2xl p-7 mb-5 relative overflow-hidden"
              style={{ borderColor: `${bestMeta.color}30` }}
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-50"
                style={{ background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${bestMeta.glow} 0%, transparent 70%)` }}
              />
              <p className="text-[0.7rem] font-bold tracking-[0.14em] uppercase text-on-surface-variant mb-4 relative">
                Best Reward
              </p>
              <div className="flex items-center gap-5 relative">
                <div
                  className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    border: `1px solid ${bestMeta.color}`,
                    background: 'rgba(255,255,255,0.04)',
                    boxShadow: `0 0 20px ${bestMeta.glow}`,
                  }}
                >
                  <PrizeIcon iconKey={best.iconKey || 'consolation'} tier={best.tier} size={44} />
                </div>
                <div>
                  <p className="text-[0.7rem] font-bold tracking-[0.12em] uppercase mb-1" style={{ color: bestMeta.color }}>
                    {bestMeta.label}
                  </p>
                  <p className="text-2xl font-extrabold text-on-surface tracking-tight font-headline">
                    {best.prizeName}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* All results */}
          <div className="glass-panel border border-outline-variant/30 rounded-2xl overflow-hidden mb-7">
            <div className="px-5 py-4 border-b border-outline-variant/20">
              <p className="text-[0.7rem] font-bold tracking-[0.14em] uppercase text-on-surface-variant">
                {results.length} Open{results.length !== 1 ? 's' : ''}
              </p>
            </div>
            {results.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-surface-container-high"
                style={{ borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}
              >
                <span className="font-mono text-xs text-on-surface-variant/50 w-6 shrink-0">#{i + 1}</span>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ border: `1px solid ${TIER_META[r.tier]?.color || '#5A6A8A'}`, background: 'rgba(255,255,255,0.03)' }}
                >
                  <PrizeIcon iconKey={r.iconKey || 'consolation'} tier={r.tier} size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{r.prizeName}</p>
                </div>
                <span
                  className="text-xs font-bold tracking-[0.1em] uppercase shrink-0"
                  style={{ color: TIER_META[r.tier]?.color }}
                >
                  {TIER_META[r.tier]?.label}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onPlayAgain}
            className="w-full h-14 rounded-xl bg-gradient-to-br from-primary to-primary-fixed text-black font-headline font-extrabold text-base tracking-[0.08em] transition-all hover:shadow-[0_0_32px_rgba(232,97,26,0.35)] hover:-translate-y-0.5 active:translate-y-0"
          >
            Back to home
          </button>

          <p className="text-center mt-6 text-[0.65rem] tracking-[0.14em] text-on-surface-variant/40 uppercase">
            Zenith Comp Co., Ltd.
          </p>
        </div>
      </div>
    </div>
  );
}
