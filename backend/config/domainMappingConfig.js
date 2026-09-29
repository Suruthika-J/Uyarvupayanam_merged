/**
 * Centralized Domain Mapping & Taxonomy Configuration
 * Maps Step 4 specializations & core branches to normalized career domain IDs.
 */

const NORMALIZED_DOMAINS = {
  ai_ml: {
    id: "ai_ml",
    name: "AI & Machine Learning",
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
    icon: "FiBriefcase",
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
  // AI / ML
  "artificial intelligence": "ai_ml",
  "machine learning": "ai_ml",
  "ai & machine learning": "ai_ml",
  "ai & ml": "ai_ml",
  "deep learning": "ai_ml",
  "nlp": "ai_ml",
  "computer vision": "ai_ml",
  "generative ai": "ai_ml",
  "llm": "ai_ml",

  // Cyber Security
  "cyber security": "cyber_security",
  "ethical hacking": "cyber_security",
  "cyber security & ethical hacking": "cyber_security",
  "information security": "cyber_security",
  "network security": "cyber_security",
  "devsecops": "cyber_security",

  // Full Stack
  "full stack": "full_stack",
  "full stack web & mobile development": "full_stack",
  "web development": "full_stack",
  "software engineering": "full_stack",
  "mobile development": "full_stack",
  "react": "full_stack",
  "java": "full_stack",

  // Data Science
  "data science": "data_science",
  "big data": "data_science",
  "data science & big data analytics": "data_science",
  "data analytics": "data_science",
  "data engineering": "data_science",
  "business intelligence": "data_science",

  // Cloud & DevOps
  "cloud computing": "cloud_devops",
  "devops": "cloud_devops",
  "cloud computing & devops": "cloud_devops",
  "cloud architecture": "cloud_devops",
  "aws": "cloud_devops",
  "kubernetes": "cloud_devops",

  // ECE / EEE / Core
  "embedded": "embedded_iot",
  "embedded systems & iot": "embedded_iot",
  "iot": "embedded_iot",
  "vlsi": "vlsi_design",
  "vlsi & chip design": "vlsi_design",
  "robotics": "robotics_automation",
  "robotics & automation": "robotics_automation",
  "electric vehicle": "ev_powertrain",
  "power systems": "ev_powertrain",
  "cad": "cad_structural",
  "3d modeling": "cad_structural",
  "structural": "cad_structural"
};

// Fallback domain maps grouped by core branch
const BRANCH_DEFAULT_DOMAINS = {
  cse: ["full_stack", "ai_ml", "cyber_security", "data_science", "cloud_devops"],
  it: ["full_stack", "cloud_devops", "cyber_security", "data_science"],
  aids: ["ai_ml", "data_science", "full_stack", "cloud_devops"],
  ece: ["embedded_iot", "vlsi_design", "robotics_automation", "cyber_security"],
  eee: ["ev_powertrain", "embedded_iot", "robotics_automation", "cloud_devops"],
  mechanical: ["cad_structural", "robotics_automation", "ev_powertrain"],
  civil: ["cad_structural", "data_science", "cloud_devops"],
  chemical: ["data_science", "ai_ml", "cloud_devops"],
  mechatronics: ["robotics_automation", "embedded_iot", "ai_ml"]
};

/**
 * Resolves candidate domain objects based on Step 4 specializations & branch
 */
function resolveCandidateDomains(branchId = "cse", specializations = []) {
  const normBranch = (branchId || "cse").toLowerCase().trim();
  const matchedDomainIds = new Set();

  if (Array.isArray(specializations) && specializations.length > 0) {
    specializations.forEach(spec => {
      const lower = spec.toLowerCase().trim();
      Object.keys(SPECIALIZATION_MAP).forEach(key => {
        if (lower.includes(key) || key.includes(lower)) {
          matchedDomainIds.add(SPECIALIZATION_MAP[key]);
        }
      });
    });
  }

  // If specializations produced at least 2 candidate domains, return them
  let selectedIds = Array.from(matchedDomainIds);

  // Fallback to branch defaults if matching resulted in fewer than 2 candidate domains
  if (selectedIds.length < 2) {
    const branchDefaults = BRANCH_DEFAULT_DOMAINS[normBranch] || BRANCH_DEFAULT_DOMAINS["cse"];
    branchDefaults.forEach(id => {
      if (!selectedIds.includes(id)) {
        selectedIds.push(id);
      }
    });
  }

  // Limit candidate domains to top 5 maximum for pairwise comparison clarity
  selectedIds = selectedIds.slice(0, 5);

  return selectedIds.map(id => NORMALIZED_DOMAINS[id] || NORMALIZED_DOMAINS["full_stack"]);
}

module.exports = {
  NORMALIZED_DOMAINS,
  SPECIALIZATION_MAP,
  BRANCH_DEFAULT_DOMAINS,
  resolveCandidateDomains
};
