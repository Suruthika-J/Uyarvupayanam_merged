export const SONG_THEMES = [
  { emoji: '🌳', label: 'Nature', value: 'Nature' },
  { emoji: '🏫', label: 'School', value: 'School' },
  { emoji: '👨‍👩‍👧', label: 'Family', value: 'Family' },
  { emoji: '🚀', label: 'Space', value: 'Space' },
  { emoji: '🤝', label: 'Friendship', value: 'Friendship' },
  { emoji: '🎉', label: 'Celebration', value: 'Celebration' },
];

export const SONG_MOODS = [
  { emoji: '😊', label: 'Happy', value: 'Happy' },
  { emoji: '🌟', label: 'Exciting', value: 'Exciting' },
  { emoji: '💕', label: 'Friendly', value: 'Friendly' },
  { emoji: '🌈', label: 'Calm', value: 'Calm' },
  { emoji: '🎉', label: 'Energetic', value: 'Energetic' },
];

export const SONG_WORDS_BY_THEME = {
  Nature: [
    { emoji: '🌞', label: 'Sun', value: 'Sun' },
    { emoji: '🌸', label: 'Flower', value: 'Flower' },
    { emoji: '🦋', label: 'Butterfly', value: 'Butterfly' },
    { emoji: '🌳', label: 'Tree', value: 'Tree' },
    { emoji: '🌈', label: 'Rainbow', value: 'Rainbow' },
    { emoji: '🐦', label: 'Bird', value: 'Bird' },
    { emoji: '🌧️', label: 'Rain', value: 'Rain' },
  ],
  School: [
    { emoji: '🎒', label: 'Backpack', value: 'Backpack' },
    { emoji: '📚', label: 'Books', value: 'Books' },
    { emoji: '✏️', label: 'Pencil', value: 'Pencil' },
    { emoji: '👩‍🏫', label: 'Teacher', value: 'Teacher' },
    { emoji: '🖍️', label: 'Crayons', value: 'Crayons' },
    { emoji: '🏃', label: 'Recess', value: 'Recess' },
  ],
  Family: [
    { emoji: '👩', label: 'Mama', value: 'Mama' },
    { emoji: '👨', label: 'Papa', value: 'Papa' },
    { emoji: '👧', label: 'Sister', value: 'Sister' },
    { emoji: '🐶', label: 'Pet', value: 'Pet' },
    { emoji: '🏠', label: 'Home', value: 'Home' },
    { emoji: '🍲', label: 'Dinner', value: 'Dinner' },
  ],
  Space: [
    { emoji: '🚀', label: 'Rocket', value: 'Rocket' },
    { emoji: '🌙', label: 'Moon', value: 'Moon' },
    { emoji: '⭐', label: 'Star', value: 'Star' },
    { emoji: '🪐', label: 'Planet', value: 'Planet' },
    { emoji: '👨‍🚀', label: 'Astronaut', value: 'Astronaut' },
    { emoji: '🌌', label: 'Galaxy', value: 'Galaxy' },
  ],
  Friendship: [
    { emoji: '🤝', label: 'Friends', value: 'Friends' },
    { emoji: '🥳', label: 'Games', value: 'Games' },
    { emoji: '😄', label: 'Smiles', value: 'Smiles' },
    { emoji: '🎁', label: 'Gifts', value: 'Gifts' },
    { emoji: '🛝', label: 'Playground', value: 'Playground' },
    { emoji: '💖', label: 'Kindness', value: 'Kindness' },
  ],
  Celebration: [
    { emoji: '🎂', label: 'Cake', value: 'Cake' },
    { emoji: '🎈', label: 'Balloons', value: 'Balloons' },
    { emoji: '🎁', label: 'Presents', value: 'Presents' },
    { emoji: '🥳', label: 'Party', value: 'Party' },
    { emoji: '🎊', label: 'Confetti', value: 'Confetti' },
    { emoji: '🎶', label: 'Music', value: 'Music' },
  ],
};

export const SONG_STEPS = [
  { id: 'theme', title: 'Choose Your Song Theme', label: 'Theme' },
  { id: 'mood', title: 'How should your song feel?', label: 'Mood' },
  { id: 'words', title: 'Pick Some Words for Your Song', label: 'Words' },
  { id: 'lyrics', title: 'Create Your Song', label: 'Lyrics' },
];

export const SONG_STARTER_IDEAS = [
  'My happy song is all about…',
  'I love the {theme}!',
  'Come along with me and…',
  'The {word} makes me smile!',
];

export const LYRICS_GUIDES = [
  '💭 What do you want to say?',
  '🎵 Can you make two lines rhyme?',
  '🌟 Can you add something surprising?',
];

export const MIN_LYRICS_WORDS = 8;
export const MAX_WORDS = 5;
export const MIN_WORDS = 3;

export const RHYME_HELPER = {
  Sun: ['Fun', 'Run', 'Done'],
  Star: ['Far', 'Car', 'Jar'],
  Moon: ['Soon', 'June', 'Spoon'],
  Tree: ['Free', 'Bee', 'Sea'],
  Flower: ['Shower', 'Power'],
  Rainbow: ['Snow', 'Grow'],
  Bird: ['Word', 'Heard'],
  Rain: ['Train', 'Plane', 'Spain'],
  Rocket: ['Pocket', 'Socket'],
  Cake: ['Shake', 'Bake', 'Make'],
  Balloons: ['Spoons', 'Moons'],
  Party: ['Hardy', 'Hearty'],
  Books: ['Looks', 'Hooks'],
  Friends: ['Ends', 'Sends'],
  Home: ['Rome', 'Comb'],
  Pet: ['Wet', 'Get', 'Set'],
  Games: ['Frames', 'Tames'],
  Gifts: ['Lifts', 'Sifts'],
};