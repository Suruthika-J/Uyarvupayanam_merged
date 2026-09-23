// Offline/demo seed data for the Class 5 career-discovery feature.
// Mirrors the shapes returned by the backend under /api/class5 so the UI
// renders fully even when the API or student login is unavailable.
// Visuals use Unsplash photo URLs (stable) + color tags; no emoji.

const img = (id) => `https://images.unsplash.com/${id}?q=80&w=1200&auto=format&fit=crop`;

export const seedCareerWorlds = [
  { key: "ocean-explorer", name: "Ocean Explorer", tagline: "Curiosity, science and the sea", image: img("photo-1507525428034-b723cf961d3e"), colorTag: "blue", description: "You love discovering how things work — from waves to whales. Scientists, marine biologists and explorers think like you!", skillTags: ["science", "logic", "focus"] },
  { key: "story-weaver", name: "Story Weaver", tagline: "Words, imagination and feelings", image: img("photo-1455390582262-044cdead277a"), colorTag: "purple", description: "You turn ideas into stories, pictures and worlds. Writers, illustrators, filmmakers and game designers think like you!", skillTags: ["creativity", "empathy"] },
  { key: "money-master", name: "Money Master", tagline: "Smart choices with numbers", image: img("photo-1554224155-6726b3ff858f"), colorTag: "gold", description: "You like figuring out fair prices, saving and balancing. Entrepreneurs, bankers and shop owners think like you!", skillTags: ["logic", "focus", "creativity"] },
  { key: "green-builder", name: "Green Builder", tagline: "Caring for people and planet", image: img("photo-1416879595882-3373a0480b5b"), colorTag: "green", description: "You care about Earth and about helping neighbours. Engineers, urban planners and community leaders think like you!", skillTags: ["empathy", "leadership"] },
  { key: "space-engineer", name: "Space Engineer", tagline: "Building the future, one part at a time", image: img("photo-1517976487492-5750f3195933"), colorTag: "orange", description: "You like designing, building and fixing things. Engineers, architects and makers think like you!", skillTags: ["logic", "creativity", "focus"] },
  { key: "community-doctor", name: "Community Doctor", tagline: "Healing with kindness and science", image: img("photo-1576091160399-112ba8d25d1d"), colorTag: "red", description: "You notice when people need help and care. Doctors, nurses, teachers and helpers think like you!", skillTags: ["empathy", "leadership", "logic"] },
  { key: "code-wizard", name: "Code Wizard", tagline: "Telling computers what to do", image: img("photo-1517694712202-14dd9538aa97"), colorTag: "purple", description: "You like giving clear steps and solving puzzles. Programmers, app makers and robotics builders think like you!", skillTags: ["logic", "focus", "creativity"] },
];

export const seedWorldByKey = Object.fromEntries(seedCareerWorlds.map((w) => [w.key, w]));

