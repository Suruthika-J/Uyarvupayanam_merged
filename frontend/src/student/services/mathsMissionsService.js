// ─────────────────────────────────────────────────────────────────────────────
// Maths Missions — progress store (Phase 1: localStorage mirror)
// ─────────────────────────────────────────────────────────────────────────────
// Phase 1 ships client-side so the feature is fully playable and progress
// survives refreshes. The stored shape mirrors the planned server document
// (StudentMathProgress: studentId, per-topic currentLevel, completedMissions,
// score, accuracy, attempts, hintsUsed, mistakes, lastPlayed,
// masteryPercentage) so Phase 3 can swap these functions for the
// /api/maths/* endpoints without touching the pages.
//
// Honest limits (documented, not hidden):
//  · progress lives in this browser only — signing in on another device
//    starts fresh until the API phase lands.
//  · mistakeType for Phase 1 is the closest rule-based category supplied by
//    the question data; the full mistake-detection engine is Phase 2.
//  · AI question/hint generation is Phase 4 and goes through the backend.

import {
  MATHS_TOPICS,
  SCORING,
  getMathsMission,
} from '../data/mathsMissionsData'

const KEY_PREFIX = 'mathsMissions:v1:'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function emptyProgress(studentId) {
  return {
    studentId,
    topics: {},
    totalScore: 0,
    lastTopic: '',
    lastMission: '',
  }
}

// ── Persistence ─────────────────────────────────────────────────────────────
export function progressKey(studentId) {
  return `${KEY_PREFIX}${studentId || 'guest'}`
}

// Best-effort student id used only as a client-side hint for API calls; the
// backend derives the real identity from the Bearer token.
export function getStudentId() {
  try {
    return localStorage.getItem('userId') || localStorage.getItem('studentUserId') || ''
  } catch {
    return ''
  }
}

export function loadProgress(studentId) {
  try {
    const raw = localStorage.getItem(progressKey(studentId))
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') return parsed
    }
  } catch {
    // corrupt entry — start fresh below
  }
  const fresh = emptyProgress(studentId)
  saveProgress(fresh, studentId)
  return fresh
}

export function saveProgress(progress, studentId) {
  try {
    localStorage.setItem(progressKey(studentId), JSON.stringify(progress))
  } catch {
    // storage full/unavailable — in-memory state still works for the session
  }
}

function ensureTopic(progress, studentId, topicId) {
  if (!progress.topics[topicId]) {
    progress.topics[topicId] = {
      topicId,
      currentLevel: 1,
      completedLevels: [],       // 1..5 ladder reached
      completedMissions: [],     // concept-chain ids finished
      score: 0,
      accuracy: 0,               // correct / attempts %
      attempts: 0,
      correct: 0,
      hintsUsed: 0,
      mistakes: [],
      lastPlayed: '',
      masteryPercentage: 0,
      completed: false,
      rewardClaimed: false,
    }
  }
  return progress.topics[topicId]
}

// The 6-step flow maps onto the 5 topic levels: concept+example → Level 1,
// easy → Level 2, practice → Level 3, real-life → Level 4, boss → Level 5.
export function levelForStep(stepIndex) {
  if (stepIndex <= 1) return 1
  if (stepIndex === 2) return 2
  if (stepIndex === 3) return 3
  if (stepIndex === 4) return 4
  return 5
}

function recordMistake(topic, topicId, missionId, mistakeType) {
  const node = (topic.mistakes || []).find(
    (m) => m.topic === topicId && m.concept === missionId && m.mistakeType === mistakeType
  )
  if (node) node.count += 1
  else topic.mistakes.push({ topic: topicId, concept: missionId, mistakeType, count: 1 })
}

// ── Unlock rule ─────────────────────────────────────────────────────────────
// Topic 1 is open; every later topic unlocks when the previous topic (by
// order) is completed. Locked cards stay visible as previews.
export function isTopicUnlocked(progress, topic) {
  if (!topic || topic.order === 1) return true
  const prev = [...MATHS_TOPICS].sort((a, b) => a.order - b.order).find((t) => t.order === topic.order - 1)
  if (!prev) return true
  const node = progress.topics[prev.id]
  return Boolean(node && node.completed)
}

