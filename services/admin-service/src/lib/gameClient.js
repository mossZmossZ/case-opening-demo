const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:4002';

async function request(path, options = {}) {
  const res = await fetch(`${GAME_SERVICE_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw { status: res.status, data };
  return data;
}

export const getDashboard = () =>
  request('/internal/game/dashboard');

export const getHistory = (page, limit) =>
  request(`/internal/game/history?page=${page}&limit=${limit}`);

export const resetSessions = () =>
  request('/internal/game/reset-sessions', { method: 'POST' });

export const getSettings = () =>
  request('/internal/game/settings');

export const updateSettings = (body) =>
  request('/internal/game/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
