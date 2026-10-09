const { FocusSession, FocusEvent } = require("../models/FocusSession");

// Helper to calculate focus & distraction score
function computeSessionScores(session, bodyMetrics, events = []) {
  const cfg = session.scoringConfig || {
    tabSwitchPenalty: 4,
    windowBlurPenalty: 3,
    fullscreenExitPenalty: 5,
    inactivityPenalty: 3,
    cameraAwayPenalty: 4,
    lookingAwayPenalty: 4,
    phonePenalty: 8,
    possiblePhonePenalty: 6,
    motionPenalty: 2
  };

  const actualDuration = bodyMetrics.actualDuration || 0;
  const inactiveSeconds = bodyMetrics.inactiveSeconds || 0;
  const focusSecs = Math.max(0, actualDuration - inactiveSeconds);
  const focusRatio = actualDuration > 0 ? focusSecs / actualDuration : 1;

  let tabSwitchPenalty = (bodyMetrics.tabSwitchCount || 0) * cfg.tabSwitchPenalty;
  let windowBlurPenalty = (bodyMetrics.windowBlurCount || 0) * (cfg.windowBlurPenalty || 3);
  let fullscreenExitPenalty = (bodyMetrics.fullscreenExitCount || 0) * (cfg.fullscreenExitPenalty || 5);
  let inactPenalty = inactiveSeconds > 60
    ? Math.floor((inactiveSeconds - 60) / 30) * cfg.inactivityPenalty
    : 0;
  let cameraAwayPenalty = (bodyMetrics.awayEvents || 0) * cfg.cameraAwayPenalty;
  let lookingAwayPenalty = (bodyMetrics.lookingAwayEvents || 0) * (cfg.lookingAwayPenalty || 4);
  let phonePenalty = (bodyMetrics.phoneEvents || 0) * (cfg.phonePenalty || 8) +
                     (bodyMetrics.possiblePhoneEvents || 0) * (cfg.possiblePhonePenalty || 6);
  let motionPenalty = (bodyMetrics.distractionEvents || 0) * cfg.motionPenalty;

  // Evaluate events array if passed
  if (events && events.length > 0) {
    events.forEach(e => {
      const type = e.eventType || e.type;
      if (type === 'TAB_SWITCH') tabSwitchPenalty += cfg.tabSwitchPenalty;
      else if (type === 'WINDOW_BLUR') windowBlurPenalty += (cfg.windowBlurPenalty || 3);
      else if (type === 'FULLSCREEN_EXIT') fullscreenExitPenalty += (cfg.fullscreenExitPenalty || 5);
      else if (type === 'FACE_MISSING' || type === 'FACE_NOT_DETECTED') cameraAwayPenalty += cfg.cameraAwayPenalty;
      else if (type === 'LOOKING_AWAY') lookingAwayPenalty += (cfg.lookingAwayPenalty || 4);
      else if (type === 'PHONE_DETECTED') phonePenalty += (cfg.phonePenalty || 8);
      else if (type === 'POSSIBLE_PHONE_USAGE') phonePenalty += (cfg.possiblePhonePenalty || 6);
    });
  }

  const rawScore = Math.round(focusRatio * 100);
  const totalPenalties = tabSwitchPenalty + windowBlurPenalty + fullscreenExitPenalty + inactPenalty + cameraAwayPenalty + lookingAwayPenalty + phonePenalty + motionPenalty;
  const focusScore = Math.max(0, Math.min(100, rawScore - totalPenalties));
  const distractionScore = Math.min(100, Math.max(0, 100 - focusScore));

  const totalDistractions = (bodyMetrics.tabSwitchCount || 0) +
                            (bodyMetrics.windowBlurCount || 0) +
                            (bodyMetrics.fullscreenExitCount || 0) +
                            (bodyMetrics.awayEvents || 0) +
                            (bodyMetrics.lookingAwayEvents || 0) +
                            (bodyMetrics.phoneEvents || 0) +
                            (bodyMetrics.distractionEvents || 0);

  // Calculate Focus XP
  let xp = 0;
  if (actualDuration >= 900) xp += 15; // 15+ min
  if (actualDuration >= 1500) xp += 10; // 25+ min
  if (focusScore >= 90) xp += 10;
  if (totalDistractions === 0 && actualDuration >= 600) xp += 10;

  return {
    focusScore,
    distractionScore,
    totalDistractions,
    focusRatio: parseFloat(focusRatio.toFixed(2)),
    xpEarned: xp,
    breakdown: {
      baseFocusRatio: parseFloat(focusRatio.toFixed(2)),
      tabSwitchPenalty,
      windowBlurPenalty,
      fullscreenExitPenalty,
      inactivityPenalty: inactPenalty,
      cameraAwayPenalty,
      lookingAwayPenalty,
      phonePenalty,
      motionPenalty,
      finalScore: focusScore
    }
  };
}

