const BASE = '/api';

// Compress and resize an image file before upload.
// Resizes to fit within maxPx on the longest side, converts to WebP.
// Skips compression for GIFs (animation support).
async function compressImage(file, maxPx = 1200, quality = 0.85) {
  if (file.type === 'image/gif') return file;
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const name = file.name.replace(/\.[^.]+$/, '.webp');
          resolve(new File([blob], name, { type: 'image/webp' }));
        },
        'image/webp',
        quality,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Failed to load image')); };
    img.src = objectUrl;
  });
}

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
  getLeaderboard: () =>
    request('/game/leaderboard'),
};

// Admin API
export const adminApi = {
  login: (username, password) =>
    request('/admin/login', { body: { username, password } }),
  uploadImage: async (token, file) => {
    const compressed = await compressImage(file);
    const formData = new FormData();
    formData.append('image', compressed);
    const res = await fetch(`${BASE}/admin/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { throw new Error(`Server error (${res.status}): ${text.slice(0, 200)}`); }
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
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
