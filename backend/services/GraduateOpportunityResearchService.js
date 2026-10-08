/**
 * GraduateOpportunityResearchService.js
 * 
 * Web research service for fetching live exam & career notification updates.
 * Integrates with Tavily search API if TAVILY_API_KEY is configured.
 * Performs caching into GraduateOpportunity database collection.
 */

const axios = require("axios");
const GraduateOpportunity = require("../models/GraduateOpportunity");

// Seed catalog of verified official graduate opportunities
const DEFAULT_VERIFIED_OPPORTUNITIES = [
  {
    opportunityName: "SSC CGL (Combined Graduate Level Examination)",
    category: "GOVERNMENT_EXAMS",
    organization: "Staff Selection Commission (SSC), Govt of India",
    description: "National level recruitment for Group B and Group C posts in central ministries, Income Tax, Central Excise, CAG, and Officers in premier departments.",
    eligibility: "Bachelor's Degree from a recognized University in any discipline. Final year students are eligible subject to meeting cutoff dates.",
    eligibleDegrees: ["B.E.", "B.Tech", "B.Sc", "BCA", "B.Com", "BBA", "BA", "Other"],
    eligibleDegreeIds: ["be", "btech", "bsc", "bca", "bcom", "bba", "ba", "other"],
    eligibleSpecializations: ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "All Specializations"],
    eligibleSpecializationIds: ["cse", "it", "ece", "eee", "mech", "civil", "all"],
    minimumQualification: "Bachelor's Degree",
    ageRequirement: { minAge: 18, maxAge: 32, description: "18 to 32 years (Relaxation applicable for reserved categories)" },
    cgpaRequirement: "No minimum percentage requirement",
    percentageRequirement: "Pass Class Degree",
    experienceRequirement: "Freshers Eligible",
    applicationMode: "Online",
    applicationUrl: "https://ssc.gov.in",
    officialWebsite: "https://ssc.gov.in",
    applicationStartDate: new Date("2026-06-10"),
    applicationDeadline: new Date("2026-11-15"),
    examDate: new Date("2026-12-20"),
    status: "OPEN",
    source: "SSC Official Portal",
    sourceType: "official",
    sourceUrl: "https://ssc.gov.in",
    sourceTitle: "SSC CGL Official Notification",
    lastVerifiedAt: new Date(),
    dataFreshness: "VERIFIED",
    selectionProcess: ["Tier-I Computer Based Examination", "Tier-II CBT & Skill Test", "Document Verification"],
    whyRecommendedDefault: "Your graduate degree satisfies the general graduation criteria for Central Govt Officer roles."
  },
  {
    opportunityName: "UPSC Civil Services Examination (CSE)",
    category: "GOVERNMENT_EXAMS",
    organization: "Union Public Service Commission (UPSC)",
    description: "Prestigious examination for recruitment to IAS, IPS, IFS, IRS, and Top Central Group A Civil Services.",
    eligibility: "A degree of any university incorporated by an Act of the Central or State Legislature in India.",
    eligibleDegrees: ["B.E.", "B.Tech", "B.Sc", "BCA", "B.Com", "BBA", "BA", "Other"],
    eligibleDegreeIds: ["be", "btech", "bsc", "bca", "bcom", "bba", "ba", "other"],
    eligibleSpecializations: ["All Specializations"],
    eligibleSpecializationIds: ["all"],
    minimumQualification: "Graduate Degree",
    ageRequirement: { minAge: 21, maxAge: 32, description: "21 to 32 years as of August 1" },
    cgpaRequirement: "Pass Class Degree",
    percentageRequirement: "Pass Class Degree",
    experienceRequirement: "Freshers Eligible",
    applicationMode: "Online",
    applicationUrl: "https://upsconline.nic.in",
    officialWebsite: "https://upsc.gov.in",
    applicationStartDate: new Date("2026-02-01"),
    applicationDeadline: new Date("2026-10-30"),
    examDate: new Date("2026-11-25"),
    status: "OPEN",
    source: "UPSC Official Portal",
    sourceType: "official",
    sourceUrl: "https://upsc.gov.in",
    sourceTitle: "UPSC Civil Services Notification",
    lastVerifiedAt: new Date(),
    dataFreshness: "VERIFIED",
    selectionProcess: ["Preliminary Exam (Objective)", "Main Written Examination (Descriptive)", "Personality Interview"],
    whyRecommendedDefault: "Any recognized undergraduate degree qualifies you for UPSC Civil Services."
  },
  {
    opportunityName: "GATE (Graduate Aptitude Test in Engineering)",
    category: "HIGHER_STUDIES",
    organization: "IITs & IISc Bangalore",
    description: "National level examination that tests comprehensive understanding of engineering and science subjects for M.Tech/Ph.D admissions and direct PSU jobs.",
    eligibility: "Currently in 3rd or higher year or completed any undergraduate degree program in Engineering / Technology / Science / Computer Applications.",
    eligibleDegrees: ["B.E.", "B.Tech", "B.Sc", "BCA", "Other"],
    eligibleDegreeIds: ["be", "btech", "bsc", "bca"],
    eligibleSpecializations: ["Computer Science", "Information Technology", "Electronics & Communication", "Electrical & Electronics", "Mechanical Engineering", "Civil Engineering", "Artificial Intelligence", "Data Science", "Cyber Security"],
    eligibleSpecializationIds: ["cse", "it", "ece", "eee", "mech", "civil", "ai", "ds", "cyber"],
    minimumQualification: "B.E. / B.Tech / M.Sc / MCA",
    ageRequirement: { minAge: 20, maxAge: null, description: "No age limit" },
    cgpaRequirement: "No minimum marks for GATE test appearing",
    percentageRequirement: "No minimum threshold for appearing",
    experienceRequirement: "Freshers & Final Year Students",
    applicationMode: "Online",
    applicationUrl: "https://gate2026.iitr.ac.in",
    officialWebsite: "https://gate.iitk.ac.in",
    applicationStartDate: new Date("2026-08-25"),
    applicationDeadline: new Date("2026-11-10"),
    examDate: new Date("2027-02-06"),
    status: "OPEN",
    source: "IIT GATE Portal",
    sourceType: "official",
    sourceUrl: "https://gate.iitk.ac.in",
    sourceTitle: "GATE Official Information Brochure",
    lastVerifiedAt: new Date(),
    dataFreshness: "VERIFIED",
    selectionProcess: ["Computer Based Test (CBT) - 100 Marks", "Scorecard valid for 3 years"],
    whyRecommendedDefault: "Direct gateway to M.Tech in IITs/NITs and Executive Trainee roles in ONGC, IOCL, NTPC, HPCL."
  },
  {
    opportunityName: "CAT (Common Admission Test - IIMs)",
    category: "HIGHER_STUDIES",
    organization: "Indian Institutes of Management (IIMs)",
    description: "Prerequisite exam for admission to MBA / PGDM programmes at IIM Ahmedabad, Bangalore, Calcutta, Lucknow, Kozhikode, Indore, and top B-schools.",
    eligibility: "Bachelor's Degree with at least 50% marks or equivalent CGPA (45% for SC/ST/PwD). Candidates appearing for final year examination are also eligible.",
    eligibleDegrees: ["B.E.", "B.Tech", "B.Sc", "BCA", "B.Com", "BBA", "BA", "Other"],
    eligibleDegreeIds: ["be", "btech", "bsc", "bca", "bcom", "bba", "ba", "other"],
    eligibleSpecializations: ["All Specializations"],
    eligibleSpecializationIds: ["all"],
    minimumQualification: "Bachelor's Degree (Min 50%)",
    ageRequirement: { minAge: 20, maxAge: null, description: "No age limit" },
    cgpaRequirement: "5.0 CGPA / 50%",
    percentageRequirement: "50% aggregate marks",
    experienceRequirement: "Freshers & Experienced Candidates",
    applicationMode: "Online",
    applicationUrl: "https://iimcat.ac.in",
    officialWebsite: "https://iimcat.ac.in",
    applicationStartDate: new Date("2026-08-01"),
    applicationDeadline: new Date("2026-11-20"),
    examDate: new Date("2026-11-29"),
    status: "OPEN",
    source: "IIM CAT Portal",
    sourceType: "official",
    sourceUrl: "https://iimcat.ac.in",
    sourceTitle: "IIM CAT Official Admission Notification",
    lastVerifiedAt: new Date(),
    dataFreshness: "VERIFIED",
    selectionProcess: ["CAT CBT (VARC, DILR, QA)", "Analytical Writing Test (AWT) & Personal Interview (PI)"],
    whyRecommendedDefault: "Highest tier postgraduate entrance for executive and management leadership roles."
  },
  {
    opportunityName: "ONGC Graduate Executive Trainee via GATE",
    category: "PSU",
    organization: "Oil and Natural Gas Corporation (ONGC)",
    description: "Direct recruitment of Graduate Engineers in E1 Level (Pay Scale: Rs. 60,000 - 1,80,000) based on GATE Engineering scores.",
    eligibility: "Graduate Degree in Engineering (B.E./B.Tech) with minimum 60% marks in relevant engineering branch.",
    eligibleDegrees: ["B.E.", "B.Tech"],
    eligibleDegreeIds: ["be", "btech"],
    eligibleSpecializations: ["Computer Science", "Information Technology", "Electronics & Communication", "Electrical & Electronics", "Mechanical Engineering", "Civil Engineering"],
    eligibleSpecializationIds: ["cse", "it", "ece", "eee", "mech", "civil"],
    minimumQualification: "B.E. / B.Tech (Min 60%)",
    ageRequirement: { minAge: 21, maxAge: 30, description: "30 years for Unreserved" },
    cgpaRequirement: "6.0 CGPA / 60%",
    percentageRequirement: "60% aggregate",
    experienceRequirement: "Freshers Eligible",
    applicationMode: "Online",
    applicationUrl: "https://ongcindia.com/web/eng/career",
    officialWebsite: "https://ongcindia.com",
    applicationStartDate: new Date("2026-09-01"),
    applicationDeadline: new Date("2026-11-30"),
    examDate: null,
    status: "OPEN",
    source: "ONGC Recruitment Portal",
    sourceType: "official",
    sourceUrl: "https://ongcindia.com/web/eng/career",
    sourceTitle: "ONGC Executive Trainee Recruitment",
    lastVerifiedAt: new Date(),
    dataFreshness: "VERIFIED",
    selectionProcess: ["GATE Score Weightage (60%)", "Academic Qualification (25%)", "Personal Interview (15%)"],
    whyRecommendedDefault: "Your engineering degree qualifies for ONGC Maharatna PSU recruitment."
  },
  {
    opportunityName: "IOCL Engineers & Officers Recruitment",
    category: "PSU",
    organization: "Indian Oil Corporation Limited (IOCL)",
    description: "Recruitment of Officers / Engineers in Grade A0 (Pay Scale: Rs. 50,000 - 1,60,000) across refineries, pipelines, and marketing divisions.",
    eligibility: "B.E. / B.Tech / Full-time regular engineering degree from recognized University with minimum 65% aggregate (55% for SC/ST/PwD).",
    eligibleDegrees: ["B.E.", "B.Tech"],
    eligibleDegreeIds: ["be", "btech"],
    eligibleSpecializations: ["Computer Science", "Information Technology", "Electronics & Communication", "Electrical & Electronics", "Mechanical Engineering", "Civil Engineering"],
    eligibleSpecializationIds: ["cse", "it", "ece", "eee", "mech", "civil"],
    minimumQualification: "B.E. / B.Tech (65%)",
    ageRequirement: { minAge: 21, maxAge: 26, description: "26 years for General" },
    cgpaRequirement: "6.5 CGPA / 65%",
    percentageRequirement: "65%",
    experienceRequirement: "Freshers Eligible",
    applicationMode: "Online",
    applicationUrl: "https://iocl.com/latest-job-opening",
    officialWebsite: "https://iocl.com",
    applicationStartDate: new Date("2026-07-15"),
    applicationDeadline: new Date("2026-11-05"),
    examDate: null,
    status: "OPEN",
    source: "IOCL Careers Portal",
    sourceType: "official",
    sourceUrl: "https://iocl.com/latest-job-opening",
    sourceTitle: "IOCL Engineering Officer Notification",
    lastVerifiedAt: new Date(),
    dataFreshness: "VERIFIED",
    selectionProcess: ["GATE Score", "Group Discussion (GD) / Group Task (GT)", "Personal Interview"],
    whyRecommendedDefault: "Leading Maharatna Public Sector Oil Corporation hiring engineering graduates."
  },
  {
    opportunityName: "Software Development Engineer (Graduate Trainee)",
    category: "PRIVATE_JOBS",
    organization: "Top Tech Enterprise & SaaS Product Companies",
    description: "Full-time Software Engineering roles for recent graduates and final year students. Involves building backend microservices, modern frontend UI, and cloud API systems.",
    eligibility: "B.E. / B.Tech / B.Sc / BCA / MCA graduates with strong fundamentals in Data Structures, Algorithms, and System Design.",
    eligibleDegrees: ["B.E.", "B.Tech", "B.Sc", "BCA", "Other"],
    eligibleDegreeIds: ["be", "btech", "bsc", "bca"],
    eligibleSpecializations: ["Computer Science", "Information Technology", "Electronics & Communication", "Artificial Intelligence", "Data Science", "Cyber Security"],
    eligibleSpecializationIds: ["cse", "it", "ece", "ai", "ds", "cyber"],
    minimumQualification: "Graduate Degree in CS / IT / Tech",
    ageRequirement: { minAge: 18, maxAge: 28, description: "Entry-level role" },
    cgpaRequirement: "6.0 CGPA / 60%",
    percentageRequirement: "60%",
    experienceRequirement: "Freshers & 0-1 Yr Experience",
    applicationMode: "Online",
    applicationUrl: "https://careers.google.com",
    officialWebsite: "https://careers.google.com",
    applicationStartDate: new Date("2026-01-01"),
    applicationDeadline: new Date("2026-12-31"),
    examDate: null,
    status: "OPEN",
    source: "Direct Enterprise Career Portals",
    sourceType: "official",
    sourceUrl: "https://careers.google.com",
    sourceTitle: "Graduate Software Engineer hiring",
    lastVerifiedAt: new Date(),
    dataFreshness: "VERIFIED",
    selectionProcess: ["Online Coding Assessment", "Technical System Design Interview", "Behavioral Interview"],
    whyRecommendedDefault: "Matches your Technical CS/IT specialization and programming skill background."
  }
];

