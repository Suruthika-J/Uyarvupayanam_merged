/**
 * importCutoffEngineData.js
 *
 * Usage:
 *   node importCutoffEngineData.js "C:/Users/ELAKKIYA/Documents/cutoffengine" --year=2024 --stream=Engineering
 *
 * Dependencies:
 *   npm install mongoose xlsx
 *
 * This script reads all CSV/XLSX files in the folder, maps columns, and imports records in Cutoff collection.
 * It does upsert to avoid duplicates and logs insert count.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const XLSX = require('xlsx');

const Cutoff = require('../models/Cutoff');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/cutoffmanagement';

const args = process.argv.slice(2);
if (!args.length) {
  console.error('Usage: node importCutoffEngineData.js <folderPath> [--year=2024] [--stream=Engineering]');
  process.exit(1);
}

const folderPath = path.resolve(args[0]);
const yearArg = args.find((o) => o.startsWith('--year='));
const streamArg = args.find((o) => o.startsWith('--stream='));

const year = yearArg ? Number(yearArg.split('=')[1]) : 2024;
const stream = streamArg ? streamArg.split('=')[1] : 'Engineering';

const targetFields = {
  collegeName: 'collegeName',
  courseName: 'courseName',
  categoryOC: 'oc',
  categoryBC: 'bc',
  categoryBCM: 'mbc',
  categoryMBC: 'mbc',
  categorySC: 'sc',
  categoryST: 'st',
};

function normalizeHeader(header) {
  return header
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function parseObjectRow(row) {
  const normalized = {};

  for (const key in row) {
    if (!Object.hasOwn(row, key)) continue;
    const normKey = normalizeHeader(key);
    normalized[normKey] = row[key];
  }

  const record = {
    collegeName:
      row.collegeName || row.collegename || row.college_name || row['College Name'] || row['college name'] || '',
    courseName:
      row.courseName || row.coursename || row.course || row.department || row['Course Name'] || row['course name'] || '',
    categoryOC: Number(row.otacategoryOC || row['OC'] || row['oc'] || row['general'] || row['generalcategory'] || row['categoryoc'] || 0) || 0,
    categoryBC: Number(row['bc'] || row['bc'] || row['categorybc'] || 0) || 0,
    categoryBCM: Number(row['bcm'] || row['categorybcm'] || 0) || 0,
    categoryMBC: Number(row['mbc'] || row['categorymbc'] || 0) || 0,
    categorySC: Number(row['sc'] || row['categorysc'] || 0) || 0,
    categoryST: Number(row['st'] || row['categoryst'] || 0) || 0,
    year,
    stream,
  };

  // fallback for existing model fields (Cutoff schema stores department, etc.)
  if (!record.courseName && row.department) {
    record.courseName = row.department;
  }

  if (!record.collegeName && row.college_code) {
    record.collegeName = row.college_name || row.collegeCode || row.college; // fallback
  }

  return record;
}

function parseCSV(fileContent) {
  const lines = fileContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length);

  if (!lines.length) {
    return [];
  }

  const headers = lines[0]
    .split(',')
    .map((h) => h.trim())
    .map((h) => h.replace(/\uFEFF/g, ''));

  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 2) continue;

    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = cols[j] !== undefined ? cols[j].trim() : '';
    }

    rows.push(row);
  }

  return rows;
}

function parseXLSX(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return data;
}

async function readAllFiles(inputFolder) {
  if (!fs.existsSync(inputFolder)) {
    throw new Error(`Folder not found: ${inputFolder}`);
  }

  const files = fs.readdirSync(inputFolder).filter((f) => !f.startsWith('.'));

  let allRows = [];

  for (const fileName of files) {
    const fullPath = path.join(inputFolder, fileName);
    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) continue;

    const ext = path.extname(fileName).toLowerCase();

    let rows = [];
    if (ext === '.csv') {
      const content = fs.readFileSync(fullPath, 'utf8');
      rows = parseCSV(content);
    } else if (ext === '.xlsx' || ext === '.xls') {
      rows = parseXLSX(fullPath);
    } else {
      continue;
    }

    console.log(`Read ${rows.length} rows from ${fileName}`);
    allRows = allRows.concat(rows);
  }

  return allRows;
}

async function main() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    const rawRows = await readAllFiles(folderPath);
    if (!rawRows.length) {
      console.warn('No records found to import.');
      return;
    }

    const mappedRecords = rawRows
      .map(parseObjectRow)
      .filter((r) => r.collegeName && r.courseName);

    console.log(`Mapped ${mappedRecords.length} valid records for import.`);

    const bulkOps = [];
    const seen = new Set();

    for (const r of mappedRecords) {
      const key = `${r.collegeName}||${r.courseName}||${r.year}||${r.stream}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const filter = {
        collegeName: r.collegeName,
        courseName: r.courseName,
        year: r.year,
        stream: r.stream,
      };

      const updateDoc = {
        $setOnInsert: {
          collegeName: r.collegeName,
          courseName: r.courseName,
          categoryOC: r.categoryOC,
          categoryBC: r.categoryBC,
          categoryBCM: r.categoryBCM,
          categoryMBC: r.categoryMBC,
          categorySC: r.categorySC,
          categoryST: r.categoryST,
          year: r.year,
          stream: r.stream,
        },
      };

      bulkOps.push({ updateOne: { filter, update: updateDoc, upsert: true } });
    }

    if (!bulkOps.length) {
      console.warn('No unique records to upsert.');
      return;
    }

    const result = await Cutoff.bulkWrite(bulkOps, { ordered: false });

    const inserted = (result.upsertedCount || 0);
    const matched = result.matchedCount || 0;

    console.log('Import summary:');
    console.log(`  Total rows processed: ${mappedRecords.length}`);
    console.log(`  Unique keys: ${bulkOps.length}`);
    console.log(`  Already existing/skipped: ${matched}`);
    console.log(`  Inserted new records: ${inserted}`);

    if (inserted >= 3500) {
      console.log('✅ Success: 3500+ records imported.');
    } else if (inserted > 0) {
      console.log(`⚠️ Inserted ${inserted}. Expected around 3500. Check dataset or dedupe policy.`);
    } else {
      console.log('ℹ️ No new records inserted (all duplicates existing).');
    }
  } catch (err) {
    console.error('Error in import:', err);
  } finally {
    await mongoose.connection.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
