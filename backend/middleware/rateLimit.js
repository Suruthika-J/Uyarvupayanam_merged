// Lightweight in-memory rate limiter used to prevent spam-farming XP from
// repeat quiz/challenge/game submissions. Per-key counters expire on a timer.
const buckets = new Map();

function rateLimit({ keyFn, max, windowMs = 60000, message = "Too many requests. Take a short break and try again." }) {
  return (req, res, next) => {
    const key = keyFn(req);
    if (!key) return next();

    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || entry.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      return res.status(429).json({ success: false, rateLimited: true, message });
    }

    entry.count += 1;
    return next();
  };
}

// Periodically clear expired buckets.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}, 120000).unref();

module.exports = { rateLimit };