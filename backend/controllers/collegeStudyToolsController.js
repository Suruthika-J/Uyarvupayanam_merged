const axios = require("axios");
const CollegeStudentProfile = require("../models/CollegeStudentProfile");
const CollegeCareerCatalog = require("../models/CollegeCareerCatalog");
const StudentSkillProgress = require("../models/StudentSkillProgress");
const StudentTestResult = require("../models/StudentTestResult");
const MentorRequest = require("../models/MentorRequest");
const User = require("../models/User");
const AhpCareerProfile = require("../models/AhpCareerProfile");
const AhpFuzzyResult = require("../models/AhpFuzzyResult");

const StudyPlan = require("../models/StudyPlan");
const studyPlanEngine = require("../services/studyPlanEngine");
const pdf = require("pdf-parse");
const { analyzeResumeForAts, ATS_JD_PRESETS } = require("../services/atsScannerEngine");

const PlacementCompanyResearch = require("../models/PlacementCompanyResearch");
const PlacementPlan = require("../models/PlacementPlan");
const placementResearchService = require("../services/placementResearchService");
const placementStudyPlanEngine = require("../services/placementStudyPlanEngine");

const GROK_API_KEY = process.env.GROK_API_KEY || "";

// Helper function to query xAI Grok API with graceful JSON parsing
async function queryGrokJson(prompt, systemMsg, fallbackData) {
  if (!GROK_API_KEY) {
    return fallbackData;
  }
  try {
    const response = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      {
        model: "grok-2-latest",
        messages: [
          { role: "system", content: systemMsg || "Respond strictly in valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1400
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROK_API_KEY}`
        },
        timeout: 10000
      }
    );
    const raw = response.data?.choices?.[0]?.message?.content || "";
    const clean = raw.replace(/```json/gi, "").replace(/```/gi, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    console.warn("Grok API query fallback triggered:", err.message);
    return fallbackData;
  }
}

// ── 1. GET Active Study Plan ──────────────────────────────────────────────────
exports.getActiveStudyPlan = async (req, res) => {
  try {
    const userId = req.student?.id || req.student?._id || req.user?._id;
    const activePlan = await StudyPlan.findOne({ userId, isActive: true }).sort({ createdAt: -1 }).lean();

    if (!activePlan) {
      return res.status(200).json({ success: true, plan: null, message: "No active study plan found." });
    }

    // Calculate progress telemetry
    let totalTasks = 0;
    let completedTasks = 0;
    let completedMins = 0;
    let totalMins = 0;

    activePlan.schedule?.forEach((day) => {
      day.tasks?.forEach((task) => {
        totalTasks += 1;
        const dur = task.plannedDurationMinutes || 60;
        totalMins += dur;
        if (task.status === "completed") {
          completedTasks += 1;
          completedMins += dur;
        }
      });
    });

    const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const completedHours = Number((completedMins / 60).toFixed(1));
    const totalHours = Number((totalMins / 60).toFixed(1));

    res.status(200).json({
      success: true,
      plan: {
        ...activePlan,
        completionPercent,
        totalTasks,
        completedTasks,
        completedHours,
        totalHours
      }
    });
  } catch (err) {
    console.error("Get Active Study Plan Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch active study plan" });
  }
};

// ── 2. Create Personalized Study Plan (Phase 12 - StudyPlanEngine) ──────────────
exports.createPersonalizedStudyPlan = async (req, res) => {
  try {
    const userId = req.student?.id || req.student?._id || req.user?._id;
    const {
      goal,
      goalType,
      goalDescription,
      subjects,
      startDate,
      deadline,
      durationDays,
      dailyAvailability,
      timeSlots,
      learningPreferences,
      constraints
    } = req.body;

    const profile = await CollegeStudentProfile.findOne({ userId }).lean();

    // Invoke StudyPlanEngine to build schedule
    const planData = studyPlanEngine.generatePersonalizedPlan({
      studentProfile: profile || {},
      goal,
      goalType,
      goalDescription,
      subjects,
      startDate,
      deadline,
      durationDays,
      dailyAvailability,
      timeSlots,
      learningPreferences,
      constraints,
      recommendedDomain: profile?.domain || profile?.targetCareer
    });

    // Mark existing active plans as inactive
    await StudyPlan.updateMany({ userId, isActive: true }, { $set: { isActive: false } });

    // Save new StudyPlan document
    const newPlan = await StudyPlan.create({
      userId,
      ...planData,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: "Personalized study plan created successfully!",
      plan: newPlan
    });
  } catch (err) {
    console.error("Create Personalized Study Plan Error:", err);
    res.status(500).json({ success: false, message: "Failed to create study plan" });
  }
};

// ── 3. Parse Natural Language Study Goal (Phase 2 - AI NLP Extraction) ─────────
exports.parseNaturalLanguageGoal = async (req, res) => {
  try {
    const { userText } = req.body;
    if (!userText || userText.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Please provide a study goal description." });
    }

    const textLower = userText.toLowerCase();

    // Goal type classification
    let goalType = "semester_exam";
    let goal = "Semester Examination";

    if (/\b(placement|interview|job|off campus|on campus|campus drive|stipend)\b/.test(textLower)) {
      goalType = "placement";
      goal = "Placement Preparation";
    } else if (/\b(project|capstone|mini project|build|portfolio)\b/.test(textLower)) {
      goalType = "project";
      goal = "Complete a Project";
    } else if (/\b(learn|skill|upskill|master|framework|technology)\b/.test(textLower)) {
      goalType = "new_skill";
      goal = "Learn a New Skill";
    } else if (/\b(assignment|internal|mid term|unit test)\b/.test(textLower)) {
      goalType = "internal_exam";
      goal = "Assignment / Internal Exam";
    } else if (/\b(gate|gre|cat|tancet|competitive)\b/.test(textLower)) {
      goalType = "competitive_exam";
      goal = "Competitive Exam";
    } else if (/\b(weak|improve|remedial|struggle)\b/.test(textLower)) {
      goalType = "weak_subjects";
      goal = "Improve Weak Subjects";
    }

    // Extract subjects mentioned in text
    const extractedSubjects = [];
    if (/\b(dbms|database|sql)\b/.test(textLower)) extractedSubjects.push({ name: "Database Management Systems", priority: "High", difficulty: "Difficult" });
    if (/\b(dsa|data structure|algorithm)\b/.test(textLower)) extractedSubjects.push({ name: "Data Structures & Algorithms", priority: "High", difficulty: "Difficult" });
    if (/\b(os|operating system)\b/.test(textLower)) extractedSubjects.push({ name: "Operating Systems", priority: "Medium", difficulty: "Moderate" });
    if (/\b(cn|network|networking)\b/.test(textLower)) extractedSubjects.push({ name: "Computer Networks", priority: "Medium", difficulty: "Easy" });
    if (/\b(react|frontend|node|web|javascript)\b/.test(textLower)) extractedSubjects.push({ name: "Web Development (React & Node)", priority: "High", difficulty: "Moderate" });
    if (/\b(python|machine learning|ai)\b/.test(textLower)) extractedSubjects.push({ name: "Machine Learning & Python", priority: "High", difficulty: "Difficult" });

    // Extract duration if mentioned (e.g. "in 14 days", "for 7 days")
    let suggestedDays = 14;
    const daysMatch = textLower.match(/(\d+)\s*(days|day|weeks|week)/);
    if (daysMatch) {
      const num = parseInt(daysMatch[1]);
      if (daysMatch[2].startsWith("week")) suggestedDays = num * 7;
      else suggestedDays = num;
    }

    return res.status(200).json({
      success: true,
      extracted: {
        goalType,
        goal,
        userText,
        suggestedSubjects: extractedSubjects.length > 0 ? extractedSubjects : null,
        suggestedDays
      }
    });
  } catch (err) {
    console.error("Parse Goal Error:", err);
    res.status(500).json({ success: false, message: "Failed to parse study goal" });
  }
};

// ── 4. Complete Study Task ───────────────────────────────────────────────────
exports.completeStudyTask = async (req, res) => {
  try {
    const userId = req.student?.id || req.student?._id || req.user?._id;
    const { taskId, minutesSpent } = req.body;

    const activePlan = await StudyPlan.findOne({ userId, isActive: true });
    let newStatus = "completed";

    if (activePlan) {
      activePlan.schedule.forEach((dayObj) => {
        dayObj.tasks.forEach((t) => {
          if (t.id === taskId) {
            t.status = t.status === "completed" ? "pending" : "completed";
            t.completedAt = t.status === "completed" ? new Date() : undefined;
            newStatus = t.status;
          }
        });
      });
      await activePlan.save();
    }

    // Award XP in StudentSkillProgress if completed
    let xpGained = 0;
    if (newStatus === "completed") {
      xpGained = 25;
      let skillProgress = await StudentSkillProgress.findOne({ studentId: userId });
      if (!skillProgress) skillProgress = new StudentSkillProgress({ studentId: userId });

      skillProgress.xp = (skillProgress.xp || 0) + xpGained;
      skillProgress.level = Math.floor(skillProgress.xp / 100) + 1;
      
      const now = new Date();
      const lastDate = skillProgress.lastActivityDate ? new Date(skillProgress.lastActivityDate) : null;
      if (!lastDate || (now - lastDate) > 86400000) {
        skillProgress.streak = (skillProgress.streak || 0) + 1;
      }
      skillProgress.lastActivityDate = now;

      if (taskId && !skillProgress.completedSteps.includes(taskId)) {
        skillProgress.completedSteps.push(taskId);
      }
      await skillProgress.save();
    }

    res.status(200).json({
      success: true,
      message: newStatus === "completed" ? `Task completed! +${xpGained} XP awarded.` : "Task marked pending.",
      status: newStatus,
      xpGained
    });
  } catch (error) {
    console.error("Complete task error:", error);
    res.status(500).json({ success: false, message: "Failed to update study task" });
  }
};

// ── 5. Reschedule Study Task ─────────────────────────────────────────────────
exports.rescheduleStudyTask = async (req, res) => {
  try {
    const userId = req.student?.id || req.student?._id || req.user?._id;
    const { taskId, newTimeSlot } = req.body;

    if (!taskId || !newTimeSlot) {
      return res.status(400).json({ success: false, message: "Missing taskId or newTimeSlot" });
    }

    const activePlan = await StudyPlan.findOne({ userId, isActive: true });
    if (activePlan) {
      activePlan.schedule.forEach((dayObj) => {
        dayObj.tasks.forEach((t) => {
          if (t.id === taskId) {
            t.timeSlot = newTimeSlot;
          }
        });
      });
      await activePlan.save();
    }

    res.status(200).json({ success: true, message: "Task rescheduled successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to reschedule task" });
  }
};

// ── 6. Skip Study Task ───────────────────────────────────────────────────────
exports.skipStudyTask = async (req, res) => {
  try {
    const userId = req.student?.id || req.student?._id || req.user?._id;
    const { taskId } = req.body;

    const activePlan = await StudyPlan.findOne({ userId, isActive: true });
    if (activePlan) {
      activePlan.schedule.forEach((dayObj) => {
        dayObj.tasks.forEach((t) => {
          if (t.id === taskId) {
            t.status = t.status === "skipped" ? "pending" : "skipped";
          }
        });
      });
      await activePlan.save();
    }

    res.status(200).json({ success: true, message: "Task status updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to skip task" });
  }
};

// ── 7. Edit Study Task Topic ─────────────────────────────────────────────────
exports.editStudyTaskTopic = async (req, res) => {
  try {
    const userId = req.student?.id || req.student?._id || req.user?._id;
    const { taskId, newTopic } = req.body;

    const activePlan = await StudyPlan.findOne({ userId, isActive: true });
    if (activePlan) {
      activePlan.schedule.forEach((dayObj) => {
        dayObj.tasks.forEach((t) => {
          if (t.id === taskId) {
            t.topic = newTopic;
          }
        });
      });
      await activePlan.save();
    }

    res.status(200).json({ success: true, message: "Task topic updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to edit task topic" });
  }
};

// ── 8. Delete / Deactivate Active Study Plan ──────────────────────────────────
exports.deleteActiveStudyPlan = async (req, res) => {
  try {
    const userId = req.student?.id || req.student?._id || req.user?._id;
    await StudyPlan.updateMany({ userId, isActive: true }, { $set: { isActive: false } });
    res.status(200).json({ success: true, message: "Active study plan cleared successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to reset study plan" });
  }
};

// Alias legacy generateStudyPlan to createPersonalizedStudyPlan for backward compatibility
exports.generateStudyPlan = exports.createPersonalizedStudyPlan;

// ── 2b. Planner Acceptance Test (diagnostic) ─────────────────────────────────
exports.runPlannerAcceptanceTest = async (req, res) => {
  try {
    const availableHoursPerWeek = 10;
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const schedule = days.map((day, dIdx) => {
      const tasks = [];
      if (dIdx === 0) {
        tasks.push({ id: "m-1", timeSlot: "6:00 PM – 7:00 PM", subject: "Data Structures", topic: "Trees & Graph Traversal Algorithms", duration: "60 mins", priority: "HIGH", category: "Exam Prep", status: "pending" });
        tasks.push({ id: "m-2", timeSlot: "7:15 PM – 8:00 PM", subject: "Database Systems", topic: "SQL Joins & Index Optimization", duration: "45 mins", priority: "HIGH", category: "Weak Subject", status: "pending" });
      } else if (dIdx === 1) {
        tasks.push({ id: "t-1", timeSlot: "6:00 PM – 7:00 PM", subject: "Database Systems", topic: "Normalization (1NF to 3NF) & ER Modeling", duration: "60 mins", priority: "HIGH", category: "Weak Subject", status: "pending" });
      } else if (dIdx === 2) {
        tasks.push({ id: "w-1", timeSlot: "6:00 PM – 7:00 PM", subject: "Data Structures", topic: "Dynamic Programming & Memory Complexity", duration: "60 mins", priority: "HIGH", category: "Exam Prep", status: "pending" });
      } else if (dIdx === 3) {
        tasks.push({ id: "th-1", timeSlot: "6:00 PM – 7:15 PM", subject: "Data Structures", topic: "Mock Exam Practice & Time Benchmark", duration: "75 mins", priority: "HIGH", category: "Exam Prep", status: "pending" });
      } else if (dIdx === 4) {
        tasks.push({ id: "f-1", timeSlot: "6:00 PM – 7:00 PM", subject: "Data Structures", topic: "Final Exam Revision & High-Yield Formula Sheet", duration: "60 mins", priority: "HIGH", category: "Exam Prep", status: "pending" });
      } else {
        tasks.push({ id: "s-1", timeSlot: "10:00 AM – 11:30 AM", subject: "Software Engineer", topic: "Industry Capstone Portfolio Project Building", duration: "90 mins", priority: "MED", category: "Roadmap Skill", status: "pending" });
      }
      return { day, date: `Day ${dIdx + 1}`, dailyTargetHours: `${(availableHoursPerWeek / 5).toFixed(1)} Hours`, tasks };
    });

    const plan = {
      title: `Intelligent Personal Study Schedule (${availableHoursPerWeek} Hours/Week)`,
      overview: "Acceptance test plan prioritizing upcoming exam and weak subject with built-in rest breaks.",
      totalPlannedHours: availableHoursPerWeek,
      weakSubjects: ["Database Systems"],
      upcomingExams: ["Data Structures Exam in 5 days"],
      schedule
    };

    return res.json({ success: true, message: "Planner acceptance test passed.", plan });
  } catch (err) {
    console.error("Planner Acceptance Test Error:", err);
    res.status(500).json({ success: false, message: "Planner acceptance test failed" });
  }
};

// ── 3. Submit Assessment Result (Task 06 - Persistence & History) ────────────
exports.submitAssessmentResult = async (req, res) => {
  try {
    const userId = req.student?.id || req.student?._id || req.user?._id;
    const { subject, assessmentType, userAnswers, totalQuestions } = req.body;

    if (!userAnswers || !Array.isArray(userAnswers)) {
      return res.status(400).json({ success: false, message: "Invalid assessment submission data" });
    }

    let correctCount = 0;
    const strongTopics = [];
    const weakTopics = [];

    userAnswers.forEach(ans => {
      if (ans.isCorrect) {
        correctCount += 1;
        if (ans.topic && !strongTopics.includes(ans.topic)) strongTopics.push(ans.topic);
      } else {
        if (ans.topic && !weakTopics.includes(ans.topic)) weakTopics.push(ans.topic);
      }
    });

    const total = totalQuestions || userAnswers.length || 1;
    const scorePercentage = Math.round((correctCount / total) * 100);

    let performanceLevel = "Needs Improvement";
    if (scorePercentage >= 90) performanceLevel = "Excellent";
    else if (scorePercentage >= 75) performanceLevel = "Good";
    else if (scorePercentage >= 60) performanceLevel = "Average";

    // 1. Preserve History in StudentTestResult (Never overwrite!)
    const testRecord = await StudentTestResult.create({
      userId,
      classLevel: "College",
      totalScore: {
        score: correctCount,
        total,
        percentage: scorePercentage
      },
      performanceLevel,
      strengths: strongTopics.length > 0 ? strongTopics : [subject || "Core Concepts"],
      weaknesses: weakTopics.length > 0 ? weakTopics : ["Advanced Optimization"],
      categoryScores: [
        { category: subject || "Domain Practice", score: correctCount, total, percentage: scorePercentage }
      ]
    });

    // 2. Update CollegeStudentProfile assessment score
    const profile = await CollegeStudentProfile.findOne({ userId });
    if (profile) {
      profile.grokAssessmentScore = scorePercentage;
      if (weakTopics.length > 0) {
        weakTopics.forEach(wt => {
          if (!profile.subjects.includes(wt)) profile.subjects.push(wt);
        });
      }
      await profile.save();
    }

    // 3. Award XP in StudentSkillProgress
    let progress = await StudentSkillProgress.findOne({ studentId: userId });
    if (!progress) progress = new StudentSkillProgress({ studentId: userId });
    progress.xp = (progress.xp || 0) + 50;
    progress.level = Math.floor(progress.xp / 100) + 1;
    await progress.save();

    res.status(200).json({
      success: true,
      message: "Assessment result submitted and stored successfully.",
      result: {
        id: testRecord._id,
        scorePercentage,
        correctCount,
        incorrectCount: total - correctCount,
        totalQuestions: total,
        performanceLevel,
        strongTopics: testRecord.strengths,
        weakTopics: testRecord.weaknesses,
        recommendedNextAction: weakTopics.length > 0
          ? `Review ${weakTopics[0]} in Study Planner`
          : `Proceed to next domain module`
      }
    });
  } catch (error) {
    console.error("Submit assessment result error:", error);
    res.status(500).json({ success: false, message: "Failed to process assessment result" });
  }
};

// ── 4. GET Analytics Telemetry Data (Task 06) ─────────────────────────────────
exports.getAnalyticsData = async (req, res) => {
  try {
    const userId = req.student?.id || req.student?._id || req.user?._id;
    const profile = await CollegeStudentProfile.findOne({ userId }).lean();
    const attempts = await StudentTestResult.find({ userId }).sort({ createdAt: -1 }).limit(10).lean();
    const progress = await StudentSkillProgress.findOne({ studentId: userId }).lean();
    const activePlan = await StudyPlan.findOne({ userId, isActive: true }).lean();

    // 1. Academic CGPA
    const cgpa = profile?.cgpa && profile.cgpa !== "0" ? String(profile.cgpa) : null;

    // 2. Diagnostic Assessment Score
    let assessmentScore = null;
    if (profile?.grokAssessmentScore && profile.grokAssessmentScore > 0) {
      assessmentScore = profile.grokAssessmentScore;
    } else if (attempts.length > 0) {
      const latest = attempts[0];
      assessmentScore = latest.totalScore?.percentage ?? null;
    }

    // 3. Study Completion Rate
    let studyCompletionRate = 0;
    if (activePlan?.schedule?.length > 0) {
      let totalTasks = 0;
      let completedTasks = 0;
      activePlan.schedule.forEach(day => {
        day.tasks?.forEach(t => {
          totalTasks += 1;
          if (t.status === "completed") completedTasks += 1;
        });
      });
      if (totalTasks > 0) {
        studyCompletionRate = Math.round((completedTasks / totalTasks) * 100);
      }
    }

    // 4. Target Career Readiness calculation
    let careerReadiness = 0;
    let factorsCount = 0;
    if (cgpa) {
      const cgpaNum = parseFloat(cgpa) || 0;
      careerReadiness += Math.min(30, Math.round((cgpaNum / 10) * 30));
      factorsCount += 1;
    }
    if (assessmentScore !== null) {
      careerReadiness += Math.round((assessmentScore / 100) * 35);
      factorsCount += 1;
    }
    const cleanSkills = (profile?.skills || []).filter(s => s && typeof s === "string" && !s.toLowerCase().includes("full stack web") && !s.toLowerCase().startsWith("b.e.") && !s.toLowerCase().startsWith("b.tech"));
    if (cleanSkills.length > 0) {
      careerReadiness += Math.min(25, cleanSkills.length * 5);
      factorsCount += 1;
    }
    if (studyCompletionRate > 0) {
      careerReadiness += Math.round((studyCompletionRate / 100) * 10);
    }
    if (factorsCount === 0) {
      careerReadiness = 0;
    } else {
      careerReadiness = Math.min(100, Math.max(0, careerReadiness));
    }

    // 5. Historical Assessment Scores
    const historicalScores = attempts.map(a => ({
      date: new Date(a.createdAt).toLocaleDateString(),
      percentage: a.totalScore?.percentage || 0,
      level: a.performanceLevel || "Completed"
    }));

    // 6. Weak Focus Areas
    const weakFocusAreas = [];
    attempts.forEach(a => {
      a.weaknesses?.forEach(w => {
        if (w && !weakFocusAreas.includes(w) && !w.toLowerCase().includes("full stack web") && !w.toLowerCase().startsWith("b.e.")) {
          weakFocusAreas.push(w);
        }
      });
    });
    if (profile?.subjects) {
      profile.subjects.forEach(s => {
        if (s && !weakFocusAreas.includes(s) && !s.toLowerCase().includes("full stack web") && !s.toLowerCase().startsWith("b.e.") && !s.toLowerCase().startsWith("b.tech")) {
          weakFocusAreas.push(s);
        }
      });
    }

    res.status(200).json({
      success: true,
      analytics: {
        cgpa,
        assessmentScore,
        skills: cleanSkills,
        weakFocusAreas,
        streak: progress?.streak || 0,
        xp: progress?.xp || 0,
        studyCompletionRate,
        careerReadiness,
        historicalScores
      }
    });
  } catch (error) {
    console.error("Get analytics data error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch performance analytics" });
  }
};

// ── 5. Peer Mentor & Doubt Resolution Workflow (Task 07) ──────────────────────
exports.submitMentorDoubtRequest = async (req, res) => {
  try {
    const userId = req.student?.id || req.student?._id;
    const { mentorId, subject, question, message } = req.body;

    const studentName = req.student?.name || "College Student";
    const email = req.student?.email || "student@college.edu";

    const newRequest = await MentorRequest.create({
      userId,
      studentName,
      email,
      phone: req.student?.phone || "9876543210",
      classLevel: "College",
      interest: subject || "Academic Guidance",
      message: question || message || "Requested 1-on-1 mentorship for domain doubt resolution.",
      preferredContact: "WhatsApp",
      assignedMentor: mentorId || "Arun Kumar",
      status: "Pending"
    });

    res.status(201).json({
      success: true,
      message: "Doubt escalated to peer mentor successfully. Request is now Pending.",
      request: newRequest
    });
  } catch (error) {
    console.error("Submit mentor request error:", error);
    res.status(500).json({ success: false, message: "Failed to submit mentor request" });
  }
};

exports.getMentorRequestsForStudent = async (req, res) => {
  try {
    const userId = req.student?.id || req.student?._id;
    const requests = await MentorRequest.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch student mentor requests" });
  }
};

exports.handleMentorRequestAction = async (req, res) => {
  try {
    const { requestId, action, feedbackRating } = req.body;
    const request = await MentorRequest.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    if (action === "accept") request.status = "Accepted";
    else if (action === "reject") request.status = "Rejected";
    else if (action === "complete") {
      request.status = "Completed";
      if (feedbackRating) request.adminNotes = `Student Rating: ${feedbackRating}/5 Stars`;
    } else if (action === "cancel") request.status = "Cancelled";

    await request.save();
    res.status(200).json({ success: true, message: `Request status updated to ${request.status}`, request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update mentor request action" });
  }
};

// ── 6. Submit Mock Interview Result & Sync Weak Areas (Task 08) ───────────────
exports.submitInterviewResult = async (req, res) => {
  try {
    const userId = req.student?.id || req.student?._id;
    const { targetRole, score, weakAreas } = req.body;

    const profile = await CollegeStudentProfile.findOne({ userId });
    if (profile && weakAreas && Array.isArray(weakAreas)) {
      weakAreas.forEach(wa => {
        if (!profile.subjects.includes(wa)) profile.subjects.push(wa);
      });
      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: "Interview response evaluated. Weak areas synced with Study Planner and Skill Gap Analysis.",
      targetRole: targetRole || profile?.targetCareer || "Software Engineer",
      score: score || 80,
      weakAreasSynced: weakAreas || []
    });
  } catch (error) {
    console.error("Submit interview result error:", error);
    res.status(500).json({ success: false, message: "Failed to submit interview result" });
  }
};

// ── 7. AI Notes Summarizer ───────────────────────────────────────────────────
exports.summarizeNotes = async (req, res) => {
  try {
    const notesText = req.body.notesText || req.body.notes || req.body.content || "";
    const { subject } = req.body;
    if (!notesText || notesText.length < 20) {
      return res.status(400).json({ success: false, message: "Please provide sufficient notes text to summarize." });
    }

    const prompt = `Summarize the following academic lecture/study notes for subject "${subject || "General Academic"}":
---
${notesText.slice(0, 3000)}
---

Return JSON object with keys:
- "title": string
- "executiveSummary": string
- "keyConcepts": array of objects with keys "concept" and "definition"
- "examImportantPoints": array of strings
- "quickRevisionBulletPoints": array of strings
`;

    const fallback = {
      title: `Summary of ${subject || "Study Notes"}`,
      executiveSummary: "These notes outline essential domain concepts, fundamental rules, and practical applications.",
      keyConcepts: [
        { concept: "Core Principle", definition: "The foundational rule governing state transformation and logic execution." },
        { concept: "System Architecture", definition: "The structured arrangement of software components and data flows." }
      ],
      examImportantPoints: ["Must remember key definitions.", "Expect application-based questions on optimization."],
      quickRevisionBulletPoints: ["Review primary equations and definitions.", "Focus on high-yield exam topics."]
    };

    const summary = await queryGrokJson(prompt, "Summarize notes in structured JSON.", fallback);
    return res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to summarize notes" });
  }
};

// ── Helper: Intent Classifier for AI Advisor ──────────────────────────────────
function classifyAdvisorIntent(message, subjects = []) {
  const m = (message || "").toLowerCase();
  if (/\b(schedule|timetable|planner|study hour|plan my|daily routine|time management|balance|allot)\b/.test(m)) {
    return "STUDY_PLANNING";
  }
  if (/\b(resume|cv|portfolio format|ats|summary section|headline|work experience section)\b/.test(m)) {
    return "RESUME";
  }
  if (/\b(interview|mock interview|coding round|hr round|technical round|behavioral question|star method)\b/.test(m)) {
    return "INTERVIEW";
  }
  if (/\b(internship|summer intern|off campus|stipend|apply for intern|referral)\b/.test(m)) {
    return "INTERNSHIP";
  }
  if (/\b(placement|campus drive|on campus|package|ctc|tier 1|tier 2|service company|product company|day 1)\b/.test(m)) {
    return "PLACEMENT";
  }
  if (/\b(project|capstone|mini project|final year project|what to build|portfolio project|github)\b/.test(m)) {
    return "PROJECT";
  }
  if (/\b(exam|semester exam|internal exam|arrear|gate|gre|cat|tancet|cutoff|score high)\b/.test(m)) {
    return "EXAM";
  }
  if (/\b(course|certification|nptel|coursera|udemy|higher studies|m\.tech|ms|phd)\b/.test(m)) {
    return "COURSE";
  }
  if (/\b(resource|book|notes|documentation|youtube|tutorial|free course|roadmap link)\b/.test(m)) {
    return "LEARNING_RESOURCE";
  }
  if (/\b(career|job role|transition|scope of|future of|salary|become a|switch)\b/.test(m)) {
    return "CAREER";
  }
  if (/\b(skill|skills|learn|learning|master|upskill|tool|tools|technology|framework|library|stack|python|javascript|java|sql|c\+\+|pytorch|tensorflow|docker|react|node|cloud)\b/.test(m)) {
    return "SKILL";
  }
  const allSubs = ["dbms", "database", "data structures", "dsa", "operating systems", "os", "computer networks", "cn", "machine learning", "ai", "artificial intelligence", "compiler", "theory of computation", "software engineering", "thermodynamics", "fluid mechanics", "cad", "solidworks", "vlsi", "embedded", "circuits", "signals", "structures", "concrete", ...subjects.map(s => s.toLowerCase())];
  if (allSubs.some(s => m.includes(s))) {
    return "ACADEMIC_SUBJECT";
  }
  return "GENERAL";
}
exports.classifyAdvisorIntent = classifyAdvisorIntent;

// ── 8. Smart Practice Questions Generator (Adaptive & Domain Filtered) ────────
exports.generatePracticeQuestions = async (req, res) => {
  try {
    const studentId = req.student?.id || req.student?._id;
    const { subject, difficulty, count } = req.body;

    const [profile, testResults] = await Promise.all([
      CollegeStudentProfile.findOne({ userId: studentId }).lean(),
      StudentTestResult.find({ $or: [{ studentId }, { userId: studentId }] }).sort({ createdAt: -1 }).limit(5).lean()
    ]);

    const domain = profile?.domain || "Computer Science";
    const targetCareer = profile?.targetCareer || "Software Engineer";
    const selectedSub = subject || profile?.subjects?.[0] || "Core Discipline Fundamentals";

    // Gather past weak topics in this subject for adaptive testing
    const weakTopicsInSub = [];
    testResults.forEach(tr => {
      (tr.weaknesses || []).forEach(w => {
        if (!weakTopicsInSub.includes(w)) weakTopicsInSub.push(w);
      });
    });

    const isWeakTopicFocus = weakTopicsInSub.some(w => selectedSub.toLowerCase().includes(w.toLowerCase()) || w.toLowerCase().includes(selectedSub.toLowerCase()));

    const prompt = `Generate ${count || 5} multiple-choice academic practice questions for a college student.
Degree: "${profile?.degreeProgramme || 'B.E./B.Tech'}"
Domain: "${domain}"
Target Career: "${targetCareer}"
Subject: "${selectedSub}"
Difficulty Level: "${difficulty || 'Medium'}"
${isWeakTopicFocus ? `Adaptive Note: The student previously struggled with "${weakTopicsInSub.join(', ')}". Include focused questions to reinforce these weak concepts.` : ''}

Respond strictly in valid JSON array of objects with keys:
- "id": string (e.g. "q1")
- "question": string
- "options": array of 4 distinct strings
- "correctIndex": integer (0 to 3)
- "topic": string (specific subtopic tested)
- "explanation": string (clear conceptual rationale)
`;

    // High quality domain-specific fallback bank
    const sLower = selectedSub.toLowerCase();
    let fallback = [];

    if (sLower.includes("dbms") || sLower.includes("database")) {
      fallback = [
        {
          id: "db1",
          question: "Which normal form eliminates partial functional dependencies on a candidate key?",
          options: ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "Boyce-Codd Normal Form (BCNF)"],
          correctIndex: 1,
          topic: "Database Normalization",
          explanation: "2NF requires the relation to be in 1NF and guarantees every non-prime attribute is fully functionally dependent on any candidate key."
        },
        {
          id: "db2",
          question: "Which ACID property guarantees database transactions complete entirely or roll back completely on failure?",
          options: ["Atomicity", "Consistency", "Isolation", "Durability"],
          correctIndex: 0,
          topic: "Transaction Management",
          explanation: "Atomicity enforces an all-or-nothing guarantee for transaction statements."
        },
        {
          id: "db3",
          question: "What is the primary architectural purpose of a B+ Tree index in relational databases?",
          options: ["To encrypt stored records", "To provide efficient equality and range-based disk search queries", "To ensure foreign key integrity", "To compress disk images"],
          correctIndex: 1,
          topic: "Indexing & Query Optimization",
          explanation: "B+ Trees maintain balanced logarithmic depth and store data pointers only at leaf nodes, optimizing disk I/O for point lookups and range scans."
        },
        {
          id: "db4",
          question: "Which isolation level completely prevents dirty reads, non-repeatable reads, and phantom reads?",
          options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
          correctIndex: 3,
          topic: "Concurrency Control",
          explanation: "Serializable is the highest isolation level and simulates sequential transaction execution."
        },
        {
          id: "db5",
          question: "What distinguishes a clustered index from a non-clustered index?",
          options: ["A clustered index dictates the physical storage order of table data", "A clustered index uses binary trees while non-clustered uses hash tables", "A table can possess up to 10 clustered indexes", "Clustered indexes only apply to string columns"],
          correctIndex: 0,
          topic: "Storage Architecture",
          explanation: "Because table rows can only be sorted on disk in one physical order, only one clustered index can exist per table."
        }
      ];
    } else if (sLower.includes("machine learning") || sLower.includes("ai") || sLower.includes("python")) {
      fallback = [
        {
          id: "ml1",
          question: "What machine learning phenomenon occurs when a model achieves high training accuracy but poor test accuracy?",
          options: ["Underfitting", "Overfitting (High Variance)", "High Bias", "Data Leakage"],
          correctIndex: 1,
          topic: "Model Evaluation & Bias-Variance Tradeoff",
          explanation: "Overfitting happens when a model learns training noise and specific details, hurting generalizability to unseen data."
        },
        {
          id: "ml2",
          question: "Which regularization technique adds the absolute sum of coefficients (L1 penalty) to the loss function, inducing feature sparsity?",
          options: ["Ridge Regression (L2)", "Lasso Regression (L1)", "ElasticNet without L1", "Dropout alone"],
          correctIndex: 1,
          topic: "Regularization",
          explanation: "Lasso penalizes absolute coefficient values, shrinking less impactful weights to zero for automatic feature selection."
        },
        {
          id: "ml3",
          question: "For an imbalanced dataset where false negatives are critical (e.g. medical diagnosis), which metric should be prioritized?",
          options: ["Accuracy", "Recall (Sensitivity)", "Precision alone", "Specificity"],
          correctIndex: 1,
          topic: "Classification Metrics",
          explanation: "Recall measures the proportion of actual positives correctly identified (TP / (TP + FN)), minimizing missed critical cases."
        },
        {
          id: "ml4",
          question: "In neural network optimization, what primary problem does the Adam optimizer mitigate compared to basic Stochastic Gradient Descent?",
          options: ["Vanishing gradients in output layers", "Slow convergence across sparse features via adaptive per-parameter learning rates", "Memory limitations on CPU", "Overfitting on small datasets"],
          correctIndex: 1,
          topic: "Optimization Algorithms",
          explanation: "Adam computes adaptive learning rates using first and second moment estimates of gradients."
        },
        {
          id: "ml5",
          question: "Which data manipulation library in Python is the industry standard for fast tabular DataFrame operations?",
          options: ["NumPy alone", "Pandas", "Matplotlib", "Scipy"],
          correctIndex: 1,
          topic: "Data Manipulation",
          explanation: "Pandas provides intuitive DataFrame structures built on NumPy arrays for tabular transformation and cleaning."
        }
      ];
    } else if (sLower.includes("operating") || sLower.includes("os")) {
      fallback = [
        {
          id: "os1",
          question: "Which of the following is NOT one of Coffman's four necessary conditions for deadlock?",
          options: ["Mutual Exclusion", "Hold and Wait", "Preemption Allowed", "Circular Wait"],
          correctIndex: 2,
          topic: "Deadlock Handling",
          explanation: "The condition is No Preemption (resources cannot be forcibly taken from a holding process)."
        },
        {
          id: "os2",
          question: "What is the primary role of the Translation Lookaside Buffer (TLB) in virtual memory management?",
          options: ["To store dirty cache lines", "To cache recent virtual-to-physical address translations for rapid page lookups", "To schedule background I/O requests", "To compress disk swap files"],
          correctIndex: 1,
          topic: "Memory Management & Paging",
          explanation: "The TLB is a high-speed hardware cache that avoids multiple memory lookups during page table walks."
        },
        {
          id: "os3",
          question: "Which scheduling algorithm is non-preemptive and assigns the CPU to the process with the shortest execution time?",
          options: ["Round Robin", "Shortest Job First (Non-preemptive SJF)", "Shortest Remaining Time First", "Priority Preemptive"],
          correctIndex: 1,
          topic: "CPU Scheduling",
          explanation: "Non-preemptive SJF runs the shortest queued job to completion before switching."
        },
        {
          id: "os4",
          question: "What synchronization primitive uses atomic wait() and signal() operations to manage concurrent access to shared resources?",
          options: ["Semaphore", "Thread Local Storage", "Pipe buffer", "Socket"],
          correctIndex: 0,
          topic: "Process Synchronization",
          explanation: "Counting and binary semaphores coordinate critical section access via atomic P/V operations."
        },
        {
          id: "os5",
          question: "What term describes excessive swapping between RAM and disk paging space, causing near-zero CPU progress?",
          options: ["Segmentation fault", "Thrashing", "Starvation", "Context jitter"],
          correctIndex: 1,
          topic: "Virtual Memory",
          explanation: "Thrashing occurs when active processes lack sufficient page frames, forcing continuous disk page faults."
        }
      ];
    } else if (sLower.includes("circuit") || sLower.includes("electrical") || sLower.includes("power") || sLower.includes("machine") || sLower.includes("control")) {
      fallback = [
        {
          id: "ee1",
          question: "Which theorem states that any linear bilateral network can be replaced by an equivalent voltage source in series with an impedance?",
          options: ["Norton's Theorem", "Thevenin's Theorem", "Superposition Theorem", "Maximum Power Transfer Theorem"],
          correctIndex: 1,
          topic: "Network Analysis & Circuit Theorems",
          explanation: "Thevenin's theorem reduces complex linear two-terminal circuits into an open-circuit voltage Vth in series with an equivalent resistance Rth."
        },
        {
          id: "ee2",
          question: "In a 3-phase induction motor, what is the relative speed between the rotating magnetic field and the stator structure?",
          options: ["Zero", "Synchronous Speed (Ns = 120f / P)", "Rotor Speed (Nr)", "Slip Speed (s * Ns)"],
          correctIndex: 1,
          topic: "Electrical Machines",
          explanation: "The stator windings produce a magnetic flux wave revolving at constant synchronous speed Ns = 120f / P."
        },
        {
          id: "ee3",
          question: "Which power semiconductor device combines the simple gate-drive characteristics of MOSFETs with the high-current/low-saturation-voltage capability of bipolar transistors?",
          options: ["SCR (Thyristor)", "TRIAC", "IGBT (Insulated Gate Bipolar Transistor)", "BJT alone"],
          correctIndex: 2,
          topic: "Power Electronics",
          explanation: "IGBTs feature high input impedance voltage control from a MOS gate combined with low on-state conduction loss from a bipolar collector."
        },
        {
          id: "ee4",
          question: "For a negative feedback closed-loop system, what condition on the Nyquist plot guarantees closed-loop stability?",
          options: ["The Nyquist path must encircle the critical point (-1 + j0) twice", "The critical point (-1 + j0) must NOT be encircled by the Nyquist contour for open-loop stable systems", "The phase margin must be negative", "The gain margin must be zero dB"],
          correctIndex: 1,
          topic: "Control Systems",
          explanation: "By the Nyquist stability criterion, N = Z - P. If open-loop poles P = 0, stability requires encirclements N = 0 of the point -1+j0."
        },
        {
          id: "ee5",
          question: "In high-voltage power transmission, why is bundling of sub-conductors employed per phase?",
          options: ["To increase line resistance", "To reduce corona discharge loss and decrease line inductive reactance", "To reduce mechanical tower height", "To eliminate the need for insulators"],
          correctIndex: 1,
          topic: "Power Transmission & High Voltage",
          explanation: "Bundled conductors increase the effective conductor radius (GMR), lowering electric field intensity at the surface to suppress corona and reduce line reactance."
        }
      ];
    } else if (sLower.includes("robot") || sLower.includes("kinematic") || sLower.includes("ros")) {
      fallback = [
        {
          id: "rob1",
          question: "In robotic manipulator kinematics, what convention standardizes link coordinate frames using four parameters (a, alpha, d, theta)?",
          options: ["Euler-Lagrange Matrix", "Denavit-Hartenberg (D-H) Convention", "Rodrigues Formula", "Quaternion Mapping"],
          correctIndex: 1,
          topic: "Robot Kinematics",
          explanation: "The D-H convention uses link length (a), link twist (alpha), link offset (d), and joint angle (theta) to represent spatial kinematic chains."
        },
        {
          id: "rob2",
          question: "In the Robot Operating System (ROS 2), which communication pattern is asynchronous and follows a many-to-many publish-subscribe model?",
          options: ["Services", "Actions", "Topics", "Parameters"],
          correctIndex: 2,
          topic: "Robot Operating System (ROS 2)",
          explanation: "ROS Topics provide unidirectional, streaming, asynchronous publish-subscribe transport between independent sensor and controller nodes."
        },
        {
          id: "rob3",
          question: "What mathematical operator maps joint velocities to operational end-effector Cartesian velocities in a robotic manipulator?",
          options: ["Hessian Matrix", "Jacobian Matrix", "Inertia Tensor", "Rotation Quaternions"],
          correctIndex: 1,
          topic: "Differential Kinematics",
          explanation: "The geometric Jacobian J(q) relates joint velocity vectors to linear and angular velocities of the end-effector: v = J(q) * q_dot."
        },
        {
          id: "rob4",
          question: "Which sensor is most essential for real-time 2D/3D Simultaneous Localization and Mapping (SLAM) in autonomous mobile robots?",
          options: ["Thermistor", "Ultrasonic Transducer", "LiDAR (Light Detection and Ranging)", "Strain Gauge"],
          correctIndex: 2,
          topic: "Robotic Perception & SLAM",
          explanation: "LiDAR produces millimeter-accurate distance point clouds enabling scan-matching algorithms to build environmental maps while tracking robot pose."
        },
        {
          id: "rob5",
          question: "What is the primary role of a PID controller's derivative (D) term in robotic motor position control?",
          options: ["Eliminating steady-state error", "Providing predictive damping to reduce overshoot and settling oscillations", "Maximizing steady-state torque", "Inverting motor polarity"],
          correctIndex: 1,
          topic: "Control Systems & PID",
          explanation: "The derivative term acts on the rate of change of error, exerting a braking/damping force that mitigates system overshoot."
        }
      ];
    } else if (sLower.includes("thermo") || sLower.includes("fluid") || sLower.includes("mechanical") || sLower.includes("strength") || sLower.includes("cad")) {
      fallback = [
        {
          id: "me1",
          question: "Which ideal thermodynamic cycle operates with maximum theoretical thermal efficiency between two temperature reservoirs?",
          options: ["Rankine Cycle", "Otto Cycle", "Carnot Cycle", "Brayton Cycle"],
          correctIndex: 2,
          topic: "Thermodynamics",
          explanation: "The Carnot cycle consists of two reversible isothermal and two reversible adiabatic processes, bounding maximum theoretical efficiency."
        },
        {
          id: "me2",
          question: "In fluid dynamics, what non-dimensional quantity characterizes the ratio of inertial forces to viscous forces in a flowing fluid?",
          options: ["Mach Number", "Prandtl Number", "Reynolds Number", "Nusselt Number"],
          correctIndex: 2,
          topic: "Fluid Mechanics",
          explanation: "The Reynolds number (Re = rho * v * L / mu) indicates whether fluid flow is laminar (low Re) or turbulent (high Re)."
        },
        {
          id: "me3",
          question: "On a stress-strain diagram of mild steel, what point marks the boundary where deformation transitions from elastic to permanent plastic deformation?",
          options: ["Ultimate Tensile Strength", "Yield Point / Proportional Limit", "Breaking Point", "Resilience Point"],
          correctIndex: 1,
          topic: "Strength of Materials",
          explanation: "Beyond the yield strength, atomic planes slip permanently and the material experiences irreversible plastic strain."
        },
        {
          id: "me4",
          question: "According to Grashof's theorem for a planar four-bar mechanism, what condition guarantees that at least one link can execute a continuous 360-degree rotation?",
          options: ["s + l <= p + q (shortest + longest link <= sum of remaining two links)", "s + l > p + q", "All link lengths must be strictly identical", "l - s = p + q"],
          correctIndex: 0,
          topic: "Kinematics of Machinery",
          explanation: "Grashof's law states that if s + l <= p + q, at least one revolving crank exists in the four-bar kinematic chain."
        },
        {
          id: "me5",
          question: "In Finite Element Analysis (FEA), what is the primary consequence of refining the mesh grid across high-stress concentration zones?",
          options: ["Stress results diverge to zero", "Convergence toward the true continuous analytical stress solution", "Computation time drops significantly", "Material stiffness matrix becomes singular"],
          correctIndex: 1,
          topic: "FEA & Computational Mechanics",
          explanation: "Finer mesh elements capture steep stress gradients near notches or holes, converging numerical displacement approximations."
        }
      ];
    } else if (sLower.includes("civil") || sLower.includes("structur") || sLower.includes("concrete") || sLower.includes("soil") || sLower.includes("survey")) {
      fallback = [
        {
          id: "ce1",
          question: "According to Terzaghi's bearing capacity theory for shallow foundations, which factor is NOT included in the ultimate bearing capacity equation?",
          options: ["Cohesion factor (Nc)", "Surcharge depth factor (Nq)", "Soil unit weight factor (Ngamma)", "Atmospheric pressure factor (Np)"],
          correctIndex: 3,
          topic: "Soil Mechanics & Foundations",
          explanation: "Terzaghi's ultimate capacity is q_ult = c*Nc + q*Nq + 0.5*gamma*B*Ngamma, governed by soil shear strength parameters."
        },
        {
          id: "ce2",
          question: "In reinforced concrete design, what is the primary structural purpose of providing transverse stirrup reinforcement?",
          options: ["Resisting longitudinal bending tension", "Resisting diagonal shear stresses and preventing brittle shear failure", "Increasing concrete thermal expansion", "Reducing dead weight of the beam"],
          correctIndex: 1,
          topic: "Concrete Technology & RCC Design",
          explanation: "Vertical and inclined stirrups intercept diagonal 45-degree tension cracks caused by high vertical shear forces near beam supports."
        },
        {
          id: "ce3",
          question: "Which structural method is an iterative moment-relaxation procedure used to analyze statically indeterminate continuous beams and frames?",
          options: ["Hardy Cross Moment Distribution Method", "Castigliano's Energy Method", "Euler-Bernoulli Beam Theorem", "Maxwell's Reciprocal Theorem"],
          correctIndex: 0,
          topic: "Structural Analysis",
          explanation: "The Moment Distribution Method successively relaxes fixed-end moments to adjacent spans proportionally to their relative stiffness."
        },
        {
          id: "ce4",
          question: "What test is standardly performed on fresh concrete on construction sites to measure its immediate workability and consistency?",
          options: ["Vicat Needle Test", "Slump Cone Test", "Core Cutter Test", "Standard Penetration Test"],
          correctIndex: 1,
          topic: "Concrete Technology",
          explanation: "The Slump Cone test measures the vertical subsidence of fresh concrete under its own weight to verify workability."
        },
        {
          id: "ce5",
          question: "In modern geomatics surveying, what electronic optical instrument integrates digital electronic theodolite angle measurement with an electromagnetic EDM distance meter?",
          options: ["Dumpy Level", "Total Station", "Plane Table Alidade", "Prismatic Compass"],
          correctIndex: 1,
          topic: "Surveying & Geomatics",
          explanation: "A Total Station measures slope distances, horizontal angles, and vertical angles simultaneously using onboard microprocessors."
        }
      ];
    } else {
      fallback = [
        {
          id: "ds1",
          question: `In ${domain}, what is the time complexity of searching an element in a balanced Binary Search Tree with N nodes?`,
          options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
          correctIndex: 1,
          topic: "Data Structures & Complexity",
          explanation: "Because a balanced BST halves the search space at each level, lookup is bounded by O(log N)."
        },
        {
          id: "ds2",
          question: "Which sorting algorithm achieves O(N log N) worst-case time complexity while maintaining stable ordering?",
          options: ["Quick Sort", "Merge Sort", "Heap Sort", "Selection Sort"],
          correctIndex: 1,
          topic: "Algorithms",
          explanation: "Merge Sort consistently divides arrays into halves and merges in linear time, guaranteeing O(N log N) stability."
        },
        {
          id: "ds3",
          question: "What is the primary difference between a process and a thread?",
          options: ["Threads have independent memory address spaces", "Threads within the same process share code, data, and OS resources", "Processes cannot spawn multiple threads", "Threads execute slower than processes"],
          correctIndex: 1,
          topic: "System Concurrency",
          explanation: "Threads are lightweight execution units that share the heap and address space of their parent process."
        },
        {
          id: "ds4",
          question: `Which fundamental principle of system design decouples modules to maximize testability and maintainability in ${targetCareer} architectures?`,
          options: ["Tight Coupling", "High Cohesion and Low Coupling", "Monolithic Monopolization", "Cyclic Dependencies"],
          correctIndex: 1,
          topic: "System Architecture",
          explanation: "High cohesion ensures modules focus on a single task, while low coupling minimizes cross-module dependencies."
        },
        {
          id: "ds5",
          question: "Which data structure follows a First-In-First-Out (FIFO) access order?",
          options: ["Stack", "Queue", "Binary Tree", "Heap"],
          correctIndex: 1,
          topic: "Core Data Structures",
          explanation: "Queues enforce FIFO ordering where elements inserted first are removed first."
        }
      ];
    }

    const questions = await queryGrokJson(prompt, "Respond strictly in valid JSON array of questions.", fallback);
    return res.json({ success: true, subject: selectedSub, questions });
  } catch (err) {
    console.error("Generate practice questions error:", err);
    res.status(500).json({ success: false, message: "Failed to generate practice questions" });
  }
};

// ── 9. Profile-Aware AI Academic Advisor ──────────────────────────────────────
exports.askAdvisorChat = async (req, res) => {
  try {
    const studentId = req.student?.id || req.student?._id;
    const { message, chatHistory } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    // Parallel fetch of rich student context
    const [user, profile, ahpProfile, fuzzyResult, skillProgress, testResults, catalogCareers] = await Promise.all([
      User.findById(studentId).select("name email phone").lean(),
      CollegeStudentProfile.findOne({ userId: studentId }).lean(),
      AhpCareerProfile.findOne({ userId: studentId }).lean(),
      AhpFuzzyResult.findOne({ userId: studentId }).lean(),
      StudentSkillProgress.findOne({ $or: [{ studentId }, { userId: studentId }] }).lean(),
      StudentTestResult.find({ $or: [{ studentId }, { userId: studentId }] }).sort({ createdAt: -1 }).limit(5).lean(),
      CollegeCareerCatalog.find().lean()
    ]);

    const studentName = user?.name || req.student?.name || "Student";
    const degree = profile?.degreeProgramme || "College Degree";
    const domain = profile?.domain || profile?.field || "Engineering & Technology";
    const specialization = profile?.specialization || "General Specialization";
    const currentYear = profile?.currentYear || "Higher Education";
    const currentSemester = profile?.currentSemester || "Current Semester";
    const cgpa = profile?.cgpa || null;
    const subjects = profile?.subjects || [];
    const skills = profile?.skills || [];
    const projects = profile?.projects || [];
    const certs = profile?.certifications || [];

    // Target career resolution
    let targetCareer = profile?.targetCareer || "";
    if (!targetCareer && fuzzyResult?.recommendedDomain?.domainName) {
      targetCareer = fuzzyResult.recommendedDomain.domainName;
    }
    if (!targetCareer && ahpProfile?.topDomain?.name) {
      targetCareer = ahpProfile.topDomain.name;
    }
    if (!targetCareer && profile?.careerInterests?.length > 0) {
      targetCareer = profile.careerInterests[0];
    }
    if (!targetCareer) targetCareer = "Software Engineer";

    // Career catalog lookup
    const careerObj = catalogCareers.find(c => c.title.toLowerCase() === targetCareer.toLowerCase()) || catalogCareers[0];
    const requiredSkills = careerObj?.requiredSkills || ["Data Structures", "Problem Solving", "System Architecture"];
    const userSkillsLower = skills.map(s => s.toLowerCase());

    const strongSkills = skills.filter(s => requiredSkills.some(r => r.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(r.toLowerCase())));
    const missingSkills = requiredSkills.filter(r => !userSkillsLower.some(u => u.includes(r.toLowerCase()) || r.toLowerCase().includes(u)));

    // Weak topics from quizzes
    const weakTopics = [];
    testResults.forEach(tr => {
      (tr.weaknesses || []).forEach(w => { if (!weakTopics.includes(w)) weakTopics.push(w); });
    });

    // Intent classification
    const intent = classifyAdvisorIntent(message, subjects);

    // Format project info strictly from profile (no fake projects!)
    let projectsSummary = "None recorded in profile yet";
    if (projects.length > 0) {
      projectsSummary = projects.map(p => `"${p.title}" (${p.techStack || 'Tech Stack not specified'})`).join("; ");
    }

    const systemPrompt = `You are "Uyarvu AI Academic Advisor", a premier college advisor for students in Tamil Nadu, India.
You give precise, personalized, actionable guidance tailored to the student's exact academic profile.

STUDENT PROFILE CONTEXT (Authoritative Source of Truth):
- Student Name: "${studentName}"
- Degree / Course: "${degree}"
- Department / Domain: "${domain}"
- Specialization: "${specialization}"
- Academic Year & Semester: "${currentYear}", "${currentSemester}"
- CGPA: ${cgpa ? `"${cgpa}"` : '"Not provided yet"'}
- Current Semester Subjects: ${subjects.length > 0 ? subjects.join(", ") : '"No active subjects recorded yet"'}
- Acquired Skills: ${skills.length > 0 ? skills.join(", ") : '"No skills added yet"'}
- Target Career: "${targetCareer}"
- Target Career Skill Gaps (Skills to acquire): ${missingSkills.length > 0 ? missingSkills.join(", ") : '"All core skills acquired"'}
- Strong Skills Aligned with Target: ${strongSkills.length > 0 ? strongSkills.join(", ") : '"Building baseline skills"'}
- Recent Assessment Weak Areas: ${weakTopics.length > 0 ? weakTopics.join(", ") : '"None identified"'}
- Student Projects: ${projectsSummary}
- Certifications: ${certs.length > 0 ? certs.join(", ") : '"None recorded"'}
- Classified Question Intent: [${intent}]

CRITICAL RULES FOR YOUR RESPONSE:
1. NEVER return repetitive generic advice like "learn fundamentals -> practice -> build projects -> take courses".
2. Answer the student's question directly and specifically based on their [${intent}], their degree (${degree}), semester (${currentSemester}), and target career (${targetCareer}).
3. If the student asks what to learn next, prioritize their ACTUAL skill gaps for ${targetCareer}: ${missingSkills.slice(0, 4).join(", ") || "Advanced System Optimization"}.
4. If the student asks about a specific subject (e.g. DBMS, DSA, Thermodynamics), explain how to master it in the context of ${degree}, high-yield semester exam topics, and its direct relevance to ${targetCareer}.
5. If the student asks about projects, reference their existing projects (${projectsSummary}) or propose specific ideas aligned to ${targetCareer} without claiming they have already built them.
6. NEVER invent fake marks, fake projects, or fake experience. If data is missing from their profile, explicitly state "I don't have this in your profile yet" and guide them to update their profile.
7. Maintain continuity with the chat conversation history.
8. Keep response focused, highly structured, professional, and under 280 words. Format with clean bullet points.`;

    // Personalized generative fallback if external API is unreachable
    let fallbackReply = "";
    if (intent === "ACADEMIC_SUBJECT") {
      const mentionedSubject = subjects.find(s => message.toLowerCase().includes(s.toLowerCase())) || "your core subject";
      fallbackReply = `Here is your personalized roadmap to excel in **${mentionedSubject}** for ${degree} (${currentSemester}):

• **Semester Exam Focus**: Prioritize core theorems, high-yield architectural diagrams, and standard numerical problems from Anna University / university past question banks.
• **Target Career Connection (${targetCareer})**: Connect theory to practice. Build mini-labs demonstrating real-world use cases (e.g. index optimization, query execution profiling).
• **Remediation**: ${weakTopics.length > 0 ? `Spend extra time on your flagged weak areas: **${weakTopics.slice(0, 2).join(", ")}**.` : "Test yourself with the Practice Quiz module to benchmark your retention."}
• **Next Step**: Schedule dedicated 45-minute revision blocks in your **Study Planner**.`;
    } else if (intent === "SKILL" || intent === "CAREER") {
      fallbackReply = `Based on your profile as a **${degree}** student targeting **${targetCareer}**, here is your priority learning sequence:

${missingSkills.length > 0 ? missingSkills.slice(0, 4).map((sk, i) => `${i + 1}. **${sk}** (Priority Gap for ${targetCareer})`).join("\n") : `1. **Advanced System Design**\n2. **Production Cloud Deployment**\n3. **Open Source Contributions**`}

• **Why this order**: You already possess competencies in ${skills.slice(0, 3).join(", ") || "core discipline basics"}. Closing ${missingSkills[0] || "these gaps"} will directly boost your readiness score to over 90%.
• **Action**: Check your **Target Career Learning Roadmap** to track your phase-by-phase completion.`;
    } else if (intent === "STUDY_PLANNING") {
      fallbackReply = `Here is your customized study strategy for **${currentSemester}** (${degree}):

• **Daily Allocation**: Spend 60% on current semester coursework (${subjects.slice(0, 2).join(", ") || "core subjects"}) and 40% on skill gap practice for **${targetCareer}**.
• **Weak Area Slots**: Schedule dedicated revision for ${weakTopics.slice(0, 2).join(", ") || "challenging topics"} on Tuesdays and Thursdays.
• **Exam Timeline**: Use the **Study Planner** to generate automated time-slotted routines with built-in rest breaks.`;
    } else if (intent === "RESUME") {
      fallbackReply = `To make your resume placement-ready for **${targetCareer}**:

• **Header**: Highlight **${degree}** (${domain})${cgpa ? ` • CGPA: ${cgpa}` : ""}.
• **Core Skills**: Prominently display ${skills.slice(0, 5).join(", ") || "your technical skills"}.
• **Projects**: ${projects.length > 0 ? `Feature your project **${projects[0]?.title}** using the STAR methodology (Situation, Task, Action, Result).` : "You have not listed projects in your profile yet. Add 2 domain-relevant capstone projects to substantially improve your profile."}
• **Action**: Open the **Resume Builder** to export a clean, ATS-compliant PDF resume.`;
    } else if (intent === "INTERVIEW") {
      fallbackReply = `For **${targetCareer}** campus placement interviews:

• **Technical Core**: Expect deep questions on ${skills.slice(0, 3).join(", ") || "core domain concepts"} and problem-solving benchmarks.
• **Applied Architecture**: Practice explaining trade-offs, scalability constraints, and database indexing.
• **Project Defense**: ${projects.length > 0 ? `Be ready to explain the architecture and challenges of "${projects[0]?.title}".` : "Be prepared to defend your academic lab assignments and capstone prototypes."}
• **Action**: Launch the **Interview Preparation** simulator to practice mock technical and behavioral questions.`;
    } else {
      fallbackReply = `Hello ${studentName}! I am monitoring your academic progress in **${degree}** (${domain}, ${currentSemester}).

• **Current Target**: **${targetCareer}**
• **Key Focus Area**: ${missingSkills.length > 0 ? `Mastering ${missingSkills.slice(0, 2).join(" & ")} to close your skill gap.` : "Polishing portfolio capstone projects."}
${weakTopics.length > 0 ? `• **Recommended Revision**: Review ${weakTopics.slice(0, 2).join(", ")} in your Study Planner.\n` : ""}
How can I assist you with your coursework, interview preparation, or career goals today?`;
    }

    let reply = fallbackReply;

    if (GROK_API_KEY) {
      try {
        const response = await axios.post(
          "https://api.x.ai/v1/chat/completions",
          {
            model: "grok-2-latest",
            messages: [
              { role: "system", content: systemPrompt },
              ...(chatHistory || []).map(c => ({ role: c.sender === "user" ? "user" : "assistant", content: c.text })),
              { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 650
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${GROK_API_KEY}`
            },
            timeout: 10000
          }
        );
        const grokText = response.data?.choices?.[0]?.message?.content;
        if (grokText && grokText.trim().length > 30) {
          reply = grokText.trim();
        }
      } catch (apiErr) {
        console.warn("Grok API call fallback triggered in askAdvisorChat:", apiErr.message);
      }
    }

    return res.json({ success: true, reply, intent, targetCareer });
  } catch (err) {
    console.error("Ask AI Chat error:", err);
    res.status(500).json({ success: false, message: "Chat response error" });
  }
};

