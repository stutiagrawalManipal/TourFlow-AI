import { registerTourist, login, logout, updateName, changePassword } from '../services/authService.js';
import { validateRegistration, toPublicUser, ROLES } from '../models/User.js';
import { setSessionCookie, clearSessionCookie } from '../middleware/auth.js';

const meta = (req) => ({ userAgent: req.get('User-Agent'), ip: req.ip });

// POST /api/auth/register  { name, email, password }  -> always a tourist account
export async function register(req, res) {
  const { name, email, password } = req.body || {};
  const fields = validateRegistration({ name, email, password });
  if (Object.keys(fields).length) {
    return res.status(400).json({ error: 'Please fix the highlighted fields.', fields });
  }
  const session = await registerTourist({ name, email, password }, meta(req));
  setSessionCookie(res, session.token, session.expiresAt);
  res.status(201).json({ user: session.user });
}

function loginAs(role) {
  return async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    const session = await login({ email, password, requiredRole: role }, meta(req));
    setSessionCookie(res, session.token, session.expiresAt);
    res.json({ user: session.user });
  };
}

export const touristLogin = loginAs(ROLES.TOURIST); // POST /api/auth/login
export const adminLogin = loginAs(ROLES.ADMIN);     // POST /api/auth/admin/login

// GET /api/auth/me
export function me(req, res) {
  res.json({ user: toPublicUser(req.user) });
}

// POST /api/auth/logout
export async function logoutUser(req, res) {
  await logout(req.token);
  clearSessionCookie(res);
  res.json({ success: true });
}

// PATCH /api/auth/me   { name }
export async function updateProfile(req, res) {
  res.json({ user: await updateName(req.user, (req.body || {}).name) });
}

// POST /api/auth/change-password   { currentPassword, newPassword }
export async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};
  await changePassword(req.user, currentPassword, newPassword, req.token);
  res.json({ success: true, message: 'Password changed. Other devices have been logged out.' });
}
