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

export function validateName(name) {
  const value = String(name || '').trim();
  if (value.length < 2) return 'Name must be at least 2 characters.';
  if (value.length > 60) return 'Name must be at most 60 characters.';
  return null;
}

export function validatePassword(password) {
  const value = String(password || '');
  if (value.length < 8) return 'Password must be at least 8 characters.';
  if (value.length > 128) return 'Password must be at most 128 characters.';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Password must contain letters and numbers.';
  return null;
}

// Returns an object of field errors (empty object = valid)
export function validateRegistration({ name, email, password }) {
  const errors = {};
  const nameError = validateName(name);
  if (nameError) errors.name = nameError;
  const email_ = normalizeEmail(email);
  if (!EMAIL_PATTERN.test(email_) || email_.length > 254) errors.email = 'Enter a valid email address.';
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  return errors;
}

// What the frontend is allowed to see (never the password hash)
export function toPublicUser(row) {
  const initials = row.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    initials,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  };
}
