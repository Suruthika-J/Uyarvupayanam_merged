require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Course = require('../models/Course');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');
const Cutoff = require('../models/Cutoff');
const SavedItem = require('../models/SavedItem');
const VacancyPosition = require('../models/VacancyPosition');

const OUT_GROUPS = path.join(__dirname, 'step2_dup_groups.csv');
const OUT_COURSES = path.join(__dirname, 'step2_dup_courses.csv');
const OUT_SUMMARY = path.join(__dirname, 'step2_dup_summary.json');

// Longer/more-specific patterns FIRST so they win over shorter prefixes (BARCH before BA, BTECH before BE, etc.)
const DEGREE_RE = /^(m\.?\s*b\.?\s*b\.?\s*s\.?|b\.?\s*t\.?\s*e\.?\s*c\.?\s*h\.?|m\.?\s*t\.?\s*e\.?\s*c\.?\s*h\.?|b\.?\s*b\.?\s*o\.?\s*m\.?\s*.?|b\.?\s*b\.?\s*a\.?|b\.?\s*a\.?\s*r\.?\s*c\.?\s*h\.?|b\.?\s*a\.?\s*m\.?\s*s\.?|b\.?\s*s\.?\s*m\.?\s*s\.?|b\.?\s*s\.?\s*c\.?|m\.?\s*s\.?\s*c\.?|b\.?\s*b\.?\s*e\.?\s*d\.?|b\.?\s*e\.?\s*d\.?|m\.?\s*b\.?\s*e\.?\s*d\.?|m\.?\s*e\.?\s*d\.?|b\.?\s*c\.?\s*o\.?\s*m\.?|b\.?\s*p\.?\s*h\.?\s*a\.?\s*r\.?\s*m\.?|m\.?\s*p\.?\s*h\.?\s*a\.?\s*r\.?\s*m\.?|d\.?\s*p\.?\s*h\.?\s*a\.?\s*r\.?\s*m\.?|b\.?\s*d\.?\s*s\.?|d\.?\s*m\.?\s*a\.?\s*r\.?\s*h\.?|b\.?\s*v\.?\s*s\.?\s*c\.?|l\.?\s*l\.?\s*b\.?|b\.?\s*l\.?\s*i\.?\s*b\.?|b\.?\s*l\.?|m\.?\s*a\.?\s*r\.?\s*c\.?\s*h\.?|d\.?\s*i\.?\s*p\.?\s*l\.?\s*o\.?\s*m\.?\s*a\.?|p\.?\s*o\.?\s*l\.?\s*y\.?\s*t\.?\s*e\.?\s*c\.?\s*h\.?\s*n\.?\s*i\.?\s*c\.?|m\.?\s*b\.?\s*a\.?|b\.?\s*a\.?|b\.?\s*e\.?|m\.?\s*e\.?)\s*/i;

// Only "(Tamil Medium)" / "(English Medium)" are noise — bare "Tamil" or "English" are subjects
const NOISE_PAREN = /^(ss|tamil\s+medium|english\s+medium|polytechnic|diploma|iti)$/i;
const BARE_NOISE_TAIL = /\s+(?:ss|(?:tamil|english)\s+medium|polytechnic|diploma|iti)\s*$/gi;

function cleanLetters(s) {
  return String(s || '').toUpperCase().replace(/[^A-Z]/g, '');
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s*\(?\s*ss\s*\)?\s*/gi, ' ')
    .replace(/[^a-z0-9]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseCourse(c) {
  const raw = String(c.courseName || '').trim();
  let rest = raw;
  let degree = '';
  const dm = DEGREE_RE.exec(rest);
  if (dm) {
    degree = cleanLetters(dm[0]);
    rest = rest.slice(dm[0].length).trim();
  }

  const isSs = /\bss\b/i.test(raw);
  const isTamil = /\b(?:tamil(?: medium)?)\b/i.test(raw);
  const isEnglish = /(?:^|\s|\(|\))english(?: medium)?(?:$|\s|\(|\))/i.test(raw);

  // Split off specialization parentheticals; keep genuine ones as variant
  const variantParts = [];
  let base = rest.replace(/\(([^)]*)\)/g, (m, inner) => {
    const innerClean = String(inner).trim().toLowerCase().replace(/[^a-z0-9\s]+/gi, ' ').replace(/\s+/g, ' ').trim();
    if (NOISE_PAREN.test(innerClean)) return ' ';
    variantParts.push(innerClean);
    return ' ';
  });
  base = base.replace(BARE_NOISE_TAIL, ' ').trim();

  // "B.A. (English)" style: everything lived in a parenthetical -> treat all as base
  if (!base && variantParts.length) {
    base = variantParts.join(' ');
    variantParts.length = 0;
  }

  const variant = norm(variantParts.join(' '));
  const baseNorm = norm(base);

  return {
    _id: c._id,
    raw,
    degree,
    ss: isSs,
    medium: isTamil ? 'Tamil' : isEnglish ? 'English' : '',
    variant,
    base: baseNorm,
    level: String(c.level || ''),
    category: String(c.category || ''),
    createdAt: c.createdAt || null,
    richness: [
      c.shortDescription, c.overview, c.admissionProcess, c.scope,
      c.careerScope, c.higherStudies, c.eligibility, c.duration,
      c.branchCode, c.subjectsCovered
    ].filter(v => v && (typeof v !== 'string' || v.trim())).length,
  };
}

