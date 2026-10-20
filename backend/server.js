import express from 'express';
import destinationRoutes from './routes/destinationRoutes.js';
import queueRoutes from './routes/queueRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TourFlow AI backend' });
});

app.use('/api/destinations', destinationRoutes);
app.use('/api/queue', queueRoutes);

// Unknown API route
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// Error handler (e.g. invalid JSON in request body)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
});

app.listen(PORT, () => {
  console.log(`TourFlow backend running on http://localhost:${PORT}`);
});
