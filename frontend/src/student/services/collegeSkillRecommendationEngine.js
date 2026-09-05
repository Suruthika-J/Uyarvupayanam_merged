/**
 * Centralized College Skill Recommendation Engine
 *
 * Generates dynamic, profile-driven skills based on:
 * Hierarchy: Specialization > Domain > Degree > Field
 * Refined by: Target Career, Career Direction, Academic Focus, Year
 *
 * Avoids universal static skill lists.
 * Self-reported proficiency and intent are captured alongside skills.
 */

const norm = (str) => (str || '').toString().toLowerCase().trim()

/**
 * Detailed Skill Catalogs by Domain Hierarchy
 */
const DOMAIN_SKILL_CATALOG = {
  // ── MEDICINE & HEALTH SCIENCES ──────────────────────────────────────────────
  medicine: {
    core: [
      { name: 'Clinical Diagnostics & Examination', category: 'Clinical Core', description: 'Patient history taking, physical examination, and clinical sign interpretation' },
      { name: 'Patient Assessment & Case History', category: 'Clinical Core', description: 'Systemic patient assessment and structured case presentation' },
      { name: 'Medical Terminology & Pathology', category: 'Clinical Science', description: 'Disease etiology, pathological mechanisms, and medical terminology' },
      { name: 'Pharmacology & Therapeutics', category: 'Clinical Science', description: 'Drug action, dosage calculation, contraindications, and therapeutics' },
      { name: 'Clinical Case Reasoning & Differential Diagnosis', category: 'Clinical Core', description: 'Formulating differential diagnosis from clinical symptom clusters' },
      { name: 'Good Clinical Practice (GCP) & Ethics', category: 'Research & Ethics', description: 'Ethical guidelines, informed consent, and regulatory standards' }
    ],
    specializations: {
      'General Medicine': [
        { name: 'Internal Medicine & Systemic Pathology', category: 'Specialization Focus' },
        { name: 'Diagnostic Interpretation (ECG / Lab Reports)', category: 'Specialization Focus' },
        { name: 'Chronic Disease Management Protocol', category: 'Specialization Focus' }
      ],
      'Homeopathy': [
        { name: 'Homeopathic Case Taking & Symptomatology', category: 'Specialization Focus' },
        { name: 'Repertoirization (Radar / Synthesis)', category: 'Specialization Focus' },
        { name: 'Materia Medica & Constitutional Remedy Analysis', category: 'Specialization Focus' },
        { name: 'Organon of Medicine & Homeopathic Philosophy', category: 'Specialization Focus' }
      ],
      'Clinical Research': [
        { name: 'Clinical Trial Protocol & Pharmacovigilance', category: 'Specialization Focus' },
        { name: 'Medical Coding & ICD-10 Classification', category: 'Specialization Focus' },
        { name: 'Biostatistics & Health Data Analysis (R / Python)', category: 'Specialization Focus' }
      ],
      'Public Health': [
        { name: 'Epidemiological Survey Design', category: 'Specialization Focus' },
        { name: 'Community Health Interventions & Policy', category: 'Specialization Focus' },
        { name: 'Preventive Healthcare Strategy', category: 'Specialization Focus' }
      ]
    }
  },

  // ── ENGINEERING & TECHNOLOGY ────────────────────────────────────────────────
  engineering: {
    core: [
      { name: 'Problem Solving & Algorithmic Logic', category: 'Core Competency', description: 'Decomposing complex problems and constructing logical solutions' },
      { name: 'Data Structures & Algorithms', category: 'Computer Science', description: 'Arrays, Trees, Graphs, Sorting, Dynamic Programming' },
      { name: 'Python for Computing & Data Analysis', category: 'Programming', description: 'Python syntax, NumPy, Pandas, Data Wrangling' },
      { name: 'SQL & Relational Database Management', category: 'Data & Systems', description: 'Database design, SQL queries, indexing, joins' },
      { name: 'Version Control (Git & GitHub)', category: 'Software Engineering', description: 'Branching, pull requests, merge conflict resolution' }
    ],
    specializations: {
      'Artificial Intelligence & Data Science': [
        { name: 'Machine Learning & Predictive Modeling (Scikit-Learn)', category: 'Specialization Focus' },
        { name: 'Deep Learning & Neural Networks (PyTorch / TensorFlow)', category: 'Specialization Focus' },
        { name: 'Data Visualization & Exploratory Analysis', category: 'Specialization Focus' },
        { name: 'Model Deployment & MLOps Basics', category: 'Specialization Focus' }
      ],
      'Software Engineering': [
        { name: 'Full Stack Web Development (React & Node.js)', category: 'Specialization Focus' },
        { name: 'Java / Spring Boot Enterprise Architecture', category: 'Specialization Focus' },
        { name: 'RESTful API & Microservices Design', category: 'Specialization Focus' },
        { name: 'System Architecture & Scalability', category: 'Specialization Focus' }
      ],
      'Cyber Security & Ethical Hacking': [
        { name: 'Network Security & Threat Hunting', category: 'Specialization Focus' },
        { name: 'Ethical Hacking & Penetration Testing', category: 'Specialization Focus' },
        { name: 'Cryptography & Identity Management', category: 'Specialization Focus' }
      ],
      'Cloud Computing & DevOps': [
        { name: 'Cloud Architecture (AWS / Azure / GCP)', category: 'Specialization Focus' },
        { name: 'Docker Containerization & Kubernetes', category: 'Specialization Focus' },
        { name: 'CI/CD Pipeline Automation', category: 'Specialization Focus' }
      ],
      'Embedded Systems & IoT': [
        { name: 'Embedded C & RTOS Programming', category: 'Specialization Focus' },
        { name: 'Microcontroller Architecture (ARM / ESP32 / Arduino)', category: 'Specialization Focus' },
        { name: 'IoT Protocols (MQTT / HTTP / Bluetooth)', category: 'Specialization Focus' },
        { name: 'PCB Circuit Debugging & Hardware Interfaces', category: 'Specialization Focus' }
      ],
      'VLSI & Semiconductor Chip Design': [
        { name: 'Verilog / SystemVerilog HDL Simulation', category: 'Specialization Focus' },
        { name: 'FPGA Prototyping & Digital Logic Synthesis', category: 'Specialization Focus' },
        { name: 'ASIC Design Flow & Cadence EDA Tools', category: 'Specialization Focus' }
      ],
      'CAD / CAM / CAE Product Design': [
        { name: '3D Mechanical Modeling (AutoCAD / SolidWorks / CATIA)', category: 'Specialization Focus' },
        { name: 'Finite Element Analysis (ANSYS FEA)', category: 'Specialization Focus' },
        { name: 'Geometric Dimensioning & Tolerancing (GD&T)', category: 'Specialization Focus' }
      ],
      'Automotive & Electric Vehicle Tech': [
        { name: 'Electric Vehicle Powertrain & Battery Management (BMS)', category: 'Specialization Focus' },
        { name: 'MATLAB / Simulink System Modeling', category: 'Specialization Focus' },
        { name: 'Automotive Embedded Systems & CAN Bus', category: 'Specialization Focus' }
      ]
    }
  },

  // ── LAW & LEGAL STUDIES ────────────────────────────────────────────────────
  law: {
    core: [
      { name: 'Legal Research & Case Precedent Analysis', category: 'Legal Core', description: 'Navigating Manupatra/SCC Online, indexing case laws, analyzing ratios' },
      { name: 'Legal Drafting & Pleading Construction', category: 'Legal Core', description: 'Drafting petitions, plaints, notices, and affidavits' },
      { name: 'Statutory Interpretation & Constitutional Principles', category: 'Legal Science', description: 'Applying rules of statutory interpretation and constitutional law' },
      { name: 'Oral Advocacy & Public Speaking', category: 'Legal Practice', description: 'Appellate court arguments, court demeanor, structured oral advocacy' }
    ],
    specializations: {
      'Corporate & Commercial Law': [
        { name: 'Corporate Contract Drafting & Review', category: 'Specialization Focus' },
        { name: 'Mergers & Acquisitions Legal Compliance', category: 'Specialization Focus' },
        { name: 'SEBI Regulations & Company Law Standards', category: 'Specialization Focus' }
      ],
      'Cyber Law & Intellectual Property': [
        { name: 'Data Protection & Privacy Compliance (DPDP / GDPR)', category: 'Specialization Focus' },
        { name: 'Patent, Trademark & Copyright Prosecution', category: 'Specialization Focus' },
        { name: 'Technology Contract & Licensing Agreements', category: 'Specialization Focus' }
      ],
      'Constitutional & Civil Law': [
        { name: 'Civil Procedure Code (CPC) & Evidence Act', category: 'Specialization Focus' },
        { name: 'Writs & Constitutional Litigation', category: 'Specialization Focus' },
        { name: 'Judicial Judgment Analysis', category: 'Specialization Focus' }
      ]
    }
  },

  // ── COMMERCE & MANAGEMENT ──────────────────────────────────────────────────
  commerce: {
    core: [
      { name: 'Financial Accounting & Reporting Standards', category: 'Finance Core', description: 'Journal entries, ledger posting, balance sheet preparation, IND-AS' },
      { name: 'Excel Financial Modeling & Functions', category: 'Analytics', description: 'VLOOKUP, Pivot Tables, DCF modeling, financial functions' },
      { name: 'Tally Prime & GST Accounting', category: 'Accounting Tools', description: 'Tally entry, GST return filing, E-way bill generation' },
      { name: 'Business Analytics & Data Intelligence (Power BI / Tableau)', category: 'Analytics', description: 'Corporate dashboards, KPI tracking, data visualization' },
      { name: 'Corporate Tax Laws & Statutory Audit', category: 'Governance', description: 'Direct/Indirect tax computation, audit procedures' }
    ],
    specializations: {
      'Financial Management & Fintech': [
        { name: 'Corporate Valuation & DCF Modeling', category: 'Specialization Focus' },
        { name: 'Investment Portfolio & Risk Analysis', category: 'Specialization Focus' },
        { name: 'Capital Markets & Financial Derivatives', category: 'Specialization Focus' }
      ],
      'Business Analytics': [
        { name: 'SQL for Business Intelligence', category: 'Specialization Focus' },
        { name: 'Predictive Business Analytics', category: 'Specialization Focus' },
        { name: 'Executive Storytelling with Data', category: 'Specialization Focus' }
      ]
    }
  },

  // ── PURE & APPLIED SCIENCES ────────────────────────────────────────────────
  pure_sciences: {
    core: [
      { name: 'Scientific Research Methodology & Experimental Design', category: 'Science Core', description: 'Formulating hypotheses, designing control experiments, scientific method' },
      { name: 'Laboratory Techniques & Instrument Handling', category: 'Practical Science', description: 'Spectrophotometry, chromatography, assay execution, safety' },
      { name: 'Data Analysis with Python / R for Sciences', category: 'Scientific Computing', description: 'Statistical analysis, plotting scientific graphs, curve fitting' }
    ],
    specializations: {
      'Microbiology & Genomics': [
        { name: 'Microbiological Culture & Aseptic Techniques', category: 'Specialization Focus' },
        { name: 'DNA Extraction & PCR Amplification', category: 'Specialization Focus' },
        { name: 'Bioinformatics & Sequence Alignment (BLAST)', category: 'Specialization Focus' }
      ],
      'Chemistry & Biochemistry': [
        { name: 'Spectroscopic Analysis (NMR / UV-Vis / IR)', category: 'Specialization Focus' },
        { name: 'Organic Synthesis & Purification', category: 'Specialization Focus' }
      ]
    }
  },

  // ── AGRICULTURE ────────────────────────────────────────────────────────────
  agriculture: {
    core: [
      { name: 'Precision Agriculture & Agritech GIS Mapping', category: 'Agri Tech', description: 'Satellite imagery analysis, GPS field mapping, drone data' },
      { name: 'Crop Protection & Agronomic Soil Science', category: 'Agri Core', description: 'Pest management, soil nutrient analysis, irrigation models' },
      { name: 'Agricultural Research Methodology', category: 'Research', description: 'Field trial design, statistical analysis of crop yield' }
    ],
    specializations: {}
  }
}

