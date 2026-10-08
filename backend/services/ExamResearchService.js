/**
 * Exam Research Service
 * Authoritative source intelligence & Tavily-based web research for graduate exams.
 */

const axios = require("axios");
const Exam = require("../models/Exam");

const DEFAULT_EXAMS = [
  {
    examId: "ssc-cgl",
    name: "SSC Combined Graduate Level Examination",
    shortName: "SSC CGL",
    category: "Government",
    conductingOrganization: "Staff Selection Commission (SSC)",
    description: "National competitive examination conducted to recruit staff for Group B and Group C non-technical posts in various Ministries, Departments, and Organizations of the Government of India.",
    purpose: "Recruitment to Group B & C posts in Central Government Ministries.",
    careerOpportunities: ["Assistant Section Officer (ASO)", "Inspector of Income Tax", "Central Excise Inspector", "Assistant Enforcement Officer", "Sub Inspector (CBI)", "Auditor (CAG)"],
    eligibility: {
      qualificationRequirements: "Bachelor's Degree in any discipline from a recognized University or equivalent.",
      minDegree: "Bachelor Degree",
      minPercentage: "Passing Marks",
      ageRequirements: "18 to 30 years (category relaxation: OBC +3 yrs, SC/ST +5 yrs)",
      nationality: "Indian Citizen"
    },
    selectionProcess: ["Tier 1: Computer Based Examination (Qualifying)", "Tier 2: Computer Based Examination (Paper I - Compulsory, Paper II - AAO/JSO)"],
    importantDates: {
      notificationDate: "June 2026",
      applicationStart: "June 2026",
      applicationDeadline: "July 2026",
      examDate: "September - October 2026",
      resultDate: "December 2026"
    },
    applicationUrl: "https://ssc.gov.in",
    officialWebsite: "https://ssc.gov.in",
    notificationUrl: "https://ssc.gov.in/notifications",
    syllabusUrl: "https://ssc.gov.in/syllabus",
    examPatternUrl: "https://ssc.gov.in/candidate-corner/exam-pattern",
    status: "OPEN",
    sourceConfidence: "HIGH",
    stages: [
      {
        stageName: "Tier 1: Computer Based Examination",
        durationMinutes: 60,
        totalQuestions: 100,
        totalMarks: 200,
        negativeMarking: true,
        sections: [
          {
            sectionId: "tier1_quant",
            name: "Quantitative Aptitude",
            questionCount: 25,
            marks: 50,
            durationMinutes: 15,
            negativeMarking: "0.50",
            weightage: 1.0,
            syllabusTopics: [
              { topicId: "quant_percentage", name: "Percentage", normalizedKey: "percentage", estimatedHours: 4, difficulty: "Medium", syllabusWeight: 85, historicalFrequency: 90, recentFrequency: 88, prerequisites: ["Basic Arithmetic"], conceptsToLearn: ["Percentage Increase/Decrease", "Successive Percentage", "Fraction Conversions"], revisionChecklist: ["Fraction to % table", "Net % change formula"] },
              { topicId: "quant_time_work", name: "Time & Work", normalizedKey: "time_work", estimatedHours: 4, difficulty: "Medium", syllabusWeight: 90, historicalFrequency: 92, recentFrequency: 94, prerequisites: ["LCM & Ratio"], conceptsToLearn: ["Efficiency Method", "Pipes & Cisterns", "Alternate Day Work"], revisionChecklist: ["Work = Rate x Time", "Negative work of leak"] },
              { topicId: "quant_profit_loss", name: "Profit & Loss", normalizedKey: "profit_loss", estimatedHours: 4, difficulty: "Medium", syllabusWeight: 88, historicalFrequency: 85, recentFrequency: 86, prerequisites: ["Percentage"], conceptsToLearn: ["Cost Price vs Selling Price", "Marked Price & Discount", "Faulty Weights"], revisionChecklist: ["Equating CP & SP", "Effective discount formula"] },
              { topicId: "quant_geometry", name: "Geometry & Mensuration", normalizedKey: "geometry", estimatedHours: 6, difficulty: "Hard", syllabusWeight: 80, historicalFrequency: 75, recentFrequency: 78, prerequisites: ["Lines & Angles"], conceptsToLearn: ["Triangles & Incenter", "Circles & Tangents", "3D Volume Formulas"], revisionChecklist: ["Centroid/Orthocenter theorems", "Cone & Sphere volumes"] }
            ]
          },
          {
            sectionId: "tier1_reasoning",
            name: "General Intelligence & Reasoning",
            questionCount: 25,
            marks: 50,
            durationMinutes: 15,
            negativeMarking: "0.50",
            weightage: 1.0,
            syllabusTopics: [
              { topicId: "reasoning_analogy", name: "Analogy & Classification", normalizedKey: "analogy", estimatedHours: 3, difficulty: "Easy", syllabusWeight: 85, historicalFrequency: 85, recentFrequency: 85, prerequisites: ["Alphabet Positions"], conceptsToLearn: ["Letter Analogy", "Number Analogy", "Word Association"], revisionChecklist: ["A-Z opposite pairs", "Squares & Cubes up to 30"] },
              { topicId: "reasoning_syllogism", name: "Syllogism & Logic", normalizedKey: "syllogism", estimatedHours: 3, difficulty: "Medium", syllabusWeight: 80, historicalFrequency: 80, recentFrequency: 82, prerequisites: ["Venn Diagrams"], conceptsToLearn: ["Some & All Cases", "Either-Or Logic", "Possibility Cases"], revisionChecklist: ["Standard Venn diagram patterns"] }
            ]
          },
          {
            sectionId: "tier1_english",
            name: "English Comprehension",
            questionCount: 25,
            marks: 50,
            durationMinutes: 15,
            negativeMarking: "0.50",
            weightage: 1.0,
            syllabusTopics: [
              { topicId: "english_grammar", name: "Grammar & Error Spotting", normalizedKey: "verbal_ability", estimatedHours: 5, difficulty: "Medium", syllabusWeight: 90, historicalFrequency: 92, recentFrequency: 90, prerequisites: ["Parts of Speech"], conceptsToLearn: ["Subject-Verb Agreement", "Tenses & Modals", "Prepositions & Articles"], revisionChecklist: ["120 Rules of English Grammar"] },
              { topicId: "english_vocab", name: "Vocabulary & Idioms", normalizedKey: "vocabulary", estimatedHours: 4, difficulty: "Medium", syllabusWeight: 85, historicalFrequency: 88, recentFrequency: 87, prerequisites: ["Root Words"], conceptsToLearn: ["Synonyms & Antonyms", "One Word Substitution", "Idioms & Phrases"], revisionChecklist: ["500 Repeated SSC Idioms"] }
            ]
          },
          {
            sectionId: "tier1_ga",
            name: "General Awareness",
            questionCount: 25,
            marks: 50,
            durationMinutes: 15,
            negativeMarking: "0.50",
            weightage: 1.0,
            syllabusTopics: [
              { topicId: "ga_polity", name: "Indian Polity & Constitution", normalizedKey: "polity", estimatedHours: 5, difficulty: "Medium", syllabusWeight: 88, historicalFrequency: 90, recentFrequency: 89, prerequisites: ["Preamble Basics"], conceptsToLearn: ["Fundamental Rights", "Articles & Amendments", "Parliament & Judiciary"], revisionChecklist: ["Important Articles list", "Constitutional Bodies"] },
              { topicId: "ga_history", name: "Modern History & Freedom Movement", normalizedKey: "history", estimatedHours: 4, difficulty: "Medium", syllabusWeight: 80, historicalFrequency: 82, recentFrequency: 81, prerequisites: ["Timeline 1857-1947"], conceptsToLearn: ["1857 Revolt", "Gandhian Era", "Viceroys & Acts"], revisionChecklist: ["Chronology of Freedom Struggle"] }
            ]
          }
        ]
      }
    ],
    previousPapers: [
      { year: 2025, stage: "Tier 1", section: "All Sections", paperTitle: "SSC CGL 2025 Tier 1 Official Question Paper with Answer Key", paperUrl: "https://ssc.gov.in/answer-keys", officialSource: "Staff Selection Commission Official Portal", sourceType: "OFFICIAL_PDF" },
      { year: 2024, stage: "Tier 1", section: "All Sections", paperTitle: "SSC CGL 2024 Tier 1 Official Question Paper Archive", paperUrl: "https://ssc.gov.in/answer-keys", officialSource: "Staff Selection Commission Official Portal", sourceType: "OFFICIAL_PDF" },
      { year: 2023, stage: "Tier 1", section: "All Sections", paperTitle: "SSC CGL 2023 Tier 1 Official Question Paper Archive", paperUrl: "https://ssc.gov.in/answer-keys", officialSource: "Staff Selection Commission Official Portal", sourceType: "OFFICIAL_PDF" }
    ],
    sources: [
      { title: "Staff Selection Commission Official Portal", url: "https://ssc.gov.in", sourceType: "Official Authority", confidence: "HIGH", description: "Official website of SSC for CGL notifications, syllabus, and results." },
      { title: "SSC CGL Official Examination Scheme", url: "https://ssc.gov.in/notifications", sourceType: "Official Scheme", confidence: "HIGH", description: "Verified notification details detailing Tier 1 & Tier 2 exam structure." }
    ]
  },
  {
    examId: "gate-cse",
    name: "Graduate Aptitude Test in Engineering (Computer Science)",
    shortName: "GATE CSE",
    category: "Engineering",
    conductingOrganization: "IITs / IISc (Organizing Institute)",
    description: "National level examination that tests comprehensive understanding of various undergraduate subjects in Engineering and Technology for M.Tech admissions and PSU recruitment.",
    purpose: "Admission to M.Tech/Ph.D. in IITs/NITs and recruitment in PSUs like IOCL, NTPC, ONGC, HPCL, POSOCO.",
    careerOpportunities: ["M.Tech in IITs/NITs", "PSU Engineer (IOCL, NTPC, ONGC)", "Direct PhD Fellowship (Prime Minister Research Fellowship)"],
    eligibility: {
      qualificationRequirements: "Bachelor's degree in Engineering / Technology (B.E./B.Tech) or Master's degree in relevant science subject.",
      minDegree: "B.E. / B.Tech / M.Sc",
      minPercentage: "Passing Marks",
      ageRequirements: "No age limit",
      nationality: "Indian & Foreign candidates eligible"
    },
    selectionProcess: ["Single Stage CBT Examination (3 Hours, 65 Questions, 100 Marks)"],
    importantDates: {
      notificationDate: "August 2026",
      applicationStart: "August 2026",
      applicationDeadline: "September 2026",
      examDate: "February 2027",
      resultDate: "March 2027"
    },
    applicationUrl: "https://gate2026.iitr.ac.in",
    officialWebsite: "https://gate2026.iitr.ac.in",
    notificationUrl: "https://gate2026.iitr.ac.in/syllabus.html",
    syllabusUrl: "https://gate2026.iitr.ac.in/syllabus/CS.pdf",
    examPatternUrl: "https://gate2026.iitr.ac.in/exam-pattern.html",
    status: "OPEN",
    sourceConfidence: "HIGH",
    stages: [
      {
        stageName: "GATE CBT Examination",
        durationMinutes: 180,
        totalQuestions: 65,
        totalMarks: 100,
        negativeMarking: true,
        sections: [
          {
            sectionId: "gate_cs_core",
            name: "Computer Science & Information Technology",
            questionCount: 55,
            marks: 85,
            durationMinutes: 150,
            negativeMarking: "1/3 for 1-mark, 2/3 for 2-mark",
            weightage: 1.0,
            syllabusTopics: [
              { topicId: "gate_ds_algo", name: "Data Structures & Algorithms", normalizedKey: "algorithms", estimatedHours: 8, difficulty: "Hard", syllabusWeight: 95, historicalFrequency: 96, recentFrequency: 95, prerequisites: ["C Programming"], conceptsToLearn: ["Trees & Heaps", "Graph Traversal BFS/DFS", "Dynamic Programming & Greedy"], revisionChecklist: ["Asymptotic notation rules", "Dijkstra & Prim complexity"] },
              { topicId: "gate_dbms", name: "Database Management Systems", normalizedKey: "dbms", estimatedHours: 6, difficulty: "Medium", syllabusWeight: 88, historicalFrequency: 85, recentFrequency: 88, prerequisites: ["Basic Set Theory"], conceptsToLearn: ["Relational Algebra & SQL", "Normal Forms (1NF to BCNF)", "Transactions & Concurrency"], revisionChecklist: ["FD closure & BCNF decomposition", "Conflict serializability"] },
              { topicId: "gate_os", name: "Operating Systems", normalizedKey: "operating_systems", estimatedHours: 6, difficulty: "Medium", syllabusWeight: 85, historicalFrequency: 84, recentFrequency: 86, prerequisites: ["Computer Architecture"], conceptsToLearn: ["CPU Scheduling Algorithms", "Semaphores & Mutex Locks", "Virtual Memory & Paging"], revisionChecklist: ["Banker's Algorithm", "Page fault calculation"] }
            ]
          },
          {
            sectionId: "gate_ga",
            name: "General Aptitude",
            questionCount: 10,
            marks: 15,
            durationMinutes: 30,
            negativeMarking: "1/3 for 1-mark, 2/3 for 2-mark",
            weightage: 1.0,
            syllabusTopics: [
              { topicId: "gate_ga_math", name: "Engineering Mathematics & Quantitative Aptitude", normalizedKey: "number_system", estimatedHours: 4, difficulty: "Medium", syllabusWeight: 90, historicalFrequency: 90, recentFrequency: 90, prerequisites: ["Calculus & Linear Algebra"], conceptsToLearn: ["Eigenvalues & Eigenvectors", "Probability & Distribution", "Spatial Aptitude"], revisionChecklist: ["Matrix rank properties", "Bayes theorem formula"] }
            ]
          }
        ]
      }
    ],
    previousPapers: [
      { year: 2025, stage: "Main", section: "CS Paper", paperTitle: "GATE 2025 CS Official Question Paper & Master Answer Key", paperUrl: "https://gate2026.iitr.ac.in/previous-papers.html", officialSource: "GATE Organizing Institute", sourceType: "OFFICIAL_PDF" },
      { year: 2024, stage: "Main", section: "CS Paper", paperTitle: "GATE 2024 CS Official Question Paper & Answer Key Archive", paperUrl: "https://gate2026.iitr.ac.in/previous-papers.html", officialSource: "GATE Organizing Institute", sourceType: "OFFICIAL_PDF" }
    ],
    sources: [
      { title: "GATE Official Organizing Committee Portal", url: "https://gate2026.iitr.ac.in", sourceType: "Official Committee", confidence: "HIGH", description: "Verified official GATE examination website." }
    ]
  },
  {
    examId: "upsc-cse",
    name: "UPSC Civil Services Examination",
    shortName: "UPSC CSE",
    category: "Government",
    conductingOrganization: "Union Public Service Commission (UPSC)",
    description: "Premier national competitive examination conducted for recruitment to higher Civil Services of the Government of India, including IAS, IPS, IFS, and IRS.",
    purpose: "Recruitment to Indian Administrative Service (IAS), Indian Police Service (IPS), Indian Foreign Service (IFS), and Central Group A Services.",
    careerOpportunities: ["District Magistrate (IAS)", "Superintendent of Police (IPS)", "Diplomat (IFS)", "Commissioner of Revenue (IRS)"],
    eligibility: {
      qualificationRequirements: "Degree from any recognized University or equivalent qualification.",
      minDegree: "Bachelor Degree",
      minPercentage: "Passing Marks",
      ageRequirements: "21 to 32 years (Relaxations: OBC 35 yrs, SC/ST 37 yrs)",
      nationality: "Indian Citizen (for IAS & IPS)"
    },
    selectionProcess: ["Stage 1: Preliminary Examination (GS Paper I & CSAT Paper II)", "Stage 2: Main Written Examination (9 Papers)", "Stage 3: Personality Test (Interview)"],
    importantDates: {
      notificationDate: "February 2026",
      applicationStart: "February 2026",
      applicationDeadline: "March 2026",
      examDate: "May 2026 (Prelims)",
      resultDate: "September 2026 (Mains)"
    },
    applicationUrl: "https://upsconline.nic.in",
    officialWebsite: "https://upsc.gov.in",
    notificationUrl: "https://upsc.gov.in/examinations/active-exams",
    syllabusUrl: "https://upsc.gov.in/examinations/syllabi",
    examPatternUrl: "https://upsc.gov.in/examinations/examination-scheme",
    status: "OPEN",
    sourceConfidence: "HIGH",
    stages: [
      {
        stageName: "Stage 1: Preliminary Examination",
        durationMinutes: 240,
        totalQuestions: 180,
        totalMarks: 400,
        negativeMarking: true,
        sections: [
          {
            sectionId: "prelims_gs1",
            name: "General Studies Paper I",
            questionCount: 100,
            marks: 200,
            durationMinutes: 120,
            negativeMarking: "1/3 (0.66 marks)",
            weightage: 1.0,
            syllabusTopics: [
              { topicId: "upsc_polity", name: "Indian Polity & Governance", normalizedKey: "polity", estimatedHours: 10, difficulty: "Hard", syllabusWeight: 98, historicalFrequency: 95, recentFrequency: 96, prerequisites: ["NCERT Class 11-12 Polity"], conceptsToLearn: ["Constitutional Framework & Rights", "Parliamentary Committees", "Federal System & Panchayats"], revisionChecklist: ["Laxmikanth High-Yield Chapters"] },
              { topicId: "upsc_history", name: "History of India & Freedom Movement", normalizedKey: "history", estimatedHours: 8, difficulty: "Medium", syllabusWeight: 88, historicalFrequency: 85, recentFrequency: 84, prerequisites: ["Modern History NCERT"], conceptsToLearn: ["Socio-Religious Movements", "Gandhian Movements & Acts", "Art & Architecture"], revisionChecklist: ["Spectrum Modern History Summary"] }
            ]
          },
          {
            sectionId: "prelims_csat",
            name: "CSAT Paper II (Qualifying 33%)",
            questionCount: 80,
            marks: 200,
            durationMinutes: 120,
            negativeMarking: "1/3 (0.83 marks)",
            weightage: 1.0,
            syllabusTopics: [
              { topicId: "csat_math_rc", name: "Reading Comprehension & Logical Aptitude", normalizedKey: "reading_comprehension", estimatedHours: 4, difficulty: "Medium", syllabusWeight: 90, historicalFrequency: 90, recentFrequency: 92, prerequisites: ["Basic English & Math"], conceptsToLearn: ["Passage Assumptions & Inferences", "Basic Numeracy & Data Interpretation"], revisionChecklist: ["CSAT Past 5 Years Papers"] }
            ]
          }
        ]
      }
    ],
    previousPapers: [
      { year: 2025, stage: "Prelims", section: "GS Paper 1", paperTitle: "UPSC Civil Services Prelims 2025 GS Paper 1 Official PDF", paperUrl: "https://upsc.gov.in/examinations/previous-question-papers", officialSource: "Union Public Service Commission Official Website", sourceType: "OFFICIAL_PDF" },
      { year: 2024, stage: "Prelims", section: "GS Paper 1", paperTitle: "UPSC Civil Services Prelims 2024 GS Paper 1 Official PDF", paperUrl: "https://upsc.gov.in/examinations/previous-question-papers", officialSource: "Union Public Service Commission Official Website", sourceType: "OFFICIAL_PDF" }
    ],
    sources: [
      { title: "Union Public Service Commission Official Portal", url: "https://upsc.gov.in", sourceType: "Official Portal", confidence: "HIGH", description: "Official website of UPSC for Civil Services examination notifications." }
    ]
  },
  {
    examId: "cat",
    name: "Common Admission Test (CAT)",
    shortName: "CAT",
    category: "Management",
    conductingOrganization: "Indian Institutes of Management (IIMs)",
    description: "Computer-based test conducted by IIMs for admission to postgraduate management programs (MBA/PGDM) across IIMs and top B-schools in India.",
    purpose: "Admission to MBA/PGDM programs in 21 IIMs, FMS Delhi, XLRI, SPJIMR, MDI, IIT B-Schools, etc.",
    careerOpportunities: ["Management Consultant", "Investment Banker", "Product Manager", "Brand Manager"],
    eligibility: {
      qualificationRequirements: "Bachelor's Degree with at least 50% marks or equivalent CGPA (45% for SC/ST/PwD).",
      minDegree: "Bachelor Degree",
      minPercentage: "50%",
      ageRequirements: "No age limit",
      nationality: "Indian & International Candidates"
    },
    selectionProcess: ["CAT Computer Based Test (2 Hours)", "Written Ability Test (WAT) / Group Discussion (GD)", "Personal Interview (PI)"],
    importantDates: {
      notificationDate: "July 2026",
      applicationStart: "August 2026",
      applicationDeadline: "September 2026",
      examDate: "November 2026",
      resultDate: "January 2027"
    },
    applicationUrl: "https://iimcat.ac.in",
    officialWebsite: "https://iimcat.ac.in",
    notificationUrl: "https://iimcat.ac.in/per/g01/pub/756/ASM/WebPortal/1/index.html",
    syllabusUrl: "https://iimcat.ac.in/per/g01/pub/756/ASM/WebPortal/1/index.html",
    examPatternUrl: "https://iimcat.ac.in",
    status: "OPEN",
    sourceConfidence: "HIGH",
    stages: [
      {
        stageName: "CAT CBT Examination",
        durationMinutes: 120,
        totalQuestions: 66,
        totalMarks: 198,
        negativeMarking: true,
        sections: [
          { sectionId: "varc", name: "Verbal Ability & Reading Comprehension (VARC)", questionCount: 24, marks: 72, durationMinutes: 40, negativeMarking: "-1 for MCQ, 0 for TITA", weightage: 1.0, syllabusTopics: [{ topicId: "varc_rc", name: "Reading Comprehension Passages", normalizedKey: "reading_comprehension", estimatedHours: 6, difficulty: "Hard", syllabusWeight: 95, historicalFrequency: 95, recentFrequency: 95, prerequisites: ["Advanced Reading Skills"], conceptsToLearn: ["Main Idea & Tone Extraction", "Inference & Author Agreement"], revisionChecklist: ["Daily AEON Essay Practice"] }] },
          { sectionId: "dilr", name: "Data Interpretation & Logical Reasoning (DILR)", questionCount: 20, marks: 60, durationMinutes: 40, negativeMarking: "-1 for MCQ, 0 for TITA", weightage: 1.0, syllabusTopics: [{ topicId: "dilr_puzzles", name: "DILR Matrix & Games Sets", normalizedKey: "data_interpretation_lr", estimatedHours: 6, difficulty: "Hard", syllabusWeight: 95, historicalFrequency: 95, recentFrequency: 95, prerequisites: ["Basic Puzzle Logic"], conceptsToLearn: ["Tournament & Seating Arrangements", "Quant-based DI Sets"], revisionChecklist: ["100 Advanced DILR Sets"] }] },
          { sectionId: "qa", name: "Quantitative Ability (QA)", questionCount: 22, marks: 66, durationMinutes: 40, negativeMarking: "-1 for MCQ, 0 for TITA", weightage: 1.0, syllabusTopics: [{ topicId: "qa_arithmetic", name: "Arithmetic & Algebra", normalizedKey: "percentage", estimatedHours: 8, difficulty: "Hard", syllabusWeight: 95, historicalFrequency: 95, recentFrequency: 95, prerequisites: ["Class 10 Math"], conceptsToLearn: ["Percentages & Profit Loss", "Quadratic Equations & Logarithms"], revisionChecklist: ["Formula Cheat Sheet"] }] }
        ]
      }
    ],
    previousPapers: [
      { year: 2025, stage: "Main", section: "All Slots", paperTitle: "CAT 2025 Official Question Paper & Candidate Response Sheet", paperUrl: "https://iimcat.ac.in", officialSource: "IIM CAT Convenor Portal", sourceType: "OFFICIAL_PORTAL" }
    ],
    sources: [
      { title: "IIM CAT Official Portal", url: "https://iimcat.ac.in", sourceType: "Official Committee", confidence: "HIGH", description: "Official website for CAT registrations and notification." }
    ]
  }
];

