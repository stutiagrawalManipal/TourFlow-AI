/**
 * API service - every call from the frontend to the TourFlow backend.
 * In development, Vite forwards /api/* to the backend (see vite.config.js).
 * The login token is kept in localStorage and sent as "Authorization: Bearer".
 */
const TOKEN_KEY = 'tourflow_token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage blocked - login only lasts for this page load
  }
};

async function request(url, { method = 'GET', body } = {}) {
  const token = getToken();
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error('Cannot reach the TourFlow server. Make sure the backend is running (see README).');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`);
    error.status = response.status;
    error.fields = data.fields;
    error.data = data;
    throw error;
  }
  return data;
}

// The dataset has no photos, so cards use a coloured placeholder with the name
export function placeholderImage(destination) {
  const hue = (Number(destination.id) * 47) % 360 || 200;
  const name = String(destination.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const fontSize = Math.min(36, Math.floor(1300 / Math.max(name.length, 1)));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue},45%,24%)"/>
      <stop offset="1" stop-color="hsl(${(hue + 40) % 360},50%,10%)"/>
    </linearGradient></defs>
    <rect width="800" height="500" fill="url(#g)"/>
    <text x="400" y="260" font-family="sans-serif" font-size="${fontSize}" font-weight="700"
      fill="rgba(255,255,255,0.35)" text-anchor="middle">${name}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const withImage = (destination) => ({ ...destination, imageUrl: destination.imageUrl || placeholderImage(destination) });

// ---------- Auth ----------
export const registerUser = (data) => request('/api/auth/register', { method: 'POST', body: data });
export const loginTourist = (data) => request('/api/auth/login', { method: 'POST', body: data });
export const loginAdmin = (data) => request('/api/auth/admin/login', { method: 'POST', body: data });
export const fetchMe = () => request('/api/auth/me');
export const logoutUser = () => request('/api/auth/logout', { method: 'POST' });

// ---------- Destinations ----------
export async function fetchDestinations({ search = '', state = '', category = '' } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (state) params.set('state', state);
  if (category) params.set('category', category);
  return (await request(`/api/destinations?${params}`)).map(withImage);
}
export const fetchFilters = () => request('/api/destinations/filters');
export const fetchDestination = async (id) => withImage(await request(`/api/destinations/${id}`));

// ---------- Queue (tourist) ----------
export const createQueueBooking = ({ destinationId, numberOfPeople, requestId }) =>
  request('/api/queue', { method: 'POST', body: { destinationId, numberOfPeople, requestId } });
export const fetchMyBookings = () => request('/api/queue/mine');
export const fetchBooking = (bookingId) => request(`/api/queue/${bookingId}`);
export const cancelQueueBooking = (bookingId) => request(`/api/queue/${bookingId}`, { method: 'DELETE' });

// ---------- Guide ----------
export const fetchGuideQuestions = () => request('/api/guide/questions');
export const askGuide = (destinationId, question) => request('/api/guide/ask', { method: 'POST', body: { destinationId, question } });

// ---------- Admin ----------
export const fetchAdminStats = () => request('/api/admin/stats');
export const fetchAdminBookings = ({ search = '', status = '', destinationId = '' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  if (destinationId) params.set('destinationId', destinationId);
  return request(`/api/admin/bookings?${params}`);
};
export const lookupBooking = (code) => request(`/api/admin/bookings/lookup/${encodeURIComponent(code)}`);
export const updateBookingStatus = (bookingId, action) => request(`/api/admin/bookings/${bookingId}/${action}`, { method: 'POST' });
export const fetchAdminQueue = (destinationId) => request(`/api/admin/queue/${destinationId}`);
export const fetchCrowdOverview = () => request('/api/admin/crowd');
export const updateDestinationSettings = (destinationId, settings) =>
  request(`/api/admin/destinations/${destinationId}/settings`, { method: 'PATCH', body: settings });

// Unique id for one booking attempt (stops double submissions creating 2 bookings)
export function newRequestId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
