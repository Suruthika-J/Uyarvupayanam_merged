const AhpCareerProfile = require("../models/AhpCareerProfile");
const CollegeStudentProfile = require("../models/CollegeStudentProfile");
const { getCandidateDomainsForBranch, computeAhpEngine } = require("../utils/ahpCalculator");

/**
 * GET candidate career domains for Step 5 based on Step 4 selections
 * Now also considers careerInterests and skills for fuzzy-context-aware domain selection
 */
const getCandidateDomains = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?.id || req.user?._id;
    let branchId = req.query.branchId || "cse";
    let specializations = req.query.specializations ? req.query.specializations.split(",").map(s => s.trim()).filter(Boolean) : [];

    // Fetch saved student profile context for personalization
    let studentCareerInterests = [];
    let studentSkills = [];
    if (userId) {
      const studentProfile = await CollegeStudentProfile.findOne({ userId });
      if (studentProfile) {
        if (!req.query.branchId && studentProfile.domain) {
          branchId = studentProfile.domain;
        }
        if (!req.query.specializations && studentProfile.specialization) {
          specializations = studentProfile.specialization.split(",").map(s => s.trim()).filter(Boolean);
        }
        if (Array.isArray(studentProfile.careerInterests) && studentProfile.careerInterests.length > 0) {
          studentCareerInterests = studentProfile.careerInterests;
        }
        if (Array.isArray(studentProfile.skills) && studentProfile.skills.length > 0) {
          studentSkills = studentProfile.skills;
        }
      }
    }

    // Get base candidate domains from branch + specializations
    const baseCandidateDomains = getCandidateDomainsForBranch(branchId, specializations);

    // Apply fuzzy relevance filtering using careerInterests + skills context
    const { filterCandidatesWithFuzzyRelevance } = require("../utils/ahpCalculator");
    const candidateDomains = filterCandidatesWithFuzzyRelevance(
      baseCandidateDomains,
      studentCareerInterests,
      studentSkills
    );

    res.status(200).json({
      success: true,
      branchId,
      specializations,
      studentContext: {
        careerInterestsUsed: studentCareerInterests.length > 0,
        skillsUsed: studentSkills.length > 0,
        candidateCount: candidateDomains.length
      },
      candidateDomains
    });
  } catch (error) {
    console.error("Get AHP candidate domains error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch candidate domains" });
  }
};

/**
 * POST calculate AHP result (non-persisted calculation preview)
 */
const calculateAhp = async (req, res) => {
  try {
    const { candidateDomains, pairwiseComparisons } = req.body;

    if (!Array.isArray(candidateDomains) || candidateDomains.length === 0) {
      return res.status(400).json({ success: false, message: "Candidate domains list is required." });
    }

    const result = computeAhpEngine({ candidateDomains, pairwiseComparisons: pairwiseComparisons || [] });

    res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    console.error("Calculate AHP error:", error);
    res.status(500).json({ success: false, message: "Failed to calculate AHP matrix" });
  }
};

/**
 * POST save AHP profile to database (Step 5 completion & Step 6 handoff)
 */
const saveAhpProfile = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Student token missing." });
    }

    const { candidateDomains, pairwiseComparisons, branchId, selectedSpecializations } = req.body;

    if (!Array.isArray(candidateDomains) || candidateDomains.length === 0) {
      return res.status(400).json({ success: false, message: "Candidate domains list is required." });
    }

    // Run deterministic AHP calculation engine
    const ahpData = computeAhpEngine({ candidateDomains, pairwiseComparisons: pairwiseComparisons || [] });

    // Save or update AhpCareerProfile in DB (separate from Step 4 data)
    const profileData = {
      userId,
      studentId: userId.toString(),
      branchId: branchId || "cse",
      selectedSpecializations: selectedSpecializations || [],
      candidateDomains: ahpData.candidateDomains,
      pairwiseComparisons: ahpData.pairwiseComparisons,
      ahpMatrix: ahpData.ahpMatrix,
      priorityWeights: ahpData.priorityWeights,
      consistencyIndex: ahpData.consistencyIndex,
      consistencyRatio: ahpData.consistencyRatio,
      consistencyStatus: ahpData.consistencyStatus,
      isConsistent: ahpData.isConsistent,
      lambdaMax: ahpData.lambdaMax,
      topDomain: ahpData.topDomain,
      secondDomain: ahpData.secondDomain,
      thirdDomain: ahpData.thirdDomain,
      candidateDomainsForStep6: ahpData.candidateDomainsForStep6,
      completedAt: new Date()
    };

    const ahpProfile = await AhpCareerProfile.findOneAndUpdate(
      { userId },
      profileData,
      { new: true, upsert: true }
    );

    // Update CollegeStudentProfile step tracking and top candidate domains for Step 6 handoff
    await CollegeStudentProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          currentStep: 6,
          careerInterests: ahpData.candidateDomainsForStep6.map(d => d.name)
        }
      },
      { upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Step 5 AHP Career Discovery Profile saved successfully.",
      ahpProfile
    });
  } catch (error) {
    console.error("Save AHP Profile error:", error);
    res.status(500).json({ success: false, message: "Failed to save AHP Career Profile" });
  }
};

/**
 * GET fetch saved AHP result for authenticated student
 */
const getAhpResult = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const ahpProfile = await AhpCareerProfile.findOne({ userId });

    if (!ahpProfile) {
      return res.status(404).json({ success: false, message: "No AHP Career Profile found for this student." });
    }

    res.status(200).json({
      success: true,
      ahpProfile
    });
  } catch (error) {
    console.error("Get AHP Result error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch AHP Profile" });
  }
};

/**
 * POST revise AHP comparisons
 */
const reviseAhpComparisons = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    await AhpCareerProfile.deleteOne({ userId });

    res.status(200).json({
      success: true,
      message: "AHP comparison state reset. Ready for revision."
    });
  } catch (error) {
    console.error("Revise AHP error:", error);
    res.status(500).json({ success: false, message: "Failed to reset AHP state" });
  }
};

module.exports = {
  getCandidateDomains,
  calculateAhp,
  saveAhpProfile,
  getAhpResult,
  reviseAhpComparisons
};
