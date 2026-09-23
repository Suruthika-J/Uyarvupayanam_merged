// Seeds the Adhikaram Cartoon Theme System - six Thirukkural chapters rendered
// as illustrated cartoon worlds. Idempotent: only inserts when empty.
// Verse text is verbatim from the OKF Thirukkural dataset (antonykanagu/thirukkural);
// easyMeaning + example are authored for Class 5 readers from the Tamil commentaries.
const Adhikaram = require("../models/Adhikaram");

const k = (number, line1, line2, easyMeaning, example) => ({
  id: String(number),
  number,
  tamil: [line1, line2],
  easyMeaning,
  example,
});

const SEED = [
  {
    id: "1",
    number: 1,
    nameTamil: "கடவுள் வாழ்த்து",
    nameEn: "The Praise of God",
    section: "அறத்துப்பால்",
    accent: "#e8a33d",
    environment: "sunrise",
    intro: "Watch the sun rise over golden temple towers - the first book of the Kural begins with praise for the God who made the world.",
    theme: {
      environment: "sunrise",
      mood: "calm",
      animation: "drift",
      palette: {
        skyTop: "#2b2147",
        skyBottom: "#ffb37b",
        ground: "#5a4664",
        accent: "#ffc66b",
        cardBg: "#fff6e7",
        cardAccent: "#c98a3d",
      },
    },
    kurals: [
      k(
        1,
        "அகர முதல எழுத்தெல்லாம் ஆதி",
        "பகவன் முதற்றே உலகு.",
        "Just as the letter 'அ' (A) comes first in the alphabet, God stands before all that exists in the world.",
        "When we learn the alphabet we start with 'A' - and when we think about the world, the first thought is of God."
      ),
      k(
        2,
        "கற்றதனால் ஆய பயனென்கொல் வாலறிவன்",
        "நற்றாள் தொழாஅர் எனின்.",
        "What is the use of all our learning if we do not bow to the feet of the all-wise God?",
        "We read many books. If we forget to be humble and to give thanks, all that knowledge loses its purpose."
      ),
      k(
        3,
        "மலர்மிசை ஏகினான் மாணடி சேர்ந்தார்",
        "நிலமிசை நீடுவாழ் வார்.",
        "Those who rest at the feet of the One who dwells on the flower will live long and well on this earth.",
        "Resting close to God is like sitting in the shade of a tall tree - it brings a long, peaceful life."
      ),
      k(
        4,
        "வேண்டுதல் வேண்டாமை இலானடி சேர்ந்தார்க்கு",
        "யாண்டும் இடும்பை இல.",
        "Those who reach the One who has no wants or dislikes will never face sorrow.",
        "When you stop demanding too many things, the little worries of the day stop nagging you too."
      ),
      k(
        5,
        "இருள்சேர் இருவினையும் சேரா இறைவன்",
        "பொருள்சேர் புகழ்புரிந்தார் மாட்டு.",
        "Sorrow and darkness never come close to those who love the true praise of God.",
        "A heart kept busy with good and grateful thoughts has no room left for fear or sadness."
      ),
      k(
        6,
        "பொறிவாயில் ஐந்தவித்தான் பொய்தீர் ஒழுக்க",
        "நெறிநின்றார் நீடுவாழ் வார்.",
        "Those who walk the pure path of the One who mastered the five senses live a long life.",
        "Learning to keep the five senses in check keeps our life honest, steady and long."
      ),
      k(
        7,
        "தனக்குவமை இல்லாதான் தாள்சேர்ந்தார்க் கல்லால்",
        "மனக்கவலை மாற்றல் அரிது.",
        "Only those who reach the feet of the matchless One can truly calm their worried minds.",
        "A troubled heart finds peace when it turns to the One who has no equal on earth."
      ),
      k(
        8,
        "அறவாழி அந்தணன் தாள்சேர்ந்தார்க் கல்லால்",
        "பிறவாழி நீந்தல் அரிது.",
        "Without the feet of the wheel of virtue, no one can swim across the sea of rebirth.",
        "The sea of troubles is huge; only the watchful grace of the virtuous God helps us swim across it."
      ),
      k(
        9,
        "கோளில் பொறியின் குணமிலவே எண்குணத்தான்",
        "தாளை வணங்காத் தலை.",
        "Like a machine without its wheel, a head that never bows to the eight-virtued God is useless.",
        "A cart without its wheel rolls nowhere - and a proud head that never bows struggles through life too."
      ),
      k(
        10,
        "பிறவிப் பெருங்கடல் நீந்துவர் நீந்தார்",
        "இறைவன் அடிசேரா தார்.",
        "Those who rest at God's feet swim the great sea of birth; others sink in it.",
        "The vast sea of life is crossed only by those who hold firmly to noble faith."
      ),
    ],
  },
  {
    id: "2",
    number: 2,
    nameTamil: "வான்சிறப்பு",
    nameEn: "The Blessing of Rain",
    section: "அறத்துப்பால்",
    accent: "#4a7fb5",
    environment: "rain",
    intro: "Soft rain taps against the window while the Kural teaches how the clouds feed the whole wide world.",
    theme: {
      environment: "rain",
      mood: "fresh",
      animation: "rain",
      palette: {
        skyTop: "#3a5a72",
        skyBottom: "#9db8c6",
        ground: "#4e6b57",
        accent: "#7fc8d8",
        cardBg: "#eef5f9",
        cardAccent: "#2f7f92",
      },
    },
    kurals: [
      k(
        11,
        "வான்நின்று உலகம் வழங்கி வருதலால்",
        "தான்அமிழ்தம் என்றுணரற் பாற்று.",
        "Rain is the nectar of the world, because everything that lives depends on the sky for water.",
        "Water that falls from the sky is like milk to plants - without a drop of it, nothing can grow."
      ),
      k(
        12,
        "துப்பார்க்குத் துப்பாய துப்பாக்கித் துப்பார்க்குத்",
        "துப்பாய தூஉம் மழை.",
        "Rain is food to those who eat, and a helping hand to those who make the food.",
        "Farmers need rain to grow rice and the rice feeds our whole family - one cloud feeds everyone."
      ),
      k(
        13,
        "விண்இன்று பொய்ப்பின் விரிநீர் வியனுலகத்து",
        "உள்நின்று உடற்றும் பசி.",
        "If the sky breaks its promise of rain, hunger creeps into every corner of the wide world.",
        "When there is no rain, fields dry up and stomachs grow empty - the whole world feels the ache."
      ),
      k(
        14,
        "ஏரின் உழாஅர் உழவர் புயல்என்னும்",
        "வாரி வளங்குன்றிக் கால்.",
        "When the wealth of rain runs low, farmers rest their ploughs and nothing gets sown.",
        "A dry season makes the farmer lean on his spade and quietly watch the empty field."
      ),
      k(
        15,
        "கெடுப்பதூஉம் கெட்டார்க்குச் சார்வாய்மற் றாங்கே",
        "எடுப்பதூஉம் எல்லாம் மழை.",
        "Rain can lift up the fallen, but it can also destroy - the same sky gives and takes as it pleases.",
        "A gentle shower grows our garden while a heavy storm can wash it away - the same rain does both."
      ),
      k(
        16,
        "விசும்பின் துளிவீழின் அல்லால்மற் றாங்கே",
        "பசும்புல் தலைகாண்பு அரிது.",
        "Without drops falling from the sky, not even the tip of a blade of green grass will show itself.",
        "After a shower the lawn turns bright green; with no rain, the grass stays hidden under grey dust."
      ),
      k(
        17,
        "நெடுங்கடலும் தன்நீர்மை குன்றும் தடிந்தெழிலி",
        "தான்நல்கா தாகி விடின்.",
        "Even the mighty sea grows poor if the clouds only drink it up and never return the rain.",
        "Clouds scoop water from the sea and pour it back as rain - break that cycle and even the ocean suffers."
      ),
      k(
        18,
        "சிறப்பொடு பூசனை செல்லாது வானம்",
        "வறக்குமேல் வானோர்க்கும் ஈண்டு.",
        "When the sky turns dry, even festivals and offerings meant for heaven come to a stop.",
        "No rain, no harvest, no festival flowers - even the bright temple celebrations grow quiet."
      ),
      k(
        19,
        "தானம் தவம்இரண்டும் தங்கா வியன்உலகம்",
        "வானம் வழங்கா தெனின்.",
        "Charity and good deeds cannot stay in this wide world if the sky stops giving rain.",
        "We can only share food when the fields give food, and the fields need rain before they can give."
      ),
      k(
        20,
        "நீர்இன்று அமையாது உலகெனின் யார்யார்க்கும்",
        "வான்இன்று அமையாது ஒழுக்கு.",
        "Just as the world cannot live without water, a good and honest life cannot exist without rain.",
        "Fish without water and crops without rain are both impossible - water and rain are the stuff of life."
      ),
    ],
  },
  {
    id: "8",
    number: 8,
    nameTamil: "அன்புடைமை",
    nameEn: "The Possession of Love",
    section: "அறத்துப்பால்",
    accent: "#e2636f",
    environment: "warmHome",
    intro: "Lamp-glow fills a snug little home where the Kural shows that love holds every heart together.",
    theme: {
      environment: "warmHome",
      mood: "warm",
      animation: "glow",
      palette: {
        skyTop: "#71335f",
        skyBottom: "#ffb389",
        ground: "#9c5a46",
        accent: "#ff8f70",
        cardBg: "#fff1e6",
        cardAccent: "#c0553f",
      },
    },
    kurals: [
      k(
        71,
        "அன்பிற்கும் உண்டோ அடைக்குந்தாழ் ஆர்வலர்",
        "புன்கணீர் பூசல் தரும்.",
        "No lock can trap love - the tears of loving hearts will always make it known.",
        "You can lock a door, but you can never lock away a friend who truly misses you."
      ),
      k(
        72,
        "அன்பிலார் எல்லாம் தமக்குரியர் அன்புடையார்",
        "என்பும் உரியர் பிறர்க்கு.",
        "People without love keep everything for themselves; people with love belong to others too.",
        "A loving child shares the last piece of chocolate; a selfish one hides it like secret treasure."
      ),
      k(
        73,
        "அன்போடு இயைந்த வழக்கென்ப ஆருயிர்க்கு",
        "என்போடு இயைந்த தொடர்பு.",
        "Love joins souls together the way joints join the bones - it is the body's true bond.",
        "Our arms stay fixed to the body through joints; hearts stay fixed to each other through love."
      ),
      k(
        74,
        "அன்புஈனும் ஆர்வம் உடைமை அதுஈனும்",
        "நண்பு என்னும் நாடாச் சிறப்பு.",
        "Love brings warm attachment, and attachment brings the priceless treasure of friendship.",
        "When you truly care for someone, that care grows into a friendship no amount of money can buy."
      ),
      k(
        75,
        "அன்புற்று அமர்ந்த வழக்கென்ப வையகத்து",
        "இன்புற்றார் எய்தும் சிறப்பு.",
        "All the true happiness people enjoy in this world comes from living joined in love.",
        "The happiest moments of our day - laughing together at dinner - are moments made of love."
      ),
      k(
        76,
        "அறத்திற்கே அன்புசார் பென்ப அறியார்",
        "மறத்திற்கும் அஃதே துணை.",
        "Only the unwise say love helps goodness alone - even strength and courage lean on love too.",
        "A soldier's courage and an athlete's grit are both fuelled by love for the people they protect."
      ),
      k(
        77,
        "என்பி லதனை வெயில்போலக் காயுமே",
        "அன்பி லதனை அறம்.",
        "Righteousness scorches a loveless deed the way the sun scorches tiny boneless creatures.",
        "A good deed done without love turns harsh, like the burning sun on bare skin at noon."
      ),
      k(
        78,
        "அன்பகத் தில்லா உயிர்வாழ்க்கை வன்பாற்கண்",
        "வற்றல் மரந்தளிர்த் தற்று.",
        "A life empty of love is like a withered tree pretending to sprout on rocky ground.",
        "A plant with no water may look green for a moment - love is the water that truly feeds our life."
      ),
      k(
        79,
        "புறத்துறுப் பெல்லாம் எவன்செய்யும் யாக்கை",
        "அகத்துறுப்பு அன்பி லவர்க்கு.",
        "Shapely outer limbs mean nothing to a body whose inner part is empty of love.",
        "A pretty shell means nothing if the heart inside it stays cold and far away."
      ),
      k(
        80,
        "அன்பின் வழியது உயிர்நிலை அஃதிலார்க்கு",
        "என்புதோல் போர்த்த உடம்பு.",
        "Life's very pulse follows love; without love the body is only bone wrapped in skin.",
        "A warm hug or a glad 'hello' - these little loves are what make a body feel truly alive."
      ),
    ],
  },
  {
    id: "40",
    number: 40,
    nameTamil: "கல்வி",
    nameEn: "Learning",
    section: "பொருட்பால்",
    accent: "#2f9e6b",
    environment: "classroom",
    intro: "Sunlight coats the classroom desk while the Kural says learning is the one treasure nothing can destroy.",
    theme: {
      environment: "classroom",
      mood: "focused",
      animation: "bob",
      palette: {
        skyTop: "#8fc3e8",
        skyBottom: "#d6f0f7",
        ground: "#c8a06a",
        accent: "#f08a2e",
        cardBg: "#f2f8fd",
        cardAccent: "#2f6fa3",
      },
    },
    kurals: [
      k(
        391,
        "கற்க கசடறக் கற்பவை கற்றபின்",
        "நிற்க அதற்குத் தக.",
        "Learn thoroughly and without mistakes what is worth learning; then live in a way that honours it.",
        "Study your sums until they are clean and neat, then use that learning honestly outside the classroom."
      ),
      k(
        392,
        "எண்ணென்ப ஏனை எழுத்தென்ப இவ்விரண்டும்",
        "கண்ணென்ப வாழும் உயிர்க்கு.",
        "Numbers and letters are the two eyes of a living person.",
        "Just as we see the world with two eyes, we read the whole world with numbers and letters."
      ),
      k(
        393,
        "கண்ணுடையர் என்பவர் கற்றோர் முகத்திரண்டு",
        "புண்ணுடையர் கல்லா தவர்.",
        "The learned are called 'the sighted'; the untaught walk about carrying two sores on their face.",
        "A child who can read sees whole new worlds; the one who never learns walks around blind to them."
      ),
      k(
        394,
        "உவப்பத் தலைக்கூடி உள்ளப் பிரிதல்",
        "அனைத்தே புலவர் தொழில்.",
        "The scholar's whole art is to meet with joy, keep friends in mind when apart, and part without bitterness.",
        "After school ends, true learners stay friends in their hearts and remember each other kindly."
      ),
      k(
        395,
        "உடையார்முன் இல்லார்போல் ஏக்கற்றுங் கற்றார்",
        "கடையரே கல்லா தவர்.",
        "Even the learned stay humble, hungering for more knowledge like the needy; those who never learn are lowest.",
        "Even after winning the quiz, the best student still asks for one more book to read."
      ),
      k(
        396,
        "தொட்டனைத் தூறும் மணற்கேணி மாந்தர்க்குக்",
        "கற்றனைத் தூறும் அறிவு.",
        "A sandy well gives water as deep as you dig it; a person's knowledge flows as much as they learn.",
        "The deeper you dig a well, the more water gushes out - learn as much as you can and knowledge pours."
      ),
      k(
        397,
        "யாதானும் நாடாமால் ஊராமால் என்னொருவன்",
        "சாந்துணையுங் கல்லாத வாறு.",
        "One who wanders without purpose and refuses to learn stays a stranger in his own land till death.",
        "Because - thinking 'why should I bother?' - some children never try, and miss their chance to learn."
      ),
      k(
        398,
        "ஒருமைக்கண் தான்கற்ற கல்வி ஒருவற்கு",
        "எழுமையும் ஏமாப் புடைத்து.",
        "The learning gained in a single lifetime protects a person through seven more lives.",
        "The reading habit you build today stays with you for years and years, guarding you always."
      ),
      k(
        399,
        "தாமின் புறுவது உலகின் புறக்கண்டு",
        "காமுறுவர் கற்றறிந் தார்.",
        "True learners watch both the world's joys and its sorrows, and so they long to learn more.",
        "Seeing a friend stuck on a puzzle, the learner thinks, 'let me learn more so I can help'."
      ),
      k(
        400,
        "கேடில் விழுச்செல்வம் கல்வி யொருவற்கு",
        "மாடல்ல மற்றை யவை.",
        "For one person, learning is the wealth that never perishes; all other riches are not true riches.",
        "Money can be lost in a fire, but the sums and words stored in your head survive anything."
      ),
    ],
  },
  {
    id: "79",
    number: 79,
    nameTamil: "நட்பு",
    nameEn: "Friendship",
    section: "பொருட்பால்",
    accent: "#f2953f",
    environment: "playground",
    intro: "Laughter rises from the playground swings where the Kural says true friends rescue and protect you.",
    theme: {
      environment: "playground",
      mood: "joyful",
      animation: "sway",
      palette: {
        skyTop: "#6cc6e0",
        skyBottom: "#d8f6cf",
        ground: "#86bf6b",
        accent: "#ff7f4f",
        cardBg: "#f2fdf0",
        cardAccent: "#3e9a6b",
      },
    },
    kurals: [
      k(
        781,
        "செயற்கரிய யாவுள நட்பின் அதுபோல்",
        "வினைக்கரிய யாவுள காப்பு.",
        "What deed is harder to accomplish than friendship? What bond is harder to keep safe than it?",
        "Winning a shiny trophy is easy compared with keeping a true friend by your side."
      ),
      k(
        782,
        "நிறைநீர நீரவர் கேண்மை பிறைமதிப்",
        "பின்னீர பேதையார் நட்பு.",
        "Wise friendship grows fuller like the waxing moon; foolish friendship shrinks like the waning moon.",
        "A good friend's care grows day by day like the moon; a silly friend cools off just as fast."
      ),
      k(
        783,
        "நவில்தொறும் நூல்நயம் போலும் பயில்தொறும்",
        "பண்புடை யாளர் தொடர்பு.",
        "Like a fine book that pleases at every reading, friendship with the noble grows sweeter daily.",
        "Your favourite story gets richer every time you read it - so does time spent with a true friend."
      ),
      k(
        784,
        "நகுதற் பொருட்டன்று நட்டல் மிகுதிக்கண்",
        "மேற்செனறு இடித்தற் பொருட்டு.",
        "Friendship is not for shared laughter alone - a true friend must correct you when you go too far.",
        "When you pinch too hard during a game, a true friend says 'stop' instead of just giggling along."
      ),
      k(
        785,
        "புணர்ச்சி பழகுதல் வேண்டா உணர்ச்சிதான்",
        "நட்பாங் கிழமை தரும்.",
        "True connection needs no years of practice - a sudden feeling of understanding forges friendship.",
        "Two children meet on the same swing for the first time and just click, like old friends."
      ),
      k(
        786,
        "முகநக நட்பது நட்பன்று நெஞ்சத்து",
        "அகநக நட்பது நட்பு.",
        "A friend who only smiles warmly is not a friend - true friendship laughs from deep in the heart.",
        "Your best friend smiles with their whole face and eyes - not just their mouth - when you arrive."
      ),
      k(
        787,
        "அழிவி னவைநீக்கி ஆறுய்த்து அழிவின்கண்",
        "அல்லல் உழப்பதாம் நட்பு.",
        "True friendship turns you from harm, keeps you on the right path, and shares your sorrow when you fall.",
        "When you try to take a wrong shortcut, a true friend pulls you back and walks the right way with you."
      ),
      k(
        788,
        "உடுக்கை இழந்தவன் கைபோல ஆங்கே",
        "இடுக்கண் களைவதாம் நட்பு.",
        "As your hand instantly catches a slipping cloth, true friendship swiftly removes your troubles.",
        "The moment your bag tears, your friend is right there saving your books - not one second late."
      ),
      k(
        789,
        "நட்பிற்கு வீற்றிருக்கை யாதெனின் கொட்பின்றி",
        "ஒல்லும்வாய் ஊன்றும் நிலை.",
        "Friendship's greatest crown is standing steady and helping a friend wherever help is possible.",
        "Sitting on a friendship throne means being there in every small need, not just the big moments."
      ),
      k(
        790,
        "இனையர் இவரெமக்கு இன்னம்யாம் என்று",
        "புனையினும் புல்லென்னும் நட்பு.",
        "A friendship that needs loud boasting - 'I do this for him, he does that for me' - turns small and mean.",
        "Announcing 'look, we are best friends!' at every corner actually shrinks real friendship."
      ),
    ],
  },
  {
    id: "104",
    number: 104,
    nameTamil: "உழவு",
    nameEn: "Farming",
    section: "பொருட்பால்",
    accent: "#a9632e",
    environment: "farm",
    intro: "Golden fields roll toward the horizon as the Kural cheers for farmers - the linch-pin of the whole world.",
    theme: {
      environment: "farm",
      mood: "earthy",
      animation: "flutter",
      palette: {
        skyTop: "#8fc8e3",
        skyBottom: "#ffe0a3",
        ground: "#9b7a3d",
        accent: "#a85b2c",
        cardBg: "#fff6e2",
        cardAccent: "#8f5b28",
      },
    },
    kurals: [
      k(
        1031,
        "சுழன்றும்ஏர்ப் பின்னது உலகம் அதனால்",
        "உழந்தும் உழவே தலை.",
        "However the world wanders among trades, it always returns to the plough - farming is the greatest work.",
        "No matter how many jobs people try, everyone finally depends on the farmer's field for food."
      ),
      k(
        1032,
        "உழுவார் உலகத்தார்க்கு ஆணிஅஃ தாற்றாது",
        "எழுவாரை எல்லாம் பொறுத்து.",
        "Farmers are the linch-pin of the world - they carry everyone who rises to do other work.",
        "A cart-wheel is held steady by its small pin; the great wheel of the world is held by farmers."
      ),
      k(
        1033,
        "உழுதுண்டு வாழ்வாரே வாழ்வார்மற் றெல்லாம்",
        "தொழுதுண்டு பின்செல் பவர்.",
        "Those who live by ploughing and eating live with their own dignity; all others bow and depend on them.",
        "A farmer's family eats from its own field with pride, while every shop's bread still comes from one."
      ),
      k(
        1034,
        "பலகுடை நீழலும் தங்குடைக்கீழ்க் காண்பர்",
        "அலகுடை நீழ லவர்.",
        "Farmers whose fields wave with grain enjoy a shade of their own - greater than many kings' umbrellas.",
        "Kings hold tall umbrellas, but a farmer's true protection is the green field that feeds every kingdom."
      ),
      k(
        1035,
        "இரவார் இரப்பார்க்கொன்று ஈவர் கரவாது",
        "கைசெய்தூண் மாலை யவர்.",
        "Working farmers never beg from others, and give generously to anyone who asks.",
        "The same farmer who needs nothing from anyone happily shares a bunch with an empty-handed friend."
      ),
      k(
        1036,
        "உழவினார் கைம்மடங்கின் இல்லை விழைவதூஉம்",
        "விட்டேம்என் பார்க்கும் நிலை.",
        "If farmers' hands grow idle, even those who gave up every desire have nowhere left to stand.",
        "Even a monk who owns nothing needs morning rice - and that rice comes from busy ploughing hands."
      ),
      k(
        1037,
        "தொடிப்புழுதி கஃசா உணக்கின் பிடித்தெருவும்",
        "வேண்டாது சாலப் படும்.",
        "When the ploughed soil is dried till clods turn to fine dust, crops flourish even without extra manure.",
        "Tilling again and again until the earth is soft and airy makes strong plants grow all by themselves."
      ),
      k(
        1038,
        "ஏரினும் நன்றால் எருவிடுதல் கட்டபின்",
        "நீரினும் நன்றதன் காப்பு.",
        "Manuring is better than ploughing, and after weeding, guarding the crop beats watering it.",
        "Ask any farmer: feed the soil well, pull the weeds, then watch over the crop like a small guard."
      ),
      k(
        1039,
        "செல்லான் கிழவன் இருப்பின் நிலம்புலந்து",
        "இல்லாளின் ஊடி விடும்.",
        "A land-owner who sits idly at home finds his field sulk at him like an angry wife who is ignored.",
        "Skip your garden for a whole week and it turns grumpy - weeds creep in wherever you don't look."
      ),
      k(
        1040,
        "இலமென்று அசைஇ இருப்பாரைக் காணின்",
        "நிலமென்னும் நல்லாள் நகும்.",
        "The good lady Earth quietly laughs at people who sit idle and cry 'we have nothing'.",
        "The field whispers to the idle: 'you say you are poor? Take up a plough and try!'"
      ),
    ],
  },
];

async function seedAdhikarams() {
  const count = await Adhikaram.countDocuments();
  if (count > 0) return { skipped: Adhikaram.modelName, count };
  const inserted = await Adhikaram.insertMany(SEED);
  return { seeded: Adhikaram.modelName, count: inserted.length };
}

module.exports = { seedAdhikarams, SEED };