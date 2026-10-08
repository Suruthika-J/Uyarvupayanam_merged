/**
 * learningRoadmapGeneratorService.js
 * Main Orchestrator Service for AI-Powered Dynamic Learning Roadmaps
 */

const axios = require("axios");
const TopicClassificationService = require("./topicClassificationService");
const LearningRoadmapResearchService = require("./learningRoadmapResearchService");
const PrerequisiteGraphService = require("./prerequisiteGraphService");
const RoadmapPriorityService = require("./roadmapPriorityService");
const StudyTimeEstimatorService = require("./studyTimeEstimatorService");
const RoadmapValidationService = require("./RoadmapValidationService");
const LearningRoadmap = require("../models/LearningRoadmap");

class LearningRoadmapGeneratorService {
  /**
   * Main entry point to generate or retrieve a dynamic learning roadmap
   */
  static async generateRoadmap({
    topic,
    level = "BEGINNER",
    goal = "PLACEMENT",
    hoursPerDay = 2,
    targetDate = null,
    userId = null,
    studentProfile = null,
    forceRegenerate = false
  }) {
    if (!topic || !topic.trim()) {
      throw new Error("Topic is required to generate a learning roadmap.");
    }

    const rawTopic = topic.trim();
    const normalizedTopic = rawTopic.toLowerCase();
    const cleanLevel = ["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(level?.toUpperCase()) ? level.toUpperCase() : "BEGINNER";
    const cleanGoal = ["PLACEMENT", "EXAM", "CERTIFICATION", "PROJECT", "GENERAL"].includes(goal?.toUpperCase()) ? goal.toUpperCase() : "PLACEMENT";
    const cleanHours = Math.max(1, parseFloat(hoursPerDay) || 2);

    // 1. Check existing cached roadmap for user if not forced
    if (userId && !forceRegenerate) {
      const existing = await LearningRoadmap.findOne({
        userId,
        normalizedTopic,
        level: cleanLevel,
        goal: cleanGoal,
        status: "ACTIVE"
      });

      if (existing) {
        return existing;
      }
    }

    // 2. Classify Topic
    const classification = TopicClassificationService.classifyTopic(rawTopic);

    // 3. Web Research via ResearchProvider
    const research = await LearningRoadmapResearchService.researchTopic(rawTopic, userId);

    // 4. Call LLM for Structured Syllabus
    let llmResult = await this._callLlmForSyllabus({
      topic: rawTopic,
      category: classification.category,
      level: cleanLevel,
      goal: cleanGoal,
      research,
      studentProfile
    });

    // 5. Validate & Repair LLM JSON Structure
    let structured = RoadmapValidationService.validateAndRepair(llmResult, rawTopic);

    // 6. Apply Deterministic Priority Engine & Study Time Estimator to every topic
    let grandTotalHours = 0;
    const processedSections = structured.sections.map((sec, sIdx) => {
      let secHours = 0;

      // Apply prerequisite topological ordering
      const orderedTopics = PrerequisiteGraphService.orderTopicsByPrerequisites(sec.topics, classification.category);

      const processedTopics = orderedTopics.map(top => {
        // Deterministic Priority Score
        const priorityData = RoadmapPriorityService.calculateTopicPriority({
          topicName: top.name,
          category: classification.category,
          prerequisiteCount: top.prerequisites?.length || 0,
          difficulty: top.difficulty || cleanLevel,
          goal: cleanGoal
        });

        // Deterministic Study Time Calculation
        const timeData = StudyTimeEstimatorService.estimateTopicTime({
          difficulty: top.difficulty || cleanLevel,
          priority: priorityData.priority,
          level: cleanLevel
        });

        secHours += timeData.totalHours;

        return {
          ...top,
          priority: priorityData.priority,
          priorityScore: priorityData.priorityScore,
          estimatedHours: timeData.totalHours,
          conceptHours: timeData.conceptHours,
          practiceHours: timeData.practiceHours,
          revisionHours: timeData.revisionHours,
          assessmentHours: timeData.assessmentHours,
          practiceMinutes: timeData.practiceMinutes,
          revisionMinutes: timeData.revisionMinutes,
          recommendedQuestions: timeData.recommendedQuestions
        };
      });

      grandTotalHours += secHours;

      return {
        ...sec,
        estimatedHours: Math.round(secHours),
        priority: processedTopics[0]?.priority || "HIGH",
        topics: processedTopics
      };
    });

    // 7. Calculate total duration in weeks
    const recommendedDurationWeeks = Math.max(1, Math.ceil(grandTotalHours / (cleanHours * 7)));

    // 8. Formulate Daily & Weekly Schedules
    const { dailyPlans, weeklyPlans } = StudyTimeEstimatorService.generateSchedule({
      sections: processedSections,
      availableHoursPerDay: cleanHours
    });

    // 9. Build Milestones
    const milestones = processedSections.map((sec, idx) => ({
      phase: `Phase ${idx + 1}`,
      title: sec.title,
      description: sec.description || `Master all topics in ${sec.title}`,
      targetWeek: Math.max(1, Math.ceil((idx + 1) * (recommendedDurationWeeks / processedSections.length))),
      isCompleted: false
    }));

    // 10. Deactivate previous active roadmaps for user
    if (userId) {
      await LearningRoadmap.updateMany({ userId, isCurrentActive: true }, { isCurrentActive: false });
    }

    // 11. Create & Save New LearningRoadmap Document
    const roadmapDoc = await LearningRoadmap.create({
      userId: userId || "650000000000000000000001",
      title: `${rawTopic.toUpperCase()} Learning Roadmap`,
      topic: rawTopic,
      normalizedTopic,
      category: classification.category,
      level: cleanLevel,
      goal: cleanGoal,
      availableHoursPerDay: cleanHours,
      targetDate: targetDate ? new Date(targetDate) : null,
      totalEstimatedHours: Math.round(grandTotalHours),
      estimatedWeeks: recommendedDurationWeeks,
      progressPercentage: 0,
      placementReadyScore: 0,
      readinessStatus: "Building Foundation",
      status: "ACTIVE",
      isCurrentActive: true,

      sections: processedSections,
      milestones,
      dailyPlans,
      weeklyPlans,

      completedTopics: [],
      weakTopics: [],
      strongTopics: [],

      sources: research.sources || [],
      researchConfidence: research.confidence || "HIGH",
      confidenceReason: research.confidenceReason || "Roadmap supported by educational sources."
    });

    return roadmapDoc;
  }

  /**
   * Internal helper for LLM structured JSON generation
   */
  static async _callLlmForSyllabus({ topic, category, level, goal, research, studentProfile }) {
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      try {
        const prompt = `
You are an expert curriculum designer creating a structured learning roadmap.
Topic: ${topic}
Category: ${category}
Level: ${level}
Goal: ${goal}
Research Findings: ${research?.researchSummary || 'Standard educational syllabus'}

Generate a structured learning roadmap in STRICT JSON ONLY. No markdown, no conversational text.
JSON Structure:
{
  "title": "${topic} Learning Roadmap",
  "description": "Structured curriculum covering core concepts, practice, and mastery for ${topic}.",
  "estimatedTotalHours": 40,
  "recommendedDurationWeeks": 4,
  "sections": [
    {
      "sectionId": "sec-1",
      "title": "Phase 1: Foundations",
      "description": "Core concepts and basic principles",
      "priority": "HIGH",
      "topics": [
        {
          "topicId": "top-1-1",
          "name": "Topic Name",
          "description": "Detailed description of topic",
          "priority": "HIGH",
          "difficulty": "${level}",
          "estimatedHours": 4,
          "prerequisites": [],
          "skillsGained": ["Skill 1"]
        }
      ]
    }
  ]
}
`;
        const res = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: process.env.AI_QUESTIONS_MODEL || "openai/gpt-oss-120b",
            messages: [
              { role: "system", content: "You output strictly valid JSON object roadmaps." },
              { role: "user", content: prompt }
            ],
            temperature: 0.4,
            max_tokens: 2500
          },
          {
            headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
            timeout: 12000
          }
        );

        const text = res.data?.choices?.[0]?.message?.content || "";
        const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(clean);
      } catch (err) {
        console.warn("[LearningRoadmapGeneratorService] LLM call failed, using research-derived template:", err.message);
      }
    }

    // Fallback: Research-Derived Structural Syllabus
    const identifiedTopics = research?.identifiedTopics || [`${topic} Core Concepts`, `${topic} Intermediate Applications`, `${topic} Advanced Practice` ];
    const identifiedSections = research?.identifiedSections || ["Phase 1: Fundamentals", "Phase 2: Applied Mastery"];

    return {
      title: `${topic} Learning Roadmap`,
      description: `Structured curriculum for ${topic} based on educational sources.`,
      estimatedTotalHours: 36,
      recommendedDurationWeeks: 4,
      sections: identifiedSections.map((secTitle, sIdx) => ({
        sectionId: `sec-${sIdx + 1}`,
        title: secTitle,
        description: `Topics covering ${secTitle}`,
        priority: "HIGH",
        topics: identifiedTopics.slice(sIdx * 5, (sIdx + 1) * 5 + 3).map((tName, tIdx) => ({
          topicId: `top-${sIdx + 1}-${tIdx + 1}`,
          name: typeof tName === "string" ? tName : `Topic ${tIdx + 1}`,
          description: `Master key concepts and practical applications for ${tName}`,
          priority: "HIGH",
          difficulty: level,
          estimatedHours: 4,
          prerequisites: [],
          skillsGained: [typeof tName === "string" ? tName : topic]
        }))
      }))
    };
  }
}

module.exports = LearningRoadmapGeneratorService;
