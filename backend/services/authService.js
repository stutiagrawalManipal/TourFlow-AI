import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'crypto';
import { query, withTransaction } from '../db/pool.js';
import { config } from '../config/env.js';
import { ROLES, normalizeEmail, toPublicUser, validateName, validatePassword } from '../models/User.js';
import { recordAudit } from './auditService.js';

/**
 * Auth service
 * - Passwords are hashed with scrypt (built into Node) and a random salt.
 * - A login creates a random session token, sent to the browser as an
 *   HttpOnly cookie. Only a SHA-256 hash of the token is stored.
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
  const [scheme, salt, hash] = String(stored || '').split(':');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(String(password), salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// Used when the email does not exist, so a failed login takes the same time either way
const DUMMY_HASH = hashPassword(randomBytes(12).toString('hex'));

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

// ---- protection against password guessing (per email, in memory) ----
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

export async function findUserByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [normalizeEmail(email)]);
  return rows[0] || null;
}

const newUserId = () => 'USR-' + randomBytes(4).toString('hex').toUpperCase();

async function createSession(user, { userAgent, ip } = {}) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + config.sessionDays * 24 * 60 * 60 * 1000);
  await query('DELETE FROM sessions WHERE expires_at < now()'); // housekeeping
  await query(
    'INSERT INTO sessions (token_hash, user_id, expires_at, user_agent, ip) VALUES ($1, $2, $3, $4, $5)',
    [hashToken(token), user.id, expiresAt, String(userAgent || '').slice(0, 300), ip || null]
  );
  return { token, expiresAt, user: toPublicUser(user) };
}

// Public registration: always creates a TOURIST, whatever the request says
export async function registerTourist({ name, email, password }, meta) {
  try {
    const { rows } = await query(
      `INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [newUserId(), String(name).trim(), normalizeEmail(email), hashPassword(password), ROLES.TOURIST]
    );
    return createSession(rows[0], meta);
  } catch (err) {
    if (err.code === '23505') {
      throw new AuthError('An account with this email already exists.', 409, { email: 'Email already registered.' });
    }
    throw err;
  }
}

// `requiredRole` keeps the tourist login and the admin login separate
export async function login({ email, password, requiredRole }, meta) {
  const normalized = normalizeEmail(email);
  checkLock(normalized);

  const user = await findUserByEmail(normalized);
  const passwordOk = verifyPassword(String(password || ''), user ? user.password_hash : DUMMY_HASH);
  if (!user || !passwordOk) {
    recordFailure(normalized);
    if (requiredRole === ROLES.ADMIN) {
      await recordAudit({ actor: null, action: 'auth.admin_login_failed', targetType: 'user', targetId: normalized, details: { ip: meta?.ip } });
    }
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
  if (user.role === ROLES.ADMIN) {
    await recordAudit({ actor: user, action: 'auth.admin_login', targetType: 'user', targetId: user.id, details: { ip: meta?.ip } });
  }
  return createSession(user, meta);
}

export async function getUserForToken(token) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const { rows } = await query(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [hashToken(token)]
  );
  return rows[0] || null;
}

export async function logout(token) {
  if (token) await query('DELETE FROM sessions WHERE token_hash = $1', [hashToken(token)]);
}

// Account page: change display name
export async function updateName(user, name) {
  const error = validateName(name);
  if (error) throw new AuthError(error, 400, { name: error });
  const { rows } = await query('UPDATE users SET name = $1 WHERE id = $2 RETURNING *', [String(name).trim(), user.id]);
  return toPublicUser(rows[0]);
}

// Account page: change password (logs out every other session of this user)
export async function changePassword(user, currentPassword, newPassword, currentToken) {
  if (!verifyPassword(String(currentPassword || ''), user.password_hash)) {
    throw new AuthError('Your current password is incorrect.', 400, { currentPassword: 'Incorrect password.' });
  }
  const error = validatePassword(newPassword);
  if (error) throw new AuthError(error, 400, { newPassword: error });
  if (currentPassword === newPassword) {
    throw new AuthError('The new password must be different.', 400, { newPassword: 'Choose a different password.' });
  }
  await withTransaction(async (client) => {
    await client.query('UPDATE users SET password_hash = $1, password_changed_at = now() WHERE id = $2', [hashPassword(newPassword), user.id]);
    await client.query('DELETE FROM sessions WHERE user_id = $1 AND token_hash <> $2', [user.id, hashToken(currentToken || '')]);
    await recordAudit({ actor: user, action: 'auth.password_changed', targetType: 'user', targetId: user.id }, client);
  });
}

// Creates or updates an admin account (used by server start-up and scripts/createAdmin.js)
export async function upsertAdmin({ email, password, name }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    await query('UPDATE users SET role = $1, password_hash = $2, name = $3, password_changed_at = now() WHERE id = $4', [
      ROLES.ADMIN,
      hashPassword(password),
      name || existing.name,
      existing.id,
    ]);
    await query('DELETE FROM sessions WHERE user_id = $1', [existing.id]);
    await recordAudit({ actor: null, action: 'admin.account_updated_from_cli', targetType: 'user', targetId: existing.id });
    return { created: false };
  }
  const { rows } = await query(
    'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [newUserId(), name, normalizeEmail(email), hashPassword(password), ROLES.ADMIN]
  );
  await recordAudit({ actor: null, action: 'admin.account_created', targetType: 'user', targetId: rows[0].id });
  return { created: true };
}

// On start-up: create the admin from ADMIN_EMAIL / ADMIN_PASSWORD if it does not exist yet
export async function ensureAdminFromEnv() {
  const { adminEmail, adminPassword, adminName } = config;
  if (!adminEmail || !adminPassword) {
    const { rows } = await query("SELECT 1 FROM users WHERE role = 'admin' LIMIT 1");
    if (!rows.length) {
      console.warn('No admin account yet. Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env or run: npm run create-admin');
    }
    return;
  }
  if (validatePassword(adminPassword)) {
    console.warn(`ADMIN_PASSWORD is too weak (${validatePassword(adminPassword)}) - admin account not created.`);
    return;
  }
  if (!(await findUserByEmail(adminEmail))) {
    await upsertAdmin({ email: adminEmail, password: adminPassword, name: adminName });
    console.log(`Admin account created for ${normalizeEmail(adminEmail)}`);
  }
}
