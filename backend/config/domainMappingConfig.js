/**
 * Centralized Domain Mapping & Taxonomy Configuration
 * Maps Step 4 specializations & core branches to normalized career domain IDs.
 */

const NORMALIZED_DOMAINS = {
  software_engineering: {
    id: "software_engineering",
    name: "Software Engineering & Architecture",
    category: "Software Engineering",
    icon: "FiBriefcase",
    description: "Architect scalable software applications, enterprise design patterns, and microservices."
  },
  ai_ml: {
    id: "ai_ml",
    name: "Artificial Intelligence & Machine Learning",
    category: "AI & Data Science",
    icon: "FiCpu",
    description: "Build intelligent neural networks, autonomous agents, and predictive machine learning models."
  },
  cyber_security: {
    id: "cyber_security",
    name: "Cyber Security & Ethical Hacking",
    category: "Security & Systems",
    icon: "FiShield",
    description: "Protect networks, cloud infrastructure, and software applications from cyber threats."
  },
  full_stack: {
    id: "full_stack",
    name: "Full Stack Web & Mobile Development",
    category: "Software Engineering",
    icon: "FiGlobe",
    description: "Architect scalable web applications, REST APIs, microservices, and mobile platforms."
  },
  data_science: {
    id: "data_science",
    name: "Data Science & Big Data Analytics",
    category: "AI & Data Science",
    icon: "FiActivity",
    description: "Extract actionable insights from massive datasets using statistics, pandas, and data mining."
  },
  cloud_devops: {
    id: "cloud_devops",
    name: "Cloud Computing & DevOps",
    category: "Infrastructure",
    icon: "FiGlobe",
    description: "Automate CI/CD pipelines, container orchestration, and cloud infrastructure on AWS/GCP/Azure."
  },
  algorithms_systems: {
    id: "algorithms_systems",
    name: "Algorithms & System Programming",
    category: "Core Computer Science",
    icon: "FiRadio",
    description: "Design high-performance algorithms, data structures, operating systems, and system drivers."
  },
  embedded_iot: {
    id: "embedded_iot",
    name: "Embedded Systems & IoT",
    category: "Hardware & Firmware",
    icon: "FiRadio",
    description: "Program microcontrollers, real-time operating systems (RTOS), and IoT sensor networks."
  },
  vlsi_design: {
    id: "vlsi_design",
    name: "VLSI & Chip Design",
    category: "Semiconductors",
    icon: "FiCpu",
    description: "Design integrated circuits, microprocessors, and FPGA semiconductor systems."
  },
  robotics_automation: {
    id: "robotics_automation",
    name: "Robotics & Automation Engineering",
    category: "Robotics",
    icon: "FiZap",
    description: "Integrate sensors, actuators, kinematics, and control systems for industrial robotics."
  },
  ev_powertrain: {
    id: "ev_powertrain",
    name: "Electric Vehicle & Power Systems",
    category: "Clean Tech & Power",
    icon: "FiSun",
    description: "Develop battery management systems, EV motor drives, and smart energy grids."
  },
  cad_structural: {
    id: "cad_structural",
    name: "CAD Modeling & Structural Engineering",
    category: "Core Engineering",
    icon: "FiHome",
    description: "Design 3D mechanical assemblies, thermal dynamics, and structural civil infrastructure."
  }
};

// Mapping from Step 4 specialization phrases to normalized domain IDs
const SPECIALIZATION_MAP = {
  // Software Engineering & Architecture
  "software engineering & architecture": "software_engineering",
  "software engineering": "software_engineering",
  "enterprise software": "software_engineering",
  "software architecture": "software_engineering",

  // AI / ML
  "artificial intelligence & machine learning": "ai_ml",
  "artificial intelligence": "ai_ml",
  "machine learning": "ai_ml",
  "ai & machine learning": "ai_ml",
  "ai & ml": "ai_ml",
  "deep learning": "ai_ml",
  "nlp": "ai_ml",
  "computer vision": "ai_ml",
  "generative ai": "ai_ml",

  // Cyber Security
  "cyber security & ethical hacking": "cyber_security",
  "cyber security": "cyber_security",
  "ethical hacking": "cyber_security",
  "information security": "cyber_security",
  "network security": "cyber_security",

  // Algorithms & Systems
  "algorithms & system programming": "algorithms_systems",
  "algorithms & systems": "algorithms_systems",
  "algorithms": "algorithms_systems",
  "system programming": "algorithms_systems",

  // Full Stack
  "full stack web & mobile development": "full_stack",
  "full stack": "full_stack",
  "web development": "full_stack",
  "mobile development": "full_stack",

  // Data Science
  "data science & big data analytics": "data_science",
  "data science": "data_science",
  "big data": "data_science",
  "data analytics": "data_science",
  "data engineering": "data_science",

  // Cloud & DevOps
  "cloud computing & devops": "cloud_devops",
  "cloud computing": "cloud_devops",
  "devops": "cloud_devops",
  "cloud architecture": "cloud_devops",

  // Core Electronics / Hardware / Mechanical / Civil
  "embedded systems & iot": "embedded_iot",
  "embedded": "embedded_iot",
  "iot": "embedded_iot",
  "vlsi & chip design": "vlsi_design",
  "vlsi": "vlsi_design",
  "robotics & automation": "robotics_automation",
  "robotics": "robotics_automation",
  "electric vehicle": "ev_powertrain",
  "power systems": "ev_powertrain",
  "cad": "cad_structural",
  "structural": "cad_structural"
};

