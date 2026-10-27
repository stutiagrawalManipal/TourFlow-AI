/**
 * Express 4 does not catch errors from async functions by itself.
 * Wrapping a handler sends any thrown error to the error handler in server.js,
 * which turns known errors (with a .status) into a JSON response.
 */
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

// Error -> JSON response (used by server.js)
export function sendError(res, err) {
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ error: err.message, fields: err.fields, ...(err.extra || {}) });
  }
  console.error(err);
  return res.status(500).json({ error: 'Something went wrong on the server. Please try again.' });
}
