// backend/scripts/_unitMemoryRetrieval.js
//
// Pure unit tests for the memory retrieval engine — no MongoDB needed.
// Run:  node backend/scripts/_unitMemoryRetrieval.js
//
// Covers: tokenizer, stem-lite fuzzy matching, weighted field scoring,
// differently-worded query recall, type-hint detection, recency boost.

const { tokenize, stemLite, scoreMemory, hintType, excerpt } = require("../services/memoryRetrievalService");

let pass = 0;
let fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}`); }
}

// sample memory resembling the spec's scenario-1 example
const interviewMemory = {
  _id: "m1",
  type: "journal",
  title: "Company interview experience",
  summary: "Cleared the technical rounds but struggled to explain answers confidently during the HR interview and felt disappointed afterward.",
  topics: ["career", "interview", "confidence"],
  content: "I attended a company interview. I cleared the technical rounds, but I struggled to explain my answers confidently during the HR interview. I felt disappointed afterward.",
  createdAt: new Date(Date.now() - 5 * 86400000),
  eventDate: new Date("2025-05-10"),
};

const irrelevantMemory = {
  _id: "m2",
  type: "story",
  title: "Trip to Kodaikanal",
  summary: "Went trekking with friends and watched the sunrise at Coaker's Walk.",
  topics: ["travel", "friends"],
  content: "Last summer we went to Kodaikanal for a trip. The trek was fun and the sunrise views were amazing.",
  createdAt: new Date(Date.now() - 40 * 86400000),
};

console.log("── tokenize / stemLite ──────────────────────────────");
check("tokenize lowercases, strips punctuation and drops single chars", JSON.stringify(tokenize("Hello, World! I'm #1.")) === JSON.stringify(["hello", "world"]));
check("stemLite handles plurals/tense", stemLite("interviews") === "interview" && stemLite("planned") === "plann" && stemLite("working") === "work");

console.log("── hintType ──────────────────────────────────────────");
check("voice hint", hintType("what did I record about my workout?") === "voice");
check("email hint", hintType("did I write an email to the professor?") === "email");
check("journal hint", hintType("my diary entry about exams") === "journal");
check("no hint", hintType("how do I study better?") === null);

console.log("── scoreMemory: differently-worded recall ───────────");
// Query uses words NOT in the memory ("nervous", "next") + partial matches
const s1 = scoreMemory(interviewMemory, tokenize("why am I nervous about my next interview"), null);
const s2 = scoreMemory(irrelevantMemory, tokenize("why am I nervous about my next interview"), null);
console.log(`    interview score=${s1.toFixed(2)}  travel score=${s2.toFixed(2)}`);
check("interview memory scores above travel memory", s1 > s2);
check("relevant memory clears a modest threshold", s1 >= 0.4);

console.log("── scoreMemory: topic/summary weighting ──────────────");
const s3 = scoreMemory(interviewMemory, tokenize("career confidence"), null);
const s4 = scoreMemory(irrelevantMemory, tokenize("career confidence"), null);
console.log(`    interview=${s3.toFixed(2)}  travel=${s4.toFixed(2)}`);
check("topic+summary words rank memory highly without content words", s3 > s4);

console.log("── recency & type-hint boosts ────────────────────────");
const oldMemory = { ...interviewMemory, createdAt: new Date(Date.now() - 500 * 86400000) };
const s5 = scoreMemory(interviewMemory, tokenize("interview"), null);
const s6 = scoreMemory(oldMemory, tokenize("interview"), null);
check("recent memory slightly outranks identical older memory", s5 > s6);
const emailMemory = {
  _id: "m3",
  type: "email",
  title: "Internship offer letter",
  summary: "Received an internship offer that included a three-year bond; discussed the terms with parents and decided not to accept it.",
  topics: ["career", "internship", "decision"],
  content: "The offer letter said I would need to sign a three-year bond. I talked to my parents about it and we decided not to accept the offer.",
  createdAt: new Date(Date.now() - 20 * 86400000),
};
const s7 = scoreMemory(emailMemory, tokenize("email offer letter"), "email");
const s8 = scoreMemory(emailMemory, tokenize("email offer letter"), null);
console.log(`    with-hint=${s7.toFixed(2)}  without-hint=${s8.toFixed(2)}`);
check("type hint boosts a matching-type memory", s7 > s8);

console.log("── excerpt ───────────────────────────────────────────");
const short = excerpt("tiny");
const long = excerpt("word ".repeat(60));
check("excerpt keeps short text", short === "tiny");
check("excerpt truncates long text with ellipsis", long.length < 250 && long.endsWith("…"));

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);