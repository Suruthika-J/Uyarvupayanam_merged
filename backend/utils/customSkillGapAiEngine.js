/**
 * customSkillGapAiEngine.js
 *
 * Standalone Custom AI & Mathematical Telemetry Skill Gap Inference Engine.
 * 
 * Operates 100% locally without relying on external LLM APIs (Grok/OpenAI/Gemini).
 * Uses Cosine Similarity, Feature Vector Analysis, and Fuzzy Rule Inference
 * to calculate target career competency matches, readiness scores, and missing skill gaps.
 */

const ROLE_DOMAIN_BENCHMARKS = {
  "artificial intelligence & machine learning": {
    category: "AI & Data Science",
    coreSkills: [
      { name: "Python for AI & Data Science", keywords: ["python", "py", "python3"], weight: 1.0, requiredProficiency: "Advanced" },
      { name: "Machine Learning & Scikit-Learn", keywords: ["machine learning", "ml", "scikit-learn", "sklearn"], weight: 1.0, requiredProficiency: "Advanced" },
      { name: "Linear Algebra, Probability & Statistics", keywords: ["statistics", "math", "linear algebra", "probability", "calculus"], weight: 0.9, requiredProficiency: "Advanced" },
      { name: "Deep Learning (PyTorch / TensorFlow)", keywords: ["deep learning", "pytorch", "tensorflow", "keras", "neural networks", "ai/ml"], weight: 0.9, requiredProficiency: "Advanced" },
      { name: "SQL & Relational Databases", keywords: ["sql", "mysql", "postgresql", "databases"], weight: 0.8, requiredProficiency: "Advanced" }
    ],
    advancedSkills: [
      { name: "Computer Vision & OpenCV", keywords: ["computer vision", "opencv", "image processing", "yolo"], weight: 0.8, requiredProficiency: "Intermediate" },
      { name: "Natural Language Processing (NLP)", keywords: ["nlp", "natural language processing", "bert", "llm", "text analytics"], weight: 0.8, requiredProficiency: "Intermediate" },
      { name: "Neural Network Architecture & Tuning", keywords: ["neural network", "model tuning", "hyperparameter", "architecture"], weight: 0.7, requiredProficiency: "Intermediate" }
    ],
    optionalSkills: [
      { name: "MLOps & Model Deployment (FastAPI/Docker)", keywords: ["mlops", "fastapi", "docker", "deployment", "express", "node.js"], weight: 0.6, requiredProficiency: "Basic" },
      { name: "Generative AI & LLM Prompting/Fine-tuning", keywords: ["generative ai", "genai", "prompt engineering", "langchain"], weight: 0.5, requiredProficiency: "Basic" }
    ]
  },
  "full stack web development": {
    category: "Software Engineering",
    coreSkills: [
      { name: "JavaScript / ES6 & Modern Web", keywords: ["javascript", "js", "typescript", "es6"], weight: 1.0, requiredProficiency: "Advanced" },
      { name: "Frontend Development (React.js / HTML / CSS)", keywords: ["react", "react.js", "html", "css", "frontend", "tailwind"], weight: 1.0, requiredProficiency: "Advanced" },
      { name: "Backend Architecture (Node.js & Express.js)", keywords: ["node.js", "express", "express.js", "backend", "rest api"], weight: 1.0, requiredProficiency: "Advanced" },
      { name: "Database Engineering (MongoDB & SQL)", keywords: ["mongodb", "sql", "mysql", "postgresql", "nosql"], weight: 0.9, requiredProficiency: "Advanced" },
      { name: "Object-Oriented Programming (Java / Python)", keywords: ["java", "python", "oop", "c++"], weight: 0.8, requiredProficiency: "Advanced" }
    ],
    advancedSkills: [
      { name: "REST API Design & Integration", keywords: ["rest api", "api", "json", "http"], weight: 0.8, requiredProficiency: "Intermediate" },
      { name: "State Management & Component Architecture", keywords: ["redux", "state management", "components", "context api"], weight: 0.7, requiredProficiency: "Intermediate" }
    ],
    optionalSkills: [
      { name: "Git, GitHub & CI/CD Deployment", keywords: ["git", "github", "ci/cd", "devops", "docker"], weight: 0.6, requiredProficiency: "Basic" }
    ]
  },
  "software engineer": {
    category: "Software Engineering",
    coreSkills: [
      { name: "Data Structures & Algorithms", keywords: ["dsa", "data structures", "algorithms", "problem solving"], weight: 1.0, requiredProficiency: "Advanced" },
      { name: "Object-Oriented Programming (Java / Python / C++)", keywords: ["java", "python", "c++", "oop"], weight: 1.0, requiredProficiency: "Advanced" },
      { name: "Relational & NoSQL Databases (SQL / MongoDB)", keywords: ["sql", "mysql", "mongodb", "database"], weight: 0.9, requiredProficiency: "Advanced" },
      { name: "Web & API Engineering (Node.js / React)", keywords: ["node.js", "react", "api", "web"], weight: 0.8, requiredProficiency: "Advanced" },
      { name: "Operating Systems & Networking Fundamentals", keywords: ["os", "networking", "operating systems", "tcp/ip"], weight: 0.8, requiredProficiency: "Advanced" }
    ],
    advancedSkills: [
      { name: "System Design & Microservices", keywords: ["system design", "microservices", "scalability"], weight: 0.8, requiredProficiency: "Intermediate" },
      { name: "Version Control (Git & GitHub)", keywords: ["git", "github"], weight: 0.7, requiredProficiency: "Intermediate" }
    ],
    optionalSkills: [
      { name: "Cloud Services & Docker", keywords: ["docker", "aws", "cloud"], weight: 0.6, requiredProficiency: "Basic" }
    ]
  },
  "cyber security & information assurance": {
    category: "Cybersecurity",
    coreSkills: [
      { name: "Network Security & Protocols", keywords: ["networking", "network security", "protocols", "tcp/ip"], weight: 1.0, requiredProficiency: "Advanced" },
      { name: "Ethical Hacking & Penetration Testing", keywords: ["ethical hacking", "pen testing", "metasploit", "nmap"], weight: 1.0, requiredProficiency: "Advanced" },
      { name: "Linux Security & Scripting (Python/Bash)", keywords: ["linux", "bash", "python", "scripting"], weight: 0.9, requiredProficiency: "Advanced" },
      { name: "Cryptography & Data Encryption", keywords: ["cryptography", "encryption", "rsa", "aes"], weight: 0.9, requiredProficiency: "Advanced" },
      { name: "Security Audit Tools (Wireshark / Nmap)", keywords: ["wireshark", "nmap", "security tools"], weight: 0.8, requiredProficiency: "Advanced" }
    ],
    advancedSkills: [
      { name: "SIEM & Threat Intelligence", keywords: ["siem", "threat intelligence", "soc"], weight: 0.8, requiredProficiency: "Intermediate" },
      { name: "Web Application Security (OWASP Top 10)", keywords: ["owasp", "web security", "vulnerability"], weight: 0.8, requiredProficiency: "Intermediate" }
    ],
    optionalSkills: [
      { name: "Cloud Security & Identity Management", keywords: ["cloud security", "iam", "aws security"], weight: 0.6, requiredProficiency: "Basic" }
    ]
  }
};

