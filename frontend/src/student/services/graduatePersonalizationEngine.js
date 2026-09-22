/**
 * graduatePersonalizationEngine.js
 * 
 * Central Graduate Personalization Engine.
 * Single source of truth client-side intelligence module that consumes the complete
 * Graduate Profile to generate explainable, profile-driven recommendations across
 * all Graduate pages: Careers, Skill Gap, Roadmap, Exams, Higher Studies, Resume,
 * Interview Prep, Placement, and AI Advisor.
 */

import { getDynamicStage2Options } from '../data/graduateSkillsCatalog';
import { resolveCourseImage } from './graduateCourseImageResolver';
import { resolveExamImage } from './graduateExamImageResolver';

/**
 * Calculates itemized profile completion breakdown and overall score.
 */
export function calculateProfileCompletionScore(profile = {}) {
  const items = [
    { key: 'field', label: 'Major Academic Field', completed: !!profile.field, score: 10 },
    { key: 'degree', label: 'Degree Qualification', completed: !!profile.degree, score: 15 },
    { key: 'domain', label: 'Domain / Branch', completed: !!profile.domain, score: 15 },
    { key: 'specialization', label: 'Specialization / Elective', completed: !!profile.specialization, score: 10 },
    { key: 'college', label: 'College / Institution', completed: !!profile.college, score: 10 },
    { key: 'technicalSkills', label: 'Technical Competencies', completed: Array.isArray(profile.technicalSkills) && profile.technicalSkills.length > 0, score: 15 },
    { key: 'tools', label: 'Tools & Platforms', completed: Array.isArray(profile.tools) && profile.tools.length > 0, score: 5 },
    { key: 'interests', label: 'Professional Interests', completed: Array.isArray(profile.interests) && profile.interests.length > 0, score: 5 },
    { key: 'primaryCareerDirection', label: 'Primary Career Direction', completed: !!profile.primaryCareerDirection, score: 10 },
    { key: 'onboardingCompleted', label: 'Onboarding Finalized', completed: !!profile.onboardingCompleted, score: 5 }
  ];

  const totalScore = items.reduce((sum, item) => sum + (item.completed ? item.score : 0), 0);
  return {
    percentage: Math.min(100, totalScore),
    items
  };
}

/**
 * Returns canonical effective academic hierarchy text.
 */
export function getEffectiveAcademicHierarchy(profile = {}) {
  const field = profile.field || 'Engineering & Technology';
  const degree = profile.degree === 'Other' ? (profile.customDegree || 'Custom Degree') : (profile.degree || 'Degree');
  const domain = profile.domain === 'Other' ? (profile.customDomain || 'Custom Domain') : (profile.domain || 'Domain');
  const spec = profile.specialization === 'Other' ? (profile.customSpecialization || 'Custom Specialization') : (profile.specialization || '');

  return {
    field,
    degree,
    domain,
    specialization: spec,
    mostSpecificLabel: spec || domain || degree || field,
    fullHierarchyText: `${degree} in ${domain}${spec ? ` (${spec})` : ''}`
  };
}

/**
 * Master Career Catalog for Graduate Recommendations.
 */
