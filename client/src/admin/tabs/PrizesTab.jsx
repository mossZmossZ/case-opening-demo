import React, { useState } from 'react';
import { adminApi } from '../../lib/api';
import { TIER_META } from '../../lib/constants';

const EMPTY_PRIZE = { name: '', description: '', tier: 'common', weight: 10, totalStock: 100, iconKey: 'consolation' };

const ICON_KEYS = ['consolation', 'sticker', 'tshirt', 'powerbank', 'hoodie', 'backpack', 'swagbox', 'vip'];

const inputCls = 'w-full h-10 px-3 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10';
const labelCls = 'block text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-1.5';

export default function PrizesTab({ token, prizes, onRefresh }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PRIZE);
  const [saving, setSaving] = useState(false);

  const startEdit = (prize) => {
    setEditing(prize._id);
    setForm({
      name: prize.name,
      description: prize.description,
      tier: prize.tier,
      weight: prize.weight,
      totalStock: prize.totalStock,
      remainingStock: prize.remainingStock,
      iconKey: prize.iconKey,
      active: prize.active,
    });
  };

  const startNew = () => { setEditing('new'); setForm(EMPTY_PRIZE); };
  const cancel   = () => setEditing(null);

  const save = async () => {
    setSaving(true);
    try {
      if (editing === 'new') await adminApi.createPrize(token, form);
      else await adminApi.updatePrize(token, editing, form);
      setEditing(null);
      await onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this prize?')) return;
    try {
      await adminApi.deletePrize(token, id);
      await onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-on-surface-variant">{prizes.length} prize{prizes.length !== 1 ? 's' : ''} configured</p>
        <button
          onClick={startNew}
          className="flex items-center gap-2 bg-primary text-on-primary text-xs font-bold uppercase tracking-wide px-4 py-2.5 hover:bg-primary-fixed transition-colors shadow-[0_2px_8px_rgba(224,96,32,0.2)]"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Prize
        </button>
      </div>

      {/* ── Edit / Create form ── */}
      {editing && (
        <div className="bg-white border border-primary/30 shadow-md p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-bold uppercase tracking-wide text-on-surface">
              {editing === 'new' ? 'New Prize' : 'Edit Prize'}
            </p>
            <button onClick={cancel} className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-5">
            <div>
              <label className={labelCls}>Name</label>
              <input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <input className={inputCls} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Tier</label>
              <select className={inputCls} value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })}>
                {['common', 'rare', 'epic', 'legendary'].map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Icon</label>
              <select className={inputCls} value={form.iconKey} onChange={e => setForm({ ...form, iconKey: e.target.value })}>
                {ICON_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Weight</label>
              <input className={inputCls} type="number" min="0" step="0.1" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Total Stock</label>
              <input className={inputCls} type="number" min="0" value={form.totalStock} onChange={e => setForm({ ...form, totalStock: e.target.value })} />
            </div>
            {editing !== 'new' && (
              <div>
                <label className={labelCls}>Remaining Stock</label>
                <input className={inputCls} type="number" min="0" value={form.remainingStock} onChange={e => setForm({ ...form, remainingStock: e.target.value })} />
              </div>
            )}
            {editing !== 'new' && (
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer select-none">
                  <input type="checkbox" checked={form.active !== false} onChange={e => setForm({ ...form, active: e.target.checked })} className="accent-primary w-4 h-4" />
                  <span className="font-semibold">Active</span>
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={save}
              disabled={saving || !form.name}
              className="flex items-center gap-2 px-5 h-10 bg-primary text-on-primary text-sm font-bold hover:bg-primary-fixed transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              {saving ? 'Saving...' : 'Save Prize'}
            </button>
            <button
              onClick={cancel}
              className="px-5 h-10 border border-outline-variant text-on-surface-variant text-sm hover:border-outline transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Prize table ── */}
      <div className="bg-white border border-outline-variant shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_80px_80px_1fr_96px] px-5 py-3 border-b border-outline-variant bg-surface-container-low">
          {['Prize', 'Tier', 'Total', 'Left', 'Stock Bar', 'Actions'].map(h => (
            <span key={h} className="text-[9px] font-bold tracking-[0.16em] uppercase text-on-surface-variant">{h}</span>
          ))}
        </div>

        {prizes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant/50">
            <span className="material-symbols-outlined text-3xl mb-2">inventory_2</span>
            <p className="text-sm">No prizes yet — add one above</p>
          </div>
        ) : (
          prizes.map((p, i) => {
            const pct   = p.totalStock > 0 ? p.remainingStock / p.totalStock : 0;
            const color = pct <= 0 ? '#EF4444' : pct <= 0.2 ? '#F59E0B' : '#22C55E';
            const m     = TIER_META[p.tier];
            return (
              <div
                key={p._id}
                className={`grid grid-cols-[2fr_1fr_80px_80px_1fr_96px] px-5 py-3.5 items-center hover:bg-surface-container-low/50 transition-colors ${
                  editing === p._id ? 'bg-primary/5' : ''
                }`}
                style={{ borderBottom: i < prizes.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
              >
                {/* Name */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: m?.color }} />
                  <span className="text-sm font-medium text-on-surface truncate">{p.name}</span>
                  {!p.active && (
                    <span className="shrink-0 text-[9px] font-bold text-error border border-error/30 px-1.5 py-0.5 uppercase tracking-wide">Off</span>
                  )}
                </div>
                {/* Tier */}
                <span className="text-xs font-bold uppercase" style={{ color: m?.color }}>{m?.label}</span>
                {/* Total */}
                <span className="font-mono text-sm text-on-surface-variant">{p.totalStock}</span>
                {/* Remaining */}
                <span className="font-mono text-sm font-bold" style={{ color }}>{p.remainingStock}</span>
                {/* Stock bar */}
                <div className="flex items-center gap-3 pr-4">
                  <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, pct * 100)}%`, background: color }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-on-surface-variant/60 w-8 text-right shrink-0">
                    {p.weight}
                  </span>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => startEdit(p)}
                    className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p._id)}
                    className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
