const CollegeStudentProfile = require("../models/CollegeStudentProfile");
const CollegeCareerCatalog = require("../models/CollegeCareerCatalog");
const Recommendation = require("../models/Recommendation");

// Helper: Calculate Multi-Dimensional Match & Explanations
const evaluateCareerMatch = (profile, career) => {
  let score = 50; // Base score baseline

  const userField = (profile.field || "").toLowerCase();
  const userDegree = (profile.degreeProgramme || "").toLowerCase();
  const userDomain = (profile.domain || "").toLowerCase();
  const userSpec = (profile.specialization || "").toLowerCase();
  const userSkills = (profile.skills || []).map(s => s.toLowerCase());
  const userInterests = [
    ...(profile.careerInterests || []),
    ...(profile.academicInterests || [])
  ].map(i => i.toLowerCase());
  const userSubjects = (profile.subjects || []).map(s => s.toLowerCase());
  const userProjects = profile.projects || [];
  const userCGPA = parseFloat(profile.cgpa) || 7.5;
  const userAssessment = profile.grokAssessmentScore || 75;

  const whyFits = [];
  const skillsToImprove = [];

  // 1. Academic Relevance (25% Weight Max)
  let academicScore = 0;
  const reqFields = (career.requiredFields || []).map(f => f.toLowerCase());
  const reqDegrees = (career.requiredDegrees || []).map(d => d.toLowerCase());
  const reqDomains = (career.requiredDomains || []).map(d => d.toLowerCase());
  const reqSpecs = (career.requiredSpecializations || []).map(s => s.toLowerCase());

  if (reqFields.includes(userField) || reqFields.length === 0) {
    academicScore += 8;
  }
  if (reqDegrees.some(d => userDegree.includes(d) || d.includes(userDegree))) {
    academicScore += 8;
    whyFits.push(`Relevant degree program (${profile.degreeProgramme})`);
  }
  if (reqDomains.some(d => userDomain.includes(d) || d.includes(userDomain))) {
    academicScore += 6;
    whyFits.push(`Matching academic domain (${profile.domain})`);
  }
  if (reqSpecs.some(s => userSpec.includes(s) || s.includes(userSpec))) {
    academicScore += 3;
    whyFits.push(`Specialization alignment (${profile.specialization})`);
  }
  if (userCGPA >= 8.0) {
    whyFits.push(`Strong academic standing (CGPA ${userCGPA})`);
  }
  score += academicScore;

  // 2. Skill Alignment (25% Weight Max)
  const reqSkills = career.requiredSkills || [];
  const matchedSkills = [];
  const skillGaps = [];

  reqSkills.forEach(reqSkill => {
    const rLower = reqSkill.toLowerCase();
    const isMatched = userSkills.some(uSkill => uSkill.includes(rLower) || rLower.includes(uSkill));
    if (isMatched) {
      matchedSkills.push(reqSkill);
    } else {
      skillGaps.push(reqSkill);
    }
  });

  if (matchedSkills.length > 0) {
    whyFits.push(`Strong match in core skills (${matchedSkills.slice(0, 3).join(', ')})`);
  }
  skillGaps.forEach(sg => {
    skillsToImprove.push(sg);
  });

  if (reqSkills.length > 0) {
    const skillRatio = matchedSkills.length / reqSkills.length;
    score += Math.round(skillRatio * 25);
  } else {
    score += 15;
  }

  // 3. Interest Match (20% Weight Max)
  const careerTitle = career.title.toLowerCase();
  const careerCat = career.category.toLowerCase();
  const interestMatch = userInterests.some(int =>
    int.includes(careerTitle) || careerTitle.includes(int) || int.includes(careerCat)
  );
  if (interestMatch) {
    score += 20;
    whyFits.push(`High interest alignment with ${career.category} field`);
  } else {
    score += 5;
  }

  // 4. Assessment Performance (15% Weight Max)
  if (userAssessment >= 80) {
    score += 15;
    whyFits.push(`Strong analytical assessment performance (${userAssessment}%)`);
  } else if (userAssessment >= 65) {
    score += 10;
  } else {
    score += 5;
  }

  // 5. Subject & Project Match (15% Weight Max)
  let projectMatch = false;
  userProjects.forEach(proj => {
    const pStr = `${proj.title || ''} ${proj.techStack || ''} ${proj.description || ''}`.toLowerCase();
    if (pStr.includes(careerTitle) || pStr.includes(careerCat) || matchedSkills.some(s => pStr.includes(s.toLowerCase()))) {
      projectMatch = true;
    }
  });

  if (projectMatch) {
    score += 15;
    whyFits.push(`Practical project experience related to role`);
  } else if (userSubjects.some(sub => (career.suggestedSubjects || []).some(s => s.toLowerCase().includes(sub) || sub.includes(s.toLowerCase())))) {
    score += 10;
    whyFits.push(`Active coursework alignment`);
  } else {
    score += 5;
  }

  // Ensure whyFits has at least 2 items
  if (whyFits.length === 0) {
    whyFits.push(`Academic foundation in ${profile.degreeProgramme || 'your discipline'}`);
  }
  if (whyFits.length === 1) {
    whyFits.push(`Growth potential in ${career.category}`);
  }

  // Final Clamped Score Percentage (60% - 98%)
  const matchPercentage = Math.min(98, Math.max(60, score));

  // Match Classification Category
  let matchCategory = "Worth Exploring";
  if (matchPercentage >= 90) matchCategory = "Best Match";
  else if (matchPercentage >= 80) matchCategory = "Strong Match";
  else if (matchPercentage >= 70) matchCategory = "Good Match";
  else if (matchPercentage >= 60) matchCategory = "Potential Match";

  const explanation = `${career.title} is a ${matchCategory.toLowerCase()} (${matchPercentage}%) based on your ${profile.degreeProgramme || profile.field} background, skill profile, and career interests.`;

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
    whyFits: [...new Set(whyFits)],
    skillsToImprove: [...new Set(skillsToImprove)],
    matchedSkills,
    skillGaps,
    suggestedSubjects: career.suggestedSubjects || [],
    suggestedNextSteps: career.suggestedNextSteps || [],
    relatedDegrees: career.relatedDegrees || [],
    workSectors: career.workSectors || [],
    growthOutlook: career.growthOutlook
  };
};

