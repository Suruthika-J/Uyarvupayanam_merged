/**
 * Normalise a stored website value into a safe absolute external URL.
 *
 * Why this is needed: a number of college records store their site without a
 * protocol, e.g. "www.via.ac.in". When that value is rendered straight into
 * `href="..."`, the browser resolves it as a *relative* path against the
 * current route, so the "Official Website" button navigates to
 * `/student/colleges/www.via.ac.in` instead of leaving the app.
 *
 * A scheme is added ONLY when one is missing, so absolute URLs — including
 * plain `http://` ones that already work — are returned untouched.
 */

// Schemes that must never be turned into a navigable link.
const UNSAFE_SCHEME = /^(?:javascript|data|vbscript|file):/i;

// Any explicit scheme: http, https, mailto, tel, ...
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/**
 * @param {*} value raw website value from the college record
 * @returns {string} an absolute URL, or '' when there is nothing safe to link
 */
export function toExternalUrl(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''

  // Dangerous or non-navigable schemes: refuse rather than render a link.
  if (UNSAFE_SCHEME.test(raw)) return ''

  // Already absolute — leave completely untouched (http, https, mailto, ...).
  if (HAS_SCHEME.test(raw)) return raw

  // Protocol-relative "//example.com" — assume https.
  if (raw.startsWith('//')) return `https:${raw}`

  // Bare host, e.g. "www.via.ac.in" or "example.edu/academics".
  return `https://${raw}`
}

export default toExternalUrl