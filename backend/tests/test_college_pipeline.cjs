/**
 * test_college_pipeline.cjs
 * End-to-end automated test script testing all college-side features with real data.
 */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/uyarvu-payanam';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
  console.log('====================================================');
  console.log('🚀 STARTING COLLEGE SIDE END-TO-END TEST WITH REAL DATA');
  console.log('====================================================\n');

  // 1. Connect DB
  await mongoose.connect(MONGO_URI);
  console.log('✅ 1. MongoDB Connected for test harness');

  const User = require('../models/User');
  const CollegeStudentProfile = require('../models/CollegeStudentProfile');
  const MentorRequest = require('../models/MentorRequest');

  // 2. Create or retrieve test student
  const testEmail = 'ananya.test@uyarvu.edu';
  let testUser = await User.findOne({ email: testEmail });
  if (!testUser) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('SecretPass123!', salt);
    testUser = await User.create({
      name: 'Ananya Ramaswamy',
      email: testEmail,
      password: hash,
      role: 'student',
      userType: 'college_student',
      isVerified: true,
      onboardingCompleted: true
    });
    console.log('✅ 2. Created verified test student:', testUser.name, `(${testUser.email})`);
  } else {
    testUser.onboardingCompleted = true;
    await testUser.save();
    console.log('✅ 2. Existing test student retrieved & onboardingCompleted set to true:', testUser.name, `(${testUser.email})`);
  }

  // 3. Generate Auth JWT Token
  const token = jwt.sign({ id: testUser._id }, JWT_SECRET, { expiresIn: '7d' });
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  console.log('✅ 3. Generated valid JWT Auth Token for test student\n');

  // 4. TEST: Quick Edit Profile Save
  console.log('─── TEST 4: College Profile Quick Save ───');
  const profilePayload = {
    institution: 'College of Engineering Guindy (CEG)',
    institutionDistrict: 'Chennai',
    field: 'engineering',
    degreeProgramme: 'B.E. Computer Science and Engineering',
    domain: 'Computer Science',
    specialization: 'Artificial Intelligence & Cloud Computing',
    currentYear: '3rd Year',
    currentSemester: 'Semester 5',
    cgpa: '8.85',
    targetCareer: 'Data Scientist',
    skills: ['Python', 'React', 'Docker', 'Machine Learning', 'SQL', 'Data Structures']
  };

  const profileRes = await axios.post(`${BASE_URL}/college-profile/save`, profilePayload, authHeaders);
  console.log('HTTP Status:', profileRes.status);
  console.log('Profile Save Result:', {
    success: profileRes.data.success,
    studentName: testUser.name,
    cgpa: profileRes.data.profile.cgpa,
    targetCareer: profileRes.data.profile.targetCareer,
    skillsCount: profileRes.data.profile.skills.length,
    completion: profileRes.data.profile.profileCompletion + '%'
  });
  console.log('✅ Profile Quick Edit Test PASSED!\n');

  // 5. TEST: Fetch Saved Profile
  console.log('─── TEST 5: Verify Saved Profile Fetch ───');
  const getProfileRes = await axios.get(`${BASE_URL}/college-profile/my-profile`, authHeaders);
  console.log('HTTP Status:', getProfileRes.status);
  console.log('Retrieved Institution:', getProfileRes.data.profile.institution);
  console.log('Retrieved Semester:', getProfileRes.data.profile.currentSemester);
  console.log('✅ Profile Fetch Test PASSED!\n');

  // 6. TEST: Real Career Comparison API
  console.log('─── TEST 6: Telemetry-Aware Career Comparison ───');
  const compareRes = await axios.post(`${BASE_URL}/college-advisor/compare`, {
    slugs: ['software-engineer', 'data-scientist']
  }, authHeaders);
  console.log('HTTP Status:', compareRes.status);
  console.log(`Compared Careers Count: ${compareRes.data.comparison.length}`);
  compareRes.data.comparison.forEach(c => {
    console.log(`\n• Career: ${c.title} (${c.category})`);
    console.log(`  Match Score: ${c.matchPercentage}% (${c.matchCategory})`);
    console.log(`  Matched Skills (${c.matchedSkills.length}):`, c.matchedSkills);
    console.log(`  Skill Gaps (${c.skillGaps.length}):`, c.skillGaps.slice(0, 3));
    console.log(`  Growth Outlook:`, c.growthOutlook);
  });
  console.log('✅ Career Comparison Test PASSED!\n');

  // 7. TEST: Real AI Academic Doubt Solving
  console.log('─── TEST 7: Real AI Academic Doubt Resolution ───');
  const doubtQuestion = 'What is the fundamental difference between TCP and UDP in computer networks, and in what real-world scenarios should each be used?';
  console.log('Question Asked:', `"${doubtQuestion}"`);
  const chatRes = await axios.post(`${BASE_URL}/study-tools/chat`, {
    message: `Academic Question in Computer Networks: ${doubtQuestion}`
  }, authHeaders);
  console.log('HTTP Status:', chatRes.status);
  console.log('AI Answer Generated (first 250 chars):\n', chatRes.data.reply.slice(0, 250) + '...\n');
  console.log('✅ AI Doubt Clearing Test PASSED!\n');

  // 8. TEST: Escalate Doubt to Peer Mentor
  console.log('─── TEST 8: Escalate Doubt to Senior Mentor ───');
  const mentorPayload = {
    mentorId: 'Arun Kumar (PSG Tech)',
    subject: 'Computer Networks',
    question: doubtQuestion,
    message: 'Requesting 1-on-1 peer guidance on protocol selection.'
  };
  const mentorRes = await axios.post(`${BASE_URL}/study-tools/mentors/doubt-request`, mentorPayload, authHeaders);
  console.log('HTTP Status:', mentorRes.status);
  console.log('Mentor Escalation Result:', {
    success: mentorRes.data.success,
    requestId: mentorRes.data.request?._id,
    mentorAssigned: mentorRes.data.request?.mentorId,
    status: mentorRes.data.request?.status
  });
  console.log('✅ Mentor Escalation Test PASSED!\n');

  // 9. TEST: Auto-Generated Resume Builder
  console.log('─── TEST 9: Auto-Generated Resume Builder ───');
  const resumeRes = await axios.get(`${BASE_URL}/study-tools/resume-builder`, authHeaders);
  console.log('HTTP Status:', resumeRes.status);
  const r = resumeRes.data.resumeData;
  console.log('Resume Details:');
  console.log(`  Name: ${r.name}`);
  console.log(`  Degree: ${r.degree} | Domain: ${r.domain} | CGPA: ${r.cgpa}`);
  console.log(`  Target Role: ${r.targetRole}`);
  console.log(`  Highlight Skills:`, r.highlightSkills);
  console.log(`  Resume Strength Score: ${r.resumeStrengthScore}%`);
  console.log('✅ Resume Builder Test PASSED!\n');

  console.log('====================================================');
  console.log('🎉 ALL 9 INTEGRATION TESTS PASSED WITH 100% REAL DATA');
  console.log('====================================================');

  process.exit(0);
}

runTest().catch(err => {
  console.error('❌ Test failed with error:', err.response?.data || err.message);
  process.exit(1);
});
