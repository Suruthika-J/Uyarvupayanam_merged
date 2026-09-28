/**
 * College Career & Academic Recommendation Engine (Profile-Driven & Academic-Aware)
 *
 * PIPELINE:
 * Complete College Profile -> Academic Context Normalization -> Academic Eligibility Gate
 * -> Contextually Relevant Career Universe -> Career Relevance Scoring -> Skill Gap Analysis
 * -> Explainable Ranking -> Personalized Career Recommendations
 *
 * CORE PRINCIPLE:
 * Skills and generic similarity must NEVER override hard academic/domain incompatibility.
 * Academic relevance is a GATE, not merely another score.
 */

const norm = (str) => (str || '').toString().toLowerCase().trim()

/**
 * Normalizes any academic profile into canonical IDs & tokens.
 */
export function normalizeAcademicProfile(profile = {}) {
  const rawField = norm(profile.fieldId || profile.field)
  const rawDegree = norm(profile.degreeProgramme)
  const rawDomain = norm(profile.domain)
  const rawSpec = norm(profile.specialization)

  let fieldId = 'engineering' // default fallback

  if (
    rawField.includes('med') || rawField.includes('health') || rawField.includes('ayush') ||
    rawDegree.includes('mbbs') || rawDegree.includes('bhms') || rawDegree.includes('bams') ||
    rawDegree.includes('bds') || rawDegree.includes('pharm') || rawDegree.includes('nursing') ||
    rawDomain.includes('clinical') || rawDomain.includes('surgical') || rawDomain.includes('dental')
  ) {
    fieldId = 'medicine'
  } else if (
    rawField.includes('eng') || rawField.includes('tech') ||
    rawDegree.includes('b.e') || rawDegree.includes('b.tech') || rawDegree.includes('m.tech') ||
    rawDegree.includes('diploma') || rawDegree.includes('bca') || rawDegree.includes('mca')
  ) {
    fieldId = 'engineering'
  } else if (
    rawField.includes('law') || rawField.includes('legal') ||
    rawDegree.includes('ll.b') || rawDegree.includes('llb') || rawDegree.includes('ll.m') || rawDegree.includes('llm')
  ) {
    fieldId = 'law'
  } else if (
    rawField.includes('com') || rawField.includes('account') || rawField.includes('finance') ||
    rawDegree.includes('b.com') || rawDegree.includes('m.com') || rawDegree.includes('ca')
  ) {
    fieldId = 'commerce'
  } else if (
    rawField.includes('manag') || rawField.includes('busin') ||
    rawDegree.includes('bba') || rawDegree.includes('mba') || rawDegree.includes('bms') || rawDegree.includes('pgdm')
  ) {
    fieldId = 'management'
  } else if (
    rawField.includes('pure_science') || rawField.includes('science') ||
    rawDegree.includes('b.sc') || rawDegree.includes('m.sc') || rawDegree.includes('bsc')
  ) {
    fieldId = 'pure_sciences'
  } else if (
    rawField.includes('arts') || rawField.includes('human') || rawField.includes('social') ||
    rawDegree.includes('b.a') || rawDegree.includes('m.a') || rawDegree.includes('ba')
  ) {
    fieldId = 'arts_social'
  } else if (
    rawField.includes('agri') || rawField.includes('veterin') ||
    rawDegree.includes('b.sc agri') || rawDegree.includes('bvsc')
  ) {
    fieldId = 'agriculture'
  }

  const userSkills = (profile.skills || []).map(s => norm(s))
  const academicInterests = (profile.academicInterests || []).map(i => norm(i))
  const careerInterests = (profile.careerInterests || []).map(i => norm(i))

  const hasTechSkills = userSkills.some(s =>
    s.includes('python') || s.includes('java') || s.includes('react') || s.includes('node') ||
    s.includes('coding') || s.includes('sql') || s.includes('data') || s.includes('cloud') || s.includes('ai')
  )

  const hasHealthTechInterest = academicInterests.concat(careerInterests).some(i =>
    i.includes('health') || i.includes('medical') || i.includes('informatics') || i.includes('biotech')
  )

  const isExplicitCareerSwitch = profile.careerMode === 'Career Switch' ||
    careerInterests.some(ci => ci.includes('switch') || ci.includes('transition'))

  return {
    canonicalFieldId: fieldId,
    rawField,
    rawDegree,
    rawDomain,
    rawSpec,
    userSkills,
    academicInterests,
    careerInterests,
    hasTechSkills,
    hasHealthTechInterest,
    isExplicitCareerSwitch,
    currentYear: profile.currentYear || '1st Year'
  }
}

/**
 * Comprehensive Catalog of College Careers mapped to Canonical Field IDs, Degrees, Domains, and Specializations.
 */
