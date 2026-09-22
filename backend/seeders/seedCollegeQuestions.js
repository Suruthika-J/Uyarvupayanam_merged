const mongoose = require("mongoose");
const CollegeOnboardingQuestion = require("../models/CollegeOnboardingQuestion");

const collegeQuestions = [
  // ══════════════════════════════════════════════════════════════════════════
  // COMPUTER SCIENCE & ENGINEERING
  // ══════════════════════════════════════════════════════════════════════════
  // VERY EASY
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Computer Science",
    domain: "Computer Science & Engineering",
    topic: "Data Structures",
    questionText: "Which fundamental data structure operates on a First-In, First-Out (FIFO) access order?",
    options: ["Stack", "Queue", "Binary Search Tree", "Max Heap"],
    correctAnswer: "Queue",
    explanation: "A Queue processes elements in the order they arrive (FIFO), whereas a Stack uses Last-In, First-Out (LIFO).",
    difficulty: "VERY_EASY"
  },
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Computer Science",
    domain: "Computer Science & Engineering",
    topic: "Programming Fundamentals",
    questionText: "What is the primary purpose of a variable in computer programming?",
    options: [
      "To store data values in memory for later retrieval and manipulation",
      "To directly communicate with hardware peripherals without OS intervention",
      "To compile high-level source code into binary executable files",
      "To establish physical network connections between server nodes"
    ],
    correctAnswer: "To store data values in memory for later retrieval and manipulation",
    explanation: "A variable acts as a named memory location that holds data values during program execution.",
    difficulty: "VERY_EASY"
  },
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Computer Science",
    domain: "Computer Science & Engineering",
    topic: "Operating Systems",
    questionText: "What is the primary core purpose of an Operating System?",
    options: [
      "To manage system hardware resources and provide an interface for user applications",
      "To design graphic user interface mockups and web layouts",
      "To automatically write database query scripts for user applications",
      "To directly increase the physical clock speed of the Central Processing Unit"
    ],
    correctAnswer: "To manage system hardware resources and provide an interface for user applications",
    explanation: "The OS abstracts hardware complexities and coordinates CPU, memory, and I/O resource management.",
    difficulty: "VERY_EASY"
  },
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Computer Science",
    domain: "Computer Science & Engineering",
    topic: "Database Management",
    questionText: "What does the SQL command 'SELECT' primarily perform in a relational database?",
    options: [
      "Retrieves specific data records from database tables",
      "Deletes permanent database storage schemas",
      "Modifies structural constraints of existing tables",
      "Encrypts network communication packets between client and server"
    ],
    correctAnswer: "Retrieves specific data records from database tables",
    explanation: "SELECT is the fundamental SQL data retrieval command used to query databases.",
    difficulty: "VERY_EASY"
  },

  // EASY
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Computer Science",
    domain: "Computer Science & Engineering",
    topic: "Data Structures",
    questionText: "If elements need to be processed in the exact sequence they arrive, which data structure is most appropriate and why?",
    options: [
      "Queue, because it enforces First-In, First-Out (FIFO) ordering",
      "Stack, because it permits rapid Last-In, First-Out (LIFO) access",
      "Hash Map, because key search runs in logarithmic time",
      "Array, because elements are stored at non-contiguous memory addresses"
    ],
    correctAnswer: "Queue, because it enforces First-In, First-Out (FIFO) ordering",
    explanation: "Queues preserve order of arrival, making them ideal for task scheduling, print queues, and buffering.",
    difficulty: "EASY"
  },
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Computer Science",
    domain: "Computer Science & Engineering",
    topic: "Algorithms",
    questionText: "Which Big-O notation represents constant time execution complexity regardless of input size?",
    options: ["O(1)", "O(n)", "O(n²)", "O(log n)"],
    correctAnswer: "O(1)",
    explanation: "O(1) means execution time remains constant regardless of the input data volume.",
    difficulty: "EASY"
  },
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Computer Science",
    domain: "Computer Science & Engineering",
    topic: "Object-Oriented Programming",
    questionText: "Which OOP principle hides internal object state and restricts direct external access to object internals?",
    options: ["Encapsulation", "Inheritance", "Polymorphism", "Recursion"],
    correctAnswer: "Encapsulation",
    explanation: "Encapsulation keeps fields private and provides getter/setter methods to protect data integrity.",
    difficulty: "EASY"
  },

  // MODERATE
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Computer Science",
    domain: "Computer Science & Engineering",
    topic: "Algorithms & Problem Solving",
    questionText: "When searching an ordered list of 1,024 elements, what is the maximum number of comparisons required using Binary Search?",
    options: ["10 comparisons", "512 comparisons", "1,024 comparisons", "32 comparisons"],
    correctAnswer: "10 comparisons",
    explanation: "Binary search has O(log₂ n) complexity. log₂(1024) = 10 maximum steps.",
    difficulty: "MODERATE"
  },
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Computer Science",
    domain: "Computer Science & Engineering",
    topic: "System Architecture",
    questionText: "In a multi-threaded web application experiencing concurrency race conditions, which synchronization mechanism best prevents simultaneous memory access by multiple threads?",
    options: [
      "Mutex (Mutual Exclusion Lock)",
      "Asynchronous Callbacks",
      "Garbage Collection Cycle",
      "DNS Resolver Cache"
    ],
    correctAnswer: "Mutex (Mutual Exclusion Lock)",
    explanation: "A Mutex grants exclusive access to a shared resource, preventing race conditions in multi-threaded environments.",
    difficulty: "MODERATE"
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ARTIFICIAL INTELLIGENCE & DATA SCIENCE
  // ══════════════════════════════════════════════════════════════════════════
  // VERY EASY
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Computer Science",
    domain: "Artificial Intelligence & Data Science",
    specialization: "Artificial Intelligence & Data Science",
    topic: "Data Science Fundamentals",
    questionText: "What is the primary purpose of a dataset in Data Science and Machine Learning?",
    options: [
      "To provide structured or unstructured sample data used to analyze trends and train predictive models",
      "To style the front-end user interface components of web pages",
      "To physical format local hard disk partition drive sectors",
      "To convert source code from C++ into assembly language instructions"
    ],
    correctAnswer: "To provide structured or unstructured sample data used to analyze trends and train predictive models",
    explanation: "Datasets form the foundation of statistics, analytics, and machine learning model training.",
    difficulty: "VERY_EASY"
  },
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Computer Science",
    domain: "Artificial Intelligence & Data Science",
    specialization: "Artificial Intelligence & Data Science",
    topic: "Statistics",
    questionText: "What does the arithmetic mean represent in a numerical dataset?",
    options: [
      "The average value obtained by dividing the sum of all observations by total count",
      "The exact middle value when observations are sorted in ascending order",
      "The most frequently occurring data point in the distribution",
      "The difference between the maximum and minimum values"
    ],
    correctAnswer: "The average value obtained by dividing the sum of all observations by total count",
    explanation: "Mean = (sum of all data points) / (total number of data points).",
    difficulty: "VERY_EASY"
  },
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Computer Science",
    domain: "Artificial Intelligence & Data Science",
    specialization: "Artificial Intelligence & Data Science",
    topic: "Data Preprocessing",
    questionText: "Why is data preprocessing performed before building Machine Learning models?",
    options: [
      "To clean noise, handle missing values, and scale data into a format suitable for algorithmic training",
      "To compress data files into password-protected ZIP archives",
      "To host the database on public cloud servers automatically",
      "To render 3D graphical user interface animations"
    ],
    correctAnswer: "To clean noise, handle missing values, and scale data into a format suitable for algorithmic training",
    explanation: "Real-world data is dirty; preprocessing improves data quality and model reliability.",
    difficulty: "VERY_EASY"
  },

  // EASY
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Computer Science",
    domain: "Artificial Intelligence & Data Science",
    specialization: "Artificial Intelligence & Data Science",
    topic: "Data Preprocessing",
    questionText: "A tabular dataset contains missing values across several numerical columns. What is a standard initial preprocessing technique before training a model?",
    options: [
      "Impute missing values using mean/median or drop incomplete rows depending on data loss impact",
      "Replace all missing values with arbitrary large positive numbers",
      "Ignore missing values because models handle corrupt inputs automatically",
      "Convert numerical columns directly into unparsed text strings"
    ],
    correctAnswer: "Impute missing values using mean/median or drop incomplete rows depending on data loss impact",
    explanation: "Imputation or structured row deletion prevents model training failures while preserving sample distribution.",
    difficulty: "EASY"
  },
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Computer Science",
    domain: "Artificial Intelligence & Data Science",
    specialization: "Artificial Intelligence & Data Science",
    topic: "Machine Learning Basics",
    questionText: "Which learning paradigm uses labeled target data (inputs paired with known ground-truth outputs) for model training?",
    options: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Self-Organizing Clustering"],
    correctAnswer: "Supervised Learning",
    explanation: "Supervised learning learns from paired input-label training examples.",
    difficulty: "EASY"
  },

  // MODERATE
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Computer Science",
    domain: "Artificial Intelligence & Data Science",
    specialization: "Artificial Intelligence & Data Science",
    topic: "Model Evaluation",
    questionText: "A Machine Learning classification model achieves 99% accuracy on training data but performs poorly (52% accuracy) on new unseen test data. What issue is occurring?",
    options: [
      "Overfitting — the model memorized training noise instead of generalizing real patterns",
      "Underfitting — the model lacks sufficient capacity to capture linear trends",
      "Data Imbalance — target class distribution was strictly equalized",
      "Hyperparameter Optimization — training learning rate was set too low"
    ],
    correctAnswer: "Overfitting — the model memorized training noise instead of generalizing real patterns",
    explanation: "High training performance coupled with poor generalization to test data is the classic signature of overfitting.",
    difficulty: "MODERATE"
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MECHANICAL ENGINEERING
  // ══════════════════════════════════════════════════════════════════════════
  // VERY EASY
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Mechanical Engineering",
    domain: "Mechanical Engineering",
    topic: "Machine Elements",
    questionText: "What is the primary function of a bearing in mechanical machinery?",
    options: [
      "To support rotating shafts and reduce friction between moving parts",
      "To generate thermal electrical energy directly from mechanical pressure",
      "To measure fluid viscosity in high-pressure hydraulic pumps",
      "To weld structural steel beams permanently at right angles"
    ],
    correctAnswer: "To support rotating shafts and reduce friction between moving parts",
    explanation: "Bearings constrain relative motion and minimize friction between moving and stationary parts.",
    difficulty: "VERY_EASY"
  },
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Mechanical Engineering",
    domain: "Mechanical Engineering",
    topic: "Mechanics of Materials",
    questionText: "Which physical quantity represents internal resisting force per unit cross-sectional area?",
    options: ["Stress", "Strain", "Torque", "Kinetic Energy"],
    correctAnswer: "Stress",
    explanation: "Stress = Force / Area (N/m² or Pa). Strain is the resulting relative deformation.",
    difficulty: "VERY_EASY"
  },
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Mechanical Engineering",
    domain: "Mechanical Engineering",
    topic: "Power Transmission",
    questionText: "What is the primary mechanical purpose of a gearbox?",
    options: [
      "To alter speed, torque, and direction of rotation between a power source and driven load",
      "To store fuel for internal combustion engine ignition",
      "To filter air impurities before intake manifold entry",
      "To convert alternating electrical current into direct current"
    ],
    correctAnswer: "To alter speed, torque, and direction of rotation between a power source and driven load",
    explanation: "Gearboxes trade speed for torque or vice-versa through gear ratios.",
    difficulty: "VERY_EASY"
  },

  // EASY
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Mechanical Engineering",
    domain: "Mechanical Engineering",
    topic: "Machine Elements",
    questionText: "A high-speed rotating shaft experiences continuous radial loads and needs smooth continuous rotation with minimal friction against its stationary housing. Which component is most appropriate?",
    options: [
      "Ball or Roller Bearing",
      "Rigid Flange Coupling",
      "Threaded Locknut",
      "Helical Extension Spring"
    ],
    correctAnswer: "Ball or Roller Bearing",
    explanation: "Rolling element bearings provide low rotational friction under radial and axial load combinations.",
    difficulty: "EASY"
  },
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Mechanical Engineering",
    domain: "Mechanical Engineering",
    topic: "Thermodynamics",
    questionText: "Which law of thermodynamics establishes the law of conservation of energy in thermal systems?",
    options: [
      "First Law of Thermodynamics",
      "Second Law of Thermodynamics",
      "Zeroth Law of Thermodynamics",
      "Third Law of Thermodynamics"
    ],
    correctAnswer: "First Law of Thermodynamics",
    explanation: "The First Law states that energy cannot be created or destroyed, only transformed (ΔU = Q - W).",
    difficulty: "EASY"
  },

  // MODERATE
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Mechanical Engineering",
    domain: "Mechanical Engineering",
    topic: "Fluid Mechanics",
    questionText: "When fluid flows smoothly in parallel layers without macroscopic cross-mixing, how is the flow regime classified and governed?",
    options: [
      "Laminar flow, typically occurring at low Reynolds numbers (Re < 2000)",
      "Turbulent flow, characterized by chaotic eddies at high Reynolds numbers",
      "Supersonic flow, exceeding local speed of sound",
      "Cavitation flow, caused by rapid vapor bubble collapse"
    ],
    correctAnswer: "Laminar flow, typically occurring at low Reynolds numbers (Re < 2000)",
    explanation: "Laminar flow occurs at low Reynolds numbers where viscous forces dominate inertial forces.",
    difficulty: "MODERATE"
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ELECTRICAL & ELECTRONICS ENGINEERING
  // ══════════════════════════════════════════════════════════════════════════
  // VERY EASY
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Electrical Engineering",
    domain: "Electrical & Electronics Engineering",
    topic: "Circuit Theory",
    questionText: "What does electrical resistance represent in a conducting circuit?",
    options: [
      "The opposition to the flow of electric current through a material",
      "The speed at which magnetic fields propagate in vacuum",
      "The total electrostatic storage capacity of a battery terminal",
      "The frequency of sinusoidal alternating voltage waveforms"
    ],
    correctAnswer: "The opposition to the flow of electric current through a material",
    explanation: "Resistance (R, measured in Ohms) quantifies how strongly a material opposes charge flow.",
    difficulty: "VERY_EASY"
  },
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Electrical Engineering",
    domain: "Electrical & Electronics Engineering",
    topic: "Electrical Machines",
    questionText: "What is the primary function of a transformer in power distribution?",
    options: [
      "To step up or step down AC voltage levels via electromagnetic induction",
      "To convert mechanical rotation into direct current electricity",
      "To store electrical energy electrochemically for backup power",
      "To convert electrical current into optical light signals"
    ],
    correctAnswer: "To step up or step down AC voltage levels via electromagnetic induction",
    explanation: "Transformers change AC voltage levels efficiently while preserving frequency.",
    difficulty: "VERY_EASY"
  },
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Electrical Engineering",
    domain: "Electrical & Electronics Engineering",
    topic: "Ohm's Law",
    questionText: "Which fundamental equation correctly expresses Ohm's Law for electric circuits?",
    options: ["V = I × R", "V = I / R", "V = I² × R", "V = R / I"],
    correctAnswer: "V = I × R",
    explanation: "Ohm's Law states Voltage (V) = Current (I) × Resistance (R).",
    difficulty: "VERY_EASY"
  },

  // EASY
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Electrical Engineering",
    domain: "Electrical & Electronics Engineering",
    topic: "Circuit Analysis",
    questionText: "If two identical 10-ohm resistors are connected in parallel across a circuit, what is the total equivalent resistance?",
    options: ["5 ohms", "20 ohms", "10 ohms", "2.5 ohms"],
    correctAnswer: "5 ohms",
    explanation: "For parallel resistors R_eq = (R1 × R2) / (R1 + R2) = (10 × 10) / (10 + 10) = 5 ohms.",
    difficulty: "EASY"
  },

  // MODERATE
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Electrical Engineering",
    domain: "Electrical & Electronics Engineering",
    topic: "Control Systems",
    questionText: "In feedback control systems, what is the primary advantage of adding a Derivative (D) component in a PID controller?",
    options: [
      "It anticipates future error trends, improving system transient response and stability damping",
      "It completely eliminates steady-state offsets without changing transient behavior",
      "It amplifies high-frequency sensor noise to increase system bandwidth",
      "It converts open-loop transfer functions into non-linear state space representations"
    ],
    correctAnswer: "It anticipates future error trends, improving system transient response and stability damping",
    explanation: "Derivative control reacts to rate of error change, counteracting overshoots and improving stability.",
    difficulty: "MODERATE"
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CIVIL ENGINEERING
  // ══════════════════════════════════════════════════════════════════════════
  // VERY EASY
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Civil Engineering",
    domain: "Civil Engineering",
    topic: "Structural Engineering",
    questionText: "What is the primary purpose of steel reinforcement in Reinforced Cement Concrete (RCC)?",
    options: [
      "To supply high tensile strength since concrete is strong in compression but weak in tension",
      "To prevent moisture evaporation during curing cycles",
      "To lighten structural dead weight of columns and beams",
      "To lower thermal conductivity of exterior building walls"
    ],
    correctAnswer: "To supply high tensile strength since concrete is strong in compression but weak in tension",
    explanation: "Concrete excels under compressive force but fails under tension; steel rebar provides tensile resistance.",
    difficulty: "VERY_EASY"
  },
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Civil Engineering",
    domain: "Civil Engineering",
    topic: "Geotechnical Engineering",
    questionText: "What does a building foundation primarily do?",
    options: [
      "Distributes structural loads safely from the superstructure to the underlying soil or rock",
      "Provides aesthetic architectural elevations for ground floor entryways",
      "Filters rainwater runoff before groundwater recharge",
      "Insulates upper story floors against acoustic vibrations"
    ],
    correctAnswer: "Distributes structural loads safely from the superstructure to the underlying soil or rock",
    explanation: "Foundations transfer superstructure dead and live loads safely to soil without exceeding bearing capacity.",
    difficulty: "VERY_EASY"
  },

  // EASY
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Civil Engineering",
    domain: "Civil Engineering",
    topic: "Concrete Technology",
    questionText: "What is meant by the characteristic compressive strength of concrete (e.g. M20 grade)?",
    options: [
      "The compressive strength in N/mm² of 150mm cubes tested after 28 days of curing, below which not more than 5% test results are expected to fall",
      "The maximum tensile force concrete can withstand after 7 days of sun drying",
      "The density of concrete per cubic meter of foundation space",
      "The ratio of water to cement used during initial batch mixing"
    ],
    correctAnswer: "The compressive strength in N/mm² of 150mm cubes tested after 28 days of curing, below which not more than 5% test results are expected to fall",
    explanation: "Standard concrete characteristic compressive strength is evaluated on 150mm test cubes cured for 28 days.",
    difficulty: "EASY"
  },

  // MODERATE
  {
    field: "Engineering & Technology",
    degree: "B.E. / B.Tech Civil Engineering",
    domain: "Civil Engineering",
    topic: "Structural Analysis",
    questionText: "A simply supported beam carries a uniform distributed load (w) over span length (L). What is the maximum bending moment and where does it occur?",
    options: [
      "wL² / 8 at the mid-span of the beam",
      "wL² / 2 at the support ends",
      "wL / 4 at the mid-span",
      "wL² / 12 at quarter-span points"
    ],
    correctAnswer: "wL² / 8 at the mid-span of the beam",
    explanation: "For a simply supported beam with UDL w, maximum bending moment M_max = wL²/8 at mid-span x = L/2.",
    difficulty: "MODERATE"
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MEDICAL & HEALTH SCIENCES
  // ══════════════════════════════════════════════════════════════════════════
  // VERY EASY
  {
    field: "Medical & Health Sciences",
    degree: "MBBS / BDS / B.Pharm",
    domain: "Medicine",
    topic: "Physiology",
    questionText: "What is the primary function of Red Blood Cells (Erythrocytes) in human circulation?",
    options: [
      "To transport oxygen from the lungs to body tissues via hemoglobin",
      "To synthesize digestive enzymes in the small intestine",
      "To produce specific antibody proteins against bacterial infections",
      "To transmit electrochemical nerve impulses along peripheral axons"
    ],
    correctAnswer: "To transport oxygen from the lungs to body tissues via hemoglobin",
    explanation: "Erythrocytes contain hemoglobin, binding oxygen for delivery to systemic tissues.",
    difficulty: "VERY_EASY"
  },
  {
    field: "Medical & Health Sciences",
    degree: "MBBS / BDS / B.Pharm",
    domain: "Medicine",
    topic: "Cardiovascular System",
    questionText: "What is the primary biological role of the heart in the cardiovascular system?",
    options: [
      "To act as a muscular pump circulating oxygenated and deoxygenated blood through systemic and pulmonary loops",
      "To filter nitrogenous metabolic waste products from blood plasma",
      "To store glycogen for emergency physical exercise",
      "To secrete insulin into the hepatic portal vein"
    ],
    correctAnswer: "To act as a muscular pump circulating oxygenated and deoxygenated blood through systemic and pulmonary loops",
    explanation: "The heart pumps blood to supply tissues with oxygen/nutrients and remove metabolic wastes.",
    difficulty: "VERY_EASY"
  },

  // EASY
  {
    field: "Medical & Health Sciences",
    degree: "MBBS / BDS / B.Pharm",
    domain: "Medicine",
    topic: "Clinical Practice",
    questionText: "Which clinical measurements constitute standard baseline vital signs during patient evaluation?",
    options: [
      "Body Temperature, Pulse/Heart Rate, Respiratory Rate, and Blood Pressure",
      "Body Mass Index, Bone Density, and Hair Thickness",
      "Blood Glucose level, Serum Cholesterol, and Liver Enzyme counts",
      "Reflex arc speed, Visual acuity, and Hearing threshold"
    ],
    correctAnswer: "Body Temperature, Pulse/Heart Rate, Respiratory Rate, and Blood Pressure",
    explanation: "The four primary vital signs evaluate essential physiological body functions.",
    difficulty: "EASY"
  },

  // MODERATE
  {
    field: "Medical & Health Sciences",
    degree: "MBBS / BDS / B.Pharm",
    domain: "Medicine",
    topic: "Pathophysiology",
    questionText: "A patient presents with acute shortness of breath, bilateral pulmonary crackles, and elevated jugular venous pressure following a myocardial infarction. Which pathophysiological condition is most likely indicated?",
    options: [
      "Left-sided Heart Failure leading to pulmonary edema",
      "Acute Renal Failure with hyperkalemia",
      "Primary Pneumothorax from alveolar rupture",
      "Systemic Anaphylactic Shock"
    ],
    correctAnswer: "Left-sided Heart Failure leading to pulmonary edema",
    explanation: "Left ventricular dysfunction leads to fluid backing up into pulmonary circulation, causing pulmonary crackles and dyspnea.",
    difficulty: "MODERATE"
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MANAGEMENT & COMMERCE
  // ══════════════════════════════════════════════════════════════════════════
  // VERY EASY
  {
    field: "Management & Commerce",
    degree: "BBA / B.Com / MBA",
    domain: "Finance & Accounting",
    topic: "Accounting Principles",
    questionText: "According to the double-entry bookkeeping system, what is the fundamental accounting equation?",
    options: [
      "Assets = Liabilities + Equity",
      "Assets = Revenue - Expenses",
      "Assets = Gross Profit / Net Sales",
      "Assets = Cash Flow + Working Capital"
    ],
    correctAnswer: "Assets = Liabilities + Equity",
    explanation: "The fundamental accounting equation dictates that a company's total assets equal liabilities plus shareholder equity.",
    difficulty: "VERY_EASY"
  },

  // EASY
  {
    field: "Management & Commerce",
    degree: "BBA / B.Com / MBA",
    domain: "Finance & Accounting",
    topic: "Financial Analysis",
    questionText: "A company wishes to measure its short-term liquidity position using assets that can be converted to cash within 90 days. Which financial ratio is most strict and relevant?",
    options: [
      "Quick Ratio (Acid-Test Ratio)",
      "Debt-to-Equity Ratio",
      "Return on Investment (ROI)",
      "Inventory Turnover Ratio"
    ],
    correctAnswer: "Quick Ratio (Acid-Test Ratio)",
    explanation: "The Quick Ratio measures near-instant liquidity by excluding inventory from current assets.",
    difficulty: "EASY"
  },

  // MODERATE
  {
    field: "Management & Commerce",
    degree: "BBA / B.Com / MBA",
    domain: "Finance & Accounting",
    topic: "Corporate Finance",
    questionText: "When evaluating two mutually exclusive capital investment projects with identical risk profiles, which capital budgeting metric should be prioritized if there is a conflict between NPV and IRR?",
    options: [
      "Net Present Value (NPV), because it directly measures absolute shareholder wealth addition",
      "Internal Rate of Return (IRR), because percentage returns are easier to communicate",
      "Payback Period, because early capital recovery minimizes operational exposure",
      "Accounting Rate of Return (ARR), because it relies on unadjusted financial statement net income"
    ],
    correctAnswer: "Net Present Value (NPV), because it directly measures absolute shareholder wealth addition",
    explanation: "NPV provides direct absolute monetary value added to firm wealth, overriding IRR ranking conflicts.",
    difficulty: "MODERATE"
  }
];

const seedCollegeQuestions = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/uyarvu_payanam";
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
      console.log("Connected to MongoDB for College Questions Seeding...");
    }

    // Upsert questions based on questionText
    let insertedCount = 0;
    for (const q of collegeQuestions) {
      await CollegeOnboardingQuestion.findOneAndUpdate(
        { questionText: q.questionText },
        q,
        { upsert: true, new: true }
      );
      insertedCount++;
    }

    console.log(`Successfully seeded ${insertedCount} domain-specific college onboarding questions!`);
  } catch (err) {
    console.error("College questions seeding error:", err);
  }
};

// Execute if run directly
if (require.main === module) {
  seedCollegeQuestions().then(() => mongoose.disconnect());
}

module.exports = { seedCollegeQuestions, collegeQuestions };
