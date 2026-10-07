/* ─────────────────────────────────────────────────────────────────────────────
   seedGraduateExams — initial catalogue for the Graduate Exams admin module.

   State → Tamil Nadu follows the reference structure (Oliveboard guide):
   TNPSC, TNPCB, TNUSRB, TN TRB, TNEB (TANTRANSCO / TANGEDCO), TNFUSRC,
   Tamil Nadu State Transport Corporation, Tamil Nadu Agriculture University,
   Banking & Railway Recruitment Board and other TN organizations — every body
   is its own RecruitmentOrganization record with its own exams.

   Data principle: the seed provides STRUCTURAL exam information (what the exam
   is, typical posts) plus clearly marked REFERENCE values from the guide.
   Every current/vacancy-style field (dates, live status, application URL) is
   left empty or reads "Refer to the latest official notification" — nothing
   volatile is fabricated. The Oliveboard URL is stored ONLY in the
   `referenceSource` field and is never treated as an official application URL.

   Idempotent: organizations are upserted by slug, exams by slug. Retired
   legacy records listed in RETIRED_EXAM_SLUGS are hard-deleted so no old
   Tamil Nadu entries remain alongside the new structure.
   Run with: npm run seed:graduate-exams
   ───────────────────────────────────────────────────────────────────────────── */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const RecruitmentOrganization = require("../models/RecruitmentOrganization");
const GraduateExam = require("../models/GraduateExam");
const slugify = require("../utils/slugify");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const REFER = "Refer to the latest official notification";

/* ── Organizations ────────────────────────────────────────────────────────── */

// Third-party reference guide used as the structural source for the Tamil Nadu
// state organizations. Stored ONLY in `referenceSource` (never as an official
// application/notification URL).
const OLIVEBOARD_REFERENCE = "https://www.oliveboard.in/blog/tamil-nadu-govt-jobs/";

const ORGANIZATIONS = [
  {
    name: "Tamil Nadu Public Service Commission (TNPSC)",
    slug: "tnpsc",
    governmentType: "State",
    state: "Tamil Nadu",
    description:
      "Tamil Nadu Public Service Commission conducts recruitment examinations for various Tamil Nadu state government services.",
    officialWebsite: "https://www.tnpsc.gov.in",
    sourceUrl: "https://apply.tnpscexams.in/notification?app_id=UElZMDAwMDAwMQ==",
    referenceSource: OLIVEBOARD_REFERENCE,
  },
  {
    name: "Tamil Nadu Pollution Control Board (TNPCB)",
    slug: "tnpcb",
    governmentType: "State",
    state: "Tamil Nadu",
    description:
      "Constituted by the Government of Tamil Nadu under the Water, Air and Environment (Prevention & Control of Pollution) Acts; manages biomedical, solid, plastic, e-waste and construction & demolition waste and builds environmental awareness through a three-tier technical hierarchy.",
    officialWebsite: "https://tnpcb.gov.in",
    sourceUrl: "",
    referenceSource: OLIVEBOARD_REFERENCE,
  },
  {
    name: "Tamil Nadu Uniformed Services Recruitment Board (TNUSRB)",
    slug: "tnusrb",
    governmentType: "State",
    state: "Tamil Nadu",
    description:
      "Also known as the Tamil Nadu Police Recruitment Board; conducts recruitment for police and uniformed services — Grade-II Constables, Jail Warders, Firemen and Sub-Inspectors.",
    officialWebsite: "https://www.tnusrb.tn.gov.in",
    sourceUrl: "",
    referenceSource: OLIVEBOARD_REFERENCE,
  },
  {
    name: "Tamil Nadu Teachers Recruitment Board (TN TRB)",
    slug: "tn-trb",
    governmentType: "State",
    state: "Tamil Nadu",
    description:
      "Recruitment board for teaching posts in Tamil Nadu schools and colleges — conducts TNTET, TNSET and teacher / professor related recruitment.",
    officialWebsite: "https://www.trb.tn.gov.in",
    sourceUrl: "",
    referenceSource: OLIVEBOARD_REFERENCE,
  },
  {
    name: "Tamil Nadu Electricity Board (TNEB / TANTRANSCO / TANGEDCO)",
    slug: "tneb",
    governmentType: "State",
    state: "Tamil Nadu",
    description:
      "TNEB is the holding company restructured under the Electricity Act, 2003 with the subsidiaries TANTRANSCO (transmission) and TANGEDCO (generation & distribution). Recruitments are notified across the TNEB group.",
    officialWebsite: "https://www.tangedco.org",
    sourceUrl: "",
    referenceSource: OLIVEBOARD_REFERENCE,
  },
  {
    name: "Tamil Nadu Forest Uniformed Services Recruitment Committee (TNFUSRC)",
    slug: "tnfusrc",
    governmentType: "State",
    state: "Tamil Nadu",
    description:
      "Conducts recruitment for the Tamil Nadu Forest Department uniformed services — Forest Guards, Forest Watchers, Foresters and Junior Research Fellows.",
    officialWebsite: "https://www.forests.tn.gov.in",
    sourceUrl: "",
    referenceSource: OLIVEBOARD_REFERENCE,
  },
  {
    name: "Tamil Nadu State Transport Corporation",
    slug: "tnstc",
    governmentType: "State",
    state: "Tamil Nadu",
    description:
      "State public road-transport undertaking of Tamil Nadu; notifies its own recruitment for driver, conductor, technical and administrative posts.",
    officialWebsite: "https://www.tnstc.in",
    sourceUrl: "",
    referenceSource: OLIVEBOARD_REFERENCE,
  },
  {
    name: "Tamil Nadu Agriculture University (TNAU)",
    slug: "tnau",
    governmentType: "State",
    state: "Tamil Nadu",
    description:
      "The state agriculture university (Coimbatore) — recruits teaching, research and non-teaching staff for its campuses and colleges.",
    officialWebsite: "https://www.tnau.ac.in",
    sourceUrl: "",
    referenceSource: OLIVEBOARD_REFERENCE,
  },
  {
    name: "Banking & Railway Recruitment Board (Tamil Nadu)",
    slug: "tn-brrb",
    governmentType: "State",
    state: "Tamil Nadu",
    description:
      "Banking and railway recruitments relevant for Tamil Nadu candidates — conducted by the national bodies (IBPS / SBI and the Railway Recruitment Boards).",
    officialWebsite: "",
    sourceUrl: "",
    referenceSource: OLIVEBOARD_REFERENCE,
  },
  {
    name: "Other Tamil Nadu Government Recruitment Organizations",
    slug: "tn-other",
    governmentType: "State",
    state: "Tamil Nadu",
    description:
      "Additional Tamil Nadu state boards, departments and public sector undertakings that periodically notify state recruitments; refer to each organisation's official website for current notifications.",
    officialWebsite: "",
    sourceUrl: "",
    referenceSource: OLIVEBOARD_REFERENCE,
  },
  {
    name: "Union Public Service Commission (UPSC)",
    slug: "upsc",
    governmentType: "Central",
    state: "",
    description:
      "The Union Public Service Commission conducts the flagship national service examinations (CSE, Civil Engineering, Medical Services and others).",
    officialWebsite: "https://upsc.gov.in",
    sourceUrl: "",
    referenceSource: "",
  },
  {
    name: "Staff Selection Commission (SSC)",
    slug: "ssc",
    governmentType: "Central",
    state: "",
    description:
      "SSC conducts combined-level recruitment examinations (CGL, CHSL, CPO, MTS) for various central government departments.",
    officialWebsite: "https://ssc.gov.in",
    sourceUrl: "",
    referenceSource: "",
  },
  {
    name: "Banking & Financial Institutions (IBPS / SBI)",
    slug: "banking",
    governmentType: "Central",
    state: "",
    description:
      "Recruitment for officer and clerk roles in public sector banks through IBPS and State Bank of India.",
    officialWebsite: "https://www.ibps.in",
    sourceUrl: "",
    referenceSource: "",
  },
  {
    name: "Railway Recruitment Boards (RRB)",
    slug: "railways",
    governmentType: "Central",
    state: "",
    description:
      "Recruitment for graduate, undergraduate and level-1 posts across Indian Railways zones.",
    officialWebsite: "https://indianrailways.gov.in",
    sourceUrl: "",
    referenceSource: "",
  },
  {
    name: "Other Central Government Bodies",
    slug: "other-central",
    governmentType: "Central",
    state: "",
    description:
      "Sectoral recruitments announced by individual central organisations and public sector undertakings (EPFO, ESIC, CBDT, NTA, PSUs and more).",
    officialWebsite: "",
    sourceUrl: "",
    referenceSource: "",
  },
];

