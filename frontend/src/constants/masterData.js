export const MASTER_STREAMS = [
  'Engineering',
  'Medical',
  'Arts & Science',
  'Law',
  'Polytechnic',
  'Agriculture',
  'Others'
];

export const MASTER_STREAMS_WITH_ALL = ['All', ...MASTER_STREAMS];

export const STREAM_OPTIONS = MASTER_STREAMS.map(s => ({
  value: s,
  label: s
}));

// Legacy mapping for normalization
export const LEGACY_STREAM_MAP = {
  'Arts': 'Arts & Science',
  'Science': 'Arts & Science',
  'Arts and Science': 'Arts & Science',
  'Arts & science': 'Arts & Science',
  'Engg': 'Engineering',
  'Medicals': 'Medical',
  'B.Sc': 'Arts & Science',
  'B.A': 'Arts & Science',
  'B.Com': 'Arts & Science',
  'BBA': 'Arts & Science',
  'BCA': 'Arts & Science',
  'Vocational': 'Others',
  'Certification': 'Others',
  'Diploma': 'Polytechnic'
};

/**
 * Normalizes a stream/category value to the master list
 */
export const normalizeStream = (val) => {
  if (!val) return 'Others';
  const trimmed = val.trim();
  if (MASTER_STREAMS.includes(trimmed)) return trimmed;
  return LEGACY_STREAM_MAP[trimmed] || 'Others';
};
