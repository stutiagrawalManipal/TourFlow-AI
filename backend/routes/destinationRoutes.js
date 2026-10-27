import { Router } from 'express';
import { listDestinations, listFilters, getDestination } from '../controllers/destinationController.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', h(listDestinations));        // GET /api/destinations?search=&state=&category=
router.get('/filters', h(listFilters));      // GET /api/destinations/filters
router.get('/:id', h(getDestination));       // GET /api/destinations/:id

export default router;