/* ── TNPSC Exams (State → Tamil Nadu) ─────────────────────────────────────── */

const PATTERN = (mode, duration, questions, marks, subjects) => ({
  mode,
  duration,
  questions,
  marks,
  subjects,
});

const TNPSC_EXAMS = [
  {
    slug: "group-1",
    examName: "TNPSC Group I",
    shortName: "Group I",
    category: "Combined Civil Services Examination – I",
    description:
      "The flagship TNPSC examination for senior State services posts across the administrative, police, and allied departments.",
    qualification: "Bachelor\u2019s degree from a recognised university; post-wise subject requirements and final-year provisions as per the official notification.",
    posts: [
      "Deputy Collector / District Officer",
      "Deputy Superintendent of Police",
      "Assistant Commissioner (Commercial Taxes)",
      "Deputy Registrar of Co-operative Societies",
      "Assistant Director (Rural Development)",
      "District Employment Officer / related officer-level posts",
    ],
    selectionProcess: [
      "Preliminary Examination (objective type) — screening",
      "Main Examination (written, descriptive)",
      "Oral Test / Interview",
      "Minimum qualifying standards for each stage as specified in the notification",
    ],
    examPattern: PATTERN(
      "Objective type (Preliminary) and descriptive written examination (Mains)",
      "As specified in the official notification",
      REFER,
      REFER,
      ["General Studies", "Aptitude & Mental Ability", "Tamil / General English (as applicable)", "Optional subject(s) at Mains (group-specific)"]
    ),
    syllabus: [
      "General Studies — history, geography, polity, economy, science & current affairs of India and Tamil Nadu",
      "Aptitude & Mental Ability — quantitative aptitude, reasoning, data interpretation",
      "Optional subjects and papers as published in the official syllabus for the current cycle",
    ],
  },
  {
    slug: "group-2",
    examName: "TNPSC Group II",
    shortName: "Group II",
    category: "Combined Civil Services Examination – II",
    description:
      "Recruitment for executive and non-gazetted posts in Tamil Nadu state departments and services.",
    qualification: "Bachelor\u2019s degree from a recognised university; post-wise subject or technical requirements as per the official notification.",
    posts: [
      "Deputy Commercial Tax Officer",
      "Sub-Registrar",
      "Probation Officer",
      "Junior Employment Officer",
      "Assistant Section Officer",
      "Special Assistant (various departments)",
      "Senior Inspector / related supervisory posts",
    ],
    selectionProcess: [
      "Preliminary Examination (objective) — common with Group IIA for the preliminary stage",
      "Main Examination — conducted separately for Group II",
      "Oral Test / Interview for specified posts",
      "Certificate verification",
    ],
    examPattern: PATTERN(
      "Objective type (Preliminary) and written examination (Mains)",
      "As specified in the official notification",
      REFER,
      REFER,
      ["General Studies", "Aptitude & Mental Ability", "Tamil / General English (as applicable)", "Post-specific and language papers at Mains"]
    ),
    syllabus: [
      "General Studies and language papers as published in the official syllabus",
      "Post-specific papers such as accounts, office procedures and computer basics (where applicable)",
      "Full syllabus per the official notification of the current cycle",
    ],
  },
  {
    slug: "group-2a",
    examName: "TNPSC Group IIA",
    shortName: "Group IIA",
    category: "Combined Civil Services Examination – IIA (Non-Interview Posts)",
    description:
      "Recruitment for non-interview executive and clerical posts — Group IIA shares the common preliminary stage with Group II but has its own mains and post set.",
    qualification: "Bachelor\u2019s degree from a recognised university; post-wise requirements as per the official notification.",
    posts: [
      "Junior Assistant / Assistant (non-security and security posts)",
      "Assistant Section Officer (as per notification)",
      "Clerical and record-keeping posts in state departments",
      "Typist / Steno-Typist posts (where included)",
    ],
    selectionProcess: [
      "Preliminary Examination (objective) — common with Group II for the preliminary stage",
      "Main Examination — conducted separately for Group IIA (non-interview scheme)",
      "Certificate verification",
    ],
    examPattern: PATTERN(
      "Objective type (Preliminary) and written examination (Mains)",
      "As specified in the official notification",
      REFER,
      REFER,
      ["General Studies", "Aptitude & Mental Ability", "Tamil / General English (as applicable)", "Post-specific papers applicable to non-interview posts"]
    ),
    syllabus: [
      "General Studies, Tamil/General English and Aptitude papers per the official syllabus",
      "Post-specific papers applicable to non-interview posts",
      "Full syllabus per the official notification of the current cycle",
    ],
  },
  {
    slug: "group-3",
    examName: "TNPSC Group III",
    shortName: "Group III",
    category: "Combined Civil Services Examination – III (Non-Interview Posts)",
    description:
      "TNPSC-conducted recruitment for non-interview village, clerical and ministerial posts in Tamil Nadu state services.",
    qualification: "Role-specific — most Group III posts require 10+2 (HSC) or a degree depending on the post; every post sets its own educational bar in the official notification.",
    posts: [
      "Junior Assistant (non-secretariat / taluk offices)",
      "Field Surveyor / Draftsman",
      "Typist / Steno-Typist",
      "Bill Collector / related village & ministerial posts",
    ],
    selectionProcess: [
      "Preliminary Examination (objective) where applicable",
      "Single written examination (objective type) for the non-interview scheme",
      "Certificate verification",
    ],
    examPattern: PATTERN(
      "Objective type — Computer Based Test (CBT)",
      "As specified in the official notification",
      REFER,
      REFER,
      ["General Studies", "Aptitude & Mental Ability", "Tamil / General English (as applicable)"]
    ),
    syllabus: [
      "General Studies — India and Tamil Nadu at the notified level",
      "Aptitude & Mental Ability",
      "Language papers as per the official syllabus",
    ],
  },
  {
    slug: "group-4",
    examName: "TNPSC Group IV",
    shortName: "Group IV",
    category: "Combined Civil Services Examination – IV",
    description:
      "Entry-level recruitment for village, clerical and ministerial posts across Tamil Nadu state departments.",
    qualification: "Class 10 (SSLC), 10+2 or a degree depending on the post — every post sets its own educational bar in the official notification.",
    posts: [
      "Village Administrative Officer (VAO)",
      "Junior Assistant (Security / Non-Security)",
      "Bill Collector",
      "Field Surveyor / Draftsman",
      "Typist / Steno-Typist (Grade 3)",
      "Office Assistant / related ministerial posts",
    ],
    selectionProcess: [
      "Single written examination (objective type) — Combined Civil Services Examination IV",
      "Certificate verification",
    ],
    examPattern: PATTERN(
      "Objective type — Computer Based Test (CBT)",
      "As specified in the official notification",
      "As per the official notification of the current cycle",
      "As per the official notification of the current cycle",
      ["General Studies", "Aptitude & Mental Ability", "Tamil / General English (as applicable)"]
    ),
    syllabus: [
      "General Studies — India and Tamil Nadu at secondary level",
      "Aptitude & Mental Ability",
      "General English / Tamil comprehension and language paper as per official syllabus",
    ],
  },
  {
    slug: "combined-engineering-services",
    examName: "TNPSC Combined Engineering Services",
    shortName: "CES",
    category: "Combined Engineering Services",
    description:
      "Recruitment of Assistant Engineers and allied engineering posts for Tamil Nadu state departments through TNPSC.",
    qualification: "B.E / B.Tech in the notified engineering discipline (Civil, Mechanical, Electrical, ECE and allied branches) as per the official notification.",
    posts: [
      "Assistant Engineer (various state departments)",
      "Assistant Electrical Inspector",
      "Assistant Engineer (Highways / PWD / TNEB etc. as notified)",
    ],
    selectionProcess: [
      "Written examination (objective and/or subject-specific papers for the notified post)",
      "Certificate verification",
      "Interview / oral stage for specified posts, as per notification",
    ],
    examPattern: PATTERN(
      "Objective and/or descriptive written examination depending on the exam",
      "As specified in the official notification",
      REFER,
      REFER,
      ["Domain / technical subjects of the notified post", "General Studies and Tamil/General English where applicable"]
    ),
    syllabus: [
      "Core engineering subjects of the notified branch",
      "General Studies where applicable",
      "Full syllabus per the official notification of the current cycle",
    ],
  },
  {
    slug: "assistant-system-engineer",
    examName: "TNPSC Assistant System Engineer",
    shortName: "ASE",
    category: "Assistant System Engineer",
    description:
      "TNPSC-conducted recruitment of Assistant System Engineers for e-governance and IT posts in the Tamil Nadu state administration.",
    qualification: "B.E / B.Tech in Computer Science, Information Technology, ECE or an MCA as notified by TNPSC for the post.",
    posts: [
      "Assistant System Engineer (state e-governance / IT departments)",
      "Related computer / IT posts as notified",
    ],
    selectionProcess: [
      "Written examination (technical subjects)",
      "Certificate verification",
    ],
    examPattern: PATTERN(
      "Objective type — Computer Based Test (CBT)",
      "As specified in the official notification",
      REFER,
      REFER,
      ["Computer Science / IT technical subjects", "General Studies and Tamil/General English where applicable"]
    ),
    syllabus: [
      "IT / Computer Science fundamentals per the official syllabus",
      "General Studies where applicable",
      "Full syllabus per the official notification of the current cycle",
    ],
  },
  {
    slug: "district-educational-officer",
    examName: "TNPSC District Educational Officer",
    shortName: "DEO",
    category: "District Educational Officer",
    description:
      "Recruitment of District Educational Officers and allied educational-administration posts in Tamil Nadu as conducted through TNPSC.",
    qualification: "Post-specific — a bachelor\u2019s degree (usually with a degree/diploma in Education, B.Ed) as required by the notification; verify the exact qualification for the current cycle.",
    posts: ["District Educational Officer", "Allied educational administration posts as notified"],
    selectionProcess: [
      "Written examination (subject + educational administration papers)",
      "Certificate verification",
      "Interview for specified posts, as per notification",
    ],
    examPattern: PATTERN(
      "Objective and/or descriptive written examination depending on the exam",
      "As specified in the official notification",
      REFER,
      REFER,
      ["Education / administration subjects", "General Studies and Tamil/General English where applicable"]
    ),
    syllabus: [
      "Educational administration and teacher-related norms",
      "General Studies where applicable",
      "Full syllabus per the official notification of the current cycle",
    ],
  },
  {
    slug: "other",
    examName: "Other TNPSC Examinations",
    shortName: "Other",
    category: "Combined & departmental TNPSC examinations",
    description:
      "Additional TNPSC-conducted examinations for specialised and departmental recruitments. Combined Library & Information Services, Combined Geology Service and Combined Statistics examinations can be added from the admin panel as separate records.",
    qualification: "Post-specific — professional posts require their corresponding degree/diploma as per the official notification.",
    posts: [
      "Combined & departmental examinations notified by TNPSC",
      "Statistical, library and other specialised posts as notified",
    ],
    selectionProcess: [
      "Written examination (objective and/or subject-specific papers)",
      "Certificate verification",
      "Interview / oral stage for specified posts, as per notification",
    ],
    examPattern: PATTERN(
      "Objective and/or descriptive written examination depending on the exam",
      "As specified in the official notification",
      REFER,
      REFER,
      ["Domain / technical subjects of the notified post", "General Studies and Tamil/General English where applicable"]
    ),
    syllabus: [
      "Domain and technical subjects per the official syllabus of each examination",
      "General Studies where applicable",
      "Full syllabus per the official notification of the current cycle",
    ],
  },
];

