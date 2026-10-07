/**
 * Eligibility criteria parser + evaluator tests.
 *
 * The strings under test are the real, distinct `eligibility` values stored on
 * the Course collection, so these tests fail loudly if the stored data changes
 * shape.
 *
 * Run: node backend/tests/eligibilityCriteria.test.js
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildEligibilityCriteria,
  evaluateEligibility,
} = require('../utils/eligibilityCriteria');

/** Every distinct eligibility string currently stored on Course. */
const STORED = [
  { text: '12th Pass', n: 368 },
  { text: '12th Standard Pass', n: 335 },
  { text: '12th Standard with Physics, Chemistry, and Mathematics', n: 143 },
  { text: 'Passed 10+2 or equivalent examination with Physics, Chemistry and Mathematics from a recognized board.', n: 56 },
  { text: '12th Standard Pass (MPC)', n: 44 },
  { text: '10th Standard Pass', n: 38 },
  { text: '10th Pass', n: 37 },
  { text: 'Any Graduation', n: 12 },
  { text: '12th Pass with PCB', n: 10 },
  { text: '10+2 with Physics, Chemistry, Biology/Mathematics', n: 6 },
  { text: '12th Pass (Any stream)', n: 6 },
  { text: 'Passed 10+2 or equivalent from a recognized board (varies by course and college).', n: 4 },
  { text: '12th Pass with Commerce & Accountancy', n: 4 },
  { text: '12th Pass with PCB/PCM', n: 4 },
  { text: '12th Pass with Maths/CS', n: 3 },
  { text: '12th Pass (Any stream) with min 45%', n: 2 },
  { text: '12th Standard with Physics, Chemistry, Biology', n: 2 },
  { text: '12th Pass with Maths + NATA', n: 2 },
  { text: '10+2 with PCB/PCM', n: 1 },
  { text: '12th Pass with PCB + NEET', n: 1 },
  { text: '12th Pass with Physics, Chemistry, Biology/Botany & Zoology + NEET', n: 1 },
  { text: '12th Pass with Maths (Min 50%) + NATA/JEE Paper 2', n: 1 },
  { text: '12th Pass with Commerce', n: 1 },
  { text: 'B.Arch Pass', n: 1 },
];

const criteria = (text, level = '') => buildEligibilityCriteria({ eligibility: text, level });
const ids = (subjects) => subjects.groups.map((g) => g.anyOf.map((a) => a.join('+')).join('|'));

/* ── Every stored string must be interpretable ─────────────── */

test('all 24 stored eligibility strings produce checkable criteria', () => {
  for (const { text } of STORED) {
    const c = criteria(text);
    assert.equal(c.determinable, true, `not determinable: ${text}`);
    assert.ok(c.questions.length > 0, `no questions for: ${text}`);
  }
});

test('stored coverage adds up to the full course count', () => {
  const total = STORED.reduce((n, s) => n + s.n, 0);
  assert.equal(total, 1082);
});

/* ── Qualification ────────────────────────────────────────── */

test('qualification is detected per course, not globally', () => {
  assert.equal(criteria('12th Pass').qualification.key, 'after12th');
  assert.equal(criteria('12th Standard Pass').qualification.key, 'after12th');
  assert.equal(criteria('10th Pass').qualification.key, 'after10th');
  assert.equal(criteria('10th Standard Pass').qualification.key, 'after10th');
  assert.equal(criteria('Passed 10+2 or equivalent examination...').qualification.key, 'after12th');
  assert.equal(criteria('Any Graduation').qualification.key, 'graduation');
  assert.equal(criteria('B.Arch Pass').qualification.key, 'barch');
});

test('10+2 is read as after-12th, never as 10th', () => {
  assert.equal(criteria('10+2 with PCB/PCM').qualification.key, 'after12th');
});

test('level is only a fallback and is flagged as such', () => {
  const fromText = criteria('12th Pass', 'undergraduate');
  assert.equal(fromText.qualification.fromText, true);
  assert.deepEqual(fromText.caveats, []);

  const fromLevel = criteria('Pass required', 'after10th');
  assert.equal(fromLevel.qualification.key, 'after10th');
  assert.equal(fromLevel.qualification.fromText, false);
  assert.ok(fromLevel.caveats.some((c) => /course level/i.test(c)));
});

/* ── Subject requirements ─────────────────────────────────── */

test('"12th Pass" asks for no subjects at all', () => {
  const c = criteria('12th Pass');
  assert.equal(c.subjects, null);
  assert.deepEqual(c.questions.map((q) => q.id), ['qualification']);
});

test('comma / and lists become a single all-of requirement', () => {
  assert.deepEqual(
    ids(criteria('12th Standard with Physics, Chemistry, and Mathematics').subjects),
    ['physics+chemistry+maths']
  );
});

