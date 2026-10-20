import { Router } from 'express';
import { joinQueue, getQueueStatus } from '../controllers/queueController.js';

const router = Router();

router.post('/', joinQueue);               // POST /api/queue
router.get('/:bookingId', getQueueStatus); // GET /api/queue/:bookingId

export default router;
