/**
 * graduateSkillsCatalog.js
 * 
 * Dynamic catalog and relevance matching engine for Stage 2 Graduate Onboarding.
 * Computes tailored Technical Competencies, Tools & Platforms, and Core Professional Interests
 * based on Stage 1 inputs: Field, Degree, Domain/Specialization, and Employment Status.
 */

// ── 1. MASTER SKILL CONFIGURATION BY FIELD & DOMAIN ─────────────────────────

export const FIELD_CATALOG = {
  'Engineering & Technology': {
    defaultSkills: [
      'Python', 'Java', 'JavaScript', 'C/C++', 'SQL', 'React', 'Node.js',
      'Machine Learning', 'Data Analysis', 'HTML / CSS', 'AutoCAD', 'SolidWorks',
      'MATLAB', 'Embedded Systems', 'VLSI Design', 'Cloud (AWS / Azure)', 'Cybersecurity'
    ],
    defaultTools: [
      'Git / GitHub', 'VS Code', 'Linux / Bash', 'Docker', 'Postman',
      'Jupyter Notebook', 'AWS / Azure', 'Microsoft Excel', 'Jira'
    ],
    defaultInterests: [
      'Software Development', 'Data Analysis & AI', 'Product Development',
      'Cloud & DevOps', 'Cybersecurity', 'Core Engineering R&D',
      'Research & Academia', 'Entrepreneurship & Startups', 'Consulting'
    ],

    domains: {
      'Computer Science & Engineering': {
        skills: [
          'Python', 'Java', 'JavaScript', 'C/C++', 'SQL', 'React', 'Node.js',
          'Machine Learning', 'Data Analysis', 'HTML / CSS', 'Cloud (AWS / Azure)',
          'Cybersecurity', 'Docker & DevOps', 'APIs & Microservices', 'Data Structures & Algorithms'
        ],
        tools: [
          'Git / GitHub', 'VS Code', 'Linux / Bash', 'Docker', 'Postman',
          'Jupyter Notebook', 'AWS / Azure', 'Android Studio', 'IntelliJ IDEA', 'Jira'
        ],
        interests: [
          'Software Development', 'Data Analysis & AI', 'Product Development',
          'Cloud & DevOps', 'Cybersecurity', 'Research & Academia', 'Entrepreneurship & Startups', 'Consulting'
        ]
      },
      'Artificial Intelligence & Data Science': {
        skills: [
          'Python', 'SQL', 'Machine Learning', 'Deep Learning', 'Data Analysis',
          'Data Visualization', 'Pandas & NumPy', 'PyTorch / TensorFlow', 'Natural Language Processing (NLP)',
          'Big Data Analytics', 'R', 'Cloud (AWS / Azure)', 'APIs & Microservices'
        ],
        tools: [
          'Jupyter Notebook', 'Git / GitHub', 'VS Code', 'Power BI', 'Tableau',
          'Google Colab', 'AWS / Azure', 'Postman', 'Docker'
        ],
        interests: [
          'Data Analysis & AI', 'Machine Learning & Data Engineering', 'Software Development',
          'Product Development', 'Research & Academia', 'Consulting', 'Entrepreneurship & Startups'
        ]
      },
      'Information Technology': {
        skills: [
          'JavaScript', 'Python', 'Java', 'SQL', 'HTML / CSS', 'React', 'Node.js',
          'Database Management', 'Cloud (AWS / Azure)', 'Cybersecurity', 'System Administration',
          'Network Security', 'Web Development', 'Software Testing & QA'
        ],
        tools: [
          'Git / GitHub', 'VS Code', 'Postman', 'Linux / Bash', 'AWS / Azure',
          'Docker', 'Jira', 'Microsoft Excel'
        ],
        interests: [
          'Software Development', 'Cloud & DevOps', 'Cybersecurity', 'IT Management & Operations',
          'Product Development', 'Consulting', 'Entrepreneurship & Startups'
        ]
      },
      'Mechanical Engineering': {
        skills: [
          'AutoCAD', 'SolidWorks', 'MATLAB', 'CAD / CAM', 'Mechanical Design',
          '3D Modeling', 'Thermodynamics', 'Fluid Mechanics', 'CNC Machining',
          'GD&T', 'Finite Element Analysis (FEA)', 'Robotics & Automation', 'Manufacturing Engineering'
        ],
        tools: [
          'AutoCAD', 'SolidWorks', 'MATLAB', 'CATIA', 'ANSYS', 'Solid Edge',
          'Fusion 360', 'Microsoft Excel', 'Jira'
        ],
        interests: [
          'Core Engineering R&D', 'Product Development', 'Automotive & Aerospace',
          'Manufacturing & Operations', 'Robotics & Automation', 'Consulting', 'Research & Academia'
        ]
      },
      'Electrical & Electronics Engineering': {
        skills: [
          'C/C++', 'Circuit Design', 'MATLAB', 'Power Systems', 'Microcontrollers (ARM / Arduino)',
          'Control Systems', 'PLC & SCADA', 'Electrical Machine Design', 'Embedded Systems',
          'IoT (Internet of Things)', 'Power Electronics', 'Renewable Energy Systems'
        ],
        tools: [
          'MATLAB', 'Multisim', 'Proteus', 'KiCad', 'LabVIEW', 'Keil uVision',
          'Microsoft Excel', 'AutoCAD Electrical'
        ],
        interests: [
          'Power Systems & Energy', 'Core Engineering R&D', 'Embedded Systems & IoT',
          'Automation & Control', 'Product Development', 'Research & Academia'
        ]
      },
      'Electronics & Communication Engineering': {
        skills: [
          'C/C++', 'Embedded Systems', 'VLSI Design', 'MATLAB', 'Circuit Design',
          'Microcontrollers (ARM / ESP32)', 'PCB Design', 'Digital Signal Processing (DSP)',
          'Analog & Digital Electronics', 'IoT (Internet of Things)', 'Verilog / VHDL', 'Wireless Communication'
        ],
        tools: [
          'MATLAB', 'KiCad', 'Altium Designer', 'Keil uVision', 'LabVIEW',
          'Proteus', 'VS Code', 'Git / GitHub'
        ],
        interests: [
          'Embedded Systems & IoT', 'Semiconductors & VLSI', 'Telecommunication & Wireless',
          'Core Engineering R&D', 'Product Development', 'Research & Academia'
        ]
      },
      'Civil Engineering': {
        skills: [
          'AutoCAD', 'Structural Design', 'STAAD.Pro', 'Revit', 'Civil 3D',
          'Surveying & GIS', 'Construction Management', 'Quantity Estimation',
          'Concrete & Steel Design', 'Geotechnical Engineering', 'BIM (Building Information Modeling)'
        ],
        tools: [
          'AutoCAD', 'STAAD.Pro', 'Revit', 'Civil 3D', 'MS Project',
          'QGIS / ArcGIS', 'Primavera', 'Microsoft Excel'
        ],
        interests: [
          'Structural Engineering & Infrastructure', 'Construction Management', 'Urban Planning',
          'Smart Cities & Surveying', 'Government Sector & Civil Services', 'Consulting'
        ]
      }
    }
  },

  'Management & Commerce': {
    defaultSkills: [
      'Financial Modeling', 'Financial Analysis', 'Accounting', 'Tally & GST',
      'Business Analysis', 'Data Analysis', 'Microsoft Excel', 'Power BI',
      'Tableau', 'Digital Marketing', 'Market Research', 'Business Strategy',
      'Operations Management', 'Project Management', 'Business Communication', 'Taxation'
    ],
    defaultTools: [
      'Microsoft Excel', 'Tally & GST', 'Power BI', 'Tableau', 'SAP ERP',
      'QuickBooks', 'Google Sheets', 'Microsoft PowerPoint', 'Salesforce CRM'
    ],
    defaultInterests: [
      'Finance & Banking', 'Corporate Accounting', 'Management & Operations',
      'Marketing & Brand Management', 'Business Strategy', 'Consulting',
      'Entrepreneurship & Startups', 'Human Resources & Talent'
    ],

    domains: {
      'Finance & Accounting': {
        skills: [
          'Financial Modeling', 'Financial Analysis', 'Accounting & Bookkeeping',
          'Tally & GST', 'Corporate Finance', 'Taxation (Direct & Indirect)',
          'Auditing & Assurance', 'Investment Analysis', 'Risk Management',
          'Cost Accounting', 'Data Analysis', 'Equity Research'
        ],
        tools: [
          'Microsoft Excel', 'Tally & GST', 'Power BI', 'Tableau', 'SAP ERP',
          'QuickBooks', 'Google Sheets', 'SPSS'
        ],
        interests: [
          'Finance & Banking', 'Corporate Accounting', 'Auditing & Taxation',
          'Investment Banking & Wealth Management', 'Financial Consulting', 'Risk & Compliance'
        ]
      },
      'Business Analytics': {
        skills: [
          'Data Analysis', 'Business Intelligence', 'SQL', 'Power BI', 'Tableau',
          'Python for Business', 'Statistical Analysis', 'Predictive Modeling',
          'Excel Dashboarding', 'Market Research', 'Process Optimization'
        ],
        tools: [
          'Microsoft Excel', 'Power BI', 'Tableau', 'SQL Workbench', 'Python / Jupyter',
          'Google Analytics', 'Jira'
        ],
        interests: [
          'Business Analytics & Data', 'Management & Operations', 'Product Management',
          'Business Strategy', 'Consulting', 'Entrepreneurship & Startups'
        ]
      },
      'Humanities & Social Sciences': {
        skills: [
          'Business Communication', 'Human Resource Management', 'Organizational Behavior',
          'Talent Acquisition', 'Project Management', 'Market Research', 'Content Strategy'
        ],
        tools: [
          'Microsoft Excel', 'Microsoft PowerPoint', 'Canva', 'Google Workspace', 'LinkedIn Recruiter'
        ],
        interests: [
          'Human Resources & Talent', 'Management & Operations', 'Corporate Communications',
          'Consulting', 'Non-Profit & NGO Sector'
        ]
      }
    }
  },

  'Medical & Health Sciences': {
    defaultSkills: [
      'Clinical Research', 'Patient Care', 'Medical Documentation', 'Medical Coding',
      'Pharmacology', 'Anatomy & Physiology', 'Pathology', 'Clinical Biochemistry',
      'Public Health', 'Healthcare Management', 'Medical Data Analysis', 'Emergency Care'
    ],
    defaultTools: [
      'Electronic Health Records (EHR)', 'PubMed / Medline', 'SPSS', 'Microsoft Word',
      'Microsoft Excel', 'GraphPad Prism', 'Clinical Trial Management'
    ],
    defaultInterests: [
      'Clinical Practice', 'Medical Research & Academia', 'Public Health & Epidemiology',
      'Healthcare Administration & Management', 'Pharmaceutical R&D', 'Health Informatics'
    ],

    domains: {}
  },

  'Pure & Applied Sciences': {
    defaultSkills: [
      'Python', 'R', 'MATLAB', 'Data Analysis', 'Statistics', 'Scientific Computing',
      'Research Methodology', 'Laboratory Techniques', 'Numerical Analysis',
      'Mathematical Modeling', 'Machine Learning', 'Bioinformatics', 'Experimental Design'
    ],
    defaultTools: [
      'MATLAB', 'Python', 'Jupyter Notebook', 'RStudio', 'SPSS', 'OriginLab',
      'LaTeX', 'Microsoft Excel', 'GraphPad Prism'
    ],
    defaultInterests: [
      'Research & Academia', 'Scientific R&D', 'Data Science & Analytics',
      'Biotechnology & Bio-research', 'Teaching & Education', 'Government R&D Labs'
    ],

    domains: {}
  },

  'Arts, Humanities & Social Sciences': {
    defaultSkills: [
      'Research & Academic Writing', 'Content Writing', 'Creative Writing',
      'Public Speaking & Communication', 'Social Research', 'Qualitative Research',
      'Quantitative Research', 'Digital Media', 'Journalism & Reporting', 'Policy Research',
      'Editing & Documentation', 'Event Management'
    ],
    defaultTools: [
      'Microsoft Word', 'Microsoft PowerPoint', 'Canva', 'Google Workspace',
      'Figma', 'SPSS', 'NVivo', 'WordPress'
    ],
    defaultInterests: [
      'Content & Digital Media', 'Public Policy & Social Research', 'Teaching & Academia',
      'Civil Services & Public Administration', 'Psychology & Counseling',
      'Corporate Communications', 'Non-Profit & NGO Sector'
    ],

    domains: {}
  },

  'Law & Legal Studies': {
    defaultSkills: [
      'Legal Research', 'Legal & Contract Drafting', 'Case Analysis',
      'Legal Documentation', 'Litigation Strategy', 'Corporate Law',
      'Constitutional Law', 'Intellectual Property', 'Compliance & Regulatory',
      'Arbitration & Mediation', 'Negotiation'
    ],
    defaultTools: [
      'Manupatra / SCC Online', 'Microsoft Word', 'PDF Editing Tools',
      'Microsoft Excel', 'Document Management Systems', 'Microsoft PowerPoint'
    ],
    defaultInterests: [
      'Litigation & Court Practice', 'Corporate Law & Compliance', 'Legal Consulting',
      'Judicial Services', 'Intellectual Property & Patents', 'Public Policy & Human Rights',
      'Legal Research & Academia'
    ],

    domains: {}
  },

  'Agriculture & Veterinary': {
    defaultSkills: [
      'Agricultural Research', 'Crop Management & Agronomy', 'Soil Science & Fertility',
      'Horticulture', 'Plant Pathology', 'Precision Agriculture & GIS', 'Animal Health & Nutrition',
      'Veterinary Clinical Diagnostics', 'Livestock Management', 'Food Safety & Quality'
    ],
    defaultTools: [
      'QGIS / ArcGIS', 'Microsoft Excel', 'Remote Sensing Tools', 'SPSS',
      'Python', 'Farm Management Software'
    ],
    defaultInterests: [
      'Agribusiness & Agri-Tech', 'Agricultural R&D', 'Veterinary Practice & Clinical Care',
      'Rural Development & Extension', 'Food Industry & Quality Assurance',
      'Environmental Sustainability & Forestry'
    ],

    domains: {}
  }
};

