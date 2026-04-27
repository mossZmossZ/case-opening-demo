import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../lib/api';
import OverviewTab from './tabs/OverviewTab';
import PrizesTab from './tabs/PrizesTab';
import ProbabilityTab from './tabs/ProbabilityTab';
import HistoryTab from './tabs/HistoryTab';
import OperationsTab from './tabs/OperationsTab';

const NAV = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'prizes', label: 'Prizes', icon: 'inventory_2' },
  { id: 'probability', label: 'Drop Rates', icon: 'tune' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'operations', label: 'Operations', icon: 'admin_panel_settings' },
];

export default function AdminDashboard({ token, onLogout }) {
  const [tab, setTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [prizes, setPrizes] = useState([]);
  const [settings, setSettings] = useState({ maximumAttempts: 5 });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [dash, prz, appSettings] = await Promise.all([
        adminApi.getDashboard(token),
        adminApi.getPrizes(token),
        adminApi.getSettings(token),
      ]);
      setDashboard(dash);
      setPrizes(prz);
      setSettings(appSettings);
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('token')) onLogout();
    } finally {
      setLoading(false);
    }
  }, [token, onLogout]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background animate-screen-in font-body">

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 h-14 flex items-center justify-between px-6 bg-white border-b border-outline-variant shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-primary flex items-center justify-center shadow-[0_2px_8px_rgba(224,96,32,0.3)]">
            <span className="text-xs font-black text-white font-headline">Z</span>
          </div>
          <span className="font-headline font-bold text-sm uppercase tracking-tight">
            <span className="text-primary">Zenith</span>&nbsp;Admin
          </span>
          <span className="hidden md:block text-[10px] text-on-surface-variant/50 tracking-widest uppercase ml-3 pl-3 border-l border-outline-variant">
            Nutanix Cloud Native &amp; AI Innovation Day DEMO
          </span>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-error transition-colors px-3 py-1.5 border border-outline-variant hover:border-error"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          Sign out
        </button>
      </header>

      {/* ── Body: sidebar + content ───────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="w-52 xl:w-56 flex-shrink-0 flex flex-col bg-surface-container-low border-r border-outline-variant">
          <p className="text-[9px] font-bold tracking-[0.22em] uppercase text-on-surface-variant/40 px-5 pt-5 pb-2">
            Management
          </p>

          {NAV.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-all text-left w-full border-r-2 ${tab === id
                  ? 'bg-primary/8 text-primary border-primary font-semibold'
                  : 'text-on-surface-variant border-transparent hover:bg-surface-container hover:text-on-surface'
                }`}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: tab === id ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
              {label}
            </button>
          ))}

          {/* Bottom: refresh button */}
          <div className="mt-auto px-5 py-5 border-t border-outline-variant">
            <button
              onClick={refresh}
              className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors w-full"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Refresh data
            </button>
          </div>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto bg-surface-container-low/30">
          {loading ? (
            <div className="flex items-center justify-center h-full gap-2 text-on-surface-variant text-sm">
              <span className="material-symbols-outlined animate-spin-loader">progress_activity</span>
              Loading...
            </div>
          ) : (
            <div className="p-6 xl:p-8">
              {/* Page title */}
              <div className="mb-6">
                <h1 className="text-lg font-bold font-headline text-on-surface capitalize">{
                  NAV.find(n => n.id === tab)?.label
                }</h1>
                <p className="text-xs text-on-surface-variant mt-0.5 uppercase tracking-wider">
                  Zenith Case Opening — Admin Dashboard
                </p>
              </div>

              {tab === 'overview' && <OverviewTab dashboard={dashboard} />}
              {tab === 'prizes' && <PrizesTab token={token} prizes={prizes} onRefresh={refresh} />}
              {tab === 'probability' && <ProbabilityTab token={token} prizes={prizes} onRefresh={refresh} />}
              {tab === 'history' && <HistoryTab token={token} />}
              {tab === 'operations' && <OperationsTab token={token} settings={settings} onRefresh={refresh} />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