/* ── Other Tamil Nadu State Exams ───────────────────────────────────────────
   Records below are created from the Oliveboard reference guide. They carry
   STRUCTURAL info (which posts each organisation recruits for) plus clearly
   marked REFERENCE values. Current ages/salaries must be verified on the
   official websites — nothing volatile is fabricated.
   ─────────────────────────────────────────────────────────────────────────── */

// Smallest patch — one "exam record" per notified post (same pattern used by
// TNUSRB/TNEB/TNFUSRC entries and by the required Admin structure).
const postExam = (slug, examName, posts, extra = {}) => ({
  slug,
  examName,
  shortName: extra.shortName || "",
  category: extra.category || "State Recruitment",
  description:
    extra.description ||
    `Recruitment post notified by ${extra.org || "the organisation"}.`,
  qualification: "",
  posts,
  salary: extra.salary || "",
  additionalEligibility: extra.ageRef || "",
  selectionProcess: [],
  examPattern: PATTERN("", "", "", "", []),
  syllabus: [],
});

const TNPCB_EXAMS = [
  postExam("tnpcb-chief-environmental-engineer", "TNPCB Chief Environmental Engineer", ["Chief Environmental Engineer"], {
    shortName: "Chief Environmental Engineer",
    category: "TNPCB — Technical & Environmental Posts",
    org: "Tamil Nadu Pollution Control Board (TNPCB)",
    description:
      "TNPCB's top engineering post — part of the board's three-tier technical hierarchy; notified by the Tamil Nadu Pollution Control Board.",
    salary: "Reference range: Rs.19,500 – Rs.1,19,500 (varies by post — verify in the latest official notification).",
    ageRef:
      "Reference (guide): min age 18; max age 30 (35 for SC/ST, MBC/DC, BC/BCM candidates) — verify in the latest official notification.",
  }),
  postExam("tnpcb-additional-chief-environmental-engineer", "TNPCB Additional Chief Environmental Engineer", ["Additional Chief Environmental Engineer"], {
    shortName: "Additional Chief Environmental Engineer",
    category: "TNPCB — Technical & Environmental Posts",
    org: "Tamil Nadu Pollution Control Board (TNPCB)",
    description:
      "Senior technical post in the TNPCB hierarchy; notified by the Tamil Nadu Pollution Control Board.",
    salary: "Reference range: Rs.19,500 – Rs.1,19,500 (varies by post — verify in the latest official notification).",
    ageRef:
      "Reference (guide): min age 18; max age 30 (35 for SC/ST, MBC/DC, BC/BCM candidates) — verify in the latest official notification.",
  }),
  postExam("tnpcb-joint-chief-environmental-engineer", "TNPCB Joint Chief Environmental Engineer", ["Joint Chief Environmental Engineer"], {
    shortName: "Joint Chief Environmental Engineer",
    category: "TNPCB — Technical & Environmental Posts",
    org: "Tamil Nadu Pollution Control Board (TNPCB)",
    description:
      "Mid-senior technical post in the TNPCB hierarchy; notified by the Tamil Nadu Pollution Control Board.",
    salary: "Reference range: Rs.19,500 – Rs.1,19,500 (varies by post — verify in the latest official notification).",
    ageRef:
      "Reference (guide): min age 18; max age 30 (35 for SC/ST, MBC/DC, BC/BCM candidates) — verify in the latest official notification.",
  }),
  postExam("tnpcb-district-assistant-environmental-engineer", "TNPCB District & Assistant Environmental Engineer", ["District & Assistant Environmental Engineer"], {
    shortName: "District & Assistant Environmental Engineer",
    category: "TNPCB — Technical & Environmental Posts",
    org: "Tamil Nadu Pollution Control Board (TNPCB)",
    description:
      "Entry / district-level engineering post in the TNPCB hierarchy; notified by the Tamil Nadu Pollution Control Board.",
    salary: "Reference range: Rs.19,500 – Rs.1,19,500 (varies by post — verify in the latest official notification).",
    ageRef:
      "Reference (guide): min age 18; max age 30 (35 for SC/ST, MBC/DC, BC/BCM candidates) — verify in the latest official notification.",
  }),
  postExam("tnpcb-financial-advisor", "TNPCB Financial Advisor", ["Financial Advisor"], {
    shortName: "Financial Advisor",
    category: "TNPCB — Finance & Administration",
    org: "Tamil Nadu Pollution Control Board (TNPCB)",
    description:
      "Finance and accounts post notified by the Tamil Nadu Pollution Control Board.",
    salary: "Reference range: Rs.19,500 – Rs.1,19,500 (varies by post — verify in the latest official notification).",
    ageRef:
      "Reference (guide): min age 18; max age 30 (35 for SC/ST, MBC/DC, BC/BCM candidates) — verify in the latest official notification.",
  }),
  postExam("tnpcb-chief-scientific-officer", "TNPCB Chief Scientific Officer", ["Chief Scientific Officer"], {
    shortName: "Chief Scientific Officer",
    category: "TNPCB — Science & Laboratory",
    org: "Tamil Nadu Pollution Control Board (TNPCB)",
    description:
      "Scientific post notified by the Tamil Nadu Pollution Control Board.",
    salary: "Reference range: Rs.19,500 – Rs.1,19,500 (varies by post — verify in the latest official notification).",
    ageRef:
      "Reference (guide): min age 18; max age 30 (35 for SC/ST, MBC/DC, BC/BCM candidates) — verify in the latest official notification.",
  }),
  postExam("tnpcb-environmental-scientist", "TNPCB Environmental Scientist", ["Environmental Scientist"], {
    shortName: "Environmental Scientist",
    category: "TNPCB — Science & Laboratory",
    org: "Tamil Nadu Pollution Control Board (TNPCB)",
    description:
      "Environmental science post notified by the Tamil Nadu Pollution Control Board.",
    salary: "Reference range: Rs.19,500 – Rs.1,19,500 (varies by post — verify in the latest official notification).",
    ageRef:
      "Reference (guide): min age 18; max age 30 (35 for SC/ST, MBC/DC, BC/BCM candidates) — verify in the latest official notification.",
  }),
  postExam("tnpcb-advanced-environmental-laboratory", "TNPCB Advanced Environmental Laboratory", ["Advanced Environmental Laboratory"], {
    shortName: "Advanced Environmental Laboratory",
    category: "TNPCB — Science & Laboratory",
    org: "Tamil Nadu Pollution Control Board (TNPCB)",
    description:
      "Advanced environmental laboratory post notified by the Tamil Nadu Pollution Control Board.",
    salary: "Reference range: Rs.19,500 – Rs.1,19,500 (varies by post — verify in the latest official notification).",
    ageRef:
      "Reference (guide): min age 18; max age 30 (35 for SC/ST, MBC/DC, BC/BCM candidates) — verify in the latest official notification.",
  }),
  postExam("tnpcb-district-environmental-laboratory", "TNPCB District Environmental Laboratory", ["District Environmental Laboratory"], {
    shortName: "District Environmental Laboratory",
    category: "TNPCB — Science & Laboratory",
    org: "Tamil Nadu Pollution Control Board (TNPCB)",
    description:
      "District environmental laboratory post notified by the Tamil Nadu Pollution Control Board.",
    salary: "Reference range: Rs.19,500 – Rs.1,19,500 (varies by post — verify in the latest official notification).",
    ageRef:
      "Reference (guide): min age 18; max age 30 (35 for SC/ST, MBC/DC, BC/BCM candidates) — verify in the latest official notification.",
  }),
  postExam("tnpcb-manager-internal-audit", "TNPCB Manager (Internal Audit)", ["Manager (Internal Audit)"], {
    shortName: "Manager (Internal Audit)",
    category: "TNPCB — Finance & Administration",
    org: "Tamil Nadu Pollution Control Board (TNPCB)",
    description:
      "Internal audit management post notified by the Tamil Nadu Pollution Control Board.",
    salary: "Reference range: Rs.19,500 – Rs.1,19,500 (varies by post — verify in the latest official notification).",
    ageRef:
      "Reference (guide): min age 18; max age 30 (35 for SC/ST, MBC/DC, BC/BCM candidates) — verify in the latest official notification.",
  }),
];

