// Seeds the Class 5 career-discovery feature (Discover Me, Skill Quests, Squad,
// Real World, Trophy Room). Idempotent: only inserts when a collection is empty.
// The existing Scholarships service/schema is never touched.
const CareerWorld = require("../models/CareerWorld");
const SortingQuizQuestion = require("../models/SortingQuizQuestion");
const MiniGame = require("../models/MiniGame");
const WeeklyChallenge = require("../models/WeeklyChallenge");
const CareerVideo = require("../models/CareerVideo");
const CareerEvent = require("../models/CareerEvent");
const Badge = require("../models/Badge");
const SeasonalEvent = require("../models/SeasonalEvent");

const D = (daysFromNow) => new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);

const WORLDS = [
  { worldKey: "ocean-explorer", name: "Ocean Explorer", tagline: "Curiosity, science and the sea", emoji: "🌊", colorTag: "blue", description: "You love discovering how things work — from waves to whales. Scientists, marine biologists and explorers think like you!", skillTags: ["science", "logic", "focus"] },
  { worldKey: "story-weaver", name: "Story Weaver", tagline: "Words, imagination and feelings", emoji: "📚", colorTag: "purple", description: "You turn ideas into stories, pictures and worlds. Writers, illustrators, filmmakers and game designers think like you!", skillTags: ["creativity", "empathy"] },
  { worldKey: "money-master", name: "Money Master", tagline: "Smart choices with numbers", emoji: "💡", colorTag: "gold", description: "You like figuring out fair prices, saving and balancing. Entrepreneurs, bankers and shop owners think like you!", skillTags: ["logic", "focus", "creativity"] },
  { worldKey: "green-builder", name: "Green Builder", tagline: "Caring for people and planet", emoji: "🌱", colorTag: "green", description: "You care about Earth and about helping neighbours. Engineers, urban planners and community leaders think like you!", skillTags: ["empathy", "leadership"] },
  { worldKey: "space-engineer", name: "Space Engineer", tagline: "Building the future, one part at a time", emoji: "🚀", colorTag: "orange", description: "You like designing, building and fixing things. Engineers, architects and makers think like you!", skillTags: ["logic", "creativity", "focus"] },
  { worldKey: "community-doctor", name: "Community Doctor", tagline: "Healing with kindness and science", emoji: "🩺", colorTag: "red", description: "You notice when people need help and care. Doctors, nurses, teachers and helpers think like you!", skillTags: ["empathy", "leadership", "logic"] },
  { worldKey: "code-wizard", name: "Code Wizard", tagline: "Telling computers what to do", emoji: "🧙", colorTag: "purple", description: "You like giving clear steps and solving puzzles. Programmers, app makers and robotics builders think like you!", skillTags: ["logic", "focus", "creativity"] },
];

