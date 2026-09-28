const GraduateProfile = require("../models/GraduateProfile");
const User = require("../models/User");
const CollegeCareerCatalog = require("../models/CollegeCareerCatalog");
const Exam = require("../models/Exam");

// ── Profile Completion Calculator ─────────────────────────────────────────────
const calculateProfileCompletion = (profile) => {
  let score = 0;
  if (profile.degree) score += 15;
  if (profile.domain) score += 10;
  if (profile.college) score += 10;
  if (profile.graduationYear) score += 5;
  if (profile.technicalSkills && profile.technicalSkills.length > 0) score += 15;
  if (profile.softSkills && profile.softSkills.length > 0) score += 5;
  if (profile.tools && profile.tools.length > 0) score += 5;
  if (profile.primaryCareerDirection) score += 10;
  if (profile.projects && profile.projects.length > 0) score += 10;
  if (profile.internships && profile.internships.length > 0) score += 5;
  if (profile.preferredRoles && profile.preferredRoles.length > 0) score += 5;
  if (profile.onboardingCompleted) score += 5;
  return Math.min(100, score);
};

// ── Career Readiness Score Calculator ─────────────────────────────────────────
const calculateReadinessScore = (profile) => {
  let score = 30; // baseline for degree completion
  const techCount = (profile.technicalSkills || []).length;
  score += Math.min(25, techCount * 5);

  const projectsCount = (profile.projects || []).length;
  score += Math.min(20, projectsCount * 10);

  const internCount = (profile.internships || []).length;
  score += Math.min(15, internCount * 15);

  if (profile.resumeUrl) score += 5;
  if (profile.certifications && profile.certifications.length > 0) score += 5;

  return Math.min(100, score);
};

