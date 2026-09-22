// Offline/demo seed data for the Class 5 career-discovery feature.
// Mirrors the shapes returned by the backend under /api/class5 so the UI
// renders fully even when the API or student login is unavailable.

export const seedCareerWorlds = [
  { key: "ocean-explorer", name: "Ocean Explorer", tagline: "Curiosity, science and the sea", emoji: "🌊", colorTag: "blue", description: "You love discovering how things work — from waves to whales. Scientists, marine biologists and explorers think like you!", skillTags: ["science", "logic", "focus"] },
  { key: "story-weaver", name: "Story Weaver", tagline: "Words, imagination and feelings", emoji: "📚", colorTag: "purple", description: "You turn ideas into stories, pictures and worlds. Writers, illustrators, filmmakers and game designers think like you!", skillTags: ["creativity", "empathy"] },
  { key: "money-master", name: "Money Master", tagline: "Smart choices with numbers", emoji: "💡", colorTag: "gold", description: "You like figuring out fair prices, saving and balancing. Entrepreneurs, bankers and shop owners think like you!", skillTags: ["logic", "focus", "creativity"] },
  { key: "green-builder", name: "Green Builder", tagline: "Caring for people and planet", emoji: "🌱", colorTag: "green", description: "You care about Earth and about helping neighbours. Engineers, urban planners and community leaders think like you!", skillTags: ["empathy", "leadership"] },
  { key: "space-engineer", name: "Space Engineer", tagline: "Building the future, one part at a time", emoji: "🚀", colorTag: "orange", description: "You like designing, building and fixing things. Engineers, architects and makers think like you!", skillTags: ["logic", "creativity", "focus"] },
  { key: "community-doctor", name: "Community Doctor", tagline: "Healing with kindness and science", emoji: "🩺", colorTag: "red", description: "You notice when people need help and care. Doctors, nurses, teachers and helpers think like you!", skillTags: ["empathy", "leadership", "logic"] },
  { key: "code-wizard", name: "Code Wizard", tagline: "Telling computers what to do", emoji: "🧙", colorTag: "purple", description: "You like giving clear steps and solving puzzles. Programmers, app makers and robotics builders think like you!", skillTags: ["logic", "focus", "creativity"] },
];

export const seedWorldByKey = Object.fromEntries(seedCareerWorlds.map((w) => [w.key, w]));

