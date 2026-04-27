import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import internalRoutes from './routes/internal.js';
import { logger, requestLogger } from './lib/logger.js';

const app = express();
const PORT = process.env.PORT || 4004;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ status: 'ok', service: 'prize-service', db: dbState });
});

// Internal routes only — prize-service is not publicly exposed
app.use('/internal/prizes', internalRoutes);

// Connect to MongoDB and start
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zenith_prize';

mongoose.connect(MONGO_URI)
  .then(() => {
    logger.info('startup', { msg: 'Connected to MongoDB', port: PORT });
    app.listen(PORT, () => logger.info('startup', { msg: `prize-service ready`, port: PORT }));
  })
  .catch(err => {
    logger.error('startup', { msg: 'Failed to connect to MongoDB', error: err.message });
    process.exit(1);
  });