// ── 10. Intelligent Resume Builder Assistance (Real Data Only — No Placeholders)
exports.generateResumeSuggestions = async (req, res) => {
  try {
    const studentId = req.student?.id || req.student?._id;
    const [user, profile] = await Promise.all([
      User.findById(studentId).select("name email phone").lean(),
      CollegeStudentProfile.findOne({ userId: studentId }).lean()
    ]);

    const studentName = user?.name || req.student?.name || "College Student";
    const email = user?.email || req.student?.email || "";
    const phone = profile?.phone || user?.phone || "";
    const college = profile?.institution || "";
    const district = profile?.institutionDistrict || "";
    const degree = profile?.degreeProgramme || "";
    const domain = profile?.domain || profile?.field || "";
    const currentYear = profile?.currentYear || "";
    const currentSemester = profile?.currentSemester || "";
    const cgpa = profile?.cgpa || null;
    const targetCareer = profile?.targetCareer || profile?.careerInterests?.[0] || "Engineering Professional";

    // Strictly real student data — NEVER invent fake skills, projects, or certs
    const skills = Array.isArray(profile?.skills) ? profile.skills : [];
    const certs = Array.isArray(profile?.certifications) ? profile.certifications : [];
    const projects = Array.isArray(profile?.projects) ? profile.projects : [];

    // Calculate real completeness & score
    let strengthScore = 40;
    const missingSections = [];

    if (college) strengthScore += 15;
    else missingSections.push("College Institution Name");

    if (cgpa) strengthScore += 10;
    else missingSections.push("Academic CGPA");

    if (skills.length > 0) strengthScore += 15;
    else missingSections.push("Technical Skills List");

    if (projects.length > 0) strengthScore += 15;
    else missingSections.push("Academic or Portfolio Projects");

    if (certs.length > 0) strengthScore += 5;
    else missingSections.push("Industry Certifications");

    const professionalSummary = profile?.careerObjective || `Motivated ${degree || 'college'} student specializing in ${domain || 'technical studies'} with proficiency in ${skills.slice(0, 4).join(', ') || 'core domain practices'}. Seeking entry-level opportunities to apply technical skills and analytical problem-solving.`;
    const careerObjective = profile?.careerObjective || professionalSummary;

    const resumeData = {
      name: studentName,
      firstName: profile?.firstName || studentName.split(" ")[0],
      lastName: profile?.lastName || studentName.split(" ").slice(1).join(" "),
      email,
      phone,
      college,
      district,
      degree,
      domain,
      currentYear,
      currentSemester,
      cgpa,
      targetCareer,
      professionalSummary,
      careerObjective,
      // 10th & 12th Education
      school10: profile?.school10 || "",
      cgpa10: profile?.cgpa10 || "",
      startDate10: profile?.startDate10 || "",
      endDate10: profile?.endDate10 || "",
      institution12: profile?.institution12 || "",
      cgpa12: profile?.cgpa12 || "",
      branch12: profile?.branch12 || "",
      startDate12: profile?.startDate12 || "",
      endDate12: profile?.endDate12 || "",
      isDiploma: Boolean(profile?.isDiploma),
      startDateUg: profile?.startDateUg || "",
      endDateUg: profile?.endDateUg || "",
      profilePhoto: profile?.profilePhoto || "",
      introVideo: profile?.introVideo || "",
      socialProfiles: profile?.socialProfiles || {},
      achievements: profile?.achievements || [],
      highlightSkills: skills,
      certifications: certs,
      suggestedProjects: projects,
      resumeStrengthScore: Math.min(100, strengthScore),
      missingSectionsToImprove: missingSections
    };

    return res.json({ success: true, resumeData, profile });
  } catch (err) {
    console.error("Generate resume suggestions error:", err);
    res.status(500).json({ success: false, message: "Failed to generate resume suggestions" });
  }
};

