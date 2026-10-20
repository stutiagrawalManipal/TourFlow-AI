import { registerTourist, login, logout } from '../services/authService.js';
import { validateRegistration, toPublicUser, ROLES } from '../models/User.js';

function sendError(res, err) {
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Something went wrong.', fields: err.fields });
}

// POST /api/auth/register  { name, email, password }  -> always a tourist account
export function register(req, res) {
  const { name, email, password } = req.body || {};
  const fields = validateRegistration({ name, email, password });
  if (Object.keys(fields).length) {
    return res.status(400).json({ error: 'Please fix the highlighted fields.', fields });
  }
  try {
    res.status(201).json(registerTourist({ name, email, password }));
  } catch (err) {
    sendError(res, err);
  }
}

function loginAs(role) {
  return (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    try {
      res.json(login({ email, password, requiredRole: role }));
    } catch (err) {
      sendError(res, err);
    }
  };
}

export const touristLogin = loginAs(ROLES.TOURIST); // POST /api/auth/login
export const adminLogin = loginAs(ROLES.ADMIN);     // POST /api/auth/admin/login

// GET /api/auth/me
export function me(req, res) {
  res.json({ user: toPublicUser(req.user) });
}

// POST /api/auth/logout
export function logoutUser(req, res) {
  logout(req.token);
  res.json({ success: true });
}
