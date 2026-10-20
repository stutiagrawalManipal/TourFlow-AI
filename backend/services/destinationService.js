import { readFileSync } from 'fs';

/**
 * Destination service
 * The tourism dataset is static reference data, so it is loaded into
 * memory once when the server starts.
 */
const datasetUrl = new URL('../data/india_tourism_dataset.json', import.meta.url);
const destinations = JSON.parse(readFileSync(datasetUrl, 'utf-8'));

console.log(`Loaded ${destinations.length} destinations from dataset`);

function matchesSearch(record, search) {
  const text = [
    record.destination_name,
    record.state,
    record.district,
    record.region,
    ...record.trip_types,
    ...record.primary_attractions,
  ]
    .join(' ')
    .toLowerCase();
  return text.includes(search.toLowerCase());
}

export function findDestinations({ search, state } = {}) {
  return destinations.filter((record) => {
    if (search && !matchesSearch(record, search)) return false;
    if (state && record.state.toLowerCase() !== state.toLowerCase()) return false;
    return true;
  });
}

export function findDestinationById(id) {
  return destinations.find((record) => String(record.id) === String(id)) || null;
}

export function getAllStates() {
  return [...new Set(destinations.map((record) => record.state))].sort();
}
