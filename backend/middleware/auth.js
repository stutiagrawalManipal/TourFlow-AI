import { getUserForToken } from '../services/authService.js';

/**
 * Reads "Authorization: Bearer <token>" and attaches req.user.
 * The role always comes from the database, never from the request,
 * so editing a role in the browser does not give admin access.
 */
function readToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
}

export function requireAuth(req, res, next) {
  const token = readToken(req);
  const user = getUserForToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Please log in to continue.' });
  }
  req.user = user;
  req.token = token;
  next();
}

export function requireRole(role) {
  return (req, res, next) => {
    requireAuth(req, res, () => {
      if (req.user.role !== role) {
        return res.status(403).json({ error: 'You do not have permission to do this.' });
      }
      next();
    });
  };
}
