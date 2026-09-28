// Mirrored from backend/seeders/seedMaths.js - the backend is the source of
// truth. This data powers the offline/demo fallback AND the theme-system art
// direction (themes map 1:1 to the backend MathWorld docs).

export const MATH_WORLD_THEMES = {
  "number-castle": {
    "name": "Number Castle",
    "nameEn": "Number Castle",
    "environment": "castle",
    "mood": "grand",
    "animation": "drift",
    "cardStyle": "castle",
    "accent": "#ffd27a",
    "palette": {
      "skyTop": "#3b2f63",
      "skyBottom": "#f2c27f",
      "ground": "#6b5a86",
      "accent": "#ffd27a",
      "cardBg": "#f3ecff",
      "cardAccent": "#7a5cf0"
    }
  },
  "addition": {
    "name": "Addition Valley",
    "nameEn": "Addition Valley",
    "environment": "valley",
    "mood": "cheerful",
    "animation": "drift",
    "cardStyle": "field",
    "accent": "#ffcf6b",
    "palette": {
      "skyTop": "#54b9a6",
      "skyBottom": "#dcf5c9",
      "ground": "#6f9e5b",
      "accent": "#ffcf6b",
      "cardBg": "#f2fbe2",
      "cardAccent": "#67a14f"
    }
  },
  "subtraction": {
    "name": "Subtraction Forest",
    "nameEn": "Subtraction Forest",
    "environment": "forest",
    "mood": "calm",
    "animation": "sway",
    "cardStyle": "forest",
    "accent": "#a7d8c8",
    "palette": {
      "skyTop": "#2f6f7a",
      "skyBottom": "#aee0df",
      "ground": "#4e6b57",
      "accent": "#a7d8c8",
      "cardBg": "#e9f7f2",
      "cardAccent": "#2f8f7a"
    }
  },
  "multiplication": {
    "name": "Multiplication City",
    "nameEn": "Multiplication City",
    "environment": "city",
    "mood": "bustling",
    "animation": "twinkle",
    "cardStyle": "tower",
    "accent": "#ffd166",
    "palette": {
      "skyTop": "#2b2b52",
      "skyBottom": "#8f7bd8",
      "ground": "#4a3f6b",
      "accent": "#ffd166",
      "cardBg": "#efeaff",
      "cardAccent": "#6a4fd0"
    }
  },
  "division": {
    "name": "Division Cave",
    "nameEn": "Division Cave",
    "environment": "cave",
    "mood": "warm",
    "animation": "glow",
    "cardStyle": "gem",
    "accent": "#ffb84d",
    "palette": {
      "skyTop": "#2a1e2e",
      "skyBottom": "#8a6a3f",
      "ground": "#5d4026",
      "accent": "#ffb84d",
      "cardBg": "#fbeedd",
      "cardAccent": "#b06f27"
    }
  },
  "geometry": {
    "name": "Geometry Island",
    "nameEn": "Geometry Island",
    "environment": "island",
    "mood": "sunny",
    "animation": "drift",
    "cardStyle": "hut",
    "accent": "#ffe08a",
    "palette": {
      "skyTop": "#2b7cd6",
      "skyBottom": "#aee8ff",
      "ground": "#d8b06a",
      "accent": "#ffe08a",
      "cardBg": "#e6f7ff",
      "cardAccent": "#1f8fd6"
    }
  },
  "fractions": {
    "name": "Fraction Bakery",
    "nameEn": "Fraction Bakery",
    "environment": "bakery",
    "mood": "warm",
    "animation": "twinkle",
    "cardStyle": "plate",
    "accent": "#ff8f70",
    "palette": {
      "skyTop": "#d98aa0",
      "skyBottom": "#ffe2cf",
      "ground": "#a86a52",
      "accent": "#ff8f70",
      "cardBg": "#fff0e4",
      "cardAccent": "#d96a4a"
    }
  },
  "time": {
    "name": "Time Station",
    "nameEn": "Time Station",
    "environment": "station",
    "mood": "steady",
    "animation": "sway",
    "cardStyle": "ticket",
    "accent": "#ffd166",
    "palette": {
      "skyTop": "#25406b",
      "skyBottom": "#9fc3e8",
      "ground": "#5a6b82",
      "accent": "#ffd166",
      "cardBg": "#eaf2fb",
      "cardAccent": "#3a7bb0"
    }
  },
  "money": {
    "name": "Money Market",
    "nameEn": "Money Market",
    "environment": "market",
    "mood": "busy",
    "animation": "glow",
    "cardStyle": "coin",
    "accent": "#fff0a6",
    "palette": {
      "skyTop": "#e07b39",
      "skyBottom": "#ffe9c2",
      "ground": "#b8763f",
      "accent": "#fff0a6",
      "cardBg": "#fff6e0",
      "cardAccent": "#c9792a"
    }
  },
  "measurement": {
    "name": "Measurement Workshop",
    "nameEn": "Measurement Workshop",
    "environment": "workshop",
    "mood": "focused",
    "animation": "sway",
    "cardStyle": "ruler",
    "accent": "#ffc66b",
    "palette": {
      "skyTop": "#4a70a0",
      "skyBottom": "#cfe3f5",
      "ground": "#8a6a4a",
      "accent": "#ffc66b",
      "cardBg": "#f2f7fb",
      "cardAccent": "#4a78b0"
    }
  },
  "data": {
    "name": "Data Detective Zone",
    "nameEn": "Data Detective Zone",
    "environment": "detective",
    "mood": "curious",
    "animation": "twinkle",
    "cardStyle": "notepad",
    "accent": "#7fd8d8",
    "palette": {
      "skyTop": "#16223a",
      "skyBottom": "#46709c",
      "ground": "#2f4058",
      "accent": "#7fd8d8",
      "cardBg": "#eaf2f7",
      "cardAccent": "#2e7c9c"
    }
  }
};

