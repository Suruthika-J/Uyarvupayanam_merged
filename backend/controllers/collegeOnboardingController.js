const CollegeStudentProfile = require("../models/CollegeStudentProfile");
const CollegeOnboardingQuestion = require("../models/CollegeOnboardingQuestion");
const CollegeOnboardingResponse = require("../models/CollegeOnboardingResponse");
const Recommendation = require("../models/Recommendation");
const axios = require("axios");

const GROK_API_KEY = process.env.GROK_API_KEY || "xai-JPHZZdSGepdkppoqz9vWnMBzmKwKdenngyfYaO08Wf3Mp0W0ddsapnTkQWD2hhdyTc28IrxnEMkUpbO0";

// ── Server-Side AI Question Validation Helper ──────────────────────────────────
const validateQuestion = (q, expectedDomain, expectedDifficulty) => {
  if (!q || typeof q !== "object") return false;
  if (!q.question || typeof q.question !== "string" || q.question.trim().length < 10) return false;
  if (!Array.isArray(q.options) || q.options.length !== 4) return false;
  
  // Check for duplicate options
  const uniqueOptions = new Set(q.options.map(o => String(o).trim().toLowerCase()));
  if (uniqueOptions.size !== 4) return false;

  // Correct answer index or text check
  let correctText = "";
  if (typeof q.correctIndex === "number" && q.correctIndex >= 0 && q.correctIndex < 4) {
    correctText = q.options[q.correctIndex];
  } else if (typeof q.correctAnswer === "string" && q.options.includes(q.correctAnswer)) {
    correctText = q.correctAnswer;
  } else {
    return false;
  }

  // Reject childish/trivial wording or obvious meta hints
  const lowerQ = q.question.toLowerCase();
  const trivialPhrases = ["what is your favorite", "do you like", "why did you choose", "are you good at", "easy question"];
  if (trivialPhrases.some(p => lowerQ.includes(p))) return false;

  return {
    questionText: q.question.trim(),
    options: q.options.map(o => String(o).trim()),
    correctAnswer: correctText,
    topic: q.topic || "Core Domain Concepts",
    explanation: q.explanation || `Correct answer is ${correctText}`,
    difficulty: expectedDifficulty,
    source: "AI_GENERATED"
  };
};