export const seedQuizQuestions = [
  { id: "q1", text: "Would you rather build a robot — or write the story of its day?", emoji: "🤖", options: [
    { index: 0, label: "Build the robot", emoji: "🛠️", worldKey: "space-engineer", axes: { logic: 3, focus: 2 } },
    { index: 1, label: "Write its story", emoji: "✍️", worldKey: "story-weaver", axes: { creativity: 3, empathy: 1 } },
    { index: 2, label: "Design its pretty shell", emoji: "🎨", worldKey: "green-builder", axes: { creativity: 2, empathy: 1 } },
  ] },
  { id: "q2", text: "Your friend feels sad at recess. What do you do?", emoji: "😊", options: [
    { index: 0, label: "Sit and listen", emoji: "🤝", worldKey: "community-doctor", axes: { empathy: 3, leadership: 1 } },
    { index: 1, label: "Invent a fun game", emoji: "🎲", worldKey: "story-weaver", axes: { creativity: 3 } },
    { index: 2, label: "Get the whole team cheering", emoji: "📣", worldKey: "green-builder", axes: { leadership: 3, empathy: 1 } },
  ] },
  { id: "q3", text: "You get 100 coins for a class shop. What's the most fun?", emoji: "💰", options: [
    { index: 0, label: "Count, price and balance", emoji: "🧮", worldKey: "money-master", axes: { logic: 3, focus: 2 } },
    { index: 1, label: "Design the shop sign", emoji: "🪧", worldKey: "story-weaver", axes: { creativity: 2 } },
    { index: 2, label: "Teach everyone to save a coin a day", emoji: "🐷", worldKey: "money-master", axes: { empathy: 2, leadership: 2 } },
  ] },
  { id: "q4", text: "Pick a dream trip.", emoji: "🔭", options: [
    { index: 0, label: "Dive to the deepest sea", emoji: "🌊", worldKey: "ocean-explorer", axes: { logic: 2, focus: 2 } },
    { index: 1, label: "Ride a rocket to the stars", emoji: "🚀", worldKey: "space-engineer", axes: { creativity: 2, logic: 2 } },
    { index: 2, label: "Map both from a lab", emoji: "🗺️", worldKey: "code-wizard", axes: { logic: 3, focus: 2 } },
  ] },
  { id: "q5", text: "Which puzzle is your favourite?", emoji: "🧩", options: [
    { index: 0, label: "Find the next pattern", emoji: "🔢", worldKey: "space-engineer", axes: { logic: 3, focus: 1 } },
    { index: 1, label: "Word and story puzzles", emoji: "🔤", worldKey: "story-weaver", axes: { creativity: 2, empathy: 1 } },
    { index: 2, label: "Number and money problems", emoji: "🌰", worldKey: "money-master", axes: { logic: 2, focus: 2 } },
  ] },
  { id: "q6", text: "Your class wants to clean the beach. Your job?", emoji: "🏖️", options: [
    { index: 0, label: "Plan who does what", emoji: "🗒️", worldKey: "green-builder", axes: { leadership: 3, focus: 1 } },
    { index: 1, label: "Count and sort what we find", emoji: "🕵️", worldKey: "ocean-explorer", axes: { logic: 2, focus: 3 } },
    { index: 2, label: "Make a catchy cheer", emoji: "🎵", worldKey: "story-weaver", axes: { creativity: 3 } },
  ] },
  { id: "q7", text: "What would you invent?", emoji: "💡", options: [
    { index: 0, label: "A machine that turns plastic into art", emoji: "♻️", worldKey: "green-builder", axes: { creativity: 3, empathy: 1 } },
    { index: 1, label: "An app that tells bedtime stories", emoji: "📱", worldKey: "code-wizard", axes: { logic: 2, creativity: 2 } },
    { index: 2, label: "A game that teaches saving", emoji: "🎮", worldKey: "money-master", axes: { logic: 2, creativity: 2 } },
  ] },
  { id: "q8", text: "Choose a school club.", emoji: "🏫", options: [
    { index: 0, label: "Science & experiment club", emoji: "🧪", worldKey: "ocean-explorer", axes: { logic: 3, focus: 2 } },
    { index: 1, label: "Drama & debate club", emoji: "🎭", worldKey: "story-weaver", axes: { creativity: 2, empathy: 2 } },
    { index: 2, label: "Coding club", emoji: "💻", worldKey: "code-wizard", axes: { logic: 3, focus: 2 } },
  ] },
  { id: "q9", text: "A new kid joins today. What do you notice first?", emoji: "👋", options: [
    { index: 0, label: "Do they feel welcome?", emoji: "🤗", worldKey: "community-doctor", axes: { empathy: 3, leadership: 1 } },
    { index: 1, label: "What do they like to build?", emoji: "🏗️", worldKey: "space-engineer", axes: { creativity: 2, focus: 1 } },
    { index: 2, label: "What's their favourite story?", emoji: "📖", worldKey: "story-weaver", axes: { empathy: 2, creativity: 2 } },
  ] },
  { id: "q10", text: "A team wins when…", emoji: "🏆", options: [
    { index: 0, label: "Everyone shared an idea", emoji: "🤲", worldKey: "community-doctor", axes: { empathy: 3, leadership: 2 } },
    { index: 1, label: "We solved the big problem", emoji: "🧠", worldKey: "code-wizard", axes: { logic: 3, focus: 2 } },
    { index: 2, label: "The budget stayed balanced", emoji: "⚖️", worldKey: "money-master", axes: { logic: 3, focus: 2 } },
  ] },
];

const SAMPLE_VIDEOS = {
  "ocean-explorer": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "story-weaver": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "money-master": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "green-builder": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "space-engineer": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "community-doctor": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "code-wizard": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
};

