const mongoose = require("mongoose");

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const localFallbackUri = "mongodb://127.0.0.1:27017/uyarvu_payanam";

  if (primaryUri) {
    try {
      console.log("Connecting to MongoDB...");
      await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 5000 });
      console.log(`MongoDB Connected (Primary): ${primaryUri.split("@")[1] || primaryUri}`);
      return;
    } catch (error) {
      console.warn(`⚠️ Primary MongoDB connection failed (${error.message}). Trying local MongoDB fallback...`);
    }
  }

  try {
    await mongoose.connect(localFallbackUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB Connected (Local Fallback): ${localFallbackUri}`);
  } catch (error) {
    console.error("❌ Both Primary and Local MongoDB connections failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;