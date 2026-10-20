/**
 * TourFlow AI - filter and sort options for the destinations page.
 * (Destination data comes from the backend: GET /api/destinations)
 */

export const CROWD_FILTERS = [
  { label: 'All', value: 'All' },
  { label: 'Low', value: 'LOW' },
  { label: 'Moderate', value: 'MODERATE' },
  { label: 'High', value: 'HIGH' },
];

export const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'recommended' },
  { label: 'Name (A-Z)', value: 'name' },
  { label: 'Shortest Wait', value: 'wait-asc' },
  { label: 'Least Crowded', value: 'crowd-asc' },
];
