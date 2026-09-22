// School short re-assessment engine.
//
// Reuses the existing assessment architecture:
//   - AssessmentQuestion model for storage/retrieval (same schema as the admin
//     question bank used by AssessmentQuestion admin routes)
//   - the x.ai Grok generation pattern already used in grokAssessmentController
//   - the academic recommendation engine (buildAcademicRecommendations) to pick
//     the student's weakest subjects/topics to re-assess
//
// If suitable questions already exist in AssessmentQuestion they are reused;
// otherwise new ones are generated (Grok first, then a safe class-aware
// template fallback) and persisted so later check-ups reuse them.

const axios = require("axios");
const AssessmentQuestion = require("../models/AssessmentQuestion");

const GROK_API_KEY = process.env.GROK_API_KEY || "xai-JPHZZdSGepdkppoqz9vWnMBzmKwKdenngyfYaO08Wf3Mp0W0ddsapnTkQWD2hhdyTc28IrxnEMkUpbO0";
const GROK_TIMEOUT = 5000;

const SUPPORTED_CLASSES = ["5", "8", "10", "12"];
const DEFAULT_CLASS = "10";

const QUIZ_CATEGORIES = [
  "Logical Thinking",
  "Mathematics / Quantitative Ability",
  "Science Understanding",
  "Communication",
  "Creativity",
  "Career Interest",
  "Decision Making",
  "General Awareness",
];

// Same mapping the recommendation engine uses (subject -> quiz category).
const SUBJECT_TO_CATEGORY = {
  Mathematics: ["Mathematics / Quantitative Ability"],
  Science: ["Science Understanding"],
  English: ["Communication"],
  Communication: ["Communication"],
  "Logical Thinking": ["Logical Thinking"],
  "General Awareness": ["General Awareness"],
  "Decision Making": ["Decision Making"],
  Creativity: ["Creativity"],
  "Career Interest": ["Career Interest"],
};

const CATEGORY_TO_SUBJECTS = (() => {
  const out = {};
  for (const [subject, cats] of Object.entries(SUBJECT_TO_CATEGORY)) {
    for (const cat of cats) {
      if (!out[cat]) out[cat] = [];
      out[cat].push(subject);
    }
  }
  return out;
})();

const MAX_PLAN_SUBJECTS = 3;
const DEFAULT_QUESTIONS = 8;
const MIN_QUESTIONS_TOTAL = 5;

// ── Small helpers ─────────────────────────────────────────────────────────

