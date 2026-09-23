// Seeds the Math Adventure World - eleven illustrated cartoon worlds for
// Class 5 maths. THEMES and the QUESTION BANK are kept in separate structures
// so art direction and learning content can be edited independently.
// Idempotent: only inserts when empty.
const MathWorld = require("../models/MathWorld");
const MathQuestion = require("../models/MathQuestion");

// ── THEMES (art direction) ────────────────────────────────────────────────
// Mirrored on the frontend in frontend/src/student/data/mathWorldThemes.js
const MATH_WORLD_THEMES = {
  "number-castle": {
    name: "Number Castle",
    nameEn: "Number Castle",
    environment: "castle",
    mood: "grand",
    animation: "drift",
    cardStyle: "castle",
    accent: "#ffd27a",
    palette: {
      skyTop: "#3b2f63",
      skyBottom: "#f2c27f",
      ground: "#6b5a86",
      accent: "#ffd27a",
      cardBg: "#f3ecff",
      cardAccent: "#7a5cf0",
    },
  },
  addition: {
    name: "Addition Valley",
    nameEn: "Addition Valley",
    environment: "valley",
    mood: "cheerful",
    animation: "drift",
    cardStyle: "field",
    accent: "#ffcf6b",
    palette: {
      skyTop: "#54b9a6",
      skyBottom: "#dcf5c9",
      ground: "#6f9e5b",
      accent: "#ffcf6b",
      cardBg: "#f2fbe2",
      cardAccent: "#67a14f",
    },
  },
  subtraction: {
    name: "Subtraction Forest",
    nameEn: "Subtraction Forest",
    environment: "forest",
    mood: "calm",
    animation: "sway",
    cardStyle: "forest",
    accent: "#a7d8c8",
    palette: {
      skyTop: "#2f6f7a",
      skyBottom: "#aee0df",
      ground: "#4e6b57",
      accent: "#a7d8c8",
      cardBg: "#e9f7f2",
      cardAccent: "#2f8f7a",
    },
  },
  multiplication: {
    name: "Multiplication City",
    nameEn: "Multiplication City",
    environment: "city",
    mood: "bustling",
    animation: "twinkle",
    cardStyle: "tower",
    accent: "#ffd166",
    palette: {
      skyTop: "#2b2b52",
      skyBottom: "#8f7bd8",
      ground: "#4a3f6b",
      accent: "#ffd166",
      cardBg: "#efeaff",
      cardAccent: "#6a4fd0",
    },
  },
  division: {
    name: "Division Cave",
    nameEn: "Division Cave",
    environment: "cave",
    mood: "warm",
    animation: "glow",
    cardStyle: "gem",
    accent: "#ffb84d",
    palette: {
      skyTop: "#2a1e2e",
      skyBottom: "#8a6a3f",
      ground: "#5d4026",
      accent: "#ffb84d",
      cardBg: "#fbeedd",
      cardAccent: "#b06f27",
    },
  },
  geometry: {
    name: "Geometry Island",
    nameEn: "Geometry Island",
    environment: "island",
    mood: "sunny",
    animation: "drift",
    cardStyle: "hut",
    accent: "#ffe08a",
    palette: {
      skyTop: "#2b7cd6",
      skyBottom: "#aee8ff",
      ground: "#d8b06a",
      accent: "#ffe08a",
      cardBg: "#e6f7ff",
      cardAccent: "#1f8fd6",
    },
  },
  fractions: {
    name: "Fraction Bakery",
    nameEn: "Fraction Bakery",
    environment: "bakery",
    mood: "warm",
    animation: "twinkle",
    cardStyle: "plate",
    accent: "#ff8f70",
    palette: {
      skyTop: "#d98aa0",
      skyBottom: "#ffe2cf",
      ground: "#a86a52",
      accent: "#ff8f70",
      cardBg: "#fff0e4",
      cardAccent: "#d96a4a",
    },
  },
  time: {
    name: "Time Station",
    nameEn: "Time Station",
    environment: "station",
    mood: "steady",
    animation: "sway",
    cardStyle: "ticket",
    accent: "#ffd166",
    palette: {
      skyTop: "#25406b",
      skyBottom: "#9fc3e8",
      ground: "#5a6b82",
      accent: "#ffd166",
      cardBg: "#eaf2fb",
      cardAccent: "#3a7bb0",
    },
  },
  money: {
    name: "Money Market",
    nameEn: "Money Market",
    environment: "market",
    mood: "busy",
    animation: "glow",
    cardStyle: "coin",
    accent: "#fff0a6",
    palette: {
      skyTop: "#e07b39",
      skyBottom: "#ffe9c2",
      ground: "#b8763f",
      accent: "#fff0a6",
      cardBg: "#fff6e0",
      cardAccent: "#c9792a",
    },
  },
  measurement: {
    name: "Measurement Workshop",
    nameEn: "Measurement Workshop",
    environment: "workshop",
    mood: "focused",
    animation: "sway",
    cardStyle: "ruler",
    accent: "#ffc66b",
    palette: {
      skyTop: "#4a70a0",
      skyBottom: "#cfe3f5",
      ground: "#8a6a4a",
      accent: "#ffc66b",
      cardBg: "#f2f7fb",
      cardAccent: "#4a78b0",
    },
  },
  data: {
    name: "Data Detective Zone",
    nameEn: "Data Detective Zone",
    environment: "detective",
    mood: "curious",
    animation: "twinkle",
    cardStyle: "notepad",
    accent: "#7fd8d8",
    palette: {
      skyTop: "#16223a",
      skyBottom: "#46709c",
      ground: "#2f4058",
      accent: "#7fd8d8",
      cardBg: "#eaf2f7",
      cardAccent: "#2e7c9c",
    },
  },
};

