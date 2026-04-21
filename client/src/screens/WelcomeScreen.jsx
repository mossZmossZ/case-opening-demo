import React, { useState, useRef, useEffect } from 'react';
import { gameApi } from '../lib/api';
import Spinner from '../components/Spinner';

const RANDOM_NAMES = [
  'Alex Chen', 'Sam Rivera', 'Jordan Lee', 'Morgan Kim', 'Casey Park',
  'Taylor Nguyen', 'Riley Wu', 'Drew Patel', 'Kai Tanaka', 'Priya Sharma',
];

export default function WelcomeScreen({ onStart, onAdmin }) {
  const [name, setName] = useState('');
  const [tries, setTries] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ liveDrops: [], inventory: { remainingCases: 0, legendaryDropRate: 0 } });
  const inputRef = useRef();

  useEffect(() => { 
    inputRef.current?.focus(); 
    gameApi.getStats().then(setStats).catch(console.error);
  }, []);

  const handleGo = async () => {
    if (!name.trim()) {
      inputRef.current?.focus();
      return;
    }
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
    setName(RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]);
  };

  return (
    <div className="bg-background text-on-surface font-body overflow-x-hidden selection:bg-primary-fixed selection:text-on-primary-fixed w-full min-h-screen">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full flex items-center justify-between px-8 py-4 bg-neutral-950/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-8">
          <div className="text-2xl font-black tracking-tighter text-orange-500 uppercase font-headline">
            Zenith Comp Co.
          </div>
          <nav className="hidden md:flex gap-6">
            <a className="text-orange-500 border-b-2 border-orange-500 pb-1 font-headline tracking-tighter uppercase" href="#">Cases</a>
            <a className="text-neutral-400 font-medium hover:text-neutral-200 font-headline tracking-tighter uppercase transition-all duration-150" href="#">Inventory</a>
            <a className="text-neutral-400 font-medium hover:text-neutral-200 font-headline tracking-tighter uppercase transition-all duration-150" href="#">Leaderboard</a>
            <a className="text-neutral-400 font-medium hover:text-neutral-200 font-headline tracking-tighter uppercase transition-all duration-150" href="#">Hardware</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden lg:block text-[10px] tracking-[0.2em] text-on-surface-variant font-headline uppercase opacity-50">Nutanix Cloud Native & AI Innovation Day</span>
          <button onClick={onAdmin} className="bg-surface-container-high text-on-surface px-6 py-2 font-headline font-bold uppercase tracking-tighter scale-95 active:scale-90 transition-all hover:bg-surface-bright">
            Admin Terminal
          </button>
        </div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-b from-neutral-800 to-transparent h-px w-full"></div>
      </header>

      <main className="relative min-h-[calc(100vh-80px)] pt-24 pb-32 kinetic-mesh">
        {/* Ambient Heat Glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-primary-fixed-dim/5 rounded-full blur-[150px] -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Typography / Sidebar */}
          <div className="lg:col-span-4 space-y-8 animate-screen-in">
            <div className="space-y-2">
              <span className="text-primary font-headline font-bold tracking-[0.3em] uppercase text-xs">Innovation Protocol v.2.4</span>
              <h1 className="text-6xl md:text-8xl font-headline font-black tracking-tighter text-on-surface leading-[0.85] uppercase">
                Forge <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-on-surface to-on-surface-variant">Your</span> <br/> Legacy
              </h1>
            </div>
            <p className="text-on-surface-variant max-w-sm leading-relaxed text-sm uppercase tracking-wider font-light">
              The Kinetic Foundry is online. Deploy your cloud-native assets and extract rare hardware components during the Nutanix AI Innovation summit.
            </p>
            <div className="flex flex-col gap-4 pt-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-primary-fixed"></span>
                <span className="font-headline text-[10px] tracking-widest uppercase opacity-70">Terminal Status: Active</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-outline"></span>
                <span className="font-headline text-[10px] tracking-widest uppercase opacity-40">Encryption: AES-256 Cloud Native</span>
              </div>
            </div>
          </div>

          {/* Central Case Unit */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center relative py-12 animate-screen-in" style={{ animationDelay: '100ms' }}>
            <div className="relative group cursor-pointer w-full aspect-square max-w-[400px]">
              <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative w-full h-full bg-surface-container-highest border border-outline-variant/20 p-1 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 scanline opacity-20 pointer-events-none"></div>
                <img alt="Zenith Innovation Case" className="w-full h-full object-cover grayscale brightness-125 contrast-125 mix-blend-lighten" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAascBYPGIt_F19CWBhUMOaRrlIRkznAPdvxTNURHzt2ec05MmnwNS8VFWWxYJzdUdcAtx6HaD_C9lq3plgI1OBQncj2LzYOGqAkd16fJIbl1N9xeLh4UC9GsV8ZX8ZOs4TZit03bPgJb2oGIwtFpmRMnOJybEXm_qqOgcTaTUHWv6-k5sW0-HBog8xbIVu2kicJCEs588bJYEKu4Pvj9-RzF7FunIOkoD8ceQEvotKwd4jxURVPhLRRJdaMDqv-AnzJCZtIM1Y79p"/>
                <div className="absolute top-4 left-4 font-headline text-[10px] font-bold text-primary bg-background/80 px-2 py-1 tracking-tighter">
                  MODEL: ZNTH-001
                </div>
                <div className="absolute bottom-4 right-4 font-headline text-[10px] font-bold text-on-surface bg-primary-container px-2 py-1 tracking-tighter">
                  RARITY: LEGENDARY
                </div>
              </div>
            </div>

            {/* Action Module replacing "Unlock Now" with Name & Attempts */}
            <div className="mt-8 text-center space-y-4 w-full glass-panel border border-outline-variant/30 rounded-xl p-6 relative">
              <h2 className="text-xl font-headline font-black tracking-tighter uppercase mb-4">Zenith Innovation Case</h2>
              
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGo()}
                  maxLength={40}
                  className="flex-1 h-12 px-4 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface font-body text-sm outline-none transition-all focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(232,97,26,0.1)]"
                />
                <button
                  onClick={randomize}
                  className="h-12 px-3 shrink-0 text-xs font-semibold text-on-surface-variant border border-outline-variant/30 rounded-lg bg-surface-container hover:text-primary hover:border-primary transition-all"
                >
                  Random
                </button>
              </div>

              <div>
                <p className="text-[10px] font-headline tracking-[0.2em] text-on-surface-variant uppercase text-left mb-2">Attempts</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setTries(n)}
                      className={`flex-1 h-10 rounded-lg font-mono text-sm font-bold transition-all border ${
                        tries === n
                          ? 'border-primary bg-primary/10 text-primary shadow-[0_0_8px_rgba(232,97,26,0.2)]'
                          : 'border-outline-variant/30 bg-surface-container text-on-surface-variant hover:border-outline'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-error text-xs text-left">{error}</p>}

              <button
                onClick={handleGo}
                disabled={!name.trim() || loading}
                className="group relative w-full h-14 mt-2 bg-primary-container text-on-primary-container font-headline font-black text-lg uppercase tracking-tighter flex items-center justify-center gap-3 overflow-hidden transition-all hover:bg-primary-fixed active:scale-95 disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:active:scale-100 disabled:cursor-not-allowed"
              >
                <span className="relative z-10">{loading ? <Spinner /> : 'Unlock Now'}</span>
                {!loading && <span className="material-symbols-outlined relative z-10 text-xl" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <p className="text-[10px] font-headline tracking-[0.2em] text-on-surface-variant uppercase mt-2">Required: 1.0 Innovation Token</p>
            </div>
          </div>

          {/* Side Intel / Stats */}
          <div className="lg:col-span-4 space-y-6 animate-screen-in" style={{ animationDelay: '200ms' }}>
            <div className="bg-surface-container-low p-6 space-y-4 relative border-l-2 border-primary-fixed">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-headline font-bold uppercase text-xs tracking-widest text-primary">Live Drops</h3>
                  <p className="text-[10px] text-on-surface-variant uppercase font-medium">Terminal Feed_041</p>
                </div>
                <span className="material-symbols-outlined text-primary text-sm">sensors</span>
              </div>
              <div className="space-y-3">
                {stats.liveDrops.slice(0, 3).map((drop, idx) => (
                  <div key={idx} className={`flex items-center justify-between text-[11px] font-headline uppercase tracking-tighter p-2 bg-surface-container-highest/50 ${idx > 0 ? `opacity-${100 - (idx * 20)}` : ''}`}>
                    <span className="text-on-surface truncate w-1/2">{drop.user}</span>
                    <span className={drop.tier === 'legendary' ? 'text-primary-fixed font-bold' : drop.tier === 'epic' ? 'text-purple-400' : 'text-on-surface-variant truncate w-1/2 text-right'}>
                      {drop.name}
                    </span>
                  </div>
                ))}
                {stats.liveDrops.length === 0 && (
                  <p className="text-[10px] text-on-surface-variant italic">No recent drops</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container p-4 space-y-2">
                <span className="text-[10px] text-on-surface-variant uppercase font-headline font-bold">Probability</span>
                <div className="text-2xl font-headline font-black text-on-surface">{stats.inventory.legendaryDropRate}<span className="text-xs text-primary">%</span></div>
                <div className="w-full bg-surface-container-highest h-1">
                  <div className="bg-primary-fixed h-full" style={{ width: `${Math.min(100, stats.inventory.legendaryDropRate * 10)}%` }}></div>
                </div>
                <p className="text-[8px] text-on-surface-variant uppercase">Legendary Drop Rate</p>
              </div>
              <div className="bg-surface-container p-4 space-y-2">
                <span className="text-[10px] text-on-surface-variant uppercase font-headline font-bold">Inventory</span>
                <div className="text-2xl font-headline font-black text-on-surface">{stats.inventory.remainingCases}<span className="text-xs text-primary">u</span></div>
                <div className="w-full bg-surface-container-highest h-1">
                  <div className="bg-primary-fixed h-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-[8px] text-on-surface-variant uppercase">Cases remaining</p>
              </div>
            </div>

            <div className="relative h-48 overflow-hidden group">
              <img className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-40" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAklIfb7_5Np4P2G3Ns9cKZXEsmWL8227SFyi8MyF832VjcszKiLrbx3LgXbZAPb2ldNTTbukMgEjkV6Ub_RSSo0pottja0ZBalnJybPIWiLOD-z3cL0U5wSsmy6JWlbwQk4pjH3ade7AL810X2xP3wC6hy6NXNSatiFbFK9ONqEX9qqPOgAYmkWFj3Xy7mEAe3NHu3fmC5C4FR1TseAth3_lUtp1ldxlybXKY4o2GeXiZHiZ-zX056KgZKaYR1p8KBlZi04LHZwdGc"/>
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h4 className="font-headline font-bold uppercase text-xs">Innovation Vault</h4>
                <p className="text-[10px] text-on-surface-variant uppercase">Secured by Nutanix Hybrid Cloud Infrastructure</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-neutral-950 relative">
        <div className="bg-neutral-900 h-px w-full absolute top-0 left-0"></div>
        <div className="font-body text-xs uppercase tracking-widest text-neutral-600">
          © 2024 Zenith Comp Co., Ltd. - Nutanix Cloud Native & AI Innovation Day
        </div>
        <nav className="flex gap-8">
          <a className="font-body text-xs uppercase tracking-widest text-neutral-600 hover:text-orange-400 transition-colors" href="#">Privacy Protocol</a>
          <a className="font-body text-xs uppercase tracking-widest text-neutral-600 hover:text-orange-400 transition-colors" href="#">Service Terms</a>
          <a className="font-body text-xs uppercase tracking-widest text-neutral-600 hover:text-orange-400 transition-colors" href="#">Terminal Support</a>
        </nav>
      </footer>
    </div>
  );
}
