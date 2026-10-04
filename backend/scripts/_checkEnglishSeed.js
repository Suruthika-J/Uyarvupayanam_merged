// Invariant checks across the whole English curriculum seed.
const s = require("../seeders/seedEnglishMissions");
let fails = 0;
function check(name, cond, extra) {
  if (!cond) { fails += 1; console.log("FAIL", name, extra || ""); }
}
const topics = s.ENGLISH_TOPICS;
check("6 areas", s.getEnglishAreas().length === 6);
check("23 topics", topics.length === 23);

for (const t of topics) {
  check(`topic ${t.id} has objectives`, Array.isArray(t.objectives) && t.objectives.length > 0);
  check(`topic ${t.id} has lesson sections`, t.lesson && Array.isArray(t.lesson.sections) && t.lesson.sections.length > 0);
  check(`topic ${t.id} has recap`, Array.isArray(t.recap) && t.recap.length > 0);
  check(`topic ${t.id} has assessment`, t.assessment && t.assessment.questionCount >= 4 && typeof t.assessment.difficulty === "string");
  check(`topic ${t.id} has activities`, Array.isArray(t.activities) && t.activities.length >= 3);
  for (const a of t.activities) {
    check(`activity ${a.activityId} required`, a.required !== false);
    check(`activity ${a.activityId} has items/fields`, !!(a.items && a.items.length) || (a.type === "match-pairs" && a.items.length));
    for (const it of a.items || []) {
      if (a.type === "mcq" || a.type === "error-find") {
        check(`  ${a.activityId} mcq ok`, it.options && it.options.length === 4 && it.options.includes(it.correct) && it.explanation);
      } else if (a.type === "true-false") {
        check(`  ${a.activityId} tf ok`, typeof it.correct === "boolean" && it.explanation);
      } else if (a.type === "fill-blank") {
        const accepted = Array.isArray(it.correct) ? it.correct : [it.correct];
        check(`  ${a.activityId} fill ok`, it.sentence && accepted.length && it.explanation);
      } else if (a.type === "sentence-order") {
        // NOTE: `lines` order is NOT guaranteed to equal correctOrder (e.g.
        // letter-order stores its lines deliberately out of order). The frontend
        // never relies on it and never receives correctOrder — students line the
        // sentences up themselves. So this is informational only.
        const ordered = JSON.stringify(it.correctOrder) === JSON.stringify(it.lines.map((l) => l.id));
        if (!ordered) console.log("note:", a.activityId, "lines not in correct order (fine)");
      }
    }
  }
}

// unique activity ids per topic
for (const t of topics) {
  const ids = t.activities.map((x) => x.activityId);
  check(`unique activity ids in ${t.id}`, new Set(ids).size === ids.length);
}
// unique topic ids
const tids = topics.map((t) => t.id);
check("unique topic ids", new Set(tids).size === tids.length);

// orderedTopics == per-area order concatenation
const ot = s.orderedTopics();
check("ordered length", ot.length === topics.length);

// areaId ordering: within each area, order field == index+1
for (const a of s.getEnglishAreas()) {
  const list = s.getEnglishTopics(a.id);
  check(`area ${a.id} orders`, list.every((t, i) => t.order === i + 1));
}

console.log(fails === 0 ? "ALL INVARIANTS PASS" : `${fails} FAILURES`);
process.exit(fails === 0 ? 0 : 1);