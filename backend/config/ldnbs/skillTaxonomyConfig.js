// backend/config/ldnbs/skillTaxonomyConfig.js
//
// LD-NBSE knowledge base: per-grade skill/subskill taxonomy, the diagnostic
// assessment blueprints (15–20 questions, class-specific — Part 21), the
// skill dependency graph (Part 8) and the mini interest bank (Part 10).
//
// This file is the single source of truth that gets seeded into
// skill_taxonomy + skill_dependencies so admins can edit it via the API.
"use strict";

// ────────────────────────────────────────────────────────────────────────────
// Skill → subskill taxonomy per grade
// ────────────────────────────────────────────────────────────────────────────
const TAXONOMY = {
    "Class 5": {
        Mathematics: ["numberSense", "arithmetic", "basicFractions"],
        English: ["vocabulary", "basicReading", "sentenceFormation"],
        "Logical Thinking": ["patternRecognition", "classification"],
        Science: ["observation", "causeEffect"],
        "General Knowledge": ["generalAwareness"],
        Creativity: ["ideaGeneration", "expression"],
        Communication: ["comprehension", "expression"],
    },
    "Class 8": {
        Mathematics: ["numberSense", "arithmetic", "percentage", "ratio", "algebraicThinking", "dataInterpretation"],
        English: ["vocabulary", "grammar", "readingComprehension", "inference"],
        "Logical Thinking": ["patternRecognition", "deduction", "analyticalReasoning"],
        Science: ["interpretation", "scientificReasoning", "application"],
        Communication: ["comprehension", "communicationClarity"],
    },
    "Class 10": {
        Mathematics: ["algebraicThinking", "percentage", "ratio", "dataInterpretation", "mathematicalReasoning"],
        English: ["readingComprehension", "inference", "writtenCommunication"],
        "Logical Thinking": ["patternRecognition", "analyticalReasoning", "problemSolving"],
        Science: ["interpretation", "scientificReasoning", "application"],
        Communication: ["comprehension", "communicationClarity"],
    },
    "Class 12": {
        Mathematics: ["algebraicThinking", "dataInterpretation", "mathematicalReasoning", "advancedProblemSolving"],
        English: ["readingComprehension", "inference", "writtenCommunication"],
        "Logical Thinking": ["patternRecognition", "deduction", "analyticalReasoning"],
        Science: ["interpretation", "scientificReasoning", "application", "higherOrderThinking"],
        Communication: ["comprehension", "communicationClarity"],
    },
};

