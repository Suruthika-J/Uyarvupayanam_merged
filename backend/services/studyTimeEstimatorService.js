/**
 * studyTimeEstimatorService.js
 * Deterministic Study Time & Schedule Calculation Service
 */

class StudyTimeEstimatorService {
  /**
   * Calculates time breakdown per topic based on difficulty & complexity
   */
  static estimateTopicTime({ difficulty = "BEGINNER", priority = "HIGH", level = "BEGINNER" }) {
    let conceptHours = 1.5;
    let practiceHours = 1.5;
    let revisionHours = 0.5;
    let assessmentHours = 0.5;
    let recommendedQuestions = 30;

    if (difficulty === "BEGINNER") {
      conceptHours = 1.5;
      practiceHours = 1.5;
      revisionHours = 0.5;
      assessmentHours = 0.5;
      recommendedQuestions = 25;
    } else if (difficulty === "INTERMEDIATE") {
      conceptHours = 2.0;
      practiceHours = 2.0;
      revisionHours = 1.0;
      assessmentHours = 1.0;
      recommendedQuestions = 35;
    } else if (difficulty === "ADVANCED") {
      conceptHours = 3.0;
      practiceHours = 3.0;
      revisionHours = 1.5;
      assessmentHours = 1.5;
      recommendedQuestions = 45;
    }

    if (priority === "CRITICAL") {
      practiceHours += 1.0;
      recommendedQuestions += 15;
    }

    const totalHours = conceptHours + practiceHours + revisionHours + assessmentHours;
    const practiceMinutes = Math.round(practiceHours * 60);
    const revisionMinutes = Math.round(revisionHours * 60);

    return {
      conceptHours,
      practiceHours,
      revisionHours,
      assessmentHours,
      totalHours,
      practiceMinutes,
      revisionMinutes,
      recommendedQuestions
    };
  }

  /**
   * Formulates daily tasks and 7-day weekly schedule
   */
  static generateSchedule({ sections, availableHoursPerDay = 2 }) {
    const hoursPerDay = Math.max(1, parseFloat(availableHoursPerDay) || 2);
    const dailyPlans = [];
    const allTopics = [];

    // Collect all topics sequentially
    (sections || []).forEach(sec => {
      (sec.topics || []).forEach(top => {
        allTopics.push({ ...top, sectionTitle: sec.title });
      });
    });

    let currentDay = 1;
    let currentDayTasks = [];
    let accumulatedHours = 0;

    allTopics.forEach(top => {
      const cMins = Math.round((top.conceptHours || 1.5) * 60);
      const pMins = Math.round((top.practiceHours || 1.5) * 60);

      // Task 1: Concept Study
      currentDayTasks.push({
        topicId: top.topicId,
        topicName: top.name,
        activityType: "Concept Study",
        durationMinutes: cMins,
        isCompleted: top.isCompleted || false
      });
      accumulatedHours += cMins / 60;

      if (accumulatedHours >= hoursPerDay) {
        dailyPlans.push({
          dayNumber: currentDay,
          dateLabel: `Day ${currentDay}`,
          tasks: currentDayTasks
        });
        currentDay++;
        currentDayTasks = [];
        accumulatedHours = 0;
      }

      // Task 2: Practice Questions
      currentDayTasks.push({
        topicId: top.topicId,
        topicName: top.name,
        activityType: "Practice Questions",
        durationMinutes: pMins,
        isCompleted: top.isCompleted || false
      });
      accumulatedHours += pMins / 60;

      if (accumulatedHours >= hoursPerDay) {
        dailyPlans.push({
          dayNumber: currentDay,
          dateLabel: `Day ${currentDay}`,
          tasks: currentDayTasks
        });
        currentDay++;
        currentDayTasks = [];
        accumulatedHours = 0;
      }
    });

    if (currentDayTasks.length > 0) {
      dailyPlans.push({
        dayNumber: currentDay,
        dateLabel: `Day ${currentDay}`,
        tasks: currentDayTasks
      });
    }

    // Formulate 7-Day Weekly Template
    const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const weeklySchedule = days.map((day, idx) => {
      let activity = "Core Concept Study & Practice";
      if (idx === 4) activity = "Mixed Practice & Revision";
      if (idx === 5) activity = "Timed Sectional Practice";
      if (idx === 6) activity = "Weekly Mock Test & Weak Area Review";
      return {
        day,
        activity: `${activity} (${allTopics[idx % allTopics.length]?.name || 'Topic Concept'})`,
        durationHours: hoursPerDay
      };
    });

    const weeklyPlans = [
      {
        weekNumber: 1,
        theme: "Foundations & Core Practice",
        schedule: weeklySchedule
      }
    ];

    return { dailyPlans, weeklyPlans };
  }
}

module.exports = StudyTimeEstimatorService;