export const COLLEGE_CAREER_CATALOG = [
  // ── Medicine & Health Sciences ─────────────────────────────────────────────
  {
    id: 'clinical-doctor-specialist',
    title: 'Clinical Medical Specialist / Doctor',
    category: 'Medical & Clinical',
    fieldIds: ['medicine'],
    eligibleDegrees: ['MBBS', 'BDS', 'BAMS', 'BHMS'],
    eligibleDomains: ['Clinical & Surgical Specialties', 'Dental Sciences', 'AYUSH & Traditional Medicine', 'Medicine'],
    eligibleSpecializations: ['General Medicine', 'General Surgery', 'Pediatrics', 'Cardiology', 'Neurology', 'Orthodontics', 'Homeopathy'],
    requiredSkills: ['Clinical Diagnostics', 'Patient Care & Assessment', 'Clinical Procedures', 'Pharmacology & Therapeutics'],
    description: 'Diagnoses clinical illnesses, administers medical therapeutics, and performs patient care procedures.',
    skillGapsToDevelop: ['Diagnostic Pathology & Radiology Integration', 'Advanced Clinical Procedures', 'Postgraduate Medical Specialization'],
    nextSteps: ['Complete hospital clinical rotations', 'Prepare for NEET-PG / USMLE / Homeopathic PG entrance', 'Participate in clinical case discussions'],
    careerType: 'DIRECT'
  },
  {
    id: 'homeopathic-clinical-practitioner',
    title: 'Homeopathic Medical Practitioner & Clinical Specialist',
    category: 'AYUSH & Clinical Practice',
    fieldIds: ['medicine'],
    eligibleDegrees: ['BHMS', 'MD (Homeopathy)'],
    eligibleDomains: ['AYUSH & Traditional Medicine', 'Clinical & Surgical Specialties'],
    eligibleSpecializations: ['General Medicine', 'Homeopathy', 'Clinical Practice', 'Materia Medica', 'Organon of Medicine'],
    requiredSkills: ['Homeopathic Case Taking', 'Repertoirization', 'Holistic Patient Management', 'Clinical Therapeutics'],
    description: 'Specializes in homeopathic medical diagnosis, constitutional case analysis, and chronic disease management.',
    skillGapsToDevelop: ['Advanced Constitutional Case Analysis', 'Clinical Pharmacology', 'Homeopathic Research Methodology'],
    nextSteps: ['Undergo clinical mentorship under senior homeopathic consultants', 'Master Computer-Assisted Repertory Software', 'Prepare for MD (Homeopathy) entrance'],
    careerType: 'DIRECT'
  },
  {
    id: 'clinical-research-scientist',
    title: 'Clinical Research Scientist & Pharmacovigilance Specialist',
    category: 'Medical & Pharma Research',
    fieldIds: ['medicine', 'pure_sciences'],
    eligibleDegrees: ['MBBS', 'BHMS', 'BAMS', 'B.Pharm', 'Pharm.D', 'B.Sc'],
    eligibleDomains: ['Clinical & Surgical Specialties', 'Pharmaceutical Sciences', 'Biological Sciences', 'Clinical Research'],
    eligibleSpecializations: ['Clinical Research & Pharmacovigilance', 'Pharmacology & Therapeutics', 'Microbiology & Genomics', 'General Medicine'],
    requiredSkills: ['Clinical Research & Pharmacovigilance', 'Research Methodology & Lab Skills', 'Data Analysis with Python/R', 'Good Clinical Practice (GCP)'],
    description: 'Manages clinical drug trials, analyzes adverse event safety data, and ensures drug regulatory compliance.',
    skillGapsToDevelop: ['GCP (Good Clinical Practice) Guidelines', 'CDISC Data Standards', 'Pharmacovigilance Databases (Argus)'],
    nextSteps: ['Obtain GCP Clinical Research Certification', 'Study FDA / CDSCO regulatory submission guidelines', 'Publish a clinical observation paper'],
    careerType: 'DIRECT'
  },
  {
    id: 'public-health-epidemiologist',
    title: 'Public Health Specialist & Epidemiologist',
    category: 'Public Health & Healthcare Governance',
    fieldIds: ['medicine', 'pure_sciences'],
    eligibleDegrees: ['MBBS', 'BHMS', 'BAMS', 'BDS', 'B.Sc', 'MPH'],
    eligibleDomains: ['Clinical & Surgical Specialties', 'AYUSH & Traditional Medicine', 'Biological Sciences', 'Public Health'],
    eligibleSpecializations: ['General Medicine', 'Public Health', 'Community Medicine', 'Epidemiology'],
    requiredSkills: ['Epidemiological Survey Design', 'Public Policy Analysis', 'Biostatistics & Health Data', 'Preventive Healthcare'],
    description: 'Analyzes disease trends in populations, designs public health interventions, and advises government health policy.',
    skillGapsToDevelop: ['R / Stata Biostatistical Analysis', 'Global Health Policy Frameworks', 'Epidemic Outbreak Response Modeling'],
    nextSteps: ['Apply for Master of Public Health (MPH) programmes', 'Engage in WHO or National Health Mission internships'],
    careerType: 'DIRECT'
  },
  {
    id: 'healthcare-administrator',
    title: 'Healthcare & Hospital Operations Administrator',
    category: 'Healthcare Management',
    fieldIds: ['medicine', 'management', 'commerce'],
    eligibleDegrees: ['MBBS', 'BHMS', 'BDS', 'B.Pharm', 'BBA Healthcare', 'MBA Healthcare'],
    eligibleDomains: ['Clinical & Surgical Specialties', 'AYUSH & Traditional Medicine', 'Healthcare Management', 'Business Specializations'],
    eligibleSpecializations: ['General Medicine', 'Hospital Administration', 'Healthcare Management', 'Operations'],
    requiredSkills: ['Hospital Operations Management', 'Healthcare Quality Standards (NABH)', 'Medical Ethics & Law', 'Patient Service Optimization'],
    description: 'Oversees medical facility operations, clinical staff workflows, NABH quality compliance, and healthcare delivery.',
    skillGapsToDevelop: ['NABH / JCI Accreditation Auditing', 'Hospital Financial Management', 'Electronic Health Record (EHR) Systems'],
    nextSteps: ['Enroll in MHA (Master of Hospital Administration)', 'Gain administrative internship experience at NABH-accredited hospitals'],
    careerType: 'DIRECT'
  },
  {
    id: 'healthcare-informatics-specialist',
    title: 'Healthcare Informatics & Clinical Analytics Specialist',
    category: 'Health Technology & Analytics',
    fieldIds: ['medicine', 'engineering', 'pure_sciences'],
    eligibleDegrees: ['BHMS', 'MBBS', 'B.Pharm', 'B.Sc', 'B.E. (Bachelor of Engineering)', 'B.Tech'],
    eligibleDomains: ['Clinical & Surgical Specialties', 'Computer Science', 'Data Science', 'Pharmaceutical Sciences'],
    eligibleSpecializations: ['General Medicine', 'Healthcare Technology', 'Data Science & Big Analytics', 'Clinical Informatics'],
    requiredSkills: ['Clinical Knowledge', 'Data Analysis with Python/R', 'Healthcare Data Standards (HL7/FHIR)', 'Medical Coding & Billing'],
    description: 'Bridges medicine and computer science to build clinical AI models, manage electronic health record databases, and analyze medical data.',
    skillGapsToDevelop: ['HL7 / FHIR Interoperability Protocols', 'Medical Natural Language Processing (NLP)', 'Python / SQL for Health Records'],
    nextSteps: ['Build a health analytics dashboard using public MIMIC dataset', 'Master Python pandas for medical records analysis'],
    careerType: 'INTERDISCIPLINARY'
  },

  // ── Technology & Software Engineering ─────────────────────────────────────
  {
    id: 'ai-ml-engineer',
    title: 'AI & Machine Learning Engineer',
    category: 'AI & Data Science',
    fieldIds: ['engineering', 'pure_sciences'],
    eligibleDegrees: ['B.E. (Bachelor of Engineering)', 'B.Tech (Bachelor of Technology)', 'M.Tech', 'BCA', 'MCA', 'B.Sc'],
    eligibleDomains: ['Computer Science', 'Data Science', 'Artificial Intelligence', 'Information Technology'],
    eligibleSpecializations: ['Artificial Intelligence & Machine Learning', 'Data Science & Big Analytics', 'Software Engineering'],
    requiredSkills: ['Python / Data Science', 'AI & Machine Learning', 'Problem Solving & Logic'],
    description: 'Designs neural networks, trains ML models, and builds scalable AI systems.',
    skillGapsToDevelop: ['MLOps & Model Deployment', 'Deep Learning (PyTorch/TensorFlow)', 'Distributed AI Infrastructure'],
    nextSteps: ['Complete an ML portfolio project', 'Participate in Kaggle challenges', 'Master PyTorch/TensorFlow'],
    careerType: 'DIRECT'
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist & Analytics Specialist',
    category: 'AI & Data Science',
    fieldIds: ['engineering', 'pure_sciences', 'management', 'commerce'],
    eligibleDegrees: ['B.E. (Bachelor of Engineering)', 'B.Tech', 'B.Com Business Analytics', 'B.Sc', 'MCA'],
    eligibleDomains: ['Computer Science', 'Data Science', 'Mathematics & Statistics', 'Business Analytics'],
    eligibleSpecializations: ['Data Science & Big Analytics', 'Business Analytics & Data Intelligence', 'Artificial Intelligence'],
    requiredSkills: ['Python / Data Science', 'Financial Modeling & Excel', 'Problem Solving & Logic', 'SQL'],
    description: 'Analyzes complex datasets, builds predictive models, and delivers data-driven business insights.',
    skillGapsToDevelop: ['SQL & Data Warehousing', 'Data Visualization (Power BI/Tableau)', 'Statistical Modeling'],
    nextSteps: ['Build 2 end-to-end data analytics dashboards', 'Master SQL and Pandas', 'Study Applied Econometrics/Statistics'],
    careerType: 'DIRECT'
  },
  {
    id: 'software-engineer',
    title: 'Full Stack Software Engineer',
    category: 'Software & Computing',
    fieldIds: ['engineering', 'pure_sciences'],
    eligibleDegrees: ['B.E. (Bachelor of Engineering)', 'B.Tech', 'BCA', 'MCA', 'B.Sc'],
    eligibleDomains: ['Computer Science & Information Technology', 'Computer Science', 'Information Technology'],
    eligibleSpecializations: ['Software Engineering', 'Full Stack Web & Mobile Development', 'Cloud Computing & DevOps'],
    requiredSkills: ['Full Stack Web (React / Node)', 'Java / Spring Boot', 'Python / Data Science', 'Problem Solving & Logic'],
    description: 'Builds robust, scalable web, desktop, and cloud software applications.',
    skillGapsToDevelop: ['System Architecture & Design', 'Docker & Kubernetes', 'CI/CD Pipelines'],
    nextSteps: ['Build 2 full-stack SaaS projects', 'Master Data Structures & Algorithms', 'Contribute to open-source software'],
    careerType: 'DIRECT'
  },
  {
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity & Ethical Hacking Analyst',
    category: 'Cyber & Networks',
    fieldIds: ['engineering', 'pure_sciences'],
    eligibleDegrees: ['B.E. (Bachelor of Engineering)', 'B.Tech', 'BCA', 'MCA'],
    eligibleDomains: ['Computer Science', 'Information Technology', 'Cyber Security'],
    eligibleSpecializations: ['Cyber Security & Ethical Hacking', 'Cloud Computing & DevOps', 'Software Engineering'],
    requiredSkills: ['Cyber Security / Ethical Hacking', 'Cloud Computing & DevOps', 'Problem Solving & Logic'],
    description: 'Protects enterprise networks, conducts penetration tests, and secures IT infrastructure.',
    skillGapsToDevelop: ['Network Security & Penetration Testing', 'SIEM & Threat Hunting', 'Cloud Security Protocols'],
    nextSteps: ['Earn CompTIA Security+ or CEH certification', 'Participate in Capture The Flag (CTF) challenges', 'Master Linux Security'],
    careerType: 'DIRECT'
  },
  {
    id: 'cloud-architect',
    title: 'Cloud Architect & DevOps Engineer',
    category: 'Cloud & Infrastructure',
    fieldIds: ['engineering'],
    eligibleDegrees: ['B.E. (Bachelor of Engineering)', 'B.Tech', 'MCA'],
    eligibleDomains: ['Computer Science', 'Information Technology'],
    eligibleSpecializations: ['Cloud Computing & DevOps', 'Software Engineering', 'Cyber Security'],
    requiredSkills: ['Cloud Computing & DevOps', 'Python / Data Science', 'Problem Solving & Logic'],
    description: 'Designs, deploys, and automates multi-cloud infrastructure on AWS, Azure, or GCP.',
    skillGapsToDevelop: ['Terraform & Infrastructure as Code', 'Kubernetes Cluster Orchestration', 'AWS/Azure Security'],
    nextSteps: ['Prepare for AWS Certified Solutions Architect', 'Build automated Docker/Kubernetes deployment pipelines'],
    careerType: 'DIRECT'
  },

  // ── Electronics & Core Engineering ─────────────────────────────────────────
  {
    id: 'embedded-firmware-engineer',
    title: 'Embedded Systems & Firmware Engineer',
    category: 'Electronics & Hardware',
    fieldIds: ['engineering'],
    eligibleDegrees: ['B.E. (Bachelor of Engineering)', 'B.Tech', 'Diploma in Engineering'],
    eligibleDomains: ['Electronics & Electrical Engineering', 'Mechatronics'],
    eligibleSpecializations: ['Embedded Systems & IoT', 'VLSI & Semiconductor Chip Design', 'Robotics & Automation'],
    requiredSkills: ['Embedded Systems & IoT', 'CAD / 3D Modeling (AutoCAD/SolidWorks)', 'Problem Solving & Logic'],
    description: 'Develops low-level firmware and embedded C software for microcontrollers, IoT devices, and automotive chips.',
    skillGapsToDevelop: ['Embedded C / RTOS', 'PCB Design & Hardware Debugging', 'ARM Cortex Microcontrollers'],
    nextSteps: ['Build an IoT hardware prototype', 'Master FreeRTOS and SPI/I2C communication protocols'],
    careerType: 'DIRECT'
  },
  {
    id: 'vlsi-chip-designer',
    title: 'VLSI & Semiconductor Design Engineer',
    category: 'Electronics & Hardware',
    fieldIds: ['engineering'],
    eligibleDegrees: ['B.E. (Bachelor of Engineering)', 'B.Tech', 'M.Tech'],
    eligibleDomains: ['Electronics & Electrical Engineering'],
    eligibleSpecializations: ['VLSI & Semiconductor Chip Design', 'Embedded Systems & IoT'],
    requiredSkills: ['Embedded Systems & IoT', 'Problem Solving & Logic'],
    description: 'Designs silicon integrated circuits, FPGA logic, and semiconductor chips.',
    skillGapsToDevelop: ['Verilog / SystemVerilog', 'ASIC Synthesis & Layout', 'Cadence / Synopsys EDA Tools'],
    nextSteps: ['Simulate Verilog HDL designs on FPGA boards', 'Study VLSI Digital Signal Processing'],
    careerType: 'DIRECT'
  },
  {
    id: 'automotive-ev-engineer',
    title: 'Automotive & Electric Vehicle Tech Engineer',
    category: 'Core Engineering R&D',
    fieldIds: ['engineering'],
    eligibleDegrees: ['B.E. (Bachelor of Engineering)', 'B.Tech'],
    eligibleDomains: ['Mechanical & Automotive Engineering', 'Electronics & Electrical Engineering'],
    eligibleSpecializations: ['Automotive & Electric Vehicle Tech', 'CAD / CAM / CAE Product Design', 'Power Systems & Renewable Energy'],
    requiredSkills: ['CAD / 3D Modeling (AutoCAD/SolidWorks)', 'Embedded Systems & IoT', 'Problem Solving & Logic'],
    description: 'Engineers electric vehicle drivetrains, battery management systems (BMS), and automotive structures.',
    skillGapsToDevelop: ['EV Powertrain Simulation (MATLAB/Simulink)', 'Battery Management System Architecture', 'FEA Crash Analysis'],
    nextSteps: ['Design EV battery pack in CAD', 'Simulate motor control in MATLAB'],
    careerType: 'DIRECT'
  },
  {
    id: 'cad-cae-design-engineer',
    title: 'Mechanical CAD/CAE Product Design Engineer',
    category: 'Core Engineering R&D',
    fieldIds: ['engineering'],
    eligibleDegrees: ['B.E. (Bachelor of Engineering)', 'B.Tech', 'Diploma in Engineering'],
    eligibleDomains: ['Mechanical & Automotive Engineering', 'Civil & Architecture'],
    eligibleSpecializations: ['CAD / CAM / CAE Product Design', 'Structural Engineering', 'Robotics & Mechatronics'],
    requiredSkills: ['CAD / 3D Modeling (AutoCAD/SolidWorks)', 'Problem Solving & Logic'],
    description: 'Designs mechanical components, performs FEA stress analysis, and creates manufacturing documentation.',
    skillGapsToDevelop: ['SolidWorks / CATIA Advanced Modeling', 'ANSYS Finite Element Analysis (FEA)', 'GD&T Tolerancing'],
    nextSteps: ['Complete SolidWorks CSWA/CSWP certification', 'Perform ANSYS structural stress analysis on 3D assembly'],
    careerType: 'DIRECT'
  },

  // ── Law & Legal Studies ────────────────────────────────────────────────────
  {
    id: 'corporate-lawyer-counsel',
    title: 'Corporate Legal Counsel & Compliance Advocate',
    category: 'Legal & Advocacy',
    fieldIds: ['law'],
    eligibleDegrees: ['B.A. LL.B. (Integrated 5 Years)', 'B.B.A. LL.B. (Integrated 5 Years)', 'LL.B. (3 Years Post-Graduation)', 'LL.M.'],
    eligibleDomains: ['Legal Domains & Advocacy'],
    eligibleSpecializations: ['Corporate & Commercial Law', 'Cyber Law & Intellectual Property', 'Constitutional & Civil Law'],
    requiredSkills: ['Legal Drafting & Research', 'Public Policy Analysis', 'Public Speaking & Communication'],
    description: 'Drafts corporate contracts, manages M&A regulatory compliance, and represents corporate clients.',
    skillGapsToDevelop: ['Mergers & Acquisitions Contract Drafting', 'SEBI Corporate Governance', 'Cross-Border Arbitration'],
    nextSteps: ['Participate in National Moot Court competitions', 'Complete corporate law internships at tier-1 law firms'],
    careerType: 'DIRECT'
  },
  {
    id: 'cyber-lawyer-ipr-consultant',
    title: 'Cyber Law & IPR Consultant',
    category: 'Legal & Technology',
    fieldIds: ['law', 'engineering'],
    eligibleDegrees: ['B.A. LL.B.', 'B.B.A. LL.B.', 'LL.B.', 'Diploma in Cyber Law'],
    eligibleDomains: ['Legal Domains & Advocacy', 'Computer Science & Information Technology'],
    eligibleSpecializations: ['Cyber Law & Intellectual Property', 'Corporate & Commercial Law'],
    requiredSkills: ['Legal Drafting & Research', 'Cyber Security / Ethical Hacking', 'Public Policy Analysis'],
    description: 'Advises tech companies on data protection laws (GDPR/DPDP), software patent protection, and cybercrime.',
    skillGapsToDevelop: ['Data Protection Regulations (DPDP & GDPR)', 'Patent & Trademark Filing Procedures', 'Tech Contract Drafting'],
    nextSteps: ['Earn WIPO Intellectual Property Certification', 'Publish research paper on AI ethics & cyber law'],
    careerType: 'INTERDISCIPLINARY'
  },
  {
    id: 'judicial-magistrate-services',
    title: 'Judicial Services Magistrate & Legal Officer',
    category: 'Judiciary & Public Administration',
    fieldIds: ['law'],
    eligibleDegrees: ['B.A. LL.B.', 'B.B.A. LL.B.', 'LL.B.'],
    eligibleDomains: ['Legal Domains & Advocacy'],
    eligibleSpecializations: ['Constitutional & Civil Law', 'Criminal Law & Forensics', 'Corporate & Commercial Law'],
    requiredSkills: ['Legal Drafting & Research', 'Public Speaking & Communication', 'Problem Solving & Logic'],
    description: 'Prepares for state judicial service examinations to serve as Civil Judge / Judicial Magistrate.',
    skillGapsToDevelop: ['Civil & Criminal Procedure Code Mastery', 'Judicial Judgment Writing', 'Evidence Act Analysis'],
    nextSteps: ['Solve past 10 years Judicial Services mains papers', 'Complete court clerkship under senior advocate'],
    careerType: 'DIRECT'
  },

  // ── Management & Commerce ──────────────────────────────────────────────────
  {
    id: 'financial-analyst-investor',
    title: 'Financial Analyst & Investment Specialist',
    category: 'Finance & Banking',
    fieldIds: ['management', 'commerce'],
    eligibleDegrees: ['B.Com (Bachelor of Commerce)', 'BBA', 'MBA', 'CA', 'B.Com Business Analytics'],
    eligibleDomains: ['Finance & Banking', 'Accounting & Audit', 'Business Specializations'],
    eligibleSpecializations: ['Financial Management & Fintech', 'Financial Accounting & Reporting', 'Business Analytics & Data Intelligence'],
    requiredSkills: ['Financial Modeling & Excel', 'Tally & GST Accounting', 'Business Analytics (Power BI/Tableau)'],
    description: 'Constructs DCF valuation models, evaluates investment opportunities, and manages capital portfolios.',
    skillGapsToDevelop: ['Advanced DCF & LBO Financial Modeling', 'Bloomberg Terminal / Capital IQ', 'CFA Level 1 Curriculum'],
    nextSteps: ['Prepare for CFA Level 1', 'Build 3 financial valuation models in Excel', 'Master Power BI financial dashboards'],
    careerType: 'DIRECT'
  },
  {
    id: 'chartered-accountant-tax',
    title: 'Chartered Accountant & Corporate Tax Consultant',
    category: 'Accounting & Governance',
    fieldIds: ['commerce'],
    eligibleDegrees: ['B.Com (Bachelor of Commerce)', 'CA', 'M.Com'],
    eligibleDomains: ['Accounting & Audit', 'Finance & Banking'],
    eligibleSpecializations: ['Financial Accounting & Reporting', 'Auditing & Tax Laws'],
    requiredSkills: ['Tally & GST Accounting', 'Financial Modeling & Excel', 'Legal Drafting & Research'],
    description: 'Audits corporate financial statements, manages statutory taxation, and advises on financial governance.',
    skillGapsToDevelop: ['ICAI CA Final Standards', 'Corporate Indirect Tax Litigation', 'Statutory Auditing Protocols'],
    nextSteps: ['Complete 3-year Articleship training', 'Prepare for CA Intermediate / Final exams'],
    careerType: 'DIRECT'
  },
  {
    id: 'business-analytics-manager',
    title: 'Business Analytics & Growth Manager',
    category: 'Management & Strategy',
    fieldIds: ['management', 'commerce', 'engineering'],
    eligibleDegrees: ['BBA', 'MBA', 'B.Com Business Analytics', 'B.Tech', 'PGDM'],
    eligibleDomains: ['Business Specializations', 'Computer Science', 'Accounting & Audit'],
    eligibleSpecializations: ['Business Analytics & Data Intelligence', 'Marketing & Growth Strategy', 'Operations & Supply Chain'],
    requiredSkills: ['Business Analytics (Power BI/Tableau)', 'Digital Marketing & Analytics', 'Financial Modeling & Excel'],
    description: 'Translates business data into operational strategy, growth campaigns, and executive decisions.',
    skillGapsToDevelop: ['SQL & Data Analytics for Business', 'A/B Testing & Growth Hacking', 'Executive Storytelling with Data'],
    nextSteps: ['Build Power BI executive dashboards', 'Complete Google Data Analytics Certification'],
    careerType: 'DIRECT'
  },

  // ── Pure & Applied Sciences ─────────────────────────────────────────────────
  {
    id: 'research-scientist-lab',
    title: 'Academic & Industrial Research Scientist',
    category: 'Pure & Applied Research',
    fieldIds: ['pure_sciences', 'engineering'],
    eligibleDegrees: ['B.Sc', 'M.Sc', 'Integrated B.Sc + M.Sc', 'B.Sc Research'],
    eligibleDomains: ['Biological Sciences', 'Physics & Astrophysics', 'Chemistry & Biochemistry', 'Mathematics & Statistics'],
    eligibleSpecializations: ['Microbiology & Genomics', 'Theoretical Physics', 'Biochemistry & Molecular Biology', 'Pure Mathematics'],
    requiredSkills: ['Research Methodology & Lab Skills', 'Data Analysis with Python/R', 'Problem Solving & Logic'],
    description: 'Conducts experimental and theoretical scientific research, publishes papers, and develops new technologies.',
    skillGapsToDevelop: ['Scientific Research Methodology', 'LaTeX Paper Formatting', 'Grant Proposal Writing'],
    nextSteps: ['Publish paper in peer-reviewed scientific journal', 'Apply for CSIR-NET / GATE Fellowships'],
    careerType: 'DIRECT'
  },

  // ── Arts, Humanities & Social Sciences ─────────────────────────────────────
  {
    id: 'content-technical-writer',
    title: 'Content Strategist & Technical Communications Specialist',
    category: 'Media & Communications',
    fieldIds: ['arts_social', 'engineering', 'pure_sciences'],
    eligibleDegrees: ['B.A.', 'M.A.', 'B.Sc', 'B.Tech'],
    eligibleDomains: ['Humanities & Social Sciences', 'Media & Communications'],
    eligibleSpecializations: ['Journalism & Mass Media', 'English Literature', 'Technical Communication'],
    requiredSkills: ['Public Speaking & Communication', 'Legal Drafting & Research', 'Digital Marketing & Analytics'],
    description: 'Creates technical documentation, brand narratives, whitepapers, and digital media communications.',
    skillGapsToDevelop: ['Technical API Documentation', 'SEO Strategy & Content Analytics', 'Content Operations'],
    nextSteps: ['Publish technical articles on Medium/Dev.to', 'Build a writing portfolio website'],
    careerType: 'DIRECT'
  },

  // ── Agriculture & Veterinary ───────────────────────────────────────────────
  {
    id: 'agricultural-scientist-agronomist',
    title: 'Agricultural Scientist & Agronomist',
    category: 'Agriculture & Agritech',
    fieldIds: ['agriculture'],
    eligibleDegrees: ['B.Sc Agri', 'M.Sc Agri', 'BVSc'],
    eligibleDomains: ['Agricultural Sciences', 'Veterinary Sciences'],
    eligibleSpecializations: ['Agronomy & Crop Science', 'Soil Science & Precision Agriculture', 'Horticulture'],
    requiredSkills: ['Precision Agriculture & GIS', 'Research Methodology & Lab Skills', 'Problem Solving & Logic'],
    description: 'Researches crop yields, soil management, sustainable farming methods, and agricultural technology.',
    skillGapsToDevelop: ['Remote Sensing & Drone Agritech', 'Soil Microbiome Analysis', 'Climate-Resilient Farming'],
    nextSteps: ['Conduct field trial research', 'Prepare for ICAR AIEEA PG entrance exam'],
    careerType: 'DIRECT'
  }
]

