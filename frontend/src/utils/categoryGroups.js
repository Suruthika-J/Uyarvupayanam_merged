/**
 * Category grouping for the Student Courses page.
 *
 * Two problems this solves, both caused by deriving cards from college data:
 *   1. Categories were also created from `college.category || college.type`,
 *      so college *types* (Government, Co-Ed, Private, SELF FINANCING ...)
 *      appeared as course category cards showing "0 Courses".
 *   2. Grouping used the raw string as an object key, so "Government" and
 *      "GOVERNMENT" became two separate cards.
 *
 * Rules applied here:
 *   - Categories come from COURSES only. A category with no courses is never
 *     returned, so an empty card cannot be rendered.
 *   - Courses are grouped by a case-insensitive, whitespace-insensitive key.
 *   - One clean display label is kept per category, and every course from all
 *     merged variants is counted into it.
 */

/** Fallback label for courses with no category at all. */
export const OTHER_CATEGORY = 'Others'

/**
 * Normalised key used to decide whether two category names are the same.
 * Case-insensitive and tolerant of extra/duplicated whitespace.
 */
export function categoryKeyOf(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/**
 * Rank a label's casing for display purposes: 0 reads like a proper title,
 * 1 is all-upper or all-lower. Used only to break ties between equally
 * frequent variants, so a lone acronym ("ITI") is still shown as-is.
 */
function casingRank(name) {
  const letters = name.replace(/[^a-z]/gi, '');
  if (!letters) return 0;
  const isAllUpper = letters === letters.toUpperCase();
  const isAllLower = letters === letters.toLowerCase();
  return isAllUpper || isAllLower ? 1 : 0;
}

/**
 * Choose one clean label from the raw variants seen for a single category.
 * Most common spelling wins; ties prefer a properly-cased label over an
 * all-caps/all-lower one, then the shorter (least stray padding), then
 * alphabetical so the result is stable across renders.
 */
export function pickCategoryDisplayName(variants) {
  const counts = new Map()

  for (const variant of variants || []) {
    if (!categoryKeyOf(variant)) continue
    counts.set(variant, (counts.get(variant) || 0) + 1)
  }

  if (counts.size === 0) return ''

  const better = (name, count, best) => {
    if (count !== best.count) return count > best.count;
    const rank = casingRank(name);
    const bestRank = casingRank(best.name);
    if (rank !== bestRank) return rank < bestRank;
    if (name.length !== best.name.length) return name.length < best.name.length;
    return name.localeCompare(best.name) < 0;
  };

  let best = null;
  for (const [name, count] of counts) {
    if (!best || better(name, count, best)) best = { name, count };
  }

  return best.name.replace(/\s+/g, ' ').trim();
}

/**
 * Build the category cards shown on the Student Courses page.
 *
 * @param {Array} courses  active course documents
 * @param {Array} colleges  college documents (only used for the college count)
 * @returns {Array} categories that have at least one course, alphabetically
 */
export function buildCourseCategoryGroups(courses, colleges) {
  const groups = new Map()

  // 1) Courses create the groups and own the course counts.
  for (const course of courses || []) {
    const raw = course?.category || OTHER_CATEGORY
    const key = categoryKeyOf(raw)
    if (!key) continue

    if (!groups.has(key)) {
      groups.set(key, { key, variants: new Set(), courseCount: 0, collegeCount: 0 })
    }
    const group = groups.get(key)
    group.variants.add(raw)
    group.courseCount += 1
  }

  // 2) One clean display label per merged category.
  for (const group of groups.values()) {
    group.categoryName = pickCategoryDisplayName(group.variants)
  }

  // 3) Colleges only contribute to a category that already has courses.
  //    A college whose category is not a course category (e.g. "Co-Ed") is
  //    simply not counted anywhere, which is what removes those empty cards.
  for (const college of colleges || []) {
    const group = groups.get(categoryKeyOf(college?.category || college?.type))
    if (group) group.collegeCount += 1
  }

  // 4) Never render a category without courses, and keep the original order.
  return [...groups.values()]
    .filter((group) => group.courseCount > 0)
    .sort((a, b) => a.categoryName.localeCompare(b.categoryName))
}