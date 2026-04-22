import React from 'react';
import { TIER_META } from '../../lib/constants';

export default function OverviewTab({ dashboard }) {
  if (!dashboard) return null;

  const stats = [
    [String(dashboard.participants), 'Participants'],
    [String(dashboard.totalOpens), 'Total Opens'],
    [String(dashboard.activeSessions), 'Active Now'],
  ];

  // Calculate tier distribution from stock
  const tierTotals = {};
  (dashboard.stockSummary || []).forEach(s => {
    const used = s.total - s.remaining;
    tierTotals[s.tier] = (tierTotals[s.tier] || 0) + used;
  });
  const totalUsed = Object.values(tierTotals).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="max-w-[1100px]">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {stats.map(([val, label]) => (
          <div key={label} className="glass-panel border border-outline-variant/20 rounded-2xl p-5">
            <div className="font-mono text-4xl font-bold text-on-surface leading-none mb-1.5">{val}</div>
            <div className="text-[0.7rem] font-bold tracking-[0.14em] uppercase text-on-surface-variant">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Distribution */}
        <div className="glass-panel border border-outline-variant/20 rounded-2xl p-6">
          <p className="text-[0.7rem] font-bold tracking-[0.14em] uppercase text-on-surface-variant mb-5">
            Reward Distribution
          </p>
          {['common', 'rare', 'epic', 'legendary'].map(tier => {
            const pct = totalUsed > 0 ? Math.round(((tierTotals[tier] || 0) / totalUsed) * 100) : 0;
            const m = TIER_META[tier];
            return (
              <div key={tier} className="mb-3.5">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold" style={{ color: m.color }}>{m.label}</span>
                  <span className="font-mono text-sm text-on-surface-variant">{pct}%</span>
                </div>
                <div className="h-1 bg-outline-variant/20 rounded-sm">
                  <div
                    className="h-full rounded-sm transition-all"
                    style={{ width: `${pct}%`, background: m.color, boxShadow: `0 0 8px ${m.glow}` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent activity */}
        <div className="glass-panel border border-outline-variant/20 rounded-2xl p-6">
          <p className="text-[0.7rem] font-bold tracking-[0.14em] uppercase text-on-surface-variant mb-5">
            Recent Activity
          </p>
          {(dashboard.recentActivity || []).slice(0, 8).map((h, i) => (
            <div key={i} className="flex items-center gap-2.5 py-2" style={{ borderBottom: i < 7 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0"
                   style={{ background: TIER_META[h.tier]?.color, boxShadow: `0 0 6px ${TIER_META[h.tier]?.glow}` }} />
              <span className="text-sm text-on-surface flex-1 truncate">{h.user}</span>
              <span className="text-sm font-semibold" style={{ color: TIER_META[h.tier]?.color }}>{TIER_META[h.tier]?.label}</span>
              <span className="font-mono text-[0.7rem] text-on-surface-variant/50">
                {h.time ? new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
          ))}
          {(!dashboard.recentActivity || dashboard.recentActivity.length === 0) && (
            <p className="text-sm text-on-surface-variant/50">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
