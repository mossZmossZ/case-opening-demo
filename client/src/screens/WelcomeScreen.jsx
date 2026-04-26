import React, { useState, useRef, useEffect, useMemo } from 'react';
import { gameApi, subscribePrizeDataChanged } from '../lib/api';
import Spinner from '../components/Spinner';
import { censorName } from '../lib/utils';

const ADJ = [
  'Silent', 'Shadow', 'Golden', 'Neon', 'Arctic', 'Crimson', 'Phantom',
  'Cosmic', 'Iron', 'Storm', 'Frost', 'Blazing', 'Hollow', 'Swift',
  'Dark', 'Rogue', 'Hyper', 'Lunar', 'Toxic', 'Stealth',
];
const NOUN = [
  'Wolf', 'Eagle', 'Dragon', 'Sniper', 'Phoenix', 'Viper', 'Titan',
  'Ghost', 'Hawk', 'Blade', 'Raven', 'Ninja', 'Ranger', 'Specter',
  'Fox', 'Cobra', 'Reaper', 'Knight', 'Demon', 'Striker',
];

const MAX_ATTEMPT_SLOTS = 5;
const DEFAULT_CASE_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAascBYPGIt_F19CWBhUMOaRrlIRkznAPdvxTNURHzt2ec05MmnwNS8VFWWxYJzdUdcAtx6HaD_C9lq3plgI1OBQncj2LzYOGqAkd16fJIbl1N9xeLh4UC9GsV8ZX8ZOs4TZit03bPgJb2oGIwtFpmRMnOJybEXm_qqOgcTaTUHWv6-k5sW0-HBog8xbIVu2kicJCEs588bJYEKu4Pvj9-RzF7FunIOkoD8ceQEvotKwd4jxURVPhLRRJdaMDqv-AnzJCZtIM1Y79p';

let _lastName = '';
const generateRandomName = () => {
  let name;
  do {
    const adj = ADJ[Math.floor(Math.random() * ADJ.length)];
    const noun = NOUN[Math.floor(Math.random() * NOUN.length)];
    const num = Math.random() < 0.5 ? Math.floor(Math.random() * 999) + 1 : '';
    name = `${adj}${noun}${num}`;
  } while (name === _lastName);
  _lastName = name;
  return name;
};

