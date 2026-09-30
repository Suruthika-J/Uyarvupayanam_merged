// ─────────────────────────────────────────────────────────────────────────────
// Maths Missions — Class 8 structured topic data
// ─────────────────────────────────────────────────────────────────────────────
// The whole Class 8 Maths Missions curriculum is DATA, not hand-written pages.
// Adding a topic or a concept in a later phase = adding one entry here (and
// marking `implemented: true` once its steps exist). No routing or page
// changes are required for new content.
//
// Model
//   topic
//     id, name, tagline, order, difficulty, accent, icon
//     levels[5]           — the five missions of every topic:
//                           1 Understand · 2 Practice · 3 Apply · 4 Challenge · 5 Master
//     missions[]          — concept chains inside the topic. Each chain is the
//                           6-step learning flow (concept → example → easy →
//                           practice → real-life → boss). Chain steps map onto
//                           the topic's five levels: steps 1-2 → Level 1,
//                           step 3 → Level 2, step 4 → Level 3,
//                           step 5 → Level 4, step 6 → Level 5.
//     implemented         — true once a mission chain contains real steps.
//     reward              — achievement card name shown when the topic is completed.
//
// The first Fractions chain ("Understanding Fractions") is fully built so the
// feature is playable end-to-end in this phase; every other topic and every
// future Fractions concept is declared here so the map, cards and progress
// totals are real and future phases only add content.

import {
  FiDivide, FiHash, FiGrid, FiLayers, FiTrendingUp, FiPercent,
  FiTriangle, FiBox, FiBarChart2, FiZap, FiSquare, FiPackage,
  FiHelpCircle, FiTool, FiActivity,
} from 'react-icons/fi'

export const LEVELS = [
  { id: 1, name: 'Understand',    desc: 'See the idea and a worked example' },
  { id: 2, name: 'Practice',      desc: 'Try an easy question' },
  { id: 3, name: 'Apply',         desc: 'Solve a slightly harder one' },
  { id: 4, name: 'Challenge',     desc: 'Solve a real-life situation' },
  { id: 5, name: 'Master Mission',desc: 'Prove the skill on the boss mission' },
]

export const MISTAKE_TYPES = [
  'sign_error',
  'calculation_error',
  'formula_selection_error',
  'concept_misunderstanding',
  'wrong_operation',
  'wrong_step_order',
  'word_problem_interpretation',
  'unit_conversion_error',
  'arithmetic_mistake',
]