export const seedQuizQuestions = [
  { id: "q1", text: "Would you rather build a robot — or write the story of its day?", options: [
    { index: 0, label: "Build the robot", worldKey: "space-engineer", axes: { logic: 3, focus: 2 } },
    { index: 1, label: "Write its story", worldKey: "story-weaver", axes: { creativity: 3, empathy: 1 } },
    { index: 2, label: "Design its pretty shell", worldKey: "green-builder", axes: { creativity: 2, empathy: 1 } },
  ] },
  { id: "q2", text: "Your friend feels sad at recess. What do you do?", options: [
    { index: 0, label: "Sit and listen", worldKey: "community-doctor", axes: { empathy: 3, leadership: 1 } },
    { index: 1, label: "Invent a fun game", worldKey: "story-weaver", axes: { creativity: 3 } },
    { index: 2, label: "Get the whole team cheering", worldKey: "green-builder", axes: { leadership: 3, empathy: 1 } },
  ] },
  { id: "q3", text: "You get 100 coins for a class shop. What's the most fun?", options: [
    { index: 0, label: "Count, price and balance", worldKey: "money-master", axes: { logic: 3, focus: 2 } },
    { index: 1, label: "Design the shop sign", worldKey: "story-weaver", axes: { creativity: 2 } },
    { index: 2, label: "Teach everyone to save a coin a day", worldKey: "money-master", axes: { empathy: 2, leadership: 2 } },
  ] },
  { id: "q4", text: "Pick a dream trip.", options: [
    { index: 0, label: "Dive to the deepest sea", worldKey: "ocean-explorer", axes: { logic: 2, focus: 2 } },
    { index: 1, label: "Ride a rocket to the stars", worldKey: "space-engineer", axes: { creativity: 2, logic: 2 } },
    { index: 2, label: "Map both from a lab", worldKey: "code-wizard", axes: { logic: 3, focus: 2 } },
  ] },
  { id: "q5", text: "Which puzzle is your favourite?", options: [
    { index: 0, label: "Find the next pattern", worldKey: "space-engineer", axes: { logic: 3, focus: 1 } },
    { index: 1, label: "Word and story puzzles", worldKey: "story-weaver", axes: { creativity: 2, empathy: 1 } },
    { index: 2, label: "Number and money problems", worldKey: "money-master", axes: { logic: 2, focus: 2 } },
  ] },
  { id: "q6", text: "Your class wants to clean the beach. Your job?", options: [
    { index: 0, label: "Plan who does what", worldKey: "green-builder", axes: { leadership: 3, focus: 1 } },
    { index: 1, label: "Count and sort what we find", worldKey: "ocean-explorer", axes: { logic: 2, focus: 3 } },
    { index: 2, label: "Make a catchy cheer", worldKey: "story-weaver", axes: { creativity: 3 } },
  ] },
  { id: "q7", text: "What would you invent?", options: [
    { index: 0, label: "A machine that turns plastic into art", worldKey: "green-builder", axes: { creativity: 3, empathy: 1 } },
    { index: 1, label: "An app that tells bedtime stories", worldKey: "code-wizard", axes: { logic: 2, creativity: 2 } },
    { index: 2, label: "A game that teaches saving", worldKey: "money-master", axes: { logic: 2, creativity: 2 } },
  ] },
  { id: "q8", text: "Choose a school club.", options: [
    { index: 0, label: "Science & experiment club", worldKey: "ocean-explorer", axes: { logic: 3, focus: 2 } },
    { index: 1, label: "Drama & debate club", worldKey: "story-weaver", axes: { creativity: 2, empathy: 2 } },
    { index: 2, label: "Coding club", worldKey: "code-wizard", axes: { logic: 3, focus: 2 } },
  ] },
  { id: "q9", text: "A new kid joins today. What do you notice first?", options: [
    { index: 0, label: "Do they feel welcome?", worldKey: "community-doctor", axes: { empathy: 3, leadership: 1 } },
    { index: 1, label: "What do they like to build?", worldKey: "space-engineer", axes: { creativity: 2, focus: 1 } },
    { index: 2, label: "What's their favourite story?", worldKey: "story-weaver", axes: { empathy: 2, creativity: 2 } },
  ] },
  { id: "q10", text: "A team wins when…", options: [
    { index: 0, label: "Everyone shared an idea", worldKey: "community-doctor", axes: { empathy: 3, leadership: 2 } },
    { index: 1, label: "We solved the big problem", worldKey: "code-wizard", axes: { logic: 3, focus: 2 } },
    { index: 2, label: "The budget stayed balanced", worldKey: "money-master", axes: { logic: 3, focus: 2 } },
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
  const w = seedWorldByKey[key] || { name: key, colorTag: "blue" };
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
    world: { name: w.name, colorTag: w.colorTag },
    title: titles[key] || `${w.name} story`,
    url: SAMPLE_VIDEOS[key],
    thumbnail: w.image || "",
    durationSec: i % 2 === 0 ? 120 : 95,
    subtitlesUrl: "",
    featured: i === 0 || i === 6,
  };
});

