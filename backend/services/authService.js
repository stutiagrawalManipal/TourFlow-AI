import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'crypto';
import { getDb, transaction } from '../db/store.js';
import { config } from '../config/env.js';
import { ROLES, normalizeEmail, toPublicUser } from '../models/User.js';

/**
 * Auth service
 * - Passwords are hashed with scrypt (built into Node) and a random salt.
 * - A login creates a random session token. Only a SHA-256 hash of the token
 *   is stored, so a leaked database file does not leak usable tokens.
 */

export class AuthError extends Error {
  constructor(message, status = 401, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [, salt, hash] = stored.split(':');
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

// ---- simple protection against password guessing (per email, in memory) ----
const failedLogins = new Map();
const MAX_FAILURES = 5;
const LOCK_MINUTES = 5;

function checkLock(email) {
  const entry = failedLogins.get(email);
  if (entry && entry.lockedUntil > Date.now()) {
    const minutes = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
    throw new AuthError(`Too many failed attempts. Try again in ${minutes} minute(s).`, 429);
  }
}

function recordFailure(email) {
  const entry = failedLogins.get(email) || { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= MAX_FAILURES) {
    entry.count = 0;
    entry.lockedUntil = Date.now() + LOCK_MINUTES * 60000;
  }
  failedLogins.set(email, entry);
}

// ---------------------------------------------------------------------------

export function findUserByEmail(email) {
  return getDb().users.find((u) => u.email === normalizeEmail(email)) || null;
}

function createUser({ name, email, password, role }) {
  return transaction((db) => {
    const user = {
      id: 'USR-' + randomBytes(4).toString('hex').toUpperCase(),
      name: String(name).trim(),
      email: normalizeEmail(email),
      passwordHash: hashPassword(password),
      role,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    return user;
  });
}

function createSession(user) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + config.sessionDays * 24 * 60 * 60 * 1000).toISOString();
  transaction((db) => {
    // remove expired sessions while we are here
    db.sessions = db.sessions.filter((s) => s.expiresAt > new Date().toISOString());
    db.sessions.push({ tokenHash: hashToken(token), userId: user.id, createdAt: new Date().toISOString(), expiresAt });
  });
  return { token, expiresAt, user: toPublicUser(user) };
}

// Public registration: always creates a TOURIST, whatever the request says
export function registerTourist({ name, email, password }) {
  if (findUserByEmail(email)) {
    throw new AuthError('An account with this email already exists.', 409, { email: 'Email already registered.' });
  }
  const user = createUser({ name, email, password, role: ROLES.TOURIST });
  return createSession(user);
}

// `requiredRole` makes the tourist login and the admin login separate
export function login({ email, password, requiredRole }) {
  const normalized = normalizeEmail(email);
  checkLock(normalized);

  const user = findUserByEmail(normalized);
  if (!user || !verifyPassword(String(password || ''), user.passwordHash)) {
    recordFailure(normalized);
    throw new AuthError('Incorrect email or password.');
  }
  if (user.role !== requiredRole) {
    throw new AuthError(
      requiredRole === ROLES.ADMIN
        ? 'This is not an administrator account. Use the tourist login.'
        : 'Administrator accounts must use the admin login page.',
      403
    );
  }
  failedLogins.delete(normalized);
  return createSession(user);
}

export function getUserForToken(token) {
  if (!token) return null;
  const db = getDb();
  const session = db.sessions.find((s) => s.tokenHash === hashToken(token));
  if (!session || session.expiresAt < new Date().toISOString()) return null;
  return db.users.find((u) => u.id === session.userId) || null;
}

export function logout(token) {
  if (!token) return;
  transaction((db) => {
    db.sessions = db.sessions.filter((s) => s.tokenHash !== hashToken(token));
  });
}

// Creates or updates an admin account (used by server start-up and scripts/createAdmin.js)
export function upsertAdmin({ email, password, name }) {
  const existing = findUserByEmail(email);
  if (existing) {
    return transaction(() => {
      existing.role = ROLES.ADMIN;
      existing.passwordHash = hashPassword(password);
      existing.name = name || existing.name;
      return { user: existing, created: false };
    });
  }
  return { user: createUser({ name, email, password, role: ROLES.ADMIN }), created: true };
}

// On start-up: create the admin from ADMIN_EMAIL / ADMIN_PASSWORD if it does not exist yet
export function ensureAdminFromEnv() {
  const { adminEmail, adminPassword, adminName } = config;
  if (!adminEmail || !adminPassword) {
    if (!getDb().users.some((u) => u.role === ROLES.ADMIN)) {
      console.warn('No admin account yet. Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env (see .env.example) or run: npm run create-admin');
    }
    return;
  }
  if (adminPassword.length < 8) {
    console.warn('ADMIN_PASSWORD must be at least 8 characters - admin account not created.');
    return;
  }
  if (!findUserByEmail(adminEmail)) {
    upsertAdmin({ email: adminEmail, password: adminPassword, name: adminName });
    console.log(`Admin account created for ${normalizeEmail(adminEmail)}`);
  }
}
