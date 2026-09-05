require("dotenv").config();
const mongoose = require("mongoose");
const xlsx = require("xlsx");
const path = require("path");
const Scholarship = require("./models/scholarshipModel");

const MONGODB_URI = process.env.MONGO_URI;

const normalizeString = (v) => (v === null || v === undefined ? "" : String(v).trim());

const normalizeLevel = (v) => {
    const s = normalizeString(v);
    const map = {
        "5": "5th",
        "5th": "5th",
        "8": "8th",
        "8th": "8th",
        "10": "10th",
        "10th": "10th",
        "12": "12th",
        "12th": "12th",
        "graduate": "Graduate",
        "Graduation": "Graduate",
        "Graduate": "Graduate",
    };
    return map[s] || map[s.toLowerCase()] || s; // fallback
};

const parseDocuments = (v) => {
    if (Array.isArray(v)) return v.map((x) => normalizeString(x)).filter(Boolean);
    const s = normalizeString(v);
    if (!s) return [];
    // split by comma / newline / semicolon
    return s
        .split(/[,;\n]+/)
        .map((x) => x.trim())
        .filter(Boolean);
};

const parseExcelDate = (excelDate) => {
    if (!excelDate) return null;

    // Try to parse if it's already a valid date string
    const dateObj = new Date(excelDate);
    if (!isNaN(dateObj.getTime())) {
        return dateObj;
    }

    // Handle Excel serial date
    if (typeof excelDate === 'number') {
        const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
        return isNaN(date.getTime()) ? null : date;
    }

    // Could be format like DD/MM/YYYY or DD-MM-YYYY
    const parts = String(excelDate).split(/[-/]/);
    if (parts.length === 3) {
        // Assuming DD/MM/YYYY or DD-MM-YYYY
        const [day, month, year] = parts;
        if (year.length === 4) {
            const d = new Date(`${year}-${month}-${day}`);
            if (!isNaN(d.getTime())) return d;
        }
    }

    return null;
}

const seedScholarships = async () => {
    try {
        if (!MONGODB_URI) {
            console.error("❌ MONGODB_URI not found in .env file");
            process.exit(1);
        }

        console.log("⏳ Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB Connected");

        const excelPath = "C:\\Users\\harin\\Downloads\\TN State Scholarship Portal.xlsx";
        console.log(`⏳ Reading Excel file from: ${excelPath}`);

        const workbook = xlsx.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });
        console.log(`📊 Found ${rows.length} rows in Excel`);

        let insertedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        const currentDate = new Date();

        for (const row of rows) {
            try {
                const scholarshipName = normalizeString(row.scholarshipName || row.ScholarshipName || row["Scholarship Name"] || row.Name || row["Scholarship"]);
                let level = normalizeLevel(row.level || row.Level || row.Standard || row.Class);
                const incomeLimit = normalizeString(row.incomeLimit || row["Income Limit"] || row.Income || row["Income"]);

                const rawDeadline = row.deadline || row.Deadline || row["Last Date"] || row["Important Date"];
                const parsedDeadline = parseExcelDate(rawDeadline);

                const requiredDocuments = parseDocuments(row.requiredDocuments || row["Required Documents"] || row.Documents);
                const applicationLink = normalizeString(row.applicationLink || row["Application Link"] || row.ApplyLink || row["Apply Link"]);
                const description = normalizeString(row.description || row.Description || row.Remarks);

                let status = "Active";
                if (parsedDeadline) {
                    status = parsedDeadline >= currentDate ? "Active" : "Expired";
                }

                if (!scholarshipName) {
                    skippedCount++;
                    continue;
                }

                // Validate level against Enum
                const validLevels = ["5th", "8th", "10th", "12th", "Graduate"];
                if (!validLevels.includes(level)) {
                    // If the excel sheet has something else, default or skip. For now, try to coerce or skip.
                    // For seeding purposes, we might just default it to "Graduate" or skip. Let's skip if invalid to be safe.
                    skippedCount++;
                    continue;
                }

                const existing = await Scholarship.findOne({ scholarshipName, level });
                if (existing) {
                    skippedCount++;
                    continue;
                }

                await Scholarship.create({
                    scholarshipName,
                    level,
                    incomeLimit,
                    deadline: parsedDeadline,
                    requiredDocuments,
                    applicationLink,
                    description,
                    status
                });

                insertedCount++;
            } catch (err) {
                console.error("Row Error:", err.message);
                errorCount++;
            }
        }

        console.log("✅ Seeding completed!");
        console.log(`📈 Inserted: ${insertedCount}`);
        console.log(`⏭️  Skipped (duplicates/invalid): ${skippedCount}`);
        console.log(`❌ Errors: ${errorCount}`);

    } catch (err) {
        console.error("❌ Fatal Error during seeding:", err);
    } finally {
        console.log("🔌 Disconnecting from MongoDB...");
        await mongoose.disconnect();
        process.exit(0);
    }
};

seedScholarships();