export const seedGames = [
  { id: "g1", key: "pattern-bridge", category: "logic", order: 1, title: "Pattern Bridge", image: img("photo-1552820728-8b83bb6b773f"), gradient: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)", featured: true, xpValue: 20, skillTags: ["Logic", "Focus"], axisGains: { logic: 8, focus: 5 }, oneLiner: "why it matters: spotting patterns trains your brain for maths and science.", description: "The bridge is broken! Tap the shape that completes the pattern.", bestPct: null, play: { type: "choose", prompt: "Which colour completes the pattern? Blue, Red, Blue, Blue, Red, Blue …", options: ["Red", "Blue", "Green", "Yellow"], correctIndex: 1, hint: "The pattern repeats in a sneaky 1-2 rhythm." } },
  { id: "g2", key: "ocean-detective", category: "logic", order: 2, title: "Ocean Detective", image: img("photo-1583212292454-1fe6229603b7"), gradient: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)", featured: false, xpValue: 20, skillTags: ["Logic", "Observation"], axisGains: { logic: 8, focus: 5 }, oneLiner: "why it matters: good detectives read clues carefully — that's how doctors solve what's wrong.", description: "Three clues, one culprit. Read carefully and pick who took the pearl!", bestPct: null, play: { type: "choose", prompt: "Clues: the thief is wet, loves jelly, and her name has 5 letters.", options: ["Coral the crab", "Perla the whale", "Fizz the fish", "Luna the octopus"], correctIndex: 3, hint: "Count the letters — punny clues love a letter trick." } },
  { id: "g3", key: "story-spark", category: "creative", order: 3, title: "Story Spark", image: img("photo-1519682337058-a94d519337bc"), gradient: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)", featured: true, xpValue: 15, skillTags: ["Creativity", "Storytelling"], axisGains: { creativity: 10 }, oneLiner: "why it matters: turning ideas into stories is how writers and inventors work.", description: "Pick three ingredients and write the first lines of your story.", bestPct: null, play: { type: "write", prompt: "Write the first 2 sentences of a story that has: a tiny robot, a rainy day, and a lost map.", hint: "Small details make a story feel real." } },
  { id: "g4", key: "design-a-postcard", category: "creative", order: 4, title: "Design a Postcard", image: img("photo-1452860606245-08befc0ff44b"), gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", featured: false, xpValue: 15, skillTags: ["Creativity", "Design"], axisGains: { creativity: 8, focus: 3 }, oneLiner: "why it matters: designers plan every colour to tell a feeling.", description: "Choose the colours and message that best cheer up a friend far away.", bestPct: null, play: { type: "choose", prompt: "Which postcard message will make a faraway friend smile most?", options: ["\"Wish you were here!\" with warm sunset colours", "\"I got new pencils\" with plain blue", "\"It's raining.\" with grey", "\"School was okay.\" with white"], correctIndex: 0, hint: "Warm colours + a friendly hello = a smile." } },
  { id: "g5", key: "debate-pal", category: "debate", order: 5, title: "Debate Pal", image: img("photo-1522202176988-66273c2fd55f"), gradient: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)", featured: true, xpValue: 20, skillTags: ["Communication", "Empathy"], axisGains: { leadership: 7, empathy: 5, creativity: 3 }, oneLiner: "why it matters: sharing an idea kindly is how leaders get things done.", description: "Choose the kindest, clearest point to help your class decide.", bestPct: null, play: { type: "choose", prompt: "Recess is 5 minutes longer, but lunch gets shorter. Pick the best sentence to say.", options: ["\"Fresh air helps us think — can we try 5 extra minutes and see?\"", "\"My idea is best, nobody else's.\"", "\"Lunch shorter? This is unfair!\"", "\"I don't care.\""], correctIndex: 0, hint: "A good point explains the why and leaves room for everyone." } },
  { id: "g6", key: "shop-balance", category: "budgeting", order: 6, title: "Shop Balance", image: img("photo-1560472354-b33ff0c44a43"), gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", featured: true, xpValue: 20, skillTags: ["Budgeting", "Logic"], axisGains: { logic: 8, focus: 5, creativity: 2 }, oneLiner: "why it matters: balancing money is a life skill — shop owners do it every day.", description: "You have 50 coins. Buy snacks for the class AND save 10 for tomorrow.", bestPct: null, play: { type: "choose", prompt: "Snacks cost 15 each. You need 2 snacks and must keep 10 coins. How many coins left?", options: ["15", "20", "25", "30"], correctIndex: 1, hint: "2 × 15 = 30 spent. 50 − 30 = ?" } },
  { id: "g7", key: "code-wizard-lite", category: "coding", order: 7, title: "Code Wizard", image: img("photo-1485827404703-89b55fcc595e"), gradient: "linear-gradient(135deg, #6d28d9 0%, #ec4899 100%)", featured: true, xpValue: 25, skillTags: ["Coding", "Logic", "Focus"], axisGains: { logic: 9, focus: 6, creativity: 3 }, oneLiner: "why it matters: giving exact steps in order is exactly how computers work.", description: "Program the robot to reach the star — tap the steps in the right order.", bestPct: null, play: { type: "order", prompt: "Program the robot from START to the STAR — put the commands in the right order.", items: ["Move forward 2", "Turn left", "Move forward 1"], hint: "Write the steps the way you'd tell a friend exactly how to walk there." } },
  { id: "g8", key: "tiny-robot", category: "coding", order: 8, title: "Tiny Robot Commands", image: img("photo-1531747118685-ca8fa6e08806"), gradient: "linear-gradient(135deg, #0f4c75 0%, #3b82f6 100%)", featured: false, xpValue: 20, skillTags: ["Coding", "Logic"], axisGains: { logic: 7, focus: 5 }, oneLiner: "why it matters: breaking big jobs into small steps makes hard things easy.", description: "Arrange the steps to plant a seed properly.", bestPct: null, play: { type: "order", prompt: "Sort these steps so the seed can grow:", items: ["Dig a small hole", "Drop in the seed", "Cover with soil", "Water gently"], hint: "What happens first, second, third, last?" } },
];

