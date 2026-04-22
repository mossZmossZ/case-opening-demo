import React from 'react';
import { TIER_META } from '../../lib/constants';

const KPI_ICONS = {
  Participants:   { icon: 'group',      color: '#3B82F6' },
  'Total Opens':  { icon: 'lock_open',  color: '#E06020' },
  'Active Now':   { icon: 'sensors',    color: '#22C55E' },
};

export default function OverviewTab({ dashboard }) {
  if (!dashboard) return null;

  const stats = [
    [String(dashboard.participants), 'Participants'],
    [String(dashboard.totalOpens),   'Total Opens'],
    [String(dashboard.activeSessions), 'Active Now'],
  ];

  const tierTotals = {};
  (dashboard.stockSummary || []).forEach(s => {
    const used = s.total - s.remaining;
    tierTotals[s.tier] = (tierTotals[s.tier] || 0) + used;
  });
  const totalUsed = Object.values(tierTotals).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map(([val, label]) => {
          const meta = KPI_ICONS[label];
          return (
            <div key={label} className="bg-white border border-outline-variant shadow-sm p-6 flex items-start justify-between border-t-4" style={{ borderTopColor: meta?.color }}>
              <div>
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-on-surface-variant mb-3">{label}</p>
                <div className="text-5xl font-headline font-bold text-on-surface leading-none">{val}</div>
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded-lg" style={{ background: `${meta?.color}15` }}>
                <span className="material-symbols-outlined text-xl" style={{ color: meta?.color, fontVariationSettings: "'FILL' 1" }}>
                  {meta?.icon}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Reward Distribution */}
        <div className="bg-white border border-outline-variant shadow-sm p-6">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-on-surface-variant mb-5">
            Reward Distribution
          </p>
          <div className="space-y-4">
            {['legendary', 'epic', 'rare', 'common'].map(tier => {
              const pct = Math.round(((tierTotals[tier] || 0) / totalUsed) * 100);
              const m = TIER_META[tier];
              return (
                <div key={tier}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                      <span className="text-sm font-semibold text-on-surface">{m.label}</span>
                    </div>
                    <span className="font-mono text-sm font-bold" style={{ color: m.color }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: m.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stock summary table */}
          <div className="mt-6 border-t border-outline-variant pt-5">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-on-surface-variant mb-3">Stock Levels</p>
            <div className="space-y-2">
              {(dashboard.stockSummary || []).map((s, i) => {
                const pct = s.total > 0 ? (s.remaining / s.total) : 0;
                const color = pct <= 0 ? '#EF4444' : pct <= 0.2 ? '#F59E0B' : '#22C55E';
                return (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: TIER_META[s.tier]?.color }} />
                    <span className="flex-1 text-on-surface truncate">{s.name}</span>
                    <span className="font-mono" style={{ color }}>{s.remaining}/{s.total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="xl:col-span-2 bg-white border border-outline-variant shadow-sm p-6">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-on-surface-variant mb-5">
            Recent Activity
          </p>

          {(!dashboard.recentActivity || dashboard.recentActivity.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant/50">
              <span className="material-symbols-outlined text-3xl mb-2">inbox</span>
              <p className="text-sm">No activity yet</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_1fr_100px_72px] pb-2">
                {['Player', 'Prize', 'Tier', 'Time'].map(h => (
                  <span key={h} className="text-[9px] font-bold tracking-[0.16em] uppercase text-on-surface-variant/60">{h}</span>
                ))}
              </div>
              {(dashboard.recentActivity || []).slice(0, 10).map((h, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_100px_72px] py-2.5 items-center hover:bg-surface-container-low/50 transition-colors -mx-2 px-2">
                  <span className="text-sm text-on-surface font-medium truncate">{h.user}</span>
                  <span className="text-sm text-on-surface-variant truncate pr-4">{h.name}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: TIER_META[h.tier]?.color }} />
                    <span className="text-xs font-semibold" style={{ color: TIER_META[h.tier]?.color }}>
                      {TIER_META[h.tier]?.label}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-on-surface-variant/50">
                    {h.time ? new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
