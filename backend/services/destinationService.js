import { query, withTransaction } from '../db/pool.js';
import { clean } from '../models/Destination.js';
import { recordAudit } from './auditService.js';

/**
 * Destination service
 * Destinations live in the `destinations` table: the tourism dataset record
 * (read-only) plus admin-edited content, photographs and queue settings.
 */

const DESTINATION_COLUMNS = `id, dataset, content, images, queue_open, entry_rate_per_minute, max_queue_people,
  notice, last_ticket_number, content_updated_at, content_updated_by`;

// Text that is searched: name, state, district, region, trip types, attractions
const SEARCH_SQL = `lower(concat_ws(' ', dataset->>'destination_name', dataset->>'state', dataset->>'district',
  dataset->>'region', dataset->>'trip_types', dataset->>'primary_attractions'))`;

export async function findDestinations({ search, state, category } = {}) {
  const where = [];
  const params = [];
  if (search) {
    // every word must appear somewhere, e.g. "beach goa"
    for (const word of String(search).toLowerCase().trim().split(/\s+/).slice(0, 5)) {
      params.push(`%${word.replace(/[%_\\]/g, '\\$&')}%`);
      where.push(`${SEARCH_SQL} LIKE $${params.length}`);
    }
  }
  if (state) {
    params.push(String(state).toLowerCase());
    where.push(`lower(dataset->>'state') = $${params.length}`);
  }
  if (category) {
    // trip types are stored like "Hill_station"; the UI shows "Hill station"
    params.push(String(category).replace(/ /g, '_').toLowerCase());
    where.push(`EXISTS (SELECT 1 FROM jsonb_array_elements_text(dataset->'trip_types') t WHERE lower(t) = $${params.length})`);
  }
  const { rows } = await query(
    `SELECT ${DESTINATION_COLUMNS} FROM destinations ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY id::int`,
    params
  );
  return rows;
}

export async function findDestinationById(id, client = null) {
  if (!/^\d{1,9}$/.test(String(id))) return null;
  const run = client ? client.query.bind(client) : query;
  const { rows } = await run(`SELECT ${DESTINATION_COLUMNS} FROM destinations WHERE id = $1`, [String(id)]);
  return rows[0] || null;
}

export async function getFilterOptions() {
  const { rows } = await query(`SELECT dataset->'state' AS state, dataset->'trip_types' AS types FROM destinations`);
  const states = [...new Set(rows.map((r) => clean(r.state)).filter(Boolean))].sort();
  const counts = {};
  for (const r of rows) {
    for (const type of r.types || []) {
      const name = clean(type).replace(/_/g, ' ');
      counts[name] = (counts[name] || 0) + 1;
    }
  }
  const categories = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name]) => name);
  return { states, categories };
}

export function settingsOf(row) {
  return {
    queueOpen: row.queue_open,
    entryRatePerMinute: Number(row.entry_rate_per_minute),
    maxQueuePeople: Number(row.max_queue_people),
    notice: row.notice,
  };
}

// ---------------------------------------------------------------- validation helpers
export class ValidationError extends Error {
  constructor(fields) {
    super('Please fix the highlighted fields.');
    this.status = 400;
    this.fields = fields;
  }
}

function httpsUrl(value) {
  try {
    const url = new URL(String(value));
    return url.protocol === 'https:' && String(value).length <= 2000 ? url.toString() : null;
  } catch {
    return null;
  }
}

function text(value, max) {
  if (value === undefined || value === null) return null;
  const v = String(value).trim();
  return v.length ? v.slice(0, max + 1) : null;
}

