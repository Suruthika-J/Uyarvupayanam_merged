/**
 * College Practice Engine (Frontend Service)
 * 
 * Provides client-side practice mode determination, nav metadata, and API interactions
 * with the server-side College Practice Engine.
 */

import axios from 'axios'

const norm = (str) => (str || '').toString().toLowerCase().trim()

/**
 * Client-side evaluation of student telemetry to get domain practice configuration
 */
export function getCollegePracticeConfig(profile = {}) {
  const normText = `${profile.degreeProgramme || ''} ${profile.domain || ''} ${profile.field || ''} ${profile.specialization || ''}`.toLowerCase()
  const yearStr = norm(profile.currentYear || profile.academicYear)
  const yearLevel = yearStr.includes('1') || yearStr.includes('first') ? 1
                  : yearStr.includes('2') || yearStr.includes('second') ? 2
                  : yearStr.includes('3') || yearStr.includes('third') ? 3
                  : yearStr.includes('4') || yearStr.includes('fourth') || yearStr.includes('final') ? 4 : 2

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
      ],
      dailyMissionTitle: "Complete 2 Clinical Reasoning Scenarios"
    }
  }

  // 2. Law / Jurisprudence (LL.B, LL.M, Advocacy)
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
      ],
      dailyMissionTitle: "Analyze 2 Legal Precedents & Case Issues"
    }
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
      ],
      dailyMissionTitle: "Solve 2 Financial Statement Analysis Problems"
    }
  }

  // 4. Management & Business Administration (BBA, MBA, BMS)
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
      ],
      dailyMissionTitle: "Solve 2 Strategic Business Case Decisions"
    }
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
      ],
      dailyMissionTitle: "Solve 2 Machine Design & Thermal Calculation Problems"
    }
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
      ],
      dailyMissionTitle: "Solve 2 Structural & Geotechnical Mechanics Problems"
    }
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
      ],
      dailyMissionTitle: "Solve 2 Embedded Logic & Circuit Problems"
    }
  }

  // 8. Default Computing Domain (CSE, IT, BCA, Software, AI, ML, Data Science)
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
    ],
    dailyMissionTitle: "Solve 2 Data Structure or SQL Challenges"
  }
}

/**
 * Fetches practice session items from backend engine
 */
export async function fetchDomainPracticeSession({ subject, difficulty, count, practiceType, topic }) {
  const token = localStorage.getItem('studentToken')
  const res = await axios.post(
    'http://localhost:5000/api/study-tools/practice-questions',
    { subject, difficulty, count: count || 5, practiceType, topic },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (res.data?.success) {
    return {
      practiceConfig: res.data.practiceConfig,
      questions: res.data.questions || []
    }
  }
  throw new Error(res.data?.message || 'Failed to fetch domain practice session')
}
