import { getUserForToken } from '../services/authService.js';
import { config } from '../config/env.js';

/**
 * Session cookie handling.
 * The session token lives in an HttpOnly cookie, so JavaScript in the page
 * (including any injected script) cannot read it. The user's role always
 * comes from the database, so editing anything in the browser cannot give
 * admin access.
 */
export const SESSION_COOKIE = 'tf_session';

export function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function cookieAttributes(maxAgeSeconds) {
  return ['Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAgeSeconds}`, ...(config.cookieSecure ? ['Secure'] : [])].join('; ');
}

export function setSessionCookie(res, token, expiresAt) {
  const maxAge = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; ${cookieAttributes(maxAge)}`);
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; ${cookieAttributes(0)}`);
}

async function resolveUser(req) {
  const token = readCookie(req, SESSION_COOKIE);
  req.token = token;
  req.user = token ? await getUserForToken(token) : null;
}

export function requireAuth(req, res, next) {
  resolveUser(req).then(
    () => (req.user ? next() : res.status(401).json({ error: 'Please log in to continue.' })),
    next
  );
}

export function requireRole(role) {
  return (req, res, next) => {
    resolveUser(req).then(() => {
      if (!req.user) return res.status(401).json({ error: 'Please log in to continue.' });
      if (req.user.role !== role) return res.status(403).json({ error: 'You do not have permission to do this.' });
      next();
    }, next);
  };
}
