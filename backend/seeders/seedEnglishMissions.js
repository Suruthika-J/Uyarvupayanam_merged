// backend/seeders/seedEnglishMissions.js
//
// Class 8 English "Space Explorer" curriculum — the sole source of truth for
// lesson content, objectives, activities and activity answers.
//
// This file is code-as-content on purpose (same convention as the Maths
// MISSION_TOPICS list): editing curriculum = editing this file. Activities'
// correct answers live ONLY here (server-side); the API never ships them to
// the browser. AI-generated assessments are stored separately per student in
// the EnglishAssessment model.
//
// Activity types understood by the frontend and validated by the routes:
//   mcq             - { prompt, options[4], correct, explanation }
//   true-false      - { statement, correct: bool, explanation }
//   fill-blank      - { sentence (with ____), correct: [accepted...], explanation }
//   error-find      - { prompt (wrong), kind: 'choose-correct', options[4], correct, explanation }
//   match-pairs     - { pairs: [{ left, right }] }  -> answer: matched rights in order
//   sentence-order  - { promptHint, lines: [{ id, text }], correctOrder: [ids], explanation }
//
// `world` drives the Planet visual family (planet/moon/station/city/galaxy),
// `accent` gives every area its own colour on the dark galaxy backdrop.

const ENGLISH_AREAS = [
  { id: "grammar", name: "Grammar Galaxy", world: "galaxy", accent: "#8b5cf6", tagline: "Tenses, parts of speech and the rules that make sentences shine." },
  { id: "reading", name: "Reading Nebula", world: "planet", accent: "#0ea5e9", tagline: "Read passages, find the main idea, and read between the lines." },
  { id: "vocabulary", name: "Vocabulary Planet", world: "planet", accent: "#f59e0b", tagline: "Words, their families, and the meanings they carry." },
  { id: "writing", name: "Writing Station", world: "station", accent: "#ec4899", tagline: "Build clear paragraphs, letters and little stories." },
  { id: "listening", name: "Listening Observatory", world: "moon", accent: "#14b8a6", tagline: "Tune your ear to instructions, conversations and stories." },
  { id: "speaking", name: "Speaking Mission", world: "station", accent: "#f97316", tagline: "Introduce, describe, voice an opinion and give instructions." },
];

