const CollegeStudentProfile = require("../models/CollegeStudentProfile");
const CollegeCareerCatalog = require("../models/CollegeCareerCatalog");
const Recommendation = require("../models/Recommendation");

// Helper: Calculate Match & Generate Explanations
const evaluateCareerMatch = (profile, career) => {
  let score = 50; // Base score baseline

  const userField = (profile.field || "").toLowerCase();
  const userDegree = (profile.degreeProgramme || "").toLowerCase();
  const userDomain = (profile.domain || "").toLowerCase();
  const userSpec = (profile.specialization || "").toLowerCase();
  const userSkills = (profile.skills || []).map(s => s.toLowerCase());
  const userInterests = (profile.careerInterests || []).map(i => i.toLowerCase());

  // 1. Field & Degree Match (+20 pts max)
  const reqFields = (career.requiredFields || []).map(f => f.toLowerCase());
  const reqDegrees = (career.requiredDegrees || []).map(d => d.toLowerCase());
  if (reqFields.includes(userField) || reqFields.length === 0) score += 10;
  if (reqDegrees.some(d => userDegree.includes(d) || d.includes(userDegree))) score += 10;

  // 2. Domain & Specialization Match (+20 pts max)
  const reqDomains = (career.requiredDomains || []).map(d => d.toLowerCase());
  const reqSpecs = (career.requiredSpecializations || []).map(s => s.toLowerCase());
  if (reqDomains.some(d => userDomain.includes(d) || d.includes(userDomain))) score += 12;
  if (reqSpecs.some(s => userSpec.includes(s) || s.includes(userSpec))) score += 8;

  // 3. Skill Alignment (+10 pts max)
  const reqSkills = career.requiredSkills || [];
  const matchedSkills = [];
  const skillGaps = [];

  reqSkills.forEach(reqSkill => {
    const isMatched = userSkills.some(uSkill => uSkill.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(uSkill));
    if (isMatched) {
      matchedSkills.push(reqSkill);
    } else {
      skillGaps.push(reqSkill);
    }
  });

  if (reqSkills.length > 0) {
    const skillRatio = matchedSkills.length / reqSkills.length;
    score += Math.round(skillRatio * 10);
  }

  // 4. Career Interest Alignment (+10 pts max)
  const careerTitle = career.title.toLowerCase();
  const careerCat = career.category.toLowerCase();
  const interestMatch = userInterests.some(int => int.includes(careerTitle) || careerTitle.includes(int) || int.includes(careerCat));
  if (interestMatch) score += 10;

  // Final Clamped Percentage (62% - 96%)
  const matchPercentage = Math.min(96, Math.max(62, score));

  // Match Classification Category
  let matchCategory = "Worth Exploring";
  if (matchPercentage >= 90) matchCategory = "Best Match";
  else if (matchPercentage >= 80) matchCategory = "Strong Match";
  else if (matchPercentage >= 70) matchCategory = "Good Match";
  else if (matchPercentage >= 60) matchCategory = "Potential Match";

  // Dynamic Explanation Generator (Non-guaranteed wording)
  let explanation = `${career.title} is recommended because your ${profile.domain || profile.field} academic background and skill competencies align well with this career direction.`;
  if (matchedSkills.length > 0 && interestMatch) {
    explanation = `${career.title} is a ${matchCategory.toLowerCase()} because your ${profile.domain} specialization, interest in ${profile.careerInterests[0] || 'technology'}, and existing skills in ${matchedSkills.join(', ')} strongly align with this career path.`;
  } else if (matchedSkills.length > 0) {
    explanation = `${career.title} shows a ${matchCategory.toLowerCase()} based on your background in ${profile.degreeProgramme} and skills in ${matchedSkills.join(', ')}.`;
  }

  return {
    careerId: career._id,
    title: career.title,
    slug: career.slug,
    category: career.category,
    shortDescription: career.shortDescription,
    typicalWorkArea: career.typicalWorkArea,
    matchPercentage,
    matchCategory,
    explanation,
    matchedSkills,
    skillGaps,
    suggestedSubjects: career.suggestedSubjects || [],
    suggestedNextSteps: career.suggestedNextSteps || [],
    relatedDegrees: career.relatedDegrees || [],
    workSectors: career.workSectors || [],
    growthOutlook: career.growthOutlook
  };
};