// Default Detailed Career Features Generator (for complete detail view)
const getComprehensiveCareerDetails = (career) => {
  const title = career.title;
  const reqSkills = career.requiredSkills || [];

  const coreSkills = career.coreSkills?.length > 0 ? career.coreSkills : [
    { name: reqSkills[0] || "Core Programming & Logic", suggestedProficiency: "Advanced" },
    { name: reqSkills[1] || "Domain Technical Fundamentals", suggestedProficiency: "Advanced" },
    { name: "Problem Solving & Analytical Thinking", suggestedProficiency: "Advanced" }
  ];

  const advancedSkills = career.advancedSkills?.length > 0 ? career.advancedSkills : [
    { name: reqSkills[2] || "System Architecture & Design", suggestedProficiency: "Intermediate" },
    { name: "Data Engineering & Pipelines", suggestedProficiency: "Intermediate" }
  ];

  const optionalSkills = career.optionalSkills?.length > 0 ? career.optionalSkills : [
    { name: reqSkills[3] || "Cloud Deployment & MLOps", suggestedProficiency: "Basic" },
    { name: "Agile & Team Collaboration", suggestedProficiency: "Basic" }
  ];

  const typicalResponsibilities = career.typicalResponsibilities?.length > 0 ? career.typicalResponsibilities : [
    `Design, build, and optimize scalable solutions for ${title} domains.`,
    `Collaborate with cross-functional teams to translate requirements into technical specifications.`,
    `Conduct code reviews, continuous integration, and performance benchmarks.`,
    `Stay updated with emerging tools, industry standards, and open-source innovations.`
  ];

  const recommendedRoadmap = career.recommendedRoadmap?.length > 0 ? career.recommendedRoadmap : [
    {
      phase: "Phase 1: Academic & Core Fundamentals",
      title: "Core Theory & Discipline Mastery",
      description: "Master foundational concepts, core mathematics, algorithms, and primary domain tools.",
      items: [coreSkills[0]?.name || "Core Programming", "Data Structures & Algorithms", "Database Design"],
      defaultStatus: "completed"
    },
    {
      phase: "Phase 2: Applied Technical Skills",
      title: "Domain Specialization & Frameworks",
      description: "Acquire hands-on technical proficiency with modern industry-standard toolkits.",
      items: [coreSkills[1]?.name || "Specialization Tech", advancedSkills[0]?.name || "System Design", "Version Control & Testing"],
      defaultStatus: "current"
    },
    {
      phase: "Phase 3: Portfolio & Real-world Projects",
      title: "Industry Capstone Projects",
      description: "Develop 2 comprehensive end-to-end portfolio projects with thorough documentation.",
      items: [`${title} Prototype Project`, "Database Integration & API Wiring", "Open Source Contribution"],
      defaultStatus: "upcoming"
    },
    {
      phase: "Phase 4: Placement & Certification",
      title: "Career Readiness & Placement Preparation",
      description: "Complete mock technical interviews, earn domain certifications, and finalize resume.",
      items: ["Industry Recognized Certification", "Mock Technical & Coding Assessment", "Resume & Portfolio Review"],
      defaultStatus: "upcoming"
    }
  ];

  const relatedCertifications = career.relatedCertifications?.length > 0 ? career.relatedCertifications : [
    `AWS / Azure Certified Developer Practitioner`,
    `Google Professional ${career.category} Specialist`,
    `Oracle / Meta Certified Associate`
  ];

  const relatedProjects = career.relatedProjects?.length > 0 ? career.relatedProjects : [
    {
      title: `Scalable ${title} Analytics Dashboard`,
      description: `Build an interactive dashboard displaying real-time data metrics, visual insights, and API service integration.`,
      techStack: `Python, React, Node.js, PostgreSQL`
    },
    {
      title: `Automated Pipeline & API Microservice`,
      description: `Implement a containerized microservice pipeline featuring automated data validation and deployment.`,
      techStack: `Docker, FastAPI, MongoDB, REST API`
    }
  ];

  const interviewPrep = career.interviewPrep?.length > 0 ? career.interviewPrep : [
    `Practice core algorithms and data structure problem solving daily.`,
    `Review system design patterns, scalability bottlenecks, and database normalization.`,
    `Prepare STAR-method behavioral stories highlighting technical leadership and problem-solving.`
  ];

  return {
    ...career.toObject ? career.toObject() : career,
    roleDescription: career.roleDescription || career.shortDescription,
    coreSkills,
    advancedSkills,
    optionalSkills,
    typicalResponsibilities,
    recommendedRoadmap,
    relatedCertifications,
    relatedProjects,
    interviewPrep
  };
};

