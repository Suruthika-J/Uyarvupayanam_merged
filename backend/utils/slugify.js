/**
 * slugify — turns any display string into a stable lowercase URL slug,
 * matching the slug convention used by the graduate exam module
 * (e.g. "TNPSC Group IV" → "tnpsc-group-iv").
 */
function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[–—]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

module.exports = slugify;