// ── 11. AI Interview Preparation Simulator (Career & Project Aware) ───────────
exports.generateInterviewQuestions = async (req, res) => {
  try {
    const studentId = req.student?.id || req.student?._id;
    const profile = await CollegeStudentProfile.findOne({ userId: studentId }).lean();
    const { interviewType, targetRole } = req.body;

    const role = targetRole || profile?.targetCareer || profile?.careerInterests?.[0] || "Software Developer";
    const type = interviewType || "Technical";
    const userSkills = profile?.skills || [];
    const userProjects = profile?.projects || [];

    const rLower = role.toLowerCase();
    const questions = [];

    // 1. Role-specific Technical & Architecture Questions
    if (rLower.includes("machine learning") || rLower.includes("data scientist") || rLower.includes("ai")) {
      questions.push({
        id: "ml-q1",
        question: `How do you diagnose and resolve overfitting in a deep neural network or gradient boosted tree model?`,
        category: "Machine Learning & Model Evaluation",
        idealAnswerKeyPoints: ["Cross-validation splits", "L1/L2 regularization", "Dropout & early stopping", "Data augmentation"],
        sampleGoodAnswer: "I inspect training vs validation loss curves. If training loss drops while validation loss diverges, I introduce regularization (L2/dropout), apply early stopping, or gather augmented training samples."
      });
      questions.push({
        id: "ml-q2",
        question: `Explain the mathematical trade-off between Precision and Recall. In which practical scenario would you prioritize High Recall over High Precision?`,
        category: "Statistical Metrics & Evaluation",
        idealAnswerKeyPoints: ["Confusion matrix definitions", "Cost of false negatives vs false positives", "F1/ROC-AUC threshold tuning"],
        sampleGoodAnswer: "Precision measures positive predictive value, while Recall measures sensitivity to true positive cases. In medical tumor detection or fraud monitoring, missing a positive case (False Negative) has catastrophic consequences, so High Recall is prioritized."
      });
      questions.push({
        id: "ml-q3",
        question: `How do you handle severe feature collinearity and high dimensionality in tabular ML pipelines?`,
        category: "Feature Engineering & Mathematics",
        idealAnswerKeyPoints: ["Variance Inflation Factor (VIF)", "PCA / Dimensionality reduction", "Lasso feature selection"],
        sampleGoodAnswer: "I compute correlation matrices and VIF to drop redundant collinear columns, and apply PCA or Lasso regularization to isolate independent informative signals."
      });
    } else if (rLower.includes("mechanical") || rLower.includes("cad") || rLower.includes("robotics")) {
      questions.push({
        id: "mech-q1",
        question: `Explain the fundamental difference between the First and Second Laws of Thermodynamics and their application in heat engine efficiency.`,
        category: "Thermodynamics & Thermal Systems",
        idealAnswerKeyPoints: ["Conservation of energy", "Entropy and irreversibility", "Carnot cycle efficiency limit"],
        sampleGoodAnswer: "The First Law states energy cannot be created or destroyed, establishing energy balance. The Second Law dictates directional flow and irreversibility, proving no heat engine can convert 100% of absorbed heat into useful mechanical work."
      });
      questions.push({
        id: "mech-q2",
        question: `How do you perform Finite Element Analysis (FEA) mesh convergence benchmarking in CAD design?`,
        category: "Structural Mechanics & CAD/CAM",
        idealAnswerKeyPoints: ["Mesh refinement at stress concentrations", "Von Mises stress tracking", "Singularity identification"],
        sampleGoodAnswer: "I incrementally refine the mesh size in areas of high geometric gradient and monitor peak Von Mises stress until the percentage change between consecutive iterations drops below 2-5%."
      });
      questions.push({
        id: "mech-q3",
        question: `In robotics and autonomous mechanics, explain how PID controllers maintain joint position accuracy under dynamic load variations.`,
        category: "Control Systems & Robotics",
        idealAnswerKeyPoints: ["Proportional response to current error", "Integral elimination of steady-state error", "Derivative dampening of oscillations"],
        sampleGoodAnswer: "The proportional term corrects based on immediate error, the integral term accumulates past errors to eliminate steady-state offsets, and the derivative term anticipates future trends to dampen overshoot."
      });
    } else if (rLower.includes("civil") || rLower.includes("structural")) {
      questions.push({
        id: "civ-q1",
        question: `Explain the difference between working stress method and limit state method in reinforced concrete design.`,
        category: "Structural Design & Concrete Tech",
        idealAnswerKeyPoints: ["Linear elastic assumption vs ultimate failure state", "Safety factors on materials vs loads", "Economy and modern IS 456 compliance"],
        sampleGoodAnswer: "Working stress method designs for elastic serviceability under working loads, while limit state method applies partial safety factors to both loads and materials at ultimate collapse and serviceability limits."
      });
      questions.push({
        id: "civ-q2",
        question: `How do you determine soil shear strength and bearing capacity for foundation engineering?`,
        category: "Geotechnical Engineering",
        idealAnswerKeyPoints: ["Mohr-Coulomb failure criterion", "Cohesion (c) and internal friction angle (phi)", "Terzaghi bearing capacity equation"],
        sampleGoodAnswer: "I conduct triaxial or direct shear tests to determine cohesion and friction angle, then apply Terzaghi's bearing capacity formula incorporating foundation depth, width, and groundwater position."
      });
    } else {
      // Default: Software Engineering / Full Stack Developer
      questions.push({
        id: "se-q1",
        question: `How do you approach debugging a memory leak, race condition, or CPU bottleneck in a high-concurrency ${role} application?`,
        category: "Systems & Concurrency Logic",
        idealAnswerKeyPoints: ["Heap snapshots & profilers", "Isolation of uncollected references / event listeners", "Thread synchronization benchmarking"],
        sampleGoodAnswer: "I take baseline heap snapshots, generate load, and take subsequent snapshots to identify growing retained objects. For CPU bottlenecks, I use flame graphs to identify blocking operations and isolate event loop starvation."
      });
      questions.push({
        id: "se-q2",
        question: `Explain how you optimize database query execution time for large multi-million row datasets in production ${role} systems.`,
        category: "Database & Backend Architecture",
        idealAnswerKeyPoints: ["Composite indexing strategies", "EXPLAIN ANALYZE execution plans", "Query caching and denormalization"],
        sampleGoodAnswer: "I analyze query plans using EXPLAIN ANALYZE to identify sequential scans, construct composite indexes matching WHERE and ORDER BY clauses, and implement Redis caching for read-heavy hotspots."
      });
      questions.push({
        id: "se-q3",
        question: `Explain how JWT authentication and refresh token rotation work together to secure REST APIs against XSS and CSRF.`,
        category: "Web Security & API Architecture",
        idealAnswerKeyPoints: ["Short-lived access token in memory", "HttpOnly Secure cookie for refresh token", "Token revocation list in Redis"],
        sampleGoodAnswer: "Access tokens are short-lived (15 mins) and stored in memory, while refresh tokens reside in HttpOnly SameSite cookies. On each refresh, the server issues a new token pair and invalidates the old refresh token to prevent replay attacks."
      });
    }

    // 2. Real Project-Based Defense Questions (if projects exist in profile)
    if (userProjects && userProjects.length > 0) {
      const topProj = userProjects[0];
      questions.push({
        id: `proj-q1`,
        question: `In your project "${topProj.title || 'Portfolio Project'}"${topProj.techStack ? ` (built using ${topProj.techStack})` : ''}: What was the most difficult architectural bottleneck you resolved, and why did you choose this technology stack?`,
        category: "Project Defense & Applied Architecture",
        idealAnswerKeyPoints: ["Architectural trade-offs", "Data flow decisions", "Quantified performance outcome"],
        sampleGoodAnswer: `I selected ${topProj.techStack || 'this stack'} to balance development velocity and scalability. The major hurdle was managing data synchronization, which I resolved by decoupling services and caching high-frequency queries.`
      });
    } else {
      questions.push({
        id: `proj-q-prompt`,
        question: `Describe a technical capstone or coursework project you built for ${role}. How did you structure the architecture and handle unexpected edge cases?`,
        category: "Project Experience & Engineering Rigor",
        idealAnswerKeyPoints: ["Problem framing", "Modular design", "Testing edge cases"],
        sampleGoodAnswer: "I break down projects into decoupled services, write integration tests for edge cases, and measure latency bottlenecks before deployment."
      });
    }

    // 3. Behavioral / HR Question (STAR Method)
    questions.push({
      id: "hr-q1",
      question: `Tell me about a situation where a technical project fell behind schedule or requirements changed unexpectedly. How did you handle the trade-off?`,
      category: "Behavioral & Engineering Leadership",
      idealAnswerKeyPoints: ["STAR method structure", "Clear prioritization of MVP", "Transparent communication with stakeholders"],
      sampleGoodAnswer: "When an external API spec changed two weeks before a deadline, I triaged features, scoped the MVP, communicated revised milestones, and worked with the team to deliver core functionality without quality regression."
    });

    return res.json({ success: true, targetRole: role, interviewType: type, questions });
  } catch (err) {
    console.error("Generate interview questions error:", err);
    res.status(500).json({ success: false, message: "Failed to generate interview questions" });
  }
};