/**
 * Classifies a career into one of 4 strict eligibility tiers for a given student profile.
 *
 * Tiers:
 * 1. HIGHLY_ELIGIBLE (Direct academic match)
 * 2. CONTEXTUALLY_ELIGIBLE (Interdisciplinary / Adjacent with interest/skill evidence)
 * 3. CAREER_SWITCH (Cross-domain exploration requires explicit transition toggle/prereqs)
 * 4. INCOMPATIBLE (Academically incompatible & no evidence - GATED OUT)
 */
export function classifyCareerTier(career, normalizedProfile = {}) {
  const { canonicalFieldId, rawDegree, rawDomain, rawSpec, userSkills, academicInterests, careerInterests, hasTechSkills, hasHealthTechInterest, isExplicitCareerSwitch } = normalizedProfile

  // Check direct field match
  const isFieldMatch = career.fieldIds.includes(canonicalFieldId)

  // Check degree match
  const isDegreeMatch = career.eligibleDegrees.some(d =>
    rawDegree.includes(norm(d)) || norm(d).includes(rawDegree)
  )

  // Check domain match
  const isDomainMatch = career.eligibleDomains.some(dom =>
    rawDomain.includes(norm(dom)) || norm(dom).includes(rawDomain)
  )

  // Check specialization match
  const isSpecMatch = rawSpec ? career.eligibleSpecializations.some(s =>
    rawSpec.includes(norm(s)) || norm(s).includes(rawSpec)
  ) : false

  // Direct Academic Alignment
  if (isFieldMatch || isDegreeMatch || isDomainMatch || isSpecMatch) {
    if (career.careerType === 'INTERDISCIPLINARY') {
      return 'CONTEXTUALLY_ELIGIBLE'
    }
    return 'HIGHLY_ELIGIBLE'
  }

  // Interdisciplinary / Adjacent Match with evidence
  // E.g. BHMS + Healthcare Technology interest -> Healthcare Informatics
  if (canonicalFieldId === 'medicine' && career.id === 'healthcare-informatics-specialist' && (hasTechSkills || hasHealthTechInterest)) {
    return 'CONTEXTUALLY_ELIGIBLE'
  }

  if (canonicalFieldId === 'law' && career.id === 'cyber-lawyer-ipr-consultant') {
    return 'CONTEXTUALLY_ELIGIBLE'
  }

  if (canonicalFieldId === 'engineering' && (career.fieldIds.includes('management') || career.fieldIds.includes('commerce')) && (userSkills.some(s => s.includes('excel') || s.includes('finance') || s.includes('business')))) {
    return 'CONTEXTUALLY_ELIGIBLE'
  }

  // Check if student explicitly wants a career switch
  if (isExplicitCareerSwitch || careerInterests.some(ci => norm(career.title).includes(ci) || ci.includes(norm(career.title)))) {
    return 'CAREER_SWITCH'
  }

  // If none of the above match, the career is ACADEMICALLY INCOMPATIBLE!
  return 'INCOMPATIBLE'
}

