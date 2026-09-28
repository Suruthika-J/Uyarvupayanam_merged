// English Adventure reward + activity catalogue.
// Badge keys & level thresholds mirror the backend (backend/routes/englishRoutes.js).

export const ENGLISH_LEVELS = [
  { level: 1, name: 'Beginner', min: 0, emoji: '🌱' },
  { level: 2, name: 'Explorer', min: 50, emoji: '🧭' },
  { level: 3, name: 'Confident', min: 150, emoji: '🚀' },
  { level: 4, name: 'English Star', min: 300, emoji: '⭐' },
  { level: 5, name: 'English Champion', min: 500, emoji: '🏆' },
]

export const levelFromStars = (stars) =>
  ENGLISH_LEVELS.reduce((acc, l) => (stars >= l.min ? l : acc), ENGLISH_LEVELS[0])

export const BADGES = [
  { key: 'first-step', name: 'First English Step', emoji: '🌱', hint: 'Complete any activity' },
  { key: 'little-writer', name: 'Little Writer', emoji: '✍️', hint: 'Write a story' },
  { key: 'brave-speaker', name: 'Brave Speaker', emoji: '🎤', hint: 'Speak & Tell once' },
  { key: 'word-explorer', name: 'Word Explorer', emoji: '📚', hint: 'Explore vocabulary' },
  { key: 'grammar-hero', name: 'Grammar Hero', emoji: '🧩', hint: 'Solve 10 grammar questions' },
  { key: 'builder-buddy', name: 'Sentence Builder', emoji: '🔤', hint: 'Build a sentence' },
  { key: 'listener-star', name: 'Listening Star', emoji: '🎧', hint: 'Complete Listen & Speak' },
  { key: 'daily-doer', name: 'Daily Doer', emoji: '🌟', hint: 'Finish the Daily Challenge' },
  { key: 'english-explorer', name: 'English Explorer', emoji: '🏆', hint: 'Complete 7 activities' },
  { key: 'streak-3', name: '3 Day Learner', emoji: '🔥', hint: 'Practice 3 days in a row' },
  { key: 'streak-7', name: '7 Day Learner', emoji: '🔥', hint: 'Practice 7 days in a row' },
  { key: 'champion', name: 'English Champion', emoji: '👑', hint: 'Earn 500 stars' },
]

export const badgeByKey = (key) => BADGES.find((b) => b.key === key) || { key, name: key, emoji: '🌟', hint: '' }

// Star rewards per activity type
export const STAR_REWARDS = {
  writing: 10,
  speaking: 15,
  grammar: 5,
  vocabulary: 5,
  'sentence-builder': 5,
  'listen-speak': 8,
  'daily-challenge': 20,
  'weekly-challenge': 50,
}

// The 8 adventure activities (drive the dashboard cards + explorer progress %)
export const ENGLISH_ACTIVITIES = [
  {
    id: 'writing',
    path: 'english/writing',
    emoji: '✍️',
    title: 'Story Writer',
    description: 'Write your own story and learn from your mistakes.',
    difficulty: 1,
    color: '#f97316',
    soft: '#fff4e6',
  },
  {
    id: 'speaking',
    path: 'english/speaking',
    emoji: '🎤',
    title: 'Speak & Tell',
    description: 'Look at a picture, think and speak!',
    difficulty: 2,
    color: '#8b5cf6',
    soft: '#f3eeff',
  },
  {
    id: 'grammar',
    path: 'english/basics',
    emoji: '🧩',
    title: 'English Basics',
    description: 'Learn important English grammar through games.',
    difficulty: 1,
    color: '#0ea5e9',
    soft: '#e7f5ff',
  },
  {
    id: 'vocabulary',
    path: 'english/vocabulary',
    emoji: '📚',
    title: 'Word Explorer',
    description: 'Learn new words with pictures.',
    difficulty: 1,
    color: '#10b981',
    soft: '#e6faf1',
  },
  {
    id: 'sentence-builder',
    path: 'english/sentence-builder',
    emoji: '🔤',
    title: 'Sentence Builder',
    description: 'Put words together and create sentences.',
    difficulty: 2,
    color: '#f59e0b',
    soft: '#fef5e0',
  },
  {
    id: 'listen-speak',
    path: 'english/listen-speak',
    emoji: '🎧',
    title: 'Listen & Speak',
    description: 'Listen carefully and repeat.',
    difficulty: 2,
    color: '#ec4899',
    soft: '#fdeff6',
  },
  {
    id: 'daily-challenge',
    path: 'english/daily-challenge',
    emoji: '🌟',
    title: 'Daily Challenge',
    description: "Complete today's English mission!",
    difficulty: 2,
    color: '#14b8a6',
    soft: '#e0faf6',
  },
  {
    id: 'progress',
    path: 'english/progress',
    emoji: '🗺️',
    title: 'My English Progress',
    description: 'See your stars, badges and how much you are learning!',
    difficulty: 0,
    color: '#6366f1',
    soft: '#eef0ff',
  },
]

// Friendly difficulty names
export const DIFFICULTY_LABELS = {
  easy: 'Easy',
  medium: 'Medium',
  challenge: 'Challenge',
}

export const LEVEL_NAMES = ['Beginner', 'Explorer', 'Confident', 'English Star', 'English Champion']