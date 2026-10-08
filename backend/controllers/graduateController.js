const GraduateProfile = require("../models/GraduateProfile");
const GraduateOpportunity = require("../models/GraduateOpportunity");
const GraduateApplication = require("../models/GraduateApplication");
const GraduateMentorRelationship = require("../models/GraduateMentorRelationship");
const MentorRequest = require("../models/MentorRequest");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { evaluateEligibility } = require("../services/GraduateEligibilityEngine");
const { refreshOpportunityStatuses, triggerTavilyResearch, seedDefaultOpportunities } = require("../services/GraduateOpportunityResearchService");

// Calculate profile completion percentage
const calculateProfileCompletion = (profile) => {
  let score = 0;
  if (profile.degree) score += 15;
  if (profile.specialization) score += 15;
  if (profile.collegeName || profile.college) score += 10;
  if (profile.graduationYear) score += 10;
  if (profile.cgpa || profile.percentage) score += 10;
  if (profile.careerInterests && profile.careerInterests.length > 0) score += 15;
  if (profile.preferredDomains && profile.preferredDomains.length > 0) score += 15;
  if (profile.onboardingCompleted) score += 10;
  return Math.min(100, score);
};

// Calculate career readiness score
const calculateReadinessScore = (profile) => {
  let score = 40; // baseline degree
  if (profile.cgpa && parseFloat(profile.cgpa) >= 7.5) score += 15;
  if (profile.skills && profile.skills.length > 0) score += 15;
  if (profile.experience && profile.experience.length > 0) score += 15;
  if (profile.resumeUrl) score += 15;
  return Math.min(100, score);
};

// Normalize String to ID helper
const toId = (str) => String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

// ── GET /api/graduate/profile ──────────────────────────────────────────────────
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    let profile = await GraduateProfile.findOne({ userId });
    if (!profile) {
      const user = await User.findById(userId);
      profile = new GraduateProfile({
        userId,
        degree: "B.E.",
        degreeId: "be",
        specialization: "Computer Science",
        specializationId: "cse",
        profileCompletion: 0,
        careerReadinessScore: 40,
        onboardingCompleted: false
      });
      await profile.save();
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error("Get graduate profile error:", error);
    res.status(500).json({ success: false, message: "Server error fetching profile" });
  }
};

// ── PUT & POST /api/graduate/profile & /api/graduate/onboarding ────────────────
exports.completeGraduateOnboarding = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const data = req.body;
    let profile = await GraduateProfile.findOne({ userId });
    if (!profile) profile = new GraduateProfile({ userId });

    // Personal / Academic fields
    if (data.degree) {
      profile.degree = data.degree;
      profile.degreeId = data.degreeId || toId(data.degree);
    }
    if (data.specialization) {
      profile.specialization = data.specialization;
      profile.specializationId = data.specializationId || toId(data.specialization);
    }
    if (data.collegeName !== undefined) profile.collegeName = data.collegeName;
    if (data.universityName !== undefined) profile.universityName = data.universityName;
    if (data.graduationYear !== undefined) profile.graduationYear = data.graduationYear;
    if (data.graduationStatus !== undefined) profile.graduationStatus = data.graduationStatus;
    if (data.cgpa !== undefined) profile.cgpa = data.cgpa;
    if (data.percentage !== undefined) profile.percentage = data.percentage;
    if (data.state !== undefined) profile.state = data.state;
    if (data.location !== undefined) profile.location = data.location;

    // Career Interests & Domains
    if (Array.isArray(data.careerInterests)) profile.careerInterests = data.careerInterests;
    if (Array.isArray(data.preferredDomains)) profile.preferredDomains = data.preferredDomains;
    if (Array.isArray(data.skills)) profile.skills = data.skills;
    if (Array.isArray(data.experience)) profile.experience = data.experience;
    if (data.resumeUrl !== undefined) profile.resumeUrl = data.resumeUrl;

    profile.onboardingCompleted = true;
    profile.profileCompletion = calculateProfileCompletion(profile);
    profile.careerReadinessScore = calculateReadinessScore(profile);

    await profile.save();

    // Update User model role/userType
    await User.findByIdAndUpdate(userId, {
      userType: "graduate",
      onboardingCompleted: true
    });

    res.status(200).json({
      success: true,
      message: "Graduate onboarding profile saved successfully",
      profile
    });
  } catch (error) {
    console.error("Complete graduate onboarding error:", error);
    res.status(500).json({ success: false, message: "Failed to save graduate onboarding profile" });
  }
};

