import React, { useState, useCallback, useEffect } from 'react';
import WelcomeScreen from './screens/WelcomeScreen';
import GameScreen from './screens/GameScreen';
import SummaryScreen from './screens/SummaryScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import { subscribePrizeDataChanged } from './lib/api';

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [session, setSession] = useState(null);
  const [prizes, setPrizes] = useState([]);
  const [adminToken, setAdminToken] = useState(null);

  // Fetch active prizes for the reel display (public endpoint)
  const loadPrizes = useCallback(async () => {
    try {
      const res = await fetch('/api/game/prizes');
      if (res.ok) {
        setPrizes(await res.json());
      }
    } catch {
      // Prizes will load once server is available
    }
  }, []);

  useEffect(() => { loadPrizes(); }, [loadPrizes]);
  useEffect(() => subscribePrizeDataChanged(loadPrizes), [loadPrizes]);

  useEffect(() => {
    if (!['welcome', 'game', 'summary'].includes(screen)) return undefined;

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') loadPrizes();
    };

    const interval = setInterval(loadPrizes, 10000);
    window.addEventListener('focus', loadPrizes);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', loadPrizes);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [screen, loadPrizes]);

  // User flow handlers
  const handleStart = useCallback((sessionData) => {
    setSession({
      ...sessionData,
      results: [],
    });
    setScreen('game');
  }, []);

  // Called by GameScreen when all spins are done (or prizes ran out mid-session)
  const handleSummary = useCallback((updatedSession) => {
    setSession(updatedSession);
    setScreen('summary');
  }, []);

  const handlePlayAgain = useCallback(() => {
    setSession(null);
    setScreen('welcome');
  }, []);

  // Admin flow handlers
  const handleAdminLogin = useCallback((token) => {
    setAdminToken(token);
    setScreen('admin');
  }, []);

  const handleAdminLogout = useCallback(() => {
    setAdminToken(null);
    setScreen('welcome');
  }, []);

  return (
    <div className="w-full h-full relative kinetic-mesh">
      {screen === 'welcome' && (
        <WelcomeScreen
          onStart={handleStart}
          onAdmin={() => setScreen('admin-login')}
          onLeaderboard={() => setScreen('leaderboard')}
          prizes={prizes}
        />
      )}

      {screen === 'leaderboard' && (
        <LeaderboardScreen
          onBack={() => setScreen('welcome')}
          onAdmin={() => setScreen('admin-login')}
        />
      )}

      {screen === 'game' && session && (
        <GameScreen
          key="game"
          session={session}
          prizes={prizes}
          onSummary={handleSummary}
          onRefreshPrizes={loadPrizes}
          onBackHome={handlePlayAgain}
        />
      )}

      {screen === 'summary' && session && (
        <SummaryScreen
          session={session}
          onPlayAgain={handlePlayAgain}
        />
      )}

      {screen === 'admin-login' && (
        <AdminLogin
          onLogin={handleAdminLogin}
          onBack={() => setScreen('welcome')}
        />
      )}

      {screen === 'admin' && adminToken && (
        <AdminDashboard
          token={adminToken}
          onLogout={handleAdminLogout}
        />
      )}
    </div>
  );
}
