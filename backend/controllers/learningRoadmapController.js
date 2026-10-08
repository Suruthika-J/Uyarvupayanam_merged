/**
 * learningRoadmapController.js
 * Controller for AI-Powered Dynamic Learning Roadmaps, Adaptive Recalculation & Completion
 */

const LearningRoadmap = require("../models/LearningRoadmap");
const LearningRoadmapGeneratorService = require("../services/learningRoadmapGeneratorService");
const StudentActivity = require("../models/StudentActivity");

/**
 * 1. Generate New Roadmap for Any Topic
 */
const generateRoadmap = async (req, res) => {
  try {
    const { topic, level, goal, hoursPerDay, targetDate, forceRegenerate } = req.body;
    const userId = req.student?._id;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ success: false, message: "Please enter a topic to generate a roadmap." });
    }

    const roadmap = await LearningRoadmapGeneratorService.generateRoadmap({
      topic,
      level,
      goal,
      hoursPerDay,
      targetDate,
      userId,
      forceRegenerate: !!forceRegenerate
    });

    return res.json({
      success: true,
      roadmap,
      sources: roadmap.sources || [],
      researchConfidence: roadmap.researchConfidence,
      confidenceReason: roadmap.confidenceReason
    });
  } catch (err) {
    console.error("Error in generateRoadmap controller:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to generate learning roadmap." });
  }
};

/**
 * 2. Get Current Active Roadmap for Student
 */
const getCurrentRoadmap = async (req, res) => {
  try {
    const userId = req.student?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    let roadmap = await LearningRoadmap.findOne({ userId, isCurrentActive: true });

    if (!roadmap) {
      // Find latest roadmap or generate default Aptitude roadmap
      roadmap = await LearningRoadmap.findOne({ userId }).sort({ updatedAt: -1 });

      if (!roadmap) {
        roadmap = await LearningRoadmapGeneratorService.generateRoadmap({
          topic: "Aptitude",
          level: "BEGINNER",
          goal: "PLACEMENT",
          hoursPerDay: 2,
          userId
        });
      } else {
        roadmap.isCurrentActive = true;
        await roadmap.save();
      }
    }

    return res.json({
      success: true,
      roadmap,
      sources: roadmap.sources || [],
      researchConfidence: roadmap.researchConfidence,
      confidenceReason: roadmap.confidenceReason
    });
  } catch (err) {
    console.error("Error getting current roadmap:", err);
    return res.status(500).json({ success: false, message: "Failed to retrieve current roadmap." });
  }
};

/**
 * 3. List All Saved Roadmaps for Student
 */
const listUserRoadmaps = async (req, res) => {
  try {
    const userId = req.student?._id;
    const roadmaps = await LearningRoadmap.find({ userId }).select("title topic normalizedTopic level goal progressPercentage placementReadyScore isCurrentActive updatedAt").sort({ updatedAt: -1 });

    return res.json({
      success: true,
      roadmaps
    });
  } catch (err) {
    console.error("Error listing roadmaps:", err);
    return res.status(500).json({ success: false, message: "Failed to list roadmaps." });
  }
};

/**
 * 4. Activate Specified Roadmap
 */
const activateRoadmap = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.student?._id;

    await LearningRoadmap.updateMany({ userId, isCurrentActive: true }, { isCurrentActive: false });
    const activated = await LearningRoadmap.findOneAndUpdate(
      { _id: roadmapId, userId },
      { isCurrentActive: true },
      { new: true }
    );

    if (!activated) {
      return res.status(404).json({ success: false, message: "Roadmap not found." });
    }

    return res.json({
      success: true,
      roadmap: activated
    });
  } catch (err) {
    console.error("Error activating roadmap:", err);
    return res.status(500).json({ success: false, message: "Failed to activate roadmap." });
  }
};

/**
 * 5. Mark Topic Complete / Toggle Completion
 */
const toggleTopicCompletion = async (req, res) => {
  try {
    const { roadmapId, topicId } = req.params;
    const { isCompleted } = req.body;
    const userId = req.student?._id;

    const roadmap = await LearningRoadmap.findOne({ _id: roadmapId, userId });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found." });
    }

    let totalTopics = 0;
    let completedTopicsCount = 0;
    const completedTopicNames = [];

    roadmap.sections.forEach(sec => {
      sec.topics.forEach(top => {
        totalTopics++;
        if (top.topicId === topicId) {
          top.isCompleted = typeof isCompleted === "boolean" ? isCompleted : !top.isCompleted;
          if (top.isCompleted) top.completedAt = new Date();
        }
        if (top.isCompleted) {
          completedTopicsCount++;
          completedTopicNames.push(top.name);
        }
      });
    });

    // Update progress & readiness
    const progressPercent = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;
    roadmap.progressPercentage = progressPercent;
    roadmap.completedTopics = completedTopicNames;

    // Recalculate Placement Readiness Score
    const topicMasteryAvg = completedTopicsCount > 0 ? 80 : 0;
    const readyScore = Math.round(0.40 * progressPercent + 0.40 * topicMasteryAvg + 0.20 * 85);
    roadmap.placementReadyScore = readyScore;

    if (readyScore >= 85) roadmap.readinessStatus = "Placement Ready 🚀";
    else if (readyScore >= 70) roadmap.readinessStatus = "Almost Ready ⚡";
    else roadmap.readinessStatus = "Building Foundation 📈";

    await roadmap.save();

    // Log Activity
    if (userId) {
      await StudentActivity.create({
        studentId: userId,
        activityType: "ROADMAP_TOPIC_COMPLETED",
        description: `Completed roadmap topic in ${roadmap.topic}`,
        metadata: { topicId, roadmapId, progressPercent }
      }).catch(() => {});
    }

    return res.json({
      success: true,
      progressPercentage: progressPercent,
      placementReadyScore: readyScore,
      readinessStatus: roadmap.readinessStatus,
      roadmap
    });
  } catch (err) {
    console.error("Error toggling topic completion:", err);
    return res.status(500).json({ success: false, message: "Failed to update topic completion." });
  }
};