// ── GET /api/graduate/dashboard ───────────────────────────────────────────────
exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    let profile = await GraduateProfile.findOne({ userId });
    if (!profile) {
      profile = new GraduateProfile({ userId, onboardingCompleted: false });
      await profile.save();
    }

    // Refresh data statuses
    await refreshOpportunityStatuses();

    // Fetch opportunities from DB (ensure default seeding if empty)
    let opportunities = await GraduateOpportunity.find({}).lean();
    if (opportunities.length === 0) {
      await seedDefaultOpportunities();
      opportunities = await GraduateOpportunity.find({}).lean();
    }

    // Actual Database Counts for Opportunity Summary Cards
    const govCount = opportunities.filter(o => o.category === "GOVERNMENT_EXAMS").length;
    const higherStudiesCount = opportunities.filter(o => o.category === "HIGHER_STUDIES").length;
    const psuCount = opportunities.filter(o => o.category === "PSU").length;
    const privateJobsCount = opportunities.filter(o => o.category === "PRIVATE_JOBS").length;

    // Actual Mentorship Requests Count
    const incomingMentorRequestsCount = await GraduateMentorRelationship.countDocuments({
      mentorId: userId,
      status: "PENDING"
    }) + await MentorRequest.countDocuments({ status: "Pending" });

    // Evaluate Eligibility for Opportunities
    const evaluatedOpportunities = opportunities.map(opp => {
      const evalResult = evaluateEligibility(profile, opp);
      return {
        ...opp,
        eligibilityEvaluation: evalResult,
        matchScore: evalResult.matchScore
      };
    });

    // Sort by Match Score (Recommended for You)
    evaluatedOpportunities.sort((a, b) => b.matchScore - a.matchScore);

    // Upcoming Exams (Sorted by nearest deadline / exam date)
    const now = new Date();
    const upcomingExams = evaluatedOpportunities
      .filter(o => o.applicationDeadline || o.examDate)
      .sort((a, b) => {
        const dateA = a.applicationDeadline || a.examDate;
        const dateB = b.applicationDeadline || b.examDate;
        return new Date(dateA) - new Date(dateB);
      })
      .slice(0, 6);

    // Deadline Alerts (Closing soon / Upcoming)
    const deadlineAlerts = evaluatedOpportunities
      .filter(o => o.applicationDeadline && o.status !== "CLOSED")
      .map(o => {
        const diffMs = new Date(o.applicationDeadline).getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        let urgency = "GREEN"; // upcoming
        if (diffDays <= 3) urgency = "RED"; // apply within 3 days
        else if (diffDays <= 7) urgency = "ORANGE"; // apply within 7 days

        return {
          id: o._id,
          title: o.opportunityName,
          organization: o.organization,
          deadline: o.applicationDeadline,
          diffDays,
          urgency,
          applicationUrl: o.applicationUrl
        };
      })
      .sort((a, b) => a.diffDays - b.diffDays)
      .slice(0, 5);

    // Active User Applications Count
    const userApplicationsCount = await GraduateApplication.countDocuments({ userId });

    res.status(200).json({
      success: true,
      profile,
      summaryCounts: {
        governmentExams: govCount,
        higherStudies: higherStudiesCount,
        psuOpportunities: psuCount,
        privateJobs: privateJobsCount,
        mentorshipRequests: incomingMentorRequestsCount,
        myApplications: userApplicationsCount
      },
      recommendedOpportunities: evaluatedOpportunities.slice(0, 6),
      upcomingExams,
      deadlineAlerts
    });
  } catch (error) {
    console.error("Get graduate dashboard summary error:", error);
    res.status(500).json({ success: false, message: "Failed to load dashboard summary" });
  }
};

