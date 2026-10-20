import { Router } from 'express';
import { suggestedQuestions, ask } from '../controllers/guideController.js';

const router = Router();

router.get('/questions', suggestedQuestions);
router.post('/ask', ask);

export default router;