// 10 short, illustrated sorting questions. Options map to a career world + skill axes.
const QUESTIONS = [
  { emoji: "🤖", text: "Would you rather build a robot — or write the story of its day?",
    options: [
      { label: "Build the robot", emoji: "🛠️", worldKey: "space-engineer", axes: { logic: 3, focus: 2 } },
      { label: "Write its story", emoji: "✍️", worldKey: "story-weaver", axes: { creativity: 3, empathy: 1 } },
      { label: "Design its pretty shell", emoji: "🎨", worldKey: "green-builder", axes: { creativity: 2, empathy: 1 } },
    ] },
  { emoji: "😊", text: "Your friend feels sad at recess. What do you do?",
    options: [
      { label: "Sit and listen", emoji: "🤝", worldKey: "community-doctor", axes: { empathy: 3, leadership: 1 } },
      { label: "Invent a fun game", emoji: "🎲", worldKey: "story-weaver", axes: { creativity: 3 } },
      { label: "Get the whole team cheering", emoji: "📣", worldKey: "green-builder", axes: { leadership: 3, empathy: 1 } },
    ] },
  { emoji: "💰", text: "You get 100 coins for a class shop. What's the most fun?",
    options: [
      { label: "Count, price and balance", emoji: "🧮", worldKey: "money-master", axes: { logic: 3, focus: 2 } },
      { label: "Design the shop sign", emoji: "🪧", worldKey: "story-weaver", axes: { creativity: 2 } },
      { label: "Teach everyone to save a coin a day", emoji: "🐷", worldKey: "money-master", axes: { empathy: 2, leadership: 2 } },
    ] },
  { emoji: "🔭", text: "Pick a dream trip.",
    options: [
      { label: "Dive to the deepest sea", emoji: "🌊", worldKey: "ocean-explorer", axes: { logic: 2, focus: 2 } },
      { label: "Ride a rocket to the stars", emoji: "🚀", worldKey: "space-engineer", axes: { creativity: 2, logic: 2 } },
      { label: "Map both from a lab", emoji: "🗺️", worldKey: "code-wizard", axes: { logic: 3, focus: 2 } },
    ] },
  { emoji: "🧩", text: "Which puzzle is your favourite?",
    options: [
      { label: "Find the next pattern", emoji: "🔢", worldKey: "space-engineer", axes: { logic: 3, focus: 1 } },
      { label: "Word and story puzzles", emoji: "🔤", worldKey: "story-weaver", axes: { creativity: 2, empathy: 1 } },
      { label: "Number and money problems", emoji: "🌰", worldKey: "money-master", axes: { logic: 2, focus: 2 } },
    ] },
  { emoji: "🏖️", text: "Your class wants to clean the beach. Your job?",
    options: [
      { label: "Plan who does what", emoji: "🗒️", worldKey: "green-builder", axes: { leadership: 3, focus: 1 } },
      { label: "Count and sort what we find", emoji: "🕵️", worldKey: "ocean-explorer", axes: { logic: 2, focus: 3 } },
      { label: "Make a catchy cheer", emoji: "🎵", worldKey: "story-weaver", axes: { creativity: 3 } },
    ] },
  { emoji: "💡", text: "What would you invent?",
    options: [
      { label: "A machine that turns plastic into art", emoji: "♻️", worldKey: "green-builder", axes: { creativity: 3, empathy: 1 } },
      { label: "An app that tells bedtime stories", emoji: "📱", worldKey: "code-wizard", axes: { logic: 2, creativity: 2 } },
      { label: "A game that teaches saving", emoji: "🎮", worldKey: "money-master", axes: { logic: 2, creativity: 2 } },
    ] },
  { emoji: "🏫", text: "Choose a school club.",
    options: [
      { label: "Science & experiment club", emoji: "🧪", worldKey: "ocean-explorer", axes: { logic: 3, focus: 2 } },
      { label: "Drama & debate club", emoji: "🎭", worldKey: "story-weaver", axes: { creativity: 2, empathy: 2 } },
      { label: "Coding club", emoji: "💻", worldKey: "code-wizard", axes: { logic: 3, focus: 2 } },
    ] },
  { emoji: "👋", text: "A new kid joins today. What do you notice first?",
    options: [
      { label: "Do they feel welcome?", emoji: "🤗", worldKey: "community-doctor", axes: { empathy: 3, leadership: 1 } },
      { label: "What do they like to build?", emoji: "🏗️", worldKey: "space-engineer", axes: { creativity: 2, focus: 1 } },
      { label: "What's their favourite story?", emoji: "📖", worldKey: "story-weaver", axes: { empathy: 2, creativity: 2 } },
    ] },
  { emoji: "🏆", text: "A team wins when…",
    options: [
      { label: "Everyone shared an idea", emoji: "🤲", worldKey: "community-doctor", axes: { empathy: 3, leadership: 2 } },
      { label: "We solved the big problem", emoji: "🧠", worldKey: "code-wizard", axes: { logic: 3, focus: 2 } },
      { label: "The budget stayed balanced", emoji: "⚖️", worldKey: "money-master", axes: { logic: 3, focus: 2 } },
    ] },
];

// Demo video URLs (public sample clips). Swap with curated real-professional
// clips in production — the card UI, subtitles and duration fields stay the same.
const SAMPLE_VIDEOS = {
  "ocean-explorer": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "story-weaver": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "money-master": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "green-builder": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "space-engineer": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "community-doctor": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "code-wizard": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
};