/**
 * Universal Transferable Soft & Career Readiness Skills
 */
const TRANSFERABLE_SKILLS = [
  { name: 'Structured Analytical Thinking', category: 'Soft Skill' },
  { name: 'Technical & Professional Communication', category: 'Soft Skill' },
  { name: 'Project Management & Execution', category: 'Soft Skill' },
  { name: 'Cross-Functional Team Collaboration', category: 'Soft Skill' }
]

/**
 * Main Export: Computes Dynamic Profile-Relevant Skills for Step 6
 *
 * @param {Object} profile - Student profile object
 * @returns {Array} List of skill objects { id, name, category, isCore, isSpecialization, defaultLevel }
 */
export function getProfileRelevantSkills(profile = {}) {
  const rawField = norm(profile.fieldId || profile.field)
  const rawDegree = norm(profile.degreeProgramme)
  const rawDomain = norm(profile.domain)
  const rawSpec = norm(profile.specialization)
  const targetCareer = norm(profile.targetCareer)
  const careerInterests = (profile.careerInterests || []).map(c => norm(c))

  // Determine canonical field key
  let fieldKey = 'engineering'
  if (rawField.includes('med') || rawField.includes('health') || rawField.includes('ayush') ||
      rawDegree.includes('mbbs') || rawDegree.includes('bhms') || rawDegree.includes('bams') ||
      rawDegree.includes('bds') || rawDegree.includes('pharm') || rawDomain.includes('clinical')) {
    fieldKey = 'medicine'
  } else if (rawField.includes('eng') || rawDegree.includes('b.e') || rawDegree.includes('b.tech') || rawDegree.includes('m.tech') || rawDegree.includes('diploma') || rawDegree.includes('bca') || rawDegree.includes('mca') || rawField.includes('engineering')) {
    fieldKey = 'engineering'
  } else if (rawField.includes('law') || rawField.includes('legal') || rawDegree.includes('ll.b') || rawDegree.includes('llb')) {
    fieldKey = 'law'
  } else if (rawField.includes('commerce') || rawField.includes('account') || rawDegree.includes('b.com') || rawDegree.includes('m.com') || rawDegree.includes('ca')) {
    fieldKey = 'commerce'
  } else if (rawField.includes('manag') || rawDegree.includes('bba') || rawDegree.includes('mba')) {
    fieldKey = 'commerce'
  } else if (rawField.includes('science') || rawDegree.includes('b.sc') || rawDegree.includes('m.sc')) {
    fieldKey = 'pure_sciences'
  } else if (rawField.includes('agri') || rawDegree.includes('agri')) {
    fieldKey = 'agriculture'
  }

  const catalog = DOMAIN_SKILL_CATALOG[fieldKey] || DOMAIN_SKILL_CATALOG.engineering
  const resultSkills = []
  const addedNames = new Set()

  // 1. Add Core Domain Skills
  if (catalog.core) {
    catalog.core.forEach(s => {
      if (!addedNames.has(s.name.toLowerCase())) {
        addedNames.add(s.name.toLowerCase())
        resultSkills.push({
          id: s.name.toLowerCase().replace(/[^\w]+/g, '_'),
          name: s.name,
          category: s.category || 'Core Domain',
          description: s.description || '',
          tier: 'CORE'
        })
      }
    })
  }

  // 2. Add Specialization Skills (Priority: Specialization > Domain)
  if (catalog.specializations) {
    for (const specKey in catalog.specializations) {
      const sNorm = norm(specKey)
      if (rawSpec.includes(sNorm) || sNorm.includes(rawSpec) || rawDomain.includes(sNorm) || sNorm.includes(rawDomain)) {
        catalog.specializations[specKey].forEach(s => {
          if (!addedNames.has(s.name.toLowerCase())) {
            addedNames.add(s.name.toLowerCase())
            resultSkills.push({
              id: s.name.toLowerCase().replace(/[^\w]+/g, '_'),
              name: s.name,
              category: s.category || 'Specialization Focus',
              description: s.description || '',
              tier: 'SPECIALIZATION'
            })
          }
        })
      }
    }
  }

  // 3. Add Cross-Domain Skills IF explicit tech / switch interest exists (e.g. BHMS + Healthcare Tech)
  const allInterests = [...careerInterests, targetCareer]
  if (allInterests.some(i => i.includes('tech') || i.includes('software') || i.includes('ai') || i.includes('data') || i.includes('informatics'))) {
    const techSkills = [
      { name: 'Python for Health / Domain Data Analytics', category: 'Interdisciplinary Tech' },
      { name: 'Data Visualization & Reporting', category: 'Interdisciplinary Tech' }
    ]
    techSkills.forEach(s => {
      if (!addedNames.has(s.name.toLowerCase())) {
        addedNames.add(s.name.toLowerCase())
        resultSkills.push({
          id: s.name.toLowerCase().replace(/[^\w]+/g, '_'),
          name: s.name,
          category: s.category,
          tier: 'INTERDISCIPLINARY'
        })
      }
    })
  }

  // 4. Add Transferable Soft Skills
  TRANSFERABLE_SKILLS.forEach(s => {
    if (!addedNames.has(s.name.toLowerCase())) {
      addedNames.add(s.name.toLowerCase())
      resultSkills.push({
        id: s.name.toLowerCase().replace(/[^\w]+/g, '_'),
        name: s.name,
        category: s.category,
        tier: 'TRANSFERABLE'
      })
    }
  })

  return resultSkills
}

/**
 * Standard Proficiency Levels & Intent Options
 */
export const PROFICIENCY_LEVELS = [
  { value: 'Beginner', label: 'Beginner (Basic Knowledge)', desc: 'Familiar with basic terminology and concepts' },
  { value: 'Intermediate', label: 'Intermediate (Practical Capability)', desc: 'Can execute standard tasks with guidance' },
  { value: 'Advanced', label: 'Advanced (Strong Autonomy)', desc: 'Independent problem-solving and application' },
  { value: 'Expert', label: 'Expert (Domain Mastery)', desc: 'Deep knowledge, capability to architect or publish' }
]

export const INTENT_OPTIONS = [
  { value: 'Already practicing', label: 'Already Practicing' },
  { value: 'Want to build', label: 'Want to Build' },
  { value: 'Interested in', label: 'Interested in' }
]
