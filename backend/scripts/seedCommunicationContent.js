const mongoose = require("mongoose");
const dotenv = require("dotenv");
const CommunicationContent = require("../models/CommunicationContent");

dotenv.config({ path: require("path").join(__dirname, "..", ".env") });

const EMOTION_QUESTIONS = [
  {
    id: 1,
    emoji: "😢",
    question: "Your friend got a low score in math and is sitting alone. What are they feeling?",
    correct: "Sad",
    options: ["Sad", "Happy", "Angry", "Excited"],
    followUp: "What should you do to show empathy?",
    followUpOptions: [
      { text: "Go comfort them and offer to study together.", empathy: true },
      { text: "Ignore them and go play with others.", empathy: false },
      { text: "Laugh and tease them about the grade.", empathy: false }
    ]
  },
  {
    id: 2,
    emoji: "😡",
    question: "Someone accidentally spilled water on your notebook and didn't see it. How do you feel?",
    correct: "Angry",
    options: ["Happy", "Sad", "Angry", "Shy"],
    followUp: "What is the best way to handle this?",
    followUpOptions: [
      { text: "Take a deep breath and tell them politely to be careful.", empathy: true },
      { text: "Scream at them and throw their notebook too.", empathy: false },
      { text: "Cry and refuse to talk to anyone.", empathy: false }
    ]
  },
  {
    id: 3,
    emoji: "🤩",
    question: "Your sister just won the school drawing competition. What is she feeling?",
    correct: "Excited",
    options: ["Angry", "Excited", "Scared", "Confused"],
    followUp: "How can you share her happiness?",
    followUpOptions: [
      { text: "Say 'Congratulations! I am so proud of you!'", empathy: true },
      { text: "Say 'Your drawing wasn't even that good.'", empathy: false },
      { text: "Ignore her completely.", empathy: false }
    ]
  },
  {
    id: 4,
    emoji: "🤔",
    question: "The teacher asks a difficult question and your friend is scratching their head. What are they feeling?",
    correct: "Confused",
    options: ["Happy", "Confused", "Angry", "Proud"],
    followUp: "How can you help them politely?",
    followUpOptions: [
      { text: "Wait for them to think, or whisper a hint if allowed.", empathy: true },
      { text: "Shout 'They don't know the answer!'", empathy: false },
      { text: "Laugh at their expression.", empathy: false }
    ]
  },
  {
    id: 5,
    emoji: "😨",
    question: "A street dog starts barking loudly at your little brother. What is he feeling?",
    correct: "Scared",
    options: ["Scared", "Excited", "Shy", "Angry"],
    followUp: "What should you do?",
    followUpOptions: [
      { text: "Hold his hand firmly, stand tall, and walk away slowly.", empathy: true },
      { text: "Run away and leave him behind.", empathy: false },
      { text: "Throw stones at the dog to make it angrier.", empathy: false }
    ]
  },
  {
    id: 6,
    emoji: "😳",
    question: "You have to stand in front of the whole school assembly to give a speech. How do you feel?",
    correct: "Shy",
    options: ["Angry", "Sad", "Shy", "Excited"],
    followUp: "How can you build your confidence?",
    followUpOptions: [
      { text: "Take three deep breaths, smile, and speak slowly.", empathy: true },
      { text: "Run off the stage and cry.", empathy: false },
      { text: "Refuse to look at the audience and speak in a whisper.", empathy: false }
    ]
  },
  {
    id: 7,
    emoji: "😎",
    question: "Your team completed the science project and the teacher praised it. What are you feeling?",
    correct: "Proud",
    options: ["Confused", "Proud", "Scared", "Sad"],
    followUp: "How should you acknowledge this success?",
    followUpOptions: [
      { text: "Thank the teacher and share the credit with your teammates.", empathy: true },
      { text: "Say 'I did all the work myself, they did nothing.'", empathy: false },
      { text: "Show off and call other teams slow.", empathy: false }
    ]
  },
  {
    id: 8,
    emoji: "😊",
    question: "A classmate shares their lunch with you when you forgot yours. How do you feel?",
    correct: "Happy",
    options: ["Angry", "Scared", "Happy", "Sad"],
    followUp: "How should you respond?",
    followUpOptions: [
      { text: "Smile warmly and say 'Thank you so much, that is very kind of you!'", empathy: true },
      { text: "Take it without saying anything.", empathy: false },
      { text: "Say 'I don't really like this food' and throw it.", empathy: false }
    ]
  },
  {
    id: 9,
    emoji: "😕",
    question: "Everyone is playing games but one new student is standing near the corner wall. What are they feeling?",
    correct: "Shy",
    options: ["Shy", "Angry", "Excited", "Proud"],
    followUp: "What is the best way to make them feel welcome?",
    followUpOptions: [
      { text: "Walk up, introduce yourself, and invite them to play.", empathy: true },
      { text: "Stare at them from far away.", empathy: false },
      { text: "Tell others to stay away from the new kid.", empathy: false }
    ]
  },
  {
    id: 10,
    emoji: "😡",
    question: "A friend drops your favourite pencil box and it breaks. What is your instant feeling?",
    correct: "Angry",
    options: ["Happy", "Confused", "Angry", "Proud"],
    followUp: "How can you communicate calmly?",
    followUpOptions: [
      { text: "Say 'It's okay, accidents happen. Let's pick them up together.'", empathy: true },
      { text: "Call them names and throw their pencil box.", empathy: false },
      { text: "Go report them to the principal immediately.", empathy: false }
    ]
  },
  {
    id: 11,
    emoji: "😢",
    question: "Your pet dog is unwell and is sleeping quietly. How do you feel?",
    correct: "Sad",
    options: ["Excited", "Sad", "Angry", "Shy"],
    followUp: "How should you care for them?",
    followUpOptions: [
      { text: "Sit beside them quietly and give them fresh water.", empathy: true },
      { text: "Force them to run and play with you.", empathy: false },
      { text: "Make loud noises nearby.", empathy: false }
    ]
  },
  {
    id: 12,
    emoji: "🤩",
    question: "Father says your family is going to a theme park this Sunday. What is your emotion?",
    correct: "Excited",
    options: ["Sad", "Confused", "Excited", "Scared"],
    followUp: "How should you show gratitude?",
    followUpOptions: [
      { text: "Hug him and say 'Thank you, Dad! I am so excited!'", empathy: true },
      { text: "Complain about why you didn't go last week instead.", empathy: false },
      { text: "Ask for money to buy expensive toys there.", empathy: false }
    ]
  },
  {
    id: 13,
    emoji: "😕",
    question: "The teacher speaks in English and you don't understand one word. What is your feeling?",
    correct: "Confused",
    options: ["Confused", "Proud", "Angry", "Happy"],
    followUp: "What should you do?",
    followUpOptions: [
      { text: "Raise your hand politely and ask, 'Teacher, could you explain that again?'", empathy: true },
      { text: "Stay silent and copy from your friend's notebook.", empathy: false },
      { text: "Start talking to your neighbour instead.", empathy: false }
    ]
  },
  {
    id: 14,
    emoji: "😨",
    question: "You hear a loud thunder crack while you are alone in your room. What do you feel?",
    correct: "Scared",
    options: ["Happy", "Angry", "Scared", "Proud"],
    followUp: "How can you calm down?",
    followUpOptions: [
      { text: "Drink some water, hug a pillow, and tell your parents you feel scared.", empathy: true },
      { text: "Hide under the bed and stay there for hours.", empathy: false },
      { text: "Scream at the top of your lungs.", empathy: false }
    ]
  },
  {
    id: 15,
    emoji: "😳",
    question: "You tore your uniform by mistake while playing. How do you feel before going home?",
    correct: "Shy",
    options: ["Shy", "Happy", "Proud", "Angry"],
    followUp: "How should you report this to your parents?",
    followUpOptions: [
      { text: "Tell the truth immediately and say 'I'm sorry, I will be careful next time.'", empathy: true },
      { text: "Hide the uniform at the bottom of the closet.", empathy: false },
      { text: "Blame your friend and say they pushed you on purpose.", empathy: false }
    ]
  },
  {
    id: 16,
    emoji: "😎",
    question: "You built a very tall block tower all by yourself. What do you feel?",
    correct: "Proud",
    options: ["Proud", "Sad", "Confused", "Angry"],
    followUp: "How can you invite your friends to join?",
    followUpOptions: [
      { text: "Say 'Look what I made! Let's build a town together now!'", empathy: true },
      { text: "Say 'I built this and nobody is allowed to touch it.'", empathy: false },
      { text: "Kick the tower down so no one else can see it.", empathy: false }
    ]
  },
  {
    id: 17,
    emoji: "😊",
    question: "A friend says they really like your new shoes. How do you feel?",
    correct: "Happy",
    options: ["Angry", "Happy", "Sad", "Confused"],
    followUp: "How should you respond politely?",
    followUpOptions: [
      { text: "Smile and say, 'Thank you! That's very nice of you to say.'", empathy: true },
      { text: "Say 'I know, they are much better than yours.'", empathy: false },
      { text: "Ignore them and look at your shoes.", empathy: false }
    ]
  },
  {
    id: 18,
    emoji: "😢",
    question: "Your classmate is crying because they lost their school bus pass. What are they feeling?",
    correct: "Sad",
    options: ["Sad", "Excited", "Proud", "Confused"],
    followUp: "How can you help them?",
    followUpOptions: [
      { text: "Help them search their desk and bag, and tell the class teacher.", empathy: true },
      { text: "Tell them to shut up because they are making noise.", empathy: false },
      { text: "Walk away because it's not your problem.", empathy: false }
    ]
  },
  {
    id: 19,
    emoji: "🤔",
    question: "You are trying to read a roadmap but the signs are written in symbols. How do you feel?",
    correct: "Confused",
    options: ["Confused", "Proud", "Happy", "Angry"],
    followUp: "What should you do?",
    followUpOptions: [
      { text: "Look for a legend key, or ask a passing adult politely for directions.", empathy: true },
      { text: "Throw the map on the ground and get angry.", empathy: false },
      { text: "Sit down on the road and start crying.", empathy: false }
    ]
  },
  {
    id: 20,
    emoji: "😊",
    question: "A senior student guides you safely across the busy road. How do you feel?",
    correct: "Happy",
    options: ["Sad", "Happy", "Scared", "Angry"],
    followUp: "What should you say to them?",
    followUpOptions: [
      { text: "Look them in the eye, smile, and say 'Thank you for helping me cross!'", empathy: true },
      { text: "Walk away quickly without saying anything.", empathy: false },
      { text: "Say 'I could have crossed myself, I don't need help.'", empathy: false }
    ]
  }
];

