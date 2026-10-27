/**
 * Create or reset an admin account from the command line.
 *   npm run create-admin -- admin@example.com "StrongPass123" "Admin Name"
 * The password is hashed before it is saved; nothing is printed back.
 */
import '../config/env.js';
import { migrate } from '../db/migrate.js';
import { pool } from '../db/pool.js';
import { upsertAdmin } from '../services/authService.js';
import { normalizeEmail, validatePassword } from '../models/User.js';

const [email, password, name = 'TourFlow Admin'] = process.argv.slice(2);

if (!email || !password) {
  console.log('Usage: npm run create-admin -- <email> <password> [name]');
  process.exit(1);
}
const weak = validatePassword(password);
if (weak) {
  console.log(weak);
  process.exit(1);
}

try {
  await migrate({ log: () => {} });
  const { created } = await upsertAdmin({ email, password, name });
  console.log(`${created ? 'Created' : 'Updated'} admin account: ${normalizeEmail(email)}`);
} catch (err) {
  console.error('Failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