// ── 2. DEGREE SPECIFIC OVERRIDES ────────────────────────────────────────────

export const DEGREE_PRIORITIES = {
  'BCA (Bachelor of Computer Applications)': {
    extraSkills: ['Python', 'Java', 'JavaScript', 'C/C++', 'SQL', 'HTML / CSS', 'React', 'Node.js', 'Web Development', 'Database Management'],
    extraTools: ['Git / GitHub', 'VS Code', 'Linux / Bash', 'Postman'],
    extraInterests: ['Software Development', 'Data Analysis & AI', 'Cloud & DevOps']
  },
  'B.Com (Bachelor of Commerce)': {
    extraSkills: ['Accounting', 'Tally & GST', 'Financial Analysis', 'Financial Modeling', 'Taxation', 'Auditing', 'Excel', 'Corporate Finance'],
    extraTools: ['Microsoft Excel', 'Tally & GST', 'Power BI'],
    extraInterests: ['Finance & Banking', 'Corporate Accounting', 'Auditing & Taxation']
  },
  'BBA / BMS (Business Administration)': {
    extraSkills: ['Business Analysis', 'Excel', 'Power BI', 'Digital Marketing', 'Market Research', 'Project Management', 'Operations Management', 'Sales & CRM'],
    extraTools: ['Microsoft Excel', 'Power BI', 'Salesforce CRM', 'Canva'],
    extraInterests: ['Management & Operations', 'Marketing & Brand Management', 'Business Strategy', 'Consulting']
  },
  'MBBS / BDS / B.Pharm (Health Sciences)': {
    extraSkills: ['Clinical Research', 'Patient Care', 'Pharmacology', 'Anatomy & Physiology', 'Medical Documentation', 'Clinical Diagnostics'],
    extraTools: ['Electronic Health Records (EHR)', 'PubMed / Medline', 'SPSS'],
    extraInterests: ['Clinical Practice', 'Medical Research & Academia', 'Pharmaceutical R&D']
  }
};