const WORLD_ORDER = [
  "number-castle",
  "addition",
  "subtraction",
  "multiplication",
  "division",
  "geometry",
  "fractions",
  "time",
  "money",
  "measurement",
  "data",
];

const SHO = (key) => ({
  id: key,
  name: MATH_WORLD_THEMES[key].name,
  nameEn: MATH_WORLD_THEMES[key].nameEn,
  accent: MATH_WORLD_THEMES[key].accent,
  environment: MATH_WORLD_THEMES[key].environment,
  theme: { ...MATH_WORLD_THEMES[key] },
});

const SKILLS = {
  "number-castle": ["place value", "comparison", "odd/even", "ordering"],
  addition: ["joining two groups", "finding the total", "simple sums"],
  subtraction: ["taking away", "finding what is left", "difference"],
  multiplication: ["equal-sized groups", "repeated addition", "times tables"],
  division: ["sharing into equal piles", "grouping", "fair shares"],
  geometry: ["shapes", "sides and corners", "recognising shapes"],
  fractions: ["equal parts", "numerator and denominator", "halves and quarters"],
  time: ["reading a clock", "hours and minutes", "intervals of time"],
  money: ["using the rupee", "add and subtract money", "making change"],
  measurement: ["length", "capacity", "mass"],
  data: ["reading a survey", "building a bar chart", "which has more/fewer"],
};

const INTROS = {
  "number-castle": "Enter the tall towers of the Number Castle and meet the digits who live here. Line them up, compare them, and sort even from odd.",
  addition: "Rolling green fields full of fruit trees and friendly animals. Bring two baskets of apples together and count the rainbow total.",
  subtraction: "A quiet forest where birds and leaves slowly drift away. Start with a full tree and count how many stay behind.",
  multiplication: "Rows of bright shops, each with the same number of windows. Add equal-sized groups again and again - that is multiplication!",
  division: "Deep golden caves full of treasure. Share the gems fairly into equal piles until every pile is the same.",
  geometry: "A sunny island with round huts and tall bridges. Meet triangles, squares, circles and hexagons hiding in everything around you.",
  fractions: "The warmest kitchen in town, with cakes and pizzas fresh from the oven. Slice them into equal parts and share them fairly.",
  time: "A busy station where the big clock sits above the platform. Watch the hands turn and read the time before the next train arrives.",
  money: "A lively market stall with shiny coins and crisp notes. Count the rupees, add the price, and make friendly change.",
  measurement: "A neat workshop with rulers, scales and measuring jugs. How long, how heavy, how much - measure everything in sight.",
  data: "A detective's board full of wall charts and tallies. Ask a survey, count the answers, and turn them into a bar chart.",
};

