import React, { useState } from 'react';
import { adminApi } from '../../lib/api';
import { TIER_META } from '../../lib/constants';

const EMPTY_PRIZE = { name: '', description: '', tier: 'common', weight: 10, totalStock: 100, iconKey: 'consolation' };

export default function PrizesTab({ token, prizes, onRefresh }) {
  const [editing, setEditing] = useState(null); // prize id or 'new'
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

  const startNew = () => {
    setEditing('new');
    setForm(EMPTY_PRIZE);
  };

  const cancel = () => { setEditing(null); };

  const save = async () => {
    setSaving(true);
    try {
      if (editing === 'new') {
        await adminApi.createPrize(token, form);
      } else {
        await adminApi.updatePrize(token, editing, form);
      }
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

  const inputCls = 'w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-on-surface text-sm outline-none focus:border-primary/50';

  return (
    <div className="max-w-[800px]">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-base font-bold text-on-surface font-headline">Prize Inventory</h2>
        <button onClick={startNew} className="text-sm font-semibold text-primary hover:underline">+ Add Prize</button>
      </div>

      {/* Edit/Create form */}
      {editing && (
        <div className="glass-panel border border-primary/30 rounded-2xl p-5 mb-5">
          <p className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant mb-4">
            {editing === 'new' ? 'New Prize' : 'Edit Prize'}
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-on-surface-variant mb-1 block">Name</label>
              <input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-on-surface-variant mb-1 block">Description</label>
              <input className={inputCls} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-on-surface-variant mb-1 block">Tier</label>
              <select className={inputCls} value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })}>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-on-surface-variant mb-1 block">Weight (accuracy/drop rate)</label>
              <input className={inputCls} type="number" min="0" step="0.1" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-on-surface-variant mb-1 block">Total Stock</label>
              <input className={inputCls} type="number" min="0" value={form.totalStock} onChange={e => setForm({ ...form, totalStock: e.target.value })} />
            </div>
            {editing !== 'new' && (
              <div>
                <label className="text-xs text-on-surface-variant mb-1 block">Remaining Stock</label>
                <input className={inputCls} type="number" min="0" value={form.remainingStock} onChange={e => setForm({ ...form, remainingStock: e.target.value })} />
              </div>
            )}
            <div>
              <label className="text-xs text-on-surface-variant mb-1 block">Icon Key</label>
              <select className={inputCls} value={form.iconKey} onChange={e => setForm({ ...form, iconKey: e.target.value })}>
                {['consolation', 'sticker', 'tshirt', 'powerbank', 'hoodie', 'backpack', 'swagbox', 'vip'].map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            {editing !== 'new' && (
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
                  <input type="checkbox" checked={form.active !== false} onChange={e => setForm({ ...form, active: e.target.checked })} className="accent-primary" />
                  Active
                </label>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving || !form.name} className="px-5 h-10 rounded-lg bg-primary text-on-primary font-bold text-sm transition-all hover:bg-primary-fixed disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={cancel} className="px-5 h-10 rounded-lg border border-outline-variant/30 text-on-surface-variant text-sm hover:border-outline">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Prize table */}
      <div className="glass-panel border border-outline-variant/20 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_64px_64px_1fr_80px] px-5 py-2.5 border-b border-outline-variant/20">
          {['Prize', 'Total', 'Left', 'Stock', 'Actions'].map(h => (
            <span key={h} className="text-[0.7rem] font-bold tracking-[0.14em] uppercase text-on-surface-variant">{h}</span>
          ))}
        </div>
        {prizes.map((p, i) => {
          const pct = p.totalStock > 0 ? p.remainingStock / p.totalStock : 0;
          const stockColor = pct <= 0 ? '#EF4444' : pct <= 0.2 ? '#ff9159' : '#a8abb3';
          return (
            <div
              key={p._id}
              className="grid grid-cols-[1fr_64px_64px_1fr_80px] px-5 py-3 items-center transition-colors hover:bg-surface-container-high"
              style={{ borderBottom: i < prizes.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: TIER_META[p.tier]?.color }} />
                <span className="text-sm text-on-surface">{p.name}</span>
                {!p.active && <span className="text-[0.6rem] text-error border border-error/30 px-1 rounded">OFF</span>}
              </div>
              <span className="font-mono text-sm text-on-surface-variant">{p.totalStock}</span>
              <span className="font-mono text-sm" style={{ color: stockColor }}>{p.remainingStock}</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-outline-variant/20 rounded-sm">
                  <div className="h-full rounded-sm" style={{ width: `${Math.min(100, pct * 100)}%`, background: stockColor }} />
                </div>
                <span className="font-mono text-xs w-8 text-right" style={{ color: stockColor }}>
                  {p.weight}
                </span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(p)} className="text-xs text-on-surface-variant hover:text-primary transition-colors">Edit</button>
                <span className="text-on-surface-variant/30">|</span>
                <button onClick={() => remove(p._id)} className="text-xs text-on-surface-variant hover:text-error transition-colors">Del</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
