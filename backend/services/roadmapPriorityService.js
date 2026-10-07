/**
 * roadmapPriorityService.js
 * Deterministic Priority Scoring Engine for Learning Roadmap Topics
 *
 * Formula:
 * priorityScore = 0.30 * examFrequency + 0.20 * prerequisiteImportance
 *               + 0.20 * foundationalValue + 0.15 * difficultyAdjustment
 *               + 0.15 * careerRelevance
 */

class RoadmapPriorityService {
  /**
   * Calculates deterministic priority score and maps to CRITICAL, HIGH, MEDIUM, LOW
   */
  static calculateTopicPriority({
    topicName,
    category,
    prerequisiteCount = 0,
    difficulty = "BEGINNER",
    goal = "PLACEMENT"
  }) {
    const normName = (topicName || "").toLowerCase();

    // 1. Exam Frequency (0-100)
    let examFrequency = 50;
    if (/percentage|ratio|profit|time|speed|join|sql|tree|graph|hook|state|array|loop/i.test(normName)) {
      examFrequency = 90;
    } else if (/pointer|recursion|normal|acid|component|logic|function/i.test(normName)) {
      examFrequency = 75;
    }

    // 2. Prerequisite Importance (0-100) - Foundational topics get higher score
    let prerequisiteImportance = prerequisiteCount > 0 ? Math.min(50 + prerequisiteCount * 15, 90) : 85;

    // 3. Foundational Value (0-100)
    let foundationalValue = 60;
    if (/basic|foundational|intro|syntax|arithmetic|number|concept/i.test(normName)) {
      foundationalValue = 95;
    }

    // 4. Difficulty Adjustment (0-100)
    let difficultyAdjustment = 70;
    if (difficulty === "BEGINNER") difficultyAdjustment = 80;
    if (difficulty === "INTERMEDIATE") difficultyAdjustment = 70;
    if (difficulty === "ADVANCED") difficultyAdjustment = 60;

    // 5. Career Relevance (0-100)
    let careerRelevance = goal === "PLACEMENT" ? 85 : 75;

    // Weighted Priority Calculation
    const priorityScore = Math.round(
      0.30 * examFrequency +
      0.20 * prerequisiteImportance +
      0.20 * foundationalValue +
      0.15 * difficultyAdjustment +
      0.15 * careerRelevance
    );

    // Map to Priority Badges
    let priority = "MEDIUM";
    if (priorityScore >= 80) priority = "CRITICAL";
    else if (priorityScore >= 60) priority = "HIGH";
    else if (priorityScore >= 40) priority = "MEDIUM";
    else priority = "LOW";

    return { priorityScore, priority };
  }
}

module.exports = RoadmapPriorityService;
