const mongoose = require("mongoose");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI is not set. Add it to your environment (e.g. backend/.env) before running this script.");
  process.exit(1);
}

async function analyze() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  const cutoffsColl = db.collection("cutoffs");
  const sample = await cutoffsColl.find({}).limit(5).toArray();
  
  fs.writeFileSync("./cutoff_analysis.json", JSON.stringify(sample, null, 2));
  console.log("Analysis saved to cutoff_analysis.json");
  process.exit();
}

analyze();