const TNUSRB_EXAMS = [
  postExam("tnusrb-police-constable", "TNUSRB Police Constable (GR.II)", ["Grade-II Constable (Armed Reserve)", "Grade-II Constable (Special Force)"], {
    shortName: "Police Constable",
    category: "Police & Uniformed Services Recruitment",
    org: "Tamil Nadu Uniformed Services Recruitment Board (TNUSRB)",
    description:
      "Grade-II Police Constable recruitment (Armed Reserve & Special Force) conducted by the Tamil Nadu Police Recruitment Board (TNUSRB).",
    salary: "Reference range: Rs.18,200 – Rs.52,900 (varies by post — verify in the latest official notification).",
    ageRef:
      "Reference (guide): general 18–24; SC/ST up to 29; MBC/DC/BC up to 26; ex-servicemen up to 45 — verify in the latest official notification.",
  }),
  postExam("tnusrb-jail-warder", "TNUSRB Jail Warder (GR.II)", ["GR.II Jail Warder"], {
    shortName: "Jail Warder",
    category: "Police & Uniformed Services Recruitment",
    org: "Tamil Nadu Uniformed Services Recruitment Board (TNUSRB)",
    description:
      "GR.II Jail Warder recruitment conducted by the Tamil Nadu Uniformed Services Recruitment Board (TNUSRB).",
    salary: "Reference range: Rs.18,200 – Rs.52,900 (verify in the latest official notification).",
    ageRef:
      "Reference (guide): general 18–24; SC/ST up to 29; MBC/DC/BC up to 26; ex-servicemen up to 45 — verify in the latest official notification.",
  }),
  postExam("tnusrb-fireman", "TNUSRB Fireman", ["Fireman"], {
    shortName: "Fireman",
    category: "Police & Uniformed Services Recruitment",
    org: "Tamil Nadu Uniformed Services Recruitment Board (TNUSRB)",
    description:
      "Fireman recruitment conducted by the Tamil Nadu Uniformed Services Recruitment Board (TNUSRB).",
    salary: "Reference range: Rs.18,200 – Rs.52,900 (verify in the latest official notification).",
    ageRef:
      "Reference (guide): general 18–24; SC/ST up to 29; MBC/DC/BC up to 26; ex-servicemen up to 45 — verify in the latest official notification.",
  }),
  postExam("tnusrb-sub-inspector", "TNUSRB Sub-Inspector", ["Sub-Inspector"], {
    shortName: "Sub-Inspector",
    category: "Police & Uniformed Services Recruitment",
    org: "Tamil Nadu Uniformed Services Recruitment Board (TNUSRB)",
    description:
      "Sub-Inspector recruitment conducted by the Tamil Nadu Uniformed Services Recruitment Board (TNUSRB).",
    salary: "Reference range: Rs.36,900 – Rs.1,16,600 (verify in the latest official notification).",
    ageRef:
      "Reference (guide): general 20–28; BC up to 30; SC/ST up to 33; ex-servicemen / departmental up to 45 — verify in the latest official notification.",
  }),
];