export const WORLD_ORDER = [
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
  "data"
];

export const SKILLS = {
  "number-castle": [
    "place value",
    "comparison",
    "odd/even",
    "ordering"
  ],
  "addition": [
    "joining two groups",
    "finding the total",
    "simple sums"
  ],
  "subtraction": [
    "taking away",
    "finding what is left",
    "difference"
  ],
  "multiplication": [
    "equal-sized groups",
    "repeated addition",
    "times tables"
  ],
  "division": [
    "sharing into equal piles",
    "grouping",
    "fair shares"
  ],
  "geometry": [
    "shapes",
    "sides and corners",
    "recognising shapes"
  ],
  "fractions": [
    "equal parts",
    "numerator and denominator",
    "halves and quarters"
  ],
  "time": [
    "reading a clock",
    "hours and minutes",
    "intervals of time"
  ],
  "money": [
    "using the rupee",
    "add and subtract money",
    "making change"
  ],
  "measurement": [
    "length",
    "capacity",
    "mass"
  ],
  "data": [
    "reading a survey",
    "building a bar chart",
    "which has more/fewer"
  ]
};

export const INTROS = {
  "number-castle": "Enter the tall towers of the Number Castle and meet the digits who live here. Line them up, compare them, and sort even from odd.",
  "addition": "Rolling green fields full of fruit trees and friendly animals. Bring two baskets of apples together and count the rainbow total.",
  "subtraction": "A quiet forest where birds and leaves slowly drift away. Start with a full tree and count how many stay behind.",
  "multiplication": "Rows of bright shops, each with the same number of windows. Add equal-sized groups again and again - that is multiplication!",
  "division": "Deep golden caves full of treasure. Share the gems fairly into equal piles until every pile is the same.",
  "geometry": "A sunny island with round huts and tall bridges. Meet triangles, squares, circles and hexagons hiding in everything around you.",
  "fractions": "The warmest kitchen in town, with cakes and pizzas fresh from the oven. Slice them into equal parts and share them fairly.",
  "time": "A busy station where the big clock sits above the platform. Watch the hands turn and read the time before the next train arrives.",
  "money": "A lively market stall with shiny coins and crisp notes. Count the rupees, add the price, and make friendly change.",
  "measurement": "A neat workshop with rulers, scales and measuring jugs. How long, how heavy, how much - measure everything in sight.",
  "data": "A detective's board full of wall charts and tallies. Ask a survey, count the answers, and turn them into a bar chart."
};

