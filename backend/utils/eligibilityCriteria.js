/**
 * Course eligibility criteria — parser + evaluator.
 *
 * The `Course` model stores eligibility as a single free-text field
 * (see models/Course.js). This module turns that text into a structured,
 * checkable criteria object and evaluates a student's answers against it.
 *
 * Design rules:
 *  - Nothing here is course-specific. Every rule is derived at call time from
 *    the text stored on that particular course, so two courses with different
 *    eligibility text automatically produce different criteria and different
 *    questions. There is no per-course or per-category rule table.
 *  - When the stored text cannot be interpreted with confidence the result is
 *    marked `determinable: false` so the UI can say eligibility "cannot be
 *    determined" rather than guessing.
 *  - A pass verdict only ever means "the criteria stored for this course are
 *    met". It is never a statement about admission, which depends on marks,
 *    rank, reservations and vacancies that this data does not hold.
 */

/* ── Subject vocabulary ───────────────────────────────────────
 * `patterns` are matched against the whole eligibility text. The catalogue is
 * generic to the Indian 10+2 system and is not tied to any course.
 */
const SUBJECTS = [
  { id: 'physics', label: 'Physics', patterns: [/\bphysics\b/i] },
  { id: 'chemistry', label: 'Chemistry', patterns: [/\bchemistry\b/i] },
  {
    id: 'maths',
    label: 'Mathematics / Maths',
    // \bmath\b is guarded so it cannot match "mathematics" twice.
    patterns: [/\bmathematics\b/i, /\bmaths\b/i, /\bmath\b/i],
  },
  { id: 'biology', label: 'Biology', patterns: [/\bbiology\b/i] },
  { id: 'botany', label: 'Botany', patterns: [/\bbotany\b/i] },
  { id: 'zoology', label: 'Zoology', patterns: [/\bzoology\b/i] },
  { id: 'commerce', label: 'Commerce', patterns: [/\bcommerce\b/i] },
  { id: 'accountancy', label: 'Accountancy', patterns: [/\baccountancy\b/i, /\baccounts\b/i] },
  // "CS" is matched case-sensitively: in this data the acronym is always
  // upper case, and a case-insensitive match would fire on unrelated words.
  { id: 'computerscience', label: 'Computer Science', patterns: [/\bcomputer\s+science\b/i, /\bCS\b/] },
];

/* Standard subject-group acronyms. Matched before individual subjects so that
 * "PCB/PCM" is read as two group alternatives rather than a mishmash. */
const SUBJECT_GROUPS = [
  { code: 'PCMB', label: 'Physics, Chemistry, Maths and Biology', subjects: ['physics', 'chemistry', 'maths', 'biology'] },
  { code: 'MPC', label: 'Maths, Physics and Chemistry', subjects: ['maths', 'physics', 'chemistry'] },
  { code: 'PCM', label: 'Physics, Chemistry and Maths', subjects: ['physics', 'chemistry', 'maths'] },
  { code: 'PCB', label: 'Physics, Chemistry and Biology', subjects: ['physics', 'chemistry', 'biology'] },
];

/* Entrance exams referenced by eligibility text. */
const ENTRANCE_EXAMS = [
  { id: 'neet', label: 'NEET', patterns: [/\bNEET\b/] },
  { id: 'nata', label: 'NATA', patterns: [/\bNATA\b/] },
  { id: 'jee_paper2', label: 'JEE Main Paper 2 (B.Arch)', patterns: [/\bJEE\b[^,;)]*\bPaper\s*2\b/i, /\bPaper\s*2\b/i] },
  { id: 'jee_main', label: 'JEE Main', patterns: [/\bJEE\b/i] },
];

