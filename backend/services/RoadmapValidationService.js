/**
 * RoadmapValidationService.js
 * Validates & Repairs LLM-generated Learning Roadmap JSON structures
 */

class RoadmapValidationService {
  /**
   * Validates & repairs roadmap JSON
   */
  static validateAndRepair(roadmapData, topicName = "Learning Topic") {
    if (!roadmapData || typeof roadmapData !== "object") {
      roadmapData = {};
    }

    const cleanTitle = roadmapData.title || `${topicName} Learning Roadmap`;
    const cleanDesc = roadmapData.description || `Structured preparation roadmap for ${topicName}.`;
    const sections = Array.isArray(roadmapData.sections) ? roadmapData.sections : [];

    const validSections = [];
    const seenTopicIds = new Set();
    const seenTopicNames = new Set();

    sections.forEach((sec, sIdx) => {
      const secId = sec.sectionId || `sec-${sIdx + 1}`;
      const secTitle = sec.title || `Phase ${sIdx + 1}: Core Concepts`;
      const rawTopics = Array.isArray(sec.topics) ? sec.topics : [];

      const validTopics = [];
      rawTopics.forEach((top, tIdx) => {
        const topName = top.name || top.topicName || `Topic ${tIdx + 1}`;
        const normName = topName.toLowerCase().trim();

        if (seenTopicNames.has(normName)) {
          return; // Skip duplicate topics
        }
        seenTopicNames.add(normName);

        let topId = top.topicId || `top-${sIdx + 1}-${tIdx + 1}`;
        if (seenTopicIds.has(topId)) {
          topId = `${topId}-${Date.now()}-${tIdx}`;
        }
        seenTopicIds.add(topId);

        validTopics.push({
          topicId: topId,
          name: topName,
          description: top.description || `Master core concepts and problem-solving techniques for ${topName}.`,
          priority: ["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(top.priority) ? top.priority : "HIGH",
          difficulty: ["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(top.difficulty) ? top.difficulty : "BEGINNER",
          estimatedHours: Math.max(1, parseFloat(top.estimatedHours) || 4),
          conceptHours: Math.max(0.5, parseFloat(top.conceptHours) || 1.5),
          practiceHours: Math.max(0.5, parseFloat(top.practiceHours) || 1.5),
          revisionHours: Math.max(0.25, parseFloat(top.revisionHours) || 0.5),
          assessmentHours: Math.max(0.25, parseFloat(top.assessmentHours) || 0.5),
          practiceMinutes: Math.max(30, parseInt(top.practiceMinutes) || 90),
          revisionMinutes: Math.max(15, parseInt(top.revisionMinutes) || 30),
          recommendedQuestions: Math.max(10, parseInt(top.recommendedQuestions) || 30),
          prerequisites: Array.isArray(top.prerequisites) ? top.prerequisites : [],
          skillsGained: Array.isArray(top.skillsGained) ? top.skillsGained : [topName],
          isCompleted: false
        });
      });

      if (validTopics.length > 0) {
        validSections.push({
          sectionId: secId,
          title: secTitle,
          description: sec.description || `Essential topics covering ${secTitle}`,
          priority: sec.priority || "HIGH",
          topics: validTopics
        });
      }
    });

    return {
      title: cleanTitle,
      description: cleanDesc,
      estimatedTotalHours: Math.max(10, parseFloat(roadmapData.estimatedTotalHours) || 40),
      recommendedDurationWeeks: Math.max(1, parseInt(roadmapData.recommendedDurationWeeks) || 4),
      sections: validSections,
      milestones: Array.isArray(roadmapData.milestones) ? roadmapData.milestones : [],
      mockTests: Array.isArray(roadmapData.mockTests) ? roadmapData.mockTests : [],
      sources: Array.isArray(roadmapData.sources) ? roadmapData.sources : []
    };
  }
}

module.exports = RoadmapValidationService;
