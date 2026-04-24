import { Router } from 'express';
import Prize from '../models/Prize.js';
import redis from '../lib/redis.js';
import { spinPrize } from '../services/spin.js';

const router = Router();

// ── Named routes FIRST (before /:id to avoid shadowing) ─────────────────────

// GET /internal/prizes — list all prizes (sorted by tier, name)
router.get('/', async (req, res) => {
  try {
    const prizes = await Prize.find().sort({ tier: 1, name: 1 });
    res.json(prizes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /internal/prizes/active — active in-stock prizes (cached)
router.get('/active', async (req, res) => {
  try {
    const cached = await redis.get('prizes:active');
    if (cached) return res.json(JSON.parse(cached));

    const prizes = await Prize.find({ active: true, remainingStock: { $gt: 0 } })
      .select('name description tier iconKey imageUrl weight remainingStock');
    await redis.set('prizes:active', JSON.stringify(prizes), 'EX', 300);
    res.json(prizes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /internal/prizes/rates — get all active prize weights
router.get('/rates', async (req, res) => {
  try {
    const cached = await redis.get('rates:current');
    if (cached) return res.json(JSON.parse(cached));

    const prizes = await Prize.find({ active: true }).sort({ tier: 1 });
    const rates = prizes.map(p => ({
      id: p._id,
      name: p.name,
      tier: p.tier,
      weight: p.weight,
    }));

    await redis.set('rates:current', JSON.stringify(rates));
    res.json(rates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /internal/prizes — create prize
router.post('/', async (req, res) => {
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

    await redis.del('prizes:active');
    await redis.del('rates:current');
    res.status(201).json(prize);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /internal/prizes/spin — weighted random + atomic stock decrement
router.post('/spin', async (req, res) => {
  try {
    const prize = await spinPrize();
    res.json(prize);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /internal/prizes/rates — bulk update weights
router.put('/rates', async (req, res) => {
  try {
    const { rates } = req.body;
    if (!Array.isArray(rates)) {
      return res.status(400).json({ error: 'rates must be an array of { id, weight }' });
    }

    await Promise.all(
      rates.map(r => Prize.findByIdAndUpdate(r.id, { weight: Number(r.weight) }))
    );

    await redis.del('rates:current');
    await redis.del('prizes:active');

    const updated = await Prize.find({ active: true }).sort({ tier: 1 });
    const result = updated.map(p => ({
      id: p._id,
      name: p.name,
      tier: p.tier,
      weight: p.weight,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /internal/prizes/reset-stock — restore all stock to total
router.post('/reset-stock', async (req, res) => {
  try {
    const prizes = await Prize.find({});
    await Promise.all(
      prizes.map(p => Prize.findByIdAndUpdate(p._id, { remainingStock: p.totalStock }))
    );

    await redis.del('prizes:active');
    res.json({ updated: prizes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /internal/prizes/generate-dummy — seed demo prizes
router.post('/generate-dummy', async (req, res) => {
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

    await redis.del('prizes:active');
    await redis.del('rates:current');
    res.json({ created: created.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Parameterized routes LAST ───────────────────────────────────────────────

// PUT /internal/prizes/:id — update prize
router.put('/:id', async (req, res) => {
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

    await redis.del('prizes:active');
    await redis.del('rates:current');
    res.json(prize);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /internal/prizes/:id — delete prize
router.delete('/:id', async (req, res) => {
  try {
    const prize = await Prize.findByIdAndDelete(req.params.id);
    if (!prize) return res.status(404).json({ error: 'Prize not found' });

    await redis.del('prizes:active');
    await redis.del('rates:current');
    res.json({ message: 'Prize deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
