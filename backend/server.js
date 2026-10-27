import express from 'express';
import cors from 'cors';

// Keep these import paths consistent with your existing project.
import config from './config.js';
import { securityHeaders, requireCsrfHeader } from './middleware/security.js';

import authRoutes from './routes/auth.js';
import destinationRoutes from './routes/destinations.js';
import queueRoutes from './routes/queue.js';
import adminRoutes from './routes/admin.js';
import guideRoutes from './routes/guide.js';

import { migrate } from './db/migrate.js';
import { ensureAdminFromEnv } from './services/admin.js';

const app = express();

app.disable('x-powered-by');

if (config.trustProxy) {
  app.set('trust proxy', config.trustProxy);
}

// Allow the deployed Vercel frontend to access the Render backend.
const allowedOrigins = [
  'https://tour-flow-ai.vercel.app',
  'https://tour-flow-5cfqj0w00-stutis-projects-0e92c8c2.vercel.app',
];

// CORS must run before security middleware and API routes.
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header, such as server-to-server calls.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
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

// Existing security middleware.
app.use(securityHeaders);
app.use(express.json({ limit: '50kb' }));
app.use('/api', requireCsrfHeader);

// API routes.
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/guide', guideRoutes);

// Health check.
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TourFlow AI backend',
  });
});

// Handle unknown routes.
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
});

// Error handler.
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'An unexpected server error occurred'
        : err.message,
  });
});

// Start only after the database migration and admin setup complete.
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await migrate();
    await ensureAdminFromEnv();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`TourFlow backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start TourFlow backend:', error);
    process.exit(1);
  }
}

startServer();

export default app;