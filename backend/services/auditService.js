import { query } from '../db/pool.js';

/**
 * Audit log - append-only (the database refuses UPDATE and DELETE).
 * Pass `client` when the entry must be part of the same transaction as the
 * change it describes, so the change and its log entry succeed or fail together.
 */
export async function recordAudit({ actor, action, targetType = null, targetId = null, reason = null, details = {} }, client = null) {
  const sql = `INSERT INTO audit_log (actor_id, actor_email, actor_role, action, target_type, target_id, reason, details)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
  const params = [actor?.id || null, actor?.email || null, actor?.role || null, action, targetType, targetId, reason, JSON.stringify(details)];
  return client ? client.query(sql, params) : query(sql, params);
}

export async function listAudit({ action, targetId, actor, limit = 100, before } = {}) {
  const where = [];
  const params = [];
  const add = (sql, value) => {
    params.push(value);
    where.push(sql.replace('?', `$${params.length}`));
  };
  if (action) add('action = ?', action);
  if (targetId) add('target_id = ?', targetId);
  if (actor) add('actor_email ILIKE ?', `%${actor}%`);
  if (before) add('id < ?', Number(before));
  params.push(Math.min(Math.max(Number(limit) || 100, 1), 200));

  const { rows } = await query(
    `SELECT id, at, actor_email, actor_role, action, target_type, target_id, reason, details
     FROM audit_log ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY id DESC LIMIT $${params.length}`,
    params
  );
  return rows.map((r) => ({
    id: Number(r.id),
    at: new Date(r.at).toISOString(),
    actorEmail: r.actor_email,
    actorRole: r.actor_role,
    action: r.action,
    targetType: r.target_type,
    targetId: r.target_id,
    reason: r.reason,
    details: r.details,
  }));
}