// ── 1. GET Academic Advisor Recommendations ─────────────────────────────────────
const getAdvisorRecommendations = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const profile = await CollegeStudentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "College student profile not found. Please complete profile onboarding first."
      });
    }

    let careers = await CollegeCareerCatalog.find();
    if (!careers || careers.length === 0) {
      const { seedCollegeCareers } = require("../utils/collegeCareerSeeder");
      await seedCollegeCareers();
      careers = await CollegeCareerCatalog.find();
    }

    const evaluatedRecommendations = careers.map(c => evaluateCareerMatch(profile, c));
    evaluatedRecommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);

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
      console.warn("Failed to log recommendation history snapshot:", recErr.message);
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
        targetCareer: profile.targetCareer,
        profileCompletion: profile.profileCompletion
      },
      targetCareer: profile.targetCareer || evaluatedRecommendations[0]?.title,
      recommendations: evaluatedRecommendations,
      assessedAt: new Date()
    });
  } catch (error) {
    console.error("Get advisor recommendations error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── 2. GET Single Career Details ──────────────────────────────────────────────
const getCareerDetail = async (req, res) => {
  try {
    const { slug } = req.params;
    let career = await CollegeCareerCatalog.findOne({ slug });
    if (!career) {
      career = await CollegeCareerCatalog.findOne({ title: new RegExp(slug.replace(/-/g, ' '), 'i') });
    }

    if (!career) {
      return res.status(404).json({ success: false, message: "Career path not found" });
    }

    const userId = req.student?._id || req.user?._id || req.student?.id;
    const profile = userId ? await CollegeStudentProfile.findOne({ userId }) : null;
    const matchAnalysis = profile ? evaluateCareerMatch(profile, career) : null;

    const fullDetails = getComprehensiveCareerDetails(career);

    res.status(200).json({
      success: true,
      career: fullDetails,
      matchAnalysis
    });
  } catch (error) {
    console.error("Get career detail error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch career details" });
  }
};

// ── 3. SET Target Career ──────────────────────────────────────────────────────
const setTargetCareer = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const { targetCareer } = req.body;

    if (!targetCareer) {
      return res.status(400).json({ success: false, message: "targetCareer title is required" });
    }

    const profile = await CollegeStudentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    profile.targetCareer = targetCareer;
    if (!profile.careerInterests.includes(targetCareer)) {
      profile.careerInterests.unshift(targetCareer);
    }
    await profile.save();

    res.status(200).json({
      success: true,
      message: `Target career set to "${targetCareer}" successfully`,
      targetCareer: profile.targetCareer
    });
  } catch (error) {
    console.error("Set target career error:", error);
    res.status(500).json({ success: false, message: "Failed to set target career" });
  }
};