export const GRADUATE_CAREER_CATALOG = [
  {
    title: 'Full Stack Software Engineer',
    category: 'Software & Computing',
    description: 'Architects and builds web & enterprise applications using modern frontend frameworks and robust backend microservices.',
    requiredSkills: ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git / GitHub', 'REST APIs', 'Docker'],
    requiredDomains: ['Computer Science & Engineering', 'Information Technology', 'Software Development', 'Computer Applications'],
    growthOutlook: 'Very High Demand'
  },
  {
    title: 'Data Analyst & BI Specialist',
    category: 'AI & Data Science',
    description: 'Transforms raw business and technical data into actionable intelligence dashboards and statistical insights.',
    requiredSkills: ['Python', 'SQL', 'Power BI', 'Microsoft Excel', 'Data Analysis', 'Tableau', 'Statistics'],
    requiredDomains: ['Computer Science & Engineering', 'Artificial Intelligence & Data Science', 'Business Analytics', 'Finance & Accounting', 'Mathematics', 'Statistics'],
    growthOutlook: 'High Demand'
  },
  {
    title: 'AI / Machine Learning Engineer',
    category: 'AI & Data Science',
    description: 'Develops predictive algorithms, deep learning models, and intelligent AI automation pipelines.',
    requiredSkills: ['Python', 'Machine Learning', 'Deep Learning', 'SQL', 'Data Analysis', 'Jupyter Notebook', 'Cloud (AWS / Azure)'],
    requiredDomains: ['Artificial Intelligence & Data Science', 'Computer Science & Engineering', 'Data Science', 'Mathematics'],
    growthOutlook: 'Exponential Growth'
  },
  {
    title: 'Mechanical Design & Simulation Specialist',
    category: 'Core Engineering',
    description: 'Engineers 3D mechanical assemblies, Finite Element Analysis (FEA), and CAD simulations for industrial products.',
    requiredSkills: ['AutoCAD', 'SolidWorks', 'MATLAB', 'CAD / CAM', 'Mechanical Design', '3D Modeling', 'Finite Element Analysis (FEA)'],
    requiredDomains: ['Mechanical Engineering', 'Automobile Engineering', 'Aerospace Engineering', 'Mechatronics Engineering'],
    growthOutlook: 'Steady High Demand'
  },
  {
    title: 'Embedded Systems & IoT Hardware Engineer',
    category: 'Core Engineering',
    description: 'Designs firmware microcontrollers, PCB circuits, and IoT sensor platforms for smart embedded hardware.',
    requiredSkills: ['C/C++', 'Embedded Systems', 'VLSI Design', 'MATLAB', 'Circuit Design', 'Microcontrollers (ARM / ESP32)', 'PCB Design'],
    requiredDomains: ['Electronics & Communication Engineering', 'Electrical & Electronics Engineering', 'Mechatronics Engineering'],
    growthOutlook: 'High Growth'
  },
  {
    title: 'Corporate Financial & Investment Analyst',
    category: 'Management & Finance',
    description: 'Executes financial modeling, corporate valuation, direct taxation strategies, and financial risk forecasting.',
    requiredSkills: ['Financial Modeling', 'Financial Analysis', 'Accounting', 'Tally & GST', 'Taxation', 'Microsoft Excel', 'Power BI'],
    requiredDomains: ['Finance & Accounting', 'Accounting', 'Finance', 'Commerce', 'Financial Management'],
    growthOutlook: 'High Demand'
  },
  {
    title: 'Digital Marketing & Brand Strategist',
    category: 'Management & Marketing',
    description: 'Leads digital growth campaigns, SEO/SEM analytics, social media marketing, and market research.',
    requiredSkills: ['Digital Marketing', 'Market Research', 'Content Strategy', 'Google Analytics', 'Canva', 'SEO / SEM', 'Business Communication'],
    requiredDomains: ['Marketing', 'Business Administration', 'Commerce', 'Mass Communication', 'Humanities'],
    growthOutlook: 'High Demand'
  },
  {
    title: 'Clinical Data & Medical Research Specialist',
    category: 'Medical & Healthcare',
    description: 'Manages clinical trial documentation, medical research protocols, and healthcare quality compliance.',
    requiredSkills: ['Clinical Research', 'Medical Documentation', 'Pharmacology', 'Patient Care', 'Electronic Health Records (EHR)', 'SPSS'],
    requiredDomains: ['General Medicine', 'Pharmacy', 'Pharmaceutics', 'Clinical Sciences', 'Nursing', 'Public Health'],
    growthOutlook: 'High Demand'
  },
  {
    title: 'Corporate Legal & Compliance Consultant',
    category: 'Law & Legal Studies',
    description: 'Drafts commercial contracts, provides regulatory legal compliance, and manages intellectual property rights.',
    requiredSkills: ['Legal Research', 'Legal & Contract Drafting', 'Corporate Law', 'Compliance & Regulatory', 'Intellectual Property'],
    requiredDomains: ['Corporate Law', 'Criminal Law', 'Civil Law', 'Constitutional Law', 'Legal Compliance'],
    growthOutlook: 'High Demand'
  },
  {
    title: 'Agritech & Precision Agriculture Specialist',
    category: 'Agriculture & Science',
    description: 'Applies GIS mapping, soil science diagnostics, and agricultural technology for crop yield optimization.',
    requiredSkills: ['Agricultural Research', 'Crop Management & Agronomy', 'Precision Agriculture & GIS', 'Soil Science & Fertility', 'QGIS / ArcGIS'],
    requiredDomains: ['Agronomy', 'Horticulture', 'Soil Science', 'Agricultural Engineering', 'Agribusiness'],
    growthOutlook: 'High Growth'
  }
];

