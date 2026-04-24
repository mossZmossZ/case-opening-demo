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
    <div className="animate-screen-in flex items-center justify-center min-h-screen bg-background kinetic-mesh">
      <div className="w-full max-w-[380px] px-6 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-4 shadow-[0_4px_16px_rgba(224,96,32,0.3)]">
            <span className="text-xl font-black text-white font-headline">Z</span>
          </div>
          <p className="text-[0.7rem] font-bold tracking-[0.14em] uppercase text-on-surface-variant">
            Admin Access
          </p>
        </div>

        <div className="bg-white border border-outline-variant rounded-2xl p-7 shadow-md">
          <div className="flex flex-col gap-3 mb-4">
            <input
              ref={ref}
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && attempt()}
              className={`w-full h-14 px-5 bg-surface-container-low border rounded-xl text-on-surface font-body outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 ${error ? 'border-error animate-shake' : 'border-outline-variant'}`}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && attempt()}
              className={`w-full h-14 px-5 bg-surface-container-low border rounded-xl text-on-surface font-body outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 ${error ? 'border-error animate-shake' : 'border-outline-variant'}`}
            />
          </div>
          <button
            onClick={attempt}
            disabled={loading}
            className="w-full h-14 rounded-xl bg-primary text-on-primary font-headline font-bold tracking-wide transition-all hover:bg-primary-fixed hover:shadow-[0_4px_24px_rgba(224,96,32,0.35)] mb-3 shadow-[0_2px_12px_rgba(224,96,32,0.2)]"
          >
            {loading ? <Spinner /> : 'SIGN IN'}
          </button>
          <button
            onClick={onBack}
            className="w-full h-14 rounded-xl text-on-surface-variant border border-outline-variant bg-surface-container-low font-semibold transition-all hover:border-primary hover:text-primary"
          >
            &larr; Back
          </button>
        </div>
      </div>
    </div>
  );
}