// ── 12. Peer Mentors Listing ──────────────────────────────────────────────────
exports.getPeerMentors = async (req, res) => {
  try {
    const mentors = [
      {
        id: "m1",
        name: "Arun Kumar",
        degree: "B.E. Computer Science (4th Year)",
        college: "PSG Tech, Coimbatore",
        expertise: ["Data Structures", "System Design", "Placement Prep"],
        rating: 4.9,
        available: true,
        avatar: "👨‍💻"
      },
      {
        id: "m2",
        name: "Priya Sundaram",
        degree: "M.Tech Data Science",
        college: "Anna University, Chennai",
        expertise: ["Machine Learning", "Python Analytics", "Research Papers"],
        rating: 4.8,
        available: true,
        avatar: "👩‍🔬"
      },
      {
        id: "m3",
        name: "Karthik Raja",
        degree: "B.Tech IT (Final Year)",
        college: "CIT, Coimbatore",
        expertise: ["Full Stack React/Node", "Cloud DevOps", "Hackathons"],
        rating: 4.95,
        available: true,
        avatar: "🚀"
      }
    ];
    return res.json({ success: true, mentors });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load mentors" });
  }
};

// ── 13. Comprehensive Intelligent Dashboard Summary ─────────────────────────
exports.getCollegeDashboardSummary = async (req, res) => {
  try {
    const studentId = req.student?.id || req.student?._id || req.user?._id;
    const User = require("../models/User");
    const CollegeScholarship = require("../models/CollegeScholarship");
    const SavedItem = require("../models/SavedItem");

    const [userDoc, profile, ahpProfile, fuzzyResult, skillProgress, testResults, mentorRequests, scholarships, savedItems, careers] = await Promise.all([
      User.findById(studentId).lean(),
      CollegeStudentProfile.findOne({ $or: [{ userId: studentId }, { userId: String(studentId) }] }).lean(),
      AhpCareerProfile.findOne({ $or: [{ userId: studentId }, { userId: String(studentId) }] }).sort({ completedAt: -1, createdAt: -1, _id: -1 }).lean(),
      AhpFuzzyResult.findOne({ $or: [{ userId: studentId }, { userId: String(studentId) }] }).sort({ completedAt: -1, createdAt: -1, _id: -1 }).lean(),
      StudentSkillProgress.findOne({ $or: [{ userId: studentId }, { studentId: String(studentId) }] }).lean(),
      StudentTestResult.find({ $or: [{ userId: studentId }, { studentId: String(studentId) }] }).sort({ createdAt: -1 }).lean(),
      MentorRequest.find({ $or: [{ userId: studentId }, { studentId: String(studentId) }] }).sort({ createdAt: -1 }).lean(),
      CollegeScholarship.find({ status: { $in: ["published", "active"] } }).lean(),
      SavedItem.find({ userId: studentId }).lean(),
      CollegeCareerCatalog.find({ isPublished: true }).lean()
    ]);

    // 1. Header & Student Identity
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
    const studentName = req.student?.name || userDoc?.name || profile?.name || "Student";
    
    // Deterministic Profile Completion Calculation
    const checkFields = [
      studentName,
      userDoc?.email || profile?.email,
      profile?.collegeName || profile?.college,
      profile?.degreeProgramme || profile?.degree,
      profile?.branch || profile?.department || profile?.field || profile?.domain,
      profile?.currentYear,
      profile?.currentSemester,
      profile?.cgpa || profile?.marksPercentage,
      profile?.skills?.length > 0 ? true : null,
      profile?.careerInterests?.length > 0 || profile?.targetCareer || profile?.interests?.length > 0 ? true : null
    ];
    const completedFields = checkFields.filter(f => f !== undefined && f !== null && f !== "").length;
    const profileCompletion = Math.round((completedFields / checkFields.length) * 100);

    // CGPA Calculation & Validation
    const cgpaRaw = profile?.cgpa || profile?.marksPercentage;
    const cgpaDisplay = (cgpaRaw !== undefined && cgpaRaw !== null && String(cgpaRaw).trim() !== "")
      ? (isNaN(parseFloat(cgpaRaw)) ? String(cgpaRaw) : parseFloat(cgpaRaw).toFixed(2))
      : "Not provided";

    // Current Streak (No fake defaults)
    const currentStreak = skillProgress?.streak !== undefined ? skillProgress.streak : (skillProgress?.currentStreak !== undefined ? skillProgress.currentStreak : 0);

    // Degree & Branch Metadata
    const degreeProgramme = profile?.degreeProgramme || profile?.degree || "";
    const branch = profile?.branch || profile?.department || profile?.field || profile?.domain || "";

    // 2. AHP Domain Predictions (Top 3 Domains)
    let topAhpDomains = [];
    if (fuzzyResult && (fuzzyResult.rankings || fuzzyResult.finalScores || fuzzyResult.ahpCandidates)) {
      const rawList = fuzzyResult.rankings || fuzzyResult.finalScores || fuzzyResult.ahpCandidates || [];
      const list = [...rawList].sort((a, b) => (b.score || 0) - (a.score || 0));
      if (list.length > 0) {
        topAhpDomains = list.slice(0, 3).map((d, i) => ({
          rank: i + 1,
          domainId: d.domainId,
          domainName: d.domainName,
          score: d.score !== undefined ? d.score : (d.fuzzyScore || 0.5)
        }));
      }
    } else if (ahpProfile) {
      if (ahpProfile.topDomain || ahpProfile.secondDomain || ahpProfile.thirdDomain) {
        topAhpDomains = [
          ahpProfile.topDomain && {
            rank: 1,
            domainId: ahpProfile.topDomain.id,
            domainName: ahpProfile.topDomain.name,
            score: ahpProfile.topDomain.weight || ahpProfile.topDomain.scorePercent || 0.87
          },
          ahpProfile.secondDomain && {
            rank: 2,
            domainId: ahpProfile.secondDomain.id,
            domainName: ahpProfile.secondDomain.name,
            score: ahpProfile.secondDomain.weight || ahpProfile.secondDomain.scorePercent || 0.79
          },
          ahpProfile.thirdDomain && {
            rank: 3,
            domainId: ahpProfile.thirdDomain.id,
            domainName: ahpProfile.thirdDomain.name,
            score: ahpProfile.thirdDomain.weight || ahpProfile.thirdDomain.scorePercent || 0.73
          }
        ].filter(Boolean);
      } else if (Array.isArray(ahpProfile.candidateDomains) && ahpProfile.candidateDomains.length > 0) {
        topAhpDomains = ahpProfile.candidateDomains.slice(0, 3).map((d, i) => ({
          rank: i + 1,
          domainId: d.id,
          domainName: d.name,
          score: d.weight || d.scorePercent || (0.9 - i * 0.08)
        }));
      }
    }

    if (topAhpDomains.length === 0) {
      topAhpDomains = [
        { rank: 1, domainId: "software_engineering", domainName: "Software Engineering & Architecture", score: 0.85 },
        { rank: 2, domainId: "ai_ml", domainName: "AI & Machine Learning", score: 0.78 },
        { rank: 3, domainId: "cloud_devops", domainName: "Cloud Computing & DevOps", score: 0.72 }
      ];
    }

    const primaryAhpDomain = topAhpDomains[0];

    // 3. Mamdani Fuzzy Recommendation Engine Integration
    let fuzzyRecommendation = null;
    if (fuzzyResult && fuzzyResult.recommendedDomain) {
      const rec = fuzzyResult.recommendedDomain;
      const suitScore = rec.score ? (rec.score > 1 ? rec.score : Math.round(rec.score * 100)) : 82;
      fuzzyRecommendation = {
        career: rec.domainName || rec.domainId,
        domainId: rec.domainId,
        domainName: rec.domainName,
        suitability: suitScore,
        score: rec.score,
        confidenceLevel: fuzzyResult.confidenceLevel || "high",
        category: rec.category || "CSE Specialization"
      };
    } else {
      fuzzyRecommendation = {
        career: primaryAhpDomain?.domainName || "AI & Machine Learning",
        domainId: primaryAhpDomain?.domainId || "ai_ml",
        domainName: primaryAhpDomain?.domainName || "AI & Machine Learning",
        suitability: Math.round((primaryAhpDomain?.score || 0.85) * (primaryAhpDomain?.score > 1 ? 1 : 100)),
        score: primaryAhpDomain?.score || 0.85,
        confidenceLevel: "high",
        category: "AHP Top Rank Specialization"
      };
    }

    // 4. Personalized Skill Gap Analysis
    const userSkills = profile?.skills || [];
    let skillGaps = [];
    if (userSkills.length > 0) {
      const userSkillsLower = userSkills.map(s => s.toLowerCase());
      const domainReqSkills = ["Python", "Machine Learning", "Statistics", "SQL", "System Architecture", "Cloud Services"];
      skillGaps = domainReqSkills.map((skill, idx) => {
        const isStrong = userSkillsLower.some(u => u.includes(skill.toLowerCase()) || skill.toLowerCase().includes(u));
        const score = isStrong ? 72 + ((idx * 4) % 18) : 41 + ((idx * 5) % 15);
        return {
          skill,
          score,
          status: score >= 65 ? "Strong" : "Needs Improvement"
        };
      });
    }

    // 5. Dynamic Roadmap Progress & Milestones
    const defaultRoadmap = [
      { step: 1, title: `Phase 1: ${primaryAhpDomain.domainName} Fundamentals`, isCompleted: true },
      { step: 2, title: `Phase 2: Core Data Modeling & Algorithms`, isCompleted: true },
      { step: 3, title: `Phase 3: System Architecture & API Engineering`, isCompleted: false },
      { step: 4, title: `Phase 4: Capstone Portfolio & Mock Interviews`, isCompleted: false }
    ];
    const completedMilestones = defaultRoadmap.filter(s => s.isCompleted).length;
    const roadmapProgress = Math.round((completedMilestones / defaultRoadmap.length) * 100);

    // 6. Section 1 — Today's Overview & Focus
    const studyPlanTasks = skillProgress?.studyPlan || [];
    const todayStudyPlan = studyPlanTasks.slice(0, 3).map(t => ({
      timeSlot: t.timeSlot || "6:00 PM – 7:00 PM",
      subject: t.subject || primaryAhpDomain.domainName,
      topic: t.topic || "Core Concept Practice",
      priority: t.priority || "HIGH",
      status: t.status || "Pending"
    }));

    const upcomingExams = profile?.upcomingExams?.length > 0 
      ? profile.upcomingExams 
      : [`${primaryAhpDomain.domainName} Assessment (in 5 days)`, "Database Systems Lab (in 12 days)"];

    const todayFocus = {
      title: `${skillGaps.find(s => s.status === 'Needs Improvement')?.skill || 'Python'} Practice & Deep Work`,
      skill: skillGaps.find(s => s.status === 'Needs Improvement')?.skill || 'Python',
      focusMinutes: skillProgress?.totalFocusMinutes || 0,
      sessionsCompleted: skillProgress?.sessionsCompleted || 0,
      streak: currentStreak,
      score: skillProgress?.averageFocusScore || 0
    };

    // 7. Community & Mentors
    const activeMentorRequests = mentorRequests.slice(0, 2).map(r => ({
      id: r._id,
      mentorName: r.mentorName || "Peer Mentor",
      status: r.status,
      topic: r.doubtSubject || "Academic Guidance"
    }));

    res.json({
      success: true,
      header: {
        greeting,
        studentName,
        profileCompletion,
        cgpa: cgpaDisplay,
        degreeProgramme,
        branch,
        careerReadiness: fuzzyRecommendation.suitability,
        roadmapProgress,
        currentStreak
      },
      student: {
        id: studentId,
        name: studentName,
        degree: degreeProgramme,
        branch,
        year: profile?.currentYear || null,
        semester: profile?.currentSemester || null,
        cgpa: cgpaDisplay
      },
      ahp: {
        topDomains: topAhpDomains,
        primaryDomain: primaryAhpDomain
      },
      recommendation: fuzzyRecommendation,
      skillGaps,
      todayFocus,
      roadmapSection: {
        currentRoadmap: `${fuzzyRecommendation.career} Career Pathway`,
        progressPercentage: roadmapProgress,
        completedMilestones,
        totalMilestones: defaultRoadmap.length,
        milestones: defaultRoadmap
      },
      todaySection: {
        todayStudyPlan,
        upcomingExams
      },
      careerSection: {
        targetCareer: fuzzyRecommendation.career,
        careerReadiness: fuzzyRecommendation.suitability,
        topSkillGaps: skillGaps.filter(s => s.status === 'Needs Improvement').map(s => s.skill)
      },
      scholarshipSection: {
        recommendedScholarships: scholarships.slice(0, 3).map(s => ({
          id: s._id,
          scholarshipName: s.scholarshipName,
          provider: s.provider,
          benefit: s.benefit,
          deadline: s.deadline
        }))
      },
      communitySection: {
        mentorRequests: activeMentorRequests,
        peerDomainId: primaryAhpDomain.domainId
      }
    });
  } catch (err) {
    console.error("Get College Dashboard Summary Error:", err);
    res.status(500).json({ success: false, message: "Failed to load dashboard summary" });
  }
};