const VIDEOS = [
  { careerWorldKey: "ocean-explorer", title: "A day with a marine biologist", durationSec: 110, featured: true },
  { careerWorldKey: "story-weaver", title: "How an author finds ideas", durationSec: 125 },
  { careerWorldKey: "money-master", title: "A shop owner's morning routine", durationSec: 95 },
  { careerWorldKey: "green-builder", title: "Planting a city garden with an urban planner", durationSec: 118 },
  { careerWorldKey: "space-engineer", title: "Inside a robotics workshop", durationSec: 132 },
  { careerWorldKey: "community-doctor", title: "A nurse's kindest moments", durationSec: 98 },
  { careerWorldKey: "code-wizard", title: "What a young programmer builds", durationSec: 120, featured: true },
];

const GAMES = [
  { key: "pattern-bridge", category: "logic", order: 1, title: "Pattern Bridge", emoji: "🌉", gradient: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)", featured: true, xpValue: 20, skillTags: ["Logic", "Focus"], axisGains: { logic: 8, focus: 5 }, oneLiner: "Why it matters: spotting patterns trains your brain for maths and science.", description: "The bridge is broken! Tap the shape that completes the pattern.", play: { type: "choose", prompt: "Which shape comes next in the pattern? 🔵 🔴 🔵 🔵 🔴 🔵 …", options: ["🔴", "🔵", "🟢", "🟡"], correctIndex: 1, hint: "The pattern repeats in a sneaky 1-2 rhythm." } },
  { key: "ocean-detective", category: "logic", order: 2, title: "Ocean Detective", emoji: "🕵️", gradient: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)", xpValue: 20, skillTags: ["Logic", "Observation"], axisGains: { logic: 8, focus: 5 }, oneLiner: "Why it matters: good detectives read clues carefully — that's how doctors solve what's wrong.", description: "Three clues, one culprit. Read carefully and pick who took the pearl!", play: { type: "choose", prompt: "Clues: The thief is wet, loves jelly, and her name has 5 letters.", options: ["Coral the crab", "Perla the whale", "Fizz the fish", "Luna the octopus"], correctIndex: 3, hint: "Count the letters — punny clues love a letter trick." } },
  { key: "story-spark", category: "creative", order: 3, title: "Story Spark", emoji: "✨", gradient: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)", featured: true, xpValue: 15, skillTags: ["Creativity", "Storytelling"], axisGains: { creativity: 10 }, oneLiner: "Why it matters: turning ideas into stories is how writers and inventors work.", description: "Pick three ingredients and write the first lines of your story.", play: { type: "write", prompt: "Write the first 2 sentences of a story that has: a tiny robot, a rainy day, and a lost map.", hint: "Small details make a story feel real." } },
  { key: "design-a-postcard", category: "creative", order: 4, title: "Design a Postcard", emoji: "🖌️", gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", xpValue: 15, skillTags: ["Creativity", "Design"], axisGains: { creativity: 8, focus: 3 }, oneLiner: "Why it matters: designers plan every colour to tell a feeling.", description: "Choose the colours and message that best cheer up a friend far away.", play: { type: "choose", prompt: "Which postcard message will make a faraway friend smile most?", options: ["\"Wish you were here!\" with warm sunset colours", "\"I got new pencils\" with plain blue", "\"It's raining.\" with grey", "\"School was okay.\" with white"], correctIndex: 0, hint: "Warm colours + a friendly hello = a smile." } },
  { key: "debate-pal", category: "debate", order: 5, title: "Debate Pal", emoji: "🎤", gradient: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)", featured: true, xpValue: 20, skillTags: ["Communication", "Empathy"], axisGains: { leadership: 7, empathy: 5, creativity: 3 }, oneLiner: "Why it matters: sharing an idea kindly is how leaders get things done.", description: "Choose the kindest, clearest point to help your class decide.", play: { type: "choose", prompt: "Recess is 5 minutes longer, but lunch gets shorter. Pick the best sentence to say.", options: ["\"Fresh air helps us think — can we try 5 extra minutes and see?\"", "\"My idea is best, nobody else's.\"", "\"Lunch shorter? This is unfair!\"", "\"I don't care.\""], correctIndex: 0, hint: "A good point explains the why and leaves room for everyone." } },
  { key: "shop-balance", category: "budgeting", order: 6, title: "Shop Balance", emoji: "🧾", gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", featured: true, xpValue: 20, skillTags: ["Budgeting", "Logic"], axisGains: { logic: 8, focus: 5, creativity: 2 }, oneLiner: "Why it matters: balancing money is a life skill — shop owners do it every day.", description: "You have 50 coins. Buy snacks for the class AND save 10 for tomorrow.", play: { type: "choose", prompt: "Snacks cost 15 each. You need 2 snacks and must keep 10 coins. How many coins left?", options: ["15", "Nice try — 15 is one snack.", "20", "10"], correctIndex: 3, hint: "2 × 15 = 30 spent. 50 − 30 = ?" } },
  { key: "code-wizard-lite", category: "coding", order: 7, title: "Code Wizard", emoji: "🧙", gradient: "linear-gradient(135deg, #6d28d9 0%, #ec4899 100%)", featured: true, xpValue: 25, skillTags: ["Coding", "Logic", "Focus"], axisGains: { logic: 9, focus: 6, creativity: 3 }, oneLiner: "Why it matters: giving exact steps in order is exactly how computers work.", description: "Program the robot to reach the star — tap the steps in the right order.", play: { type: "order", prompt: "Put the robot's commands in order: start → ??? → star!", items: ["START", "Move forward 2", "Turn left", "Move forward 1", "STAR"], hint: "Write the steps the way you'd tell a friend exactly how to walk there." } },
  { key: "tiny-robot", category: "coding", order: 8, title: "Tiny Robot Commands", emoji: "🤖", gradient: "linear-gradient(135deg, #0f4c75 0%, #3b82f6 100%)", xpValue: 20, skillTags: ["Coding", "Logic"], axisGains: { logic: 7, focus: 5 }, oneLiner: "Why it matters: breaking big jobs into small steps makes hard things easy.", description: "Arrange the steps to plant a seed properly.", play: { type: "order", prompt: "Sort these steps so the seed can grow:", items: ["Dig a small hole", "Drop in the seed", "Cover with soil", "Water gently"], hint: "What happens first, second, third, last?" } },
];

