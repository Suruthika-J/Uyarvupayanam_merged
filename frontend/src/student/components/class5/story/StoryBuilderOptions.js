export const CHARACTERS = [
  { emoji: '🧒', label: 'Curious Student', value: 'Curious Student' },
  { emoji: '🐶', label: 'Friendly Dog', value: 'Friendly Dog' },
  { emoji: '🤖', label: 'Helpful Robot', value: 'Helpful Robot' },
  { emoji: '🦸', label: 'Young Hero', value: 'Young Hero' },
];

export const PLACES = [
  { emoji: '🏫', label: 'School', value: 'School' },
  { emoji: '🌳', label: 'Forest', value: 'Forest' },
  { emoji: '🚀', label: 'Space', value: 'Space' },
  { emoji: '🏰', label: 'Castle', value: 'Castle' },
];

export const OBJECTS = [
  { emoji: '🗝️', label: 'Magic Key', value: 'Magic Key' },
  { emoji: '🗺️', label: 'Treasure Map', value: 'Treasure Map' },
  { emoji: '📖', label: 'Magic Book', value: 'Magic Book' },
  { emoji: '💎', label: 'Mystery Stone', value: 'Mystery Stone' },
];

export const THEMES = [
  { emoji: '🧭', label: 'Adventure', value: 'Adventure' },
  { emoji: '🧡', label: 'Friendship', value: 'Friendship' },
  { emoji: '🔭', label: 'Discovery', value: 'Discovery' },
  { emoji: '🤝', label: 'Helping Others', value: 'Helping Others' },
];

export const STORY_STEPS = [
  { id: 'character', title: 'Choose Your Character', options: CHARACTERS },
  { id: 'place', title: 'Choose Your Place', options: PLACES },
  { id: 'object', title: 'Choose Your Special Object', options: OBJECTS },
  { id: 'theme', title: 'Choose Your Story Theme', options: THEMES },
];

export const STORY_START = 'Once upon a time...';

export const STORY_GUIDES = [
  'What happened first?',
  'What problem did your character face?',
  'How did they solve it?',
  'How did the story end?',
];

export const MIN_STORY_WORDS = 5;