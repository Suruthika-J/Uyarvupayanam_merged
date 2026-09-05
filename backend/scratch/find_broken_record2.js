const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Cutoff = require("../models/Cutoff");

async function findRecord() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const cutoffs = await Cutoff.find({ year: 2024, "cutoffData.score": 152.5 }).lean();
    console.log(JSON.stringify(cutoffs, null, 2));
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

findRecord();