// ── QUESTION BANK (content) ───────────────────────────────────────────────
// q(id, topic, type, difficulty, question, objects, options, answer, explanation)
let _nextId = 101;
const q = (topic, type, difficulty, question, objects, options, answer, explanation) => ({
  id: _nextId++,
  topic,
  type,
  difficulty,
  question,
  objects: objects || {},
  options: options || [],
  answer,
  explanation,
});

const QUESTIONS = [
  // ── NUMBER CASTLE ───────────────────────────────────────────
  q("number-castle", "numerical", "easy", "Which digit is in the TENS place of 46?", { number: 46, place: "tens" }, [4, 6, 40], 4, "In 46, the 4 sits in the tens place - it means four tens (40)."),
  q("number-castle", "multiple-choice", "easy", "Which number is the greatest?", { numbers: [23, 32, 19] }, [23, 32, 19], 32, "32 has 3 tens, and 23 has only 2 tens - so 32 is the greatest of the three."),
  q("number-castle", "numerical", "medium", "What number is 5 tens and 3 ones?", { tens: 5, ones: 3 }, [53, 35, 8, 503], 53, "5 tens make 50, then add 3 ones - that is 53."),
  q("number-castle", "multiple-choice", "medium", "Which of these numbers is ODD?", { numbers: [12, 17, 20, 8] }, [12, 17, 20, 8], 17, "Odd numbers end in 1, 3, 5, 7 or 9. 17 ends in 7, so it is odd."),
  q("number-castle", "multiple-choice", "challenge", "Put 19, 31 and 27 in order from smallest. Which number comes in the MIDDLE?", { numbers: [19, 31, 27] }, [19, 27, 31], 27, "Smallest to biggest: 19, 27, 31. The middle number is 27."),

  // ── ADDITION VALLEY ─────────────────────────────────────────
  q("addition", "visual", "easy", "4 apples sit in a basket, then 3 more apples arrive.", { firstGroup: 4, secondGroup: 3, object: "apple" }, [5, 6, 7, 9], 7, "4 apples plus 3 more apples = 7 apples in the basket."),
  q("addition", "visual", "easy", "2 birds sit on a tree, then 5 more birds join them.", { firstGroup: 2, secondGroup: 5, object: "bird" }, [5, 7, 8, 6], 7, "2 birds plus 5 birds = 7 birds on the tree."),
  q("addition", "story", "medium", "Ravi picks 6 mangoes. His sister gives him 4 more mangoes.", { firstGroup: 6, secondGroup: 4, object: "mango" }, [9, 10, 11, 12], 10, "6 mangoes plus 4 mangoes = 10 mangoes in all."),
  q("addition", "visual", "medium", "7 yellow flowers bloom, then 5 red flowers blossom too.", { firstGroup: 7, secondGroup: 5, object: "flower" }, [11, 12, 13, 14], 12, "7 flowers plus 5 flowers = 12 flowers in the garden."),
  q("addition", "story", "challenge", "A baker makes 9 buns in the morning and 9 more buns in the evening.", { firstGroup: 9, secondGroup: 9, object: "bun" }, [16, 18, 19, 20], 18, "9 buns plus 9 buns = 18 buns. Double 9 is 18."),

  // ── SUBTRACTION FOREST ──────────────────────────────────────
  q("subtraction", "visual", "easy", "5 birds perch on a branch, then 2 fly away.", { firstGroup: 5, takeAway: 2, object: "bird" }, [2, 3, 4, 5], 3, "5 birds take away 2 birds = 3 birds stay behind."),
  q("subtraction", "visual", "easy", "6 leaves hang on a twig, then 1 leaf drifts down.", { firstGroup: 6, takeAway: 1, object: "leaf" }, [4, 5, 6, 7], 5, "6 leaves take away 1 leaf = 5 leaves still hang on the twig."),
  q("subtraction", "fill-blank", "medium", "8 balloons float up, then 3 balloons pop. How many are left?", { firstGroup: 8, takeAway: 3, object: "balloon" }, [3, 5, 6, 8], 5, "8 balloons take away 3 balloons = 5 balloons are left."),
  q("subtraction", "visual", "medium", "10 dragonflies buzz around, then 4 fly off to the pond.", { firstGroup: 10, takeAway: 4, object: "dragonfly" }, [4, 6, 7, 8], 6, "10 dragonflies take away 4 dragonflies = 6 dragonflies remain."),
  q("subtraction", "story", "challenge", "A hen has 12 eggs in her nest. 7 eggs hatch. How many eggs are left?", { firstGroup: 12, takeAway: 7, object: "egg" }, [4, 5, 6, 7], 5, "12 eggs take away 7 hatched eggs = 5 eggs are left in the nest."),

  // ── MULTIPLICATION CITY ─────────────────────────────────────
  q("multiplication", "drag", "easy", "3 crates hold 2 apples each. How many apples in all?", { groups: 3, perGroup: 2, item: "apple" }, [5, 6, 7, 8], 6, "3 groups of 2 apples = 2 + 2 + 2 = 6 apples."),
  q("multiplication", "multiple-choice", "easy", "A bakery has 2 trays with 5 buns on each tray.", { groups: 2, perGroup: 5, item: "bun" }, [7, 10, 12, 15], 10, "2 groups of 5 buns = 10 buns in all."),
  q("multiplication", "drag", "medium", "4 flower pots each hold 3 marigolds.", { groups: 4, perGroup: 3, item: "flower" }, [10, 11, 12, 13], 12, "4 groups of 3 flowers = 3 + 3 + 3 + 3 = 12 marigolds."),
  q("multiplication", "multiple-choice", "medium", "5 windows in a row, and 4 rows of windows. How many windows on the tower?", { groups: 5, perGroup: 4, item: "window" }, [16, 18, 20, 24], 20, "5 groups of 4 windows = 20 windows on the tower."),
  q("multiplication", "multiple-choice", "challenge", "A shop keeps 6 jars on each of 3 shelves.", { groups: 6, perGroup: 3, item: "jar" }, [15, 18, 21, 24], 18, "6 groups of 3 jars = 6 + 6 + 6 = 18 jars."),

  // ── DIVISION CAVE ───────────────────────────────────────────
  q("division", "drag", "easy", "6 coins are shared fairly between 2 treasure chests.", { total: 6, groups: 2, item: "coin" }, [2, 3, 4, 6], 3, "6 coins split into 2 equal piles = 3 coins in each chest."),
  q("division", "multiple-choice", "easy", "4 red gems are shared equally between 2 baskets.", { total: 4, groups: 2, item: "gem" }, [1, 2, 3, 4], 2, "4 gems split into 2 piles = 2 gems in each basket."),
  q("division", "drag", "medium", "12 gold rings are packed into 3 equal boxes.", { total: 12, groups: 3, item: "ring" }, [3, 4, 5, 6], 4, "12 rings split into 3 boxes = 4 rings in each box."),
  q("division", "multiple-choice", "medium", "10 pearls are shared fairly among 2 necklaces.", { total: 10, groups: 2, item: "pearl" }, [3, 4, 5, 6], 5, "10 pearls split into 2 piles = 5 pearls in each."),
  q("division", "visual", "challenge", "15 silver coins are shared equally between 3 treasure piles.", { total: 15, groups: 3, item: "coin" }, [3, 4, 5, 6], 5, "15 coins split into 3 equal piles = 5 coins in each pile."),

  // ── GEOMETRY ISLAND ─────────────────────────────────────────
  q("geometry", "shape-touch", "easy", "A triangle has how many sides?", { shape: "triangle" }, [2, 3, 4, 5], 3, "A triangle always has exactly 3 straight sides."),
  q("geometry", "multiple-choice", "easy", "How many corners does a square have?", { shape: "square" }, [2, 3, 4, 5], 4, "A square has 4 equal sides and 4 square corners."),
  q("geometry", "shape-touch", "medium", "A hexagon has how many sides?", { shape: "hexagon" }, [4, 5, 6, 8], 6, "A hexagon has 6 straight sides - 'hexa' means six."),
  q("geometry", "multiple-choice", "medium", "How many sides does a rectangle have?", { shape: "rectangle" }, [3, 4, 5, 6], 4, "A rectangle has 4 sides - the longer sides face each other."),
  q("geometry", "multiple-choice", "challenge", "Which shape has exactly 5 sides?", {}, ["pentagon", "hexagon", "triangle", "square"], "pentagon", "A pentagon has 5 sides - 'penta' means five."),

  // ── FRACTION BAKERY ─────────────────────────────────────────
  q("fractions", "fraction-slice", "easy", "A cake is cut into 4 equal slices. 1 slice is eaten. What part is left?", { parts: 4, filled: 3, unit: "cake" }, ["1/4", "2/4", "3/4", "4/4"], "3/4", "3 slices out of 4 remain - that is three quarters, written 3/4."),
  q("fractions", "multiple-choice", "easy", "A pizza is cut into 8 equal slices. How many slices in a quarter of the pizza?", { parts: 8, unit: "pizza" }, [1, 2, 3, 4], 2, "8 slices split into 4 equal quarters = 2 slices in each quarter."),
  q("fractions", "fraction-slice", "medium", "A pie is cut into 6 equal parts. 2 parts are eaten. What part is left?", { parts: 6, filled: 4, unit: "pie" }, ["2/6", "3/6", "4/6", "6/4"], "4/6", "4 slices out of 6 are left - that is four sixths, written 4/6."),
  q("fractions", "fraction-slice", "medium", "A pizza is cut into 8 equal slices. 5 are eaten. What part is left?", { parts: 8, filled: 3, unit: "pizza" }, ["3/8", "5/8", "8/3", "1/8"], "3/8", "3 slices out of 8 are left - that is three eighths, written 3/8."),
  q("fractions", "fraction-slice", "challenge", "A chocolate bar has 4 equal pieces. What part is half the bar?", { parts: 4, unit: "chocolate" }, ["1/2", "1/4", "2/2", "3/4"], "1/2", "Half means 2 out of 4 pieces - written 1/2, which is the same as 2/4."),

  // ── TIME STATION ────────────────────────────────────────────
  q("time", "clock", "easy", "The hands point to 3 and 12. What time is it?", { hour: 3, minute: 0 }, ["3:00", "3:12", "12:03", "3:30"], "3:00", "At 3 o'clock the hour hand points to 3 and the minute hand points straight up to 12."),
  q("time", "multiple-choice", "easy", "The short hand points to 6 and the long hand points to 12.", { hour: 6, minute: 0 }, ["6:00", "12:00", "6:30", "12:06"], "6:00", "The minute hand on 12 means a full hour, so it is exactly 6 o'clock."),
  q("time", "clock", "medium", "The hands point to 7 and 30 minutes. What time is it?", { hour: 7, minute: 30 }, ["7:00", "7:30", "7:03", "6:30"], "7:30", "The long hand at 6 means 30 minutes, and the short hand is past 7 - that is half past seven."),
  q("time", "multiple-choice", "medium", "The big hand is on 12 and the little hand is on 9.", { hour: 9, minute: 0 }, ["9:00", "12:00", "9:12", "12:09"], "9:00", "Big hand on 12 plus little hand on 9 = exactly 9 o'clock."),
  q("time", "multiple-choice", "challenge", "Half an hour after 2:30, what time is it?", { hour: 2, minute: 30, after: true }, ["2:00", "3:00", "2:30", "3:30"], "3:00", "Half past two (2:30) plus another half hour jumps to three o'clock (3:00)."),

  // ── MONEY MARKET ────────────────────────────────────────────
  q("money", "multiple-choice", "easy", "Which coin is worth 5 rupees?", {}, ["₹1", "₹5", "₹10", "₹20"], "₹5", "The ₹5 coin has '5' written on it - it is worth five rupees."),
  q("money", "numerical", "easy", "A toffee costs ₹10 and an eraser costs ₹5. How much together?", { money: [10, 5] }, [12, 15, 20, 50], 15, "₹10 plus ₹5 = ₹15 for both things together."),
  q("money", "numerical", "medium", "A pencil costs ₹20 and a notebook costs ₹10.", { money: [20, 10] }, [20, 30, 35, 40], 30, "₹20 plus ₹10 = ₹30 - the pencil and notebook cost thirty rupees."),
  q("money", "story", "medium", "Amma has ₹50 and buys fruit for ₹30. How much money is left?", { money: [50, 30] }, [10, 15, 20, 25], 20, "₹50 take away ₹30 = ₹20 change is left in her purse."),
  q("money", "numerical", "challenge", "You have two ₹20 notes and one ₹10 note. How much money is that?", { money: [20, 20, 10] }, [40, 50, 60, 70], 50, "₹20 + ₹20 + ₹10 = ₹50 in all - two twenties make forty, plus ten makes fifty."),

  // ── MEASUREMENT WORKSHOP ────────────────────────────────────
  q("measurement", "numerical", "easy", "The pencil is 5 cm long. The crayon is 8 cm long. Which is LONGER?", {}, [5, 8], 8, "8 cm is greater than 5 cm, so the crayon is longer."),
  q("measurement", "multiple-choice", "easy", "This ribbon measures 7 on the ruler. How long is it?", { units: "cm" }, [5, 6, 7, 8], 7, "The ribbon ends at the 7 mark, so it is 7 cm long."),
  q("measurement", "numerical", "medium", "1 metre is equal to how many centimetres?", {}, [10, 50, 100, 1000], 100, "One metre is made of 100 smaller centimetres."),
  q("measurement", "numerical", "medium", "A jug holds 2 litres and a cup holds 1 litre. How much together?", { units: "litre" }, [2, 3, 4, 5], 3, "2 litres plus 1 litre = 3 litres in total."),
  q("measurement", "multiple-choice", "challenge", "Which object is the HEAVIEST: a 1 kg bag of rice, a 3 kg drum, or a 2 kg book?", {}, ["rice", "drum", "book"], "drum", "3 kg is the biggest mass, so the drum is heaviest."),

  // ── DATA DETECTIVE ZONE ─────────────────────────────────────
  q("data", "chart-build", "easy", "The class survey says: 4 friends love apples, 3 love bananas. Which fruit is the favourite?", { data: [{ label: "Apples", value: 4 }, { label: "Bananas", value: 3 }] }, ["apples", "bananas"], "apples", "Apples got 4 votes and bananas got 3 - apples have the taller bar, so they are the favourite."),
  q("data", "multiple-choice", "easy", "The chart shows 4 votes for apples. How many friends chose apples?", { data: [{ label: "Apples", value: 4 }, { label: "Bananas", value: 3 }] }, [3, 4, 5, 7], 4, "The apples bar reaches the 4 line, so 4 friends chose apples."),
  q("data", "chart-build", "medium", "The tally says: 5 kids like cricket, 2 like football. Which sport got fewer votes?", { data: [{ label: "Cricket", value: 5 }, { label: "Football", value: 2 }] }, ["cricket", "football"], "football", "Football got only 2 votes while cricket got 5 - football has the shorter bar."),
  q("data", "multiple-choice", "medium", "Votes are 7 for puzzles and 4 for painting. How many votes in total?", { data: [{ label: "Puzzles", value: 7 }, { label: "Painting", value: 4 }] }, [7, 9, 10, 11], 11, "7 votes plus 4 votes = 11 votes counted in the survey."),
  q("data", "chart-build", "challenge", "The detective board shows 6 red cars, 3 blue cars and 4 green cars. Which colour park line has exactly 3?", { data: [{ label: "Red", value: 6 }, { label: "Blue", value: 3 }, { label: "Green", value: 4 }] }, ["red", "blue", "green"], "blue", "The blue bar reaches exactly the 3 line - 3 blue cars parked."),
];

// ── SEED EXPORTS ──────────────────────────────────────────────────────────
const SEED_WORLDS = WORLD_ORDER.map((key, i) => ({
  ...SHO(key),
  order: i + 1,
  skills: SKILLS[key],
  intro: INTROS[key],
}));

const SEED_QUESTIONS = QUESTIONS;

async function seedMaths() {
  const worldCount = await MathWorld.countDocuments();
  if (worldCount === 0) await MathWorld.insertMany(SEED_WORLDS);
  const questionCount = await MathQuestion.countDocuments();
  if (questionCount === 0) await MathQuestion.insertMany(SEED_QUESTIONS);
  return {
    worlds: worldCount === 0 ? SEED_WORLDS.length : 0,
    questions: questionCount === 0 ? SEED_QUESTIONS.length : 0,
    skipped: worldCount > 0 && questionCount > 0,
  };
}

module.exports = { seedMaths, MATH_WORLD_THEMES, SEED_WORLDS, SEED_QUESTIONS };