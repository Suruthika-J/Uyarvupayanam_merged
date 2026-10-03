/**
 * PlacementStudyPlanEngine.js
 * Round-Wise Company Placement Study Plan Generator Engine
 *
 * Implements:
 * - PlacementPriorityEngine (Phase 11)
 * - PlacementStudyPlanEngine (Phase 12)
 * - Round-by-Round Preparation Schedule Allocation
 * - Deterministic, rule-based scheduling (Phase 13)
 */

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateShort(date) {
  return new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime12h(hour, minute = 0) {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 || hour === 24 ? "AM" : "PM";
  const minStr = minute < 10 ? `0${minute}` : minute;
  return `${h12}:${minStr} ${ampm}`;
}

/**
 * PlacementPriorityEngine (Phase 11)
 * Formula: Priority = Round Importance × Topic Relevance × Student Weakness × Deadline Urgency × Evidence Strength
 */
function calculatePlacementPriorities(reportedRounds, skillProfile = {}, deadlineDate, startDate) {
  const now = new Date(startDate || Date.now());
  const daysDiff = Math.max(1, Math.ceil((new Date(deadlineDate) - now) / (1000 * 60 * 60 * 24)));

  let urgencyWeight = 1.0;
  if (daysDiff <= 7) urgencyWeight = 2.0;
  else if (daysDiff <= 14) urgencyWeight = 1.5;

  const roundImportanceMap = {
    ONLINE_ASSESSMENT: 2.5,
    APTITUDE: 2.2,
    CODING: 3.0,
    TECHNICAL_INTERVIEW: 3.0,
    SYSTEM_DESIGN: 2.5,
    MANAGERIAL_INTERVIEW: 2.0,
    COMMUNICATION: 1.8,
    HR_INTERVIEW: 1.5
  };

  const skillWeaknessMap = {
    Weak: 3.0,
    "Not Sure": 2.2,
    Moderate: 1.5,
    Strong: 1.0
  };

  return reportedRounds.map((round) => {
    const rImp = roundImportanceMap[round.normalizedCategory] || 2.0;
    
    // Evaluate average weakness across round topics
    let weaknessSum = 0;
    const topics = round.topics || [];
    if (topics.length > 0) {
      topics.forEach((t) => {
        const tLower = t.toLowerCase();
        if (tLower.includes("dsa") || tLower.includes("algorithm") || tLower.includes("data structure")) {
          weaknessSum += skillWeaknessMap[skillProfile.DSA || "Moderate"];
        } else if (tLower.includes("dbms") || tLower.includes("sql") || tLower.includes("database")) {
          weaknessSum += skillWeaknessMap[skillProfile.DBMS || "Moderate"];
        } else if (tLower.includes("aptitude") || tLower.includes("quant") || tLower.includes("reasoning")) {
          weaknessSum += skillWeaknessMap[skillProfile.Aptitude || "Moderate"];
        } else if (tLower.includes("coding") || tLower.includes("array") || tLower.includes("string")) {
          weaknessSum += skillWeaknessMap[skillProfile.Coding || "Moderate"];
        } else if (tLower.includes("hr") || tLower.includes("behavioral") || tLower.includes("communication")) {
          weaknessSum += skillWeaknessMap[skillProfile.Communication || "Moderate"];
        } else {
          weaknessSum += 1.5;
        }
      });
      weaknessSum = weaknessSum / topics.length;
    } else {
      weaknessSum = 1.8;
    }

    const priorityScore = rImp * weaknessSum * urgencyWeight;

    return {
      ...round,
      priorityScore,
      priorityLevel: priorityScore >= 7.0 ? "HIGH" : priorityScore >= 4.0 ? "MED" : "LOW"
    };
  });
}

/**
 * PlacementStudyPlanEngine (Phase 12)
 * Creates a sequential, round-by-round company-specific preparation plan.
 */
function generateCompanyPlacementPlan(input) {
  const {
    companyName = "Target Company",
    targetRole = "Software Engineer",
    hiringType = "Campus Placement",
    reportedRounds = [],
    skillProfile = {},
    startDate = new Date(),
    deadline = addDays(new Date(), 14),
    dailyAvailability = {},
    timeSlots = ["Evening", "Night"],
    learningPreferences = ["Coding Practice", "Practice Questions", "Revision"]
  } = input;

  const start = new Date(startDate);
  const end = new Date(deadline);
  const effectiveDays = Math.min(60, Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24))));

  const defaultAvailability = {
    Monday: 2, Tuesday: 2, Wednesday: 2, Thursday: 2, Friday: 2, Saturday: 3, Sunday: 3
  };

  const dayHoursMap = {
    Monday: Number(dailyAvailability.Monday ?? defaultAvailability.Monday),
    Tuesday: Number(dailyAvailability.Tuesday ?? defaultAvailability.Tuesday),
    Wednesday: Number(dailyAvailability.Wednesday ?? defaultAvailability.Wednesday),
    Thursday: Number(dailyAvailability.Thursday ?? defaultAvailability.Thursday),
    Friday: Number(dailyAvailability.Friday ?? defaultAvailability.Friday),
    Saturday: Number(dailyAvailability.Saturday ?? defaultAvailability.Saturday),
    Sunday: Number(dailyAvailability.Sunday ?? defaultAvailability.Sunday)
  };

  const prioritizedRounds = calculatePlacementPriorities(reportedRounds, skillProfile, end, start);

  // Group days into round stages
  let totalAvailableHours = 0;
  const dayList = [];

  for (let d = 0; d < effectiveDays; d++) {
    const curDate = addDays(start, d);
    const dayName = curDate.toLocaleDateString("en-US", { weekday: "long" }) || "Monday";
    const hours = dayHoursMap[dayName] !== undefined ? dayHoursMap[dayName] : 2;
    totalAvailableHours += hours;
    dayList.push({
      dateObj: curDate,
      dayName,
      dateFormatted: formatDateShort(curDate),
      availableHours: hours
    });
  }

  // Determine starting hour
  let startHour = 18;
  if (timeSlots.some((t) => t.toLowerCase().includes("morning"))) startHour = 7;
  else if (timeSlots.some((t) => t.toLowerCase().includes("afternoon"))) startHour = 14;
  else if (timeSlots.some((t) => t.toLowerCase().includes("night"))) startHour = 20;

  let sessionCounter = 1;
  let allocatedHoursCount = 0;
  const schedule = [];

  const roundsCount = prioritizedRounds.length || 1;

  dayList.forEach((dayObj, dIdx) => {
    const dayTasks = [];
    const targetHours = dayObj.availableHours;

    if (targetHours <= 0) {
      schedule.push({
        day: dayObj.dayName,
        date: dayObj.dateFormatted,
        dailyTargetHours: "Rest / Rested Day",
        tasks: []
      });
      return;
    }

    // Determine target round for this day based on sequential progression
    const roundIdx = Math.min(roundsCount - 1, Math.floor((dIdx / effectiveDays) * roundsCount));
    const targetRound = prioritizedRounds[roundIdx] || prioritizedRounds[0];

    const sessionCount = targetHours >= 3 ? 3 : targetHours >= 1.5 ? 2 : 1;

    for (let s = 0; s < sessionCount; s++) {
      const topicBank = targetRound.topics && targetRound.topics.length > 0
        ? targetRound.topics
        : [`Core Concepts in ${targetRound.roundName}`, `Problem Solving & Speed Benchmarks`, `Mock Assessment`];

      const topicText = topicBank[(dIdx + s) % topicBank.length];
      const activityType = learningPreferences[s % learningPreferences.length] || "Practice";

      const curStartHour = (startHour + s * 1.25) % 24;
      const sH = Math.floor(curStartHour);
      const sM = Math.round((curStartHour - sH) * 60);
      const durationMins = Math.round((targetHours / sessionCount) * 60);

      const endMinsTotal = sH * 60 + sM + durationMins;
      const eH = Math.floor(endMinsTotal / 60) % 24;
      const eM = endMinsTotal % 60;

      const timeSlotStr = `${formatTime12h(sH, sM)} – ${formatTime12h(eH, eM)}`;

      dayTasks.push({
        id: `psess-${sessionCounter++}`,
        day: dayObj.dayName,
        date: dayObj.dateFormatted,
        timeSlot: timeSlotStr,
        roundType: targetRound.roundName,
        subject: targetRound.normalizedCategory.replace(/_/g, " "),
        topic: `${activityType}: ${topicText}`,
        activityType,
        priority: targetRound.priorityLevel || "HIGH",
        duration: `${durationMins} mins`,
        plannedDurationMinutes: durationMins,
        status: "pending"
      });

      allocatedHoursCount += durationMins / 60;
    }

    schedule.push({
      day: dayObj.dayName,
      date: dayObj.dateFormatted,
      dailyTargetHours: `${targetHours.toFixed(1)} Hours`,
      tasks: dayTasks
    });
  });

  return {
    companyName,
    targetRole,
    hiringType,
    deadline: end,
    durationDays: effectiveDays,
    totalAvailableHours: Number(totalAvailableHours.toFixed(1)),
    allocatedHours: Number(allocatedHoursCount.toFixed(1)),
    skillProfile,
    reportedRounds: prioritizedRounds,
    schedule
  };
}

module.exports = {
  calculatePlacementPriorities,
  generateCompanyPlacementPlan
};
