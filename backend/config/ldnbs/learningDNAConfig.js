// backend/config/ldnbs/learningDNAConfig.js
//
// Defines the Learning DNA cognitive dimensions and how question metadata
// (cognitiveType) maps onto them. Only measurable assessment behaviour is
// used — no psychological/medical/personality inference.
"use strict";

// Which cognitiveType contributes to which DNA dimension. "accuracy" is the
// overall weighted correctness; "consistency" is derived (see engine).
const COGNITIVE_TO_DIMENSION = {
    recall: "understanding",
    understanding: "understanding",
    application: "application",
    reasoning: "reasoning",
    problem_solving: "problemSolving",
    pattern_recognition: "patternRecognition",
    interpretation: "comprehension",
    communication: "communication",
};

// Valid cognitive types accepted in question metadata (also used to validate
// LLM output and bank questions).
const VALID_COGNITIVE_TYPES = [
    "recall",
    "understanding",
    "application",
    "reasoning",
    "problem_solving",
    "pattern_recognition",
    "interpretation",
    "communication",
];

const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

// All LW-DNA dimensions exposed to the UI (consistency is derived, not
// question-backed, so it lives separately in the payload).
const DIMENSIONS = [
    "accuracy",
    "understanding",
    "application",
    "reasoning",
    "problemSolving",
    "patternRecognition",
    "comprehension",
    "communication",
    "consistency",
];

// evidence thresholds → confidence label for each dimension
const CONFIDENCE_BY_EVIDENCE = (n) => (n >= 4 ? "high" : n >= 2 ? "medium" : "low");

// Gaps that the gap detection engine can emit, with the weak dimension name.
const GAP_TYPES = [
    { type: "application_gap", label: "Application Gap", weak: "application" },
    { type: "reasoning_gap", label: "Reasoning Gap", weak: "reasoning" },
    { type: "transfer_gap", label: "Transfer Gap", weak: "transfer" },
    { type: "expression_gap", label: "Expression Gap", weak: "communication" },
];

module.exports = {
    COGNITIVE_TO_DIMENSION,
    VALID_COGNITIVE_TYPES,
    VALID_DIFFICULTIES,
    DIMENSIONS,
    CONFIDENCE_BY_EVIDENCE,
    GAP_TYPES,
};