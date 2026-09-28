/**
 * Tiny in-memory TTL cache for the public Colleges Insight endpoints.
 *
 * These endpoints are read-heavy and only change when the admin edits
 * courses / colleges / CollegeCourseMapping, so a short 5-minute TTL keeps
 * responses cheap while staying fresh. Admin write handlers call `bust()`
 * to invalidate immediately.
 */

const TTL_MS = 5 * 60 * 1000;
const store = new Map();

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

function set(key, value) {
  store.set(key, { expiresAt: Date.now() + TTL_MS, value });
}

/** Invalidate all cached insight payloads (called after admin writes). */
function bust() {
  store.clear();
}

module.exports = { TTL_MS, get, set, bust };