/**
 * 6. Adaptive Recalculate Engine — Recalculates roadmap based on practice performance
 */
const recalculateAdaptiveRoadmap = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const { practiceResults = [] } = req.body;
    const userId = req.student?._id;

    const roadmap = await LearningRoadmap.findOne({ _id: roadmapId, userId });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found." });
    }

    const weakTopics = [];
    const strongTopics = [];

    // Analyze performance per topic
    roadmap.sections.forEach(sec => {
      sec.topics.forEach(top => {
        const attempt = practiceResults.find(r => r.topicId === top.topicId || (r.topicName && r.topicName.toLowerCase() === top.name.toLowerCase()));
        if (attempt) {
          const acc = attempt.accuracy || 0;
          top.accuracyScore = acc;
          top.userAttemptsCount = (top.userAttemptsCount || 0) + 1;

          // masteryScore = 0.50 * accuracy + 0.25 * speed + 0.25 * consistency
          const mastery = Math.round(0.50 * acc + 0.25 * 80 + 0.25 * 80);
          top.masteryScore = mastery;

          if (mastery < 50) {
            // Weak Topic: add +1 hour revision & +20 practice questions
            top.revisionHours += 1.0;
            top.practiceMinutes += 30;
            top.recommendedQuestions += 20;
            weakTopics.push({
              topicId: top.topicId,
              topicName: top.name,
              accuracy: acc,
              reinforcementAddedHours: 1,
              extraQuestionsCount: 20
            });
          } else if (mastery > 75) {
            strongTopics.push({
              topicId: top.topicId,
              topicName: top.name,
              accuracy: acc
            });
          }
        }
      });
    });

    roadmap.weakTopics = weakTopics;
    roadmap.strongTopics = strongTopics;

    // Recalculate Placement Readiness
    const totalTopics = roadmap.sections.reduce((acc, sec) => acc + sec.topics.length, 0);
    const completedCount = roadmap.completedTopics.length;
    const completionPercent = totalTopics > 0 ? (completedCount / totalTopics) * 100 : 0;

    const avgMastery = roadmap.sections.reduce((acc, sec) => {
      return acc + sec.topics.reduce((tAcc, top) => tAcc + (top.masteryScore || 0), 0);
    }, 0) / (totalTopics || 1);

    const placementReadyScore = Math.round(0.30 * completionPercent + 0.30 * avgMastery + 0.20 * 80 + 0.20 * 80);
    roadmap.placementReadyScore = placementReadyScore;

    if (placementReadyScore >= 85) roadmap.readinessStatus = "Placement Ready 🚀";
    else if (placementReadyScore >= 70) roadmap.readinessStatus = "Almost Ready ⚡";
    else roadmap.readinessStatus = "Building Foundation 📈";

    await roadmap.save();

    return res.json({
      success: true,
      message: "Adaptive roadmap successfully recalculated based on performance!",
      placementReadyScore,
      readinessStatus: roadmap.readinessStatus,
      weakTopics,
      strongTopics,
      roadmap
    });
  } catch (err) {
    console.error("Error recalculating adaptive roadmap:", err);
    return res.status(500).json({ success: false, message: "Failed to recalculate adaptive roadmap." });
  }
};

/**
 * 7. Get Today's Study Plan
 */
const getTodayPlan = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.student?._id;

    const roadmap = await LearningRoadmap.findOne({ _id: roadmapId, userId });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found." });
    }

    const todayPlan = roadmap.dailyPlans?.[0] || {
      dayNumber: 1,
      dateLabel: "Day 1",
      tasks: [
        { topicName: `${roadmap.topic} Fundamentals`, activityType: "Concept Study", durationMinutes: 45 },
        { topicName: `${roadmap.topic} Practice Questions`, activityType: "Practice Questions", durationMinutes: 45 },
        { topicName: "Revision & Notes Review", activityType: "Revision", durationMinutes: 20 },
        { topicName: "Mini Assessment Test", activityType: "Assessment Test", durationMinutes: 10 }
      ]
    };

    return res.json({
      success: true,
      todayPlan
    });
  } catch (err) {
    console.error("Error getting today plan:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch today plan." });
  }
};

/**
 * 8. Get Weekly Schedule
 */
const getWeeklyPlan = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.student?._id;

    const roadmap = await LearningRoadmap.findOne({ _id: roadmapId, userId });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: "Roadmap not found." });
    }

    return res.json({
      success: true,
      weeklyPlans: roadmap.weeklyPlans || []
    });
  } catch (err) {
    console.error("Error getting weekly plan:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch weekly plan." });
  }
};

module.exports = {
  generateRoadmap,
  getCurrentRoadmap,
  listUserRoadmaps,
  activateRoadmap,
  toggleTopicCompletion,
  recalculateAdaptiveRoadmap,
  getTodayPlan,
  getWeeklyPlan
};
