// backend/config/class8SkillsCatalog.js
//
// Class 8 Skill Adventure — the static content engine (source of truth lives in
// code, mirroring the mathsMissions/englishMissions seed pattern). The catalog
// defines the 8 skill categories, their game activities and every task with the
// answer key. The server NEVER sends answer keys to the browser: routes strip
// answers via stripForClient() and grade on the server.
//
// Mechanics:
//   choice  – scenario / best-decision question (single correct option)
//   pattern – missing item in a sequence, picked from options
//   order   – arrange shuffled steps into the correct sequence
//   sort    – classify items into buckets (drag-or-tap, keyboard-friendly)
//   match   – pair left items to right items
//   decode  – translate a symbol/number code into a word
//   speak   – open voice practice (participation evidence, never auto-graded)
//   create  – open creative task (participation evidence, self-reflected)
//
// Every deterministic task carries { cognitiveType, difficulty, weight } so the
// Skill Adventure evidence pipes straight into the LD-NBSE engines
// (skillDiagnosisEngine / learningDNAEngine / nextBestSkillEngine).

"use strict";

// ────────────────────────────────────────────────────────────────────────────
// Level structure — Explorer (1) → Challenger (2) → Master (3).
// Each activity defines 5 tasks ordered easy → hard; levels pick progressive
// slices so harder missions reuse fewer hints and harder tasks:
//   L1 Explorer   → tasks[0..3) (3 guided tasks, 2 hints)
//   L2 Challenger → tasks[1..5) (4 tasks, 1 hint)
//   L3 Master     → tasks[2..5) (3 hardest tasks, 1 hint)
// ────────────────────────────────────────────────────────────────────────────
const LEVEL_META = {
    1: { name: "Explorer", tagline: "Guided first steps — hints are on", hintLimit: 2, slice: [0, 3] },
    2: { name: "Challenger", tagline: "Apply what you know — fewer hints", hintLimit: 1, slice: [1, 5] },
    3: { name: "Master", tagline: "Multi-step missions — think it through", hintLimit: 1, slice: [2, 5] },
};

// Score on level N needed to unlock level N+1.
const UNLOCK_SCORE = 60;

// weight boost by task order-index (harder, later tasks carry more evidence).
const TASK_WEIGHT = [1, 1, 2, 2, 3];

// ────────────────────────────────────────────────────────────────────────────
// Task factory helpers (compact content writing)
// ────────────────────────────────────────────────────────────────────────────
const c = (prompt, options, answerIndex, explanation, hint, cognitiveType, difficulty) => ({
    type: "choice", prompt, options, answerIndex, explanation, hint, cognitiveType, difficulty,
});
const p = (prompt, sequence, options, answerIndex, rule, explanation, hint, difficulty) => ({
    type: "pattern", prompt, sequence, options, answerIndex, rule, explanation, hint, cognitiveType: "pattern_recognition", difficulty,
});
const s = (prompt, intro, buckets, items, explanation, hint, cognitiveType, difficulty) => ({
    type: "sort", prompt, intro, buckets, items, explanation, hint, cognitiveType, difficulty,
});
const m = (prompt, intro, pairs, explanation, hint, cognitiveType, difficulty) => ({
    type: "match", prompt, intro, pairs, explanation, hint, cognitiveType, difficulty,
});
const d = (prompt, legend, code, options, answerIndex, explanation, hint, cognitiveType, difficulty) => ({
    type: "decode", prompt, legend, code, options, answerIndex, explanation, hint, cognitiveType, difficulty,
});
const sp = (prompt, tips, difficulty) => ({
    type: "speak", prompt, tips, cognitiveType: "communication", difficulty,
});
const cr = (prompt, brief, difficulty) => ({
    type: "create", prompt, brief, cognitiveType: "understanding", difficulty,
});

// Order/step and sort helpers that auto-derive ids + correctOrder.
// Step ids are HASH-based: stable across sessions but NOT sorted by position,
// so the shipped step ids never reveal the correct order. The index is mixed
// in so repeated labels (e.g. two "Forward 2" moves) stay unique.
function stepId(str, i) {
    let h = 5381;
    const s = String(str) + "|" + i;
    for (let k = 0; k < s.length; k += 1) h = ((h * 33) ^ s.charCodeAt(k)) >>> 0;
    return "s" + h.toString(16).padStart(8, "0");
}
const o = (prompt, intro, steps, explanation, hint, cognitiveType, difficulty) => ({
    type: "order", prompt, intro,
    steps: steps.map((s, i) => ({ id: stepId(s.label, i), label: s.label })),
    explanation, hint, cognitiveType, difficulty,
});
const sitem = (id, label, bucket) => ({ id, label, bucket });
// Pair ids are label-hashed separately so a↔b share NO recoverable structure
// in the shipped ids — the rightful pairing must come from meaning, not code.
const pair = (id, a, b) => ({ id, a: { id: `a${stepId(a, 0)}`, label: a }, b: { id: `b${stepId(b, 0)}`, label: b } });
const step = (label) => ({ label }); // order steps — `o` assigns unique indexed ids

