const { FocusSession, FocusEvent } = require("../models/FocusSession");

// ─── POST /api/focus/start ────────────────────────────────────────────────────
// Creates and starts a new focus session for the authenticated student.
exports.startFocusSession = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;
    const {
      subject, topic, goal, category, plannedDuration,
      monitoringSettings, scoringConfig
    } = req.body;

    // Abandon any previously active sessions (user started a new one)
    await FocusSession.updateMany(
      { userId, status: "active" },
      { $set: { status: "abandoned", endedAt: new Date() } }
    );

    const session = await FocusSession.create({
      userId,
      subject:         subject || "General Study",
      topic:           topic   || "",
      goal:            goal    || "",
      category:        category || "general",
      plannedDuration: plannedDuration || 25,
      monitoringSettings: monitoringSettings || {
        browserActivity: true,
        cameraEnabled: false,
        audioEnabled: false
      },
      scoringConfig: scoringConfig || {
        tabSwitchPenalty:  4,
        inactivityPenalty: 3,
        cameraAwayPenalty: 6,
        motionPenalty:     2
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

// ─── POST /api/focus/:id/events ──────────────────────────────────────────────
// Records a batch of distraction/attention events for a session.
exports.addFocusEvents = async (req, res) => {
  try {
    const userId    = req.student?._id || req.student?.id;
    const sessionId = req.params.id;
    const { events } = req.body; // array of event objects

    // Verify ownership
    const session = await FocusSession.findOne({ _id: sessionId, userId });
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ success: false, message: "No events provided." });
    }

    const docs = events.map(e => ({
      sessionId, userId,
      type:       e.type || "OTHER",
      reason:     e.reason || "",
      timestamp:  e.timestamp ? new Date(e.timestamp) : new Date(),
      duration:   e.duration || 0,
      confidence: e.confidence,
      metadata:   e.metadata
    }));

    await FocusEvent.insertMany(docs, { ordered: false });
    res.json({ success: true, recorded: docs.length });
  } catch (err) {
    console.error("addFocusEvents error:", err);
    res.status(500).json({ success: false, message: "Failed to record events." });
  }
};

// ─── PATCH /api/focus/:id ─────────────────────────────────────────────────────
// Update session status (e.g., paused → active).
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

// ─── POST /api/focus/:id/complete ────────────────────────────────────────────
// Marks a session as completed and computes the final focus score.
exports.completeFocusSession = async (req, res) => {
  try {
    const userId    = req.student?._id || req.student?.id;
    const sessionId = req.params.id;
    const { actualDuration, tabSwitchCount, inactiveSeconds, awayEvents,
            distractionEvents, notes, reflection } = req.body;

    const session = await FocusSession.findOne({ _id: sessionId, userId });
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });

    const cfg = session.scoringConfig;
    const totalSecs = actualDuration || 0;
    const focusSecs = Math.max(0, totalSecs - (inactiveSeconds || 0));
    const focusRatio = totalSecs > 0 ? focusSecs / totalSecs : 1;

    const tabPenalty     = (tabSwitchCount || 0)   * cfg.tabSwitchPenalty;
    const inactPenalty   = (inactiveSeconds || 0) > 60
      ? Math.floor((inactiveSeconds - 60) / 30) * cfg.inactivityPenalty : 0;
    const cameraPenalty  = (awayEvents || 0)        * cfg.cameraAwayPenalty;
    const motionPenalty  = (distractionEvents || 0) * cfg.motionPenalty;

    const rawScore     = Math.round(focusRatio * 100);
    const finalScore   = Math.max(10, Math.min(100, rawScore - tabPenalty - inactPenalty - cameraPenalty - motionPenalty));
    const distrCount   = (tabSwitchCount || 0) + (awayEvents || 0) + (distractionEvents || 0);

    const now = new Date();
    await session.updateOne({
      $set: {
        status:                  "completed",
        completed:               true,
        endedAt:                 now,
        completedAt:             now,
        actualDuration:          totalSecs,
        focusScore:              finalScore,
        distractionCount:        distrCount,
        totalDistractionDuration: inactiveSeconds || 0,
        notes:                   notes || session.notes,
        reflection:              reflection || "",
        scoreBreakdown: {
          baseFocusRatio:   parseFloat(focusRatio.toFixed(2)),
          tabSwitchPenalty: tabPenalty,
          inactivityPenalty: inactPenalty,
          cameraAwayPenalty: cameraPenalty,
          motionPenalty,
          finalScore
        }
      }
    });

    const updatedSession = await FocusSession.findById(sessionId);
    res.json({ success: true, session: updatedSession, focusScore: finalScore });
  } catch (err) {
    console.error("completeFocusSession error:", err);
    res.status(500).json({ success: false, message: "Failed to complete session." });
  }
};

// ─── POST /api/focus/:id/end ──────────────────────────────────────────────────
// Ends a session early (abandoned).
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
// Returns paginated focus session history for the student.
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
// Returns today's focus statistics.
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

// ─── GET /api/focus/weekly ────────────────────────────────────────────────────
// Returns this week's focus analytics for charts + insights.
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

    // Group by day (0 = Mon, 6 = Sun)
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

    // Distraction type breakdown
    const events = await FocusEvent.find({ userId, timestamp: { $gte: weekStart } }).lean();
    const distrTypeMap = {};
    events.forEach(e => { distrTypeMap[e.type] = (distrTypeMap[e.type] || 0) + 1; });
    const mostCommonDistraction = Object.entries(distrTypeMap)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    res.json({
      success: true,
      weekly: {
        byDay, topSubjects, totalMinutes, avgScore,
        longestSessionMinutes: longestMinutes,
        totalSessions: sessions.length,
        mostCommonDistraction
      }
    });
  } catch (err) {
    console.error("getWeeklyFocusStats error:", err);
    res.status(500).json({ success: false, message: "Failed to load weekly stats." });
  }
};

// ─── GET /api/focus/stats ─────────────────────────────────────────────────────
// Overall focus stats: streak, total hours, session count.
exports.getFocusStats = async (req, res) => {
  try {
    const userId = req.student?._id || req.student?.id;

    const allSessions = await FocusSession.find({ userId, status: "completed" })
      .sort({ startedAt: -1 }).lean();

    const totalHours  = parseFloat((allSessions.reduce((s, x) => s + (x.actualDuration || 0), 0) / 3600).toFixed(1));
    const totalSessions = allSessions.length;
    const avgScore = totalSessions
      ? Math.round(allSessions.reduce((s, x) => s + x.focusScore, 0) / totalSessions) : 0;

    // Calculate streak (consecutive days with at least one completed session)
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
      else if (i > 0) break; // Stop on first gap (today allowed to be 0)
    }

    res.json({
      success: true,
      stats: { totalHours, totalSessions, avgScore, streak }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load stats." });
  }
};
