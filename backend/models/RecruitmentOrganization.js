const mongoose = require("mongoose");

/**
 * RecruitmentOrganization — the recruiting body (board / commission) that
 * conducts government examinations. Shared by State and Central government
 * flows so every organization is a single, editable database record:
 *
 *   State   → Tamil Nadu → TNPSC    (governmentType "State")
 *   Central → UPSC / SSC / Banking… (governmentType "Central")
 */
const recruitmentOrganizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    governmentType: {
      type: String,
      required: [true, "Government type is required"],
      enum: ["State", "Central"],
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    officialWebsite: {
      type: String,
      trim: true,
      default: "",
    },
    // Source/reference URL — e.g. the TNPSC apply/notification portal.
    // Kept separate from officialWebsite and never treated as an application
    // URL unless the admin explicitly re-uses it there.
    sourceUrl: {
      type: String,
      trim: true,
      default: "",
    },
    // Optional third-party reference/guide URL (e.g. a curated prep guide).
    // Informational only — never treated as an official application URL or
    // the official notification source.
    referenceSource: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Soft-delete + stable public slugs. Sparse unique index keeps the constraint
// while allowing a hand-typed slug to exist on exactly one record.
recruitmentOrganizationSchema.index({ slug: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("RecruitmentOrganization", recruitmentOrganizationSchema);