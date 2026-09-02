const AcademicTaxonomy = require("../models/AcademicTaxonomy");
const COLLEGE_FIELDS_DATA = require("../config/collegeFieldsData");

/**
 * Syncs academic taxonomy from collegeFieldsData.js into MongoDB.
 * Uses bulkWrite upsert so it is safe to run on every server restart —
 * existing records are updated, new ones are inserted, nothing is deleted.
 */
const seedTaxonomyData = async () => {
  try {
    const ops = COLLEGE_FIELDS_DATA.map(field => {
      const toId = str =>
        str.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

      const inferLevel = name => {
        const n = name.toLowerCase();
        if (n.includes("ph.d") || n.includes("phd")) return "Doctorate";
        if (n.includes("integrated")) return "Integrated";
        if (n.includes("master") || n.includes("m.tech") || n.includes("m.sc") ||
            n.includes("m.com") || n.includes("m.a.") || n.includes("mba") ||
            n.includes("m.ed") || n.includes("m.phil") || n.includes("ll.m") ||
            n.includes("m.pharm") || n.includes("m.des")) return "Postgraduate";
        if (n.includes("diploma") || n.includes("d.pharm") || n.includes("d.el.ed"))
          return "Diploma";
        if (n.includes("certification") || n.includes("certificate")) return "Certification";
        return "Undergraduate";
      };

      const inferDuration = name => {
        const n = name.toLowerCase();
        if (n.includes("5 year") || n.includes("b.arch") || n.includes("b.a. ll.b") ||
            n.includes("b.b.a. ll.b") || n.includes("bpt")) return "5 Years";
        if (n.includes("3 year") || n.includes("llb (3") || n.includes("ll.b. (3")) return "3 Years";
        if (n.includes("2 year") || n.includes("m.tech") || n.includes("mba") ||
            n.includes("m.ed") || n.includes("m.sc") || n.includes("m.com") ||
            n.includes("m.a.") || n.includes("m.pharm") || n.includes("m.des") ||
            n.includes("ll.m")) return "2 Years";
        if (n.includes("diploma") || n.includes("d.pharm") || n.includes("d.el.ed")) return "2 Years";
        if (n.includes("certification")) return "6 Months";
        return "4 Years";
      };

      const doc = {
        fieldId: field.id,
        fieldName: field.name,
        icon: field.icon,
        description: field.description,
        status: "active",
        degrees: field.degrees.map(d => {
          if (typeof d === "string") {
            return {
              id: toId(d),
              name: d,
              level: inferLevel(d),
              duration: inferDuration(d),
              status: "active"
            };
          }
          return { ...d, status: d.status || "active" };
        }),
        domains: (field.domains || []).map(dom => ({
          id: toId(dom.name),
          name: dom.name,
          description: dom.description || "",
          specializations: (dom.specs || []).map(spec => ({
            id: toId(spec),
            name: spec,
            status: "active"
          })),
          status: "active"
        })),
        certifications: field.certifications || []
      };

      return {
        updateOne: {
          filter: { fieldId: field.id },
          update: { $set: doc },
          upsert: true
        }
      };
    });

    const result = await AcademicTaxonomy.bulkWrite(ops);
    const added   = result.upsertedCount  || 0;
    const updated = result.modifiedCount  || 0;

    if (added > 0 || updated > 0) {
      console.log(`✅ Academic taxonomy synced: ${added} new field(s) added, ${updated} updated.`);
    } else {
      console.log("✅ Academic taxonomy up-to-date (no changes needed).");
    }
  } catch (err) {
    console.error("Error seeding academic taxonomy:", err.message);
  }
};

module.exports = { seedTaxonomyData };
