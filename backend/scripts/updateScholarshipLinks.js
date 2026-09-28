const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const ClassContent = require('../models/ClassContent');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/uyarvu-payanam";

const LINK_UPDATES = [
  {
    title: "PM-YASASVI Post-Matric Scholarship",
    externalLink: "https://scholarships.gov.in/",
  },
  {
    title: "NMMS Scholarship Continuation",
    externalLink: "https://www.education.gov.in/en/nmms",
  },
];

async function update() {
  try {
    if (!MONGO_URI) throw new Error("No MONGO_URI in .env");
    console.log("Connecting to DB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    for (const update of LINK_UPDATES) {
      const result = await ClassContent.updateMany(
        { title: update.title, targetClass: { $in: ["10", "class10"] } },
        { $set: { externalLink: update.externalLink } }
      );
      console.log(`Updated "${update.title}": matched ${result.matchedCount}, modified ${result.modifiedCount}`);
    }

    console.log("Done.");
    process.exit(0);
  } catch (error) {
    console.error("CRITICAL UPDATE ERROR:");
    console.error(error.message || error);
    process.exit(1);
  }
}

update();