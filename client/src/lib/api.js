const BASE = '/api';

async function request(path, options = {}) {
  const { body, token, method = body ? 'POST' : 'GET' } = options;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// Game API
export const gameApi = {
  register: (name, attempts) =>
    request('/game/register', { body: { name, attempts } }),
  spin: (sessionId) =>
    request(`/game/spin/${sessionId}`, { body: {} }),
  getSession: (sessionId) =>
    request(`/game/session/${sessionId}`),
  getStats: () =>
    request('/game/stats'),
};

// Admin API
export const adminApi = {
  login: (username, password) =>
    request('/admin/login', { body: { username, password } }),
  uploadImage: (token, file) => {
    const formData = new FormData();
    formData.append('image', file);
    return fetch(`${BASE}/admin/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(async res => {
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error(`Server returned non-JSON (${res.status}): ${text.slice(0, 200)}`); }
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      return data;
    });
  },
  getDashboard: (token) =>
    request('/admin/dashboard', { token }),
  getPrizes: (token) =>
    request('/admin/prizes', { token }),
  createPrize: (token, prize) =>
    request('/admin/prizes', { token, body: prize }),
  updatePrize: (token, id, updates) =>
    request(`/admin/prizes/${id}`, { token, body: updates, method: 'PUT' }),
  deletePrize: (token, id) =>
    request(`/admin/prizes/${id}`, { token, method: 'DELETE' }),
  getRates: (token) =>
    request('/admin/rates', { token }),
  updateRates: (token, rates) =>
    request('/admin/rates', { token, body: rates, method: 'PUT' }),
  getHistory: (token, page = 1, limit = 20) =>
    request(`/admin/history?page=${page}&limit=${limit}`, { token }),
};
