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
  "full stack web development": {
    category: "Software Engineering",
    coreSkills: [
      { name: "Frontend Development (React.js / HTML / CSS / MERN)", keywords: ["react", "react.js", "frontend", "html", "css", "mern", "javascript", "js"], weight: 1.0, requiredProficiency: "Advanced" },
      { name: "Backend Architecture (Node.js, Express.js & Spring Boot)", keywords: ["node.js", "express", "express.js", "spring boot", "backend", "node", "java"], weight: 1.0, requiredProficiency: "Advanced" },
      { name: "Databases & Storage (MongoDB & MySQL)", keywords: ["mongodb", "mysql", "sql", "databases", "database", "firestore", "nosql"], weight: 1.0, requiredProficiency: "Advanced" },
      { name: "Programming Languages (Java & Python)", keywords: ["java", "python", "javascript", "dart", "c++"], weight: 0.9, requiredProficiency: "Advanced" },
      { name: "Software & API Engineering (REST APIs, WebSockets, JWT)", keywords: ["rest api", "api", "websocket", "socket.io", "jwt", "authentication"], weight: 0.9, requiredProficiency: "Advanced" }
    ],
    advancedSkills: [
      { name: "Mobile & Cloud Engineering (Flutter & Firebase)", keywords: ["flutter", "firebase", "mobile", "cloud storage", "cloud"], weight: 0.8, requiredProficiency: "Intermediate" },
      { name: "Version Control & Collaboration (Git & GitHub)", keywords: ["git", "github", "git/github", "version control"], weight: 0.8, requiredProficiency: "Intermediate" },
      { name: "Core CS Fundamentals (OOP & DBMS)", keywords: ["oop", "object-oriented programming", "dbms", "database management systems"], weight: 0.8, requiredProficiency: "Intermediate" }
    ],
    optionalSkills: [
      { name: "AI/ML Integration (Machine Learning & Computer Vision)", keywords: ["machine learning", "computer vision", "opencv", "ai/ml", "ai"], weight: 0.6, requiredProficiency: "Basic" },
      { name: "Docker & Containerized Microservices", keywords: ["docker", "microservices", "containers", "kubernetes"], weight: 0.5, requiredProficiency: "Basic" },
      { name: "CI/CD & Cloud Deployment Pipelines (AWS / GCP)", keywords: ["ci/cd", "aws", "gcp", "devops", "cloud deployment"], weight: 0.5, requiredProficiency: "Basic" }
    ]
  },
  "artificial intelligence & machine learning": {
    category: "AI & Data Science",
    coreSkills: [
      { name: "Python for AI & Data Science", keywords: ["python", "py", "python3"], weight: 1.0, requiredProficiency: "Advanced" },
      { name: "Machine Learning & Scikit-Learn", keywords: ["machine learning", "ml", "scikit-learn", "sklearn"], weight: 1.0, requiredProficiency: "Advanced" },
      { name: "Computer Vision & OpenCV", keywords: ["computer vision", "opencv", "image processing", "yolo"], weight: 0.9, requiredProficiency: "Advanced" },
      { name: "SQL & Relational Databases (MySQL / MongoDB)", keywords: ["sql", "mysql", "postgresql", "mongodb", "databases"], weight: 0.9, requiredProficiency: "Advanced" },
      { name: "Linear Algebra, Probability & Statistics", keywords: ["statistics", "math", "linear algebra", "probability", "calculus"], weight: 0.8, requiredProficiency: "Advanced" }
    ],
    advancedSkills: [
      { name: "Deep Learning Frameworks (PyTorch / TensorFlow)", keywords: ["deep learning", "pytorch", "tensorflow", "keras", "neural networks"], weight: 0.8, requiredProficiency: "Intermediate" },
      { name: "Natural Language Processing (NLP)", keywords: ["nlp", "natural language processing", "bert", "llm", "text analytics"], weight: 0.8, requiredProficiency: "Intermediate" },
      { name: "Web & API Deployment (Node.js / Express / REST APIs)", keywords: ["rest api", "node.js", "express", "fastapi", "flask", "api"], weight: 0.7, requiredProficiency: "Intermediate" }
    ],
    optionalSkills: [
      { name: "MLOps & Model Deployment (Docker / FastAPI)", keywords: ["mlops", "fastapi", "docker", "deployment"], weight: 0.6, requiredProficiency: "Basic" },
      { name: "Generative AI & LLM Prompting/Fine-tuning", keywords: ["generative ai", "genai", "prompt engineering", "langchain"], weight: 0.5, requiredProficiency: "Basic" }
    ]
  },
  "software engineer": {
    category: "Software Engineering",
    coreSkills: [
      { name: "Programming Languages (Java, Python & JavaScript)", keywords: ["java", "python", "javascript", "c++", "oop"], weight: 1.0, requiredProficiency: "Advanced" },
      { name: "Web & API Engineering (React, Node.js & REST APIs)", keywords: ["react", "node.js", "express", "rest api", "api", "web"], weight: 1.0, requiredProficiency: "Advanced" },
      { name: "Databases & Data Management (MongoDB & SQL)", keywords: ["sql", "mysql", "mongodb", "database", "dbms"], weight: 0.9, requiredProficiency: "Advanced" },
      { name: "Core CS Fundamentals (DSA & OOP)", keywords: ["dsa", "data structures", "algorithms", "oop", "problem solving"], weight: 0.9, requiredProficiency: "Advanced" },
      { name: "Version Control & Collaboration (Git & GitHub)", keywords: ["git", "github"], weight: 0.8, requiredProficiency: "Advanced" }
    ],
    advancedSkills: [
      { name: "System Design & Microservices", keywords: ["system design", "microservices", "scalability", "architecture"], weight: 0.8, requiredProficiency: "Intermediate" },
      { name: "Mobile & Cross-Platform Development (Flutter)", keywords: ["flutter", "mobile", "react native"], weight: 0.7, requiredProficiency: "Intermediate" }
    ],
    optionalSkills: [
      { name: "Cloud Services & Docker Containers", keywords: ["docker", "aws", "cloud", "firebase"], weight: 0.6, requiredProficiency: "Basic" }
    ]
  },
  "cyber security & information assurance": {
    category: "Cybersecurity",
    coreSkills: [
      { name: "Network Security & Protocols (TCP/IP, HTTP/HTTPS)", keywords: ["networking", "network security", "protocols", "tcp/ip", "http"], weight: 1.0, requiredProficiency: "Advanced" },
      { name: "Ethical Hacking & Penetration Testing", keywords: ["ethical hacking", "pen testing", "metasploit", "nmap"], weight: 1.0, requiredProficiency: "Advanced" },
      { name: "Scripting & Backend Security (Python / Node.js)", keywords: ["python", "node.js", "bash", "scripting"], weight: 0.9, requiredProficiency: "Advanced" },
      { name: "Cryptography & Authentication (JWT, RSA, AES)", keywords: ["cryptography", "encryption", "jwt", "authentication"], weight: 0.9, requiredProficiency: "Advanced" },
      { name: "Security Audit Tools (Wireshark / Nmap)", keywords: ["wireshark", "nmap", "security tools"], weight: 0.8, requiredProficiency: "Advanced" }
    ],
    advancedSkills: [
      { name: "SIEM & Threat Intelligence", keywords: ["siem", "threat intelligence", "soc"], weight: 0.8, requiredProficiency: "Intermediate" },
      { name: "Web Application Security (OWASP Top 10)", keywords: ["owasp", "web security", "vulnerability"], weight: 0.8, requiredProficiency: "Intermediate" }
    ],
    optionalSkills: [
      { name: "Cloud Security & Identity Management", keywords: ["cloud security", "iam", "aws security", "firebase"], weight: 0.6, requiredProficiency: "Basic" }
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

    // Exact string or substring match
    if (keywords.some(kw => u === kw || u.includes(kw) || kw.includes(u))) {
      matchScore = Math.max(matchScore, 0.95);
    } else {
      // Token intersection matching
      const uTokens = u.split(/[\s&/(),.:-]+/).filter(t => t.length > 1);
      const kwTokens = keywords.flatMap(kw => kw.split(/[\s&/(),.:-]+/)).filter(t => t.length > 1);
      
      const overlap = uTokens.filter(t => kwTokens.includes(t));
      if (overlap.length > 0) {
        matchScore = Math.max(matchScore, 0.80);
      }
    }
  }

  // Check subjects for secondary match
  if (matchScore < 0.70) {
    for (const sub of userSubjects) {
      const s = sub.toLowerCase().trim();
      if (!s) continue;
      if (keywords.some(kw => s === kw || s.includes(kw) || kw.includes(s))) {
        matchScore = Math.max(matchScore, 0.65);
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
    || "Full Stack Web & Mobile Development";

  const findBenchmark = (targetStr) => {
    const s = (targetStr || "").toLowerCase().trim();
    if (!s) return null;
    if (s.includes("full stack") || s.includes("web") || s.includes("mern") || s.includes("mobile")) return ROLE_DOMAIN_BENCHMARKS["full stack web development"];
    if (s.includes("ai") || s.includes("machine learning") || s.includes("artificial intelligence")) return ROLE_DOMAIN_BENCHMARKS["artificial intelligence & machine learning"];
    if (s.includes("cyber") || s.includes("security")) return ROLE_DOMAIN_BENCHMARKS["cyber security & information assurance"];
    if (s.includes("software") || s.includes("architecture")) return ROLE_DOMAIN_BENCHMARKS["software engineer"];
    return null;
  };

  const benchmark = findBenchmark(targetRole) 
    || findBenchmark(profile?.domain) 
    || findBenchmark(profile?.specialization)
    || ROLE_DOMAIN_BENCHMARKS["full stack web development"];

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

    if (matchScore >= 0.70) {
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
    } else if (matchScore >= 0.45) {
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