// ── GET /api/graduate/opportunities ───────────────────────────────────────────
exports.getOpportunities = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const { category, search } = req.query;

    const profile = await GraduateProfile.findOne({ userId });

    let filter = {};
    if (category && category !== "ALL") {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { opportunityName: { $regex: search, $options: "i" } },
        { organization: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    let opportunities = await GraduateOpportunity.find(filter).lean();
    if (opportunities.length === 0 && (!category || category === "ALL")) {
      await seedDefaultOpportunities();
      opportunities = await GraduateOpportunity.find(filter).lean();
    }

    const evaluated = opportunities.map(opp => {
      const evalResult = evaluateEligibility(profile, opp);
      return {
        ...opp,
        eligibilityEvaluation: evalResult,
        matchScore: evalResult.matchScore
      };
    });

    evaluated.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({ success: true, opportunities: evaluated });
  } catch (error) {
    console.error("Get opportunities error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch opportunities" });
  }
};

// ── GET /api/graduate/opportunities/:id ───────────────────────────────────────
exports.getOpportunityById = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const { id } = req.params;

    const opportunity = await GraduateOpportunity.findById(id).lean();
    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found" });
    }

    const profile = await GraduateProfile.findOne({ userId });
    const eligibilityEvaluation = evaluateEligibility(profile, opportunity);

    // Check if user has already added this to My Applications
    let existingApplication = null;
    if (userId) {
      existingApplication = await GraduateApplication.findOne({ userId, opportunityId: id }).lean();
    }

    res.status(200).json({
      success: true,
      opportunity: {
        ...opportunity,
        eligibilityEvaluation,
        matchScore: eligibilityEvaluation.matchScore,
        existingApplication
      }
    });
  } catch (error) {
    console.error("Get opportunity by id error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch opportunity details" });
  }
};

// ── GET /api/graduate/government-exams ────────────────────────────────────────
exports.getGovernmentExams = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const profile = await GraduateProfile.findOne({ userId });

    const filter = { category: { $in: ["GOVERNMENT_EXAMS", "PSU"] } };
    let exams = await GraduateOpportunity.find(filter).lean();

    if (exams.length === 0) {
      await seedDefaultOpportunities();
      exams = await GraduateOpportunity.find(filter).lean();
    }

    const evaluated = exams.map(opp => {
      const evalResult = evaluateEligibility(profile, opp);
      return {
        ...opp,
        eligibilityEvaluation: evalResult,
        matchScore: evalResult.matchScore
      };
    });

    evaluated.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({ success: true, exams: evaluated });
  } catch (error) {
    console.error("Get government exams error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch government exams" });
  }
};

// ── GET /api/graduate/higher-studies ──────────────────────────────────────────
exports.getHigherStudiesGuide = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const profile = await GraduateProfile.findOne({ userId });

    const degree = (profile?.degree || "B.E.").toUpperCase();

    // 7-Step Higher Studies Application Pipeline
    const applicationFlow = [
      { step: 1, title: "Choose Program", description: "Select target postgraduate program (M.Tech, MS, MBA, MCA, PhD)" },
      { step: 2, title: "Choose Entrance Exam", description: "Identify eligible national/state entrance exam (GATE, CAT, XAT, CUET-PG, GRE)" },
      { step: 3, title: "Check Eligibility", description: "Verify degree, minimum percentage, and specialization requirements" },
      { step: 4, title: "View Participating Institutes", description: "Explore participating IITs, NITs, IIMs, Central Universities, and Global Colleges" },
      { step: 5, title: "Application Process", description: "Fill online portal forms, upload certificates, and submit application fees" },
      { step: 6, title: "Official Application Link", description: "Navigate directly to verified official admission portal" },
      { step: 7, title: "Preparation Roadmap", description: "Access AI-guided study syllabus, mock tests, and subject revision plans" }
    ];

    // Entrance Exams List for Higher Studies
    const entranceFilter = { category: "HIGHER_STUDIES" };
    let entranceExams = await GraduateOpportunity.find(entranceFilter).lean();
    if (entranceExams.length === 0) {
      await seedDefaultOpportunities();
      entranceExams = await GraduateOpportunity.find(entranceFilter).lean();
    }

    const evaluatedExams = entranceExams.map(opp => {
      const evalResult = evaluateEligibility(profile, opp);
      return {
        ...opp,
        eligibilityEvaluation: evalResult,
        matchScore: evalResult.matchScore
      };
    });

    res.status(200).json({
      success: true,
      degree,
      disclaimerNotice: "Eligibility varies by university/program. Verify the official admission notification before applying.",
      applicationFlow,
      entranceExams: evaluatedExams
    });
  } catch (error) {
    console.error("Get higher studies guide error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch higher studies guide" });
  }
};