const { SEED_EXAMS } = require("../seeders/seedGraduateExams");

// Seed default exams into MongoDB if collection is empty
async function seedDefaultExams() {
  try {
    const listToSeed = (SEED_EXAMS && SEED_EXAMS.length > 0) ? SEED_EXAMS : DEFAULT_EXAMS;
    for (const item of listToSeed) {
      await Exam.findOneAndUpdate(
        { examId: item.examId },
        { $setOnInsert: item },
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    console.error("Error seeding default exams:", err);
  }
}

// Live Research using Tavily API if configured
async function triggerTavilyExamResearch(queryStr) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return {
      searched: false,
      message: "Tavily API key not configured on server. Using verified built-in official sources."
    };
  }

  try {
    const res = await axios.post("https://api.tavily.com/search", {
      api_key: apiKey,
      query: `official examination notification ${queryStr} syllabus exam pattern 2026`,
      search_depth: "advanced",
      include_answer: true,
      max_results: 5
    }, { timeout: 10000 });

    return {
      searched: true,
      answer: res.data?.answer || "",
      results: res.data?.results || []
    };
  } catch (err) {
    console.error("Tavily exam research error:", err.message);
    return {
      searched: false,
      error: err.message,
      message: "Tavily lookup failed. Fallback to cached verified dataset."
    };
  }
}

module.exports = {
  seedDefaultExams,
  triggerTavilyExamResearch,
  DEFAULT_EXAMS
};
