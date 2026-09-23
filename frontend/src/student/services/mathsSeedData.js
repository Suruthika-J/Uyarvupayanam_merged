// Seed mirror helper for the Math Adventure fallback (browse / demo mode).
// Content lives in data/mathWorldThemes.js (regenerated from the backend
// seeder). This file keeps the same shape as adhikaramSeedData.js so the
// service can swap live and mirror seamlessly.

import { SEED_WORLDS, SEED_QUESTIONS, findWorld, findSeedQuestion } from '../data/mathWorldThemes'

export const seedMathsWorlds = SEED_WORLDS
export const seedMathsQuestions = SEED_QUESTIONS
export const findSeedWorld = (topicId) => findWorld(topicId)
export const findSeedMathsQuestion = (id) => findSeedQuestion(id)

export default {
  seedMathsWorlds,
  seedMathsQuestions,
  findSeedWorld,
  findSeedMathsQuestion,
}