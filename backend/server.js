import { config } from './config/env.js'; // loads backend/.env first
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import guideRoutes from './routes/guideRoutes.js';
import { ensureAdminFromEnv } from './services/authService.js';
import { dbFilePath } from './db/store.js';

const app = express();

app.use(express.json({ limit: '20kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TourFlow AI backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/guide', guideRoutes);

// Unknown API route
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// Error handler (e.g. invalid JSON in a request body)
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Internal server error' : 'Invalid request.' });
});

ensureAdminFromEnv();

const server = app.listen(config.port, () => {
  console.log(`TourFlow backend running on http://localhost:${config.port}`);
  console.log(`Data file: ${dbFilePath()}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\nPort ${config.port} is already in use by another program.\n` +
        `Either stop that program, or start TourFlow on another port:\n` +
        `  1. set PORT=5050 in backend/.env\n` +
        `  2. set BACKEND_PORT=5050 in the project root .env (so the frontend proxy matches)\n`
    );
    process.exit(1);
  }
  throw err;
});
