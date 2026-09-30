const mongoose = require("mongoose");

// ── FocusEvent — individual distraction/attention signals recorded during a session ──
const focusEventSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "FocusSession", required: true, index: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: {
    type: String,
    enum: ["TAB_SWITCH", "WINDOW_BLUR", "FOCUS_RETURN", "INACTIVITY", "FACE_NOT_DETECTED",
           "LOOKING_AWAY", "MOTION_DETECTED", "SPEECH_DETECTED", "SESSION_PAUSED",
           "SESSION_RESUMED", "OTHER"],
    required: true
  },
  reason:     { type: String, trim: true },
  timestamp:  { type: Date, default: Date.now, index: true },
  duration:   { type: Number, default: 0 }, // seconds this event lasted
  confidence: { type: Number, min: 0, max: 1 }, // 0-1 if from camera/audio signal
  metadata:   { type: mongoose.Schema.Types.Mixed }
}, { _id: true });

// ── FocusSession — one complete study block ────────────────────────────────────
const focusSessionSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

  // Session configuration
  subject:         { type: String, trim: true },  // e.g. "Data Structures"
  topic:           { type: String, trim: true },  // e.g. "Binary Trees"
  goal:            { type: String, trim: true },  // student's stated goal
  category: {
    type: String,
    enum: ["subject", "course", "skill", "assignment", "interview_prep", "placement_prep", "general"],
    default: "general"
  },
  plannedDuration: { type: Number, default: 25 }, // minutes

  // Monitoring settings (consent flags)
  monitoringSettings: {
    browserActivity: { type: Boolean, default: true  },
    cameraEnabled:   { type: Boolean, default: false },
    audioEnabled:    { type: Boolean, default: false }
  },

  // Lifecycle
  startedAt:   { type: Date, default: Date.now },
  endedAt:     { type: Date },
  completedAt: { type: Date }, // set when student clicks "Complete"
  status: {
    type: String,
    enum: ["active", "paused", "completed", "abandoned"],
    default: "active"
  },
  completed: { type: Boolean, default: false },

  // Computed at end
  actualDuration:         { type: Number, default: 0 }, // seconds actually elapsed
  focusScore:             { type: Number, min: 0, max: 100, default: 0 },
  distractionCount:       { type: Number, default: 0 },
  totalDistractionDuration: { type: Number, default: 0 }, // total seconds away/distracted

  // Score breakdown for explainability
  scoreBreakdown: {
    baseFocusRatio:      { type: Number },  // 0-1
    tabSwitchPenalty:    { type: Number },
    inactivityPenalty:   { type: Number },
    cameraAwayPenalty:   { type: Number },
    motionPenalty:       { type: Number },
    finalScore:          { type: Number }
  },

  // Penalties config used (so score is always explainable)
  scoringConfig: {
    tabSwitchPenalty:  { type: Number, default: 4 },
    inactivityPenalty: { type: Number, default: 3 },
    cameraAwayPenalty: { type: Number, default: 6 },
    motionPenalty:     { type: Number, default: 2 }
  },

  // Post-session reflection
  reflection: { type: String, trim: true },
  notes:      { type: String, trim: true }

}, { timestamps: true });

// Indexes for analytics queries
focusSessionSchema.index({ userId: 1, startedAt: -1 });
focusSessionSchema.index({ userId: 1, status: 1 });
focusSessionSchema.index({ userId: 1, createdAt: -1 });

const FocusSession = mongoose.model("FocusSession", focusSessionSchema);
const FocusEvent   = mongoose.model("FocusEvent",   focusEventSchema);

module.exports = { FocusSession, FocusEvent };