const TNTRB_EXAMS = [
  postExam("tn-trb-tntet", "TNTET — Tamil Nadu Teachers Eligibility Test", ["Trained Graduate Teacher (TGT)", "Post Graduate Teacher (PGT)", "JBT Teacher"], {
    shortName: "TNTET",
    category: "Teaching Recruitment",
    org: "Tamil Nadu Teachers Recruitment Board (TN TRB)",
    description:
      "Tamil Nadu Teachers Eligibility Test conducted by TN TRB for graduate / post-graduate teacher posts in government schools.",
    salary: "Reference range: basic pay Rs.29,900 – Rs.1,04,400 with grade pay (varies by post — verify in the latest official notification).",
    ageRef: "Reference (guide): 18–40 years — verify age norms in the latest official notification.",
  }),
  postExam("tn-trb-tnset", "TNSET — Tamil Nadu State Eligibility Test", ["Assistant Professor"], {
    shortName: "TNSET",
    category: "Teaching Recruitment",
    org: "Tamil Nadu Teachers Recruitment Board (TN TRB)",
    description:
      "Tamil Nadu State Eligibility Test conducted by TN TRB for Assistant Professor (college teaching) posts.",
    salary: "Reference: approx. Rs.70,000 per month (verify pay in the latest official notification).",
    ageRef: "Reference (guide): no age limit is applicable for TNSET — verify in the latest official notification.",
  }),
];

const TNEB_EXAMS = [
  postExam("tneb-field-assistant", "TNEB Field Assistant", ["Field Assistant"], {
    shortName: "Field Assistant",
    category: "TNEB Group Recruitment",
    org: "Tamil Nadu Electricity Board (TNEB / TANTRANSCO / TANGEDCO)",
    description:
      "Field Assistant post notified under the TNEB group (TNEB / TANTRANSCO / TANGEDCO).",
    salary: "Reference range: Rs.18,800 – Rs.1,26,500 (varies by post — verify in the latest official notification).",
    ageRef: "Reference (guide): min age 18; max age 30 (except Gangman) — verify in the latest official notification.",
  }),
  postExam("tneb-gangman", "TNEB Gangman", ["Gangman"], {
    shortName: "Gangman",
    category: "TNEB Group Recruitment",
    org: "Tamil Nadu Electricity Board (TNEB / TANTRANSCO / TANGEDCO)",
    description:
      "Gangman post notified under the TNEB group (TNEB / TANTRANSCO / TANGEDCO).",
    salary: "Reference range: Rs.18,800 – Rs.1,26,500 (varies by post — verify in the latest official notification).",
    ageRef: "Reference (guide): min age 18 — verify the age limit and relaxations in the latest official notification.",
  }),
  postExam("tneb-junior-assistant-accounts", "TNEB Junior Assistant / Accounts", ["Junior Assistant / Accounts"], {
    shortName: "Junior Assistant / Accounts",
    category: "TNEB Group Recruitment",
    org: "Tamil Nadu Electricity Board (TNEB / TANTRANSCO / TANGEDCO)",
    description:
      "Junior Assistant / Accounts post notified under the TNEB group (TNEB / TANTRANSCO / TANGEDCO).",
    salary: "Reference range: Rs.18,800 – Rs.1,26,500 (varies by post — verify in the latest official notification).",
    ageRef: "Reference (guide): min age 18; max age 30 — verify in the latest official notification.",
  }),
  postExam("tneb-assistant-engineer", "TNEB Assistant Engineer", ["Assistant Engineer"], {
    shortName: "Assistant Engineer",
    category: "TNEB Group Recruitment",
    org: "Tamil Nadu Electricity Board (TNEB / TANTRANSCO / TANGEDCO)",
    description:
      "Assistant Engineer post notified under the TNEB group (TNEB / TANTRANSCO / TANGEDCO).",
    salary: "Reference range: Rs.18,800 – Rs.1,26,500 (varies by post — verify in the latest official notification).",
    ageRef: "Reference (guide): min age 18; max age 30 — verify in the latest official notification.",
  }),
  postExam("tneb-assessor", "TNEB Assessor", ["Assessor"], {
    shortName: "Assessor",
    category: "TNEB Group Recruitment",
    org: "Tamil Nadu Electricity Board (TNEB / TANTRANSCO / TANGEDCO)",
    description:
      "Assessor post notified under the TNEB group (TNEB / TANTRANSCO / TANGEDCO).",
    salary: "Reference range: Rs.18,800 – Rs.1,26,500 (varies by post — verify in the latest official notification).",
    ageRef: "Reference (guide): min age 18; max age 30 — verify in the latest official notification.",
  }),
  postExam("tneb-technical-assistant", "TNEB Technical Assistant", ["Technical Assistant"], {
    shortName: "Technical Assistant",
    category: "TNEB Group Recruitment",
    org: "Tamil Nadu Electricity Board (TNEB / TANTRANSCO / TANGEDCO)",
    description:
      "Technical Assistant post notified under the TNEB group (TNEB / TANTRANSCO / TANGEDCO).",
    salary: "Reference range: Rs.18,800 – Rs.1,26,500 (varies by post — verify in the latest official notification).",
    ageRef: "Reference (guide): min age 18; max age 30 — verify in the latest official notification.",
  }),
];

const TNFUSRC_EXAMS = [
  postExam("tnfusrc-forest-guard", "TNFUSRC Forest Guard", ["Forest Guard"], {
    shortName: "Forest Guard",
    category: "Forest Uniformed Services Recruitment",
    org: "Tamil Nadu Forest Uniformed Services Recruitment Committee (TNFUSRC)",
    description:
      "Forest Guard recruitment conducted by the Tamil Nadu Forest Uniformed Services Recruitment Committee (TNFUSRC).",
    salary: "Reference range: Rs.5,200 – Rs.57,900 (basic + grade pay + HRA varies by post — verify in the latest official notification).",
    ageRef: "Reference (guide): min age 18; max age 30 — verify in the latest official notification.",
  }),
  postExam("tnfusrc-forest-guard-driving-license", "TNFUSRC Forest Guard with Driving License", ["Forest Guard with Driving License"], {
    shortName: "Forest Guard with Driving License",
    category: "Forest Uniformed Services Recruitment",
    org: "Tamil Nadu Forest Uniformed Services Recruitment Committee (TNFUSRC)",
    description:
      "Forest Guard (with Driving License) recruitment conducted by TNFUSRC.",
    salary: "Reference range: Rs.5,200 – Rs.57,900 (basic + grade pay + HRA varies by post — verify in the latest official notification).",
    ageRef: "Reference (guide): min age 18; max age 30 — verify in the latest official notification.",
  }),
  postExam("tnfusrc-forest-watcher", "TNFUSRC Forest Watcher", ["Forest Watcher"], {
    shortName: "Forest Watcher",
    category: "Forest Uniformed Services Recruitment",
    org: "Tamil Nadu Forest Uniformed Services Recruitment Committee (TNFUSRC)",
    description:
      "Forest Watcher recruitment conducted by TNFUSRC.",
    salary: "Reference range: Rs.5,200 – Rs.57,900 (basic + grade pay + HRA varies by post — verify in the latest official notification).",
    ageRef: "Reference (guide): min age 18; max age 30 — verify in the latest official notification.",
  }),
  postExam("tnfusrc-forester", "TNFUSRC Forester", ["Forester"], {
    shortName: "Forester",
    category: "Forest Uniformed Services Recruitment",
    org: "Tamil Nadu Forest Uniformed Services Recruitment Committee (TNFUSRC)",
    description:
      "Forester recruitment conducted by TNFUSRC.",
    salary: "Reference range: Rs.5,200 – Rs.57,900 (basic + grade pay + HRA varies by post — verify in the latest official notification).",
    ageRef: "Reference (guide): min age 18; max age 30 — verify in the latest official notification.",
  }),
  postExam("tnfusrc-junior-research-fellow", "TNFUSRC Junior Research Fellow (JRF)", ["Junior Research Fellow (JRF)"], {
    shortName: "Junior Research Fellow",
    category: "Forest Uniformed Services Recruitment",
    org: "Tamil Nadu Forest Uniformed Services Recruitment Committee (TNFUSRC)",
    description:
      "Junior Research Fellow (JRF) recruitment conducted by TNFUSRC.",
    salary: "Reference range: Rs.5,200 – Rs.57,900 (varies by post — verify in the latest official notification).",
    ageRef: "Reference (guide): min age 18; max age 28 — verify in the latest official notification.",
  }),
];

