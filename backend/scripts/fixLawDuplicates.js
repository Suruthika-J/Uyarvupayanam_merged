const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const College = require('../models/College');
const Course = require('../models/Course');
const CollegeCourseMapping = require('../models/CollegeCourseMapping');

// Exact duplicate pairs to merge: [keep_name, delete_name]
const MERGE_PAIRS = [
  // Thirunelveli/Tirunelveli spelling variant
  ['Government Law College, Tirunelveli', 'Government Law College, Thirunelveli'],
  // Ramanathapuram/Ramanadhapuram spelling variant
  ['Government Law College, Ramanathapuram', 'Government Law College, Ramanadhapuram'],
  // Tiruchirappalli duplicate
  ['Government Law College, Tiruchirappalli', null], // Will match by identity
  // Karaikudi spacing duplicate
  ['Government Law College, Karaikudi', 'Government Law College,Karaikudi'],
  // VIT duplicate
  ['VIT School of Law', 'VIT Law School (VITS):'],
];

async function finalCleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    let totalDeleted = 0;

    for (const [keepName, deleteName] of MERGE_PAIRS) {
      const keep = await College.findOne({ stream: 'Law', collegeName: keepName });
      if (!keep) {
        console.log(`  Keep target not found: "${keepName}"`);
        continue;
      }

      let toDelete;
      if (deleteName) {
        toDelete = await College.findOne({ stream: 'Law', collegeName: deleteName });
      } else {
        // Find by identity (for Tiruchirappalli case)
        const allLaw = await College.find({ stream: 'Law' });
        const keepNorm = keepName.toLowerCase().replace(/[^a-z0-9]/g, '');
        toDelete = allLaw.find(c => {
          if (c._id.toString() === keep._id.toString()) return false;
          const cNorm = c.collegeName.toLowerCase().replace(/[^a-z0-9]/g, '');
          // Same normalized name but different actual name = duplicate
          return cNorm === keepNorm && c.collegeName !== keepName;
        });
      }

      if (!toDelete) {
        console.log(`  Delete target not found for "${keepName}"`);
        continue;
      }

      // Transfer courses
      const keepCourses = (keep.coursesOffered || []).map(id => id.toString());
      let transferred = 0;
      for (const cid of (toDelete.coursesOffered || [])) {
        if (!keepCourses.includes(cid.toString())) {
          keep.coursesOffered.push(cid);
          transferred++;
        }
      }
      if (transferred > 0) await keep.save();

      // Transfer website
      if (!keep.website && toDelete.website) {
        keep.website = toDelete.website;
        await keep.save();
      }

      // Transfer district
      if (!keep.district && toDelete.district) {
        keep.district = toDelete.district;
        await keep.save();
      }

      // Delete mappings and college
      const deletedMappings = await CollegeCourseMapping.deleteMany({ collegeId: toDelete._id });
      await College.deleteOne({ _id: toDelete._id });
      totalDeleted++;
      console.log(`  Merged "${toDelete.collegeName}" -> "${keepName}" (${transferred} courses transferred, ${deletedMappings.deletedCount} mappings moved)`);
    }

    console.log(`\nTotal duplicates removed: ${totalDeleted}`);

    // Now re-run import to ensure all mappings are correct
    console.log('\n=== RE-RUNNING FINAL IMPORT ===');
    const xlsx = require('xlsx');
    const excelPath = path.resolve(__dirname, '../uploads/Law Colleges and its Courses Updated.xlsx');
    const workbook = xlsx.readFile(excelPath);
    const ws = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(ws);

    const normalizeCourseForMatch = (name) => {
      if (!name) return '';
      return name.toLowerCase()
        .replace(/integrated\s+/gi, '').replace(/^r\s+/gi, '')
        .replace(/\./g, '').replace(/\s+/g, '').replace(/-/g, '').replace(/,/g, '')
        .replace(/[\(\)]/g, '').replace(/honours?/g, 'hons').replace(/honors?/g, 'hons')
        .replace(/3year/g, '').replace(/5year/g, '').replace(/year/g, '')
        .replace(/bilingual.*$/g, '').trim();
    };

    const ultraNorm = (name) => {
      if (!name) return '';
      return name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    };

    const parseCourseNames = (text) => {
      if (!text) return [];
      let cleaned = text.replace(/^r\s+/gi, '').replace(/\.\s*$/g, '').trim();
      cleaned = cleaned.replace(/\d+-Year\s*/gi, '');
      let parts = cleaned.split(/,\s*|\s+and\s+/);
      return parts.map(p => p.trim()).filter(p => p.length > 0)
        .map(p => { p = p.replace(/^\s*and\s+/i, '').trim(); p = p.replace(/\.\s*$/g, '').trim(); p = p.replace(/\(Bilingual.*?\)/gi, '').trim(); return p; })
        .filter(p => p.length > 2);
    };

    const ALIAS_MAP = {
      'government law college thirunelveli': 'Government Law College, Tirunelveli',
      'government law college ramanadhapuram': 'Government Law College, Ramanathapuram',
      'govt law college theni': 'Government Law College, Theni',
      'government law collegekaraikudi': 'Government Law College, Karaikudi',
      'vit law school vits': 'VIT School of Law',
      'school of law sastra university': 'SASTRA Deemed University School of Law',
    };

    const allCourses = await Course.find({});
    const allColleges = await College.find({});
    const courseMapByNorm = new Map();
    allCourses.forEach(c => {
      const norm = normalizeCourseForMatch(c.courseName);
      if (norm && !courseMapByNorm.has(norm)) courseMapByNorm.set(norm, c);
    });

    const collegeLookup = new Map();
    allColleges.forEach(c => {
      const norm = ultraNorm(c.collegeName);
      collegeLookup.set(norm, c);
    });

    const findCollege = (excelName) => {
      const norm = ultraNorm(excelName);
      if (collegeLookup.has(norm)) return collegeLookup.get(norm);
      // Alias
      if (ALIAS_MAP[norm]) {
        const aliasNorm = ultraNorm(ALIAS_MAP[norm]);
        if (collegeLookup.has(aliasNorm)) return collegeLookup.get(aliasNorm);
      }
      // Substring
      for (const [key, c] of collegeLookup) {
        if (key.length > 10 && (key.includes(norm) || norm.includes(key))) return c;
      }
      // Core word
      const excelCore = excelName.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const c of allColleges) {
        const dbCore = c.collegeName.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (excelCore.length > 15 && dbCore.length > 15 && (excelCore === dbCore || excelCore.includes(dbCore) || dbCore.includes(excelCore))) return c;
      }
      return null;
    };

    const session = await mongoose.startSession();
    const summary = { matched: 0, created: 0, coursesReused: 0, coursesCreated: 0, mappingsCreated: 0, reactivated: 0 };

    await session.withTransaction(async () => {
      await CollegeCourseMapping.updateMany({ stream: 'Law' }, { $set: { isActive: false } }, { session });
      const batchId = `LAW-FINAL3-${Date.now()}`;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const collegeNameRaw = (row['Law College'] || '').trim();
        const coursesRaw = (row['Courses Offered'] || '').trim();
        const websiteRaw = (row['Offical Website'] || '').trim();
        if (!collegeNameRaw) continue;

        let college = findCollege(collegeNameRaw);
        if (!college) {
          college = new College({
            collegeName: collegeNameRaw, stream: 'Law', streamsOffered: ['Law'],
            state: 'Tamil Nadu', website: websiteRaw, coursesOffered: []
          });
          await college.save({ session });
          allColleges.push(college);
          collegeLookup.set(ultraNorm(collegeNameRaw), college);
          summary.created++;
          console.log(`Created: "${collegeNameRaw}"`);
        } else {
          summary.matched++;
          if (websiteRaw && (!college.website || college.website.trim() === '')) college.website = websiteRaw;
          if (!college.streamsOffered.includes('Law')) college.streamsOffered.push('Law');
          if (!college.stream) college.stream = 'Law';
        }

        const courseNames = parseCourseNames(coursesRaw);
        const resolvedCourseIds = [];

        for (const rawCourseName of courseNames) {
          const normCourse = normalizeCourseForMatch(rawCourseName);
          let matchedCourse = courseMapByNorm.get(normCourse);
          if (!matchedCourse) {
            for (const [key, c] of courseMapByNorm) {
              if (key.includes(normCourse) || normCourse.includes(key)) { matchedCourse = c; break; }
            }
          }
          if (!matchedCourse) {
            matchedCourse = new Course({
              courseName: rawCourseName, level: 'after12th', category: 'Law',
              duration: rawCourseName.toLowerCase().includes('3-year') ? '3 Years' : '5 Years',
              eligibility: '12th Pass', shortDescription: `${rawCourseName} - Law program`,
              status: 'active', isPublished: true, isImported: true, sourceName: 'Law Updated Excel Import'
            });
            await matchedCourse.save({ session });
            allCourses.push(matchedCourse);
            courseMapByNorm.set(normCourse, matchedCourse);
            summary.coursesCreated++;
          } else { summary.coursesReused++; }

          resolvedCourseIds.push(matchedCourse._id);

          const existing = await CollegeCourseMapping.findOne({ collegeId: college._id, courseId: matchedCourse._id }).session(session);
          if (existing) {
            existing.isActive = true; existing.isVerified = true;
            existing.source = 'Excel Import'; existing.sourceFileName = 'Law Colleges and its Courses Updated.xlsx';
            existing.importBatchId = batchId; existing.collegeName = college.collegeName;
            existing.courseName = matchedCourse.courseName; existing.stream = 'Law';
            await existing.save({ session });
            summary.reactivated++;
          } else {
            await CollegeCourseMapping.create([{
              collegeId: college._id, courseId: matchedCourse._id, source: 'Excel Import',
              sourceFileName: 'Law Colleges and its Courses Updated.xlsx', importBatchId: batchId,
              isVerified: true, isActive: true, collegeName: college.collegeName,
              courseName: matchedCourse.courseName, stream: 'Law'
            }], { session });
            summary.mappingsCreated++;
          }
        }

        college.coursesOffered = resolvedCourseIds;
        await college.save({ session });
      }
    });

    console.log('\n==============================================');
    console.log('    FINAL IMPORT SUMMARY                      ');
    console.log('==============================================');
    console.log(`Matched: ${summary.matched} | Created: ${summary.created}`);
    console.log(`Courses: ${summary.coursesReused} reused, ${summary.coursesCreated} new`);
    console.log(`Mappings: ${summary.mappingsCreated} new, ${summary.reactivated} reactivated`);
    console.log(`Duplicates removed this run: ${totalDeleted}`);
    console.log('==============================================\n');

    await session.endSession();
    process.exit(0);
  } catch (error) {
    console.error('Fatal:', error);
    process.exit(1);
  }
}

finalCleanup();