// ── Helper: Evaluate Best-Fit Careers & Switching Advice ──────────────────────
const generateCareerMatches = async (profile) => {
  const userDomain = (profile.domain || "").toLowerCase();
  const userDegree = (profile.degree || "").toLowerCase();
  const userSkills = (profile.technicalSkills || []).map(s => s.name.toLowerCase());
  const userTools = (profile.tools || []).map(t => t.toLowerCase());
  const allUserSkills = [...userSkills, ...userTools];
  const userInterests = (profile.interests || []).map(i => i.toLowerCase());

  // Fetch available careers from catalog
  let careers = await CollegeCareerCatalog.find({}).lean();
  if (!careers || careers.length === 0) {
    // Built-in rich fallback catalog if DB catalog is empty
    careers = [
      {
        title: "Full Stack Software Developer",
        slug: "full-stack-developer",
        category: "Software & Computing",
        shortDescription: "Designs and builds end-to-end web and cloud applications using modern frontend and backend frameworks.",
        requiredSkills: ["JavaScript", "React", "Node.js", "SQL", "Git", "REST APIs"],
        growthOutlook: "Very High Demand",
        requiredDomains: ["Computer Science & Engineering", "Information Technology", "Electronics"]
      },
      {
        title: "Data Analyst / Analytics Consultant",
        slug: "data-analyst",
        category: "AI & Data Science",
        shortDescription: "Transforms complex datasets into business intelligence, reports, and predictive models.",
        requiredSkills: ["Python", "SQL", "Power BI", "Excel", "Statistics", "Data Visualization"],
        growthOutlook: "High Growth",
        requiredDomains: ["Data Science", "Computer Science", "Mathematics", "Commerce", "Engineering"]
      },
      {
        title: "AI / Machine Learning Engineer",
        slug: "ml-engineer",
        category: "AI & Data Science",
        shortDescription: "Builds intelligent algorithms, neural network pipelines, and automated reasoning models.",
        requiredSkills: ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "SQL", "Linear Algebra"],
        growthOutlook: "Exponential Growth",
        requiredDomains: ["Artificial Intelligence", "Computer Science", "Data Science"]
      },
      {
        title: "Mechanical Design & Simulation Engineer",
        slug: "mechanical-design-engineer",
        category: "Core Engineering",
        shortDescription: "Develops CAD models, structural analysis, and CFD simulations for industrial machinery and automotive systems.",
        requiredSkills: ["AutoCAD", "SolidWorks", "Finite Element Analysis (FEA)", "Thermodynamics", "GD&T"],
        growthOutlook: "Steady Demand",
        requiredDomains: ["Mechanical Engineering", "Automotive Engineering"]
      },
      {
        title: "Embedded Systems & IoT Engineer",
        slug: "embedded-iot-engineer",
        category: "Core Engineering",
        shortDescription: "Develops firmware, microcontrollers, and connected edge devices for smart hardware systems.",
        requiredSkills: ["C/C++", "Microcontrollers", "Embedded Systems", "RTOS", "PCB Design"],
        growthOutlook: "High Growth",
        requiredDomains: ["Electrical & Electronics Engineering", "Electronics & Communication"]
      },
      {
        title: "Business & Financial Analyst",
        slug: "financial-analyst",
        category: "Management & Finance",
        shortDescription: "Conducts corporate valuation, financial modeling, and risk forecasting for enterprises.",
        requiredSkills: ["Financial Analysis", "Excel", "Tally", "Financial Modeling", "Corporate Finance"],
        growthOutlook: "High Demand",
        requiredDomains: ["Finance & Accounting", "Commerce", "Management"]
      }
    ];
  }

  const results = [];

  for (const career of careers) {
    const cTitle = career.title.toLowerCase();
    const cCat = career.category.toLowerCase();
    const reqSkills = career.requiredSkills || [];
    const reqDomains = (career.requiredDomains || []).map(d => d.toLowerCase());

    let matchScore = 50; // base score
    const matchingSkills = [];
    const missingSkills = [];

    // 1. Skill Match (40% Weight)
    reqSkills.forEach(req => {
      const rLower = req.toLowerCase();
      const hasSkill = allUserSkills.some(u => u.includes(rLower) || rLower.includes(u));
      if (hasSkill) {
        matchingSkills.push(req);
      } else {
        missingSkills.push(req);
      }
    });

    if (reqSkills.length > 0) {
      matchScore += Math.round((matchingSkills.length / reqSkills.length) * 30);
    }

    // 2. Domain Alignment (20% Weight)
    const isDirectDomainMatch = reqDomains.some(d => userDomain.includes(d) || d.includes(userDomain));
    if (isDirectDomainMatch) {
      matchScore += 20;
    } else {
      matchScore += 5; // potential cross-domain career switch
    }

    // 3. Interest & Career Direction Match (10% Weight)
    const matchesInterest = userInterests.some(i => cTitle.includes(i) || cCat.includes(i));
    if (matchesInterest) matchScore += 10;

    matchScore = Math.min(96, Math.max(55, matchScore));

    // Career Switching Logic
    const isCareerSwitch = !isDirectDomainMatch && (userDomain.length > 0);
    let transitionGuidance = null;

    if (isCareerSwitch) {
      transitionGuidance = {
        isCareerSwitch: true,
        originalDomain: profile.domain || "Your Current Degree",
        targetDomain: career.category,
        transitionDifficulty: matchScore >= 70 ? "Moderate" : "Challenging",
        transferableSkills: matchingSkills.length > 0 ? matchingSkills : ["Problem Solving", "Analytical Thinking"],
        advice: `Transitioning from ${profile.domain || "your background"} into ${career.title} is achievable by focusing on your transferable skills and building 2-3 portfolio projects covering: ${missingSkills.slice(0, 3).join(", ")}.`
      };
    }

    results.push({
      title: career.title,
      slug: career.slug || career.title.toLowerCase().replace(/\s+/g, "-"),
      category: career.category,
      shortDescription: career.shortDescription,
      growthOutlook: career.growthOutlook || "High Demand",
      matchScore,
      whyItMatches: isDirectDomainMatch
        ? `Direct alignment with your ${profile.domain} degree and core skills.`
        : `Strong potential match leveraging your ${matchingSkills.join(", ") || "analytical fundamentals"}.`,
      matchingSkills,
      missingSkills,
      transitionGuidance,
      nextStep: `Build portfolio projects in ${missingSkills.slice(0, 2).join(" & ") || "core industry tools"}`
    });
  }

  // Sort descending by match score
  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
};