/**
 * Computes personalized career recommendations with explainable match scores,
 * strengths, missing skills, why it matches, and resolved course image metadata.
 */
export function generatePersonalizedCareers(profile = {}) {
  const academic = getEffectiveAcademicHierarchy(profile);
  const userDomainLower = academic.domain.toLowerCase();
  const userSpecLower = academic.specialization.toLowerCase();
  const userSkills = (profile.technicalSkills || []).map(s => (s.name || s).toLowerCase());
  const userTools = (profile.tools || []).map(t => t.toLowerCase());
  const allUserSkills = [...userSkills, ...userTools];
  const userInterests = (profile.interests || []).map(i => i.toLowerCase());

  return GRADUATE_CAREER_CATALOG.map(career => {
    const cTitleLower = career.title.toLowerCase();
    const cCatLower = career.category.toLowerCase();
    const reqSkills = career.requiredSkills || [];
    const reqDomains = (career.requiredDomains || []).map(d => d.toLowerCase());

    const matchingSkills = [];
    const missingSkills = [];

    reqSkills.forEach(req => {
      const rLower = req.toLowerCase();
      const hasSkill = allUserSkills.some(u => u.includes(rLower) || rLower.includes(u));
      if (hasSkill) {
        matchingSkills.push(req);
      } else {
        missingSkills.push(req);
      }
    });

    let score = 45; // baseline

    // 1. Specialization & Domain Alignment (Up to 35 points)
    const isSpecMatch = userSpecLower && reqDomains.some(d => userSpecLower.includes(d) || d.includes(userSpecLower));
    const isDomainMatch = reqDomains.some(d => userDomainLower.includes(d) || d.includes(userDomainLower));

    if (isSpecMatch) score += 35;
    else if (isDomainMatch) score += 25;
    else score += 10;

    // 2. Skill Overlap (Up to 15 points)
    if (reqSkills.length > 0) {
      score += Math.round((matchingSkills.length / reqSkills.length) * 15);
    }

    // 3. Interest Alignment (Up to 10 points)
    const matchesInterest = userInterests.some(i => cTitleLower.includes(i) || cCatLower.includes(i));
    if (matchesInterest) score += 10;

    const matchScore = Math.min(98, Math.max(52, score));

    // Construct "Why Am I Seeing This?" explanation
    const whyItMatches = isDomainMatch || isSpecMatch
      ? `Directly aligns with your ${academic.fullHierarchyText} qualification and interest in ${userInterests[0] || 'your core discipline'}.`
      : `Leverages your transferable competencies in ${matchingSkills.slice(0, 2).join(', ') || 'analytical problem solving'}.`;

    const imageMeta = resolveCourseImage(career);

    return {
      ...career,
      matchScore,
      whyItMatches,
      imageMeta,
      matchingSkills: matchingSkills.length > 0 ? matchingSkills : ['Fundamental Academic Training'],
      missingSkills: missingSkills.length > 0 ? missingSkills : ['Advanced Portfolio Case Study'],
      recommendedNextStep: missingSkills.length > 0
        ? `Build portfolio project in ${missingSkills[0]}`
        : `Prepare mock interview for ${career.title}`
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Generates tailored Skill Gap Analysis & Recommended Learning Resources.
 * Ensures course recommendations match user proficiency level (No basic courses for advanced candidates).
 */
export function generatePersonalizedSkillGap(profile = {}, targetCareer = null) {
  const careers = generatePersonalizedCareers(profile);
  const selectedTarget = targetCareer || careers[0] || GRADUATE_CAREER_CATALOG[0];

  const academic = getEffectiveAcademicHierarchy(profile);
  const userSkills = profile.technicalSkills || [];

  const strongSkills = userSkills.filter(s => s.proficiency === 'Advanced').map(s => s.name);
  const developingSkills = userSkills.filter(s => s.proficiency !== 'Advanced').map(s => s.name);
  const missingCriticalSkills = selectedTarget.missingSkills || [];

  const learningModules = missingCriticalSkills.map((skill, idx) => {
    // Determine level-appropriate course title
    const hasAdvancedProficiency = strongSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()));
    const titlePrefix = hasAdvancedProficiency ? 'Advanced & Industry Specialization' : 'Applied Core';
    const title = `${titlePrefix}: ${skill} for ${selectedTarget.title}`;
    
    return {
      id: `mod-${idx + 1}`,
      step: idx + 1,
      skill,
      whyRequired: `Required for ${selectedTarget.title} pathway based on your ${academic.domain} profile.`,
      resourceTitle: title,
      actionLabel: `Start ${skill} Module →`,
      estimatedWeeks: 2 + idx,
      learningType: idx === 0 ? 'Hands-on Interactive Lab' : 'Applied Capstone Project',
      imageMeta: resolveCourseImage({ title, skill, category: selectedTarget.category })
    };
  });

  return {
    targetCareer: selectedTarget.title,
    matchScore: selectedTarget.matchScore,
    whyTargetMatches: selectedTarget.whyItMatches,
    strongSkills,
    developingSkills,
    missingCriticalSkills,
    learningModules
  };
}

/**
 * Generates personalized 4-Phase Learning & Placement Roadmap.
 */
export function generatePersonalizedRoadmap(profile = {}, targetCareer = null) {
  const skillGap = generatePersonalizedSkillGap(profile, targetCareer);
  const targetTitle = skillGap.targetCareer;
  const missing = skillGap.missingCriticalSkills;

  return [
    {
      phaseNumber: 1,
      title: `Phase 1: Core Competency Diagnostic & Fundamentals`,
      duration: 'Weeks 1–3',
      status: 'in-progress',
      description: `Establish robust baseline in foundational subjects for ${targetTitle}.`,
      imageMeta: resolveCourseImage({ title: `Phase 1 ${targetTitle} Fundamentals`, skill: missing[0] }),
      tasks: [
        `Complete baseline diagnostic assessment for ${targetTitle}`,
        `Master foundational syntax and theory for ${missing[0] || 'core tools'}`,
        'Configure local development environment and professional tools'
      ]
    },
    {
      phaseNumber: 2,
      title: `Phase 2: Targeted Skill Gap Acquisition`,
      duration: 'Weeks 4–7',
      status: 'upcoming',
      description: `Acquire key missing competencies (${missing.slice(0, 3).join(', ') || 'industry tools'}).`,
      imageMeta: resolveCourseImage({ title: `Phase 2 ${missing[0] || targetTitle} Acquisition`, skill: missing[0] }),
      tasks: [
        `Complete practical tutorials in ${missing[0] || 'Primary Tool'}`,
        `Implement sample code modules for ${missing[1] || 'Secondary Skill'}`,
        'Solve 25+ domain-specific practice benchmarks'
      ]
    },
    {
      phaseNumber: 3,
      title: `Phase 3: Portfolio Projects & Case Studies`,
      duration: 'Weeks 8–11',
      status: 'upcoming',
      description: 'Build 2 real-world portfolio evidence projects demonstrating job readiness.',
      imageMeta: resolveCourseImage({ title: `Phase 3 ${targetTitle} Capstone Projects`, skill: targetTitle }),
      tasks: [
        `Build Capstone Project 1: End-to-end ${targetTitle} workflow`,
        'Document code repository on GitHub with clean README and architecture diagrams',
        'Deploy live interactive demo link'
      ]
    },
    {
      phaseNumber: 4,
      title: `Phase 4: Resume Optimization & Interview Readiness`,
      duration: 'Weeks 12–15',
      status: 'upcoming',
      description: 'Finalize ATS resume, complete mock interviews, and begin role applications.',
      imageMeta: resolveCourseImage({ title: `Phase 4 ${targetTitle} Placement Readiness` }),
      tasks: [
        `Tailor resume for ${targetTitle} roles with metrics-driven project achievements`,
        'Practice 40+ role-specific technical and behavioral interview questions',
        'Apply to top graduate trainee and entry-level positions'
      ]
    }
  ];
}

/**
 * Generates tailored Competitive Exams Guide based on user degree and selections.
 * Attaches exam-specific visual resolution and profile-grounded relevance explanations.
 */
export function generatePersonalizedExamsGuide(profile = {}) {
  const academic = getEffectiveAcademicHierarchy(profile);
  const userExams = profile.selectedExams || [];
  const hasExamInterest = profile.examInterest === 'Yes' || profile.examInterest === 'Maybe';

  const masterExams = [
    {
      name: 'GATE (Graduate Aptitude Test in Engineering)',
      category: 'Engineering & Technology',
      targetAudience: ['B.E. / B.Tech', 'Polytechnic Diploma', 'Computer Science & Engineering', 'Electronics', 'Mechanical', 'Civil'],
      conductingBody: 'IITs / IISc Bangalore',
      frequency: 'Annual (February)',
      purpose: 'M.Tech admission in IITs/NITs and Direct PSU recruitment (ONGC, IOCL, NTPC, BHEL).',
      officialUrl: 'https://gate2026.iitr.ac.in',
      syllabusKeywords: ['Engineering Mathematics', 'Core Engineering Domain', 'General Aptitude'],
      prepCourses: ['GATE Core Subject Engineering Diagnostic', 'Engineering Mathematics & Aptitude Sprint']
    },
    {
      name: 'CAT / XAT / CMAT (Management Admission)',
      category: 'Management & Commerce',
      targetAudience: ['B.Com', 'BBA / BMS', 'B.E. / B.Tech', 'B.A.', 'B.Sc'],
      conductingBody: 'IIMs / XLRI / NTA',
      frequency: 'Annual (November - January)',
      purpose: 'Admission to premier MBA / PGDM programmes at IIMs, FMS, SPJIMR.',
      officialUrl: 'https://iimcat.ac.in',
      syllabusKeywords: ['Quantitative Aptitude', 'Data Interpretation & Logical Reasoning', 'Verbal Ability'],
      prepCourses: ['CAT Quantitative Aptitude & Data Interpretation Sprint', 'Logical Reasoning Case Benchmarking']
    },
    {
      name: 'UPSC Civil Services Examination (IAS / IPS)',
      category: 'Public Services & Governance',
      targetAudience: ['Any Recognized Graduate Degree'],
      conductingBody: 'Union Public Service Commission',
      frequency: 'Annual (May - Prelims)',
      purpose: 'Direct recruitment to IAS, IPS, IFS, IRS, and Central Group A Services.',
      officialUrl: 'https://upsc.gov.in',
      syllabusKeywords: ['Indian Polity & History', 'Geography & Economics', 'Current Affairs', 'CSAT Aptitude'],
      prepCourses: ['UPSC General Studies & Constitutional Governance', 'CSAT Aptitude & Analytical Reasoning']
    },
    {
      name: 'SSC CGL / JE (Central Government Posts)',
      category: 'Central Government Staffing',
      targetAudience: ['Any Recognized Graduate Degree'],
      conductingBody: 'Staff Selection Commission',
      frequency: 'Annual',
      purpose: 'Group B & C officer posts in Central Ministries, Income Tax, Customs, and CAG.',
      officialUrl: 'https://ssc.gov.in',
      syllabusKeywords: ['General Intelligence & Reasoning', 'Quantitative Aptitude', 'English Language', 'General Awareness'],
      prepCourses: ['SSC CGL Quantitative Aptitude & English Mastery', 'General Intelligence Mock Test Series']
    },
    {
      name: 'GRE & IELTS / TOEFL (Abroad Postgraduate Studies)',
      category: 'Study Abroad',
      targetAudience: ['Any Graduate Degree'],
      conductingBody: 'ETS / British Council / IDP',
      frequency: 'Year-round',
      purpose: 'MS & MBA admissions in USA, Europe, Canada, Singapore, and UK.',
      officialUrl: 'https://www.ets.org/gre',
      syllabusKeywords: ['Verbal Reasoning', 'Quantitative Reasoning', 'Analytical Writing', 'English Proficiency'],
      prepCourses: ['GRE Quantitative & Verbal Reasoning Masterclass', 'IELTS Academic Writing & Speaking Prep']
    }
  ];

  const recommendedExams = masterExams.map(ex => {
    const isSelected = userExams.some(u => u.examName && u.examName.includes(ex.name.slice(0, 4)));
    const isDomainRelevant = ex.targetAudience.some(t => academic.degree.includes(t) || academic.domain.includes(t) || t === 'Any Recognized Graduate Degree');
    
    // Construct profile-driven why recommended explanation
    const recommendationReason = isSelected
      ? `Explicitly selected by you during onboarding as a target exam.`
      : `Recommended because your ${academic.fullHierarchyText} background aligns with the syllabus and eligibility requirements for ${ex.name}.`;

    const examImageMeta = resolveExamImage(ex);

    const prepCourseMetas = ex.prepCourses.map(title => ({
      title,
      imageMeta: resolveCourseImage(title),
      actionUrl: `/graduate/upskilling?skill=${encodeURIComponent(ex.name.slice(0, 4))}`
    }));

    return {
      ...ex,
      isSelected,
      isDomainRelevant,
      imageMeta: examImageMeta,
      recommendationReason,
      prepCourseMetas
    };
  });

  return {
    hasExamInterest,
    userExams,
    recommendedExams
  };
}

/**
 * Generates tailored Higher Studies Pathways.
 */
export function generatePersonalizedHigherStudies(profile = {}) {
  const academic = getEffectiveAcademicHierarchy(profile);
  const fLower = academic.field.toLowerCase();
  const dLower = academic.degree.toLowerCase();

  let programmes = [];

  if (fLower.includes('engineering') || dLower.includes('tech') || dLower.includes('bca')) {
    programmes = [
      {
        title: 'M.Tech / M.E in Core / Advanced Specialization',
        duration: '2 Years',
        entranceExams: 'GATE / TANCET / University Entrance',
        institutes: 'IITs, NITs, Anna University, PSG Tech',
        whyRecommended: `Deepens technical mastery in ${academic.domain} for specialized corporate R&D and academic roles.`
      },
      {
        title: 'MS (Master of Science) Abroad',
        duration: '1.5 – 2 Years',
        entranceExams: 'GRE, IELTS / TOEFL',
        institutes: 'Top International Universities (USA, Germany, Canada, Singapore)',
        whyRecommended: 'Offers global industry placement, international research labs, and high-tech career mobility.'
      },
      {
        title: 'MBA in Tech Management / Product Leadership',
        duration: '2 Years',
        entranceExams: 'CAT, XAT, GMAT',
        institutes: 'IIMs, FMS Delhi, SPJIMR',
        whyRecommended: 'Accelerates transition from engineering into product management and enterprise strategy.'
      }
    ];
  } else if (fLower.includes('commerce') || fLower.includes('management') || dLower.includes('b.com') || dLower.includes('bba')) {
    programmes = [
      {
        title: 'MBA in Finance / Business Analytics / Marketing',
        duration: '2 Years',
        entranceExams: 'CAT, XAT, CMAT, MAT',
        institutes: 'IIMs, FMS, SPJIMR, XLRI',
        whyRecommended: 'Premier postgraduate pathway for corporate finance, investment banking, and management consulting.'
      },
      {
        title: 'M.Com / Master of Financial Economics',
        duration: '2 Years',
        entranceExams: 'CUET PG / University Entrance',
        institutes: 'Delhi School of Economics, Loyola College, Madras University',
        whyRecommended: 'Strong foundation for specialized corporate accounting, banking, and academic lectureship.'
      }
    ];
  } else {
    programmes = [
      {
        title: 'MBA / PGDM in Enterprise Administration',
        duration: '2 Years',
        entranceExams: 'CAT, MAT, CMAT',
        institutes: 'Top National Business Schools',
        whyRecommended: 'Versatile management degree opening leadership opportunities across diverse sectors.'
      },
      {
        title: `Specialized Master's (M.Sc / M.A) in ${academic.domain || 'Domain'}`,
        duration: '2 Years',
        entranceExams: 'CUET PG / State Entrance',
        institutes: 'Central & State Universities',
        whyRecommended: `Deepens subject knowledge for specialized analytical, research, and educational careers.`
      }
    ];
  }

  const enrichedProgrammes = programmes.map(p => ({
    ...p,
    imageMeta: resolveCourseImage(p.title)
  }));

  return {
    academicSummary: academic.fullHierarchyText,
    programmes: enrichedProgrammes
  };
}

/**
 * Generates tailored Resume Projects and Role-Specific Interview Questions.
 */
export function generatePersonalizedPlacement(profile = {}, targetCareer = null) {
  const careers = generatePersonalizedCareers(profile);
  const selectedTarget = targetCareer || careers[0] || GRADUATE_CAREER_CATALOG[0];
  const academic = getEffectiveAcademicHierarchy(profile);

  const suggestedProjects = [
    {
      title: `${selectedTarget.title} Capstone Engine`,
      techStack: selectedTarget.requiredSkills.slice(0, 3).join(', '),
      description: `Build an end-to-end industry application showcasing clean code architecture and data persistence.`,
      highlights: ['Metrics-driven achievements', 'Clean documentation & GitHub repository', 'Live cloud deployment link'],
      imageMeta: resolveCourseImage({ title: `${selectedTarget.title} Capstone Engine`, skill: selectedTarget.requiredSkills[0] })
    },
    {
      title: `Domain Data Analysis for ${academic.domain}`,
      techStack: 'Python, SQL, Excel, Dashboarding',
      description: `Perform real-world exploratory data analysis and predictive modeling on structured datasets.`,
      highlights: ['Interactive visualization dashboard', 'Exploratory data insights', 'Executive summary report'],
      imageMeta: resolveCourseImage({ title: `Domain Data Analysis for ${academic.domain}`, skill: 'Data Analysis' })
    }
  ];

  const interviewQuestions = [
    {
      id: 'q1',
      category: 'Technical & Domain Core',
      question: `How do you handle dataset anomalies or optimization bottlenecks in a ${selectedTarget.title} pipeline?`,
      sampleAnswer: `I systematically analyze input boundaries using diagnostic tools, isolate bottleneck operations, and apply targeted algorithmic optimization.`
    },
    {
      id: 'q2',
      category: 'Tool & Workflow Mastery',
      question: `Walk us through your design workflow when using ${selectedTarget.requiredSkills[0] || 'primary tools'}.`,
      sampleAnswer: `I start with structural planning, establish clean modular components, enforce version control via Git, and perform continuous verification.`
    },
    {
      id: 'q3',
      category: 'Applied Project Case Study',
      question: `Describe a complex technical challenge you resolved during your ${academic.degree} studies or portfolio project.`,
      sampleAnswer: `I identified a critical system error, refactored underlying logic, and improved processing speed by 35% with clean unit verification.`
    }
  ];

  return {
    targetRole: selectedTarget.title,
    suggestedProjects,
    interviewQuestions
  };
}

/**
 * Builds formatted context prompt for AI Career Advisor.
 */
export function buildAIAdvisorContext(profile = {}) {
  const academic = getEffectiveAcademicHierarchy(profile);
  const careers = generatePersonalizedCareers(profile);
  const topCareer = careers[0]?.title || 'Professional Specialist';
  const skills = (profile.technicalSkills || []).map(s => `${s.name} (${s.proficiency || 'Intermediate'})`).join(', ');

  return `STUDENT BACKGROUND PROFILE:
- Name: ${profile.name || 'Graduate Student'}
- Field: ${academic.field}
- Degree: ${academic.degree}
- Domain / Branch: ${academic.domain}
- Specialization: ${academic.specialization || 'General'}
- Graduation Year: ${profile.graduationYear || '2025'}
- Employment Status: ${profile.employmentStatus || 'Fresher / Seeking Job'}
- Technical Skills: ${skills || 'Python, SQL'}
- Tools: ${(profile.tools || []).join(', ') || 'Excel, Git'}
- Interests: ${(profile.interests || []).join(', ') || 'Technology & Innovation'}
- Target Career Recommendation: ${topCareer}
- Primary Career Direction: ${profile.primaryCareerDirection || 'Get a Job'}`;
}