const MICROPHONE_TOPICS = [
  "Describe your school.",
  "Describe your best friend.",
  "If animals could talk, which animal would be funniest?",
  "Describe your favourite teacher.",
  "Why should we help others?",
  "Describe your dream house.",
  "What would you do if you became Principal?",
  "Tell us about your favourite game.",
  "What makes you smile?",
  "Describe your village or city."
];

const CONVERSATION_SETS = [
  {
    name: "Meeting a Teacher",
    cards: [
      { id: "c1", text: "Good Morning, Teacher!" },
      { id: "c2", text: "Good morning! How can I help you today?" },
      { id: "c3", text: "Can you please explain the science question?" },
      { id: "c4", text: "Of course! Let's solve it together." },
      { id: "c5", text: "Thank you so much, Teacher!" }
    ],
    correctOrder: ["c1", "c2", "c3", "c4", "c5"]
  },
  {
    name: "Sharing lunch with a Friend",
    cards: [
      { id: "c1", text: "Hi! You look quiet. Did you bring your lunch today?" },
      { id: "c2", text: "Oh, I actually forgot my lunchbox at home." },
      { id: "c3", text: "Don't worry at all! We can share my lunch." },
      { id: "c4", text: "That is so kind of you! Thank you so much." },
      { id: "c5", text: "You are welcome! Let's eat together." }
    ],
    correctOrder: ["c1", "c2", "c3", "c4", "c5"]
  }
];

