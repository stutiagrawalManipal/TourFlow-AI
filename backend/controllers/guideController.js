import { findDestinationById } from '../services/destinationService.js';
import { answerQuestion, SUGGESTED_QUESTIONS } from '../services/guideService.js';

// GET /api/guide/questions
export function suggestedQuestions(req, res) {
  res.json(SUGGESTED_QUESTIONS);
}

// POST /api/guide/ask   { destinationId, question }
export async function ask(req, res) {
  const { destinationId, question } = req.body || {};
  const row = await findDestinationById(destinationId);
  if (!row) return res.status(404).json({ error: 'Please choose a destination first.' });
  if (!question || String(question).length > 300) {
    return res.status(400).json({ error: 'Please ask a question (up to 300 characters).' });
  }
  res.json(await answerQuestion(row, question));
}