// Organizations listed by the source without post-level detail (Tamil Nadu
// State Transport Corporation, Tamil Nadu Agriculture University, Banking &
// Railway Recruitment Board and other TN boards). They are seeded as ORG ONLY —
// no examinations are invented for them; admins add exams as notifications come.
const STATE_TN_ORG_EXAM_MAP = {
  tnpsc: TNPSC_EXAMS,
  tnpcb: TNPCB_EXAMS,
  tnusrb: TNUSRB_EXAMS,
  "tn-trb": TNTRB_EXAMS,
  tneb: TNEB_EXAMS,
  tnfusrc: TNFUSRC_EXAMS,
  tnstc: [],
  tnau: [],
  "tn-brrb": [],
  "tn-other": [],
};

/* ── Central Exams ────────────────────────────────────────────────────────── */

const CENTRAL_EXAMS = [
  // UPSC
  {
    slug: "upsc-civil-services",
    examName: "UPSC Civil Services Examination (CSE)",
    shortName: "CSE",
    category: "Civil Services",
    description:
      "The flagship national service examination for Group A & B services such as IAS, IPS, IFS, and IRS.",
    qualification: "Indian citizens. Qualification is role-specific: a recognised bachelor\u2019s degree in any discipline; final-year students may apply provisionally if the degree is completed before the examination.",
    posts: [
      "Indian Administrative Service (IAS)",
      "Indian Police Service (IPS)",
      "Indian Foreign Service (IFS)",
      "Indian Revenue Service (IRS) & other Group A/B services",
    ],
    selectionProcess: [
      "Preliminary Examination (Prelims — objective, two papers)",
      "Main Examination (Mains — nine descriptive papers)",
      "Personality Test / Interview",
    ],
    examPattern: PATTERN(
      "Objective (Prelims) + descriptive (Mains)",
      "As per the official notification",
      REFER,
      REFER,
      ["General Studies (Prelims & Mains)", "Optional subject at Mains", "Essay and language papers"]
    ),
    syllabus: [
      "NCERTs for foundational grasp (6–12, humanities + optional subjects)",
      "Current affairs practice (daily newspaper + monthly compilations)",
      "Answer-writing practice for Mains",
      "Previous years\u2019 question papers & mock tests",
      "Dedicated optional subject strategy",
    ],
  },
  {
    slug: "upsc-engineering-services",
    examName: "UPSC Engineering Services Examination (ESE)",
    shortName: "ESE",
    category: "Engineering Services",
    description:
      "Recruitment of engineers in civil/mechanical/electrical/electronics & telecommunication disciplines for central engineering services.",
    qualification: "B.E / B.Tech (or equivalent) in the notified engineering discipline from a recognised institution.",
    posts: [
      "Engineers in irrigation, railways, defence, CPWD and similar central engineering services",
      "Indian Railway Service of Engineers and allied services",
    ],
    selectionProcess: [
      "Preliminary Examination — General Studies & Engineering Aptitude",
      "Main Examination — conventional papers of the notified engineering discipline",
      "Personality Test / Interview",
    ],
    examPattern: PATTERN(
      "Objective (Prelims) + conventional (Mains)",
      "As per the official notification",
      REFER,
      REFER,
      ["General Studies & Engineering Aptitude", "Civil / Mechanical / Electrical / Electrical & Telecom engineering"]
    ),
    syllabus: [
      "Standard syllabus for the notified engineering discipline",
      "General Studies portion as published by UPSC",
      "Previous years\u2019 ESE papers",
    ],
  },
  {
    slug: "upsc-combined-medical-services",
    examName: "UPSC Combined Medical Services Examination (CMS)",
    shortName: "CMS",
    category: "Combined Medical Services",
    description:
      "Recruitment of medical officers for the Armed Forces Medical Services, railways, CGHS and statutory organisations.",
    qualification: "MBBS degree (including candidates in the final year of MBBS as per UPSC rules) with the required registration.",
    posts: [
      "Medical Officer in CGHS",
      "Railway Medical Officer",
      "Medical Officer in the Armed Forces (AFCMS-OS)",
      "Medical Officers in CG organizations",
    ],
    selectionProcess: [
      "Written examination (objective multiple-choice papers)",
      "Interview / personality test (for specified services)",
    ],
    examPattern: PATTERN(
      "Objective type",
      "As per the official notification",
      REFER,
      REFER,
      ["Paper I & Paper II — medical subjects (medicine, surgery, obstetrics & gynaecology, preventive & social medicine)"]
    ),
    syllabus: [
      "MBBS-level medical subjects as published in the UPSC CMS syllabus",
      "Previous years\u2019 CMS papers",
    ],
  },
  {
    slug: "upsc-other",
    examName: "Other UPSC Examinations",
    shortName: "Other UPSC",
    category: "UPSC",
    description:
      "Other UPSC-conducted recruitment examinations (e.g. CAPF), plus specialised services not listed above.",
    qualification: "Role-specific per examination as published in the official UPSC notification.",
    posts: ["Central Armed Police Forces (CAPF) and other notified services"],
    selectionProcess: ["Written examination", "Interview / physical tests as applicable"],
    examPattern: PATTERN("Objective and/or descriptive per exam", "As per the official notification", REFER, REFER, ["General Studies", "Specialised papers as notified"]),
    syllabus: ["Syllabus per the official notification", "Previous years\u2019 UPSC papers"],
  },
  // SSC
  {
    slug: "ssc-cgl",
    examName: "SSC Combined Graduate Level (CGL)",
    shortName: "CGL",
    category: "Combined Graduate Level",
    description:
      "SSC CGL recruits graduate-level staff for central government departments (Group B gazetted/ non-gazetted and Group C non-technical posts).",
    qualification: "Bachelor\u2019s degree from a recognised university; individual posts inside the exam may add subject-specific requirements.",
    posts: [
      "Assistant Section Officer",
      "Inspector & Auditor posts in central departments",
      "Lower Division Clerk & Junior Accountant level posts (as per scheme)",
    ],
    selectionProcess: [
      "Tier 1 — Computer Based Examination",
      "Tier 2 — subject / quantitative & descriptive papers (post-dependent)",
      "Skill / typing test & document verification (post-dependent)",
    ],
    examPattern: PATTERN(
      "Computer Based Examination (objective) + descriptive paper",
      "As per the official notification",
      REFER,
      REFER,
      ["Quantitative Aptitude", "English Language", "General Intelligence & Reasoning", "General Awareness"]
    ),
    syllabus: [
      "Quantitative aptitude & reasoning practice",
      "English language & comprehension",
      "General awareness / current affairs",
      "Previous years\u2019 CGL papers",
    ],
  },
  {
    slug: "ssc-chsl",
    examName: "SSC CHSL (10+2)",
    shortName: "CHSL",
    category: "Combined Higher Secondary Level",
    description:
      "SSC CHSL recruits 10+2-level staff such as Lower Division Clerks and Postal Assistants in central departments.",
    qualification: "10+2 (Senior Secondary) pass from a recognised board; data entry operator posts may add typing skill requirements.",
    posts: ["Lower Division Clerk (LDC)", "Junior Secretariat Assistant", "Postal Assistant / Sorting Assistant (as notified)"],
    selectionProcess: [
      "Tier 1 — Computer Based Examination",
      "Tier 2 — descriptive / skill test (typing)",
      "Document verification",
    ],
    examPattern: PATTERN(
      "Computer Based Examination (objective)",
      "As per the official notification",
      REFER,
      REFER,
      ["English Language", "Quantitative Aptitude", "General Intelligence", "General Awareness"]
    ),
    syllabus: [
      "Quantitative aptitude, reasoning, English & general awareness",
      "Typing practice for skill-test posts",
    ],
  },
  {
    slug: "ssc-cpo",
    examName: "SSC CPO (Central Police Organisations)",
    shortName: "CPO",
    category: "Central Police Organisations",
    description:
      "SSC CPO recruits Sub-Inspectors into Delhi Police, CAPFs and other central police organisations.",
    qualification: "Bachelor\u2019s degree from a recognised university; physical standards apply.",
    posts: ["Sub-Inspector in Delhi Police / CAPFs", "SI (Executive) in CISF, CRPF, BSF, SSB, ITBP"],
    selectionProcess: [
      "Paper I — Computer Based Examination",
      "Physical Standard Test (PST) / Physical Endurance Test (PET)",
      "Paper II (objective) — qualifying",
      "Medical examination & document verification",
    ],
    examPattern: PATTERN("Computer Based Examination (objective)", "As per the official notification", REFER, REFER, ["General Intelligence & Reasoning", "General Knowledge & Awareness", "Quantitative Aptitude", "English"]),
    syllabus: [
      "Reasoning, quantitative aptitude, English & general awareness",
      "Physical fitness preparation",
    ],
  },
  {
    slug: "ssc-other",
    examName: "Other SSC Examinations",
    shortName: "Other SSC",
    category: "SSC",
    description:
      "Other SSC-conducted examinations (e.g. MTS, Steno, departmental exams) not listed above.",
    qualification: "Role-specific per exam (Class 10 / 10+2 / degree as notified).",
    posts: ["Multi-Tasking Staff and other notified posts"],
    selectionProcess: ["Computer Based Examination", "Skill tests as applicable", "Document verification"],
    examPattern: PATTERN("Computer Based Examination (objective)", "As per the official notification", REFER, REFER, ["Reasoning, English, Quantitative Aptitude, General Awareness"]),
    syllabus: ["Syllabus per the official notification", "Previous years\u2019 SSC papers"],
  },
  // Banking
  {
    slug: "ibps-po",
    examName: "IBPS Probationary Officer (CWE PO/MT)",
    shortName: "IBPS PO",
    category: "Banking",
    description:
      "IBPS CWE PO/MT recruits Probationary Officers for participating public sector banks.",
    qualification: "Bachelor\u2019s degree in any discipline from a recognised university (as per the current notification's eligibility window).",
    posts: ["Probationary Officer / Management Trainee in participating PSBs"],
    selectionProcess: [
      "Preliminary Examination (objective, online)",
      "Main Examination (online, post-specific papers)",
      "Interview / document verification",
    ],
    examPattern: PATTERN("Online objective (Prelims + Mains) + Interview", "As per the official notification", REFER, REFER, ["Reasoning & Computer Aptitude", "Data Analysis & Interpretation", "English/GA", "Professional Knowledge (Mains)"]),
    syllabus: [
      "Reasoning, quantitative aptitude & English",
      "Financial and general awareness",
      "Banking products & current affairs",
      "Interview preparation",
    ],
  },
  {
    slug: "ibps-clerk",
    examName: "IBPS Clerk",
    shortName: "IBPS Clerk",
    category: "Banking",
    description:
      "IBPS CWE Clerk recruits Clerical Cadre staff for participating public sector banks.",
    qualification: "Bachelor\u2019s degree in any discipline from a recognised university (eligibility window as per the notification).",
    posts: ["Clerical Cadre (customer-facing roles) in participating PSBs"],
    selectionProcess: ["Preliminary Examination (objective, online)", "Main Examination (online)"],
    examPattern: PATTERN("Online objective (Prelims + Mains)", "As per the official notification", REFER, REFER, ["English", "Numerical Ability", "Reasoning Ability", "General/Financial Awareness"]),
    syllabus: [
      "Numerical ability, reasoning & English",
      "General and financial awareness",
      "Previous IBPS papers",
    ],
  },
  {
    slug: "sbi-po",
    examName: "SBI Probationary Officer",
    shortName: "SBI PO",
    category: "Banking",
    description:
      "State Bank of India recruits Probationary Officers through its own CWE for its officer cadre.",
    qualification: "Bachelor\u2019s degree in any discipline from a recognised university (eligibility window as per the notification).",
    posts: ["Probationary Officer at State Bank of India"],
    selectionProcess: [
      "Preliminary Examination",
      "Main Examination (objective + descriptive)",
      "Phase III — Interview / Psychometric test",
    ],
    examPattern: PATTERN("Online objective + descriptive + Interview", "As per the official notification", REFER, REFER, ["Reasoning & Computer Aptitude", "Data Analysis & Interpretation", "English & English Language", "General Banking Awareness"]),
    syllabus: [
      "Data analysis, reasoning & English",
      "Banking & financial awareness",
      "Interview preparation",
    ],
  },
  {
    slug: "sbi-clerk",
    examName: "SBI Clerk",
    shortName: "SBI Clerk",
    category: "Banking",
    description:
      "State Bank of India recruits Junior Associates (Customer Support & Sales) through its CWE for clerical posts.",
    qualification: "Graduation in any discipline from a recognised university (eligibility window as per the notification).",
    posts: ["Junior Associate (Customer Support & Sales) at SBI"],
    selectionProcess: ["Preliminary Examination", "Main Examination (objective)"],
    examPattern: PATTERN("Online objective (Prelims + Mains)", "As per the official notification", REFER, REFER, ["English", "Numerical Ability", "Reasoning Ability", "Banking Awareness"]),
    syllabus: [
      "Numerical ability, reasoning & English",
      "Banking & financial awareness",
      "Previous SBI Clerk papers",
    ],
  },
  {
    slug: "banking-other",
    examName: "Other Banking Recruitments",
    shortName: "Other Banking",
    category: "Banking",
    description:
      "Other public-sector banking and financial-institution recruitments (RBI, NABARD, specialist officers) as notified.",
    qualification: "Role-specific per examination and post.",
    posts: ["RBI Grade B / Assistant and other notified financial-institution posts"],
    selectionProcess: ["Pre/Mains written examinations", "Interview (for officer posts)"],
    examPattern: PATTERN("Online objective (+ interview for officers)", "As per the official notification", REFER, REFER, ["English, Quantitative Aptitude, Reasoning, Economic & Financial awareness or specialist subjects"]),
    syllabus: ["Syllabus per the official notification", "Current affairs & financial awareness"],
  },
  // Railways
  {
    slug: "rrb-ntpc",
    examName: "RRB NTPC (Non-Technical Popular Categories)",
    shortName: "NTPC",
    category: "Railways",
    description:
      "RRB NTPC recruitment for graduate and undergraduate non-technical posts across Indian Railways zones.",
    qualification: "Graduate posts require a bachelor\u2019s degree; undergraduate posts require 10+2 as per the notification.",
    posts: [
      "Station Master / Goods Train Manager (graduate)",
      "Commercial Apprentice & Senior Clerk (graduate)",
      "Junior Clerk cum Typist (undergraduate)",
    ],
    selectionProcess: [
      "Computer Based Test — Stage 1",
      "Computer Based Test — Stage 2 (post-dependent subjects)",
      "Computer Based Aptitude Test / typing test (post-dependent)",
      "Document verification & medical examination",
    ],
    examPattern: PATTERN("Computer Based Examination (objective, two stages)", "As per the official notification", REFER, REFER, ["General Awareness", "Mathematics", "General Intelligence & Reasoning"]),
    syllabus: [
      "General awareness (railway & national current affairs)",
      "Mathematics & reasoning",
      "Previous years\u2019 RRB papers",
    ],
  },
  {
    slug: "rrb-group-d",
    examName: "RRB Level-1 (Group D)",
    shortName: "Group D",
    category: "Railways",
    description:
      "Railway Level-1 recruitment (track maintainers, assistants, helpers and similar posts) across zones.",
    qualification: "Class 10 pass or ITI (per trade requirements) as per the notification.",
    posts: ["Track Maintainer, Assistant Pointsman, Helper and similar Level-1 posts"],
    selectionProcess: [
      "Computer Based Test (CBT)",
      "Physical Efficiency Test (PET)",
      "Document verification & medical examination",
    ],
    examPattern: PATTERN("Computer Based Examination (objective)", "As per the official notification", REFER, REFER, ["General Science", "Mathematics", "General Intelligence & Reasoning", "General Awareness"]),
    syllabus: [
      "General science, mathematics & reasoning",
      "Railway current affairs",
      "Physical fitness for PET",
    ],
  },
  {
    slug: "railways-other",
    examName: "Other Railway Recruitments",
    shortName: "Other Railways",
    category: "Railways",
    description:
      "Additional railway recruitment categories (technical, apprentice, ALP/Technician and departmental) as notified.",
    qualification: "Role-specific per category (ITI / diploma / degree as notified).",
    posts: ["ALP/Technician and other notified railway posts"],
    selectionProcess: ["Computer Based Test", "Documents & medicals as applicable"],
    examPattern: PATTERN("Computer Based Examination (objective)", "As per the official notification", REFER, REFER, ["Domain/technical subjects plus aptitude sections as notified"]),
    syllabus: ["Syllabus per the official notification", "Technical fundamentals for the trade"],
  },
  // Other Central
  {
    slug: "other-central",
    examName: "Other Central Government Recruitments",
    shortName: "Other Central",
    category: "Central",
    description:
      "Sectoral recruitments announced by individual central organisations and PSUs (EPFO, ESIC, CBDT/Income Tax, CBI, NTA, PSUs such as IOCL, ONGC, NTPC).",
    qualification: "Role-specific to each board or PSU — most clerical/officer posts need graduation; technical posts need the relevant engineering/domain qualification as per the notification.",
    posts: [
      "Assistant / Inspector / Office Executive (EPFO, ESIC, CBI, Income Tax)",
      "Junior Engineer / Junior Assistant (PSUs)",
      "Scientist / Engineer / Technical posts (PSUs & R&D bodies)",
    ],
    selectionProcess: ["Computer Based / Written Examination", "Skill / trade test (if applicable)", "Document verification & medical (as applicable)"],
    examPattern: PATTERN("Computer Based / Written Examination", "As per the official notification", REFER, REFER, ["General aptitude + domain subjects specific to the post"]),
    syllabus: [
      "General aptitude + domain subjects specific to the post",
      "Current affairs for the organisation\u2019s sector",
      "Sector-specific technical fundamentals",
    ],
  },
];

