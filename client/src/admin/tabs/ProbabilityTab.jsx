import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import { TIER_META } from '../../lib/constants';

export default function ProbabilityTab({ token, prizes, onRefresh }) {
  const [rates, setRates] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setRates(prizes.filter(p => p.active).map(p => ({
      id: p._id,
      name: p.name,
      tier: p.tier,
      weight: p.weight,
    })));
  }, [prizes]);

  const totalWeight = rates.reduce((s, r) => s + Number(r.weight), 0);

  const updateWeight = (id, weight) => {
    setRates(prev => prev.map(r => r.id === id ? { ...r, weight: Number(weight) } : r));
    setSaved(false);
  };

  const saveRates = async () => {
    setSaving(true);
    try {
      await adminApi.updateRates(token, {
        rates: rates.map(r => ({ id: r.id, weight: r.weight })),
      });
      await onRefresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Group by tier for display
  const tiers = ['common', 'rare', 'epic', 'legendary'];
  const grouped = {};
  tiers.forEach(t => { grouped[t] = rates.filter(r => r.tier === t); });

  return (
    <div className="max-w-[580px]">
      <h2 className="text-base font-bold text-on-surface font-headline mb-1">Drop Rates (Accuracy)</h2>
      <p className="text-sm text-on-surface-variant mb-6">
        Total weight:{' '}
        <span className={`font-mono font-bold ${totalWeight > 0 ? 'text-green-500' : 'text-error'}`}>
          {totalWeight.toFixed(1)}
        </span>
        <span className="text-on-surface-variant/50 ml-2">
          (higher weight = higher drop chance)
        </span>
      </p>

      <div className="glass-panel border border-outline-variant/20 rounded-2xl p-6">
        {tiers.map(tier => {
          const items = grouped[tier];
          if (!items || items.length === 0) return null;
          const m = TIER_META[tier];
          const tierWeight = items.reduce((s, r) => s + Number(r.weight), 0);
          const tierPct = totalWeight > 0 ? ((tierWeight / totalWeight) * 100).toFixed(1) : 0;

          return (
            <div key={tier} className="mb-6 last:mb-0">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold uppercase tracking-[0.1em]" style={{ color: m.color }}>
                  {m.label}
                </span>
                <span className="font-mono text-sm text-on-surface-variant">
                  {tierPct}% chance
                </span>
              </div>
              {items.map(r => (
                <div key={r.id} className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-on-surface w-32 truncate">{r.name}</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.1}
                    value={r.weight}
                    onChange={e => updateWeight(r.id, e.target.value)}
                    className="flex-1 cursor-pointer"
                    style={{ accentColor: m.color }}
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={r.weight}
                    onChange={e => updateWeight(r.id, e.target.value)}
                    className="w-20 h-8 px-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface font-mono text-sm text-center outline-none focus:border-primary/50"
                  />
                </div>
              ))}
              {/* Tier bar */}
              <div className="h-1 bg-outline-variant/20 rounded-sm mt-2">
                <div className="h-full rounded-sm transition-all" style={{ width: `${Math.min(100, Number(tierPct))}%`, background: m.color, boxShadow: `0 0 8px ${m.glow}` }} />
              </div>
            </div>
          );
        })}

        <button
          onClick={saveRates}
          disabled={saving}
          className="w-full h-12 mt-4 rounded-xl bg-gradient-to-br from-primary to-primary-fixed text-black font-headline font-bold tracking-wide transition-all hover:shadow-[0_0_32px_rgba(232,97,26,0.35)] disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'SAVE RATES'}
        </button>
      </div>
    </div>
  );
}
