/**
 * User model
 * Roles: 'tourist' (self-registration) and 'admin' (created only from the
 * server environment / script, never through the public API).
 */
export const ROLES = { TOURIST: 'tourist', ADMIN: 'admin' };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

// Returns an object of field errors (empty object = valid)
export function validateRegistration({ name, email, password }) {
  const errors = {};
  if (!name || String(name).trim().length < 2) errors.name = 'Name must be at least 2 characters.';
  if (String(name || '').trim().length > 60) errors.name = 'Name must be at most 60 characters.';
  if (!EMAIL_PATTERN.test(normalizeEmail(email))) errors.email = 'Enter a valid email address.';
  if (!password || String(password).length < 8) errors.password = 'Password must be at least 8 characters.';
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) errors.password = 'Password must contain letters and numbers.';
  return errors;
}

// What the frontend is allowed to see (never the password hash)
export function toPublicUser(user) {
  const initials = user.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return { id: user.id, name: user.name, email: user.email, role: user.role, initials, createdAt: user.createdAt };
}
