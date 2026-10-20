import { existsSync, readFileSync, writeFileSync, renameSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';

/**
 * Simple persistent store (one JSON file).
 *
 * - The whole database is kept in memory and saved to disk after every change.
 * - Saving writes a temporary file first and then renames it, so a crash in the
 *   middle of a save cannot leave a half-written database.
 * - Node runs our request handlers on a single thread, and every change below is
 *   synchronous (read -> change -> save with no "await" in between), so two
 *   requests can never interleave and create duplicate queue numbers.
 *
 * This can be swapped for SQLite later by re-implementing these few functions.
 */
const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DB_FILE = resolve(backendRoot, config.dataFile);

const EMPTY_DB = {
  users: [],
  sessions: [],
  bookings: [],
  queueCounters: {},        // destinationId -> last ticket number issued
  destinationSettings: {},  // destinationId -> { queueOpen, entryRatePerMinute, notice }
};

function load() {
  if (!existsSync(DB_FILE)) return structuredClone(EMPTY_DB);
  const data = JSON.parse(readFileSync(DB_FILE, 'utf-8'));
  return { ...structuredClone(EMPTY_DB), ...data };
}

const db = load();

function save() {
  mkdirSync(dirname(DB_FILE), { recursive: true });
  const tempFile = `${DB_FILE}.tmp`;
  writeFileSync(tempFile, JSON.stringify(db, null, 2));
  renameSync(tempFile, DB_FILE);
}

// Read-only access
export function getDb() {
  return db;
}

// Run a change and save it. `change` must be synchronous.
export function transaction(change) {
  const result = change(db);
  save();
  return result;
}

export function dbFilePath() {
  return DB_FILE;
}
