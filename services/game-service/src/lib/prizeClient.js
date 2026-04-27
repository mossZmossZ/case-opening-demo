const PRIZE_SERVICE_URL = process.env.PRIZE_SERVICE_URL || 'http://localhost:4004';

// Istio requires the app to forward these headers to maintain the distributed trace.
// Without forwarding, Envoy creates orphaned spans that don't link back to the root trace.
const B3_HEADERS = [
  'x-b3-traceid', 'x-b3-spanid', 'x-b3-parentspanid',
  'x-b3-sampled', 'x-b3-flags', 'x-request-id', 'b3',
];

function pickTraceHeaders(incoming = {}) {
  const out = {};
  for (const h of B3_HEADERS) {
    if (incoming[h]) out[h] = incoming[h];
  }
  return out;
}

export async function getActivePrizes(traceHeaders = {}) {
  const res = await fetch(`${PRIZE_SERVICE_URL}/internal/prizes/active`, {
    headers: pickTraceHeaders(traceHeaders),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch active prizes');
  }
  return res.json();
}

export async function spin(traceHeaders = {}) {
  const res = await fetch(`${PRIZE_SERVICE_URL}/internal/prizes/spin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...pickTraceHeaders(traceHeaders) },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Spin failed');
  }
  return res.json();
}
