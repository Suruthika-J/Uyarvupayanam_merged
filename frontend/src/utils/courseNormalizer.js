/**
 * courseNormalizer.js
 *
 * Pure utilities that turn raw, AI-scanned / imported course names into
 * canonical, student-safe display names. Never mutates input.
 *
 *   - "MECHANICAL ENGINEERING"            -> { canonicalName: "Mechanical Engineering", needsReview: true, suggestedPrefixes: ["B.E.", "B.Tech.", ...] }
 *   - "B.E. Electrical And Electronics Engineering" -> { canonicalName: "B.E. Electrical and Electronics Engineering", needsReview: false }
 *
 * Used by BOTH the admin review UI and the student-facing Colleges page so a
 * course approved/tagged in admin renders identically on the student side.
 */

/** Known degree prefixes, longest/most specific first so matches never clip early. */
export const DEGREE_PREFIXES = [
  "Bachelor of Engineering",
  "Bachelor of Technology",
  "Bachelor of Science",
  "Bachelor of Commerce",
  "Bachelor of Arts",
  "Bachelor of Architecture",
  "Bachelor of Pharmacy",
  "Bachelor of Business Administration",
  "Master of Engineering",
  "Master of Technology",
  "Master of Science",
  "Master of Commerce",
  "Master of Arts",
  "Bachelor of Computer Application",
  "B.Tech.",
  "B.E.",
  "B.Sc.",
  "B.Com.",
  "B.A.",
  "B.Arch.",
  "B.Pharm.",
  "BBA",
  "BCA",
  "M.Tech.",
  "M.E.",
  "M.Sc.",
  "M.Com.",
  "M.A.",
  "MBA",
  "MCA",
  "M.Pharm.",
  "MBBS",
  "B.D.S.",
  "BAMS",
  "BHMS",
  "B.P.T.",
  "LL.B.",
  "M.B.B.S.",
  "M.D.",
  "M.S.",
  "Ph.D.",
  "Diploma",
  "Polytechnic",
];

/**
 * Long-form prefixes are collapsed into the short canonical form the rest of
 * the product already uses (e.g. `B.E. Civil Engineering`).
 */
const LONG_FORM_PREFIX_MAP = {
  "Bachelor of Engineering": "B.E.",
  "Bachelor of Technology": "B.Tech.",
  "Bachelor of Science": "B.Sc.",
  "Bachelor of Commerce": "B.Com.",
  "Bachelor of Arts": "B.A.",
  "Bachelor of Architecture": "B.Arch.",
  "Bachelor of Pharmacy": "B.Pharm.",
  "Bachelor of Business Administration": "BBA",
  "Bachelor of Computer Application": "BCA",
  "Master of Engineering": "M.E.",
  "Master of Technology": "M.Tech.",
  "Master of Science": "M.Sc.",
  "Master of Commerce": "M.Com.",
  "Master of Arts": "M.A.",
};

/** Joining words kept lowercase, matching `B.Sc (Microbiology)` behaviour. */
export const JOINING_WORDS = new Set([
  "and",
  "or",
  "of",
  "in",
  "for",
  "the",
  "at",
  "by",
  "with",
  "&",
]);

/** Short acronyms that should stay uppercase inside a course name. */
const ACRONYMS = new Set([
  "ai",
  "it",
  "cs",
  "me",
  "ce",
  "ee",
  "eee",
  "ece",
  "cse",
  "cst",
  "aiml",
  "ai&ds",
  "iot",
  "bi",
  "ml",
  "ds",
  "qa",
  "hr",
  "og",
  "api",
  "os",
  "vm",
  "bme",
  "cbe",
]);

/** Stream -> suggested degree prefixes for courses that are missing a prefix. */
const STREAM_PREFIX_HINTS = {
  engineering: ["B.E.", "B.Tech.", "M.E.", "M.Tech."],
  architecture: ["B.Arch."],
  medical: ["B.Sc.", "MBBS", "B.D.S.", "BAMS", "BHMS", "B.P.T.", "B.Pharm."],
  arts: ["B.A.", "B.Sc.", "B.Com."],
  science: ["B.Sc."],
  commerce: ["B.Com."],
  management: ["BBA", "MBA"],
  computer: ["B.Tech.", "BCA", "MCA", "B.Sc."],
  law: ["B.A.", "BBA", "LL.B."],
  diploma: ["Diploma"],
  polytechnic: ["Diploma"],
  agriculture: ["B.Sc.", "B.Tech."],
};

const DEFAULT_PREFIX_HINTS = ["B.Sc.", "B.A.", "B.Com.", "Diploma"];

/** Best-effort suggested degree prefixes for a stream string. */
export function suggestPrefixesForStream(stream = "") {
  if (!stream) return DEFAULT_PREFIX_HINTS;
  const s = String(stream).toLowerCase();
  for (const [key, prefixes] of Object.entries(STREAM_PREFIX_HINTS)) {
    if (s.includes(key)) return prefixes;
  }
  return DEFAULT_PREFIX_HINTS;
}

