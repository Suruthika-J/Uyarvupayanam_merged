// Seeds the Class 5 career-discovery feature (Discover Me, Skill Quests, Squad,
// Real World, Trophy Room). Idempotent: only inserts when a collection is empty.
// The existing Scholarships service/schema is never touched.
const CareerWorld = require("../models/CareerWorld");
const SortingQuizQuestion = require("../models/SortingQuizQuestion");
const DiscoverQuestion = require("../models/DiscoverQuestion");
const MiniGame = require("../models/MiniGame");
const WeeklyChallenge = require("../models/WeeklyChallenge");
const CareerVideo = require("../models/CareerVideo");
const CareerEvent = require("../models/CareerEvent");
const Badge = require("../models/Badge");
const SeasonalEvent = require("../models/SeasonalEvent");

const D = (daysFromNow) => new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);

// Stable Unsplash image URLs (public CDN, same style used across the app).
const img = (id) => `https://images.unsplash.com/${id}?q=80&w=1200&auto=format&fit=crop`;

const WORLDS = [
  { worldKey: "ocean-explorer", name: "Ocean Explorer", tagline: "Curiosity, science and the sea", colorTag: "blue", image: img("photo-1507525428034-b723cf961d3e"), description: "You love discovering how things work — from waves to whales. Scientists, marine biologists and explorers think like you!", skillTags: ["science", "logic", "focus"] },
  { worldKey: "story-weaver", name: "Story Weaver", tagline: "Words, imagination and feelings", colorTag: "purple", image: img("photo-1455390582262-044cdead277a"), description: "You turn ideas into stories, pictures and worlds. Writers, illustrators, filmmakers and game designers think like you!", skillTags: ["creativity", "empathy"] },
  { worldKey: "money-master", name: "Money Master", tagline: "Smart choices with numbers", colorTag: "gold", image: img("photo-1554224155-6726b3ff858f"), description: "You like figuring out fair prices, saving and balancing. Entrepreneurs, bankers and shop owners think like you!", skillTags: ["logic", "focus", "creativity"] },
  { worldKey: "green-builder", name: "Green Builder", tagline: "Caring for people and planet", colorTag: "green", image: img("photo-1416879595882-3373a0480b5b"), description: "You care about Earth and about helping neighbours. Engineers, urban planners and community leaders think like you!", skillTags: ["empathy", "leadership"] },
  { worldKey: "space-engineer", name: "Space Engineer", tagline: "Building the future, one part at a time", colorTag: "orange", image: img("photo-1517976487492-5750f3195933"), description: "You like designing, building and fixing things. Engineers, architects and makers think like you!", skillTags: ["logic", "creativity", "focus"] },
  { worldKey: "community-doctor", name: "Community Doctor", tagline: "Healing with kindness and science", colorTag: "red", image: img("photo-1576091160399-112ba8d25d1d"), description: "You notice when people need help and care. Doctors, nurses, teachers and helpers think like you!", skillTags: ["empathy", "leadership", "logic"] },
  { worldKey: "code-wizard", name: "Code Wizard", tagline: "Telling computers what to do", colorTag: "purple", image: img("photo-1517694712202-14dd9538aa97"), description: "You like giving clear steps and solving puzzles. Programmers, app makers and robotics builders think like you!", skillTags: ["logic", "focus", "creativity"] },
];

