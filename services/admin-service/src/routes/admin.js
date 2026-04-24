import { Router } from 'express';
import multer from 'multer';
import * as authClient from '../lib/authClient.js';
import * as prizeClient from '../lib/prizeClient.js';
import * as gameClient from '../lib/gameClient.js';
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

// Helper to forward downstream errors
function handleServiceError(err, res) {
  if (err.status && err.data) return res.status(err.status).json(err.data);
  res.status(502).json({ error: 'Service unavailable' });
}

// POST /api/admin/login — proxy to auth-service
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const result = await authClient.login(username, password);
    res.json(result);
  } catch (err) {
    handleServiceError(err, res);
  }
});

// All routes below require admin JWT
router.use(requireAdmin);

// POST /api/admin/upload — S3 image upload (handled directly)
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

// GET /api/admin/dashboard — aggregate from game-service + prize-service
router.get('/dashboard', async (req, res) => {
  try {
    const [gameData, allPrizes] = await Promise.all([
      gameClient.getDashboard(),
      prizeClient.getAllPrizes(),
    ]);

    const activePrizes = allPrizes.filter(p => p.active);
    const stockSummary = activePrizes.map(p => ({
      name: p.name,
      tier: p.tier,
      total: p.totalStock,
      remaining: p.remainingStock,
    }));

    res.json({
      participants: gameData.participants,
      totalOpens: gameData.totalOpens,
      activeSessions: gameData.activeSessions,
      stockSummary,
      recentActivity: gameData.recentActivity,
    });
  } catch (err) {
    handleServiceError(err, res);
  }
});

// GET /api/admin/prizes — proxy to prize-service
router.get('/prizes', async (req, res) => {
  try {
    const prizes = await prizeClient.getAllPrizes();
    res.json(prizes);
  } catch (err) {
    handleServiceError(err, res);
  }
});

// POST /api/admin/prizes — proxy to prize-service
router.post('/prizes', async (req, res) => {
  try {
    const prize = await prizeClient.createPrize(req.body);
    res.status(201).json(prize);
  } catch (err) {
    handleServiceError(err, res);
  }
});

// PUT /api/admin/prizes/:id — proxy to prize-service
router.put('/prizes/:id', async (req, res) => {
  try {
    const prize = await prizeClient.updatePrize(req.params.id, req.body);
    res.json(prize);
  } catch (err) {
    handleServiceError(err, res);
  }
});

// DELETE /api/admin/prizes/:id — proxy to prize-service
router.delete('/prizes/:id', async (req, res) => {
  try {
    const result = await prizeClient.deletePrize(req.params.id);
    res.json(result);
  } catch (err) {
    handleServiceError(err, res);
  }
});

// GET /api/admin/rates — proxy to prize-service
router.get('/rates', async (req, res) => {
  try {
    const rates = await prizeClient.getRates();
    res.json(rates);
  } catch (err) {
    handleServiceError(err, res);
  }
});

// PUT /api/admin/rates — proxy to prize-service
router.put('/rates', async (req, res) => {
  try {
    const rates = await prizeClient.updateRates(req.body);
    res.json(rates);
  } catch (err) {
    handleServiceError(err, res);
  }
});

// GET /api/admin/settings — proxy to game-service
router.get('/settings', async (req, res) => {
  try {
    const settings = await gameClient.getSettings();
    res.json(settings);
  } catch (err) {
    handleServiceError(err, res);
  }
});

// PUT /api/admin/settings — proxy to game-service
router.put('/settings', async (req, res) => {
  try {
    const settings = await gameClient.updateSettings(req.body);
    res.json(settings);
  } catch (err) {
    handleServiceError(err, res);
  }
});

// GET /api/admin/history — proxy to game-service
router.get('/history', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const history = await gameClient.getHistory(page, limit);
    res.json(history);
  } catch (err) {
    handleServiceError(err, res);
  }
});

// ── Operations ─────────────────────────────────────────────────────────────

// POST /api/admin/operations/reset-sessions — proxy to game-service
router.post('/operations/reset-sessions', async (req, res) => {
  try {
    const result = await gameClient.resetSessions();
    res.json(result);
  } catch (err) {
    handleServiceError(err, res);
  }
});

// POST /api/admin/operations/reset-stock — proxy to prize-service
router.post('/operations/reset-stock', async (req, res) => {
  try {
    const result = await prizeClient.resetStock();
    res.json(result);
  } catch (err) {
    handleServiceError(err, res);
  }
});

// POST /api/admin/operations/generate-dummy — proxy to prize-service
router.post('/operations/generate-dummy', async (req, res) => {
  try {
    const result = await prizeClient.generateDummy();
    res.json(result);
  } catch (err) {
    handleServiceError(err, res);
  }
});

export default router;