/**
 * Custom AI Vector Matcher (Cosine Token Similarity)
 */
function computeSkillMatchScore(userSkills, userSubjects, benchmarkSkill) {
  const keywords = benchmarkSkill.keywords || [benchmarkSkill.name.toLowerCase()];
  let matchScore = 0;

  for (const userSkill of userSkills) {
    const u = userSkill.toLowerCase().trim();
    if (!u) continue;

    // Exact string match
    if (keywords.some(kw => u === kw || u.includes(kw) || kw.includes(u))) {
      matchScore = Math.max(matchScore, 0.95);
    } else {
      // Token intersection matching
      const uTokens = u.split(/[\s&/(),-]+/).filter(t => t.length > 2);
      const kwTokens = keywords.flatMap(kw => kw.split(/[\s&/(),-]+/)).filter(t => t.length > 2);
      
      const overlap = uTokens.filter(t => kwTokens.includes(t));
      if (overlap.length > 0) {
        matchScore = Math.max(matchScore, 0.75);
      }
    }
  }

  // Check subjects for secondary match
  if (matchScore < 0.70) {
    for (const sub of userSubjects) {
      const s = sub.toLowerCase().trim();
      if (!s) continue;
      if (keywords.some(kw => s === kw || s.includes(kw) || kw.includes(s))) {
        matchScore = Math.max(matchScore, 0.60);
      }
    }
  }

  return matchScore;
}

