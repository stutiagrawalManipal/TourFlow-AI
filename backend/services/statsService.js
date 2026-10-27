import { query } from '../db/pool.js';
import { destinationName } from '../models/Destination.js';

// Operational summary for the admin dashboard (a few aggregate queries)
export async function getStats() {
  const [totals, users, active] = await Promise.all([
    query(`SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata')::int AS today,
        COUNT(*) FILTER (WHERE status = 'WAITING')::int AS waiting,
        COUNT(*) FILTER (WHERE status = 'CHECKED_IN')::int AS checked_in,
        COUNT(*) FILTER (WHERE status = 'CHECKED_OUT')::int AS checked_out,
        COUNT(*) FILTER (WHERE status = 'CANCELLED')::int AS cancelled,
        COUNT(*) FILTER (WHERE status = 'NO_SHOW')::int AS no_show,
        COALESCE(SUM(number_of_people) FILTER (WHERE status = 'WAITING'), 0)::int AS people_waiting,
        COALESCE(SUM(number_of_people) FILTER (WHERE status = 'CHECKED_IN'), 0)::int AS people_inside
      FROM bookings`),
    query(`SELECT COUNT(*)::int AS tourists FROM users WHERE role = 'tourist'`),
    query(`SELECT * FROM (
        SELECT b.destination_id, d.dataset->>'destination_name' AS name,
          COALESCE(SUM(b.number_of_people) FILTER (WHERE b.status = 'WAITING'), 0)::int AS waiting,
          COALESCE(SUM(b.number_of_people) FILTER (WHERE b.status = 'CHECKED_IN'), 0)::int AS inside
        FROM bookings b JOIN destinations d ON d.id = b.destination_id
        WHERE b.status IN ('WAITING', 'CHECKED_IN')
        GROUP BY b.destination_id, d.dataset->>'destination_name'
      ) t ORDER BY waiting + inside DESC, name LIMIT 20`),
  ]);
  const t = totals.rows[0];
  return {
    totalBookings: t.total,
    bookingsToday: t.today,
    waiting: t.waiting,
    checkedIn: t.checked_in,
    checkedOut: t.checked_out,
    cancelled: t.cancelled,
    noShow: t.no_show,
    peopleWaiting: t.people_waiting,
    peopleInside: t.people_inside,
    registeredTourists: users.rows[0].tourists,
    activeDestinations: active.rows.map((r) => ({
      destinationId: r.destination_id,
      destinationName: destinationName({ destination_name: r.name }, r.destination_id),
      peopleWaiting: r.waiting,
      peopleInside: r.inside,
    })),
    generatedAt: new Date().toISOString(),
  };
}
