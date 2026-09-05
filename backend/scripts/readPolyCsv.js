const fs = require('fs');

let raw = fs.readFileSync('uploads/college.csv', 'utf8');
raw = raw.replace(/\\,/g, '|||COMMA|||');
const lines = raw.split('\n').filter(l => l.trim());

const colleges = new Map(); // name -> { category, district, courses }
const allCourses = new Set();
let badRows = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const parts = [];
  let current = '';
  let inQuote = false;
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '"') { inQuote = !inQuote; continue; }
    if (line[j] === ',' && !inQuote) { parts.push(current.trim()); current = ''; continue; }
    current += line[j];
  }
  parts.push(current.trim());

  const sno = parseInt(parts[0]) || 0;
  const code = parts[1] || '';
  const name = (parts[2] || '').replace(/\|\|\|COMMA\|\|\|/g, ',').trim().replace(/\\+$/, '').trim();
  const category = (parts[3] || '').replace(/\|\|\|COMMA\|\|\|/g, ',').trim();
  const district = (parts[4] || '').replace(/\|\|\|COMMA\|\|\|/g, ',').trim();
  const coursesStr = (parts[5] || '').replace(/\|\|\|COMMA\|\|\|/g, ',').trim();

  if (!name || !coursesStr || !coursesStr.match(/Diploma/i)) {
    badRows++;
    continue;
  }

  const courses = coursesStr.split(',').map(c => c.trim()).filter(c => c.match(/Diploma/i));
  if (courses.length === 0) { badRows++; continue; }

  // Fix category - if it looks like a district, try to infer from district column
  let fixedCategory = category;
  if (!category.match(/GOVERNMENT|SELF|AUTONOMOUS|AFFILIATED/i)) {
    fixedCategory = 'SELF FINANCING';
  }
  // Normalize category
  if (fixedCategory === 'GOVERNMENT AIDED POLYTECHNIC COLLEGES') fixedCategory = 'GOVERNMENT AIDED';

  colleges.set(name, { code, category: fixedCategory, district, courses });
  courses.forEach(c => allCourses.add(c));
}

console.log('Total valid rows:', colleges.size);
console.log('Bad rows skipped:', badRows);
console.log('Unique courses:', allCourses.size);
console.log('\nAll courses:');
[...allCourses].sort().forEach(c => console.log(' ', c));
console.log('\nCategory breakdown:');
const cats = {};
colleges.forEach(c => { cats[c.category] = (cats[c.category] || 0) + 1; });
Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ', v, k));
console.log('\nSample rows:');
let count = 0;
colleges.forEach((v, k) => {
  if (count < 5) {
    console.log('  ', k, '|', v.category, '|', v.district, '|', v.courses.join(', '));
    count++;
  }
});
