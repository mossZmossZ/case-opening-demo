import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import { TIER_META } from '../../lib/constants';

export default function HistoryTab({ token }) {
  const [data, setData] = useState({ results: [], total: 0, page: 1 });
  const [loading, setLoading] = useState(true);

  const loadPage = async (page) => {
    setLoading(true);
    try {
      const d = await adminApi.getHistory(token, page);
      setData(d);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPage(1); }, [token]);

  const totalPages = Math.ceil(data.total / (data.limit || 20));

  return (
    <div className="max-w-[760px]">
      <h2 className="text-base font-bold text-on-surface font-headline mb-5">Open History</h2>

      <div className="glass-panel border border-outline-variant/20 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1fr_80px] px-5 py-2.5 border-b border-outline-variant/20">
          {['User', 'Prize', 'Tier', 'Time'].map(h => (
            <span key={h} className="text-[0.7rem] font-bold tracking-[0.14em] uppercase text-on-surface-variant">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">Loading...</div>
        ) : data.results.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant/50">No history yet</div>
        ) : (
          data.results.map((h, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_1fr_1fr_80px] px-5 py-3 items-center transition-colors hover:bg-surface-container-high"
              style={{ borderBottom: i < data.results.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
            >
              <span className="text-sm text-on-surface truncate">{h.user}</span>
              <span className="text-sm text-on-surface-variant truncate">{h.name}</span>
              <span className="text-sm font-bold" style={{ color: TIER_META[h.tier]?.color }}>
                {TIER_META[h.tier]?.label}
              </span>
              <span className="font-mono text-[0.7rem] text-on-surface-variant/50">
                {h.time ? new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => loadPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-mono transition-all ${
                p === data.page
                  ? 'bg-primary text-black font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
