import { findDestinations, findDestinationById, getFilterOptions } from '../services/destinationService.js';
import { getCrowdInfo } from '../services/crowdService.js';
import { toDestinationSummary, toDestinationDetails } from '../models/Destination.js';

// GET /api/destinations?search=&state=&category=
export function listDestinations(req, res) {
  const { search, state, category } = req.query;
  const result = findDestinations({ search, state, category }).map((record) =>
    toDestinationSummary(record, { crowd: getCrowdInfo(record) })
  );
  res.json(result);
}

// GET /api/destinations/filters
export function listFilters(req, res) {
  res.json(getFilterOptions());
}

// GET /api/destinations/:id
export function getDestination(req, res) {
  const record = findDestinationById(req.params.id);
  if (!record) return res.status(404).json({ error: `Destination ${req.params.id} was not found.` });
  res.json(toDestinationDetails(record, { crowd: getCrowdInfo(record) }));
}
