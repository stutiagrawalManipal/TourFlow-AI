/**
 * Create / update the database tables and load the tourism dataset.
 *   npm run db:migrate
 * (The server also does this automatically when it starts.)
 */
import '../config/env.js';
import { migrate } from '../db/migrate.js';
import { pool } from '../db/pool.js';

try {
  await migrate();
  console.log('Database is up to date.');
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