// ── GET /api/graduate/profile ──────────────────────────────────────────────────
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    let profile = await GraduateProfile.findOne({ userId });
    if (!profile) {
      profile = new GraduateProfile({
        userId,
        currentStep: 1,
        profileCompletion: 0,
        careerReadinessScore: 40,
        onboardingCompleted: false
      });
      await profile.save();
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error("Get graduate profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Academic Combination Server-Side Validator ──────────────────────────────
const validateAcademicCombination = (field, degree, domain) => {
  if (!field || !degree || !domain) return true;
  const fLower = String(field).toLowerCase();
  const domLower = String(domain).toLowerCase();

  if (fLower.includes("medical") && (domLower.includes("electronics") || domLower.includes("mechanical") || domLower.includes("civil") || domLower.includes("computer science"))) {
    return false;
  }
  if (fLower.includes("commerce") && (domLower.includes("mechanical") || domLower.includes("civil") || domLower.includes("electronics"))) {
    return false;
  }
  if (fLower.includes("law") && (domLower.includes("vlsi") || domLower.includes("embedded") || domLower.includes("mechanical"))) {
    return false;
  }
  return true;
};

// ── POST /api/graduate/profile/step ───────────────────────────────────────────
exports.saveOnboardingStep = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const stepData = req.body;
    let profile = await GraduateProfile.findOne({ userId });
    if (!profile) profile = new GraduateProfile({ userId });

    // Merge provided fields
    Object.keys(stepData).forEach(key => {
      if (stepData[key] !== undefined) {
        profile[key] = stepData[key];
      }
    });

    if (!validateAcademicCombination(profile.field, profile.degree, profile.domain)) {
      return res.status(400).json({
        success: false,
        message: "Invalid academic combination: Major Academic Field, Degree, and Domain must be academically consistent."
      });
    }

    profile.profileCompletion = calculateProfileCompletion(profile);
    profile.careerReadinessScore = calculateReadinessScore(profile);

    await profile.save();
    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error("Save graduate onboarding step error:", error);
    res.status(500).json({ success: false, message: "Failed to save step" });
  }
};

// ── POST /api/graduate/onboarding/complete ────────────────────────────────────
exports.completeOnboarding = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    let profile = await GraduateProfile.findOne({ userId });
    if (!profile) profile = new GraduateProfile({ userId });

    // Merge any final fields submitted
    if (req.body) {
      Object.keys(req.body).forEach(k => {
        if (req.body[k] !== undefined) profile[k] = req.body[k];
      });
    }

    profile.onboardingCompleted = true;
    profile.currentStep = 6;
    profile.profileCompletion = calculateProfileCompletion(profile);
    profile.careerReadinessScore = calculateReadinessScore(profile);

    // Pre-calculate recommendations
    const matches = await generateCareerMatches(profile);
    profile.cachedRecommendations = {
      bestFitCareers: matches.slice(0, 5)
    };

    await profile.save();

    // Mark User model as onboarding completed & graduate
    await User.findByIdAndUpdate(userId, {
      userType: "graduate",
      onboardingCompleted: true
    });

    res.status(200).json({
      success: true,
      message: "Graduate onboarding finalized successfully",
      profile,
      summary: {
        degree: `${profile.degree || ""} in ${profile.domain || ""}`,
        careerDirection: profile.primaryCareerDirection,
        readinessScore: profile.careerReadinessScore,
        topCareer: matches[0]?.title || "Professional Career"
      }
    });
  } catch (error) {
    console.error("Complete graduate onboarding error:", error);
    res.status(500).json({ success: false, message: "Failed to finalize onboarding" });
  }
};

// ── GET /api/graduate/dashboard ───────────────────────────────────────────────
exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const profile = await GraduateProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Graduate profile not found" });
    }

    const careerMatches = await generateCareerMatches(profile);
    const topCareer = careerMatches[0] || null;

    // Weekly action plan generated dynamically based on profile
    const weeklyPlan = [
      {
        task: `Practice core interview questions for ${topCareer ? topCareer.title : "your target role"}`,
        category: "Interview Prep",
        status: "pending"
      },
      {
        task: `Build a mini portfolio project covering ${topCareer?.missingSkills?.[0] || "modern tools"}`,
        category: "Upskilling",
        status: "pending"
      },
      {
        task: "Update Resume Projects section with measurable outcomes",
        category: "Placement Hub",
        status: "pending"
      }
    ];

    if (profile.examInterest === "Yes" || profile.examInterest === "Maybe") {
      weeklyPlan.push({
        task: `Review syllabus and past question patterns for ${profile.selectedExams?.[0]?.examName || "Competitive Exams"}`,
        category: "Exams",
        status: "pending"
      });
    }

    res.status(200).json({
      success: true,
      profile,
      careerReadinessScore: profile.careerReadinessScore || calculateReadinessScore(profile),
      primaryDirection: profile.primaryCareerDirection,
      topCareer,
      careerMatches: careerMatches.slice(0, 4),
      skillGapSummary: {
        strongSkills: (profile.technicalSkills || []).filter(s => s.proficiency === "Advanced").map(s => s.name),
        developingSkills: (profile.technicalSkills || []).filter(s => s.proficiency !== "Advanced").map(s => s.name),
        missingCriticalSkills: topCareer ? topCareer.missingSkills.slice(0, 3) : []
      },
      examTracker: profile.examInterest !== "No" ? {
        active: true,
        exams: profile.selectedExams || []
      } : { active: false },
      higherStudiesTracker: profile.higherStudyInterest !== "No" ? {
        active: true,
        preferredDegrees: profile.preferredHigherDegrees || []
      } : { active: false },
      weeklyPlan
    });
  } catch (error) {
    console.error("Get graduate dashboard error:", error);
    res.status(500).json({ success: false, message: "Failed to load dashboard" });
  }
};

