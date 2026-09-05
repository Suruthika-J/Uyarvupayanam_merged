const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const Scholarship = require("../models/Scholarship");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const clearScholarships = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected for cleanup");

        const result = await Scholarship.deleteMany({});
        console.log(`Successfully deleted ${result.deletedCount} scholarships.`);

        process.exit(0);
    } catch (err) {
        console.error("Error clearing scholarships:", err);
        process.exit(1);
    }
};

clearScholarships();