/* ── Seeding helpers ───────────────────────────────────────────────────────── */

// Legacy records that shipped in an earlier catalogue and must NOT be kept
// alongside the new structure. Hard-deleted on seed so no old Tamil Nadu
// entries remain (previously the archived "Combined Library" residue).
const RETIRED_EXAM_SLUGS = ["tnpsc-combined-library-and-information-services-examination"];

async function upsertOrganization(org) {
  let doc = await RecruitmentOrganization.findOne({ slug: org.slug });
  if (doc) {
    Object.assign(doc, org);
    await doc.save();
  } else {
    doc = await RecruitmentOrganization.create(org);
  }
  return doc;
}

async function upsertExam(examData, org) {
  // The organization is the source of truth for governmentType/state.
  const payload = {
    ...examData,
    organization: org._id,
    governmentType: org.governmentType,
    state: org.state,
  };
  let doc = await GraduateExam.findOne({ slug: examData.slug });
  if (doc) {
    Object.assign(doc, payload);
    await doc.save();
    return { created: false };
  }
  await GraduateExam.create(payload);
  return { created: true };
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/uyarvu_payanam");
  console.log("✅ MongoDB connected — seeding graduate exams");

  const orgResults = {};
  for (const org of ORGANIZATIONS) {
    orgResults[org.slug] = await upsertOrganization(org);
    console.log(`  Organization ready: ${org.name}`);
  }

  let created = 0;
  let updated = 0;

  // Tamil Nadu State organizations → their exam lists.
  for (const [orgSlug, exams] of Object.entries(STATE_TN_ORG_EXAM_MAP)) {
    const org = orgResults[orgSlug];
    for (const exam of exams) {
      const res = await upsertExam(exam, org);
      if (res.created) created += 1;
      else updated += 1;
      console.log(`  ${res.created ? "＋ created" : "➜ updated"} ${orgSlug.toUpperCase()} exam: ${exam.examName}`);
    }
  }

  const centralOrgs = {
    upsc: orgResults.upsc,
    ssc: orgResults.ssc,
    banking: orgResults.banking,
    railways: orgResults.railways,
    "other-central": orgResults["other-central"],
  };
  for (const exam of CENTRAL_EXAMS) {
    const orgSlug = exam.slug.startsWith("upsc-")
      ? "upsc"
      : exam.slug.startsWith("ssc-")
        ? "ssc"
        : exam.slug.startsWith("ibps-") || exam.slug.startsWith("sbi-") || exam.slug.startsWith("banking-")
          ? "banking"
          : exam.slug.startsWith("rrb-") || exam.slug.startsWith("railways-")
            ? "railways"
            : "other-central";
    const res = await upsertExam(exam, centralOrgs[orgSlug]);
    if (res.created) created += 1;
    else updated += 1;
    console.log(`  ${res.created ? "＋ created" : "➜ updated"} ${orgSlug.toUpperCase()} exam: ${exam.examName}`);
  }

  // Remove retired legacy records so no outdated Tamil Nadu entries remain.
  if (RETIRED_EXAM_SLUGS.length) {
    const removed = await GraduateExam.deleteMany({ slug: { $in: RETIRED_EXAM_SLUGS } });
    if (removed.deletedCount) {
      console.log(`  🗑 removed ${removed.deletedCount} retired exam record(s): ${RETIRED_EXAM_SLUGS.join(", ")}`);
    } else {
      console.log("  (no retired exam records found to remove)");
    }
  }

  console.log(`\n✅ Done — ${created} created, ${updated} updated.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});