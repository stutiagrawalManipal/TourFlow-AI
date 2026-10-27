/**
 * Security middleware (no extra packages needed).
 */

// Basic security headers on every response
export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  } else {
    // Built website (production): images may come from any https host (admin-provided photo URLs)
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    );
  }
  next();
}

/**
 * CSRF protection for cookie sessions.
 * Every state-changing API request must carry the header "X-Requested-With: TourFlow".
 * Browsers do not let another website add custom headers to a cross-site request
 * (that would need CORS permission, which this server never gives), and the
 * session cookie is SameSite=Lax as a second layer.
 */
export function requireCsrfHeader(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('X-Requested-With') !== 'TourFlow') {
    return res.status(403).json({ error: 'Request blocked (missing X-Requested-With header).' });
  }
  next();
}

/**
 * Simple in-memory rate limiter (fixed window). Good for one server; if you run
 * several instances, use a shared store such as Redis instead.
 */
export function rateLimit({ windowMs, max, key = (req) => req.ip, message = 'Too many requests. Please slow down and try again shortly.' }) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }, windowMs).unref();

  return (req, res, next) => {
    const k = key(req);
    const now = Date.now();
    let entry = hits.get(k);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(k, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({ error: message });
    }
    next();
  };
}
