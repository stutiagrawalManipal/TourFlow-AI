import { Router } from 'express';
import { suggestedQuestions, ask } from '../controllers/guideController.js';
import { rateLimit } from '../middleware/security.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';

const router = Router();
const guideLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });

router.get('/questions', suggestedQuestions);
router.post('/ask', guideLimiter, h(ask));

export default router;