export default function WelcomeScreen({ onStart, onAdmin, onLeaderboard, prizes = [] }) {
  const [name, setName] = useState('');
  const [tries, setTries] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ liveDrops: [], participants: 0, totalOpens: 0, inventory: { remainingCases: 0, legendaryDropRate: 0 } });
  const inputRef = useRef();
  const maximumAttempts = stats.settings?.maximumAttempts || MAX_ATTEMPT_SLOTS;
  const legendarySlides = useMemo(() => {
    const legendaryPrizes = prizes.filter(prize => prize.tier === 'legendary');
    if (legendaryPrizes.length === 0) {
      return [{ id: 'default-case', name: 'Zenith Innovation Case', imageUrl: DEFAULT_CASE_IMAGE }];
    }

    return legendaryPrizes.map(prize => ({
      id: prize._id || prize.name,
      name: prize.name || 'Legendary Prize',
      imageUrl: prize.imageUrl || DEFAULT_CASE_IMAGE,
    }));
  }, [prizes]);
  const legendaryLoopSlides = useMemo(() => (
    legendarySlides.length > 1
      ? [...legendarySlides, { ...legendarySlides[0], id: `${legendarySlides[0].id}-loop` }]
      : legendarySlides
  ), [legendarySlides]);

  useEffect(() => { document.title = 'Zenith Comp Co. — Case Opening'; }, []);

  useEffect(() => {
    inputRef.current?.focus();

    const fetchData = () => {
      gameApi.getStats().then(setStats).catch(() => { });
    };

    fetchData();
    // Retry once after 1.5 s (handles server-startup race condition)
    const retryTimer = setTimeout(fetchData, 1500);
    const pollInterval = setInterval(fetchData, 30000);
    const unsubscribePrizeData = subscribePrizeDataChanged(fetchData);

    return () => {
      clearTimeout(retryTimer);
      clearInterval(pollInterval);
      unsubscribePrizeData();
    };
  }, []);

  useEffect(() => {
    if (tries > maximumAttempts) setTries(maximumAttempts);
  }, [tries, maximumAttempts]);

  const handleGo = async () => {
    if (!name.trim()) { inputRef.current?.focus(); return; }
    setLoading(true);
    setError('');
    try {
      const session = await gameApi.register(name.trim(), tries);
      onStart(session);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const randomize = () => {
    setName(generateRandomName());
  };

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-background text-on-surface font-body">

      {/* ── Skip link ── */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-on-primary focus:text-sm focus:font-semibold">
        Skip to main content
      </a>

      {/* ── Header ── fixed, 64 px ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur-xl border-b border-outline-variant shadow-sm">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-lg font-black tracking-tight uppercase font-headline">
              <span className="text-primary">Zenith</span> Comp Co.
            </span>
            <nav aria-label="Primary" className="hidden md:flex gap-6">
              <a href="#" className="text-xs font-semibold tracking-wide uppercase transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none text-primary border-b-2 border-primary pb-0.5">
                Cases
              </a>
              <button
                onClick={onLeaderboard}
                className="text-xs font-semibold tracking-wide uppercase transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none text-on-surface-variant hover:text-on-surface"
              >
                Leaderboard
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden xl:block text-[10px] tracking-[0.18em] text-on-surface-variant uppercase">
              Nutanix Cloud Native &amp; AI Innovation Day
            </span>
            {/* Leaderboard icon — mobile only (nav is hidden on small screens) */}
            <button
              onClick={onLeaderboard}
              aria-label="Leaderboard"
              className="md:hidden flex items-center justify-center w-9 h-9 border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">leaderboard</span>
            </button>
            <button
              onClick={onAdmin}
              className="text-xs font-semibold tracking-wide uppercase px-3 sm:px-4 py-2 border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
            >
              Admin
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main id="main-content" className="flex flex-1 flex-col pt-16">
        <div className="flex flex-1 flex-col gap-3 max-w-7xl w-full mx-auto px-4 sm:px-8 py-4 lg:py-3">

          {/* ── Section 1: Page heading ── */}
          <div className="flex-shrink-0 text-center animate-screen-in">
            <span className="inline-block text-[10px] font-bold tracking-[0.28em] uppercase text-primary mb-2">
              Nutanix Cloud Native &amp; AI Innovation Day
            </span>
            <h1 className="text-2xl lg:text-3xl font-bold font-headline tracking-tight text-on-surface leading-tight" style={{ textWrap: 'balance' }}>
              Open Your Innovation Case
            </h1>
          </div>

          {/* ── Section 2: Two-column grid ── */}
          <div className="grid flex-1 grid-cols-1 gap-5 lg:min-h-0 lg:grid-cols-[11fr_9fr] animate-screen-in" style={{ animationDelay: '80ms' }}>

            {/* Left — Case image */}
            <div className="hidden lg:block relative overflow-hidden border border-outline-variant shadow-md">
              <div
                className={`${legendarySlides.length > 1 ? 'legendary-slide-track' : ''} absolute inset-0 flex`}
                style={{
                  '--legendary-slide-count': legendarySlides.length,
                  '--legendary-slide-duration': `${Math.max(legendarySlides.length, 1) * 5}s`,
                }}
              >
                {legendaryLoopSlides.map((slide, idx) => (
                  <img
                    key={`${slide.id}-${idx}`}
                    alt={`${slide.name} — legendary prize`}
                    src={slide.imageUrl}
                    width="800"
                    height="600"
                    fetchPriority={idx === 0 ? 'high' : undefined}
                    loading={idx === 0 ? undefined : 'lazy'}
                    onError={(event) => {
                      if (event.currentTarget.src !== DEFAULT_CASE_IMAGE) {
                        event.currentTarget.src = DEFAULT_CASE_IMAGE;
                      }
                    }}
                    className="h-full min-w-full object-cover"
                  />
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1410]/75 via-[#1A1410]/10 to-transparent" aria-hidden="true" />

              {/* Corner tags */}
              <div className="absolute top-4 left-4 z-10 text-[10px] font-bold text-primary bg-white/90 px-2 py-1 tracking-wider border border-primary/30">
                MODEL: ZNC-001
              </div>
              <div className="absolute top-4 right-4 z-10 text-[10px] font-bold text-white bg-primary px-2 py-1 tracking-wider">
                RARITY: LEGENDARY
              </div>

              {/* Caption */}
              <div className="absolute bottom-5 left-5 right-5 z-10">
                <h2 className="text-white font-headline font-bold text-lg tracking-tight">Zenith Innovation Case</h2>
                <p className="text-white/60 text-[10px] mt-0.5 uppercase tracking-widest">Secured by Nutanix Hybrid Cloud Infrastructure</p>
              </div>
            </div>

            {/* Right — Registration form */}
            <div className="flex flex-col bg-white border border-outline-variant shadow-md lg:overflow-y-auto">
              <div className="flex-1 flex flex-col justify-center px-4 sm:px-7 py-4 sm:py-6">

                <h2 className="text-xl font-bold font-headline tracking-tight text-on-surface mb-0.5">
                  Register &amp; Play
                </h2>
                <p className="text-sm text-on-surface-variant mb-5 leading-snug">
                  Enter your name, choose attempts, then unlock your case.
                </p>

                {/* Name */}
                <div className="mb-4">
                  <label htmlFor="player-name" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
                    Full Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="player-name"
                      ref={inputRef}
                      type="text"
                      name="playerName"
                      placeholder="e.g. Alex Chen…"
                      autoComplete="off"
                      spellCheck="false"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleGo()}
                      maxLength={40}
                      className="min-w-0 flex-1 h-10 px-4 bg-surface-container-low border border-outline-variant text-on-surface text-sm transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
                    />
                    <button
                      onClick={randomize}
                      aria-label="Pick a random name"
                      className="h-10 px-4 shrink-0 text-xs font-semibold text-on-surface-variant border border-outline-variant bg-surface-container hover:border-primary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      Random
                    </button>
                  </div>
                </div>

                {/* Attempts */}
                <div className="mb-5">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
                    Number of Attempts
                  </label>
                  <div className="flex gap-2" role="group" aria-label={`Select number of attempts, maximum ${maximumAttempts}`}>
                    {Array.from({ length: MAX_ATTEMPT_SLOTS }, (_, i) => i + 1).map(n => {
                      const locked = n > maximumAttempts;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => !locked && setTries(n)}
                          disabled={locked}
                          aria-pressed={!locked && tries === n}
                          aria-label={locked ? `Attempt ${n} locked` : `${n} attempt${n === 1 ? '' : 's'}`}
                          className={`flex-1 h-10 font-mono text-sm font-bold transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${tries === n && !locked
                            ? 'border-primary bg-primary/10 text-primary'
                            : locked
                              ? 'border-outline-variant bg-surface-container-low text-on-surface-variant/40 cursor-not-allowed'
                              : 'border-outline-variant bg-surface-container text-on-surface-variant hover:border-outline'
                            }`}
                        >
                          {locked ? 'x' : n}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <p className="text-error text-xs mb-3" role="alert" aria-live="polite">{error}</p>
                )}

                {/* CTA */}
                <button
                  onClick={handleGo}
                  disabled={!name.trim() || loading}
                  className="group relative w-full h-12 bg-primary text-on-primary font-headline font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 overflow-hidden transition-colors hover:bg-primary-fixed active:scale-[0.98] disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:cursor-not-allowed shadow-[0_2px_12px_rgba(224,96,32,0.25)] hover:shadow-[0_4px_20px_rgba(224,96,32,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span className="relative z-10">{loading ? <Spinner /> : 'Unlock Now'}</span>
                  {!loading && (
                    <span className="material-symbols-outlined relative z-10 text-lg" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">bolt</span>
                  )}
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" aria-hidden="true" />
                </button>

                <p className="text-[10px] text-on-surface-variant/70 uppercase tracking-widest text-center mt-2">
                  Required: 1.0 Innovation Token
                </p>

                {/* Divider */}
                <div className="border-t border-outline-variant my-4" />

                {/* Live Drops */}
                <section aria-label="Live drops feed">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Live Drops</span>
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '15px' }} aria-hidden="true">sensors</span>
                  </div>
                  {stats.liveDrops.length === 0 ? (
                    <p className="text-xs text-on-surface-variant/50 italic">No recent drops yet.</p>
                  ) : (
                    <ul className="space-y-1" aria-live="polite" aria-label="Recent prize drops">
                      {stats.liveDrops.slice(0, 5).map((drop, idx) => (
                        <li key={idx} className="flex items-center justify-between text-xs py-1 border-b border-outline-variant/30 last:border-0 gap-2">
                          <span className="font-semibold text-on-surface truncate min-w-0" translate="no">{censorName(drop.user)}</span>
                          <span className={`min-w-0 max-w-[58%] truncate text-right font-medium ${drop.tier === 'legendary' ? 'text-primary' : drop.tier === 'epic' ? 'text-purple-600' : 'text-on-surface-variant'}`}>
                            {drop.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </div>
          </div>

          {/* ── Section 3: Stats bar ── */}
          <div className="flex-shrink-0 grid grid-cols-3 gap-2 sm:gap-4 animate-screen-in" style={{ animationDelay: '160ms' }}>
            {[
              { icon: 'lock_open', value: stats.totalOpens || 0, unit: 'Opens', label: 'Total Opens' },
              { icon: 'inventory_2', value: stats.inventory.remainingCases, unit: 'Cases', label: 'Cases Remaining' },
              { icon: 'group', value: stats.participants || 0, unit: 'users', label: 'Total Participants' },
            ].map(({ icon, value, unit, label }) => (
              <div key={label} className="bg-white border border-outline-variant shadow-sm px-2 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 flex items-center justify-center shrink-0 hidden sm:flex" aria-hidden="true">
                  <span className="material-symbols-outlined text-primary text-base">{icon}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-base sm:text-lg font-bold font-headline text-on-surface leading-none tabular-nums">
                    {value}<span className="text-[10px] sm:text-xs text-primary ml-0.5">{unit}</span>
                  </div>
                  <p className="text-[8px] sm:text-[9px] text-on-surface-variant uppercase tracking-wider mt-0.5 truncate">{label}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="flex-shrink-0 bg-[#1A1410]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-center sm:text-left text-[10px] uppercase tracking-widest text-neutral-500">
            © 2026 Zenith Comp Co., Ltd. — Nutanix Cloud Native &amp; AI Innovation Day
          </p>
        </div>
      </footer>

    </div>
  );
}