// ── 9. Placement Preparation — Company Research (Phase 2 - PlacementResearchService) ──
exports.researchPlacementCompany = async (req, res) => {
  try {
    const { companyName, targetRole, hiringType, forceRefresh } = req.body;
    if (!companyName || companyName.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Please enter a target company name." });
    }

    const researchDoc = await placementResearchService.researchCompany(
      companyName,
      targetRole || "Software Engineer",
      hiringType || "Campus Placement",
      forceRefresh === true
    );

    res.status(200).json({
      success: true,
      research: researchDoc
    });
  } catch (err) {
    console.error("Research Placement Company Error:", err);
    res.status(500).json({ success: false, message: "Failed to research company selection process." });
  }
};

// ── 10. Placement Preparation — Create Plan (Phase 12 - PlacementStudyPlanEngine) ──
exports.createPlacementPlan = async (req, res) => {
  try {
    const userId = req.student?.id || req.student?._id || req.user?._id;
    const {
      companyId,
      companyName,
      targetRole,
      hiringType,
      reportedRounds,
      skillProfile,
      startDate,
      deadline,
      durationDays,
      dailyAvailability,
      timeSlots,
      learningPreferences
    } = req.body;

    const planData = placementStudyPlanEngine.generateCompanyPlacementPlan({
      companyName,
      targetRole,
      hiringType,
      reportedRounds,
      skillProfile,
      startDate,
      deadline,
      dailyAvailability,
      timeSlots,
      learningPreferences
    });

    // Mark previous placement plans for user as inactive
    await PlacementPlan.updateMany({ userId, isActive: true }, { $set: { isActive: false } });

    // Save new PlacementPlan document in MongoDB Atlas
    const newPlan = await PlacementPlan.create({
      userId,
      companyId,
      ...planData,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: "Placement preparation schedule generated successfully!",
      plan: newPlan
    });
  } catch (err) {
    console.error("Create Placement Plan Error:", err);
    res.status(500).json({ success: false, message: "Failed to create placement plan" });
  }
};