test('the MPC acronym expands to its three subjects', () => {
  assert.deepEqual(ids(criteria('12th Standard Pass (MPC)').subjects), ['maths+physics+chemistry']);
});

test('a slash between two subjects is an either/or alternative', () => {
  assert.deepEqual(
    ids(criteria('10+2 with Physics, Chemistry, Biology/Mathematics').subjects),
    ['physics+chemistry+biology|maths']
  );
  assert.deepEqual(ids(criteria('12th Pass with Maths/CS').subjects), ['maths|computerscience']);
});

test('group acronyms are alternatives, not a merge of both', () => {
  assert.deepEqual(
    ids(criteria('12th Pass with PCB/PCM').subjects),
    ['physics+chemistry+biology|physics+chemistry+maths']
  );
});

test('AND binds tighter than OR (biology OR botany+zoology)', () => {
  assert.deepEqual(
    ids(criteria('12th Pass with Physics, Chemistry, Biology/Botany & Zoology + NEET').subjects),
    ['physics+chemistry+biology|botany+zoology']
  );
});

test('commerce and accountancy are both required', () => {
  assert.deepEqual(ids(criteria('12th Pass with Commerce & Accountancy').subjects), ['commerce+accountancy']);
  assert.deepEqual(ids(criteria('12th Pass with Commerce').subjects), ['commerce']);
});

/* ── Marks ────────────────────────────────────────────────── */

test('minimum percentage is read only when the text states one', () => {
  assert.equal(criteria('12th Pass (Any stream) with min 45%').minPercentage, 45);
  assert.equal(criteria('12th Pass with Maths (Min 50%) + NATA/JEE Paper 2').minPercentage, 50);
  assert.equal(criteria('12th Pass').minPercentage, null);
});

test('no percentage question is asked when no minimum is stored', () => {
  const c = criteria('12th Standard with Physics, Chemistry, and Mathematics');
  assert.ok(!c.questions.some((q) => q.id === 'percentage'));
});

/* ── Entrance exams ───────────────────────────────────────── */

test('a single entrance exam is required, not optional', () => {
  const c = criteria('12th Pass with PCB + NEET');
  assert.equal(c.entranceExams.mode, 'all');
  assert.deepEqual(c.entranceExams.exams.map((e) => e.id), ['neet']);
});

test('slash between entrance exams means any one of them', () => {
  const c = criteria('12th Pass with Maths (Min 50%) + NATA/JEE Paper 2');
  assert.equal(c.entranceExams.mode, 'any');
  assert.deepEqual(c.entranceExams.exams.map((e) => e.id).sort(), ['jee_paper2', 'nata']);
});

test('the generic JEE entry is not offered alongside JEE Paper 2', () => {
  const c = criteria('12th Pass with Maths (Min 50%) + NATA/JEE Paper 2');
  assert.ok(!c.entranceExams.exams.some((e) => e.id === 'jee_main'));
});

/* ── Only the needed questions are asked ──────────────────── */

test('questions match the criteria, nothing extra', () => {
  assert.deepEqual(criteria('12th Pass').questions.map((q) => q.id), ['qualification']);
  assert.deepEqual(criteria('10th Pass').questions.map((q) => q.id), ['qualification']);
  assert.deepEqual(
    criteria('12th Standard with Physics, Chemistry, and Mathematics').questions.map((q) => q.id),
    ['qualification', 'subjects']
  );
  assert.deepEqual(
    criteria('12th Pass with Maths (Min 50%) + NATA/JEE Paper 2').questions.map((q) => q.id),
    ['qualification', 'subjects', 'percentage', 'entrance']
  );
  assert.deepEqual(
    criteria('12th Pass with PCB + NEET').questions.map((q) => q.id),
    ['qualification', 'subjects', 'entrance']
  );
});

test('subject question lists exactly the subjects that are required', () => {
  const c = criteria('10+2 with Physics, Chemistry, Biology/Mathematics');
  const q = c.questions.find((x) => x.id === 'subjects');
  assert.deepEqual(q.options.map((o) => o.value).sort(), ['biology', 'chemistry', 'maths', 'physics']);
});

/* ── Undeterminable input ─────────────────────────────────── */

test('a course with no eligibility text cannot be determined', () => {
  const c = criteria('');
  assert.equal(c.determinable, false);
  assert.match(c.reason, /no eligibility criteria stored/i);
  assert.equal(c.questions.length, 0);
});

test('uninterpretable text cannot be determined', () => {
  const c = criteria('!!! ???');
  assert.equal(c.determinable, false);
  assert.match(c.reason, /cannot be determined/i);
});

/* ── Evaluation ───────────────────────────────────────────── */