/* Qualification levels the parser can recognise. */
const QUALIFICATIONS = {
  after12th: {
    label: 'Passed 12th Standard (10+2 / HSC)',
    question: 'Have you passed the 12th Standard (10+2 / HSC)?',
  },
  after10th: {
    label: 'Passed 10th Standard (SSLC)',
    question: 'Have you passed the 10th Standard (SSLC)?',
  },
  graduation: {
    label: 'Completed a graduation degree',
    question: 'Have you completed a graduation degree?',
  },
  barch: {
    label: 'Completed B.Arch',
    question: 'Have you completed B.Arch?',
  },
};

const subjectLabel = (id) => SUBJECTS.find((s) => s.id === id)?.label || id;

/* ── Text helpers ─────────────────────────────────────────── */

const squash = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();

/** Percentage thresholds, e.g. "min 45%" / "Min 50%". */
function detectMinPercentage(text) {
  const m = String(text || '').match(/(\d{1,3}(?:\.\d+)?)\s*%/);
  if (!m) return null;
  const value = Number(m[1]);
  return Number.isFinite(value) && value > 0 && value <= 100 ? value : null;
}

/** Entrance exams, plus whether one of several alternatives is enough. */
function detectEntranceExams(text) {
  const raw = String(text || '');
  const found = [];
  ENTRANCE_EXAMS.forEach((exam) => {
    if (exam.patterns.some((p) => p.test(raw))) {
      // JEE Main Paper 2 is a more specific match than plain "JEE Main"; if the
      // specific one fired, drop the generic one so it is not asked twice.
      found.push(exam);
    }
  });
  // Remove generic JEE Main when a more specific JEE variant matched.
  const hasSpecificJee = found.some((e) => e.id === 'jee_paper2');
  const exams = found.filter((e) => !(hasSpecificJee && e.id === 'jee_main'));
  if (!exams.length) return null;

  const anyOf = exams.length > 1 && /\//.test(
    raw.replace(new RegExp(exams.map((e) => e.id === 'jee_paper2' ? 'Paper\\s*2' : e.id.toUpperCase()).join('|'), 'i'), '/'),
  );
  return { mode: anyOf ? 'any' : 'all', exams };
}

/**
 * Which qualification the text asks for.
 * Returns `{ key, confident }`; `confident:false` means the level field was
 * used as a fallback rather than the text.
 */
function detectQualification(text, level) {
  const t = String(text || '');
  if (/\b10\s*\+\s*2\b/.test(t) || /\b12\s*(?:th)?\s*(?:standard|std)?\b/i.test(t) || /\bHSC\b/i.test(t)) {
    return { key: 'after12th', confident: true };
  }
  if (/\b10\s*(?:th)?\s*(?:standard|std)?\b/i.test(t) || /\bSSLC\b/i.test(t)) {
    return { key: 'after10th', confident: true };
  }
  if (/\bgraduat(?:e|ion)\b/i.test(t)) return { key: 'graduation', confident: true };
  if (/\bb\.?\s?arch\b/i.test(t)) return { key: 'barch', confident: true };

  const lv = String(level || '').toLowerCase();
  if (lv === 'after10th') return { key: 'after10th', confident: false };
  if (lv === 'after12th' || lv === 'undergraduate') return { key: 'after12th', confident: false };
  if (lv === 'diploma') return { key: 'after10th', confident: false };
  return { key: null, confident: false };
}

/* ── Subject requirement expression ───────────────────────── */

/**
 * Collect every subject mention (individual subject or group acronym) in the
 * text, with the separator that preceded it.
 */
function collectSubjectMentions(text) {
  const t = String(text || '');
  const mentions = [];

  SUBJECT_GROUPS.forEach((group) => {
    const re = new RegExp(`\\b${group.code}\\b`, 'gi');
    let m;
    while ((m = re.exec(t)) !== null) {
      mentions.push({
        start: m.index,
        end: m.index + m[0].length,
        subjects: group.subjects,
        label: group.label,
        isGroup: true,
      });
    }
  });

  SUBJECTS.forEach((subject) => {
    subject.patterns.forEach((pattern) => {
      const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
      let m;
      while ((m = re.exec(t)) !== null) {
        mentions.push({
          start: m.index,
          end: m.index + m[0].length,
          subjects: [subject.id],
          label: subject.label,
          isGroup: false,
        });
      }
    });
  });

  // Drop overlaps so a group acronym wins over the words inside it.
  mentions.sort((a, b) => a.start - b.start || b.end - a.end);
  const kept = [];
  for (const mention of mentions) {
    if (kept.some((k) => mention.start < k.end && k.start < mention.end)) continue;
    kept.push(mention);
  }
  return kept;
}