function titleCase(s) {
  return String(s)
    .toLowerCase()
    .split(' ')
    .map(w => (w && /^[a-z]/.test(w) ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function csvRow(fields) {
  return fields.map(f => {
    const s = String(f == null ? '' : f);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(',') + '\n';
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Running degree-type-aware duplication analysis...\n');

  const courses = await Course.find({ status: 'active' }).lean();
  const mappings = await CollegeCourseMapping.find({ isActive: true }).select('courseId collegeId collegeName').lean();
  const cutoffs = await Cutoff.find().select('courseId').lean();
  const actions = await SavedItem.find({ contentType: 'Course' }).select('contentId').lean();
  const vacancies = await VacancyPosition.find().select('courseId').lean();

  const byCourse = (arr, keyField) => {
    const m = {};
    arr.forEach(x => {
      const id = x[keyField] && x[keyField]._id ? x[keyField]._id : x[keyField];
      if (!id) return;
      if (!m[id]) m[id] = [];
      m[id].push(x);
    });
    return m;
  };
  const mappingByCourse = byCourse(mappings, 'courseId');
  const cutoffByCourse = byCourse(cutoffs, 'courseId');
  const actionByCourse = byCourse(actions, 'contentId');
  const vacancyByCourse = byCourse(vacancies, 'courseId');

  const parsed = [];
  for (const c of courses) {
    const p = parseCourse(c);
    p.maps = (mappingByCourse[c._id] || []).length;
    p.colleges = new Set((mappingByCourse[c._id] || []).map(m => String(m.collegeId)));
    p.cutoffs = (cutoffByCourse[c._id] || []).length;
    p.saves = (actionByCourse[c._id] || []).length;
    p.vacancies = (vacancyByCourse[c._id] || []).length;
    parsed.push(p);
  }

  // Group by base|level|variant (variant preserved so genuine specializations stay separate)
  const groups = {};
  for (const p of parsed) {
    const key = `${p.base}|${p.level}|${p.variant}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }

  const rawGroups = Object.values(groups).filter(g => g.length > 1);
  let classA = 0, classB = 0, classC = 0;
  let mergeableMembers = 0, reviewMembers = 0;
  let sumMaps = 0, sumOverlap = 0;

  const outGroups = [];
  const outCourses = [];

  rawGroups.forEach((g, i) => {
    const base = g[0].base;
    const level = g[0].level;
    const variant = g[0].variant;
    const distinctDegrees = [...new Set(g.map(m => m.degree).filter(Boolean))];

    // class: C = multiple genuine degree types present (review, do NOT auto-merge)
    //        A = members share an identical display name (pure import copies)
    //        B = same course expressed with different naming conventions
    let klass;
    if (distinctDegrees.length >= 2) klass = 'C';
    else {
      const distinctNames = new Set(g.map(m => norm(m.raw)));
      klass = distinctNames.size === 1 ? 'A' : 'B';
    }

    const totalMaps = g.reduce((s, m) => s + m.maps, 0);
    const unionColleges = new Set();
    g.forEach(m => m.colleges.forEach(cl => unionColleges.add(cl)));
    const overlap = totalMaps - unionColleges.size;
    const totalCutoffs = g.reduce((s, m) => s + m.cutoffs, 0);
    const totalSaves = g.reduce((s, m) => s + m.saves, 0);
    const totalVacancies = g.reduce((s, m) => s + m.vacancies, 0);

    if (klass === 'C') { classC++; reviewMembers += g.length; }
    else { if (klass === 'A') classA++; else classB++; mergeableMembers += g.length; sumMaps += totalMaps; sumOverlap += overlap; }

    // canonical = most college maps, tie: richest content, tie: earliest
    const canonical = [...g].sort((a, b) =>
      (b.maps - a.maps) ||
      (b.richness - a.richness) ||
      (new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    )[0];

    const groupKey = `G${String(i + 1).padStart(3, '0')}`;
    const nameList = g.map(m => m.raw).join(' || ');

    outGroups.push({
      group: groupKey, class: klass, baseName: titleCase(base), level,
      variant: variant ? titleCase(variant) : '',
      degree: distinctDegrees.join('/') || '',
      memberCount: g.length,
      canonicalId: canonical._id.toString(),
      canonicalName: canonical.raw,
      distinctNames: new Set(g.map(m => norm(m.raw))).size,
      totalMaps, distinctColleges: unionColleges.size, mapOverlap: overlap,
      totalCutoffs, totalSaves, totalVacancies,
      names: nameList,
      memberIds: JSON.stringify(g.map(m => m._id.toString())),
    });

    g.forEach(m => {
      outCourses.push({
        group: groupKey, class: klass, courseId: m._id.toString(), rawName: m.raw,
        level, degree: m.degree || '', variant: m.variant ? titleCase(m.variant) : '',
        medium: m.medium || '', ss: m.ss ? 'yes' : '', category: m.category,
        maps: m.maps, colleges: m.colleges.size, cutoffs: m.cutoffs,
        saves: m.saves, vacancies: m.vacancies,
        createdAt: m.createdAt ? m.createdAt.toISOString() : '',
        canonical: m._id.toString() === canonical._id.toString() ? 'YES' : '',
      });
    });
  });

  const writeCsv = (file, header, rows) => {
    const lines = rows.map(r => csvRow(header.map(h => r[h])));
    fs.writeFileSync(file, csvRow(header) + lines.join(''));
  };

  writeCsv(OUT_GROUPS, ['group','class','baseName','level','variant','degree','memberCount','canonicalId','canonicalName','distinctNames','totalMaps','distinctColleges','mapOverlap','totalCutoffs','totalSaves','totalVacancies','names','memberIds'], outGroups);
  writeCsv(OUT_COURSES, ['group','class','courseId','rawName','level','degree','variant','medium','ss','category','maps','colleges','cutoffs','saves','vacancies','createdAt','canonical'], outCourses);

  const summary = {
    generatedAt: new Date().toISOString(),
    totalActiveCourses: courses.length,
    uniqueGroupKeys: Object.keys(groups).length,
    totalDupGroups: rawGroups.length,
    classA_exactCopies: classA,
    classB_nameVariants: classB,
    classC_differentDegrees_review: classC,
    membersInMergeableGroups_A_B: mergeableMembers,
    membersInReviewGroups_C: reviewMembers,
    recordsToArchiveIfAllABMerged: mergeableMembers - (classA + classB),
    totalCollegeMapsInABGroups: sumMaps,
    duplicateMapOverlapAcrossABGroups: sumOverlap,
    groupCountByLevel: (() => { const m = {}; rawGroups.forEach(g => m[g[0].level] = (m[g[0].level] || 0) + 1); return m; })(),
  };
  fs.writeFileSync(OUT_SUMMARY, JSON.stringify(summary, null, 2));

  console.log('TOTAL ACTIVE COURSES        :', courses.length);
  console.log('UNIQUE base|level|variant   :', Object.keys(groups).length);
  console.log('GROUPS WITH 2+ MEMBERS      :', rawGroups.length);
  console.log('  class A (exact copies)    :', classA);
  console.log('  class B (name variants)   :', classB);
  console.log('  class C (distinct degrees):', classC, '(review, NOT auto-merged)');
  console.log('mergeable member courses    :', mergeableMembers, '-> archive', mergeableMembers - (classA + classB));
  console.log('college maps in A/B groups  :', sumMaps, '| duplicate overlaps:', sumOverlap);
  console.log('wrote:', path.basename(OUT_GROUPS), path.basename(OUT_COURSES), path.basename(OUT_SUMMARY));

  await mongoose.disconnect();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });