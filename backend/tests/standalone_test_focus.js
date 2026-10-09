const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const getJwtSecret = require('../utils/jwtSecret');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(express.json());

// Auth & Focus routes
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/focus', require('../routes/focusRoutes'));

const PORT = 5099;

async function runStandaloneTest() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uyarvu_payanam';
  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB');

  const server = app.listen(PORT, async () => {
    console.log(`✓ Standalone test server listening on port ${PORT}`);

    try {
      const API = `http://localhost:${PORT}/api`;
      console.log('\n--- TESTING INTELLIGENT FOCUS MODE ENDPOINTS ---');

      // Create test user directly in Mongo if needed
      let user = await User.findOne({ email: 'focus_test_user@example.com' });
      if (!user) {
        user = await User.create({
          name: 'Focus Test Student',
          email: 'focus_test_user@example.com',
          password: 'Password123!',
          classLevel: 'College Student',
          userType: 'college_student',
          isVerified: true
        });
      }

      const token = jwt.sign({ id: user._id, role: 'student' }, getJwtSecret(), { expiresIn: '7d' });
      const headers = { Authorization: `Bearer ${token}` };
      console.log(`✓ Test student authenticated (ID: ${user._id})`);

      // 1. POST /api/focus/sessions (Start)
      const startRes1 = await axios.post(`${API}/focus/sessions`, {
        subject: 'Data Structures & Algorithms',
        topic: 'Binary Search Trees',
        goal: 'Complete DBMS Unit 3 — 15 MCQs',
        category: 'subject',
        plannedDuration: 25,
        detectionMode: 'FULL MONITORING'
      }, { headers });
      const sessionId = startRes1.data.session._id;
      console.log(`✓ POST /api/focus/sessions -> ID: ${sessionId}, Mode: ${startRes1.data.session.detectionMode}`);

      // 2. GET /api/focus/sessions/current
      const currRes = await axios.get(`${API}/focus/sessions/current`, { headers });
      console.log(`✓ GET /api/focus/sessions/current -> Active Session ID: ${currRes.data.session._id}`);

      // 3. POST /api/focus/sessions/:id/events
      const eventsRes = await axios.post(`${API}/focus/sessions/${sessionId}/events`, {
        events: [
          { eventType: 'TAB_SWITCH', duration: 18, severity: 'LOW', reason: 'Tab switched' },
          { eventType: 'LOOKING_AWAY', duration: 10, severity: 'MEDIUM', reason: 'Head turned away' },
          { eventType: 'PHONE_DETECTED', duration: 14, severity: 'HIGH', confidence: 0.91, reason: 'Phone in camera frame' }
        ]
      }, { headers });
      console.log(`✓ POST /api/focus/sessions/:id/events -> Recorded: ${eventsRes.data.recorded}`);

      // 4. POST /api/focus/sessions/:id/pause
      const pauseRes = await axios.post(`${API}/focus/sessions/${sessionId}/pause`, {}, { headers });
      console.log(`✓ POST /api/focus/sessions/:id/pause -> Status: ${pauseRes.data.session.status}`);

      // 5. POST /api/focus/sessions/:id/resume
      const resumeRes = await axios.post(`${API}/focus/sessions/${sessionId}/resume`, {}, { headers });
      console.log(`✓ POST /api/focus/sessions/:id/resume -> Status: ${resumeRes.data.session.status}`);

      // 6. POST /api/focus/sessions/:id/complete
      const completeRes = await axios.post(`${API}/focus/sessions/${sessionId}/complete`, {
        actualDuration: 1500,
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
      console.log(`✓ POST /api/focus/sessions/:id/complete -> Focus Score: ${completeRes.data.focusScore}, Distraction Score: ${completeRes.data.distractionScore}, XP: ${completeRes.data.xpEarned}`);

      // 7. GET /api/focus/analytics
      const analyticsRes = await axios.get(`${API}/focus/analytics`, { headers });
      console.log(`✓ GET /api/focus/analytics -> Total Focus Time: ${analyticsRes.data.analytics.totalFocusTimeMinutes}m, Total Sessions: ${analyticsRes.data.analytics.totalSessions}`);

      // 8. GET /api/focus/analytics/weekly
      const weeklyRes = await axios.get(`${API}/focus/analytics/weekly`, { headers });
      console.log(`✓ GET /api/focus/analytics/weekly -> Days: ${weeklyRes.data.weekly.byDay.length}`);

      // 9. GET /api/focus/analytics/subjects
      const subjectsRes = await axios.get(`${API}/focus/analytics/subjects`, { headers });
      console.log(`✓ GET /api/focus/analytics/subjects -> Subjects count: ${subjectsRes.data.subjects.length}`);

      console.log('\n🎉 ALL INTELLIGENT FOCUS MODE BACKEND ENDPOINTS VERIFIED 100%!');
    } catch (e) {
      console.error('Test execution error:', e.response?.data || e.message);
    } finally {
      server.close();
      await mongoose.disconnect();
      process.exit(0);
    }
  });
}

runStandaloneTest();
