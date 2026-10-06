import { findDestinations, findDestinationById, getAllStates } from '../services/destinationService.js';
import { getQueueStats } from '../services/queueService.js';
import { getDemoCrowd } from '../services/crowdService.js';
import { toDestinationSummary, toDestinationDetails } from '../models/Destination.js';

// GET /api/destinations?search=jaipur&state=Rajasthan
export function listDestinations(req, res) {
  const { search, state } = req.query;
  const records = findDestinations({ search, state });

  const destinations = records.map((record) =>
    toDestinationSummary(record, getQueueStats(record.id), getDemoCrowd(record.popularity_score))
  );
  res.json(destinations);
}

// GET /api/destinations/states
export function listStates(req, res) {
  res.json(getAllStates());
}

// GET /api/destinations/:id
export function getDestination(req, res) {
  const record = findDestinationById(req.params.id);
  if (!record) {
    return res.status(404).json({ error: `Destination ${req.params.id} not found` });
  }
  res.json(toDestinationDetails(record, getQueueStats(record.id), getDemoCrowd(record.popularity_score)));
}