export const seedVideos = Object.keys(SAMPLE_VIDEOS).map((key, i) => {
  const w = seedWorldByKey[key] || { name: key, emoji: "🌍", colorTag: "blue" };
  const titles = {
    "ocean-explorer": "A day with a marine biologist",
    "story-weaver": "How an author finds ideas",
    "money-master": "A shop owner's morning routine",
    "green-builder": "Planting a city garden with an urban planner",
    "space-engineer": "Inside a robotics workshop",
    "community-doctor": "A nurse's kindest moments",
    "code-wizard": "What a young programmer builds",
  };
  return {
    id: `video-${key}`,
    careerWorldKey: key,
    world: { name: w.name, emoji: w.emoji, colorTag: w.colorTag },
    title: titles[key] || `${w.name} story`,
    url: SAMPLE_VIDEOS[key],
    thumbnail: "",
    durationSec: i % 2 === 0 ? 120 : 95,
    subtitlesUrl: "",
    featured: i === 0 || i === 6,
  };
});

export const seedGames = [
  { id: "g1", key: "pattern-bridge", category: "logic", order: 1, title: "Pattern Bridge", emoji: "🌉", gradient: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)", featured: true, xpValue: 20, skillTags: ["Logic", "Focus"], axisGains: { logic: 8, focus: 5 }, oneLiner: "why it matters: spotting patterns trains your brain for maths and science.", description: "The bridge is broken! Tap the shape that completes the pattern.", bestPct: null, play: { type: "choose", prompt: "Which shape comes next in the pattern? 🔵 🔴 🔵 🔵 🔴 🔵 …", options: ["🔴", "🔵", "🟢", "🟡"], correctIndex: 1, hint: "The pattern repeats in a sneaky 1-2 rhythm." } },
  { id: "g2", key: "ocean-detective", category: "logic", order: 2, title: "Ocean Detective", emoji: "🕵️", gradient: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)", featured: false, xpValue: 20, skillTags: ["Logic", "Observation"], axisGains: { logic: 8, focus: 5 }, oneLiner: "why it matters: good detectives read clues carefully — that's how doctors solve what's wrong.", description: "Three clues, one culprit. Read carefully and pick who took the pearl!", bestPct: null, play: { type: "choose", prompt: "Clues: the thief is wet, loves jelly, and her name has 5 letters.", options: ["Coral the crab", "Perla the whale", "Fizz the fish", "Luna the octopus"], correctIndex: 3, hint: "Count the letters — punny clues love a letter trick." } },
  { id: "g3", key: "story-spark", category: "creative", order: 3, title: "Story Spark", emoji: "✨", gradient: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)", featured: true, xpValue: 15, skillTags: ["Creativity", "Storytelling"], axisGains: { creativity: 10 }, oneLiner: "why it matters: turning ideas into stories is how writers and inventors work.", description: "Pick three ingredients and write the first lines of your story.", bestPct: null, play: { type: "write", prompt: "Write the first 2 sentences of a story that has: a tiny robot, a rainy day, and a lost map.", hint: "Small details make a story feel real." } },
  { id: "g4", key: "design-a-postcard", category: "creative", order: 4, title: "Design a Postcard", emoji: "🖌️", gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", featured: false, xpValue: 15, skillTags: ["Creativity", "Design"], axisGains: { creativity: 8, focus: 3 }, oneLiner: "why it matters: designers plan every colour to tell a feeling.", description: "Choose the colours and message that best cheer up a friend far away.", bestPct: null, play: { type: "choose", prompt: "Which postcard message will make a faraway friend smile most?", options: ["\"Wish you were here!\" with warm sunset colours", "\"I got new pencils\" with plain blue", "\"It's raining.\" with grey", "\"School was okay.\" with white"], correctIndex: 0, hint: "Warm colours + a friendly hello = a smile." } },
  { id: "g5", key: "debate-pal", category: "debate", order: 5, title: "Debate Pal", emoji: "🎤", gradient: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)", featured: true, xpValue: 20, skillTags: ["Communication", "Empathy"], axisGains: { leadership: 7, empathy: 5, creativity: 3 }, oneLiner: "why it matters: sharing an idea kindly is how leaders get things done.", description: "Choose the kindest, clearest point to help your class decide.", bestPct: null, play: { type: "choose", prompt: "Recess is 5 minutes longer, but lunch gets shorter. Pick the best sentence to say.", options: ["\"Fresh air helps us think — can we try 5 extra minutes and see?\"", "\"My idea is best, nobody else's.\"", "\"Lunch shorter? This is unfair!\"", "\"I don't care.\""], correctIndex: 0, hint: "A good point explains the why and leaves room for everyone." } },
  { id: "g6", key: "shop-balance", category: "budgeting", order: 6, title: "Shop Balance", emoji: "🧾", gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", featured: true, xpValue: 20, skillTags: ["Budgeting", "Logic"], axisGains: { logic: 8, focus: 5, creativity: 2 }, oneLiner: "why it matters: balancing money is a life skill — shop owners do it every day.", description: "You have 50 coins. Buy snacks for the class AND save 10 for tomorrow.", bestPct: null, play: { type: "choose", prompt: "Snacks cost 15 each. You need 2 snacks and must keep 10 coins. How many coins left?", options: ["15", "20", "30", "10"], correctIndex: 3, hint: "2 × 15 = 30 spent. 50 − 30 = ?" } },
  { id: "g7", key: "code-wizard-lite", category: "coding", order: 7, title: "Code Wizard", emoji: "🧙", gradient: "linear-gradient(135deg, #6d28d9 0%, #ec4899 100%)", featured: true, xpValue: 25, skillTags: ["Coding", "Logic", "Focus"], axisGains: { logic: 9, focus: 6, creativity: 3 }, oneLiner: "why it matters: giving exact steps in order is exactly how computers work.", description: "Program the robot to reach the star — tap the steps in the right order.", bestPct: null, play: { type: "order", prompt: "Put the robot's commands in order: start → ??? → star!", items: ["START", "Move forward 2", "Turn left", "Move forward 1", "STAR"], hint: "Write the steps the way you'd tell a friend exactly how to walk there." } },
  { id: "g8", key: "tiny-robot", category: "coding", order: 8, title: "Tiny Robot Commands", emoji: "🤖", gradient: "linear-gradient(135deg, #0f4c75 0%, #3b82f6 100%)", featured: false, xpValue: 20, skillTags: ["Coding", "Logic"], axisGains: { logic: 7, focus: 5 }, oneLiner: "why it matters: breaking big jobs into small steps makes hard things easy.", description: "Arrange the steps to plant a seed properly.", bestPct: null, play: { type: "order", prompt: "Sort these steps so the seed can grow:", items: ["Dig a small hole", "Drop in the seed", "Cover with soil", "Water gently"], hint: "What happens first, second, third, last?" } },
];

