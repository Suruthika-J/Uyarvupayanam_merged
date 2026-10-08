/**
 * Exam Topic Priority Service
 * Strictly calculates topic priority based on weighted parameters.
 */

function calculateTopicPriority({
  syllabusWeight = 50,
  historicalFrequency = null,
  recentFrequency = null,
  sectionWeight = 50,
  studentWeakness = 0,
  hasPreviousPaperEvidence = true
}) {
  let priorityScore = 0;
  let evidenceLabel = "Verified Exam Intelligence";

  if (hasPreviousPaperEvidence && historicalFrequency !== null && recentFrequency !== null) {
    priorityScore = Math.round(
      0.30 * Number(syllabusWeight || 50) +
      0.25 * Number(historicalFrequency || 50) +
      0.20 * Number(recentFrequency || 50) +
      0.15 * Number(sectionWeight || 50) +
      0.10 * Number(studentWeakness || 0)
    );
  } else {
    // Formula without historical frequency: re-weight remaining factors
    priorityScore = Math.round(
      0.55 * Number(syllabusWeight || 50) +
      0.30 * Number(sectionWeight || 50) +
      0.15 * Number(studentWeakness || 0)
    );
    evidenceLabel = "Limited historical evidence";
  }

  // Ensure 0 - 100 range
  priorityScore = Math.max(0, Math.min(100, priorityScore));

  let priorityLabel = "MEDIUM";
  if (priorityScore >= 80) priorityLabel = "CRITICAL";
  else if (priorityScore >= 60) priorityLabel = "HIGH";
  else if (priorityScore >= 40) priorityLabel = "MEDIUM";
  else priorityLabel = "LOW";

  return {
    priorityScore,
    priorityLabel,
    evidenceLabel,
    hasPreviousPaperEvidence
  };
}

module.exports = {
  calculateTopicPriority
};
