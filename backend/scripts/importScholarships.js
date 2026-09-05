const mongoose = require("mongoose");
const xlsx = require("xlsx");
const path = require("path");
const dotenv = require("dotenv");
const Scholarship = require("../models/Scholarship");

// Load the environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const importScholarships = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        const filePath = path.join(__dirname, "../uploads/TN State Scholarship Portal.xlsx");
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Map the excel row keys to the model fields if necessary. We'll do a fallback approach.
        const docs = data.map((row) => ({
            scholarshipName: row["Scholarship Name"] || row.scholarshipName || row["Name"] || row["Scholarship Name*"] || row["SCHOLARSHIP NAME"] || "",
            provider: row["Provider"] || row.provider || row["Organization"] || row["Department"] || row["PROVIDER"] || "",
            eligibility: row["Eligibility"] || row.eligibility || row["Criteria"] || row["ELIGIBILITY"] || "",
            amount: row["Amount"] || row.amount || row["Scholarship Amount"] || row["Reward"] || row["AMOUNT"] || "",
            applicationLink: row["Application Link"] || row.applicationLink || row["Link"] || row["Apply Link"] || row["Apply"] || row["APPLICATION LINK"] || "",
        }));

        await Scholarship.insertMany(docs);
        console.log("Scholarships from Excel inserted successfully into MongoDB Atlas");
        process.exit();
    } catch (error) {
        console.error("Error importing data:", error);
        process.exit(1);
    }
};

importScholarships();