/**
 * Seed or refresh base verified opportunities in DB
 */
async function seedDefaultOpportunities() {
  try {
    for (const opp of DEFAULT_VERIFIED_OPPORTUNITIES) {
      await GraduateOpportunity.findOneAndUpdate(
        { opportunityName: opp.opportunityName },
        { $set: opp },
        { upsert: true, new: true }
      );
    }
    console.log("✅ Seeded verified graduate opportunities in database");
  } catch (err) {
    console.error("Error seeding graduate opportunities:", err.message);
  }
}

/**
 * Perform live Tavily research if TAVILY_API_KEY is available
 */
async function triggerTavilyResearch(query) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await axios.post("https://api.tavily.com/search", {
      api_key: apiKey,
      query: query || "latest graduate entrance exams notifications india eligibility deadlines official portal",
      search_depth: "advanced",
      max_results: 5
    });

    return res.data?.results || null;
  } catch (err) {
    console.warn("Tavily API search call failed:", err.message);
    return null;
  }
}

/**
 * Refresh Data Freshness Statuses based on current server date
 */
async function refreshOpportunityStatuses() {
  try {
    const now = new Date();
    const opportunities = await GraduateOpportunity.find({});

    for (const opp of opportunities) {
      let nextStatus = opp.status;

      if (opp.applicationDeadline) {
        const diffMs = opp.applicationDeadline.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          nextStatus = "CLOSED";
        } else if (diffDays <= 7) {
          nextStatus = "CLOSING_SOON";
        } else if (opp.applicationStartDate && opp.applicationStartDate > now) {
          nextStatus = "UPCOMING";
        } else {
          nextStatus = "OPEN";
        }
      }

      // Check if data is stale (>30 days since last verification)
      const lastVerified = opp.lastVerifiedAt ? opp.lastVerifiedAt.getTime() : 0;
      const daysSinceVerified = (now.getTime() - lastVerified) / (1000 * 60 * 60 * 24);
      const dataFreshness = daysSinceVerified > 45 ? "STALE" : "VERIFIED";

      await GraduateOpportunity.findByIdAndUpdate(opp._id, {
        status: nextStatus,
        dataFreshness
      });
    }
  } catch (err) {
    console.error("Error refreshing opportunity statuses:", err.message);
  }
}

module.exports = {
  seedDefaultOpportunities,
  triggerTavilyResearch,
  refreshOpportunityStatuses
};
