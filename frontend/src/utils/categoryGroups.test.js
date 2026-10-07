/**
 * Unit tests for categoryGroups.js — run with: npm test
 * Uses Node's built-in test runner (no dependency required).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  categoryKeyOf,
  pickCategoryDisplayName,
  buildCourseCategoryGroups,
  OTHER_CATEGORY,
} from "./categoryGroups.js";

const course = (category) => ({ category });

describe("categoryKeyOf", () => {
  it("is case-insensitive", () => {
    assert.equal(categoryKeyOf("Government"), categoryKeyOf("GOVERNMENT"));
    assert.equal(categoryKeyOf("Government"), categoryKeyOf("government"));
    assert.equal(categoryKeyOf("Government"), categoryKeyOf("GoVeRnMeNt"));
  });

  it("collapses extra whitespace and trims", () => {
    assert.equal(categoryKeyOf("  Government  "), categoryKeyOf("Government"));
    assert.equal(categoryKeyOf("Government   Aided"), categoryKeyOf("Government Aided"));
    assert.equal(categoryKeyOf("Arts\t&\nScience"), categoryKeyOf("Arts & Science"));
  });

  it("keeps genuinely different categories apart", () => {
    assert.notEqual(categoryKeyOf("Government"), categoryKeyOf("Government Aided"));
    assert.notEqual(categoryKeyOf("Arts"), categoryKeyOf("Arts & Science"));
    assert.notEqual(categoryKeyOf("Science"), categoryKeyOf("Commerce"));
  });
});

describe("pickCategoryDisplayName", () => {
  it("returns the only variant when there is one", () => {
    assert.equal(pickCategoryDisplayName(["Engineering"]), "Engineering");
  });

  it("keeps the most common spelling", () => {
    assert.equal(pickCategoryDisplayName(["Government", "GOVERNMENT", "Government"]), "Government");
  });

  it("breaks ties toward the shorter, cleaner label", () => {
    assert.equal(pickCategoryDisplayName(["Government", "GOVERNMENT"]), "Government");
  });

  it("trims stray whitespace off the chosen label", () => {
    assert.equal(pickCategoryDisplayName(["  Government  "]), "Government");
  });
});

describe("buildCourseCategoryGroups", () => {
  it("merges case-differing categories and sums their courses", () => {
    const groups = buildCourseCategoryGroups([
      course("Government"),
      course("GOVERNMENT"),
      course("government"),
    ], []);

    assert.equal(groups.length, 1);
    assert.equal(groups[0].categoryName, "Government");
    assert.equal(groups[0].courseCount, 3, "count must include every merged course");
  });

  it("merges categories that differ only by extra spaces", () => {
    const groups = buildCourseCategoryGroups([
      course("Arts & Science"),
      course("Arts  &  Science"),
    ], []);

    assert.equal(groups.length, 1);
    assert.equal(groups[0].courseCount, 2);
    assert.equal(groups[0].categoryName, "Arts & Science");
  });

  it("never returns a category with zero courses", () => {
    const groups = buildCourseCategoryGroups([course("Engineering")], [
      { category: "Co-Ed", type: "Private" },
      { category: "GOVERNMENT", type: "Government" },
      { category: "", type: "SELF FINANCING" },
    ]);

    assert.equal(groups.length, 1);
    assert.equal(groups[0].categoryName, "Engineering");
  });

  it("drops college-only categories that have no courses", () => {
    const names = buildCourseCategoryGroups([course("Law")], [
      { category: "Government", type: "Government" },
      { category: "GOVERNMENT", type: "Government" },
      { category: "Government Aided", type: "Government" },
      { category: "GOVERNMENT AIDED", type: "Government" },
    ]).map((g) => g.categoryName);

    assert.deepEqual(names, ["Law"]);
  });

  it("keeps genuinely different categories separate", () => {
    const names = buildCourseCategoryGroups([
      course("Government"),
      course("Government Aided"),
    ], []).map((g) => g.categoryName);

    assert.deepEqual(names.sort(), ["Government", "Government Aided"]);
  });

  it("counts colleges into a matching category, case-insensitively", () => {
    const groups = buildCourseCategoryGroups(
      [course("Engineering"), course("ENGINEERING")],
      [{ category: "engineering" }, { category: "Engineering" }, { category: "Co-Ed" }]
    );

    assert.equal(groups.length, 1);
    assert.equal(groups[0].courseCount, 2);
    assert.equal(groups[0].collegeCount, 2, "Co-Ed is not a course category and must not count");
  });

  it("buckets courses with no category under Others", () => {
    const groups = buildCourseCategoryGroups([{ category: null }, { category: "" }], []);

    assert.equal(groups.length, 1);
    assert.equal(groups[0].categoryName, OTHER_CATEGORY);
    assert.equal(groups[0].courseCount, 2);
  });

  it("returns an empty list when there are no courses at all", () => {
    assert.deepEqual(buildCourseCategoryGroups([], [{ category: "Co-Ed" }]), []);
  });

  it("tolerates missing inputs", () => {
    assert.deepEqual(buildCourseCategoryGroups(undefined, undefined), []);
  });

  it("sorts categories alphabetically", () => {
    const names = buildCourseCategoryGroups([
      course("Medical"), course("Arts"), course("Engineering"),
    ], []).map((g) => g.categoryName);

    assert.deepEqual(names, ["Arts", "Engineering", "Medical"]);
  });

  it("produces no duplicate keys for the reported Government case", () => {
    const groups = buildCourseCategoryGroups([
      course("Government"), course("GOVERNMENT"),
      course("Government Aided"), course("GOVERNMENT AIDED"),
      course("government"),
    ], []);

    const keys = groups.map((g) => g.key);
    assert.equal(new Set(keys).size, keys.length, "keys must be unique");

    const byName = Object.fromEntries(groups.map((g) => [g.categoryName, g.courseCount]));
    assert.deepEqual(byName, { Government: 3, "Government Aided": 2 });
  });
});