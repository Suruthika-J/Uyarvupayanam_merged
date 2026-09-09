/**
 * Unit tests for courseNormalizer.js — run with: npm test
 * Uses Node's built-in test runner (no dependency required).
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeCourseName,
  dedupeCourses,
  groupCoursesByDegree,
  degreeFamilyOf,
  splitDegreeName,
  titleCaseCore,
} from "./courseNormalizer.js";

// ─── Fixtures from the task brief ────────────────────────────────────────────
const RAW_FIXTURES = [
  "B.E. Electrical and Electronics Engineering", // 1 — prefixed, clean
  "B.E. Civil Engineering", // 2 — prefixed, clean
  "B.E. Mechanical Engineering", // 3 — prefixed, clean
  "B.Tech. Information Technology", // 4 — prefixed, clean
  "B.E. Electrical And Electronics Engineering", // 5 — DUPLICATE of #1 ("And")
  "B.E. Computer Science And Bussiness System", // 6 — prefixed, typo preserved
  "MECHANICAL ENGINEERING", // 7 — NO prefix, all caps
  "INFORMATION TECHNOLOGY", // 8 — NO prefix, all caps
  "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE", // 9 — NO prefix, all caps
];

describe("splitDegreeName", () => {
  it("detects dotted prefixes", () => {
    assert.equal(splitDegreeName("B.E. Mechanical Engineering").prefix, "B.E.");
    assert.equal(splitDegreeName("B.Tech. Information Technology").prefix, "B.Tech.");
  });

  it("returns empty prefix when none present", () => {
    assert.equal(splitDegreeName("MECHANICAL ENGINEERING").prefix, "");
  });

  it("collapses long-form prefixes to short canonical form", () => {
    assert.equal(splitDegreeName("Bachelor of Engineering Mechanical Engineering").prefix, "B.E.");
  });
});

describe("titleCaseCore", () => {
  it("title-cases all-caps core names", () => {
    assert.equal(titleCaseCore("MECHANICAL ENGINEERING"), "Mechanical Engineering");
    assert.equal(titleCaseCore("ARTIFICIAL INTELLIGENCE AND DATA SCIENCE"), "Artificial Intelligence and Data Science");
  });

  it("lowercases joining words and/or/of/in/for", () => {
    assert.equal(titleCaseCore("Electrical And Electronics Engineering"), "Electrical and Electronics Engineering");
    assert.equal(titleCaseCore("Computer Science And Bussiness System"), "Computer Science and Bussiness System");
  });

  it("keeps acronyms uppercase", () => {
    assert.equal(titleCaseCore("AI And Data Science"), "AI and Data Science");
    assert.equal(titleCaseCore("Mechanical (Production)"), "Mechanical (Production)");
  });

  it("preserves parenthesized specialisations", () => {
    assert.equal(titleCaseCore("Microbiology"), "Microbiology");
    assert.equal(titleCaseCore("Computer Science (Cyber Security)"), "Computer Science (Cyber Security)");
  });
});

describe("normalizeCourseName", () => {
  it("keeps prefixed courses as canonical with needsReview=false", () => {
    const n = normalizeCourseName("B.E. Electrical And Electronics Engineering", { stream: "Engineering" });
    assert.equal(n.canonicalName, "B.E. Electrical and Electronics Engineering");
    assert.equal(n.degreePrefix, "B.E.");
    assert.equal(n.needsReview, false);
    assert.deepEqual(n.aliases, ["B.E. Electrical And Electronics Engineering"]);
  });

  it("handles prefix without trailing period (BE / B.E)", () => {
    assert.equal(normalizeCourseName("BE Civil Engineering").degreePrefix, "B.E.");
  });

  it("flags prefix-less all-caps names with needsReview=true and suggested prefixes", () => {
    const mechanical = normalizeCourseName("MECHANICAL ENGINEERING", { stream: "Engineering" });
    assert.equal(mechanical.needsReview, true);
    assert.equal(mechanical.canonicalName, "Mechanical Engineering"); // title-cased, no guess
    assert.ok(mechanical.suggestedPrefixes.includes("B.E."));
    assert.ok(mechanical.suggestedPrefixes.includes("B.Tech."));

    const it = normalizeCourseName("INFORMATION TECHNOLOGY", { stream: "Engineering" });
    assert.equal(it.needsReview, true);
    assert.ok(it.suggestedPrefixes.includes("B.Tech."));
  });

  it("Diploma/Polytechnic streams deterministically rewrite prefix-less courses (Task 6)", () => {
    // Raw all-caps course under a Diploma-stream college must NOT be flagged
    // needsReview — it becomes "Diploma in <Name>" and is student-visible.
    const mech = normalizeCourseName("MECHANICAL ENGINEERING", { stream: "Diploma" });
    assert.equal(mech.needsReview, false);
    assert.equal(mech.canonicalName, "Diploma in Mechanical Engineering");
    assert.equal(mech.degreePrefix, "Diploma");
    assert.deepEqual(mech.suggestedPrefixes, []);

    const comp = normalizeCourseName("COMPUTER ENGINEERING", { stream: "Polytechnic" });
    assert.equal(comp.needsReview, false);
    assert.equal(comp.canonicalName, "Diploma in Computer Engineering");
    assert.equal(comp.degreePrefix, "Diploma");
  });

  it("explicit prefixes on diploma courses are kept untouched", () => {
    const n = normalizeCourseName("Diploma in Mechanical Engineering", { stream: "Diploma" });
    assert.equal(n.needsReview, false);
    assert.equal(n.canonicalName, "Diploma in Mechanical Engineering");
    assert.equal(n.degreePrefix, "Diploma");
  });

  it("engineering-prefix-less courses still need review, never silently guessed", () => {
    const n = normalizeCourseName("MECHANICAL ENGINEERING", { stream: "Engineering" });
    assert.equal(n.needsReview, true);
    assert.equal(n.canonicalName, "Mechanical Engineering");
    assert.ok(n.suggestedPrefixes.includes("B.E."));
  });
});

describe("dedupeCourses", () => {
  let result;

  before(() => {
    // Feed all 9 fixtures as records in one college's list.
    result = dedupeCourses(
      RAW_FIXTURES.map((courseName, i) => ({ _id: `c${i + 1}`, courseName })),
      { stream: "Engineering" }
    );
  });

  it("collapses the two same-case variants of E.E.E. into a single course", () => {
    const eee = result.filter((c) => c.canonicalName.toLowerCase().includes("electrical and electronics"));
    assert.equal(eee.length, 1);
    assert.equal(eee[0].canonicalName, "B.E. Electrical and Electronics Engineering");
    // The second spellinng is kept as an alias, not a duplicate row.
    assert.ok(eee[0].aliases.includes("B.E. Electrical And Electronics Engineering"));
  });

  it("renders only canonical names — never raw all-caps strings", () => {
    for (const course of result) {
      assert.notEqual(course.canonicalName, course.canonicalName.toUpperCase());
      assert.ok(!/^[A-Z ]+$/.test(course.canonicalName));
    }
  });

  it("keeps the prefix-less fixture set needsReview so students never see them", () => {
    const needsReview = result.filter((c) => c.needsReview);
    assert.equal(needsReview.length, 3);
    const names = needsReview.map((c) => c.canonicalName).sort();
    assert.deepEqual(names, [
      "Artificial Intelligence and Data Science",
      "Information Technology",
      "Mechanical Engineering",
    ]);
  });

  it("still contains the prefixed entries with clean canonical names", () => {
    const canonical = result.filter((c) => !c.needsReview).map((c) => c.canonicalName);
    assert.ok(canonical.includes("B.Tech. Information Technology"));
    assert.ok(canonical.includes("B.E. Civil Engineering"));
    assert.ok(canonical.includes("B.E. Computer Science and Bussiness System"));
  });

  it("diploma-stream colleges survive dedupe — nothing left needsReview (Task 6)", () => {
    const diploma = dedupeCourses(
      [
        { _id: "d1", courseName: "MECHANICAL ENGINEERING" },
        { _id: "d2", courseName: "COMPUTER ENGINEERING" },
        { _id: "d3", courseName: "Mechanical Engineering" }, // case-dupe of d1
      ],
      { stream: "Diploma" }
    );
    assert.equal(diploma.length, 2); // d2 + one deduped d1/d3
    assert.ok(diploma.every((c) => !c.needsReview));
    const names = diploma.map((c) => c.canonicalName).sort();
    assert.deepEqual(names, ["Diploma in Computer Engineering", "Diploma in Mechanical Engineering"]);
  });
});

describe("degreeFamilyOf / groupCoursesByDegree", () => {
  it("maps prefixes to family buckets", () => {
    assert.equal(degreeFamilyOf("B.E."), "engineering");
    assert.equal(degreeFamilyOf("B.Tech."), "engineering");
    assert.equal(degreeFamilyOf("B.Sc."), "science");
    assert.equal(degreeFamilyOf("Diploma"), "diploma");
    assert.equal(degreeFamilyOf("MBBS"), "medical");
  });

  it("groups only confirmed courses, hiding needsReview ones", () => {
    const groups = groupCoursesByDegree([
      { canonicalName: "B.E. Civil Engineering", degreePrefix: "B.E.", needsReview: false },
      { canonicalName: "B.Sc. Microbiology", degreePrefix: "B.Sc.", needsReview: false },
      { canonicalName: "Mechanical Engineering", degreePrefix: "", needsReview: true },
    ]);
    assert.equal(groups.length, 2);
    assert.equal(groups[0].degreeFamily, "engineering");
    assert.equal(groups[1].degreeFamily, "science");
    assert.equal(groups[0].label, "Engineering (B.E. / B.Tech.)");
  });
});