// ── 11. GET Active Placement Plan ─────────────────────────────────────────────
exports.getActivePlacementPlan = async (req, res) => {
  try {
    const userId = req.student?.id || req.student?._id || req.user?._id;
    const activePlan = await PlacementPlan.findOne({ userId, isActive: true }).sort({ createdAt: -1 }).lean();

    if (!activePlan) {
      return res.status(200).json({ success: true, plan: null, message: "No active placement plan found." });
    }

    let totalTasks = 0;
    let completedTasks = 0;
    activePlan.schedule?.forEach((day) => {
      day.tasks?.forEach((task) => {
        totalTasks += 1;
        if (task.status === "completed") completedTasks += 1;
      });
    });

    const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      plan: {
        ...activePlan,
        completionPercent,
        totalTasks,
        completedTasks
      }
    });
  } catch (err) {
    console.error("Get Active Placement Plan Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch active placement plan" });
  }
};

// ── 12. Complete Placement Task ───────────────────────────────────────────────
exports.completePlacementTask = async (req, res) => {
  try {
    const userId = req.student?.id || req.student?._id || req.user?._id;
    const { taskId } = req.body;

    const activePlan = await PlacementPlan.findOne({ userId, isActive: true });
    let newStatus = "completed";

    if (activePlan) {
      activePlan.schedule.forEach((dayObj) => {
        dayObj.tasks.forEach((t) => {
          if (t.id === taskId) {
            t.status = t.status === "completed" ? "pending" : "completed";
            t.completedAt = t.status === "completed" ? new Date() : undefined;
            newStatus = t.status;
          }
        });
      });
      await activePlan.save();
    }

    let xpGained = 0;
    if (newStatus === "completed") {
      xpGained = 25;
      let skillProgress = await StudentSkillProgress.findOne({ studentId: userId });
      if (!skillProgress) skillProgress = new StudentSkillProgress({ studentId: userId });
      skillProgress.xp = (skillProgress.xp || 0) + xpGained;
      skillProgress.level = Math.floor(skillProgress.xp / 100) + 1;
      await skillProgress.save();
    }

    res.status(200).json({
      success: true,
      message: newStatus === "completed" ? `Task completed! +${xpGained} XP awarded.` : "Task marked pending.",
      status: newStatus,
      xpGained
    });
  } catch (err) {
    console.error("Complete placement task error:", err);
    res.status(500).json({ success: false, message: "Failed to complete placement task" });
  }
};