/**
 * Calculates a honest relevance score (0-98%) AFTER eligibility gating.
 */
export function calculateCareerMatchScore(career, profile = {}) {
  const normProfile = normalizeAcademicProfile(profile)
  const tier = classifyCareerTier(career, normProfile)

  if (tier === 'INCOMPATIBLE') {
    return 0 // Hard Gate: 0% match score
  }

  let score = 50

  if (tier === 'HIGHLY_ELIGIBLE') {
    score = 78
    if (normProfile.rawSpec && career.eligibleSpecializations.some(s => normProfile.rawSpec.includes(norm(s)) || norm(s).includes(normProfile.rawSpec))) {
      score += 12
    }
    if (normProfile.rawDomain && career.eligibleDomains.some(d => normProfile.rawDomain.includes(norm(d)))) {
      score += 5
    }
  } else if (tier === 'CONTEXTUALLY_ELIGIBLE') {
    score = 68
    if (normProfile.hasTechSkills || normProfile.hasHealthTechInterest) {
      score += 8
    }
  } else if (tier === 'CAREER_SWITCH') {
    score = 55
    if (normProfile.hasTechSkills) score += 8
  }

  // Add skill bonus (up to 5 points) within eligible universe
  const matchedSkillsCount = career.requiredSkills.filter(reqSkill =>
    normProfile.userSkills.some(uSkill => uSkill.includes(norm(reqSkill)) || norm(reqSkill).includes(uSkill))
  ).length

  if (matchedSkillsCount > 0) {
    score += Math.min(5, matchedSkillsCount * 2)
  }

  return Math.min(98, Math.max(tier === 'CAREER_SWITCH' ? 50 : 65, Math.round(score)))
}