// ────────────────────────────────────────────────────────────────────────────
// Diagnostic blueprints per grade.
// row = { skill, subskill, cognitiveType, difficulty, weight, count }
// Totals stay inside the 15–20 question band (Part 1). Each row is a request
// to the question generator (LLM or static bank) for `count` questions
// carrying the given metadata.
// ────────────────────────────────────────────────────────────────────────────
const BLUEPRINTS = {
    // Rule: CORE subskills get TWO metadata rows (2 questions, different
    // difficulty/cognitive mix) so statuses can be judged (min evidence = 2).
    // Non-core subskills are screened in later (reassessment/next) cycles so
    // the pass-1 total stays inside the 15–20 question band (Part 1).
    "Class 5": [
        { skill: "Mathematics", subskill: "numberSense", cognitiveType: "recall", difficulty: "easy", weight: 1, count: 1 },
        { skill: "Mathematics", subskill: "numberSense", cognitiveType: "understanding", difficulty: "medium", weight: 1, count: 1 },
        { skill: "Mathematics", subskill: "arithmetic", cognitiveType: "application", difficulty: "medium", weight: 2, count: 1 },
        { skill: "Mathematics", subskill: "arithmetic", cognitiveType: "problem_solving", difficulty: "hard", weight: 2, count: 1 },
        { skill: "English", subskill: "vocabulary", cognitiveType: "recall", difficulty: "easy", weight: 1, count: 1 },
        { skill: "English", subskill: "basicReading", cognitiveType: "interpretation", difficulty: "medium", weight: 2, count: 1 },
        { skill: "English", subskill: "basicReading", cognitiveType: "interpretation", difficulty: "hard", weight: 2, count: 1 },
        { skill: "English", subskill: "sentenceFormation", cognitiveType: "application", difficulty: "medium", weight: 1, count: 1 },
        { skill: "Logical Thinking", subskill: "patternRecognition", cognitiveType: "pattern_recognition", difficulty: "easy", weight: 1, count: 1 },
        { skill: "Logical Thinking", subskill: "classification", cognitiveType: "reasoning", difficulty: "medium", weight: 2, count: 1 },
        { skill: "Logical Thinking", subskill: "classification", cognitiveType: "reasoning", difficulty: "hard", weight: 2, count: 1 },
        { skill: "Science", subskill: "observation", cognitiveType: "recall", difficulty: "easy", weight: 1, count: 1 },
        { skill: "Science", subskill: "causeEffect", cognitiveType: "reasoning", difficulty: "medium", weight: 2, count: 1 },
        { skill: "Science", subskill: "causeEffect", cognitiveType: "reasoning", difficulty: "hard", weight: 2, count: 1 },
        { skill: "General Knowledge", subskill: "generalAwareness", cognitiveType: "recall", difficulty: "easy", weight: 1, count: 1 },
        { skill: "Creativity", subskill: "ideaGeneration", cognitiveType: "understanding", difficulty: "medium", weight: 1, count: 1 },
        { skill: "Creativity", subskill: "expression", cognitiveType: "communication", difficulty: "medium", weight: 1, count: 1 },
        { skill: "Communication", subskill: "comprehension", cognitiveType: "interpretation", difficulty: "medium", weight: 2, count: 1 },
        { skill: "Communication", subskill: "comprehension", cognitiveType: "interpretation", difficulty: "easy", weight: 1, count: 1 },
        { skill: "Communication", subskill: "expression", cognitiveType: "communication", difficulty: "easy", weight: 1, count: 1 },
    ],
    "Class 8": [
        { skill: "Mathematics", subskill: "numberSense", cognitiveType: "recall", difficulty: "easy", weight: 1, count: 1 },
        { skill: "Mathematics", subskill: "numberSense", cognitiveType: "understanding", difficulty: "medium", weight: 1, count: 1 },
        { skill: "Mathematics", subskill: "arithmetic", cognitiveType: "application", difficulty: "medium", weight: 2, count: 1 },
        { skill: "Mathematics", subskill: "arithmetic", cognitiveType: "application", difficulty: "hard", weight: 2, count: 1 },
        { skill: "Mathematics", subskill: "arithmetic", cognitiveType: "understanding", difficulty: "easy", weight: 1, count: 1 },
        { skill: "Mathematics", subskill: "percentage", cognitiveType: "application", difficulty: "medium", weight: 2, count: 1 },
        { skill: "Mathematics", subskill: "percentage", cognitiveType: "application", difficulty: "hard", weight: 2, count: 1 },
        { skill: "English", subskill: "readingComprehension", cognitiveType: "interpretation", difficulty: "medium", weight: 2, count: 1 },
        { skill: "English", subskill: "readingComprehension", cognitiveType: "interpretation", difficulty: "hard", weight: 2, count: 1 },
        { skill: "English", subskill: "readingComprehension", cognitiveType: "recall", difficulty: "easy", weight: 1, count: 1 },
        { skill: "English", subskill: "inference", cognitiveType: "reasoning", difficulty: "medium", weight: 2, count: 1 },
        { skill: "English", subskill: "inference", cognitiveType: "reasoning", difficulty: "hard", weight: 2, count: 1 },
        { skill: "Science", subskill: "scientificReasoning", cognitiveType: "reasoning", difficulty: "medium", weight: 2, count: 1 },
        { skill: "Science", subskill: "scientificReasoning", cognitiveType: "reasoning", difficulty: "hard", weight: 2, count: 1 },
        { skill: "Science", subskill: "application", cognitiveType: "application", difficulty: "medium", weight: 2, count: 1 },
        { skill: "Science", subskill: "application", cognitiveType: "application", difficulty: "hard", weight: 2, count: 1 },
        { skill: "Logical Thinking", subskill: "analyticalReasoning", cognitiveType: "problem_solving", difficulty: "medium", weight: 2, count: 1 },
        { skill: "Logical Thinking", subskill: "analyticalReasoning", cognitiveType: "problem_solving", difficulty: "hard", weight: 2, count: 1 },
    ],
    "Class 10": [
        { skill: "Mathematics", subskill: "algebraicThinking", cognitiveType: "reasoning", difficulty: "medium", weight: 2, count: 1 },
        { skill: "Mathematics", subskill: "algebraicThinking", cognitiveType: "reasoning", difficulty: "hard", weight: 2, count: 1 },
        { skill: "Mathematics", subskill: "percentage", cognitiveType: "application", difficulty: "medium", weight: 2, count: 1 },
        { skill: "Mathematics", subskill: "percentage", cognitiveType: "application", difficulty: "hard", weight: 2, count: 1 },
        { skill: "Mathematics", subskill: "percentage", cognitiveType: "understanding", difficulty: "easy", weight: 1, count: 1 },
        { skill: "Mathematics", subskill: "ratio", cognitiveType: "application", difficulty: "medium", weight: 2, count: 1 },
        { skill: "Mathematics", subskill: "ratio", cognitiveType: "application", difficulty: "hard", weight: 2, count: 1 },
        { skill: "English", subskill: "readingComprehension", cognitiveType: "interpretation", difficulty: "medium", weight: 2, count: 1 },
        { skill: "English", subskill: "readingComprehension", cognitiveType: "interpretation", difficulty: "hard", weight: 2, count: 1 },
        { skill: "English", subskill: "readingComprehension", cognitiveType: "recall", difficulty: "easy", weight: 1, count: 1 },
        { skill: "English", subskill: "inference", cognitiveType: "reasoning", difficulty: "medium", weight: 2, count: 1 },
        { skill: "English", subskill: "inference", cognitiveType: "reasoning", difficulty: "hard", weight: 2, count: 1 },
        { skill: "Science", subskill: "scientificReasoning", cognitiveType: "reasoning", difficulty: "medium", weight: 2, count: 1 },
        { skill: "Science", subskill: "scientificReasoning", cognitiveType: "reasoning", difficulty: "hard", weight: 2, count: 1 },
        { skill: "Science", subskill: "application", cognitiveType: "application", difficulty: "medium", weight: 2, count: 1 },
        { skill: "Science", subskill: "application", cognitiveType: "application", difficulty: "hard", weight: 2, count: 1 },
        { skill: "Logical Thinking", subskill: "analyticalReasoning", cognitiveType: "problem_solving", difficulty: "medium", weight: 2, count: 1 },
        { skill: "Logical Thinking", subskill: "analyticalReasoning", cognitiveType: "problem_solving", difficulty: "hard", weight: 2, count: 1 },
    ],
    "Class 12": [
        { skill: "Mathematics", subskill: "algebraicThinking", cognitiveType: "reasoning", difficulty: "medium", weight: 2, count: 1 },
        { skill: "Mathematics", subskill: "algebraicThinking", cognitiveType: "reasoning", difficulty: "hard", weight: 2, count: 1 },
        { skill: "Mathematics", subskill: "mathematicalReasoning", cognitiveType: "problem_solving", difficulty: "medium", weight: 2, count: 1 },
        { skill: "Mathematics", subskill: "mathematicalReasoning", cognitiveType: "problem_solving", difficulty: "hard", weight: 2, count: 1 },
        { skill: "Mathematics", subskill: "advancedProblemSolving", cognitiveType: "problem_solving", difficulty: "hard", weight: 3, count: 2 },
        { skill: "Mathematics", subskill: "dataInterpretation", cognitiveType: "interpretation", difficulty: "medium", weight: 1, count: 1 },
        { skill: "Mathematics", subskill: "dataInterpretation", cognitiveType: "understanding", difficulty: "easy", weight: 1, count: 1 },
        { skill: "English", subskill: "readingComprehension", cognitiveType: "interpretation", difficulty: "medium", weight: 2, count: 1 },
        { skill: "English", subskill: "readingComprehension", cognitiveType: "interpretation", difficulty: "hard", weight: 2, count: 1 },
        { skill: "English", subskill: "readingComprehension", cognitiveType: "recall", difficulty: "easy", weight: 1, count: 1 },
        { skill: "English", subskill: "inference", cognitiveType: "reasoning", difficulty: "medium", weight: 2, count: 1 },
        { skill: "English", subskill: "inference", cognitiveType: "reasoning", difficulty: "hard", weight: 2, count: 1 },
        { skill: "Science", subskill: "scientificReasoning", cognitiveType: "reasoning", difficulty: "hard", weight: 2, count: 1 },
        { skill: "Science", subskill: "application", cognitiveType: "application", difficulty: "medium", weight: 2, count: 1 },
        { skill: "Science", subskill: "application", cognitiveType: "application", difficulty: "hard", weight: 2, count: 1 },
        { skill: "Science", subskill: "higherOrderThinking", cognitiveType: "reasoning", difficulty: "hard", weight: 2, count: 1 },
        { skill: "Science", subskill: "higherOrderThinking", cognitiveType: "problem_solving", difficulty: "hard", weight: 2, count: 1 },
        { skill: "Logical Thinking", subskill: "analyticalReasoning", cognitiveType: "problem_solving", difficulty: "hard", weight: 2, count: 1 },
    ],
};