// ---------------------------------------------------------------- admin: queue settings
export async function updateSettings(destinationId, changes, actor) {
  const errors = {};
  const next = {};
  if (changes.queueOpen !== undefined) {
    if (typeof changes.queueOpen !== 'boolean') errors.queueOpen = 'queueOpen must be true or false.';
    else next.queue_open = changes.queueOpen;
  }
  if (changes.entryRatePerMinute !== undefined) {
    const rate = Number(changes.entryRatePerMinute);
    if (!Number.isFinite(rate) || rate < 0.1 || rate > 100) errors.entryRatePerMinute = 'Entry rate must be between 0.1 and 100 people per minute.';
    else next.entry_rate_per_minute = Math.round(rate * 10) / 10;
  }
  if (changes.maxQueuePeople !== undefined) {
    const max = Number(changes.maxQueuePeople);
    if (!Number.isInteger(max) || max < 1 || max > 100000) errors.maxQueuePeople = 'Queue capacity must be a whole number from 1 to 100000.';
    else next.max_queue_people = max;
  }
  if (changes.notice !== undefined) {
    const notice = String(changes.notice).trim();
    if (notice.length > 200) errors.notice = 'Notice must be at most 200 characters.';
    else next.notice = notice;
  }
  if (Object.keys(errors).length) throw new ValidationError(errors);
  if (!Object.keys(next).length) throw new ValidationError({ settings: 'Nothing to update.' });

  return withTransaction(async (client) => {
    const before = await findDestinationById(destinationId, client);
    const columns = Object.keys(next);
    const { rows } = await client.query(
      `UPDATE destinations SET ${columns.map((c, i) => `${c} = $${i + 2}`).join(', ')}, updated_at = now()
       WHERE id = $1 RETURNING ${DESTINATION_COLUMNS}`,
      [String(destinationId), ...columns.map((c) => next[c])]
    );
    await recordAudit(
      {
        actor,
        action: 'destination.settings_updated',
        targetType: 'destination',
        targetId: String(destinationId),
        details: { before: settingsOf(before), after: settingsOf(rows[0]) },
      },
      client
    );
    return settingsOf(rows[0]);
  });
}

// ---------------------------------------------------------------- admin: content
const TEXT_FIELDS = {
  historicalBackground: 3000,
  significance: 3000,
  visitorGuidelines: 3000,
  accessibilityNotes: 2000,
  visitDuration: 200,
  guideInfo: 2000,
};

// opening hours / entry fees: shown to tourists only when verified with a source
function verifiedFactInput(value, field, errors) {
  if (value === undefined || value === null) return null;
  const factText = text(value.text, 500);
  if (!factText) return null;
  if (factText.length > 500) errors[field] = 'Must be at most 500 characters.';
  const verified = value.verified === true;
  const sourceUrl = value.sourceUrl ? httpsUrl(value.sourceUrl) : null;
  if (value.sourceUrl && !sourceUrl) errors[field] = 'Source must be a valid https:// link.';
  if (verified && !sourceUrl) errors[field] = 'A source link (official website or notice) is required to mark this as verified.';
  return { text: factText, verified, sourceUrl, verifiedAt: verified ? value.verifiedAt || new Date().toISOString() : null };
}

export function validateContent(input) {
  const errors = {};
  const content = {};
  for (const [field, max] of Object.entries(TEXT_FIELDS)) {
    const value = text(input[field], max);
    if (value && value.length > max) errors[field] = `Must be at most ${max} characters.`;
    content[field] = value;
  }
  content.openingHours = verifiedFactInput(input.openingHours, 'openingHours', errors);
  content.entryFees = verifiedFactInput(input.entryFees, 'entryFees', errors);

  const faqs = Array.isArray(input.faqs) ? input.faqs : [];
  if (faqs.length > 15) errors.faqs = 'At most 15 FAQs.';
  content.faqs = faqs
    .map((f) => ({ question: text(f?.question, 200), answer: text(f?.answer, 1000) }))
    .filter((f) => f.question || f.answer);
  if (content.faqs.some((f) => !f.question || !f.answer)) errors.faqs = 'Every FAQ needs both a question and an answer.';
  if (content.faqs.some((f) => f.question.length > 200 || f.answer.length > 1000)) errors.faqs = 'FAQ question max 200, answer max 1000 characters.';

  if (Object.keys(errors).length) throw new ValidationError(errors);
  return content;
}

