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
    requiredSkills: ["analytical_thinking", "pattern_recognition", "mathematical_readiness"],
    evaluateSuitability: (skills, behavior = {}) => {
      const analytical = skills.analytical_thinking || 0.5;
      const pattern = skills.pattern_recognition || 0.5;
      const math = skills.mathematical_readiness || 0.5;
      const curiosity = skills.technical_curiosity || 0.5;
      const persistenceBonus = (behavior.high_persistence ? 0.08 : 0);

      // Rule: IF analytical HIGH AND pattern HIGH AND math HIGH THEN ai_ml_suitability HIGH
      const suitability = (analytical * 0.35) + (pattern * 0.35) + (math * 0.20) + (curiosity * 0.10) + persistenceBonus;
      return Math.min(1.0, Math.max(0.1, suitability));
    }
  },

  cyber_security: {
    domainId: "cyber_security",
    requiredSkills: ["attention_to_detail", "persistence", "system_thinking"],
    evaluateSuitability: (skills, behavior = {}) => {
      const detail = skills.attention_to_detail || 0.5;
      const persistence = skills.persistence || 0.5;
      const system = skills.system_thinking || 0.5;
      const analytical = skills.analytical_thinking || 0.5;
      const stabilityBonus = (behavior.medium_decision_stability ? 0.05 : 0);

      // Rule: IF attention_to_detail HIGH AND persistence HIGH AND system_thinking HIGH THEN cyber_security HIGH
      const suitability = (detail * 0.35) + (persistence * 0.30) + (system * 0.25) + (analytical * 0.10) + stabilityBonus;
      return Math.min(1.0, Math.max(0.1, suitability));
    }
  },

  full_stack: {
    domainId: "full_stack",
    requiredSkills: ["programming_readiness", "system_thinking", "analytical_thinking"],
    evaluateSuitability: (skills, behavior = {}) => {
      const prog = skills.programming_readiness || 0.5;
      const system = skills.system_thinking || 0.5;
      const analytical = skills.analytical_thinking || 0.5;
      const curiosity = skills.technical_curiosity || 0.5;
      const fastBonus = (behavior.fast_response ? 0.05 : 0);

      // Rule: IF programming_readiness HIGH AND system_thinking HIGH AND analytical HIGH THEN full_stack HIGH
      const suitability = (prog * 0.40) + (system * 0.30) + (analytical * 0.20) + (curiosity * 0.10) + fastBonus;
      return Math.min(1.0, Math.max(0.1, suitability));
    }
  },

  data_science: {
    domainId: "data_science",
    requiredSkills: ["analytical_thinking", "mathematical_readiness", "data_interpretation"],
    evaluateSuitability: (skills, behavior = {}) => {
      const analytical = skills.analytical_thinking || 0.5;
      const math = skills.mathematical_readiness || 0.5;
      const dataInterp = skills.data_interpretation || 0.5;
      const pattern = skills.pattern_recognition || 0.5;

      // Rule: IF analytical HIGH AND math HIGH AND data_interpretation HIGH THEN data_science HIGH
      const suitability = (analytical * 0.35) + (math * 0.30) + (dataInterp * 0.25) + (pattern * 0.10);
      return Math.min(1.0, Math.max(0.1, suitability));
    }
  },

  cloud_devops: {
    domainId: "cloud_devops",
    requiredSkills: ["system_thinking", "programming_readiness", "attention_to_detail"],
    evaluateSuitability: (skills, behavior = {}) => {
      const system = skills.system_thinking || 0.5;
      const prog = skills.programming_readiness || 0.5;
      const detail = skills.attention_to_detail || 0.5;
      const persistence = skills.persistence || 0.5;

      // Rule: IF system_thinking HIGH AND programming_readiness HIGH AND attention_to_detail HIGH THEN cloud_devops HIGH
      const suitability = (system * 0.40) + (prog * 0.30) + (detail * 0.20) + (persistence * 0.10);
      return Math.min(1.0, Math.max(0.1, suitability));
    }
  },

  embedded_iot: {
    domainId: "embedded_iot",
    requiredSkills: ["system_thinking", "attention_to_detail", "programming_readiness"],
    evaluateSuitability: (skills, behavior = {}) => {
      const system = skills.system_thinking || 0.5;
      const detail = skills.attention_to_detail || 0.5;
      const prog = skills.programming_readiness || 0.5;

      const suitability = (system * 0.40) + (detail * 0.35) + (prog * 0.25);
      return Math.min(1.0, Math.max(0.1, suitability));
    }
  },

  vlsi_design: {
    domainId: "vlsi_design",
    requiredSkills: ["attention_to_detail", "mathematical_readiness", "analytical_thinking"],
    evaluateSuitability: (skills, behavior = {}) => {
      const detail = skills.attention_to_detail || 0.5;
      const math = skills.mathematical_readiness || 0.5;
      const analytical = skills.analytical_thinking || 0.5;

      const suitability = (detail * 0.40) + (math * 0.35) + (analytical * 0.25);
      return Math.min(1.0, Math.max(0.1, suitability));
    }
  },

  robotics_automation: {
    domainId: "robotics_automation",
    requiredSkills: ["system_thinking", "pattern_recognition", "programming_readiness"],
    evaluateSuitability: (skills, behavior = {}) => {
      const system = skills.system_thinking || 0.5;
      const pattern = skills.pattern_recognition || 0.5;
      const prog = skills.programming_readiness || 0.5;

      const suitability = (system * 0.35) + (pattern * 0.35) + (prog * 0.30);
      return Math.min(1.0, Math.max(0.1, suitability));
    }
  }
};

module.exports = {
  SKILL_VARIABLES,
  DOMAIN_FUZZY_RULES
};