// ── 3. DYNAMIC RELEVANCE ENGINE METHOD ──────────────────────────────────────

/**
 * Returns dynamic Stage 2 options tailored to Stage 1 form state.
 *
 * @param {Object} stage1Data
 * @param {string} stage1Data.field
 * @param {string} stage1Data.degree
 * @param {string} stage1Data.domain
 * @param {string} stage1Data.specialization
 * @param {string} stage1Data.employmentStatus
 * @returns {{ technicalSkills: string[], tools: string[], interests: string[] }}
 */
export function getDynamicStage2Options(stage1Data = {}) {
  const {
    field = 'Engineering & Technology',
    degree = '',
    domain = '',
    specialization = '',
    employmentStatus = ''
  } = stage1Data;

  const fieldData = FIELD_CATALOG[field] || FIELD_CATALOG['Engineering & Technology'];

  // Start with field defaults
  let skillSet = new Set(fieldData.defaultSkills || []);
  let toolSet = new Set(fieldData.defaultTools || []);
  let interestSet = new Set(fieldData.defaultInterests || []);

  // Check domain / branch matching inside field
  if (domain && fieldData.domains && fieldData.domains[domain]) {
    const dObj = fieldData.domains[domain];
    if (dObj.skills) dObj.skills.forEach(s => skillSet.add(s));
    if (dObj.tools) dObj.tools.forEach(t => toolSet.add(t));
    if (dObj.interests) dObj.interests.forEach(i => interestSet.add(i));
  }

  // Check degree priorities
  if (degree && DEGREE_PRIORITIES[degree]) {
    const degObj = DEGREE_PRIORITIES[degree];
    if (degObj.extraSkills) degObj.extraSkills.forEach(s => skillSet.add(s));
    if (degObj.extraTools) degObj.extraTools.forEach(t => toolSet.add(t));
    if (degObj.extraInterests) degObj.extraInterests.forEach(i => interestSet.add(i));
  }

  // Specialization text matching logic (e.g. if user wrote "Machine Learning", "Civil", "Finance", "AI")
  if (specialization) {
    const specLower = specialization.toLowerCase();
    if (specLower.includes('ai') || specLower.includes('data') || specLower.includes('machine learning')) {
      ['Python', 'Machine Learning', 'Data Analysis', 'SQL', 'Data Visualization'].forEach(s => skillSet.add(s));
      ['Jupyter Notebook', 'Power BI', 'Tableau'].forEach(t => toolSet.add(t));
      ['Data Analysis & AI'].forEach(i => interestSet.add(i));
    }
    if (specLower.includes('vlsi') || specLower.includes('embedded') || specLower.includes('iot')) {
      ['Embedded Systems', 'VLSI Design', 'Circuit Design', 'Microcontrollers (ARM / ESP32)', 'C/C++'].forEach(s => skillSet.add(s));
      ['KiCad', 'Altium Designer', 'Keil uVision'].forEach(t => toolSet.add(t));
    }
    if (specLower.includes('cad') || specLower.includes('design') || specLower.includes('solidworks')) {
      ['AutoCAD', 'SolidWorks', '3D Modeling', 'Mechanical Design'].forEach(s => skillSet.add(s));
    }
    if (specLower.includes('finance') || specLower.includes('tax') || specLower.includes('fintech')) {
      ['Financial Modeling', 'Financial Analysis', 'Tally & GST', 'Taxation', 'Corporate Finance'].forEach(s => skillSet.add(s));
      ['Microsoft Excel', 'Tally & GST', 'Power BI'].forEach(t => toolSet.add(t));
      ['Finance & Banking'].forEach(i => interestSet.add(i));
    }
  }

  // Employment status influences
  if (employmentStatus) {
    const empLower = employmentStatus.toLowerCase();
    if (empLower.includes('higher studies')) {
      ['Research Methodology', 'Data Analysis', 'Academic Writing'].forEach(s => skillSet.add(s));
      ['SPSS', 'LaTeX', 'Microsoft Word'].forEach(t => toolSet.add(t));
      ['Research & Academia'].forEach(i => interestSet.add(i));
    }
    if (empLower.includes('competitive exam')) {
      ['General Aptitude & Reasoning', 'Data Interpretation', 'Analytical Thinking'].forEach(s => skillSet.add(s));
      ['Civil Services & Public Administration', 'Government Sector & Civil Services'].forEach(i => interestSet.add(i));
    }
    if (empLower.includes('employed') || empLower.includes('career switch')) {
      ['Cloud (AWS / Azure)', 'Project Management', 'Business Analytics', 'Leadership'].forEach(s => skillSet.add(s));
      ['Jira', 'Docker', 'AWS / Azure'].forEach(t => toolSet.add(t));
    }
  }

  return {
    technicalSkills: Array.from(skillSet),
    tools: Array.from(toolSet),
    interests: Array.from(interestSet)
  };
}
