/**
 * Study Plan Engine
 * Generates personalized exam-specific phases, weekly agendas, and daily schedules.
 */

const { calculateTopicPriority } = require("./ExamTopicPriorityService");

function generateExamPhases(examId = "", category = "") {
  const normalized = String(examId).toLowerCase();

  if (normalized.includes("gate")) {
    return [
      { phaseNumber: 1, title: "Phase 1: Engineering Mathematics & Foundational Concepts", description: "Master fundamental mathematics and core engineering principles.", durationWeeks: 3, weekRange: "Weeks 1-3", focusTopics: ["Engineering Mathematics", "General Aptitude"] },
      { phaseNumber: 2, title: "Phase 2: Core Subject Syllabus Deep Dive", description: "Comprehensive coverage of core technical papers and problem solving.", durationWeeks: 5, weekRange: "Weeks 4-8", focusTopics: ["Core Subjects", "Technical Concepts"] },
      { phaseNumber: 3, title: "Phase 3: Previous Year Questions (PYQs)", description: "Solve last 15 years GATE question papers with detailed step-by-step solutions.", durationWeeks: 3, weekRange: "Weeks 9-11", focusTopics: ["GATE PYQ Archive"] },
      { phaseNumber: 4, title: "Phase 4: Full-Length CBT Mock Tests", description: "Simulated GATE Computer Based Test environment with virtual calculator practice.", durationWeeks: 2, weekRange: "Weeks 12-13", focusTopics: ["Full Mocks", "Speed & Accuracy"] },
      { phaseNumber: 5, title: "Phase 5: Final Revision & Formula Check", description: "Quick revision of short notes, formulas, and high-weightage weak areas.", durationWeeks: 1, weekRange: "Week 14", focusTopics: ["Formula Revision", "Weak Area Drills"] }
    ];
  }

  if (normalized.includes("cat") || normalized.includes("xat")) {
    return [
      { phaseNumber: 1, title: "Phase 1: Conceptual Foundations (Quant, VARC, DILR)", description: "Build speed and accuracy across Quantitative Ability, Reading Comprehension, and Data Interpretation.", durationWeeks: 4, weekRange: "Weeks 1-4", focusTopics: ["Arithmetic", "Algebra", "VARC Passages", "DILR Puzzles"] },
      { phaseNumber: 2, title: "Phase 2: Sectional Mastery & Advanced Puzzles", description: "Solve high-difficulty CAT-level sectional tests and complex DILR sets.", durationWeeks: 4, weekRange: "Weeks 5-8", focusTopics: ["Advanced Geometry", "Modern Math", "Complex DILR Sets"] },
      { phaseNumber: 3, title: "Phase 3: CAT Previous Year Papers & Mock Analysis", description: "Take official CAT slot papers under timed conditions.", durationWeeks: 3, weekRange: "Weeks 9-11", focusTopics: ["CAT Slot Papers", "Percentile Strategy"] },
      { phaseNumber: 4, title: "Phase 4: Full-Length Mocks & Revision", description: "Take 10+ full CAT mocks with in-depth time management analysis.", durationWeeks: 2, weekRange: "Weeks 12-13", focusTopics: ["Full Mocks", "Percentile Maximization"] }
    ];
  }

  if (normalized.includes("upsc") || normalized.includes("tnpsc")) {
    return [
      { phaseNumber: 1, title: "Phase 1: Foundation GS & NCERT Core", description: "Build strong fundamentals across Indian Polity, Modern History, Geography, and Economy.", durationWeeks: 4, weekRange: "Weeks 1-4", focusTopics: ["Polity", "History", "Geography", "Economy"] },
      { phaseNumber: 2, title: "Phase 2: Advanced GS & CSAT Mastery", description: "In-depth coverage of Environment, Science & Tech, and CSAT Aptitude.", durationWeeks: 4, weekRange: "Weeks 5-8", focusTopics: ["Environment", "Science & Tech", "CSAT Comprehension & Math"] },
      { phaseNumber: 3, title: "Phase 3: Current Affairs & Previous Year Papers", description: "Integrate 12 months of Current Affairs with 10 years of Prelims question papers.", durationWeeks: 3, weekRange: "Weeks 9-11", focusTopics: ["Current Affairs", "UPSC Prelims PYQs"] },
      { phaseNumber: 4, title: "Phase 4: Prelims Mock Series & Mains Orientation", description: "Take full-length GS & CSAT mocks and practice answer structuring.", durationWeeks: 3, weekRange: "Weeks 12-14", focusTopics: ["Prelims Mocks", "Answer Writing Basics"] }
    ];
  }

  // Default Exam Phases (e.g. SSC CGL, Banking, RRB, PSU)
  return [
    { phaseNumber: 1, title: "Phase 1: Foundational Concepts & Shortcuts", description: "Learn key concepts, speed math techniques, and basic grammar rules.", durationWeeks: 3, weekRange: "Weeks 1-3", focusTopics: ["Quantitative Aptitude", "Reasoning", "English"] },
    { phaseNumber: 2, title: "Phase 2: Core Syllabus Completion", description: "Cover all major topics across Quantitative, Reasoning, English, and General Awareness.", durationWeeks: 5, weekRange: "Weeks 4-8", focusTopics: ["Advanced Topics", "General Knowledge"] },
    { phaseNumber: 3, title: "Phase 3: Previous Year Question Drills", description: "Practice official previous exam papers and sectional question banks.", durationWeeks: 3, weekRange: "Weeks 9-11", focusTopics: ["Previous Question Papers", "Topic Tests"] },
    { phaseNumber: 4, title: "Phase 4: Full-Length Mocks & Speed Calibration", description: "Simulate exact exam environment, negative marking strategy, and time allocation.", durationWeeks: 2, weekRange: "Weeks 12-13", focusTopics: ["Full Mocks", "Speed & Accuracy"] },
    { phaseNumber: 5, title: "Phase 5: Final Revision & Peak Performance", description: "Review weak topics, formula notes, and current affairs highlights.", durationWeeks: 1, weekRange: "Week 14", focusTopics: ["Weak Topic Revision", "Formula Check"] }
  ];
}