// ────────────────────────────────────────────────────────────────────────────
// Skill dependency graph (Part 8). key = grade → skill → subskill →
// prerequisites. Subskills absent here have no prerequisites. The graph is
// seeded into skill_dependencies so admins can reconfigure it.
// ────────────────────────────────────────────────────────────────────────────
const DEPENDENCIES = {
    "Class 5": {
        Mathematics: {
            numberSense: [],
            arithmetic: ["numberSense"],
            basicFractions: ["arithmetic"],
        },
        English: {
            vocabulary: [],
            basicReading: ["vocabulary"],
            sentenceFormation: ["basicReading"],
        },
        "Logical Thinking": {
            patternRecognition: [],
            classification: ["patternRecognition"],
        },
        Science: {
            observation: [],
            causeEffect: ["observation"],
        },
        Creativity: {
            ideaGeneration: [],
            expression: ["ideaGeneration"],
        },
        Communication: {
            comprehension: [],
            expression: ["comprehension"],
        },
    },
    "Class 8": {
        Mathematics: {
            numberSense: [],
            arithmetic: ["numberSense"],
            percentage: ["arithmetic"],
            ratio: ["percentage"],
            algebraicThinking: ["ratio"],
            dataInterpretation: ["arithmetic"],
        },
        English: {
            vocabulary: [],
            grammar: ["vocabulary"],
            readingComprehension: ["grammar"],
            inference: ["readingComprehension"],
        },
        "Logical Thinking": {
            patternRecognition: [],
            deduction: ["patternRecognition"],
            analyticalReasoning: ["deduction"],
        },
        Science: {
            interpretation: [],
            scientificReasoning: ["interpretation"],
            application: ["scientificReasoning"],
        },
        Communication: {
            comprehension: [],
            communicationClarity: ["comprehension"],
        },
    },
    "Class 10": {
        Mathematics: {
            algebraicThinking: [],
            percentage: ["algebraicThinking"],
            ratio: ["percentage"],
            dataInterpretation: ["algebraicThinking"],
            mathematicalReasoning: ["ratio", "dataInterpretation"],
        },
        English: {
            readingComprehension: [],
            inference: ["readingComprehension"],
            writtenCommunication: ["inference"],
        },
        "Logical Thinking": {
            patternRecognition: [],
            analyticalReasoning: ["patternRecognition"],
            problemSolving: ["analyticalReasoning"],
        },
        Science: {
            interpretation: [],
            scientificReasoning: ["interpretation"],
            application: ["scientificReasoning"],
        },
        Communication: {
            comprehension: [],
            communicationClarity: ["comprehension"],
        },
    },
    "Class 12": {
        Mathematics: {
            algebraicThinking: [],
            dataInterpretation: ["algebraicThinking"],
            mathematicalReasoning: ["algebraicThinking"],
            advancedProblemSolving: ["mathematicalReasoning", "dataInterpretation"],
        },
        English: {
            readingComprehension: [],
            inference: ["readingComprehension"],
            writtenCommunication: ["inference"],
        },
        "Logical Thinking": {
            patternRecognition: [],
            deduction: ["patternRecognition"],
            analyticalReasoning: ["deduction"],
        },
        Science: {
            interpretation: [],
            scientificReasoning: ["interpretation"],
            application: ["scientificReasoning"],
            higherOrderThinking: ["scientificReasoning", "application"],
        },
        Communication: {
            comprehension: [],
            communicationClarity: ["comprehension"],
        },
    },
};