// ── GET /api/graduate/careers ─────────────────────────────────────────────────
exports.getCareerRecommendations = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const profile = await GraduateProfile.findOne({ userId });
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    const careers = await generateCareerMatches(profile);
    res.status(200).json({ success: true, careers });
  } catch (error) {
    console.error("Get graduate career recommendations error:", error);
    res.status(500).json({ success: false, message: "Failed to load recommendations" });
  }
};

// ── GET /api/graduate/skill-gap ───────────────────────────────────────────────
exports.getSkillGapAnalysis = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const profile = await GraduateProfile.findOne({ userId });
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    const careers = await generateCareerMatches(profile);
    const targetCareer = careers[0];

    const userSkills = (profile.technicalSkills || []).map(s => ({
      name: s.name,
      proficiency: s.proficiency
    }));

    res.status(200).json({
      success: true,
      targetCareer: targetCareer?.title || "Target Career",
      matchScore: targetCareer?.matchScore || 70,
      skillsAvailable: targetCareer?.matchingSkills || [],
      skillsNeedingImprovement: targetCareer?.missingSkills || [],
      recommendedLearningOrder: [
        ...(targetCareer?.missingSkills || []).map((s, idx) => ({
          step: idx + 1,
          skill: s,
          estimatedWeeks: 2 + idx,
          resourceType: idx === 0 ? "Hands-on Tutorials & Docs" : "Applied Portfolio Project"
        }))
      ],
      userSkills
    });
  } catch (error) {
    console.error("Get skill gap analysis error:", error);
    res.status(500).json({ success: false, message: "Failed to analyze skill gap" });
  }
};