// 10 short sorting questions. Options map to a career world + skill axes.
const QUESTIONS = [
  { text: "Would you rather build a robot — or write the story of its day?",
    options: [
      { label: "Build the robot", worldKey: "space-engineer", axes: { logic: 3, focus: 2 } },
      { label: "Write its story", worldKey: "story-weaver", axes: { creativity: 3, empathy: 1 } },
      { label: "Design its pretty shell", worldKey: "green-builder", axes: { creativity: 2, empathy: 1 } },
    ] },
  { text: "Your friend feels sad at recess. What do you do?",
    options: [
      { label: "Sit and listen", worldKey: "community-doctor", axes: { empathy: 3, leadership: 1 } },
      { label: "Invent a fun game", worldKey: "story-weaver", axes: { creativity: 3 } },
      { label: "Get the whole team cheering", worldKey: "green-builder", axes: { leadership: 3, empathy: 1 } },
    ] },
  { text: "You get 100 coins for a class shop. What's the most fun?",
    options: [
      { label: "Count, price and balance", worldKey: "money-master", axes: { logic: 3, focus: 2 } },
      { label: "Design the shop sign", worldKey: "story-weaver", axes: { creativity: 2 } },
      { label: "Teach everyone to save a coin a day", worldKey: "money-master", axes: { empathy: 2, leadership: 2 } },
    ] },
  { text: "Pick a dream trip.",
    options: [
      { label: "Dive to the deepest sea", worldKey: "ocean-explorer", axes: { logic: 2, focus: 2 } },
      { label: "Ride a rocket to the stars", worldKey: "space-engineer", axes: { creativity: 2, logic: 2 } },
      { label: "Map both from a lab", worldKey: "code-wizard", axes: { logic: 3, focus: 2 } },
    ] },
  { text: "Which puzzle is your favourite?",
    options: [
      { label: "Find the next pattern", worldKey: "space-engineer", axes: { logic: 3, focus: 1 } },
      { label: "Word and story puzzles", worldKey: "story-weaver", axes: { creativity: 2, empathy: 1 } },
      { label: "Number and money problems", worldKey: "money-master", axes: { logic: 2, focus: 2 } },
    ] },
  { text: "Your class wants to clean the beach. Your job?",
    options: [
      { label: "Plan who does what", worldKey: "green-builder", axes: { leadership: 3, focus: 1 } },
      { label: "Count and sort what we find", worldKey: "ocean-explorer", axes: { logic: 2, focus: 3 } },
      { label: "Make a catchy cheer", worldKey: "story-weaver", axes: { creativity: 3 } },
    ] },
  { text: "What would you invent?",
    options: [
      { label: "A machine that turns plastic into art", worldKey: "green-builder", axes: { creativity: 3, empathy: 1 } },
      { label: "An app that tells bedtime stories", worldKey: "code-wizard", axes: { logic: 2, creativity: 2 } },
      { label: "A game that teaches saving", worldKey: "money-master", axes: { logic: 2, creativity: 2 } },
    ] },
  { text: "Choose a school club.",
    options: [
      { label: "Science & experiment club", worldKey: "ocean-explorer", axes: { logic: 3, focus: 2 } },
      { label: "Drama & debate club", worldKey: "story-weaver", axes: { creativity: 2, empathy: 2 } },
      { label: "Coding club", worldKey: "code-wizard", axes: { logic: 3, focus: 2 } },
    ] },
  { text: "A new kid joins today. What do you notice first?",
    options: [
      { label: "Do they feel welcome?", worldKey: "community-doctor", axes: { empathy: 3, leadership: 1 } },
      { label: "What do they like to build?", worldKey: "space-engineer", axes: { creativity: 2, focus: 1 } },
      { label: "What's their favourite story?", worldKey: "story-weaver", axes: { empathy: 2, creativity: 2 } },
    ] },
  { text: "A team wins when…",
    options: [
      { label: "Everyone shared an idea", worldKey: "community-doctor", axes: { empathy: 3, leadership: 2 } },
      { label: "We solved the big problem", worldKey: "code-wizard", axes: { logic: 3, focus: 2 } },
      { label: "The budget stayed balanced", worldKey: "money-master", axes: { logic: 3, focus: 2 } },
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

const worldImage = (key) => WORLDS.find((w) => w.worldKey === key)?.image || "";

// Playable question bank for the Discover Me quest cards. One record per
// question; the client renders whatever type/options are provided, so new
// questions can be added for any world without touching component code.
const QUESTION_BANK = [
  // ── Ocean Explorer ───────────────────────────────────────────────────
  { worldKey: "ocean-explorer", type: "drag_match", difficulty: 1, questionId: "ocean-q1", prompt: "Drag each sea friend to the way it stays safe.", hint: "Think about where each animal rests or travels.",
    options: [
      { id: "o1", label: "Octopus" },
      { id: "o2", label: "Sea turtle" },
      { id: "o3", label: "Dolphin" },
    ],
    targets: [
      { id: "t1", label: "Hides in a rock cave" },
      { id: "t2", label: "Carries its own shell" },
      { id: "t3", label: "Swims fast with friends" },
    ],
    correctAnswer: [
      { itemId: "o1", targetId: "t1" },
      { itemId: "o2", targetId: "t2" },
      { itemId: "o3", targetId: "t3" },
    ] },
  { worldKey: "ocean-explorer", type: "tap_select", difficulty: 2, questionId: "ocean-q2", prompt: "Tap the picture that shows a diver exploring the deep sea.", hint: "Look for the person underwater in a suit.",
    options: [
      { id: "o1", label: "A boat on the shore", image: img("photo-1526772662000-3f88f10405ff") },
      { id: "o2", label: "A diver under the waves", image: img("photo-1544551763-46a013bb70d5") },
      { id: "o3", label: "A sandy beach", image: img("photo-1507525428034-b723cf961d3e") },
    ],
    correctAnswer: "o2" },
  { worldKey: "ocean-explorer", type: "fill_blank", difficulty: 2, questionId: "ocean-q3", prompt: "A whale is a mammal that breathes ___ like us. Fish breathe underwater with their ___.", hint: "Air... and gills!",
    options: [
      { id: "f1", label: "air" },
      { id: "f2", label: "gills" },
      { id: "f3", label: "sand" },
      { id: "f4", label: "fins" },
    ],
    correctAnswer: ["f1", "f2"] },
  { worldKey: "ocean-explorer", type: "sequence", difficulty: 1, questionId: "ocean-q4", prompt: "Put a marine biologist's day in order.", hint: "What needs a boat ride, and what needs a microscope?",
    options: [
      { id: "s1", label: "Collect water samples" },
      { id: "s2", label: "Check the tide" },
      { id: "s3", label: "Study droplets in the lab" },
      { id: "s4", label: "Record what we found" },
    ],
    correctAnswer: ["s2", "s1", "s3", "s4"] },

  // ── Story Weaver ─────────────────────────────────────────────────────
  { worldKey: "story-weaver", type: "tap_select", difficulty: 1, questionId: "story-q1", prompt: "Tap the picture that looks like a cosy place to write a story.", hint: "Find the writing spot with paper and a lamp.",
    options: [
      { id: "s1", label: "A busy playground", image: img("photo-1560518883-ce09059eeffa") },
      { id: "s2", label: "A writing desk by a window", image: img("photo-1455390582262-044cdead277a") },
      { id: "s3", label: "A full classroom", image: img("photo-1503676260728-1c00da094a0b") },
    ],
    correctAnswer: "s2" },
  { worldKey: "story-weaver", type: "sequence", difficulty: 2, questionId: "story-q2", prompt: "Put how a book gets written in order.", hint: "Ideas come first, readers come at the very end.",
    options: [
      { id: "s1", label: "Write the draft" },
      { id: "s2", label: "Sketch the characters" },
      { id: "s3", label: "Get a big idea" },
      { id: "s4", label: "Share it with readers" },
    ],
    correctAnswer: ["s3", "s2", "s1", "s4"] },
  { worldKey: "story-weaver", type: "fill_blank", difficulty: 1, questionId: "story-q3", prompt: "A good story has a beginning, a ___ and an end. The person who writes the story is the ___.", hint: "The part between start and end... and the writer!",
    options: [
      { id: "f1", label: "middle" },
      { id: "f2", label: "author" },
      { id: "f3", label: "ending" },
      { id: "f4", label: "reader" },
    ],
    correctAnswer: ["f1", "f2"] },
  { worldKey: "story-weaver", type: "drag_match", difficulty: 3, questionId: "story-q4", prompt: "Match each story ingredient to its job.", hint: "Where does the surprise happen in a story?",
    options: [
      { id: "s1", label: "\"Once upon a time…\"" },
      { id: "s2", label: "\"Suddenly!\"" },
      { id: "s3", label: "\"And that was that.\"" },
    ],
    targets: [
      { id: "t1", label: "The beginning" },
      { id: "t2", label: "The surprise moment" },
      { id: "t3", label: "The ending" },
    ],
    correctAnswer: [
      { itemId: "s1", targetId: "t1" },
      { itemId: "s2", targetId: "t2" },
      { itemId: "s3", targetId: "t3" },
    ] },
  { worldKey: "story-weaver", type: "sort", difficulty: 2, questionId: "story-q5", prompt: "Sort the story ideas: make-believe or real life?", hint: "Can you meet a talking teapot on the street?",
    options: [
      { id: "o1", label: "A friendly dragon" },
      { id: "o2", label: "A talking teapot" },
      { id: "o3", label: "A rainy market day" },
      { id: "o4", label: "Planting a seed" },
    ],
    buckets: [
      { id: "b1", label: "Make-believe" },
      { id: "b2", label: "Real life" },
    ],
    correctAnswer: [
      { itemId: "o1", bucketId: "b1" },
      { itemId: "o2", bucketId: "b1" },
      { itemId: "o3", bucketId: "b2" },
      { itemId: "o4", bucketId: "b2" },
    ] },

  // ── Money Master ─────────────────────────────────────────────────────
  { worldKey: "money-master", type: "drag_match", difficulty: 2, questionId: "money-q1", prompt: "Match each school-shop item to its price.", hint: "A pencil costs less than a book.",
    options: [
      { id: "o1", label: "Candy" },
      { id: "o2", label: "Pencil" },
      { id: "o3", label: "Storybook" },
    ],
    targets: [
      { id: "t1", label: "5 coins" },
      { id: "t2", label: "10 coins" },
      { id: "t3", label: "45 coins" },
    ],
    correctAnswer: [
      { itemId: "o1", targetId: "t1" },
      { itemId: "o2", targetId: "t2" },
      { itemId: "o3", targetId: "t3" },
    ] },
  { worldKey: "money-master", type: "fill_blank", difficulty: 3, questionId: "money-q2", prompt: "If you save ___ coins every week, in 4 weeks you will have saved 20 coins.", hint: "Four times what number makes 20?",
    options: [
      { id: "f1", label: "5" },
      { id: "f2", label: "10" },
      { id: "f3", label: "4" },
      { id: "f4", label: "20" },
    ],
    correctAnswer: ["f1"] },
  { worldKey: "money-master", type: "tap_select", difficulty: 1, questionId: "money-q3", prompt: "Tap the picture of a place where people save money.", hint: "Think of a small container for coins and notes.",
    options: [
      { id: "m1", label: "A piggy bank", image: img("photo-1571781926291-c477ebfd024b") },
      { id: "m2", label: "A football", image: img("photo-1579952363873-27f3bade9f55") },
      { id: "m3", label: "A lunchbox", image: img("photo-1574323347407-f5e1ad6d020b") },
    ],
    correctAnswer: "m1" },
  { worldKey: "money-master", type: "sequence", difficulty: 1, questionId: "money-q4", prompt: "Put the shopkeeper's day in order.", hint: "When do you count the coins — before or after selling?",
    options: [
      { id: "s1", label: "Sell snacks" },
      { id: "s2", label: "Open the shop" },
      { id: "s3", label: "Count the coins" },
      { id: "s4", label: "Lock up for the day" },
    ],
    correctAnswer: ["s2", "s1", "s3", "s4"] },

  // ── Green Builder ────────────────────────────────────────────────────
  { worldKey: "green-builder", type: "sort", difficulty: 1, questionId: "green-q1", prompt: "Sort the choices: good for Earth or not so good?", hint: "Which choices keep the planet clean?",
    options: [
      { id: "o1", label: "Plant a tree" },
      { id: "o2", label: "Recycle paper" },
      { id: "o3", label: "Throw plastic in the river" },
      { id: "o4", label: "Leave lights on all day" },
    ],
    buckets: [
      { id: "b1", label: "Good for Earth" },
      { id: "b2", label: "Not so good" },
    ],
    correctAnswer: [
      { itemId: "o1", bucketId: "b1" },
      { itemId: "o2", bucketId: "b1" },
      { itemId: "o3", bucketId: "b2" },
      { itemId: "o4", bucketId: "b2" },
    ] },
  { worldKey: "green-builder", type: "fill_blank", difficulty: 2, questionId: "green-q2", prompt: "We ___ paper so it can be used again. Turning off ___ saves energy.", hint: "Using something again... and the lights!",
    options: [
      { id: "f1", label: "recycle" },
      { id: "f2", label: "lights" },
      { id: "f3", label: "throw" },
      { id: "f4", label: "fans" },
    ],
    correctAnswer: ["f1", "f2"] },
  { worldKey: "green-builder", type: "tap_select", difficulty: 2, questionId: "green-q3", prompt: "Tap the picture of a community garden full of vegetables.", hint: "Look for raised beds growing food.",
    options: [
      { id: "g1", label: "Vegetable garden beds", image: img("photo-1466692476868-aef1dfb1e735") },
      { id: "g2", label: "A city skyline", image: img("photo-1477959858617-67f85cf4f1df") },
      { id: "g3", label: "A library", image: img("photo-1521587760476-6c12a4b040da") },
    ],
    correctAnswer: "g1" },
  { worldKey: "green-builder", type: "sequence", difficulty: 1, questionId: "green-q4", prompt: "Grow a bean plant — put the steps in order.", hint: "The seed goes in soil before it gets watered.",
    options: [
      { id: "s1", label: "Water it every day" },
      { id: "s2", label: "Fill the pot with soil" },
      { id: "s3", label: "Watch it sprout" },
      { id: "s4", label: "Plant the seed" },
    ],
    correctAnswer: ["s2", "s4", "s1", "s3"] },

  // ── Space Engineer ───────────────────────────────────────────────────
  { worldKey: "space-engineer", type: "sequence", difficulty: 2, questionId: "space-q1", prompt: "Launch a rocket — put the steps in order.", hint: "What happens right before the big blast-off?",
    options: [
      { id: "s1", label: "Fill the fuel tank" },
      { id: "s2", label: "Check every part" },
      { id: "s3", label: "Countdown 3, 2, 1" },
      { id: "s4", label: "Blast off!" },
    ],
    correctAnswer: ["s1", "s2", "s3", "s4"] },
  { worldKey: "space-engineer", type: "drag_match", difficulty: 2, questionId: "space-q2", prompt: "Match each tool to the job it does.", hint: "Tighten a bolt... turn a screw... measure a part.",
    options: [
      { id: "o1", label: "Wrench" },
      { id: "o2", label: "Screwdriver" },
      { id: "o3", label: "Ruler" },
    ],
    targets: [
      { id: "t1", label: "Tighten bolts" },
      { id: "t2", label: "Turn screws" },
      { id: "t3", label: "Measure parts" },
    ],
    correctAnswer: [
      { itemId: "o1", targetId: "t1" },
      { itemId: "o2", targetId: "t2" },
      { itemId: "o3", targetId: "t3" },
    ] },
  { worldKey: "space-engineer", type: "fill_blank", difficulty: 3, questionId: "space-q3", prompt: "A rocket needs ___ to push it upward. The part that steers it is called a ___.", hint: "Something to burn... and a small wing.",
    options: [
      { id: "f1", label: "fuel" },
      { id: "f2", label: "fin" },
      { id: "f3", label: "paper" },
      { id: "f4", label: "water" },
    ],
    correctAnswer: ["f1", "f2"] },
  { worldKey: "space-engineer", type: "tap_select", difficulty: 1, questionId: "space-q4", prompt: "Tap the picture of a workshop full of tools.", hint: "Look for the bench covered in hammers and wrenches.",
    options: [
      { id: "sp1", label: "A tool-filled workshop", image: img("photo-1530124566582-a618bc2615dc") },
      { id: "sp2", label: "A bedroom", image: img("photo-1505693416388-ac5ce068fe85") },
      { id: "sp3", label: "A swimming pool", image: img("photo-1576610616656-d3aa5d1f4534") },
    ],
    correctAnswer: "sp1" },

  // ── Community Doctor ─────────────────────────────────────────────────
  { worldKey: "community-doctor", type: "drag_match", difficulty: 1, questionId: "doctor-q1", prompt: "Match each helper to what they do best.", hint: "Who mends arms, who gives kind care, who helps you learn?",
    options: [
      { id: "o1", label: "Doctor" },
      { id: "o2", label: "Nurse" },
      { id: "o3", label: "Teacher" },
    ],
    targets: [
      { id: "t1", label: "Mends a broken arm" },
      { id: "t2", label: "Gives gentle care" },
      { id: "t3", label: "Helps you learn" },
    ],
    correctAnswer: [
      { itemId: "o1", targetId: "t1" },
      { itemId: "o2", targetId: "t2" },
      { itemId: "o3", targetId: "t3" },
    ] },
  { worldKey: "community-doctor", type: "sequence", difficulty: 2, questionId: "doctor-q2", prompt: "Take care of a small cut — put the steps in order.", hint: "Clean hands first, then the cut, and tell an adult at the end.",
    options: [
      { id: "s1", label: "Wash your hands" },
      { id: "s2", label: "Clean the cut gently" },
      { id: "s3", label: "Cover it with a plaster" },
      { id: "s4", label: "Tell an adult what happened" },
    ],
    correctAnswer: ["s1", "s2", "s3", "s4"] },
  { worldKey: "community-doctor", type: "sort", difficulty: 1, questionId: "doctor-q3", prompt: "Sort the choices: kind or careless?", hint: "How would a good friend act?",
    options: [
      { id: "o1", label: "Listen when a friend talks" },
      { id: "o2", label: "Share your snack" },
      { id: "o3", label: "Shout at someone" },
      { id: "o4", label: "Push in the lunch line" },
    ],
    buckets: [
      { id: "b1", label: "Kind choices" },
      { id: "b2", label: "Careless choices" },
    ],
    correctAnswer: [
      { itemId: "o1", bucketId: "b1" },
      { itemId: "o2", bucketId: "b1" },
      { itemId: "o3", bucketId: "b2" },
      { itemId: "o4", bucketId: "b2" },
    ] },
  { worldKey: "community-doctor", type: "tap_select", difficulty: 1, questionId: "doctor-q4", prompt: "Tap the picture that shows someone helping people stay well.", hint: "Look for the kind caregiver.",
    options: [
      { id: "d1", label: "A nurse caring for a patient", image: img("photo-1576091160399-112ba8d25d1d") },
      { id: "d2", label: "A big football match", image: img("photo-1579952363873-27f3bade9f55") },
      { id: "d3", label: "A busy road", image: img("photo-1506521781263-d8422e82f27a") },
    ],
    correctAnswer: "d1" },

  // ── Code Wizard ──────────────────────────────────────────────────────
  { worldKey: "code-wizard", type: "sequence", difficulty: 1, questionId: "code-q1", prompt: "Program the robot to reach the star — put the commands in order.", hint: "What does the robot need to do first?",
    options: [
      { id: "s1", label: "Move forward 2" },
      { id: "s2", label: "Turn left" },
      { id: "s3", label: "Move forward 1" },
      { id: "s4", label: "Grab the star" },
    ],
    correctAnswer: ["s1", "s2", "s3", "s4"] },
  { worldKey: "code-wizard", type: "fill_blank", difficulty: 2, questionId: "code-q2", prompt: "Computers follow exact ___. A ___ is a list of step-by-step instructions.", hint: "Programs are made of careful steps.",
    options: [
      { id: "f1", label: "steps" },
      { id: "f2", label: "program" },
      { id: "f3", label: "dreams" },
      { id: "f4", label: "colours" },
    ],
    correctAnswer: ["f1", "f2"] },
  { worldKey: "code-wizard", type: "drag_match", difficulty: 2, questionId: "code-q3", prompt: "Match each command to what it tells the robot.", hint: "\"Move\" makes it travel, \"turn\" changes direction.",
    options: [
      { id: "o1", label: "move" },
      { id: "o2", label: "turn" },
      { id: "o3", label: "beep" },
    ],
    targets: [
      { id: "t1", label: "Go forward" },
      { id: "t2", label: "Change direction" },
      { id: "t3", label: "Make a sound" },
    ],
    correctAnswer: [
      { itemId: "o1", targetId: "t1" },
      { itemId: "o2", targetId: "t2" },
      { itemId: "o3", targetId: "t3" },
    ] },
  { worldKey: "code-wizard", type: "tap_select", difficulty: 2, questionId: "code-q4", prompt: "Tap the picture of someone writing code on a computer.", hint: "Look for glowing text full of symbols.",
    options: [
      { id: "c1", label: "Code on a screen", image: img("photo-1517694712202-14dd9538aa97") },
      { id: "c2", label: "A bowl of fruit", image: img("photo-1512621776951-a57141f2eefd") },
      { id: "c3", label: "A rainy window", image: img("photo-1515694346937-94d85e41e6f0") },
    ],
    correctAnswer: "c1" },
];

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
  { key: "pattern-bridge", category: "logic", order: 1, title: "Pattern Bridge", image: img("photo-1552820728-8b83bb6b773f"), gradient: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)", featured: true, xpValue: 20, skillTags: ["Logic", "Focus"], axisGains: { logic: 8, focus: 5 }, oneLiner: "Why it matters: spotting patterns trains your brain for maths and science.", description: "The bridge is broken! Tap the shape that completes the pattern.", play: { type: "choose", prompt: "Which colour completes the pattern? Blue, Red, Blue, Blue, Red, Blue …", options: ["Red", "Blue", "Green", "Yellow"], correctIndex: 1, hint: "The pattern repeats in a sneaky 1-2 rhythm." } },
  { key: "ocean-detective", category: "logic", order: 2, title: "Ocean Detective", image: img("photo-1583212292454-1fe6229603b7"), gradient: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)", xpValue: 20, skillTags: ["Logic", "Observation"], axisGains: { logic: 8, focus: 5 }, oneLiner: "Why it matters: good detectives read clues carefully — that's how doctors solve what's wrong.", description: "Three clues, one culprit. Read carefully and pick who took the pearl!", play: { type: "choose", prompt: "Clues: The thief is wet, loves jelly, and her name has 5 letters.", options: ["Coral the crab", "Perla the whale", "Fizz the fish", "Luna the octopus"], correctIndex: 3, hint: "Count the letters — punny clues love a letter trick." } },
  { key: "story-spark", category: "creative", order: 3, title: "Story Spark", image: img("photo-1519682337058-a94d519337bc"), gradient: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)", featured: true, xpValue: 15, skillTags: ["Creativity", "Storytelling"], axisGains: { creativity: 10 }, oneLiner: "Why it matters: turning ideas into stories is how writers and inventors work.", description: "Pick three ingredients and write the first lines of your story.", play: { type: "write", prompt: "Write the first 2 sentences of a story that has: a tiny robot, a rainy day, and a lost map.", hint: "Small details make a story feel real." } },
  { key: "design-a-postcard", category: "creative", order: 4, title: "Design a Postcard", image: img("photo-1452860606245-08befc0ff44b"), gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", xpValue: 15, skillTags: ["Creativity", "Design"], axisGains: { creativity: 8, focus: 3 }, oneLiner: "Why it matters: designers plan every colour to tell a feeling.", description: "Choose the colours and message that best cheer up a friend far away.", play: { type: "choose", prompt: "Which postcard message will make a faraway friend smile most?", options: ["\"Wish you were here!\" with warm sunset colours", "\"I got new pencils\" with plain blue", "\"It's raining.\" with grey", "\"School was okay.\" with white"], correctIndex: 0, hint: "Warm colours + a friendly hello = a smile." } },
  { key: "debate-pal", category: "debate", order: 5, title: "Debate Pal", image: img("photo-1522202176988-66273c2fd55f"), gradient: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)", featured: true, xpValue: 20, skillTags: ["Communication", "Empathy"], axisGains: { leadership: 7, empathy: 5, creativity: 3 }, oneLiner: "Why it matters: sharing an idea kindly is how leaders get things done.", description: "Choose the kindest, clearest point to help your class decide.", play: { type: "choose", prompt: "Recess is 5 minutes longer, but lunch gets shorter. Pick the best sentence to say.", options: ["\"Fresh air helps us think — can we try 5 extra minutes and see?\"", "\"My idea is best, nobody else's.\"", "\"Lunch shorter? This is unfair!\"", "\"I don't care.\""], correctIndex: 0, hint: "A good point explains the why and leaves room for everyone." } },
  { key: "shop-balance", category: "budgeting", order: 6, title: "Shop Balance", image: img("photo-1560472354-b33ff0c44a43"), gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", featured: true, xpValue: 20, skillTags: ["Budgeting", "Logic"], axisGains: { logic: 8, focus: 5, creativity: 2 }, oneLiner: "Why it matters: balancing money is a life skill — shop owners do it every day.", description: "You have 50 coins. Buy snacks for the class AND save 10 for tomorrow.", play: { type: "choose", prompt: "Snacks cost 15 each. You need 2 snacks and must keep 10 coins. How many coins left?", options: ["15", "20", "25", "30"], correctIndex: 1, hint: "2 × 15 = 30 spent. 50 − 30 = ?" } },
  { key: "code-wizard-lite", category: "coding", order: 7, title: "Code Wizard", image: img("photo-1485827404703-89b55fcc595e"), gradient: "linear-gradient(135deg, #6d28d9 0%, #ec4899 100%)", featured: true, xpValue: 25, skillTags: ["Coding", "Logic", "Focus"], axisGains: { logic: 9, focus: 6, creativity: 3 }, oneLiner: "Why it matters: giving exact steps in order is exactly how computers work.", description: "Program the robot to reach the star — tap the steps in the right order.", play: { type: "order", prompt: "Put the robot's commands in order: start, then the middle steps, then the goal!", items: ["START", "Move forward 2", "Turn left", "Move forward 1", "STAR"], hint: "Write the steps the way you'd tell a friend exactly how to walk there." } },
  { key: "tiny-robot", category: "coding", order: 8, title: "Tiny Robot Commands", image: img("photo-1531747118685-ca8fa6e08806"), gradient: "linear-gradient(135deg, #0f4c75 0%, #3b82f6 100%)", xpValue: 20, skillTags: ["Coding", "Logic"], axisGains: { logic: 7, focus: 5 }, oneLiner: "Why it matters: breaking big jobs into small steps makes hard things easy.", description: "Arrange the steps to plant a seed properly.", play: { type: "order", prompt: "Sort these steps so the seed can grow:", items: ["Dig a small hole", "Drop in the seed", "Cover with soil", "Water gently"], hint: "What happens first, second, third, last?" } },
];

