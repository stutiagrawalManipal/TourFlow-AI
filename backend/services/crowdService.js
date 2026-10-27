import { query } from '../db/pool.js';
import { clean } from '../models/Destination.js';

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

const EMPTY_STATS = { peopleWaiting: 0, groupsWaiting: 0, peopleInside: 0, recentEntries: 0, recentPeopleEntered: 0, lastActivityAt: null };

/**
 * Queue numbers for many destinations in ONE query.
 * Returns Map(destinationId -> stats). `client` lets callers read inside a transaction.
 */
export async function getQueueStats(destinationIds = null, client = null) {
  const run = client ? client.query.bind(client) : query;
  const params = [MEASURE_WINDOW_MINUTES];
  let filter = '';
  if (destinationIds) {
    params.push(destinationIds.map(String));
    filter = 'WHERE destination_id = ANY($2::text[])';
  }
  const { rows } = await run(
    `SELECT destination_id,
       COALESCE(SUM(number_of_people) FILTER (WHERE status = 'WAITING'), 0)::int AS people_waiting,
       COUNT(*) FILTER (WHERE status = 'WAITING')::int AS groups_waiting,
       COALESCE(SUM(number_of_people) FILTER (WHERE status = 'CHECKED_IN'), 0)::int AS people_inside,
       COUNT(*) FILTER (WHERE checked_in_at > now() - make_interval(mins => $1))::int AS recent_entries,
       COALESCE(SUM(number_of_people) FILTER (WHERE checked_in_at > now() - make_interval(mins => $1)), 0)::int AS recent_people,
       MAX(GREATEST(created_at, checked_in_at, checked_out_at, cancelled_at)) AS last_activity
     FROM bookings ${filter}
     GROUP BY destination_id`,
    params
  );
  return new Map(
    rows.map((r) => [
      r.destination_id,
      {
        peopleWaiting: r.people_waiting,
        groupsWaiting: r.groups_waiting,
        peopleInside: r.people_inside,
        recentEntries: r.recent_entries,
        recentPeopleEntered: r.recent_people,
        lastActivityAt: r.last_activity ? new Date(r.last_activity).toISOString() : null,
      },
    ])
  );
}

// People per minute let in recently (from check-ins), or the admin's planning rate
export function entryRate(row, stats) {
  if (stats.recentEntries >= MIN_ENTRIES_TO_MEASURE) {
    return { perMinute: Math.max(stats.recentPeopleEntered / MEASURE_WINDOW_MINUTES, 0.1), measured: true };
  }
  return { perMinute: Number(row.entry_rate_per_minute) || 2, measured: false };
}

export const estimateWaitMinutes = (peopleAhead, rate) => Math.ceil(peopleAhead / rate.perMinute);

// Crowd estimate for one destination row (stats from getQueueStats)
export function getCrowdInfo(row, stats = EMPTY_STATS) {
  const s = stats || EMPTY_STATS;
  const season = seasonalEstimate(row.dataset || {});
  const fromQueue = queueLevel(s.peopleWaiting);
  const crowdLevel = LEVELS[Math.max(LEVELS.indexOf(season.level), LEVELS.indexOf(fromQueue))];
  const rate = entryRate(row, s);
  const maxQueuePeople = Number(row.max_queue_people);
  const isStale = !s.lastActivityAt || Date.now() - Date.parse(s.lastActivityAt) > STALE_AFTER_MINUTES * 60000;

  return {
    crowdLevel,
    seasonalLevel: season.level,
    season: season.season,
    queueLength: s.groupsWaiting,
    peopleWaiting: s.peopleWaiting,
    peopleInside: s.peopleInside,
    estimatedWaitMinutes: estimateWaitMinutes(s.peopleWaiting, rate),
    queueLoadPercent: Math.min(100, Math.round((s.peopleWaiting / (rate.perMinute * 60)) * 100)),
    entryRatePerMinute: Math.round(rate.perMinute * 10) / 10,
    entryRateMeasured: rate.measured,
    queueOpen: row.queue_open,
    maxQueuePeople,
    placesLeft: Math.max(0, maxQueuePeople - s.peopleWaiting),
    isFull: s.peopleWaiting >= maxQueuePeople,
    notice: row.notice,
    lastActivityAt: s.lastActivityAt,
    isStale,
    calculatedAt: new Date().toISOString(),
    dataSource: 'Estimate: seasonal data from the tourism dataset + TourFlow queue bookings. No live sensors.',
  };
}

// Convenience: crowd info for one destination
export async function getCrowdInfoFor(row) {
  const stats = await getQueueStats([row.id]);
  return getCrowdInfo(row, stats.get(String(row.id)));
}