export const seedWeeklyChallenge = {
  id: "ch1",
  title: "Design a rocket fin",
  image: img("photo-1517976487492-5750f3195933"),
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
  image: img("photo-1522202176988-66273c2fd55f"),
};

export const seedNudges = [
  { context: "Career world", text: "Ask about the career world they unlocked in the sorting quiz." },
  { context: "Consistency", text: "Ask what one small thing they'd like to try today." },
  { context: "Quest", text: "Ask which Skill Quest felt the most fun and why." },
  { context: "Badges", text: "Ask them to show the newest badge in their Trophy Room." },
  { context: "Strength radar", text: "Ask which strength feels easiest for them and why." },
];

export const seedEvents = [
  { id: "e1", title: "Meet a real marine biologist", description: "Live Q&A — bring your sea questions!", coverImage: img("photo-1544551763-46a013bb70d5"), dateTime: new Date(Date.now() + 3 * 86400000).toISOString(), durationMin: 30, type: "live", attended: false, attendanceBadgeKey: "event-sea-quest" },
  { id: "e2", title: "Coding with a young developer", description: "A short recorded session with a real app builder.", coverImage: img("photo-1504610926078-a1611febcad3"), dateTime: new Date(Date.now() + 6 * 86400000).toISOString(), durationMin: 25, type: "recorded", attended: false, attendanceBadgeKey: "event-code-quest" },
  { id: "e3", title: "Ask a nurse anything", description: "Live session about helping people every day.", coverImage: img("photo-1576091160550-2173dba999ef"), dateTime: new Date(Date.now() + 9 * 86400000).toISOString(), durationMin: 30, type: "live", attended: false, attendanceBadgeKey: "event-care-quest" },
];

export const seedStreak = {
  currentStreak: 4,
  longestStreak: 9,
  lastActiveDate: new Date().toISOString(),
  last7Days: (() => {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      out.push({ day: d, active: i <= 3 ? true : i === 0 ? true : false });
    }
    return out;
  })(),
};

