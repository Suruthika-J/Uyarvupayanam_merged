const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Cutoff = require("../models/Cutoff");

async function count2025() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await Cutoff.countDocuments({ year: 2025 });
    console.log("Total 2025 records:", count);
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

count2025();
