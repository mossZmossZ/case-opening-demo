import React, { useState, useCallback, useEffect } from 'react';
import WelcomeScreen from './screens/WelcomeScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';
import SummaryScreen from './screens/SummaryScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import { subscribePrizeDataChanged } from './lib/api';

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [session, setSession] = useState(null);
  const [prizes, setPrizes] = useState([]);
  const [lastResult, setLastResult] = useState(null);
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
    if (!['welcome', 'game', 'result', 'summary'].includes(screen)) return undefined;

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

  const handleResult = useCallback((result) => {
    setLastResult(result);
    setSession(prev => ({
      ...prev,
      results: [...(prev.results || []), result.prize],
    }));
    loadPrizes(); // refresh prize inventory after every spin
    setScreen('result');
  }, [loadPrizes]);

  const handleContinue = useCallback(() => {
    if (lastResult.attemptsLeft <= 0) {
      setScreen('summary');
    } else {
      setScreen('game');
    }
  }, [lastResult]);

  const handlePlayAgain = useCallback(() => {
    setSession(null);
    setLastResult(null);
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
          key={`game-${session.results?.length || 0}`}
          session={session}
          prizes={prizes}
          onResult={handleResult}
          onRefreshPrizes={loadPrizes}
          onBackHome={handlePlayAgain}
          onGoToSummary={() => setScreen('summary')}
        />
      )}

      {screen === 'result' && lastResult && (
        <ResultScreen
          key={`result-${session.results?.length || 0}`}
          prize={lastResult.prize}
          attemptsLeft={lastResult.attemptsLeft}
          onContinue={handleContinue}
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