// ── Generate AI Questions via Grok ─────────────────────────────────────────────
const generateAIQuestionsForLevel = async (field, degree, domain, specialization, academicYear, difficulty, selectedSkills = [], count = 3) => {
  const specText = specialization ? `Specialization: "${specialization}"` : "";
  const skillsText = selectedSkills.length > 0 ? `Selected Step 6 Skills to Validate: [${selectedSkills.join(", ")}]` : "";
  const diffDesc = {
    VERY_EASY: "Basic college-level foundation question checking fundamental domain concepts. MUST be respectable for a college student, NEVER trivial or childish.",
    EASY: "Slightly more conceptual or simple application question requiring basic problem-solving and domain recall.",
    MODERATE: "Moderate conceptual understanding, situational reasoning, and application question."
  }[difficulty] || "College domain question";

  const prompt = `You are a university academic domain diagnostic test generator.
Generate exactly ${count} multiple-choice questions for a college student studying:
Field: "${field}"
Degree: "${degree}"
Domain / Branch: "${domain}"
${specText}
Academic Stage: "${academicYear || "Undergraduate"}"
${skillsText}
Requested Difficulty Level: "${difficulty}" (${diffDesc})

STRICT RULES:
1. Questions MUST cover a composition of Core Domain Knowledge, Specialization Concepts, and Selected Skills validation.
2. "VERY EASY" level must be a respectable basic college-level foundation question (e.g. FIFO queue principle for CS, bearing function for Mech, electrical resistance for EEE, RCC tensile reinforcement for Civil, clinical sign interpretation for Medicine, ledger debit/credit for Commerce). NEVER ask childish or trivial questions like "What is your favorite subject?".
3. Return ONLY a valid JSON array of objects with NO markdown codeblocks.
4. Each object MUST have:
   - "id": string (e.g. "ai_1")
   - "question": string
   - "options": array of 4 distinct string choices
   - "correctIndex": integer (0 to 3)
   - "topic": string (sub-topic or concept area matching domain/skill)
   - "explanation": string (1-sentence explanation)
`;

  try {
    const response = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      {
        model: "grok-2-latest",
        messages: [
          { role: "system", content: "You are a specialized academic question generator. Respond strictly in raw valid JSON arrays." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1200
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROK_API_KEY}`
        },
        timeout: 9000
      }
    );

    const rawText = response.data?.choices?.[0]?.message?.content || "";
    const cleanedJson = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
    const parsed = JSON.parse(cleanedJson);

    if (Array.isArray(parsed)) {
      const validated = [];
      for (const item of parsed) {
        const v = validateQuestion(item, domain, difficulty);
        if (v) validated.push(v);
      }
      return validated;
    }
  } catch (err) {
    console.warn(`xAI Grok generation failed for ${difficulty} (${domain}):`, err.message);
  }
  return [];
};

// ── Deterministic Domain Question Bank Fallback Engine ────────────────────────
const generateLocalFallbackQuestions = (field, degree, domain, specialization, difficulty, count = 3, selectedSkills = []) => {
  const normField = (field || "").toLowerCase();
  const normDegree = (degree || "").toLowerCase();
  const normDomain = (domain || "").toLowerCase();
  const normSpec = (specialization || "").toLowerCase();

  const domainBanks = {
    medicine: {
      VERY_EASY: [
        {
          questionText: `In clinical diagnostic practice for ${domain || "Medical Sciences"}, what is the fundamental initial step in patient evaluation?`,
          options: [
            "Comprehensive clinical history taking and systemic examination",
            "Immediate invasive intervention without recording history",
            "Ordering advanced MRI imaging prior to physical assessment",
            "Administering empirical broad-spectrum therapy without assessment"
          ],
          correctAnswer: "Comprehensive clinical history taking and systemic examination",
          topic: "Clinical Practice & Case Taking",
          explanation: "Accurate clinical history and physical examination form the baseline foundation for diagnostic reasoning."
        },
        {
          questionText: "In pharmacology, what defines the primary mechanism of action of receptor antagonist drugs?",
          options: [
            "Binding to target receptors to block endogenous ligand activation",
            "Directly stimulating target intracellular receptor cascades",
            "Permanently degrading cell membrane receptor proteins",
            "Increasing mitochondrial ATP synthesis directly"
          ],
          correctAnswer: "Binding to target receptors to block endogenous ligand activation",
          topic: "Pharmacology & Therapeutics",
          explanation: "Antagonists bind to receptors without activating them, effectively blocking agonist binding."
        },
        {
          questionText: "In clinical pathology, what is the primary diagnostic purpose of histopathological tissue biopsy?",
          options: [
            "Definitive cellular diagnosis, grading, and disease classification",
            "Measuring peripheral blood pressure dynamics",
            "Evaluating bone mineral density",
            "Assessing daily metabolic caloric expenditure"
          ],
          correctAnswer: "Definitive cellular diagnosis, grading, and disease classification",
          topic: "Pathology & Diagnostics",
          explanation: "Histopathology provides definitive microscopic evaluation of tissue architecture and cellular changes."
        },
        {
          questionText: "Which physiological parameter serves as the primary immediate indicator of systemic tissue oxygenation?",
          options: [
            "Arterial Blood Gas (PaO2) & Pulse Oximetry (SpO2)",
            "Serum Creatinine Concentration",
            "Erythrocyte Sedimentation Rate (ESR)",
            "Serum Alkaline Phosphatase"
          ],
          correctAnswer: "Arterial Blood Gas (PaO2) & Pulse Oximetry (SpO2)",
          topic: "Human Physiology & Critical Care",
          explanation: "Arterial oxygen partial pressure and SpO2 directly measure arterial blood oxygenation status."
        }
      ],
      EASY: [
        {
          questionText: "When evaluating acute chest discomfort in an emergency setting, which cardiac biomarker is most specific for myocardial injury?",
          options: [
            "Cardiac Troponin I / Troponin T",
            "Alanine Aminotransferase (ALT)",
            "Serum Amylase",
            "Blood Urea Nitrogen (BUN)"
          ],
          correctAnswer: "Cardiac Troponin I / Troponin T",
          topic: "Clinical Biochemistry & Cardiology",
          explanation: "Cardiac troponins are highly sensitive and specific markers for myocardial cell damage."
        },
        {
          questionText: "In surgical aseptic technique, what is the mandatory sequence prior to entering an active operating theater?",
          options: [
            "Surgical hand scrub, donning sterile gown, and applying sterile gloves",
            "Washing hands with plain water and wearing unsterile gloves",
            "Spraying clothing with disinfectant spray",
            "Donning sterile gloves over unwashed hands"
          ],
          correctAnswer: "Surgical hand scrub, donning sterile gown, and applying sterile gloves",
          topic: "Surgical Procedures & Asepsis",
          explanation: "Proper surgical scrubbing followed by sterile gowning and gloving prevents surgical site contamination."
        },
        {
          questionText: `In homoeopathic / clinical research in ${specialization || domain || "Medicine"}, what process establishes drug pathogenesis on healthy human subjects?`,
          options: [
            "Homoeopathic Drug Proving (Pathogenetic Trial)",
            "Acute animal toxicity LD50 testing",
            "In-vitro cell culture assay",
            "Post-marketing surveillance"
          ],
          correctAnswer: "Homoeopathic Drug Proving (Pathogenetic Trial)",
          topic: "Homoeopathic Therapeutics & Pharmacodynamics",
          explanation: "Drug proving systematically records symptoms produced by substances in healthy individuals."
        },
        {
          questionText: "In acute hypovolemic resuscitation, what primary fluid compartment is initially expanded by IV isotonic crystalloids?",
          options: [
            "Intravascular Compartment",
            "Intracellular Fluid Space",
            "Cerebrospinal Fluid Space",
            "Lymphatic Drainage System"
          ],
          correctAnswer: "Intravascular Compartment",
          topic: "General Medicine & Fluid Therapy",
          explanation: "Isotonic crystalloids expand circulating intravascular volume to maintain organ perfusion."
        }
      ],
      MODERATE: [
        {
          questionText: "A patient presents with dyspnea, elevated jugular venous pressure, and muffled heart sounds (Beck's Triad). What acute clinical emergency should be suspected?",
          options: [
            "Cardiac Tamponade",
            "Acute Bronchial Asthma",
            "Lobar Pneumonia",
            "Primary Pulmonary Hypertension"
          ],
          correctAnswer: "Cardiac Tamponade",
          topic: "Clinical Diagnosis & Emergency Medicine",
          explanation: "Beck's triad (hypotension, JVD, muffled heart sounds) indicates fluid accumulation in the pericardial sac."
        },
        {
          questionText: "How does Evidence-Based Medicine (EBM) integrate clinical decision-making?",
          options: [
            "Combining best research evidence with clinical expertise and patient values",
            "Relying strictly on historical textbook anecdotes without trial data",
            "Following institutional habits regardless of published evidence",
            "Using isolated individual case reports as sole diagnostic criteria"
          ],
          correctAnswer: "Combining best research evidence with clinical expertise and patient values",
          topic: "Evidence-Based Clinical Practice",
          explanation: "EBM triangulates scientific trial evidence, physician expertise, and individual patient context."
        }
      ]
    },
    computer: {
      VERY_EASY: [
        {
          questionText: "In computer science data structures, which data structure operates strictly on a Last-In, First-Out (LIFO) protocol?",
          options: ["Stack", "Queue", "Binary Search Tree", "Array List"],
          correctAnswer: "Stack",
          topic: "Data Structures & Algorithmic Logic",
          explanation: "A stack pushes and pops elements from the top, adhering to the LIFO principle."
        },
        {
          questionText: "What is the worst-case time complexity of searching an un-ordered list of N elements linearly?",
          options: ["O(N)", "O(1)", "O(log N)", "O(N log N)"],
          correctAnswer: "O(N)",
          topic: "Algorithm Analysis & Complexity",
          explanation: "Linear search checks each element up to N times in the worst-case scenario."
        },
        {
          questionText: "In object-oriented programming, which concept permits a class to reuse attributes and methods of another class?",
          options: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"],
          correctAnswer: "Inheritance",
          topic: "Object-Oriented Programming",
          explanation: "Inheritance enables derived classes to acquire properties of base classes."
        },
        {
          questionText: "Which SQL clause is used to extract records matching specific criteria from a relational database table?",
          options: ["WHERE", "GROUP BY", "ORDER BY", "HAVING"],
          correctAnswer: "WHERE",
          topic: "Database Systems & SQL",
          explanation: "The WHERE clause filters database query results based on specified Boolean conditions."
        }
      ],
      EASY: [
        {
          questionText: "Which sorting algorithm guarantees a worst-case time complexity of O(N log N)?",
          options: ["Merge Sort", "Bubble Sort", "Quick Sort", "Insertion Sort"],
          correctAnswer: "Merge Sort",
          topic: "Algorithms & Sorting Analysis",
          explanation: "Merge sort recursively divides and merges arrays in guaranteed O(N log N) time."
        },
        {
          questionText: "In relational database design, what is the primary goal of First Normal Form (1NF)?",
          options: [
            "Ensuring table columns contain atomic values with no repeating groups",
            "Eliminating transitive functional dependencies between non-key attributes",
            "Creating foreign key constraints between multiple tables",
            "Denormalizing tables for faster read performance"
          ],
          correctAnswer: "Ensuring table columns contain atomic values with no repeating groups",
          topic: "Database Management Systems",
          explanation: "1NF requires each column cell to store single atomic values without arrays or nested sets."
        },
        {
          questionText: "In modern software architecture, what is the primary function of RESTful Web APIs?",
          options: [
            "Providing stateless HTTP interfaces for data exchange between systems",
            "Compiling server side code into browser bytecode",
            "Rendering visual CSS animations directly on the client",
            "Managing operating system kernel CPU thread dispatching"
          ],
          correctAnswer: "Providing stateless HTTP interfaces for data exchange between systems",
          topic: "Web Engineering & Software Architecture",
          explanation: "REST APIs use standard HTTP verbs (GET, POST, PUT, DELETE) for stateless data operations."
        },
        {
          questionText: "In machine learning model training, what condition occurs when a model fits noise in training data and fails to generalize?",
          options: ["Overfitting", "Underfitting", "Optimal Generalization", "High Bias"],
          correctAnswer: "Overfitting",
          topic: "Machine Learning & AI Concepts",
          explanation: "Overfitting leads to high training accuracy but poor performance on unseen test datasets."
        }
      ],
      MODERATE: [
        {
          questionText: "In operating system process synchronization, which of the following is NOT one of Coffman's four necessary conditions for deadlock?",
          options: ["Preemption Allowed", "Mutual Exclusion", "Hold and Wait", "Circular Wait"],
          correctAnswer: "Preemption Allowed",
          topic: "Operating Systems & Concurrency",
          explanation: "Deadlock requires No Preemption. Allowing preemption breaks the deadlock condition."
        },
        {
          questionText: "According to the CAP Theorem for distributed storage, what two guarantees can a network partition tolerant system maintain simultaneously?",
          options: [
            "Consistency OR Availability (CAP tradeoff)",
            "100% Throughput and Zero Latency",
            "Linearizability and Instant Cold Storage",
            "Infinite Scaling and Zero Disk Writes"
          ],
          correctAnswer: "Consistency OR Availability (CAP tradeoff)",
          topic: "Distributed Systems & Cloud Architecture",
          explanation: "When a network partition occurs, a system must choose between consistency or availability."
        }
      ]
    },
    mechanical: {
      VERY_EASY: [
        {
          questionText: "Which fundamental law of thermodynamics defines the concept of temperature and thermal equilibrium?",
          options: ["Zeroth Law of Thermodynamics", "First Law of Thermodynamics", "Second Law of Thermodynamics", "Third Law of Thermodynamics"],
          correctAnswer: "Zeroth Law of Thermodynamics",
          topic: "Thermodynamics Fundamentals",
          explanation: "The Zeroth Law states that if body A and B are in equilibrium with C, they are in equilibrium with each other."
        },
        {
          questionText: "What fluid property measures resistance to gradual deformation by shear or tensile stress?",
          options: ["Dynamic Viscosity", "Surface Tension", "Specific Gravity", "Compressibility"],
          correctAnswer: "Dynamic Viscosity",
          topic: "Fluid Mechanics",
          explanation: "Viscosity quantifies internal fluid friction during flow."
        },
        {
          questionText: "In mechanics of materials, what is the ratio of stress to strain within the elastic limit called?",
          options: ["Young's Modulus of Elasticity", "Shear Modulus", "Poisson's Ratio", "Bulk Modulus"],
          correctAnswer: "Young's Modulus of Elasticity",
          topic: "Strength of Materials",
          explanation: "Hooke's law defines Young's Modulus (E = Stress / Strain) in elastic deformation."
        },
        {
          questionText: "Which mechanical component is primarily used to store kinetic energy during power strokes in engines?",
          options: ["Flywheel", "Governor", "Camshaft", "Connecting Rod"],
          correctAnswer: "Flywheel",
          topic: "Theory of Machines",
          explanation: "Flywheels equalize speed fluctuations by storing energy during power surges."
        }
      ],
      EASY: [
        {
          questionText: "Which ideal thermodynamic cycle serves as the theoretical benchmark for spark-ignition internal combustion engines?",
          options: ["Otto Cycle", "Diesel Cycle", "Dual Cycle", "Rankine Cycle"],
          correctAnswer: "Otto Cycle",
          topic: "Applied Thermodynamics & IC Engines",
          explanation: "The Otto cycle consists of two reversible isochoric and two reversible adiabatic processes."
        },
        {
          questionText: "In fluid dynamics, what dimensionless parameter represents the ratio of inertial forces to viscous forces?",
          options: ["Reynolds Number", "Mach Number", "Nusselt Number", "Prandtl Number"],
          correctAnswer: "Reynolds Number",
          topic: "Fluid Mechanics & Hydraulics",
          explanation: "Reynolds number (Re) determines whether fluid flow is laminar or turbulent."
        },
        {
          questionText: "What primary mechanical property improvement is achieved by heat treatment quenching of carbon steel?",
          options: ["Increased Hardness & Strength", "Increased Ductility", "Increased Electrical Conductivity", "Reduced Density"],
          correctAnswer: "Increased Hardness & Strength",
          topic: "Materials Engineering & Heat Treatment",
          explanation: "Quenching forms hard martensitic microstructures in carbon steel."
        },
        {
          questionText: "In machine design, what stress condition is induced in a rotating shaft transmitting torque?",
          options: ["Torsional Shear Stress", "Pure Compressive Stress", "Hydrostatic Pressure", "Axial Buckling"],
          correctAnswer: "Torsional Shear Stress",
          topic: "Machine Element Design",
          explanation: "Torque transmission creates torsional shear stress proportional to radial distance from the center axis."
        }
      ],
      MODERATE: [
        {
          questionText: "In mechanical fatigue analysis, what diagram plots cyclic stress amplitude against cycles to failure?",
          options: ["S-N Curve (Wöhler Curve)", "Stress-Strain Diagram", "Iron-Carbon Phase Diagram", "Psychrometric Chart"],
          correctAnswer: "S-N Curve (Wöhler Curve)",
          topic: "Design Against Fatigue Failure",
          explanation: "The S-N curve specifies fatigue endurance limits under cyclic loading."
        },
        {
          questionText: "Which governing law describes steady 1D conductive heat transfer through a solid medium?",
          options: ["Fourier's Law of Heat Conduction", "Newton's Law of Cooling", "Stefan-Boltzmann Law", "Wien's Displacement Law"],
          correctAnswer: "Fourier's Law of Heat Conduction",
          topic: "Heat and Mass Transfer",
          explanation: "Fourier's Law states heat transfer rate is proportional to temperature gradient and area."
        }
      ]
    },
    electrical: {
      VERY_EASY: [
        {
          questionText: "According to Ohm's Law, what is the mathematical relationship between Voltage (V), Current (I), and Resistance (R)?",
          options: ["V = I × R", "V = I / R", "V = I² × R", "V = R / I"],
          correctAnswer: "V = I × R",
          topic: "Electric Circuits Fundamentals",
          explanation: "Ohm's law states that current through a conductor is directly proportional to voltage across it."
        },
        {
          questionText: "Which semiconductor device allows current flow primarily in one direction?",
          options: ["PN Junction Diode", "Resistor", "Capacitor", "Air Core Inductor"],
          correctAnswer: "PN Junction Diode",
          topic: "Electronic Devices & Circuits",
          explanation: "Diodes conduct under forward bias and block current under reverse bias."
        },
        {
          questionText: "What passive circuit component stores energy in an electric field?",
          options: ["Capacitor", "Inductor", "Resistor", "Transformer"],
          correctAnswer: "Capacitor",
          topic: "Circuit Theory & Components",
          explanation: "Capacitors store electrical potential energy in the electric field between plates."
        },
        {
          questionText: "In digital logic design, which gate yields a HIGH (1) output only when all inputs are HIGH (1)?",
          options: ["AND Gate", "OR Gate", "XOR Gate", "NOR Gate"],
          correctAnswer: "AND Gate",
          topic: "Digital Electronics",
          explanation: "The AND operation requires all input bits to be true."
        }
      ],
      EASY: [
        {
          questionText: "What electrical parameter represents the total opposition to alternating current flow, incorporating both resistance and reactance?",
          options: ["Impedance (Z)", "Admittance (Y)", "Susceptance (B)", "Conductance (G)"],
          correctAnswer: "Impedance (Z)",
          topic: "AC Circuit Analysis",
          explanation: "Impedance Z = R + jX combines resistance and reactive component."
        },
        {
          questionText: "What working principle governs the stepping up or stepping down of AC voltages in electrical power transformers?",
          options: ["Faraday's Law of Mutual Electromagnetic Induction", "Ohm's Law", "Coulomb's Law", "Ampere's Circuital Law"],
          correctAnswer: "Faraday's Law of Mutual Electromagnetic Induction",
          topic: "Electrical Machines & Transformers",
          explanation: "Transformers transfer energy between circuits through magnetic induction."
        },
        {
          questionText: "In signal processing, what sampling rate criterion prevents signal aliasing?",
          options: ["Sampling frequency must be at least twice the maximum signal frequency", "Sampling frequency must equal signal frequency", "Sampling frequency must be less than half signal frequency", "Sampling rate is independent of signal frequency"],
          correctAnswer: "Sampling frequency must be at least twice the maximum signal frequency",
          topic: "Signals & Systems",
          explanation: "Nyquist criterion specifies Fs >= 2 * Fmax to avoid spectral overlapping."
        },
        {
          questionText: "What is the primary function of a Bipolar Junction Transistor (BJT) in electronic circuits?",
          options: ["Signal amplification and electronic switching", "Direct current to alternating current conversion", "High voltage surge absorption", "Constant temperature control"],
          correctAnswer: "Signal amplification and electronic switching",
          topic: "Analog Electronics",
          explanation: "BJTs operate as current-controlled current sources for amplification or switching."
        }
      ],
      MODERATE: [
        {
          questionText: "In automatic control systems, what condition guarantees Bounded-Input Bounded-Output (BIBO) stability?",
          options: ["All closed-loop system poles lie in the open left half of the s-plane", "Open-loop gain is infinite", "Zero crossings are strictly periodic", "Phase margin is negative"],
          correctAnswer: "All closed-loop system poles lie in the open left half of the s-plane",
          topic: "Control Engineering & Stability",
          explanation: "Poles in the left half s-plane ensure exponentially decaying impulse responses."
        },
        {
          questionText: "What is the primary function of an Analog-to-Digital Converter (ADC) in embedded systems?",
          options: ["Converting continuous physical analog signals into discrete digital binary data", "Generating high frequency PWM signals", "Regulating power supply voltage levels", "Filtering optical noise"],
          correctAnswer: "Converting continuous physical analog signals into discrete digital binary data",
          topic: "Embedded Systems & Microcontrollers",
          explanation: "ADCs sample and quantize real-world physical signals for digital processor consumption."
        }
      ]
    },
    commerce: {
      VERY_EASY: [
        {
          questionText: "In double-entry financial accounting, what is the fundamental accounting equation?",
          options: ["Assets = Liabilities + Equity", "Assets = Income - Expenses", "Net Profit = Cash Flow + Revenue", "Liabilities = Assets + Equity"],
          correctAnswer: "Assets = Liabilities + Equity",
          topic: "Financial Accounting Fundamentals",
          explanation: "The balance sheet equation dictates that total assets equal claims of creditors plus owners' equity."
        },
        {
          questionText: "Which financial statement summarizes an entity's financial position at a specific point in time?",
          options: ["Balance Sheet", "Income Statement", "Statement of Cash Flows", "Profit & Loss Account"],
          correctAnswer: "Balance Sheet",
          topic: "Financial Reporting",
          explanation: "The balance sheet reflects assets, liabilities, and equity at a snapshot date."
        },
        {
          questionText: "In cost accounting, what cost remains constant in total regardless of output volume changes within a relevant range?",
          options: ["Fixed Cost", "Variable Cost", "Marginal Cost", "Direct Labor Cost"],
          correctAnswer: "Fixed Cost",
          topic: "Cost & Management Accounting",
          explanation: "Fixed costs (e.g. factory rent) do not vary in total with short-term production volume."
        },
        {
          questionText: "What is the golden rule of accounting for a Personal Account?",
          options: ["Debit the receiver, Credit the giver", "Debit what comes in, Credit what goes out", "Debit all expenses, Credit all incomes", "Debit equity, Credit liabilities"],
          correctAnswer: "Debit the receiver, Credit the giver",
          topic: "Bookkeeping & Account Rules",
          explanation: "Personal accounts deal with individuals or legal entities (Debit receiver, Credit giver)."
        }
      ],
      EASY: [
        {
          questionText: "Which financial ratio assesses a firm's short-term liquidity and ability to cover immediate liabilities?",
          options: ["Current Ratio / Quick Ratio", "Debt-to-Equity Ratio", "Return on Investment (ROI)", "Price-to-Earnings (P/E) Ratio"],
          correctAnswer: "Current Ratio / Quick Ratio",
          topic: "Financial Statement Analysis",
          explanation: "Current and quick ratios measure short-term debt paying ability."
        },
        {
          questionText: "In corporate finance, what principle dictates that money available today is worth more than the same amount in the future?",
          options: ["Time Value of Money (TVM)", "Inflation Parity Theorem", "Working Capital Management", "Capital Asset Pricing Model"],
          correctAnswer: "Time Value of Money (TVM)",
          topic: "Corporate Finance",
          explanation: "TVM recognizes earning potential of capital over time through interest/returns."
        },
        {
          questionText: "What primary objective does an independent external financial audit fulfill?",
          options: ["Expressing an opinion on whether financial statements present a true and fair view", "Guaranteeing future stock market gains", "Calculating daily staff payroll taxes", "Managing physical inventory purchases"],
          correctAnswer: "Expressing an opinion on whether financial statements present a true and fair view",
          topic: "Auditing & Assurance",
          explanation: "Auditors audit financial records to provide independent assurance to stakeholders."
        },
        {
          questionText: "What financial market deals primarily in long-term debt securities and equity capital for corporate expansion?",
          options: ["Capital Market", "Money Market", "Spot Forex Market", "Commodity Futures Market"],
          correctAnswer: "Capital Market",
          topic: "Financial Markets & Banking",
          explanation: "Capital markets facilitate raising long-term funds via stocks and bonds."
        }
      ],
      MODERATE: [
        {
          questionText: "In capital budgeting, what rate of return sets the Net Present Value (NPV) of a project's cash flows to zero?",
          options: ["Internal Rate of Return (IRR)", "Accounting Rate of Return", "Payback Period", "Weighted Average Cost of Capital"],
          correctAnswer: "Internal Rate of Return (IRR)",
          topic: "Capital Investment Decisions",
          explanation: "IRR is the discount rate at which total discounted inflows equal initial outlay."
        },
        {
          questionText: "Under International Financial Reporting Standards (IFRS / Ind AS), how should inventory be valued on the balance sheet?",
          options: ["Lower of Cost and Net Realizable Value (NRV)", "Historical Purchase Cost only", "Estimated Future Selling Price", "Replacement Market Value"],
          correctAnswer: "Lower of Cost and Net Realizable Value (NRV)",
          topic: "Accounting Standards & IFRS",
          explanation: "IAS 2 requires inventory valuation at the lower of cost or NRV to adhere to prudence."
        }
      ]
    },
    law: {
      VERY_EASY: [
        {
          questionText: "What is the supreme law of the land governing rights, duties, and government structure in India?",
          options: ["The Constitution of India", "Indian Penal Code", "Code of Civil Procedure", "Indian Evidence Act"],
          correctAnswer: "The Constitution of India",
          topic: "Constitutional Law",
          explanation: "The Constitution is the supreme law; all statutory legislation must conform to it."
        },
        {
          questionText: "What essential legal element is required to turn an agreement into an enforceable contract under contract law?",
          options: ["Free Consent & Lawful Consideration", "Registration by Notary Public", "Notarized stamp paper", "Oral witness attestation"],
          correctAnswer: "Free Consent & Lawful Consideration",
          topic: "Contract Law",
          explanation: "Enforceable contracts require lawful offer, acceptance, consideration, legal capacity, and free consent."
        },
        {
          questionText: "What fundamental criminal jurisprudence rule presumes the status of an accused person?",
          options: ["Presumed innocent until proven guilty beyond reasonable doubt", "Presumed guilty until proven innocent", "Presumed liable for civil damages immediately", "Presumed subject to summary detention"],
          correctAnswer: "Presumed innocent until proven guilty beyond reasonable doubt",
          topic: "Criminal Jurisprudence",
          explanation: "The burden of proof lies on the prosecution to establish guilt beyond reasonable doubt."
        },
        {
          questionText: "Which judicial body acts as the final court of appeal in India?",
          options: ["Supreme Court of India", "High Court of the State", "District & Sessions Court", "Central Administrative Tribunal"],
          correctAnswer: "Supreme Court of India",
          topic: "Judicial System & System of Courts",
          explanation: "The Supreme Court is the apex judicial authority under Part V of the Constitution."
        }
      ],
      EASY: [
        {
          questionText: "In tort law, what three core elements must be established to substantiate actionable negligence?",
          options: ["Legal duty of care, Breach of duty, and Resulting damage/causation", "Malice, Defamation, and Trespass", "Breach of trust, Fraud, and Misrepresentation", "Strict liability, Nuisance, and Conversion"],
          correctAnswer: "Legal duty of care, Breach of duty, and Resulting damage/causation",
          topic: "Law of Torts",
          explanation: "Negligence requires proving a legal duty, breach of that duty, and proximate injury."
        },
        {
          questionText: "In criminal law, what Latin term specifies the guilty mental state required to constitute a crime?",
          options: ["Mens Rea", "Actus Reus", "Habeas Corpus", "Stare Decisis"],
          correctAnswer: "Mens Rea",
          topic: "Criminal Law & Intent",
          explanation: "Mens Rea refers to criminal intent or mental culpability accompanying the wrongful act."
        },
        {
          questionText: "Which constitutional writ is issued by superior courts to compel a public officer to execute a mandatory statutory duty?",
          options: ["Writ of Mandamus", "Writ of Habeas Corpus", "Writ of Quo Warranto", "Writ of Certiorari"],
          correctAnswer: "Writ of Mandamus",
          topic: "Constitutional Remedies & Writs",
          explanation: "Mandamus commands a public authority to perform a duty it has failed or refused to do."
        },
        {
          questionText: "In property law, what transaction involves transferring an interest in specific immovable property to secure a monetary loan?",
          options: ["Mortgage", "Lease", "License", "Gift Deed"],
          correctAnswer: "Mortgage",
          topic: "Property Law & Transfer of Property",
          explanation: "A mortgage secures repayment of debt through an interest in immovable property."
        }
      ],
      MODERATE: [
        {
          questionText: "What judicial doctrine obligates subordinate courts to follow precedents set by higher courts in the same jurisdiction?",
          options: ["Stare Decisis", "Obiter Dicta", "Ratio Decidendi", "Lis Pendens"],
          correctAnswer: "Stare Decisis",
          topic: "Jurisprudence & Judicial Precedent",
          explanation: "Stare decisis promotes legal stability by adhering to settled precedent."
        },
        {
          questionText: "In company law, what doctrine invalidates corporate acts performed beyond the powers granted in the Memorandum of Association?",
          options: ["Doctrine of Ultra Vires", "Doctrine of Indoor Management", "Doctrine of Constructive Notice", "Piercing the Corporate Veil"],
          correctAnswer: "Doctrine of Ultra Vires",
          topic: "Corporate & Company Law",
          explanation: "Acts beyond the object clause of the Memorandum are ultra vires and void."
        }
      ]
    }
  };

  let selectedBankKey = "computer";
  if (normField.includes("med") || normField.includes("health") || normDomain.includes("med") || normDomain.includes("surg") || normDomain.includes("clinic") || normDomain.includes("homoeo") || normDegree.includes("b.h.m.s") || normDegree.includes("m.b.b.s") || normDegree.includes("b.d.s")) {
    selectedBankKey = "medicine";
  } else if (normField.includes("mech") || normDomain.includes("mech") || normSpec.includes("mech") || normDomain.includes("auto")) {
    selectedBankKey = "mechanical";
  } else if (normField.includes("electr") || normDomain.includes("electr") || normDomain.includes("eee") || normDomain.includes("ece") || normDomain.includes("telecom")) {
    selectedBankKey = "electrical";
  } else if (normField.includes("comm") || normField.includes("manag") || normField.includes("busin") || normDomain.includes("comm") || normDomain.includes("finan") || normDomain.includes("account") || normDegree.includes("b.com") || normDegree.includes("bba")) {
    selectedBankKey = "commerce";
  } else if (normField.includes("law") || normDomain.includes("law") || normDomain.includes("legal") || normDegree.includes("ll.b")) {
    selectedBankKey = "law";
  } else if (normField.includes("eng") || normDomain.includes("comput") || normDomain.includes("software") || normDomain.includes("data") || normDomain.includes("ai") || normDomain.includes("it")) {
    selectedBankKey = "computer";
  }

  const bank = domainBanks[selectedBankKey] || domainBanks.computer;
  const questionsList = bank[difficulty] || bank.VERY_EASY;

  const results = [];
  for (let i = 0; i < count; i++) {
    const rawQ = questionsList[i % questionsList.length];
    results.push({
      id: `local_${difficulty.toLowerCase()}_${i}_${Date.now()}`,
      questionText: rawQ.questionText,
      options: rawQ.options,
      correctAnswer: rawQ.correctAnswer,
      topic: rawQ.topic,
      explanation: rawQ.explanation,
      difficulty,
      source: "DOMAIN_FALLBACK"
    });
  }
  return results;
};

// ── GET /api/college-onboarding/questions ─────────────────────────────────────
exports.getCollegeQuestions = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const profile = await CollegeStudentProfile.findOne({ userId });

    // Missing Domain Handling (Section 22 requirement)
    if (!profile || !profile.domain || !profile.field) {
      return res.status(200).json({
        success: true,
        missingDomain: true,
        message: "Please complete your academic profile so we can personalize your onboarding assessment.",
        profile: profile || null
      });
    }

    const { field, degreeProgramme: degree, domain, specialization, currentYear, currentSemester, skills, selfReportedSkills } = profile;

    const selectedSkillNames = (selfReportedSkills && selfReportedSkills.length > 0)
      ? selfReportedSkills.map(s => s.name)
      : (skills || []);

    // Target distribution: 10 questions (4 Very Easy, 4 Easy, 2 Moderate)
    const targets = { VERY_EASY: 4, EASY: 4, MODERATE: 2 };
    const finalQuestions = [];

    for (const diff of ["VERY_EASY", "EASY", "MODERATE"]) {
      const targetCount = targets[diff];

      // 1. Query Database Bank by Hierarchy Priority (Specialization > Domain > Degree > Field)
      let query = { difficulty: diff, status: "ACTIVE" };
      if (specialization) {
        query.$or = [{ specialization }, { domain }];
      } else {
        query.domain = domain;
      }

      let dbQuestions = await CollegeOnboardingQuestion.find(query).limit(targetCount);

      // Fallback query by Field if Domain query returned fewer questions
      if (dbQuestions.length < targetCount) {
        const existingIds = dbQuestions.map(q => q._id);
        const additionalDb = await CollegeOnboardingQuestion.find({
          _id: { $nin: existingIds },
          field: field,
          difficulty: diff,
          status: "ACTIVE"
        }).limit(targetCount - dbQuestions.length);

        dbQuestions = [...dbQuestions, ...additionalDb];
      }

      // Format DB questions
      const formattedDb = dbQuestions.map(q => ({
        id: q._id.toString(),
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        topic: q.topic,
        explanation: q.explanation,
        difficulty: q.difficulty,
        source: "DATABASE"
      }));

      finalQuestions.push(...formattedDb);

      // 2. If DB lacks sufficient questions, generate missing count via AI
      let aiCount = 0;
      const missingCount = targetCount - dbQuestions.length;
      if (missingCount > 0) {
        const aiQuestions = await generateAIQuestionsForLevel(field, degree, domain, specialization, currentYear, diff, selectedSkillNames, missingCount);
        const formattedAi = aiQuestions.map((q, idx) => ({
          id: `ai_${diff.toLowerCase()}_${idx}_${Date.now()}`,
          ...q
        }));
        finalQuestions.push(...formattedAi);
        aiCount = formattedAi.length;
      }

      // 3. Guaranteed Deterministic Fallback if DB + AI return fewer than targetCount
      const remainingCount = targetCount - dbQuestions.length - aiCount;
      if (remainingCount > 0) {
        const localFallback = generateLocalFallbackQuestions(field, degree, domain, specialization, diff, remainingCount, selectedSkillNames);
        finalQuestions.push(...localFallback);
      }
    }

    res.status(200).json({
      success: true,
      missingDomain: false,
      academicProfile: {
        field,
        degree,
        domain,
        specialization,
        currentYear,
        currentSemester,
        selectedSkills: selectedSkillNames
      },
      distribution: {
        veryEasyCount: finalQuestions.filter(q => q.difficulty === "VERY_EASY").length,
        easyCount: finalQuestions.filter(q => q.difficulty === "EASY").length,
        moderateCount: finalQuestions.filter(q => q.difficulty === "MODERATE").length,
        total: finalQuestions.length
      },
      questions: finalQuestions
    });
  } catch (error) {
    console.error("Get college onboarding questions error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch domain questions" });
  }
};

// ── POST /api/college-onboarding/submit ───────────────────────────────────────
exports.submitCollegeOnboarding = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid submission data" });
    }

    const profile = await CollegeStudentProfile.findOne({ userId });
    if (!profile || !profile.domain) {
      return res.status(400).json({ success: false, message: "Academic domain missing from profile" });
    }

    const { field, degreeProgramme: degree, domain, specialization, currentYear, currentSemester } = profile;

    const processedAnswers = [];
    let correctAnswersCount = 0;

    const stageScores = {
      VERY_EASY: { total: 0, correct: 0 },
      EASY: { total: 0, correct: 0 },
      MODERATE: { total: 0, correct: 0 }
    };

    const topicScores = {}; // { topicName: { total: 0, correct: 0 } }

    for (const ans of answers) {
      let qText = ans.questionText;
      let cAns = ans.correctAnswer;
      let diff = ans.difficulty || "VERY_EASY";
      let top = ans.topic || "Domain Fundamentals";

      // If question ID is a database object ID, verify against DB
      const mongoose = require("mongoose");
      if (ans.questionId && mongoose.Types.ObjectId.isValid(ans.questionId)) {
        const dbQ = await CollegeOnboardingQuestion.findById(ans.questionId);
        if (dbQ) {
          qText = dbQ.questionText;
          cAns = dbQ.correctAnswer;
          diff = dbQ.difficulty;
          top = dbQ.topic;
        }
      }

      const isCorrect = String(ans.selectedAnswer || "").trim().toLowerCase() === String(cAns || "").trim().toLowerCase();
      if (isCorrect) correctAnswersCount++;

      processedAnswers.push({
        questionId: ans.questionId || "ai_generated",
        questionText: qText,
        topic: top,
        difficulty: diff,
        selectedAnswer: ans.selectedAnswer,
        correctAnswer: cAns,
        isCorrect,
        responseTime: ans.responseTime || 0
      });

      // Stage tracking
      if (stageScores[diff]) {
        stageScores[diff].total += 1;
        if (isCorrect) stageScores[diff].correct += 1;
      }

      // Topic tracking
      if (!topicScores[top]) {
        topicScores[top] = { total: 0, correct: 0 };
      }
      topicScores[top].total += 1;
      if (isCorrect) topicScores[top].correct += 1;
    }

    const totalQuestions = processedAnswers.length;
    const scorePercentage = Math.round((correctAnswersCount / totalQuestions) * 100);

    // Stage breakdown formatting
    const stageBreakdown = {
      veryEasy: {
        total: stageScores.VERY_EASY.total,
        correct: stageScores.VERY_EASY.correct,
        percentage: stageScores.VERY_EASY.total > 0 ? Math.round((stageScores.VERY_EASY.correct / stageScores.VERY_EASY.total) * 100) : 0
      },
      easy: {
        total: stageScores.EASY.total,
        correct: stageScores.EASY.correct,
        percentage: stageScores.EASY.total > 0 ? Math.round((stageScores.EASY.correct / stageScores.EASY.total) * 100) : 0
      },
      moderate: {
        total: stageScores.MODERATE.total,
        correct: stageScores.MODERATE.correct,
        percentage: stageScores.MODERATE.total > 0 ? Math.round((stageScores.MODERATE.correct / stageScores.MODERATE.total) * 100) : 0
      }
    };

    // Topic breakdown formatting & Self-Reported vs Assessed Matrix
    const topicBreakdown = [];
    const strengths = [];
    const areasToStrengthen = [];
    const assessedSkills = [];
    const selfReportVsAssessedMatrix = [];

    const selfReportedSkillsMap = {};
    (profile.selfReportedSkills || []).forEach(s => {
      selfReportedSkillsMap[s.name.toLowerCase()] = s.selfReportedLevel || "Intermediate";
    });

    for (const topic in topicScores) {
      const data = topicScores[topic];
      const pct = Math.round((data.correct / data.total) * 100);
      topicBreakdown.push({ topic, total: data.total, correct: data.correct, percentage: pct });

      let assessedLevel = "Developing";
      if (pct >= 80) assessedLevel = "Advanced";
      else if (pct >= 60) assessedLevel = "Intermediate";
      else assessedLevel = "Developing";

      if (pct >= 70) {
        strengths.push(topic);
      } else {
        areasToStrengthen.push(topic);
      }

      // Find matching self-reported level
      const matchingSelfReportKey = Object.keys(selfReportedSkillsMap).find(k => k.includes(topic.toLowerCase()) || topic.toLowerCase().includes(k));
      const selfReportedLevel = matchingSelfReportKey ? selfReportedSkillsMap[matchingSelfReportKey] : "Self-Reported";

      assessedSkills.push({
        topic,
        selfReportedLevel,
        assessedLevel,
        scorePercentage: pct,
        confidence: totalQuestions >= 10 ? "High" : "Moderate"
      });

      let note = `Demonstrated level: ${assessedLevel} (${pct}% score).`;
      if (matchingSelfReportKey) {
        if (selfReportedLevel === "Advanced" && (assessedLevel === "Intermediate" || assessedLevel === "Developing")) {
          note = `Self-reported ${selfReportedLevel}; Assessment indicates ${assessedLevel} demonstrated level. Targeted practice will strengthen foundation.`;
        } else if (selfReportedLevel === assessedLevel) {
          note = `Self-reported level matches demonstrated assessment performance (${assessedLevel}).`;
        } else {
          note = `Self-reported ${selfReportedLevel}; Demonstrated ${assessedLevel}.`;
        }
      }

      selfReportVsAssessedMatrix.push({
        skillName: topic,
        selfReportedLevel,
        assessedLevel,
        comparisonNote: note
      });
    }

    // Default fallbacks if lists are empty
    if (strengths.length === 0) strengths.push(`${domain} Foundation Concepts`);
    if (areasToStrengthen.length === 0) areasToStrengthen.push(`Advanced ${domain} Applications`);

    const recommendedStartingTopics = areasToStrengthen.length > 0
      ? areasToStrengthen.slice(0, 3)
      : [`Advanced ${domain} Practice`, "Project Applications"];

    // Constructive Baseline Statement (NO negative labels!)
    let currentBaseline = "";
    if (scorePercentage >= 85) {
      currentBaseline = `Your current baseline in ${domain} fundamentals is exceptionally strong. You demonstrate a solid grasp of core theory and analytical concepts.`;
    } else if (scorePercentage >= 65) {
      currentBaseline = `Your current baseline in ${domain} fundamentals is developing well. You have a good foundational grasp with key areas ready for targeted practice.`;
    } else if (scorePercentage >= 45) {
      currentBaseline = `Your current baseline in ${domain} fundamentals provides a steady starting point. Focused practice on core topics will build strong confidence.`;
    } else {
      currentBaseline = `Your current baseline in ${domain} fundamentals is established. Reviewing foundational concepts will help accelerate your growth.`;
    }

    const baselineResult = {
      currentBaseline,
      strengths,
      areasToStrengthen,
      recommendedStartingTopics,
      assessedSkills,
      selfReportVsAssessedMatrix
    };

    // Save Onboarding Response
    const onboardingResponse = new CollegeOnboardingResponse({
      userId,
      field,
      degree,
      domain,
      specialization,
      academicYear: currentYear,
      semester: currentSemester,
      answers: processedAnswers,
      totalQuestions,
      correctAnswers: correctAnswersCount,
      wrongAnswers: totalQuestions - correctAnswersCount,
      scorePercentage,
      stageBreakdown,
      topicBreakdown,
      baselineResult,
      isCurrentDomainBaseline: true
    });
    await onboardingResponse.save();

    // Preserve historical baseline when domain changes and set current baseline
    const newBaselineRecord = {
      field,
      degree,
      domain,
      specialization,
      currentBaseline,
      strengths,
      areasToStrengthen,
      recommendedStartingTopics,
      scorePercentage,
      assessedAt: new Date(),
      assessedSkills,
      selfReportVsAssessedMatrix
    };

    if (profile.onboardingBaseline && profile.onboardingBaseline.domain) {
      profile.onboardingHistory.push({ ...profile.onboardingBaseline });
    }

    profile.onboardingBaseline = newBaselineRecord;
    profile.grokAssessmentScore = scorePercentage;
    profile.grokAssessmentResults = processedAnswers;
    profile.currentStep = 7;
    profile.isCompleted = true;

    await profile.save();

    // Update Recommendation document for cross-platform integration
    await Recommendation.findOneAndUpdate(
      { userId },
      {
        userId,
        grade: `College - ${domain}`,
        scorePercentage,
        performanceLevel: currentBaseline,
        strongSkills: strengths,
        weakSkills: areasToStrengthen,
        recommendedSkills: recommendedStartingTopics,
        improvementMessage: currentBaseline
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: "Onboarding assessment completed successfully",
      scorePercentage,
      stageBreakdown,
      baselineResult,
      responseId: onboardingResponse._id
    });
  } catch (error) {
    console.error("Submit college onboarding error:", error);
    res.status(500).json({ success: false, message: "Submission failed" });
  }
};

// ── GET /api/college-onboarding/baseline ──────────────────────────────────────
exports.getCollegeBaseline = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const profile = await CollegeStudentProfile.findOne({ userId });
    const latestResponse = await CollegeOnboardingResponse.findOne({ userId }).sort({ createdAt: -1 });

    if (!profile || !profile.onboardingBaseline) {
      return res.status(200).json({
        success: true,
        hasBaseline: false,
        message: "No baseline assessment completed yet"
      });
    }

    res.status(200).json({
      success: true,
      hasBaseline: true,
      baseline: profile.onboardingBaseline,
      history: profile.onboardingHistory || [],
      detailedResponse: latestResponse
    });
  } catch (error) {
    console.error("Get college baseline error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch baseline" });
  }
};

// ── POST /api/college-onboarding/retake ───────────────────────────────────────
exports.retakeDomainAssessment = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const profile = await CollegeStudentProfile.findOne({ userId });
    if (profile) {
      if (profile.onboardingBaseline && profile.onboardingBaseline.domain) {
        profile.onboardingHistory.push({ ...profile.onboardingBaseline });
      }
      profile.onboardingBaseline = undefined;
      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: "Ready to retake domain onboarding assessment"
    });
  } catch (error) {
    console.error("Retake domain assessment error:", error);
    res.status(500).json({ success: false, message: "Failed to reset assessment" });
  }
};
