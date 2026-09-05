const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const excelPath = path.join(__dirname, '../uploads/Diploma College with Course Offered (1).xlsx');
const workbook = xlsx.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet);

console.log('Searching for Lakshmi in Excel...');
rows.forEach((row, index) => {
  const name = row['College Name'] ? String(row['College Name']) : '';
  const code = row['College Code'] ? String(row['College Code']) : '';
  if (name.toLowerCase().includes('lakshmi')) {
    console.log(`Row ${index + 1}: Name="${name}", Code="${code}"`);
  }
});
