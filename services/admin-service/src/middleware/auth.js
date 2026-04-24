import * as authClient from '../lib/authClient.js';

export async function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const token = header.slice(7);
    const { id, username } = await authClient.verify(token);
    req.adminId = id;
    req.adminUsername = username;
    next();
  } catch (err) {
    if (err.status === 401) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    res.status(502).json({ error: 'Authentication service unavailable' });
  }
}
