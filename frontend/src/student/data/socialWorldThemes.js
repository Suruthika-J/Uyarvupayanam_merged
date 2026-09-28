// World Explorer (Class 5 Social Science) art-direction mirror.
//
// Mirrored from backend/seeders/seedSocial.js (WORLDS). The backend is the
// source of truth for questions/activities; this file mirrors only the world
// art-direction + discoveries so the (public) World Explorer hub renders
// offline and so pages can theme scenes without a network round-trip.
//
// Keep this in sync with SOCIAL_WORLD_THEMES / WORLDS in the backend seeder.

const SOCIAL_WORLD_THEMES = {
  'solar-system': {
    name: 'சூரியக் குடும்பம்',
    nameEn: 'Solar System',
    guideLine: "Let's explore the Solar System!",
    skills: ['The Sun', 'Planets', 'Order from the Sun'],
    accent: '#ffd27a',
    environment: 'space',
    intro: 'Hop into the rocket and travel through the space world — meet the Sun and eight planets that spin around it.',
    discoveries: [
      { key: 'sun', title: 'The Sun', blurb: 'A giant glowing star at the centre of our Solar System. Its light and heat make life on Earth possible.', art: 'sun' },
      { key: 'earth', title: 'Home planet', blurb: 'Earth is the only planet we know with oceans, air and life.', art: 'planet-earth' },
      { key: 'mars', title: 'The Red Planet', blurb: 'Mars looks red because rust-coloured dust covers its rocks.', art: 'planet-mars' },
      { key: 'saturn', title: 'Ringed planet', blurb: 'Saturn wears the biggest, brightest rings, made of ice and rock.', art: 'planet-saturn' },
      { key: 'jupiter', title: 'The giant', blurb: 'Jupiter is the largest planet — bigger than all the others put together.', art: 'planet-jupiter' },
    ],
    theme: { environment: 'space', mood: 'wonder', animation: 'orbit', cardStyle: 'space', palette: { skyTop: '#0b1030', skyBottom: '#3b2f8f', ground: '#151a3a', accent: '#ffd27a', cardBg: '#221c4d', cardAccent: '#a778ff' } },
  },
  earth: {
    name: 'பூமி',
    nameEn: 'Earth',
    guideLine: 'Welcome to the blue planet — our home!',
    skills: ['Globe', 'Oceans', 'Day and night'],
    accent: '#4d9de0',
    environment: 'earthview',
    intro: 'Zoom to the blue planet. See the globe, the oceans and how spinning Earth makes day and night.',
    discoveries: [
      { key: 'globe', title: 'Globe', blurb: 'A globe is a small model of the Earth we can hold and spin.', art: 'globe' },
      { key: 'ocean', title: 'Oceans', blurb: "About 71% of the Earth's surface is covered by water in five big oceans.", art: 'ocean' },
      { key: 'mountain', title: 'Mountains', blurb: 'The highest land on Earth wears a cap of snow at the top.', art: 'mountain' },
      { key: 'daynight', title: 'Day & night', blurb: 'Earth spins slowly like a top — the side facing the Sun has day, the other side has night.', art: 'globe-daynight' },
      { key: 'seasons', title: 'Seasons', blurb: 'As Earth travels around the Sun, we get summer, monsoon, winter and spring.', art: 'sunshine' },
    ],
    theme: { environment: 'earthview', mood: 'bright', animation: 'spin', cardStyle: 'storybook', palette: { skyTop: '#2e7bd6', skyBottom: '#b7e6ff', ground: '#6ea85c', accent: '#ffcf6b', cardBg: '#eef7ff', cardAccent: '#4d9de0' } },
  },
  'india-explorer': {
    name: 'இந்தியாவை ஆராய்வோம்',
    nameEn: 'India Explorer',
    guideLine: 'Can you find India on the map?',
    skills: ['States', 'Capitals', 'Landmarks', 'Rivers'],
    accent: '#e08a2b',
    environment: 'india',
    intro: 'Step onto a cartoon map of India and travel from snow-peaked mountains to sea-coast states.',
    discoveries: [
      { key: 'flag', title: 'Our flag', blurb: 'The tricolour — saffron for courage, white for peace, green for growth — with the Ashoka Chakra in the middle.', art: 'flag' },
      { key: 'peacock', title: 'National bird', blurb: 'The blue peacock dances with rainbow-coloured feathers.', art: 'peacock' },
      { key: 'lotus', title: 'National flower', blurb: 'The lotus blooms clean and bright even though it grows from muddy water.', art: 'lotus' },
      { key: 'himalaya', title: 'The Himalayas', blurb: "The tallest mountains on Earth stand like a crown along India's north.", art: 'mountain' },
      { key: 'taj', title: 'Taj Mahal', blurb: 'A beautiful white-marble monument in Agra, built long ago by Emperor Shah Jahan.', art: 'taj-mahal' },
      { key: 'ganga', title: 'River Ganga', blurb: 'The holy river Ganga flows across north India all the way to the sea.', art: 'river' },
    ],
    theme: { environment: 'india', mood: 'proud', animation: 'glow', cardStyle: 'storybook', palette: { skyTop: '#f2a93b', skyBottom: '#fff1c9', ground: '#d98a2b', accent: '#4f9d6b', cardBg: '#fff7e3', cardAccent: '#e08a2b' } },
  },
  geography: {
    name: 'புவியியல்',
    nameEn: 'Geography',
    guideLine: "Grab your compass — we're exploring maps, zones and seasons!",
    skills: ['Globes and maps', 'Directions', 'Equator', 'Seasons'],
    accent: '#4fa58f',
    environment: 'geography',
    intro: 'In the Geography world, read maps, find directions and discover why seasons change.',
    discoveries: [
      { key: 'compass', title: 'Directions', blurb: 'North, South, East and West help us say where things are.', art: 'compass' },
      { key: 'equator', title: 'Equator', blurb: 'The imaginary line around the middle of the Earth — the warmest zone.', art: 'globe' },
      { key: 'symbols', title: 'Map symbols', blurb: 'Maps use tiny signs — a tree for a forest, a wavy line for a river.', art: 'map' },
      { key: 'desert', title: 'Deserts', blurb: 'Very dry, sandy lands where rain almost never comes.', art: 'desert' },
      { key: 'forest', title: 'Forests', blurb: 'Thick lands of trees that give us fresh air, timber and homes for animals.', art: 'forest' },
    ],
    theme: { environment: 'geography', mood: 'explore', animation: 'swirl', cardStyle: 'storybook', palette: { skyTop: '#57b8d8', skyBottom: '#e7f6ee', ground: '#8ba95b', accent: '#ff9f6b', cardBg: '#eefbf3', cardAccent: '#4fa58f' } },
  },
  history: {
    name: 'கால இயந்திரம்',
    nameEn: 'Time Machine',
    guideLine: "Let's travel back in time!",
    skills: ['Early humans', 'Ancient India', 'The wheel', 'Kings and forts'],
    accent: '#a06424',
    environment: 'history',
    intro: 'Step into the Time Machine and ride from cave times to ancient forts and kingdoms.',
    discoveries: [
      { key: 'cave', title: 'Cave homes', blurb: 'Early humans lived in caves and painted pictures of animals on the walls.', art: 'cave' },
      { key: 'fire', title: 'Fire', blurb: 'Learning to make fire kept early humans warm, safe and able to cook food.', art: 'fire' },
      { key: 'wheel', title: 'The wheel', blurb: 'The wheel changed travel and trade — carts, pots and later machines.', art: 'wheel' },
      { key: 'seal', title: 'Indus seal', blurb: 'Thousands of years ago, crafters in India made small carved seals for trade.', art: 'seal' },
      { key: 'fort', title: 'Royal forts', blurb: 'Kings built strong forts on hills and near rivers to guard their kingdoms.', art: 'fort' },
    ],
    theme: { environment: 'history', mood: 'ancient', animation: 'flicker', cardStyle: 'storybook', palette: { skyTop: '#8a5a2b', skyBottom: '#f2c98a', ground: '#6e4a2b', accent: '#ffd27a', cardBg: '#f7ecd8', cardAccent: '#a06424' } },
  },
  'freedom-struggle': {
    name: 'விடுதலைப் போராட்டம்',
    nameEn: 'Freedom Struggle',
    guideLine: "Meet the brave people who won India's freedom!",
    skills: ['Freedom fighters', 'Movements', 'Independence'],
    accent: '#2f8f6e',
    environment: 'freedom',
    intro: 'Walk through the years of the freedom struggle and meet the leaders who freed our nation — with respect and pride.',
    discoveries: [
      { key: 'gandhi', title: 'Mahatma Gandhi', blurb: 'He led India with truth and non-violence — spinning, marching and uniting people.', art: 'gandhi' },
      { key: 'bose', title: 'Netaji Subhas Chandra Bose', blurb: 'He formed the Indian National Army to fight for freedom.', art: 'bose' },
      { key: 'rani', title: 'Rani Lakshmibai', blurb: 'The brave queen of Jhansi who fought in the 1857 uprising.', art: 'rani' },
      { key: 'patel', title: 'Sardar Patel', blurb: "The 'Iron Man of India' who joined the princely states into one India.", art: 'patel' },
      { key: 'salt', title: 'Salt March', blurb: 'In 1930, Gandhi walked to the sea to make salt, peacefully breaking an unfair law.', art: 'charkha' },
    ],
    theme: { environment: 'freedom', mood: 'heroic', animation: 'glow', cardStyle: 'storybook', palette: { skyTop: '#2a8f6a', skyBottom: '#dff3e2', ground: '#b7793a', accent: '#ffb35c', cardBg: '#f2f8ef', cardAccent: '#2f8f6e' } },
  },
  civics: {
    name: 'சமூக உலகம்',
    nameEn: 'My Community',
    guideLine: 'Welcome to the friendly cartoon town!',
    skills: ['Community helpers', 'Public places', 'Road safety', 'Civic sense'],
    accent: '#5b8def',
    environment: 'civics',
    intro: 'Walk around the cartoon town — visit the school, hospital, market and police station, and learn how a community works.',
    discoveries: [
      { key: 'school', title: 'Our school', blurb: 'Where we learn new things together, every day.', art: 'school' },
      { key: 'hospital', title: 'Hospital', blurb: 'Doctors and nurses care for us when we are sick.', art: 'hospital' },
      { key: 'police', title: 'Police station', blurb: 'Police keep our streets safe and help in emergencies.', art: 'police' },
      { key: 'municipality', title: 'Municipality', blurb: 'The town office that keeps roads, water, drains and street lights working.', art: 'municipality' },
      { key: 'traffic', title: 'Traffic lights', blurb: 'Red means stop, yellow means wait, green means go.', art: 'traffic' },
    ],
    theme: { environment: 'civics', mood: 'friendly', animation: 'bustle', cardStyle: 'storybook', palette: { skyTop: '#7fb3e8', skyBottom: '#eaf6ff', ground: '#9aa86b', accent: '#ffd27a', cardBg: '#eef4ff', cardAccent: '#5b8def' } },
  },
  environment: {
    name: 'சுற்றுச்சூழல்',
    nameEn: 'Environment',
    guideLine: 'Come help rescue the green world!',
    skills: ['Conservation', 'Pollution', 'Recycling', 'Natural disasters'],
    accent: '#4f9d6b',
    environment: 'nature',
    intro: 'Step into forests and rivers, rescue a polluted pond, and learn to care for our one and only planet.',
    discoveries: [
      { key: 'tree', title: 'Trees', blurb: 'Trees breathe out the clean air we need, and give shade and fruit.', art: 'tree' },
      { key: 'river', title: 'River', blurb: 'Rivers carry fresh water to farms, towns and the sea.', art: 'river' },
      { key: 'wildlife', title: 'Wildlife', blurb: 'Forests are home to tigers, elephants, birds and countless creatures.', art: 'wildlife' },
      { key: 'recycle', title: 'Three bins', blurb: 'Paper, plastic and food waste go to different bins so they can be reused.', art: 'recycle' },
      { key: 'clean', title: 'Clean river', blurb: 'A river stays healthy when we do not throw plastic and waste into it.', art: 'clean-river' },
    ],
    theme: { environment: 'nature', mood: 'fresh', animation: 'sway', cardStyle: 'storybook', palette: { skyTop: '#4f9d6b', skyBottom: '#dff3ca', ground: '#5b8a4a', accent: '#ffce57', cardBg: '#eefbe6', cardAccent: '#4f9d6b' } },
  },
}

// Trail order: the student's journey across the globe, one world after another.
export const WORLD_ORDER = [
  'solar-system',
  'earth',
  'india-explorer',
  'geography',
  'history',
  'freedom-struggle',
  'civics',
  'environment',
]

export function findWorld(id) {
  const key = String(id)
  if (SOCIAL_WORLD_THEMES[key]) {
    return { id: key, ...SOCIAL_WORLD_THEMES[key] }
  }
  return null
}

// Seed mirror for offline exploration browsing (worlds + themes only, no Qs).
export const SEED_WORLDS = WORLD_ORDER.map((id) => ({
  id,
  order: WORLD_ORDER.indexOf(id) + 1,
  locked: false,
  solved: 0,
  total: 0,
  completed: false,
  ...SOCIAL_WORLD_THEMES[id],
}))

export default SOCIAL_WORLD_THEMES