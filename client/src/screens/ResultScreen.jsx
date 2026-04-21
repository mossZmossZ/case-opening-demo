import React from 'react';
import { TIER_META } from '../lib/constants';

export default function ResultScreen({ prize, attemptsLeft, onContinue }) {
  const m = TIER_META[prize.tier];
  
  let rarityClass = 'text-gray-400';
  let badgeColor = 'bg-gray-500';
  if (prize.tier === 'rare') { rarityClass = 'text-blue-500'; badgeColor = 'bg-blue-500'; }
  if (prize.tier === 'epic') { rarityClass = 'text-purple-500'; badgeColor = 'bg-purple-500'; }
  if (prize.tier === 'legendary') { rarityClass = 'text-primary'; badgeColor = 'bg-primary text-on-primary-fixed'; }
  if (prize.tier === 'common') { rarityClass = 'text-gray-400'; badgeColor = 'bg-surface-container-highest text-on-surface'; }

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary-fixed min-h-screen flex flex-col overflow-x-hidden animate-screen-in">
      {/* Top Navigation Shell */}
      <header className="fixed top-0 w-full flex items-center justify-between px-8 py-4 bg-neutral-950/80 backdrop-blur-xl z-50 shadow-[0_4px_20px_rgba(255,107,0,0.1)]">
        <div className="text-2xl font-black tracking-tighter text-orange-500 uppercase font-headline">
          Zenith Comp Co.
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a className="text-neutral-400 font-medium hover:text-neutral-200 font-headline tracking-tighter uppercase" href="#">Cases</a>
          <a className="text-neutral-400 font-medium hover:text-neutral-200 font-headline tracking-tighter uppercase" href="#">Inventory</a>
          <a className="text-neutral-400 font-medium hover:text-neutral-200 font-headline tracking-tighter uppercase" href="#">Leaderboard</a>
          <a className="text-neutral-400 font-medium hover:text-neutral-200 font-headline tracking-tighter uppercase" href="#">Hardware</a>
        </nav>
      </header>
      <div className="bg-gradient-to-b from-neutral-800 to-transparent h-px w-full fixed top-[72px] z-50"></div>

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col items-center justify-center relative px-6 industrial-grid pt-20 pb-20">
        {/* Background Ambient Glows */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" style={{ backgroundColor: `${m.color}20` }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary-fixed-dim/20 rounded-full blur-[80px]" style={{ backgroundColor: `${m.color}30` }}></div>
        </div>

        {/* Congratulations Typography */}
        <div className="relative z-10 text-center mb-12 animate-result-pop">
          <h2 className="font-headline text-lg tracking-[0.4em] uppercase font-bold mb-2" style={{ color: m.color }}>System Unlock Successful</h2>
          <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter uppercase text-on-surface leading-none">
            CONGRATULATIONS!
          </h1>
          <div className="h-1 w-24 mx-auto mt-6" style={{ backgroundColor: m.color }}></div>
        </div>

        {/* The Kinetic Case/Prize Component */}
        <div className="relative group animate-result-pop" style={{ animationDelay: '150ms' }}>
          {/* Glow expansion */}
          <div className="absolute inset-0 blur-[100px] rounded-full scale-110 opacity-50 group-hover:opacity-70 transition-opacity" style={{ backgroundColor: `${m.color}50` }}></div>
          
          {/* Main Prize Card */}
          <div className="relative w-80 md:w-96 aspect-[3/4] bg-surface-container-highest border border-outline-variant/30 overflow-hidden flex flex-col shadow-2xl">
            {/* Metallic Glare Overlay */}
            <div className="absolute inset-0 metallic-glare pointer-events-none z-10"></div>
            
            {/* Rarity Indicator */}
            <div className="absolute top-0 right-0 p-4 z-20">
              <div className={`flex items-center gap-1 px-3 py-1 font-headline font-black text-xs uppercase italic tracking-widest ${badgeColor}`}>
                <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>workspace_premium</span>
                {m.label}
              </div>
            </div>

            {/* Prize Image Area */}
            <div className="flex-grow relative bg-surface-container-lowest overflow-hidden flex items-center justify-center">
              <img alt="Cloud Innovation Hardware" className="absolute inset-0 w-full h-full object-cover mix-blend-lighten opacity-40 grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_vKQR1eQfjZC_CC1QTuykXHDUzf8lXiuS6s757btAADuisNecAqIyUP8rd8a-n3jffwpKQ62TcFYnNUNf8o5eC6AdYZ7o5XqmcVw8XRhQmjMhoQ0KIO2sqK70Kkv3Ih8XS3n_MaYi4cd18HvYlXhA3FsaRY9jblsh4wN7bG7W_ZsHHE8Sglj9AL3ffDpB2STdc9ihe1mASI3Cn1XuzT5imsDflbkuPdrt31WET9l3boNUYm9Q6X6vpV8HX3PZZaJ5aMhzOqtTsPvQ"/>
              <span className="material-symbols-outlined relative z-20 text-[100px]" style={{ color: m.color }}>{prize.iconKey || 'token'}</span>

              {/* Tech Overlays */}
              <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
                <div className="border-t border-l w-8 h-8" style={{ borderColor: `${m.color}80` }}></div>
                <div className="self-end border-b border-r w-8 h-8" style={{ borderColor: `${m.color}80` }}></div>
              </div>
            </div>

            {/* Prize Info */}
            <div className="p-8 bg-surface-container-high border-t border-outline-variant/20 relative z-20">
              <p className="font-headline text-sm font-bold uppercase tracking-widest mb-1" style={{ color: m.color }}>Item Unlocked</p>
              <h3 className="font-headline text-3xl font-black text-on-surface uppercase tracking-tight leading-tight">
                {prize.name}
              </h3>
              <div className="mt-4 flex items-center justify-between text-[10px] uppercase font-bold tracking-tighter text-on-surface-variant font-body">
                <span>{prize.description}</span>
                <span style={{ color: m.color }}>Event Exclusive</span>
              </div>
            </div>
          </div>

          {/* Hazard Stripes Decoration */}
          {prize.tier === 'legendary' && (
            <>
              <div className="absolute -bottom-4 -left-4 w-24 h-4 bg-[repeating-linear-gradient(45deg,#ff7a2f,#ff7a2f_10px,#0a0e14_10px,#0a0e14_20px)] opacity-60"></div>
              <div className="absolute -top-4 -right-4 w-24 h-4 bg-[repeating-linear-gradient(45deg,#ff7a2f,#ff7a2f_10px,#0a0e14_10px,#0a0e14_20px)] opacity-60"></div>
            </>
          )}
        </div>

        {/* Action Callout */}
        <div className="mt-16 text-center z-10 animate-screen-in" style={{ animationDelay: '300ms' }}>
          <p className="font-body text-on-surface-variant text-lg tracking-wide mb-8">
            Your innovative edge has been recognized. <br/>
            <span className="text-on-surface font-bold">Visit the Nutanix Booth to Claim your physical reward.</span>
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            {attemptsLeft > 0 ? (
              <button onClick={onContinue} className="px-10 py-4 bg-primary-container text-on-primary-container font-headline font-black text-lg uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform">
                CONTINUE · {attemptsLeft} LEFT
              </button>
            ) : (
              <button onClick={onContinue} className="px-10 py-4 bg-primary-container text-on-primary-container font-headline font-black text-lg uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform">
                VIEW SUMMARY
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer Shell */}
      <footer className="w-full py-6 px-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-neutral-950 z-50 mt-auto">
        <div className="bg-neutral-900 h-px w-full absolute top-0 left-0"></div>
        <div className="font-body text-xs uppercase tracking-widest text-neutral-600">
          © 2024 Zenith Comp Co., Ltd. - Nutanix Cloud Native & AI Innovation Day
        </div>
        <div className="flex gap-6">
          <a className="font-body text-xs uppercase tracking-widest text-neutral-600 hover:text-orange-400" href="#">Privacy Protocol</a>
          <a className="font-body text-xs uppercase tracking-widest text-neutral-600 hover:text-orange-400" href="#">Service Terms</a>
          <a className="font-body text-xs uppercase tracking-widest text-neutral-600 hover:text-orange-400" href="#">Terminal Support</a>
        </div>
      </footer>

      {/* Decorative Elements */}
      <div className="fixed top-1/2 left-8 -translate-y-1/2 flex flex-col gap-4 pointer-events-none opacity-20">
        <div className="w-1 h-12 bg-primary"></div>
        <div className="w-1 h-4 bg-primary/50"></div>
        <div className="w-1 h-1 bg-primary/30"></div>
      </div>
      <div className="fixed top-1/2 right-8 -translate-y-1/2 flex flex-col gap-4 items-end pointer-events-none opacity-20">
        <div className="w-1 h-1 bg-primary/30"></div>
        <div className="w-1 h-4 bg-primary/50"></div>
        <div className="w-1 h-12 bg-primary"></div>
      </div>
    </div>
  );
}
