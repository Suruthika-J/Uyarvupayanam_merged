const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Cutoff = require("../models/Cutoff");

async function check2025() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const cutoffs = await Cutoff.find({ year: 2025 }).limit(5).lean();
    console.log("2025 Cutoffs:", JSON.stringify(cutoffs, null, 2));
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

check2025();