/** Classify the text between two mentions: OR, AND, or a new AND-group. */
function classifyGap(gap) {
  if (/\+/.test(gap)) return 'group';
  if (/\/|or\b/i.test(gap)) return 'or';
  if (/[,;&]|and\b|with\b/i.test(gap)) return 'and';
  if (/\S/.test(gap)) return 'and';
  return 'and';
}

/**
 * Build the subject requirement from the text.
 *
 * Shape: `groups` is a list that is ANDed together; each group holds
 * `anyOf`, a list of subject-ids that are ANDed together, of which at least
 * one must be satisfied. That is enough to express every pattern present in
 * the data, e.g.
 *   "Physics, Chemistry, and Mathematics"      -> [[physics, chemistry, maths]]
 *   "Physics, Chemistry, Biology/Mathematics"  -> [[physics, chemistry, biology], [maths]]
 *   "Biology/Botany & Zoology"                 -> [[biology], [botany, zoology]]
 *   "PCB/PCM"                                  -> [[physics, chemistry, biology], [physics, chemistry, maths]]
 */
function detectSubjects(text) {
  // Strip parts that are not subject requirements so their words cannot be
  // mistaken for subjects.
  const cleaned = String(text || '')
    .replace(/\([^)]*min[^)]*\)/gi, ' ')
    .replace(/\bmin(?:imum)?\.?\s*\d+(?:\.\d+)?\s*%/gi, ' ')
    .replace(/\bNEET\b|\bNATA\b|\bJEE\b|\bPaper\s*2\b/gi, ' ');

  const mentions = collectSubjectMentions(cleaned);
  if (!mentions.length) return null;

  const groups = [];
  let alts = null;
  let prev = null;

  for (const mention of mentions) {
    if (!prev) {
      alts = [[...mention.subjects]];
      prev = mention;
      continue;
    }
    const gap = cleaned.slice(prev.end, mention.start);
    const kind = classifyGap(gap);

    if (kind === 'group') {
      groups.push({ anyOf: alts });
      alts = [...mention.subjects];
    } else if (kind === 'or') {
      alts.push([...mention.subjects]);
    } else {
      // AND binds tighter than OR, so AND appends to the alternative currently
      // being built rather than to every alternative.
      alts[alts.length - 1].push(...mention.subjects);
    }
    prev = mention;
  }
  groups.push({ anyOf: alts });

  const normalised = groups
    .map((g) => ({ anyOf: g.anyOf.map((alt) => [...new Set(alt)]) }))
    .filter((g) => g.anyOf.length && g.anyOf.some((alt) => alt.length));

  if (!normalised.length) return null;

  // Every subject the student could be asked about.
  const asked = [...new Set(normalised.flatMap((g) => g.anyOf.flat()))];
  return { groups: normalised, asked };
}

/* ── Public: parse ────────────────────────────────────────── */

/**
 * Build the structured criteria for a course.
 *
 * @param {{eligibility?:string, level?:string, courseName?:string}} course
 * @returns {object} criteria descriptor, including the questions to ask.
 */
