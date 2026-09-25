/**
 * "Colleges Insight" (Class 12) — per-category design tokens.
 *
 * Shared by the summary cards on the Class 12 Colleges tab and every
 * drill-down page so the arrow-navigation / blue-orange badge theme stays
 * consistent across the whole explorer. Keys must match the 9 stable insight
 * keys in backend/config/collegesInsightCategories.js.
 */
const INSIGHT_STREAM_STYLE = {
  engineering:       { short: 'Engineering',       icon: '⚙️', color: '#1d5fba', bg: '#eaf0fb' },
  medical:           { short: 'Medical',           icon: '🩺', color: '#16a34a', bg: '#f0fdf4' },
  'arts-science':    { short: 'Arts & Science',    icon: '🎭', color: '#7c3aed', bg: '#f3effe' },
  law:               { short: 'Law',               icon: '⚖️', color: '#c48a1a', bg: '#fdf4e0' },
  diploma:           { short: 'Diploma',           icon: '📜', color: '#7e22ce', bg: '#f3e8ff' },
  'media-journalism':{ short: 'Media & Journalism',icon: '📰', color: '#ef4444', bg: '#fef2f2' },
  polytechnic:       { short: 'Polytechnic',       icon: '🔧', color: '#e05e24', bg: '#fdeee6' },
  agriculture:       { short: 'Agriculture',       icon: '🌱', color: '#15803d', bg: '#dcfce7' },
  others:            { short: 'Others',            icon: '🎓', color: '#64748b', bg: '#f1f5f9' },
}

const FALLBACK_INSIGHT_STYLE = {
  short: 'Colleges',
  icon: '🎓',
  color: '#4f46e5',
  bg: '#eef2ff',
}

/** Look up a category's style; unknown keys fall back to the indigo tile. */
export function getInsightStyle(category) {
  return INSIGHT_STREAM_STYLE[category] || FALLBACK_INSIGHT_STYLE
}

/** Short display name for an insight key (used on cards and breadcrumbs). */
export function getInsightShortLabel(category, fullLabel = '') {
  const style = INSIGHT_STREAM_STYLE[category]
  if (style) return style.short
  // Fallback: strip the "... Insight" suffix from the API label.
  return String(fullLabel).replace(/\s+Insight$/i, '') || 'Colleges'
}

const LEVEL_LABELS = {
  after12th: 'After 12th',
  after10th: 'After 10th',
  diploma: 'Diploma',
  after12: 'After 12th',
  after10: 'After 10th',
}

/** Friendly label for a Course.level value ("after12th" -> "After 12th"). */
export function getLevelLabel(level) {
  if (!level) return ''
  return LEVEL_LABELS[String(level).toLowerCase()] || String(level)
}

export { INSIGHT_STREAM_STYLE, FALLBACK_INSIGHT_STYLE }