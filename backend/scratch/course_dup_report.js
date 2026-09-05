require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');
const Cutoff = require('../models/Cutoff');
const SavedItem = require('../models/SavedItem');
const VacancyPosition = require('../models/VacancyPosition');

function normalize(name) {
  return String(name || '')
    .replace(/^b\.?\s?e\.?\s*/i, '')
    .replace(/^b\.?\s?tech\.?\s*/i, '')
    .replace(/^m\.?\s?e\.?\s*/i, '')
    .replace(/^m\.?\s?tech\.?\s*/i, '')
    .replace(/^b\.?\s?sc\.?\s*/i, '')
    .replace(/^m\.?\s?sc\.?\s*/i, '')
    .replace(/\s*\(ss\)\s*/gi, '')
    .replace(/\s*\(tamil medium\)\s*/gi, '')
    .replace(/\s*\(english medium\)\s*/gi, '')
    .replace(/\s*\(polytechnic\)\s*/gi, '')
    .replace(/\s*\(diploma\)\s*/gi, '')
    .replace(/[^a-z0-9\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function titleCase(s) {
  return s
    .toLowerCase()
    .split(' ')
    .map(w => (w && /^[a-z]/.test(w) ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Analyzing course duplication...\n');

  const courses = await Course.find({ status: 'active' }).lean();
  const mappings = await CollegeCourseMapping.find({ isActive: true }).select('courseId').lean();
  const cutoffs = await Cutoff.find().select('courseId').lean();
  const actions = await SavedItem.find({ contentType: 'Course' }).select('contentId').lean();
  const vacancies = await VacancyPosition.find().select('courseId').lean();

  const mappingCount = {};
  mappings.forEach(m => { mappingCount[m.courseId] = (mappingCount[m.courseId] || 0) + 1; });
  const cutoffCount = {};
  cutoffs.forEach(c => { cutoffCount[c.courseId] = (cutoffCount[c.courseId] || 0) + 1; });
  const actionCount = {};
  actions.forEach(a => {
    const id = a.contentId && a.contentId._id ? a.contentId._id : a.contentId;
    actionCount[id] = (actionCount[id] || 0) + 1;
  });
  const vacancyCount = {};
  vacancies.forEach(v => { if (v.courseId) vacancyCount[v.courseId] = (vacancyCount[v.courseId] || 0) + 1; });

  const groups = {};
  for (const c of courses) {
    const key = `${normalize(c.courseName)}|${normalize(c.category)}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push({
      _id: c._id,
      name: c.courseName,
      level: c.level,
      codes: mappingCount[c._id] || 0,
      cutoffs: cutoffCount[c._id] || 0,
      saves: actionCount[c._id] || 0,
      vacancies: vacancyCount[c._id] || 0,
    });
  }

  const dupGroups = Object.values(groups).filter(g => g.length > 1);

  console.log('TOTAL ACTIVE COURSES:', courses.length);
  console.log('UNIQUE NORMALIZED KEYS:', Object.keys(groups).length);
  console.log('GROUPS WITH 2+ ENTRIES (duplicate candidates):', dupGroups.length, '\n');

  // Only show groups that actually share a name across different naming conventions
  // (skip genuine specializations: keyboard-visible different content)
  const reinspect = [];
  for (const g of dupGroups) {
    const baseNormalized = new Set(g.map(c => normalize(c.name)));
    // Flag specializations (have parentheticals beyond SS/Tamil/English)
    const sz = g.filter(c => /\(.*(?<!ss)(?<!tamil medium)(?<!english medium)\).*\)/i.test(c.name));
    const plain = g.filter(c => !/\(.*\)/i.test(c.name.replace(/\s*\(ss\)\s*/gi, '').replace(/\s*\(tamil medium\)\s*/gi, '').replace(/\s*\(english medium\)\s*/gi, '')));
    const groupIsSameName = baseNormalized.size === 1;
    reinspect.push({ g, sz, plain, groupIsSameName });
  }

  console.log('=== REPORT ===\n');
  for (const { g } of reinspect) {
    const canonical = titleCase(normalize(g[0].name));
    const totalMappings = g.reduce((s, c) => s + c.codes, 0);
    console.log(`CANONICAL: ${canonical}  (category: ${g[0].name ? g[0].category : ''} | level: ${g[0].level} | total college maps: ${totalMappings})`);
    for (const c of g) {
      console.log(`   — [${c._id}] "${c.name}"  → colleges:${c.codes} cutoffs:${c.cutoffs} saves:${c.saves} vacancies:${c.vacancies}`);
    }
    console.log('');
  }

  await mongoose.disconnect();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });