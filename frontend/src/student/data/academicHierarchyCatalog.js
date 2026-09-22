/**
 * academicHierarchyCatalog.js
 * 
 * Centralized, dynamic academic catalog establishing strict hierarchical relationships:
 * Major Academic Field → Degree Qualification → Domain / Branch → Specialization / Elective.
 */

export const MAJOR_FIELDS = [
  'Engineering & Technology',
  'Management & Commerce',
  'Medical & Health Sciences',
  'Pure & Applied Sciences',
  'Arts, Humanities & Social Sciences',
  'Law & Legal Studies',
  'Agriculture & Veterinary'
];

export const ACADEMIC_HIERARCHY = {
  'Engineering & Technology': {
    degrees: [
      'B.E. / B.Tech (Bachelor of Engineering/Technology)',
      'BCA (Bachelor of Computer Applications)',
      'Polytechnic Diploma Completed',
      'Integrated Master / Postgraduate Degree',
      'Other'
    ],
    domainsByDegree: {
      'B.E. / B.Tech (Bachelor of Engineering/Technology)': [
        'Computer Science & Engineering',
        'Information Technology',
        'Artificial Intelligence & Data Science',
        'Artificial Intelligence & Machine Learning',
        'Electronics & Communication Engineering',
        'Electrical & Electronics Engineering',
        'Mechanical Engineering',
        'Civil Engineering',
        'Automobile Engineering',
        'Aerospace Engineering',
        'Chemical Engineering',
        'Biotechnology',
        'Biomedical Engineering',
        'Mechatronics Engineering',
        'Robotics & Automation',
        'Other'
      ],
      'BCA (Bachelor of Computer Applications)': [
        'Computer Applications',
        'Software Development',
        'Web Development',
        'Application Development',
        'Data Science',
        'Artificial Intelligence',
        'Cybersecurity',
        'Cloud Computing',
        'Database Systems',
        'Other'
      ],
      'Polytechnic Diploma Completed': [
        'Diploma in Computer Engineering',
        'Diploma in Electronics & Communication',
        'Diploma in Mechanical Engineering',
        'Diploma in Electrical Engineering',
        'Diploma in Civil Engineering',
        'Diploma in Automobile Engineering',
        'Other'
      ],
      'Integrated Master / Postgraduate Degree': [
        'Integrated M.Tech in Computer Science',
        'Integrated M.Tech in Software Engineering',
        'Integrated M.Tech in Data Science',
        'Integrated M.Tech in VLSI Design',
        'Other'
      ],
      'Other': ['Other']
    }
  },

  'Management & Commerce': {
    degrees: [
      'B.Com (Bachelor of Commerce)',
      'BBA / BMS (Business Administration)',
      'Integrated Master / Postgraduate Degree',
      'Other'
    ],
    domainsByDegree: {
      'B.Com (Bachelor of Commerce)': [
        'Accounting',
        'Finance',
        'Banking',
        'Taxation',
        'Commerce',
        'Corporate Accounting',
        'Financial Management',
        'Business Analytics',
        'International Business',
        'Other'
      ],
      'BBA / BMS (Business Administration)': [
        'Finance',
        'Marketing',
        'Human Resources',
        'Operations Management',
        'Business Analytics',
        'International Business',
        'Entrepreneurship',
        'Supply Chain Management',
        'General Management',
        'Other'
      ],
      'Integrated Master / Postgraduate Degree': [
        'Integrated MBA',
        'Integrated M.Com',
        'Other'
      ],
      'Other': ['Other']
    }
  },

  'Medical & Health Sciences': {
    degrees: [
      'MBBS (Bachelor of Medicine & Surgery)',
      'BDS (Bachelor of Dental Surgery)',
      'B.Pharm (Bachelor of Pharmacy)',
      'B.Sc Nursing / Allied Health Sciences',
      'Integrated Master / Postgraduate Degree',
      'Other'
    ],
    domainsByDegree: {
      'MBBS (Bachelor of Medicine & Surgery)': [
        'General Medicine',
        'Surgery',
        'Pediatrics',
        'Obstetrics & Gynecology',
        'Psychiatry',
        'Dermatology',
        'Radiology',
        'Anesthesiology',
        'Emergency Medicine',
        'Public Health',
        'Medical Research',
        'Other'
      ],
      'BDS (Bachelor of Dental Surgery)': [
        'General Dentistry',
        'Oral Surgery',
        'Orthodontics',
        'Prosthodontics',
        'Periodontics',
        'Endodontics',
        'Pediatric Dentistry',
        'Oral Pathology',
        'Public Health Dentistry',
        'Other'
      ],
      'B.Pharm (Bachelor of Pharmacy)': [
        'Pharmaceutics',
        'Pharmacology',
        'Pharmaceutical Chemistry',
        'Pharmacognosy',
        'Clinical Pharmacy',
        'Industrial Pharmacy',
        'Drug Research',
        'Regulatory Affairs',
        'Quality Assurance',
        'Other'
      ],
      'B.Sc Nursing / Allied Health Sciences': [
        'Nursing',
        'Medical Laboratory Technology',
        'Physiotherapy',
        'Radiography & Imaging',
        'Optometry',
        'Clinical Psychology',
        'Other'
      ],
      'Integrated Master / Postgraduate Degree': [
        'Integrated M.Sc Medical Sciences',
        'Integrated MD / MS',
        'Other'
      ],
      'Other': ['Other']
    }
  },

  'Pure & Applied Sciences': {
    degrees: [
      'B.Sc (Bachelor of Science)',
      'Integrated Master / Postgraduate Degree',
      'Other'
    ],
    domainsByDegree: {
      'B.Sc (Bachelor of Science)': [
        'Physics',
        'Chemistry',
        'Mathematics',
        'Biology / Biological Sciences',
        'Computer Science',
        'Statistics',
        'Biotechnology',
        'Microbiology',
        'Biochemistry',
        'Environmental Science',
        'Geology',
        'Electronics',
        'Data Science',
        'Other'
      ],
      'Integrated Master / Postgraduate Degree': [
        'Integrated M.Sc Physics',
        'Integrated M.Sc Chemistry',
        'Integrated M.Sc Mathematics',
        'Integrated M.Sc Biotechnology',
        'Other'
      ],
      'Other': ['Other']
    }
  },

  'Arts, Humanities & Social Sciences': {
    degrees: [
      'B.A. (Bachelor of Arts)',
      'Integrated Master / Postgraduate Degree',
      'Other'
    ],
    domainsByDegree: {
      'B.A. (Bachelor of Arts)': [
        'English',
        'Economics',
        'Psychology',
        'Sociology',
        'Political Science',
        'History',
        'Geography',
        'Philosophy',
        'Journalism',
        'Mass Communication',
        'Public Administration',
        'Social Work',
        'Languages',
        'International Relations',
        'Other'
      ],
      'Integrated Master / Postgraduate Degree': [
        'Integrated M.A. Development Studies',
        'Integrated M.A. Humanities',
        'Other'
      ],
      'Other': ['Other']
    }
  },

  'Law & Legal Studies': {
    degrees: [
      'LL.B. (Bachelor of Laws)',
      'B.A. LL.B. / B.B.A. LL.B. (Integrated Law)',
      'Integrated Master / Postgraduate Degree',
      'Other'
    ],
    domainsByDegree: {
      'LL.B. (Bachelor of Laws)': [
        'Corporate Law',
        'Criminal Law',
        'Civil Law',
        'Constitutional Law',
        'Intellectual Property Law',
        'Tax Law',
        'Labour Law',
        'Environmental Law',
        'International Law',
        'Cyber Law',
        'Family Law',
        'Human Rights',
        'Legal Compliance',
        'Other'
      ],
      'B.A. LL.B. / B.B.A. LL.B. (Integrated Law)': [
        'Corporate Law & Business Governance',
        'Constitutional & Administrative Law',
        'Criminal Justice & Criminology',
        'Intellectual Property & Technology Law',
        'International Law & Human Rights',
        'Other'
      ],
      'Integrated Master / Postgraduate Degree': [
        'Integrated LL.M.',
        'Other'
      ],
      'Other': ['Other']
    }
  },

  'Agriculture & Veterinary': {
    degrees: [
      'B.Sc (Hons) Agriculture',
      'B.V.Sc & A.H. (Veterinary Science)',
      'B.Tech Agricultural Engineering',
      'Integrated Master / Postgraduate Degree',
      'Other'
    ],
    domainsByDegree: {
      'B.Sc (Hons) Agriculture': [
        'Agronomy',
        'Horticulture',
        'Soil Science',
        'Agricultural Economics',
        'Plant Pathology',
        'Entomology',
        'Agribusiness',
        'Other'
      ],
      'B.V.Sc & A.H. (Veterinary Science)': [
        'Veterinary Medicine',
        'Veterinary Surgery',
        'Animal Science',
        'Livestock Management',
        'Animal Nutrition',
        'Dairy Science',
        'Other'
      ],
      'B.Tech Agricultural Engineering': [
        'Farm Machinery & Power Engineering',
        'Soil & Water Conservation',
        'Food & Process Engineering',
        'Irrigation & Drainage Engineering',
        'Other'
      ],
      'Integrated Master / Postgraduate Degree': [
        'Integrated M.Sc Agriculture',
        'Other'
      ],
      'Other': ['Other']
    }
  }
};