// ────────────────────────────────────────────────────────────────────────────
// CATEGORIES
// ────────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
    {
        id: "communication",
        name: "Communication Skills",
        short: "Speak, listen and express yourself in Tamil and English",
        color: "#0ea5e9",
        icon: "FiMessageCircle",
        intro: "Everyday life is full of conversations — with teachers, friends, shopkeepers and family. Practice speaking clearly, listening carefully and choosing the right words.",
        minutesTip: "3–5 min per game",
        activities: [
            {
                id: "speak-up",
                title: "Speak Up Challenge",
                tagline: "Explain a picture, topic or real-life scene in your own words",
                icon: "FiMic",
                minutes: 4,
                goal: "Describe a topic aloud for about a minute using a clear start, middle and end.",
                tasks: [
                    sp("Describe your school playground to a new student who has never visited. Speak for about a minute.",
                        ["Start with where the playground is in the school", "Say what you can see and play there", "End with why it is your favourite or most-used place"], "easy"),
                    sp("Explain how to make lemon rice to a friend from another state who has never eaten it.",
                        ["List the main ingredients first", "Describe the steps in order", "Mention how long it takes and when it is usually prepared"], "easy"),
                    sp("Your younger cousin is nervous about starting Class 8 next week. Cheer them up in your own words.",
                        ["Share one thing that made you nervous too", "Give one friendly, true piece of advice", "End with something to look forward to"], "medium"),
                    sp("Explain to your parents why you want to join the school eco club.",
                        ["Give two clear reasons", "Say what you would do in the club", "End with one question you have about it"], "medium"),
                    sp("Tell a one-minute story that begins: 'The train was late and I had no phone…'",
                        ["Set the scene in two sentences", "Add one small problem", "Finish with how it all ended"], "hard"),
                ],
            },
            {
                id: "story-builder",
                title: "Story Builder",
                tagline: "Arrange story cards in the right order and retell the story",
                icon: "FiBookOpen",
                minutes: 4,
                goal: "Put shuffled cards into a sensible sequence so the story flows.",
                tasks: [
                    o("Arrange your school-morning routine in order.",
                        "Tap the cards in the order you would really do them.",
                        [step("Wake up"), step("Wash your face and brush"), step("Have breakfast"), step("Pack your school bag"), step("Walk to school")],
                        "The routine starts at home and ends when you reach school.", "Think: what happens first after waking up?", "understanding", "easy"),
                    o("Arrange the rainy-morning story.",
                        "Order the cards to tell the story of a wet school run.",
                        [step("Sky turns dark with clouds"), step("You take your umbrella"), step("A bus splashes water near you"), step("You reach school laughing"), step("You dry off at the veranda")],
                        "Clouds come first, then the umbrella, the splash, and a dry arrival.", "Find the most logical first and last cards.", "understanding", "easy"),
                    o("Arrange the steps to make a paper boat.",
                        "Order the folding steps correctly.",
                        [step("Fold the paper in half"), step("Fold the corners to the middle"), step("Fold the bottom flap up"), step("Open the bottom gently"), step("Float it in a puddle")],
                        "Folding comes before opening, floating comes last.", "What must happen before you can open the bottom?", "application", "medium"),
                    o("Arrange how a sapling is planted.",
                        "Put the planting steps in the right order.",
                        [step("Dig a small pit"), step("Place the sapling inside"), step("Fill the pit with soil"), step("Water the sapling"), step("Put a shade stick beside it")],
                        "Dig first; the shade is the final protection.", "The sapling must go in before the pit is filled.", "application", "medium"),
                    o("Arrange the festival welcome sequence.",
                        "Order the cards for a Tamil festival morning at home.",
                        [step("Buy or mix rangoli colours"), step("Draw the kolam at the entrance"), step("Light the lamp"), step("Offer sweets to guests"), step("Welcome everyone with a smile")],
                        "Preparation happens before guests arrive; welcome ends the sequence.", "Imagine the whole morning from preparations to guests.", "application", "hard"),
                ],
            },
            {
                id: "conversation-quest",
                title: "Conversation Quest",
                tagline: "Respond to real everyday conversations with teachers, shops and friends",
                icon: "FiMessageSquare",
                minutes: 5,
                goal: "Choose the clear, respectful and useful reply in each situation.",
                tasks: [
                    c("You reach class late and the teacher asks why. What is the best reply?",
                        ["Apologise briefly and give a short, honest reason", "Blame the bus loudly", "Stay silent and sit down", "Argue that it is not your fault"],
                        0,
                        "A short honest apology shows respect and solves the problem quickly.",
                        "What would a respectful reply sound like?", "communication", "easy"),
                    c("At the stationery shop you have ₹20 but the notebook costs ₹25. What do you do?",
                        ["Ask politely if there is a notebook for ₹20", "Take it and walk out quickly", "Tell the shopkeeper he is cheating", "Ask a friend to pay and never return the money"],
                        0,
                        "Politely asking for an option in your budget is honest and practical.",
                        "Which option keeps you honest and within your money?", "application", "easy"),
                    c("In a group project, a classmate calls your idea silly. Which reply helps most?",
                        ["'Can you tell me what you don't like? We can improve it together.'", "'Your idea is even sillier.'", "'Fine, I won't share anything more.'", "'I will complain about you to the teacher.'"],
                        0,
                        "Asking for the reason turns a conflict into a chance to improve.",
                        "Which response keeps the conversation open?", "communication", "medium"),
                    c("You do not understand step 2 of the maths explanation. What should you do?",
                        ["Ask after class: 'Can you explain step 2 once more please?'", "Nod even though you are lost", "Ask a question about yesterday's games", "Copy a friend's work without asking"],
                        0,
                        "Asking for one specific step is a smart study habit — teachers respect it.",
                        "Which choice actually clears your doubt?", "understanding", "medium"),
                    c("A visitor asks how to reach the bus stop near your street. What is the clearest answer?",
                        ["'Walk straight two streets; the stop is beside the blue tea shop.'", "'It is somewhere over there.'", "'Go that way for many minutes.'", "'You will find it if you just walk.'"],
                        0,
                        "Clear directions use streets, landmarks and a definite place.",
                        "Which answer would YOU be able to follow?", "communication", "hard"),
                ],
            },
        ],
    },
    {
        id: "logical-thinking",
        name: "Logical Thinking & Problem Solving",
        short: "Spot patterns, decode clues and reason step by step",
        color: "#f59e0b",
        icon: "FiGrid",
        intro: "Logic is the superpower behind puzzles, mazes, codes and detective work. Train yourself to notice patterns, test ideas and decide one step at a time.",
        minutesTip: "3–5 min per game",
        activities: [
            {
                id: "pattern-master",
                title: "Pattern Master",
                tagline: "Find the missing number, shape or step in a sequence",
                icon: "FiZap",
                minutes: 4,
                goal: "Spot the rule of a sequence and choose the next item.",
                tasks: [
                    p("What comes next? 2, 4, 6, 8, ?", ["2", "4", "6", "8", "10"], ["10", "12", "9", "11"], 0,
                        "Add 2 each time", "Each number grows by 2.", "Count by twos.", "easy"),
                    p("What comes next? 5, 10, 20, 40, ?", ["5", "10", "20", "40", "80"], ["80", "60", "70", "90"], 0,
                        "Each number doubles", "Each step multiplies by 2.", "The numbers double each step.", "easy"),
                    p("What letter comes next? A, C, E, G, ?", ["A", "C", "E", "G", "I"], ["I", "H", "J", "K"], 0,
                        "Skip one letter each time", "Say the alphabet aloud and skip one letter between each.", "A, C, E, G … the next skips again.", "medium"),
                    p("What comes next? 3, 6, 11, 18, ?", ["3", "6", "11", "18", "27"], ["27", "25", "26", "28"], 0,
                        "Adding 3, then 5, then 7, then 9", "Look at the gaps between numbers: 3, 5, 7, …", "The gaps grow by 2 each time — what gap comes after 7?", "medium"),
                    p("What comes next? 🔵 🟡 🔵 🟡 🔵 ?", ["🔵", "🟡", "🔵", "🟡", "🔵"], ["🔵", "🟡", "🔴", "🟢"], 1,
                        "Alternate blue, yellow", "Two colours repeat in a fixed order.", "Say the two colours aloud in order.", "easy"),
                ],
            },
            {
                id: "logic-maze",
                title: "Logic Maze",
                tagline: "Plan your next move in a maze of mini-puzzles",
                icon: "FiMap",
                minutes: 5,
                goal: "Use a small rule to choose the correct move that keeps you on the path.",
                tasks: [
                    c("The path to the temple passes houses numbered 4, 6, 8, … Which house number comes next on the path?",
                        ["10", "9", "11", "7"],
                        0, "House numbers on the path are even and increase by 2.", "What even number comes after 8?", "reasoning", "easy"),
                    c("You are at position (1,1) on a 5×5 grid. Moving 2 steps right and 1 step down keeps you inside the grid. Which move is inside?",
                        ["Move to (3,2)", "Move to (4,3)", "Move to (2,4)", "Move to (5,5)"],
                        0, "1+2=3 across, 1+1=2 down → (3,2) stays inside the 5×5 grid.", "Add the move to your starting position.", "problem_solving", "medium"),
                    c("A lock opens when every shape used has 4 sides. Which shape fits the rule next?",
                        ["Square", "Circle", "Triangle", "Star"],
                        0, "A square has 4 sides; a circle, triangle and star do not.", "Count the sides of each shape.", "reasoning", "easy"),
                    c("You have ₹50 and must spend exactly. Which shopping list spends exactly ₹50?",
                        ["₹10 + ₹15 + ₹25", "₹10 + ₹10 + ₹25", "₹15 + ₹15 + ₹15", "₹10 + ₹25"],
                        0, "10+15+25 = 50 exactly.", "Add each list and find the one equal to 50.", "problem_solving", "medium"),
                    c("Two friends split 12 coins equally so both get the same number. How many coins does each get?",
                        ["6", "5", "7", "4"],
                        0, "12 ÷ 2 = 6 coins each.", "Divide the total by the number of friends.", "reasoning", "hard"),
                ],
            },
            {
                id: "code-breaker",
                title: "Code Breaker",
                tagline: "Decode secret messages using symbol rules",
                icon: "FiLock",
                minutes: 5,
                goal: "Use a code key to translate a secret message into a word.",
                tasks: [
                    d("The code key is: △ = A, □ = B, ○ = C, ☆ = D. What does  △ □ ○  mean?",
                        { "△": "A", "□": "B", "○": "C", "☆": "D" },
                        "△ □ ○",
                        ["ABC", "ABD", "ACD", "BCD"], 0,
                        "△=A, □=B, ○=C → ABC.",
                        "Replace each symbol with its letter.", "reasoning", "easy"),
                    d("Each number is a letter: 1=A, 2=B, 3=C, 4=D. What does  2 1 4  mean?",
                        { "1": "A", "2": "B", "3": "C", "4": "D" },
                        "2 1 4",
                        ["BAD", "ADD", "ACE", "BED"], 0,
                        "2=B, 1=A, 4=D → BAD.",
                        "Match each number to its letter in order.", "reasoning", "easy"),
                    d("Fruit code: 🍎 = A, 🍌 = B, 🍇 = C, 🍍 = D. What does  🍇 🍎 🍌  mean?",
                        { "🍎": "A", "🍌": "B", "🍇": "C", "🍍": "D" },
                        "🍇 🍎 🍌",
                        ["CAB", "CBA", "BCD", "ACD"], 0,
                        "🍇=C, 🍎=A, 🍌=B → CAB.",
                        "Read the fruit symbols left to right.", "reasoning", "medium"),
                    d("Stars → letters: ⭐1 = M, ⭐2 = A, ⭐3 = T, ⭐4 = H. What does  ⭐4 ⭐1 ⭐2  mean?",
                        { "⭐1": "M", "⭐2": "A", "⭐3": "T", "⭐4": "H" },
                        "⭐4 ⭐1 ⭐2",
                        ["HAM", "MAH", "MAT", "THM"], 0,
                        "⭐4=H, ⭐1=M, ⭐2=A → HAM.",
                        "Translate each symbol then read the word.", "reasoning", "medium"),
                    d("Dice code: ①=V, ②=I, ③=L, ④=L, ⑤=A, ⑥=G, ⑦=E. What does  ⑥ ① ② ④ ③ ① ⑦  mean?",
                        { "①": "V", "②": "I", "③": "L", "④": "L", "⑤": "A", "⑥": "G", "⑦": "E" },
                        "⑥ ① ② ④ ③ ① ⑦",
                        ["VILLAGE", "VAGILE", "VILLAGE", "VILLEGE"], 0,
                        "⑥=G ①=V ②=I ④=L ③=L ①=V ⑦=E → VILLAGE.",
                        "Translate every symbol, then read the full word carefully.", "reasoning", "hard"),
                ],
            },
        ],
    },
    {
        id: "digital",
        name: "Digital & Technology Skills",
        short: "Computers, coding, online safety and smart searching",
        color: "#8b5cf6",
        icon: "FiCpu",
        intro: "Technology is powerful and needs smart users. Learn what computers do, how simple code works, and how to stay safe and kind online.",
        minutesTip: "3–5 min per game",
        activities: [
            {
                id: "digital-explorer",
                title: "Digital Explorer",
                tagline: "Sort computer parts, apps and online habits into the right boxes",
                icon: "FiMonitor",
                minutes: 4,
                goal: "Classify devices and habits into the correct category.",
                tasks: [
                    s("Sort these computer parts into Input, Output, or Storage.",
                        "Input devices send information in; output devices show it out; storage keeps it.",
                        [{ id: "input", label: "Input device" }, { id: "output", label: "Output device" }, { id: "storage", label: "Storage" }],
                        [sitem("i1", "Keyboard", 0), sitem("i2", "Mouse", 0), sitem("i3", "Monitor", 1), sitem("i4", "Speaker", 1), sitem("i5", "Pen drive", 2), sitem("i6", "Hard disk", 2)],
                        "Keyboard and mouse send commands to the computer; monitor and speaker show or play results; the pen drive and hard disk keep files.",
                        "Ask: does it send in, show out, or keep data?", "understanding", "easy"),
                    s("Sort these habits into Safe online habit or Risky habit.",
                        "Safe habits protect you; risky habits invite trouble.",
                        [{ id: "safe", label: "Safe habit" }, { id: "risky", label: "Risky habit" }],
                        [sitem("h1", "Use a long and private password", 0), sitem("h2", "Share your password with a friend", 1), sitem("h3", "Log out from a shared computer", 0), sitem("h4", "Open an unknown email attachment", 1), sitem("h5", "Update your apps when asked", 0), sitem("h6", "Use the same password for every account", 1)],
                        "Safe habits keep accounts private; sharing passwords, opening unknown files and reusing passwords are risky.",
                        "Would this habit keep your account safe?", "application", "medium"),
                    s("Sort these information sources into Reliable or Needs checking.",
                        "Reliable sources are verified; others need a second source.",
                        [{ id: "reliable", label: "Reliable" }, { id: "check", label: "Needs checking" }],
                        [sitem("r1", "Your science textbook", 0), sitem("r2", "Teacher's announcement in class", 0), sitem("r3", "A WhatsApp forward with no author", 1), sitem("r4", "News page with author and date", 0), sitem("r5", "An unknown blog with no date", 1), sitem("r6", "A meme page saying 'last to get 2G dies'", 1)],
                        "Textbooks, teachers and sourced pages are reliable; nameless forwards, dated-less blogs and joke pages need checking.",
                        "Who wrote it, and can you check it elsewhere?", "reasoning", "medium"),
                    s("Sort these into What AI can do or What AI cannot really do.",
                        "AI finds patterns in data but does not feel like a person.",
                        [{ id: "ai", label: "AI can do" }, { id: "noai", label: "AI cannot really do" }],
                        [sitem("a1", "Suggest the next word while you type", 0), sitem("a2", "Recognise your face in a photo", 0), sitem("a3", "Feel happy when you praise it", 1), sitem("a4", "Know if you feel shy in class", 1), sitem("a5", "Win a game of chess", 0), sitem("a6", "Choose your final exam marks by itself", 1)],
                        "AI predicts text, recognises images and plays games; it has no feelings and must not decide your marks.",
                        "Does this need real feelings, or just patterns?", "reasoning", "hard"),
                    s("Sort these into Input, Output, or Processing & storage.",
                        "Round two — read each part carefully.",
                        [{ id: "input", label: "Input" }, { id: "output", label: "Output" }, { id: "store", label: "Processing & storage" }],
                        [sitem("c1", "Microphone", 0), sitem("c2", "Printer", 1), sitem("c3", "CPU", 2), sitem("c4", "Scanner", 0), sitem("c5", "RAM", 2), sitem("c6", "Projector", 1)],
                        "Mic and scanner send data to the computer; printer and projector show output; CPU and RAM process and hold temporary data.",
                        "Where is the data going?", "understanding", "hard"),
                ],
            },
            {
                id: "cyber-safety",
                title: "Cyber Safety Simulator",
                tagline: "Decide what to do in tricky online situations",
                icon: "FiShield",
                minutes: 5,
                goal: "Choose the safest, kindest response in each online situation.",
                tasks: [
                    c("A stranger online says they will send you a 'prize' if you share your home address. What do you do?",
                        ["Do not share anything; tell a parent or teacher", "Share just the city name", "Share the full address — who says no to a prize?", "Share your friend's address instead"],
                        0, "Your address is private. Never share it with strangers, and tell a trusted adult immediately.", "Would sharing help you, or put you at risk?", "application", "easy"),
                    c("Your classmate's account sends you: 'Free mobile data — click now!' in a group. You should…",
                        ["Not click it, and tell your classmate to check if their account was hacked", "Click it fast before the offer ends", "Forward it to every group so nobody misses it", "Type your password in to unlock the data"],
                        0, "Such links are often tricks. Report it and alert your friend — their account may be hacked.", "What could this link actually do?", "application", "easy"),
                    c("Which of these passwords is the STRONGEST?",
                        ["Br0ken!Rice@2026", "123456", "priyavijay", "password"],
                        0, "A strong password mixes letters, numbers and symbols and is not a real word.", "Which one would be hardest to guess?", "understanding", "medium"),
                    c("Someone online keeps asking personal questions and it makes you uncomfortable. What do you do?",
                        ["Stop replying, block them and tell a trusted adult", "Answer everything to be polite", "Keep chatting but give fake answers", "Ask them personal questions back"],
                        0, "Your comfort matters. Block and talk to an adult — you never owe strangers your details.", "What keeps you safest?", "application", "medium"),
                    c("A pop-up says your computer is 'infected' and shows a phone number to call. What do you do?",
                        ["Close the pop-up (do not call) and tell a grown-up", "Call the number immediately", "Enter the OTP they ask for to 'clean' it", "Download their 'repair' app to be safe"],
                        0, "Fake alarm pop-ups are a common trick. Never call, download or share OTPs from them.", "Who really gains if you call that number?", "reasoning", "hard"),
                ],
            },
            {
                id: "coding-adventure",
                title: "Coding Adventure",
                tagline: "Order code blocks to move a character and finish missions",
                icon: "FiTerminal",
                minutes: 5,
                goal: "Build the correct command sequence for each mini-mission.",
                tasks: [
                    o("Get the robot to say hello at the flag.",
                        "Arrange the command blocks in the correct order.",
                        [step("Start"), step('Say "Hello!"'), step("Wait 1 second"), step("Wave to the crowd")],
                        "Programs run in order: start, speak, wait, then wave.",
                        "What must happen before the robot can wave?", "understanding", "easy"),
                    o("Move the robot around the obstacle to reach home.",
                        "Order the movement commands correctly.",
                        [step("Forward 2"), step("Turn right"), step("Forward 1"), step("Turn left"), step("Forward 2")],
                        "Go forward, turn right to pass the obstacle, then turn back left and reach home.",
                        "Trace the path with your finger: which turn comes first?", "problem_solving", "medium"),
                    o("Sort the list [3, 1, 2] into order using these steps.",
                        "Arrange the sorting steps in the right order.",
                        [step("Compare 3 and 1, swap → 1 3 2"), step("Compare 3 and 2, swap → 1 2 3"), step("Check once more — list is sorted, done")],
                        "You sweep left to right swapping wrong-order pairs until the list is sorted.",
                        "Which pair must be fixed first?", "problem_solving", "hard"),
                    o("Make the sprite chase the ball and score.",
                        "Order the blocks to complete the game move.",
                        [step("Move toward the ball"), step("Touch the ball"), step("Hear the 'goal' sound"), step("Show score +1")],
                        "First move, then touch, then sound, then the score updates.",
                        "What must happen before the score can change?", "reasoning", "medium"),
                    o("Debug this: which order makes the character end AT the flag, not past it?",
                        "Only one sequence leads exactly to the flag.",
                        [step("Forward 2"), step("Turn left"), step("Forward 1"), step("Turn right"), step("Forward 1")],
                        "Step each move on a grid: this order lands exactly on the flag without overshooting.",
                        "Count steps on an imaginary grid — where would each order end?", "problem_solving", "hard"),
                ],
            },
        ],
    },
    {
        id: "creativity",
        name: "Creativity & Innovation",
        short: "Imagine, design and invent new solutions",
        color: "#ec4899",
        icon: "FiPenTool",
        intro: "Creativity is finding new ways to solve everyday problems. Draw, write, choose smart designs and explain your ideas in your own words.",
        minutesTip: "3–5 min per game",
        activities: [
            {
                id: "creative-canvas",
                title: "Creative Canvas",
                tagline: "Draw or design and explain your idea",
                icon: "FiEdit3",
                minutes: 6,
                goal: "Create a simple visual design and describe what each part means.",
                tasks: [
                    cr("Draw a badge for your school's eco club. Explain what each symbol on it means.", "Use at least one nature symbol (leaf, drop, tree) and write 3–4 sentences about your choices.", "easy"),
                    cr("Design a poster that persuades students to save water at school. Explain the message you chose.", "Include one clear message, one drawing and why your words would convince a student.", "easy"),
                    cr("Sketch a helpful invention for a farmer during the hot summer. Describe how it works.", "Name the problem, draw your idea simply, and tell how it helps in two sentences.", "medium"),
                    cr("Draw your dream classroom. Explain one idea that would make learning more fun and fair for everyone.", "Draw the room, pick ONE change, and say why it would help students.", "medium"),
                    cr("Design a greeting card for Tamil New Year using shapes you can draw easily. Describe the pattern you used.", "Plan the card: colours, one symbol (lamp, mango, sun) and a short greeting line.", "hard"),
                ],
            },
            {
                id: "story-world",
                title: "Story World",
                tagline: "Create your own mini-stories and share your voice",
                icon: "FiFeather",
                minutes: 5,
                goal: "Write a short story that fits a creative prompt.",
                tasks: [
                    cr("Write a story about a thirsty crow that finds a clever way to drink from a pot.", "Use 4 lines: beginning, one problem, the clever trick, the ending.", "easy"),
                    cr("Continue this story: 'The science exhibition is tomorrow, and our model battery is dead…'", "Write 5 lines with a creative fix that is believable.", "easy"),
                    cr("Write a story where missing the bus at first turns into a happy ending.", "Include a character, a delay, and one kind action that changes the day.", "medium"),
                    cr("Tell the same event twice: once from a student's view and once from the school watchman's view.", "Pick a small event (bell, rain, lost bag) and give each person different feelings about it.", "medium"),
                    cr("Write ONE short story that includes a mango tree, a bicycle and a rain cloud.", "Make all three objects matter to the plot, not just pass by.", "hard"),
                ],
            },
            {
                id: "inventor-lab",
                title: "Inventor's Lab",
                tagline: "Pick the workable design for real-life problems",
                icon: "FiTool",
                minutes: 5,
                goal: "Choose the practical, affordable idea and learn why the others fail.",
                tasks: [
                    c("Problem: keep your lunchbox food cool in summer. Which design works best?",
                        ["Wrap the box in a wet cloth and keep it in the shade, renewing water at lunch", "Put the box in the sun to warm the food", "Wrap it in newspaper and leave it in the sun", "Keep it in an open basket near the window"],
                        0, "Evaporation from the wet cloth cools the box — a classic low-cost cooler.", "Which option actually removes heat?", "application", "medium"),
                    c("Problem: study light during a power cut. Best solution?",
                        ["Use daylight near a window, and a charged solar lamp at night", "Burn dry leaves to make a flame", "Stare at the phone screen all night", "Do all reading only in candlelight"],
                        0, "Using natural light + a topped-up solar lamp is safe, cheap and healthy for eyes.", "Which idea is safe AND affordable?", "reasoning", "medium"),
                    c("Problem: collect rooftop rainwater without spending money. Best method?",
                        ["Channel rain through a simple pipe into a large covered pot", "Let the rain flow out to the street", "Store water in an open bucket for weeks", "Skip collecting — it is the government's job"],
                        0, "A covered storage pot keeps the rainwater clean and usable.", "Which option keeps the water safe to use?", "application", "medium"),
                    c("Problem: you cannot hear the teacher because of the fan noise. Best solution?",
                        ["Move your seat nearer to the front and ask to lower the fan during discussions", "Speak louder than the fan yourself", "Move the blackboard to the back", "Ask to change the timetable every hour"],
                        0, "A small practical change — near the front and a lower fan — fixes it for everyone.", "Which change is easy and helps the whole class?", "problem_solving", "hard"),
                    c("Problem: deliver home-made snacks to neighbours safely during rain. Best design?",
                        ["Pack snacks in a covered steel dabba inside a waterproof bag", "Carry the snacks in an open packet for speed", "Wrap them in thin paper only", "Wait for a sunny day every time"],
                        0, "A closed dabba + waterproof bag keeps food dry and safe to eat.", "What protects food from water AND keeps it clean?", "application", "hard"),
                ],
            },
        ],
    },
    {
        id: "social",
        name: "Social Skills, Teamwork & Leadership",
        short: "Empathy, respect, teamwork and making fair decisions",
        color: "#f97316",
        icon: "FiUsers",
        intro: "Great friendships and teams are built with empathy, fair play and kind words. Practice seeing others' feelings and resolving problems together.",
        minutesTip: "3–5 min per game",
        activities: [
            {
                id: "empathy-explorer",
                title: "Empathy Explorer",
                tagline: "Understand how others feel and choose kind responses",
                icon: "FiHeart",
                minutes: 5,
                goal: "Notice others' feelings and pick the response that respects them.",
                tasks: [
                    c("A new student sits alone at lunch on their first day. What do you do?",
                        ["Invite them to join your group and ask about their favourite subject", "Leave them — they will adjust on their own", "Quietly laugh that they are shy", "Say hi only when the teacher is watching"],
                        0, "A simple invitation can change someone's whole first day.", "What would make YOU feel welcome?", "communication", "easy"),
                    c("A classmate who lost their grandfather looks sad in class. What helps most?",
                        ["Sit with them and say, 'I am here if you want to talk.'", "Avoid them so you do not say the wrong thing", "Say, 'Cheer up, it is nothing'", "Tell others the news before they do"],
                        0, "Presence and a kind open line beat forced cheerfulness or gossip.", "Which response shows care without judging?", "communication", "medium"),
                    c("Your best friend got the lowest mark in the test and is upset. You say…",
                        ["'Want to study together next time? I can share how I prepare.'", "'I cannot believe you failed so badly.'", "'Everyone knows you never study.'", "Say nothing and laugh with others"],
                        0, "Offering concrete help shows friendship without blaming.", "Which words build them up, not tear them down?", "communication", "medium"),
                    c("An elderly person struggles to cross the busy road near your school. What do you do?",
                        ["Offer to walk across slowly and safely with them", "Record a video of them crossing", "Hurry past — you have class", "Ask them to wait for someone important to help"],
                        0, "A few seconds of help keeps someone safe and shows real care.", "What is the actual helpful action here?", "application", "hard"),
                    c("A teammate keeps missing catches and now looks discouraged. What do you do?",
                        ["'Let's practice together — everyone improves step by step.'", "'You are the reason we lose.'", "Stop passing the ball to them", "Blame them loudly for everyone to hear"],
                        0, "Practice together turns the mistake into something everyone can fix.", "Which line makes them want to keep trying?", "communication", "hard"),
                ],
            },
            {
                id: "conflict-resolution",
                title: "Conflict Resolution Simulator",
                tagline: "Handle disagreements and misunderstandings fairly",
                icon: "FiShuffle",
                minutes: 5,
                goal: "Choose the response that solves the conflict fairly for everyone.",
                tasks: [
                    c("Two friends argue over the same bat during break. As a friend you…",
                        ["Suggest taking turns by innings, with a timer", "Hide the bat so nobody plays", "Take sides loudly with your best friend", "Let them shout until a teacher arrives"],
                        0, "A short fair rule (turns + timer) solves it without a fight.", "Which idea is fair to both?", "reasoning", "easy"),
                    c("Your group cannot agree on the project topic. What works best?",
                        ["Each person shares one idea, then the group votes fairly", "The loudest voice decides", "Split up and each of you works alone", "Pick a topic nobody likes so it 'ends' the debate"],
                        0, "Everyone speaks and the team votes — that is how fair decisions are made.", "Which method lets everyone be heard?", "application", "medium"),
                    c("Your younger sibling broke your favourite pen by accident. You…",
                        ["Say it is okay, ask them to be careful next time, and put things away together", "Break their toy to even it out", "Shout and stop talking to them for a week", "Hide all their things angrily"],
                        0, "Accidents happen; calm words and a tidy habit protect your things better than revenge.", "Which response fixes the problem instead of growing it?", "reasoning", "medium"),
                    c("A classmate judging your game makes a mistake that helps their side. You…",
                        ["Keep playing, then discuss it politely after the match", "Walk off the field in anger", "Argue until the match stops", "Make unfair calls against them next time"],
                        0, "Finish the game fairly, then talk politely — that is sportsmanship.", "When is the calm time to raise the issue?", "application", "hard"),
                    c("A teammate returns your notes torn and looks sorry about it. You…",
                        ["'Please be careful next time — want me to lend them again so we can copy together?'", "Demand their notes back forever", "Tell everyone how careless they are", "Never lend anything again"],
                        0, "One calm sentence keeps the friendship and sets the expectation.", "Which reply fixes the notes AND keeps the friend?", "communication", "hard"),
                ],
            },
            {
                id: "cooperation-challenge",
                title: "Cooperation Challenge",
                tagline: "Match the right person's help to each part of a team mission",
                icon: "FiGitMerge",
                minutes: 5,
                goal: "Match each task to the teammate or tool best suited for it.",
                tasks: [
                    m("Match each job in the school clean-up drive to the right helper.",
                        "Tap a job on the left, then the best helper on the right.",
                        [pair("1", "Carry water buckets", "Two strong students"), pair("2", "Sweep under the desks", "Students with brooms"), pair("3", "Sort waste for recycling", "Eco club members"), pair("4", "Count and record the bags", "The maths lovers")],
                        "Match the skill of each helper to the job they can do best.",
                        "Who enjoys counting? Who knows the bins?", "reasoning", "easy"),
                    m("Match each part of the class play to the right support.",
                        "Pair the need with who can provide it.",
                        [pair("1", "Stage lights", "The electrician uncle"), pair("2", "Dialogue coaching", "The drama group"), pair("3", "Costumes", "Parents who sew"), pair("4", "Backdrop sets", "The art club")],
                        "Every production leans on different helpers with different skills.",
                        "Who works with lights? Who paints?", "application", "medium"),
                    m("Match each farm-visit job to the right squad.",
                        "Pair the task with the team that should handle it.",
                        [pair("1", "Watering the plants", "The water squad"), pair("2", "Collecting vegetables", "The harvest group"), pair("3", "Feeding the hens", "The feeding team"), pair("4", "Writing observations", "The journal team")],
                        "Jobs split by skill keep the visit safe and organised.",
                        "Which team is about taking notes?", "application", "medium"),
                    m("Match each safety item to the danger it handles.",
                        "Pair the tool with its purpose.",
                        [pair("1", "First aid kit", "Small injuries"), pair("2", "Wet-floor sign", "Slipping on water"), pair("3", "Fire extinguisher", "Small fires"), pair("4", "Emergency exit route", "Leaving the building fast")],
                        "Each safety tool exists for one specific danger.",
                        "What stops slips? What stops fires from growing?", "understanding", "easy"),
                    m("Match each community problem to the right community action.",
                        "Pair each issue with a practical response.",
                        [pair("1", "Stray animals in the hot sun", "Keep water bowls in shaded spots"), pair("2", "Garbage pile on the street", "Report it and join a clean-up drive"), pair("3", "Dark street near the school", "Ask an adult to report the street light"), pair("4", "Dry open well near the playground", "Tell the teacher and fence the area")],
                        "Every local problem has a local, adult-guided solution.",
                        "Which action fixes each issue safely?", "reasoning", "hard"),
                ],
            },
        ],
    },
    {
        id: "life-skills",
        name: "Life Skills & Self-Management",
        short: "Time, money, emotions and healthy daily habits",
        color: "#10b981",
        icon: "FiLifeBuoy",
        intro: "Life runs smoother with small skills: planning a day, handling money, recognising feelings and building healthy habits that stick.",
        minutesTip: "3–5 min per game",
        activities: [
            {
                id: "time-management",
                title: "Time Management Quest",
                tagline: "Arrange your day and priorities in a sensible order",
                icon: "FiClock",
                minutes: 4,
                goal: "Build realistic daily schedules — the right tasks at the right time.",
                tasks: [
                    o("Arrange an exam-eve revision plan from earliest to latest.",
                        "Order the evening activities sensibly.",
                        [step("Finish the day's homework"), step("Revise your weakest chapter"), step("Practice 5 sums from old test papers"), step("Pack your bag for tomorrow"), step("Sleep at a fixed time")],
                        "Homework first, weakest chapter next, practice, packing, then enough sleep.",
                        "What should come before you sleep well?", "application", "easy"),
                    o("Arrange your after-school evening in a healthy order.",
                        "Put the routine in the best order.",
                        [step("Change and have a light snack"), step("Do your homework"), step("Play or exercise outdoors"), step("Have family dinner together"), step("Read a book before bed")],
                        "Snack, work, play, dinner together, then calm reading.",
                        "When is the best time to play — before or after homework?", "understanding", "easy"),
                    o("Arrange the weekly self-management plan.",
                        "Order the week's tasks sensibly.",
                        [step("Finish school assignments early in the week"), step("Attend your hobby class"), step("Help with grocery shopping"), step("Tidy your study table"), step("Plan the next week on Sunday")],
                        "Assignments first, then hobbies and chores, and planning at the end of the week.",
                        "Which task should NOT wait till Sunday?", "application", "medium"),
                    o("Arrange the night before an early morning train trip.",
                        "Do these in the best order the previous evening.",
                        [step("Pack your bag"), step("Keep the ticket safe in the bag"), step("Charge your phone"), step("Set the alarm"), step("Sleep early")],
                        "Pack, ticket, charge, alarm, then early sleep.",
                        "What must be done before you can set the alarm and sleep?", "reasoning", "medium"),
                    o("Arrange a weekend that balances study, rest and chores.",
                        "Build a balanced Saturday.",
                        [step("Finish pending homework in the morning"), step("Complete your daily chores"), step("Have a timed break for games or sports"), step("Help cook or clean the kitchen"), step("Spend quiet time reading or with family")],
                        "Work in the morning, chores, a timed break, family help, then calm wind-down.",
                        "Balance means work, play AND rest — in that flow.", "reasoning", "hard"),
                ],
            },
            {
                id: "smart-budget",
                title: "Smart Budget Game",
                tagline: "Manage a monthly allowance like a careful saver",
                icon: "FiDollarSign",
                minutes: 5,
                goal: "Make money decisions that balance today's wants and tomorrow's savings.",
                tasks: [
                    c("Your ₹200 monthly allowance is already used for ₹80 of snacks by mid-month. Best next step?",
                        ["Save the rest and pause snacks for the rest of the month", "Borrow from a friend and spend even more", "Take money meant for school fees", "Confuse saving — spend it all on a movie"],
                        0, "Pausing treats rebuilds your budget; borrowing or tapping fees makes it worse.", "Which choice protects the money you still need?", "reasoning", "easy"),
                    c("You earn ₹10 a day for a week doing chores (₹70) and want a ₹300 game. What is the wise plan?",
                        ["Save in a box until you reach ₹300 across a few weeks", "Ask a friend for a loan and spend it all today", "Spend the ₹70 on snacks now", "Buy a 'same day' offer that actually costs ₹350 later"],
                        0, "Steady small savings reach the goal; loans and instant offers usually cost more.", "Which plan actually leads to owning the game?", "problem_solving", "medium"),
                    c("Two books cost ₹45 each. You pay with ₹100. What is the correct change you should receive?",
                        ["₹10", "₹15", "₹20", "₹5"],
                        0, "45 + 45 = ₹90, so change = 100 − 90 = ₹10.", "Add the two prices first, then subtract from 100.", "problem_solving", "easy"),
                    c("Money is a little short this month at home. What gets priority?",
                        ["Your school bus fee first, treats later", "Ice cream first, fees later", "Gifts for friends first this week", "A game recharge first"],
                        0, "Needs (fees, food, travel) come before wants (treats, games).", "Which is a need and which is a want?", "reasoning", "medium"),
                    c("You earned ₹150 selling drawings at the school fair. What is the wisest use?",
                        ["Save ₹100 and keep ₹50 for art materials", "Spend all of it on snacks this week", "Lend it all to a friend with no plan", "Throw a small party today with every rupee"],
                        0, "Saving most and spending a little on future materials grows your hobby.", "Which split keeps earning possible next time?", "application", "hard"),
                ],
            },
            {
                id: "healthy-habits",
                title: "Healthy Habits Challenge",
                tagline: "Sort everyday habits into healthy and needs-change boxes",
                icon: "FiActivity",
                minutes: 4,
                goal: "Recognise which daily habits help your body, eyes and sleep.",
                tasks: [
                    s("Sort these habits into Healthy habit or Needs change.",
                        "Healthy habits support your body every day.",
                        [{ id: "good", label: "Healthy habit" }, { id: "fix", label: "Needs change" }],
                        [sitem("g1", "Brush twice a day", 0), sitem("g2", "Sleep less than 5 hours", 1), sitem("g3", "Drink water after playing", 0), sitem("g4", "Eat chips and cola every day", 1), sitem("g5", "Walk to school when it is close", 0), sitem("g6", "Skip breakfast often", 1)],
                        "Sleep, water, brushing and moving help; five-hour sleep, daily junk and skipping breakfast hurt.",
                        "Does this habit help or strain your body?", "understanding", "easy"),
                    s("Sort these into Good for eyes or Rest your eyes.",
                        "Eye health comes from light, breaks and distance.",
                        [{ id: "good", label: "Good for eyes" }, { id: "rest", label: "Rest your eyes" }],
                        [sitem("e1", "Read in good light", 0), sitem("e2", "Stare at a screen in a dark room for hours", 1), sitem("e3", "Take a 20-20-20 break (look 20 feet away, 20 seconds)", 0), sitem("e4", "Rub eyes with dirty hands", 1), sitem("e5", "Look at far trees or sky after study", 0), sitem("e6", "Game on the phone till midnight", 1)],
                        "Good light, breaks and looking far help; dark screens, dirty hands and midnight gaming strain eyes.",
                        "Which habits give your eyes rest?", "understanding", "medium"),
                    s("Sort these into Screen-time balance or Too much screen time.",
                        "Balance means screens are part of the day, not all of it.",
                        [{ id: "ok", label: "Screen-time balance" }, { id: "much", label: "Too much screen" }],
                        [sitem("s1", "Play outdoors for 1 hour after homework", 0), sitem("s2", "Watch videos 6 hours a day", 1), sitem("s3", "Family dinner with phones away", 0), sitem("s4", "Scroll in bed before sleep", 1), sitem("s5", "30 minutes of typing practice, then stop", 0), sitem("s6", "Use the phone during homework", 1)],
                        "Outdoor play, no-phone dinners and limited practice are balance; hours of videos and phone-in-bed are too much.",
                        "When does screen time push out sleep or study?", "reasoning", "medium"),
                    s("Sort these into Saves water and energy or Wastes them.",
                        "Small habits decide how much water and power vanish.",
                        [{ id: "save", label: "Saves" }, { id: "waste", label: "Wastes" }],
                        [sitem("w1", "Turn off the tap while brushing", 0), sitem("w2", "Run the machine for just 2 clothes", 1), sitem("w3", "Switch off lights when leaving a room", 0), sitem("w4", "Leave the fridge door open while choosing", 1), sitem("w5", "Take a bucket bath", 0), sitem("w6", "Long showers twice a day", 1)],
                        "Taps off, machines full, lights off and bucket baths save; half-load machines, open fridges and long showers waste.",
                        "Which habit keeps more in the tank?", "application", "hard"),
                    s("Sort these into Helps good sleep or Hurts good sleep.",
                        "Good sleep is built all evening.",
                        [{ id: "helps", label: "Helps sleep" }, { id: "hurts", label: "Hurts sleep" }],
                        [sitem("n1", "A fixed bedtime", 0), sitem("n2", "Homework till midnight the night before an exam", 1), sitem("n3", "A cool, dark, quiet room", 0), sitem("n4", "A heavy snack just before bed", 1), sitem("n5", "Quiet time and slow breathing before bed", 0), sitem("n6", "Bright phone screen in bed", 1)],
                        "Fixed bedtimes, cool dark rooms and quiet wind-down help; late cramming, heavy snacks and bright screens hurt.",
                        "What does your body need to switch off?", "reasoning", "hard"),
                ],
            },
        ],
    },
    {
        id: "environment",
        name: "Environmental & Community Awareness",
        short: "Waste, water, nature and caring for the community",
        color: "#22c55e",
        icon: "FiFeather",
        intro: "The environment around you — water, soil, trees, animals — needs careful hands. Learn to sort waste, guard water and understand Tamil Nadu's nature.",
        minutesTip: "3–5 min per game",
        activities: [
            {
                id: "waste-sorting",
                title: "Waste Sorting Challenge",
                tagline: "Drag each item into the right bin",
                icon: "FiTrash2",
                minutes: 4,
                goal: "Classify waste correctly into Organic, Recyclable or Hazardous bins.",
                tasks: [
                    s("Sort each waste item into the correct bin.",
                        "Organic decays in soil; recyclable can be reused; hazardous needs special care.",
                        [{ id: "org", label: "Organic bin" }, { id: "rec", label: "Recyclable bin" }, { id: "haz", label: "Hazardous bin" }],
                        [sitem("x1", "Banana peel", 0), sitem("x2", "Newspaper", 1), sitem("x3", "Used battery", 2), sitem("x4", "Vegetable waste", 0), sitem("x5", "Empty plastic bottle", 1), sitem("x6", "Expired medicine strip", 2)],
                        "Peels and veggie waste compost; paper and clean bottles recycle; batteries and medicine strips are hazardous.",
                        "Would it rot (organic), be reused (recyclable), or poison (hazardous)?", "understanding", "easy"),
                    s("Sort these into Compost or Not compost.",
                        "Compost needs material that breaks down naturally.",
                        [{ id: "comp", label: "Compost" }, { id: "no", label: "Not compost" }],
                        [sitem("y1", "Fruit peels", 0), sitem("y2", "Plastic wrapper", 1), sitem("y3", "Tea leaves", 0), sitem("y4", "Glass bottle", 1), sitem("y5", "Egg shells", 0), sitem("y6", "Aluminium foil", 1)],
                        "Peels, tea leaves and egg shells break down; plastic, glass and foil do not compost.",
                        "Would a worm or fungus break this down?", "understanding", "easy"),
                    s("Sort these into Reduce & reuse or Better to replace.",
                        "The wisest first step is using less, then reusing.",
                        [{ id: "less", label: "Reduce & reuse" }, { id: "more", label: "Better to replace" }],
                        [sitem("z1", "Carry a cloth bag for shopping", 0), sitem("z2", "Buy a new phone every festival for no reason", 1), sitem("z3", "Use the back of printed paper for rough work", 0), sitem("z4", "Throw away a still-good water bottle weekly", 1), sitem("z5", "Repair torn school shoes", 0), sitem("z6", "Toss leftover food into the drain", 1)],
                        "Cloth bags, rough-sheet reuse and repairs reduce waste; pointless new purchases and discarding still-good things multiply it.",
                        "Which choice keeps more out of the trash?", "application", "medium"),
                    s("Sort these plastics into Recyclable or Needs special handling.",
                        "Clean plastics recycle; dirty or chemical plastics need care.",
                        [{ id: "rec", label: "Recyclable" }, { id: "care", label: "Needs special handling" }],
                        [sitem("p1", "Clean empty water bottle", 0), sitem("p2", "Bottle with leftover food inside", 1), sitem("p3", "Clean lunch box", 0), sitem("p4", "Bottle that held medicine", 1), sitem("p5", "Washed milk pouch (dried)", 0), sitem("p6", "Thin plastic bag with paint spills", 1)],
                        "Rinse and dry plastics before recycling; oily, food-stuck or chemical bottles contaminate the whole batch.",
                        "Would a recycler accept this as it is right now?", "application", "medium"),
                    s("Sort into Safe to bury in soil or Do NOT bury.\n",
                        "Nature breaks down natural waste but poisons soil with the rest.",
                        [{ id: "ok", label: "Safe to bury" }, { id: "no", label: "Do NOT bury" }],
                        [sitem("b1", "Dry leaves", 0), sitem("b2", "Plastic bag", 1), sitem("b3", "Vegetable peels", 0), sitem("b4", "Used battery", 1), sitem("b5", "Cardboard box", 0), sitem("b6", "Paint tin", 1)],
                        "Natural waste returns to soil; plastic, batteries and paints take centuries and poison the land.",
                        "Would living things in the soil be harmed by it?",
                        "reasoning", "hard"),
                ],
            },
            {
                id: "water-guardian",
                title: "Water Guardian",
                tagline: "Make wise decisions to protect your village's water",
                icon: "FiDroplet",
                minutes: 5,
                goal: "Choose actions that save, store and revive water — not waste it.",
                tasks: [
                    c("The village pond is drying up. Which first step helps most?",
                        ["Involve elders to plan desilting and rainwater pits", "Keep bathing and washing clothes in it as before", "Build a concrete wall right around it", "Wait for the summer and see"],
                        0, "Cleaning the pond and catching rain revive it; ignoring it drains it further.", "Which action brings more water in and keeps it clean?", "application", "medium"),
                    c("During a water-cut week at home, the best family habit is…",
                        ["Store just enough and reuse rinse water for plants", "Throw used water straight down the drain", "Keep the tap running while chatting", "Take long showers when water returns"],
                        0, "Storing the right amount and reusing rinse water stretches every litre.", "Which habit saves water without hardship?", "application", "easy"),
                    c("You spot the school tap leaking steadily. You…",
                        ["Report it at once and close the tap fully", "Decide it is someone else's duty", "Play with the leaky drip", "Wait for the annual repair"],
                        0, "A steady drip wastes litres every day — closing and reporting it is instant action.", "How much water does one drip waste in a day?", "reasoning", "medium"),
                    c("The best way to harvest rain at home is…",
                        ["Channel rooftop rain into a covered storage pot or filter pit", "Let the rain wash away to the street", "Collect in an open tank and leave it uncovered", "Do nothing — water comes from taps"],
                        0, "A covered pot keeps the rainwater clean and ready for use.", "What keeps collected rain safe to use?", "application", "medium"),
                    c("To use less water while watering a small vegetable plot, you would…",
                        ["Use drip or kanji (trench) watering and add mulch", "Flood the whole plot every day", "Water only at the hottest hour of noon", "Spray with a leaking hose for hours"],
                        0, "Slow drip or trench watering plus mulch holds moisture — the least water for the most crop.", "Which method loses the least water?", "reasoning", "hard"),
                ],
            },
            {
                id: "biodiversity",
                title: "Biodiversity Explorer",
                tagline: "Match plants and animals to their homes and uses",
                icon: "FiFeather",
                minutes: 4,
                goal: "Connect living things with where they live and why they matter.",
                tasks: [
                    m("Match each living thing to its natural home.",
                        "Tap the creature, then its home.",
                        [pair("1", "Fish", "Pond or river"), pair("2", "Squirrel", "Tree"), pair("3", "Earthworm", "Soil"), pair("4", "Honey bee", "Hive")],
                        "Each creature is built for one special home.",
                        "Where do we mostly see fish? Where does a bee return to?", "understanding", "easy"),
                    m("Match each plant to its everyday use.",
                        "Pair the plant with what people use it for.",
                        [pair("1", "Neem", "Medicinal shade and tooth-care sticks"), pair("2", "Mango", "Fruit and shade"), pair("3", "Tulsi", "Herbal tea and temple offering"), pair("4", "Bamboo", "Baskets, poles and furniture")],
                        "Every plant in this list earns its place in village life.",
                        "What is neem famous for? What holds water as a pole?", "application", "medium"),
                    m("Match each animal to the balance it keeps in nature.",
                        "Pair the animal with its helpful role.",
                        [pair("1", "Frogs", "Eat insects and keep the pond balanced"), pair("2", "Snakes", "Control rats in fields"), pair("3", "Wetland birds", "Thrive where marsh is protected"), pair("4", "Vultures", "Clean up dead animals quickly")],
                        "Even creatures people fear keep nature's balance working.",
                        "Who controls the rats that eat the harvest?", "reasoning", "hard"),
                    m("Match each crop to the Tamil Nadu region it suits.",
                        "Pair the crop with the land it thrives in.",
                        [pair("1", "Paddy (rice)", "Kaveri delta wetlands"), pair("2", "Coconut", "Coastal belt"), pair("3", "Palmyrah", "Dry regions"), pair("4", "Millets (cumbu)", "Dryland farms")],
                        "Water availability decides which crop a region can grow.",
                        "Which crop needs flooded fields? Which grows with little water?", "application", "medium"),
                    m("Match each weather clue to what it tells you.",
                        "Pair the observation with its meaning.",
                        [pair("1", "Dark heavy clouds", "Rain is likely soon"), pair("2", "Dry leaves everywhere", "Dry or summer season"), pair("3", "Dew on morning grass", "Cool, calm morning"), pair("4", "Cold northern wind", "Winter is setting in")],
                        "Observing sky, leaves, dew and wind helps you read the seasons.",
                        "What does dew on grass often mean?", "understanding", "medium"),
                ],
            },
        ],
    },
    {
        id: "science",
        name: "Scientific & Analytical Skills",
        short: "Observe, predict, experiment and read data like a scientist",
        color: "#6366f1",
        icon: "FiCompass",
        intro: "Science starts with good questions: watch carefully, predict what happens, test it and explain why. Practice thinking like a young scientist.",
        minutesTip: "3–5 min per game",
        activities: [
            {
                id: "science-detective",
                title: "Science Detective",
                tagline: "Observe a scene and find the reason behind what you see",
                icon: "FiSearch",
                minutes: 5,
                goal: "Connect observations to the science that explains them.",
                tasks: [
                    c("A potted plant's leaves all turn toward the window. Why?",
                        ["Plants grow toward light", "The leaves are avoiding water", "Wind pushed them sideways", "The leaves follow the classroom clock"],
                        0, "Plants grow toward light (phototropism) to make more food.", "What does a plant need sunlight for?", "understanding", "easy"),
                    c("Sugar dissolves faster in hot water than in cold water. Best explanation?",
                        ["Heat speeds up dissolving", "Hot water holds more sugar by nature", "Cold water pushes sugar away", "Sugar melts like ice in heat"],
                        0, "Higher temperature gives particles more energy to dissolve faster.", "What changes between hot and cold cups?", "understanding", "medium"),
                    c("A heavy steel ship floats, but a steel nail sinks. Why?",
                        ["The ship's shape makes it displace a lot of water", "Ships are made of a lighter metal", "The nail is iron but the ship is not metal", "Salt water secretly holds steel up"],
                        0, "Buoyancy depends on the volume of water displaced — the ship's hollow shape displaces plenty.", "What is different about the SHAPE, not the metal?", "reasoning", "hard"),
                    c("Dew appears on grass in the early morning. This happens because…",
                        ["Water vapour in the cool air condenses on the grass", "The grass sweats during the night", "A light rain fell unseen at night", "Insects spray drops of water"],
                        0, "Cool surfaces make the air's water vapour turn back into tiny droplets — dew.", "Where does that water come from before it is a drop?", "reasoning", "medium"),
                    c("You see lightning, then hear its thunder a few seconds later. Why?",
                        ["Light travels much faster than sound", "Sound left the cloud earlier than light", "Thunder is made much farther away than lightning", "Clouds block sound for a while"],
                        0, "Light outruns sound by nearly a million times, so thunder always arrives later.", "Which one — light or sound — wins the race?", "understanding", "hard"),
                ],
            },
            {
                id: "hypothesis-hero",
                title: "Hypothesis Hero",
                tagline: "Predict what happens before the experiment runs",
                icon: "FiBold",
                minutes: 5,
                goal: "Make a prediction, then read the surprise-free explanation.",
                tasks: [
                    c("Predict: a paper ball is stuck at the bottom of an upside-down glass, pushed straight into water. The paper will…",
                        ["Stay dry — air is trapped inside", "Soak instantly", "Dissolve in the water", "Float out through the bottom"],
                        0, "Air holds its place in the glass, so water cannot reach the paper.",
                        "What fills the glass before it enters water?", "reasoning", "easy"),
                    c("Predict: a metal ball and a wooden ball of the SAME size drop from the same height. They land…",
                        ["At the same time", "Metal always first", "Wood always first", "Depends on their colour"],
                        0, "With the same size and shape, air drag is nearly equal, so gravity brings them down together.",
                        "What force acts on BOTH balls equally?", "reasoning", "medium"),
                    c("Predict: a plant is kept in a dark cupboard for a week. It will…",
                        ["Grow pale and weak", "Grow taller and greener", "Flower early", "Stay exactly the same"],
                        0, "Without light, the plant cannot make food — leaves stay pale and weak.",
                        "What does the plant lose without light?", "understanding", "medium"),
                    c("Predict: salt is added to water and the pot is boiled. What happens?",
                        ["The water's boiling point rises slightly and the remaining water tastes salty", "It freezes instead of boiling", "The salt disappears completely into the steam", "The water turns into oil"],
                        0, "Salt raises the boiling point a little and stays behind with the water — it does not evaporate.",
                        "Where does solid salt GO when water boils away?", "reasoning", "hard"),
                    c("Predict: a strong magnet is moved over a bowl of paperclips and copper coins. It will pick…",
                        ["Only the paperclips", "Everything equally", "Only the coins", "Nothing at all"],
                        0, "Iron and steel (paperclips) are magnetic; copper coins are not.",
                        "Which materials does a magnet attract?", "understanding", "hard"),
                ],
            },
            {
                id: "cause-effect",
                title: "Cause & Effect",
                tagline: "Arrange chains of events from cause to final effect",
                icon: "FiLink2",
                minutes: 5,
                goal: "Order the steps of real-world chains so the cause leads to the effect.",
                tasks: [
                    o("Arrange the chain: heavy rain on farm land.",
                        "Order what happens from the rain to the final result.",
                        [step("Heavy rain falls on the open field"), step("Topsoil washes into the stream"), step("The stream carries the soil away"), step("The field loses its rich top layer"), step("The next crop grows weaker")],
                        "Rain loosens soil → wash-off → carried away → lost topsoil → weaker crop.",
                        "What happens to loose soil when water runs over it?", "reasoning", "medium"),
                    o("Arrange the chain: waste piled in a street drain.",
                        "Order the events from the dumped waste to the final risk.",
                        [step("Plastic and garbage pile up in the drain"), step("The drain blocks completely"), step("Rainwater pools on the road"), step("Mosquitoes breed in the standing water"), step("The risk of dengue rises")],
                        "Dumped waste blocks → water pools → mosquitoes breed → disease risk rises.",
                        "Why do mosquitoes love the pool the garbage created?", "application", "medium"),
                    o("Arrange the chain: someone clicks a suspicious link.",
                        "Order what happens after the click.",
                        [step("The link asks for a one-time password"), step("The person shares the OTP", "OTP"), step("The account is misused"), step("Money or messages are lost"), step("The user reports it to the bank and police")],
                        "Click → OTP asked → OTP shared → account misused → loss → reporting limits the damage.",
                        "Where does sharing the OTP sit in this chain?", "reasoning", "hard"),
                    o("Arrange the chain: a seed becomes a tree.",
                        "Order the natural chain of growth.",
                        [step("A ripe mango falls and the seed stays in the soil"), step("Rain soaks the ground"), step("The seed sprouts"), step("The sapling grows for years"), step("A new tree bears mangoes")],
                        "Fruit falls → rain → sprout → grow → fruit again.",
                        "What must the seed receive before it sprouts?", "understanding", "easy"),
                    o("Arrange the chain: switching off extra lights at night.",
                        "Order the environmental chain of one small habit.",
                        [step("Extra lights stay switched off"), step("The household uses less electricity"), step("The power plant burns less coal"), step("Less smoke enters the air"), step("The air stays cleaner and the earth stays cooler")],
                        "Fewer lights → less power → less coal → less smoke → cleaner, cooler air.",
                        "How does a switch connect to the smoke of a power plant?", "application", "hard"),
                ],
            },
        ],
    },
];

