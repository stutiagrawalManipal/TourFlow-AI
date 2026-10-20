import { existsSync, readFileSync } from 'fs';

/**
 * Loads backend/.env (if it exists) into process.env.
 * Values already set in the real environment are not overwritten.
 * Kept tiny on purpose so no extra package (dotenv) is needed.
 */
const envFile = new URL('../.env', import.meta.url);

if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf-8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || line.trim().startsWith('#')) continue;
    const [, key, rawValue] = match;
    const value = rawValue.replace(/^["']|["']$/g, '');
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

export const config = {
  port: Number(process.env.PORT) || 5000,
  dataFile: process.env.DATA_FILE || 'data/tourflow-db.json',
  sessionDays: Number(process.env.SESSION_DAYS) || 7,
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  adminName: process.env.ADMIN_NAME || 'TourFlow Admin',
};