/**
 * Generates transparent, evidence-backed explanations for recommendations.
 */
export function generateCareerExplanation(career, profile = {}, tier = 'HIGHLY_ELIGIBLE') {
  const deg = profile.degreeProgramme || 'degree'
  const dom = profile.domain ? ` in ${profile.domain}` : ''
  const spec = profile.specialization ? ` specializing in ${profile.specialization}` : ''

  if (tier === 'HIGHLY_ELIGIBLE') {
    return `Your ${deg}${dom}${spec} directly aligns with clinical healthcare, medical practice, and core academic pathways.`
  }

  if (tier === 'CONTEXTUALLY_ELIGIBLE') {
    return `Your ${deg}${dom} background combined with your interest in Healthcare Technology & Analytics logically connects to this interdisciplinary role.`
  }

  if (tier === 'CAREER_SWITCH') {
    return `This role represents a cross-domain career transition. Recommended only as an optional transition pathway with required prerequisite learning.`
  }

  return `Evaluated for your academic background.`
}

/**
 * Main API: Returns Profile-Ranked & Tier-Categorized Career Recommendations for Step 5.
 *
 * @param {Object} profile - Student profile object
 * @returns {Array} Categorized array containing .recommendedPathways, .relatedDirections, .careerSwitches
 */
export function getPersonalizedCareerRecommendations(profile = {}) {
  const normProfile = normalizeAcademicProfile(profile)

  const ranked = COLLEGE_CAREER_CATALOG.map(career => {
    const tier = classifyCareerTier(career, normProfile)
    if (tier === 'INCOMPATIBLE') return null

    const matchScore = calculateCareerMatchScore(career, profile)
    const matchExplanation = generateCareerExplanation(career, profile, tier)

    const matchedSkills = (profile.skills || []).filter(uSkill =>
      career.requiredSkills.some(r => norm(r).includes(norm(uSkill)) || norm(uSkill).includes(norm(r)))
    )

    return {
      ...career,
      tier,
      matchScore,
      matchExplanation,
      matchedStrengths: matchedSkills.length ? matchedSkills : [profile.domain || profile.degreeProgramme || 'Academic Foundation']
    }
  }).filter(Boolean)

  // Sort descending by score
  ranked.sort((a, b) => b.matchScore - a.matchScore)

  const recommendedPathways = ranked.filter(c => c.tier === 'HIGHLY_ELIGIBLE')
  const relatedDirections = ranked.filter(c => c.tier === 'CONTEXTUALLY_ELIGIBLE')
  const careerSwitches = ranked.filter(c => c.tier === 'CAREER_SWITCH')

  // Maintain backward-compatible array signature while attaching structured tier properties
  const result = Object.assign([...ranked], {
    recommendedPathways,
    relatedDirections,
    careerSwitches
  })

  return result
}

