import React, { useState, useRef, useEffect } from 'react';
import { adminApi, notifyPrizeDataChanged } from '../../lib/api';
import { TIER_META } from '../../lib/constants';
import PrizeIcon from '../../components/PrizeIcon';

const EMPTY_PRIZE = { name: '', description: '', tier: 'common', weight: 10, totalStock: 100, iconKey: 'consolation', imageUrl: '' };

const ICON_KEYS = ['consolation', 'sticker', 'tshirt', 'powerbank', 'hoodie', 'backpack', 'swagbox', 'vip'];

const inputCls = 'w-full h-10 px-3 bg-surface-container-low border border-outline-variant text-on-surface text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10';
const labelCls = 'block text-[10px] font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-1.5';

export default function PrizesTab({ token, prizes, onRefresh }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PRIZE);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewPrize, setPreviewPrize] = useState(null);
  const fileInputRef = useRef(null);
  const closePreviewRef = useRef(null);

  // Focus close button when modal opens; close on Escape
  useEffect(() => {
    if (!previewPrize) return;
    closePreviewRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') setPreviewPrize(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [previewPrize]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await adminApi.uploadImage(token, file);
      setForm(f => ({ ...f, imageUrl: url }));
    } catch (err) {
      alert('Image upload failed: ' + err.message);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setForm(f => ({ ...f, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
      imageUrl: prize.imageUrl || '',
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
      notifyPrizeDataChanged();
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
      notifyPrizeDataChanged();
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
          className="flex items-center gap-2 bg-primary text-on-primary text-xs font-bold uppercase tracking-wide px-4 py-2.5 hover:bg-primary-fixed transition-colors shadow-[0_2px_8px_rgba(224,96,32,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
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
            <button
              onClick={cancel}
              aria-label="Cancel editing"
              className="text-on-surface-variant hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">close</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-5">
            <div>
              <label className={labelCls} htmlFor="prize-name">Name</label>
              <input id="prize-name" className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className={labelCls} htmlFor="prize-desc">Description</label>
              <input id="prize-desc" className={inputCls} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className={labelCls} htmlFor="prize-tier">Tier</label>
              <select id="prize-tier" className={inputCls} value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })}>
                {['common', 'rare', 'epic', 'legendary'].map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="prize-icon">Icon</label>
              <select id="prize-icon" className={inputCls} value={form.iconKey} onChange={e => setForm({ ...form, iconKey: e.target.value })}>
                {ICON_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="prize-weight">Weight</label>
              <input id="prize-weight" className={inputCls} type="number" min="0" step="0.1" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
            </div>
            <div>
              <label className={labelCls} htmlFor="prize-stock">Total Stock</label>
              <input id="prize-stock" className={inputCls} type="number" min="0" value={form.totalStock} onChange={e => setForm({ ...form, totalStock: e.target.value })} />
            </div>
            {editing !== 'new' && (
              <div>
                <label className={labelCls} htmlFor="prize-remaining">Remaining Stock</label>
                <input id="prize-remaining" className={inputCls} type="number" min="0" value={form.remainingStock} onChange={e => setForm({ ...form, remainingStock: e.target.value })} />
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

          {/* Image Upload */}
          <div className="mb-5">
            <label className={labelCls} htmlFor="prize-image-upload">
              Prize Image <span className="normal-case text-on-surface-variant/60 tracking-normal font-normal">(optional — shown in spin reel)</span>
            </label>
            <div className="flex items-start gap-4">
              <label
                htmlFor="prize-image-upload"
                className={`flex items-center gap-2 h-10 px-4 border border-outline-variant text-sm transition-colors focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary ${uploading ? 'opacity-50 cursor-not-allowed text-on-surface-variant' : 'hover:border-primary hover:text-primary text-on-surface-variant cursor-pointer'}`}
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">{uploading ? 'hourglass_empty' : 'upload'}</span>
                {uploading ? 'Uploading…' : form.imageUrl ? 'Replace Image' : 'Upload Image'}
                <input
                  id="prize-image-upload"
                  ref={fileInputRef}
                  type="file"
                  name="prize-image"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploading}
                  onChange={handleImageUpload}
                />
              </label>
              {form.imageUrl && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPreviewPrize({ ...form, name: form.name || 'Preview' })}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    aria-label="Preview image full size"
                  >
                    <img
                      src={form.imageUrl}
                      alt="Prize preview"
                      width={64}
                      height={64}
                      className="w-16 h-16 object-contain border border-outline-variant bg-surface-container-low rounded-sm hover:border-primary transition-colors"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={clearImage}
                    aria-label="Remove prize image"
                    className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-error transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">delete</span>
                    Remove
                  </button>
                </div>
              )}
            </div>
            {!form.imageUrl && (
              <p className="mt-1.5 text-[11px] text-on-surface-variant/60">No image — the reel card will show no graphic for this prize.</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={save}
              disabled={saving || uploading || !form.name}
              className="flex items-center gap-2 px-5 h-10 bg-primary text-on-primary text-sm font-bold hover:bg-primary-fixed transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">save</span>
              {saving ? 'Saving…' : 'Save Prize'}
            </button>
            <button
              onClick={cancel}
              className="px-5 h-10 border border-outline-variant text-on-surface-variant text-sm hover:border-outline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
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
            <span className="material-symbols-outlined text-3xl mb-2" aria-hidden="true">inventory_2</span>
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
                className={`grid grid-cols-[2fr_1fr_80px_80px_1fr_96px] px-5 py-3 items-center hover:bg-surface-container-low/50 transition-colors ${
                  editing === p._id ? 'bg-primary/5' : ''
                }`}
                style={{ borderBottom: i < prizes.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
              >
                {/* Name + thumbnail */}
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Thumbnail button — opens preview modal */}
                  <button
                    onClick={() => setPreviewPrize(p)}
                    aria-label={`Preview image for ${p.name}`}
                    className="shrink-0 w-9 h-9 bg-surface-container-low border border-outline-variant flex items-center justify-center overflow-hidden hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt=""
                        width={36}
                        height={36}
                        loading="lazy"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-2 h-2 rounded-full" style={{ background: m?.color }} />
                    )}
                  </button>
                  {/* Prize name — also opens preview */}
                  <button
                    onClick={() => setPreviewPrize(p)}
                    className="text-sm font-medium text-on-surface truncate hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm text-left min-w-0"
                  >
                    {p.name}
                  </button>
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
                      className="h-full rounded-full transition-[width]"
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
                    className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">edit</span>
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p._id)}
                    aria-label={`Delete ${p.name}`}
                    className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-error transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Image Preview Modal ── */}
      {previewPrize && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-prize-name"
          onClick={() => setPreviewPrize(null)}
        >
          <div
            className="relative bg-white shadow-2xl max-w-sm w-full overflow-hidden"
            style={{ overscrollBehavior: 'contain' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Tier color stripe at top */}
            <div className="h-1 w-full" style={{ backgroundColor: TIER_META[previewPrize.tier]?.color }} />

            {/* Close button */}
            <button
              ref={closePreviewRef}
              aria-label="Close preview"
              onClick={() => setPreviewPrize(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <span className="material-symbols-outlined text-lg" aria-hidden="true">close</span>
            </button>

            {/* Image area */}
            <div className="flex items-center justify-center bg-surface-container-low min-h-[260px] p-8 relative">
              {/* Corner accents */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2" style={{ borderColor: `${TIER_META[previewPrize.tier]?.color}60` }} />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2" style={{ borderColor: `${TIER_META[previewPrize.tier]?.color}60` }} />

              {previewPrize.imageUrl ? (
                <img
                  src={previewPrize.imageUrl}
                  alt={previewPrize.name}
                  width={240}
                  height={240}
                  className="w-[240px] h-[240px] object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <PrizeIcon iconKey={previewPrize.iconKey || 'consolation'} tier={previewPrize.tier} size={120} />
                  <p className="text-[11px] text-on-surface-variant/60">No image uploaded</p>
                </div>
              )}
            </div>

            {/* Prize info strip */}
            <div className="p-5 border-t border-outline-variant">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    id="preview-prize-name"
                    className="font-headline text-lg font-bold text-on-surface truncate"
                  >
                    {previewPrize.name}
                  </p>
                  {previewPrize.description && (
                    <p className="mt-0.5 text-xs text-on-surface-variant truncate">{previewPrize.description}</p>
                  )}
                </div>
                <span
                  className="shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1"
                  style={{
                    color: TIER_META[previewPrize.tier]?.color,
                    border: `1px solid ${TIER_META[previewPrize.tier]?.color}40`,
                    backgroundColor: `${TIER_META[previewPrize.tier]?.color}10`,
                  }}
                >
                  {TIER_META[previewPrize.tier]?.label}
                </span>
              </div>
              <p className="mt-3 text-[10px] text-on-surface-variant/50 uppercase tracking-widest">
                Click outside or press Esc to close
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