// ── GET Academic Advisor Recommendations ─────────────────────────────────────
const getAdvisorRecommendations = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 1. Fetch Student Profile
    const profile = await CollegeStudentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "College student profile not found. Please complete profile onboarding first."
      });
    }

    // 2. Fetch Careers Catalog
    let careers = await CollegeCareerCatalog.find();
    if (!careers || careers.length === 0) {
      const { seedCollegeCareers } = require("../utils/collegeCareerSeeder");
      await seedCollegeCareers();
      careers = await CollegeCareerCatalog.find();
    }

    // 3. Evaluate Match for all Careers
    const evaluatedRecommendations = careers.map(c => evaluateCareerMatch(profile, c));

    // 4. Sort by highest match score
    evaluatedRecommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);

    // 5. Persist Record to Recommendation Model
    try {
      await Recommendation.create({
        userId,
        grade: "College",
        scorePercentage: evaluatedRecommendations[0]?.matchPercentage || 85,
        performanceLevel: evaluatedRecommendations[0]?.matchCategory || "Strong Match",
        interests: profile.careerInterests || [],
        strongSkills: profile.skills || [],
        recommendedCareerPaths: evaluatedRecommendations.slice(0, 5).map(r => r.title),
        learningGuidelines: `Profile assessed for ${profile.degreeProgramme} (${profile.domain}). Best match: ${evaluatedRecommendations[0]?.title}.`
      });
    } catch (recErr) {
      console.warn("Failed to persist to Recommendation model history:", recErr.message);
    }

    res.status(200).json({
      success: true,
      profileSummary: {
        field: profile.field,
        degreeProgramme: profile.degreeProgramme,
        domain: profile.domain,
        specialization: profile.specialization,
        institution: profile.institution,
        skills: profile.skills,
        academicInterests: profile.academicInterests,
        careerInterests: profile.careerInterests,
        profileCompletion: profile.profileCompletion
      },
      recommendations: evaluatedRecommendations,
      assessedAt: new Date()
    });
  } catch (error) {
    console.error("Get advisor recommendations error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── COMPARE Careers Side-by-Side ─────────────────────────────────────────────
const compareCareers = async (req, res) => {
  try {
    const { slugs } = req.body;
    if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide an array of career slugs to compare" });
    }

    const userId = req.student?._id || req.user?._id || req.student?.id;
    const profile = userId ? await CollegeStudentProfile.findOne({ userId }) : null;

    const careers = await CollegeCareerCatalog.find({ slug: { $in: slugs } });

    const comparedData = careers.map(c => {
      const evalData = profile ? evaluateCareerMatch(profile, c) : null;
      return {
        id: c._id,
        title: c.title,
        slug: c.slug,
        category: c.category,
        shortDescription: c.shortDescription,
        typicalWorkArea: c.typicalWorkArea,
        requiredSkills: c.requiredSkills,
        matchedSkills: evalData ? evalData.matchedSkills : [],
        skillGaps: evalData ? evalData.skillGaps : c.requiredSkills,
        matchPercentage: evalData ? evalData.matchPercentage : null,
        matchCategory: evalData ? evalData.matchCategory : null,
        suggestedSubjects: c.suggestedSubjects,
        suggestedNextSteps: c.suggestedNextSteps,
        relatedDegrees: c.relatedDegrees,
        workSectors: c.workSectors,
        growthOutlook: c.growthOutlook
      };
    });

    res.status(200).json({
      success: true,
      comparison: comparedData
    });
  } catch (error) {
    console.error("Compare careers error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── ADMIN: Get All College Careers ──────────────────────────────────────────
const getAllCareersAdmin = async (req, res) => {
  try {
    const careers = await CollegeCareerCatalog.find().sort({ title: 1 });
    res.status(200).json({ success: true, careers });
  } catch (error) {
    console.error("Admin get careers error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch careers" });
  }
};

// ── ADMIN: Create / Update College Career ───────────────────────────────────
const adminSaveCareer = async (req, res) => {
  try {
    const { id, title, category, shortDescription, typicalWorkArea, requiredFields, requiredDegrees, requiredDomains, requiredSpecializations, requiredSkills, suggestedSubjects, suggestedNextSteps, workSectors, growthOutlook } = req.body;

    if (!title || !category) {
      return res.status(400).json({ success: false, message: "Title and Category are required" });
    }

    const slug = title.toLowerCase().replace(/[^\w]+/g, "-");

    let career;
    if (id) {
      career = await CollegeCareerCatalog.findById(id);
    }

    if (!career) {
      career = await CollegeCareerCatalog.findOne({ slug });
    }

    if (!career) {
      career = new CollegeCareerCatalog({ title, slug, category, shortDescription });
    }

    career.title = title;
    career.slug = slug;
    career.category = category;
    if (shortDescription !== undefined) career.shortDescription = shortDescription;
    if (typicalWorkArea !== undefined) career.typicalWorkArea = typicalWorkArea;
    if (requiredFields !== undefined) career.requiredFields = requiredFields;
    if (requiredDegrees !== undefined) career.requiredDegrees = requiredDegrees;
    if (requiredDomains !== undefined) career.requiredDomains = requiredDomains;
    if (requiredSpecializations !== undefined) career.requiredSpecializations = requiredSpecializations;
    if (requiredSkills !== undefined) career.requiredSkills = requiredSkills;
    if (suggestedSubjects !== undefined) career.suggestedSubjects = suggestedSubjects;
    if (suggestedNextSteps !== undefined) career.suggestedNextSteps = suggestedNextSteps;
    if (workSectors !== undefined) career.workSectors = workSectors;
    if (growthOutlook !== undefined) career.growthOutlook = growthOutlook;

    await career.save();

    res.status(200).json({
      success: true,
      message: "College career saved successfully",
      career
    });
  } catch (error) {
    console.error("Admin save career error:", error);
    res.status(500).json({ success: false, message: "Failed to save career entity" });
  }
};

// ── ADMIN: Delete College Career ─────────────────────────────────────────────
const adminDeleteCareer = async (req, res) => {
  try {
    const { id } = req.params;
    await CollegeCareerCatalog.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Career deleted successfully" });
  } catch (error) {
    console.error("Admin delete career error:", error);
    res.status(500).json({ success: false, message: "Failed to delete career" });
  }
};

module.exports = {
  getAdvisorRecommendations,
  compareCareers,
  getAllCareersAdmin,
  adminSaveCareer,
  adminDeleteCareer
};
