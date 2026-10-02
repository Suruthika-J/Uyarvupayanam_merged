/**
 * Configurable Domain-Specific Mamdani Fuzzy Rules & Skill Variables
 */

const SKILL_VARIABLES = [
  "analytical_thinking",
  "pattern_recognition",
  "programming_readiness",
  "system_thinking",
  "attention_to_detail",
  "persistence",
  "mathematical_readiness",
  "data_interpretation",
  "technical_curiosity"
];

const DOMAIN_FUZZY_RULES = {
  ai_ml: {
    domainId: "ai_ml",
    domainName: "AI & Machine Learning",
    requiredSkills: ["analytical_thinking", "pattern_recognition", "mathematical_readiness"],
    evaluateSuitability: (skills, behavior = {}, memberships = {}) => {
      const analytical = skills.analytical_thinking || 0.5;
      const pattern = skills.pattern_recognition || 0.5;
      const math = skills.mathematical_readiness || 0.5;
      const curiosity = skills.technical_curiosity || 0.5;

      const mAnal = memberships.analytical_thinking || { low: 0.3, medium: 0.6, high: 0.3 };
      const mPatt = memberships.pattern_recognition || { low: 0.3, medium: 0.6, high: 0.3 };
      const mMath = memberships.mathematical_readiness || { low: 0.3, medium: 0.6, high: 0.3 };

      // Fuzzy Rules using Mamdani AND (Math.min)
      const ruleHigh = Math.min(mAnal.high, mPatt.high);
      const ruleMed = Math.min(mAnal.medium, mMath.medium);
      const ruleLow = Math.min(mAnal.low, mPatt.low);

      const rulesTriggered = [
        { rule: "IF Analytical Thinking is HIGH AND Pattern Recognition is HIGH THEN AI/ML suitability is HIGH", activation: Number(ruleHigh.toFixed(4)) },
        { rule: "IF Analytical Thinking is MEDIUM AND Math Readiness is MEDIUM THEN AI/ML suitability is MEDIUM", activation: Number(ruleMed.toFixed(4)) }
      ];

      const weightedScore = (analytical * 0.35) + (pattern * 0.35) + (math * 0.20) + (curiosity * 0.10) + (behavior.high_persistence ? 0.05 : 0);
      const suitability = Math.min(1.0, Math.max(0.1, weightedScore));
      return { suitability, rulesTriggered };
    }
  },

  cyber_security: {
    domainId: "cyber_security",
    domainName: "Cyber Security & Ethical Hacking",
    requiredSkills: ["attention_to_detail", "persistence", "system_thinking"],
    evaluateSuitability: (skills, behavior = {}, memberships = {}) => {
      const detail = skills.attention_to_detail || 0.5;
      const persistence = skills.persistence || 0.5;
      const system = skills.system_thinking || 0.5;
      const analytical = skills.analytical_thinking || 0.5;

      const mDet = memberships.attention_to_detail || { low: 0.3, medium: 0.6, high: 0.3 };
      const mPers = memberships.persistence || { low: 0.3, medium: 0.6, high: 0.3 };

      const ruleHigh = Math.min(mDet.high, mPers.high);
      const ruleMed = Math.min(mDet.medium, mPers.medium);

      const rulesTriggered = [
        { rule: "IF Attention to Detail is HIGH AND Persistence is HIGH THEN Cybersecurity suitability is HIGH", activation: Number(ruleHigh.toFixed(4)) },
        { rule: "IF Attention to Detail is MEDIUM AND Persistence is MEDIUM THEN Cybersecurity suitability is MEDIUM", activation: Number(ruleMed.toFixed(4)) }
      ];

      const weightedScore = (detail * 0.35) + (persistence * 0.30) + (system * 0.25) + (analytical * 0.10) + (behavior.medium_decision_stability ? 0.05 : 0);
      const suitability = Math.min(1.0, Math.max(0.1, weightedScore));
      return { suitability, rulesTriggered };
    }
  },

  full_stack: {
    domainId: "full_stack",
    domainName: "Full Stack & Software Engineering",
    requiredSkills: ["programming_readiness", "system_thinking", "analytical_thinking"],
    evaluateSuitability: (skills, behavior = {}, memberships = {}) => {
      const prog = skills.programming_readiness || 0.5;
      const system = skills.system_thinking || 0.5;
      const analytical = skills.analytical_thinking || 0.5;
      const curiosity = skills.technical_curiosity || 0.5;

      const mProg = memberships.programming_readiness || { low: 0.3, medium: 0.6, high: 0.3 };
      const mSys = memberships.system_thinking || { low: 0.3, medium: 0.6, high: 0.3 };

      const ruleHigh = Math.min(mProg.high, mSys.high);
      const ruleMed = Math.min(mProg.medium, mSys.medium);

      const rulesTriggered = [
        { rule: "IF Programming Readiness is HIGH AND System Thinking is HIGH THEN Software Development suitability is HIGH", activation: Number(ruleHigh.toFixed(4)) },
        { rule: "IF Programming Readiness is MEDIUM AND System Thinking is MEDIUM THEN Software Development suitability is MEDIUM", activation: Number(ruleMed.toFixed(4)) }
      ];

      const weightedScore = (prog * 0.40) + (system * 0.30) + (analytical * 0.20) + (curiosity * 0.10) + (behavior.fast_response ? 0.05 : 0);
      const suitability = Math.min(1.0, Math.max(0.1, weightedScore));
      return { suitability, rulesTriggered };
    }
  },

  data_science: {
    domainId: "data_science",
    domainName: "Data Science & Big Data Analytics",
    requiredSkills: ["analytical_thinking", "mathematical_readiness", "data_interpretation"],
    evaluateSuitability: (skills, behavior = {}, memberships = {}) => {
      const analytical = skills.analytical_thinking || 0.5;
      const math = skills.mathematical_readiness || 0.5;
      const dataInterp = skills.data_interpretation || 0.5;
      const pattern = skills.pattern_recognition || 0.5;

      const mAnal = memberships.analytical_thinking || { low: 0.3, medium: 0.6, high: 0.3 };
      const mData = memberships.data_interpretation || { low: 0.3, medium: 0.6, high: 0.3 };

      const ruleHigh = Math.min(mAnal.high, mData.high);
      const ruleMed = Math.min(mAnal.medium, mData.medium);

      const rulesTriggered = [
        { rule: "IF Analytical Thinking is HIGH AND Data Interpretation is HIGH THEN Data Science suitability is HIGH", activation: Number(ruleHigh.toFixed(4)) },
        { rule: "IF Analytical Thinking is MEDIUM AND Data Interpretation is MEDIUM THEN Data Science suitability is MEDIUM", activation: Number(ruleMed.toFixed(4)) }
      ];

      const weightedScore = (analytical * 0.35) + (math * 0.30) + (dataInterp * 0.25) + (pattern * 0.10);
      const suitability = Math.min(1.0, Math.max(0.1, weightedScore));
      return { suitability, rulesTriggered };
    }
  },

  cloud_devops: {
    domainId: "cloud_devops",
    domainName: "Cloud Computing & DevOps",
    requiredSkills: ["system_thinking", "programming_readiness", "attention_to_detail"],
    evaluateSuitability: (skills, behavior = {}, memberships = {}) => {
      const system = skills.system_thinking || 0.5;
      const prog = skills.programming_readiness || 0.5;
      const detail = skills.attention_to_detail || 0.5;
      const persistence = skills.persistence || 0.5;

      const mSys = memberships.system_thinking || { low: 0.3, medium: 0.6, high: 0.3 };
      const mProg = memberships.programming_readiness || { low: 0.3, medium: 0.6, high: 0.3 };

      const ruleHigh = Math.min(mSys.high, mProg.high);
      const ruleMed = Math.min(mSys.medium, mProg.medium);

      const rulesTriggered = [
        { rule: "IF System Thinking is HIGH AND Programming Readiness is HIGH THEN Cloud/DevOps suitability is HIGH", activation: Number(ruleHigh.toFixed(4)) },
        { rule: "IF System Thinking is MEDIUM AND Programming Readiness is MEDIUM THEN Cloud/DevOps suitability is MEDIUM", activation: Number(ruleMed.toFixed(4)) }
      ];

      const weightedScore = (system * 0.40) + (prog * 0.30) + (detail * 0.20) + (persistence * 0.10);
      const suitability = Math.min(1.0, Math.max(0.1, weightedScore));
      return { suitability, rulesTriggered };
    }
  },

  embedded_iot: {
    domainId: "embedded_iot",
    domainName: "Embedded Systems & IoT",
    requiredSkills: ["system_thinking", "attention_to_detail", "programming_readiness"],
    evaluateSuitability: (skills, behavior = {}, memberships = {}) => {
      const system = skills.system_thinking || 0.5;
      const detail = skills.attention_to_detail || 0.5;
      const prog = skills.programming_readiness || 0.5;

      const weightedScore = (system * 0.40) + (detail * 0.35) + (prog * 0.25);
      return { suitability: Math.min(1.0, Math.max(0.1, weightedScore)), rulesTriggered: [] };
    }
  },

  vlsi_design: {
    domainId: "vlsi_design",
    domainName: "VLSI & Chip Design",
    requiredSkills: ["attention_to_detail", "mathematical_readiness", "analytical_thinking"],
    evaluateSuitability: (skills, behavior = {}, memberships = {}) => {
      const detail = skills.attention_to_detail || 0.5;
      const math = skills.mathematical_readiness || 0.5;
      const analytical = skills.analytical_thinking || 0.5;

      const weightedScore = (detail * 0.40) + (math * 0.35) + (analytical * 0.25);
      return { suitability: Math.min(1.0, Math.max(0.1, weightedScore)), rulesTriggered: [] };
    }
  },

  software_engineering: {
    domainId: "software_engineering",
    domainName: "Software Engineering & Architecture",
    requiredSkills: ["programming_readiness", "system_thinking", "analytical_thinking"],
    evaluateSuitability: (skills, behavior = {}, memberships = {}) => {
      const prog = skills.programming_readiness || 0.5;
      const system = skills.system_thinking || 0.5;
      const analytical = skills.analytical_thinking || 0.5;
      const curiosity = skills.technical_curiosity || 0.5;

      const mProg = memberships.programming_readiness || { low: 0.3, medium: 0.6, high: 0.3 };
      const mSys = memberships.system_thinking || { low: 0.3, medium: 0.6, high: 0.3 };

      const ruleHigh = Math.min(mProg.high, mSys.high);
      const ruleMed = Math.min(mProg.medium, mSys.medium);

      const rulesTriggered = [
        { rule: "IF Programming Readiness is HIGH AND System Thinking is HIGH THEN Software Engineering suitability is HIGH", activation: Number(ruleHigh.toFixed(4)) },
        { rule: "IF Programming Readiness is MEDIUM AND System Thinking is MEDIUM THEN Software Engineering suitability is MEDIUM", activation: Number(ruleMed.toFixed(4)) }
      ];

      const weightedScore = (prog * 0.40) + (system * 0.30) + (analytical * 0.20) + (curiosity * 0.10) + (behavior.fast_response ? 0.05 : 0);
      const suitability = Math.min(1.0, Math.max(0.1, weightedScore));
      return { suitability, rulesTriggered };
    }
  },

  algorithms_systems: {
    domainId: "algorithms_systems",
    domainName: "Algorithms & System Programming",
    requiredSkills: ["analytical_thinking", "system_thinking", "mathematical_readiness"],
    evaluateSuitability: (skills, behavior = {}, memberships = {}) => {
      const analytical = skills.analytical_thinking || 0.5;
      const system = skills.system_thinking || 0.5;
      const math = skills.mathematical_readiness || 0.5;

      const mAnal = memberships.analytical_thinking || { low: 0.3, medium: 0.6, high: 0.3 };
      const mSys = memberships.system_thinking || { low: 0.3, medium: 0.6, high: 0.3 };

      const ruleHigh = Math.min(mAnal.high, mSys.high);
      const ruleMed = Math.min(mAnal.medium, mSys.medium);

      const rulesTriggered = [
        { rule: "IF Analytical Thinking is HIGH AND System Thinking is HIGH THEN Algorithms suitability is HIGH", activation: Number(ruleHigh.toFixed(4)) },
        { rule: "IF Analytical Thinking is MEDIUM AND System Thinking is MEDIUM THEN Algorithms suitability is MEDIUM", activation: Number(ruleMed.toFixed(4)) }
      ];

      const weightedScore = (analytical * 0.40) + (system * 0.35) + (math * 0.25);
      const suitability = Math.min(1.0, Math.max(0.1, weightedScore));
      return { suitability, rulesTriggered };
    }
  },

  ev_powertrain: {
    domainId: "ev_powertrain",
    domainName: "Electric Vehicle & Power Systems",
    requiredSkills: ["system_thinking", "attention_to_detail", "persistence"],
    evaluateSuitability: (skills, behavior = {}, memberships = {}) => {
      const system = skills.system_thinking || 0.5;
      const detail = skills.attention_to_detail || 0.5;
      const persistence = skills.persistence || 0.5;

      const weightedScore = (system * 0.40) + (detail * 0.35) + (persistence * 0.25);
      return { suitability: Math.min(1.0, Math.max(0.1, weightedScore)), rulesTriggered: [] };
    }
  },

  cad_structural: {
    domainId: "cad_structural",
    domainName: "CAD Modeling & Structural Engineering",
    requiredSkills: ["attention_to_detail", "system_thinking", "analytical_thinking"],
    evaluateSuitability: (skills, behavior = {}, memberships = {}) => {
      const detail = skills.attention_to_detail || 0.5;
      const system = skills.system_thinking || 0.5;
      const analytical = skills.analytical_thinking || 0.5;

      const weightedScore = (detail * 0.40) + (system * 0.35) + (analytical * 0.25);
      return { suitability: Math.min(1.0, Math.max(0.1, weightedScore)), rulesTriggered: [] };
    }
  },

  robotics_automation: {
    domainId: "robotics_automation",
    domainName: "Robotics & Automation",
    requiredSkills: ["system_thinking", "pattern_recognition", "programming_readiness"],
    evaluateSuitability: (skills, behavior = {}, memberships = {}) => {
      const system = skills.system_thinking || 0.5;
      const pattern = skills.pattern_recognition || 0.5;
      const prog = skills.programming_readiness || 0.5;

      const weightedScore = (system * 0.35) + (pattern * 0.35) + (prog * 0.30);
      return { suitability: Math.min(1.0, Math.max(0.1, weightedScore)), rulesTriggered: [] };
    }
  }
};

module.exports = {
  SKILL_VARIABLES,
  DOMAIN_FUZZY_RULES
};
