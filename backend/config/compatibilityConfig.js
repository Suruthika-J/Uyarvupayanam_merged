/**
 * Configurable Compatibility Engine Weightings & Threshold Settings
 */

const COMPATIBILITY_CONFIG = {
  // Configurable Weights: 40% AHP Interest Alignment + 60% Fuzzy Skill Suitability
  ahpInterestWeight: 0.40,
  fuzzySuitabilityWeight: 0.60,

  // Alignment Threshold Levels
  thresholds: {
    high: 0.70, // >= 70% is High Alignment
    medium: 0.45 // >= 45% is Medium Alignment
  },

  // Display Language Mapping
  getAlignmentLabel: (scorePercent) => {
    if (scorePercent >= 70) return "High";
    if (scorePercent >= 45) return "Medium";
    return "Moderate";
  }
};

module.exports = COMPATIBILITY_CONFIG;