// ─── POST /api/focus/start OR /api/focus/sessions ─────────────────────────────
exports.startFocusSession = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;
    const {
      subject, topic, goal, category, plannedDuration,
      detectionMode, monitoringSettings, scoringConfig
    } = req.body;

    // Abandon any existing active session
    await FocusSession.updateMany(
      { userId, status: "active" },
      { $set: { status: "abandoned", endedAt: new Date() } }
    );

    const mode = detectionMode || (monitoringSettings?.cameraEnabled ? (monitoringSettings?.distractionDetection ? "FULL MONITORING" : "CAMERA") : "STANDARD");

    const session = await FocusSession.create({
      userId,
      subject:         subject || "General Study",
      topic:           topic   || "",
      goal:            goal    || "",
      category:        category || "general",
      plannedDuration: plannedDuration || 25,
      detectionMode:   mode,
      monitoringSettings: monitoringSettings || {
        browserActivity: true,
        cameraEnabled: mode !== "STANDARD",
        audioEnabled: false
      },
      scoringConfig: scoringConfig || {
        tabSwitchPenalty: 4,
        windowBlurPenalty: 3,
        fullscreenExitPenalty: 5,
        inactivityPenalty: 3,
        cameraAwayPenalty: 4,
        lookingAwayPenalty: 4,
        phonePenalty: 8,
        possiblePhonePenalty: 6,
        motionPenalty: 2
      },
      status: "active",
      startedAt: new Date()
    });

    res.status(201).json({ success: true, session });
  } catch (err) {
    console.error("startFocusSession error:", err);
    res.status(500).json({ success: false, message: "Failed to start session." });
  }
};

// ─── GET /api/focus/sessions/current ─────────────────────────────────────────
exports.getCurrentSession = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;
    const session = await FocusSession.findOne({ userId, status: { $in: ["active", "paused"] } })
      .sort({ startedAt: -1 });

    res.json({ success: true, session: session || null });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to get current session." });
  }
};

// ─── POST /api/focus/sessions/:id/events OR /api/focus/:id/events ───────────
exports.addFocusEvents = async (req, res) => {
  try {
    const userId    = req.student?._id || req.student?.id;
    const sessionId = req.params.id;
    const { events } = req.body;

    const session = await FocusSession.findOne({ _id: sessionId, userId });
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ success: false, message: "No events provided." });
    }

    const docs = events.map(e => ({
      sessionId, userId,
      eventType:  e.eventType || e.type || "OTHER",
      severity:   e.severity || "LOW",
      reason:     e.reason || "",
      timestamp:  e.timestamp ? new Date(e.timestamp) : new Date(),
      duration:   e.duration || 0,
      confidence: e.confidence,
      metadata:   e.metadata
    }));

    await FocusEvent.insertMany(docs, { ordered: false });
    await FocusSession.updateOne({ _id: sessionId }, { $push: { events: { $each: docs } } });

    res.json({ success: true, recorded: docs.length });
  } catch (err) {
    console.error("addFocusEvents error:", err);
    res.status(500).json({ success: false, message: "Failed to record events." });
  }
};

// ─── POST /api/focus/sessions/:id/pause ──────────────────────────────────────
exports.pauseFocusSession = async (req, res) => {
  try {
    const userId    = req.student?._id || req.student?.id;
    const sessionId = req.params.id;

    const session = await FocusSession.findOneAndUpdate(
      { _id: sessionId, userId },
      { $set: { status: "paused" } },
      { new: true }
    );

    if (!session) return res.status(404).json({ success: false, message: "Session not found." });

    await FocusEvent.create({
      sessionId, userId,
      eventType: "SESSION_PAUSED",
      reason: "User paused session",
      timestamp: new Date()
    });

    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to pause session." });
  }
};

