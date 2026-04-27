import express from 'express';
import cors from 'cors';
import adminRoutes from './routes/admin.js';
import { requestLogger } from './lib/logger.js';

const app = express();
const PORT = process.env.PORT || 4003;

app.use(cors());
app.use(requestLogger);
// Skip JSON body parsing for multipart uploads — multer handles those directly.
app.use((req, res, next) => {
  if ((req.headers['content-type'] || '').startsWith('multipart/')) return next();
  express.json({ limit: '1mb' })(req, res, next);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'admin-service' });
});

// Admin routes
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`admin-service running on port ${PORT}`);
});