// ── GET /api/graduate/exams ───────────────────────────────────────────────────
exports.getExamsGuide = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const profile = await GraduateProfile.findOne({ userId });

    const domain = (profile?.domain || "").toLowerCase();

    // Curated catalog of relevant competitive exams
    const exams = [
      {
        name: "GATE (Graduate Aptitude Test in Engineering)",
        category: "Engineering & Science",
        eligibleDegrees: ["B.E / B.Tech", "M.Sc", "MCA"],
        conductingBody: "IITs / IISc Bangalore",
        frequency: "Once a year (February)",
        purpose: "M.Tech / Ph.D in IITs/NITs and Direct PSU Recruitment (ONGC, IOCL, NTPC, BHEL)",
        overview: "A prestigious national examination testing comprehensive understanding of undergraduate engineering subjects.",
        syllabusKeywords: ["Core Engineering Mathematics", "Data Structures / Algorithms / Digital Logic", "Engineering Sciences"],
        officialWebsite: "https://gate.iitk.ac.in",
        preparationRoadmap: "Phase 1: Syllabus fundamentals (3 months) → Phase 2: Previous year questions (2 months) → Phase 3: Mock tests & revision (1 month)"
      },
      {
        name: "CAT (Common Admission Test)",
        category: "Management",
        eligibleDegrees: ["Any Graduate Degree (Min 50% marks)"],
        conductingBody: "IIMs",
        frequency: "Once a year (November)",
        purpose: "Admission to premier MBA / PGDM programmes at IIMs, FMS, SPJIMR, etc.",
        overview: "Tests Quantitative Aptitude, Data Interpretation & Logical Reasoning, and Verbal Ability.",
        syllabusKeywords: ["Quantitative Aptitude", "Data Interpretation", "Logical Reasoning", "Verbal Ability & Reading Comprehension"],
        officialWebsite: "https://iimcat.ac.in",
        preparationRoadmap: "Focus on daily reading comprehension, mental math speed, and sectional timing mocks."
      },
      {
        name: "UPSC Civil Services Examination (CSE)",
        category: "Public Sector & Governance",
        eligibleDegrees: ["Any Recognized Graduate Degree"],
        conductingBody: "Union Public Service Commission",
        frequency: "Once a year (May - Prelims, Sep - Mains)",
        purpose: "Direct recruitment to IAS, IPS, IFS, IRS, and central civil posts",
        overview: "Consists of Prelims (General Studies + CSAT), Mains (9 written papers), and Personality Interview.",
        syllabusKeywords: ["History, Geography, Polity", "Economics & Environment", "Current Affairs", "Optional Subject"],
        officialWebsite: "https://upsc.gov.in",
        preparationRoadmap: "NCERT foundation reading (4 months) → Standard reference texts + answer writing (6 months) → Test series (3 months)"
      },
      {
        name: "SSC CGL (Combined Graduate Level)",
        category: "Central Government Jobs",
        eligibleDegrees: ["Any Graduate Degree"],
        conductingBody: "Staff Selection Commission",
        frequency: "Annual",
        purpose: "Group B and C officers in Central Ministries, Income Tax, Customs, and CAG",
        overview: "Tier 1 and Tier 2 computer-based examinations testing Math, Reasoning, English, and General Awareness.",
        syllabusKeywords: ["Quantitative Aptitude", "General Intelligence", "English Comprehension", "General Awareness"],
        officialWebsite: "https://ssc.nic.in",
        preparationRoadmap: "Consistent daily problem sets in Arithmetic, English grammar, and current affairs."
      },
      {
        name: "GRE & IELTS / TOEFL (Higher Studies Abroad)",
        category: "Study Abroad",
        eligibleDegrees: ["Any Graduate Degree"],
        conductingBody: "ETS / British Council / IDP",
        frequency: "Year-round",
        purpose: "MS and PhD admissions in USA, Europe, Canada, Australia, and Singapore",
        overview: "GRE evaluates analytical writing, quantitative reasoning, and verbal reasoning. IELTS tests English language proficiency.",
        syllabusKeywords: ["Vocabulary & Reading Comprehension", "Quantitative Reasoning", "Analytical Writing"],
        officialWebsite: "https://www.ets.org/gre",
        preparationRoadmap: "Vocabulary building + Quant practice (8–12 weeks) followed by full-length computer-based mocks."
      }
    ];

    res.status(200).json({
      success: true,
      selectedExams: profile?.selectedExams || [],
      examInterest: profile?.examInterest || "No",
      exams
    });
  } catch (error) {
    console.error("Get exams guide error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch exams guide" });
  }
};

// ── GET /api/graduate/higher-studies ──────────────────────────────────────────
exports.getHigherStudiesGuide = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const profile = await GraduateProfile.findOne({ userId });

    const degree = (profile?.degree || "").toLowerCase();
    const domain = (profile?.domain || "").toLowerCase();

    // Personalized higher study options based on degree
    let programmes = [];

    if (degree.includes("b.e") || degree.includes("b.tech") || domain.includes("engineering") || domain.includes("computer")) {
      programmes = [
        {
          title: "M.Tech / M.E in Core / Specialized Engineering",
          duration: "2 Years",
          entranceExams: "GATE / TANCET / University Entrance",
          keyInstitutes: "IITs, NITs, Anna University, PSG Tech",
          careerOutcomes: "R&D Scientist, Specialized Core Engineer, Senior Architect, Academic Faculty",
          whyRecommended: "Deepens specialized engineering domain competence and qualifies for high-tier corporate R&D roles."
        },
        {
          title: "MS (Master of Science) Abroad",
          duration: "1.5 – 2 Years",
          entranceExams: "GRE, IELTS / TOEFL",
          keyInstitutes: "Top Global Universities (USA, Germany, Singapore, Canada)",
          careerOutcomes: "Global Tech Specialist, Research Scientist, International Silicon Valley / European Roles",
          whyRecommended: "Offers international exposure, hands-on lab projects, and global industry placement options."
        },
        {
          title: "MBA / Executive MBA",
          duration: "2 Years",
          entranceExams: "CAT, XAT, GMAT, MAT",
          keyInstitutes: "IIMs, XLRI, FMS Delhi, IIT Depts of Management Studies",
          careerOutcomes: "Product Manager, Management Consultant, Investment Banking, Strategy Lead",
          whyRecommended: "Ideal for engineering graduates aiming to transition into business strategy, product management, or leadership."
        }
      ];
    } else if (degree.includes("b.com") || degree.includes("bba") || domain.includes("commerce") || domain.includes("finance")) {
      programmes = [
        {
          title: "MBA in Finance / Operations / Marketing",
          duration: "2 Years",
          entranceExams: "CAT, XAT, CMAT, MAT",
          keyInstitutes: "IIMs, FMS, SPJIMR, Symbiosis",
          careerOutcomes: "Investment Banker, Brand Manager, Corporate Finance Specialist, Management Consultant",
          whyRecommended: "The premier postgraduate degree for accelerated growth in corporate management and finance."
        },
        {
          title: "M.Com / Master of Financial Economics",
          duration: "2 Years",
          entranceExams: "CUET PG / University Entrance",
          keyInstitutes: "Delhi School of Economics, Loyola College, Madras University",
          careerOutcomes: "Financial Analyst, Economic Researcher, College Lecturer (after UGC NET)",
          whyRecommended: "Strong foundation for academic research, government finance roles, and specialized banking."
        }
      ];
    } else {
      programmes = [
        {
          title: "MBA / PGDM in Business Administration",
          duration: "2 Years",
          entranceExams: "CAT, MAT, CMAT, XAT",
          keyInstitutes: "Top National B-Schools",
          careerOutcomes: "Business Manager, Operations Lead, HR Director, Startup Founder",
          whyRecommended: "Versatile postgraduate degree that opens opportunities across corporate sectors."
        },
        {
          title: "Specialized Master's Programme (M.Sc / M.A)",
          duration: "2 Years",
          entranceExams: "CUET PG / State University Exams",
          keyInstitutes: "Central & State Universities",
          careerOutcomes: "Specialized Domain Professional, Research Analyst, Educator",
          whyRecommended: "Deepens subject knowledge for specialized analytical and research careers."
        }
      ];
    }

    res.status(200).json({
      success: true,
      degreeCompleted: profile?.degree || "Graduate Degree",
      domain: profile?.domain || "General",
      programmes
    });
  } catch (error) {
    console.error("Get higher studies guide error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch higher studies guide" });
  }
};

