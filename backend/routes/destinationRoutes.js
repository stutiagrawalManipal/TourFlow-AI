import { Router } from 'express';
import { listDestinations, listFilters, getDestination } from '../controllers/destinationController.js';

const router = Router();

router.get('/', listDestinations);        // GET /api/destinations?search=&state=&category=
router.get('/filters', listFilters);      // GET /api/destinations/filters
router.get('/:id', getDestination);       // GET /api/destinations/:id

export default router;
