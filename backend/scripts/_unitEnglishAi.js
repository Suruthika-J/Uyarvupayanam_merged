// Temporary unit check for englishAiService (no network).
const svc = require("../services/englishAiService");
const topic = {
  name: "Present Tenses",
  objectives: ["Choose tenses correctly"],
  lesson: { sections: [{ body: "simple present for habits" }] },
  recap: ["x"],
};
const good = [
  { type: "mcq", question: "She usually ___ to school by bus.", options: ["go", "goes", "goed", "gone"], correct_answer: "goes", explanation: "Habits need the simple present", difficulty: "easy", marks: 1 },
  { type: "true-false", question: "We use the present continuous for habits.", correct_answer: "False", explanation: "Habits use simple present", difficulty: "easy", marks: 1 },
  { type: "fill-in-the-blank", question: "The Earth ____ around the Sun.", correct_answer: "revolves", explanation: "Facts need simple present", difficulty: "medium", marks: 2 },
  { type: "sentence-correction", question: "She go to school.", options: ["She go to school.", "She goes to school.", "She going to school.", "She gone to school."], correct_answer: "She goes to school.", explanation: "add -s", difficulty: "medium", marks: 1 },
  { type: "mcq", question: "Duplicate question?", options: ["a", "b", "c", "d"], correct_answer: "a", explanation: "x" },
  { type: "mcq", question: "Duplicate question?", options: ["a2", "b2", "c2", "d2"], correct_answer: "a2", explanation: "y" },
];
const out = good.map((q) => svc.validateQuestion(q, topic)).filter(Boolean);
console.log("validated:", out.length);
const bad = [
  { type: "mcq", question: "   ", options: ["a", "b", "c", "d"], correct_answer: "a", explanation: "x" },
  { type: "mcq", question: "Bad answer not in options", options: ["a", "b", "c", "d"], correct_answer: "zzz", explanation: "x" },
  { type: "mcq", question: "dup options", options: ["a", "a", "c", "d"], correct_answer: "a", explanation: "x" },
  { type: "fill-in-the-blank", question: "no blank here", correct_answer: "x", explanation: "e" },
  { type: "nonsense", question: "what", options: ["a", "b", "c", "d"], correct_answer: "a", explanation: "e" },
  { type: "true-false", question: "bad tf", correct_answer: "maybe", explanation: "e" },
  { type: "mcq", question: "no explanation", options: ["a", "b", "c", "d"], correct_answer: "a", explanation: "" },
];
const badOut = bad.map((q) => svc.validateQuestion(q, topic)).filter(Boolean);
console.log("bad rejected, kept:", badOut.length, "(want 0)");
const arr = JSON.stringify([good[0], good[4], good[5], good[1], good[2], good[3]]);
console.log("parse array ok:", Array.isArray(svc.parseQuestionArray(arr)) && svc.parseQuestionArray(arr).length === 6);
const docker = { questions: JSON.parse(arr) };
console.log("parse object ok:", Array.isArray(svc.parseQuestionArray(JSON.stringify(docker))));
const fences = "```json\n" + arr + "\n```";
console.log("parse fences ok:", Array.isArray(svc.parseQuestionArray(fences)));
console.log("fill-blank stored as array:", JSON.stringify(out.find((q) => q.type === "fill-in-the-blank").correctAnswer));