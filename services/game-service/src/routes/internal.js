import { Router } from 'express';
import User from '../models/User.js';
import Session from '../models/Session.js';
import AppSettings from '../models/AppSettings.js';
import redis from '../lib/redis.js';

const router = Router();

async function getAppSettings() {
  return AppSettings.findOneAndUpdate(
    { key: 'global' },
    { $setOnInsert: { maximumAttempts: 5 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

// GET /internal/game/dashboard — stats for admin dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [totalUsers, totalSessions, activeSessions] = await Promise.all([
      User.countDocuments(),
      Session.countDocuments(),
      Session.countDocuments({ status: 'active' }),
    ]);

    const totalOpens = await Session.aggregate([
      { $project: { count: { $size: { $ifNull: ['$results', []] } } } },
      { $group: { _id: null, total: { $sum: '$count' } } },
    ]);

    const recentActivity = await Session.aggregate([
      { $unwind: '$results' },
      { $sort: { 'results.timestamp': -1 } },
      { $limit: 10 },
      {
        $project: {
          user: '$playerName',
          name: '$results.prizeName',
          tier: '$results.tier',
          time: '$results.timestamp',
        },
      },
    ]);

    res.json({
      participants: totalUsers,
      totalOpens: totalOpens[0]?.total || 0,
      activeSessions,
      recentActivity,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /internal/game/history — paginated drop history
router.get('/history', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const pipeline = [
      { $unwind: '$results' },
      { $sort: { 'results.timestamp': -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                user: '$playerName',
                name: '$results.prizeName',
                tier: '$results.tier',
                time: '$results.timestamp',
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await Session.aggregate(pipeline);
    res.json({
      results: result.data,
      total: result.total[0]?.count || 0,
      page,
      limit,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /internal/game/reset-sessions — wipe all players & sessions
router.post('/reset-sessions', async (req, res) => {
  try {
    const [s, u] = await Promise.all([
      Session.deleteMany({}),
      User.deleteMany({}),
    ]);

    // Clear Redis caches
    try {
      await redis.del('feed:recent');
      await redis.del('stats:summary');
    } catch {}

    res.json({ sessionsDeleted: s.deletedCount, usersDeleted: u.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /internal/game/settings — get global app settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await getAppSettings();
    res.json({ maximumAttempts: settings.maximumAttempts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /internal/game/settings — update global app settings
router.put('/settings', async (req, res) => {
  try {
    const maximumAttempts = Number(req.body.maximumAttempts);
    if (!Number.isInteger(maximumAttempts) || maximumAttempts < 1 || maximumAttempts > 5) {
      return res.status(400).json({ error: 'Maximum attempts must be between 1 and 5' });
    }

    const settings = await AppSettings.findOneAndUpdate(
      { key: 'global' },
      { maximumAttempts, updatedAt: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ maximumAttempts: settings.maximumAttempts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
