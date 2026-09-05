const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const College = require('../models/College');

const excelPath = path.join(__dirname, '../uploads/Diploma College with Course Offered (1).xlsx');
const workbook = xlsx.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet);

const normalizeCollegeName = (name) => {
  if (!name) return '';
  return name.toString().toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

async function test() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);

    const allColleges = await College.find({}).lean();
    const dbCollegeNames = new Set(allColleges.map(c => c.collegeName.toLowerCase()));
    const dbCollegeNorms = new Set(allColleges.map(c => normalizeCollegeName(c.collegeName)));
    const dbCollegeCodes = new Set(allColleges.filter(c => c.collegeCode).map(c => String(c.collegeCode).trim()));

    const uniqueExcelColleges = new Map();
    rows.forEach(row => {
      const name = row['College Name'] ? String(row['College Name']).trim() : '';
      const code = row['College Code'] ? String(row['College Code']).trim() : '';
      if (name) {
        uniqueExcelColleges.set(name, { name, code });
      }
    });

    console.log(`Unique colleges in Excel: ${uniqueExcelColleges.size}`);
    
    let matchedCount = 0;
    let skippedCount = 0;
    const skippedSamples = [];

    for (const [name, info] of uniqueExcelColleges) {
      let matched = false;
      if (info.code && dbCollegeCodes.has(info.code)) {
        matched = true;
      } else if (dbCollegeNames.has(name.toLowerCase())) {
        matched = true;
      } else {
        const norm = normalizeCollegeName(name);
        if (dbCollegeNorms.has(norm)) {
          matched = true;
        }
      }

      if (matched) {
        matchedCount++;
      } else {
        skippedCount++;
        if (skippedSamples.length < 10) {
          skippedSamples.push(info);
        }
      }
    }

    console.log(`Matched unique: ${matchedCount}`);
    console.log(`Skipped unique: ${skippedCount}`);
    console.log('Skipped samples:', skippedSamples);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