const CHALLENGES = [
  { title: "Design a rocket fin", worldTag: "space-engineer", image: img("photo-1517976487492-5750f3195933"), oneLiner: "why it matters: engineers test mini ideas before big builds.", description: "A rocket needs a fin to fly straight! Sketch one shape that could keep a paper rocket steady.", taskType: "open", taskPrompt: "Draw or describe your rocket fin. What shape is it? Why would it help?", options: [] },
  { title: "Write today's headline", worldTag: "story-weaver", image: img("photo-1455390582262-044cdead277a"), oneLiner: "why it matters: headlines catch attention — a journalist's superpower.", description: "Something amazing happened at your school today. Write one headline that makes people want to read.", taskType: "open", taskPrompt: "Write one fun headline about today at school.", options: [] },
  { title: "Balance the shop's sales", worldTag: "money-master", image: img("photo-1554224155-6726b3ff858f"), oneLiner: "why it matters: counting money carefully builds trust.", description: "Your stall sold 4 snacks at 5 coins each. How many coins are in the tin?", taskType: "choose", taskPrompt: "Pick the right total.", options: ["15", "20", "25", "30"] },
];

const EVENTS = [
  { title: "Meet a real marine biologist", description: "Live Q&A — bring your sea questions!", coverImage: img("photo-1544551763-46a013bb70d5"), days: 3, durationMin: 30, type: "live", attendanceBadgeKey: "event-sea-quest" },
  { title: "Coding with a young developer", description: "A short recorded session with a real app builder.", coverImage: img("photo-1504610926078-a1611febcad3"), days: 6, durationMin: 25, type: "recorded", attendanceBadgeKey: "event-code-quest" },
  { title: "Ask a nurse anything", description: "Live session about helping people every day.", coverImage: img("photo-1576091160550-2173dba999ef"), days: 9, durationMin: 30, type: "live", attendanceBadgeKey: "event-care-quest" },
];

