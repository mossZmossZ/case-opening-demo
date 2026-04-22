import React, { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import { TIER_META } from '../../lib/constants';

export default function HistoryTab({ token }) {
  const [data, setData]       = useState({ results: [], total: 0, page: 1 });
  const [loading, setLoading] = useState(true);

  const loadPage = async (page) => {
    setLoading(true);
    try {
      setData(await adminApi.getHistory(token, page));
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPage(1); }, [token]);

  const totalPages = Math.ceil(data.total / (data.limit || 20));

  return (
    <div className="space-y-4">
      {/* Stats strip */}
      <div className="flex items-center gap-6 text-sm text-on-surface-variant">
        <span>
          <span className="font-bold text-on-surface">{data.total}</span> total opens
        </span>
        {totalPages > 1 && (
          <span>Page <span className="font-bold text-on-surface">{data.page}</span> of {totalPages}</span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-outline-variant shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2fr_2fr_120px_100px] px-5 py-3 border-b border-outline-variant bg-surface-container-low">
          {['Player', 'Prize', 'Tier', 'Time'].map(h => (
            <span key={h} className="text-[9px] font-bold tracking-[0.16em] uppercase text-on-surface-variant">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-on-surface-variant text-sm">
            <span className="material-symbols-outlined animate-spin-loader">progress_activity</span>
            Loading...
          </div>
        ) : data.results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant/50">
            <span className="material-symbols-outlined text-3xl mb-2">history</span>
            <p className="text-sm">No history yet</p>
          </div>
        ) : (
          data.results.map((h, i) => {
            const m = TIER_META[h.tier];
            return (
              <div
                key={i}
                className="grid grid-cols-[2fr_2fr_120px_100px] px-5 py-3 items-center hover:bg-surface-container-low/50 transition-colors"
                style={{ borderBottom: i < data.results.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
              >
                <span className="text-sm font-medium text-on-surface truncate">{h.user}</span>
                <span className="text-sm text-on-surface-variant truncate pr-4">{h.name}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: m?.color }} />
                  <span className="text-xs font-bold" style={{ color: m?.color }}>{m?.label}</span>
                </div>
                <span className="font-mono text-[10px] text-on-surface-variant/50">
                  {h.time ? new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => loadPage(data.page - 1)}
            disabled={data.page <= 1}
            className="w-8 h-8 flex items-center justify-center border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>

          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => loadPage(p)}
              className={`w-8 h-8 text-xs font-mono font-bold transition-all border ${
                p === data.page
                  ? 'bg-primary text-on-primary border-primary'
                  : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => loadPage(data.page + 1)}
            disabled={data.page >= totalPages}
            className="w-8 h-8 flex items-center justify-center border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
}
