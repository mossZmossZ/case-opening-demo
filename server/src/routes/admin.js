import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser.js';
import Prize from '../models/Prize.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const admin = await AdminUser.findOne({ username });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, username: admin.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All routes below require admin JWT
router.use(requireAdmin);

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [totalUsers, totalSessions, activeSessions, prizes] = await Promise.all([
      User.countDocuments(),
      Session.countDocuments(),
      Session.countDocuments({ status: 'active' }),
      Prize.find({ active: true }),
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

    const stockSummary = prizes.map(p => ({
      name: p.name,
      tier: p.tier,
      total: p.totalStock,
      remaining: p.remainingStock,
    }));

    res.json({
      participants: totalUsers,
      totalOpens: totalOpens[0]?.total || 0,
      activeSessions,
      stockSummary,
      recentActivity,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/prizes
router.get('/prizes', async (req, res) => {
  try {
    const prizes = await Prize.find().sort({ tier: 1, name: 1 });
    res.json(prizes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/prizes
router.post('/prizes', async (req, res) => {
  try {
    const { name, description, tier, weight, totalStock, iconKey } = req.body;
    if (!name || !tier || weight == null || totalStock == null) {
      return res.status(400).json({ error: 'name, tier, weight, and totalStock are required' });
    }

    const prize = await Prize.create({
      name,
      description: description || '',
      tier,
      weight: Number(weight),
      totalStock: Number(totalStock),
      remainingStock: Number(totalStock),
      iconKey: iconKey || 'consolation',
    });
    res.status(201).json(prize);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/prizes/:id
router.put('/prizes/:id', async (req, res) => {
  try {
    const { name, description, tier, weight, totalStock, remainingStock, iconKey, active } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (tier !== undefined) updates.tier = tier;
    if (weight !== undefined) updates.weight = Number(weight);
    if (totalStock !== undefined) updates.totalStock = Number(totalStock);
    if (remainingStock !== undefined) updates.remainingStock = Number(remainingStock);
    if (iconKey !== undefined) updates.iconKey = iconKey;
    if (active !== undefined) updates.active = active;

    const prize = await Prize.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!prize) return res.status(404).json({ error: 'Prize not found' });
    res.json(prize);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/prizes/:id
router.delete('/prizes/:id', async (req, res) => {
  try {
    const prize = await Prize.findByIdAndDelete(req.params.id);
    if (!prize) return res.status(404).json({ error: 'Prize not found' });
    res.json({ message: 'Prize deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/rates — get all prize weights grouped by tier
router.get('/rates', async (req, res) => {
  try {
    const prizes = await Prize.find({ active: true }).sort({ tier: 1 });
    res.json(prizes.map(p => ({
      id: p._id,
      name: p.name,
      tier: p.tier,
      weight: p.weight,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/rates — update individual prize weights
router.put('/rates', async (req, res) => {
  try {
    const { rates } = req.body;
    // rates = [{ id, weight }, ...]
    if (!Array.isArray(rates)) {
      return res.status(400).json({ error: 'rates must be an array of { id, weight }' });
    }

    const ops = rates.map(r =>
      Prize.findByIdAndUpdate(r.id, { weight: Number(r.weight) })
    );
    await Promise.all(ops);

    const updated = await Prize.find({ active: true }).sort({ tier: 1 });
    res.json(updated.map(p => ({
      id: p._id,
      name: p.name,
      tier: p.tier,
      weight: p.weight,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/history
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

export default router;
