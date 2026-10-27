import { toDestinationDetails } from '../models/Destination.js';
import { getCrowdInfoFor } from './crowdService.js';

/**
 * Tourist guide - answers questions using ONLY the tourism dataset and the
 * TourFlow queue. No external AI service is used, so it runs offline and free.
 * Each topic is matched by keywords; unknown questions get an honest reply.
 */
const join = (items) => (items && items.length ? items.join(', ') : '');

const notAvailable = (d, what) =>
  `${what} for ${d.name} have not been verified by TourFlow staff yet. Please check the official website or local notice before you go.`;

const TOPICS = [
  {
    key: 'openingHours',
    words: ['opening', 'open', 'close', 'closing', 'timing', 'hours'],
    answer: (d) => (d.info.openingHours.available ? `Opening hours (verified): ${d.info.openingHours.text}` : notAvailable(d, 'Opening hours')),
  },
  {
    key: 'entryFees',
    words: ['entry fee', 'entrance fee', 'ticket', 'fee', 'admission'],
    answer: (d) => (d.info.entryFees.available ? `Entry fees (verified): ${d.info.entryFees.text}` : notAvailable(d, 'Entry fees')),
  },
  {
    key: 'history',
    words: ['history', 'historical', 'built', 'significance', 'religious', 'heritage'],
    answer: (d) =>
      [d.info.historicalBackground, d.info.significance].filter(Boolean).join(' ') ||
      `TourFlow does not have historical background for ${d.name} yet. ${d.localCulture || ''}`.trim(),
  },
  {
    key: 'accessibility',
    words: ['wheelchair', 'accessib', 'disabled', 'elderly access', 'stairs'],
    answer: (d) =>
      [d.accessLevel && `Overall access level (dataset): ${d.accessLevel}.`, d.info.accessibilityNotes].filter(Boolean).join(' ') ||
      `There is no accessibility information for ${d.name} yet.`,
  },
  {
    key: 'crowd',
    words: ['crowd', 'queue', 'wait', 'busy', 'rush'],
    answer: (d, crowd) =>
      `Estimated crowd level: ${crowd.crowdLevel} (${crowd.season}). ${crowd.peopleWaiting} people are waiting in the TourFlow queue, ` +
      `so a new booking would wait about ${crowd.estimatedWaitMinutes} min. This is an estimate, not a live sensor reading.`,
  },
  {
    key: 'season',
    words: ['best time', 'season', 'when to', 'when should', 'month', 'weather', 'temperature', 'climate'],
    answer: (d) => {
      const temp = d.averageTemperature
        ? ' Average temperatures: ' + Object.entries(d.averageTemperature).map(([k, v]) => `${k} ${v}`).join(', ') + '.'
        : '';
      return `Best seasons: ${join(d.bestSeasons) || 'not listed'}. Peak season: ${d.peakSeason || 'not listed'}. Off season: ${d.offSeason || 'not listed'}.` +
        (d.avoidSeasons.length ? ` Avoid: ${join(d.avoidSeasons)}.` : '') + temp;
    },
  },
  { key: 'about', words: ['tell me about', 'about this', 'about the place', 'describe', 'overview', 'known for', 'famous for', 'why visit', 'why go'], answer: (d) => [d.shortDescription, d.reviewSummary].filter(Boolean).join('. ') },
  { key: 'attractions', words: ['attraction', 'see', 'visit', 'places', 'sightseeing', 'famous', 'must'], answer: (d) => d.attractions.length && `Main attractions: ${join(d.attractions)}.` },
  { key: 'hidden', words: ['hidden', 'offbeat', 'less crowded', 'secret', 'quiet'], answer: (d) => d.hiddenGems.length && `Hidden gems: ${join(d.hiddenGems)}.` },
  { key: 'activities', words: ['activit', 'do there', 'things to do', 'adventure', 'experience'], answer: (d) => d.activities.length && `Things to do: ${join(d.activities)}.` },
  {
    key: 'itinerary',
    words: ['itinerary', 'plan', 'how many days', 'days', 'how long', 'schedule'],
    answer: (d) => {
      const days = d.days.ideal ? `Ideal stay: ${d.days.ideal} days (minimum ${d.days.minimum}, up to ${d.days.maximum}). ` : '';
      return (days + (d.itinerary.length ? `Suggested plan: ${d.itinerary.join('; ')}.` : '')).trim();
    },
  },
  {
    key: 'budget',
    words: ['budget', 'cost', 'price', 'expensive', 'cheap', 'money', 'spend'],
    answer: (d) => {
      const b = d.budget.budget;
      const m = d.budget.midRange;
      if (!b) return '';
      return `Approximate daily costs from the dataset - Budget: stay ${b.accommodation}, food ${b.food}. ` +
        (m ? `Mid-range: stay ${m.accommodation}, food ${m.food}.` : '');
    },
  },
  { key: 'safety', words: ['safe', 'safety', 'scam', 'danger', 'tout', 'women'], answer: (d) => [d.safetyNotes, d.specialConsiderations].filter(Boolean).join(' ') },
  {
    key: 'permits',
    words: ['permit', 'pass required', 'entry permit', 'ilp', 'documents'],
    answer: (d) => (d.permitsRequired ? `Permits are required: ${d.permitsDetails}` : `No special permit is listed (${d.permitsDetails || 'not required'}).`),
  },
  { key: 'food', words: ['food', 'eat', 'cuisine', 'dish', 'restaurant'], answer: (d) => d.localCuisine.length && `Must-try food: ${join(d.localCuisine)}.` },
  { key: 'festivals', words: ['festival', 'event', 'celebration', 'fair'], answer: (d) => d.festivals && `Festivals and events: ${d.festivals}` },
  { key: 'shopping', words: ['shop', 'buy', 'souvenir', 'market'], answer: (d) => d.shopping.length && `Shopping highlights: ${join(d.shopping)}.` },
  {
    key: 'transport',
    words: ['reach', 'airport', 'train', 'railway', 'station', 'travel to', 'get there', 'nearest'],
    answer: (d) =>
      [d.nearestAirport && `Nearest airport: ${d.nearestAirport}.`, d.nearestRailwayStation && `Nearest railway station: ${d.nearestRailwayStation}.`, d.nearestMajorCity && `Nearest major city: ${d.nearestMajorCity}.`]
        .filter(Boolean)
        .join(' '),
  },
  { key: 'customs', words: ['custom', 'dress', 'etiquette', 'culture', 'tradition', 'respect'], answer: (d) => [d.localCustoms, d.localCulture].filter(Boolean).join(' ') },
  { key: 'language', words: ['language', 'speak'], answer: (d) => d.languages.length && `Languages spoken: ${join(d.languages)}.` },
  { key: 'stay', words: ['stay', 'hotel', 'accommodation', 'hostel', 'homestay'], answer: (d) => d.accommodationTypes.length && `Accommodation types: ${join(d.accommodationTypes)}.` },
  { key: 'idealFor', words: ['family', 'kids', 'couple', 'solo', 'friends', 'elderly', 'suitable'], answer: (d) => d.idealFor.length && `Good for: ${join(d.idealFor)}.` },
];

