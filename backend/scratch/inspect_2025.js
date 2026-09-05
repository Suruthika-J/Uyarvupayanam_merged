const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Cutoff = require("../models/Cutoff");

async function inspectFields() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const cutoff = await Cutoff.findOne({ year: 2025 }).lean();
    console.log("Keys in 2025 record:", Object.keys(cutoff));
    console.log("Full 2025 record:", JSON.stringify(cutoff, null, 2));
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

inspectFields();