function generatePersonalizedStudyPlan({
  exam,
  hoursPerDay = 2,
  studentLevel = "Intermediate",
  targetDate = null,
  topicMasteryMap = {}
}) {
  const hours = Math.max(1, Math.min(8, Number(hoursPerDay || 2)));
  const totalDailyMinutes = hours * 60;

  const phases = generateExamPhases(exam.examId, exam.category);

  // Extract all syllabus topics across sections
  let allTopics = [];
  if (exam.stages && exam.stages.length > 0) {
    exam.stages.forEach(stage => {
      if (stage.sections) {
        stage.sections.forEach(sec => {
          if (sec.syllabusTopics) {
            sec.syllabusTopics.forEach(top => {
              const priority = calculateTopicPriority({
                syllabusWeight: top.syllabusWeight || 50,
                historicalFrequency: top.historicalFrequency || 50,
                recentFrequency: top.recentFrequency || 50,
                sectionWeight: sec.weightage ? sec.weightage * 50 : 50,
                studentWeakness: topicMasteryMap[top.topicId]?.status === "REINFORCE" ? 80 : 20,
                hasPreviousPaperEvidence: (exam.previousPapers && exam.previousPapers.length > 0)
              });

              allTopics.push({
                topicId: top.topicId,
                name: top.name,
                sectionName: sec.name,
                normalizedKey: top.normalizedKey,
                estimatedHours: top.estimatedHours || 4,
                priorityScore: priority.priorityScore,
                priorityLabel: priority.priorityLabel,
                evidenceLabel: priority.evidenceLabel,
                masteryStatus: topicMasteryMap[top.topicId]?.status || "PRACTICE"
              });
            });
          }
        });
      }
    });
  }

  // Sort topics by priority score descending
  allTopics.sort((a, b) => b.priorityScore - a.priorityScore);

  // Build 14-day daily schedule
  const dailySchedule = [];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  for (let d = 1; d <= 14; d++) {
    const dayName = dayNames[(d - 1) % 7];
    const topTopic1 = allTopics[(d - 1) % Math.max(1, allTopics.length)] || { name: "General Concepts", topicId: "gen_1", sectionName: "General" };
    const topTopic2 = allTopics[d % Math.max(1, allTopics.length)] || { name: "Aptitude Practice", topicId: "gen_2", sectionName: "General" };

    let tasks = [];
    if (totalDailyMinutes <= 120) {
      tasks = [
        { topicId: topTopic1.topicId, topicName: topTopic1.name, sectionName: topTopic1.sectionName, taskType: "Concept", durationMinutes: 45, completed: false },
        { topicId: topTopic1.topicId, topicName: topTopic1.name, sectionName: topTopic1.sectionName, taskType: "Practice", durationMinutes: 45, completed: false },
        { topicId: topTopic2.topicId, topicName: topTopic2.name, sectionName: topTopic2.sectionName, taskType: "Revision", durationMinutes: 30, completed: false }
      ];
    } else {
      tasks = [
        { topicId: topTopic1.topicId, topicName: topTopic1.name, sectionName: topTopic1.sectionName, taskType: "Concept", durationMinutes: 60, completed: false },
        { topicId: topTopic1.topicId, topicName: topTopic1.name, sectionName: topTopic1.sectionName, taskType: "Practice", durationMinutes: 60, completed: false },
        { topicId: topTopic2.topicId, topicName: topTopic2.name, sectionName: topTopic2.sectionName, taskType: "PYQ", durationMinutes: 45, completed: false },
        { topicId: topTopic2.topicId, topicName: topTopic2.name, sectionName: topTopic2.sectionName, taskType: "Revision", durationMinutes: Math.max(15, totalDailyMinutes - 165), completed: false }
      ];
    }

    dailySchedule.push({
      dayNumber: d,
      dayName: `Day ${d} (${dayName})`,
      totalMinutes: totalDailyMinutes,
      completedMinutes: 0,
      tasks
    });
  }

  // Identify weak & strong topics
  const weakTopics = allTopics.filter(t => t.masteryStatus === "REINFORCE").map(t => t.name);
  const strongTopics = allTopics.filter(t => t.masteryStatus === "MASTERED").map(t => t.name);

  return {
    phases,
    dailySchedule,
    topicsOrderedByPriority: allTopics,
    weakTopics,
    strongTopics,
    totalTopics: allTopics.length
  };
}

module.exports = {
  generateExamPhases,
  generatePersonalizedStudyPlan
};
