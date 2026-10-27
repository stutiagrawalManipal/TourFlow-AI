/**
 * One-time import of the old JSON database (milestone 4 and earlier) into PostgreSQL.
 *   npm run db:import-json                      (reads data/tourflow-db.json)
 *   npm run db:import-json -- path/to/file.json
 *
 * - Users keep their ids and password hashes, so existing passwords still work.
 * - Bookings keep their ids, ticket numbers, statuses and QR pass codes.
 * - Queue counters and destination settings are carried over.
 * - Safe to run twice: rows that already exist are skipped.
 * - Sessions are not imported, so everyone logs in once more.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import '../config/env.js';
import { migrate } from '../db/migrate.js';
import { pool, withTransaction } from '../db/pool.js';
import { recordAudit } from '../services/auditService.js';

const file = resolve(process.argv[2] || fileURLToPath(new URL('../data/tourflow-db.json', import.meta.url)));
if (!existsSync(file)) {
  console.log(`Nothing to import: ${file} does not exist.`);
  process.exit(0);
}

const old = JSON.parse(readFileSync(file, 'utf-8'));
const STATUSES = ['WAITING', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW'];

try {
  await migrate();
  const result = await withTransaction(async (client) => {
    let users = 0;
    let bookings = 0;
    const skipped = [];

    for (const u of old.users || []) {
      const { rowCount } = await client.query(
        `INSERT INTO users (id, name, email, password_hash, role, created_at)
         VALUES ($1, $2, lower($3), $4, $5, $6) ON CONFLICT DO NOTHING`,
        [u.id, u.name, u.email, u.passwordHash, u.role === 'admin' ? 'admin' : 'tourist', u.createdAt || new Date()]
      );
      users += rowCount;
    }

    for (const b of old.bookings || []) {
      const status = STATUSES.includes(b.status) ? b.status : 'CANCELLED';
      const { rows: ok } = await client.query(
        'SELECT (SELECT 1 FROM users WHERE id = $1) AS user_ok, (SELECT 1 FROM destinations WHERE id = $2) AS dest_ok',
        [b.userId, String(b.destinationId)]
      );
      if (!ok[0].user_ok || !ok[0].dest_ok) {
        skipped.push(`${b.bookingId} (unknown user or destination)`);
        continue;
      }
      const { rowCount } = await client.query(
        `INSERT INTO bookings (booking_id, user_id, destination_id, number_of_people, ticket_number, position_at_booking,
           status, request_id, pass_code, pass_issued_at, created_at, checked_in_at, checked_out_at, cancelled_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) ON CONFLICT DO NOTHING`,
        [
          b.bookingId,
          b.userId,
          String(b.destinationId),
          b.numberOfPeople,
          b.ticketNumber,
          b.positionAtBooking || 1,
          status,
          b.requestId || null,
          b.pass?.code || b.bookingId.replace(/\W/g, ''),
          b.pass?.issuedAt || b.createdAt,
          b.createdAt,
          b.checkedInAt || null,
          b.checkedOutAt || null,
          b.cancelledAt || null,
        ]
      );
      if (rowCount) bookings += 1;
      else skipped.push(`${b.bookingId} (already imported or conflicts with existing data)`);
    }

    // Ticket counters: never go backwards, so FIFO numbers stay unique
    await client.query(
      `UPDATE destinations d SET last_ticket_number = GREATEST(d.last_ticket_number, x.max_ticket)
       FROM (SELECT destination_id, MAX(ticket_number) AS max_ticket FROM bookings GROUP BY destination_id) x
       WHERE x.destination_id = d.id`
    );
    for (const [id, counter] of Object.entries(old.queueCounters || {})) {
      await client.query('UPDATE destinations SET last_ticket_number = GREATEST(last_ticket_number, $2) WHERE id = $1', [String(id), Number(counter) || 0]);
    }
    for (const [id, s] of Object.entries(old.destinationSettings || {})) {
      await client.query(
        `UPDATE destinations SET queue_open = COALESCE($2, queue_open),
           entry_rate_per_minute = COALESCE($3, entry_rate_per_minute), notice = COALESCE($4, notice) WHERE id = $1`,
        [String(id), typeof s.queueOpen === 'boolean' ? s.queueOpen : null, s.entryRatePerMinute ?? null, s.notice ?? null]
      );
    }

    await recordAudit({ actor: null, action: 'data.imported_from_json', details: { file, users, bookings, skipped: skipped.length } }, client);
    return { users, bookings, skipped };
  });

  console.log(`Imported ${result.users} user(s) and ${result.bookings} booking(s).`);
  if (result.skipped.length) console.log('Skipped:\n  ' + result.skipped.join('\n  '));
  console.log('You can now keep data/tourflow-db.json as a backup or delete it.');
} catch (err) {
  console.error('Import failed, nothing was changed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
