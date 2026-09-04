const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Cutoff = require('../models/Cutoff');

const USAGE = `
Usage:
  node importCutoffs.js <csvFilePath> [--year=2024] [--source=tnea]

Example:
  node importCutoffs.js "C:/Users/ELAKKIYA/Documents/cutoffengine/cutoffs.csv" --year=2024 --source=local
`;

async function importFile(filePath, year, source) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) {
    throw new Error('CSV file is empty.');
  }

  const header = lines[0].split(',').map((h) => h.trim());
  const expected = ['collegeCode', 'collegeName', 'department', 'oc', 'bc', 'mbc', 'sc', 'st'];

  // allow slightly different headers if they exist.
  const mappedHeaders = header.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const entries = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    if (values.length < 8) {
      continue;
    }

    const row = {};

    for (let j = 0; j < header.length; j++) {
      const key = mappedHeaders[j];
      const val = values[j];
      if (!key) continue;

      switch (key) {
        case 'collegecode':
          row.collegeCode = val;
          break;
        case 'collegename':
          row.collegeName = val;
          break;
        case 'department':
          row.department = val;
          break;
        case 'oc':
        case 'general':
          row.oc = Number(val) || 0;
          break;
        case 'bc':
        case 'obc':
          row.bc = Number(val) || 0;
          break;
        case 'mbc':
          row.mbc = Number(val) || 0;
          break;
        case 'sc':
          row.sc = Number(val) || 0;
          break;
        case 'st':
          row.st = Number(val) || 0;
          break;
        default:
          break;
      }
    }

    if (row.collegeCode && row.collegeName && row.department) {
      row.year = year;
      row.source = source;
      entries.push(row);
    }
  }

  if (!entries.length) {
    throw new Error('No valid cutoff rows found in CSV');
  }

  console.log(`Parsed ${entries.length} rows from ${filePath}`);

  // Optional: delete existing year/source
  await Cutoff.deleteMany({ year, source });

  const result = await Cutoff.insertMany(entries);
  console.log(`Imported ${result.length} cutoff documents to Cutoff collection`);
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.log(USAGE);
    process.exit(1);
  }

  const filePath = args[0];
  const yearArg = args.find((a) => a.startsWith('--year='));
  const sourceArg = args.find((a) => a.startsWith('--source='));

  const year = yearArg ? Number(yearArg.split('=')[1]) : 2024;
  const source = sourceArg ? sourceArg.split('=')[1] : 'local';

  await connectDB();

  try {
    await importFile(path.resolve(filePath), year, source);
    console.log('Cutoff data import completed successfully.');
  } catch (err) {
    console.error('Error importing cutoffs:', err.message);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
}

main();
