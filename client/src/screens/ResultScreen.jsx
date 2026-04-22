import React from 'react';
import { TIER_META } from '../lib/constants';

export default function ResultScreen({ prize, attemptsLeft, onContinue }) {
  const m = TIER_META[prize.tier];

  let badgeColor = 'bg-surface-container-highest text-on-surface';
  if (prize.tier === 'rare') badgeColor = 'bg-blue-500 text-white';
  if (prize.tier === 'epic') badgeColor = 'bg-purple-600 text-white';
  if (prize.tier === 'legendary') badgeColor = 'bg-primary text-on-primary';

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/20 selection:text-on-surface min-h-screen flex flex-col overflow-x-hidden animate-screen-in">

      {/* Header */}
      <header className="fixed top-0 w-full flex items-center justify-between px-8 py-4 bg-white/95 backdrop-blur-xl z-50 border-b border-outline-variant shadow-sm">
        <div className="text-xl font-black tracking-tight text-on-surface uppercase font-headline">
          <span className="text-primary">Zenith</span> Comp Co.
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a className="text-on-surface-variant font-medium hover:text-on-surface font-body tracking-wide uppercase text-xs transition-colors" href="#">Cases</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center relative px-6 industrial-grid pt-20 pb-20">
        {/* Background ambient glows */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full blur-[140px] opacity-30" style={{ backgroundColor: `${m.color}30` }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[80px] opacity-40" style={{ backgroundColor: `${m.color}20` }}></div>
        </div>

        {/* Congratulations */}
        <div className="relative z-10 text-center mb-12 animate-result-pop">
          <h2 className="font-body text-sm tracking-[0.4em] uppercase font-bold mb-2" style={{ color: m.color }}>System Unlock Successful</h2>
          <h1 className="font-headline text-6xl md:text-7xl font-bold tracking-tight text-on-surface leading-none">
            CONGRATULATIONS!
          </h1>
          <div className="h-0.5 w-20 mx-auto mt-6" style={{ backgroundColor: m.color }}></div>
        </div>

        {/* Prize Card */}
        <div className="relative group animate-result-pop" style={{ animationDelay: '150ms' }}>
          <div className="absolute inset-0 blur-[80px] rounded-full scale-110 opacity-30 group-hover:opacity-50 transition-opacity" style={{ backgroundColor: `${m.color}40` }}></div>

          <div className="relative w-80 md:w-96 aspect-[3/4] bg-white border border-outline-variant overflow-hidden flex flex-col shadow-xl">
            {/* Metallic glare */}
            <div className="absolute inset-0 metallic-glare pointer-events-none z-10"></div>

            {/* Rarity badge */}
            <div className="absolute top-0 right-0 p-4 z-20">
              <div className={`flex items-center gap-1 px-3 py-1 font-body font-bold text-xs uppercase tracking-widest ${badgeColor}`}>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                {m.label}
              </div>
            </div>

            {/* Prize Image */}
            <div className="flex-grow relative bg-surface-container-low overflow-hidden flex items-center justify-center">
              <img alt="Cloud Innovation Hardware" className="absolute inset-0 w-full h-full object-cover opacity-20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_vKQR1eQfjZC_CC1QTuykXHDUzf8lXiuS6s757btAADuisNecAqIyUP8rd8a-n3jffwpKQ62TcFYnNUNf8o5eC6AdYZ7o5XqmcVw8XRhQmjMhoQ0KIO2sqK70Kkv3Ih8XS3n_MaYi4cd18HvYlXhA3FsaRY9jblsh4wN7bG7W_ZsHHE8Sglj9AL3ffDpB2STdc9ihe1mASI3Cn1XuzT5imsDflbkuPdrt31WET9l3boNUYm9Q6X6vpV8HX3PZZaJ5aMhzOqtTsPvQ" />
              <span className="material-symbols-outlined relative z-20 text-[100px]" style={{ color: m.color }}>{prize.iconKey || 'token'}</span>

              {/* Corner accents */}
              <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
                <div className="border-t-2 border-l-2 w-8 h-8" style={{ borderColor: `${m.color}60` }}></div>
                <div className="self-end border-b-2 border-r-2 w-8 h-8" style={{ borderColor: `${m.color}60` }}></div>
              </div>
            </div>

            {/* Prize Info */}
            <div className="p-8 bg-white border-t border-outline-variant relative z-20">
              <p className="font-body text-xs font-bold uppercase tracking-widest mb-1" style={{ color: m.color }}>Item Unlocked</p>
              <h3 className="font-headline text-2xl font-bold text-on-surface tracking-tight leading-tight">
                {prize.name}
              </h3>
              <div className="mt-4 flex items-center justify-between text-[10px] uppercase font-bold tracking-wide text-on-surface-variant">
                <span>{prize.description}</span>
                <span style={{ color: m.color }}>Event Exclusive</span>
              </div>
            </div>
          </div>

          {/* Legendary accent stripes */}
          {prize.tier === 'legendary' && (
            <>
              <div className="absolute -bottom-3 -left-3 w-20 h-3 bg-[repeating-linear-gradient(45deg,#E06020,#E06020_8px,#FAF8F6_8px,#FAF8F6_16px)] opacity-50"></div>
              <div className="absolute -top-3 -right-3 w-20 h-3 bg-[repeating-linear-gradient(45deg,#E06020,#E06020_8px,#FAF8F6_8px,#FAF8F6_16px)] opacity-50"></div>
            </>
          )}
        </div>

        {/* Action */}
        <div className="mt-16 text-center z-10 animate-screen-in" style={{ animationDelay: '300ms' }}>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            {attemptsLeft > 0 ? (
              <button onClick={onContinue} className="px-10 py-4 bg-primary text-on-primary font-headline font-bold text-base uppercase tracking-wide hover:bg-primary-fixed active:scale-95 transition-all shadow-[0_4px_16px_rgba(224,96,32,0.3)] hover:shadow-[0_6px_24px_rgba(224,96,32,0.4)]">
                CONTINUE · {attemptsLeft} LEFT
              </button>
            ) : (
              <button onClick={onContinue} className="px-10 py-4 bg-primary text-on-primary font-headline font-bold text-base uppercase tracking-wide hover:bg-primary-fixed active:scale-95 transition-all shadow-[0_4px_16px_rgba(224,96,32,0.3)] hover:shadow-[0_6px_24px_rgba(224,96,32,0.4)]">
                VIEW SUMMARY
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#1A1410] mt-auto relative">
        <div className="font-body text-xs uppercase tracking-widest text-neutral-400">
          © 2024 Zenith Comp Co., Ltd. — Nutanix Cloud Native &amp; AI Innovation Day
        </div>
      </footer>

      {/* Side accent markers */}
      <div className="fixed top-1/2 left-8 -translate-y-1/2 flex flex-col gap-4 pointer-events-none opacity-30">
        <div className="w-0.5 h-12 bg-primary"></div>
        <div className="w-0.5 h-4 bg-primary/50"></div>
        <div className="w-0.5 h-1 bg-primary/30"></div>
      </div>
      <div className="fixed top-1/2 right-8 -translate-y-1/2 flex flex-col gap-4 items-end pointer-events-none opacity-30">
        <div className="w-0.5 h-1 bg-primary/30"></div>
        <div className="w-0.5 h-4 bg-primary/50"></div>
        <div className="w-0.5 h-12 bg-primary"></div>
      </div>
    </div>
  );
}