const BADGES = [
  { key: "first-quiz", name: "Discoverer", category: "skill", description: "Finished the sorting quiz and found your starting world." },
  { key: "first-discover", name: "Quest Starter", category: "skill", description: "Solved your very first Discover Me quest question." },
  { key: "first-challenge", name: "Try It Champion", category: "skill", description: "Completed a weekly 5-minute \"try it\" challenge." },
  { key: "logic-learner", name: "Logic Learner", category: "skill", description: "Aced a logic quest at 80% or better." },
  { key: "code-curious", name: "Code Curious", category: "skill", description: "Aced a coding puzzle quest." },
  { key: "story-weaver", name: "Story Weaver", category: "skill", description: "Finished the Story Spark creative quest." },
  { key: "money-smart", name: "Money Smart", category: "skill", description: "Balanced the shop budget like a pro." },
  { key: "voice-hero", name: "Voice Hero", category: "skill", description: "Shared a kind, clear point in Debate Pal." },
  { key: "streak-3", name: "Spark Starter", category: "streak", description: "Learned 3 days in a row." },
  { key: "streak-7", name: "Week Warrior", category: "streak", description: "Learned every day for a whole week." },
  { key: "streak-14", name: "Fortnight Feat", category: "streak", description: "Fourteen days of steady discovery." },
  { key: "streak-30", name: "Monthly Legend", category: "streak", description: "A full month of daily curiosity." },
  { key: "future-map", name: "Future Mapper", category: "skill", description: "Drew your own Future Map poster." },
  { key: "event-sea-quest", name: "Sea Quest Attendee", category: "event", description: "Joined the marine biologist live session." },
  { key: "event-code-quest", name: "Code Quest Attendee", category: "event", description: "Watched the young developer session." },
  { key: "event-care-quest", name: "Care Quest Attendee", category: "event", description: "Joined the nurse Q&A." },
  { key: "seasonal-festival", name: "Festival Explorer", category: "seasonal", description: "Explored the special festival career fair." },
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
  results.push(await insertIfEmpty(DiscoverQuestion, QUESTION_BANK));
  results.push(await insertIfEmpty(MiniGame, GAMES));

  results.push(await insertIfEmpty(WeeklyChallenge, [
    { ...CHALLENGES[0], activeFrom: D(-1), activeTo: D(6) },
    { ...CHALLENGES[1], activeFrom: D(5), activeTo: D(12) },
    { ...CHALLENGES[2], activeFrom: D(11), activeTo: D(18) },
  ]));

  results.push(await insertIfEmpty(CareerVideo, VIDEOS.map((v) => ({
    ...v,
    url: SAMPLE_VIDEOS[v.careerWorldKey] || "",
    thumbnail: worldImage(v.careerWorldKey),
    subtitlesUrl: "",
  }))));

  results.push(await insertIfEmpty(CareerEvent, EVENTS.map((e) => ({
    title: e.title,
    description: e.description,
    coverImage: e.coverImage,
    dateTime: D(e.days),
    durationMin: e.durationMin,
    type: e.type,
    attendanceBadgeKey: e.attendanceBadgeKey,
  }))));

  results.push(await insertIfEmpty(Badge, BADGES));

  results.push(await insertIfEmpty(SeasonalEvent, [
    { title: "Festival Career Fair", image: img("photo-1492684223066-81342ee5ff30"), worldKey: "green-builder", worldName: "Green Builder", description: "A special weekend career fair: meet five careers, earn the Festival Explorer badge!", startsAt: D(-1), endsAt: D(4) },
    { title: "Space Week", image: img("photo-1446776877081-d402a2f4e0ee"), worldKey: "space-engineer", worldName: "Space Engineer", description: "Open the Space world for double quest XP!", startsAt: D(7), endsAt: D(14) },
  ]));

  return results;
}

module.exports = { seedClass5Discovery };