export const SPECIALIZATION_CATALOG = {
  'Computer Science & Engineering': [
    'Artificial Intelligence & Machine Learning',
    'Data Science & Analytics',
    'Cybersecurity & Ethical Hacking',
    'Cloud Computing & DevOps',
    'Full Stack Web Development',
    'Mobile Application Development',
    'Software Engineering & Testing',
    'Internet of Things (IoT)',
    'Blockchain & Cryptography',
    'Natural Language Processing',
    'Other'
  ],
  'Electronics & Communication Engineering': [
    'VLSI & Microelectronics',
    'Embedded Systems & Firmware',
    'IoT & Sensor Networks',
    'Communication Systems & RF',
    'Digital Signal Processing',
    'Robotics & Industrial Automation',
    'Wireless Networks (5G/6G)',
    'Other'
  ],
  'Mechanical Engineering': [
    'CAD / CAM & Product Design',
    'Automotive Engineering',
    'Robotics & Mechatronics',
    'Manufacturing & Industrial Engineering',
    'Thermal & Fluid Engineering',
    'Finite Element Analysis (FEA)',
    'Other'
  ],
  'Civil Engineering': [
    'Structural Engineering',
    'Construction Management',
    'Geotechnical & Foundation Engineering',
    'Transportation & Highway Engineering',
    'Environmental Engineering',
    'Urban Planning & GIS',
    'Building Information Modeling (BIM)',
    'Other'
  ],
  'Accounting': [
    'Financial Modeling & Forecasting',
    'Direct & Indirect Taxation (GST)',
    'Corporate Auditing & Assurance',
    'Management Accounting & Costing',
    'Fintech & Digital Banking',
    'Other'
  ],
  'Finance': [
    'Corporate Finance & Valuation',
    'Investment Banking & Equity Research',
    'Risk Management & Derivatives',
    'Fintech & Financial Analytics',
    'Portfolio & Wealth Management',
    'Other'
  ],
  'Marketing': [
    'Digital Marketing & SEO/SEM',
    'Brand Management & Strategy',
    'Marketing Analytics & Insights',
    'E-Commerce & Retail Strategy',
    'Content & Social Media Marketing',
    'Other'
  ],
  'General Medicine': [
    'Internal Medicine',
    'Clinical Cardiology',
    'Critical & Emergency Care',
    'Medical Research & Epidemiology',
    'Public Health & Preventive Medicine',
    'Other'
  ],
  'Pharmaceutics': [
    'Industrial Pharmacy & Formulations',
    'Clinical Pharmacy & Pharmacovigilance',
    'Regulatory Affairs & Quality Assurance',
    'Drug Discovery & Development',
    'Other'
  ],
  'Physics': [
    'Applied & Experimental Physics',
    'Astrophysics & Cosmology',
    'Condensed Matter & Nanoscience',
    'Computational & Theoretical Physics',
    'Other'
  ],
  'Chemistry': [
    'Organic & Medicinal Chemistry',
    'Analytical Chemistry & Instrumentation',
    'Physical & Quantum Chemistry',
    'Material Science & Polymer Chemistry',
    'Other'
  ],
  'English': [
    'Literature & Cultural Studies',
    'Linguistics & Applied Phonetics',
    'Technical & Business Writing',
    'Media Communication & Journalism',
    'Other'
  ],
  'Economics': [
    'Applied Microeconomics & Macroeconomics',
    'Econometrics & Quantitative Economics',
    'Financial Economics & Banking',
    'Development Economics & Public Policy',
    'Other'
  ],
  'Psychology': [
    'Clinical & Counseling Psychology',
    'Organizational & Industrial Psychology',
    'Cognitive & Behavioral Neuroscience',
    'Child & Educational Psychology',
    'Other'
  ]
};

/**
 * Returns available degrees for a selected field.
 */
export function getDegreesForField(field) {
  if (!field || !ACADEMIC_HIERARCHY[field]) return [];
  return ACADEMIC_HIERARCHY[field].degrees || [];
}

/**
 * Returns available domains/branches for a selected field + degree combination.
 */
export function getDomainsForDegree(field, degree) {
  if (!field || !degree || !ACADEMIC_HIERARCHY[field]) return [];
  const domainsMap = ACADEMIC_HIERARCHY[field].domainsByDegree || {};
  return domainsMap[degree] || ['General / Core Domain', 'Other'];
}

/**
 * Returns specializations for a selected domain/branch.
 */
export function getSpecializationsForDomain(domain) {
  if (!domain) return [];
  if (SPECIALIZATION_CATALOG[domain]) {
    return SPECIALIZATION_CATALOG[domain];
  }
  return [
    'General Specialization',
    'Applied Practice',
    'Research & Honors',
    'Other'
  ];
}
