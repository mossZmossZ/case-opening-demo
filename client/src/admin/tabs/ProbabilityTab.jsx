import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import { TIER_META } from '../../lib/constants';

export default function ProbabilityTab({ token, prizes, onRefresh }) {
  const [rates, setRates]   = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  useEffect(() => {
    setRates(prizes.filter(p => p.active).map(p => ({
      id: p._id, name: p.name, tier: p.tier, weight: p.weight,
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
      await adminApi.updateRates(token, { rates: rates.map(r => ({ id: r.id, weight: r.weight })) });
      await onRefresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const tiers = ['legendary', 'epic', 'rare', 'common'];
  const grouped = {};
  tiers.forEach(t => { grouped[t] = rates.filter(r => r.tier === t); });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

      {/* ── Left: sliders ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white border border-outline-variant shadow-sm px-5 py-3">
          <div>
            <span className="text-xs text-on-surface-variant">Total weight: </span>
            <span className={`font-mono font-bold text-sm ${totalWeight > 0 ? 'text-green-600' : 'text-error'}`}>
              {totalWeight.toFixed(1)}
            </span>
            <span className="text-xs text-on-surface-variant/50 ml-2">(higher = more likely)</span>
          </div>
          <button
            onClick={saveRates}
            disabled={saving}
            className={`flex items-center gap-2 px-5 h-9 text-sm font-bold uppercase tracking-wide transition-all disabled:opacity-50 ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-primary text-on-primary hover:bg-primary-fixed shadow-[0_2px_8px_rgba(224,96,32,0.2)]'
            }`}
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              {saved ? 'check_circle' : 'save'}
            </span>
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Rates'}
          </button>
        </div>

        {tiers.map(tier => {
          const items = grouped[tier];
          if (!items || items.length === 0) return null;
          const m = TIER_META[tier];
          const tierWeight = items.reduce((s, r) => s + Number(r.weight), 0);
          const tierPct    = totalWeight > 0 ? ((tierWeight / totalWeight) * 100).toFixed(1) : 0;

          return (
            <div key={tier} className="bg-white border border-outline-variant shadow-sm overflow-hidden">
              {/* Tier header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                  <span className="text-sm font-bold uppercase tracking-wide" style={{ color: m.color }}>{m.label}</span>
                </div>
                <span className="font-mono text-sm font-bold text-on-surface-variant">{tierPct}% chance</span>
              </div>

              <div className="px-5 py-4 space-y-4">
                {items.map(r => (
                  <div key={r.id} className="flex items-center gap-4">
                    <span className="text-sm text-on-surface w-36 shrink-0 truncate font-medium">{r.name}</span>
                    <input
                      type="range"
                      min={0} max={100} step={0.1}
                      value={r.weight}
                      onChange={e => updateWeight(r.id, e.target.value)}
                      className="flex-1 h-1.5 cursor-pointer appearance-none bg-surface-container-high rounded-full"
                      style={{ accentColor: m.color }}
                    />
                    <input
                      type="number"
                      min={0} step={0.1}
                      value={r.weight}
                      onChange={e => updateWeight(r.id, e.target.value)}
                      className="w-20 h-9 px-2 bg-surface-container-low border border-outline-variant text-on-surface font-mono text-sm text-center outline-none focus:border-primary"
                    />
                  </div>
                ))}

                {/* Tier probability bar */}
                <div className="pt-1">
                  <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Number(tierPct))}%`, background: m.color }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Right: Summary panel ── */}
      <div className="space-y-4">
        <div className="bg-white border border-outline-variant shadow-sm p-5">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-on-surface-variant mb-4">
            Chance Summary
          </p>
          <div className="space-y-3">
            {tiers.map(tier => {
              const items = grouped[tier] || [];
              const tierWeight = items.reduce((s, r) => s + Number(r.weight), 0);
              const pct = totalWeight > 0 ? ((tierWeight / totalWeight) * 100) : 0;
              const m = TIER_META[tier];
              return (
                <div key={tier}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold" style={{ color: m.color }}>{m.label}</span>
                    <span className="font-mono text-sm font-bold text-on-surface">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, pct)}%`, background: m.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-outline-variant shadow-sm p-5">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-on-surface-variant mb-4">
            Active Prizes
          </p>
          <div className="space-y-2">
            {rates.map(r => {
              const pct = totalWeight > 0 ? ((Number(r.weight) / totalWeight) * 100).toFixed(1) : 0;
              const m = TIER_META[r.tier];
              return (
                <div key={r.id} className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: m?.color }} />
                  <span className="flex-1 text-on-surface truncate">{r.name}</span>
                  <span className="font-mono text-on-surface-variant/60">{pct}%</span>
                </div>
              );
            })}
            {rates.length === 0 && (
              <p className="text-xs text-on-surface-variant/50 italic">No active prizes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