function buildEligibilityCriteria(course) {
  const text = squash(course?.eligibility);
  const level = course?.level || '';

  const qualification = detectQualification(text, level);
  const subjects = detectSubjects(text);
  const minPercentage = detectMinPercentage(text);
  const entrance = detectEntranceExams(text);

  const hasAnyCheck = Boolean(qualification.key) || Boolean(subjects) || minPercentage !== null || Boolean(entrance);

  // Build only the questions this course actually needs.
  const questions = [];
  if (qualification.key) {
    questions.push({
      id: 'qualification',
      type: 'select',
      label: QUALIFICATIONS[qualification.key].question,
      options: [
        { value: 'passed', label: 'Yes, I have passed it' },
        { value: 'not-yet', label: 'No, not yet' },
        { value: 'unsure', label: "I'm not sure" },
      ],
    });
  }
  if (subjects) {
    questions.push({
      id: 'subjects',
      type: 'multi',
      label: 'Which of these did you study?',
      help: 'Select every subject you have studied.',
      options: subjects.asked.map((id) => ({ value: id, label: subjectLabel(id) })),
    });
  }
  if (minPercentage !== null) {
    questions.push({
      id: 'percentage',
      type: 'number',
      label: `Your aggregate percentage`,
      help: `This course's stored criteria mention a minimum of ${minPercentage}%.`,
      min: 0,
      max: 100,
    });
  }
  if (entrance) {
    questions.push({
      id: 'entrance',
      type: 'multi',
      label: entrance.mode === 'any'
        ? 'Which of these entrance exams have you appeared for?'
        : 'Have you appeared for the required entrance exam?',
      help: entrance.mode === 'any'
        ? 'Any one of these is accepted by the stored criteria.'
        : undefined,
      options: entrance.exams.map((e) => ({ value: e.id, label: e.label })),
    });
  }

  const caveats = [];
  if (text && /varies by/i.test(text)) {
    caveats.push('The stored criteria for this course say the exact requirement varies by course and college.');
  }
  if (qualification.key && !qualification.confident) {
    caveats.push('The qualification requirement was taken from the course level, because the eligibility text did not state one.');
  }

  let reason = '';
  if (!text) {
    reason = 'This course has no eligibility criteria stored, so eligibility cannot be determined.';
  } else if (!hasAnyCheck) {
    reason = `The stored eligibility criteria ("${text}") could not be turned into anything checkable, so eligibility cannot be determined.`;
  }

  return {
    source: text,
    determinable: hasAnyCheck,
    reason,
    qualification: qualification.key
      ? { ...QUALIFICATIONS[qualification.key], key: qualification.key, fromText: qualification.confident }
      : null,
    subjects,
    minPercentage,
    entranceExams: entrance,
    questions,
    caveats,
  };
}

/* ── Public: evaluate ─────────────────────────────────────── */

/**
 * Compare a student's answers with a course's stored criteria.
 *
 * Each check ends up `met`, `not-met` or `unknown`. `unknown` means the
 * student did not provide what was needed, which is what keeps the tool from
 * guessing.
 *
 * @param {object} criteria output of buildEligibilityCriteria
 * @param {{qualification?:string, subjects?:string[], percentage?:number|string, entrance?:string[]}} answers
 */