// ── 4. GET Student Skill Gap Analysis ─────────────────────────────────────────
const getStudentSkillGap = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const profile = await CollegeStudentProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    const targetTitle = profile.targetCareer || profile.careerInterests?.[0] || profile.specialization || profile.domain || "Domain Specialist";
    let career = await CollegeCareerCatalog.findOne({ title: targetTitle });
    if (!career) {
      const domSearch = profile.domain || profile.specialization || profile.field || "";
      career = await CollegeCareerCatalog.findOne({
        $or: [
          { domain: new RegExp(domSearch, "i") },
          { field: new RegExp(domSearch, "i") },
          { title: new RegExp(domSearch, "i") }
        ]
      });
    }

    const fullCareer = getComprehensiveCareerDetails(career || { title: targetTitle, domain: profile.domain });
    const userSkills = (profile.skills || []).map(s => s.toLowerCase());
    const userSubjects = (profile.subjects || []).map(s => s.toLowerCase());

    const baseline = profile.onboardingBaseline || {};
    const demonstratedStrengths = (baseline.strengths || []).map(s => s.toLowerCase());
    const demonstratedWeaknesses = (baseline.areasToStrengthen || []).map(s => s.toLowerCase());

    const strong = [];
    const developing = [];
    const missing = [];

    const allCareerSkills = [
      ...fullCareer.coreSkills.map(s => ({ name: s.name, type: "Core", reqProf: s.suggestedProficiency })),
      ...fullCareer.advancedSkills.map(s => ({ name: s.name, type: "Advanced", reqProf: s.suggestedProficiency })),
      ...fullCareer.optionalSkills.map(s => ({ name: s.name, type: "Optional", reqProf: s.suggestedProficiency }))
    ];

    allCareerSkills.forEach(skillObj => {
      const sName = skillObj.name;
      const sLower = sName.toLowerCase();

      const isDemonstratedStrength = demonstratedStrengths.some(st => st.includes(sLower) || sLower.includes(st));
      const isDemonstratedWeakness = demonstratedWeaknesses.some(w => w.includes(sLower) || sLower.includes(w));
      const hasSelfReportedSkill = userSkills.some(us => us.includes(sLower) || sLower.includes(us));
      const hasSubject = userSubjects.some(sub => sub.includes(sLower) || sLower.includes(sub));

      if (isDemonstratedStrength) {
        strong.push({ ...skillObj, status: "Strong", currentProficiency: "Advanced", source: "Assessed Demonstration" });
      } else if (hasSelfReportedSkill && !isDemonstratedWeakness) {
        strong.push({ ...skillObj, status: "Strong", currentProficiency: "Intermediate", source: "Self-Reported" });
      } else if (isDemonstratedWeakness || hasSubject) {
        developing.push({ ...skillObj, status: "Developing", currentProficiency: "Intermediate", source: "Needs Strengthening" });
      } else {
        missing.push({ ...skillObj, status: "Missing", currentProficiency: "Needs Learning", source: "Skill Gap" });
      }
    });

    const total = allCareerSkills.length || 1;
    const readinessScore = Math.round(((strong.length * 1.0 + developing.length * 0.5) / total) * 100);

    res.status(200).json({
      success: true,
      targetCareer: fullCareer.title,
      readinessScore,
      skills: {
        strong,
        developing,
        missing
      },
      baselineAssessment: {
        currentBaseline: baseline.currentBaseline || "Baseline Not Completed",
        scorePercentage: baseline.scorePercentage || 0,
        selfReportVsAssessedMatrix: baseline.selfReportVsAssessedMatrix || []
      },
      summary: {
        acquiredCount: strong.length,
        developingCount: developing.length,
        missingCount: missing.length
      }
    });
  } catch (error) {
    console.error("Get student skill gap error:", error);
    res.status(500).json({ success: false, message: "Failed to compute skill gap analysis" });
  }
};

