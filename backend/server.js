import { config } from './config/env.js'; // loads backend/.env first
import express from 'express';
import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import guideRoutes from './routes/guideRoutes.js';
import { ensureAdminFromEnv } from './services/authService.js';
import { migrate } from './db/migrate.js';
import { pool } from './db/pool.js';
import { securityHeaders, requireCsrfHeader } from './middleware/security.js';
import { sendError } from './utils/asyncHandler.js';

const app = express();

app.disable('x-powered-by');

if (config.trustProxy) {
  app.set('trust proxy', config.trustProxy);
}

// Allow the deployed Vercel frontend to access the Render API.
const allowedOrigins = [
  'https://tour-flow-5cfqj0w00-stutis-projects-0e92c8c2.vercel.app',
  // Add your stable Vercel production domain here if different.
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header, such as server-to-server calls.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Requested-With'],
  })
);

app.use(securityHeaders);
app.use(express.json({ limit: '50kb' }));
app.use('/api', requireCsrfHeader);

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'ok' });
  } catch {
    res.status(503).json({ status: 'error', database: 'unreachable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/guide', guideRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

const distDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (config.serveFrontend) {
  if (existsSync(resolve(distDir, 'index.html'))) {
    app.use('/assets', express.static(resolve(distDir, 'assets'), { immutable: true, maxAge: '1y' }));
    app.use(express.static(distDir, { index: false, maxAge: '1h' }));
    app.get('*', (req, res) => res.sendFile(resolve(distDir, 'index.html')));
  } else {
    console.warn('SERVE_FRONTEND is on but dist/index.html was not found. Run "npm run build" in the project root.');
  }
}

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request is too large.' });
  }
  sendError(res, err);
});

async function start() {
  try {
    await migrate();
  } catch (err) {
    console.error(
      `\nCould not connect to or prepare the database: ${err.message}\n` +
        'Check that PostgreSQL is running and DATABASE_URL in backend/.env is correct (see README.md).\n'
    );
    process.exit(1);
  }
  await ensureAdminFromEnv();

  const server = app.listen(config.port, () => {
    console.log(`TourFlow backend running on http://localhost:${config.port}`);
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

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    server.close(() => pool.end().then(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