// ─── POST /api/focus/sessions/:id/resume ─────────────────────────────────────
exports.resumeFocusSession = async (req, res) => {
  try {
    const userId    = req.student?._id || req.student?.id;
    const sessionId = req.params.id;

    const session = await FocusSession.findOneAndUpdate(
      { _id: sessionId, userId },
      { $set: { status: "active" } },
      { new: true }
    );

    if (!session) return res.status(404).json({ success: false, message: "Session not found." });

    await FocusEvent.create({
      sessionId, userId,
      eventType: "SESSION_RESUMED",
      reason: "User resumed session",
      timestamp: new Date()
    });

    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to resume session." });
  }
};

// ─── PATCH /api/focus/:id ─────────────────────────────────────────────────────
exports.updateFocusSession = async (req, res) => {
  try {
    const userId    = req.student?._id || req.student?.id;
    const sessionId = req.params.id;
    const { status } = req.body;

    const session = await FocusSession.findOneAndUpdate(
      { _id: sessionId, userId },
      { $set: { status } },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update session." });
  }
};

// ─── POST /api/focus/sessions/:id/complete OR /api/focus/:id/complete ──────
exports.completeFocusSession = async (req, res) => {
  try {
    const userId    = req.student?._id || req.student?.id;
    const sessionId = req.params.id;
    const { actualDuration, tabSwitchCount, windowBlurCount, fullscreenExitCount,
            inactiveSeconds, awayEvents, lookingAwayEvents, phoneEvents, possiblePhoneEvents,
            distractionEvents, notes, reflection, goalStatus } = req.body;

    const session = await FocusSession.findOne({ _id: sessionId, userId });
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });

    const sessionEvents = await FocusEvent.find({ sessionId }).lean();
    const scores = computeSessionScores(session, req.body, sessionEvents);

    const now = new Date();
    await session.updateOne({
      $set: {
        status:                  "completed",
        completed:               true,
        endedAt:                 now,
        completedAt:             now,
        actualDuration:          actualDuration || 0,
        focusScore:              scores.focusScore,
        distractionScore:        scores.distractionScore,
        distractionCount:        scores.totalDistractions,
        totalDistractionDuration: inactiveSeconds || 0,
        xpEarned:                scores.xpEarned,
        goalStatus:              goalStatus || "completed",
        notes:                   notes || session.notes,
        reflection:              reflection || "",
        scoreBreakdown:          scores.breakdown,
        statistics: {
          tabSwitchCount:       tabSwitchCount || 0,
          windowBlurCount:     windowBlurCount || 0,
          fullscreenExitCount: fullscreenExitCount || 0,
          inactiveSeconds:     inactiveSeconds || 0,
          awayEvents:          awayEvents || 0,
          lookingAwayEvents:   lookingAwayEvents || 0,
          phoneEvents:         phoneEvents || 0,
          distractionEvents:   distractionEvents || 0
        }
      }
    });

    const updatedSession = await FocusSession.findById(sessionId);
    res.json({
      success: true,
      session: updatedSession,
      focusScore: scores.focusScore,
      distractionScore: scores.distractionScore,
      xpEarned: scores.xpEarned
    });
  } catch (err) {
    console.error("completeFocusSession error:", err);
    res.status(500).json({ success: false, message: "Failed to complete session." });
  }
};

// ─── POST /api/focus/sessions/:id/end OR /api/focus/:id/end ─────────────────
exports.endFocusSession = async (req, res) => {
  try {
    const userId    = req.student?._id || req.student?.id;
    const sessionId = req.params.id;
    const { actualDuration } = req.body;

    const session = await FocusSession.findOneAndUpdate(
      { _id: sessionId, userId },
      { $set: { status: "abandoned", endedAt: new Date(), actualDuration: actualDuration || 0 } },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to end session." });
  }
};

// ─── GET /api/focus/history ───────────────────────────────────────────────────
exports.getFocusHistory = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 10);

    const sessions = await FocusSession.find({ userId, status: { $in: ["completed", "abandoned"] } })
      .sort({ startedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await FocusSession.countDocuments({ userId });
    res.json({ success: true, sessions, total, page, limit });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load history." });
  }
};