/**
 * Returns Personalized Academic Focus Options tailored specifically for student's profile.
 *
 * @param {Object} profile - Student profile object
 * @returns {Array} List of academic focus option cards
 */
export function getPersonalizedAcademicFocusOptions(profile = {}) {
  const normProfile = normalizeAcademicProfile(profile)
  const fieldId = normProfile.canonicalFieldId

  if (fieldId === 'medicine') {
    return [
      { id: 'clinical-case-analysis', title: 'Clinical Case Analysis & Diagnostics', category: 'Clinical Focus', icon: 'FiHeart', desc: 'Diagnose medical case scenarios, study symptomatology, and review clinical pathology reports.' },
      { id: 'case-based-learning', title: 'Case-Based Medical & Ward Rounds', category: 'Academics', icon: 'FiBookOpen', desc: 'Participate in hospital clinical rounds, patient case presentations, and treatment plans.' },
      { id: 'clinical-research', title: 'Clinical Trial Research & Pharmacovigilance', category: 'Research', icon: 'FiActivity', desc: 'Study drug trial protocols, adverse drug reactions, and clinical epidemiology.' },
      { id: 'medical-entrance-prep', title: 'NEET-PG / USMLE / AYUSH PG Prep', category: 'Exam Focus', icon: 'FiAward', desc: 'Prepare for postgraduate medical licensing and specialization entrance examinations.' },
      { id: 'health-tech-informatics', title: 'Healthcare Technology & Digital Health', category: 'Innovation', icon: 'FiZap', desc: 'Explore Electronic Health Records (EHR), telemedicine platforms, and clinical data analytics.' }
    ]
  }

  if (fieldId === 'engineering') {
    return [
      { id: 'ai-projects', title: 'Applied Engineering & AI Projects', category: 'Project Work', icon: 'FiCpu', desc: 'Build production software, IoT prototypes, or AI applications.' },
      { id: 'hackathons', title: 'Hackathons & Coding Competitions', category: 'Competition', icon: 'FiZap', desc: 'Participate in national hackathons and competitive coding.' },
      { id: 'placement-prep', title: 'Internship & Placement Preparation', category: 'Career Prep', icon: 'FiBriefcase', desc: 'Master DSA, system design, mock interviews, and resume building.' },
      { id: 'open-source', title: 'Open-Source & GitHub Contributions', category: 'Development', icon: 'FiGlobe', desc: 'Contribute to public software repositories and developer tools.' },
      { id: 'research-pubs', title: 'Technical Research & Publications', category: 'Research', icon: 'FiBookOpen', desc: 'Write and publish technical papers in IEEE or Scopus journals.' },
      { id: 'higher-gate', title: 'GATE / M.Tech / MS Higher Studies', category: 'Academics', icon: 'FiAward', desc: 'Prepare for GATE exam or postgraduate research admissions.' }
    ]
  }

  if (fieldId === 'law') {
    return [
      { id: 'moot-court', title: 'Moot Court & Legal Advocacy Practice', category: 'Advocacy', icon: 'FiShield', desc: 'Participate in simulated appellate court arguments and mooting competitions.' },
      { id: 'legal-research', title: 'Legal Research & Statutory Analysis', category: 'Research', icon: 'FiBookOpen', desc: 'Analyze landmark court rulings, statutory compliance, and legal precedents.' },
      { id: 'judicial-prep', title: 'Judicial Services Examination Prep', category: 'Career Exam', icon: 'FiAward', desc: 'Prepare for state judicial magistrate entrance examinations.' },
      { id: 'legal-internship', title: 'Law Firm & Corporate Legal Internship', category: 'Career Prep', icon: 'FiBriefcase', desc: 'Gain real-world experience at corporate law firms and litigation chambers.' },
      { id: 'cyber-law', title: 'Cyber Law & Tech Policy Research', category: 'Specialization', icon: 'FiGlobe', desc: 'Research data privacy laws (DPDP/GDPR), AI ethics, and cyber litigation.' }
    ]
  }

  if (fieldId === 'commerce' || fieldId === 'management') {
    return [
      { id: 'business-cases', title: 'Business Case & Strategy Competitions', category: 'Strategy', icon: 'FiBriefcase', desc: 'Solve real-world corporate strategy, valuation, and marketing challenges.' },
      { id: 'fin-modeling', title: 'Financial Modeling & Valuation', category: 'Finance', icon: 'FiDollarSign', desc: 'Construct DCF models, company valuations, and financial dashboards.' },
      { id: 'cat-preparation', title: 'CAT / GMAT / CFA Exam Preparation', category: 'Exam Focus', icon: 'FiAward', desc: 'Prepare for top tier MBA entrance or professional CFA examinations.' },
      { id: 'internship-prep', title: 'Corporate Internship Readiness', category: 'Placement', icon: 'FiBriefcase', desc: 'Build case study interview skills and executive presentation skills.' },
      { id: 'analytics-dashboards', title: 'Business Analytics & Power BI', category: 'Analytics', icon: 'FiZap', desc: 'Master data visualization, SQL, and corporate data intelligence.' }
    ]
  }

  if (fieldId === 'pure_sciences') {
    return [
      { id: 'lab-research', title: 'Experimental Research & Lab Methodology', category: 'Research Focus', icon: 'FiBookOpen', desc: 'Conduct wet-lab experiments, chemical synthesis, or microbiological assays.' },
      { id: 'scientific-data', title: 'Scientific Data Computing & R/Python', category: 'Analytics', icon: 'FiCpu', desc: 'Process experimental datasets, statistical models, and scientific graphs.' },
      { id: 'csir-net-prep', title: 'CSIR-NET / GATE Fellowship Prep', category: 'Exam Focus', icon: 'FiAward', desc: 'Prepare for national eligibility tests for doctoral research fellowships.' }
    ]
  }

  if (fieldId === 'agriculture') {
    return [
      { id: 'agritech-projects', title: 'Precision Farming & Agritech Projects', category: 'Innovation', icon: 'FiSun', desc: 'Implement IoT sensors, GIS mapping, and automated irrigation models.' },
      { id: 'icar-exam-prep', title: 'ICAR AIEEA & Agronomy Fellowship Prep', category: 'Exam Focus', icon: 'FiAward', desc: 'Prepare for ICAR postgraduate entrance tests and agricultural research.' }
    ]
  }

  return [
    { id: 'industry-projects', title: 'Applied Academic Projects', category: 'Project Work', icon: 'FiBriefcase', desc: 'Build practical projects applying your degree concepts.' },
    { id: 'academic-research', title: 'Academic Research & Publications', category: 'Research', icon: 'FiBookOpen', desc: 'Conduct literature reviews and write academic research papers.' },
    { id: 'competitive-exams', title: 'Competitive Entrance Exams Prep', category: 'Exams', icon: 'FiAward', desc: 'Prepare for competitive post-graduate or career entrance tests.' },
    { id: 'internship-readiness', title: 'Internship Readiness & Placement Prep', category: 'Career', icon: 'FiTarget', desc: 'Prepare your resume, portfolio, and interview skills.' }
  ]
}