export const seedSeasonalEvents = [
  {
    id: "se1",
    title: "Festival Career Fair",
    image: img("photo-1492684223066-81342ee5ff30"),
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
    { key: "streak-3", name: "Spark Starter", category: "streak", description: "Learned 3 days in a row.", earnedAt: new Date().toISOString() },
    { key: "first-quiz", name: "Discoverer", category: "skill", description: "Finished the sorting quiz and found your starting world.", earnedAt: new Date().toISOString() },
    { key: "first-challenge", name: "Try It Champion", category: "skill", description: "Completed a weekly 5-minute \"try it\" challenge.", earnedAt: new Date().toISOString() },
    { key: "logic-learner", name: "Logic Learner", category: "skill", description: "Aced a logic quest at 80% or better.", earnedAt: null },
    { key: "code-curious", name: "Code Curious", category: "skill", description: "Aced a coding puzzle quest.", earnedAt: null },
    { key: "streak-7", name: "Week Warrior", category: "streak", description: "Learned every day for a whole week.", earnedAt: null },
    { key: "future-map", name: "Future Mapper", category: "skill", description: "Drew your own Future Map poster.", earnedAt: null },
    { key: "seasonal-festival", name: "Festival Explorer", category: "seasonal", description: "Explored the special festival career fair.", earnedAt: null },
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
  logic: { label: "Logic & Puzzle", color: "#3b82f6" },
  creative: { label: "Creative Studio", color: "#8b5cf6" },
  debate: { label: "Debate & Roleplay", color: "#10b981" },
  budgeting: { label: "Shop & Budget", color: "#f59e0b" },
  coding: { label: "Coding Puzzles", color: "#0f4c75" },
};

// Offline/demo question bank for the Discover Me quest cards. Mirrors the
// shapes served by /api/class5/discover/questions so the game still works
// without the API. JSON-driven: the UI renders whatever type/options exist.
export const seedDiscoverQuestions = [
  { id: "ocean-q1", worldId: "ocean-explorer", type: "drag_match", difficulty: 1, prompt: "Drag each sea friend to the way it stays safe.", hint: "Think about where each animal rests or travels.",
    options: [{ id: "o1", label: "Octopus" }, { id: "o2", label: "Sea turtle" }, { id: "o3", label: "Dolphin" }],
    targets: [{ id: "t1", label: "Hides in a rock cave" }, { id: "t2", label: "Carries its own shell" }, { id: "t3", label: "Swims fast with friends" }],
    correctAnswer: [{ itemId: "o1", targetId: "t1" }, { itemId: "o2", targetId: "t2" }, { itemId: "o3", targetId: "t3" }] },
  { id: "ocean-q2", worldId: "ocean-explorer", type: "tap_select", difficulty: 2, prompt: "Tap the picture that shows a diver exploring the deep sea.", hint: "Look for the person underwater in a suit.",
    options: [
      { id: "o1", label: "A boat on the shore", image: img("photo-1526772662000-3f88f10405ff") },
      { id: "o2", label: "A diver under the waves", image: img("photo-1544551763-46a013bb70d5") },
      { id: "o3", label: "A sandy beach", image: img("photo-1507525428034-b723cf961d3e") },
    ],
    correctAnswer: "o2" },
  { id: "story-q2", worldId: "story-weaver", type: "sequence", difficulty: 2, prompt: "Put how a book gets written in order.", hint: "Ideas come first, readers come at the very end.",
    options: [{ id: "s1", label: "Write the draft" }, { id: "s2", label: "Sketch the characters" }, { id: "s3", label: "Get a big idea" }, { id: "s4", label: "Share it with readers" }],
    correctAnswer: ["s3", "s2", "s1", "s4"] },
  { id: "story-q3", worldId: "story-weaver", type: "fill_blank", difficulty: 1, prompt: "A good story has a beginning, a ___ and an end. The person who writes the story is the ___.", hint: "The part between start and end... and the writer!",
    options: [{ id: "f1", label: "middle" }, { id: "f2", label: "author" }, { id: "f3", label: "ending" }, { id: "f4", label: "reader" }],
    correctAnswer: ["f1", "f2"] },
  { id: "money-q1", worldId: "money-master", type: "drag_match", difficulty: 2, prompt: "Match each school-shop item to its price.", hint: "A pencil costs less than a book.",
    options: [{ id: "o1", label: "Candy" }, { id: "o2", label: "Pencil" }, { id: "o3", label: "Storybook" }],
    targets: [{ id: "t1", label: "5 coins" }, { id: "t2", label: "10 coins" }, { id: "t3", label: "45 coins" }],
    correctAnswer: [{ itemId: "o1", targetId: "t1" }, { itemId: "o2", targetId: "t2" }, { itemId: "o3", targetId: "t3" }] },
  { id: "money-q2", worldId: "money-master", type: "fill_blank", difficulty: 3, prompt: "If you save ___ coins every week, in 4 weeks you will have saved 20 coins.", hint: "Four times what number makes 20?",
    options: [{ id: "f1", label: "5" }, { id: "f2", label: "10" }, { id: "f3", label: "4" }, { id: "f4", label: "20" }],
    correctAnswer: ["f1"] },
  { id: "green-q1", worldId: "green-builder", type: "sort", difficulty: 1, prompt: "Sort the choices: good for Earth or not so good?", hint: "Which choices keep the planet clean?",
    options: [{ id: "o1", label: "Plant a tree" }, { id: "o2", label: "Recycle paper" }, { id: "o3", label: "Throw plastic in the river" }, { id: "o4", label: "Leave lights on all day" }],
    buckets: [{ id: "b1", label: "Good for Earth" }, { id: "b2", label: "Not so good" }],
    correctAnswer: [{ itemId: "o1", bucketId: "b1" }, { itemId: "o2", bucketId: "b1" }, { itemId: "o3", bucketId: "b2" }, { itemId: "o4", bucketId: "b2" }] },
  { id: "space-q1", worldId: "space-engineer", type: "sequence", difficulty: 2, prompt: "Launch a rocket — put the steps in order.", hint: "What happens right before the big blast-off?",
    options: [{ id: "s1", label: "Fill the fuel tank" }, { id: "s2", label: "Check every part" }, { id: "s3", label: "Countdown 3, 2, 1" }, { id: "s4", label: "Blast off!" }],
    correctAnswer: ["s1", "s2", "s3", "s4"] },
  { id: "space-q2", worldId: "space-engineer", type: "drag_match", difficulty: 2, prompt: "Match each tool to the job it does.", hint: "Tighten a bolt... turn a screw... measure a part.",
    options: [{ id: "o1", label: "Wrench" }, { id: "o2", label: "Screwdriver" }, { id: "o3", label: "Ruler" }],
    targets: [{ id: "t1", label: "Tighten bolts" }, { id: "t2", label: "Turn screws" }, { id: "t3", label: "Measure parts" }],
    correctAnswer: [{ itemId: "o1", targetId: "t1" }, { itemId: "o2", targetId: "t2" }, { itemId: "o3", targetId: "t3" }] },
  { id: "doctor-q3", worldId: "community-doctor", type: "sort", difficulty: 1, prompt: "Sort the choices: kind or careless?", hint: "How would a good friend act?",
    options: [{ id: "o1", label: "Listen when a friend talks" }, { id: "o2", label: "Share your snack" }, { id: "o3", label: "Shout at someone" }, { id: "o4", label: "Push in the lunch line" }],
    buckets: [{ id: "b1", label: "Kind choices" }, { id: "b2", label: "Careless choices" }],
    correctAnswer: [{ itemId: "o1", bucketId: "b1" }, { itemId: "o2", bucketId: "b1" }, { itemId: "o3", bucketId: "b2" }, { itemId: "o4", bucketId: "b2" }] },
  { id: "doctor-q4", worldId: "community-doctor", type: "tap_select", difficulty: 1, prompt: "Tap the picture that shows someone helping people stay well.", hint: "Look for the kind caregiver.",
    options: [
      { id: "d1", label: "A nurse caring for a patient", image: img("photo-1576091160399-112ba8d25d1d") },
      { id: "d2", label: "A big football match", image: img("photo-1579952363873-27f3bade9f55") },
      { id: "d3", label: "A busy road", image: img("photo-1506521781263-d8422e82f27a") },
    ],
    correctAnswer: "d1" },
  { id: "code-q1", worldId: "code-wizard", type: "sequence", difficulty: 1, prompt: "Program the robot to reach the star — put the commands in order.", hint: "What does the robot need to do first?",
    options: [{ id: "s1", label: "Move forward 2" }, { id: "s2", label: "Turn left" }, { id: "s3", label: "Move forward 1" }, { id: "s4", label: "Grab the star" }],
    correctAnswer: ["s1", "s2", "s3", "s4"] },
  { id: "code-q2", worldId: "code-wizard", type: "fill_blank", difficulty: 2, prompt: "Computers follow exact ___. A ___ is a list of step-by-step instructions.", hint: "Programs are made of careful steps.",
    options: [{ id: "f1", label: "steps" }, { id: "f2", label: "program" }, { id: "f3", label: "dreams" }, { id: "f4", label: "colours" }],
    correctAnswer: ["f1", "f2"] },
];

export const seedDiscoverProgress = {
  worlds: seedCareerWorlds.map((w) => ({
    worldId: w.key,
    name: w.name,
    colorTag: w.colorTag,
    image: w.image,
    completed: 0,
    total: seedDiscoverQuestions.filter((q) => q.worldId === w.key).length,
    stars: 0,
  })),
  totalSolved: 0,
  badgesCount: 0,
};