// ── Fractions — Understanding Fractions (complete 6-step chain) ─────────────
const UNDERSTANDING_FRACTIONS = {
  id: 'understanding-fractions',
  name: 'Understanding Fractions',
  concept: 'fractions',
  short: 'What a fraction means, what the two numbers tell you, and how equal parts work.',
  implemented: true,
  steps: [
    // STEP 1 — Concept Introduction (Level 1 · Understand)
    {
      kind: 'concept',
      title: 'Understand',
      heading: 'What is a fraction?',
      body: 'A fraction shows a part of a whole. The whole is divided into equal parts, and a fraction tells us how many of those parts we are talking about.',
      visual: { kind: 'fractionBar', total: 4, shaded: 3, label: '3 selected out of 4 equal parts' },
      points: [
        'The bottom number is the denominator. It counts the equal parts the whole is split into.',
        'The top number is the numerator. It counts the shaded or chosen parts.',
      ],
      note: 'In 3/4, the whole is split into 4 equal parts and we select 3 of them.',
    },
    // STEP 2 — Simple Example (Level 1 · Understand)
    {
      kind: 'example',
      title: 'Understand',
      heading: 'A simple example',
      body: 'A chocolate bar is cut into 4 equal pieces. You eat 3 of them. You ate 3 out of 4 equal pieces.',
      visual: { kind: 'fractionBar', total: 4, shaded: 3, label: '3/4 — numerator 3 (pieces eaten), denominator 4 (equal pieces in the whole bar)' },
      exampleLine: 'Numerator = 3 (the part we are talking about). Denominator = 4 (the equal pieces the bar was cut into).',
    },
    // STEP 3 — Easy Challenge (Level 2 · Practice)
    {
      kind: 'challenge',
      level: 'easy',
      type: 'mcq',
      title: 'Practice',
      heading: 'Easy challenge',
      prompt: 'A sandwich is cut into 4 equal pieces and you eat 3. Which fraction shows the part you ate?',
      visual: { kind: 'fractionBar', total: 4, shaded: 3, label: '4 equal pieces, 3 eaten' },
      options: ['3/4', '4/3', '1/4', '3/1'],
      answer: '3/4',
      hint1: 'The whole sandwich is divided into 4 equal pieces, so the bottom number is 4.',
      hint2: 'You ate 3 pieces, so the top number is 3. That gives 3/4.',
      explanation: 'The whole is split into 4 equal pieces (denominator 4) and you took 3 of them (numerator 3), so the fraction is 3/4.',
      positive: 'Correct. You understood the idea.',
      gentle: 'Not quite. Let us look at the step where things changed.',
      mistakeType: 'concept_misunderstanding',
    },
    // STEP 4 — Practice Challenge (Level 3 · Apply)
    {
      kind: 'challenge',
      level: 'medium',
      type: 'direct',
      title: 'Apply',
      heading: 'Practice challenge',
      prompt: 'A rectangle is divided into 5 equal strips and 2 strips are shaded. Type the fraction that shows the shaded part.',
      placeholder: 'e.g. 3/4',
      accept: ['2/5'],
      hint1: 'Count the equal parts the whole is divided into — that is the bottom number.',
      hint2: 'Count the shaded strips — that is the top number. Write it as top/bottom.',
      explanation: 'There are 5 equal strips (denominator 5) and 2 are shaded (numerator 2), so the fraction is 2/5.',
      positive: 'Correct. You are reading fractions like a pro.',
      gentle: 'Not quite. Let us check how we count the two numbers of a fraction.',
      mistakeType: 'concept_misunderstanding',
    },
    // STEP 5 — Real-life Challenge (Level 4 · Challenge)
    {
      kind: 'challenge',
      level: 'real',
      type: 'mcq',
      title: 'Challenge',
      heading: 'Real-life challenge',
      prompt: 'A pizza is cut into 8 equal slices. 5 slices are served and 3 are left. Which fraction shows the slices still on the plate?',
      visual: { kind: 'fractionBar', total: 8, shaded: 3, label: '8 equal slices, 3 left' },
      options: ['5/8', '3/8', '8/3', '5/3'],
      answer: '3/8',
      hint1: 'The whole pizza has 8 equal slices, so the bottom number is 8.',
      hint2: 'We are asked about the slices still on the plate — that is 3, not 5. So the top number is 3.',
      explanation: 'The pizza was cut into 8 equal slices (denominator 8). 3 slices are left (numerator 3), so the fraction is 3/8.',
      positive: 'Correct. You connected the story to the fraction.',
      gentle: 'Not quite. We are counting the slices left, not the slices served.',
      mistakeType: 'word_problem_interpretation',
    },
    // STEP 6 — Boss Mission (Level 5 · Master Mission)
    {
      kind: 'boss',
      level: 'boss',
      type: 'mcq',
      title: 'Master Mission',
      heading: 'Boss mission',
      prompt: 'Ravi paints 1/4 of a wall on Monday and 1/4 of the same wall on Tuesday. What fraction of the wall has he painted?',
      visual: { kind: 'fractionBar', total: 4, shaded: 2, label: '1/4 + 1/4 = 2/4 = 1/2 of the wall' },
      options: ['1/4', '1/2', '1/8', '3/4'],
      answer: '1/2',
      hint1: 'He painted 1 part on Monday and 1 part on Tuesday out of 4 equal parts — that is 2 equal parts in total.',
      hint2: '2 out of 4 equal parts can be written in a simpler way: 2/4 is the same as 1/2.',
      explanation: '1/4 + 1/4 = 2/4, and 2 of 4 equal parts is exactly half the wall, so the answer is 1/2.',
      positive: 'Correct. You mastered equivalent fractions in a real situation.',
      gentle: 'Not quite. Add the two painted parts first, then look for the simpler name for 2/4.',
      mistakeType: 'wrong_operation',
    },
  ],
}