export async function updateContent(destinationId, input, actor) {
  const content = validateContent(input || {});
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `UPDATE destinations SET content = $2, content_updated_at = now(), content_updated_by = $3, updated_at = now()
       WHERE id = $1 RETURNING ${DESTINATION_COLUMNS}`,
      [String(destinationId), JSON.stringify(content), actor.id]
    );
    await recordAudit(
      {
        actor,
        action: 'destination.content_updated',
        targetType: 'destination',
        targetId: String(destinationId),
        details: {
          fields: Object.keys(content).filter((k) => content[k] && (!Array.isArray(content[k]) || content[k].length)),
          openingHoursVerified: Boolean(content.openingHours?.verified),
          entryFeesVerified: Boolean(content.entryFees?.verified),
        },
      },
      client
    );
    return rows[0];
  });
}

// ---------------------------------------------------------------- admin: photographs
export const MAX_IMAGES = 8;

export function validateImages(input) {
  if (!Array.isArray(input)) throw new ValidationError({ images: 'Images must be a list.' });
  if (input.length > MAX_IMAGES) throw new ValidationError({ images: `At most ${MAX_IMAGES} photographs per destination.` });
  const errors = {};
  const images = input.map((img, i) => {
    const url = httpsUrl(img?.url);
    const alt = text(img?.alt, 200);
    const credit = text(img?.credit, 200);
    const license = text(img?.license, 100);
    const licenseUrl = img?.licenseUrl ? httpsUrl(img.licenseUrl) : null;
    const sourceUrl = img?.sourceUrl ? httpsUrl(img.sourceUrl) : null;
    const problems = [];
    if (!url) problems.push('a valid https:// image URL');
    if (!alt || alt.length < 5) problems.push('alt text (at least 5 characters) describing the photo');
    if (!credit) problems.push('the photographer / credit');
    if (!license) problems.push('the licence (e.g. CC BY-SA 4.0, or "Own photo, used with permission")');
    if (img?.licenseUrl && !licenseUrl) problems.push('a valid https:// licence link');
    if (img?.sourceUrl && !sourceUrl) problems.push('a valid https:// source link');
    if ([alt, credit, license].some((v) => v && v.length > 200)) problems.push('shorter text (max 200 characters)');
    if (problems.length) errors[`image${i + 1}`] = `Photo ${i + 1} needs ${problems.join(', ')}.`;

    const srcset = (Array.isArray(img?.srcset) ? img.srcset : [])
      .map((s) => ({ url: httpsUrl(s?.url), width: Number(s?.width) }))
      .filter((s) => s.url && Number.isInteger(s.width) && s.width > 0 && s.width <= 4000)
      .slice(0, 5);
    return {
      url,
      alt,
      credit,
      license,
      licenseUrl,
      sourceUrl,
      srcset,
      width: Number.isInteger(img?.width) ? img.width : null,
      height: Number.isInteger(img?.height) ? img.height : null,
    };
  });
  if (Object.keys(errors).length) throw new ValidationError(errors);
  return images;
}

export async function updateImages(destinationId, input, actor, { action = 'destination.images_updated', client: outer } = {}) {
  const images = validateImages(input);
  const work = async (client) => {
    const { rows } = await client.query(
      `UPDATE destinations SET images = $2, updated_at = now() WHERE id = $1 RETURNING ${DESTINATION_COLUMNS}`,
      [String(destinationId), JSON.stringify(images)]
    );
    await recordAudit(
      { actor, action, targetType: 'destination', targetId: String(destinationId), details: { count: images.length, urls: images.map((i) => i.url) } },
      client
    );
    return rows[0];
  };
  return outer ? work(outer) : withTransaction(work);
}
