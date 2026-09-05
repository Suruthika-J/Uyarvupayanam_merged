const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Cutoff = require("../models/Cutoff");

async function find2025WithData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // Find records that have at least one of these fields
    const cutoffs = await Cutoff.find({ 
      year: 2025,
      $or: [
        { collegeName: { $exists: true } },
        { collegeCode: { $exists: true } },
        { college: { $exists: true } },
        { coc: { $exists: true } }
      ]
    }).limit(5).lean();
    console.log("2025 Cutoffs with data:", JSON.stringify(cutoffs, null, 2));
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

find2025WithData();
