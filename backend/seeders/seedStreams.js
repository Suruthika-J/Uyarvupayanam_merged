// Seeds the "Streams After 10th" catalogue (135 HSC groups & vocational
// courses + 31 polytechnic diploma courses = 166 records).
//
// Idempotent:
//  - Fresh database  → inserts both datasets in one batch.
//  - Already seeded  → inserts only the polytechnic records if that category
//    has never been seeded (migration path for existing databases).
//  - Otherwise       → does nothing, so admin edits are never clobbered.
const Stream = require("../models/Stream");
const hscData = require("../data/streamsSeedData.json");
const polytechnicData = require("../data/polytechnicSeedData.json");

const prepare = (rows) =>
  rows.map((s) => ({
    ...s,
    subCategory: s.category === "diploma" ? s.subCategory : null,
    isPublished: true,
  }));

async function seedStreams() {
  const existing = await Stream.countDocuments();

  if (existing === 0) {
    const inserted = await Stream.insertMany(prepare([...hscData, ...polytechnicData]), { ordered: false });
    return { inserted: inserted.length, skipped: 0, message: "Streams seeded (HSC + Polytechnic)" };
  }

  const polyCount = await Stream.countDocuments({ category: "polytechnic" });
  if (polyCount === 0) {
    const inserted = await Stream.insertMany(prepare(polytechnicData), { ordered: false });
    return { inserted: inserted.length, skipped: existing, message: "Polytechnic catalogue seeded" };
  }

  return { inserted: 0, skipped: existing, message: "Streams already seeded" };
}

module.exports = { seedStreams };