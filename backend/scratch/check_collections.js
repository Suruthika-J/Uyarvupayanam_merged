const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const College = require("../models/College");
const Course = require("../models/Course");

async function checkCollections() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Colleges:", await College.countDocuments());
    console.log("Courses:", await Course.countDocuments());
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

checkCollections();
