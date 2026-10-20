import { getDb } from '../db/store.js';
import { BOOKING_STATUS } from '../models/Booking.js';
import { clean } from '../models/Destination.js';
import { getSettings } from './destinationService.js';

/**
 * Crowd service - first version, ESTIMATES ONLY.
 * There are no sensors, cameras or official integrations. We combine:
 *   1. a seasonal estimate from the dataset (peak/off season + popularity score)
 *   2. TourFlow's own queue (people waiting) and measured entry rate (check-ins)
 * Every result says where it came from and when it was last updated.
 */
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const FULL_MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const SEASON_MONTHS = {
  winter: [11, 0, 1],
  summer: [2, 3, 4, 5],
  monsoon: [6, 7, 8],
  'post-monsoon': [9, 10],
  autumn: [9, 10],
  spring: [1, 2],
  christmas: [11],
};
const LEVELS = ['LOW', 'MODERATE', 'HIGH'];
const STALE_AFTER_MINUTES = 120;
const MEASURE_WINDOW_MINUTES = 60;
const MIN_ENTRIES_TO_MEASURE = 5;

function monthIndex(word) {
  const w = word.toLowerCase();
  const full = FULL_MONTHS.indexOf(w);
  if (full >= 0) return full;
  return MONTHS.indexOf(w.slice(0, 3)) >= 0 && (w.length === 3 || w === 'sept') ? MONTHS.indexOf(w.slice(0, 3)) : -1;
}

// "November-March", "Oct–Mar", "Winter months" -> list of month numbers (0-11)
export function parseMonths(text) {
  const value = clean(text).toLowerCase();
  const months = new Set();
  const rangePattern = /([a-z]{3,9})\s*(?:-|–|to)\s*([a-z]{3,9})/g;
  let match;
  while ((match = rangePattern.exec(value))) {
    const start = monthIndex(match[1]);
    const end = monthIndex(match[2]);
    if (start >= 0 && end >= 0) {
      for (let m = start; ; m = (m + 1) % 12) {
        months.add(m);
        if (m === end) break;
      }
    }
  }
  if (months.size === 0) {
    for (const word of value.split(/[^a-z]+/)) {
      if (FULL_MONTHS.includes(word) || MONTHS.includes(word) || word === 'sept') months.add(monthIndex(word));
    }
    for (const [season, list] of Object.entries(SEASON_MONTHS)) {
      if (value.includes(season)) list.forEach((m) => months.add(m));
    }
  }
  return [...months];
}

function currentMonthIST() {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', month: 'numeric' }).format(new Date())) - 1;
}

function seasonalEstimate(record) {
  const month = currentMonthIST();
  const popularity = Number(record.popularity_score) || 5;
  const peak = parseMonths(record.peak_tourist_season);
  const off = parseMonths(record.off_season);

  if (peak.includes(month)) return { level: popularity >= 8 ? 'HIGH' : 'MODERATE', season: 'peak season' };
  if (off.includes(month)) return { level: 'LOW', season: 'off season' };
  if (peak.length || off.length) return { level: popularity >= 9 ? 'MODERATE' : 'LOW', season: 'regular season' };
  return { level: popularity >= 9 ? 'MODERATE' : 'LOW', season: 'season unknown' };
}

function queueLevel(peopleWaiting) {
  if (peopleWaiting >= 40) return 'HIGH';
  if (peopleWaiting >= 15) return 'MODERATE';
  return 'LOW';
}

// People per minute let in recently (from check-in times), or the planning rate
export function getEntryRate(destinationId, bookings = getDb().bookings) {
  const since = Date.now() - MEASURE_WINDOW_MINUTES * 60000;
  const recent = bookings.filter(
    (b) => b.destinationId === String(destinationId) && b.checkedInAt && Date.parse(b.checkedInAt) >= since
  );
  if (recent.length >= MIN_ENTRIES_TO_MEASURE) {
    const people = recent.reduce((sum, b) => sum + b.numberOfPeople, 0);
    return { perMinute: Math.max(people / MEASURE_WINDOW_MINUTES, 0.1), measured: true };
  }
  return { perMinute: getSettings(destinationId).entryRatePerMinute, measured: false };
}

export function estimateWaitMinutes(peopleAhead, entryRate) {
  return Math.ceil(peopleAhead / entryRate.perMinute);
}

export function getCrowdInfo(record) {
  const id = String(record.id);
  const bookings = getDb().bookings.filter((b) => b.destinationId === id);
  const waiting = bookings.filter((b) => b.status === BOOKING_STATUS.WAITING);
  const inside = bookings.filter((b) => b.status === BOOKING_STATUS.CHECKED_IN);
  const peopleWaiting = waiting.reduce((sum, b) => sum + b.numberOfPeople, 0);
  const peopleInside = inside.reduce((sum, b) => sum + b.numberOfPeople, 0);

  const season = seasonalEstimate(record);
  const fromQueue = queueLevel(peopleWaiting);
  const crowdLevel = LEVELS[Math.max(LEVELS.indexOf(season.level), LEVELS.indexOf(fromQueue))];

  const entryRate = getEntryRate(id, bookings);
  const settings = getSettings(id);
  const hourlyCapacity = entryRate.perMinute * 60;

  // last time anything happened in this queue
  const times = bookings.flatMap((b) => [b.createdAt, b.checkedInAt, b.checkedOutAt, b.cancelledAt]).filter(Boolean);
  const lastActivityAt = times.length ? times.sort().at(-1) : null;
  const isStale = !lastActivityAt || Date.now() - Date.parse(lastActivityAt) > STALE_AFTER_MINUTES * 60000;

  return {
    crowdLevel,
    seasonalLevel: season.level,
    season: season.season,
    queueLength: waiting.length,
    peopleWaiting,
    peopleInside,
    estimatedWaitMinutes: estimateWaitMinutes(peopleWaiting, entryRate),
    queueLoadPercent: Math.min(100, Math.round((peopleWaiting / hourlyCapacity) * 100)),
    entryRatePerMinute: Math.round(entryRate.perMinute * 10) / 10,
    entryRateMeasured: entryRate.measured,
    queueOpen: settings.queueOpen,
    notice: settings.notice,
    lastActivityAt,
    isStale,
    calculatedAt: new Date().toISOString(),
    dataSource: 'Estimate: seasonal data from the tourism dataset + TourFlow queue bookings. No live sensors.',
  };
}
