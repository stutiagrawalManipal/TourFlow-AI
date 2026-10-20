/**
 * API service - all calls from the frontend to the TourFlow backend.
 * In development, Vite forwards /api/* to http://localhost:5000 (see vite.config.js).
 */

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Could not reach the TourFlow backend. Is it running on port 5000?');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

// The dataset has no photos yet, so generate a simple coloured placeholder
function placeholderImage(destination) {
  const hue = (Number(destination.id) * 47) % 360;
  const name = destination.name.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue},45%,24%)"/>
      <stop offset="1" stop-color="hsl(${(hue + 40) % 360},50%,10%)"/>
    </linearGradient></defs>
    <rect width="800" height="500" fill="url(#g)"/>
    <text x="400" y="240" font-family="sans-serif" font-size="40" font-weight="700"
      fill="rgba(255,255,255,0.35)" text-anchor="middle">${name}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function withImage(destination) {
  return { ...destination, imageUrl: destination.imageUrl || placeholderImage(destination) };
}

export async function fetchDestinations({ search = '', state = '' } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (state) params.set('state', state);
  const destinations = await request(`/api/destinations?${params}`);
  return destinations.map(withImage);
}

export async function fetchDestination(id) {
  return withImage(await request(`/api/destinations/${id}`));
}

export function fetchStates() {
  return request('/api/destinations/states');
}

export function createQueueBooking(destinationId, numberOfPeople) {
  return request('/api/queue', {
    method: 'POST',
    body: JSON.stringify({ destinationId, numberOfPeople }),
  });
}

export function fetchQueueStatus(bookingId) {
  return request(`/api/queue/${bookingId}`);
}
