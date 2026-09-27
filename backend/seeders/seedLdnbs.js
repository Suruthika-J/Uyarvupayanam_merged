// backend/seeders/seedLdnbs.js
//
// Seeds (idempotent) the LD-NBSE knowledge base from config/ldnbs/*:
//   - skill_taxonomy  (per grade)
//   - skill_dependencies (per grade)
//   - ldnbs_config default document (weights/thresholds/effort)
//
// Run: node seedLdnbs.js  (from backend/)
"use strict";

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const SkillTaxonomy = require("../models/SkillTaxonomy");
const SkillDependency = require("../models/SkillDependency");
const LdnbsConfig = require("../models/LdnbsConfig");
const taxonomy = require("../config/ldnbs/skillTaxonomyConfig");
const { DEFAULT_WEIGHTS, DEFAULT_THRESHOLDS, DEFAULT_EFFORT, DEFAULT_SUCCESS_MESSAGES } = require("../config/ldnbs/recommendationWeights");

dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/uyarvu-payanam");
    console.log("Connected. Seeding LD-NBSE knowledge base...");

    // 1) skill_taxonomy (replace per grade — still idempotent)
    for (const grade of taxonomy.GRADES) {
        await SkillTaxonomy.deleteMany({ grade });
        const docs = Object.entries(taxonomy.TAXONOMY[grade]).map(([skill, subskills]) => ({ grade, skill, subskills }));
        if (docs.length) await SkillTaxonomy.insertMany(docs);
        console.log(`  skill_taxonomy: ${grade} → ${docs.length} skills`);
    }

    // 2) skill_dependencies (replace per grade)
    for (const grade of taxonomy.GRADES) {
        await SkillDependency.deleteMany({ grade });
        const deps = taxonomy.getDependencies(grade);
        if (deps.length) await SkillDependency.insertMany(deps);
        console.log(`  skill_dependencies: ${grade} → ${deps.length} nodes`);
    }

    // 3) default ldnbs_config (upsert — only sets when absent)
    await LdnbsConfig.updateOne(
        { key: "default" },
        {
            $setOnInsert: {
                key: "default",
                weights: DEFAULT_WEIGHTS,
                thresholds: DEFAULT_THRESHOLDS,
                effortByStatus: DEFAULT_EFFORT,
                successMessages: DEFAULT_SUCCESS_MESSAGES,
            },
        },
        { upsert: true }
    );
    console.log("  ldnbs_config: default document ensured");

    await mongoose.disconnect();
    console.log("Done.");
    process.exit(0);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});