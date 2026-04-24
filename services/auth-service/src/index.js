import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AdminUser from './models/AdminUser.js';

const app = express();
const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ status: 'ok', service: 'auth-service', db: dbState });
});

// POST /api/auth/login — admin login, issue JWT
app.post('/api/auth/login', async (req, res) => {
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
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, username: admin.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /internal/auth/verify — verify JWT, return admin identity (internal only)
app.post('/internal/auth/verify', (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ id: payload.id, username: payload.username });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Connect to MongoDB and start
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zenith_auth';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('auth-service: Connected to MongoDB');

    // Auto-seed admin user if none exists
    const adminCount = await AdminUser.countDocuments();
    if (adminCount === 0) {
      const hash = await bcrypt.hash('zenith', 10);
      await AdminUser.create({ username: 'admin', passwordHash: hash });
      console.log('auth-service: Seeded default admin user (admin / zenith)');
    }

    app.listen(PORT, () => {
      console.log(`auth-service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('auth-service: Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