test('eligible when every stored requirement is met', () => {
  const c = criteria('12th Standard with Physics, Chemistry, and Mathematics');
  const r = evaluateEligibility(c, { qualification: 'passed', subjects: ['physics', 'chemistry', 'maths'] });
  assert.equal(r.verdict, 'eligible');
  assert.match(r.headline, /Eligible based on the available criteria/i);
  assert.ok(r.checks.every((x) => x.status === 'met'));
  assert.match(r.disclaimer, /not a prediction of admission/i);
});

test('not eligible when one requirement fails', () => {
  const c = criteria('12th Standard with Physics, Chemistry, and Mathematics');
  const r = evaluateEligibility(c, { qualification: 'passed', subjects: ['physics', 'chemistry'] });
  assert.equal(r.verdict, 'not-eligible');
  const failed = r.checks.filter((x) => x.status === 'not-met');
  assert.equal(failed.length, 1);
  assert.match(failed[0].detail, /mathematics/i);
});

test('either/or alternative satisfies the requirement', () => {
  const c = criteria('10+2 with Physics, Chemistry, Biology/Mathematics');
  assert.equal(
    evaluateEligibility(c, { qualification: 'passed', subjects: ['physics', 'chemistry', 'maths'] }).verdict,
    'eligible'
  );
  assert.equal(
    evaluateEligibility(c, { qualification: 'passed', subjects: ['physics', 'chemistry', 'biology'] }).verdict,
    'eligible'
  );
  assert.equal(
    evaluateEligibility(c, { qualification: 'passed', subjects: ['physics', 'chemistry'] }).verdict,
    'not-eligible'
  );
});

test('missing answers yield unable-to-determine, never a guess', () => {
  const c = criteria('12th Pass with Maths (Min 50%) + NATA/JEE Paper 2');
  const r = evaluateEligibility(c, {});
  assert.equal(r.verdict, 'unable-to-determine');
  assert.ok(r.checks.some((x) => x.status === 'unknown'));
});

test('a not-met requirement outranks an unknown one', () => {
  const c = criteria('12th Standard with Physics, Chemistry, and Mathematics');
  const r = evaluateEligibility(c, { qualification: 'not-yet' });
  assert.equal(r.verdict, 'not-eligible');
});

test('unsure counts as unknown, not as met or failed', () => {
  const r = evaluateEligibility(criteria('12th Pass'), { qualification: 'unsure' });
  assert.equal(r.verdict, 'unable-to-determine');
});

test('percentage is compared numerically, including at the boundary', () => {
  const c = criteria('12th Pass (Any stream) with min 45%');
  assert.equal(evaluateEligibility(c, { qualification: 'passed', percentage: 45 }).verdict, 'eligible');
  assert.equal(evaluateEligibility(c, { qualification: 'passed', percentage: '44.9' }).verdict, 'not-eligible');
  assert.equal(evaluateEligibility(c, { qualification: 'passed', percentage: 76 }).verdict, 'eligible');
});

test('entrance exam: any-of accepts one, all-of demands the single one', () => {
  const anyOf = criteria('12th Pass with Maths (Min 50%) + NATA/JEE Paper 2');
  const base = { qualification: 'passed', subjects: ['maths'], percentage: 60 };
  assert.equal(evaluateEligibility(anyOf, { ...base, entrance: ['nata'] }).verdict, 'eligible');
  assert.equal(evaluateEligibility(anyOf, { ...base, entrance: ['jee_paper2'] }).verdict, 'eligible');
  assert.equal(evaluateEligibility(anyOf, { ...base, entrance: [] }).verdict, 'unable-to-determine');

  const required = criteria('12th Pass with PCB + NEET');
  const rb = { qualification: 'passed', subjects: ['physics', 'chemistry', 'biology'] };
  assert.equal(evaluateEligibility(required, { ...rb, entrance: ['neet'] }).verdict, 'eligible');
});

test('the same answers give different verdicts for different courses', () => {
  const answers = { qualification: 'passed', subjects: ['physics', 'chemistry'] };
  const arts = criteria('12th Pass');                                   // no subject requirement
  const engineering = criteria('12th Standard with Physics, Chemistry, and Mathematics');
  assert.equal(evaluateEligibility(arts, answers).verdict, 'eligible');
  assert.equal(evaluateEligibility(engineering, answers).verdict, 'not-eligible');
});

test('a course needing only 10th does not demand 12th subjects', () => {
  const r = evaluateEligibility(criteria('10th Standard Pass'), { qualification: 'passed' });
  assert.equal(r.verdict, 'eligible');
  assert.equal(r.checks.length, 1);
});

test('graduation courses are not checked against 12th answers', () => {
  const r = evaluateEligibility(criteria('Any Graduation'), { qualification: 'passed' });
  assert.equal(r.verdict, 'eligible');
  assert.match(r.checks[0].label, /graduation degree/i);
});
