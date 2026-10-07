/**
 * atsScannerEngine.js
 * Advanced Applicant Tracking System (ATS) Analysis Engine
 * Evaluates resumes against target Job Descriptions (JD) or profile telemetry.
 */

// Canonical alias mapping to prevent duplicate counts and handle naming variations
const SKILL_ALIASES = {
  'react.js': 'react',
  'reactjs': 'react',
  'node.js': 'node.js',
  'nodejs': 'node.js',
  'node': 'node.js',
  'express.js': 'express',
  'expressjs': 'express',
  'vue.js': 'vue',
  'vuejs': 'vue',
  'restful': 'rest api',
  'restful api': 'rest api',
  'rest': 'rest api',
  'amazon web services': 'aws',
  'google cloud platform': 'gcp',
  'google cloud': 'gcp',
  'k8s': 'kubernetes',
  'ci/cd': 'ci/cd',
  'cicd': 'ci/cd',
  'github actions': 'ci/cd',
  'postgres': 'postgresql',
  'golang': 'go',
  'cpp': 'c++',
  'cplusplus': 'c++',
  'machine learning': 'machine learning',
  'ml': 'machine learning',
  'deep learning': 'deep learning',
  'dl': 'deep learning',
  'artificial intelligence': 'artificial intelligence',
  'ai': 'artificial intelligence',
  'dsa': 'data structures & algorithms',
  'data structures': 'data structures & algorithms',
  'algorithms': 'data structures & algorithms',
  'oop': 'object-oriented programming',
  'object oriented programming': 'object-oriented programming',
};

const TECH_SKILLS = [
  // Web & Mobile
  'javascript', 'typescript', 'react', 'next.js', 'vue', 'angular',
  'node.js', 'express', 'html', 'css', 'tailwind', 'bootstrap', 'sass',
  'redux', 'zustand', 'react native', 'flutter', 'swift', 'kotlin',
  'rest api', 'graphql', 'websockets', 'socket.io', 'microservices',
  // Languages
  'python', 'java', 'c++', 'c#', 'c', 'go', 'rust', 'ruby', 'php', 'sql', 'nosql', 'r', 'dart',
  // Databases
  'mongodb', 'postgresql', 'mysql', 'sqlite', 'redis', 'firebase', 'cassandra', 'dynamodb', 'oracle',
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes',
  'ci/cd', 'jenkins', 'terraform', 'git', 'github', 'gitlab', 'linux', 'nginx', 'apache',
  // Data Science & AI
  'machine learning', 'deep learning', 'artificial intelligence', 'data science',
  'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'nlp',
  'computer vision', 'opencv', 'llm', 'rag', 'langchain',
  // CS Fundamentals & Core
  'data structures & algorithms', 'system design', 'object-oriented programming',
  'unit testing', 'jest', 'cypress', 'selenium', 'agile', 'scrum', 'jira',
  // Embedded / Electronics
  'embedded systems', 'iot', 'arduino', 'raspberry pi', 'vlsi', 'matlab', 'verilog', 'pcb design'
];

const SOFT_SKILLS = [
  'problem solving', 'critical thinking', 'communication', 'collaboration', 'teamwork',
  'leadership', 'time management', 'adaptability', 'analytical skills',
  'creativity', 'attention to detail', 'mentorship', 'cross-functional collaboration',
  'troubleshooting', 'decision making', 'agile delivery', 'ownership', 'curiosity'
];

const ACTION_VERBS = [
  'spearheaded', 'architected', 'developed', 'engineered', 'implemented', 'designed',
  'deployed', 'automated', 'optimized', 'scaled', 'streamlined', 'orchestrated',
  'led', 'collaborated', 'integrated', 'built', 'formulated', 'refactored',
  'conducted', 'analyzed', 'executed', 'managed', 'launched', 'delivered',
  'accelerated', 'established', 'standardized', 'resolved', 'supervised', 'enhanced'
];