export const SUGGESTED_QUESTIONS = [
  'What are the main attractions?',
  'What are the opening hours?',
  'Is there an entry fee?',
  'When is the best time to visit?',
  'How crowded is it right now?',
  'How many days should I plan?',
  'Is it safe? Any tips?',
  'How do I get there?',
  'What food should I try?',
  'Do I need a permit?',
];

export async function answerQuestion(row, question) {
  const q = String(question || '').toLowerCase().trim();
  const destination = toDestinationDetails(row);
  if (!q) return { answer: 'Please type a question.', topic: null, source: 'none' };

  // keywords must start at a word boundary ("eat" matches "eat"/"eating", not "great")
  const matches = (word) => new RegExp(`\\b${word}`).test(q);
  const topic = TOPICS.find((t) => t.words.some(matches));
  if (topic) {
    const crowd = topic.key === 'crowd' ? await getCrowdInfoFor(row) : null;
    const answer = topic.answer(destination, crowd);
    const source = topic.key === 'crowd' ? 'estimate' : ['openingHours', 'entryFees', 'history', 'accessibility'].includes(topic.key) ? 'tourflow' : 'dataset';
    if (answer) return { answer, topic: topic.key, source };
    return {
      answer: `The TourFlow dataset does not have that information for ${destination.name}.`,
      topic: topic.key,
      source: 'none',
    };
  }

  return {
    answer:
      `I can only answer from the TourFlow dataset, and I could not match that question for ${destination.name}. ` +
      'Try asking about attractions, best time to visit, opening hours, entry fees, history, crowd, itinerary, budget, safety, permits, food, festivals, transport, accessibility or local customs.',
    topic: null,
    source: 'none',
  };
}