// ────────────────────────────────────────────────────────────────────────────
// Skill → interest-domain mapping (for interestAlignment in the NBSE score
// and for "Areas to explore" suggestions — Part 22). This is exploratory
// guidance only; never eligibility advice.
// ────────────────────────────────────────────────────────────────────────────
const SKILL_TO_INTEREST = {
    Mathematics: ["mathematics", "technology"],
    English: ["communication"],
    "Logical Thinking": ["mathematics", "technology", "social"],
    Science: ["science", "technology"],
    "General Knowledge": ["social", "science"],
    Creativity: ["creative", "design"],
    Communication: ["communication"],
    "Reading Ability": ["communication"],
    "Computer Basics": ["technology"],
};

// Interest categories shown in the UI.
const INTEREST_CATEGORIES = ["technology", "science", "mathematics", "creative", "design", "communication", "business", "social"];

// ────────────────────────────────────────────────────────────────────────────
// Mini interest assessment (Part 10). 4 questions, each option tagged with the
// one or two interest categories it expresses. The engine converts selections
// into a 0–100 profile — ability is never inferred from these.
// ────────────────────────────────────────────────────────────────────────────
const INTEREST_BANK = [
    {
        questionId: "interest_1",
        questionText: "Pick the activity you enjoy most in your free time:",
        preview: "Free-time",
        options: [
            { option: "Experimenting with gadgets", categories: ["technology"] },
            { option: "Reading or writing stories", categories: ["communication", "creative"] },
            { option: "Cracking puzzles or number tricks", categories: ["mathematics"] },
            { option: "Watching how things grow or react", categories: ["science"] },
        ],
    },
    {
        questionId: "interest_2",
        questionText: "If you had to build something for a school exhibition, you would choose:",
        preview: "Hands-on",
        options: [
            { option: "A working model or robot", categories: ["technology", "science"] },
            { option: "A design poster or artwork", categories: ["design", "creative"] },
            { option: "A business stall selling something useful", categories: ["business"] },
            { option: "A skit or talk for the audience", categories: ["communication"] },
        ],
    },
    {
        questionId: "interest_3",
        questionText: "Which topic would you most like to learn more about?",
        preview: "Curiosity",
        options: [
            { option: "How computers and apps work", categories: ["technology"] },
            { option: "Stars, planets and space", categories: ["science"] },
            { option: "Money, banking and business", categories: ["business", "mathematics"] },
            { option: "Helping people and solving community problems", categories: ["social"] },
        ],
    },
    {
        questionId: "interest_4",
        questionText: "At a group project, your favourite role would be:",
        preview: "Team role",
        options: [
            { option: "Explaining our idea to everyone", categories: ["communication"] },
            { option: "Designing how it looks", categories: ["design", "creative"] },
            { option: "Planning the steps and numbers", categories: ["mathematics", "social"] },
            { option: "Trying out experiments to make it work", categories: ["science", "technology"] },
        ],
    },
];

