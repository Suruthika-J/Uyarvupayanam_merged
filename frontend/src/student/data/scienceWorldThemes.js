// Cartoon Science Adventure World (Class 5 Science) art-direction mirror.
//
// Mirrored from backend/seeders/seedScience.js (WORLDS). The backend is the
// source of truth for questions/experiment answers; this file mirrors only the
// world art-direction + discoveries so the (public) Science Adventure hub
// renders offline and so pages can theme scenes without a network round-trip.
//
// Keep this in sync with buildWorlds() / PALETTES in the backend seeder.

const SCIENCE_WORLD_THEMES = {
  'living-world': {
    name: 'உயிரினங்கள்',
    nameEn: 'Living Things',
    guideLine: 'Welcome to the forest of living things!',
    skills: ['observe', 'compare'],
    accent: '#3f9e4d',
    environment: 'forest',
    intro: "Let's meet plants, animals and all the secret signs that show something is ALIVE.",
    discoveries: [
      { key: 'seed', title: 'Everything starts tiny', blurb: 'A seed drinks water, wakes up and grows into a whole new plant.', art: 'seed' },
      { key: 'frog', title: 'Animals grow too', blurb: 'Frog eggs hatch into tadpoles that slowly change into frogs.', art: 'frog' },
      { key: 'honeybee', title: 'Living things need food and air', blurb: 'Every living thing eats food, breathes and grows through its life.', art: 'honeybee' },
      { key: 'stone', title: 'Is it alive?', blurb: 'A stone stays the same for years — it does not grow or need food.', art: 'stone' },
      { key: 'leaf', title: 'Food from sunlight', blurb: 'Green plants use sunlight, water and air to make their own food.', art: 'leaf' },
    ],
    theme: { environment: 'forest', mood: 'wonder', animation: 'sway', cardStyle: 'storybook', palette: { skyTop: '#b7e7a5', skyBottom: '#e9f7c9', ground: '#8ec46e', accent: '#3f9e4d', cardBg: '#f1fbe8', cardAccent: '#66bb6a' } },
  },
  'human-body': {
    name: 'மனித உடல்',
    nameEn: 'Human Body',
    guideLine: 'Step inside the amazing body machine!',
    skills: ['observe', 'connect'],
    accent: '#d84e7a',
    environment: 'bodylab',
    intro: 'Meet your heart, lungs, brain and bones, and see how they work together every second.',
    discoveries: [
      { key: 'heart', title: 'Your super pump', blurb: 'Your heart beats every second and pushes blood to every part of you.', art: 'heart' },
      { key: 'lungs', title: 'Breathe in, breathe out', blurb: 'Your lungs take in oxygen and let out carbon dioxide.', art: 'lungs' },
      { key: 'stomach', title: 'The food cruncher', blurb: 'Your stomach squeezes and mixes food so your body can use it.', art: 'stomach' },
      { key: 'brain', title: 'The command centre', blurb: 'Your brain sends messages along nerves at lightning speed.', art: 'brain' },
      { key: 'bone', title: 'A skeleton frame', blurb: 'More than 200 bones give your body its shape and protect soft organs.', art: 'bone' },
    ],
    theme: { environment: 'bodylab', mood: 'wonder', animation: 'orbit', cardStyle: 'storybook', palette: { skyTop: '#f7c8d0', skyBottom: '#ffe3ec', ground: '#ef9eb0', accent: '#d84e7a', cardBg: '#fff1f5', cardAccent: '#f06292' } },
  },
  'food-nutrition': {
    name: 'உணவு மற்றும் ஊட்டச்சத்து',
    nameEn: 'Food & Nutrition',
    guideLine: 'Come cook a healthy plate!',
    skills: ['sort', 'choose'],
    accent: '#ef8a1f',
    environment: 'kitchen',
    intro: 'Sort foods, build a balanced plate, and discover what keeps you strong and full of energy.',
    discoveries: [
      { key: 'grain', title: 'Energy fuel', blurb: 'Rice, roti and potatoes give you energy to run and play.', art: 'grain' },
      { key: 'dal', title: 'Body-building blocks', blurb: 'Dal, milk, eggs and fish help build strong muscles.', art: 'dal' },
      { key: 'apple', title: 'Protective friends', blurb: 'Fruits and vegetables keep you safe from illness.', art: 'apple' },
      { key: 'sweets', title: 'Only a little', blurb: 'Too many sweets and chips make you sleepy and weak.', art: 'sweets' },
      { key: 'water', title: "Don't forget water", blurb: 'Water carries nutrients to every part of your body.', art: 'water' },
    ],
    theme: { environment: 'kitchen', mood: 'wonder', animation: 'sway', cardStyle: 'storybook', palette: { skyTop: '#ffdca8', skyBottom: '#ffefcf', ground: '#e8b86d', accent: '#ef8a1f', cardBg: '#fff6e3', cardAccent: '#f59e0b' } },
  },
  materials: {
    name: 'பொருட்கள்',
    nameEn: 'Materials',
    guideLine: 'What is everything made of?',
    skills: ['predict', 'compare'],
    accent: '#5568c4',
    environment: 'materialslab',
    intro: 'Explore wood, glass, iron, cotton and plastic, and learn why we choose different materials for different jobs.',
    discoveries: [
      { key: 'iron', title: 'Strong and shiny', blurb: 'Metals like iron are hard, strong and easy to shape into tools.', art: 'iron' },
      { key: 'cotton', title: 'Soft and breathable', blurb: 'Cotton comes from plants and keeps you cool.', art: 'cotton' },
      { key: 'glass', title: 'See-through', blurb: 'Glass is transparent — light passes straight through it.', art: 'glass' },
      { key: 'wood', title: 'From trees', blurb: 'Wood is hard but lighter than iron, and it floats on water.', art: 'wood' },
      { key: 'sponge', title: 'Light and squishy', blurb: 'A sponge is full of tiny air holes, so it is very light.', art: 'sponge' },
    ],
    theme: { environment: 'materialslab', mood: 'wonder', animation: 'orbit', cardStyle: 'storybook', palette: { skyTop: '#cdd6f4', skyBottom: '#e8ecfc', ground: '#9aa8d8', accent: '#5568c4', cardBg: '#eef1fd', cardAccent: '#6673e6' } },
  },
  matter: {
    name: 'பொருளின் நிலைகள்',
    nameEn: 'States of Matter',
    guideLine: 'Solid, liquid, gas — meet all three!',
    skills: ['predict', 'observe'],
    accent: '#7c5fce',
    environment: 'particlelab',
    intro: 'Watch ice melt, water flow and steam spread as the same matter changes state.',
    discoveries: [
      { key: 'ice', title: 'A solid', blurb: 'Ice keeps its shape because its particles are packed tightly.', art: 'ice' },
      { key: 'droplet', title: 'A liquid', blurb: 'Water flows and takes the shape of its container.', art: 'droplet' },
      { key: 'steam', title: 'A gas', blurb: 'Steam spreads everywhere — gases have no fixed shape.', art: 'steam' },
      { key: 'thermometer', title: 'Melting and boiling', blurb: 'Ice melts at 0°C; water boils into steam at 100°C.', art: 'thermometer' },
    ],
    theme: { environment: 'particlelab', mood: 'wonder', animation: 'sway', cardStyle: 'storybook', palette: { skyTop: '#c8b8f0', skyBottom: '#e4d9fb', ground: '#9c8bd6', accent: '#7c5fce', cardBg: '#f2edfc', cardAccent: '#8b5cf6' } },
  },
  water: {
    name: 'நீர்',
    nameEn: 'Water',
    guideLine: 'Follow the magic water cycle!',
    skills: ['sequence', 'observe'],
    accent: '#2a8cc8',
    environment: 'waterscape',
    intro: 'See how a drop travels from puddle to cloud to rain, and learn to save every precious drop.',
    discoveries: [
      { key: 'river', title: 'The water cycle', blurb: 'Water evaporates, forms clouds, falls as rain and flows to the sea.', art: 'river' },
      { key: 'waterfall', title: 'Down, down, down', blurb: 'Water always flows from higher to lower ground.', art: 'waterfall' },
      { key: 'tap', title: 'Save every drop', blurb: 'A leaking tap can waste a whole bucket of water every day.', art: 'tap' },
      { key: 'droplet', title: "Water's shape", blurb: 'Liquid water flows and takes the shape of any container.', art: 'droplet' },
    ],
    theme: { environment: 'waterscape', mood: 'wonder', animation: 'orbit', cardStyle: 'storybook', palette: { skyTop: '#8fd3f0', skyBottom: '#d7f1fb', ground: '#5ba9d6', accent: '#2a8cc8', cardBg: '#e6f6fd', cardAccent: '#0ea5e9' } },
  },
  air: {
    name: 'காற்று',
    nameEn: 'Air',
    guideLine: 'Catch the invisible air!',
    skills: ['predict', 'prove'],
    accent: '#3aa2d9',
    environment: 'skyscape',
    intro: 'Prove air is real, feel its push, and let the wind fly a kite.',
    discoveries: [
      { key: 'balloon', title: 'Air is real', blurb: 'Blow a balloon and it grows — that push inside is air.', art: 'balloon' },
      { key: 'kite', title: 'Air can push', blurb: 'Moving air (wind) lifts and carries a kite high.', art: 'kite' },
      { key: 'windmill', title: "Let's use the wind", blurb: 'Windmills catch moving air to pump water or make electricity.', art: 'windmill' },
      { key: 'pinwheel', title: 'Even a pinwheel shows it', blurb: 'A pinwheel spins because air pushes against its blades.', art: 'pinwheel' },
    ],
    theme: { environment: 'skyscape', mood: 'wonder', animation: 'sway', cardStyle: 'storybook', palette: { skyTop: '#9fd8f8', skyBottom: '#e8f6ff', ground: '#7bc0ea', accent: '#3aa2d9', cardBg: '#f0f9ff', cardAccent: '#38bdf8' } },
  },
  'force-motion': {
    name: 'விசையும் இயக்கமும்',
    nameEn: 'Force & Motion',
    guideLine: 'Ready, set, race down the ramp!',
    skills: ['predict', 'measure'],
    accent: '#de6f1a',
    environment: 'forcescape',
    intro: 'Push, pull, magnets and ramps — discover what makes things move, speed up and stop.',
    discoveries: [
      { key: 'ramp', title: 'Steep or gentle?', blurb: 'A steeper ramp makes a toy car race down faster.', art: 'ramp' },
      { key: 'magnet', title: 'Push and pull, no touch', blurb: 'Magnets attract iron even from a small distance.', art: 'magnet' },
      { key: 'seesaw', title: 'Light and heavy', blurb: 'The heavier side of a seesaw goes down; the lighter side rises.', art: 'seesaw' },
      { key: 'ball', title: 'Why does it stop?', blurb: 'A ball keeps rolling until friction and air slow it down.', art: 'ball' },
      { key: 'cart', title: 'Force moves things', blurb: 'Push or pull to start, stop, speed up or turn anything.', art: 'cart' },
    ],
    theme: { environment: 'forcescape', mood: 'wonder', animation: 'orbit', cardStyle: 'storybook', palette: { skyTop: '#ffc97a', skyBottom: '#ffeacc', ground: '#efa954', accent: '#de6f1a', cardBg: '#fff4e0', cardAccent: '#fb923c' } },
  },
  'light-sound': {
    name: 'ஒளியும் ஒலியும்',
    nameEn: 'Light & Sound',
    guideLine: 'Shine a light, make some noise!',
    skills: ['predict', 'observe'],
    accent: '#a855f7',
    environment: 'theatre',
    intro: 'Chase shadows, bounce light off mirrors and feel sound as a vibration.',
    discoveries: [
      { key: 'sun', title: 'Natural light', blurb: 'The Sun, stars and lightning are natural sources of light.', art: 'sun' },
      { key: 'lamp', title: 'Man-made light', blurb: 'A lamp, candle and torch are man-made sources of light.', art: 'lamp' },
      { key: 'shadow', title: 'Light stops at shadows', blurb: 'An object blocks light, and the dark patch behind it is a shadow.', art: 'shadow' },
      { key: 'bell', title: 'Sound is vibration', blurb: 'When a bell rings it vibrates; when it stops, the sound stops too.', art: 'bell' },
      { key: 'mirror', title: 'Light bounces back', blurb: 'A mirror reflects light, which is why you see yourself in it.', art: 'mirror' },
    ],
    theme: { environment: 'theatre', mood: 'wonder', animation: 'sway', cardStyle: 'storybook', palette: { skyTop: '#4a4a7c', skyBottom: '#a89fd8', ground: '#7a6fb0', accent: '#efe9f0', cardBg: '#f4f0fb', cardAccent: '#a855f7' } },
  },
  'earth-space': {
    name: 'பூமியும் விண்வெளியும்',
    nameEn: 'Earth & Space',
    guideLine: 'Blast off to the stars!',
    skills: ['connect', 'recall'],
    accent: '#6366f1',
    environment: 'spacescape',
    intro: 'Spin the Earth for day and night, meet the Moon and travel past our Solar System.',
    discoveries: [
      { key: 'earth', title: 'Our blue home', blurb: 'Earth spins on its axis, which gives us day and night.', art: 'earth' },
      { key: 'moon', title: 'No light of its own', blurb: "The Moon shines because it reflects the Sun's light.", art: 'moon' },
      { key: 'star', title: 'Suns far away', blurb: 'Stars are huge glowing balls of gas; our Sun is one of them.', art: 'star' },
      { key: 'rocket', title: 'Into space', blurb: "Rockets carry astronauts and satellites beyond Earth's atmosphere.", art: 'rocket' },
      { key: 'telescope', title: 'Look beyond', blurb: 'A telescope helps us see planets and stars up close.', art: 'telescope' },
    ],
    theme: { environment: 'spacescape', mood: 'wonder', animation: 'orbit', cardStyle: 'storybook', palette: { skyTop: '#1e2a5e', skyBottom: '#4a4f96', ground: '#2b2f5e', accent: '#9fd8ff', cardBg: '#e8eafd', cardAccent: '#6366f1' } },
  },
  environment: {
    name: 'சுற்றுச்சூழல்',
    nameEn: 'Environment',
    guideLine: 'Come rescue the green world!',
    skills: ['sort', 'act'],
    accent: '#2f9e5f',
    environment: 'ecoforest',
    intro: 'Sort waste, clean rivers and learn small habits that save our one and only planet.',
    discoveries: [
      { key: 'recycle', title: 'Reuse me again', blurb: 'Paper, plastic and glass can be recycled into new things.', art: 'recycle' },
      { key: 'tree', title: 'The green lungs', blurb: 'Trees give shade, clean the air and are home to many creatures.', art: 'tree' },
      { key: 'bin', title: 'Throw waste in the bin', blurb: 'Litter spoils water and soil; put waste in the right bin.', art: 'bin' },
      { key: 'factory', title: 'Why clean air matters', blurb: 'Smoke from factories and vehicles makes the air dirty.', art: 'factory' },
      { key: 'polybag', title: 'Say no to plastic bags', blurb: 'Plastic bags rot very slowly and choke our soil and rivers.', art: 'polybag' },
    ],
    theme: { environment: 'ecoforest', mood: 'wonder', animation: 'sway', cardStyle: 'storybook', palette: { skyTop: '#9fe8b9', skyBottom: '#dbf7e2', ground: '#5fb87f', accent: '#2f9e5f', cardBg: '#ecfaf0', cardAccent: '#22c55e' } },
  },
  weather: {
    name: 'வானிலை',
    nameEn: 'Weather',
    guideLine: 'Can you read the sky?',
    skills: ['predict', 'observe'],
    accent: '#3d78a6',
    environment: 'weatherstation',
    intro: 'Spot rain clouds, measure heat and dress right for any weather!',
    discoveries: [
      { key: 'thermometer', title: 'How hot or cold', blurb: 'A thermometer measures temperature in degrees.', art: 'thermometer' },
      { key: 'rainbow', title: 'Drops + sunlight', blurb: 'After rain, sunlight bends in water drops and paints a rainbow.', art: 'rainbow' },
      { key: 'storm', title: 'Heavy weather', blurb: 'Storms bring heavy rain, lightning, thunder and strong wind.', art: 'storm' },
      { key: 'windvane', title: 'Which way the wind?', blurb: 'A wind vane points in the direction the wind is blowing.', art: 'windvane' },
      { key: 'umbrella', title: 'Weather clothes', blurb: 'Choose clothes and gear that suit sunny, rainy or cold days.', art: 'umbrella' },
    ],
    theme: { environment: 'weatherstation', mood: 'wonder', animation: 'orbit', cardStyle: 'storybook', palette: { skyTop: '#8db8d9', skyBottom: '#dbeaf6', ground: '#6f9cc0', accent: '#3d78a6', cardBg: '#eef6fb', cardAccent: '#0ea5e9' } },
  },
  'science-lab': {
    name: 'அறிவியல் ஆய்வகம்',
    nameEn: 'Science Lab',
    guideLine: 'Welcome to the Science Lab!',
    skills: ['measure', 'fair test'],
    accent: '#41648a',
    environment: 'labroom',
    intro: 'Measure, observe and test fairly — become a careful young scientist.',
    discoveries: [
      { key: 'testtube', title: 'Mix and see', blurb: 'Scientists mix small amounts to test ideas in test tubes.', art: 'testtube' },
      { key: 'magnifier', title: 'Look closer', blurb: "A magnifier zooms in on tiny details your eyes can't catch.", art: 'magnifier' },
      { key: 'flask', title: 'Measure exactly', blurb: 'Flasks and beakers measure liquids so experiments are fair.', art: 'flask' },
      { key: 'goggles', title: 'Stay safe', blurb: 'Goggles, gloves and care keep a young scientist safe.', art: 'goggles' },
      { key: 'scale', title: 'Make it fair', blurb: 'Measuring keeps each test fair so your conclusion is true.', art: 'scale' },
    ],
    theme: { environment: 'labroom', mood: 'wonder', animation: 'sway', cardStyle: 'storybook', palette: { skyTop: '#d6e2ee', skyBottom: '#f1f5f9', ground: '#aebfce', accent: '#41648a', cardBg: '#f4f7fa', cardAccent: '#64748b' } },
  },
}

// Trail order: the student's journey across the Science Land, one world after
// another. The Daily Challenge is area 01 (a special pavilion, always open).
export const EXPLORE_ORDER = [
  'living-world',
  'human-body',
  'food-nutrition',
  'materials',
  'matter',
  'water',
  'air',
  'force-motion',
  'light-sound',
  'earth-space',
  'environment',
  'weather',
  'science-lab',
]

export function findScienceWorld(id) {
  const key = String(id)
  if (SCIENCE_WORLD_THEMES[key]) {
    return { id: key, ...SCIENCE_WORLD_THEMES[key] }
  }
  return null
}

// Seed mirror for offline exploration browsing (worlds + themes only).
export const SEED_WORLDS = EXPLORE_ORDER.map((id) => ({
  id,
  order: EXPLORE_ORDER.indexOf(id) + 1,
  locked: false,
  solved: 0,
  total: 0,
  completed: false,
  experiment: null,
  experimentDone: false,
  ...SCIENCE_WORLD_THEMES[id],
}))

export default SCIENCE_WORLD_THEMES