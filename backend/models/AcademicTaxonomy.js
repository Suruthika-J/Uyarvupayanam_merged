const mongoose = require("mongoose");

const specializationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  status: { type: String, enum: ["active", "archived"], default: "active" }
});

const domainSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  specializations: [specializationSchema],
  status: { type: String, enum: ["active", "archived"], default: "active" }
});

const degreeProgrammeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  level: { type: String, default: "Undergraduate" }, // "Undergraduate", "Postgraduate", "Diploma", "Certification"
  duration: { type: String, default: "4 Years" },
  status: { type: String, enum: ["active", "archived"], default: "active" }
});

const academicTaxonomySchema = new mongoose.Schema(
  {
    fieldId: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fieldName: { type: String, required: true, trim: true },
    icon: { type: String, default: "FiBookOpen" },
    description: { type: String, default: "" },
    degrees: [degreeProgrammeSchema],
    domains: [domainSchema],
    certifications: [{ type: String }],
    status: { type: String, enum: ["active", "archived"], default: "active" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AcademicTaxonomy", academicTaxonomySchema);
