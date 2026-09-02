const CollegeStudentProfile = require("../models/CollegeStudentProfile");
const User = require("../models/User");
const COLLEGE_FIELDS_DATA = require("../config/collegeFieldsData");

// ── Get Metadata (Fields, Degrees, Domains, Certifications) ──────────────────
const getMetadata = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: COLLEGE_FIELDS_DATA
    });
  } catch (error) {
    console.error("Get college metadata error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch metadata" });
  }
};

// ── Get Current Student Profile ───────────────────────────────────────────────
const getMyProfile = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let profile = await CollegeStudentProfile.findOne({ userId });
    
    if (!profile) {
      // Create empty draft profile if not found
      profile = new CollegeStudentProfile({
        userId,
        field: "engineering",
        degreeProgramme: "B.E. (Bachelor of Engineering)",
        currentStep: 1,
        profileCompletion: 0,
        isCompleted: false
      });
      await profile.save();
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error("Get my college profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Save / Update College Profile Step ───────────────────────────────────────
const saveProfile = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      institution,
      institutionDistrict,
      currentYear,
      studyMode,
      field,
      degreeProgramme,
      domain,
      specialization,
      certifications,
      academicInterests,
      careerInterests,
      skills,
      strengths,
      currentStep,
      isFinalStep
    } = req.body;

    let profile = await CollegeStudentProfile.findOne({ userId });

    if (!profile) {
      profile = new CollegeStudentProfile({ userId, field: field || "engineering", degreeProgramme: degreeProgramme || "B.E. (Bachelor of Engineering)" });
    }

    // Update fields if provided
    if (institution !== undefined) profile.institution = institution;
    if (institutionDistrict !== undefined) profile.institutionDistrict = institutionDistrict;
    if (currentYear !== undefined) profile.currentYear = currentYear;
    if (studyMode !== undefined) profile.studyMode = studyMode;
    if (field !== undefined) profile.field = field;
    if (degreeProgramme !== undefined) profile.degreeProgramme = degreeProgramme;
    if (domain !== undefined) profile.domain = domain;
    if (specialization !== undefined) profile.specialization = specialization;
    if (certifications !== undefined) profile.certifications = certifications;
    if (academicInterests !== undefined) profile.academicInterests = academicInterests;
    if (careerInterests !== undefined) profile.careerInterests = careerInterests;
    if (skills !== undefined) profile.skills = skills;
    if (strengths !== undefined) profile.strengths = strengths;

    if (currentStep !== undefined) {
      profile.currentStep = Math.max(profile.currentStep, currentStep);
    }

    // Calculate Completion Percentage
    let score = 0;
    if (profile.institution) score += 15;
    if (profile.currentYear) score += 15;
    if (profile.field) score += 20;
    if (profile.degreeProgramme) score += 20;
    if (profile.domain || profile.specialization) score += 15;
    if (profile.skills && profile.skills.length > 0) score += 15;

    profile.profileCompletion = Math.min(100, score);

    if (isFinalStep || score >= 85) {
      profile.isCompleted = true;
      // Mark onboarding completed on User document as well
      await User.findByIdAndUpdate(userId, { onboardingCompleted: true });
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: "College profile saved successfully",
      profile
    });
  } catch (error) {
    console.error("Save college profile error:", error);
    res.status(500).json({ success: false, message: "Failed to save profile" });
  }
};

module.exports = {
  getMetadata,
  getMyProfile,
  saveProfile
};
