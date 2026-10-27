import { config } from './config/env.js';
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

// Allow the actual Vercel production domain and the previous preview domain.
const allowedOrigins = [
  'https://tour-flow-ai.vercel.app',
  'https://tour-flow-5cfqj0w00-stutis-projects-0e92c8c2.vercel.app',
];

// CORS must run before security middleware and CSRF checks.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`Blocked CORS origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'X-Requested-With',
      'X-CSRF-Token',
    ],
  })
);

app.use(securityHeaders);
app.use(express.json({ limit: '50kb' }));
app.use('/api', requireCsrfHeader);

// Health check.
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'ok' });
  } catch (err) {
    console.error('Health check database error:', err.message);
    res.status(503).json({
      status: 'error',
      database: 'unreachable',
    });
  }
});

// API routes.
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/guide', guideRoutes);

// API 404 handler.
app.use('/api', (req, res) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Optionally serve the frontend from this backend.
const distDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'dist'
);

if (config.serveFrontend) {
  if (existsSync(resolve(distDir, 'index.html'))) {
    app.use(
      '/assets',
      express.static(resolve(distDir, 'assets'), {
        immutable: true,
        maxAge: '1y',
      })
    );

    app.use(express.static(distDir, {
      index: false,
      maxAge: '1h',
    }));

    app.get('*', (req, res) => {
      res.sendFile(resolve(distDir, 'index.html'));
    });
  } else {
    console.warn(
      'SERVE_FRONTEND is enabled, but dist/index.html was not found. ' +
      'Run npm run build in the project root.'
    );
  }
}

// Error handler.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON in request.',
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request is too large.',
    });
  }

  sendError(res, err);
});

// Start the server only after database migration succeeds.
async function start() {
  try {
    await migrate();
  } catch (err) {
    console.error(
      '\nCould not connect to or prepare the database: ' +
      `${err.message}\n` +
      'Check the DATABASE_URL environment variable in Render.\n'
    );

    process.exit(1);
  }

  try {
    await ensureAdminFromEnv();
  } catch (err) {
    console.error('Admin initialization failed:', err);
    process.exit(1);
  }

  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`TourFlow backend listening on port ${config.port}`);
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);

    server.close(() => {
      pool.end()
        .then(() => process.exit(0))
        .catch((err) => {
          console.error('Database shutdown error:', err);
          process.exit(1);
        });
    });

    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();

export default app;
