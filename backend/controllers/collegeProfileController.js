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
      // ── New fields (Task 02) ──
      currentSemester,
      cgpa,
      subjects,
      targetCareer,
      completedCourses,
      projects,
      phone,
      // ── Wizard tracking ──
      currentStep,
      isFinalStep
    } = req.body;

    let profile = await CollegeStudentProfile.findOne({ userId });

    if (!profile) {
      profile = new CollegeStudentProfile({ userId, field: field || "engineering", degreeProgramme: degreeProgramme || "B.E. (Bachelor of Engineering)" });
    }

    // Update existing fields if provided
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

    // Update new fields (Task 02)
    if (currentSemester !== undefined) profile.currentSemester = currentSemester;
    if (cgpa !== undefined) profile.cgpa = cgpa;
    if (subjects !== undefined) profile.subjects = subjects;
    if (targetCareer !== undefined) profile.targetCareer = targetCareer;
    if (completedCourses !== undefined) profile.completedCourses = completedCourses;
    if (projects !== undefined) profile.projects = projects;
    if (phone !== undefined) profile.phone = phone;

    if (currentStep !== undefined) {
      profile.currentStep = Math.max(profile.currentStep, currentStep);
    }

    // ── Richer Completion Percentage (weighted across all fields) ──
    profile.profileCompletion = calculateProfileCompletion(profile);

    if (isFinalStep || profile.profileCompletion >= 85) {
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

// ── Partial Update (Patch) — For modules to update individual fields ──────────
const patchProfile = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Whitelist of patchable fields
    const PATCHABLE = [
      "currentSemester", "cgpa", "subjects", "targetCareer",
      "completedCourses", "projects", "phone", "skills", "strengths",
      "certifications", "academicInterests", "careerInterests",
      "grokAssessmentScore", "grokAssessmentResults"
    ];

    let profile = await CollegeStudentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found. Complete onboarding first." });
    }

    // Apply only whitelisted fields
    for (const key of PATCHABLE) {
      if (req.body[key] !== undefined) {
        profile[key] = req.body[key];
      }
    }

    // Recalculate completion
    profile.profileCompletion = calculateProfileCompletion(profile);

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Profile updated",
      profile
    });
  } catch (error) {
    console.error("Patch college profile error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

// ── Profile Completion Calculator ─────────────────────────────────────────────
function calculateProfileCompletion(profile) {
  let score = 0;
  const weights = {
    institution: 10,
    currentYear: 8,
    field: 10,
    degreeProgramme: 10,
    domain: 8,
    specialization: 5,
    skills: 10,
    currentSemester: 6,
    cgpa: 6,
    subjects: 5,
    targetCareer: 7,
    academicInterests: 5,
    careerInterests: 5,
    completedCourses: 5
  };

  if (profile.institution) score += weights.institution;
  if (profile.currentYear) score += weights.currentYear;
  if (profile.field) score += weights.field;
  if (profile.degreeProgramme) score += weights.degreeProgramme;
  if (profile.domain) score += weights.domain;
  if (profile.specialization) score += weights.specialization;
  if (profile.skills && profile.skills.length > 0) score += weights.skills;
  if (profile.currentSemester) score += weights.currentSemester;
  if (profile.cgpa) score += weights.cgpa;
  if (profile.subjects && profile.subjects.length > 0) score += weights.subjects;
  if (profile.targetCareer) score += weights.targetCareer;
  if (profile.academicInterests && profile.academicInterests.length > 0) score += weights.academicInterests;
  if (profile.careerInterests && profile.careerInterests.length > 0) score += weights.careerInterests;
  if (profile.completedCourses && profile.completedCourses.length > 0) score += weights.completedCourses;

  return Math.min(100, score);
}

module.exports = {
  getMetadata,
  getMyProfile,
  saveProfile,
  patchProfile
};