const SIMULATOR_SCENARIOS = [
  // Classroom
  { id: 1, location: "Classroom", title: "Teacher Enters the Room", question: "The teacher walks into the classroom carrying heavy books. What should you do?", options: [{ text: "Stand up immediately, greet them politely, and ask if they need help holding the books.", correct: true, feedback: "Awesome! Greet teachers politely and show willingness to help." }, { text: "Keep sitting down and talk loudly to your friends.", correct: false, feedback: "Oops! Ignoring a teacher when they enter is impolite." }, { text: "Run out of the classroom to play.", correct: false, feedback: "Oh no! Running out when the teacher enters is highly disrespectful." }] },
  { id: 2, location: "Classroom", title: "Hard Math Question", question: "The math teacher explains a problem but you are unable to follow. What should you do?", options: [{ text: "Raise your hand politely and say, 'Excuse me teacher, could you repeat this step?'", correct: true, feedback: "Spot on! Asking questions respectfully is how a hero learns." }, { text: "Stay quiet and copy the final answer from your neighbor.", correct: false, feedback: "Oh! Copying without understanding doesn't help you grow." }, { text: "Start playing with your eraser and ignore the board.", correct: false, feedback: "Not good! Distracting yourself will make you fall behind." }] },
  { id: 3, location: "Classroom", title: "Dropped Pencil Box", question: "Your classmate's pencil box falls down and pencils roll everywhere. What should you do?", options: [{ text: "Quickly bend down and help them gather the pencils.", correct: true, feedback: "Wonderful! Helping others in need builds strong friendships." }, { text: "Laugh loudly at them and say 'You are so clumsy!'", correct: false, feedback: "Oops! Making fun of someone's accident hurts their feelings." }, { text: "Steal one of the fallen fancy pens and put it in your bag.", correct: false, feedback: "Caution! Stealing is wrong and destroys trust." }] },
  { id: 4, location: "Classroom", title: "Borrowing an Eraser", question: "A classmate forgot their eraser and asks you for one. You have two erasers. What should you do?", options: [{ text: "Smile and say, 'Sure, here you go! Just return it after class.'", correct: true, feedback: "Great! Sharing with classmates shows kindness and team spirit." }, { text: "Say 'No, buy your own!' and hide your pencil box.", correct: false, feedback: "Oh! Being greedy or rude creates a bad learning atmosphere." }, { text: "Throw the eraser at their face.", correct: false, feedback: "Warning! Throwing objects is dangerous and disrespectful." }] },
  // Library
  { id: 5, location: "Library", title: "Loud Talking", question: "Your friend starts talking loudly about a cartoon in the quiet reading zone. What should you do?", options: [{ text: "Whisper softly, 'Let's go outside if we want to talk. We need to keep quiet in the library.'", correct: true, feedback: "Perfect! Respecting public guidelines and helping friends follow them is leadership." }, { text: "Shout loudly, 'BE QUIET!' at them.", correct: false, feedback: "Oh! Screaming to make someone else quiet only increases the noise." }, { text: "Join them and talk even louder.", correct: false, feedback: "Not right! Library is a place for quiet reading." }] },
  { id: 6, location: "Library", title: "Missing Book", question: "You want to find a book about space but you can't find it on the shelf. What should you do?", options: [{ text: "Approach the librarian, say 'Excuse me, Sir/Madam, could you help me find the book about space?'", correct: true, feedback: "Brilliant! Librarians are happy to help when asked politely." }, { text: "Start pulling all books off the shelf in anger.", correct: false, feedback: "Oh no! Messing up the shelves is disrespectful to everyone." }, { text: "Leave the library and complain that there are no books.", correct: false, feedback: "Giving up easily stops you from learning." }] },
  { id: 7, location: "Library", title: "Dropped Book", question: "You accidentally pull a book down and its pages fold slightly. What should you do?", options: [{ text: "Carefully pick it up, flatten the pages, and put it back in its slot.", correct: true, feedback: "Excellent! Taking responsibility for your actions is a key value." }, { text: "Kick it under the shelf so the librarian won't see.", correct: false, feedback: "Oh! Hiding your mistakes is dishonest." }, { text: "Blame another student standing near you.", correct: false, feedback: "Caution! Blaming others for your mistakes is wrong." }] },
  // Playground
  { id: 8, location: "Playground", title: "Fallen Friend", question: "A friend falls down while playing football and scrapes their knee. What should you do?", options: [{ text: "Stop playing immediately, help them sit down, and call a teacher or get first aid.", correct: true, feedback: "Heroic! Care for your friend is always more important than a game." }, { text: "Keep running and yell, 'Get up! Don't ruin our game!'", correct: false, feedback: "Oh! Sports should teach empathy, not selfishness." }, { text: "Sit and laugh at how they fell.", correct: false, feedback: "No! Making fun of someone in pain is cruel." }] },
  { id: 9, location: "Playground", title: "Joining a Game", question: "A group of classmates is playing cricket and you want to join. What should you do?", options: [{ text: "Wait for a pause, walk up, and ask politely, 'Can I join your game in the next round?'", correct: true, feedback: "Superb! Polite entry is the best way to get invited to play." }, { text: "Snatch the bat from the batsman and declare it's your turn.", correct: false, feedback: "Oh no! Pushing your way in causes fights." }, { text: "Stand nearby and make fun of their play so they get annoyed.", correct: false, feedback: "Rude! Teasing others won't make them want to play with you." }] },
  { id: 10, location: "Playground", title: "Losing a Game", question: "Your team loses the inter-class match. Everyone on your team looks sad. What should you do?", options: [{ text: "Smile, shake hands with the opponents, and say 'Well played! Let's practice harder next time.'", correct: true, feedback: "Great Sportsmanship! True heroes win with humility and lose with respect." }, { text: "Throw the ball in anger and yell that the opponent team cheated.", correct: false, feedback: "Bad sportsmanship! Blaming others for a loss shows poor character." }, { text: "Sit on the ground and refuse to go back to class.", correct: false, feedback: "Crying over a game won't improve your skills." }] },
  { id: 11, location: "Playground", title: "Teased about Drawing", question: "Someone laughs at your drawing on the blackboard. What should you do?", options: [{ text: "Say calmly, 'I am still practicing and I enjoy drawing' and walk away confidently.", correct: true, feedback: "Confident! Don't let negative comments affect your self-belief." }, { text: "Scribble on their notebook to get revenge.", correct: false, feedback: "Revenge only escalates arguments." }, { text: "Erase the board and promise never to draw again.", correct: false, feedback: "Oh! Giving up your interests because of teasing is sad." }] },
  // School Bus
  { id: 12, location: "School Bus", title: "No Seat for Elder", question: "An elderly teacher boards the school bus but there are no empty seats. What should you do?", options: [{ text: "Stand up immediately, smile, and offer them your seat.", correct: true, feedback: "Fantastic! Respecting and caring for elders is a noble trait." }, { text: "Look out of the window and pretend you didn't see them.", correct: false, feedback: "Oh! Pretending to sleep or look away is discourteous." }, { text: "Spread your bag on the next seat so no one can sit.", correct: false, feedback: "Not right! Public transport seats should be shared." }] },
  { id: 13, location: "School Bus", title: "Leaving the Bus", question: "The school bus reaches your stop. How do you leave?", options: [{ text: "Walk down in a line, say 'Thank you, Uncle!' to the driver, and step down safely.", correct: true, feedback: "Polite! Showing gratitude to service staff is a hallmark of good communication." }, { text: "Push younger children to exit first.", correct: false, feedback: "Careful! Pushing can cause injuries." }, { text: "Jump from the moving bus to save time.", correct: false, feedback: "Highly dangerous! Never jump off a moving vehicle." }] },
  { id: 14, location: "School Bus", title: "Bus Littering", question: "A classmate is throwing chocolate wrappers out of the bus window. What should you do?", options: [{ text: "Say politely, 'Uncle will have to clean the bus later. Let's keep a small trash pouch.'", correct: true, feedback: "Active Citizen! Reminding friends to keep environment clean politely is leadership." }, { text: "Throw your own wrappers out to join them.", correct: false, feedback: "No! Littering is bad for our planet." }, { text: "Scream at them and call them names.", correct: false, feedback: "Rude! Speak politely to teach, not to fight." }] },
  // Lunch Hall
  { id: 15, location: "Lunch Hall", title: "Forgotten Lunchbox", question: "Your friend sits at the lunch table and looks sad because they forgot their box. What should you do?", options: [{ text: "Say 'Hey, don't worry! I have plenty of idlis today. Let's share!'", correct: true, feedback: "Heartwarming! Sharing meals fosters deep bonds and empathy." }, { text: "Eat your food quickly so they don't ask you for any.", correct: false, feedback: "Selfish! Seeing a hungry friend and not sharing is sad." }, { text: "Make fun of them for forgetting their box.", correct: false, feedback: "Cruel! It makes their day even worse." }] },
  { id: 16, location: "Lunch Hall", title: "Spilled Water", question: "You accidentally knock over your water cup on the lunch table. What should you do?", options: [{ text: "Quickly grab a rag or tissue paper and clean up the table.", correct: true, feedback: "Responsible! Cleaning up your own mess is good discipline." }, { text: "Walk away immediately and let the cleaning staff handle it.", correct: false, feedback: "Oh! Leaving a mess for others is irresponsible." }, { text: "Blame the student sitting next to you for bumping into you.", correct: false, feedback: "Dishonest! Own up to your actions." }] },
  { id: 17, location: "Lunch Hall", title: "Sharing Snack", question: "A classmate asks to taste the special sweet mother packed for you. What should you do?", options: [{ text: "Give them a piece and say 'Sure, tell me how you like it!'", correct: true, feedback: "Friendly! Sharing snacks spreads joy." }, { text: "Lick the entire snack so they won't want it.", correct: false, feedback: "Yuck! That is unhygienic and impolite." }, { text: "Say 'No, my mother only made this for me!'", correct: false, feedback: "Rude! Express things politely even if you can't share." }] },
  // Home
  { id: 18, location: "Home", title: "Tired Mother", question: "Mother returns home from work looking very tired. What should you do?", options: [{ text: "Bring her a glass of fresh water, ask how her day was, and help arrange the table.", correct: true, feedback: "Awesome! Showing empathy and helping parents makes you a family hero." }, { text: "Demand that she immediately prepare snacks for you.", correct: false, feedback: "Selfish! Parents need care and respect too." }, { text: "Lock yourself in the room to play games on the phone.", correct: false, feedback: "Detached! Spend quality time with family." }] },
  { id: 19, location: "Home", title: "Studying Sibling", question: "Your sister is studying for her final board exam, but you want to play sound games. What should you do?", options: [{ text: "Use headphones or play a quiet game so she can concentrate.", correct: true, feedback: "Respectful! Creating a quiet space shows you respect their goals." }, { text: "Turn up the TV volume and say 'It's my playtime now.'", correct: false, feedback: "Selfish! Disrupting someone's study causes tension." }, { text: "Argue with her that her exam is not important.", correct: false, feedback: "Rude! Respect other people's efforts." }] },
  { id: 20, location: "Home", title: "Broken Glass Cup", question: "You accidentally drop a glass cup while getting water and it shatters. What should you do?", options: [{ text: "Tell your parents immediately, apologize, and ask them to help sweep safely.", correct: true, feedback: "Honest and Safe! Admitting mistakes showing truth is always the right path." }, { text: "Hide the broken pieces under the carpet.", correct: false, feedback: "Highly dangerous! Someone could step on it and bleed." }, { text: "Blame the cat for jumping on the shelf.", correct: false, feedback: "Dishonest! Blaming animals or others is wrong." }] }
];

