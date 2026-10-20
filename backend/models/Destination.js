/**
 * Destination model
 * Converts a raw record from india_tourism_dataset.json into the shape the
 * frontend uses. Missing fields fall back to empty values instead of crashing.
 */

// Some dataset strings contain citation tags like "[web:274]" - remove them
export function clean(text) {
  return typeof text === 'string' ? text.replace(/\s*\[web:\d+\]/g, '').trim() : '';
}

const list = (value) => (Array.isArray(value) ? value.map(clean).filter(Boolean) : []);
const formatType = (type) => clean(type).replace(/_/g, ' ');

function formatCoordinates(coords) {
  if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') return '';
  const { latitude: lat, longitude: lng } = coords;
  return `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(2)}° ${lng >= 0 ? 'E' : 'W'}`;
}

function formatPlace(place) {
  return place && place.name ? `${clean(place.name)}${place.distance_km ? ` (${place.distance_km} km)` : ''}` : '';
}

function formatBudget(category) {
  if (!category || !Array.isArray(category.accommodation_range)) return null;
  const range = (r) => (Array.isArray(r) && r.length === 2 ? `₹${r[0]}–₹${r[1]}` : '');
  return {
    accommodation: range(category.accommodation_range),
    food: range(category.food_range),
    activities: range(category.activities_range),
  };
}

// Fields for cards and lists
export function toDestinationSummary(record, extra = {}) {
  const tripTypes = list(record.trip_types).map(formatType);
  const location = [clean(record.district), clean(record.state)].filter(Boolean).join(', ');
  return {
    id: String(record.id),
    name: clean(record.destination_name) || `Destination ${record.id}`,
    state: clean(record.state),
    district: clean(record.district),
    region: clean(record.region),
    location: location || clean(record.state) || 'India',
    coordinates: formatCoordinates(record.coordinates),
    category: tripTypes[0] || 'General',
    tripTypes,
    shortDescription: clean(record.unique_experiences) || clean(record.user_reviews_summary) || 'No description available yet.',
    imageUrl: null, // the dataset has no photos
    popularityScore: Number(record.popularity_score) || null,
    safetyRating: Number(record.safety_rating) || null,
    bestSeasons: list(record.best_seasons),
    peakSeason: clean(record.peak_tourist_season),
    ...extra,
  };
}

// Full information for the details page
export function toDestinationDetails(record, extra = {}) {
  return {
    ...toDestinationSummary(record, extra),
    reviewSummary: clean(record.user_reviews_summary),
    localCulture: clean(record.local_culture),
    attractions: list(record.primary_attractions),
    hiddenGems: list(record.hidden_gems),
    activities: list(record.activities_available),
    avoidSeasons: list(record.avoid_seasons),
    offSeason: clean(record.off_season),
    averageTemperature: record.average_temperature || null,
    idealFor: list(record.ideal_for).map(formatType),
    days: {
      minimum: record.minimum_days ?? null,
      ideal: record.ideal_days ?? null,
      maximum: record.maximum_days ?? null,
    },
    itinerary: clean(record.suggested_itinerary).split(';').map((d) => d.trim()).filter(Boolean),
    safetyNotes: clean(record.safety_notes),
    specialConsiderations: clean(record.special_considerations),
    localCustoms: clean(record.local_customs),
    localCuisine: list(record.local_cuisine_must_try),
    festivals: clean(record.festivals_events),
    shopping: list(record.shopping_highlights),
    languages: list(record.language_spoken),
    permitsRequired: Boolean(record.permits_required),
    permitsDetails: clean(record.permits_details),
    nearestAirport: formatPlace(record.nearest_airport),
    nearestRailwayStation: formatPlace(record.nearest_railway_station),
    nearestMajorCity: formatPlace(record.nearest_major_city),
    accommodationTypes: list(record.accommodation_types),
    budget: {
      budget: formatBudget(record.budget_category),
      midRange: formatBudget(record.mid_range_category),
      luxury: formatBudget(record.luxury_category),
    },
    lastDatasetUpdate: clean(record.last_updated),
  };
}
