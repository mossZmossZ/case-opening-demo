import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import gameRoutes from './routes/game.js';
import internalRoutes from './routes/internal.js';
import { logger, requestLogger } from './lib/logger.js';

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ status: 'ok', service: 'game-service', db: dbState });
});

// Public routes
app.use('/api/game', gameRoutes);

// Internal routes (called by admin-service)
app.use('/internal/game', internalRoutes);

// Connect to MongoDB and start
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zenith_game';

mongoose.connect(MONGO_URI)
  .then(() => {
    logger.info('startup', { msg: 'Connected to MongoDB' });
    app.listen(PORT, () => logger.info('startup', { msg: 'game-service ready', port: PORT }));
  })
  .catch(err => {
    logger.error('startup', { msg: 'Failed to connect to MongoDB', error: err.message });
    process.exit(1);
  });
