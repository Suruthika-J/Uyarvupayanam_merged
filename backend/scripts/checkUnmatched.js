const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const College = require('../models/College');
const Mapping = require('../models/CollegeCourseMapping');

function parseCSV(raw) {
  raw = raw.replace(/\\,/g, '|||COMMA|||');
  const lines = raw.split('\n').filter(l => l.trim());
  const rows = [];
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
    const name = (parts[2] || '').replace(/\|\|\|COMMA\|\|\|/g, ',').trim().replace(/\\+$/, '').trim();
    let category = (parts[3] || '').replace(/\|\|\|COMMA\|\|\|/g, ',').trim();
    const district = (parts[4] || '').replace(/\|\|\|COMMA\|\|\|/g, ',').trim();
    const coursesStr = (parts[5] || '').replace(/\|\|\|COMMA\|\|\|/g, ',').trim();
    if (!name || !coursesStr || !coursesStr.match(/Diploma/i)) continue;
    if (!category.match(/GOVERNMENT|SELF|AUTONOMOUS|AFFILIATED/i)) category = 'SELF FINANCING';
    if (category === 'GOVERNMENT AIDED POLYTECHNIC COLLEGES') category = 'GOVERNMENT AIDED';
    const courses = coursesStr.split(',').map(c => c.trim()).filter(c => c.match(/Diploma/i));
    if (courses.length === 0) continue;
    rows.push({ name, category, district, courses });
  }
  return rows;
}

function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const raw = fs.readFileSync(path.resolve(__dirname, '../uploads/college.csv'), 'utf8');
  const csvRows = parseCSV(raw);

  const csvByCollege = new Map();
  csvRows.forEach(r => csvByCollege.set(r.name, r));
  const uniqueCsv = [...csvByCollege.values()];

  const activeMappingNames = new Set();
  const activeMappings = await Mapping.find({ stream: 'Polytechnic', isActive: true });
  activeMappings.forEach(m => activeMappingNames.add(m.collegeName));

  const unmatched = uniqueCsv.filter(r => {
    const n = norm(r.name);
    for (const name of activeMappingNames) {
      if (norm(name).includes(n.substring(0, 15)) || n.includes(norm(name).substring(0, 15))) return false;
    }
    return true;
  });

  console.log('Unmatched CSV colleges:', unmatched.length);
  unmatched.forEach(r => console.log('  ', r.name, '|', r.district));
  
  process.exit(0);
})();
