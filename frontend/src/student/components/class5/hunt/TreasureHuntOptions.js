export const MAX_ATTEMPTS = 3;
export const TOTAL_CLUES = 4;
export const POINTS_FIRST_TRY = 10;
export const POINTS_AFTER = 5;
export const MAX_POINTS = 40;

export const TREASURE_LEVELS = [
  {
    id: 'level-1',
    name: 'Level 1 - Beginner',
    emoji: '🗺️',
    story:
      'A mysterious treasure is hidden somewhere in the adventure world. Follow the clues, solve the puzzles, and find the treasure!',
    finalMessage:
      'Great explorers observe carefully, think smartly, and never give up!',
    clues: [
      {
        id: 'pattern',
        type: 'Number Pattern',
        emoji: '🔢',
        intro: 'Look carefully at the pattern.',
        question: '2 → 4 → 6 → 8 → ?',
        visual: null,
        options: [
          { value: 'A', label: '9' },
          { value: 'B', label: '10' },
          { value: 'C', label: '11' },
          { value: 'D', label: '12' },
        ],
        answer: 'B',
        hint: 'Look at how the numbers are changing. Each number goes up by 2.',
        correctMessage: 'You found the next clue!',
        incorrectMessage: 'Good try! Look for the pattern carefully.',
      },
      {
        id: 'observation',
        type: 'Observation',
        emoji: '👀',
        intro: 'Count the flowers hiding in the garden below.',
        question: 'How many 🌷 flowers can you spot?',
        visual: '🌷 🌻 🌷 🌷 🌻',
        options: [
          { value: 'A', label: '2 flowers' },
          { value: 'B', label: '3 flowers' },
          { value: 'C', label: '4 flowers' },
          { value: 'D', label: '5 flowers' },
        ],
        answer: 'B',
        hint: 'Point and count each 🌷 one by one! The 🌻 are not flowers.',
        correctMessage: 'Sharp eyes! You spotted them all!',
        incorrectMessage: 'Almost! Look again and count the 🌷 one at a time.',
      },
      {
        id: 'logic',
        type: 'Logic',
        emoji: '🧩',
        intro: 'Read the clues carefully and think.',
        question:
          'Riya is taller than Sam. Sam is taller than Tom. Who is the shortest?',
        visual: null,
        options: [
          { value: 'A', label: 'Riya' },
          { value: 'B', label: 'Sam' },
          { value: 'C', label: 'Tom' },
        ],
        answer: 'C',
        hint: 'Put Riya, Sam and Tom in a line from tallest to shortest. Who comes last?',
        correctMessage: 'Great logic! You solved the puzzle!',
        incorrectMessage: 'Good try! Think about who stands at the end of the line.',
      },
      {
        id: 'direction',
        type: 'Direction & Sequence',
        emoji: '🗺️',
        intro: 'Follow the directions to reach the treasure spot.',
        question:
          'Aarav walks towards the rising sun. The sun rises in the East. Which direction is Aarav walking?',
        visual: '🌅 → ➡️ → 🗺️',
        options: [
          { value: 'A', label: 'West' },
          { value: 'B', label: 'North' },
          { value: 'C', label: 'East' },
          { value: 'D', label: 'South' },
        ],
        answer: 'C',
        hint: 'Remember: the sun rises in the East and sets in the West.',
        correctMessage: 'Perfect direction sense! The treasure is near!',
        incorrectMessage: 'Good try! Remember where the sun comes up in the morning.',
      },
    ],
  },
];