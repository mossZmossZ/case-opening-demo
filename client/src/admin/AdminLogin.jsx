import React, { useState, useRef, useEffect } from 'react';
import { adminApi } from '../lib/api';
import Spinner from '../components/Spinner';

export default function AdminLogin({ onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef();

  useEffect(() => { ref.current?.focus(); }, []);

  const attempt = async () => {
    if (!username || !password) return;
    setLoading(true);
    setError(false);
    try {
      const data = await adminApi.login(username, password);
      onLogin(data.token);
    } catch {
      setError(true);
      setLoading(false);
      setTimeout(() => setError(false), 700);
    }
  };

  return (
    <div className="animate-screen-in flex items-center justify-center min-h-screen">
      <div className="w-full max-w-[380px] px-6 relative z-10">
        <p className="text-[0.7rem] font-bold tracking-[0.14em] uppercase text-on-surface-variant text-center mb-8">
          Admin Access
        </p>
        <div className="glass-panel border border-outline-variant/30 rounded-2xl p-7">
          <div className="flex flex-col gap-3 mb-4">
            <input
              ref={ref}
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && attempt()}
              className={`w-full h-14 px-5 bg-surface-container-lowest border rounded-xl text-on-surface font-body outline-none transition-all focus:border-primary/50 ${error ? 'border-error animate-shake' : 'border-outline-variant/30'}`}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && attempt()}
              className={`w-full h-14 px-5 bg-surface-container-lowest border rounded-xl text-on-surface font-body outline-none transition-all focus:border-primary/50 ${error ? 'border-error animate-shake' : 'border-outline-variant/30'}`}
            />
          </div>
          <button
            onClick={attempt}
            disabled={loading}
            className="w-full h-14 rounded-xl bg-gradient-to-br from-primary to-primary-fixed text-black font-headline font-bold tracking-wide transition-all hover:shadow-[0_0_32px_rgba(232,97,26,0.35)] mb-3"
          >
            {loading ? <Spinner /> : 'SIGN IN'}
          </button>
          <button
            onClick={onBack}
            className="w-full h-14 rounded-xl text-on-surface-variant border border-outline-variant/30 bg-surface-container font-semibold transition-all hover:border-primary hover:text-primary"
          >
            &larr; Back
          </button>
          <p className="text-center mt-4 font-mono text-[0.65rem] text-on-surface-variant/40">
            admin / zenith
          </p>
        </div>
      </div>
    </div>
  );
}