// ── GET /api/graduate/applications & POST /api/graduate/applications ─────────
exports.getUserApplications = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const applications = await GraduateApplication.find({ userId })
      .populate("opportunityId")
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error("Get user applications error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch applications" });
  }
};

exports.createOrUpdateApplication = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const { opportunityId, status, notes } = req.body;

    const opp = await GraduateOpportunity.findById(opportunityId);
    if (!opp) return res.status(404).json({ success: false, message: "Opportunity not found" });

    let application = await GraduateApplication.findOne({ userId, opportunityId });
    if (application) {
      if (status) application.status = status;
      if (notes !== undefined) application.notes = notes;
      await application.save();
    } else {
      application = new GraduateApplication({
        userId,
        opportunityId,
        opportunityName: opp.opportunityName,
        category: opp.category,
        organization: opp.organization,
        status: status || "PLANNING",
        officialApplicationUrl: opp.applicationUrl,
        deadline: opp.applicationDeadline,
        notes: notes || ""
      });
      await application.save();
    }

    res.status(200).json({ success: true, application });
  } catch (error) {
    console.error("Create/update application error:", error);
    res.status(500).json({ success: false, message: "Failed to save application" });
  }
};

// ── POST /api/graduate/opportunities/:id/reminder ─────────────────────────────
exports.setOpportunityReminder = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const { id } = req.params;

    const opp = await GraduateOpportunity.findById(id);
    if (!opp) return res.status(404).json({ success: false, message: "Opportunity not found" });

    const now = new Date();
    if (opp.applicationDeadline && new Date(opp.applicationDeadline) < now) {
      return res.status(400).json({
        success: false,
        message: "Cannot create reminders for already-closed applications."
      });
    }

    let application = await GraduateApplication.findOne({ userId, opportunityId: id });
    if (!application) {
      application = new GraduateApplication({
        userId,
        opportunityId: id,
        opportunityName: opp.opportunityName,
        category: opp.category,
        organization: opp.organization,
        status: "PLANNING",
        officialApplicationUrl: opp.applicationUrl,
        deadline: opp.applicationDeadline
      });
    }

    application.reminderSet = true;
    application.reminderDate = opp.applicationDeadline || new Date(Date.now() + 7 * 86400000);
    await application.save();

    // Create Notification record
    await Notification.create({
      userId,
      title: `Deadline Reminder: ${opp.opportunityName} 📅`,
      message: `Reminder set for ${opp.opportunityName} (Deadline: ${opp.applicationDeadline ? new Date(opp.applicationDeadline).toLocaleDateString() : 'Upcoming'}). Official URL: ${opp.applicationUrl}`,
      type: "exam",
      targetLevel: "Graduate",
      sentByAdmin: false
    });

    res.status(200).json({
      success: true,
      message: `Deadline reminder set for ${opp.opportunityName}`,
      application
    });
  } catch (error) {
    console.error("Set opportunity reminder error:", error);
    res.status(500).json({ success: false, message: "Failed to set deadline reminder" });
  }
};

// ── POST /api/graduate/research/refresh ───────────────────────────────────────
exports.refreshOpportunityResearch = async (req, res) => {
  try {
    const { query } = req.body;

    await refreshOpportunityStatuses();
    const liveResults = await triggerTavilyResearch(query);

    res.status(200).json({
      success: true,
      message: "Graduate opportunity research refreshed and verified",
      liveResults
    });
  } catch (error) {
    console.error("Refresh research error:", error);
    res.status(500).json({ success: false, message: "Failed to refresh research" });
  }
};
