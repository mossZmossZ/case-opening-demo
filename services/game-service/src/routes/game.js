import { Router } from 'express';
import User from '../models/User.js';
import Session from '../models/Session.js';
import AppSettings from '../models/AppSettings.js';
import redis from '../lib/redis.js';
import * as prizeClient from '../lib/prizeClient.js';

const router = Router();

async function getAppSettings() {
  return AppSettings.findOneAndUpdate(
    { key: 'global' },
    { $setOnInsert: { maximumAttempts: 5 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

// GET /api/game/prizes — active prizes for reel display (proxied from prize-service)
router.get('/prizes', async (req, res) => {
  try {
    const prizes = await prizeClient.getActivePrizes();
    res.json(prizes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/game/register — create user + session
router.post('/register', async (req, res) => {
  try {
    const { name, attempts } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });

    const settings = await getAppSettings();
    const maximumAttempts = settings.maximumAttempts;
    const numAttempts = Number(attempts);
    if (!Number.isInteger(numAttempts) || numAttempts < 1 || numAttempts > maximumAttempts) {
      return res.status(400).json({ error: `Attempts must be between 1 and ${maximumAttempts}` });
    }

    const user = await User.create({ name: name.trim() });
    const session = await Session.create({
      userId: user._id,
      playerName: user.name,
      totalAttempts: numAttempts,
    });

    res.json({
      sessionId: session._id,
      playerName: session.playerName,
      totalAttempts: session.totalAttempts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/game/spin/:sessionId — execute spin via prize-service
router.post('/spin/:sessionId', async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status === 'completed') return res.status(400).json({ error: 'Session already completed' });

    const attemptsUsed = session.results.length;
    if (attemptsUsed >= session.totalAttempts) {
      session.status = 'completed';
      await session.save();
      return res.status(400).json({ error: 'No attempts remaining' });
    }

    // Call prize-service for weighted random spin
    const prize = await prizeClient.spin();

    session.results.push({
      attempt: attemptsUsed + 1,
      prizeId: prize.prizeId,
      prizeName: prize.name,
      tier: prize.tier,
      iconKey: prize.iconKey,
      imageUrl: prize.imageUrl,
      description: prize.description,
    });

    const attemptsLeft = session.totalAttempts - session.results.length;
    if (attemptsLeft <= 0) session.status = 'completed';
    await session.save();

    // Push to Redis live feed
    try {
      await redis.lpush('feed:recent', JSON.stringify({
        user: session.playerName,
        name: prize.name,
        tier: prize.tier,
        time: new Date().toISOString(),
      }));
      await redis.ltrim('feed:recent', 0, 49);
    } catch { /* Redis failure is non-fatal */ }

    // Invalidate stats cache
    try { await redis.del('stats:summary'); } catch {}

    res.json({
      prize,
      attemptsLeft,
      attempt: attemptsUsed + 1,
      totalAttempts: session.totalAttempts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/game/session/:sessionId — get session details
router.get('/session/:sessionId', async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    res.json({
      sessionId: session._id,
      playerName: session.playerName,
      totalAttempts: session.totalAttempts,
      attemptsLeft: session.totalAttempts - session.results.length,
      results: session.results,
      status: session.status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/game/stats — public stats + live drops + inventory
router.get('/stats', async (req, res) => {
  try {
    // Try stats cache first
    const cached = await redis.get('stats:summary').catch(() => null);
    if (cached) return res.json(JSON.parse(cached));

    // Live drops: try Redis feed, fall back to DB
    let liveDrops;
    try {
      const feedData = await redis.lrange('feed:recent', 0, 9);
      if (feedData.length > 0) {
        liveDrops = feedData.map(d => JSON.parse(d));
      }
    } catch {}

    if (!liveDrops) {
      liveDrops = await Session.aggregate([
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
    }

    const [settings, participants, sessions] = await Promise.all([
      getAppSettings(),
      User.countDocuments(),
      Session.find({}, { results: 1 }).lean(),
    ]);
    const totalOpens = sessions.reduce((sum, s) => sum + (s.results?.length ?? 0), 0);

    // Get inventory data from prize-service
    let inventory = { remainingCases: 0, legendaryDropRate: 0 };
    try {
      const prizes = await prizeClient.getActivePrizes();
      let totalWeight = 0, legendaryWeight = 0, totalRemainingCases = 0;
      prizes.forEach(p => {
        totalWeight += p.weight;
        if (p.tier === 'legendary') legendaryWeight += p.weight;
        totalRemainingCases += p.remainingStock;
      });
      inventory = {
        remainingCases: totalRemainingCases,
        legendaryDropRate: totalWeight > 0 ? parseFloat(((legendaryWeight / totalWeight) * 100).toFixed(2)) : 0,
      };
    } catch { /* prize-service unavailable — return zeros */ }

    const result = {
      liveDrops,
      participants,
      totalOpens,
      inventory,
      settings: { maximumAttempts: settings.maximumAttempts },
    };

    // Cache for 10 seconds
    try { await redis.set('stats:summary', JSON.stringify(result), 'EX', 10); } catch {}

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/game/leaderboard — all drops sorted by tier
router.get('/leaderboard', async (req, res) => {
  try {
    const drops = await Session.aggregate([
      { $unwind: '$results' },
      {
        $addFields: {
          tierOrder: {
            $switch: {
              branches: [
                { case: { $eq: ['$results.tier', 'legendary'] }, then: 1 },
                { case: { $eq: ['$results.tier', 'epic'] },      then: 2 },
                { case: { $eq: ['$results.tier', 'rare'] },      then: 3 },
              ],
              default: 4,
            },
          },
        },
      },
      { $sort: { tierOrder: 1, 'results.timestamp': -1 } },
      {
        $project: {
          _id: 0,
          user: '$playerName',
          prizeName: '$results.prizeName',
          tier: '$results.tier',
          time: '$results.timestamp',
        },
      },
    ]);
    res.json(drops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