// ── Fractions — remaining concept chains (declared, built in a later phase) ─
const FRACTIONS_PLANNED = [
  { id: 'equivalent-fractions', name: 'Equivalent Fractions', concept: 'fractions', short: 'Different fractions that name the same amount, like 2/4 and 1/2.', implemented: false },
  { id: 'adding-fractions', name: 'Adding Fractions', concept: 'fractions', short: 'Adding fractions with the same and different denominators.', implemented: false },
  { id: 'subtracting-fractions', name: 'Subtracting Fractions', concept: 'fractions', short: 'Taking one fraction away from another, step by step.', implemented: false },
  { id: 'multiplying-fractions', name: 'Multiplying Fractions', concept: 'fractions', short: 'Multiplying numerators, multiplying denominators.', implemented: false },
  { id: 'dividing-fractions', name: 'Dividing Fractions', concept: 'fractions', short: 'Why division becomes multiplication by the reciprocal.', implemented: false },
  { id: 'fraction-word-problems', name: 'Fraction Word Problems', concept: 'fractions', short: 'Problem Detective missions with fractions in real stories.', implemented: false },
]

// ── Curriculum (15 topics) ──────────────────────────────────────────────────
// Unlock rule: topic 1 is open; every later topic unlocks when the previous
// topic is completed. Locked cards stay visible so students can see the path.
export const MATHS_TOPICS = [
  {
    id: 'fractions',
    order: 1,
    name: 'Fractions',
    tagline: 'Parts of a whole — the foundation of so much of Maths.',
    difficulty: 'Foundation',
    accent: '#1a7a50',
    icon: FiDivide,
    reward: 'Fraction Explorer',
    implemented: true,
    levels: LEVELS,
    missions: [UNDERSTANDING_FRACTIONS, ...FRACTIONS_PLANNED],
  },
  {
    id: 'integers',
    order: 2,
    name: 'Integers',
    tagline: 'Positive and negative numbers, and what happens when they meet.',
    difficulty: 'Foundation',
    accent: '#047857',
    icon: FiHash,
    reward: 'Integer Solver',
    implemented: false,
    levels: LEVELS,
    missions: [],
  },
  {
    id: 'algebra',
    order: 3,
    name: 'Algebra',
    tagline: 'Letters in Maths — use variables to think in general.',
    difficulty: 'Core',
    accent: '#0284c7',
    icon: FiGrid,
    reward: 'Algebra Starter',
    implemented: false,
    levels: LEVELS,
    missions: [],
  },
  {
    id: 'algebraic-expressions',
    order: 4,
    name: 'Algebraic Expressions',
    tagline: 'Like terms, unlike terms and tidying up expressions.',
    difficulty: 'Core',
    accent: '#2563eb',
    icon: FiLayers,
    reward: 'Expression Navigator',
    implemented: false,
    levels: LEVELS,
    missions: [],
  },
  {
    id: 'linear-equations',
    order: 5,
    name: 'Linear Equations',
    tagline: 'Unknowns, and keeping both sides of the balance equal.',
    difficulty: 'Core',
    accent: '#475569',
    icon: FiTrendingUp,
    reward: 'Equation Master',
    implemented: false,
    levels: LEVELS,
    missions: [],
  },
  {
    id: 'ratio-and-proportion',
    order: 6,
    name: 'Ratio and Proportion',
    tagline: 'Comparing amounts and keeping relationships in step.',
    difficulty: 'Core',
    accent: '#059669',
    icon: FiActivity,
    reward: 'Ratio Specialist',
    implemented: false,
    levels: LEVELS,
    missions: [],
  },
  {
    id: 'percentage',
    order: 7,
    name: 'Percentage',
    tagline: 'Per hundred — discounts, marks, profit and loss.',
    difficulty: 'Core',
    accent: '#d97706',
    icon: FiPercent,
    reward: 'Percent Partner',
    implemented: false,
    levels: LEVELS,
    missions: [],
  },
  {
    id: 'geometry',
    order: 8,
    name: 'Geometry',
    tagline: 'Shapes, angles and the rules that hold them together.',
    difficulty: 'Core',
    accent: '#7c3aed',
    icon: FiTriangle,
    reward: 'Geometry Guide',
    implemented: false,
    levels: LEVELS,
    missions: [],
  },
  {
    id: 'mensuration',
    order: 9,
    name: 'Mensuration',
    tagline: 'Choosing the right formula to measure areas and volumes.',
    difficulty: 'Advanced',
    accent: '#ea580c',
    icon: FiBox,
    reward: 'Measurement Master',
    implemented: false,
    levels: LEVELS,
    missions: [],
  },
  {
    id: 'data-handling',
    order: 10,
    name: 'Data Handling',
    tagline: 'Reading graphs and tables before calculating anything.',
    difficulty: 'Foundation',
    accent: '#0891b2',
    icon: FiBarChart2,
    reward: 'Data Detective',
    implemented: false,
    levels: LEVELS,
    missions: [],
  },
  {
    id: 'exponents-and-powers',
    order: 11,
    name: 'Exponents and Powers',
    tagline: 'Repeated multiplication and the rules that make it fast.',
    difficulty: 'Core',
    accent: '#ca8a04',
    icon: FiZap,
    reward: 'Power Player',
    implemented: false,
    levels: LEVELS,
    missions: [],
  },
  {
    id: 'squares-and-square-roots',
    order: 12,
    name: 'Squares and Square Roots',
    tagline: 'Perfect squares and the root that brings them back.',
    difficulty: 'Core',
    accent: '#16a34a',
    icon: FiSquare,
    reward: 'Root Finder',
    implemented: false,
    levels: LEVELS,
    missions: [],
  },
  {
    id: 'cubes-and-cube-roots',
    order: 13,
    name: 'Cubes and Cube Roots',
    tagline: 'Perfect cubes and their cube roots, with less familiar numbers.',
    difficulty: 'Advanced',
    accent: '#9333ea',
    icon: FiPackage,
    reward: 'Cube Captain',
    implemented: false,
    levels: LEVELS,
    missions: [],
  },
  {
    id: 'word-problems',
    order: 14,
    name: 'Word Problems',
    tagline: 'Problem Detective — given, find, concept, equation, solve, check.',
    difficulty: 'Advanced',
    accent: '#f59e0b',
    icon: FiHelpCircle,
    reward: 'Problem Solver',
    implemented: false,
    levels: LEVELS,
    missions: [],
  },
  {
    id: 'construction',
    order: 15,
    name: 'Construction',
    tagline: 'Drawing precise shapes with a compass and ruler, step by step.',
    difficulty: 'Advanced',
    accent: '#334155',
    icon: FiTool,
    reward: 'Construction Champion',
    implemented: false,
    levels: LEVELS,
    missions: [],
  },
]

export const getMathsTopics = () => MATHS_TOPICS

export function getMathsTopic(topicId) {
  return MATHS_TOPICS.find((t) => t.id === topicId) || null
}

export function getMathsMission(topicId, missionId) {
  const topic = getMathsTopic(topicId)
  if (!topic) return null
  const mission = (topic.missions || []).find((m) => m.id === missionId) || null
  return mission
}

// Missions that a student can actually play right now (implemented chains).
export function getImplementedMissions(topic) {
  return (topic.missions || []).filter((m) => m.implemented)
}

// ── Scoring constants (kept next to the content for the later API swap) ─────
export const SCORING = {
  correctNoHint: 10,
  correctWithHint: 5,
  bossNoHint: 20,
  bossWithHint: 10,
  missionCompleteBonus: 25,
  topicCompleteBonus: 50,
}