const FLIP_TIPS = [
  { front: "😊 Smile while speaking", back: "A friendly smile puts the listener at ease and shows you are happy to talk." },
  { front: "👂 Listen carefully", back: "Do not just wait for your turn to speak. Hear their words and understand their feelings." },
  { front: "👀 Maintain eye contact", back: "Looking at the person shows you are paying attention and speaking with confidence." },
  { front: "🤝 Respect others", back: "Even if you disagree, listen politely without interrupting or raising your voice." },
  { front: "🙏 Use polite words", back: "Always say 'Please' when asking, 'Thank you' when receiving, and 'Sorry' on mistakes." },
  { front: "🗣️ Speak confidently", back: "Keep your voice clear, stand tall, and do not rush. Take your time to express ideas." },
  { front: "🧠 Think before speaking", back: "Take 5 seconds to plan your words so you speak kindly and clearly." },
  { front: "🌟 Appreciate others", back: "Compliment your friends when they do well. Saying 'Good job!' spreads happiness." }
];

const DAILY_MISSIONS = [
  "Say Thank You.",
  "Smile at one person.",
  "Help your friend.",
  "Introduce yourself.",
  "Listen without interrupting.",
  "Use Please.",
  "Ask Permission.",
  "Share your ideas."
];

const seedCommunicationContent = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await CommunicationContent.deleteMany({});
    console.log("Cleared existing CommunicationContent documents");

    const docs = [];

    EMOTION_QUESTIONS.forEach((q) => {
      docs.push({ contentType: "emotion_question", data: q, order: q.id });
    });

    MICROPHONE_TOPICS.forEach((topic, i) => {
      docs.push({ contentType: "talk_topic", data: { topic }, order: i + 1 });
    });

    CONVERSATION_SETS.forEach((set, i) => {
      docs.push({ contentType: "conversation_set", data: set, order: i + 1 });
    });

    SIMULATOR_SCENARIOS.forEach((s) => {
      docs.push({ contentType: "simulator_scenario", data: { id: s.id, title: s.title, question: s.question, options: s.options }, location: s.location, order: s.id });
    });

    FLIP_TIPS.forEach((tip, i) => {
      docs.push({ contentType: "flip_tip", data: tip, order: i + 1 });
    });

    DAILY_MISSIONS.forEach((mission, i) => {
      docs.push({ contentType: "daily_mission", data: { text: mission }, order: i + 1 });
    });

    await CommunicationContent.insertMany(docs);
    console.log(`Seeded ${docs.length} CommunicationContent documents`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedCommunicationContent();