// ── GET /api/graduate/roadmap ─────────────────────────────────────────────────
exports.getUpskillingRoadmap = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const profile = await GraduateProfile.findOne({ userId });

    const careers = await generateCareerMatches(profile || {});
    const targetCareer = careers[0] || { title: "Software Engineer", missingSkills: ["Modern Tools", "Portfolio Project"] };

    const roadmapPhases = [
      {
        phaseNumber: 1,
        title: "Phase 1: Strengthen Fundamentals & Core Concepts",
        duration: "Weeks 1–4",
        status: "in-progress",
        description: `Master fundamental principles and essential baseline competencies for ${targetCareer.title}.`,
        tasks: [
          "Complete foundational concepts check and skill diagnostic",
          `Master basics of ${targetCareer.missingSkills?.[0] || "core tools"}`,
          "Set up professional development environment (Git, IDE, Terminal)"
        ]
      },
      {
        phaseNumber: 2,
        title: "Phase 2: Tool Mastery & Applied Problem Solving",
        duration: "Weeks 5–8",
        status: "upcoming",
        description: `Build hands-on proficiency with required industry tools (${targetCareer.missingSkills?.slice(0, 3).join(", ") || "tools"}).`,
        tasks: [
          `Build structured modules using ${targetCareer.missingSkills?.[1] || "frameworks"}`,
          "Practice 30+ domain problems and scenario implementations",
          "Conduct code review and optimize performance efficiency"
        ]
      },
      {
        phaseNumber: 3,
        title: "Phase 3: Portfolio Projects & Real-World Evidence",
        duration: "Weeks 9–12",
        status: "upcoming",
        description: "Develop 2 comprehensive portfolio projects that demonstrate practical competence to hiring teams.",
        tasks: [
          `Build Project 1: Full-scale ${targetCareer.title} workflow application`,
          "Build Project 2: Problem-solving case study with clean GitHub documentation",
          "Publish live demo links and write concise architecture overview"
        ]
      },
      {
        phaseNumber: 4,
        title: "Phase 4: Placement Preparation & Career Transition",
        duration: "Weeks 13–16",
        status: "upcoming",
        description: "Optimize professional resume, practice technical & HR interviews, and begin targeted applications.",
        tasks: [
          "Complete ATS-friendly Resume with highlighted projects & impact metrics",
          "Practice 50+ role-specific interview questions",
          "Apply to 15+ curated graduate trainee, internship, or entry-level roles"
        ]
      }
    ];

    res.status(200).json({
      success: true,
      targetCareer: targetCareer.title,
      roadmapPhases
    });
  } catch (error) {
    console.error("Get upskilling roadmap error:", error);
    res.status(500).json({ success: false, message: "Failed to generate roadmap" });
  }
};
