const PRIZE_SERVICE_URL = process.env.PRIZE_SERVICE_URL || 'http://localhost:4004';

async function request(path, options = {}) {
  const res = await fetch(`${PRIZE_SERVICE_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw { status: res.status, data };
  return data;
}

export const getAllPrizes = () =>
  request('/internal/prizes');

export const createPrize = (body) =>
  request('/internal/prizes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const updatePrize = (id, body) =>
  request(`/internal/prizes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const deletePrize = (id) =>
  request(`/internal/prizes/${id}`, { method: 'DELETE' });

export const getRates = () =>
  request('/internal/prizes/rates');

export const updateRates = (body) =>
  request('/internal/prizes/rates', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const resetStock = () =>
  request('/internal/prizes/reset-stock', { method: 'POST' });

export const generateDummy = () =>
  request('/internal/prizes/generate-dummy', { method: 'POST' });