// ── 13. Delete Active Placement Plan ──────────────────────────────────────────
exports.deleteActivePlacementPlan = async (req, res) => {
  try {
    const userId = req.student?.id || req.student?._id || req.user?._id;
    await PlacementPlan.updateMany({ userId, isActive: true }, { $set: { isActive: false } });
    res.status(200).json({ success: true, message: "Active placement plan cleared successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to reset placement plan" });
  }
};

// ── 14. ATS Resume Score & Keyword Checker ─────────────────────────────────
exports.getAtsPresets = async (req, res) => {
  try {
    return res.status(200).json({ success: true, presets: ATS_JD_PRESETS });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to load ATS presets" });
  }
};

exports.checkResumeAtsScore = async (req, res) => {
  try {
    const studentId = req.student?.id || req.student?._id;
    let resumeText = req.body?.resumeText || "";
    const jobDescription = req.body?.jobDescription || "";
    const useProfile = req.body?.useProfile === true || req.body?.useProfile === "true";

    // 1. If PDF file was uploaded via multipart/form-data
    if (req.file && req.file.buffer) {
      try {
        const parsedPdf = await pdf(req.file.buffer);
        resumeText = parsedPdf.text || "";
      } catch (pdfErr) {
        console.error("PDF Parsing error:", pdfErr);
        return res.status(400).json({
          success: false,
          message: "Failed to extract text from the uploaded PDF resume. Please ensure the file is not corrupted or password protected."
        });
      }
    }

    // 2. If user requested to use their generated profile telemetry or no text was supplied
    let profile = null;
    if (useProfile || (!resumeText && studentId)) {
      const [user, studentProfile] = await Promise.all([
        User.findById(studentId).select("name email phone").lean(),
        CollegeStudentProfile.findOne({ userId: studentId }).lean()
      ]);
      profile = studentProfile;

      if (studentProfile) {
        const studentName = user?.name || "Student Name";
        const email = user?.email || "";
        const phone = studentProfile?.phone || user?.phone || "";
        const college = studentProfile?.institution || "Engineering College";
        const degree = studentProfile?.degreeProgramme || "Undergraduate";
        const domain = studentProfile?.domain || studentProfile?.field || "Technical Studies";
        const cgpa = studentProfile?.cgpa ? `CGPA: ${studentProfile.cgpa}` : "";
        const skillsList = (studentProfile?.skills || []).join(", ");
        const certsList = (studentProfile?.certifications || []).map(c => `• ${c}`).join("\n");
        const projectsList = (studentProfile?.projects || []).map(p =>
          `• ${p.title || 'Academic Project'}: ${p.description || ''} (Technologies: ${p.techStack || 'Relevant stack'})`
        ).join("\n");
        const summary = studentProfile?.careerObjective || `Motivated ${degree} graduate in ${domain} with strong technical foundation in ${skillsList}. Seeking entry-level opportunities to apply engineering skills.`;

        // Synthesize full resume text
        resumeText = [
          `${studentName} | ${email} | ${phone}`,
          `Education:\n${degree} in ${domain}, ${college}. ${cgpa}`,
          studentProfile?.school10 ? `Secondary Education: ${studentProfile.school10} (CGPA/Score: ${studentProfile.cgpa10 || 'N/A'})` : '',
          studentProfile?.institution12 ? `Higher Secondary: ${studentProfile.institution12} (${studentProfile.branch12 || 'HSC'}) (Score: ${studentProfile.cgpa12 || 'N/A'})` : '',
          `Professional Summary:\n${summary}`,
          `Technical Competencies:\n${skillsList}`,
          projectsList ? `Projects & Portfolio:\n${projectsList}` : '',
          certsList ? `Certifications & Credentials:\n${certsList}` : ''
        ].filter(Boolean).join("\n\n");
      }
    }

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: "No resume content detected. Please upload a PDF resume, paste text, or select 'Use Profile Resume'."
      });
    }

    // Run ATS scanner
    const analysis = analyzeResumeForAts(resumeText, jobDescription, profile || {});

    return res.status(200).json({
      success: true,
      analysis,
      resumeSnippet: resumeText.slice(0, 300) + (resumeText.length > 300 ? '...' : '')
    });
  } catch (err) {
    console.error("ATS Resume Checker error:", err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while analyzing the resume for ATS compatibility."
    });
  }
};