// Curated industry Job Description presets for one-click testing
const ATS_JD_PRESETS = [
  {
    id: 'fullstack-dev',
    title: 'Full Stack Web Developer (Entry/Associate Level)',
    domain: 'Computer Science / IT',
    experienceLevel: '0 - 2 Years',
    requiredSkills: ['javascript', 'typescript', 'react', 'node.js', 'mongodb', 'rest api', 'git', 'docker', 'problem solving'],
    description: `We are seeking a proactive Full Stack Web Developer to design and develop responsive web applications.
Responsibilities:
- Build clean, interactive user interfaces using React, HTML5, CSS3, and TypeScript.
- Develop and maintain robust server-side APIs using Node.js and Express.
- Model, query, and optimize relational and NoSQL databases (MongoDB, PostgreSQL).
- Implement secure REST APIs, JWT authentication, and automated unit testing.
- Utilize Git and GitHub for version control and collaborate within an Agile development workflow.
- Containerize application modules with Docker and deploy to cloud environments (AWS).
Requirements:
- Strong grasp of Data Structures, Algorithms, and Object-Oriented Programming.
- Excellent analytical, problem solving, and team communication skills.`
  },
  {
    id: 'ai-ml-engineer',
    title: 'AI & Data Science Associate',
    domain: 'AI, Data & Analytics',
    experienceLevel: '0 - 2 Years',
    requiredSkills: ['python', 'machine learning', 'sql', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'git', 'analytical skills'],
    description: `Looking for an entry-level AI & Machine Learning Engineer to build predictive models and analyze complex datasets.
Responsibilities:
- Clean, preprocess, and perform exploratory data analysis on structured and unstructured datasets using Python, Pandas, and NumPy.
- Train, validate, and evaluate Machine Learning models using Scikit-Learn and deep learning frameworks (TensorFlow or PyTorch).
- Query databases using SQL and build automated data pipelines for predictive insights.
- Document experimentation pipelines and deploy models through RESTful microservices.
- Collaborate with cross-functional software teams to integrate AI capabilities into production products.
Requirements:
- Bachelor's degree in Computer Science, Data Science, or related engineering discipline.
- Solid background in linear algebra, statistics, and machine learning algorithms.`
  },
  {
    id: 'devops-cloud',
    title: 'Cloud & DevOps Engineer (Graduate Trainee)',
    domain: 'Infrastructure & Cloud',
    experienceLevel: '0 - 2 Years',
    requiredSkills: ['linux', 'docker', 'kubernetes', 'aws', 'ci/cd', 'git', 'python', 'bash', 'problem solving'],
    description: `We are hiring a Cloud & DevOps Associate to automate deployments, streamline CI/CD pipelines, and maintain cloud infrastructure.
Responsibilities:
- Configure, maintain, and monitor containerized workloads using Docker and Kubernetes.
- Assist in designing automated CI/CD pipelines utilizing GitHub Actions or Jenkins.
- Manage cloud infrastructure resources on AWS (EC2, S3, RDS, Lambda).
- Write shell scripts (Bash) and automation tasks using Python in Linux environments.
- Monitor application performance, track uptime telemetry, and diagnose infrastructure bottlenecks.
Requirements:
- Hands-on familiarity with Linux operating systems and cloud computing concepts.
- Eagerness to master Infrastructure as Code (Terraform) and modern reliability engineering.`
  },
  {
    id: 'java-software-engineer',
    title: 'Java Backend Software Engineer',
    domain: 'Enterprise Software & Systems',
    experienceLevel: '0 - 2 Years',
    requiredSkills: ['java', 'spring', 'sql', 'mysql', 'rest api', 'git', 'microservices', 'object-oriented programming', 'problem solving'],
    description: `Join our enterprise engineering team as a Java Backend Developer building resilient financial and transactional systems.
Responsibilities:
- Develop scalable backend microservices using Java and Spring Boot framework.
- Design database schemas and write optimized queries with MySQL or PostgreSQL.
- Build and integrate secure REST APIs adhering to high concurrency standards.
- Write unit and integration test suites to maintain code quality.
- Participate in code reviews, sprint ceremonies, and architecture planning.
Requirements:
- Strong foundation in Java, Object-Oriented Design, and Multi-threading.
- Demonstrated coursework or projects showcasing backend database connectivity.`
  },
  {
    id: 'embedded-iot-engineer',
    title: 'Embedded Systems & IoT Engineer',
    domain: 'Hardware, ECE & Robotics',
    experienceLevel: '0 - 2 Years',
    requiredSkills: ['c', 'c++', 'embedded systems', 'iot', 'arduino', 'raspberry pi', 'matlab', 'troubleshooting'],
    description: `Seeking an Embedded Systems & IoT Engineer to develop firmware and integrate intelligent connected hardware sensors.
Responsibilities:
- Write optimized low-level firmware in C and C++ for microcontrollers (ARM, ESP32, Arduino).
- Interface peripheral sensors, communication protocols (UART, I2C, SPI), and IoT telemetry gateways.
- Prototype embedded systems using Raspberry Pi and simulate circuit designs.
- Test, debug, and troubleshoot hardware-software integration on bench equipment.
Requirements:
- Degree in Electronics & Communication Engineering (ECE), Electrical (EEE), or Mechatronics.
- Passion for robotics, IoT networks, and hardware experimentation.`
  }
];

