import pg from 'pg';
import { config } from '../config/env.js';

/**
 * PostgreSQL connection pool.
 * query()           - run one SQL statement
 * withTransaction() - run several statements atomically (BEGIN ... COMMIT,
 *                     automatic ROLLBACK if anything throws)
 */
if (!config.databaseUrl) {
  console.error(
    '\nDATABASE_URL is not set.\n' +
      'Add it to backend/.env, for example:\n' +
      '  DATABASE_URL=postgres://tourflow:tourflow@localhost:5432/tourflow\n' +
      'See README.md -> "Database setup".\n'
  );
  process.exit(1);
}

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 10,
  ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  // an idle client lost its connection; the pool will create a new one
  console.error('PostgreSQL pool error:', err.message);
});

export function query(text, params) {
  return pool.query(text, params);
}

export async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

// pg returns timestamptz as Date objects - the API sends ISO strings
export const iso = (value) => (value ? new Date(value).toISOString() : null);