export const seedWeeklyChallenge = {
  id: "ch1",
  title: "Design a rocket fin",
  emoji: "🚀",
  worldTag: "space-engineer",
  oneLiner: "why it matters: engineers test mini ideas before big builds.",
  description: "A rocket needs a fin to fly straight! Sketch one shape that could keep a paper rocket steady.",
  taskType: "open",
  taskPrompt: "Draw or describe your rocket fin. What shape is it? Why would it help?",
  options: [],
  submitted: false,
  submission: null,
};

export const seedExpedition = {
  id: "exp1",
  title: "Unlock the Ocean Explorer world together",
  subtitle: "Every quest you play adds XP to the whole class goal.",
  goalWorldKey: "ocean-explorer",
  goalWorldName: "Ocean Explorer",
  targetXp: 1000,
  currentXp: 640,
  pct: 64,
  starsToUnlock: 3,
  myXp: 0,
  recentCheer: [
    { name: "Ari", xp: 25, source: "game" },
    { name: "Meena", xp: 20, source: "challenge" },
    { name: "Ravi", xp: 15, source: "quiz" },
  ],
};

export const seedSpotlight = {
  studentName: "Kavya",
  weekOf: "this-week",
  reasonNote: "Kept learning every single day this week — and helped two friends start a quest!",
  emoji: "🌟",
};

export const seedNudges = [
  { context: "Career world", text: "Ask about the career world they unlocked in the sorting quiz." },
  { context: "Consistency", text: "Ask what one small thing they'd like to try today." },
  { context: "Quest", text: "Ask which Skill Quest felt the most fun and why." },
  { context: "Badges", text: "Ask them to show the newest badge in their Trophy Room." },
  { context: "Strength radar", text: "Ask which strength feels easiest for them and why." },
];

