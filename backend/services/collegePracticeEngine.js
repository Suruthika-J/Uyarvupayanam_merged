/**
 * College Practice Engine (Server-Side)
 * 
 * Dynamically determines the appropriate domain practice mode, activity types,
 * adaptive question pools, and domain-grounded scenarios based on student telemetry:
 * Degree, Field, Domain, Specialization, Year, Semester, Skills, Skill Gaps, and Target Career.
 */

const axios = require("axios");

const GROK_API_KEY = process.env.GROK_API_KEY || "xai-JPHZZdSGepdkppoqz9vWnMBzmKwKdenngyfYaO08Wf3Mp0W0ddsapnTkQWD2hhdyTc28IrxnEMkUpbO0";

const norm = (str) => (str || '').toString().toLowerCase().trim();

/**
 * Returns practice engine configuration tailored to student profile
 */
function getStudentPracticeConfig(profile = {}) {
  const normText = `${profile.degreeProgramme || ''} ${profile.domain || ''} ${profile.field || ''} ${profile.specialization || ''}`.toLowerCase();
  const yearStr = norm(profile.currentYear || profile.academicYear);
  const yearLevel = yearStr.includes('1') || yearStr.includes('first') ? 1
                  : yearStr.includes('2') || yearStr.includes('second') ? 2
                  : yearStr.includes('3') || yearStr.includes('third') ? 3
                  : yearStr.includes('4') || yearStr.includes('fourth') || yearStr.includes('final') ? 4 : 2;

  // 1. Medicine & Clinical Specialties (BHMS, MBBS, BDS, B.Pharm, BAMS, Nursing)
  if (normText.includes('homeo') || normText.includes('bhms') || normText.includes('medicine') || normText.includes('mbbs') || normText.includes('bds') || normText.includes('bams') || normText.includes('clinical') || normText.includes('nursing')) {
    return {
      domainKey: "medicine",
      practiceModeId: "clinical-case-practice",
      practiceTitle: "Clinical Case Practice & Medical Reasoning Lab",
      navLabel: "Clinical Practice",
      practiceDescription: "Analyze educational clinical case scenarios, symptom presentations, differential diagnostics, and therapeutic reasoning.",
      badge: "Clinical Care",
      isMedical: true,
      isComputing: false,
      yearLevel,
      disclaimer: "Educational Scenario — For academic learning & clinical reasoning practice only. Not for real patient treatment or diagnosis.",
      activityTypes: ["Case-Based Reasoning", "Clinical Knowledge Practice", "Medical Terminology", "Patient Assessment Scenarios", "Diagnostic Interpretation", "Pharmacology & Therapeutics"],
      defaultSubject: "General Medicine",
      subjects: [
        "General Medicine",
        "Pharmacology & Therapeutics",
        "Pathology & Diagnostics",
        "Homoeopathic Materia Medica",
        "Organon of Medicine & Philosophy",
        "Surgical Specialties & Asepsis",
        "Obstetrics & Gynaecology",
        "Clinical Case Studies"
      ]
    };
  }

  // 2. Law / Jurisprudence (LL.B, LL.M, Advocacy, Legal)
  if (normText.includes('law') || normText.includes('legal') || normText.includes('ll.b') || normText.includes('llb') || normText.includes('moot') || normText.includes('advocacy')) {
    return {
      domainKey: "law",
      practiceModeId: "legal-reasoning-lab",
      practiceTitle: "Legal Reasoning & Case Analysis Lab",
      navLabel: "Legal Practice",
      practiceDescription: "Analyze landmark case precedents, statutory interpretations, legal issues, and moot court arguments.",
      badge: "Jurisprudence",
      isMedical: false,
      isComputing: false,
      yearLevel,
      activityTypes: ["Case Analysis", "Legal Reasoning", "Issue Identification", "Statute Interpretation", "Moot Court Scenarios", "Contract Analysis", "Constitutional Reasoning"],
      defaultSubject: "Constitutional Law",
      subjects: [
        "Constitutional Law",
        "Corporate & Commercial Law",
        "Criminal Law & Evidence",
        "Civil Procedure & Contracts",
        "Jurisprudence & Legal Theory",
        "Intellectual Property & Cyber Law",
        "Legal Drafting & Moot Court"
      ]
    };
  }

  // 3. Commerce, Accounting & Finance (B.Com, Accounting, Tax, Audit, Finance)
  if (normText.includes('commerce') || normText.includes('b.com') || normText.includes('bcom') || normText.includes('accounting') || normText.includes('finance') || normText.includes('tax') || normText.includes('audit')) {
    return {
      domainKey: "commerce",
      practiceModeId: "finance-accounting-lab",
      practiceTitle: "Finance & Accounting Practice Lab",
      navLabel: "Finance Practice",
      practiceDescription: "Practice journal entries, ledger reconciliation, financial statement analysis, ratio calculations, and auditing scenarios.",
      badge: "Financial Analysis",
      isMedical: false,
      isComputing: false,
      yearLevel,
      activityTypes: ["Journal & Ledger Entries", "Financial Statement Analysis", "Ratio & Cash Flow Calculations", "Taxation & GST Scenarios", "Auditing & Control", "Financial Modeling"],
      defaultSubject: "Financial Accounting",
      subjects: [
        "Financial Accounting",
        "Corporate Taxation & GST",
        "Auditing & Assurance",
        "Managerial Finance & Valuation",
        "Cost & Management Accounting",
        "Financial Statement Analysis",
        "Business Mathematics & Statistics"
      ]
    };
  }

  // 4. Management & Business Administration (BBA, MBA, BMS, Marketing)
  if (normText.includes('management') || normText.includes('bba') || normText.includes('mba') || normText.includes('bms') || normText.includes('marketing') || normText.includes('business')) {
    return {
      domainKey: "management",
      practiceModeId: "business-decision-lab",
      practiceTitle: "Business Decision & Strategy Lab",
      navLabel: "Business Practice",
      practiceDescription: "Solve real-world business case studies, marketing framework decisions, HR scenarios, and operations management problems.",
      badge: "Strategy",
      isMedical: false,
      isComputing: false,
      yearLevel,
      activityTypes: ["Business Case Studies", "Marketing Strategy Decisions", "HR & Leadership Scenarios", "Operations Decisions", "Financial Decision Making", "Market Analytics"],
      defaultSubject: "Strategic Management",
      subjects: [
        "Strategic Management",
        "Marketing & Consumer Behavior",
        "Corporate Finance & Capital",
        "Human Resource & Talent Strategy",
        "Operations & Supply Chain",
        "Business Analytics & Market Scenarios"
      ]
    };
  }

  // 5. Mechanical Engineering
  if (normText.includes('mechanical') || normText.includes('cad') || normText.includes('automobile') || normText.includes('thermal') || normText.includes('manufacturing')) {
    return {
      domainKey: "mechanical",
      practiceModeId: "mechanical-design-lab",
      practiceTitle: "Mechanical Engineering Design & Problem Lab",
      navLabel: "Engineering Practice",
      practiceDescription: "Solve engineering calculations, CAD design decisions, thermodynamics, fluid dynamics, and machine design scenarios.",
      badge: "Design & R&D",
      isMedical: false,
      isComputing: false,
      yearLevel,
      activityTypes: ["Engineering Calculations", "CAD & Machine Design", "Materials Selection", "Thermodynamics & Heat Transfer", "Fluid Mechanics", "GD&T & Drawing Analysis"],
      defaultSubject: "Machine Design",
      subjects: [
        "Machine Design & Kinematics",
        "Thermodynamics & Thermal Power",
        "Fluid Mechanics & Turbo Machinery",
        "CAD/CAM & FEA Analysis",
        "Manufacturing & Metallurgy"
      ]
    };
  }

  // 6. Civil Engineering
  if (normText.includes('civil') || normText.includes('structural') || normText.includes('construction') || normText.includes('surveying') || normText.includes('geotechnical')) {
    return {
      domainKey: "civil",
      practiceModeId: "civil-engineering-lab",
      practiceTitle: "Civil Engineering Problem Lab",
      navLabel: "Engineering Practice",
      practiceDescription: "Analyze structural mechanics, concrete design, surveying calculations, geotechnical stability, and construction planning.",
      badge: "Infrastructure",
      isMedical: false,
      isComputing: false,
      yearLevel,
      activityTypes: ["Structural Analysis", "Construction Planning", "Material Selection & Concrete", "Surveying & Levelling", "Geotechnical Scenarios", "Quantity Estimation"],
      defaultSubject: "Structural Analysis",
      subjects: [
        "Structural Analysis & RCC",
        "Geotechnical & Soil Mechanics",
        "Construction Planning & Estimating",
        "Surveying & Transportation",
        "Environmental Engineering"
      ]
    };
  }

  // 7. Electronics & Embedded Systems (ECE, EEE, Embedded, VLSI)
  if (normText.includes('electronics') || normText.includes('ece') || normText.includes('eee') || normText.includes('embedded') || normText.includes('vlsi') || normText.includes('microcontroller') || normText.includes('signal')) {
    return {
      domainKey: "electronics",
      practiceModeId: "electronics-embedded-lab",
      practiceTitle: "Electronics & Embedded Systems Lab",
      navLabel: "Engineering Practice",
      practiceDescription: "Analyze digital logic circuits, microcontroller interfacing, signal processing, embedded C logic, and hardware protocols.",
      badge: "Embedded & Hardware",
      isMedical: false,
      isComputing: false,
      yearLevel,
      activityTypes: ["Circuit Analysis", "Digital Electronics Logic", "Microcontroller Interfacing", "Embedded C & Firmware Logic", "Communication Protocols", "Signal Processing"],
      defaultSubject: "Digital Systems",
      subjects: [
        "Digital Systems & Microcontrollers",
        "Embedded Systems & IoT",
        "Signals & DSP",
        "VLSI Design & Semiconductor",
        "Control Systems & Automation"
      ]
    };
  }

  // 8. Pharmacy / Pharmaceutical Sciences
  if (normText.includes('pharm') || normText.includes('drug') || normText.includes('formulation')) {
    return {
      domainKey: "pharmacy",
      practiceModeId: "pharmaceutical-practice-lab",
      practiceTitle: "Pharmaceutical Practice & Pharmacology Lab",
      navLabel: "Pharmacy Practice",
      practiceDescription: "Practice drug classification, pharmacokinetics, pharmaceutical formulation, quality control, and clinical pharmacy.",
      badge: "Pharmaceutics",
      isMedical: false,
      isComputing: false,
      yearLevel,
      activityTypes: ["Pharmacology Questions", "Pharmaceutics Problems", "Drug Classification", "Formulation Scenarios", "Quality Control"],
      defaultSubject: "Pharmacology",
      subjects: [
        "Pharmacology & Toxicology",
        "Pharmaceutics & Formulations",
        "Pharmaceutical Chemistry",
        "Pharmacognosy & Natural Drugs"
      ]
    };
  }

  // 9. Pure Sciences (Physics, Chemistry, Math, Bio)
  if (normText.includes('physics') || normText.includes('chemistry') || normText.includes('math') || normText.includes('biology') || normText.includes('biotech')) {
    return {
      domainKey: "science",
      practiceModeId: "pure-sciences-lab",
      practiceTitle: "Scientific Reasoning & Problem Lab",
      navLabel: "Science Practice",
      practiceDescription: "Solve numerical physics problems, chemical reaction mechanisms, mathematical proofs, or biological data analysis.",
      badge: "Pure Science",
      isMedical: false,
      isComputing: false,
      yearLevel,
      activityTypes: ["Numerical Problems", "Conceptual Reasoning", "Graph Interpretation", "Reaction Mechanisms", "Proof & Logic", "Data Analysis"],
      defaultSubject: "Core Scientific Methods",
      subjects: [
        "Quantum Mechanics & Physics",
        "Organic & Analytical Chemistry",
        "Applied Mathematics & Calculus",
        "Molecular Biology & Genetics"
      ]
    };
  }

  // 10. Default Computing Domain (CSE, IT, BCA, Software, AI, ML, Data Science)
  return {
    domainKey: "computing",
    practiceModeId: "coding-arena",
    practiceTitle: "Coding Arena & Algorithm Practice",
    navLabel: "Coding Arena",
    practiceDescription: "Solve Data Structures & Algorithms, code debugging challenges, SQL queries, API design, and system optimization problems.",
    badge: "Live Coding",
    isMedical: false,
    isComputing: true,
    yearLevel,
    activityTypes: ["Coding Problems", "DSA Challenges", "Code Debugging", "SQL & Database Queries", "System Architecture & APIs", "AI/ML Modeling"],
    defaultSubject: "Data Structures & Algorithms",
    subjects: [
      "Data Structures & Algorithms",
      "Database Systems & SQL",
      "Operating Systems & Concurrency",
      "Computer Networks",
      "Machine Learning & AI",
      "Web Development & APIs"
    ]
  };
}