// Each activity is single-mechanic; derive the public `mechanic` label from its
// first task so routes/cards can display it without repeating it in content.
for (const cat of CATEGORIES) {
    for (const act of cat.activities) {
        if (!act.mechanic) act.mechanic = act.tasks[0] ? act.tasks[0].type : "choice";
    }
}

// ────────────────────────────────────────────────────────────────────────────
// DIAGNOSTIC — one quick question per category (game-style, 8 tasks). Answer
// keys are evaluated exactly like the activity mechanics. Each task carries a
// `category` that routes its evidence to the right skill profile.
// ────────────────────────────────────────────────────────────────────────────
const DIAGNOSTIC = [
    { category: "communication", ...c("A new classmate cannot find the library and looks lost. You…", ["Offer to walk them there and ask their favourite subject", "Point vaguely and walk away", "Say 'you will manage'", "Ask them instead where YOUR next class is"], 0, "A clear, kind offer is the friendly and effective response.", "What would make them feel at home?", "communication", "easy") },
    { category: "logical-thinking", ...p("What comes next? 2, 4, 8, 16, ?", ["2", "4", "8", "16", "32"], ["32", "24", "20", "30"], 0, "Each number doubles.", "What is double of 16?", "The numbers double each time.", "easy") },
    { category: "digital", ...c("Someone you only know online asks for your password 'to win a prize'. You…", ["Do not share it and tell a trusted adult", "Share it — prizes sound fun", "Share it after changing one letter", "Give them a parent's password instead"], 0, "Passwords are private; prize tricks are a classic scam.", "Who should ever know your password?", "application", "easy") },
    { category: "creativity", ...c("Which is the most creative REUSE of an old bicycle tyre? Consider usefulness and safety.", ["Turn it into a garden swing or planter with adult help", "Throw it into the pond", "Burn it to make smoke shapes", "Bury it behind the school"], 0, "Reusing the tyre safely as a planter or swing gives it a new useful life; burning or dumping it harms the environment.", "Which idea creates something useful and stays safe?", "application", "medium") },
    { category: "social", ...c("A teammate is upset after a bad game. You…", ["'You tried really hard — let's practice together next week.'", "'We lost because of you.'", "Ignore them completely", "Change the topic loudly to sports news"], 0, "Kind words plus a practice plan keep the team together.", "Which reply keeps the team strong?", "communication", "easy") },
    { category: "life-skills", ...c("You get ₹200 allowance. You need a ₹60 notebook and want a ₹120 game track. The wise order is…", ["Buy the notebook now, then save for the game", "Buy the game now, notebook later", "Spend everything on snacks", "Lend the whole ₹200 to a friend"], 0, "Needs come first; saving after that still reaches the game.", "Which buy is a need today?", "reasoning", "medium") },
    { category: "environment", ...s("Where should a banana peel go? Sort each item into the right bin.",
        "Choose the bin for each item.",
        [{ id: "org", label: "Organic bin" }, { id: "rec", label: "Recyclable bin" }],
        [sitem("dg1", "Banana peel", 0), sitem("dg2", "Empty water bottle", 1), sitem("dg3", "Tea leaves", 0), sitem("dg4", "Newspaper", 1)],
        "Food waste composts; bottles and paper recycle.",
        "Would a worm break it down?", "understanding", "easy") },
    { category: "science", ...c("Predict: a paper ball pressed into the bottom of an upside-down glass, pushed into water. The paper…", ["Stays dry because air is trapped", "Soaks immediately", "Turns to pulp instantly", "Floats away through the glass"], 0, "Trapped air keeps the water out.", "What fills the glass first?", "reasoning", "easy") },
];

