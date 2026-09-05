const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Course = require('../models/Course');

const CSV_PATH = path.resolve(__dirname, '../master_course_dataset_320.csv');

/**
 * Normalizes mixed Type values into { afterFix, eligibility }
 */
const normalizeType = (rawType) => {
  const t = (rawType || '').trim().toLowerCase();
  
  // Type Mapping Logic
  // Degree -> After 12th
  // Undergraduate -> After 12th
  // 12th -> After 12th
  // Diploma -> Diploma
  // 10th -> After 10th
  
  if (t === 'degree' || t === 'undergraduate' || t === '12th' || t === 'postgraduate') {
    return { type: 'After 12th', eligibility: '12th' };
  }
  if (t === 'diploma') {
    return { type: 'Diploma', eligibility: '12th' };
  }
  if (t === '10th') {
    return { type: 'After 10th', eligibility: '10th' };
  }
  
  return { type: 'After 12th', eligibility: '12th' }; // Default fallback
};

async function runMigration() {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/uyarvu_payanam";
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");

    if (!fs.existsSync(CSV_PATH)) {
       throw new Error(`CSV file not found at ${CSV_PATH}`);
    }

    const content = fs.readFileSync(CSV_PATH, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    // Headers: Course Name, Category, Level, Duration, Eligibility, Future Scope
    // Requirement Mapping:
    // Course Name -> courseName
    // Trajectory -> category (This is actually the 2nd column 'Category' in the CSV)
    // Category -> duration (This is actually the 4th column 'Duration' in the CSV)
    // Generate Eligibility based on Type
    
    const coursesToInsert = [];
    const seenNames = new Set();

    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < 3) continue;

      const courseName = parts[0];
      const category = parts[1]; // From Trajectory col
      const rawType = parts[2];
      const duration = parts[3]; // From Category col

      if (!courseName || seenNames.has(courseName)) continue;
      seenNames.add(courseName);

      const norm = normalizeType(rawType);

      coursesToInsert.push({
        courseName,
        level: norm.type, // "After 12th", "Diploma", "After 10th"
        targetLevel: norm.type, // Sync for now
        category,
        duration,
        eligibility: norm.eligibility,
        shortDescription: parts[5] || `Professional ${courseName} course guide.`,
        sourceName: 'Manual',
        isImported: false,
        isPublished: true,
        status: 'active'
      });
    }

    console.log(`📊 Normalization complete. ${coursesToInsert.length} records ready.`);

    // Replace existing records
    await Course.deleteMany({});
    console.log("🗑 Cleared old records.");

    const result = await Course.insertMany(coursesToInsert);
    console.log(`🚀 Successfully imported ${result.length} normalized courses.`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

runMigration();