// ── GRAMMAR GALAXY ─────────────────────────────────────────────────────────
const GRAMMAR = [
  {
    id: "present-tenses", areaId: "grammar", order: 1, name: "Present Tenses",
    tagline: "Simple, continuous, perfect and perfect-continuous for right now.",
    objectives: [
      "Recognise the four present tenses in sentences.",
      "Form each present tense correctly.",
      "Choose the right present tense for habits, actions in progress, experiences and actions that started in the past.",
    ],
    lesson: {
      intro: "Present tenses talk about now — but 'now' can mean a habit, an action in progress, a finished experience, or something that is still going on. The tense tells the listener exactly which one you mean.",
      sections: [
        {
          heading: "The four present tenses",
          body: "English has four present tenses. Simple present is for habits and facts. Present continuous is for actions happening now. Present perfect is for experiences and results. Present perfect continuous is for actions that started in the past and are still going on.",
          points: [
            "Simple present: 'She writes stories.' — a habit or a fact.",
            "Present continuous: 'She is writing a story now.' — happening right now.",
            "Present perfect: 'She has written three stories.' — a finished experience.",
            "Present perfect continuous: 'She has been writing since morning.' — still going on.",
          ],
          timeline: [
            { label: "started in past", text: "has been writing" },
            { label: "finished result", text: "has written" },
            { label: "right now", text: "is writing" },
            { label: "always", text: "writes" },
          ],
        },
        {
          heading: "Forming them",
          body: "Each present tense has its own shape: subject + verb form. With he, she or it, the simple present verb takes -s or -es.",
          points: [
            "Simple present: subject + base form (add -s/-es for he/she/it).",
            "Present continuous: am/is/are + verb-ing.",
            "Present perfect: has/have + past participle.",
            "Present perfect continuous: has/have been + verb-ing.",
          ],
          examples: [
            "Correct: 'The bus arrives at 8 o'clock.' (simple present, fact)",
            "Correct: 'The bus is arriving now.' (present continuous, in progress)",
            "Correct: 'The bus has arrived.' (present perfect, finished result)",
            "Correct: 'We have been waiting for ten minutes.' (present perfect continuous, still waiting)",
          ],
        },
        {
          heading: "Choosing the right one",
          body: "Ask yourself what the speaker wants to say. A timetable needs the simple present. Something happening at this moment needs the continuous. A completed result needs the perfect. A long action that continues needs the perfect continuous.",
          points: [
            "Habit or timetable → simple present: 'The shop opens at 10.'",
            "Action in progress → present continuous: 'The shop is opening now.'",
            "Result or experience → present perfect: 'The shop has opened.'",
            "Ongoing since a time → present perfect continuous: 'It has been raining since noon.'",
          ],
        },
      ],
      recap: [
        "Simple present = habits, facts and timetables.",
        "Present continuous = actions happening around now (am/is/are + -ing).",
        "Present perfect = finished action with a result or an experience (has/have + past participle).",
        "Present perfect continuous = action that began in the past and still continues (has/have been + -ing).",
      ],
    },
    activities: [
      {
        activityId: "pres-mcq", title: "Choose the correct sentence", instruction: "Pick the sentence that uses the present tense correctly.", type: "mcq",
        items: [
          { prompt: "Habit: Priya usually ___ to school by bus.", options: ["go", "goes", "is going", "has gone"], correct: "goes", explanation: "A habit needs the simple present, and with 'Priya' (she) the verb takes -s." },
          { prompt: "An action happening right now: Look! The children ___ football.", options: ["play", "plays", "are playing", "have played"], correct: "are playing", explanation: "An action happening now needs the present continuous: are + verb-ing." },
          { prompt: "A finished result: I ___ my homework, so I can go out.", options: ["finish", "am finishing", "finished", "have finished"], correct: "have finished", explanation: "A finished action with a present result uses the present perfect." },
          { prompt: "Still going on: They ___ for the bus since 9 o'clock.", options: ["wait", "are waiting", "have been waiting", "waited"], correct: "have been waiting", explanation: "An action that started in the past and continues uses the present perfect continuous." },
        ],
      },
      {
        activityId: "pres-fill", title: "Fill in the blank", instruction: "Complete each sentence with the correct present-tense form.", type: "fill-blank",
        items: [
          { sentence: "The Sun ____ in the east every morning.", correct: ["rises", "rise"], explanation: "A fact needs the simple present; with 'the Sun' (it) we add -s: rises." },
          { sentence: "Hush! The baby ____ (sleep) in the next room.", correct: ["is sleeping", "sleeps"], explanation: "An action happening right now takes the present continuous: is sleeping." },
          { sentence: "I ____ (finish) my project, so I am free now.", correct: ["have finished"], explanation: "A finished result uses the present perfect: have finished." },
          { sentence: "She ____ (learn) Tamil since she was six.", correct: ["has been learning"], explanation: "An action continuing since a past time uses the present perfect continuous." },
        ],
      },
      {
        activityId: "pres-fix", title: "Repair the sentence", instruction: "Choose the correct version of each sentence.", type: "error-find",
        items: [
          { prompt: "He go to the gym every evening.", options: ["He go to the gym every evening.", "He goes to the gym every evening.", "He is go to the gym every evening.", "He has going to the gym every evening."], correct: "He goes to the gym every evening.", explanation: "With he/she/it the simple present adds -s: goes." },
          { prompt: "I am knowing the answer.", options: ["I am knowing the answer.", "I knows the answer.", "I know the answer.", "I have know the answer."], correct: "I know the answer.", explanation: "'Know' describes a state, not an action in progress, so it takes the simple present." },
          { prompt: "She have visited the museum.", options: ["She have visited the museum.", "She has visited the museum.", "She is visited the museum.", "She visits the museum since long."], correct: "She has visited the museum.", explanation: "The present perfect uses has with he/she/it: has visited." },
          { prompt: "We are waiting here for an hour.", options: ["We are waiting here for an hour.", "We have been waiting here for an hour.", "We wait here for an hour.", "We has been waiting here for an hour."], correct: "We have been waiting here for an hour.", explanation: "An action that began in the past and is still going on uses the present perfect continuous." },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "fill-in-the-blank", "sentence-correction"] },
  },
  {
    id: "past-tenses", areaId: "grammar", order: 2, name: "Past Tenses",
    tagline: "Simple past, past continuous, past perfect and past perfect continuous.",
    objectives: [
      "Recognise the four past tenses.",
      "Form each past tense correctly.",
      "Use past tenses for completed actions, background actions, earlier actions and long past actions.",
    ],
    lesson: {
      intro: "Past tenses place actions before now. The tricky part is showing which action came first when several things happened. That is what the perfect tenses do.",
      sections: [
        {
          heading: "The four past tenses",
          body: "Simple past tells what finished. Past continuous shows an action that was in progress in the past. Past perfect shows an action that finished before another past action. Past perfect continuous shows a longer past action that led up to another moment in the past.",
          points: [
            "Simple past: 'She wrote a letter.' — completed.",
            "Past continuous: 'She was writing a letter.' — in progress in the past.",
            "Past perfect: 'She had written the letter before lunch.' — earlier action.",
            "Past perfect continuous: 'She had been writing for an hour.' — longer action before a past moment.",
          ],
          timeline: [
            { label: "earliest", text: "had written (past perfect)" },
            { label: "in progress", text: "was writing (past continuous)" },
            { label: "finished", text: "wrote (simple past)" },
          ],
        },
        {
          heading: "Forming them",
          body: "Simple past is the verb's past form. Past continuous is was/were + -ing. Past perfect is had + past participle. Past perfect continuous is had been + -ing.",
          examples: [
            "Correct: 'They reached the station at 7.' (simple past)",
            "Correct: 'They were reaching the station when it started to rain.' (past continuous + simple past)",
            "Correct: 'The train had already left when they arrived.' (past perfect before a past moment)",
            "Correct: 'They had been travelling for six hours.' (past perfect continuous)",
          ],
        },
        {
          heading: "Putting two past actions together",
          body: "When two things happened in the past, the earlier action often takes the past perfect, and the later action takes the simple past. The past continuous sets the scene for an action that interrupted it.",
          points: [
            "Earlier action → past perfect: 'The film had started before we sat down.'",
            "Scene + interruption → past continuous + simple past: 'I was reading when the phone rang.'",
            "One action after another → two simple pasts: 'He woke up, dressed and left.'",
          ],
        },
      ],
      recap: [
        "Simple past = a finished action (verb's past form).",
        "Past continuous = background action in progress (was/were + -ing).",
        "Past perfect = the earlier of two past actions (had + past participle).",
        "Past perfect continuous = a longer past action leading to a past moment (had been + -ing).",
      ],
    },
    activities: [
      {
        activityId: "past-mcq", title: "Choose the correct sentence", instruction: "Pick the past-tense sentence that is correct.", type: "mcq",
        items: [
          { prompt: "A finished action: Yesterday I ___ my grandparents.", options: ["visit", "visited", "was visiting", "have visited"], correct: "visited", explanation: "A finished action at a past time takes the simple past: visited." },
          { prompt: "Scene + interruption: I ___ my homework when the lights went out.", options: ["did", "was doing", "had done", "am doing"], correct: "was doing", explanation: "A background action in progress uses the past continuous: was doing." },
          { prompt: "Earlier action: The bus ___ before we reached the stop.", options: ["leaves", "left", "had left", "was leaving"], correct: "had left", explanation: "The action that happened first uses the past perfect: had left." },
          { prompt: "Long past action: They ___ for two hours before the game began.", options: ["practise", "practised", "had been practising", "were practise"], correct: "had been practising", explanation: "A longer past action leading up to a past moment uses the past perfect continuous." },
        ],
      },
      {
        activityId: "past-fill", title: "Fill in the blank", instruction: "Complete each sentence with the correct past-tense form.", type: "fill-blank",
        items: [
          { sentence: "Last week we ____ (watch) an interesting film at home.", correct: ["watched", "have watched", "were watching"], explanation: "A finished past action takes the simple past: watched." },
          { sentence: "While I ____ (cook), the doorbell rang.", correct: ["was cooking"], explanation: "The background action in progress uses the past continuous: was cooking." },
          { sentence: "By the time we arrived, the ceremony ____ (already begin).", correct: ["had already begun", "had begun"], explanation: "The earlier action takes the past perfect: had already begun." },
          { sentence: "She ____ (study) for months before she took the exam.", correct: ["had been studying"], explanation: "A long action leading to a past moment uses the past perfect continuous: had been studying." },
        ],
      },
      {
        activityId: "past-order", title: "Put the story in order", instruction: "Order the sentences so the story makes sense (first action first).", type: "sentence-order",
        items: [
          {
            lines: [
              { id: "p1", text: "Meena had done all her homework before dinner." },
              { id: "p2", text: "After dinner, she read a chapter from her favourite book." },
              { id: "p3", text: "She was reading quietly when her friend called." },
              { id: "p4", text: "They talked for a few minutes and then said goodnight." },
            ],
            correctOrder: ["p1", "p2", "p3", "p4"],
            explanation: "The past perfect (had done) shows the earliest action; the rest follow in time.",
          },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "fill-in-the-blank", "sentence-correction"] },
  },
  {
    id: "future-tenses", areaId: "grammar", order: 3, name: "Future Tenses",
    tagline: "Simple future, future continuous and future perfect.",
    objectives: [
      "Recognise the main ways to talk about the future.",
      "Use will/shall, going to, and the future continuous and future perfect forms.",
      "Choose the right future form for plans, predictions and completed-by-then actions.",
    ],
    lesson: {
      intro: "There is more than one way to talk about tomorrow. Deciding forms depends on whether you are predicting, planning, describing an action in progress, or looking back from the future.",
      sections: [
        {
          heading: "Ways to talk about the future",
          body: "We use will for quick decisions and predictions, going to for plans and strong evidence, the future continuous for actions in progress at a future time, and the future perfect for actions completed before a future time.",
          points: [
            "Will: 'I will help you.' — a quick decision or a prediction.",
            "Going to: 'We are going to visit Chennai.' — a plan.",
            "Future continuous: 'At 8, we will be travelling to Madurai.' — in progress then.",
            "Future perfect: 'By June, I will have finished Class 8.' — completed before then.",
          ],
          timeline: [
            { label: "now", text: "are going to visit (plan)" },
            { label: "during", text: "will be travelling (in progress)" },
            { label: "by then", text: "will have finished (completed)" },
          ],
        },
        {
          heading: "Forming them",
          body: "Will/shall + base verb makes the simple future. Am/is/are + going to + base verb makes plans. Will be + -ing is the future continuous. Will have + past participle is the future perfect.",
          examples: [
            "Correct: 'I will call you tonight.'",
            "Correct: 'She is going to become a doctor.'",
            "Correct: 'This time tomorrow, we will be flying to Delhi.'",
            "Correct: 'By 2030, the town will have built a new bridge.'",
          ],
        },
        {
          heading: "Choosing the right one",
          body: "Match the form to the meaning: a prediction or a spur-of-the-moment decision → will; a settled plan → going to; an action in progress at a future moment → future continuous; something finished before a future moment → future perfect.",
          points: [
            "Prediction → will: 'It will rain tonight.'",
            "Settled plan → going to: 'Ravi is going to join the science fair.'",
            "In progress later → future continuous: 'Tomorrow evening we will be watching the match.'",
            "Finished before then → future perfect: 'They will have painted the hall by Friday.'",
          ],
        },
      ],
      recap: [
        "Will = decisions, promises and predictions.",
        "Going to = plans and things we expect with evidence.",
        "Future continuous (will be + -ing) = in progress at a future time.",
        "Future perfect (will have + past participle) = completed before a future time.",
      ],
    },
    activities: [
      {
        activityId: "fut-mcq", title: "Choose the correct sentence", instruction: "Pick the future-tense sentence that matches the meaning shown.", type: "mcq",
        items: [
          { prompt: "A prediction: I think it ___ later tonight.", options: ["rains", "is raining", "will rain", "has rained"], correct: "will rain", explanation: "Predictions use will." },
          { prompt: "A plan: They ___ a new library in our town.", options: ["build", "will be build", "are going to build", "built"], correct: "are going to build", explanation: "A settled plan uses going to." },
          { prompt: "In progress at a future time: At 6 p.m. tomorrow, we ___ dinner.", options: ["will be having", "will have had", "have had", "are having"], correct: "will be having", explanation: "An action in progress at a future moment uses the future continuous." },
          { prompt: "Completed before a future time: By noon, she ___ her exam.", options: ["finishes", "will be finishing", "will have finished", "is finishing"], correct: "will have finished", explanation: "An action completed before a future time uses the future perfect." },
        ],
      },
      {
        activityId: "fut-fill", title: "Fill in the blank", instruction: "Complete each sentence with the correct future form.", type: "fill-blank",
        items: [
          { sentence: "Don't worry, I ____ (help) you with the box.", correct: ["will help", "will help you"], explanation: "A quick decision uses will: will help." },
          { sentence: "We ____ (visit) our grandmother next weekend.", correct: ["are going to visit", "will visit"], explanation: "A plan can use going to (or will): are going to visit." },
          { sentence: "This time next year, I ____ (study) in Class 9.", correct: ["will be studying"], explanation: "An action in progress at a future time uses the future continuous." },
          { sentence: "By sunset, the photographer ____ (take) all the family photos.", correct: ["will have taken", "will have took"], explanation: "A completed-before-then action uses the future perfect: will have taken." },
        ],
      },
      {
        activityId: "fut-fix", title: "Repair the sentence", instruction: "Choose the correct version of each sentence.", type: "error-find",
        items: [
          { prompt: "We will going to the park tomorrow.", options: ["We will going to the park tomorrow.", "We going to the park tomorrow.", "We are going to the park tomorrow.", "We will goes to the park tomorrow."], correct: "We are going to the park tomorrow.", explanation: "Going to needs am/is/are + going to + base verb." },
          { prompt: "By 2027, she will finishing her course.", options: ["By 2027, she will finishing her course.", "By 2027, she will have finished her course.", "By 2027, she finishes her course.", "By 2027, she will be finish her course."], correct: "By 2027, she will have finished her course.", explanation: "An action completed before a future time uses will have + past participle." },
          { prompt: "I will call you when I will reach home.", options: ["I will call you when I will reach home.", "I will call you when I reach home.", "I called you when I will reach home.", "I will called you when I reach home."], correct: "I will call you when I reach home.", explanation: "After 'when/if/before', use a present tense for the future, not will." },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "fill-in-the-blank", "sentence-correction"] },
  },
  {
    id: "parts-of-speech", areaId: "grammar", order: 4, name: "Parts of Speech",
    tagline: "Nouns, pronouns, verbs, adjectives, adverbs, articles, prepositions and conjunctions.",
    objectives: [
      "Name the eight parts of speech and give examples.",
      "Find each part of speech in a sentence.",
      "Use words correctly, including articles, prepositions and conjunctions.",
    ],
    lesson: {
      intro: "Every word in a sentence has a job. Knowing the jobs helps you write clearly and spot mistakes — for example, choosing a or an, and joining ideas with the right conjunction.",
      sections: [
        {
          heading: "The eight jobs",
          body: "A noun names a person, place, thing or idea. A pronoun stands in for a noun. A verb shows action or state. An adjective describes a noun. An adverb describes a verb, adjective or another adverb. Articles (a, an, the) point to nouns. Prepositions show position or time. Conjunctions join words or sentences.",
          points: [
            "Noun: 'The teacher gave Meena a book.'",
            "Pronoun: 'She gave it to me.'",
            "Verb: 'The birds sing.' Adjective: 'a bright morning'.",
            "Adverb: 'She sings softly.'",
            "Articles: a / an / the · Prepositions: in, on, at, under · Conjunctions: and, but, because.",
          ],
        },
        {
          heading: "Articles and prepositions in action",
          body: "Use a before consonant sounds and an before vowel sounds. Use the when everyone knows which one you mean. Prepositions need care: in a box, on the table, at 8 o'clock, under the tree.",
          examples: [
            "Correct: 'an apple, a book, an hour, a university' (sound decides!).",
            "Correct: 'The Sun rises in the east.' (one and only → the)",
            "Not correct: 'She sat at the chair.' → 'She sat on the chair.'",
          ],
        },
        {
          heading: "Conjunctions join ideas",
          body: "And adds, but contrasts, or gives a choice, because gives a reason, so gives a result, and although shows a surprise. Choosing the right one changes the meaning.",
          examples: [
            "'I was tired, so I went to bed early.' (result)",
            "'I was tired, but I finished my work.' (contrast)",
            "'I stayed home because it was raining.' (reason)",
          ],
        },
      ],
      recap: [
        "Nouns name; pronouns replace; verbs act or state.",
        "Adjectives describe nouns; adverbs describe verbs, adjectives and adverbs.",
        "a/an/the are articles; in/on/at/under are common prepositions.",
        "and, but, or, because, so, although are conjunctions that join ideas.",
      ],
    },
    activities: [
      {
        activityId: "pos-mcq", title: "Identify the part of speech", instruction: "Choose the correct part of speech for the underlined word.", type: "mcq",
        items: [
          { prompt: "The brave soldier rescued the puppy.", options: ["noun", "adjective", "adverb", "verb"], correct: "adjective", explanation: "'Brave' describes the soldier, so it is an adjective." },
          { prompt: "Meena quickly packed her bag and left.", options: ["conjunction", "preposition", "adverb", "article"], correct: "adverb", explanation: "'Quickly' describes how she packed, so it is an adverb." },
          { prompt: "The cat is hiding under the sofa.", options: ["verb", "preposition", "noun", "pronoun"], correct: "preposition", explanation: "'Under' shows where the cat is, so it is a preposition." },
          { prompt: "Would you like tea or coffee?", options: ["adverb", "preposition", "conjunction", "pronoun"], correct: "conjunction", explanation: "'Or' offers a choice and joins the two nouns, so it is a conjunction." },
        ],
      },
      {
        activityId: "pos-article", title: "Choose a, an or the", instruction: "Pick the correct article for each sentence.", type: "mcq",
        items: [
          { prompt: "I saw ___ elephant at the zoo.", options: ["a", "an", "the", "no article"], correct: "an", explanation: "'Elephant' starts with a vowel sound, so we use an." },
          { prompt: "She wants to be ___ engineer when she grows up.", options: ["a", "an", "and", "the"], correct: "an", explanation: "'Engineer' starts with a vowel sound → an." },
          { prompt: "___ Sun rises in the east.", options: ["A", "An", "The", "No article"], correct: "The", explanation: "There is only one Sun, so we use the." },
          { prompt: "My uncle is ___ honest man.", options: ["a", "an", "the", "some"], correct: "an", explanation: "'Honest' begins with a vowel sound (the h is silent) → an." },
        ],
      },
      {
        activityId: "pos-fill", title: "Choose the right word", instruction: "Complete each sentence with the correct word.", type: "fill-blank",
        items: [
          { sentence: "We waited ___ the bus stop for ten minutes.", correct: ["at", "on", "for"], explanation: "We wait at a bus stop. (at + place/point)" },
          { sentence: "She was tired, ___ she kept practising.", correct: ["but", "yet", "and", "so"], explanation: "A contrast needs 'but'." },
          { sentence: "The kite flew ___ over the fields.", correct: ["high", "highly", "higher"], explanation: "'High' here is an adverb describing where/how the kite flew." },
          { sentence: "Everyone in the class likes ___ new teacher.", correct: ["her", "their", "his", "our"], explanation: "'Everyone' takes a singular pronoun, so 'her' (the teacher is female and singular) works." },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "fill-in-the-blank", "sentence-correction"] },
  },
  {
    id: "subject-verb-agreement", areaId: "grammar", order: 5, name: "Subject–Verb Agreement",
    tagline: "Make the verb agree with its subject — singular with singular, plural with plural.",
    objectives: [
      "Match singular subjects with singular verbs and plural subjects with plural verbs.",
      "Handle tricky subjects: everyone, none, either, and and/or.",
      "Use modals (can, may, must, should) correctly with any subject.",
    ],
    lesson: {
      intro: "A verb must agree with its subject. The most common rule: a singular subject takes a singular verb (with -s in the present), and a plural subject takes a plural verb.",
      sections: [
        {
          heading: "The simple rule",
          body: "In the present tense, add -s or -es to the verb for he, she, it and other singular subjects. Plural subjects keep the base form.",
          points: [
            "Singular: 'The boy runs fast.'",
            "Plural: 'The boys run fast.'",
            "Singular: 'This box contains toys.' Plural: 'These boxes contain toys.'",
          ],
          examples: [
            "Correct: 'A cat sleeps a lot.' / 'Cats sleep a lot.'",
            "Not correct: 'A cat sleep a lot.'",
          ],
        },
        {
          heading: "Tricky subjects",
          body: "Everyone, everybody, nobody, each, either and neither are singular. Subjects joined by and are plural; subjects joined by or/either...or agree with the nearer subject.",
          points: [
            "'Everyone enjoys the festival.' (singular)",
            "'Each of the answers is correct.' (singular)",
            "'Ravi and his friends are coming.' (plural)",
            "'Either the teacher or the students are wrong.' (agree with 'students')",
          ],
        },
        {
          heading: "Modals stay the same",
          body: "Can, may, must, should, will and shall never change their form, no matter who the subject is. Use the base verb after them.",
          examples: [
            "Correct: 'She can swim.' / 'They can swim.'",
            "Correct: 'Every student must bring a notebook.'",
            "Not correct: 'She can swims.'",
          ],
        },
      ],
      recap: [
        "Singular subject → singular verb (-s/-es in the present); plural subject → base verb.",
        "Everyone, each, either, neither, nobody are singular.",
        "Subjects joined by and are usually plural; with or/either...or match the nearer subject.",
        "Modals (can, may, must, should) never change form.",
      ],
    },
    activities: [
      {
        activityId: "sva-mcq", title: "Choose the correct verb", instruction: "Pick the verb that agrees with the subject.", type: "mcq",
        items: [
          { prompt: "The mangoes on that tree ___ ripe.", options: ["is", "are", "was", "am"], correct: "are", explanation: "'Mangoes' is plural, so the verb is are." },
          { prompt: "Everyone in the class ___ the story.", options: ["enjoy", "enjoys", "are enjoying", "have enjoyed"], correct: "enjoys", explanation: "'Everyone' is singular, so the verb takes -s: enjoys." },
          { prompt: "Either the manager or the workers ___ to blame.", options: ["is", "are", "was", "am"], correct: "are", explanation: "With 'or', the verb agrees with the nearer subject — 'workers' is plural, so are." },
          { prompt: "Each of the players ___ a medal.", options: ["receive", "receives", "have received", "are receiving"], correct: "receives", explanation: "'Each' is singular, so the verb takes -s: receives." },
        ],
      },
      {
        activityId: "sva-fill", title: "Fill in the blank", instruction: "Complete each sentence with a verb that agrees with the subject.", type: "fill-blank",
        items: [
          { sentence: "Neither of the answers ____ correct.", correct: ["is", "was", "seems"], explanation: "'Neither' is singular, so use a singular verb like is." },
          { sentence: "The news ____ (be) surprising.", correct: ["is", "was"], explanation: "'News' looks plural but is treated as singular: is." },
          { sentence: "Bread and butter ____ (be) my favourite breakfast.", correct: ["is", "was"], explanation: "Two things that form one idea ('bread and butter') take a singular verb." },
          { sentence: "She ____ (can) solve this puzzle easily.", correct: ["can"], explanation: "Modals never change form: can (not cans)." },
        ],
      },
      {
        activityId: "sva-fix", title: "Repair the sentence", instruction: "Choose the correct version of each sentence.", type: "error-find",
        items: [
          { prompt: "The children is playing in the park.", options: ["The children is playing in the park.", "The children are playing in the park.", "The children am playing in the park.", "The children was playing in the park."], correct: "The children are playing in the park.", explanation: "'Children' is plural → are." },
          { prompt: "My friend and I goes to the same school.", options: ["My friend and I goes to the same school.", "My friend and I go to the same school.", "My friend and I is going to the same school.", "My friend and I are goes to the same school."], correct: "My friend and I go to the same school.", explanation: "A compound subject (friend and I) is plural → go." },
          { prompt: "She must obeys the rules.", options: ["She must obeys the rules.", "She must obey the rules.", "She must obeying the rules.", "She must obeyed the rules."], correct: "She must obey the rules.", explanation: "After a modal, use the base verb: must obey." },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "fill-in-the-blank", "sentence-correction"] },
  },
  {
    id: "active-passive-voice", areaId: "grammar", order: 6, name: "Active and Passive Voice",
    tagline: "Who did it (active) versus what was done (passive).",
    objectives: [
      "Tell an active sentence from a passive sentence.",
      "Turn an active sentence into a passive one.",
      "Choose voice to match the focus of a sentence.",
    ],
    lesson: {
      intro: "In an active sentence the subject does the action. In a passive sentence the subject receives the action. Both are correct — the choice depends on what you want to focus on.",
      sections: [
        {
          heading: "Active versus passive",
          body: "Active: subject acts. Passive: subject receives the action, and the doer often appears after by.",
          points: [
            "Active: 'The chef cooked the meal.' (focus: the chef)",
            "Passive: 'The meal was cooked (by the chef).' (focus: the meal)",
          ],
          examples: [
            "Active: 'The artist painted the mural.'",
            "Passive: 'The mural was painted by the artist.'",
            "Not correct to swap: 'The mural is painted by the artist.' only if it is a repeated action — here 'was' fits a finished action.",
          ],
        },
        {
          heading: "How to form the passive",
          body: "Passive voice = a form of be + past participle of the main verb. Change be to match the tense: is/was/has been/will be.",
          points: [
            "Simple present: 'The room is cleaned daily.'",
            "Simple past: 'The room was cleaned yesterday.'",
            "Present perfect: 'The room has been cleaned.'",
            "Future: 'The room will be cleaned tomorrow.'",
          ],
        },
        {
          heading: "Choosing your voice",
          body: "Use the active voice when the doer matters, and the passive when the action or result matters more, or when the doer is unknown or obvious.",
          examples: [
            "'My bike was stolen last night.' (doer unknown → passive works well)",
            "'The principal announced the results.' (doer important → active)",
          ],
        },
      ],
      recap: [
        "Active: subject does the action. Passive: subject receives the action.",
        "Passive = be + past participle.",
        "Change be to match the tense (is/was/has been/will be).",
        "Choose passive when the action matters more than the doer, or the doer is unknown.",
      ],
    },
    activities: [
      {
        activityId: "avp-mcq", title: "Active or passive?", instruction: "Choose the correct answer for each question.", type: "mcq",
        items: [
          { prompt: "Which sentence is in the passive voice?", options: ["The gardener waters the plants.", "The plants are watered by the gardener.", "The gardener is watering the plants.", "The gardener watered the plants."], correct: "The plants are watered by the gardener.", explanation: "The plants receive the action — passive (be + watered)." },
          { prompt: "Active: 'The students completed the project.' What is the passive form?", options: ["The project completed the students.", "The project was completed by the students.", "The project is completing by the students.", "The students were completed by the project."], correct: "The project was completed by the students.", explanation: "Past passive uses was/were + past participle: was completed." },
          { prompt: "Which sentence is active?", options: ["The letter was written by Meena.", "The gift was wrapped beautifully.", "Arun broke the window.", "The window was broken."], correct: "Arun broke the window.", explanation: "Arun, the subject, does the action — active voice." },
          { prompt: "Choose the correct passive: 'They will announce the results.'", options: ["The results will announce.", "The results will be announced.", "The results were announcing.", "The results announce."], correct: "The results will be announced.", explanation: "Future passive = will be + past participle: will be announced." },
        ],
      },
      {
        activityId: "avp-fill", title: "Fill in the blank", instruction: "Complete each passive sentence with the correct form.", type: "fill-blank",
        items: [
          { sentence: "English ____ (speak) in many countries around the world.", correct: ["is spoken"], explanation: "Present passive: is + spoken." },
          { sentence: "The letter ____ (send) yesterday evening.", correct: ["was sent"], explanation: "Past passive: was + sent." },
          { sentence: "The walls ____ (paint) next week.", correct: ["will be painted", "are going to be painted"], explanation: "Future passive: will be + painted." },
          { sentence: "In this shop, the goods ____ (check) before they are packed.", correct: ["are checked"], explanation: "A repeated action in the present → present passive: are checked." },
        ],
      },
      {
        activityId: "avp-fix", title: "Repair the sentence", instruction: "Choose the correct version of each sentence.", type: "error-find",
        items: [
          { prompt: "The homework was complete by Ravi.", options: ["The homework was complete by Ravi.", "The homework was completed by Ravi.", "The homework were completed by Ravi.", "The homework is completed by Ravi tomorrow."], correct: "The homework was completed by Ravi.", explanation: "Passive needs the past participle: was completed." },
          { prompt: "This song is sing by my favourite artist.", options: ["This song is sing by my favourite artist.", "This song is sang by my favourite artist.", "This song is sung by my favourite artist.", "This song was sung by me favourite artist."], correct: "This song is sung by my favourite artist.", explanation: "Passive uses the past participle: sung." },
          { prompt: "The decision will be made by the committee next week.", options: ["The decision will be made by the committee next week.", "The decision will be make by the committee next week.", "The decision will made by the committee next week.", "The decision will be makeing by the committee next week."], correct: "The decision will be made by the committee next week.", explanation: "This sentence is already correct: will be + made." },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "fill-in-the-blank", "sentence-correction"] },
  },
  {
    id: "reported-speech", areaId: "grammar", order: 7, name: "Direct and Indirect Speech",
    tagline: "Report what people say — with the right tense, pronoun and word order.",
    objectives: [
      "Turn direct speech into reported (indirect) speech.",
      "Change tenses, pronouns and time words correctly.",
      "Report questions and commands correctly.",
    ],
    lesson: {
      intro: "Direct speech quotes the exact words: She said, 'I am tired.' Indirect (reported) speech reports the meaning: She said that she was tired.",
      sections: [
        {
          heading: "The golden rules",
          body: "When the reporting verb is in the past (said, told), push the tenses one step back, change pronouns to match the speaker, and adjust time and place words.",
          points: [
            "Present → past: 'am' becomes 'was'; 'will' becomes 'would'.",
            "Pronouns change: 'I' becomes 'she/he'; 'my' becomes 'her/his'.",
            "Time words change: 'today' → 'that day'; 'tomorrow' → 'the next day'; 'now' → 'then'.",
          ],
          examples: [
            "Direct: 'I am hungry,' said Meena.",
            "Indirect: Meena said that she was hungry.",
            "Direct: 'We will win,' they shouted.",
            "Indirect: They shouted that they would win.",
          ],
        },
        {
          heading: "Reporting questions and commands",
          body: "Yes/no questions become if/whether. Wh-questions keep their question word but change back to normal word order. Commands use to + verb.",
          points: [
            "Yes/no: 'Are you ready?' → He asked if I was ready.",
            "Wh-: 'Where do you live?' → She asked where I lived.",
            "Command: 'Please wait here.' → She told me to wait there.",
          ],
        },
        {
          heading: "Keeping the sense",
          body: "Reported speech keeps the meaning, not the exact words. Use that after said when reporting statements, and remember to drop the quotation marks.",
          examples: [
            "Direct: 'I have finished my work,' said Arun.",
            "Indirect: Arun said that he had finished his work.",
            "Not correct: Arun said that he has finished his work. (tenses move back)",
          ],
        },
      ],
      recap: [
        "Indirect speech reports meaning, not exact words.",
        "Push tenses back when the reporting verb is past (am→was, will→would).",
        "Change pronouns and time words (today→that day).",
        "Questions use if/whether or keep their question word with statement word order; commands use to + verb.",
      ],
    },
    activities: [
      {
        activityId: "rs-mcq", title: "Choose the correct report", instruction: "Pick the correct indirect-speech version.", type: "mcq",
        items: [
          { prompt: "Direct: 'I am happy,' said Ravi. Indirect:", options: ["Ravi says that I am happy.", "Ravi said that he is happy.", "Ravi said that he was happy.", "Ravi said that I was happy."], correct: "Ravi said that he was happy.", explanation: "Tenses push back (am→was) and 'I' becomes 'he'." },
          { prompt: "Direct: 'We will visit you tomorrow,' they said. Indirect:", options: ["They said that we will visit you tomorrow.", "They said that they would visit us the next day.", "They said that they will visit us the next day.", "They said that we would visit them the next day."], correct: "They said that they would visit us the next day.", explanation: "'Will'→'would', 'you'→'us', 'tomorrow'→'the next day'." },
          { prompt: "Direct: 'Are you coming?' she asked. Indirect:", options: ["She asked if I was coming.", "She asked that I am coming.", "She asked if I am coming.", "She asked was I coming."], correct: "She asked if I was coming.", explanation: "A yes/no question becomes if/whether with statement word order." },
          { prompt: "Direct: 'Please close the door,' said the teacher. Indirect:", options: ["The teacher said please close the door.", "The teacher told me closed the door.", "The teacher told me to close the door.", "The teacher told me that close the door."], correct: "The teacher told me to close the door.", explanation: "A command is reported with told + to + verb." },
        ],
      },
      {
        activityId: "rs-fill", title: "Fill in the blank", instruction: "Complete each reported sentence with the correct word.", type: "fill-blank",
        items: [
          { sentence: "She said that she ____ (be) very tired.", correct: ["was"], explanation: "The present 'am/is' moves back to 'was'." },
          { sentence: "He asked me ____ I liked ice cream.", correct: ["if", "whether"], explanation: "A yes/no question is reported with if/whether." },
          { sentence: "They said they ____ (will) come the next day.", correct: ["would"], explanation: "'Will' moves back to 'would'." },
          { sentence: "Mother told me ____ (switch) off the fan.", correct: ["to switch"], explanation: "A command is reported with to + verb: to switch." },
        ],
      },
      {
        activityId: "rs-fix", title: "Repair the report", instruction: "Choose the correct version of each reported sentence.", type: "error-find",
        items: [
          { prompt: "He said that he is going to the market.", options: ["He said that he is going to the market.", "He said that he was going to the market.", "He says that he was going to the market.", "He said that I was going to the market."], correct: "He said that he was going to the market.", explanation: "With a past reporting verb, 'is going' moves back to 'was going'." },
          { prompt: "She asked where do I live.", options: ["She asked where do I live.", "She asked where did I live.", "She asked where I lived.", "She asked where I live."], correct: "She asked where I lived.", explanation: "Wh-questions in reported speech use statement word order and a past tense." },
          { prompt: "The coach told the players to practised daily.", options: ["The coach told the players to practised daily.", "The coach told the players to practising daily.", "The coach told the players to practise daily.", "The coach said the players to practise daily."], correct: "The coach told the players to practise daily.", explanation: "After to, use the base verb: to practise." },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "fill-in-the-blank", "sentence-correction"] },
  },
  {
    id: "common-errors", areaId: "grammar", order: 8, name: "Sentence Types, Punctuation and Common Errors",
    tagline: "Question formation, capital letters, punctuation and everyday mistakes.",
    objectives: [
      "Identify the four sentence types: statement, question, command, exclamation.",
      "Form questions correctly, including tag questions.",
      "Punctuate and capitalise sentences correctly.",
      "Spot and fix common grammatical errors.",
    ],
    lesson: {
      intro: "Good sentences are correctly typed, correctly punctuated and correctly formed. This lesson collects the small rules that make writing look professional.",
      sections: [
        {
          heading: "Four sentence types",
          body: "A statement gives information and ends with a full stop. A question asks and ends with a question mark. A command gives an order. An exclamation shows strong feeling and ends with an exclamation mark.",
          points: [
            "Statement: 'The concert starts at six.'",
            "Question: 'Does the concert start at six?'",
            "Command: 'Turn off your phones.'",
            "Exclamation: 'What a wonderful show it was!'",
          ],
        },
        {
          heading: "Forming questions",
          body: "Yes/no questions start with a helping verb (do, does, did, is, has, can). Wh-questions start with what, where, when, why, who or how, followed by the helping verb and the subject. Tag questions copy the helping verb: 'You like tea, don't you?'",
          examples: [
            "Correct: 'Does she play the piano?'",
            "Correct: 'Where are you going?'",
            "Correct: 'It is cold today, isn't it?'",
            "Not correct: 'You are going where?' (in normal writing)",
          ],
        },
        {
          heading: "Punctuation and capital letters",
          body: "Start every sentence with a capital letter. Capitalise names and the word I. Use a comma after openers like 'After dinner,' and before but/and when joining two full sentences. Use apostrophes for contractions and possession.",
          points: [
            "'After school, we played cricket.' (comma after opener)",
            "'Rani's book' (possession) · 'It's raining' (it is)",
            "Common error: 'its' = belonging to it; 'it's' = it is.",
          ],
        },
      ],
      recap: [
        "Statements end with a full stop; questions with a question mark; exclamations with an exclamation mark.",
        "Questions begin with a helping verb or a question word.",
        "Capitalise sentence starts, names and I.",
        "Watch out for it's/its, there/their/they're, your/you're, and missing commas after openers.",
      ],
    },
    activities: [
      {
        activityId: "ce-mcq", title: "Spot the error", instruction: "Choose the correct version of each sentence.", type: "error-find",
        items: [
          { prompt: "Meena and her sister is going to the fair.", options: ["Meena and her sister is going to the fair.", "Meena and her sister are going to the fair.", "Meena and her sister was going to the fair.", "Meena and her sister is go to the fair."], correct: "Meena and her sister are going to the fair.", explanation: "A compound subject (Meena and her sister) is plural → are." },
          { prompt: "Their going to the library after school.", options: ["Their going to the library after school.", "There going to the library after school.", "They're going to the library after school.", "They're going too the library after school."], correct: "They're going to the library after school.", explanation: "'They're' = they are; 'their' shows belonging; 'there' = a place." },
          { prompt: "She don't like mangoes.", options: ["She don't like mangoes.", "She doesn't likes mangoes.", "She doesn't like mangoes.", "She do not likes mangoes."], correct: "She doesn't like mangoes.", explanation: "With he/she/it use doesn't + base verb: doesn't like." },
          { prompt: "What time is the train leave?", options: ["What time is the train leave?", "What time does the train leave?", "What time the train leaves?", "What time is the train leaving leave?"], correct: "What time does the train leave?", explanation: "Questions with normal verbs need do/does + base verb." },
        ],
      },
      {
        activityId: "ce-punct", title: "Choose the correct punctuation", instruction: "Pick the correctly punctuated sentence.", type: "mcq",
        items: [
          { prompt: "Which is punctuated correctly?", options: ["what a beautiful sunset", "What a beautiful sunset!", "what a beautiful sunset!", "What a beautiful sunset."], correct: "What a beautiful sunset!", explanation: "An exclamation starts with a capital letter and ends with an exclamation mark." },
          { prompt: "Which is punctuated correctly?", options: ["After dinner we washed the dishes.", "After dinner, we washed the dishes.", "after dinner, we washed the dishes.", "After dinner, We washed the dishes."], correct: "After dinner, we washed the dishes.", explanation: "A comma follows the opener, and the sentence starts with a capital letter." },
          { prompt: "Which question is correct?", options: ["You are coming or not?", "Are you coming?", "You coming?", "Coming you are?"], correct: "Are you coming?", explanation: "A yes/no question begins with the helping verb: Are you coming?" },
          { prompt: "Which is correct?", options: ["Its raining outside.", "It's raining outside.", "Its' raining outside.", "It is rains outside."], correct: "It's raining outside.", explanation: "'It's' = it is." },
        ],
      },
      {
        activityId: "ce-order", title: "Build the question", instruction: "Order the words to make a correct question.", type: "sentence-order",
        items: [
          {
            promptHint: "Make a question from these words.",
            lines: [
              { id: "q1", text: "Have" },
              { id: "q2", text: "you" },
              { id: "q3", text: "ever" },
              { id: "q4", text: "visited" },
              { id: "q5", text: "Ooty?" },
            ],
            correctOrder: ["q1", "q2", "q3", "q4", "q5"],
            explanation: "Question word order: Have + you + ever + visited + Ooty?",
          },
          {
            promptHint: "Make a question about the time.",
            lines: [
              { id: "r1", text: "When" },
              { id: "r2", text: "does" },
              { id: "r3", text: "the" },
              { id: "r4", text: "museum" },
              { id: "r5", text: "open?" },
            ],
            correctOrder: ["r1", "r2", "r3", "r4", "r5"],
            explanation: "Wh-word + helping verb + subject + main verb: When does the museum open?",
          },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "sentence-correction", "fill-in-the-blank"] },
  },
];

// ── READING NEBULA ─────────────────────────────────────────────────────────
const READING = [
  {
    id: "main-idea-purpose", areaId: "reading", order: 1, name: "Main Idea and Purpose",
    tagline: "Find the point of a passage and why the writer wrote it.",
    objectives: [
      "Find the main idea of a passage.",
      "Identify supporting details.",
      "Decide the writer's purpose: to inform, persuade or entertain.",
    ],
    lesson: {
      intro: "Every passage has a point — the main idea. Supporting details back it up, and the writer's purpose tells us why the passage exists.",
      sections: [
        {
          heading: "The passage",
          body: "Read this information passage: 'Elephants are the largest land animals on Earth. An adult elephant can weigh as much as a small bus. Elephants use their trunks to drink water, pick up food and greet one another. Sadly, elephants are losing their forest homes as cities grow, which is why many people now work to protect them.'",
          points: [
            "Main idea: elephants are remarkable animals that face dangers.",
            "Supporting details: size, trunk uses, loss of habitat.",
            "Purpose: to inform the reader about elephants.",
          ],
        },
        {
          heading: "Finding the main idea",
          body: "Ask: 'What is the whole passage about in one sentence?' The main idea is often in the first or last sentence, but you may have to work it out yourself.",
          examples: [
            "Topic: elephants. Main idea: elephants are amazing but threatened animals.",
            "A good main-idea answer is a full sentence, not just a single word.",
          ],
        },
        {
          heading: "Purpose: inform, persuade or entertain",
          body: "Inform → facts and explanations. Persuade → opinions and reasons to make you agree. Entertain → stories and humour. The clue is in the details and the tone.",
          points: [
            "Facts and figures → inform.",
            "Words like 'must', 'should', 'everyone' → persuade.",
            "A story with characters → entertain.",
          ],
        },
      ],
      recap: [
        "The main idea is the whole passage in one sentence.",
        "Supporting details give facts, examples and reasons.",
        "Purpose is inform, persuade or entertain — read the tone and details.",
      ],
    },
    activities: [
      {
        activityId: "mi-mcq", title: "Main idea questions", instruction: "Answer each question about the elephant passage.", type: "mcq",
        items: [
          { prompt: "What is the main idea of the passage?", options: ["Elephants use their trunks to drink water.", "Elephants are the largest land animals but face dangers.", "Cities are growing bigger every year.", "Elephants weigh as much as a bus."], correct: "Elephants are the largest land animals but face dangers.", explanation: "The passage tells us about elephants' features and the danger they face — that is the whole passage in one sentence." },
          { prompt: "Which detail supports the main idea?", options: ["Elephants can pick up food with their trunks.", "Many people now work to protect elephants.", "A bus is a large vehicle.", "Forests are green."], correct: "Many people now work to protect elephants.", explanation: "This detail supports the idea that elephants face dangers and are protected." },
          { prompt: "The writer's purpose is to ___ the reader.", options: ["persuade", "entertain", "inform", "confuse"], correct: "inform", explanation: "The passage gives facts about elephants — it informs." },
          { prompt: "Which sentence states the danger to elephants?", options: ["Elephants are the largest land animals.", "Elephants use their trunks to greet one another.", "Elephants are losing their forest homes as cities grow.", "An adult elephant can weigh as much as a small bus."], correct: "Elephants are losing their forest homes as cities grow.", explanation: "This sentence directly names the danger: loss of forest homes." },
        ],
      },
      {
        activityId: "mi-tf", title: "True or false", instruction: "Judge each statement about the passage.", type: "true-false",
        items: [
          { statement: "The passage says elephants are the largest land animals.", correct: true, explanation: "The first sentence states exactly that." },
          { statement: "According to the passage, elephants use their trunks to write.", correct: false, explanation: "The passage says trunks are used to drink, pick up food and greet." },
          { statement: "The passage's main purpose is to entertain with a story.", correct: false, explanation: "It informs with facts; there is no story or humour." },
        ],
      },
      {
        activityId: "mi-fill", title: "Complete the sentence", instruction: "Fill in each blank using ideas from the passage.", type: "fill-blank",
        items: [
          { sentence: "An adult elephant can weigh as much as a small ____.", correct: ["bus", "vehicle", "truck"], explanation: "The passage compares an elephant's weight to a small bus." },
          { sentence: "Elephants are losing their forest ____ as cities grow.", correct: ["homes", "habitats"], explanation: "The passage says they are losing their forest homes." },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "fill-in-the-blank"] },
  },
  {
    id: "inference-conclusions", areaId: "reading", order: 2, name: "Inference and Drawing Conclusions",
    tagline: "Read between the lines — what the writer hints but does not say.",
    objectives: [
      "Make inferences from evidence in a passage.",
      "Identify characters, settings and events.",
      "Draw conclusions that are supported by the text.",
    ],
    lesson: {
      intro: "Writers do not always say everything directly. Inference means using clues in the text plus what you already know to work out what is meant.",
      sections: [
        {
          heading: "The story",
          body: "Read this story: 'Arjun pulled the blanket up to his chin. Outside, the wind rattled the window panes. He heard footsteps creak along the corridor, then stop right outside his door. Slowly, the door handle began to turn. Arjun's heart thumped. He reached under his pillow for his torch.'",
          points: [
            "Setting: a bedroom at night.",
            "Character: Arjun, a boy alone in the house.",
            "Mood: night-time tension — something or someone is at the door.",
          ],
        },
        {
          heading: "Making an inference",
          body: "An inference is a guess built on evidence. 'Arjun's heart thumped' tells us he is frightened, even though the word 'frightened' never appears. The torch under the pillow suggests he expected trouble.",
          examples: [
            "Clue: 'reached under his pillow for his torch' → conclusion: he keeps the torch ready at night.",
            "Clue: 'the wind rattled the window panes' → conclusion: it is a stormy night.",
          ],
        },
        {
          heading: "Drawing conclusions",
          body: "A conclusion joins several clues together. The stopped footsteps + the turning handle + his racing heart → most likely someone is entering the room. Good readers check that every conclusion is supported by the text.",
          points: [
            "One clue is not enough — look for a pattern.",
            "A conclusion that ignores a clue is probably wrong.",
            "Inference needs both the text and common sense, but the text always comes first.",
          ],
        },
      ],
      recap: [
        "Inference = clues in the text + your knowledge = a sensible guess.",
        "Characters, setting and events come from details and dialogue.",
        "A strong conclusion is supported by several clues.",
        "The text always comes first — do not invent facts.",
      ],
    },
    activities: [
      {
        activityId: "inf-mcq", title: "Read between the lines", instruction: "Choose the best inference for each question.", type: "mcq",
        items: [
          { prompt: "Why did Arjun reach for his torch?", options: ["He wanted to read a book.", "He kept it ready for a dark night.", "The torch was his favourite toy.", "He heard the wind outside."], correct: "He kept it ready for a dark night.", explanation: "He keeps the torch under his pillow — he expects to need light in the dark." },
          { prompt: "How does Arjun feel when the handle turns?", options: ["bored", "fearful", "angry", "sleepy"], correct: "fearful", explanation: "'His heart thumped' — his body reacts with fear, though the word is not used." },
          { prompt: "Where does the story take place?", options: ["In a school corridor", "In a bedroom at night", "In a park", "On a train"], correct: "In a bedroom at night", explanation: "The blanket, the pillow and the creaky corridor outside his door show a bedroom at night." },
          { prompt: "What most likely happens next?", options: ["No one is there and Arjun sleeps peacefully.", "The door opens and someone or something enters.", "The sun rises and the wind stops.", "Arjun falls asleep without checking."], correct: "The door opens and someone or something enters.", explanation: "The footsteps stopping at the door and the handle turning build to the door opening." },
        ],
      },
      {
        activityId: "inf-tf", title: "True or false", instruction: "Judge each statement using the story.", type: "true-false",
        items: [
          { statement: "The story tells us directly that Arjun is frightened.", correct: false, explanation: "It shows the fear through his thumping heart — that is inference." },
          { statement: "The night is windy.", correct: true, explanation: "The wind rattles the window panes." },
          { statement: "Arjun is sleeping soundly when the story begins.", correct: false, explanation: "He is awake under his blanket, listening." },
        ],
      },
      {
        activityId: "inf-order", title: "Order the events", instruction: "Put the events of the story in order.", type: "sentence-order",
        items: [
          {
            promptHint: "Follow the story from beginning to end.",
            lines: [
              { id: "e1", text: "Arjun pulls the blanket up to his chin." },
              { id: "e2", text: "The wind rattles the window panes." },
              { id: "e3", text: "Footsteps stop right outside his door." },
              { id: "e4", text: "The door handle begins to turn." },
              { id: "e5", text: "Arjun reaches for his torch." },
            ],
            correctOrder: ["e1", "e2", "e3", "e4", "e5"],
            explanation: "Each event follows the sentences of the story in order.",
          },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "fill-in-the-blank"] },
  },
  {
    id: "sequence-context", areaId: "reading", order: 3, name: "Sequence and Context Clues",
    tagline: "Follow the order of events and unlock word meanings from clues.",
    objectives: [
      "Follow the sequence of events in a passage.",
      "Work out the meaning of an unknown word from context.",
      "Summarise a passage in a few sentences.",
    ],
    lesson: {
      intro: "Two powerful reading skills: keeping track of what happens when (sequence), and using surrounding words to guess a new word's meaning (context clues).",
      sections: [
        {
          heading: "The passage",
          body: "Read this description: 'Sara's hands were trembling as she unzipped her violin case. It was her first performance in front of an audience. She took a deep breath, placed the violin on her shoulder and began to play. At first her notes were hesitant, but soon they grew confident. By the end, the hall was silent with wonder. When the final note faded, the audience burst into applause, and Sara finally allowed herself to smile.'",
          points: [
            "Sequence: unzip case → take a breath → play → end with applause.",
            "'Hesitant' (unsure, shaky) is a context-clue word.",
          ],
        },
        {
          heading: "Sequence words",
          body: "Writers mark time with words like first, then, next, after that, finally. These words tell you the order of events. Here: first she unzipped, then she breathed, next she played, finally the applause came.",
          examples: [
            "First → then → next → finally: the spine of a sequence.",
            "Looking for these words helps you retell a passage in the right order.",
          ],
        },
        {
          heading: "Context clues",
          body: "When you meet an unknown word, look around it. The sentence often explains it — 'hesitant' is surrounded by 'trembling' and 'grew confident', which tell us it means unsure at first.",
          points: [
            "Synonyms nearby: the passage says notes went from hesitant to confident.",
            "Definitions, examples and contrasts are all clues.",
            "Read past the word first, then come back to it.",
          ],
        },
      ],
      recap: [
        "Sequence words (first, then, next, finally) mark the order of events.",
        "Context clues use surrounding words to reveal a word's meaning.",
        "Summarising = main idea + the key events in order, in your own words.",
      ],
    },
    activities: [
      {
        activityId: "sq-mcq", title: "Sequence and meaning questions", instruction: "Answer each question about the passage.", type: "mcq",
        items: [
          { prompt: "What did Sara do just before she began to play?", options: ["She smiled at the audience.", "She took a deep breath.", "She put the violin away.", "She heard applause."], correct: "She took a deep breath.", explanation: "The passage says she took a deep breath, then began to play." },
          { prompt: "The word 'hesitant' most likely means ___ .", options: ["loud and bold", "unsure and shaky", "fast and lively", "quiet and finished"], correct: "unsure and shaky", explanation: "Her hands were trembling and the notes later 'grew confident' — so hesitant means unsure." },
          { prompt: "What happened after the final note faded?", options: ["Sara unzipped her case.", "The audience burst into applause.", "The hall fell silent.", "Sara placed the violin on her shoulder."], correct: "The audience burst into applause.", explanation: "The final sentence: the last note faded, then the audience applauded." },
          { prompt: "Which is the best summary of the passage?", options: ["Sara practised the violin at home every day.", "Sara played her first performance, grew confident, and the delighted audience applauded.", "Audiences always clap after concerts.", "Sara bought a new violin before school."], correct: "Sara played her first performance, grew confident, and the delighted audience applauded.", explanation: "It captures the main idea and the key events in order." },
        ],
      },
      {
        activityId: "sq-order", title: "Order Sara's performance", instruction: "Put the events in the correct order.", type: "sentence-order",
        items: [
          {
            promptHint: "Use the sequence words from the passage.",
            lines: [
              { id: "s1", text: "Sara unzips her violin case." },
              { id: "s2", text: "She takes a deep breath." },
              { id: "s3", text: "She begins to play, hesitant at first." },
              { id: "s4", text: "Her notes grow confident." },
              { id: "s5", text: "The audience bursts into applause." },
            ],
            correctOrder: ["s1", "s2", "s3", "s4", "s5"],
            explanation: "Each step follows the story's sequence from unzipping to applause.",
          },
        ],
      },
      {
        activityId: "sq-fill", title: "Fill in the blank", instruction: "Complete each sentence with the correct word.", type: "fill-blank",
        items: [
          { sentence: "'At first her notes were hesitant, but soon they grew ____.'", correct: ["confident", "bold", "strong"], explanation: "The contrast shows hesitation turning into confidence." },
          { sentence: "The word that signals the last event in the passage is ____.", correct: ["finally", "by the end", "when"], explanation: "'Finally' (used in this lesson) and the passage's ending signal the final event." },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "fill-in-the-blank"] },
  },
];

// ── VOCABULARY PLANET ──────────────────────────────────────────────────────
const VOCABULARY = [
  {
    id: "synonyms-antonyms", areaId: "vocabulary", order: 1, name: "Synonyms and Antonyms",
    tagline: "Words that match and words that oppose.",
    objectives: [
      "Match synonyms — words with the same or similar meaning.",
      "Match antonyms — words with opposite meanings.",
      "Use synonyms to avoid repeating the same word.",
    ],
    lesson: {
      intro: "A synonym is a word that means the same or almost the same as another (happy, glad). An antonym means the opposite (happy, sad). Good writers use synonyms to keep writing lively.",
      sections: [
        {
          heading: "Synonym pairs",
          body: "Keep a growing list of synonym pairs: large/big, quiet/silent, begin/start, brave/courageous, quick/fast. They are not always exact — 'huge' is stronger than 'big' — so check the tone.",
          points: [
            "begin ↔ start · large ↔ big · speak ↔ talk",
            "famous ↔ well-known · difficult ↔ hard",
            "A synonym should keep the sentence feeling natural.",
          ],
        },
        {
          heading: "Antonym pairs",
          body: "Antonyms are opposites: hot/cold, ancient/modern, arrive/leave, generous/mean, victory/defeat. Antonyms help you describe changes and contrasts.",
          points: [
            "hot ↔ cold · tall ↔ short · bright ↔ dim",
            "ancient ↔ modern · gather ↔ scatter",
            "Use an opposite to make a contrast clear: 'The water was cold, not warm.'",
          ],
        },
        {
          heading: "Why they matter",
          body: "Repeating the same word sounds flat. Swapping in a synonym adds variety, and choosing the right opposite adds precision. In questions, look for the best match, not just a related idea.",
          examples: [
            "Flat: 'The story was good. The ending was good.'",
            "Better: 'The story was good, and the ending was exciting.'",
          ],
        },
      ],
      recap: [
        "Synonyms are words with the same or similar meaning.",
        "Antonyms are words with opposite meanings.",
        "Synonyms add variety; antonyms add contrast.",
        "Choose the closest match — watch the strength of the word.",
      ],
    },
    activities: [
      {
        activityId: "sa-match", title: "Match the synonyms", instruction: "Match each word on the left with its synonym on the right.", type: "match-pairs",
        items: [
          { left: "begin", right: "start" },
          { left: "quiet", right: "silent" },
          { left: "large", right: "huge" },
          { left: "brave", right: "courageous" },
          { left: "happy", right: "glad" },
        ],
      },
      {
        activityId: "sa-mcq", title: "Choose the closest meaning", instruction: "Pick the best synonym or antonym.", type: "mcq",
        items: [
          { prompt: "Which word is a synonym of 'quick'?", options: ["slow", "fast", "late", "tired"], correct: "fast", explanation: "'Quick' and 'fast' mean nearly the same." },
          { prompt: "Which word is an antonym of 'ancient'?", options: ["old", "modern", "famous", "broken"], correct: "modern", explanation: "'Ancient' means very old; the opposite is modern." },
          { prompt: "Choose the best synonym for the underlined word: 'The team was delighted with the result.'", options: ["disappointed", "thrilled", "tired", "confused"], correct: "thrilled", explanation: "'Delighted' and 'thrilled' both mean very pleased." },
          { prompt: "Which word is an antonym of 'gather'?", options: ["collect", "scatter", "join", "meet"], correct: "scatter", explanation: "'Gather' brings together; 'scatter' spreads apart." },
        ],
      },
      {
        activityId: "sa-fill", title: "Choose the right word", instruction: "Complete each sentence with a suitable word.", type: "fill-blank",
        items: [
          { sentence: "Keep the room ____ — the baby is sleeping.", correct: ["quiet", "silent", "calm"], explanation: "'Quiet' fits — the room should be free of noise." },
          { sentence: "The weather was ____ yesterday, but today it is cold.", correct: ["hot", "warm", "sunny"], explanation: "An opposite of 'cold' is needed: hot (or warm)." },
          { sentence: "Ramu is very ____ ; he always shares his lunch.", correct: ["generous", "kind", "friendly"], explanation: "Sharing shows generosity/kindness." },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "fill-in-the-blank"] },
  },
  {
    id: "prefixes-suffixes", areaId: "vocabulary", order: 2, name: "Prefixes, Suffixes and Root Words",
    tagline: "Build new words from roots with prefixes and suffixes.",
    objectives: [
      "Identify common prefixes and suffixes.",
      "Understand how roots, prefixes and suffixes build word families.",
      "Work out the meaning of an unfamiliar word from its parts.",
    ],
    lesson: {
      intro: "Many English words are built from a root plus a prefix (before the root) and a suffix (after it). Learn the parts and you can unlock whole families of words.",
      sections: [
        {
          heading: "Prefixes change meaning",
          body: "A prefix sits at the front of a word and changes its meaning. Un- and dis- make opposites; re- means again; pre- means before; mis- means wrongly.",
          points: [
            "un-happy = not happy · dis-agree = not agree",
            "re-write = write again · pre-view = view before",
            "mis-spell = spell wrongly",
          ],
        },
        {
          heading: "Suffixes change the job",
          body: "A suffix sits at the end. It often changes a word's part of speech: teach (verb) → teacher (noun) → teachable (adjective). Common suffixes: -ful, -less, -er, -tion, -ly, -ness.",
          points: [
            "care + -ful = full of care · care + -less = without care",
            "teach + -er = a person who teaches",
            "create + -tion = creation · quick + -ly = quickly",
          ],
        },
        {
          heading: "Word families from one root",
          body: "The root holds the core meaning. From act we get action, active, actor, react and activity. Knowing the root helps you guess new words.",
          examples: [
            "act → action, active, actor, react, activity",
            "'Unbreakable' = un + break + able = cannot be broken.",
          ],
        },
      ],
      recap: [
        "Prefix: at the front — un-, dis-, re-, pre-, mis-.",
        "Suffix: at the end — -ful, -less, -er, -tion, -ly, -ness.",
        "Prefixes change meaning; suffixes often change the part of speech.",
        "The root carries the core meaning of the whole word family.",
      ],
    },
    activities: [
      {
        activityId: "pfx-match", title: "Match prefix to meaning", instruction: "Match each prefix or suffix with what it means.", type: "match-pairs",
        items: [
          { left: "re-", right: "again" },
          { left: "un-", right: "not" },
          { left: "pre-", right: "before" },
          { left: "-less", right: "without" },
          { left: "-er", right: "a person who" },
        ],
      },
      {
        activityId: "pfx-mcq", title: "Build the word", instruction: "Choose the word that fits each meaning.", type: "mcq",
        items: [
          { prompt: "To write again:", options: ["prewrite", "rewrite", "unwrite", "mistwrite"], correct: "rewrite", explanation: "re- (again) + write = rewrite." },
          { prompt: "'Not visible' means:", options: ["visible", "invisible", "revisible", "visibleless"], correct: "invisible", explanation: "The prefix in- (like un-) makes it negative: not visible." },
          { prompt: "'Full of colour' is:", options: ["colourless", "colourful", "recoloured", "uncolour"], correct: "colourful", explanation: "The suffix -ful means 'full of'." },
          { prompt: "A person who teaches is a ___.", options: ["teachable", "teacher", "teaching", "unteacher"], correct: "teacher", explanation: "The suffix -er names a person who does the action." },
        ],
      },
      {
        activityId: "pfx-fill", title: "Fill in the blank", instruction: "Complete each sentence with the correct word.", type: "fill-blank",
        items: [
          { sentence: "Please ____ (write) your name if you made a mistake.", correct: ["rewrite", "write again"], explanation: "re- + write = rewrite." },
          { sentence: "It is ____ (possible) to finish this puzzle in one minute.", correct: ["impossible", "not possible"], explanation: "The opposite of possible is impossible." },
          { sentence: "The ____ (paint) added the finishing touches to the walls.", correct: ["painter"], explanation: "The suffix -er names the person: painter." },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "fill-in-the-blank"] },
  },
  {
    id: "idioms-phrases", areaId: "vocabulary", order: 3, name: "Idioms, Phrases and Confused Words",
    tagline: "Colourful phrases, phrasal verbs and words people mix up.",
    objectives: [
      "Understand common idioms and phrases.",
      "Use phrasal verbs correctly.",
      "Choose correctly between commonly confused words.",
    ],
    lesson: {
      intro: "An idiom is a phrase whose meaning is different from its words — 'break the ice' does not mean smashing ice. Phrasal verbs (give up, look after) and confused word pairs (affect/effect) need special attention.",
      sections: [
        {
          heading: "Common idioms",
          body: "Idioms add colour. Under the weather = ill. Once in a blue moon = very rarely. Hit the books = study hard. Spill the beans = tell a secret. Piece of cake = very easy.",
          points: [
            "'I am under the weather.' = I feel ill.",
            "'It was a piece of cake.' = it was easy.",
            "Do not translate idioms word by word — learn their meaning as a whole.",
          ],
        },
        {
          heading: "Phrasal verbs",
          body: "A phrasal verb is a verb + a small word that changes the meaning: look after (care for), give up (stop trying), put off (postpone), turn down (refuse).",
          examples: [
            "'She looks after her little brother.' (cares for)",
            "'They put off the trip because of the rain.' (postponed)",
            "'He turned down the offer.' (refused)",
          ],
        },
        {
          heading: "Confused word pairs",
          body: "Their/there/they're, its/it's, affect/effect, accept/except, advice/advise are often mixed up. Read the sentence and check the job of the word.",
          points: [
            "affect = verb ('The rain affects travel') · effect = noun ('the effect of rain')",
            "accept = receive · except = apart from",
            "advice = noun ('good advice') · advise = verb ('I advise you')",
          ],
        },
      ],
      recap: [
        "An idiom's meaning is not the sum of its words.",
        "Phrasal verbs: look after, give up, put off, turn down.",
        "Their/there/they're, its/it's, affect/effect are different words with different jobs.",
        "Check the word's job in the sentence before choosing.",
      ],
    },
    activities: [
      {
        activityId: "idm-match", title: "Match phrase to meaning", instruction: "Match each phrase with its meaning.", type: "match-pairs",
        items: [
          { left: "under the weather", right: "feeling ill" },
          { left: "piece of cake", right: "very easy" },
          { left: "spill the beans", right: "tell a secret" },
          { left: "look after", right: "care for" },
          { left: "put off", right: "postpone" },
        ],
      },
      {
        activityId: "idm-mcq", title: "Choose the correct word", instruction: "Pick the word that fits the sentence.", type: "mcq",
        items: [
          { prompt: "The heavy rain ____ the match.", options: ["affected", "effected", "was affected to", "effect"], correct: "affected", explanation: "A verb is needed — 'affected' (the rain did something to the match)." },
          { prompt: "Everyone came to the party ____ Ram, who was ill.", options: ["accept", "except", "expect", "excerpt"], correct: "except", explanation: "'Except' means apart from." },
          { prompt: "Please give me ____ advice on choosing a career.", options: ["an", "some", "a", "the advices"], correct: "some", explanation: "'Advice' is uncountable — say 'some advice', never 'advices'." },
          { prompt: "___ going to be a cold night.", options: ["Their", "There", "They're", "Its"], correct: "They're", explanation: "'They're' = they are." },
        ],
      },
      {
        activityId: "idm-fill", title: "Fill in the blank", instruction: "Complete each sentence with the right word or phrase.", type: "fill-blank",
        items: [
          { sentence: "The exam was easy — it was a ____ of cake.", correct: ["piece"], explanation: "The idiom is 'a piece of cake' = very easy." },
          { sentence: "Our team never ____ up, even when we were losing.", correct: ["gave", "gives", "give"], explanation: "The phrasal verb 'give up' = stop trying; past: gave up." },
          { sentence: "Don't forget to ____ (switching off) the lights before you leave.", correct: ["switch off", "turn off", "put off"], explanation: "'Switch off'/'turn off' = stop the lights; 'put off' means postpone." },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "fill-in-the-blank"] },
  },
];

// ── WRITING STATION ────────────────────────────────────────────────────────
const WRITING = [
  {
    id: "paragraph-writing", areaId: "writing", order: 1, name: "Paragraph Writing",
    tagline: "One clear idea, a topic sentence, and details that hold it up.",
    objectives: [
      "Write a topic sentence that states the main idea.",
      "Add supporting details and examples.",
      "Finish with a concluding sentence and keep the paragraph organised.",
    ],
    lesson: {
      intro: "A paragraph is a group of sentences about ONE main idea. It needs a topic sentence, supporting details, and a closing sentence.",
      sections: [
        {
          heading: "The parts of a paragraph",
          body: "The topic sentence (usually first) announces the idea. The middle sentences add details, examples and reasons. The concluding sentence rounds it off.",
          points: [
            "Topic sentence: 'My grandmother makes the best breakfasts.'",
            "Details: what she cooks, how the kitchen smells, why we love it.",
            "Conclusion: 'No breakfast anywhere tastes as good as hers.'",
          ],
          examples: [
            "Topic sentence → details → conclusion: the three-part shape.",
            "Keep every sentence related to the main idea — cut off-topic sentences.",
          ],
        },
        {
          heading: "Linking your sentences",
          body: "Use linking words to guide the reader: first, also, for example, however, finally. They connect one detail to the next so the paragraph flows.",
          examples: [
            "'First, she prepares fresh idlis. For example, she grinds the batter herself. Finally, she serves them with piping-hot chutney.'",
          ],
        },
        {
          heading: "Keeping it organised",
          body: "Plan before you write: choose the main idea, collect three or four details, then write. Check that every sentence supports the idea and that the conclusion matches the opening.",
          points: [
            "One idea per paragraph.",
            "Details in a clear order (time, space or importance).",
            "End with a thought that closes the paragraph.",
          ],
        },
      ],
      recap: [
        "A paragraph = one main idea.",
        "Topic sentence + supporting details + conclusion.",
        "Linking words (first, for example, finally) keep it flowing.",
        "Cut any sentence that does not support the main idea.",
      ],
      practice: {
        prompt: "Write a short paragraph (5–6 sentences) titled 'My Favourite Time of the Day'. Start with a topic sentence, add two or three details, and end with a concluding sentence.",
        rubric: [
          "Starts with a clear topic sentence.",
          "Every sentence supports the main idea.",
          "Uses at least two linking words.",
          "Ends with a concluding sentence.",
          "Correct capital letters and full stops.",
        ],
      },
    },
    activities: [
      {
        activityId: "para-order", title: "Build a paragraph", instruction: "Order the sentences to form a well-organised paragraph.", type: "sentence-order",
        items: [
          {
            promptHint: "Topic sentence first, details next, conclusion last.",
            lines: [
              { id: "p1", text: "My school library is my favourite place in school." },
              { id: "p2", text: "It has rows and rows of books, from adventure stories to science facts." },
              { id: "p3", text: "For example, I found a book about space that I could not put down." },
              { id: "p4", text: "The librarian also lets us borrow two books each week." },
              { id: "p5", text: "That is why I visit the library every single day." },
            ],
            correctOrder: ["p1", "p2", "p3", "p4", "p5"],
            explanation: "p1 is the topic sentence, p2–p4 give details, p5 concludes.",
          },
        ],
      },
      {
        activityId: "para-mcq", title: "Choose the best topic sentence", instruction: "Pick the sentence that best introduces each paragraph idea.", type: "mcq",
        items: [
          { prompt: "For a paragraph about morning routines:", options: ["Mornings can be busy.", "My day begins at six with a fixed routine that never changes.", "I have an alarm.", "Breakfast is food."], correct: "My day begins at six with a fixed routine that never changes.", explanation: "It states the main idea of the whole paragraph, not just a minor detail." },
          { prompt: "Which sentence does NOT belong in a paragraph about 'Reasons to walk to school'?", options: ["Walking keeps us fit.", "We see our neighbours on the way.", "The school uniform is blue.", "Walking saves money on bus fare."], correct: "The school uniform is blue.", explanation: "It does not support the main idea of reasons to walk." },
          { prompt: "Which is the best concluding sentence for a paragraph about village festivals?", options: ["Festivals are loud.", "Village festivals bring the whole community together, and that is what makes them special.", "There are festivals.", "People eat food."], correct: "Village festivals bring the whole community together, and that is what makes them special.", explanation: "A conclusion rounds off the main idea." },
        ],
      },
      {
        activityId: "para-fill", title: "Complete the sentence", instruction: "Complete each sentence with a suitable linking word.", type: "fill-blank",
        items: [
          { sentence: "____, she grinds the batter herself. (first detail)", correct: ["First", "Firstly", "To begin with"], explanation: "A sequence opener like 'First' marks the first detail." },
          { sentence: "The hall was crowded; ____, we found seats in the front row.", correct: ["however", "but", "still", "yet"], explanation: "A contrast is needed: they still found seats." },
          { sentence: "____, the volunteers cleaned up the ground before leaving.", correct: ["Finally", "Lastly", "In the end"], explanation: "'Finally' marks the last step." },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "sentence-correction", "true-false", "fill-in-the-blank"] },
  },
  {
    id: "formal-informal-letters", areaId: "writing", order: 2, name: "Formal and Informal Letters",
    tagline: "Know your reader: letters, emails and the right tone.",
    objectives: [
      "Distinguish formal from informal writing.",
      "Use the correct greeting, body and closing for a letter or email.",
      "Choose formal or informal language to match the reader.",
    ],
    lesson: {
      intro: "We write differently to a friend and to an officer. Formal writing is polite and complete; informal writing is warm and relaxed. Matching the tone to the reader is the key skill.",
      sections: [
        {
          heading: "Formal versus informal",
          body: "Formal letters use respectful greetings (Dear Sir/Madam), complete sentences, and standard words. Informal letters to friends and family are friendly and conversational.",
          points: [
            "Formal opener: 'Dear Sir/Madam' · Informal: 'Dear Priya'",
            "Formal: 'I would like to request permission…' · Informal: 'Can I come over?'",
            "Formal closer: 'Yours faithfully' · Informal: 'Yours lovingly / Your friend'",
          ],
        },
        {
          heading: "The shape of a letter",
          body: "A formal letter: sender's address and date, a clear subject line, greeting, body (why you are writing, details, what you want), closing, and signature.",
          examples: [
            "Subject line: 'Request for a library membership'",
            "Body: state the purpose in the first line, give details, end politely.",
          ],
        },
        {
          heading: "Emails follow the same rules",
          body: "Emails can be shorter, but formal emails still need a clear subject, a polite greeting and a proper closing. Replies should be prompt and to the point.",
          points: [
            "Always fill in the subject line.",
            "Greet, state your message clearly, thank, and close.",
            "Proofread before sending — the reader sees your care.",
          ],
        },
      ],
      recap: [
        "Formal = polite, complete, respectful; informal = friendly and relaxed.",
        "Dear Sir/Madam → Yours faithfully; Dear Name → informal closings.",
        "A letter has address, date, greeting, body and closing.",
        "Emails need a clear subject and a polite tone too.",
      ],
      practice: {
        prompt: "Write a short formal email to the librarian of your town library requesting two extra books for your school project. Include a subject line, a polite greeting, the reason for your request, and a thank-you.",
        rubric: [
          "Has a clear subject line.",
          "Uses a formal greeting and closing.",
          "States the purpose in the first line.",
          "Gives one or two details about the project.",
          "Ends politely with a thank-you.",
        ],
      },
    },
    activities: [
      {
        activityId: "letter-mcq", title: "Choose the right language", instruction: "Pick the sentence that fits the reader.", type: "mcq",
        items: [
          { prompt: "Which opener suits a formal letter?", options: ["Hey there!", "Dear Sir/Madam,", "Hi buddy,", "Yo!"], correct: "Dear Sir/Madam,", explanation: "Formal letters open with a respectful greeting." },
          { prompt: "Which closing fits an informal letter to a friend?", options: ["Yours faithfully", "Yours sincerely", "Take care, your friend", "Respectfully submitted"], correct: "Take care, your friend", explanation: "Warm, friendly closings suit informal letters." },
          { prompt: "Which sentence is appropriate for a formal email?", options: ["Gimme the details fast.", "I would be grateful if you could share the schedule.", "Wassup, send me the info.", "U got the thing?"], correct: "I would be grateful if you could share the schedule.", explanation: "Complete, polite sentences suit formal writing." },
          { prompt: "A formal letter about a lost library book should ___ .", options: ["begin with a joke", "state the purpose clearly in the first line", "use slang", "leave out the date"], correct: "state the purpose clearly in the first line", explanation: "Formal letters get to the point politely and clearly." },
        ],
      },
      {
        activityId: "letter-order", title: "Order the letter", instruction: "Arrange the parts to form a sensible formal letter.", type: "sentence-order",
        items: [
          {
            promptHint: "Address and date, greeting, body, closing.",
            lines: [
              { id: "l1", text: "Request for permission to use the playground on Saturdays." },
              { id: "l2", text: "The Principal, Sunrise High School, Chennai." },
              { id: "l3", text: "Dear Sir/Madam," },
              { id: "l4", text: "I am writing to request permission for the cricket team to practise in the school playground on Saturday mornings." },
              { id: "l5", text: "Yours faithfully, Karthik" },
            ],
            correctOrder: ["l2", "l1", "l3", "l4", "l5"],
            explanation: "Address, then subject line, greeting, body, then the formal closing.",
          },
        ],
      },
      {
        activityId: "letter-fix", title: "Repair the writing", instruction: "Choose the correct version of each sentence.", type: "error-find",
        items: [
          { prompt: "i wants to apply for the scholarship.", options: ["i wants to apply for the scholarship.", "I want to apply for the scholarship.", "I wants to apply for the scholarship.", "i want to apply for the scholarship."], correct: "I want to apply for the scholarship.", explanation: "Capital I, capital letter to start, and 'I want' (not 'wants')." },
          { prompt: "Dear sir, i am writing to complain about the noise.", options: ["Dear sir, i am writing to complain about the noise.", "Dear Sir, I am writing to complain about the noise.", "dear sir, I am writing to complain about the noise.", "Dear Sir, i am writing to complain about the noise."], correct: "Dear Sir, I am writing to complain about the noise.", explanation: "Capitalise the greeting and the pronoun I." },
          { prompt: "Thanking you, yours faithfully is the correct closing.", options: ["Thanking you, yours faithfully", "Thanking you, Your's faithfully", "Thanking you, yours faithfully,", "Thanking you, yours faithful"], correct: "Thanking you, yours faithfully,", explanation: "The formal closing has a comma after it before the signature." },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "sentence-correction"] },
  },
  {
    id: "narrative-descriptive", areaId: "writing", order: 3, name: "Narrative and Descriptive Writing",
    tagline: "Tell a story and paint a scene with words.",
    objectives: [
      "Plan a short story with a beginning, middle and end.",
      "Use descriptive words to create vivid pictures.",
      "Edit writing for spelling, punctuation and organisation.",
    ],
    lesson: {
      intro: "A narrative tells what happened; a description paints a picture with sensory words. Strong writing mixes both: a story about a rainy day is even better when we can feel the cold drops.",
      sections: [
        {
          heading: "The shape of a story",
          body: "Every story has characters, a setting, a problem and a resolution. Plan the beginning (who, where), the middle (what happens — the problem), and the end (how it works out).",
          points: [
            "Beginning: introduce the characters and setting.",
            "Middle: a problem or event builds interest.",
            "End: a resolution or a satisfying close.",
          ],
        },
        {
          heading: "Descriptive words",
          body: "Use words for the senses — sight, sound, smell, touch, taste. Instead of 'the food was good', write 'the hot soup was creamy and fragrant'.",
          examples: [
            "Plain: 'The dog came in.'",
            "Vivid: 'The muddy dog bounded in, shaking water across the floor.'",
          ],
        },
        {
          heading: "Editing your work",
          body: "Good writing is rewritten. After drafting, check spelling, capital letters, full stops, and that your sentences are in a clear order. Read it aloud to hear awkward phrases.",
          points: [
            "Check one thing at a time: spellings, then punctuation, then order.",
            "Cut repeated words and off-topic sentences.",
            "A final read-aloud catchs the last mistakes.",
          ],
        },
      ],
      recap: [
        "Stories need a beginning, middle and end.",
        "Sensory words make descriptions vivid.",
        "Describe sight, sound, smell, touch and taste.",
        "Edit for spelling, punctuation and organisation — read aloud.",
      ],
      practice: {
        prompt: "Imagine you are standing at a railway station on a busy morning. Write a short descriptive paragraph (5–6 sentences) using at least three senses. Then rewrite one sentence to make it more vivid.",
        rubric: [
          "Uses at least three senses.",
          "Includes the setting clearly.",
          "Sentences are complete and punctuated.",
          "The rewrite is noticeably more vivid.",
          "Spellings and capital letters are correct.",
        ],
      },
    },
    activities: [
      {
        activityId: "narr-order", title: "Build a story", instruction: "Order the sentences to form a complete little story.", type: "sentence-order",
        items: [
          {
            promptHint: "Beginning, problem, resolution.",
            lines: [
              { id: "n1", text: "Leela found a small, shivering kitten outside her gate." },
              { id: "n2", text: "She carried it inside and wrapped it in a warm towel." },
              { id: "n3", text: "The kitten would not eat the milk she offered." },
              { id: "n4", text: "So Leela took it to the nearby animal clinic." },
              { id: "n5", text: "After a week of care, the kitten was healthy and full of mischief." },
            ],
            correctOrder: ["n1", "n2", "n3", "n4", "n5"],
            explanation: "The story moves from finding the kitten to caring for it and the happy ending.",
          },
        ],
      },
      {
        activityId: "narr-mcq", title: "Choose the vivid sentence", instruction: "Pick the sentence that is most descriptive.", type: "mcq",
        items: [
          { prompt: "Which sentence paints the clearest picture?", options: ["The rain fell.", "The rain came down heavily.", "Cold, slanting rain hammered the tin roof all night.", "It was raining."], correct: "Cold, slanting rain hammered the tin roof all night.", explanation: "It uses sensory details — cold, slanting, hammered — to paint the scene." },
          { prompt: "Best story BEGINNING:", options: ["It ended well.", "On a hot afternoon, Meena and her brother discovered a locked door in the old house.", "The door was brown.", "Anyway they went home."], correct: "On a hot afternoon, Meena and her brother discovered a locked door in the old house.", explanation: "It sets the characters, setting and a hint of the problem." },
          { prompt: "Best story ENDING:", options: ["The sunrise is nice.", "And that is how a rusty old key opened a whole new chapter of adventures for the twins.", "They slept.", "The end."], correct: "And that is how a rusty old key opened a whole new chapter of adventures for the twins.", explanation: "It resolves the story with a satisfying, reflective close." },
          { prompt: "Which word is NOT used to describe in: 'The dusty, golden afternoon glowed.' ?", options: ["dusty", "golden", "afternoon", "glowed"], correct: "afternoon", explanation: "'Afternoon' is the noun being described; the other words describe it." },
        ],
      },
      {
        activityId: "narr-fix", title: "Repair the writing", instruction: "Choose the correctly edited sentence.", type: "error-find",
        items: [
          { prompt: "she runned to the bus stop.", options: ["she runned to the bus stop.", "She run to the bus stop.", "She ran to the bus stop.", "She runned too the bus stop."], correct: "She ran to the bus stop.", explanation: "'Ran' is the correct past form, with a capital letter." },
          { prompt: "the park was full of childrens playing.", options: ["the park was full of childrens playing.", "The park was full of children playing.", "The park was full of childrens plays.", "The park were full of children playing."], correct: "The park was full of children playing.", explanation: "Capital letter and 'children' are already plural — no 'childrens'." },
          { prompt: "after the match, we celebrated our victory.", options: ["after the match, we celebrated our victory.", "After the match we celebrated our victory.", "After the match, we celebrated our victory.", "After the match, We celebrated our victory."], correct: "After the match, we celebrated our victory.", explanation: "Capital letter at the start, comma after the opener, lowercase 'we' after it." },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "sentence-correction", "true-false"] },
  },
];

// ── LISTENING OBSERVATORY ──────────────────────────────────────────────────
const LISTENING = [
  {
    id: "instructions-announcements", areaId: "listening", order: 1, name: "Instructions and Announcements",
    tagline: "Catch the key details when someone gives a notice.",
    objectives: [
      "Listen for the key details in an announcement.",
      "Follow the order of instructions.",
      "Understand purpose and important numbers, times and places.",
    ],
    lesson: {
      intro: "Announcements and instructions are everywhere — at school, at the station, in shops. Listen for who, what, when, where and the steps in the right order.",
      sections: [
        {
          heading: "The announcement",
          body: "Listen to this announcement (your device can read it aloud): 'Attention students! The annual science exhibition will be held this Saturday from 10 a.m. to 2 p.m. in the main hall. Participants should register their names with their class teachers by Wednesday. Students with exhibits should reach the hall by 9:30 a.m. to set up their stalls. Please bring your own drinking water and labels for your projects.'",
          points: [
            "Event: annual science exhibition · Day: Saturday · Time: 10 a.m. to 2 p.m.",
            "Place: the main hall · Deadline: register by Wednesday.",
            "Setup time for exhibitors: 9:30 a.m.",
          ],
        },
        {
          heading: "Listening for instructions",
          body: "Instructions come in steps. Note the order words: first, then, next, finally. Miss one step and the whole task fails — so repeat the steps in your head as you hear them.",
          examples: [
            "First register your name, then bring labels, finally set up your stall — order matters.",
          ],
        },
        {
          heading: "Who, what, when, where",
          body: "The W-questions organise any announcement. Ask yourself these as you listen, and note numbers separately — 10 a.m., 9:30 a.m., Wednesday — they are easy to swap.",
          points: [
            "Who is speaking and who is it for?",
            "What is happening and why?",
            "When and where does it happen?",
            "Any numbers, times or dates to remember?",
          ],
        },
      ],
      recap: [
        "Announcements answer who, what, when, where.",
        "Instruction steps come in a fixed order — watch the order words.",
        "Note numbers, times and dates carefully.",
        "Replay if you missed a detail — listening again is good practice.",
      ],
    },
    activities: [
      {
        activityId: "ann-mcq", title: "Key details", instruction: "Answer each question about the announcement.", type: "mcq",
        items: [
          { prompt: "When will the science exhibition be held?", options: ["next month", "this Saturday", "this Sunday", "on Wednesday"], correct: "this Saturday", explanation: "The announcement says 'this Saturday from 10 a.m. to 2 p.m.'." },
          { prompt: "Where will the exhibition be held?", options: ["the library", "the playground", "the main hall", "the canteen"], correct: "the main hall", explanation: "The announcement names the main hall." },
          { prompt: "By when must participants register?", options: ["Saturday", "Wednesday", "9:30 a.m.", "2 p.m."], correct: "Wednesday", explanation: "Registration closes by Wednesday, the announcement says." },
          { prompt: "When should students with exhibits reach the hall?", options: ["10 a.m.", "2 p.m.", "9:30 a.m.", "12 noon"], correct: "9:30 a.m.", explanation: "Exhibitors must arrive by 9:30 a.m. to set up." },
        ],
      },
      {
        activityId: "ann-tf", title: "True or false", instruction: "Judge each statement from the announcement.", type: "true-false",
        items: [
          { statement: "The exhibition lasts until 2 p.m.", correct: true, explanation: "10 a.m. to 2 p.m. is the announced timing." },
          { statement: "Students should bring their own drinking water.", correct: true, explanation: "The announcement asks students to bring drinking water." },
          { statement: "Registration happens on the day of the exhibition.", correct: false, explanation: "Registration must be done by Wednesday — before the event." },
        ],
      },
      {
        activityId: "ann-order", title: "Order the instructions", instruction: "Put the steps for exhibitors in the correct order.", type: "sentence-order",
        items: [
          {
            promptHint: "From first to last.",
            lines: [
              { id: "a1", text: "Register your name with your class teacher." },
              { id: "a2", text: "Prepare labels for your project." },
              { id: "a3", text: "Reach the hall by 9:30 a.m. on Saturday." },
              { id: "a4", text: "Set up your stall with your project and labels." },
            ],
            correctOrder: ["a1", "a2", "a3", "a4"],
            explanation: "Register first, then labels, arrive early, finally set up.",
          },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "fill-in-the-blank"] },
  },
  {
    id: "everyday-conversations", areaId: "listening", order: 2, name: "Everyday Conversations",
    tagline: "Follow two speakers — who says what and what they really mean.",
    objectives: [
      "Identify each speaker in a conversation.",
      "Understand the purpose of a conversation.",
      "Answer questions about what was said and implied.",
    ],
    lesson: {
      intro: "Conversations are quicker than announcements. Two speakers take turns, and meaning often hides in tone — a question can really be a request.",
      sections: [
        {
          heading: "The conversation",
          body: "Listen to this conversation (your device can read it aloud): 'Mother: Ravi, is your homework finished? Ravi: Almost, Amma. Just the maths problems are left. Mother: The maths teacher said the sums are important. Ravi: I know. Can you help me after dinner? Mother: Of course. Finish the other subjects first, then we will sit together. Ravi: Thank you! I will finish quickly.'",
          points: [
            "Purpose: Ravi wants help with maths homework.",
            "Mother's hint: maths sums are important — finish other subjects first.",
            "Implication: Ravi's homework is not yet done.",
          ],
        },
        {
          heading: "Who says what",
          body: "Track the speakers by their names or roles. 'Mother' gives the request a rule (finish other subjects first); Ravi responds with thanks and a promise.",
          examples: [
            "Asking 'Who proposed the help?' → Mother said 'we will sit together'.",
          ],
        },
        {
          heading: "Implied meaning",
          body: "Listeners work out feelings and intentions even when they are not stated. 'Almost' means not finished. 'Can you help me after dinner?' is a polite request, not just a question.",
          points: [
            "Question forms often hide requests.",
            "Short answers like 'Almost' still carry information.",
            "Tone (polite, hurried, worried) adds meaning.",
          ],
        },
      ],
      recap: [
        "Identify each speaker and the purpose of the talk.",
        "Questions can be polite requests.",
        "Short answers like 'Almost' still carry information.",
        "Tone and clues reveal implied meaning.",
      ],
    },
    activities: [
      {
        activityId: "conv-mcq", title: "Conversation questions", instruction: "Answer each question about the conversation.", type: "mcq",
        items: [
          { prompt: "Why does Ravi ask for help?", options: ["He does not know how to cook.", "He is stuck on the maths problems.", "He lost his notebook.", "He wants to play cricket."], correct: "He is stuck on the maths problems.", explanation: "He says the maths problems are left and asks for help." },
          { prompt: "What does Mother ask Ravi to do first?", options: ["Do the maths sums.", "Sleep early.", "Finish the other subjects first.", "Call his friend."], correct: "Finish the other subjects first.", explanation: "Mother says: finish the other subjects first, then we will sit together." },
          { prompt: "What does 'Almost' tell us about Ravi's homework?", options: ["It is completely finished.", "It is not finished yet.", "It was never started.", "It was lost."], correct: "It is not finished yet.", explanation: "'Almost' means almost done — not finished." },
          { prompt: "The sentence 'Can you help me after dinner?' is really a ___ .", options: ["fact", "polite request", "command", "joke"], correct: "polite request", explanation: "Question forms often work as polite requests." },
        ],
      },
      {
        activityId: "conv-tf", title: "True or false", instruction: "Judge each statement from the conversation.", type: "true-false",
        items: [
          { statement: "Ravi is completely free tonight.", correct: false, explanation: "He still has maths problems left and dinner to come." },
          { statement: "Mother agrees to help Ravi with the sums.", correct: true, explanation: "She says 'of course' and plans to sit together." },
          { statement: "The maths teacher warned that the sums are important.", correct: true, explanation: "Mother reports the teacher's warning." },
        ],
      },
      {
        activityId: "conv-order", title: "Order the conversation", instruction: "Put the exchanges in the order they happened.", type: "sentence-order",
        items: [
          {
            promptHint: "Opening question first.",
            lines: [
              { id: "c1", text: "Amma, your homework — is it finished?" },
              { id: "c2", text: "Almost, Amma. Just the maths problems are left." },
              { id: "c3", text: "Finish the other subjects first, then we will sit together." },
              { id: "c4", text: "Thank you! I will finish quickly." },
            ],
            correctOrder: ["c1", "c2", "c3", "c4"],
            explanation: "Mother asks, Ravi answers, Mother sets the plan, Ravi thanks her.",
          },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "fill-in-the-blank"] },
  },
  {
    id: "stories-descriptions", areaId: "listening", order: 3, name: "Stories and Descriptions",
    tagline: "Follow a spoken story — characters, sequence and the main point.",
    objectives: [
      "Identify characters and setting in a spoken story.",
      "Follow the sequence of events.",
      "Listen for the speaker's main point and specific information.",
    ],
    lesson: {
      intro: "Spoken stories move faster than written ones. Relax your eyes and let your ears do the work: catch who is in the story, where it happens, and what happens first, next and last.",
      sections: [
        {
          heading: "The story",
          body: "Listen to this short talk (your device can read it aloud): 'Last Diwali, my grandmother told us the story of a clever crow. The crow was thirsty and found a tall pot with a little water at the bottom. It dropped pebbles into the pot, one by one. The water rose higher and higher until the crow could drink. My grandmother said the story teaches us to think patiently instead of giving up.'",
          points: [
            "Characters: a thirsty crow (and the grandmother telling the tale).",
            "Setting: a summer day near a tall pot.",
            "Sequence: found pot → dropped pebbles → water rose → drank.",
            "Main point: patient thinking beats giving up.",
          ],
        },
        {
          heading: "Following the sequence",
          body: "Stories move in time. Listen for order markers: first, then, until, finally. The pebbles go in one by one — each drop raises the water a little.",
          examples: [
            "found the pot → dropped pebbles → water rose → drank at last.",
          ],
        },
        {
          heading: "The main point",
          body: "A story usually ends with its message. The grandmother's closing line tells us the point: think patiently, do not give up. Stories often teach through a character's success.",
          points: [
            "The ending often holds the message.",
            "A character's action shows the lesson.",
            "Specific details (pebbles, tall pot) support the story's meaning.",
          ],
        },
      ],
      recap: [
        "Identify characters, setting and the sequence of events.",
        "Order markers (first, then, finally) guide the listener.",
        "The main point is often in the closing lines.",
        "Details like 'pebbles' and 'tall pot' make the story clear.",
      ],
    },
    activities: [
      {
        activityId: "story-mcq", title: "Story questions", instruction: "Answer each question about the story.", type: "mcq",
        items: [
          { prompt: "Who tells the story of the crow?", options: ["the crow", "the grandmother", "a neighbour", "the narrator in the pot"], correct: "the grandmother", explanation: "The speaker says 'my grandmother told us the story'." },
          { prompt: "Why could not the crow drink at first?", options: ["The pot was empty.", "The water was too low to reach.", "The crow was not thirsty.", "The pot was broken."], correct: "The water was too low to reach.", explanation: "The pot had 'a little water at the bottom'." },
          { prompt: "What did the crow do to reach the water?", options: ["It broke the pot.", "It dropped pebbles into the pot.", "It waited for rain.", "It called other crows."], correct: "It dropped pebbles into the pot.", explanation: "The crow dropped pebbles one by one to raise the water." },
          { prompt: "What is the main point of the story?", options: ["Crows are cleverer than people.", "Patience and thinking beat giving up.", "Pots should be covered.", "Diwali is a festival of lights."], correct: "Patience and thinking beat giving up.", explanation: "The grandmother's closing line states the lesson." },
        ],
      },
      {
        activityId: "story-order", title: "Order the story", instruction: "Put the events in the correct order.", type: "sentence-order",
        items: [
          {
            promptHint: "From the crow's problem to its success.",
            lines: [
              { id: "d1", text: "The thirsty crow found a tall pot." },
              { id: "d2", text: "It saw a little water at the bottom." },
              { id: "d3", text: "It dropped pebbles into the pot, one by one." },
              { id: "d4", text: "The water rose higher and higher." },
              { id: "d5", text: "At last the crow could drink." },
            ],
            correctOrder: ["d1", "d2", "d3", "d4", "d5"],
            explanation: "Finding the pot, seeing the water, adding pebbles, rising water, then drinking.",
          },
        ],
      },
      {
        activityId: "story-fill", title: "Fill in the blank", instruction: "Complete each sentence from the story.", type: "fill-blank",
        items: [
          { sentence: "The crow found a tall ____ with a little water at the bottom.", correct: ["pot", "vessel", "jar"], explanation: "The story says a tall pot." },
          { sentence: "The crow dropped ____ into the pot, one by one.", correct: ["pebbles", "stones", "rocks"], explanation: "The crow dropped pebbles one by one." },
          { sentence: "My grandmother said the story teaches us to think ____ instead of giving up.", correct: ["patiently", "patience", "carefully"], explanation: "The lesson is patient thinking rather than giving up." },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "fill-in-the-blank"] },
  },
];

// ── SPEAKING MISSION ───────────────────────────────────────────────────────
const SPEAKING = [
  {
    id: "self-introduction", areaId: "speaking", order: 1, name: "Self-Introduction",
    tagline: "Introduce yourself clearly: name, family, likes and goals.",
    objectives: [
      "Introduce yourself with a clear structure.",
      "Ask and answer everyday questions about yourself.",
      "Speak in complete, confident sentences.",
    ],
    lesson: {
      intro: "A good self-introduction is short, friendly and organised: greet, say your name, add a little about yourself, and close. Practise it until it feels natural.",
      sections: [
        {
          heading: "The structure",
          body: "Greet your listeners, state your name and class, add a detail (hobby, family, ambition), and end politely. Listen to this model (your device can read it aloud): 'Good morning everyone. My name is Meena and I study in Class 8. I live in Madurai with my parents and my younger brother. I love reading adventure stories and playing badminton. My dream is to become a wildlife photographer. Thank you.'",
          points: [
            "Greet → name → class → one or two details → ambition → thank you.",
            "Keep it to 4–6 sentences for a first introduction.",
          ],
        },
        {
          heading: "Answering questions about yourself",
          body: "Everyday questions: What is your name? Where do you live? What are your hobbies? Why do you like them? Answer in full sentences — 'I live in Madurai' is better than just 'Madurai'.",
          examples: [
            "Q: 'What do you do in your free time?' A: 'I read adventure stories and play badminton with my friends.'",
          ],
        },
        {
          heading: "Confident delivery",
          body: "Speak slowly enough to be understood, look at your listeners, and breathe between sentences. Practising aloud — even to yourself — builds fluency.",
          points: [
            "Pause at full stops, not between every word.",
            "A friendly smile and eye contact help.",
            "Record and replay yourself to hear how you sound.",
          ],
        },
      ],
      recap: [
        "Introduce with: greet, name, class, details, ambition, thank you.",
        "Answer personal questions in full sentences.",
        "Speak slowly, pause at full stops, practise aloud.",
      ],
    },
    activities: [
      {
        activityId: "intro-order", title: "Build your introduction", instruction: "Order the sentences to make a smooth self-introduction.", type: "sentence-order",
        items: [
          {
            promptHint: "Greeting and name first, thank-you last.",
            lines: [
              { id: "i1", text: "Good morning everyone." },
              { id: "i2", text: "My name is Karthik and I study in Class 8." },
              { id: "i3", text: "I live in Coimbatore with my parents and my elder sister." },
              { id: "i4", text: "I enjoy playing chess and drawing cartoons." },
              { id: "i5", text: "Thank you for listening." },
            ],
            correctOrder: ["i1", "i2", "i3", "i4", "i5"],
            explanation: "Greet, name, details, then a polite close.",
          },
        ],
      },
      {
        activityId: "intro-match", title: "Match question to answer", instruction: "Match each question with the best answer.", type: "match-pairs",
        items: [
          { left: "What is your name?", right: "My name is Devi." },
          { left: "Where do you live?", right: "I live in Thanjavur." },
          { left: "What are your hobbies?", right: "I love singing and cycling." },
          { left: "Why do you like cycling?", right: "Because it keeps me fit and happy." },
          { left: "What is your dream?", right: "I want to become an astronaut." },
        ],
      },
      {
        activityId: "intro-mcq", title: "Choose the complete answer", instruction: "Pick the most complete and polite answer.", type: "mcq",
        items: [
          { prompt: "Question: 'How are you today?'", options: ["Fine.", "I am doing well, thank you.", "OK.", "Hmm."], correct: "I am doing well, thank you.", explanation: "A complete, polite answer matches the question." },
          { prompt: "Question: 'What class are you in?'", options: ["Class 8.", "I am in Class 8.", "8.", "Eighth."], correct: "I am in Class 8.", explanation: "A full sentence is clearer and more confident." },
          { prompt: "Which closing suits an introduction?", options: ["Bye now.", "Thank you for listening.", "Whatever.", "Done."], correct: "Thank you for listening.", explanation: "A polite thank-you closes an introduction well." },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "sentence-correction"] },
  },
  {
    id: "picture-description", areaId: "speaking", order: 2, name: "Picture Description",
    tagline: "Describe a scene clearly: what, where, who and what is happening.",
    objectives: [
      "Describe a picture in an organised way.",
      "Use present continuous for what is happening.",
      "Add details of place, people and action.",
    ],
    lesson: {
      intro: "Describing a picture is like giving someone a guided tour of it. Start with the whole scene, then zoom in on details: what is in it, where things are, and what people are doing.",
      sections: [
        {
          heading: "The scene",
          body: "Imagine this picture (describe it aloud — your device can read this model): 'This is a picture of a busy seaside market on a sunny morning. On the left, a fish seller is arranging baskets of fresh fish. In the middle, customers are choosing vegetables. On the right, two children are watching a balloon seller. In the background, fishermen are mending their nets near the shore. The whole scene is full of colour and sound.'",
          points: [
            "Start with the whole picture in one sentence.",
            "Use positions: on the left, in the middle, on the right, in the background.",
            "Describe actions with the present continuous: is arranging, are choosing.",
          ],
        },
        {
          heading: "Organising your description",
          body: "Move in a fixed direction — left to right, or front to back. This stops you repeating yourself and helps the listener follow.",
          examples: [
            "Whole scene → left → middle → right → background.",
            "Add a closing thought: 'The scene feels busy but friendly.'",
          ],
        },
        {
          heading: "Making it lively",
          body: "Add colour, size and feeling: 'colourful baskets', 'fresh fish', 'sunny morning'. Also describe sounds and movement when you can.",
          points: [
            "Adjectives build a picture: bright, crowded, cheerful.",
            "Saying what people are doing adds life.",
            "End with an overall impression.",
          ],
        },
      ],
      recap: [
        "Start with the whole scene, then move left to right or back to front.",
        "Use position words (on the left, in the background).",
        "Describe actions with is/are + -ing.",
        "Add adjectives and end with an impression.",
      ],
      practice: {
        prompt: "Imagine a picture of your school canteen during the lunch break. Describe it aloud (or in writing) in 5–6 sentences using position words and present-continuous actions.",
        rubric: [
          "Describes the whole scene first.",
          "Uses two position words (left, middle, background...).",
          "Uses present continuous for at least two actions.",
          "Adds at least three descriptive adjectives.",
          "Ends with an overall impression.",
        ],
      },
    },
    activities: [
      {
        activityId: "pic-mcq", title: "Describe the picture", instruction: "Choose the sentence that best matches the description.", type: "mcq",
        items: [
          { prompt: "Which sentence describes the WHOLE scene?", options: ["The fish seller is arranging baskets.", "This is a picture of a busy seaside market on a sunny morning.", "Two children are watching a balloon seller.", "The fishermen are mending their nets."], correct: "This is a picture of a busy seaside market on a sunny morning.", explanation: "It introduces the whole scene before the details." },
          { prompt: "Which sentence uses the present continuous correctly?", options: ["The customers choose vegetables.", "The customers are choosing vegetables.", "The customers chosen vegetables.", "The customers are choose vegetables."], correct: "The customers are choosing vegetables.", explanation: "Actions happening in the picture take is/are + -ing." },
          { prompt: "Where are the fishermen in the description?", options: ["on the left", "in the middle", "on the right", "in the background"], correct: "in the background", explanation: "The model places the fishermen in the background near the shore." },
          { prompt: "Which word adds a lively detail?", options: ["sunny", "busy", "colourful", "all of these"], correct: "all of these", explanation: "Adjectives like sunny, busy and colourful all build the picture." },
        ],
      },
      {
        activityId: "pic-order", title: "Order the description", instruction: "Arrange the sentences into a clear description.", type: "sentence-order",
        items: [
          {
            promptHint: "Whole scene first, details next, impression last.",
            lines: [
              { id: "p1", text: "This is a picture of a busy seaside market on a sunny morning." },
              { id: "p2", text: "On the left, a fish seller is arranging baskets of fresh fish." },
              { id: "p3", text: "In the middle, customers are choosing vegetables." },
              { id: "p4", text: "In the background, fishermen are mending their nets near the shore." },
              { id: "p5", text: "The whole scene feels busy but friendly." },
            ],
            correctOrder: ["p1", "p2", "p3", "p4", "p5"],
            explanation: "Whole scene → left → middle → background → impression.",
          },
        ],
      },
      {
        activityId: "pic-fill", title: "Complete the description", instruction: "Fill in each blank with a suitable word.", type: "fill-blank",
        items: [
          { sentence: "This is a picture of a ____ seaside market on a sunny morning.", correct: ["busy", "colourful", "crowded", "lively"], explanation: "An adjective describing the scene fits." },
          { sentence: "____ the left, a fish seller is arranging baskets.", correct: ["On", "In", "At", "To"], explanation: "Position phrase: on the left." },
          { sentence: "Two children ____ (watch) a balloon seller.", correct: ["are watching", "watch"], explanation: "A present action takes is/are + -ing: are watching." },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "sentence-correction"] },
  },
  {
    id: "opinions-instructions", areaId: "speaking", order: 3, name: "Opinions and Instructions",
    tagline: "Give your view politely and guide others step by step.",
    objectives: [
      "Express an opinion and give a reason.",
      "Agree and disagree politely.",
      "Give clear instructions with order words.",
    ],
    lesson: {
      intro: "Speakers do two useful things: they share opinions with reasons, and they give instructions step by step. Both need clear, polite language.",
      sections: [
        {
          heading: "Expressing opinions",
          body: "Opinion starters: 'In my opinion…', 'I think…', 'I believe…'. Always back the opinion with a reason: 'I think cycling is better for town travel because it is quick and pollution-free.'",
          points: [
            "Opinion + reason = a strong answer.",
            "Polite disagreement: 'I see your point, but…'",
            "Listen first, then respond.",
          ],
        },
        {
          heading: "Agreeing and disagreeing",
          body: "Agree warmly: 'I completely agree', 'That is true'. Disagree politely: 'I understand, but I think differently', 'I am not sure about that because…'.",
          examples: [
            "'I agree that homework builds discipline.'",
            "'I see your point, but I feel too little time is left for sports.'",
          ],
        },
        {
          heading: "Giving instructions",
          body: "Put steps in order and use sequence words: first, then, next, finally. Speak one step at a time and name the object: 'First, take the dough. Then, roll it flat.'",
          examples: [
            "First, crack two eggs into a bowl. Then, whisk them well. Next, add salt. Finally, pour them into the pan.",
          ],
        },
      ],
      recap: [
        "Opinions need reasons: 'I think… because…'.",
        "Disagree politely: 'I see your point, but…'.",
        "Instructions use sequence words: first, then, next, finally.",
        "One clear step at a time, naming the object.",
      ],
    },
    activities: [
      {
        activityId: "opinion-match", title: "Match response to situation", instruction: "Match each situation with the most appropriate response.", type: "match-pairs",
        items: [
          { left: "A friend says: 'I think we should plant more trees.'", right: "I agree, trees cool the city and clean the air." },
          { left: "You disagree with: 'Tests are the only way to learn.'", right: "I see your point, but projects teach teamwork too." },
          { left: "Someone asks your choice: 'Tea or coffee?'", right: "I prefer tea because it is light." },
          { left: "A friend asks: 'Is homework useful?'", right: "In my opinion it is, because practice builds confidence." },
        ],
      },
      {
        activityId: "opinion-order", title: "Order the instructions", instruction: "Put the steps for making lemonade in order.", type: "sentence-order",
        items: [
          {
            promptHint: "First step to last step.",
            lines: [
              { id: "o1", text: "First, squeeze the juice from two lemons." },
              { id: "o2", text: "Then, add three spoons of sugar and stir well." },
              { id: "o3", text: "Next, pour in a glass of cold water." },
              { id: "o4", text: "Finally, add ice cubes and serve." },
            ],
            correctOrder: ["o1", "o2", "o3", "o4"],
            explanation: "Juice first, then sugar, water, and finally ice.",
          },
        ],
      },
      {
        activityId: "opinion-mcq", title: "Choose the polite reply", instruction: "Pick the most appropriate response.", type: "mcq",
        items: [
          { prompt: "Your friend picks a film you dislike. Best reply:", options: ["That is a terrible choice.", "I do not like that film much, but I will watch the next one.", "No way.", "Whatever."], correct: "I do not like that film much, but I will watch the next one.", explanation: "It disagrees politely and keeps the friendship." },
          { prompt: "Your teacher asks your opinion on school trips. Best reply:", options: ["Trips are fun.", "In my opinion, school trips help us learn outside the classroom because we see things for ourselves.", "Trips are boring, period.", "I don't care."], correct: "In my opinion, school trips help us learn outside the classroom because we see things for ourselves.", explanation: "An opinion with a reason is a strong answer." },
          { prompt: "You need to explain how to plant a seed. Best opener:", options: ["First, dig a small hole in the soil.", "Plants need soil.", "Seeds are small.", "Just put the seed."], correct: "First, dig a small hole in the soil.", explanation: "Instructions start with an ordered first step." },
        ],
      },
    ],
    assessment: { questionCount: 6, difficulty: "medium", types: ["mcq", "true-false", "sentence-correction"] },
  },
];

// ── COMBINED CURRICULUM ────────────────────────────────────────────────────
const ENGLISH_TOPICS = [
  ...GRAMMAR,
  ...READING,
  ...VOCABULARY,
  ...WRITING,
  ...LISTENING,
  ...SPEAKING,
].map((t) => {
  const area = ENGLISH_AREAS.find((a) => a.id === t.areaId);
  // Normalise legacy layout: lesson.recap and lesson.practice live nested under
  // `lesson` in the seed; hoist both up to the topic level so they are
  // first-class fields everywhere (shapeTopic, AI prompt, recap step,
  // writing practice card, writing feedback endpoint).
  const { lesson, ...rest } = t;
  const { recap, practice, ...lessonRest } = lesson || {};
  return {
    ...rest,
    lesson: lessonRest,
    recap: Array.isArray(recap) ? recap : t.recap || [],
    practice: practice || t.practice || null,
    world: area ? area.world : "planet",
    accent: area ? area.accent : "#1a7a50",
  };
});

// ── Lookup helpers (used by the routes and by the frontend via API) ────────
function getEnglishAreas() {
  return ENGLISH_AREAS.map((a) => ({
    ...a,
    topics: getEnglishTopics(a.id).map((t) => ({
      id: t.id, name: t.name, order: t.order, tagline: t.tagline, world: t.world, accent: t.accent,
      assessment: { questionCount: t.assessment.questionCount, difficulty: t.assessment.difficulty },
    })),
  }));
}

function getEnglishArea(areaId) {
  const area = ENGLISH_AREAS.find((a) => a.id === areaId);
  if (!area) return null;
  return { ...area, topics: getEnglishTopics(areaId) };
}

function getEnglishTopics(areaId) {
  return ENGLISH_TOPICS.filter((t) => t.areaId === areaId).sort((a, b) => a.order - b.order);
}

function englishTopicById(topicId) {
  return ENGLISH_TOPICS.find((t) => t.id === topicId) || null;
}

function englishAreaById(areaId) {
  return ENGLISH_AREAS.find((a) => a.id === areaId) || null;
}

// Topics are listed in strict order of study — the module's "common
// curriculum". Progression helper: topics unlock one after another within an
// area; the first topic of every area is always open.
function orderedTopics() {
  const out = [];
  for (const a of ENGLISH_AREAS) out.push(...getEnglishTopics(a.id));
  return out;
}

// Required activities: the student must complete every activity in a topic
// before that topic's AI assessment unlocks (server-side check).
function requiredActivityIds(topic) {
  return topic.activities.map((a) => a.activityId);
}

function activityById(topic, activityId) {
  return (topic.activities || []).find((a) => a.activityId === activityId) || null;
}

// Shape an activity for the client: everything EXCEPT the correct answers.
function shapeActivity(a) {
  const base = {
    activityId: a.activityId,
    title: a.title,
    instruction: a.instruction,
    type: a.type,
    required: a.required !== false,
  };
  if (a.type === "mcq" || a.type === "error-find") {
    base.items = a.items.map((it) => ({
      prompt: it.prompt,
      options: it.options || [],
    }));
  } else if (a.type === "true-false") {
    base.items = a.items.map((it) => ({ statement: it.statement }));
  } else if (a.type === "fill-blank") {
    base.items = a.items.map((it) => ({ sentence: it.sentence }));
  } else if (a.type === "match-pairs") {
    base.pairs = a.items.map((it) => ({ left: it.left }));
    base.rightOptions = a.items.map((it) => it.right);
  } else if (a.type === "sentence-order") {
    base.items = a.items.map((it) => ({
      promptHint: it.promptHint || "",
      lines: it.lines.map((l) => ({ id: l.id, text: l.text })),
    }));
  }
  return base;
}

// Topic content for the client (no activity answers, no hidden fields).
function shapeTopic(topic) {
  return {
    id: topic.id,
    areaId: topic.areaId,
    world: topic.world,
    accent: topic.accent,
    name: topic.name,
    order: topic.order,
    tagline: topic.tagline,
    objectives: topic.objectives,
    lesson: topic.lesson,
    recap: topic.recap,
    practice: topic.practice || null,
    activities: topic.activities.map(shapeActivity),
    assessment: topic.assessment,
  };
}

// Idempotent no-op seeder (content lives in this file, consistent with the
// Maths mission curriculum approach). Returns a small summary for startup logs.
async function seedEnglishMissions() {
  return {
    areas: getEnglishAreas().length,
    topics: ENGLISH_TOPICS.length,
    activities: ENGLISH_TOPICS.reduce((n, t) => n + t.activities.length, 0),
  };
}

module.exports = {
  ENGLISH_AREAS,
  ENGLISH_TOPICS,
  getEnglishAreas,
  getEnglishArea,
  getEnglishTopics,
  englishTopicById,
  englishAreaById,
  requiredActivityIds,
  activityById,
  shapeActivity,
  shapeTopic,
  orderedTopics,
  seedEnglishMissions,
};