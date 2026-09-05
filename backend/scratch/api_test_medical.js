require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const http = require('http');

const BASE = `http://localhost:${process.env.PORT || 5000}`;

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(new Error('Parse error: ' + data.slice(0,200))); } });
    }).on('error', reject);
  });
}

(async () => {
  // 1. GET /api/colleges?stream=Medical
  console.log('=== GET /api/colleges?stream=Medical ===');
  const medColleges = await fetch(`${BASE}/api/colleges?stream=Medical`);
  const collegeCount = Array.isArray(medColleges.data) ? medColleges.data.length : (medColleges.count || 'unknown');
  console.log('Medical colleges returned:', collegeCount);

  // 2. GET /api/courses?category=Medical
  console.log('\n=== GET /api/courses?category=Medical ===');
  const medCourses = await fetch(`${BASE}/api/courses?category=Medical`);
  const courseCount = Array.isArray(medCourses.data) ? medCourses.data.length : (medCourses.count || 'unknown');
  console.log('Medical courses returned:', courseCount);
  if (Array.isArray(medCourses.data)) {
    medCourses.data.slice(0, 10).forEach(c => console.log('  ', c.courseName));
    if (medCourses.data.length > 10) console.log('  ... and', medCourses.data.length - 10, 'more');
  }

  // 3. GET /api/college-courses?stream=Medical (College-Course Mapping)
  console.log('\n=== GET /api/college-courses?stream=Medical ===');
  const mappings = await fetch(`${BASE}/api/college-courses?stream=Medical`);
  console.log('Mappings response keys:', Object.keys(mappings));
  const mappingCount = Array.isArray(mappings.data) ? mappings.data.length : (mappings.count || mappings.total || 'unknown');
  console.log('Medical mappings returned:', mappingCount);

  // 4. GET a specific Medical course details
  console.log('\n=== GET student course details for M.B.B.S. ===');
  // Find a MBBS course slug
  const mbbsCourses = await fetch(`${BASE}/api/courses?category=Medical`);
  if (Array.isArray(mbbsCourses.data)) {
    const mbbs = mbbsCourses.data.find(c => c.courseName && c.courseName.includes('M.B.B.S'));
    if (mbbs) {
      console.log('Found course:', mbbs.courseName, '| slug:', mbbs.slug);
      const details = await fetch(`${BASE}/api/student/courses/${mbbs.slug || mbbs._id}`);
      console.log('College count:', details.collegeCount || (details.offeringColleges || []).length);
      const colleges = details.offeringColleges || [];
      if (colleges.length > 0) {
        console.log('First 3 colleges:');
        colleges.slice(0, 3).forEach(c => console.log('  ', c.collegeName, '|', c.collegeType, '|', c.district));
      }
    }
  }
})();