// ─── GET /api/focus/today ─────────────────────────────────────────────────────
exports.getTodayFocusStats = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const sessions = await FocusSession.find({
      userId,
      startedAt: { $gte: todayStart, $lte: todayEnd },
      status: "completed"
    }).lean();

    const totalFocusSeconds = sessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0);
    const avgScore = sessions.length
      ? Math.round(sessions.reduce((s, x) => s + x.focusScore, 0) / sessions.length)
      : 0;
    const distractionCount = sessions.reduce((sum, s) => sum + (s.distractionCount || 0), 0);

    res.json({
      success: true,
      today: {
        totalFocusMinutes: Math.round(totalFocusSeconds / 60),
        sessionsCompleted: sessions.length,
        averageFocusScore: avgScore,
        distractionCount,
        sessions
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load today stats." });
  }
};

// ─── GET /api/focus/weekly & /api/focus/analytics/weekly ─────────────────────
exports.getWeeklyFocusStats = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const sessions = await FocusSession.find({
      userId,
      startedAt: { $gte: weekStart },
      status: "completed"
    }).lean();

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const byDay = days.map((label, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const dayStr = d.toDateString();
      const daySessions = sessions.filter(s => new Date(s.startedAt).toDateString() === dayStr);
      return {
        day: label,
        focusMinutes: Math.round(daySessions.reduce((s, x) => s + (x.actualDuration || 0), 0) / 60),
        sessions: daySessions.length,
        avgScore: daySessions.length
          ? Math.round(daySessions.reduce((s, x) => s + x.focusScore, 0) / daySessions.length) : 0
      };
    });

    // Subject breakdown
    const subjectMap = {};
    sessions.forEach(s => {
      const sub = s.subject || "General";
      subjectMap[sub] = (subjectMap[sub] || 0) + Math.round((s.actualDuration || 0) / 60);
    });
    const topSubjects = Object.entries(subjectMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([subject, minutes]) => ({ subject, minutes }));

    const totalMinutes = Math.round(sessions.reduce((s, x) => s + (x.actualDuration || 0), 0) / 60);
    const avgScore = sessions.length
      ? Math.round(sessions.reduce((s, x) => s + x.focusScore, 0) / sessions.length) : 0;
    const longestMinutes = sessions.length
      ? Math.round(Math.max(...sessions.map(s => s.actualDuration || 0)) / 60) : 0;

    // Distraction type breakdown from events
    const events = await FocusEvent.find({ userId, timestamp: { $gte: weekStart } }).lean();
    const distrTypeMap = {};
    events.forEach(e => {
      const t = e.eventType || e.type;
      distrTypeMap[t] = (distrTypeMap[t] || 0) + 1;
    });
    const mostCommonDistraction = Object.entries(distrTypeMap)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "TAB_SWITCH";

    res.json({
      success: true,
      weekly: {
        byDay, topSubjects, totalMinutes, avgScore,
        longestSessionMinutes: longestMinutes,
        totalSessions: sessions.length,
        mostCommonDistraction,
        distractionBreakdown: distrTypeMap
      }
    });
  } catch (err) {
    console.error("getWeeklyFocusStats error:", err);
    res.status(500).json({ success: false, message: "Failed to load weekly stats." });
  }
};

// ─── GET /api/focus/analytics/subjects ───────────────────────────────────────
exports.getSubjectAnalytics = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;
    const sessions = await FocusSession.find({ userId, status: "completed" }).lean();

    const subjectStats = {};
    sessions.forEach(s => {
      const sub = s.subject || "General";
      if (!subjectStats[sub]) {
        subjectStats[sub] = { subject: sub, totalMinutes: 0, sessionCount: 0, totalScore: 0, distractions: 0 };
      }
      subjectStats[sub].totalMinutes += Math.round((s.actualDuration || 0) / 60);
      subjectStats[sub].sessionCount += 1;
      subjectStats[sub].totalScore += (s.focusScore || 0);
      subjectStats[sub].distractions += (s.distractionCount || 0);
    });

    const subjects = Object.values(subjectStats).map(s => ({
      subject: s.subject,
      totalMinutes: s.totalMinutes,
      sessionCount: s.sessionCount,
      avgFocusScore: Math.round(s.totalScore / s.sessionCount),
      avgDistractions: parseFloat((s.distractions / s.sessionCount).toFixed(1))
    })).sort((a, b) => b.totalMinutes - a.totalMinutes);

    res.json({ success: true, subjects });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load subject analytics." });
  }
};

