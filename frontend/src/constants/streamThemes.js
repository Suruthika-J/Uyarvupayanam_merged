/**
 * "Streams After 10th" design system constants.
 * Shared by the student flip-card section and the admin management page so
 * tabs, chips and theme thumbnails stay in sync with the backend data model.
 */

export const STREAM_CATEGORIES = [
  { key: 'all', label: 'All', tone: '#16A34A' },
  { key: 'science', label: 'Science', tone: '#16A34A' },
  { key: 'commerce', label: 'Commerce', tone: '#16A34A' },
  { key: 'arts', label: 'Arts', tone: '#16A34A' },
  { key: 'diploma', label: 'Diploma', tone: '#16A34A' },
  { key: 'polytechnic', label: 'Polytechnic', tone: '#16A34A' },
]

export const DIPLOMA_SUB_CATEGORIES = [
  { key: 'all-diploma', label: 'All Diploma' },
  { key: 'agriculture', label: 'Agriculture' },
  { key: 'textile-design', label: 'Textile & Design' },
  { key: 'home-science', label: 'Home Science' },
  { key: 'food-hospitality', label: 'Food & Hospitality' },
  { key: 'healthcare', label: 'Healthcare' },
  { key: 'commerce-vocational', label: 'Commerce Vocational' },
  { key: 'technical', label: 'Technical' },
  { key: 'printing-creative', label: 'Printing & Creative' },
]

// Reverse lookup used by the admin forms
export const DIPLOMA_SUB_CATEGORY_LABELS = Object.fromEntries(
  DIPLOMA_SUB_CATEGORIES.map((c) => [c.key, c.label])
)

export const STREAM_THEMES = {
  'science-lab': { label: 'Science Lab', top: '#eef4ff', bottom: '#dbe7ff', accent: '#2563eb', glyph: 'science' },
  'finance-office': { label: 'Finance Office', top: '#eefbf7', bottom: '#d4f0e8', accent: '#0d9488', glyph: 'finance' },
  'humanities-library': { label: 'Humanities Library', top: '#f5effd', bottom: '#e6d9fb', accent: '#7c3aed', glyph: 'library' },
  'farm-field': { label: 'Farm Field', top: '#f0fbe9', bottom: '#d9f2c4', accent: '#4d7c0f', glyph: 'farm' },
  'textile-studio': { label: 'Textile Studio', top: '#fdf2f8', bottom: '#f6d6e6', accent: '#be185d', glyph: 'textile' },
  'home-science-room': { label: 'Home Science', top: '#fff7ed', bottom: '#fde0c4', accent: '#c2410c', glyph: 'home' },
  'culinary-kitchen': { label: 'Culinary Kitchen', top: '#fff8ee', bottom: '#fdeccb', accent: '#d97706', glyph: 'culinary' },
  'hospitality-housekeeping': { label: 'Housekeeping', top: '#f0f9ff', bottom: '#d8effb', accent: '#0284c7', glyph: 'housekeeping' },
  'medical-clinic': { label: 'Medical Clinic', top: '#fdf4f4', bottom: '#f9dcdc', accent: '#dc2626', glyph: 'medical' },
  'office-admin': { label: 'Office Admin', top: '#f1f5f9', bottom: '#dbe4ee', accent: '#334155', glyph: 'office' },
  'sports-management': { label: 'Sports Management', top: '#eff6ff', bottom: '#d6e7ff', accent: '#1d4ed8', glyph: 'sports' },
  'workshop-tools': { label: 'Workshop Tools', top: '#f7f5f2', bottom: '#e2dcd2', accent: '#57534e', glyph: 'workshop' },
  'printing-studio': { label: 'Printing Studio', top: '#f6f3ff', bottom: '#e0d9fb', accent: '#6d28d9', glyph: 'printing' },
  'photography-studio': { label: 'Photography', top: '#23272f', bottom: '#151820', accent: '#f59e0b', glyph: 'camera' },
  'music-studio': { label: 'Music Studio', top: '#f8eaff', bottom: '#ead1fb', accent: '#a21caf', glyph: 'music' },
  // Polytechnic themes (3-year Diploma in Engineering / Technology courses)
  'engineering-workshop': { label: 'Engineering Workshop', top: '#f5f7fa', bottom: '#d9e0ea', accent: '#475569', glyph: 'engineer' },
  'electronics-lab': { label: 'Electronics Lab', top: '#eef4fb', bottom: '#d5e3f5', accent: '#1d4ed8', glyph: 'electronics' },
  'computer-lab': { label: 'Computer Lab', top: '#eefbf7', bottom: '#cff0e4', accent: '#0d9488', glyph: 'computer' },
  'architecture-studio': { label: 'Architecture Studio', top: '#f6f7fb', bottom: '#e0e4f0', accent: '#4338ca', glyph: 'architecture' },
}

export const STREAM_THEME_KEYS = Object.keys(STREAM_THEMES)

// Frontend fallback colour for themes not yet registered
export const FALLBACK_THEME = {
  label: 'General',
  top: '#f1f5f9',
  bottom: '#dbe4ee',
  accent: '#334155',
  glyph: 'office',
}