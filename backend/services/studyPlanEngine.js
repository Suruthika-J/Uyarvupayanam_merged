/**
 * StudyPlanEngine.js
 * AI-Driven Personal Study Plan Creator Engine
 *
 * Implements structured multi-factor scheduling:
 * 1. Time Allocation Engine
 * 2. Priority & Difficulty Scoring Engine
 * 3. Topic & Learning Style Allocation Engine
 * 4. Revision & Mock Test Cycle Engine
 * 5. Constraint & Conflict Resolution Engine
 */

// Helper to add days to a Date
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Format date into readable string e.g. "Mon, Oct 5"
function formatDateShort(date) {
  return new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// Convert 24h to 12h time string
function formatTime12h(hour, minute = 0) {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 || hour === 24 ? "AM" : "PM";
  const minStr = minute < 10 ? `0${minute}` : minute;
  return `${h12}:${minStr} ${ampm}`;
}

/**
 * Priority Calculation Engine (Phase 14)
 * Transparent scoring formula:
 * priorityScore = priorityWeight * difficultyWeight * urgencyWeight * skillGapWeight
 */
function calculateSubjectPriorityScores(subjects, deadlineDate, startDate, profileWeakAreas = []) {
  const now = new Date(startDate || Date.now());
  const diffDays = Math.max(1, Math.ceil((new Date(deadlineDate) - now) / (1000 * 60 * 60 * 24)));

  // Urgency Weight
  let urgencyWeight = 1.0;
  if (diffDays <= 7) urgencyWeight = 2.0;
  else if (diffDays <= 14) urgencyWeight = 1.5;
  else urgencyWeight = 1.0;

  const scoredSubjects = subjects.map((sub) => {
    // Priority Weight
    let pWeight = 2.0;
    if (sub.priority === "High") pWeight = 3.0;
    else if (sub.priority === "Medium") pWeight = 2.0;
    else if (sub.priority === "Low") pWeight = 1.0;
    else if (sub.priority === "Auto") {
      const isWeak = profileWeakAreas.some((w) => w && w.toLowerCase().includes(sub.name.toLowerCase()));
      pWeight = isWeak ? 3.2 : 2.0;
    }

    // Difficulty Weight
    let dWeight = 1.5;
    if (sub.difficulty === "Very Difficult") dWeight = 2.5;
    else if (sub.difficulty === "Difficult") dWeight = 2.0;
    else if (sub.difficulty === "Moderate") dWeight = 1.5;
    else if (sub.difficulty === "Easy") dWeight = 1.0;

    // Skill Gap Weight
    const matchesSkillGap = profileWeakAreas.some((w) => w && w.toLowerCase().includes(sub.name.toLowerCase()));
    const skillGapWeight = matchesSkillGap ? 1.8 : 1.0;

    const rawScore = pWeight * dWeight * urgencyWeight * skillGapWeight;

    return {
      ...sub,
      rawScore,
      priorityLevel: rawScore >= 6.0 ? "HIGH" : rawScore >= 3.5 ? "MED" : "LOW"
    };
  });

  const totalRawScore = scoredSubjects.reduce((acc, s) => acc + s.rawScore, 0) || 1;
  return scoredSubjects.map((s) => ({
    ...s,
    weightShare: s.rawScore / totalRawScore
  }));
}

/**
 * Main Planning Engine Generator
 */
function generatePersonalizedPlan(input) {
  const {
    studentProfile = {},
    goal = "Semester Examination",
    goalType = "semester_exam",
    goalDescription = "",
    subjects = [],
    startDate = new Date(),
    deadline = addDays(new Date(), 14),
    durationDays = 14,
    dailyAvailability = {},
    timeSlots = ["Evening", "Night"],
    learningPreferences = ["Theory", "Coding Practice", "Revision"],
    constraints = [],
    recommendedDomain = ""
  } = input;

  const start = new Date(startDate);
  const end = new Date(deadline);
  const effectiveDays = Math.min(60, Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))) || durationDays || 14;

  const defaultAvailability = {
    Monday: 2,
    Tuesday: 2,
    Wednesday: 2,
    Thursday: 2,
    Friday: 2,
    Saturday: 3,
    Sunday: 3
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

  // Phase 10: Constraint Handling
  const avoidWeekend = constraints.some((c) => c.toLowerCase().includes("weekend"));
  if (avoidWeekend) {
    dayHoursMap.Saturday = 0;
    dayHoursMap.Sunday = 0;
  }

  // Ensure subjects exist
  let activeSubjects = subjects.length > 0 ? subjects : [
    { name: "Data Structures & Algorithms", priority: "High", difficulty: "Difficult", topics: ["Arrays & Linked Lists", "Trees & BST", "Graph Algorithms"] },
    { name: "Database Management Systems", priority: "High", difficulty: "Difficult", topics: ["SQL Joins", "Normalization 1NF-3NF", "Transactions & Indexing"] },
    { name: "Operating Systems", priority: "Medium", difficulty: "Moderate", topics: ["Process Synchronization", "Virtual Memory", "CPU Scheduling"] },
    { name: "Computer Networks", priority: "Medium", difficulty: "Easy", topics: ["TCP/IP Stack", "HTTP & Sockets", "Routing Protocols"] }
  ];

  const profileWeak = studentProfile?.quizPerformance?.weakTopics || [];
  const scoredSubjects = calculateSubjectPriorityScores(activeSubjects, end, start, profileWeak);

  // Phase 13: Time Allocation Calculation
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

  // Topic & Revision Cycle Bank
  const activityCycle = learningPreferences.length > 0
    ? learningPreferences
    : ["Theory", "Coding Practice", "Problem Solving", "Revision"];

  // Generate Daily Schedules
  let sessionCounter = 1;
  const schedule = [];

  // Determine starting hour based on constraint & preferences
  let startHour = 18; // Default 6:00 PM
  if (timeSlots.some((t) => t.toLowerCase().includes("morning"))) startHour = 7;
  else if (timeSlots.some((t) => t.toLowerCase().includes("afternoon"))) startHour = 14;
  else if (timeSlots.some((t) => t.toLowerCase().includes("night"))) startHour = 20;

  const noLateNight = constraints.some((c) => c.toLowerCase().includes("late-night") || c.toLowerCase().includes("late night"));
  if (noLateNight && startHour >= 21) startHour = 18;

  let allocatedHoursCount = 0;

  dayList.forEach((dayObj, dayIdx) => {
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

    // Number of sessions based on target hours (approx 45-60 mins each)
    const sessionCount = targetHours >= 3 ? 3 : targetHours >= 1.5 ? 2 : 1;

    for (let s = 0; s < sessionCount; s++) {
      // Pick subject based on weightShare rotation
      const subObj = scoredSubjects[(dayIdx + s) % scoredSubjects.length];
      const topicsList = subObj.topics && subObj.topics.length > 0
        ? subObj.topics
        : [`Core Concepts & Theory`, `Problem Solving & Applications`, `Exam Review & Formulae`];

      const topicText = topicsList[s % topicsList.length] || `Key Concepts in ${subObj.name}`;
      const activity = activityCycle[(dayIdx + s) % activityCycle.length] || "Theory";

      // Session Category
      let category = "Core Subject";
      if (s === 0 && subObj.priorityLevel === "HIGH") category = "Exam Prep";
      else if (subObj.priorityLevel === "HIGH" || subObj.difficulty === "Very Difficult") category = "Weak Subject";
      else if (activity === "Revision" || activity === "Mock Test") category = "Revision";
      else category = "Roadmap Skill";

      // Time slot string
      const curStartHour = (startHour + s * 1.25) % 24;
      const sH = Math.floor(curStartHour);
      const sM = Math.round((curStartHour - sH) * 60);
      const durationMins = Math.round((targetHours / sessionCount) * 60);
      
      const endMinsTotal = sH * 60 + sM + durationMins;
      const eH = Math.floor(endMinsTotal / 60) % 24;
      const eM = endMinsTotal % 60;

      const timeSlotStr = `${formatTime12h(sH, sM)} – ${formatTime12h(eH, eM)}`;

      dayTasks.push({
        id: `sess-${sessionCounter++}`,
        day: dayObj.dayName,
        date: dayObj.dateFormatted,
        timeSlot: timeSlotStr,
        subject: subObj.name,
        topic: `${activity}: ${topicText}`,
        activityType: activity,
        category,
        priority: subObj.priorityLevel,
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

  // Calculate Overview Summary
  const highPriorityNames = scoredSubjects.filter((s) => s.priorityLevel === "HIGH").map((s) => s.name);

  return {
    goal,
    goalType,
    goalDescription,
    title: `Personalized ${goal} Plan (${effectiveDays} Days)`,
    overview: `Tailored ${effectiveDays}-day study schedule (${totalAvailableHours.toFixed(1)} total hours) prioritizing ${highPriorityNames.join(", ") || activeSubjects[0]?.name}.`,
    totalAvailableHours: Number(totalAvailableHours.toFixed(1)),
    allocatedHours: Number(allocatedHoursCount.toFixed(1)),
    durationDays: effectiveDays,
    startDate: start,
    deadline: end,
    subjects: scoredSubjects.map((s) => ({
      name: s.name,
      priority: s.priority,
      difficulty: s.difficulty,
      topics: s.topics || []
    })),
    timeSlots,
    learningPreferences,
    constraints,
    recommendedDomain: recommendedDomain || studentProfile.targetCareer || "Full Stack Web & Mobile Development",
    schedule
  };
}

module.exports = {
  calculateSubjectPriorityScores,
  generatePersonalizedPlan
};