/** Builds a regex that matches a known prefix at the very start of a name. */
function prefixRegex(prefix) {
  // "B.E." -> "B\.?E\.?"  (a dot may or may not be present, e.g. "B.E" / "BE")
  const escaped = prefix.replace(/\./g, "\\.?");
  return new RegExp(`^${escaped}\\s+`, "i");
}

/**
 * Splits a raw course name into { prefix, core }.
 * prefix is "" when no known degree prefix is present.
 */
export function splitDegreeName(raw = "") {
  const name = String(raw || "").trim().replace(/\s+/g, " ");
  if (!name) return { prefix: "", core: "" };

  for (const candidate of DEGREE_PREFIXES) {
    const m = name.match(prefixRegex(candidate));
    if (!m) continue;
    // `candidate` is the canonical dotted form (e.g. "B.E.", "BBA"); the regex
    // tolerated missing dots in the source, but the output keeps the standard form.
    let prefix = candidate.trim();
    if (LONG_FORM_PREFIX_MAP[prefix]) prefix = LONG_FORM_PREFIX_MAP[prefix];
    const core = name.slice(m[0].length).trim();
    return { prefix, core };
  }
  return { prefix: "", core: name };
}

/** Title-cases a course "core" (everything after the degree prefix). */
export function titleCaseCore(core = "") {
  const padded = String(core).replace(/([()])/g, " $1 ");
  const tokens = padded.split(/\s+/).filter(Boolean);

  const out = tokens.map((tok) => {
    const lower = tok.toLowerCase();

    // Joining words are always lowercased ("AND" -> "and", "In" -> "in") — this
    // also handles "Diploma in X" / "B.E. in Computer Science" cores.
    if (JOINING_WORDS.has(lower)) return lower;

    // Preserve standalone acronyms as typed (AI, IT, EEE, CSE ...). Anything
    // else that is ALL-CAPS but not a real acronym is title-cased normally
    // (e.g. "AND" -> "and", "DATA" -> "Data").
    if (ACRONYMS.has(lower)) return tok.toUpperCase();

    if (tok === "(") return "(";
    if (tok === ")") return ")";

    const first = tok.charAt(0).toUpperCase();
    const rest = tok.slice(1).toLowerCase();
    return `${first}${rest}`;
  });

  return out
    .join(" ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\(\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stableId(canonicalName, stream) {
  const slug = String(canonicalName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return stream ? `${String(stream).toLowerCase().replace(/[^a-z0-9]+/g, "-")}::${slug}` : slug;
}

/**
 * Normalizes a single raw course name into a student-safe display object.
 *
 * @param {string} courseName raw name (e.g. from an import or AI scan)
 * @param {{ stream?: string }} [opts]
 * @returns {{
 *   id: string,
 *   canonicalName: string,
 *   degreePrefix: string,
 *   stream: string,
 *   needsReview: boolean,
 *   aliases: string[],
 *   suggestedPrefixes: string[],
 * }}
 */
export function normalizeCourseName(courseName, opts = {}) {
  const stream = opts.stream || "";
  const raw = String(courseName || "").trim();
  if (!raw) {
    return {
      id: stableId("", stream),
      canonicalName: "",
      degreePrefix: "",
      stream,
      needsReview: true,
      aliases: [],
      suggestedPrefixes: suggestPrefixesForStream(stream),
    };
  }

  const { prefix, core } = splitDegreeName(raw);
  const titleCore = titleCaseCore(core);

  if (prefix) {
    const canonicalName = `${prefix} ${titleCore}`.replace(/\s+/g, " ").trim();
    return {
      id: stableId(canonicalName, stream),
      canonicalName,
      degreePrefix: prefix,
      stream,
      needsReview: false,
      aliases: [raw],
      suggestedPrefixes: [],
    };
  }

  // Diploma / Polytechnic streams: a missing explicit prefix is deterministic —
  // the course reads "Diploma in <Name>" and is safe to show without admin
  // review. Unlike Engineering (B.E. vs B.Tech. is ambiguous and must stay
  // flagged), there is only one sensible canonical form here. Task 6 regression:
  // raw maps like "MECHANICAL ENGINEERING" under a Diploma college were being
  // hidden from students entirely.
  if (/diploma|polytechnic/i.test(stream)) {
    const canonicalName = `Diploma in ${titleCore}`.replace(/\s+/g, " ").trim();
    return {
      id: stableId(canonicalName, stream),
      canonicalName,
      degreePrefix: "Diploma",
      stream,
      needsReview: false,
      aliases: [raw],
      suggestedPrefixes: [],
    };
  }

  return {
    id: stableId(titleCore, stream),
    canonicalName: titleCore,
    degreePrefix: "",
    stream,
    needsReview: true, // No confirmed degree prefix yet — admin must tag it.
    aliases: [raw],
    suggestedPrefixes: suggestPrefixesForStream(stream),
  };
}

/**
 * Converts one fetched course record into a normalized course, honouring a
 * canonical name already confirmed by an admin (stored on the mapping).
 *
 * @param {{ _id?: string, courseName: string, canonicalName?: string, degreePrefix?: string }} course
 * @param {{ stream?: string }} [opts]
 */
export function toDisplayCourse(course, opts = {}) {
  const stream = course.stream || opts.stream || "";
  const raw = String(course.courseName || "").trim();

  // Admin-tagged mapping takes precedence and is considered confirmed.
  if (course.canonicalName && String(course.canonicalName).trim()) {
    const canonicalName = String(course.canonicalName).trim();
    const degreePrefix = course.degreePrefix || splitDegreeName(canonicalName).prefix || "";
    return {
      id: stableId(canonicalName, stream),
      canonicalName,
      degreePrefix,
      stream,
      needsReview: false,
      aliases: raw ? [raw] : [],
      suggestedPrefixes: [],
    };
  }

  return normalizeCourseName(raw, { stream });
}

/**
 * Deduplicates a list of course records so case-only variants of the same
 * course collapse into a single canonical course (raw strings kept as aliases).
 *
 * @param {Array<{ _id?: string, courseName: string, canonicalName?: string, degreePrefix?: string, stream?: string }>} courses
 * @param {{ stream?: string }} [opts]
 * @returns {Array<{ _id: string|undefined, canonicalName: string, degreePrefix: string, stream: string, needsReview: boolean, aliases: string[], suggestedPrefixes: string[], queryName: string }>}
 */
export function dedupeCourses(courses = [], opts = {}) {
  const map = new Map();
  for (const course of courses) {
    const normalized = toDisplayCourse(course, opts);
    if (!normalized.canonicalName) continue;
    const key = normalized.canonicalName.toLowerCase();

    const existing = map.get(key);
    if (existing) {
      existing.aliases = existing.aliases.concat(normalized.aliases).filter((a, i, arr) => arr.indexOf(a) === i);
      if (existing._id === undefined && course._id !== undefined) existing._id = course._id;
      continue;
    }
    map.set(key, {
      _id: course ? course._id : undefined,
      ...normalized,
      queryName: normalized.canonicalName.toLowerCase(),
    });
  }
  return Array.from(map.values());
}

/** Maps a degree prefix to a display "family" used for chip group headings. */
export function degreeFamilyOf(degreePrefix = "") {
  const d = String(degreePrefix || "").toLowerCase().replace(/\./g, "").replace(/\s+/g, "");
  const norms = {
    be: "engineering",
    btech: "engineering",
    me: "engineering",
    mtech: "engineering",
    barch: "engineering",
    mbbs: "medical",
    bds: "medical",
    bams: "medical",
    bhms: "medical",
    bpt: "medical",
    bpharm: "medical",
    md: "medical",
    ms: "medical",
    msc: "science",
    bsc: "science",
    ba: "arts",
    ma: "arts",
    bcom: "commerce",
    mcom: "commerce",
    bba: "management",
    mba: "management",
    bca: "computer",
    mca: "computer",
    llb: "law",
    diploma: "diploma",
    polytechnic: "diploma",
  };
  return norms[d] || "other";
}

const DEGREE_FAMILY_LABELS = {
  engineering: "Engineering (B.E. / B.Tech.)",
  medical: "Medical (MBBS / B.Sc.)",
  science: "Science (B.Sc.)",
  arts: "Arts (B.A.)",
  commerce: "Commerce (B.Com.)",
  management: "Management (BBA / MBA)",
  computer: "Computer Applications (BCA / MCA)",
  law: "Law (LL.B.)",
  diploma: "Diploma / Polytechnic",
  other: "Other Courses",
};

/** Display heading for a degree family. */
export function degreeFamilyLabel(degreeFamily) {
  return DEGREE_FAMILY_LABELS[degreeFamily] || DEGREE_FAMILY_LABELS.other;
}

const DEGREE_FAMILY_ORDER = [
  "engineering",
  "medical",
  "science",
  "arts",
  "commerce",
  "management",
  "computer",
  "law",
  "diploma",
  "other",
];

/**
 * Groups normalized courses under degree-family sub-headings.
 * Un-prefixed (needsReview) courses are dropped here — students never see them.
 *
 * @param {Array<{ canonicalName: string, degreePrefix: string, needsReview: boolean }>} courses
 */
export function groupCoursesByDegree(courses = []) {
  const groups = new Map();
  for (const course of courses) {
    if (!course.canonicalName || course.needsReview) continue;
    const family = degreeFamilyOf(course.degreePrefix);
    if (!groups.has(family)) groups.set(family, []);
    groups.get(family).push(course);
  }
  return DEGREE_FAMILY_ORDER
    .filter((family) => groups.has(family) && groups.get(family).length > 0)
    .map((family) => ({
      degreeFamily: family,
      label: degreeFamilyLabel(family),
      courses: groups.get(family),
    }));
}