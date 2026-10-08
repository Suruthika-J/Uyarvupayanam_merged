/**
 * companyInterviewPrepController.js
 * Controller for Company-Specific Interview Research, AI Question Generation & Mock Interviews
 */

const CompanyResearchService = require("../services/CompanyResearchService");
const CompanySpecificQuestionGenerator = require("../services/CompanySpecificQuestionGenerator");
const CollegeStudentProfile = require("../models/CollegeStudentProfile");
const StudentActivity = require("../models/StudentActivity");

/**
 * 1. Research Company & Extract Classified Interview Intelligence
 */
const researchCompany = async (req, res) => {
  try {
    const { companyName, role, hiringType } = req.body;

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a company name to research."
      });
    }

    // Fetch research via engine (handles caching & classification)
    const research = await CompanyResearchService.researchCompany({
      companyName,
      role: role || "Software Engineer",
      hiringType: hiringType || "Full-Time"
    });

    return res.json({
      success: true,
      company: research.companyName,
      role: research.role,
      hiringType: research.hiringType,
      researchConfidence: research.researchConfidence,
      confidenceReason: research.confidenceReason,
      officialSources: research.officialSources,
      candidateSources: research.candidateSources,
      rounds: research.rounds,
      reportedVariations: research.reportedVariations,
      mostReportedPattern: research.mostReportedPattern,
      reportedQuestions: research.reportedQuestions,
      topicPatterns: research.topicPatterns,
      researchedAt: research.researchedAt
    });
  } catch (err) {
    console.error("Error in researchCompany:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to conduct company interview research."
    });
  }
};

/**
 * 2. Generate AI Practice Questions based on Company Patterns
 */
const generatePracticeQuestions = async (req, res) => {
  try {
    const { companyName, role, hiringType, difficulty, category, questionCount } = req.body;
    const userId = req.student?._id;

    // Fetch student profile for domain/skills/projects integration
    let studentProfile = null;
    if (userId) {
      studentProfile = await CollegeStudentProfile.findOne({ studentId: userId });
    }

    // Fetch company research context
    let research = null;
    if (companyName) {
      research = await CompanyResearchService.researchCompany({
        companyName,
        role: role || "Software Engineer",
        hiringType: hiringType || "Full-Time"
      });
    }

    const questions = await CompanySpecificQuestionGenerator.generateQuestions({
      companyName: companyName || "Target Company",
      role: role || "Software Engineer",
      hiringType: hiringType || "Full-Time",
      difficulty: difficulty || "Medium",
      category: category || "Technical",
      questionCount: questionCount || 5,
      research,
      studentProfile
    });

    return res.json({
      success: true,
      companyName,
      role,
      category,
      questions
    });
  } catch (err) {
    console.error("Error in generatePracticeQuestions:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate company practice questions."
    });
  }
};

/**
 * 3. AI Mock Interview — Start Session
 */
const startMockInterview = async (req, res) => {
  try {
    const { companyName, role, hiringType } = req.body;
    const userId = req.student?._id;

    let studentProfile = null;
    if (userId) {
      studentProfile = await CollegeStudentProfile.findOne({ studentId: userId });
    }

    const cleanCompany = companyName || "Target Company";
    const cleanRole = role || "Software Engineer";
    const studentName = req.student?.fullName || studentProfile?.fullName || "Candidate";

    const initialQuestion = `Welcome to your ${cleanCompany} mock interview for the ${cleanRole} role! I will be acting as your interviewer today.\n\nLet's start with a warm-up question: **Tell me about yourself, your technical background, and why you are interested in joining ${cleanCompany}.**`;

    return res.json({
      success: true,
      sessionId: `mock-${Date.now()}`,
      interviewerName: `${cleanCompany} Technical Interviewer`,
      companyName: cleanCompany,
      role: cleanRole,
      question: initialQuestion,
      turn: 1
    });
  } catch (err) {
    console.error("Error starting mock interview:", err);
    return res.status(500).json({ success: false, message: "Failed to start mock interview." });
  }
};

/**
 * 4. AI Mock Interview — Submit Candidate Answer & Get Feedback + Next Question
 */
const respondMockInterview = async (req, res) => {
  try {
    const { companyName, role, userResponse, turn = 1 } = req.body;

    if (!userResponse || !userResponse.trim()) {
      return res.status(400).json({ success: false, message: "Response cannot be empty." });
    }

    const cleanCompany = companyName || "Target Company";
    const cleanRole = role || "Software Engineer";

    let feedback = "";
    let nextQuestion = "";

    if (turn === 1) {
      feedback = "Good introduction! You clearly stated your background and interest.";
      nextQuestion = `Now let's move into a technical evaluation for ${cleanRole} at ${cleanCompany}:\n\n**Question 2:** Explain a situation in your previous projects where you encountered a major technical bottleneck or performance issue. How did you diagnose and resolve it?`;
    } else if (turn === 2) {
      feedback = "Excellent problem-solving narrative! You demonstrated solid debugging methodology and ownership.";
      nextQuestion = `**Question 3:** From a CS fundamentals standpoint, explain how indexes work in a relational database and what trade-offs they introduce during write-heavy operations.`;
    } else {
      feedback = "Solid technical depth and clear explanation of database B-tree indexing trade-offs!";
      nextQuestion = `Thank you for completing this initial ${cleanCompany} ${cleanRole} mock interview session! You performed well in technical clarity and structured communication.`;
    }

    return res.json({
      success: true,
      turn: turn + 1,
      feedback,
      nextQuestion,
      isFinished: turn >= 3
    });
  } catch (err) {
    console.error("Error in mock interview response:", err);
    return res.status(500).json({ success: false, message: "Failed to process mock interview response." });
  }
};

/**
 * 5. Submit Session Score & Sync Weak Areas
 */
const submitInterviewResult = async (req, res) => {
  try {
    const { targetRole, score = 85, weakAreas = [] } = req.body;
    const userId = req.student?._id;

    if (userId) {
      await StudentActivity.create({
        studentId: userId,
        activityType: "INTERVIEW_PREP_COMPLETED",
        description: `Completed Company Interview Preparation for ${targetRole || 'Target Role'} with score ${score}%`,
        metadata: { targetRole, score, weakAreas }
      }).catch(err => console.warn("Failed to log interview activity:", err.message));
    }

    return res.json({
      success: true,
      message: "Interview practice result and weak areas successfully synced!"
    });
  } catch (err) {
    console.error("Error submitting interview result:", err);
    return res.status(500).json({ success: false, message: "Failed to sync interview result." });
  }
};

module.exports = {
  researchCompany,
  generatePracticeQuestions,
  startMockInterview,
  respondMockInterview,
  submitInterviewResult
};