export const SEED_WORLDS = [
  {
    "id": "number-castle",
    "name": "Number Castle",
    "nameEn": "Number Castle",
    "accent": "#ffd27a",
    "environment": "castle",
    "theme": {
      "name": "Number Castle",
      "nameEn": "Number Castle",
      "environment": "castle",
      "mood": "grand",
      "animation": "drift",
      "cardStyle": "castle",
      "accent": "#ffd27a",
      "palette": {
        "skyTop": "#3b2f63",
        "skyBottom": "#f2c27f",
        "ground": "#6b5a86",
        "accent": "#ffd27a",
        "cardBg": "#f3ecff",
        "cardAccent": "#7a5cf0"
      }
    },
    "order": 1,
    "skills": [
      "place value",
      "comparison",
      "odd/even",
      "ordering"
    ],
    "intro": "Enter the tall towers of the Number Castle and meet the digits who live here. Line them up, compare them, and sort even from odd."
  },
  {
    "id": "addition",
    "name": "Addition Valley",
    "nameEn": "Addition Valley",
    "accent": "#ffcf6b",
    "environment": "valley",
    "theme": {
      "name": "Addition Valley",
      "nameEn": "Addition Valley",
      "environment": "valley",
      "mood": "cheerful",
      "animation": "drift",
      "cardStyle": "field",
      "accent": "#ffcf6b",
      "palette": {
        "skyTop": "#54b9a6",
        "skyBottom": "#dcf5c9",
        "ground": "#6f9e5b",
        "accent": "#ffcf6b",
        "cardBg": "#f2fbe2",
        "cardAccent": "#67a14f"
      }
    },
    "order": 2,
    "skills": [
      "joining two groups",
      "finding the total",
      "simple sums"
    ],
    "intro": "Rolling green fields full of fruit trees and friendly animals. Bring two baskets of apples together and count the rainbow total."
  },
  {
    "id": "subtraction",
    "name": "Subtraction Forest",
    "nameEn": "Subtraction Forest",
    "accent": "#a7d8c8",
    "environment": "forest",
    "theme": {
      "name": "Subtraction Forest",
      "nameEn": "Subtraction Forest",
      "environment": "forest",
      "mood": "calm",
      "animation": "sway",
      "cardStyle": "forest",
      "accent": "#a7d8c8",
      "palette": {
        "skyTop": "#2f6f7a",
        "skyBottom": "#aee0df",
        "ground": "#4e6b57",
        "accent": "#a7d8c8",
        "cardBg": "#e9f7f2",
        "cardAccent": "#2f8f7a"
      }
    },
    "order": 3,
    "skills": [
      "taking away",
      "finding what is left",
      "difference"
    ],
    "intro": "A quiet forest where birds and leaves slowly drift away. Start with a full tree and count how many stay behind."
  },
  {
    "id": "multiplication",
    "name": "Multiplication City",
    "nameEn": "Multiplication City",
    "accent": "#ffd166",
    "environment": "city",
    "theme": {
      "name": "Multiplication City",
      "nameEn": "Multiplication City",
      "environment": "city",
      "mood": "bustling",
      "animation": "twinkle",
      "cardStyle": "tower",
      "accent": "#ffd166",
      "palette": {
        "skyTop": "#2b2b52",
        "skyBottom": "#8f7bd8",
        "ground": "#4a3f6b",
        "accent": "#ffd166",
        "cardBg": "#efeaff",
        "cardAccent": "#6a4fd0"
      }
    },
    "order": 4,
    "skills": [
      "equal-sized groups",
      "repeated addition",
      "times tables"
    ],
    "intro": "Rows of bright shops, each with the same number of windows. Add equal-sized groups again and again - that is multiplication!"
  },
  {
    "id": "division",
    "name": "Division Cave",
    "nameEn": "Division Cave",
    "accent": "#ffb84d",
    "environment": "cave",
    "theme": {
      "name": "Division Cave",
      "nameEn": "Division Cave",
      "environment": "cave",
      "mood": "warm",
      "animation": "glow",
      "cardStyle": "gem",
      "accent": "#ffb84d",
      "palette": {
        "skyTop": "#2a1e2e",
        "skyBottom": "#8a6a3f",
        "ground": "#5d4026",
        "accent": "#ffb84d",
        "cardBg": "#fbeedd",
        "cardAccent": "#b06f27"
      }
    },
    "order": 5,
    "skills": [
      "sharing into equal piles",
      "grouping",
      "fair shares"
    ],
    "intro": "Deep golden caves full of treasure. Share the gems fairly into equal piles until every pile is the same."
  },
  {
    "id": "geometry",
    "name": "Geometry Island",
    "nameEn": "Geometry Island",
    "accent": "#ffe08a",
    "environment": "island",
    "theme": {
      "name": "Geometry Island",
      "nameEn": "Geometry Island",
      "environment": "island",
      "mood": "sunny",
      "animation": "drift",
      "cardStyle": "hut",
      "accent": "#ffe08a",
      "palette": {
        "skyTop": "#2b7cd6",
        "skyBottom": "#aee8ff",
        "ground": "#d8b06a",
        "accent": "#ffe08a",
        "cardBg": "#e6f7ff",
        "cardAccent": "#1f8fd6"
      }
    },
    "order": 6,
    "skills": [
      "shapes",
      "sides and corners",
      "recognising shapes"
    ],
    "intro": "A sunny island with round huts and tall bridges. Meet triangles, squares, circles and hexagons hiding in everything around you."
  },
  {
    "id": "fractions",
    "name": "Fraction Bakery",
    "nameEn": "Fraction Bakery",
    "accent": "#ff8f70",
    "environment": "bakery",
    "theme": {
      "name": "Fraction Bakery",
      "nameEn": "Fraction Bakery",
      "environment": "bakery",
      "mood": "warm",
      "animation": "twinkle",
      "cardStyle": "plate",
      "accent": "#ff8f70",
      "palette": {
        "skyTop": "#d98aa0",
        "skyBottom": "#ffe2cf",
        "ground": "#a86a52",
        "accent": "#ff8f70",
        "cardBg": "#fff0e4",
        "cardAccent": "#d96a4a"
      }
    },
    "order": 7,
    "skills": [
      "equal parts",
      "numerator and denominator",
      "halves and quarters"
    ],
    "intro": "The warmest kitchen in town, with cakes and pizzas fresh from the oven. Slice them into equal parts and share them fairly."
  },
  {
    "id": "time",
    "name": "Time Station",
    "nameEn": "Time Station",
    "accent": "#ffd166",
    "environment": "station",
    "theme": {
      "name": "Time Station",
      "nameEn": "Time Station",
      "environment": "station",
      "mood": "steady",
      "animation": "sway",
      "cardStyle": "ticket",
      "accent": "#ffd166",
      "palette": {
        "skyTop": "#25406b",
        "skyBottom": "#9fc3e8",
        "ground": "#5a6b82",
        "accent": "#ffd166",
        "cardBg": "#eaf2fb",
        "cardAccent": "#3a7bb0"
      }
    },
    "order": 8,
    "skills": [
      "reading a clock",
      "hours and minutes",
      "intervals of time"
    ],
    "intro": "A busy station where the big clock sits above the platform. Watch the hands turn and read the time before the next train arrives."
  },
  {
    "id": "money",
    "name": "Money Market",
    "nameEn": "Money Market",
    "accent": "#fff0a6",
    "environment": "market",
    "theme": {
      "name": "Money Market",
      "nameEn": "Money Market",
      "environment": "market",
      "mood": "busy",
      "animation": "glow",
      "cardStyle": "coin",
      "accent": "#fff0a6",
      "palette": {
        "skyTop": "#e07b39",
        "skyBottom": "#ffe9c2",
        "ground": "#b8763f",
        "accent": "#fff0a6",
        "cardBg": "#fff6e0",
        "cardAccent": "#c9792a"
      }
    },
    "order": 9,
    "skills": [
      "using the rupee",
      "add and subtract money",
      "making change"
    ],
    "intro": "A lively market stall with shiny coins and crisp notes. Count the rupees, add the price, and make friendly change."
  },
  {
    "id": "measurement",
    "name": "Measurement Workshop",
    "nameEn": "Measurement Workshop",
    "accent": "#ffc66b",
    "environment": "workshop",
    "theme": {
      "name": "Measurement Workshop",
      "nameEn": "Measurement Workshop",
      "environment": "workshop",
      "mood": "focused",
      "animation": "sway",
      "cardStyle": "ruler",
      "accent": "#ffc66b",
      "palette": {
        "skyTop": "#4a70a0",
        "skyBottom": "#cfe3f5",
        "ground": "#8a6a4a",
        "accent": "#ffc66b",
        "cardBg": "#f2f7fb",
        "cardAccent": "#4a78b0"
      }
    },
    "order": 10,
    "skills": [
      "length",
      "capacity",
      "mass"
    ],
    "intro": "A neat workshop with rulers, scales and measuring jugs. How long, how heavy, how much - measure everything in sight."
  },
  {
    "id": "data",
    "name": "Data Detective Zone",
    "nameEn": "Data Detective Zone",
    "accent": "#7fd8d8",
    "environment": "detective",
    "theme": {
      "name": "Data Detective Zone",
      "nameEn": "Data Detective Zone",
      "environment": "detective",
      "mood": "curious",
      "animation": "twinkle",
      "cardStyle": "notepad",
      "accent": "#7fd8d8",
      "palette": {
        "skyTop": "#16223a",
        "skyBottom": "#46709c",
        "ground": "#2f4058",
        "accent": "#7fd8d8",
        "cardBg": "#eaf2f7",
        "cardAccent": "#2e7c9c"
      }
    },
    "order": 11,
    "skills": [
      "reading a survey",
      "building a bar chart",
      "which has more/fewer"
    ],
    "intro": "A detective's board full of wall charts and tallies. Ask a survey, count the answers, and turn them into a bar chart."
  }
];

