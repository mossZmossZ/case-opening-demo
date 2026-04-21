import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../lib/api';
import { TIER_META } from '../lib/constants';
import Topbar from '../components/Topbar';
import OverviewTab from './tabs/OverviewTab';
import PrizesTab from './tabs/PrizesTab';
import ProbabilityTab from './tabs/ProbabilityTab';
import HistoryTab from './tabs/HistoryTab';

const TABS = ['overview', 'prizes', 'probability', 'history'];

export default function AdminDashboard({ token, onLogout }) {
  const [tab, setTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [dash, prz] = await Promise.all([
        adminApi.getDashboard(token),
        adminApi.getPrizes(token),
      ]);
      setDashboard(dash);
      setPrizes(prz);
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('token')) onLogout();
    } finally {
      setLoading(false);
    }
  }, [token, onLogout]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div className="animate-screen-in flex flex-col min-h-screen">
      <Topbar
        left={
          <div className="flex items-center gap-6">
            <span className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">Admin</span>
            <div className="flex gap-0.5">
              {TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`font-body text-sm px-3.5 py-1.5 capitalize transition-colors ${
                    tab === t
                      ? 'text-on-surface font-semibold border-b-2 border-primary'
                      : 'text-on-surface-variant border-b-2 border-transparent hover:text-on-surface'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        }
        right={
          <button onClick={onLogout} className="text-sm text-on-surface-variant hover:text-primary transition-colors">
            Sign out
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto pt-20 px-10 pb-10">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-on-surface-variant">Loading...</div>
        ) : (
          <>
            {tab === 'overview' && <OverviewTab dashboard={dashboard} />}
            {tab === 'prizes' && <PrizesTab token={token} prizes={prizes} onRefresh={refresh} />}
            {tab === 'probability' && <ProbabilityTab token={token} prizes={prizes} onRefresh={refresh} />}
            {tab === 'history' && <HistoryTab token={token} />}
          </>
        )}
      </div>
    </div>
  );
}