// ── 5. GET & UPDATE Learning Roadmap ──────────────────────────────────────────
const getStudentRoadmap = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const profile = await CollegeStudentProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    const targetTitle = profile.targetCareer || profile.careerInterests?.[0] || profile.specialization || profile.domain || "Domain Specialist";
    let career = await CollegeCareerCatalog.findOne({ title: targetTitle });
    if (!career) {
      const domSearch = profile.domain || profile.specialization || profile.field || "";
      career = await CollegeCareerCatalog.findOne({
        $or: [
          { domain: new RegExp(domSearch, "i") },
          { field: new RegExp(domSearch, "i") },
          { title: new RegExp(domSearch, "i") }
        ]
      });
    }

    const fullCareer = getComprehensiveCareerDetails(career || { title: targetTitle, domain: profile.domain });
    const milestones = fullCareer.recommendedRoadmap;

    res.status(200).json({
      success: true,
      targetCareer: fullCareer.title,
      milestones,
      profileTarget: profile.targetCareer
    });
  } catch (error) {
    console.error("Get student roadmap error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch roadmap" });
  }
};

// ── 6. RUN Acceptance Test Profiles Verification ─────────────────────────────
const runAcceptanceTestProfiles = async (req, res) => {
  try {
    let careers = await CollegeCareerCatalog.find();
    if (!careers || careers.length === 0) {
      const { seedCollegeCareers } = require("../utils/collegeCareerSeeder");
      await seedCollegeCareers();
      careers = await CollegeCareerCatalog.find();
    }

    const testProfiles = [
      {
        name: "CSE Student",
        field: "engineering",
        degreeProgramme: "B.E. Computer Science and Engineering",
        domain: "Computer Science",
        specialization: "Full Stack Development",
        cgpa: "8.8",
        skills: ["Python", "Java", "React", "Data Structures"],
        careerInterests: ["Software Developer", "Full Stack Engineer"]
      },
      {
        name: "Mechanical Student",
        field: "engineering",
        degreeProgramme: "B.E. Mechanical Engineering",
        domain: "Mechanical Engineering",
        specialization: "CAD / CAM Product Design",
        cgpa: "8.2",
        skills: ["CAD / 3D Modeling (AutoCAD/SolidWorks)", "Thermodynamics", "ANSYS"],
        careerInterests: ["Mechanical Engineer", "Robotics Engineer"]
      },
      {
        name: "ECE Student",
        field: "engineering",
        degreeProgramme: "B.E. Electronics and Communication",
        domain: "Electronics and Communication",
        specialization: "Embedded Systems & VLSI",
        cgpa: "8.4",
        skills: ["VLSI Design", "Microcontrollers", "Embedded C", "Signal Processing"],
        careerInterests: ["Computer Hardware Engineer", "Robotics Engineer"]
      },
      {
        name: "Data Science Student",
        field: "engineering",
        degreeProgramme: "B.Tech Data Science & AI",
        domain: "Data Science",
        specialization: "Machine Learning & Deep Learning",
        cgpa: "9.0",
        skills: ["Python / Data Science", "AI & Machine Learning", "SQL / Databases", "Statistics"],
        careerInterests: ["Data Scientist", "Machine Learning Engineer"]
      }
    ];

    const results = testProfiles.map(tp => {
      const recs = careers.map(c => evaluateCareerMatch(tp, c));
      recs.sort((a, b) => b.matchPercentage - a.matchPercentage);
      return {
        profileName: tp.name,
        degree: tp.degreeProgramme,
        topRecommendations: recs.slice(0, 3).map(r => ({
          title: r.title,
          matchPercentage: r.matchPercentage,
          matchCategory: r.matchCategory,
          whyFits: r.whyFits
        }))
      };
    });

    res.status(200).json({
      success: true,
      message: "Acceptance test profiles evaluated successfully",
      testResults: results
    });
  } catch (error) {
    console.error("Acceptance test run error:", error);
    res.status(500).json({ success: false, message: "Failed to run acceptance test profiles" });
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
        roleDescription: c.roleDescription || c.shortDescription,
        typicalWorkArea: c.typicalWorkArea,
        requiredSkills: c.requiredSkills,
        matchedSkills: evalData ? evalData.matchedSkills : [],
        skillGaps: evalData ? evalData.skillGaps : c.requiredSkills,
        matchPercentage: evalData ? evalData.matchPercentage : null,
        matchCategory: evalData ? evalData.matchCategory : null,
        whyFits: evalData ? evalData.whyFits : [],
        skillsToImprove: evalData ? evalData.skillsToImprove : [],
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
    const {
      id, title, category, shortDescription, roleDescription, typicalWorkArea,
      requiredFields, requiredDegrees, requiredDomains, requiredSpecializations,
      requiredSkills, coreSkills, advancedSkills, optionalSkills, skillsToDevelop,
      suggestedSubjects, suggestedNextSteps, workSectors, growthOutlook,
      typicalResponsibilities, recommendedRoadmap, relatedCertifications, relatedProjects, interviewPrep
    } = req.body;

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
    if (roleDescription !== undefined) career.roleDescription = roleDescription;
    if (typicalWorkArea !== undefined) career.typicalWorkArea = typicalWorkArea;
    if (requiredFields !== undefined) career.requiredFields = requiredFields;
    if (requiredDegrees !== undefined) career.requiredDegrees = requiredDegrees;
    if (requiredDomains !== undefined) career.requiredDomains = requiredDomains;
    if (requiredSpecializations !== undefined) career.requiredSpecializations = requiredSpecializations;
    if (requiredSkills !== undefined) career.requiredSkills = requiredSkills;
    if (coreSkills !== undefined) career.coreSkills = coreSkills;
    if (advancedSkills !== undefined) career.advancedSkills = advancedSkills;
    if (optionalSkills !== undefined) career.optionalSkills = optionalSkills;
    if (skillsToDevelop !== undefined) career.skillsToDevelop = skillsToDevelop;
    if (suggestedSubjects !== undefined) career.suggestedSubjects = suggestedSubjects;
    if (suggestedNextSteps !== undefined) career.suggestedNextSteps = suggestedNextSteps;
    if (workSectors !== undefined) career.workSectors = workSectors;
    if (growthOutlook !== undefined) career.growthOutlook = growthOutlook;
    if (typicalResponsibilities !== undefined) career.typicalResponsibilities = typicalResponsibilities;
    if (recommendedRoadmap !== undefined) career.recommendedRoadmap = recommendedRoadmap;
    if (relatedCertifications !== undefined) career.relatedCertifications = relatedCertifications;
    if (relatedProjects !== undefined) career.relatedProjects = relatedProjects;
    if (interviewPrep !== undefined) career.interviewPrep = interviewPrep;

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
  getCareerDetail,
  setTargetCareer,
  getStudentSkillGap,
  getStudentRoadmap,
  runAcceptanceTestProfiles,
  compareCareers,
  getAllCareersAdmin,
  adminSaveCareer,
  adminDeleteCareer
};