export const seedEvents = [
  { id: "e1", title: "Meet a real marine biologist", description: "Live Q&A — bring your sea questions!", dateTime: new Date(Date.now() + 3 * 86400000).toISOString(), durationMin: 30, type: "live", attended: false, attendanceBadgeKey: "event-sea-quest" },
  { id: "e2", title: "Coding with a young developer", description: "A short recorded session with a real app builder.", dateTime: new Date(Date.now() + 6 * 86400000).toISOString(), durationMin: 25, type: "recorded", attended: false, attendanceBadgeKey: "event-code-quest" },
  { id: "e3", title: "Ask a nurse anything", description: "Live session about helping people every day.", dateTime: new Date(Date.now() + 9 * 86400000).toISOString(), durationMin: 30, type: "live", attended: false, attendanceBadgeKey: "event-care-quest" },
];

export const seedStreak = {
  currentStreak: 4,
  longestStreak: 9,
  lastActiveDate: new Date().toISOString(),
  last7Days: ["2026-09-16", "2026-09-17", "2026-09-18", "2026-09-19", "2026-09-20", "2026-09-21", "2026-09-22"].map((day, i) => ({
    day,
    active: i < 4 ? true : i === 6 ? true : false,
  })),
};

export const seedSeasonalEvents = [
  {
    id: "se1",
    title: "Festival Career Fair",
    emoji: "🎪",
    worldKey: "green-builder",
    worldName: "Green Builder",
    description: "A special weekend career fair: meet five careers, earn the Festival Explorer badge!",
    endsAt: new Date(Date.now() + 4 * 86400000).toISOString(),
    timeLeftMs: 4 * 86400000,
  },
];

export const seedBadgesShelf = {
  earnedCount: 3,
  shelf: [
    { key: "streak-3", name: "Spark Starter", emoji: "🔥", iconUrl: "", category: "streak", description: "Learned 3 days in a row.", earnedAt: new Date().toISOString() },
    { key: "first-quiz", name: "Discoverer", emoji: "🧭", iconUrl: "", category: "skill", description: "Finished the sorting quiz and found your starting world.", earnedAt: new Date().toISOString() },
    { key: "first-challenge", name: "Try It Champion", emoji: "🧪", iconUrl: "", category: "skill", description: "Completed a weekly 5-minute \"try it\" challenge.", earnedAt: new Date().toISOString() },
    { key: "logic-learner", name: "Logic Learner", emoji: "🧠", iconUrl: "", category: "skill", description: "Aced a logic quest at 80% or better.", earnedAt: null },
    { key: "code-curious", name: "Code Curious", emoji: "🧙", iconUrl: "", category: "skill", description: "Aced a coding puzzle quest.", earnedAt: null },
    { key: "streak-7", name: "Week Warrior", emoji: "🔥", iconUrl: "", category: "streak", description: "Learned every day for a whole week.", earnedAt: null },
    { key: "future-map", name: "Future Mapper", emoji: "🗺️", iconUrl: "", category: "skill", description: "Drew your own Future Map poster.", earnedAt: null },
    { key: "seasonal-festival", name: "Festival Explorer", emoji: "🎪", iconUrl: "", category: "seasonal", description: "Explored the special festival career fair.", earnedAt: null },
  ],
};

export const seedCertificates = [];

export const seedSkillProfile = {
  skills: { creativity: 62, logic: 70, empathy: 78, leadership: 55, focus: 58 },
  updatedAt: new Date().toISOString(),
  lastWorld: { key: "ocean-explorer", name: "Ocean Explorer" },
};

export const seedGamesByCategory = {
  logic: "Puzzles that grow your thinking muscle",
  creative: "Make, draw, write and imagine",
  debate: "Speak kind and clear — voice matters",
  budgeting: "Money smarts for real life",
  coding: "Give computers clear, exact steps",
};

export const CATEGORY_META = {
  logic: { label: "Logic & Puzzle", emoji: "🧩", color: "#3b82f6" },
  creative: { label: "Creative Studio", emoji: "🎨", color: "#8b5cf6" },
  debate: { label: "Debate & Roleplay", emoji: "🎤", color: "#10b981" },
  budgeting: { label: "Shop & Budget", emoji: "🧾", color: "#f59e0b" },
  coding: { label: "Coding Puzzles", emoji: "💻", color: "#0f4c75" },
};