/**
 * Colleges Insight (Class 12) — public category registry.
 *
 * The student-facing "Colleges Insight" page (the Colleges tab on
 * /student/class12) groups courses and colleges under 9 insight categories
 * that mirror the admin College-Course Mapping engine's stream chips:
 *
 *   Engineering | Medical | Arts & Science | Law | Diploma |
 *   Media & Journalism | Polytechnic | Agriculture | Others
 *
 * A Course's stored `category` value can be a raw variant ("Arts", "Science",
 * "Architecture", "ITI", ...). `categoryToInsightKey()` folds any raw value
 * into one of the 9 stable insight keys. Colleges are bucketed through the
 * categories of the courses they are mapped to in CollegeCourseMapping, so
 * the same key space drives both counts.
 */

const INSIGHT_CATEGORIES = [
  { key: "engineering", label: "Engineering Insight", raw: ["Engineering", "Architecture", "IT & Computer"] },
  { key: "medical", label: "Medical Insight", raw: ["Medical"] },
  { key: "arts-science", label: "Arts & Science Insight", raw: ["Arts", "Science", "Arts & Science", "Commerce", "Management", "Design", "Humanities"] },
  { key: "law", label: "Law Insight", raw: ["Law", "Legal Studies"] },
  { key: "diploma", label: "Diploma Insight", raw: ["Diploma"] },
  { key: "media-journalism", label: "Media & Journalism Insight", raw: ["Media & Journalism", "Journalism"] },
  { key: "polytechnic", label: "Polytechnic Insight", raw: ["Polytechnic", "ITI"] },
  { key: "agriculture", label: "Agriculture Insight", raw: ["Agriculture", "Agri"] },
  { key: "others", label: "Others Insight", raw: ["Others", "Certificate", "Hotel Management", "Tourism"] },
];

/** Normalize a category string for tolerant matching (lowercase, alphanumeric only). */
const norm = (s = "") => String(s).toLowerCase().replace(/[^a-z0-9]/g, "").trim();

const rawToKey = new Map();
for (const ins of INSIGHT_CATEGORIES) {
  for (const r of ins.raw) rawToKey.set(norm(r), ins.key);
}

// Keyword fallback for raw categories not matched exactly.
// Order matters — specific families are checked before generic ones.
const KEYWORD_RULES = [
  [/architect/, "engineering"],
  [/comput|informationtechnology|tech/, "engineering"],
  [/medic|nursing|pharma|health|para|ayurved|siddha|dmlt|physio|dental|optom|audiol|speech/, "medical"],
  [/journal|media/, "media-journalism"],
  [/polytechnic/, "polytechnic"],
  [/agriculture|agri|fisher|forest|veterinary|animal|horticulture/, "agriculture"],
  [/diploma|vocational/, "diploma"],
  [/law|legal/, "law"],
  [/design|arts|science|commerce|management|humanities|business|education|sports|literature|music|dance|biology|zoology|botany|chemistry|physics|mathematics|economics|geography|psychology/, "arts-science"],
  [/hotel|tourism|certificate/, "others"],
];

/** Map a stored Course.category value to one of the 9 insight keys. */
function categoryToInsightKey(category) {
  const n = norm(category);
  if (!n) return "others";
  if (rawToKey.has(n)) return rawToKey.get(n);
  for (const [re, key] of KEYWORD_RULES) {
    if (re.test(n)) return key;
  }
  return "others";
}

function findInsightCategory(key) {
  return INSIGHT_CATEGORIES.find((i) => i.key === key) || null;
}

function isValidInsightCategory(key) {
  return findInsightCategory(key) !== null;
}

module.exports = {
  INSIGHT_CATEGORIES,
  categoryToInsightKey,
  findInsightCategory,
  isValidInsightCategory,
};