/**
 * Normalizes text for keyword matching.
 */
function cleanText(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s\+\#\.\/\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Maps raw word/skill into canonical representation if alias exists.
 */
function toCanonical(skill) {
  const s = skill.toLowerCase().trim();
  return SKILL_ALIASES[s] || s;
}

/**
 * Extracts matched skills from a given text using canonical deduplication.
 */
function extractSkills(text, dictionary) {
  const cleaned = ` ${cleanText(text)} `;
  const found = new Set();
  const foundFreq = {};

  dictionary.forEach(rawSkill => {
    const escaped = rawSkill.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(`(?<=[\\s,;.()/\\[\\]]|^)${escaped}(?=[\\s,;.()/\\[\\]]|$)`, 'gi');
    const matches = cleaned.match(regex);
    if (matches && matches.length > 0) {
      const canonical = toCanonical(rawSkill);
      found.add(canonical);
      foundFreq[canonical] = (foundFreq[canonical] || 0) + matches.length;
    }
  });

  return { list: Array.from(found), frequencies: foundFreq };
}

/**
 * Evaluates structural sections in resume text.
 */
function evaluateStructure(resumeRaw) {
  const lower = resumeRaw.toLowerCase();
  const checks = [
    {
      id: 'contact_info',
      label: 'Contact Information (Email / Phone / Location)',
      passed: Boolean(resumeRaw.match(/[\w.-]+@[\w.-]+\.\w+/) || resumeRaw.match(/\+?\d{10,13}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)),
      weight: 20
    },
    {
      id: 'education',
      label: 'Academic Education (Degree / Institution / CGPA)',
      passed: Boolean(lower.match(/\b(b\.e\.|b\.tech|b\.sc|m\.e\.|m\.tech|bachelor|degree|college|university|cgpa|gpa|percentage|secondary|high school)\b/)),
      weight: 20
    },
    {
      id: 'skills',
      label: 'Dedicated Skills / Competencies Header',
      passed: Boolean(lower.match(/\b(skills|competencies|technical skills|technologies|tools|languages)\b/)),
      weight: 20
    },
    {
      id: 'projects_exp',
      label: 'Projects / Practical Experience Section',
      passed: Boolean(lower.match(/\b(projects|experience|work history|capstone|internship|portfolio)\b/)),
      weight: 20
    },
    {
      id: 'certifications_summary',
      label: 'Professional Summary or Certifications',
      passed: Boolean(lower.match(/\b(summary|objective|profile|certifications|credentials|achievements|honors)\b/)),
      weight: 20
    }
  ];

  const earned = checks.reduce((acc, c) => acc + (c.passed ? c.weight : 0), 0);
  return { score: earned, checks };
}

/**
 * Evaluates impact verbs and quantifiable metrics.
 */
function evaluateImpact(resumeRaw) {
  const cleaned = cleanText(resumeRaw);
  const foundVerbs = new Set();

  ACTION_VERBS.forEach(verb => {
    const regex = new RegExp(`\\b${verb}\\b`, 'gi');
    if (regex.test(cleaned)) foundVerbs.add(verb);
  });

  const metricRegex = /\b\d+(?:\.\d+)?%|\b\d+x\b|\b\d+\+\s*(?:users|clients|requests|endpoints|queries|students|projects|teams|stars|downloads)\b|\b(?:increased|reduced|boosted|improved|saved|optimized|cut)\b[^\n.]{1,40}\b\d+/gi;
  const metricsFound = resumeRaw.match(metricRegex) || [];

  const verbScore = Math.min(50, foundVerbs.size * 9);
  const metricScore = Math.min(50, metricsFound.length * 15 + (resumeRaw.match(/\b\d{2,4}\b/g) ? 10 : 0));
  const totalScore = Math.min(100, verbScore + metricScore);

  return {
    score: totalScore,
    actionVerbs: Array.from(foundVerbs),
    metricsDetected: Array.from(new Set(metricsFound.map(m => m.trim()))).slice(0, 8),
    verbCount: foundVerbs.size,
    metricsCount: metricsFound.length
  };
}

/**
 * Evaluates formatting, word count, and bullet points.
 */
function evaluateFormatting(resumeRaw) {
  const words = resumeRaw.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const issues = [];
  const passes = [];

  let wordScore = 100;
  if (wordCount < 150) {
    wordScore = 40;
    issues.push('Resume is too brief (< 150 words). Expand your project descriptions, tech stack details, and responsibilities.');
  } else if (wordCount < 250) {
    wordScore = 75;
    issues.push('Resume is relatively concise (< 250 words). Adding 1-2 detailed project accomplishments will improve keyword indexing.');
  } else if (wordCount > 1100) {
    wordScore = 70;
    issues.push('Resume exceeds 1100 words. Most ATS algorithms and recruiters recommend keeping entry-level resumes to a single page.');
  } else {
    passes.push(`Optimal word count (${wordCount} words) — adheres cleanly to standard 1-page ATS standards.`);
  }

  const bulletMatches = resumeRaw.match(/[•\-\*\u2022\u25E6\u2023]/g) || [];
  if (bulletMatches.length >= 5) {
    passes.push('Strong bullet-point formatting detected. ATS scanners parse bulleted lists with higher fidelity.');
  } else {
    issues.push('Few bullet points found. Reformat paragraphs into bullet points for clearer ATS parsing.');
  }

  return {
    score: wordScore,
    wordCount,
    issues,
    passes
  };
}

/**
 * Main ATS Scoring & Analysis Function
 */
function analyzeResumeForAts(resumeText, jobDescription = '', studentProfile = {}) {
  const resume = String(resumeText || '').trim();
  const jd = String(jobDescription || '').trim();

  // 1. Technical skills extraction
  const resumeTech = extractSkills(resume, TECH_SKILLS);
  const jdTech = jd ? extractSkills(jd, TECH_SKILLS) : { list: [], frequencies: {} };

  let effectiveJdSkills = jdTech.list;
  const isCustomJd = Boolean(jd && jd.length > 30);

  if (!isCustomJd) {
    const target = (studentProfile.targetCareer || studentProfile.careerInterests?.[0] || 'Software Engineer').toLowerCase();
    if (target.includes('data') || target.includes('ai') || target.includes('machine learning')) {
      effectiveJdSkills = ['python', 'machine learning', 'sql', 'pandas', 'numpy', 'scikit-learn', 'deep learning', 'tensorflow', 'git'];
    } else if (target.includes('cloud') || target.includes('devops')) {
      effectiveJdSkills = ['linux', 'docker', 'kubernetes', 'aws', 'ci/cd', 'git', 'python', 'bash'];
    } else {
      effectiveJdSkills = ['javascript', 'react', 'node.js', 'mongodb', 'sql', 'git', 'rest api', 'data structures & algorithms'];
    }
  }

  // Deduplicate effective JD skills
  effectiveJdSkills = Array.from(new Set(effectiveJdSkills.map(toCanonical)));

  const matchedTech = [];
  const missingTech = [];
  effectiveJdSkills.forEach(skill => {
    if (resumeTech.list.includes(skill)) {
      matchedTech.push({ skill, countInResume: resumeTech.frequencies[skill] || 1 });
    } else {
      missingTech.push(skill);
    }
  });

  const techScore = effectiveJdSkills.length > 0
    ? Math.round((matchedTech.length / effectiveJdSkills.length) * 100)
    : 80;

  // 2. Soft skills extraction
  const resumeSoft = extractSkills(resume, SOFT_SKILLS);
  const jdSoft = jd ? extractSkills(jd, SOFT_SKILLS) : { list: ['problem solving', 'communication', 'collaboration'] };
  let effectiveSoft = jdSoft.list.length > 0 ? jdSoft.list : ['problem solving', 'teamwork', 'communication', 'analytical skills'];
  effectiveSoft = Array.from(new Set(effectiveSoft.map(toCanonical)));

  const matchedSoft = [];
  const missingSoft = [];
  effectiveSoft.forEach(skill => {
    if (resumeSoft.list.includes(skill)) matchedSoft.push(skill);
    else missingSoft.push(skill);
  });

  const softScore = effectiveSoft.length > 0
    ? Math.round((matchedSoft.length / effectiveSoft.length) * 100)
    : 75;

  // 3. Structural Section Completeness
  const structureResult = evaluateStructure(resume);

  // 4. Impact, Action Verbs & Metrics
  const impactResult = evaluateImpact(resume);

  // 5. Formatting & Readability
  const formattingResult = evaluateFormatting(resume);

  // ── COMPOSITE ATS SCORE CALCULATION ──
  const overallAtsScore = Math.min(100, Math.max(10, Math.round(
    (techScore * 0.35) +
    (structureResult.score * 0.20) +
    (impactResult.score * 0.20) +
    (formattingResult.score * 0.15) +
    (softScore * 0.10)
  )));

  // Generate Verdict
  let verdict = {
    level: 'Critical Attention',
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fca5a5',
    summary: 'High risk of rejection by automated ATS screening. Missing key technical keywords and foundational resume sections.'
  };

  if (overallAtsScore >= 85) {
    verdict = {
      level: 'Excellent ATS Compatibility',
      color: '#059669',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      summary: 'Outstanding! Your resume exhibits high keyword alignment, recognized section headers, and measurable impact metrics. High probability of passing recruiter screening.'
    };
  } else if (overallAtsScore >= 70) {
    verdict = {
      level: 'Good ATS Compatibility',
      color: '#2563eb',
      bg: '#eff6ff',
      border: '#bfdbfe',
      summary: 'Solid alignment with core job specifications. Adding a few missing technical keywords and quantifiable impact numbers will push this into top candidate ranking.'
    };
  } else if (overallAtsScore >= 50) {
    verdict = {
      level: 'Moderate / Action Recommended',
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a',
      summary: 'Moderate match. Essential required technologies and impact markers are missing. Incorporate the missing keywords listed below to boost shortlisting odds.'
    };
  }

  // ── ACTIONABLE RECOMMENDATIONS ──
  const recommendations = [];

  if (missingTech.length > 0) {
    recommendations.push({
      type: 'high_priority',
      title: `Incorporate Missing Keywords: ${missingTech.slice(0, 4).join(', ')}`,
      desc: `The job description emphasizes ${missingTech.slice(0, 3).map(k => `"${k}"`).join(', ')}. If you have used these in academic mini-projects or coursework, mention them in your technical skills and project descriptions.`,
      icon: 'FiZap'
    });
  }

  if (impactResult.metricsCount < 2) {
    recommendations.push({
      type: 'medium_priority',
      title: 'Add Quantifiable Results & Metrics',
      desc: 'ATS algorithms rank resumes higher when claims are backed by metrics. For example: "improved response time by 30%", "built REST endpoints handling 200+ mock records", or "scored 90% in project review".',
      icon: 'FiTrendingUp'
    });
  }

  if (impactResult.verbCount < 4) {
    recommendations.push({
      type: 'medium_priority',
      title: 'Begin Project Bullets with Power Action Verbs',
      desc: `Elevate descriptions by starting bullet points with impactful verbs such as "${ACTION_VERBS.slice(0, 4).join('", "')}".`,
      icon: 'FiAward'
    });
  }

  structureResult.checks.filter(c => !c.passed).forEach(chk => {
    recommendations.push({
      type: 'high_priority',
      title: `Missing Section: ${chk.label}`,
      desc: `Standard ATS filters look for a recognizable "${chk.label}" header. Adding this ensures the parser accurately indexes your credentials.`,
      icon: 'FiAlertCircle'
    });
  });

  formattingResult.issues.forEach(issue => {
    recommendations.push({
      type: 'low_priority',
      title: 'Formatting & Length Adjustment',
      desc: issue,
      icon: 'FiFileText'
    });
  });

  // Generated Sample Bullets for the Student's Target Role
  const suggestedBulletPoints = [];
  if (missingTech.length > 0) {
    const techSample = missingTech.slice(0, 2).join(' & ');
    suggestedBulletPoints.push(
      `Engineered a responsive full-stack module integrating ${techSample}, optimizing system response times and improving component reusability.`
    );
  }
  suggestedBulletPoints.push(
    `Architected an academic capstone application leveraging ${resumeTech.list.slice(0, 2).join(', ') || 'modern engineering frameworks'}, implementing secure RESTful endpoints and automated testing.`
  );
  suggestedBulletPoints.push(
    `Collaborated in an agile academic sprint to deliver clean, documented solutions, reducing bug rates by 25% across test suites.`
  );

  return {
    overallAtsScore,
    verdict,
    categoryScores: {
      technicalSkills: {
        score: techScore,
        label: 'Hard Skills Match',
        weight: '35%',
        matched: matchedTech,
        missing: missingTech
      },
      softSkills: {
        score: softScore,
        label: 'Soft Skills Alignment',
        weight: '10%',
        matched: matchedSoft,
        missing: missingSoft
      },
      structure: {
        score: structureResult.score,
        label: 'ATS Section Completeness',
        weight: '20%',
        checks: structureResult.checks
      },
      impact: {
        score: impactResult.score,
        label: 'Action Verbs & Impact Metrics',
        weight: '20%',
        verbs: impactResult.actionVerbs,
        metrics: impactResult.metricsDetected,
        verbCount: impactResult.verbCount,
        metricCount: impactResult.metricsCount
      },
      formatting: {
        score: formattingResult.score,
        label: 'Formatting & Readability',
        weight: '15%',
        wordCount: formattingResult.wordCount,
        issues: formattingResult.issues,
        passes: formattingResult.passes
      }
    },
    recommendations,
    suggestedBulletPoints,
    detectedSkillsSummary: {
      totalResumeSkills: resumeTech.list.length,
      totalJdSkillsRequired: effectiveJdSkills.length,
      matchRatio: `${matchedTech.length} of ${effectiveJdSkills.length} matched`
    }
  };
}

module.exports = {
  analyzeResumeForAts,
  cleanText,
  extractSkills,
  toCanonical,
  ATS_JD_PRESETS,
  TECH_SKILLS,
  SOFT_SKILLS,
  ACTION_VERBS
};
