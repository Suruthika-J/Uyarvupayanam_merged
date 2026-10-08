const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Exam = require("../models/Exam");

dotenv.config();

const SEED_EXAMS = [
  // ── 1. GOVERNMENT ──────────────────────────────────────────────────────────
  {
    examId: "ssc-cgl",
    name: "SSC Combined Graduate Level Examination",
    shortName: "SSC CGL",
    category: "Government",
    subCategory: "Central Government Recruitment",
    conductingOrganization: "Staff Selection Commission (SSC)",
    description: "National competitive examination to recruit staff for Group B and Group C non-technical posts in Central Government Ministries, Departments, and Secretariats.",
    purpose: "Recruitment to Group B & C Gazetted/Non-Gazetted posts across Central Ministries.",
    careerOpportunities: ["Assistant Section Officer (ASO)", "Inspector of Income Tax", "Central Excise Inspector", "Assistant Enforcement Officer", "Sub Inspector (CBI)", "Auditor (CAG)"],
    eligibleDegrees: ["B.E.", "B.Tech", "B.Sc", "B.Com", "B.A.", "BBA", "BCA", "Degree in any discipline"],
    eligibleBranches: ["All Specializations", "Computer Science", "Electrical", "Mechanical", "Arts", "Commerce"],
    minimumQualification: "Bachelor's Degree in any discipline from a recognized university",
    eligibility: {
      qualificationRequirements: "Bachelor's Degree in any discipline from a recognized University or equivalent.",
      minDegree: "Bachelor Degree",
      minPercentage: "Passing Marks",
      ageRequirements: "18 to 30 years (OBC +3 yrs, SC/ST +5 yrs)",
      nationality: "Indian Citizen"
    },
    selectionProcess: ["Tier 1: Computer Based Examination (Qualifying)", "Tier 2: Computer Based Examination (Paper I Compulsory, Paper II AAO/JSO)"],
    applicationStartDate: new Date("2026-06-10"),
    applicationEndDate: new Date("2026-07-20"),
    examDate: new Date("2026-09-15"),
    importantDates: {
      notificationDate: "June 2026",
      applicationStart: "10 June 2026",
      applicationDeadline: "20 July 2026",
      examDate: "September 2026",
      resultDate: "December 2026"
    },
    applicationUrl: "https://ssc.gov.in",
    officialWebsite: "https://ssc.gov.in",
    notificationUrl: "https://ssc.gov.in/notifications",
    syllabusUrl: "https://ssc.gov.in/syllabus",
    examPatternUrl: "https://ssc.gov.in/candidate-corner/exam-pattern",
    status: "OPEN",
    sourceType: "Official Commission Portal",
    sourceUrl: "https://ssc.gov.in",
    sourceConfidence: "HIGH",
    stages: [
      {
        stageName: "Tier 1 CBT Examination",
        durationMinutes: 60,
        totalQuestions: 100,
        totalMarks: 200,
        negativeMarking: true,
        sections: [
          { sectionId: "tier1_quant", name: "Quantitative Aptitude", questionCount: 25, marks: 50, durationMinutes: 15, negativeMarking: "0.50", weightage: 1.0, syllabusTopics: [{ topicId: "quant_percentage", name: "Percentage", normalizedKey: "percentage", estimatedHours: 4, difficulty: "Medium", syllabusWeight: 85, historicalFrequency: 90, recentFrequency: 88, prerequisites: ["Basic Arithmetic"], conceptsToLearn: ["Percentage Increase/Decrease", "Successive Percentage"], revisionChecklist: ["Fraction to % table"] }, { topicId: "quant_time_work", name: "Time & Work", normalizedKey: "time_work", estimatedHours: 4, difficulty: "Medium", syllabusWeight: 90, historicalFrequency: 92, recentFrequency: 94, prerequisites: ["LCM & Ratio"], conceptsToLearn: ["Efficiency Method", "Pipes & Cisterns"], revisionChecklist: ["Work = Rate x Time"] }] },
          { sectionId: "tier1_reasoning", name: "General Intelligence & Reasoning", questionCount: 25, marks: 50, durationMinutes: 15, negativeMarking: "0.50", weightage: 1.0, syllabusTopics: [{ topicId: "reasoning_analogy", name: "Analogy & Classification", normalizedKey: "analogy", estimatedHours: 3, difficulty: "Easy", syllabusWeight: 85, historicalFrequency: 85, recentFrequency: 85, prerequisites: ["Alphabet Positions"], conceptsToLearn: ["Letter Analogy", "Number Analogy"], revisionChecklist: ["A-Z opposite pairs"] }] }
        ]
      }
    ],
    previousPapers: [
      { year: 2025, stage: "Tier 1", section: "All Sections", paperTitle: "SSC CGL 2025 Official Tier 1 PDF Paper", paperUrl: "https://ssc.gov.in/answer-keys", officialSource: "SSC Official Website", sourceType: "OFFICIAL_PDF" }
    ],
    sources: [
      { title: "Staff Selection Commission Official Portal", url: "https://ssc.gov.in", sourceType: "Official Portal", confidence: "HIGH", description: "Official source for SSC CGL notifications and exam scheme." }
    ]
  },
  {
    examId: "upsc-cse",
    name: "UPSC Civil Services Examination",
    shortName: "UPSC CSE",
    category: "Government",
    subCategory: "All India Civil Services",
    conductingOrganization: "Union Public Service Commission (UPSC)",
    description: "Premier national competitive examination for recruitment to Indian Administrative Service (IAS), Indian Police Service (IPS), Indian Foreign Service (IFS), and Central Group A Services.",
    purpose: "Recruitment to IAS, IPS, IFS, IRS, and Top Central Administrative Services.",
    careerOpportunities: ["District Magistrate (IAS)", "Superintendent of Police (IPS)", "Diplomat (IFS)", "Commissioner of Income Tax (IRS)"],
    eligibleDegrees: ["B.E.", "B.Tech", "B.Sc", "B.Com", "B.A.", "Degree in any discipline"],
    eligibleBranches: ["All Specializations"],
    minimumQualification: "Graduate Degree in any discipline from a recognized University",
    eligibility: {
      qualificationRequirements: "Degree from any recognized University or equivalent qualification.",
      minDegree: "Bachelor Degree",
      minPercentage: "Passing Marks",
      ageRequirements: "21 to 32 years (Relaxations: OBC 35 yrs, SC/ST 37 yrs)",
      nationality: "Indian Citizen (for IAS & IPS)"
    },
    selectionProcess: ["Prelims (GS Paper I & CSAT)", "Mains Written Exam (9 Papers)", "Personality Test (Interview)"],
    applicationStartDate: new Date("2026-02-14"),
    applicationEndDate: new Date("2026-03-05"),
    examDate: new Date("2026-05-24"),
    importantDates: {
      notificationDate: "February 2026",
      applicationStart: "14 February 2026",
      applicationDeadline: "05 March 2026",
      examDate: "24 May 2026",
      resultDate: "September 2026"
    },
    applicationUrl: "https://upsconline.nic.in",
    officialWebsite: "https://upsc.gov.in",
    notificationUrl: "https://upsc.gov.in/examinations/active-exams",
    syllabusUrl: "https://upsc.gov.in/examinations/syllabi",
    examPatternUrl: "https://upsc.gov.in/examinations/examination-scheme",
    status: "UPCOMING",
    sourceType: "Union Commission Official Portal",
    sourceUrl: "https://upsc.gov.in",
    sourceConfidence: "HIGH",
    stages: [
      {
        stageName: "Preliminary Examination",
        durationMinutes: 240,
        totalQuestions: 180,
        totalMarks: 400,
        negativeMarking: true,
        sections: [
          { sectionId: "prelims_gs1", name: "General Studies Paper I", questionCount: 100, marks: 200, durationMinutes: 120, negativeMarking: "0.66", weightage: 1.0, syllabusTopics: [{ topicId: "upsc_polity", name: "Indian Polity & Governance", normalizedKey: "polity", estimatedHours: 10, difficulty: "Hard", syllabusWeight: 98, historicalFrequency: 95, recentFrequency: 96, prerequisites: ["Constitutional Basics"], conceptsToLearn: ["Fundamental Rights", "Parliamentary Committees"], revisionChecklist: ["Laxmikanth High Yields"] }] }
        ]
      }
    ],
    previousPapers: [
      { year: 2025, stage: "Prelims", section: "GS Paper 1", paperTitle: "UPSC Prelims 2025 Official GS Paper 1", paperUrl: "https://upsc.gov.in/examinations/previous-question-papers", officialSource: "UPSC Official Portal", sourceType: "OFFICIAL_PDF" }
    ],
    sources: [
      { title: "Union Public Service Commission", url: "https://upsc.gov.in", sourceType: "Official Portal", confidence: "HIGH", description: "Official website of UPSC." }
    ]
  },

  // ── 2. ENGINEERING ─────────────────────────────────────────────────────────
  {
    examId: "gate-cse",
    name: "Graduate Aptitude Test in Engineering (Computer Science)",
    shortName: "GATE CSE",
    category: "Engineering",
    subCategory: "Postgraduate & PSU Engineering",
    conductingOrganization: "IITs / IISc (GATE Committee)",
    description: "Comprehensive national examination testing undergraduate engineering concepts for M.Tech admissions in IITs/NITs and Executive Trainee recruitment in top PSUs.",
    purpose: "M.Tech/Ph.D. admissions in IITs/NITs and PSU Officer Recruitment.",
    careerOpportunities: ["M.Tech at IIT Madras / IIT Bombay / IISc", "Executive Engineer at IOCL / ONGC / NTPC", "PMRF Research Fellowship"],
    eligibleDegrees: ["B.E.", "B.Tech", "M.Sc", "MCA"],
    eligibleBranches: ["Computer Science", "Information Technology", "AI & Data Science", "Software Engineering"],
    minimumQualification: "B.E./B.Tech 3rd/4th year student or graduate",
    eligibility: {
      qualificationRequirements: "Bachelor's degree in Engineering/Technology or Master's degree in relevant Science stream.",
      minDegree: "B.E. / B.Tech / M.Sc",
      minPercentage: "Passing Marks",
      ageRequirements: "No upper age limit",
      nationality: "Indian & International"
    },
    selectionProcess: ["Single CBT Examination (3 Hours, 65 Questions, 100 Marks)"],
    applicationStartDate: new Date("2026-08-25"),
    applicationEndDate: new Date("2026-09-30"),
    examDate: new Date("2027-02-06"),
    importantDates: {
      notificationDate: "August 2026",
      applicationStart: "25 August 2026",
      applicationDeadline: "30 September 2026",
      examDate: "February 2027",
      resultDate: "March 2027"
    },
    applicationUrl: "https://gate2026.iitr.ac.in",
    officialWebsite: "https://gate2026.iitr.ac.in",
    notificationUrl: "https://gate2026.iitr.ac.in/syllabus.html",
    syllabusUrl: "https://gate2026.iitr.ac.in/syllabus/CS.pdf",
    examPatternUrl: "https://gate2026.iitr.ac.in/exam-pattern.html",
    status: "OPEN",
    sourceType: "IIT Organizing Committee Portal",
    sourceUrl: "https://gate2026.iitr.ac.in",
    sourceConfidence: "HIGH",
    stages: [
      {
        stageName: "GATE CBT Examination",
        durationMinutes: 180,
        totalQuestions: 65,
        totalMarks: 100,
        negativeMarking: true,
        sections: [
          { sectionId: "gate_cs_core", name: "Computer Science Core", questionCount: 55, marks: 85, durationMinutes: 150, negativeMarking: "1/3", weightage: 1.0, syllabusTopics: [{ topicId: "gate_ds_algo", name: "Data Structures & Algorithms", normalizedKey: "algorithms", estimatedHours: 8, difficulty: "Hard", syllabusWeight: 95, historicalFrequency: 96, recentFrequency: 95, prerequisites: ["C Programming"], conceptsToLearn: ["Trees & Heaps", "Graph Traversal"], revisionChecklist: ["Dijkstra Complexity"] }] }
        ]
      }
    ],
    previousPapers: [
      { year: 2025, stage: "Main", section: "CS Paper", paperTitle: "GATE 2025 CS Official Question Paper & Answer Key", paperUrl: "https://gate2026.iitr.ac.in/previous-papers.html", officialSource: "GATE Committee", sourceType: "OFFICIAL_PDF" }
    ],
    sources: [
      { title: "GATE Official Organizing Committee Portal", url: "https://gate2026.iitr.ac.in", sourceType: "Official Committee", confidence: "HIGH", description: "Official website for GATE 2026." }
    ]
  },
  {
    examId: "gate-ece",
    name: "Graduate Aptitude Test in Engineering (Electronics & Communication)",
    shortName: "GATE ECE",
    category: "Engineering",
    subCategory: "Postgraduate & PSU Engineering",
    conductingOrganization: "IITs / IISc (GATE Committee)",
    description: "National engineering entrance examination for Electronics, Communication, VLSI, and Embedded Systems graduates.",
    purpose: "M.Tech admissions in Microelectronics/VLSI and PSU Officer Recruitment.",
    careerOpportunities: ["VLSI Design Engineer (M.Tech IITs)", "ISRO Scientist/Engineer", "BEL / BHEL Executive Engineer"],
    eligibleDegrees: ["B.E.", "B.Tech", "M.Sc"],
    eligibleBranches: ["Electronics & Communication", "Electrical & Electronics", "Instrumentation"],
    minimumQualification: "B.E./B.Tech in ECE or allied branches",
    eligibility: {
      qualificationRequirements: "Bachelor's degree in ECE/EEE/Instrumentation.",
      minDegree: "B.E. / B.Tech",
      minPercentage: "Passing Marks",
      ageRequirements: "No upper age limit",
      nationality: "Indian & International"
    },
    selectionProcess: ["Single Stage CBT Examination"],
    applicationStartDate: new Date("2026-08-25"),
    applicationEndDate: new Date("2026-09-30"),
    examDate: new Date("2027-02-07"),
    importantDates: {
      notificationDate: "August 2026",
      applicationStart: "25 August 2026",
      applicationDeadline: "30 September 2026",
      examDate: "February 2027",
      resultDate: "March 2027"
    },
    applicationUrl: "https://gate2026.iitr.ac.in",
    officialWebsite: "https://gate2026.iitr.ac.in",
    notificationUrl: "https://gate2026.iitr.ac.in/syllabus/EC.pdf",
    syllabusUrl: "https://gate2026.iitr.ac.in/syllabus/EC.pdf",
    examPatternUrl: "https://gate2026.iitr.ac.in",
    status: "OPEN",
    sourceType: "IIT GATE Committee",
    sourceUrl: "https://gate2026.iitr.ac.in",
    sourceConfidence: "HIGH",
    stages: [
      {
        stageName: "GATE ECE CBT",
        durationMinutes: 180,
        totalQuestions: 65,
        totalMarks: 100,
        negativeMarking: true,
        sections: [
          { sectionId: "ece_core", name: "Electronics & Signals", questionCount: 55, marks: 85, durationMinutes: 150, negativeMarking: "1/3", weightage: 1.0, syllabusTopics: [{ topicId: "ece_signals", name: "Signals & Systems", normalizedKey: "digital_logic", estimatedHours: 6, difficulty: "Hard", syllabusWeight: 90, historicalFrequency: 90, recentFrequency: 92, prerequisites: ["Fourier Series"], conceptsToLearn: ["Laplace & Z-Transform"], revisionChecklist: ["Transform Properties"] }] }
        ]
      }
    ],
    previousPapers: [
      { year: 2025, stage: "Main", section: "ECE Paper", paperTitle: "GATE 2025 EC Official Question Paper", paperUrl: "https://gate2026.iitr.ac.in", officialSource: "GATE Committee", sourceType: "OFFICIAL_PDF" }
    ],
    sources: [
      { title: "GATE Official Portal", url: "https://gate2026.iitr.ac.in", sourceType: "Official Committee", confidence: "HIGH", description: "GATE ECE Official portal." }
    ]
  },

  // ── 3. MANAGEMENT ──────────────────────────────────────────────────────────
  {
    examId: "cat",
    name: "Common Admission Test (CAT)",
    shortName: "CAT",
    category: "Management",
    subCategory: "IIM & Top B-School Admissions",
    conductingOrganization: "Indian Institutes of Management (IIMs)",
    description: "Computer-based test conducted annually by IIMs for admission to MBA/PGDM programs across 21 IIMs, FMS Delhi, XLRI (select programs), SPJIMR, and MDI Gurgaon.",
    purpose: "MBA/PGDM Admissions to Top B-Schools in India.",
    careerOpportunities: ["Management Consultant", "Investment Banker", "Product Manager", "Brand Manager"],
    eligibleDegrees: ["B.E.", "B.Tech", "B.Sc", "B.Com", "B.A.", "BBA", "BCA", "Degree in any discipline"],
    eligibleBranches: ["All Specializations"],
    minimumQualification: "Bachelor's Degree with at least 50% marks (45% for SC/ST/PwD)",
    eligibility: {
      qualificationRequirements: "Bachelor's Degree with at least 50% marks or equivalent CGPA.",
      minDegree: "Bachelor Degree",
      minPercentage: "50% Marks",
      ageRequirements: "No age limit",
      nationality: "Indian & International"
    },
    selectionProcess: ["CAT Computer Based Test (2 Hours)", "Written Ability Test (WAT) / Group Discussion", "Personal Interview (PI)"],
    applicationStartDate: new Date("2026-08-01"),
    applicationEndDate: new Date("2026-09-20"),
    examDate: new Date("2026-11-29"),
    importantDates: {
      notificationDate: "July 2026",
      applicationStart: "01 August 2026",
      applicationDeadline: "20 September 2026",
      examDate: "29 November 2026",
      resultDate: "January 2027"
    },
    applicationUrl: "https://iimcat.ac.in",
    officialWebsite: "https://iimcat.ac.in",
    notificationUrl: "https://iimcat.ac.in",
    syllabusUrl: "https://iimcat.ac.in",
    examPatternUrl: "https://iimcat.ac.in",
    status: "OPEN",
    sourceType: "IIM Convenor Portal",
    sourceUrl: "https://iimcat.ac.in",
    sourceConfidence: "HIGH",
    stages: [
      {
        stageName: "CAT CBT Examination",
        durationMinutes: 120,
        totalQuestions: 66,
        totalMarks: 198,
        negativeMarking: true,
        sections: [
          { sectionId: "varc", name: "Verbal Ability & Reading Comprehension", questionCount: 24, marks: 72, durationMinutes: 40, negativeMarking: "-1 MCQ, 0 TITA", weightage: 1.0, syllabusTopics: [{ topicId: "cat_rc", name: "Reading Comprehension", normalizedKey: "reading_comprehension", estimatedHours: 6, difficulty: "Hard", syllabusWeight: 95, historicalFrequency: 95, recentFrequency: 95, prerequisites: ["Advanced Reading"], conceptsToLearn: ["Tone & Main Idea"], revisionChecklist: ["Aeon Essays"] }] },
          { sectionId: "qa", name: "Quantitative Ability", questionCount: 22, marks: 66, durationMinutes: 40, negativeMarking: "-1 MCQ, 0 TITA", weightage: 1.0, syllabusTopics: [{ topicId: "cat_arithmetic", name: "Arithmetic & Algebra", normalizedKey: "percentage", estimatedHours: 8, difficulty: "Hard", syllabusWeight: 95, historicalFrequency: 95, recentFrequency: 95, prerequisites: ["Basic Math"], conceptsToLearn: ["Percentages & Logarithms"], revisionChecklist: ["Formula Cheat Sheet"] }] }
        ]
      }
    ],
    previousPapers: [
      { year: 2025, stage: "Main", section: "All Slots", paperTitle: "CAT 2025 Official Question Paper & Response Sheet", paperUrl: "https://iimcat.ac.in", officialSource: "IIM CAT Convenor Portal", sourceType: "OFFICIAL_PORTAL" }
    ],
    sources: [
      { title: "IIM CAT Official Portal", url: "https://iimcat.ac.in", sourceType: "Official Portal", confidence: "HIGH", description: "Official website for CAT registrations." }
    ]
  },
  {
    examId: "xat",
    name: "Xavier Aptitude Test (XAT)",
    shortName: "XAT",
    category: "Management",
    subCategory: "XLRI & Associated B-School Admissions",
    conductingOrganization: "XLRI Jamshedpur (on behalf of XAMI)",
    description: "National level management entrance test conducted by XLRI Jamshedpur for admission to BM, HRM, and PGDM programs in XLRI and 160+ associate management institutes.",
    purpose: "MBA/PGDM admissions at XLRI Jamshedpur, XLRI Delhi, XIMB, IMT Ghaziabad, etc.",
    careerOpportunities: ["HR Director (XLRI HRM)", "Business Consultant", "Strategy Manager"],
    eligibleDegrees: ["B.E.", "B.Tech", "B.Sc", "B.Com", "B.A.", "Degree in any discipline"],
    eligibleBranches: ["All Specializations"],
    minimumQualification: "Recognized Bachelor's Degree of minimum 3 years duration",
    eligibility: {
      qualificationRequirements: "Three-year Bachelor's degree in any discipline from a recognized University.",
      minDegree: "Bachelor Degree",
      minPercentage: "Passing Marks",
      ageRequirements: "No age limit",
      nationality: "Indian & International"
    },
    selectionProcess: ["XAT Computer Based Test (3 Hours 30 Mins)", "Group Discussion & Personal Interview (GD-PI)"],
    applicationStartDate: new Date("2026-07-15"),
    applicationEndDate: new Date("2026-11-30"),
    examDate: new Date("2027-01-03"),
    importantDates: {
      notificationDate: "July 2026",
      applicationStart: "15 July 2026",
      applicationDeadline: "30 November 2026",
      examDate: "03 January 2027",
      resultDate: "January 2027"
    },
    applicationUrl: "https://xatonline.in",
    officialWebsite: "https://xatonline.in",
    notificationUrl: "https://xatonline.in",
    syllabusUrl: "https://xatonline.in",
    examPatternUrl: "https://xatonline.in",
    status: "OPEN",
    sourceType: "XLRI Official Portal",
    sourceUrl: "https://xatonline.in",
    sourceConfidence: "HIGH",
    stages: [
      {
        stageName: "XAT Computer Based Test",
        durationMinutes: 210,
        totalQuestions: 105,
        totalMarks: 105,
        negativeMarking: true,
        sections: [
          { sectionId: "xat_dm", name: "Decision Making & Ethics", questionCount: 22, marks: 22, durationMinutes: 45, negativeMarking: "0.25", weightage: 1.0, syllabusTopics: [{ topicId: "dm_ethics", name: "Ethical Dilemmas & Business Cases", normalizedKey: "data_interpretation_lr", estimatedHours: 5, difficulty: "Hard", syllabusWeight: 95, historicalFrequency: 95, recentFrequency: 95, prerequisites: ["Logical Reasoning"], conceptsToLearn: ["Stakeholder Analysis"], revisionChecklist: ["XLRI Decision Making Sets"] }] }
        ]
      }
    ],
    previousPapers: [
      { year: 2025, stage: "Main", section: "All Sections", paperTitle: "XAT 2025 Official Question Paper", paperUrl: "https://xatonline.in", officialSource: "XLRI Jamshedpur Portal", sourceType: "OFFICIAL_PDF" }
    ],
    sources: [
      { title: "XLRI XAT Official Website", url: "https://xatonline.in", sourceType: "Official Portal", confidence: "HIGH", description: "Official website for XAT." }
    ]
  },

  // ── 4. HIGHER STUDIES ──────────────────────────────────────────────────────
  {
    examId: "cuet-pg",
    name: "Central Universities Entrance Test (CUET-PG)",
    shortName: "CUET PG",
    category: "Higher Studies",
    subCategory: "Central & State University PG Admissions",
    conductingOrganization: "National Testing Agency (NTA)",
    description: "All-India entrance test for admission into Master's programs (M.Sc, M.A., M.Com, MCA, LL.M., B.Ed) across 190+ Central, State, and Deemed Universities including DU, JNU, BHU, and HYU.",
    purpose: "Postgraduate Degree Admissions across Central & State Universities.",
    careerOpportunities: ["M.Sc / M.A. Postgraduate", "University Research Fellow", "Higher Studies Specialist"],
    eligibleDegrees: ["B.E.", "B.Tech", "B.Sc", "B.Com", "B.A.", "BCA", "Degree in relevant subject"],
    eligibleBranches: ["All Specializations"],
    minimumQualification: "Bachelor's Degree in relevant discipline from a recognized University",
    eligibility: {
      qualificationRequirements: "Bachelor's degree in relevant discipline.",
      minDegree: "Bachelor Degree",
      minPercentage: "50% Marks",
      ageRequirements: "No age limit (subject to university guidelines)",
      nationality: "Indian Citizen"
    },
    selectionProcess: ["NTA CBT Examination (1 Hour 45 Mins, 75 Questions)"],
    applicationStartDate: new Date("2026-01-05"),
    applicationEndDate: new Date("2026-02-10"),
    examDate: new Date("2026-03-20"),
    importantDates: {
      notificationDate: "December 2025",
      applicationStart: "05 January 2026",
      applicationDeadline: "10 February 2026",
      examDate: "20 March 2026",
      resultDate: "April 2026"
    },
    applicationUrl: "https://pgcuet.samarth.ac.in",
    officialWebsite: "https://nta.ac.in",
    notificationUrl: "https://pgcuet.samarth.ac.in",
    syllabusUrl: "https://pgcuet.samarth.ac.in/index.php/site/syllabus",
    examPatternUrl: "https://pgcuet.samarth.ac.in",
    status: "CLOSED",
    sourceType: "NTA Official Portal",
    sourceUrl: "https://pgcuet.samarth.ac.in",
    sourceConfidence: "HIGH",
    stages: [
      {
        stageName: "CUET PG Computer Based Test",
        durationMinutes: 105,
        totalQuestions: 75,
        totalMarks: 300,
        negativeMarking: true,
        sections: [
          { sectionId: "domain_paper", name: "Domain Knowledge Paper", questionCount: 75, marks: 300, durationMinutes: 105, negativeMarking: "-1 per wrong answer", weightage: 1.0, syllabusTopics: [{ topicId: "cuet_domain", name: "Core Discipline Syllabus", normalizedKey: "number_system", estimatedHours: 6, difficulty: "Medium", syllabusWeight: 90, historicalFrequency: 90, recentFrequency: 90, prerequisites: ["Undergraduate Core"], conceptsToLearn: ["Core Subject Fundamentals"], revisionChecklist: ["UG Summary Notes"] }] }
        ]
      }
    ],
    previousPapers: [
      { year: 2025, stage: "Main", section: "All Subjects", paperTitle: "CUET PG 2025 Official Question Papers", paperUrl: "https://nta.ac.in/Downloads", officialSource: "NTA Official Portal", sourceType: "OFFICIAL_PDF" }
    ],
    sources: [
      { title: "NTA CUET PG Portal", url: "https://pgcuet.samarth.ac.in", sourceType: "Official Portal", confidence: "HIGH", description: "Official CUET PG portal." }
    ]
  },

  // ── 5. BANKING ─────────────────────────────────────────────────────────────
  {
    examId: "ibps-po",
    name: "IBPS Probationary Officer / Management Trainee Examination",
    shortName: "IBPS PO",
    category: "Banking",
    subCategory: "Public Sector Banks Recruitment",
    conductingOrganization: "Institute of Banking Personnel Selection (IBPS)",
    description: "National recruitment exam to select Probationary Officers and Management Trainees across 11 participating Public Sector Banks in India (e.g. Punjab National Bank, Bank of Baroda, Canara Bank).",
    purpose: "Recruitment to Bank PO / Assistant Manager positions in Public Sector Banks.",
    careerOpportunities: ["Probationary Officer (Scale I)", "Assistant Branch Manager", "Credit Officer / Treasury Manager"],
    eligibleDegrees: ["B.E.", "B.Tech", "B.Sc", "B.Com", "B.A.", "Degree in any discipline"],
    eligibleBranches: ["All Specializations"],
    minimumQualification: "Degree (Graduation) in any discipline from a recognized University",
    eligibility: {
      qualificationRequirements: "Degree in any discipline from a University recognized by the Govt. Of India.",
      minDegree: "Bachelor Degree",
      minPercentage: "Passing Marks",
      ageRequirements: "20 to 30 years (OBC +3 yrs, SC/ST +5 yrs)",
      nationality: "Indian Citizen"
    },
    selectionProcess: ["Phase 1: Preliminary Examination (100 Marks)", "Phase 2: Main Examination (225 Marks incl. Descriptive)", "Phase 3: Interview (100 Marks)"],
    applicationStartDate: new Date("2026-08-01"),
    applicationEndDate: new Date("2026-08-28"),
    examDate: new Date("2026-10-15"),
    importantDates: {
      notificationDate: "July 2026",
      applicationStart: "01 August 2026",
      applicationDeadline: "28 August 2026",
      examDate: "October 2026 (Prelims)",
      resultDate: "December 2026"
    },
    applicationUrl: "https://ibps.in",
    officialWebsite: "https://ibps.in",
    notificationUrl: "https://ibps.in",
    syllabusUrl: "https://ibps.in",
    examPatternUrl: "https://ibps.in",
    status: "OPEN",
    sourceType: "IBPS Official Portal",
    sourceUrl: "https://ibps.in",
    sourceConfidence: "HIGH",
    stages: [
      {
        stageName: "Prelims Examination",
        durationMinutes: 60,
        totalQuestions: 100,
        totalMarks: 100,
        negativeMarking: true,
        sections: [
          { sectionId: "ibps_quant", name: "Quantitative Aptitude", questionCount: 35, marks: 35, durationMinutes: 20, negativeMarking: "0.25", weightage: 1.0, syllabusTopics: [{ topicId: "ibps_di", name: "Data Interpretation & Speed Math", normalizedKey: "data_interpretation", estimatedHours: 5, difficulty: "Medium", syllabusWeight: 90, historicalFrequency: 92, recentFrequency: 94, prerequisites: ["Fractions & %"], conceptsToLearn: ["Tabular & Caselet DI"], revisionChecklist: ["Square roots & Cubes up to 30"] }] }
        ]
      }
    ],
    previousPapers: [
      { year: 2025, stage: "Prelims", section: "All Sections", paperTitle: "IBPS PO 2025 Prelims Official Memory Paper", paperUrl: "https://ibps.in", officialSource: "IBPS Portal", sourceType: "OFFICIAL_PORTAL" }
    ],
    sources: [
      { title: "Institute of Banking Personnel Selection", url: "https://ibps.in", sourceType: "Official Portal", confidence: "HIGH", description: "Official website for IBPS." }
    ]
  },
  {
    examId: "sbi-po",
    name: "State Bank of India Probationary Officer Examination",
    shortName: "SBI PO",
    category: "Banking",
    subCategory: "SBI Recruitment",
    conductingOrganization: "State Bank of India (SBI)",
    description: "Premier banking examination conducted by State Bank of India to recruit Probationary Officers across its nationwide branch network.",
    purpose: "Recruitment to Officer Grade (Scale I) in State Bank of India.",
    careerOpportunities: ["Probationary Officer (SBI)", "Deputy Manager", "Chief General Manager"],
    eligibleDegrees: ["B.E.", "B.Tech", "B.Sc", "B.Com", "B.A.", "Degree in any discipline"],
    eligibleBranches: ["All Specializations"],
    minimumQualification: "Graduation in any discipline from a recognized University",
    eligibility: {
      qualificationRequirements: "Graduation in any discipline from a recognized University or equivalent.",
      minDegree: "Bachelor Degree",
      minPercentage: "Passing Marks",
      ageRequirements: "21 to 30 years",
      nationality: "Indian Citizen"
    },
    selectionProcess: ["Phase 1: Prelims", "Phase 2: Mains & Descriptive Test", "Phase 3: Psychometric Test & Group Exercise / Interview"],
    applicationStartDate: new Date("2026-09-07"),
    applicationEndDate: new Date("2026-09-27"),
    examDate: new Date("2026-11-10"),
    importantDates: {
      notificationDate: "September 2026",
      applicationStart: "07 September 2026",
      applicationDeadline: "27 September 2026",
      examDate: "November 2026",
      resultDate: "January 2027"
    },
    applicationUrl: "https://sbi.co.in/web/careers",
    officialWebsite: "https://sbi.co.in/web/careers",
    notificationUrl: "https://sbi.co.in/web/careers",
    syllabusUrl: "https://sbi.co.in/web/careers",
    examPatternUrl: "https://sbi.co.in/web/careers",
    status: "OPEN",
    sourceType: "SBI Careers Portal",
    sourceUrl: "https://sbi.co.in/web/careers",
    sourceConfidence: "HIGH",
    stages: [
      {
        stageName: "SBI PO Prelims Exam",
        durationMinutes: 60,
        totalQuestions: 100,
        totalMarks: 100,
        negativeMarking: true,
        sections: [
          { sectionId: "sbi_reasoning", name: "Reasoning Ability", questionCount: 35, marks: 35, durationMinutes: 20, negativeMarking: "0.25", weightage: 1.0, syllabusTopics: [{ topicId: "sbi_puzzles", name: "Seating Arrangement & Puzzles", normalizedKey: "data_interpretation_lr", estimatedHours: 6, difficulty: "Hard", syllabusWeight: 95, historicalFrequency: 95, recentFrequency: 95, prerequisites: ["Basic Logic"], conceptsToLearn: ["Circular & Linear Arrangements"], revisionChecklist: ["50 Banking Puzzles"] }] }
        ]
      }
    ],
    previousPapers: [
      { year: 2025, stage: "Prelims", section: "All Sections", paperTitle: "SBI PO 2025 Prelims Official PDF Paper", paperUrl: "https://sbi.co.in/web/careers", officialSource: "SBI Careers", sourceType: "OFFICIAL_PORTAL" }
    ],
    sources: [
      { title: "State Bank of India Careers", url: "https://sbi.co.in/web/careers", sourceType: "Official Portal", confidence: "HIGH", description: "Official SBI recruitment portal." }
    ]
  },

  // ── 6. RAILWAY ─────────────────────────────────────────────────────────────
  {
    examId: "rrb-ntpc",
    name: "RRB Non-Technical Popular Categories Examination",
    shortName: "RRB NTPC",
    category: "Railway",
    subCategory: "Indian Railways Recruitment",
    conductingOrganization: "Railway Recruitment Boards (RRB)",
    description: "All-India competitive examination for recruitment to Non-Technical Popular Categories (Graduate posts) in 21 Railway Recruitment zones across Indian Railways.",
    purpose: "Recruitment to Station Master, Goods Guard, Senior Clerk, Junior Accounts Assistant posts in Indian Railways.",
    careerOpportunities: ["Station Master", "Goods Guard (Train Manager)", "Commercial Apprentice", "Senior Clerk cum Typist"],
    eligibleDegrees: ["B.E.", "B.Tech", "B.Sc", "B.Com", "B.A.", "Degree in any discipline"],
    eligibleBranches: ["All Specializations"],
    minimumQualification: "Degree from recognized University or its equivalent",
    eligibility: {
      qualificationRequirements: "Degree from recognized University or its equivalent.",
      minDegree: "Bachelor Degree",
      minPercentage: "Passing Marks",
      ageRequirements: "18 to 33 years (Relaxations: OBC +3 yrs, SC/ST +5 yrs)",
      nationality: "Indian Citizen"
    },
    selectionProcess: ["1st Stage CBT", "2nd Stage CBT", "Computer Based Aptitude Test (CBAT) / Typing Test", "Document Verification"],
    applicationStartDate: new Date("2026-09-14"),
    applicationEndDate: new Date("2026-10-13"),
    examDate: new Date("2026-12-15"),
    importantDates: {
      notificationDate: "September 2026",
      applicationStart: "14 September 2026",
      applicationDeadline: "13 October 2026",
      examDate: "December 2026",
      resultDate: "March 2027"
    },
    applicationUrl: "https://indianrailways.gov.in",
    officialWebsite: "https://indianrailways.gov.in",
    notificationUrl: "https://indianrailways.gov.in",
    syllabusUrl: "https://indianrailways.gov.in",
    examPatternUrl: "https://indianrailways.gov.in",
    status: "OPEN",
    sourceType: "Railway Recruitment Board Official Portal",
    sourceUrl: "https://indianrailways.gov.in",
    sourceConfidence: "HIGH",
    stages: [
      {
        stageName: "1st Stage CBT",
        durationMinutes: 90,
        totalQuestions: 100,
        totalMarks: 100,
        negativeMarking: true,
        sections: [
          { sectionId: "rrb_math", name: "Mathematics", questionCount: 30, marks: 30, durationMinutes: 30, negativeMarking: "1/3", weightage: 1.0, syllabusTopics: [{ topicId: "rrb_number", name: "Number System & Speed Math", normalizedKey: "number_system", estimatedHours: 4, difficulty: "Medium", syllabusWeight: 88, historicalFrequency: 90, recentFrequency: 89, prerequisites: ["Basic Arithmetic"], conceptsToLearn: ["Divisibility & LCM"], revisionChecklist: ["Formula Sheet"] }] }
        ]
      }
    ],
    previousPapers: [
      { year: 2025, stage: "CBT 1", section: "All Shifts", paperTitle: "RRB NTPC 2025 Official CBT 1 Master Papers", paperUrl: "https://indianrailways.gov.in", officialSource: "RRB Official Website", sourceType: "OFFICIAL_PDF" }
    ],
    sources: [
      { title: "Indian Railways RRB Official Portal", url: "https://indianrailways.gov.in", sourceType: "Official Portal", confidence: "HIGH", description: "Official RRB recruitment portal." }
    ]
  },

  // ── 7. DEFENCE ─────────────────────────────────────────────────────────────
  {
    examId: "cds",
    name: "Combined Defence Services Examination (CDS)",
    shortName: "CDS",
    category: "Defence",
    subCategory: "Armed Forces Officer Entry",
    conductingOrganization: "Union Public Service Commission (UPSC)",
    description: "National examination for recruitment of Commissioned Officers into Indian Military Academy (IMA), Indian Naval Academy (INA), Air Force Academy (AFA), and Officers Training Academy (OTA).",
    purpose: "Commissioned Officer Entry in Indian Army, Navy, and Air Force.",
    careerOpportunities: ["Lieutenant (Indian Army)", "Sub Lieutenant (Indian Navy)", "Flying Officer (Indian Air Force)"],
    eligibleDegrees: ["B.E.", "B.Tech", "B.Sc", "B.Com", "B.A.", "Degree in any discipline"],
    eligibleBranches: ["All Specializations"],
    minimumQualification: "Degree of a recognized University (Physics & Math required for AFA/INA)",
    eligibility: {
      qualificationRequirements: "Degree from recognized University (Engineering for INA, Physics & Math in 10+2/B.E. for AFA).",
      minDegree: "Bachelor Degree",
      minPercentage: "Passing Marks",
      ageRequirements: "19 to 24 years (Unmarried candidates)",
      nationality: "Indian Citizen"
    },
    selectionProcess: ["UPSC Written Examination", "SSB Interview (5-Day Testing)", "Medical Examination"],
    applicationStartDate: new Date("2026-05-20"),
    applicationEndDate: new Date("2026-06-09"),
    examDate: new Date("2026-09-01"),
    importantDates: {
      notificationDate: "May 2026",
      applicationStart: "20 May 2026",
      applicationDeadline: "09 June 2026",
      examDate: "September 2026",
      resultDate: "December 2026"
    },
    applicationUrl: "https://upsconline.nic.in",
    officialWebsite: "https://upsc.gov.in",
    notificationUrl: "https://upsc.gov.in",
    syllabusUrl: "https://upsc.gov.in",
    examPatternUrl: "https://upsc.gov.in",
    status: "OPEN",
    sourceType: "UPSC Official Portal",
    sourceUrl: "https://upsc.gov.in",
    sourceConfidence: "HIGH",
    stages: [
      {
        stageName: "UPSC Written Exam (IMA/INA/AFA)",
        durationMinutes: 360,
        totalQuestions: 300,
        totalMarks: 300,
        negativeMarking: true,
        sections: [
          { sectionId: "cds_english", name: "English Language", questionCount: 120, marks: 100, durationMinutes: 120, negativeMarking: "0.33", weightage: 1.0, syllabusTopics: [{ topicId: "cds_grammar", name: "Grammar & Comprehension", normalizedKey: "verbal_ability", estimatedHours: 5, difficulty: "Medium", syllabusWeight: 90, historicalFrequency: 90, recentFrequency: 90, prerequisites: ["English Basics"], conceptsToLearn: ["Error Spotting & Ordering"], revisionChecklist: ["100 Grammar Rules"] }] }
        ]
      }
    ],
    previousPapers: [
      { year: 2025, stage: "Written", section: "All Papers", paperTitle: "CDS 2025 Official Question Papers", paperUrl: "https://upsc.gov.in", officialSource: "UPSC Official Portal", sourceType: "OFFICIAL_PDF" }
    ],
    sources: [
      { title: "UPSC CDS Official Portal", url: "https://upsc.gov.in", sourceType: "Official Portal", confidence: "HIGH", description: "Official CDS notification portal." }
    ]
  },

  // ── 8. STATE PSC ───────────────────────────────────────────────────────────
  {
    examId: "tnpsc-group-1",
    name: "TNPSC Group I Services Examination",
    shortName: "TNPSC Group I",
    category: "State PSC",
    subCategory: "Tamil Nadu Public Service Commission",
    conductingOrganization: "Tamil Nadu Public Service Commission (TNPSC)",
    description: "Premier State Civil Services examination conducted by TNPSC for recruitment to top Group A Executive posts in Tamil Nadu State Administration.",
    purpose: "Recruitment to Deputy Collector, DSP, District Registrar, Assistant Commissioner (Commercial Taxes) in Tamil Nadu.",
    careerOpportunities: ["Deputy Collector (TNSCS)", "Deputy Superintendent of Police (DSP)", "Assistant Commissioner (Commercial Taxes)"],
    eligibleDegrees: ["B.E.", "B.Tech", "B.Sc", "B.Com", "B.A.", "Degree in any discipline"],
    eligibleBranches: ["All Specializations"],
    minimumQualification: "Degree of any University recognized by University Grants Commission",
    eligibility: {
      qualificationRequirements: "Must possess a Degree of any University recognized by UGC.",
      minDegree: "Bachelor Degree",
      minPercentage: "Passing Marks",
      ageRequirements: "21 to 39 years (for reserved categories)",
      nationality: "Indian Citizen (Tamil Nadu Eligibility Rules apply)"
    },
    selectionProcess: ["Preliminary Examination (Single Paper, 200 Questions)", "Main Written Examination (3 Papers)", "Oral Test (Interview)"],
    applicationStartDate: new Date("2026-03-28"),
    applicationEndDate: new Date("2026-04-27"),
    examDate: new Date("2026-07-12"),
    importantDates: {
      notificationDate: "March 2026",
      applicationStart: "28 March 2026",
      applicationDeadline: "27 April 2026",
      examDate: "12 July 2026",
      resultDate: "November 2026"
    },
    applicationUrl: "https://tnpscexams.in",
    officialWebsite: "https://tnpsc.gov.in",
    notificationUrl: "https://tnpsc.gov.in",
    syllabusUrl: "https://tnpsc.gov.in/english/syllabus.html",
    examPatternUrl: "https://tnpsc.gov.in",
    status: "OPEN",
    sourceType: "TNPSC Official Commission Portal",
    sourceUrl: "https://tnpsc.gov.in",
    sourceConfidence: "HIGH",
    stages: [
      {
        stageName: "Preliminary Examination",
        durationMinutes: 180,
        totalQuestions: 200,
        totalMarks: 300,
        negativeMarking: false,
        sections: [
          { sectionId: "tnpsc_gs", name: "General Studies & Mental Ability", questionCount: 200, marks: 300, durationMinutes: 180, negativeMarking: "None", weightage: 1.0, syllabusTopics: [{ topicId: "tnpsc_hist", name: "History & Culture of Tamil Nadu", normalizedKey: "history", estimatedHours: 6, difficulty: "Medium", syllabusWeight: 95, historicalFrequency: 95, recentFrequency: 95, prerequisites: ["TN Samacheer Kalvi Books"], conceptsToLearn: ["Sangam Age & Freedom Struggle in TN"], revisionChecklist: ["TN History Timeline"] }] }
        ]
      }
    ],
    previousPapers: [
      { year: 2025, stage: "Prelims", section: "GS Paper", paperTitle: "TNPSC Group I 2025 Prelims Official PDF", paperUrl: "https://tnpsc.gov.in", officialSource: "TNPSC Official Website", sourceType: "OFFICIAL_PDF" }
    ],
    sources: [
      { title: "Tamil Nadu Public Service Commission", url: "https://tnpsc.gov.in", sourceType: "Official Portal", confidence: "HIGH", description: "Official website for TNPSC." }
    ]
  },

  // ── 9. PSU ─────────────────────────────────────────────────────────────────
  {
    examId: "isro-scientist",
    name: "ISRO Scientist/Engineer 'SC' Recruitment",
    shortName: "ISRO Scientist SC",
    category: "PSU",
    subCategory: "Space Research & Development",
    conductingOrganization: "ISRO Centralised Recruitment Board (ICRB)",
    description: "Prestigious national recruitment for Scientist/Engineer 'SC' positions in Indian Space Research Organisation centers across India.",
    purpose: "Recruitment of R&D Scientists and Systems Engineers in ISRO Centers (VSSC, URSC, SAC, LPSC).",
    careerOpportunities: ["Scientist/Engineer 'SC' (ISRO)", "Space Mission Payload Engineer", "Rocket Propulsion Engineer"],
    eligibleDegrees: ["B.E.", "B.Tech"],
    eligibleBranches: ["Computer Science", "Electronics & Communication", "Mechanical", "Electrical"],
    minimumQualification: "B.E./B.Tech or equivalent with a minimum first class of 65% marks or CGPA 6.84/10",
    eligibility: {
      qualificationRequirements: "First Class B.E./B.Tech with aggregate minimum 65% marks or CGPA 6.84/10.",
      minDegree: "B.E. / B.Tech",
      minPercentage: "65% Marks / 6.84 CGPA",
      ageRequirements: "18 to 28 years (OBC +3 yrs, SC/ST +5 yrs)",
      nationality: "Indian Citizen"
    },
    selectionProcess: ["Written Examination (80 Objective Questions)", "Personal Interview"],
    applicationStartDate: new Date("2026-05-15"),
    applicationEndDate: new Date("2026-06-05"),
    examDate: new Date("2026-08-20"),
    importantDates: {
      notificationDate: "May 2026",
      applicationStart: "15 May 2026",
      applicationDeadline: "05 June 2026",
      examDate: "August 2026",
      resultDate: "October 2026"
    },
    applicationUrl: "https://isro.gov.in/Careers.html",
    officialWebsite: "https://isro.gov.in",
    notificationUrl: "https://isro.gov.in/Careers.html",
    syllabusUrl: "https://isro.gov.in/Careers.html",
    examPatternUrl: "https://isro.gov.in/Careers.html",
    status: "OPEN",
    sourceType: "ISRO Official Careers Portal",
    sourceUrl: "https://isro.gov.in/Careers.html",
    sourceConfidence: "HIGH",
    stages: [
      {
        stageName: "Written Examination",
        durationMinutes: 120,
        totalQuestions: 80,
        totalMarks: 240,
        negativeMarking: true,
        sections: [
          { sectionId: "isro_discipline", name: "Discipline Core Paper", questionCount: 80, marks: 240, durationMinutes: 120, negativeMarking: "1 mark per wrong answer", weightage: 1.0, syllabusTopics: [{ topicId: "isro_cs_core", name: "Core Discipline Technical Concepts", normalizedKey: "algorithms", estimatedHours: 8, difficulty: "Hard", syllabusWeight: 95, historicalFrequency: 95, recentFrequency: 95, prerequisites: ["B.Tech Core"], conceptsToLearn: ["GATE Level Engineering Problems"], revisionChecklist: ["Formula Cheat Sheet"] }] }
        ]
      }
    ],
    previousPapers: [
      { year: 2025, stage: "Written", section: "CS / ECE Paper", paperTitle: "ISRO Scientist 2025 Official Question Paper", paperUrl: "https://isro.gov.in/Careers.html", officialSource: "ISRO ICRB Portal", sourceType: "OFFICIAL_PDF" }
    ],
    sources: [
      { title: "ISRO Careers Official Portal", url: "https://isro.gov.in/Careers.html", sourceType: "Official Portal", confidence: "HIGH", description: "Official website for ISRO Scientist recruitment." }
    ]
  }
];

async function runSeed() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/uyarvu_payanam";
    console.log(`Connecting to MongoDB for Exam Seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log("Seeding Graduate Examinations database...");
    for (const item of SEED_EXAMS) {
      await Exam.findOneAndUpdate(
        { examId: item.examId },
        { $set: item },
        { upsert: true, new: true }
      );
      console.log(`✓ Seeded/Updated Exam: ${item.shortName} (${item.category})`);
    }

    const count = await Exam.countDocuments({});
    console.log(`\nSuccessfully seeded database! Total Exam records: ${count}`);
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = {
  runSeed,
  SEED_EXAMS
};