// ─── GET /api/focus/analytics OR /api/focus/stats ───────────────────────────
exports.getFocusAnalytics = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;

    const allSessions = await FocusSession.find({ userId, status: "completed" })
      .sort({ startedAt: -1 }).lean();

    const totalSeconds = allSessions.reduce((s, x) => s + (x.actualDuration || 0), 0);
    const totalHours = parseFloat((totalSeconds / 3600).toFixed(1));
    const totalSessions = allSessions.length;
    const avgScore = totalSessions
      ? Math.round(allSessions.reduce((s, x) => s + x.focusScore, 0) / totalSessions) : 0;
    const bestScore = totalSessions
      ? Math.max(...allSessions.map(s => s.focusScore || 0)) : 0;
    const avgDistractionCount = totalSessions
      ? parseFloat((allSessions.reduce((s, x) => s + (x.distractionCount || 0), 0) / totalSessions).toFixed(1)) : 0;

    // Distraction type aggregation across all sessions
    const events = await FocusEvent.find({ userId }).lean();
    const distractionTypeCounts = {
      TAB_SWITCH: 0,
      INACTIVITY: 0,
      LOOKING_AWAY: 0,
      PHONE_DETECTED: 0,
      FULLSCREEN_EXIT: 0,
      WINDOW_BLUR: 0
    };

    events.forEach(e => {
      const type = e.eventType || e.type;
      if (type === 'TAB_SWITCH' || type === 'PAGE_HIDDEN') distractionTypeCounts.TAB_SWITCH++;
      else if (type === 'INACTIVITY') distractionTypeCounts.INACTIVITY++;
      else if (type === 'LOOKING_AWAY' || type === 'HEAD_DOWN') distractionTypeCounts.LOOKING_AWAY++;
      else if (type === 'PHONE_DETECTED' || type === 'POSSIBLE_PHONE_USAGE') distractionTypeCounts.PHONE_DETECTED++;
      else if (type === 'FULLSCREEN_EXIT') distractionTypeCounts.FULLSCREEN_EXIT++;
      else if (type === 'WINDOW_BLUR') distractionTypeCounts.WINDOW_BLUR++;
    });

    const totalEvents = Object.values(distractionTypeCounts).reduce((a, b) => a + b, 0) || 1;
    const distractionBreakdown = [
      { name: "Tab Switching", key: "TAB_SWITCH", count: distractionTypeCounts.TAB_SWITCH, percentage: Math.round((distractionTypeCounts.TAB_SWITCH / totalEvents) * 100) },
      { name: "Inactivity", key: "INACTIVITY", count: distractionTypeCounts.INACTIVITY, percentage: Math.round((distractionTypeCounts.INACTIVITY / totalEvents) * 100) },
      { name: "Looking Away", key: "LOOKING_AWAY", count: distractionTypeCounts.LOOKING_AWAY, percentage: Math.round((distractionTypeCounts.LOOKING_AWAY / totalEvents) * 100) },
      { name: "Phone Distraction", key: "PHONE_DETECTED", count: distractionTypeCounts.PHONE_DETECTED, percentage: Math.round((distractionTypeCounts.PHONE_DETECTED / totalEvents) * 100) }
    ];

    const mostCommon = distractionBreakdown.sort((a, b) => b.count - a.count)[0]?.name || "Tab Switching";

    // Streak calculation
    let streak = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const checkDay = new Date(today); checkDay.setDate(today.getDate() - i);
      const nextDay  = new Date(checkDay); nextDay.setDate(checkDay.getDate() + 1);
      const hadSession = allSessions.some(s => {
        const d = new Date(s.startedAt);
        return d >= checkDay && d < nextDay;
      });
      if (hadSession) streak++;
      else if (i > 0) break;
    }

    res.json({
      success: true,
      analytics: {
        totalSessions,
        totalFocusTimeMinutes: Math.round(totalSeconds / 60),
        totalHours,
        avgScore,
        bestScore,
        avgDistractionCount,
        mostCommonDistraction: mostCommon,
        distractionBreakdown,
        streak
      },
      stats: { totalHours, totalSessions, avgScore, streak }
    });
  } catch (err) {
    console.error("getFocusAnalytics error:", err);
    res.status(500).json({ success: false, message: "Failed to load analytics." });
  }
};

exports.getFocusStats = exports.getFocusAnalytics;