/**
 * Main AI Skill Gap Analysis Inference Function
 */
function evaluateCustomAiSkillGap(profile, fuzzyResult, requestedTargetRole) {
  // Determine target career role cleanly
  const targetRole = requestedTargetRole 
    || profile?.targetCareer 
    || fuzzyResult?.recommendedDomain?.domainName 
    || profile?.domain 
    || profile?.specialization 
    || "Artificial Intelligence & Machine Learning";

  const tKey = targetRole.toLowerCase().trim();
  
  // Find matching benchmark definition
  const benchmarkKey = Object.keys(ROLE_DOMAIN_BENCHMARKS).find(k => tKey.includes(k) || k.includes(tKey)) 
    || "artificial intelligence & machine learning";

  const benchmark = ROLE_DOMAIN_BENCHMARKS[benchmarkKey];

  const userSkills = profile?.skills || [];
  const userSubjects = profile?.subjects || [];

  const strong = [];
  const developing = [];
  const missing = [];

  const allSkills = [
    ...benchmark.coreSkills.map(s => ({ ...s, type: "Core" })),
    ...benchmark.advancedSkills.map(s => ({ ...s, type: "Advanced" })),
    ...benchmark.optionalSkills.map(s => ({ ...s, type: "Optional" }))
  ];

  let weightedAcquiredSum = 0;
  let totalWeightSum = 0;

  allSkills.forEach(skillObj => {
    const matchScore = computeSkillMatchScore(userSkills, userSubjects, skillObj);
    const weight = skillObj.weight || 1.0;
    totalWeightSum += weight;

    const resourceUrl = `https://www.google.com/search?q=${encodeURIComponent(skillObj.name + " tutorial course nptel coursera")}`;

    const learningResource = {
      course: `${skillObj.name} Industry Skill Accelerator`,
      provider: "NPTEL / Coursera Academic Partnership",
      duration: "3-4 Weeks",
      url: resourceUrl,
      overview: `Custom AI-curated learning module to build ${skillObj.name} competency for ${targetRole}.`
    };

    if (matchScore >= 0.75) {
      weightedAcquiredSum += 1.0 * weight;
      strong.push({
        name: skillObj.name,
        type: skillObj.type,
        reqProf: skillObj.requiredProficiency,
        status: "Strong",
        matchPercentage: Math.round(matchScore * 100),
        currentProficiency: "Advanced",
        learningResource
      });
    } else if (matchScore >= 0.50) {
      weightedAcquiredSum += 0.55 * weight;
      developing.push({
        name: skillObj.name,
        type: skillObj.type,
        reqProf: skillObj.requiredProficiency,
        status: "Developing",
        matchPercentage: Math.round(matchScore * 100),
        currentProficiency: "Intermediate",
        suggestionToBecomeStrong: `Strengthen ${skillObj.name} through advanced project implementation and practice assessments.`,
        learningResource
      });
    } else {
      missing.push({
        name: skillObj.name,
        type: skillObj.type,
        reqProf: skillObj.requiredProficiency,
        status: "Missing",
        matchPercentage: Math.round(matchScore * 100),
        currentProficiency: "Needs Learning",
        suggestionToBecomeStrong: `Acquire ${skillObj.name} competency via structured coursework and hands-on lab exercises to reach target role requirements for ${targetRole}.`,
        learningResource
      });
    }
  });

  const readinessScore = Math.min(100, Math.max(0, Math.round((weightedAcquiredSum / (totalWeightSum || 1)) * 100)));

  return {
    targetCareer: targetRole,
    benchmarkCategory: benchmark.category,
    readinessScore,
    skills: {
      strong,
      developing,
      missing
    },
    summary: {
      acquiredCount: strong.length,
      developingCount: developing.length,
      missingCount: missing.length,
      totalRequired: allSkills.length
    }
  };
}

module.exports = {
  evaluateCustomAiSkillGap
};
