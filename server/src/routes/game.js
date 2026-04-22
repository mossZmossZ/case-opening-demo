import { Router } from 'express';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Prize from '../models/Prize.js';
import { spinPrize } from '../services/gameService.js';

const router = Router();

// GET /api/game/prizes — public list of active prizes (for reel display)
router.get('/prizes', async (req, res) => {
  try {
    const prizes = await Prize.find({ active: true, remainingStock: { $gt: 0 } })
      .select('name description tier iconKey weight');
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

    const numAttempts = Number(attempts);
    if (!numAttempts || numAttempts < 1 || numAttempts > 10) {
      return res.status(400).json({ error: 'Attempts must be between 1 and 10' });
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

// POST /api/game/spin/:sessionId — spin the reel, return prize
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

    const prize = await spinPrize();

    session.results.push({
      attempt: attemptsUsed + 1,
      prizeId: prize.prizeId,
      prizeName: prize.name,
      tier: prize.tier,
    });

    const attemptsLeft = session.totalAttempts - session.results.length;
    if (attemptsLeft <= 0) session.status = 'completed';
    await session.save();

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

// GET /api/game/session/:sessionId — get session details (for summary)
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

// GET /api/game/stats — public endpoint for live drops and inventory summary
router.get('/stats', async (req, res) => {
  try {
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

    const prizes = await Prize.find({ active: true });

    // Use the same queries as /api/admin/dashboard so numbers always match
    const [participants, sessions] = await Promise.all([
      User.countDocuments(),
      Session.find({}, { results: 1 }).lean(),
    ]);
    const totalOpens = sessions.reduce((sum, s) => sum + (s.results?.length ?? 0), 0);
    
    let totalWeight = 0;
    let legendaryWeight = 0;
    let totalRemainingCases = 0;

    prizes.forEach(p => {
      totalWeight += p.weight;
      if (p.tier === 'legendary') legendaryWeight += p.weight;
      totalRemainingCases += p.remainingStock;
    });

    const legendaryDropRate = totalWeight > 0 ? ((legendaryWeight / totalWeight) * 100).toFixed(2) : 0;

    res.json({
      liveDrops: recentActivity,
      participants,
      totalOpens,
      inventory: {
        remainingCases: totalRemainingCases,
        legendaryDropRate: parseFloat(legendaryDropRate)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
