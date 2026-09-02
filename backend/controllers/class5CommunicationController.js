const StudentSkillProgress = require("../models/StudentSkillProgress");
const StudentBadge = require("../models/StudentBadge");
const StudentDailyMission = require("../models/StudentDailyMission");
const StudentVoiceRecording = require("../models/StudentVoiceRecording");
const StudentActivityHistory = require("../models/StudentActivityHistory");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

// Helper to calculate level from XP
// Level 1: 0 - 99 XP
// Level 2: 100 - 249 XP
// Level 3: 250 - 499 XP
// Level 4: 500 - 849 XP
// Level 5: 850+ XP
const calculateLevel = (xp) => {
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 500) return 3;
  if (xp < 850) return 4;
  return 5;
};

// Daily missions list
const DAILY_MISSIONS = [
  "Say Thank You.",
  "Smile at one person.",
  "Help your friend.",
  "Introduce yourself.",
  "Listen without interrupting.",
  "Use Please.",
  "Ask Permission.",
  "Share your ideas."
];

// Helper to update streak
const updateStreakHelper = (progress) => {
  const today = new Date().toISOString().split("T")[0];
  if (!progress.lastActivityDate) {
    progress.streak = 1;
  } else {
    const lastDate = new Date(progress.lastActivityDate).toISOString().split("T")[0];
    if (lastDate === today) {
      // Already active today, streak doesn't change
    } else {
      const diffTime = Math.abs(new Date(today) - new Date(lastDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        progress.streak += 1;
      } else {
        progress.streak = 1;
      }
    }
  }
  progress.lastActivityDate = new Date();
};

exports.getProgress = async (req, res) => {
  try {
    const studentId = req.student._id;
    let progress = await StudentSkillProgress.findOne({ studentId });
    if (!progress) {
      progress = await StudentSkillProgress.create({ studentId });
    }

    const badges = await StudentBadge.find({ studentId }).sort({ unlockedAt: -1 });
    const recordings = await StudentVoiceRecording.find({ studentId }).sort({ createdAt: -1 });
    const history = await StudentActivityHistory.find({ studentId }).sort({ createdAt: -1 }).limit(10);

    // Get today's daily mission
    const today = new Date().toISOString().split("T")[0];
    let dailyMission = await StudentDailyMission.findOne({ studentId, date: today });

    res.status(200).json({
      success: true,
      data: {
        progress,
        badges: badges.map(b => b.badgeName),
        recordings,
        history,
        dailyMission
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching progress", error: error.message });
  }
};

exports.completeStep = async (req, res) => {
  try {
    const studentId = req.student._id;
    const { stepId } = req.body; // e.g. "video", "emotion_detective", "one_minute_talk", etc.

    if (!stepId) {
      return res.status(400).json({ success: false, message: "stepId is required" });
    }

    let progress = await StudentSkillProgress.findOne({ studentId });
    if (!progress) {
      progress = await StudentSkillProgress.create({ studentId });
    }

    // Check if step is already completed
    if (progress.completedSteps.includes(stepId)) {
      return res.status(200).json({
        success: true,
        message: "Step already completed",
        data: { progress }
      });
    }

    // Add step to completed list
    progress.completedSteps.push(stepId);

    // Update skills & XP based on step
    let xpEarned = 0;
    let skillUpdates = {};
    let unlockedBadge = null;

    if (stepId === "video") {
      xpEarned = 10;
      skillUpdates = { listening: 10, confidence: 5 };
      unlockedBadge = "Active Learner";
    } else if (stepId === "emotion_detective") {
      xpEarned = 20;
      skillUpdates = { empathy: 20, observation: 20, listening: 5 };
      unlockedBadge = "Emotion Detective";
    } else if (stepId === "one_minute_talk") {
      xpEarned = 25;
      skillUpdates = { speakingConfidence: 25, confidence: 15, leadership: 10 };
      unlockedBadge = "Confident Speaker";
    } else if (stepId === "conversation_builder") {
      xpEarned = 15;
      skillUpdates = { speakingConfidence: 15, respect: 15, leadership: 5 };
      unlockedBadge = "Conversation Builder";
    } else if (stepId === "school_simulator") {
      xpEarned = 30;
      skillUpdates = { empathy: 20, respect: 20, confidence: 10 };
      unlockedBadge = "Good Listener"; // Let's also unlock Good Listener
    } else if (stepId === "communication_hero") {
      xpEarned = 50;
      skillUpdates = {
        speakingConfidence: 20,
        listening: 20,
        empathy: 20,
        observation: 20,
        confidence: 20,
        respect: 20,
        leadership: 20
      };
      unlockedBadge = "Communication Hero";
    }

    // Apply updates
    progress.xp += xpEarned;
    progress.level = calculateLevel(progress.xp);

    Object.keys(skillUpdates).forEach(skill => {
      progress[skill] = Math.min(100, (progress[skill] || 10) + skillUpdates[skill]);
    });

    updateStreakHelper(progress);
    await progress.save();

    // Log to history
    await StudentActivityHistory.create({
      studentId,
      activityType: stepId,
      activityDetail: `Completed Communication step: ${stepId}`,
      xpEarned
    });

    // Save Badge if unlocked
    if (unlockedBadge) {
      try {
        await StudentBadge.create({ studentId, badgeName: unlockedBadge });
      } catch (err) {
        // Ignore duplicate key error if already unlocked
      }
    }

    // Extra badge checking: Kind Speaker if empathy is high
    if (progress.empathy >= 70) {
      try {
        await StudentBadge.create({ studentId, badgeName: "Kind Speaker" });
      } catch (err) {}
    }

    const badges = await StudentBadge.find({ studentId }).sort({ unlockedAt: -1 });

    res.status(200).json({
      success: true,
      message: `Completed step ${stepId}! +${xpEarned} XP!`,
      data: {
        progress,
        badges: badges.map(b => b.badgeName),
        newBadge: unlockedBadge
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating step", error: error.message });
  }
};

// Reusable handler to save an interactive Game/Learning activity result.
const ACTIVITY_CONFIG = {
  pattern_master: {
    label: "Pattern Master",
    skills: [
      { name: "logicalThinking", gain: 15 },
      { name: "problemSolving", gain: 15 },
    ],
    xpBonus: 20,
    badges: [
      { name: "Pattern Master", threshold: 80 },
    ],
  },
  drawing_challenge: {
    label: "Drawing Challenge",
    skills: [
      { name: "creativity", gain: 10 },
    ],
    xpBonus: 10,
    badges: [
      { name: "Creative Artist", threshold: 100 },
    ],
  },
  story_builder: {
    label: "Story Builder",
    skills: [
      { name: "creativity", gain: 10 },
      { name: "imagination", gain: 10 },
      { name: "storytelling", gain: 10 },
      { name: "logicalSequencing", gain: 10 },
    ],
    xpBonus: 10,
    badges: [
      { name: "Storyteller", threshold: 100 },
    ],
  },
  make_your_own_song: {
    label: "Make Your Own Song",
    skills: [
      { name: "creativity", gain: 10 },
      { name: "expression", gain: 10 },
      { name: "vocabulary", gain: 10 },
    ],
    xpBonus: 10,
    badges: [
      { name: "Young Songwriter", threshold: 100 },
    ],
  },
  treasure_hunt: {
    label: "Treasure Hunt",
    skills: [
      { name: "observation", gain: 10 },
      { name: "problemSolving", gain: 10 },
      { name: "logicalThinking", gain: 10 },
      { name: "attention", gain: 10 },
    ],
    xpBonus: 10,
    badges: [
      { name: "Treasure Hunter", threshold: 80 },
    ],
  },
};

exports.submitActivityResult = async (req, res) => {
  try {
    const studentId = req.student._id;
    const { activityId, score, total, correct, incorrect, percentage, detail } = req.body || {};

    if (!activityId) {
      return res.status(400).json({ success: false, message: "activityId is required" });
    }

    const config = ACTIVITY_CONFIG[activityId];
    if (!config) {
      return res.status(400).json({ success: false, message: "Unknown activityId" });
    }

    const totalQ = Number(total) || 0;
    const pct = Number(percentage);
    const numScore = Number(score) || 0;

    let progress = await StudentSkillProgress.findOne({ studentId });
    if (!progress) {
      progress = await StudentSkillProgress.create({ studentId });
    }

    const alreadyCompleted = progress.completedSteps.includes(activityId);
    const xpEarned = config.xpBonus + (pct >= 80 ? 20 : 0);

    if (!alreadyCompleted) {
      progress.completedSteps.push(activityId);
    }

    progress.xp += xpEarned;
    progress.level = calculateLevel(progress.xp);

    if (pct > 0 && config.skills && config.skills.length) {
      config.skills.forEach(({ name, gain }) => {
        const pctGain = Math.round((gain * pct) / 100);
        progress[name] = Math.min(100, (progress[name] || 10) + pctGain);
      });
    }

    updateStreakHelper(progress);
    await progress.save();

    await StudentActivityHistory.create({
      studentId,
      activityType: activityId,
      activityDetail: JSON.stringify({
        title: config.label,
        score,
        total,
        correct,
        incorrect,
        percentage: pct,
        ...(detail && typeof detail === "object" ? detail : {}),
      }),
      xpEarned,
    });

    // Award a badge when the student performs well (only if not yet unlocked)
    let newBadge = null;
    if (config.badges && config.badges.length) {
      for (const badge of config.badges) {
        if (pct >= badge.threshold) {
          try {
            await StudentBadge.create({ studentId, badgeName: badge.name });
            newBadge = badge.name;
          } catch (err) {
            // duplicate badge -> ignore
          }
          break;
        }
      }
    }

    const badges = await StudentBadge.find({ studentId }).sort({ unlockedAt: -1 });

    res.status(200).json({
      success: true,
      message: `${config.label} result saved! +${xpEarned} XP`,
      data: {
        progress,
        badges: badges.map((b) => b.badgeName),
        newBadge: alreadyCompleted ? null : newBadge,
        xpEarned,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving activity result", error: error.message });
  }
};

exports.getOrGenerateDailyMission = async (req, res) => {
  try {
    const studentId = req.student._id;
    const today = new Date().toISOString().split("T")[0];

    let mission = await StudentDailyMission.findOne({ studentId, date: today });
    if (!mission) {
      // Pick random mission
      const randomText = DAILY_MISSIONS[Math.floor(Math.random() * DAILY_MISSIONS.length)];
      mission = await StudentDailyMission.create({
        studentId,
        missionText: randomText,
        date: today,
        completed: false
      });
    }

    res.status(200).json({ success: true, data: mission });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error getting daily mission", error: error.message });
  }
};

exports.completeDailyMission = async (req, res) => {
  try {
    const studentId = req.student._id;
    const today = new Date().toISOString().split("T")[0];

    const mission = await StudentDailyMission.findOne({ studentId, date: today });
    if (!mission) {
      return res.status(404).json({ success: false, message: "Daily mission not found for today" });
    }

    if (mission.completed) {
      return res.status(200).json({ success: true, message: "Mission already completed", data: mission });
    }

    mission.completed = true;
    mission.completedAt = new Date();
    await mission.save();

    // Award XP
    let progress = await StudentSkillProgress.findOne({ studentId });
    if (!progress) {
      progress = await StudentSkillProgress.create({ studentId });
    }

    progress.xp += 20; // 20 XP for daily mission
    progress.level = calculateLevel(progress.xp);

    // Increase random communication skill by +5
    const skills = ["speakingConfidence", "listening", "empathy", "observation", "confidence", "respect", "leadership"];
    const randomSkill = skills[Math.floor(Math.random() * skills.length)];
    progress[randomSkill] = Math.min(100, (progress[randomSkill] || 10) + 5);

    updateStreakHelper(progress);
    await progress.save();

    // Log activity
    await StudentActivityHistory.create({
      studentId,
      activityType: "daily_mission",
      activityDetail: `Completed daily mission: "${mission.missionText}"`,
      xpEarned: 20
    });

    // Check for "Helping Friend" badge if they complete daily missions
    const completedCount = await StudentDailyMission.countDocuments({ studentId, completed: true });
    if (completedCount >= 3) {
      try {
        await StudentBadge.create({ studentId, badgeName: "Helping Friend" });
      } catch (err) {}
    }

    const badges = await StudentBadge.find({ studentId }).sort({ unlockedAt: -1 });

    res.status(200).json({
      success: true,
      message: "Daily mission complete! +20 XP!",
      data: {
        mission,
        progress,
        badges: badges.map(b => b.badgeName)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error completing daily mission", error: error.message });
  }
};

exports.uploadVoiceRecording = async (req, res) => {
  try {
    const studentId = req.student._id;
    const { topic } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Audio file is required" });
    }

    const audioUrl = `/uploads/voice-recordings/${req.file.filename}`;

    const recording = await StudentVoiceRecording.create({
      studentId,
      topic,
      audioUrl
    });

    // Award +20 XP for participation
    let progress = await StudentSkillProgress.findOne({ studentId });
    if (!progress) {
      progress = await StudentSkillProgress.create({ studentId });
    }

    progress.xp += 20;
    progress.level = calculateLevel(progress.xp);
    progress.speakingConfidence = Math.min(100, (progress.speakingConfidence || 10) + 10);
    progress.confidence = Math.min(100, (progress.confidence || 10) + 5);

    updateStreakHelper(progress);
    await progress.save();

    // Log history
    await StudentActivityHistory.create({
      studentId,
      activityType: "one_minute_talk",
      activityDetail: `Recorded One Minute Talk on topic: "${topic}"`,
      xpEarned: 20
    });

    const badges = await StudentBadge.find({ studentId }).sort({ unlockedAt: -1 });

    res.status(201).json({
      success: true,
      message: "Voice recording saved! +20 XP!",
      data: {
        recording,
        progress,
        badges: badges.map(b => b.badgeName)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving voice recording", error: error.message });
  }
};

exports.getPublicPassport = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId).select("name classLevel district createdAt");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    let progress = await StudentSkillProgress.findOne({ studentId });
    if (!progress) {
      progress = {
        speakingConfidence: 10,
        listening: 10,
        empathy: 10,
        observation: 10,
        confidence: 10,
        respect: 10,
        leadership: 10,
        logicalThinking: 10,
        problemSolving: 10,
        creativity: 10,
        imagination: 10,
        storytelling: 10,
        logicalSequencing: 10,
        expression: 10,
        vocabulary: 10,
        attention: 10,
        xp: 0,
        level: 1,
        streak: 0,
        completedSteps: []
      };
    }

    const badges = await StudentBadge.find({ studentId }).sort({ unlockedAt: -1 });
    const recordings = await StudentVoiceRecording.find({ studentId }).sort({ createdAt: -1 });
    const history = await StudentActivityHistory.find({ studentId }).sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
      success: true,
      data: {
        student: {
          name: student.name,
          classLevel: student.classLevel,
          district: student.district,
          createdAt: student.createdAt
        },
        progress,
        badges: badges.map(b => b.badgeName),
        recordingsCount: recordings.length,
        activitiesCount: history.length,
        recentActivities: history
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching passport details", error: error.message });
  }
};
