import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import gameRoutes from './routes/game.js';
import internalRoutes from './routes/internal.js';

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

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
    console.log('game-service: Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`game-service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('game-service: Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