// ────────────────────────────────────────────────────────────────────────────
// Public / grading helpers
// ────────────────────────────────────────────────────────────────────────────

// Client-safe copy of one task (answer key and correct order/bucket mappings
// NEVER leave the server; the pattern `rule` is also withheld — it reveals it).
function stripForClient(task) {
    const base = {
        type: task.type,
        prompt: task.prompt,
        cognitiveType: task.cognitiveType,
        difficulty: task.difficulty,
        weight: task.weight,
    };
    if (task.tips) base.tips = task.tips;
    if (task.brief) base.brief = task.brief;
    if (task.options) base.options = task.options;
    if (task.sequence) base.sequence = task.sequence.slice(0, -1); // last item is the hidden answer
    if (task.legend) base.legend = task.legend;
    if (task.code) base.code = task.code;
    switch (task.type) {
        case "order":
            base.steps = task.steps.map((st) => ({ id: st.id, label: st.label }));
            base.intro = task.intro;
            break;
        case "sort":
            base.buckets = task.buckets.map((b) => ({ id: b.id, label: b.label }));
            base.items = task.items.map((it) => ({ id: it.id, label: it.label }));
            base.intro = task.intro;
            break;
        case "match":
            base.intro = task.intro;
            base.leftItems = task.pairs.map((pr) => pr.a);
            base.rightItems = task.pairs.map((pr) => pr.b);
            break;
        default:
            break;
    }
    return base;
}

