const PRIZE_SERVICE_URL = process.env.PRIZE_SERVICE_URL || 'http://localhost:4004';

export async function getActivePrizes() {
  const res = await fetch(`${PRIZE_SERVICE_URL}/internal/prizes/active`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch active prizes');
  }
  return res.json();
}

export async function spin() {
  const res = await fetch(`${PRIZE_SERVICE_URL}/internal/prizes/spin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Spin failed');
  }
  return res.json();
}