export const SEED_QUESTIONS = [
  {
    "id": 101,
    "topic": "number-castle",
    "type": "numerical",
    "difficulty": "easy",
    "question": "Which digit is in the TENS place of 46?",
    "objects": {
      "number": 46,
      "place": "tens"
    },
    "options": [
      4,
      6,
      40
    ],
    "answer": 4,
    "explanation": "In 46, the 4 sits in the tens place - it means four tens (40)."
  },
  {
    "id": 102,
    "topic": "number-castle",
    "type": "multiple-choice",
    "difficulty": "easy",
    "question": "Which number is the greatest?",
    "objects": {
      "numbers": [
        23,
        32,
        19
      ]
    },
    "options": [
      23,
      32,
      19
    ],
    "answer": 32,
    "explanation": "32 has 3 tens, and 23 has only 2 tens - so 32 is the greatest of the three."
  },
  {
    "id": 103,
    "topic": "number-castle",
    "type": "numerical",
    "difficulty": "medium",
    "question": "What number is 5 tens and 3 ones?",
    "objects": {
      "tens": 5,
      "ones": 3
    },
    "options": [
      53,
      35,
      8,
      503
    ],
    "answer": 53,
    "explanation": "5 tens make 50, then add 3 ones - that is 53."
  },
  {
    "id": 104,
    "topic": "number-castle",
    "type": "multiple-choice",
    "difficulty": "medium",
    "question": "Which of these numbers is ODD?",
    "objects": {
      "numbers": [
        12,
        17,
        20,
        8
      ]
    },
    "options": [
      12,
      17,
      20,
      8
    ],
    "answer": 17,
    "explanation": "Odd numbers end in 1, 3, 5, 7 or 9. 17 ends in 7, so it is odd."
  },
  {
    "id": 105,
    "topic": "number-castle",
    "type": "multiple-choice",
    "difficulty": "challenge",
    "question": "Put 19, 31 and 27 in order from smallest. Which number comes in the MIDDLE?",
    "objects": {
      "numbers": [
        19,
        31,
        27
      ]
    },
    "options": [
      19,
      27,
      31
    ],
    "answer": 27,
    "explanation": "Smallest to biggest: 19, 27, 31. The middle number is 27."
  },
  {
    "id": 106,
    "topic": "addition",
    "type": "visual",
    "difficulty": "easy",
    "question": "4 apples sit in a basket, then 3 more apples arrive.",
    "objects": {
      "firstGroup": 4,
      "secondGroup": 3,
      "object": "apple"
    },
    "options": [
      5,
      6,
      7,
      9
    ],
    "answer": 7,
    "explanation": "4 apples plus 3 more apples = 7 apples in the basket."
  },
  {
    "id": 107,
    "topic": "addition",
    "type": "visual",
    "difficulty": "easy",
    "question": "2 birds sit on a tree, then 5 more birds join them.",
    "objects": {
      "firstGroup": 2,
      "secondGroup": 5,
      "object": "bird"
    },
    "options": [
      5,
      7,
      8,
      6
    ],
    "answer": 7,
    "explanation": "2 birds plus 5 birds = 7 birds on the tree."
  },
  {
    "id": 108,
    "topic": "addition",
    "type": "story",
    "difficulty": "medium",
    "question": "Ravi picks 6 mangoes. His sister gives him 4 more mangoes.",
    "objects": {
      "firstGroup": 6,
      "secondGroup": 4,
      "object": "mango"
    },
    "options": [
      9,
      10,
      11,
      12
    ],
    "answer": 10,
    "explanation": "6 mangoes plus 4 mangoes = 10 mangoes in all."
  },
  {
    "id": 109,
    "topic": "addition",
    "type": "visual",
    "difficulty": "medium",
    "question": "7 yellow flowers bloom, then 5 red flowers blossom too.",
    "objects": {
      "firstGroup": 7,
      "secondGroup": 5,
      "object": "flower"
    },
    "options": [
      11,
      12,
      13,
      14
    ],
    "answer": 12,
    "explanation": "7 flowers plus 5 flowers = 12 flowers in the garden."
  },
  {
    "id": 110,
    "topic": "addition",
    "type": "story",
    "difficulty": "challenge",
    "question": "A baker makes 9 buns in the morning and 9 more buns in the evening.",
    "objects": {
      "firstGroup": 9,
      "secondGroup": 9,
      "object": "bun"
    },
    "options": [
      16,
      18,
      19,
      20
    ],
    "answer": 18,
    "explanation": "9 buns plus 9 buns = 18 buns. Double 9 is 18."
  },
  {
    "id": 111,
    "topic": "subtraction",
    "type": "visual",
    "difficulty": "easy",
    "question": "5 birds perch on a branch, then 2 fly away.",
    "objects": {
      "firstGroup": 5,
      "takeAway": 2,
      "object": "bird"
    },
    "options": [
      2,
      3,
      4,
      5
    ],
    "answer": 3,
    "explanation": "5 birds take away 2 birds = 3 birds stay behind."
  },
  {
    "id": 112,
    "topic": "subtraction",
    "type": "visual",
    "difficulty": "easy",
    "question": "6 leaves hang on a twig, then 1 leaf drifts down.",
    "objects": {
      "firstGroup": 6,
      "takeAway": 1,
      "object": "leaf"
    },
    "options": [
      4,
      5,
      6,
      7
    ],
    "answer": 5,
    "explanation": "6 leaves take away 1 leaf = 5 leaves still hang on the twig."
  },
  {
    "id": 113,
    "topic": "subtraction",
    "type": "fill-blank",
    "difficulty": "medium",
    "question": "8 balloons float up, then 3 balloons pop. How many are left?",
    "objects": {
      "firstGroup": 8,
      "takeAway": 3,
      "object": "balloon"
    },
    "options": [
      3,
      5,
      6,
      8
    ],
    "answer": 5,
    "explanation": "8 balloons take away 3 balloons = 5 balloons are left."
  },
  {
    "id": 114,
    "topic": "subtraction",
    "type": "visual",
    "difficulty": "medium",
    "question": "10 dragonflies buzz around, then 4 fly off to the pond.",
    "objects": {
      "firstGroup": 10,
      "takeAway": 4,
      "object": "dragonfly"
    },
    "options": [
      4,
      6,
      7,
      8
    ],
    "answer": 6,
    "explanation": "10 dragonflies take away 4 dragonflies = 6 dragonflies remain."
  },
  {
    "id": 115,
    "topic": "subtraction",
    "type": "story",
    "difficulty": "challenge",
    "question": "A hen has 12 eggs in her nest. 7 eggs hatch. How many eggs are left?",
    "objects": {
      "firstGroup": 12,
      "takeAway": 7,
      "object": "egg"
    },
    "options": [
      4,
      5,
      6,
      7
    ],
    "answer": 5,
    "explanation": "12 eggs take away 7 hatched eggs = 5 eggs are left in the nest."
  },
  {
    "id": 116,
    "topic": "multiplication",
    "type": "drag",
    "difficulty": "easy",
    "question": "3 crates hold 2 apples each. How many apples in all?",
    "objects": {
      "groups": 3,
      "perGroup": 2,
      "item": "apple"
    },
    "options": [
      5,
      6,
      7,
      8
    ],
    "answer": 6,
    "explanation": "3 groups of 2 apples = 2 + 2 + 2 = 6 apples."
  },
  {
    "id": 117,
    "topic": "multiplication",
    "type": "multiple-choice",
    "difficulty": "easy",
    "question": "A bakery has 2 trays with 5 buns on each tray.",
    "objects": {
      "groups": 2,
      "perGroup": 5,
      "item": "bun"
    },
    "options": [
      7,
      10,
      12,
      15
    ],
    "answer": 10,
    "explanation": "2 groups of 5 buns = 10 buns in all."
  },
  {
    "id": 118,
    "topic": "multiplication",
    "type": "drag",
    "difficulty": "medium",
    "question": "4 flower pots each hold 3 marigolds.",
    "objects": {
      "groups": 4,
      "perGroup": 3,
      "item": "flower"
    },
    "options": [
      10,
      11,
      12,
      13
    ],
    "answer": 12,
    "explanation": "4 groups of 3 flowers = 3 + 3 + 3 + 3 = 12 marigolds."
  },
  {
    "id": 119,
    "topic": "multiplication",
    "type": "multiple-choice",
    "difficulty": "medium",
    "question": "5 windows in a row, and 4 rows of windows. How many windows on the tower?",
    "objects": {
      "groups": 5,
      "perGroup": 4,
      "item": "window"
    },
    "options": [
      16,
      18,
      20,
      24
    ],
    "answer": 20,
    "explanation": "5 groups of 4 windows = 20 windows on the tower."
  },
  {
    "id": 120,
    "topic": "multiplication",
    "type": "multiple-choice",
    "difficulty": "challenge",
    "question": "A shop keeps 6 jars on each of 3 shelves.",
    "objects": {
      "groups": 6,
      "perGroup": 3,
      "item": "jar"
    },
    "options": [
      15,
      18,
      21,
      24
    ],
    "answer": 18,
    "explanation": "6 groups of 3 jars = 6 + 6 + 6 = 18 jars."
  },
  {
    "id": 121,
    "topic": "division",
    "type": "drag",
    "difficulty": "easy",
    "question": "6 coins are shared fairly between 2 treasure chests.",
    "objects": {
      "total": 6,
      "groups": 2,
      "item": "coin"
    },
    "options": [
      2,
      3,
      4,
      6
    ],
    "answer": 3,
    "explanation": "6 coins split into 2 equal piles = 3 coins in each chest."
  },
  {
    "id": 122,
    "topic": "division",
    "type": "multiple-choice",
    "difficulty": "easy",
    "question": "4 red gems are shared equally between 2 baskets.",
    "objects": {
      "total": 4,
      "groups": 2,
      "item": "gem"
    },
    "options": [
      1,
      2,
      3,
      4
    ],
    "answer": 2,
    "explanation": "4 gems split into 2 piles = 2 gems in each basket."
  },
  {
    "id": 123,
    "topic": "division",
    "type": "drag",
    "difficulty": "medium",
    "question": "12 gold rings are packed into 3 equal boxes.",
    "objects": {
      "total": 12,
      "groups": 3,
      "item": "ring"
    },
    "options": [
      3,
      4,
      5,
      6
    ],
    "answer": 4,
    "explanation": "12 rings split into 3 boxes = 4 rings in each box."
  },
  {
    "id": 124,
    "topic": "division",
    "type": "multiple-choice",
    "difficulty": "medium",
    "question": "10 pearls are shared fairly among 2 necklaces.",
    "objects": {
      "total": 10,
      "groups": 2,
      "item": "pearl"
    },
    "options": [
      3,
      4,
      5,
      6
    ],
    "answer": 5,
    "explanation": "10 pearls split into 2 piles = 5 pearls in each."
  },
  {
    "id": 125,
    "topic": "division",
    "type": "visual",
    "difficulty": "challenge",
    "question": "15 silver coins are shared equally between 3 treasure piles.",
    "objects": {
      "total": 15,
      "groups": 3,
      "item": "coin"
    },
    "options": [
      3,
      4,
      5,
      6
    ],
    "answer": 5,
    "explanation": "15 coins split into 3 equal piles = 5 coins in each pile."
  },
  {
    "id": 126,
    "topic": "geometry",
    "type": "shape-touch",
    "difficulty": "easy",
    "question": "A triangle has how many sides?",
    "objects": {
      "shape": "triangle"
    },
    "options": [
      2,
      3,
      4,
      5
    ],
    "answer": 3,
    "explanation": "A triangle always has exactly 3 straight sides."
  },
  {
    "id": 127,
    "topic": "geometry",
    "type": "multiple-choice",
    "difficulty": "easy",
    "question": "How many corners does a square have?",
    "objects": {
      "shape": "square"
    },
    "options": [
      2,
      3,
      4,
      5
    ],
    "answer": 4,
    "explanation": "A square has 4 equal sides and 4 square corners."
  },
  {
    "id": 128,
    "topic": "geometry",
    "type": "shape-touch",
    "difficulty": "medium",
    "question": "A hexagon has how many sides?",
    "objects": {
      "shape": "hexagon"
    },
    "options": [
      4,
      5,
      6,
      8
    ],
    "answer": 6,
    "explanation": "A hexagon has 6 straight sides - 'hexa' means six."
  },
  {
    "id": 129,
    "topic": "geometry",
    "type": "multiple-choice",
    "difficulty": "medium",
    "question": "How many sides does a rectangle have?",
    "objects": {
      "shape": "rectangle"
    },
    "options": [
      3,
      4,
      5,
      6
    ],
    "answer": 4,
    "explanation": "A rectangle has 4 sides - the longer sides face each other."
  },
  {
    "id": 130,
    "topic": "geometry",
    "type": "multiple-choice",
    "difficulty": "challenge",
    "question": "Which shape has exactly 5 sides?",
    "objects": {},
    "options": [
      "pentagon",
      "hexagon",
      "triangle",
      "square"
    ],
    "answer": "pentagon",
    "explanation": "A pentagon has 5 sides - 'penta' means five."
  },
  {
    "id": 131,
    "topic": "fractions",
    "type": "fraction-slice",
    "difficulty": "easy",
    "question": "A cake is cut into 4 equal slices. 1 slice is eaten. What part is left?",
    "objects": {
      "parts": 4,
      "filled": 3,
      "unit": "cake"
    },
    "options": [
      "1/4",
      "2/4",
      "3/4",
      "4/4"
    ],
    "answer": "3/4",
    "explanation": "3 slices out of 4 remain - that is three quarters, written 3/4."
  },
  {
    "id": 132,
    "topic": "fractions",
    "type": "multiple-choice",
    "difficulty": "easy",
    "question": "A pizza is cut into 8 equal slices. How many slices in a quarter of the pizza?",
    "objects": {
      "parts": 8,
      "unit": "pizza"
    },
    "options": [
      1,
      2,
      3,
      4
    ],
    "answer": 2,
    "explanation": "8 slices split into 4 equal quarters = 2 slices in each quarter."
  },
  {
    "id": 133,
    "topic": "fractions",
    "type": "fraction-slice",
    "difficulty": "medium",
    "question": "A pie is cut into 6 equal parts. 2 parts are eaten. What part is left?",
    "objects": {
      "parts": 6,
      "filled": 4,
      "unit": "pie"
    },
    "options": [
      "2/6",
      "3/6",
      "4/6",
      "6/4"
    ],
    "answer": "4/6",
    "explanation": "4 slices out of 6 are left - that is four sixths, written 4/6."
  },
  {
    "id": 134,
    "topic": "fractions",
    "type": "fraction-slice",
    "difficulty": "medium",
    "question": "A pizza is cut into 8 equal slices. 5 are eaten. What part is left?",
    "objects": {
      "parts": 8,
      "filled": 3,
      "unit": "pizza"
    },
    "options": [
      "3/8",
      "5/8",
      "8/3",
      "1/8"
    ],
    "answer": "3/8",
    "explanation": "3 slices out of 8 are left - that is three eighths, written 3/8."
  },
  {
    "id": 135,
    "topic": "fractions",
    "type": "fraction-slice",
    "difficulty": "challenge",
    "question": "A chocolate bar has 4 equal pieces. What part is half the bar?",
    "objects": {
      "parts": 4,
      "unit": "chocolate"
    },
    "options": [
      "1/2",
      "1/4",
      "2/2",
      "3/4"
    ],
    "answer": "1/2",
    "explanation": "Half means 2 out of 4 pieces - written 1/2, which is the same as 2/4."
  },
  {
    "id": 136,
    "topic": "time",
    "type": "clock",
    "difficulty": "easy",
    "question": "The hands point to 3 and 12. What time is it?",
    "objects": {
      "hour": 3,
      "minute": 0
    },
    "options": [
      "3:00",
      "3:12",
      "12:03",
      "3:30"
    ],
    "answer": "3:00",
    "explanation": "At 3 o'clock the hour hand points to 3 and the minute hand points straight up to 12."
  },
  {
    "id": 137,
    "topic": "time",
    "type": "multiple-choice",
    "difficulty": "easy",
    "question": "The short hand points to 6 and the long hand points to 12.",
    "objects": {
      "hour": 6,
      "minute": 0
    },
    "options": [
      "6:00",
      "12:00",
      "6:30",
      "12:06"
    ],
    "answer": "6:00",
    "explanation": "The minute hand on 12 means a full hour, so it is exactly 6 o'clock."
  },
  {
    "id": 138,
    "topic": "time",
    "type": "clock",
    "difficulty": "medium",
    "question": "The hands point to 7 and 30 minutes. What time is it?",
    "objects": {
      "hour": 7,
      "minute": 30
    },
    "options": [
      "7:00",
      "7:30",
      "7:03",
      "6:30"
    ],
    "answer": "7:30",
    "explanation": "The long hand at 6 means 30 minutes, and the short hand is past 7 - that is half past seven."
  },
  {
    "id": 139,
    "topic": "time",
    "type": "multiple-choice",
    "difficulty": "medium",
    "question": "The big hand is on 12 and the little hand is on 9.",
    "objects": {
      "hour": 9,
      "minute": 0
    },
    "options": [
      "9:00",
      "12:00",
      "9:12",
      "12:09"
    ],
    "answer": "9:00",
    "explanation": "Big hand on 12 plus little hand on 9 = exactly 9 o'clock."
  },
  {
    "id": 140,
    "topic": "time",
    "type": "multiple-choice",
    "difficulty": "challenge",
    "question": "Half an hour after 2:30, what time is it?",
    "objects": {
      "hour": 2,
      "minute": 30,
      "after": true
    },
    "options": [
      "2:00",
      "3:00",
      "2:30",
      "3:30"
    ],
    "answer": "3:00",
    "explanation": "Half past two (2:30) plus another half hour jumps to three o'clock (3:00)."
  },
  {
    "id": 141,
    "topic": "money",
    "type": "multiple-choice",
    "difficulty": "easy",
    "question": "Which coin is worth 5 rupees?",
    "objects": {},
    "options": [
      "₹1",
      "₹5",
      "₹10",
      "₹20"
    ],
    "answer": "₹5",
    "explanation": "The ₹5 coin has '5' written on it - it is worth five rupees."
  },
  {
    "id": 142,
    "topic": "money",
    "type": "numerical",
    "difficulty": "easy",
    "question": "A toffee costs ₹10 and an eraser costs ₹5. How much together?",
    "objects": {
      "money": [
        10,
        5
      ]
    },
    "options": [
      12,
      15,
      20,
      50
    ],
    "answer": 15,
    "explanation": "₹10 plus ₹5 = ₹15 for both things together."
  },
  {
    "id": 143,
    "topic": "money",
    "type": "numerical",
    "difficulty": "medium",
    "question": "A pencil costs ₹20 and a notebook costs ₹10.",
    "objects": {
      "money": [
        20,
        10
      ]
    },
    "options": [
      20,
      30,
      35,
      40
    ],
    "answer": 30,
    "explanation": "₹20 plus ₹10 = ₹30 - the pencil and notebook cost thirty rupees."
  },
  {
    "id": 144,
    "topic": "money",
    "type": "story",
    "difficulty": "medium",
    "question": "Amma has ₹50 and buys fruit for ₹30. How much money is left?",
    "objects": {
      "money": [
        50,
        30
      ]
    },
    "options": [
      10,
      15,
      20,
      25
    ],
    "answer": 20,
    "explanation": "₹50 take away ₹30 = ₹20 change is left in her purse."
  },
  {
    "id": 145,
    "topic": "money",
    "type": "numerical",
    "difficulty": "challenge",
    "question": "You have two ₹20 notes and one ₹10 note. How much money is that?",
    "objects": {
      "money": [
        20,
        20,
        10
      ]
    },
    "options": [
      40,
      50,
      60,
      70
    ],
    "answer": 50,
    "explanation": "₹20 + ₹20 + ₹10 = ₹50 in all - two twenties make forty, plus ten makes fifty."
  },
  {
    "id": 146,
    "topic": "measurement",
    "type": "numerical",
    "difficulty": "easy",
    "question": "The pencil is 5 cm long. The crayon is 8 cm long. Which is LONGER?",
    "objects": {},
    "options": [
      5,
      8
    ],
    "answer": 8,
    "explanation": "8 cm is greater than 5 cm, so the crayon is longer."
  },
  {
    "id": 147,
    "topic": "measurement",
    "type": "multiple-choice",
    "difficulty": "easy",
    "question": "This ribbon measures 7 on the ruler. How long is it?",
    "objects": {
      "units": "cm"
    },
    "options": [
      5,
      6,
      7,
      8
    ],
    "answer": 7,
    "explanation": "The ribbon ends at the 7 mark, so it is 7 cm long."
  },
  {
    "id": 148,
    "topic": "measurement",
    "type": "numerical",
    "difficulty": "medium",
    "question": "1 metre is equal to how many centimetres?",
    "objects": {},
    "options": [
      10,
      50,
      100,
      1000
    ],
    "answer": 100,
    "explanation": "One metre is made of 100 smaller centimetres."
  },
  {
    "id": 149,
    "topic": "measurement",
    "type": "numerical",
    "difficulty": "medium",
    "question": "A jug holds 2 litres and a cup holds 1 litre. How much together?",
    "objects": {
      "units": "litre"
    },
    "options": [
      2,
      3,
      4,
      5
    ],
    "answer": 3,
    "explanation": "2 litres plus 1 litre = 3 litres in total."
  },
  {
    "id": 150,
    "topic": "measurement",
    "type": "multiple-choice",
    "difficulty": "challenge",
    "question": "Which object is the HEAVIEST: a 1 kg bag of rice, a 3 kg drum, or a 2 kg book?",
    "objects": {},
    "options": [
      "rice",
      "drum",
      "book"
    ],
    "answer": "drum",
    "explanation": "3 kg is the biggest mass, so the drum is heaviest."
  },
  {
    "id": 151,
    "topic": "data",
    "type": "chart-build",
    "difficulty": "easy",
    "question": "The class survey says: 4 friends love apples, 3 love bananas. Which fruit is the favourite?",
    "objects": {
      "data": [
        {
          "label": "Apples",
          "value": 4
        },
        {
          "label": "Bananas",
          "value": 3
        }
      ]
    },
    "options": [
      "apples",
      "bananas"
    ],
    "answer": "apples",
    "explanation": "Apples got 4 votes and bananas got 3 - apples have the taller bar, so they are the favourite."
  },
  {
    "id": 152,
    "topic": "data",
    "type": "multiple-choice",
    "difficulty": "easy",
    "question": "The chart shows 4 votes for apples. How many friends chose apples?",
    "objects": {
      "data": [
        {
          "label": "Apples",
          "value": 4
        },
        {
          "label": "Bananas",
          "value": 3
        }
      ]
    },
    "options": [
      3,
      4,
      5,
      7
    ],
    "answer": 4,
    "explanation": "The apples bar reaches the 4 line, so 4 friends chose apples."
  },
  {
    "id": 153,
    "topic": "data",
    "type": "chart-build",
    "difficulty": "medium",
    "question": "The tally says: 5 kids like cricket, 2 like football. Which sport got fewer votes?",
    "objects": {
      "data": [
        {
          "label": "Cricket",
          "value": 5
        },
        {
          "label": "Football",
          "value": 2
        }
      ]
    },
    "options": [
      "cricket",
      "football"
    ],
    "answer": "football",
    "explanation": "Football got only 2 votes while cricket got 5 - football has the shorter bar."
  },
  {
    "id": 154,
    "topic": "data",
    "type": "multiple-choice",
    "difficulty": "medium",
    "question": "Votes are 7 for puzzles and 4 for painting. How many votes in total?",
    "objects": {
      "data": [
        {
          "label": "Puzzles",
          "value": 7
        },
        {
          "label": "Painting",
          "value": 4
        }
      ]
    },
    "options": [
      7,
      9,
      10,
      11
    ],
    "answer": 11,
    "explanation": "7 votes plus 4 votes = 11 votes counted in the survey."
  },
  {
    "id": 155,
    "topic": "data",
    "type": "chart-build",
    "difficulty": "challenge",
    "question": "The detective board shows 6 red cars, 3 blue cars and 4 green cars. Which colour park line has exactly 3?",
    "objects": {
      "data": [
        {
          "label": "Red",
          "value": 6
        },
        {
          "label": "Blue",
          "value": 3
        },
        {
          "label": "Green",
          "value": 4
        }
      ]
    },
    "options": [
      "red",
      "blue",
      "green"
    ],
    "answer": "blue",
    "explanation": "The blue bar reaches exactly the 3 line - 3 blue cars parked."
  }
];

export const findWorld = (topicId) => (SEED_WORLDS || []).find((w) => String(w.id) === String(topicId)) || null;

export const findSeedQuestion = (id) => (SEED_QUESTIONS || []).find((qDoc) => String(qDoc.id) === String(id)) || null;
