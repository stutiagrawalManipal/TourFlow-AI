import { Router } from 'express';
import { listDestinations, listStates, getDestination } from '../controllers/destinationController.js';

const router = Router();

router.get('/', listDestinations);        // GET /api/destinations?search=&state=
router.get('/states', listStates);        // GET /api/destinations/states
router.get('/:id', getDestination);       // GET /api/destinations/:id

export default router;
