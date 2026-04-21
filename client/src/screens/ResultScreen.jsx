import React from 'react';
import { TIER_META } from '../lib/constants';
import PrizeIcon from '../components/PrizeIcon';

export default function ResultScreen({ prize, attemptsLeft, onContinue }) {
  const m = TIER_META[prize.tier];
  const isHigh = prize.tier === 'epic' || prize.tier === 'legendary';

  return (
    <div className="animate-screen-in flex items-center justify-center min-h-screen relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${m.glow} 0%, transparent 70%)` }}
      />

      {/* Pulse rings for legendary */}
      {prize.tier === 'legendary' && (
        <>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full z-0 animate-pulse-ring"
            style={{ border: `1px solid ${m.color}`, opacity: 0.15 }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full z-0 animate-pulse-ring"
            style={{ border: `1px solid ${m.color}`, opacity: 0.1, animationDelay: '0.6s' }}
          />
        </>
      )}

      <div className="relative z-10 text-center px-6 animate-result-pop">
        {/* Icon */}
        <div className="mb-7 animate-float">
          <div
            className="w-[120px] h-[120px] rounded-3xl mx-auto flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
              border: `2px solid ${m.color}`,
              boxShadow: `0 0 40px ${m.glow}, inset 0 0 24px ${m.glow}`,
            }}
          >
            <PrizeIcon iconKey={prize.iconKey} tier={prize.tier} size={70} />
          </div>
        </div>

        {/* Tier badge */}
        <div className="mb-3">
          <span
            className={`inline-block px-4 py-1.5 rounded-full text-[0.7rem] font-extrabold tracking-[0.18em] uppercase ${isHigh ? 'animate-tier-shine' : ''}`}
            style={{
              border: `1px solid ${m.color}`,
              color: m.color,
              background: `${m.color}15`,
            }}
          >
            {m.label}
          </span>
        </div>

        {/* Prize name */}
        <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tight text-on-surface mb-2 font-headline">
          {prize.name}
        </h2>
        <p className="text-base text-on-surface-variant mb-10">{prize.description}</p>

        {/* CTA */}
        <div className="max-w-[320px] mx-auto">
          <button
            onClick={onContinue}
            className="w-full h-14 rounded-xl bg-gradient-to-br from-primary to-primary-fixed text-black font-headline font-extrabold text-base tracking-[0.06em] transition-all hover:shadow-[0_0_32px_rgba(232,97,26,0.35)] hover:-translate-y-0.5 active:translate-y-0"
          >
            {attemptsLeft > 0 ? `CONTINUE \u00b7 ${attemptsLeft} LEFT` : 'VIEW SUMMARY'}
          </button>
        </div>
      </div>
    </div>
  );
}
