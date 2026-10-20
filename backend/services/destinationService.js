import { readFileSync } from 'fs';
import { getDb, transaction } from '../db/store.js';
import { clean } from '../models/Destination.js';

/**
 * Destination service
 * The tourism dataset is static reference data: it is loaded once and never
 * modified. Admin-editable queue settings are stored separately in the database.
 */
const datasetUrl = new URL('../data/india_tourism_dataset.json', import.meta.url);
const destinations = JSON.parse(readFileSync(datasetUrl, 'utf-8'));

console.log(`Loaded ${destinations.length} destinations from the tourism dataset`);

export const DEFAULT_SETTINGS = {
  queueOpen: true,
  entryRatePerMinute: 2, // planning assumption until real entries are measured
  notice: '',
};

function searchableText(record) {
  return [
    record.destination_name,
    record.state,
    record.district,
    record.region,
    ...(record.trip_types || []),
    ...(record.primary_attractions || []),
  ]
    .map(clean)
    .join(' ')
    .toLowerCase();
}

export function findDestinations({ search, state, category } = {}) {
  return destinations.filter((record) => {
    if (search && !searchableText(record).includes(String(search).toLowerCase().trim())) return false;
    if (state && clean(record.state).toLowerCase() !== String(state).toLowerCase()) return false;
    if (category) {
      const types = (record.trip_types || []).map((t) => clean(t).replace(/_/g, ' ').toLowerCase());
      if (!types.includes(String(category).toLowerCase())) return false;
    }
    return true;
  });
}

export function findDestinationById(id) {
  return destinations.find((record) => String(record.id) === String(id)) || null;
}

export function getAllDestinations() {
  return destinations;
}

export function getFilterOptions() {
  const states = [...new Set(destinations.map((r) => clean(r.state)).filter(Boolean))].sort();
  const counts = {};
  for (const record of destinations) {
    for (const type of record.trip_types || []) {
      const name = clean(type).replace(/_/g, ' ');
      counts[name] = (counts[name] || 0) + 1;
    }
  }
  const categories = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
  return { states, categories };
}

export function getSettings(destinationId) {
  return { ...DEFAULT_SETTINGS, ...(getDb().destinationSettings[String(destinationId)] || {}) };
}

// Admin: update queue settings of one destination
export function updateSettings(destinationId, changes) {
  const errors = {};
  const next = {};
  if (changes.queueOpen !== undefined) {
    if (typeof changes.queueOpen !== 'boolean') errors.queueOpen = 'queueOpen must be true or false.';
    else next.queueOpen = changes.queueOpen;
  }
  if (changes.entryRatePerMinute !== undefined) {
    const rate = Number(changes.entryRatePerMinute);
    if (!Number.isFinite(rate) || rate < 0.1 || rate > 100) errors.entryRatePerMinute = 'Entry rate must be between 0.1 and 100 people per minute.';
    else next.entryRatePerMinute = Math.round(rate * 10) / 10;
  }
  if (changes.notice !== undefined) {
    const notice = String(changes.notice).trim();
    if (notice.length > 200) errors.notice = 'Notice must be at most 200 characters.';
    else next.notice = notice;
  }
  if (Object.keys(errors).length) return { errors };

  return {
    settings: transaction((db) => {
      const key = String(destinationId);
      db.destinationSettings[key] = { ...getSettings(key), ...next, updatedAt: new Date().toISOString() };
      return db.destinationSettings[key];
    }),
  };
}
