/**
 * Destination model
 * A destination row has three parts:
 *   dataset - the original record from india_tourism_dataset.json (read-only)
 *   content - information added by admins (history, opening hours, fees, FAQs ...)
 *   images  - photographs with alt text and licence/credit information
 * Missing fields fall back to empty values (and the UI shows "not available yet").
 */

// Some dataset strings contain citation tags like "[web:274]" - remove them
export function clean(text) {
  return typeof text === 'string' ? text.replace(/\s*\[web:\d+\]/g, '').trim() : '';
}

const list = (value) => (Array.isArray(value) ? value.map(clean).filter(Boolean) : []);
const formatType = (type) => clean(type).replace(/_/g, ' ');
const iso = (v) => (v ? new Date(v).toISOString() : null);

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

export function destinationName(dataset, id) {
  return clean(dataset?.destination_name) || `Destination ${id}`;
}

export function destinationLocation(dataset) {
  return [clean(dataset?.district), clean(dataset?.state)].filter(Boolean).join(', ') || clean(dataset?.state) || 'India';
}

// Images are stored as entered by the admin / import script
function publicImages(images, name) {
  return (Array.isArray(images) ? images : []).map((img) => ({
    url: img.url,
    srcset: Array.isArray(img.srcset) ? img.srcset : [],
    width: img.width || null,
    height: img.height || null,
    alt: img.alt || `Photograph of ${name}`,
    credit: img.credit || '',
    license: img.license || '',
    licenseUrl: img.licenseUrl || '',
    sourceUrl: img.sourceUrl || '',
  }));
}

// Fields for cards and lists
export function toDestinationSummary(row, extra = {}) {
  const record = row.dataset || {};
  const name = destinationName(record, row.id);
  const tripTypes = list(record.trip_types).map(formatType);
  const images = publicImages(row.images, name);
  return {
    id: String(row.id),
    name,
    state: clean(record.state),
    district: clean(record.district),
    region: clean(record.region),
    location: destinationLocation(record),
    coordinates: formatCoordinates(record.coordinates),
    category: tripTypes[0] || 'General',
    tripTypes,
    shortDescription: clean(record.unique_experiences) || clean(record.user_reviews_summary) || 'No description available yet.',
    image: images[0] || null, // main photograph (null = show placeholder)
    imageCount: images.length,
    popularityScore: Number(record.popularity_score) || null,
    safetyRating: Number(record.safety_rating) || null,
    accessLevel: clean(record.accessibility) || null,
    bestSeasons: list(record.best_seasons),
    peakSeason: clean(record.peak_tourist_season),
    ...extra,
  };
}

// FAQs built only from dataset fields (each answer is a dataset fact)
function datasetFaqs(record, name) {
  const faqs = [];
  const add = (question, answer) => answer && faqs.push({ question, answer, source: 'dataset' });
  const seasons = list(record.best_seasons);
  add(
    `When is the best time to visit ${name}?`,
    seasons.length
      ? `Best seasons: ${seasons.join(', ')}.${clean(record.peak_tourist_season) ? ` Peak season: ${clean(record.peak_tourist_season)}.` : ''}${clean(record.off_season) ? ` Off season: ${clean(record.off_season)}.` : ''}`
      : ''
  );
  add('Do I need a permit?', record.permits_required === undefined ? '' : record.permits_required ? `Yes. ${clean(record.permits_details)}` : clean(record.permits_details) || 'No special permit is listed.');
  const reach = [formatPlace(record.nearest_airport) && `Nearest airport: ${formatPlace(record.nearest_airport)}.`, formatPlace(record.nearest_railway_station) && `Nearest railway station: ${formatPlace(record.nearest_railway_station)}.`]
    .filter(Boolean)
    .join(' ');
  add('How do I get there?', reach);
  add('How many days should I plan?', record.ideal_days ? `About ${record.ideal_days} days (minimum ${record.minimum_days}, up to ${record.maximum_days}).` : '');
  add('Is it safe for tourists?', clean(record.safety_notes));
  add('Are there ATMs and mobile network?', [clean(record.atm_availability), clean(record.internet_connectivity)].filter(Boolean).join(' '));
  return faqs;
}

// An admin "verified" fact (opening hours / entry fees). Unverified text is never shown to tourists.
function verifiedFact(fact) {
  if (!fact || !fact.verified || !fact.text) return { available: false };
  return { available: true, text: fact.text, sourceUrl: fact.sourceUrl || '', verifiedAt: fact.verifiedAt || null };
}

// Full information for the details page
export function toDestinationDetails(row, extra = {}) {
  const record = row.dataset || {};
  const content = row.content || {};
  const summary = toDestinationSummary(row, extra);
  const name = summary.name;

  return {
    ...summary,
    images: publicImages(row.images, name),
    reviewSummary: clean(record.user_reviews_summary),
    localCulture: clean(record.local_culture),
    attractions: list(record.primary_attractions),
    hiddenGems: list(record.hidden_gems),
    activities: list(record.activities_available),
    avoidSeasons: list(record.avoid_seasons),
    offSeason: clean(record.off_season),
    averageTemperature: record.average_temperature || null,
    idealFor: list(record.ideal_for).map(formatType),
    days: { minimum: record.minimum_days ?? null, ideal: record.ideal_days ?? null, maximum: record.maximum_days ?? null },
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
    roadConnectivity: clean(record.road_connectivity),
    accommodationTypes: list(record.accommodation_types),
    budget: {
      budget: formatBudget(record.budget_category),
      midRange: formatBudget(record.mid_range_category),
      luxury: formatBudget(record.luxury_category),
    },
    lastDatasetUpdate: clean(record.last_updated),

    // Admin-maintained information (null = not available yet)
    info: {
      historicalBackground: content.historicalBackground || null,
      significance: content.significance || null,
      visitorGuidelines: content.visitorGuidelines || null,
      accessibilityNotes: content.accessibilityNotes || null,
      visitDuration: content.visitDuration || null,
      guideInfo: content.guideInfo || null,
      openingHours: verifiedFact(content.openingHours),
      entryFees: verifiedFact(content.entryFees),
      updatedAt: iso(row.content_updated_at),
    },
    faqs: [...(Array.isArray(content.faqs) ? content.faqs.map((f) => ({ ...f, source: 'admin' })) : []), ...datasetFaqs(record, name)],
  };
}

// Admin view: the raw editable content (including unverified drafts)
export function toAdminContent(row) {
  return {
    id: String(row.id),
    name: destinationName(row.dataset, row.id),
    content: row.content || {},
    images: Array.isArray(row.images) ? row.images : [],
    contentUpdatedAt: iso(row.content_updated_at),
    contentUpdatedBy: row.content_updated_by || null,
  };
}
