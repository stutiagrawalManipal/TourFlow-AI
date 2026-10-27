import { findDestinations, findDestinationById, getFilterOptions } from '../services/destinationService.js';
import { getQueueStats, getCrowdInfo } from '../services/crowdService.js';
import { toDestinationSummary, toDestinationDetails } from '../models/Destination.js';

// GET /api/destinations?search=&state=&category=
export async function listDestinations(req, res) {
  const { search, state, category } = req.query;
  const [rows, stats] = await Promise.all([findDestinations({ search, state, category }), getQueueStats()]);
  res.json(rows.map((row) => toDestinationSummary(row, { crowd: getCrowdInfo(row, stats.get(row.id)) })));
}

// GET /api/destinations/filters
export async function listFilters(req, res) {
  res.json(await getFilterOptions());
}

// GET /api/destinations/:id
export async function getDestination(req, res) {
  const row = await findDestinationById(req.params.id);
  if (!row) return res.status(404).json({ error: `Destination ${req.params.id} was not found.` });
  const stats = await getQueueStats([row.id]);
  res.json(toDestinationDetails(row, { crowd: getCrowdInfo(row, stats.get(row.id)) }));
}