// ── Recording an answer / step ──────────────────────────────────────────────
// Called from the mission page. `step` is the flow step (0..5).
// `practice` = true when the topic is already completed and the student is
// doing a review run: attempts/hints/mistakes are still tracked (useful data),
// but no points are awarded and levels/missions are not changed again.
// Returns everything the UI needs to show feedback and unlock states.
export function recordAttempt({ progress, studentId, topicId, missionId, stepIndex, correct, hintsUsed, mistakeType, practice }) {
  const next = clone(progress)
  const topic = ensureTopic(next, studentId, topicId)
  const mission = getMathsMission(topicId, missionId)
  const step = mission && mission.steps ? mission.steps[stepIndex] : null
  const isBoss = step && step.kind === 'boss'
  const isChallenge = step && (step.kind === 'challenge' || step.kind === 'boss')

  topic.attempts += 1
  topic.hintsUsed += (hintsUsed || 0)
  topic.lastPlayed = new Date().toISOString()
  next.lastTopic = topicId
  next.lastMission = missionId

  // Review / practice runs never change the earned progress.
  if (practice) {
    if (!correct && isChallenge && mistakeType) recordMistake(topic, topicId, missionId, mistakeType)
    saveProgress(next, studentId)
    return { progress: next, pointsEarned: 0, correct, levelCompleted: null, missionCompleted: false, topicCompleted: Boolean(topic.completed), practice: true }
  }

  let pointsEarned = 0
  let levelCompleted = null
  let missionCompleted = false

  if (correct) {
    pointsEarned = hintsUsed > 0
      ? (isBoss ? SCORING.bossWithHint : SCORING.correctWithHint)
      : (isBoss ? SCORING.bossNoHint : SCORING.correctNoHint)

    if (isChallenge) topic.correct += 1
    topic.score += pointsEarned
    next.totalScore += pointsEarned

    // Advance the level ladder for this topic.
    const lvl = levelForStep(stepIndex)
    if (!topic.completedLevels.includes(lvl)) {
      topic.completedLevels.push(lvl)
      topic.completedLevels.sort((a, b) => a - b)
    }
    levelCompleted = lvl

    // The boss step closes the mission chain.
    if (lvl === 5 && !topic.completedMissions.includes(missionId)) {
      topic.completedMissions.push(missionId)
      topic.score += SCORING.missionCompleteBonus
      next.totalScore += SCORING.missionCompleteBonus
      missionCompleted = true
      // Topic completed = every implemented concept chain is done.
      const implemented = (mission && mission.implemented)
        ? collectImplementedMissionIds(topicId)
        : []
      const allDone = implemented.length > 0 && implemented.every((id) => topic.completedMissions.includes(id))
      if (allDone && !topic.completed) {
        topic.completed = true
        topic.score += SCORING.topicCompleteBonus
        next.totalScore += SCORING.topicCompleteBonus
        topic.rewardClaimed = true
      }
    }
  } else if (isChallenge && mistakeType) {
    recordMistake(topic, topicId, missionId, mistakeType)
  }

  // currentLevel = next level to attempt (caps at 5 once the ladder is done).
  topic.currentLevel = topic.completedLevels.length >= 5
    ? 5
    : Math.min(5, (topic.completedLevels.length ? Math.max(...topic.completedLevels) : 0) + 1)
  topic.masteryPercentage = Math.round((topic.completedLevels.length / 5) * 100)
  topic.accuracy = topic.attempts ? Math.round((topic.correct / topic.attempts) * 100) : 0

  saveProgress(next, studentId)
  return { progress: next, pointsEarned, correct, levelCompleted, missionCompleted, topicCompleted: Boolean(topic.completed) }
}

// ── Recording a non-scored step (concept / example) ────────────────────────
export function recordStepSeen({ progress, studentId, topicId, missionId, stepIndex }) {
  const next = clone(progress)
  const topic = ensureTopic(next, studentId, topicId)
  next.lastTopic = topicId
  next.lastMission = missionId
  const lvl = levelForStep(stepIndex)
  if (!topic.completedLevels.includes(lvl)) {
    topic.completedLevels.push(lvl)
    topic.completedLevels.sort((a, b) => a - b)
  }
  topic.currentLevel = Math.min(5, (topic.completedLevels.length ? Math.max(...topic.completedLevels) : 0) + 1)
  topic.masteryPercentage = Math.round((topic.completedLevels.length / 5) * 100)
  saveProgress(next, studentId)
  return { progress: next }
}

function collectImplementedMissionIds(topicId) {
  const topic = MATHS_TOPICS.find((t) => t.id === topicId)
  return ((topic && topic.missions) || []).filter((m) => m.implemented).map((m) => m.id)
}

// ── Reset ───────────────────────────────────────────────────────────────────
export function resetProgress(studentId) {
  const fresh = emptyProgress(studentId)
  saveProgress(fresh, studentId)
  return fresh
}

// ── Overview for the mission map ────────────────────────────────────────────
export function getOverview(progress) {
  const topics = [...MATHS_TOPICS].sort((a, b) => a.order - b.order)
  const totalMissions = topics.length * 5
  let completedMissions = 0
  let currentTopic = null
  let highestLevel = 1

  for (const t of topics) {
    const node = progress.topics[t.id]
    if (node) {
      completedMissions += Math.max(0, Math.min(node.completedLevels.length, 5))
      if (node.completedLevels.length > 0) {
        const top = Math.max(...node.completedLevels)
        if (top > highestLevel) highestLevel = top
      }
      if (!currentTopic && node.completedLevels.length > 0 && !node.completed) currentTopic = t
    }
  }
  if (!currentTopic) {
    // Nothing in progress yet → first topic the student can open.
    const firstOpen = topics.find((t) => isTopicUnlocked(progress, t) && !(progress.topics[t.id] && progress.topics[t.id].completed))
    currentTopic = firstOpen || topics[0]
  }
  if (currentTopic) {
    const node = progress.topics[currentTopic.id]
    if (node && node.currentLevel > highestLevel) highestLevel = node.currentLevel
  }

  const overallPct = totalMissions ? Math.round((completedMissions / totalMissions) * 100) : 0

  return {
    totalMissions,
    completedMissions,
    overallPct,
    currentTopic: currentTopic ? { id: currentTopic.id, name: currentTopic.name } : { id: '', name: '—' },
    currentLevel: highestLevel,
    totalScore: progress.totalScore || 0,
  }
}