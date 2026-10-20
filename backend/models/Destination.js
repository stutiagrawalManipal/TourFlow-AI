/**
 * Destination model
 * Converts a raw record from india_tourism_dataset.json into the shape
 * the frontend uses. The dataset itself is never modified.
 */

function formatCoordinates(coords) {
  if (!coords) return '';
  const lat = coords.latitude;
  const lng = coords.longitude;
  return `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(2)}° ${lng >= 0 ? 'E' : 'W'}`;
}

function formatTripType(type) {
  return type.replace(/_/g, ' ');
}

// Fields needed for destination cards and lists
export function toDestinationSummary(record, queueStats, crowd) {
  return {
    id: record.id,
    name: record.destination_name,
    state: record.state,
    district: record.district,
    region: record.region,
    location: `${record.district}, ${record.state}`,
    coordinates: formatCoordinates(record.coordinates),
    category: formatTripType(record.trip_types[0] || 'General'),
    tripTypes: record.trip_types.map(formatTripType),
    shortDescription: record.unique_experiences,
    imageUrl: null, // dataset has no images yet
    popularityScore: record.popularity_score,
    safetyRating: record.safety_rating,

    // Crowd values are DEMO values (see crowdService.js)
    crowdLevel: crowd.crowdLevel,
    crowdPercent: crowd.crowdPercent,
    isCrowdDemo: true,

    // Queue values come from real bookings in the queue
    currentQueue: queueStats.peopleWaiting,
    bookingsWaiting: queueStats.bookingsWaiting,
    currentTicketNumber: queueStats.nextQueueNumber,
    estimatedWait: `${queueStats.estimatedWaitMinutes} min`,
    queueCapacity: queueStats.queueCapacity,
    bookingsToday: queueStats.bookingsToday,
  };
}

// Full information for the destination details page
export function toDestinationDetails(record, queueStats, crowd) {
  return {
    ...toDestinationSummary(record, queueStats, crowd),
    fullDescription: record.user_reviews_summary,
    localCulture: record.local_culture,
    highlights: record.primary_attractions,
    hiddenGems: record.hidden_gems,
    activities: record.activities_available,
    bestSeasons: record.best_seasons,
    avoidSeasons: record.avoid_seasons,
    peakSeason: record.peak_tourist_season,
    offSeason: record.off_season,
    idealDays: record.ideal_days,
    minimumDays: record.minimum_days,
    maximumDays: record.maximum_days,
    itinerary: record.suggested_itinerary
      .split(';')
      .map((day) => day.trim())
      .filter(Boolean),
    safetyNotes: record.safety_notes,
    specialConsiderations: record.special_considerations,
    localCustoms: record.local_customs,
    localCuisine: record.local_cuisine_must_try,
    festivals: record.festivals_events,
    languages: record.language_spoken,
    permitsRequired: record.permits_required,
    permitsDetails: record.permits_details,
    nearestAirport: record.nearest_airport,
    nearestRailwayStation: record.nearest_railway_station,
    lastUpdated: record.last_updated,
  };
}
