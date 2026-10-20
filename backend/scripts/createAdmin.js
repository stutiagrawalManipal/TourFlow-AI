/**
 * Create or reset an admin account from the command line.
 *   npm run create-admin -- admin@example.com "StrongPass123" "Admin Name"
 * The password is hashed before it is saved; nothing is printed back.
 */
import '../config/env.js';
import { upsertAdmin } from '../services/authService.js';
import { normalizeEmail } from '../models/User.js';

const [email, password, name = 'TourFlow Admin'] = process.argv.slice(2);

if (!email || !password) {
  console.log('Usage: npm run create-admin -- <email> <password> [name]');
  process.exit(1);
}
if (password.length < 8) {
  console.log('Password must be at least 8 characters.');
  process.exit(1);
}

const { created } = upsertAdmin({ email, password, name });
console.log(`${created ? 'Created' : 'Updated'} admin account: ${normalizeEmail(email)}`);