const CHALLENGES = [
  { title: "Design a rocket fin", emoji: "🚀", worldTag: "space-engineer", oneLiner: "why it matters: engineers test mini ideas before big builds.", description: "A rocket needs a fin to fly straight! Sketch one shape that could keep a paper rocket steady.", taskType: "open", taskPrompt: "Draw or describe your rocket fin. What shape is it? Why would it help?", options: [] },
  { title: "Write today's headline", emoji: "📰", worldTag: "story-weaver", oneLiner: "why it matters: headlines catch attention — a journalist's superpower.", description: "Something amazing happened at your school today. Write one headline that makes people want to read.", taskType: "open", taskPrompt: "Write one fun headline about today at school.", options: [] },
  { title: "Balance the shop's sales", emoji: "🧾", worldTag: "money-master", oneLiner: "why it matters: counting money carefully builds trust.", description: "Your stall sold 4 snacks at 5 coins each. How many coins are in the tin?", taskType: "choose", taskPrompt: "Pick the right total.", options: ["15", "20", "25", "30"] },
];

const EVENTS = [
  { title: "Meet a real marine biologist", description: "Live Q&A — bring your sea questions!", days: 3, durationMin: 30, type: "live", attendanceBadgeKey: "event-sea-quest" },
  { title: "Coding with a young developer", description: "A short recorded session with a real app builder.", days: 6, durationMin: 25, type: "recorded", attendanceBadgeKey: "event-code-quest" },
  { title: "Ask a nurse anything", description: "Live session about helping people every day.", days: 9, durationMin: 30, type: "live", attendanceBadgeKey: "event-care-quest" },
];