function categoryById(id) {
    return CATEGORIES.find((cat) => cat.id === id) || null;
}

function activityById(categoryId, activityId) {
    const cat = categoryById(categoryId);
    if (!cat) return null;
    return cat.activities.find((a) => a.id === activityId) || null;
}

function levelSlice(level) {
    const meta = LEVEL_META[level] || LEVEL_META[1];
    return { start: meta.slice[0], end: meta.slice[1], meta };
}

// Tasks for a given activity + level, in original order (with answer keys).
function tasksForLevel(activity, level) {
    const { start, end } = levelSlice(level);
    return activity.tasks.slice(start, end);
}

// Stripped tasks for the client, tagged with their taskIndex inside the attempt.
function publicTasks(activity, level) {
    return tasksForLevel(activity, level).map((task, i) => ({
        taskIndex: i,
        hintAllowed: true,
        ...stripForClient(task),
    }));
}

// Weights: base weight by task position within the (easy→hard) activity list,
// boosted by difficulty. Used for both scoring and LD-NBSE evidence weight.
function weightForTask(activity, level, sliceIndex) {
    const { start } = levelSlice(level);
    const globalIdx = start + sliceIndex;
    const task = activity.tasks[globalIdx];
    const base = TASK_WEIGHT[globalIdx] ?? 1;
    const bump = task && task.difficulty === "hard" ? 1 : task && task.difficulty === "medium" ? 0.5 : 0;
    return base + bump;
}

function getCategories() {
    return CATEGORIES.map(({ activities, ...cat }) => ({
        ...cat,
        activityIds: activities.map((a) => a.id),
        activityCount: activities.length,
    }));
}

function getDiagnostic() {
    return DIAGNOSTIC.map((task, i) => ({ taskIndex: i, ...task }));
}

module.exports = {
    CATEGORIES,
    LEVEL_META,
    UNLOCK_SCORE,
    getCategories,
    categoryById,
    activityById,
    tasksForLevel,
    publicTasks,
    weightForTask,
    getDiagnostic,
    stripForClient,
};