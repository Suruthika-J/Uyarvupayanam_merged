/**
 * Exam Readiness Service
 * Calculates empirical exam readiness score without claiming guaranteed passes.
 */

function calculateExamReadiness({
  syllabusCompletion = 0,
  topicMastery = 0,
  practiceAccuracy = 0,
  mockPerformance = 0,
  consistency = 50
}) {
  let readinessScore = Math.round(
    0.25 * Math.max(0, Math.min(100, Number(syllabusCompletion || 0))) +
    0.25 * Math.max(0, Math.min(100, Number(topicMastery || 0))) +
    0.20 * Math.max(0, Math.min(100, Number(practiceAccuracy || 0))) +
    0.20 * Math.max(0, Math.min(100, Number(mockPerformance || 0))) +
    0.10 * Math.max(0, Math.min(100, Number(consistency || 50)))
  );

  readinessScore = Math.max(0, Math.min(100, readinessScore));

  let readinessStatus = "Getting Started";
  if (readinessScore >= 90) readinessStatus = "Highly Prepared";
  else if (readinessScore >= 75) readinessStatus = "Exam Ready Soon";
  else if (readinessScore >= 60) readinessStatus = "Good Progress";
  else if (readinessScore >= 40) readinessStatus = "Building Foundation";

  return {
    readinessScore,
    readinessStatus,
    disclaimer: "This readiness score is an empirical estimate based on your completed syllabus topics, practice accuracy, and mock test scores. Actual exam performance depends on real-time test conditions."
  };
}

module.exports = {
  calculateExamReadiness
};