const BADGES = [
  { key: "first-quiz", name: "Discoverer", emoji: "🧭", category: "skill", description: "Finished the sorting quiz and found your starting world." },
  { key: "first-challenge", name: "Try It Champion", emoji: "🧪", category: "skill", description: "Completed a weekly 5-minute \"try it\" challenge." },
  { key: "logic-learner", name: "Logic Learner", emoji: "🧠", category: "skill", description: "Aced a logic quest at 80% or better." },
  { key: "code-curious", name: "Code Curious", emoji: "🧙", category: "skill", description: "Aced a coding puzzle quest." },
  { key: "story-weaver", name: "Story Weaver", emoji: "📚", category: "skill", description: "Finished the Story Spark creative quest." },
  { key: "money-smart", name: "Money Smart", emoji: "🪙", category: "skill", description: "Balanced the shop budget like a pro." },
  { key: "voice-hero", name: "Voice Hero", emoji: "🎤", category: "skill", description: "Shared a kind, clear point in Debate Pal." },
  { key: "streak-3", name: "Spark Starter", emoji: "🔥", category: "streak", description: "Learned 3 days in a row." },
  { key: "streak-7", name: "Week Warrior", emoji: "🔥", category: "streak", description: "Learned every day for a whole week." },
  { key: "streak-14", name: "Fortnight Feat", emoji: "🔥", category: "streak", description: "Fourteen days of steady discovery." },
  { key: "streak-30", name: "Monthly Legend", emoji: "🔥", category: "streak", description: "A full month of daily curiosity." },
  { key: "future-map", name: "Future Mapper", emoji: "🗺️", category: "skill", description: "Drew your own Future Map poster." },
  { key: "event-sea-quest", name: "Sea Quest Attendee", emoji: "🐠", category: "event", description: "Joined the marine biologist live session." },
  { key: "event-code-quest", name: "Code Quest Attendee", emoji: "🖥️", category: "event", description: "Watched the young developer session." },
  { key: "event-care-quest", name: "Care Quest Attendee", emoji: "💙", category: "event", description: "Joined the nurse Q&A." },
  { key: "seasonal-festival", name: "Festival Explorer", emoji: "🎪", category: "seasonal", description: "Explored the special festival career fair." },
];

async function seedClass5Discovery() {
  const insertIfEmpty = async (Model, docs) => {
    const count = await Model.countDocuments();
    if (count > 0) return { skipped: Model.modelName };
    if (docs && docs.length) await Model.insertMany(docs);
    return { seeded: Model.modelName, count: docs ? docs.length : 0 };
  };

  const results = [];
  results.push(await insertIfEmpty(CareerWorld, WORLDS));
  results.push(await insertIfEmpty(SortingQuizQuestion, QUESTIONS));
  results.push(await insertIfEmpty(MiniGame, GAMES));

  results.push(await insertIfEmpty(WeeklyChallenge, [
    { ...CHALLENGES[0], activeFrom: D(-1), activeTo: D(6) },
    { ...CHALLENGES[1], activeFrom: D(5), activeTo: D(12) },
    { ...CHALLENGES[2], activeFrom: D(11), activeTo: D(18) },
  ]));

  results.push(await insertIfEmpty(CareerVideo, VIDEOS.map((v) => ({
    ...v,
    url: SAMPLE_VIDEOS[v.careerWorldKey] || "",
    thumbnail: "",
    subtitlesUrl: "",
  }))));

  results.push(await insertIfEmpty(CareerEvent, EVENTS.map((e) => ({
    title: e.title,
    description: e.description,
    dateTime: D(e.days),
    durationMin: e.durationMin,
    type: e.type,
    attendanceBadgeKey: e.attendanceBadgeKey,
  }))));

  results.push(await insertIfEmpty(Badge, BADGES));

  results.push(await insertIfEmpty(SeasonalEvent, [
    { title: "Festival Career Fair", emoji: "🎪", worldKey: "green-builder", worldName: "Green Builder", description: "A special weekend career fair: meet five careers, earn the Festival Explorer badge!", startsAt: D(-1), endsAt: D(4) },
    { title: "Space Week", emoji: "🚀", worldKey: "space-engineer", worldName: "Space Engineer", description: "Open the Space world for double quest XP!", startsAt: D(7), endsAt: D(14) },
  ]));

  return results;
}

module.exports = { seedClass5Discovery };