// ────────────────────────────────────────────────────────────────────────────
// Reassessment blueprint (Part 19): 3–5 targeted questions for one subskill
// (+1 prerequisite check, +1 cognitive-gap type, appropriate difficulty).
// Returns spec rows for the generator.
// ────────────────────────────────────────────────────────────────────────────
function buildReassessmentSpecs({ subskill, status, gapTypes = [] }) {
    const rows = [];
    const base = status === "foundation" ? "easy" : status === "ready" ? "medium" : "medium";
    const advanced = status === "ready" || status === "advanced" ? "hard" : "medium";

    const gapToType = {
        application_gap: "application",
        reasoning_gap: "reasoning",
        transfer_gap: "application",
        expression_gap: "communication",
    };
    const primaryType = gapTypes[0] && gapToType[gapTypes[0]] || "application";

    rows.push({ subskill, cognitiveType: primaryType, difficulty: base, weight: 2, count: 2 });
    rows.push({ subskill, cognitiveType: "problem_solving", difficulty: advanced, weight: 2, count: 1 });
    rows.push({ subskill, cognitiveType: "understanding", difficulty: base, weight: 1, count: 1 });
    return rows; // 4 targeted questions for the primary focus
}

const GRADES = Object.keys(TAXONOMY);

module.exports = {
    GRADES,
    TAXONOMY,
    BLUEPRINTS,
    DEPENDENCIES,
    SKILL_TO_INTEREST,
    INTEREST_CATEGORIES,
    INTEREST_BANK,
    buildReassessmentSpecs,
    getBlueprint(grade) {
        return (BLUEPRINTS[grade] || []).map((r) => ({ ...r }));
    },
    getTaxonomy(grade) {
        return TAXONOMY[grade] || {};
    },
    getDependencies(grade) {
        const out = [];
        const bySkill = DEPENDENCIES[grade] || {};
        for (const skill of Object.keys(bySkill)) {
            for (const subskill of Object.keys(bySkill[skill])) {
                out.push({ grade, skill, subskill, prerequisites: bySkill[skill][subskill] || [] });
            }
        }
        return out;
    },
};