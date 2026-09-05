const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Cutoff = require("../models/Cutoff");

async function checkCount() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await Cutoff.countDocuments();
    console.log(`Total records remaining: ${count}`);
    const count2024 = await Cutoff.countDocuments({ year: 2024 });
    console.log(`Total 2024 records remaining: ${count2024}`);
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

checkCount();
