const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const College = require("../models/College");

async function countColleges() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await College.countDocuments({});
    console.log("Total Colleges:", count);
    const sample = await College.find({}).limit(1).lean();
    console.log("Sample College:", JSON.stringify(sample, null, 2));
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

countColleges();
