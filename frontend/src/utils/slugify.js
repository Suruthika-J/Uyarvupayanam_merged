/**
 * slugify — lowercase URL-friendly slug matching the backend util
 * (e.g. "Tamil Nadu" → "tamil-nadu").
 */
export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}