/**
 * Generates domain-specific practice session content matching student telemetry
 */
async function generateDomainPracticeSession(profile = {}, options = {}) {
  const practiceConfig = getStudentPracticeConfig(profile);
  const subject = options.subject || practiceConfig.defaultSubject || practiceConfig.subjects[0];
  const difficulty = options.difficulty || (practiceConfig.yearLevel <= 1 ? "Easy" : practiceConfig.yearLevel === 2 ? "Medium" : "Hard");
  const count = options.count || 5;

  const degree = profile.degreeProgramme || "Undergraduate Degree";
  const domain = profile.domain || profile.field || "Academic Domain";
  const spec = profile.specialization || "";
  const year = profile.currentYear || `${practiceConfig.yearLevel}nd Year`;

  // Construct Grok AI Prompt for profile-grounded questions
  const prompt = `You are an academic practice question generator for a college student in:
Degree: "${degree}"
Domain: "${domain}"
Specialization: "${spec}"
Academic Stage: "${year}" (Year ${practiceConfig.yearLevel})
Domain Practice Mode: "${practiceConfig.practiceTitle}"
Subject: "${subject}"
Difficulty: "${difficulty}"

Generate ${count} academic practice items.
If the domain is Medicine/BHMS: create educational clinical case scenarios with symptoms, diagnosis options, rationale, and clear academic reasoning.
If the domain is Law: create legal scenarios with case facts, statutory interpretation, issue identification, and legal arguments.
If the domain is Commerce/Finance: create balance sheet/journal entry/taxation/financial ratio calculation problems.
If the domain is Engineering: create engineering calculation, design, or circuit/mechanics problems.
If the domain is Computing: create coding/DSA/debugging/SQL problems.

Respond strictly in valid JSON array of objects with schema:
[
  {
    "id": "item_1",
    "type": "scenario" | "mcq" | "numerical" | "case_study",
    "question": "Clear problem or case scenario description",
    "clinicalPresentation": "Optional clinical presentation (for medicine)",
    "caseFacts": "Optional case facts (for law/business)",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "topic": "${subject}",
    "difficulty": "${difficulty}",
    "explanation": "Detailed educational explanation of why the correct option is right."
  }
]`;

  const systemMsg = "Respond strictly in valid raw JSON array of objects. Do not include markdown headers or commentary.";

  // High quality verified fallbacks per domain key
  const fallbacks = {
    medicine: [
      {
        id: "med_1",
        type: "case_study",
        question: "A 24-year-old patient presents with recurring paroxysmal throbbing headaches accompanied by nausea, photophobia, and visual aura. Clinical evaluation shows no focal neurological deficits.",
        clinicalPresentation: "Paroxysmal unilateral headache with aura, aggravated by noise and light.",
        options: [
          "Classical Migraine with Aura — evaluate triggers & homoeopathic/clinical therapeutics",
          "Tension-type Headache without photophobia",
          "Acute Bacterial Meningitis requiring emergency lumbar puncture",
          "Trigeminal Neuralgia with brief shooting facial pain"
        ],
        correctIndex: 0,
        topic: subject,
        difficulty,
        explanation: "Unilateral throbbing headache preceded by visual aura and accompanied by photophobia is classic presentation of Migraine with Aura. Clinical management focuses on trigger identification and targeted therapeutics."
      },
      {
        id: "med_2",
        type: "scenario",
        question: "In pharmacological evaluation, which parameter determines the safety margin of a therapeutic substance between effective dose (ED50) and lethal/toxic dose (TD50)?",
        options: [
          "Therapeutic Index (TI = TD50 / ED50)",
          "Bioavailability Percentage",
          "Plasma Half-Life (t1/2)",
          "Volume of Distribution (Vd)"
        ],
        correctIndex: 0,
        topic: subject,
        difficulty,
        explanation: "The Therapeutic Index (TI) measures drug safety by comparing the median toxic dose to median effective dose. Higher TI indicates a safer therapeutic profile."
      }
    ],
    law: [
      {
        id: "law_1",
        type: "case_study",
        question: "A statutory clause confers wide discretionary power on an administrative authority without laying down objective guidelines or procedural safeguards. Under constitutional jurisprudence, this clause is vulnerable to challenge under:",
        caseFacts: "Delegated legislation lacking procedural standard or judicial oversight.",
        options: [
          "Article 14 — Doctrine against arbitrary state action",
          "Section 73 of Contract Law",
          "Doctrine of Res Judicata",
          "Strict Liability Principle"
        ],
        correctIndex: 0,
        topic: subject,
        difficulty,
        explanation: "Unbridled and unguided discretionary power granted to executive authorities violates the guarantee of non-arbitrariness under Article 14 of the Constitution."
      }
    ],
    commerce: [
      {
        id: "com_1",
        type: "numerical",
        question: "A firm reports Net Sales of ₹10,000,000, Gross Profit Margin of 30%, and Operating Expenses of ₹1,200,000. What is the Operating Profit Ratio?",
        options: [
          "18%",
          "30%",
          "12%",
          "22%"
        ],
        correctIndex: 0,
        topic: subject,
        difficulty,
        explanation: "Gross Profit = ₹3,000,000. Operating Profit = Gross Profit - Operating Expenses = ₹3,000,000 - ₹1,200,000 = ₹1,800,000. Operating Profit Ratio = (1,800,000 / 10,000,000) * 100 = 18%."
      }
    ],
    management: [
      {
        id: "mgmt_1",
        type: "case_study",
        question: "In Porter's Five Forces framework, a industry with low capital requirements, minimal brand loyalty, and unpatented technology exhibits:",
        options: [
          "High Threat of New Entrants",
          "High Supplier Bargaining Power",
          "Low Industry Rivalry",
          "High Barriers to Entry"
        ],
        correctIndex: 0,
        topic: subject,
        difficulty,
        explanation: "Low capital investment, lack of proprietary technology, and low brand equity reduce entry barriers, resulting in high threat of new market entrants."
      }
    ],
    mechanical: [
      {
        id: "mech_1",
        type: "numerical",
        question: "In thermodynamic evaluation of a Carnot heat engine operating between reservoir temperatures of 600 K and 300 K, what is the maximum thermal efficiency?",
        options: [
          "50%",
          "60%",
          "75%",
          "40%"
        ],
        correctIndex: 0,
        topic: subject,
        difficulty,
        explanation: "Carnot Efficiency = 1 - (TL / TH) = 1 - (300 / 600) = 0.50 or 50%."
      }
    ],
    civil: [
      {
        id: "civ_1",
        type: "mcq",
        question: "In reinforced concrete beam design under IS 456, what parameter governs the maximum depth of the neutral axis for Fe 500 grade steel?",
        options: [
          "0.46 * d",
          "0.53 * d",
          "0.48 * d",
          "0.38 * d"
        ],
        correctIndex: 0,
        topic: subject,
        difficulty,
        explanation: "For Fe 500 yield strength steel, the limiting depth of neutral axis (xu,max/d) is 0.46 under limit state design."
      }
    ],
    electronics: [
      {
        id: "ece_1",
        type: "mcq",
        question: "In digital microcontroller interfacing, which serial communication protocol utilizes two bi-directional lines (SDA and SCL) with master-slave addressing?",
        options: [
          "I2C (Inter-Integrated Circuit)",
          "SPI (Serial Peripheral Interface)",
          "UART (Universal Asynchronous Receiver-Transmitter)",
          "CAN Bus"
        ],
        correctIndex: 0,
        topic: subject,
        difficulty,
        explanation: "I2C uses two lines (Serial Data - SDA and Serial Clock - SCL) and supports multi-master/multi-slave operation using 7-bit or 10-bit addressing."
      }
    ],
    computing: [
      {
        id: "cs_1",
        type: "mcq",
        question: "Which data structure provides average O(1) time complexity for insertion, deletion, and lookup operations?",
        options: [
          "Hash Table / Hash Map",
          "Binary Search Tree",
          "Sorted Array",
          "Singly Linked List"
        ],
        correctIndex: 0,
        topic: subject,
        difficulty,
        explanation: "Hash Tables compute array indices using a hash function, allowing O(1) average time complexity for lookup, insertion, and deletion."
      }
    ]
  };

  const domainFallback = fallbacks[practiceConfig.domainKey] || fallbacks.computing;

  try {
    const response = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      {
        model: "grok-2-latest",
        messages: [
          { role: "system", content: systemMsg },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1200
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROK_API_KEY}`
        },
        timeout: 10000
      }
    );
    const raw = response.data?.choices?.[0]?.message?.content || "";
    const clean = raw.replace(/```json/gi, "").replace(/```/gi, "").trim();
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { practiceConfig, questions: parsed };
    }
  } catch (err) {
    console.warn("Grok API practice question query fallback triggered:", err.message);
  }

  return { practiceConfig, questions: domainFallback };
}

module.exports = {
  getStudentPracticeConfig,
  generateDomainPracticeSession
};
