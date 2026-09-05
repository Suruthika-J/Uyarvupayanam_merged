const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config(); // Reads from backend/.env

const updateLegacyUsers = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in the environment.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for migration.");

    // Update missing roles
    const roleUpdateResult = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: "student" } }
    );
    console.log(`Updated ${roleUpdateResult.modifiedCount} users to have role="student".`);

    // Update missing status
    const statusUpdateResult = await User.updateMany(
      { status: { $exists: false } },
      { $set: { status: "active" } }
    );
    console.log(`Updated ${statusUpdateResult.modifiedCount} users to have status="active".`);

    console.log("User migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

updateLegacyUsers();