function evaluateEligibility(criteria, answers = {}) {
  const checks = [];
  const a = answers || {};

  // 1. Qualification
  if (criteria.qualification) {
    const given = a.qualification;
    const status = given === 'passed' ? 'met'
      : given === 'not-yet' ? 'not-met'
      : 'unknown';
    checks.push({
      id: 'qualification',
      label: criteria.qualification.label,
      status,
      detail: status === 'met' ? 'Matches the stored requirement.'
        : status === 'not-met' ? 'The stored criteria require this qualification.'
        : 'Select an answer to check this requirement.',
    });
  }

  // 2. Subjects
  if (criteria.subjects) {
    const given = Array.isArray(a.subjects) ? a.subjects : [];
    if (!given.length) {
      criteria.subjects.groups.forEach((group, i) => {
        checks.push({
          id: `subjects-${i}`,
          label: describeSubjectGroup(group),
          status: 'unknown',
          detail: 'Select your subjects to check this requirement.',
        });
      });
    } else {
      criteria.subjects.groups.forEach((group, i) => {
        const satisfiedAlternative = group.anyOf.find((alt) => alt.every((s) => given.includes(s)));
        checks.push({
          id: `subjects-${i}`,
          label: describeSubjectGroup(group),
          status: satisfiedAlternative ? 'met' : 'not-met',
          detail: satisfiedAlternative
            ? `You have ${satisfiedAlternative.map(subjectLabel).join(', ')}.`
            : `Needs ${group.anyOf.map((alt) => alt.map(subjectLabel).join(' + ')).join(' or ')}.`,
        });
      });
    }
  }

  // 3. Minimum percentage
  if (criteria.minPercentage !== null && criteria.minPercentage !== undefined) {
    const raw = a.percentage;
    const value = typeof raw === 'number' ? raw : (raw === '' || raw == null ? NaN : Number(String(raw).replace('%', '')));
    let status = 'unknown';
    if (Number.isFinite(value)) status = value >= criteria.minPercentage ? 'met' : 'not-met';
    checks.push({
      id: 'percentage',
      label: `Minimum ${criteria.minPercentage}% aggregate`,
      status,
      detail: Number.isFinite(value)
        ? `You entered ${value}%.`
        : 'Enter your aggregate percentage to check this requirement.',
    });
  }

  // 4. Entrance exam
  if (criteria.entranceExams) {
    const given = Array.isArray(a.entrance) ? a.entrance : [];
    const labels = criteria.entranceExams.exams.map((e) => e.label);
    const label = criteria.entranceExams.mode === 'any'
      ? `Any one of: ${labels.join(' or ')}`
      : labels.join(' and ');

    let status = 'unknown';
    let matched = [];
    if (given.length) {
      matched = criteria.entranceExams.exams
        .filter((e) => given.includes(e.id))
        .map((e) => e.label);
      status = criteria.entranceExams.mode === 'any'
        ? (matched.length ? 'met' : 'not-met')
        : (matched.length === criteria.entranceExams.exams.length ? 'met' : 'not-met');
    }
    checks.push({
      id: 'entrance',
      label: `Entrance exam: ${label}`,
      status,
      detail: given.length
        ? (matched.length ? `You selected: ${matched.join(', ')}.` : 'None of the required exams were selected.')
        : 'Select an entrance exam to check this requirement.',
    });
  }

  const notMet = checks.filter((c) => c.status === 'not-met');
  const unknown = checks.filter((c) => c.status === 'unknown');

  let verdict;
  let headline;
  let summary;
  if (notMet.length) {
    verdict = 'not-eligible';
    headline = 'Not eligible based on the stored criteria';
    summary = `${notMet.length} of ${checks.length} stored requirement${checks.length === 1 ? '' : 's'} not met.`;
  } else if (unknown.length) {
    verdict = 'unable-to-determine';
    headline = 'Unable to determine';
    summary = `${unknown.length} requirement${unknown.length === 1 ? '' : 's'} could not be checked because the needed information was not provided.`;  } else {
    verdict = 'eligible';
    headline = 'Eligible based on the available criteria';
    summary = `All ${checks.length} stored requirement${checks.length === 1 ? ' is' : 's are'} met.`;
  }

  return {
    verdict,
    headline,
    summary,
    checks,
    checkedCount: checks.length,
    disclaimer: 'This compares your answers with the eligibility criteria stored for this course only. It is not a prediction of admission, and it does not consider marks cut-offs, ranking, reservation category or seat availability. Confirm the official requirements with the college.',
    caveats: criteria.caveats || [],
  };
}

function describeSubjectGroup(group) {
  return group.anyOf
    .map((alt) => alt.map(subjectLabel).join(' + '))
    .join(' or ');
}

module.exports = {
  buildEligibilityCriteria,
  evaluateEligibility,
  // exported for tests
  detectQualification,
  detectSubjects,
  detectMinPercentage,
  detectEntranceExams,
  SUBJECTS,
  SUBJECT_GROUPS,
  QUALIFICATIONS,
};
