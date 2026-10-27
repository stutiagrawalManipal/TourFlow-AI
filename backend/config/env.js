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

const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  isProduction,
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL || '',
  databaseSsl: process.env.DATABASE_SSL === 'true',
  sessionDays: Number(process.env.SESSION_DAYS) || 7,
  // Secure cookies need HTTPS. On by default in production, off for http://localhost
  cookieSecure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProduction,
  // Set to the number of proxies in front of the app (e.g. 1 behind Nginx/Render) so req.ip is correct
  trustProxy: Number(process.env.TRUST_PROXY) || 0,
  // In production the backend can also serve the built website (npm run build -> dist/)
  serveFrontend: process.env.SERVE_FRONTEND ? process.env.SERVE_FRONTEND === 'true' : isProduction,
  // Max login/register attempts per IP per 15 minutes, and bookings per user per minute
  authRateLimit: Number(process.env.RATE_LIMIT_AUTH) || 30,
  bookingRateLimit: Number(process.env.RATE_LIMIT_BOOKINGS) || 10,
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  adminName: process.env.ADMIN_NAME || 'TourFlow Admin',
  // Sent to Wikimedia in the User-Agent by scripts/fetchImages.js (their API policy asks for contact info)
  wikimediaContact: process.env.WIKIMEDIA_CONTACT || process.env.ADMIN_EMAIL || '',
};
