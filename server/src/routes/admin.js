import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import AdminUser from '../models/AdminUser.js';
import Prize from '../models/Prize.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import AppSettings from '../models/AppSettings.js';
import { requireAdmin } from '../middleware/auth.js';
import { uploadToS3 } from '../services/s3.js';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.has(file.mimetype)) cb(null, true);
    else cb(Object.assign(new Error('Only image files are allowed'), { status: 400 }));
  },
});

const router = Router();

async function getAppSettings() {
  return AppSettings.findOneAndUpdate(
    { key: 'global' },
    { $setOnInsert: { maximumAttempts: 5 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

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

// POST /api/admin/upload — upload prize image to S3, return URL
router.post('/upload', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Image must be under 10 MB' });
    if (err) return res.status(err.status || 400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
    const { name, description, tier, weight, totalStock, iconKey, imageUrl } = req.body;
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
      imageUrl: imageUrl || '',
    });
    res.status(201).json(prize);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/prizes/:id
router.put('/prizes/:id', async (req, res) => {
  try {
    const { name, description, tier, weight, totalStock, remainingStock, iconKey, imageUrl, active } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (tier !== undefined) updates.tier = tier;
    if (weight !== undefined) updates.weight = Number(weight);
    if (totalStock !== undefined) updates.totalStock = Number(totalStock);
    if (remainingStock !== undefined) updates.remainingStock = Number(remainingStock);
    if (iconKey !== undefined) updates.iconKey = iconKey;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
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

// GET /api/admin/settings — get global app settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await getAppSettings();
    res.json({ maximumAttempts: settings.maximumAttempts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/settings — update global app settings
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

// ── Operations ─────────────────────────────────────────────────────────────

// POST /api/admin/operations/reset-sessions — wipe all players & sessions
router.post('/operations/reset-sessions', async (req, res) => {
  try {
    const [s, u] = await Promise.all([
      Session.deleteMany({}),
      User.deleteMany({}),
    ]);
    res.json({ sessionsDeleted: s.deletedCount, usersDeleted: u.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/operations/reset-stock — restore remainingStock = totalStock for all prizes
router.post('/operations/reset-stock', async (req, res) => {
  try {
    const prizes = await Prize.find({});
    await Promise.all(
      prizes.map(p => Prize.findByIdAndUpdate(p._id, { remainingStock: p.totalStock }))
    );
    res.json({ updated: prizes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/operations/generate-dummy — seed demo prizes across all tiers
router.post('/operations/generate-dummy', async (req, res) => {
  try {
    const dummies = [
      { name: 'Nutanix Sticker Pack',  description: 'Limited edition event stickers', tier: 'common',    weight: 50, totalStock: 100, iconKey: 'sticker'     },
      { name: 'Nutanix T-Shirt',       description: 'Cloud Native edition tee',       tier: 'common',    weight: 40, totalStock: 80,  iconKey: 'tshirt'      },
      { name: 'Nutanix Power Bank',    description: '10,000 mAh fast charge',          tier: 'rare',      weight: 20, totalStock: 30,  iconKey: 'powerbank'   },
      { name: 'Nutanix Hoodie',        description: 'Exclusive event hoodie',          tier: 'rare',      weight: 15, totalStock: 20,  iconKey: 'hoodie'      },
      { name: 'Nutanix Backpack',      description: 'Premium laptop backpack',         tier: 'epic',      weight: 8,  totalStock: 10,  iconKey: 'backpack'    },
      { name: 'Nutanix Swag Box',      description: 'Curated premium swag bundle',     tier: 'epic',      weight: 5,  totalStock: 5,   iconKey: 'swagbox'     },
      { name: 'VIP Cloud Pass',        description: 'Exclusive VIP event access',      tier: 'legendary', weight: 2,  totalStock: 2,   iconKey: 'vip'         },
    ];
    const created = await Prize.insertMany(
      dummies.map(d => ({ ...d, remainingStock: d.totalStock }))
    );
    res.json({ created: created.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
