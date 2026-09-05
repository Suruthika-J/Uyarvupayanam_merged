const xlsx = require('xlsx');
const path = require('path');
const excelPath = path.resolve(__dirname, '../uploads/Law Colleges and its Courses Updated.xlsx');
const wb = xlsx.readFile(excelPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(ws);
console.log('Total rows:', rows.length);
console.log('Columns:', Object.keys(rows[0] || {}));
console.log('---All rows---');
rows.forEach((r, i) => {
  console.log(`\nRow ${i + 1}:`);
  console.log(JSON.stringify(r, null, 2));
});
