import { readFileSync, readdirSync } from 'fs';
import { withTransaction } from './pool.js';

/**
 * Database migrations + dataset seeding.
 * - Every *.sql file in db/migrations runs once, in name order, inside a transaction.
 * - The tourism dataset is (re)loaded into the destinations table. Admin edits
 *   (content, images, queue settings) are never overwritten.
 * Safe to run many times, and safe if two servers start at the same moment
 * (an advisory lock makes the second one wait).
 */
const MIGRATIONS_DIR = new URL('./migrations/', import.meta.url);
const DATASET_FILE = new URL('../data/india_tourism_dataset.json', import.meta.url);
const LOCK_ID = 74210031; // any constant number, shared by all TourFlow servers

export async function migrate({ log = console.log } = {}) {
  await withTransaction(async (client) => {
    await client.query('SELECT pg_advisory_xact_lock($1)', [LOCK_ID]);
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);

    const applied = new Set((await client.query('SELECT version FROM schema_migrations')).rows.map((r) => r.version));
    const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      if (applied.has(file)) continue;
      await client.query(readFileSync(new URL(file, MIGRATIONS_DIR), 'utf-8'));
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
      log(`Applied migration ${file}`);
    }

    // Load / refresh the static tourism dataset
    const dataset = JSON.parse(readFileSync(DATASET_FILE, 'utf-8'));
    const result = await client.query(
      `INSERT INTO destinations (id, dataset)
       SELECT record->>'id', record FROM jsonb_array_elements($1::jsonb) AS record
       ON CONFLICT (id) DO UPDATE SET dataset = EXCLUDED.dataset, updated_at = now()
       WHERE destinations.dataset IS DISTINCT FROM EXCLUDED.dataset`,
      [JSON.stringify(dataset)]
    );
    if (result.rowCount) log(`Loaded ${result.rowCount} destination record(s) from the tourism dataset`);
  });
}