// Fallback domain maps grouped by core branch if no specializations were selected
const BRANCH_DEFAULT_DOMAINS = {
  cse: ["software_engineering", "ai_ml", "cyber_security", "algorithms_systems", "data_science"],
  it: ["full_stack", "cloud_devops", "cyber_security", "data_science"],
  aids: ["ai_ml", "data_science", "full_stack", "cloud_devops"],
  ece: ["embedded_iot", "vlsi_design", "robotics_automation", "cyber_security"],
  eee: ["ev_powertrain", "embedded_iot", "robotics_automation", "cloud_devops"],
  mechanical: ["cad_structural", "robotics_automation", "ev_powertrain"],
  civil: ["cad_structural", "data_science", "cloud_devops"],
  chemical: ["data_science", "ai_ml", "cloud_devops"],
  mechatronics: ["robotics_automation", "embedded_iot", "ai_ml"]
};

function resolveBranchId(branchId = "cse") {
  if (!branchId) return "cse";
  const str = branchId.toLowerCase().trim();
  if (str.includes("cse") || str.includes("computer science")) return "cse";
  if (str.includes("ai & ds") || str.includes("artificial intelligence") || str.includes("aids")) return "aids";
  if (str.includes("it (") || str === "it" || str.includes("information technology")) return "it";
  if (str.includes("ece") || str.includes("electronics")) return "ece";
  if (str.includes("eee") || str.includes("electrical")) return "eee";
  if (str.includes("mechanical")) return "mechanical";
  if (str.includes("civil")) return "civil";
  if (str.includes("chemical") || str.includes("biotech")) return "chemical";
  if (str.includes("mechatronic") || str.includes("robotic")) return "mechatronics";
  return "cse";
}

/**
 * Resolves candidate domain objects based strictly on Step 4 specializations & branch
 */
function resolveCandidateDomains(branchId = "cse", specializations = []) {
  const normBranch = resolveBranchId(branchId);
  const matchedDomainIds = new Set();

  if (Array.isArray(specializations) && specializations.length > 0) {
    specializations.forEach(spec => {
      const lower = spec.toLowerCase().trim();
      let matched = false;

      // Check exact / substring matches in SPECIALIZATION_MAP
      for (const [key, domainId] of Object.entries(SPECIALIZATION_MAP)) {
        if (lower === key || lower.includes(key) || key.includes(lower)) {
          matchedDomainIds.add(domainId);
          matched = true;
          break;
        }
      }
    });
  }

  let selectedIds = Array.from(matchedDomainIds);

  // If fewer than 2 candidate domains matched, supplement from branch defaults so AHP pairwise comparisons can be formed
  if (selectedIds.length < 2) {
    const branchDefaults = BRANCH_DEFAULT_DOMAINS[normBranch] || BRANCH_DEFAULT_DOMAINS["cse"];
    branchDefaults.forEach(id => {
      if (!selectedIds.includes(id) && selectedIds.length < 3) {
        selectedIds.push(id);
      }
    });
  }

  // Limit candidate domains to top 5 maximum for pairwise comparison clarity
  selectedIds = selectedIds.slice(0, 5);

  return selectedIds.map(id => NORMALIZED_DOMAINS[id] || {
    id,
    name: id.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    category: "Specialized Domain",
    icon: "FiBriefcase",
    description: `Specialized pathway in ${id.replace(/_/g, " ")}.`
  });
}

module.exports = {
  NORMALIZED_DOMAINS,
  SPECIALIZATION_MAP,
  BRANCH_DEFAULT_DOMAINS,
  resolveCandidateDomains
};