const shuffle = (arr) => {
  const a = (arr || []).slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const randint = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

const normalizeClass = (level) => {
  const digits = String(level || "").match(/\d+/);
  const key = digits ? digits[0] : DEFAULT_CLASS;
  return SUPPORTED_CLASSES.includes(key) ? key : DEFAULT_CLASS;
};

const classifyBand = (pct) => {
  const v = Number.isFinite(Number(pct)) ? Number(pct) : 0;
  if (v < 40) return "Critical";
  if (v < 60) return "Weak";
  if (v < 75) return "Needs Practice";
  if (v < 90) return "Good";
  return "Excellent";
};

// Number magnitude used by the template fallback scales with the class level
// so classes 5/8/10/12 all get age-appropriate arithmetic.
const classRange = (classLevel) => {
  const bounds = {
    5: [1, 20],
    8: [5, 99],
    10: [20, 499],
    12: [100, 9999],
  };
  return bounds[classLevel] || bounds[DEFAULT_CLASS];
};

// ── Question plan ─────────────────────────────────────────────────────────

// Build a short plan targeting the student's weakest subjects (weakest first),
// using the recommendation engine's weakSubject/weakTopic output. Returns an
// array of { subject, category, topic, count } where the weakest subject gets
// the most questions.
const buildReassessmentPlan = ({ weakSubjects = [], weakTopics = [], questions = DEFAULT_QUESTIONS }) => {
  const total = Math.max(MIN_QUESTIONS_TOTAL, Number(questions) || DEFAULT_QUESTIONS);
  const top = weakSubjects.slice(0, MAX_PLAN_SUBJECTS);
  if (!top.length) return [];

  const targets = [];
  for (const m of top) {
    const level = m.level;
    const category = SUBJECT_TO_CATEGORY[level] ? SUBJECT_TO_CATEGORY[level][0] : QUIZ_CATEGORIES.includes(level) ? level : null;
    if (!category) continue;
    const subject = SUBJECT_TO_CATEGORY[level] ? level : CATEGORY_TO_SUBJECTS[level]?.[0] || level;
    const topic = (weakTopics || []).find((t) => t.subject === subject)?.topic || null;
    targets.push({ subject, category, topic });
  }
  if (!targets.length) return [];

  // Allocate counts weighted toward the weakest subject (3 : 2 : 1).
  const weights = targets.map((_, i) => targets.length - i);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const counts = weights.map((w) => Math.floor((total * w) / totalWeight));
  let used = counts.reduce((a, b) => a + b, 0);
  let rem = Math.max(0, total - used);
  for (let i = 0; rem > 0 && i < counts.length; i += 1) {
    counts[i] += 1;
    rem -= 1;
  }
  return targets.map((t, i) => ({ ...t, count: counts[i] }));
};

// ── Reuse bank or generate ────────────────────────────────────────────────

const fetchOrGenerateQuestions = async ({ classLevel, category, topic, count }) => {
  const bank = [];
  if (topic) {
    const tagged = await AssessmentQuestion.find({ classLevel, category, recommendationTag: topic })
      .limit(count * 2)
      .lean()
      .catch(() => []);
    bank.push(...tagged);
  }
  if (bank.length < count) {
    const relax = { classLevel, category, ...(topic ? { recommendationTag: { $ne: topic } } : {}) };
    const extra = await AssessmentQuestion.find(relax)
      .limit((count - bank.length) * 2)
      .lean()
      .catch(() => []);
    bank.push(...extra);
  }

  const used = shuffle(bank).slice(0, Math.min(count, bank.length));
  const need = Math.max(0, count - used.length);
  const generated = [];
  if (need > 0) {
    const raw = await generateSchoolQuestions({ classLevel, category, topic, count: need });
    for (const item of raw) {
      try {
        const doc = await AssessmentQuestion.create({
          classLevel,
          category,
          questionText: item.questionText,
          options: (item.options || []).map((text) => ({ text: String(text) })),
          correctAnswer: item.correctAnswer,
          recommendationTag: item.recommendationTag || topic || null,
          marks: typeof item.marks === "number" ? item.marks : 1,
        });
        generated.push(doc);
      } catch (err) {
        console.warn("schoolReassessmentService: skipping invalid generated question", err.message);
      }
    }
  }
  return { questions: shuffle([...used, ...generated]).slice(0, count), generatedCount: generated.length };
};

// ── Generation: Grok first, safe template fallback second ────────────────

const generateSchoolQuestions = async ({ classLevel, category, topic, count }) => {
  try {
    const raw = await askGrok({ classLevel, category, topic, count });
    const normalized = normalizeGrok(raw, { topic });
    if (normalized.length >= Math.min(3, count)) return normalized;
  } catch (err) {
    console.warn("schoolReassessmentService: Grok generation unavailable, using template fallback", err.message);
  }
  return buildFallbackQuestions({ classLevel, category, topic, count });
};

const askGrok = async ({ classLevel, category, topic, count }) => {
  const topicLine = topic ? ` specifically on the topic "${topic}"` : "";
  const prompt = `You are an expert CBSE-style multiple-choice assessment generator for SCHOOL students in Class ${classLevel}.
Generate exactly ${count} short multiple-choice questions in the skill area "${category}"${topicLine}.
Difficulty must be appropriate for a Class ${classLevel} student.

Return ONLY a valid JSON array of objects, no markdown formatting, no commentary.
Each object MUST have:
- "question": string (clear, concise question)
- "options": array of exactly 4 distinct string choices
- "correctIndex": integer (0 to 3) pointing to the correct option
- "explanation": string (brief one-sentence explanation)`;

  try {
    const grokResponse = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      {
        model: "grok-2-latest",
        messages: [
          { role: "system", content: "You are a specialized academic assessment generator. Respond strictly in raw valid JSON arrays." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      },
      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROK_API_KEY}` }, timeout: GROK_TIMEOUT }
    );
    const rawText = grokResponse.data?.choices?.[0]?.message?.content || "";
    const cleaned = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("schoolReassessmentService: x.ai Grok call failed, serving fallback:", err.message);
    return [];
  }
};

const normalizeGrok = (raw, { topic }) =>
  (raw || [])
    .map((q) => {
      const options = Array.isArray(q.options) ? q.options.map((o) => (o && o.text ? o.text : String(o))) : [];
      if (!q.question || options.length < 2) return null;
      let correctAnswer = "";
      const correctIndex = Number(q.correctIndex);
      if (q.correctAnswer && options.includes(q.correctAnswer)) {
        correctAnswer = q.correctAnswer;
      } else if (Number.isInteger(correctIndex) && options[correctIndex] != null) {
        correctAnswer = options[correctIndex];
      } else {
        correctAnswer = options[0];
      }
      if (!options.includes(correctAnswer)) return null;
      return {
        questionText: String(q.question).trim(),
        options,
        correctAnswer,
        recommendationTag: q.topic || topic || null,
        marks: 1,
      };
    })
    .filter(Boolean);

// ── Safe class-aware template fallback ────────────────────────────────────

const buildFallbackQuestions = ({ classLevel, category, topic, count }) => {
  const [lo, hi] = classRange(classLevel);
  const out = [];
  const text = `${String(topic || "")} ${String(category || "")}`.toLowerCase();

  const isMath = category && category.includes("Mathematics");
  const isLogic = category === "Logical Thinking";
  const isScience = category === "Science Understanding";
  const isCommunication = category === "Communication";
  const isAwareness = category === "General Awareness";

  const seen = new Set();

  // — Math: fully computed so the correct answer is always verifiable ———
  const makeMath = () => {
    if (/(algebra|equation|linear)/.test(text)) {
      const a = randint(lo, hi);
      const b = randint(a + 1, a + hi);
      const x = b - a;
      return mcq(
        `If x + ${a} = ${b}, what is the value of x?`,
        [String(x), String(x + 1), String(x - 1), String(x * 2)],
        0
      );
    }
    if (/(fraction)/.test(text)) {
      const den = randint(3, 9);
      const a = randint(den, lo + den);
      const c = randint(1, a - 1);
      return mcq(`What is ${a}/${den} − ${c}/${den}?`, [`${a - c}/${den}`, `${a + c}/${den}`, `${a}/${den + 1}`, `${a - c}/${den + 1}`], 0);
    }
    if (/(percentage|percent|percent)/.test(text)) {
      const p = randint(1, 9) * 10;
      const n = randint(1, 9) * 10;
      const ans = (p * n) / 100;
      return mcq(`What is ${p}% of ${n}?`, [String(ans), String(ans + 5), String(ans - 5), String(ans * 2)], 0);
    }
    if (/(ratio)/.test(text)) {
      const a = randint(lo, hi);
      let b = randint(lo, hi);
      if (b === a) b += 1;
      const g = gcd(a, b);
      return mcq(`Simplify the ratio ${a}:${b}.`, [`${a / g}:${b / g}`, `${a}:${b}`, `${b / g}:${a / g}`, `${(a * 2) / (g ? 1 : g)}:${b / g}`], 0);
    }
    if (/(sequence|pattern|series|number)/.test(text)) {
      const d = randint(1, 9);
      const s0 = randint(lo, hi);
      return mcq(`Find the next term in the sequence: ${s0}, ${s0 + d}, ${s0 + 2 * d}, …`, [String(s0 + 3 * d), String(s0 + d), String(s0 + 4 * d), String(s0 + 2 * d + 1)], 0);
    }
    const a = randint(lo, hi);
    const b = randint(lo, hi);
    const ans = a + b;
    return mcq(`What is ${a} + ${b}?`, [String(ans), String(ans + 1), String(ans - 1), String(ans + 2)], 0);
  };

  // — Logical thinking: number/letter pattern completion ———————
  const makeLogic = () => {
    const d = randint(1, 6);
    const s0 = randint(lo, Math.min(hi, 20));
    const ans = s0 + 3 * d;
    const seq = `${s0}, ${s0 + d}, ${s0 + 2 * d}`;
    return mcq(`Which number comes next in the pattern: ${seq}, … ?`, [String(ans), String(ans + 1), String(ans - 1), String(ans + 2)], 0);
  };

  // — Data-driven fact sets (controlled, always correct) ———————
  const scienceFacts = [
    { q: "Which gas do green plants absorb from the air during photosynthesis?", correct: "Carbon dioxide", wrong: ["Oxygen", "Nitrogen", "Hydrogen"] },
    { q: "What is the boiling point of water at sea level?", correct: "100°C", wrong: ["50°C", "75°C", "120°C"] },
    { q: "Which part of a plant conducts water to the leaves?", correct: "Stem", wrong: ["Root hair", "Petal", "Fruit"] },
    { q: "Which of these is a renewable source of energy?", correct: "Solar energy", wrong: ["Coal", "Petroleum", "Natural gas"] },
    { q: "What does a magnet use to attract iron?", correct: "Magnetic force", wrong: ["Gravity", "Friction", "Electric charge"] },
    { q: "Which planet in our solar system is known as the Red Planet?", correct: "Mars", wrong: ["Venus", "Jupiter", "Saturn"] },
    { q: "Water in the form of vapour rises and later falls as rain. This process is called the…", correct: "Water cycle", wrong: ["Food chain", "Rock cycle", "Life cycle"] },
    { q: "Which organ pumps blood around the human body?", correct: "Heart", wrong: ["Lungs", "Liver", "Kidney"] },
  ].map((i) => ({ question: i.q, correct: i.correct, options: [i.correct, ...i.wrong] }));

  const awarenessFacts = [
    { q: "Which is the national flower of India?", correct: "Lotus", wrong: ["Rose", "Lily", "Tulip"] },
    { q: "How many colours are there in a rainbow?", correct: "Seven", wrong: ["Five", "Six", "Eight"] },
    { q: "Which is the highest mountain peak in the world?", correct: "Mount Everest", wrong: ["K2", "Kangchenjunga", "Mount Kilimanjaro"] },
    { q: "Which city is the capital of India?", correct: "New Delhi", wrong: ["Mumbai", "Chennai", "Bengaluru"] },
    { q: "Which is the longest river in India?", correct: "Ganga", wrong: ["Yamuna", "Kaveri", "Godavari"] },
    { q: "How many weeks are there in a year?", correct: "52", wrong: ["48", "50", "56"] },
    { q: "Which festival is known as the festival of lights?", correct: "Diwali", wrong: ["Holi", "Pongal", "Eid"] },
    { q: "Which is the national animal of India?", correct: "Tiger", wrong: ["Lion", "Elephant", "Leopard"] },
  ].map((i) => ({ question: i.q, correct: i.correct, options: [i.correct, ...i.wrong] }));

  const vocab = [
    { word: "happy", correct: "joyful", wrong: ["angry", "sleepy", "thirsty"] },
    { word: "big", correct: "large", wrong: ["small", "thin", "light"] },
    { word: "quick", correct: "fast", wrong: ["slow", "lazy", "quiet"] },
    { word: "brave", correct: "courageous", wrong: ["timid", "weak", "gentle"] },
    { word: "gleam", correct: "shine", wrong: ["hide", "move", "wave"] },
    { word: "begin", correct: "start", wrong: ["stop", "finish", "pause"] },
    { word: "smart", correct: "clever", wrong: ["foolish", "silly", "slow"] },
    { word: "calm", correct: "peaceful", wrong: ["noisy", "angry", "busy"] },
  ].map((i) => ({ question: `Which word is closest in meaning to "${i.word}"?`, correct: i.correct, options: [...i.wrong, i.correct] }));

  const career = [
    { q: "Which career focuses mainly on designing safe, useful technology for daily life?", correct: "Engineering", wrong: ["Farming", "Accounting", "Transport"] },
    { q: "Which career helps people stay healthy and get treatment for illness?", correct: "Medicine", wrong: ["Law", "Journalism", "Retail"] },
    { q: "Which career mainly involves teaching and guiding students?", correct: "Education", wrong: ["Construction", "Film", "Banking"] },
    { q: "Which career mainly involves creating artwork, films or music?", correct: "Arts & Design", wrong: ["Civil Services", "Insurance", "Logistics"] },
  ].map((i) => ({ question: i.q, correct: i.correct, options: [i.correct, ...i.wrong] }));

  // — Pools for Decision Making / Creativity / generic categories ——————
  const decisionPool = [
    { q: "Before choosing between two study options, what is the most reliable first step?", correct: "Compare the likely results of each option", wrong: ["Pick the faster option", "Ask a friend to choose", "Choose whatever feels new"] },
    { q: "If you are falling behind in a subject, what is the best first action?", correct: "Identify the specific topic you find hardest", wrong: ["Skip the subject for a month", "Only study right before tests", "Ignore it and hope it improves"] },
    { q: "When preparing for a test, which plan is most effective?", correct: "Study a little each day and review weekly", wrong: ["Cram everything the night before", "Only read on weekends", "Memorise without practice"] },
    { q: "If two activities conflict and one helps your studies more, what should you do?", correct: "Prioritise the activity that supports your goal", wrong: ["Do both half-way every day", "Drop your goal", "Choose the more fun option"] },
    { q: "A good decision usually starts with…", correct: "Understanding the situation clearly", wrong: ["Guessing at once", "Copying others", "Waiting for luck"] },
  ].map((i) => ({ question: i.q, correct: i.correct, options: [i.correct, ...i.wrong] }));

  const creativityPool = [
    { q: "Which habit most strengthens creative thinking?", correct: "Exploring new ideas and connecting them", wrong: ["Memorising answers", "Repeating one method", "Avoiding questions"] },
    { q: "When facing a new problem, the best creative approach is to…", correct: "Try more than one possible solution", wrong: ["Use only the first idea", "Stop at the first failure", "Wait for an example"] },
    { q: "Variety in learning (images, stories, practice) helps because it…", correct: "Builds stronger mental connections", wrong: ["Fills up time", "Removes the need to study", "Makes tests easier to guess"] },
    { q: "A creative idea is most useful when it is…", correct: "Practical and original for the situation", wrong: ["Completely unrelated", "Hard to explain to anyone", "Copied exactly from others"] },
    { q: "What is the best way to improve at any skill?", correct: "Practise with regular feedback", wrong: ["Practise only once", "Watch others all the time", "Avoid tough parts"] },
  ].map((i) => ({ question: i.q, correct: i.correct, options: [i.correct, ...i.wrong] }));

  const genericPool = [
    { q: "Which approach most effectively builds lasting understanding of a subject?", correct: "Regular review with practice tests", wrong: ["Memorising without applying", "Skipping hard questions", "Studying only right before a test"] },
    { q: "After learning a new concept, the best way to remember it is to…", correct: "Apply it with practice problems", wrong: ["Copy it many times", "Read it once", "Avoid using it"] },
    { q: "When you are weak in one area, the most effective strategy is to…", correct: "Practice that area in small daily steps", wrong: ["Avoid it completely", "Wait for a big block of time", "Only revise right before a test"] },
    { q: "Tracking your own progress helps you to…", correct: "See what works and adjust your plan", wrong: ["Compare with strangers", "Skip practice", "Avoid weak spots"] },
    { q: "A balanced study session should include…", correct: "Revision, practice and a short quiz", wrong: ["Copying notes only", "Sleeping between tasks", "Reviewing nothing"] },
    { q: "What best supports long-term memory?", correct: "Revisiting topics over several days", wrong: ["Studying only once", "Rushing the syllabus", "Not testing yourself"] },
  ].map((i) => ({ question: i.q, correct: i.correct, options: [i.correct, ...i.wrong] }));

  const makeConcept = () => {
    const c = scienceFacts[randint(0, scienceFacts.length - 1)];
    const options = shuffle([...c.options]);
    return mcq(c.question, options, options.indexOf(c.correct));
  };
  const makeFromPool = (pool) => {
    const i = pool[randint(0, pool.length - 1)];
    const options = shuffle([...i.options]);
    return mcq(i.question, options, options.indexOf(i.correct));
  };

  let attempts = 0;
  while (out.length < count && attempts < count * 60) {
    attempts += 1;
    let q = null;
    if (isMath) q = makeMath();
    else if (isScience) q = makeConcept();
    else if (isCommunication) q = makeFromPool(vocab);
    else if (isAwareness) q = makeFromPool(awarenessFacts);
    else if (isLogic) q = makeLogic();
    else if (category === "Career Interest") q = makeFromPool(career, topic);
    else if (category === "Decision Making") q = makeFromPool(decisionPool, topic);
    else if (category === "Creativity") q = makeFromPool(creativityPool, topic);
    else q = makeFromPool(genericPool, topic);
    if (q) {
      if (!seen.has(q.questionText)) {
        seen.add(q.questionText);
        out.push(q);
      }
      continue;
    }
  }
  if (out.length < count) {
    console.warn(`schoolReassessmentService: fallback produced ${out.length}/${count} questions for ${category}`);
  }
  return out.slice(0, count).map((q) => ({ ...q, questionText: q.questionText, recommendationTag: topic || null, marks: 1 }));
};

const mcq = (questionText, options, correctIndex) => {
  const clean = [...new Set(options)].slice(0, 4);
  if (clean.length < 4) return null;
  return { questionText, options: clean, correctAnswer: clean[correctIndex], correctIndex };
};

module.exports = {
  buildReassessmentPlan,
  fetchOrGenerateQuestions,
  generateSchoolQuestions,
  buildFallbackQuestions,
  normalizeClass,
  classifyBand,
};