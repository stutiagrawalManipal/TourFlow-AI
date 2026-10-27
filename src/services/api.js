/**
 /**
 * API service - every call from the frontend to the TourFlow backend.
 *
 * Development:
 * Vite forwards /api/* requests to the local backend.
 *
 * Production:
 * Requests go to the deployed Render backend.
 *
 * Login sessions use HttpOnly cookies. Every request sends
 * X-Requested-With: TourFlow for CSRF protection.
 */

const API_BASE_URL = import.meta.env.PROD
  ? 'https://tourflow-ai-backend-g6rh.onrender.com'
  : '';

async function request(url, { method = 'GET', body } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${url}`, {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'TourFlow',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error(
      'Cannot reach the TourFlow server. Please check your internet connection and backend deployment.'
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.error || `Request failed (${response.status})`
    );

    error.status = response.status;
    error.fields = data.fields;
    error.code = data.code;
    error.data = data;

    throw error;
  }

  return data;
}

// ---------- Auth & account ----------

export const registerUser = (data) =>
  request('/api/auth/register', {
    method: 'POST',
    body: data,
  });

export const loginTourist = (data) =>
  request('/api/auth/login', {
    method: 'POST',
    body: data,
  });

export const loginAdmin = (data) =>
  request('/api/auth/admin/login', {
    method: 'POST',
    body: data,
  });

export const fetchMe = () =>
  request('/api/auth/me');

export const logoutUser = () =>
  request('/api/auth/logout', {
    method: 'POST',
  });

export const updateProfile = (name) =>
  request('/api/auth/me', {
    method: 'PATCH',
    body: { name },
  });

export const changePassword = (currentPassword, newPassword) =>
  request('/api/auth/change-password', {
    method: 'POST',
    body: { currentPassword, newPassword },
  });

// ---------- Destinations ----------

export async function fetchDestinations({
  search = '',
  state = '',
  category = '',
} = {}) {
  const params = new URLSearchParams();

  if (search) params.set('search', search);
  if (state) params.set('state', state);
  if (category) params.set('category', category);

  return request(`/api/destinations?${params.toString()}`);
}

export const fetchFilters = () =>
  request('/api/destinations/filters');

export const fetchDestination = (id) =>
  request(`/api/destinations/${encodeURIComponent(id)}`);

// ---------- Queue (tourist) ----------

export const createQueueBooking = ({
  destinationId,
  numberOfPeople,
  requestId,
}) =>
  request('/api/queue', {
    method: 'POST',
    body: {
      destinationId,
      numberOfPeople,
      requestId,
    },
  });

export const fetchMyBookings = () =>
  request('/api/queue/mine');

export const fetchBooking = (bookingId) =>
  request(`/api/queue/${encodeURIComponent(bookingId)}`);

export const cancelQueueBooking = (bookingId) =>
  request(`/api/queue/${encodeURIComponent(bookingId)}`, {
    method: 'DELETE',
  });

// ---------- Guide ----------

export const fetchGuideQuestions = () =>
  request('/api/guide/questions');

export const askGuide = (destinationId, question) =>
  request('/api/guide/ask', {
    method: 'POST',
    body: {
      destinationId,
      question,
    },
  });

// ---------- Admin ----------

export const fetchAdminStats = () =>
  request('/api/admin/stats');

export const fetchAdminBookings = ({
  search = '',
  status = '',
  destinationId = '',
} = {}) => {
  const params = new URLSearchParams();

  if (search) params.set('search', search);
  if (status) params.set('status', status);
  if (destinationId) params.set('destinationId', destinationId);

  return request(`/api/admin/bookings?${params.toString()}`);
};

export const lookupBooking = (code) =>
  request(`/api/admin/bookings/lookup/${encodeURIComponent(code)}`);

// Actions: check-in | check-out | cancel | no-show
// Options: { reason, override }

export const updateBookingStatus = (
  bookingId,
  action,
  options = {}
) =>
  request(
    `/api/admin/bookings/${encodeURIComponent(bookingId)}/${action}`,
    {
      method: 'POST',
      body: options,
    }
  );

export const fetchAdminQueue = (destinationId) =>
  request(`/api/admin/queue/${encodeURIComponent(destinationId)}`);

export const fetchCrowdOverview = () =>
  request('/api/admin/crowd');

export const updateDestinationSettings = (
  destinationId,
  settings
) =>
  request(
    `/api/admin/destinations/${encodeURIComponent(destinationId)}/settings`,
    {
      method: 'PATCH',
      body: settings,
    }
  );

export const fetchDestinationContent = (destinationId) =>
  request(
    `/api/admin/destinations/${encodeURIComponent(destinationId)}/content`
  );

export const saveDestinationContent = (
  destinationId,
  content
) =>
  request(
    `/api/admin/destinations/${encodeURIComponent(destinationId)}/content`,
    {
      method: 'PUT',
      body: content,
    }
  );

export const saveDestinationImages = (
  destinationId,
  images
) =>
  request(
    `/api/admin/destinations/${encodeURIComponent(destinationId)}/images`,
    {
      method: 'PUT',
      body: { images },
    }
  );

export const fetchAuditLog = ({
  action = '',
  target = '',
  actor = '',
  before = '',
} = {}) => {
  const params = new URLSearchParams();

  if (action) params.set('action', action);
  if (target) params.set('target', target);
  if (actor) params.set('actor', actor);
  if (before) params.set('before', before);

  return request(`/api/admin/audit?${params.toString()}`);
};

// ---------- Request ID ----------

// Unique ID for each booking attempt to prevent duplicate bookings.

export function newRequestId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `req-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}