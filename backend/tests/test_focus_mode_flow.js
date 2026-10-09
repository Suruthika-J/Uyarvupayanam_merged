const axios = require('axios');

const API = 'http://localhost:5000/api';

async function testFocusFlow() {
  console.log('--- TESTING INTELLIGENT FOCUS MODE ENDPOINTS ---');

  let token = '';
  try {
    const regRes = await axios.post(`${API}/auth/register`, {
      name: 'Test Student Focus',
      email: `focus_test_${Date.now()}@example.com`,
      password: 'Password123!',
      classLevel: 'College Student',
      userType: 'college_student'
    });
    token = regRes.data.token;
    console.log('✓ Test student registered & authenticated');
  } catch (e) {
    console.error('Registration failed:', e.response?.data || e.message);
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };

  // 1. Start session
  console.log('\n1. Testing Session Start (POST /api/focus/sessions & /start)...');
  const startRes = await axios.post(`${API}/focus/sessions`, {
    subject: 'Data Structures & Algorithms',
    topic: 'Binary Search Trees',
    goal: 'Complete DBMS Unit 3 — 15 MCQs',
    category: 'subject',
    plannedDuration: 25,
    detectionMode: 'FULL MONITORING'
  }, { headers });

  const sessionId = startRes.data.session._id;
  console.log(`✓ Session started with ID: ${sessionId}, Mode: ${startRes.data.session.detectionMode}`);

  // 2. Get current session
  console.log('\n2. Testing Get Current Session (GET /api/focus/sessions/current)...');
  const currRes = await axios.get(`${API}/focus/sessions/current`, { headers });
  console.log(`✓ Current active session retrieved: ID ${currRes.data.session._id}`);

  // 3. Add focus events
  console.log('\n3. Testing Record Events (POST /api/focus/sessions/:id/events)...');
  const eventsRes = await axios.post(`${API}/focus/sessions/${sessionId}/events`, {
    events: [
      { eventType: 'TAB_SWITCH', duration: 18, severity: 'LOW', reason: 'Tab switched' },
      { eventType: 'LOOKING_AWAY', duration: 10, severity: 'MEDIUM', reason: 'Head turned away' },
      { eventType: 'PHONE_DETECTED', duration: 14, severity: 'HIGH', confidence: 0.91, reason: 'Phone in camera frame' }
    ]
  }, { headers });
  console.log(`✓ Recorded ${eventsRes.data.recorded} events`);

  // 4. Pause session
  console.log('\n4. Testing Pause Session (POST /api/focus/sessions/:id/pause)...');
  const pauseRes = await axios.post(`${API}/focus/sessions/${sessionId}/pause`, {}, { headers });
  console.log(`✓ Session paused status: ${pauseRes.data.session.status}`);

  // 5. Resume session
  console.log('\n5. Testing Resume Session (POST /api/focus/sessions/:id/resume)...');
  const resumeRes = await axios.post(`${API}/focus/sessions/${sessionId}/resume`, {}, { headers });
  console.log(`✓ Session resumed status: ${resumeRes.data.session.status}`);

  // 6. Complete session
  console.log('\n6. Testing Complete Session (POST /api/focus/sessions/:id/complete)...');
  const completeRes = await axios.post(`${API}/focus/sessions/${sessionId}/complete`, {
    actualDuration: 1500, // 25 min
    tabSwitchCount: 1,
    windowBlurCount: 1,
    fullscreenExitCount: 0,
    inactiveSeconds: 45,
    awayEvents: 0,
    lookingAwayEvents: 1,
    phoneEvents: 1,
    notes: 'Completed 15 MCQs on Binary Trees.',
    goalStatus: 'completed'
  }, { headers });

  console.log(`✓ Session completed. Focus Score: ${completeRes.data.focusScore}, Distraction Score: ${completeRes.data.distractionScore}, XP Earned: ${completeRes.data.xpEarned}`);

  // 7. Get Analytics
  console.log('\n7. Testing Get Focus Analytics (GET /api/focus/analytics)...');
  const analyticsRes = await axios.get(`${API}/focus/analytics`, { headers });
  console.log('✓ Focus Analytics retrieved:', analyticsRes.data.analytics);

  // 8. Get Weekly Analytics
  console.log('\n8. Testing Get Weekly Analytics (GET /api/focus/analytics/weekly)...');
  const weeklyRes = await axios.get(`${API}/focus/analytics/weekly`, { headers });
  console.log('✓ Weekly Analytics retrieved. Days:', weeklyRes.data.weekly.byDay.length);

  // 9. Get Subject Analytics
  console.log('\n9. Testing Get Subject Analytics (GET /api/focus/analytics/subjects)...');
  const subjectsRes = await axios.get(`${API}/focus/analytics/subjects`, { headers });
  console.log('✓ Subject Analytics retrieved:', subjectsRes.data.subjects);

  console.log('\n🎉 ALL FOCUS MODE API TESTS PASSED SUCCESSFULLY!');
}

testFocusFlow().catch(err => {
  console.error('Test failed:', err.response?.data || err.message);
});
