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
  const inputRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);

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
    <div className="animate-screen-in flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-[540px] relative z-10">

        {/* Brand */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-fixed flex items-center justify-center shadow-[0_0_20px_rgba(232,97,26,0.4)]">
              <span className="text-sm font-black text-black font-headline">Z</span>
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-on-surface font-headline tracking-tight">Zenith Comp Co., Ltd.</div>
              <div className="text-[0.65rem] font-medium text-on-surface-variant tracking-[0.12em] uppercase">Lucky Draw</div>
            </div>
          </div>

          <h1 className="text-[clamp(2.8rem,6vw,5.5rem)] font-black leading-none tracking-tighter text-on-surface font-headline"
              style={{ textShadow: '0 0 60px rgba(232,97,26,0.2)' }}>
            OPEN YOUR<br />
            <span className="bg-gradient-to-r from-primary via-primary-fixed to-tier-legendary bg-clip-text text-transparent">
              CASE
            </span>
          </h1>
          <p className="mt-4 text-sm text-on-surface-variant leading-relaxed">
            Enter your name and spin the reel to discover your reward.
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-panel border border-outline-variant/30 rounded-2xl p-7 backdrop-blur-xl">
          <div className="flex gap-3 mb-5">
            <input
              ref={inputRef}
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGo()}
              maxLength={40}
              className="flex-1 h-14 px-5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-on-surface font-body text-base outline-none transition-all focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(232,97,26,0.1)]"
            />
            <button
              onClick={randomize}
              className="h-14 px-4 shrink-0 text-sm font-semibold text-on-surface-variant border border-outline-variant/30 rounded-xl bg-surface-container hover:text-primary hover:border-primary transition-all"
            >
              Random
            </button>
          </div>

          <div className="mb-6">
            <p className="text-[0.7rem] font-bold tracking-[0.14em] uppercase text-on-surface-variant mb-3">
              Number of attempts
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setTries(n)}
                  className={`flex-1 h-12 rounded-lg font-mono text-lg font-bold transition-all
                    ${tries === n
                      ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(232,97,26,0.2)]'
                      : 'border-outline-variant/30 bg-surface-container text-on-surface-variant hover:border-outline'
                    } border`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-error text-sm mb-3 text-center">{error}</p>
          )}

          <button
            onClick={handleGo}
            disabled={!name.trim() || loading}
            className="w-full h-14 rounded-xl bg-gradient-to-br from-primary to-primary-fixed text-black font-headline font-extrabold text-base tracking-[0.08em] transition-all hover:shadow-[0_0_32px_rgba(232,97,26,0.35),0_4px_16px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:shadow-none disabled:translate-y-0"
          >
            {loading ? <Spinner /> : 'BEGIN'}
          </button>
        </div>

        {/* Admin link */}
        <p
          onClick={onAdmin}
          className="text-center mt-7 text-[0.7rem] text-on-surface-variant/50 cursor-pointer tracking-[0.06em] hover:text-primary transition-colors"
        >
          ADMIN →
        </p>
      </div>
    </div>
  );
}
