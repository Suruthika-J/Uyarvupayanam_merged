const AhpFuzzyQuestion = require("../models/AhpFuzzyQuestion");

const DEFAULT_15_QUESTIONS = [
  // 🟢 EASY DIFFICULTY QUESTIONS (1 - 5)
  {
    questionNumber: 1,
    questionText: "When presented with a complex technical problem, what type of system do you enjoy building most?",
    category: "Problem Solving & Logic",
    dimension: "System Type Preference",
    difficulty: "Easy",
    options: [
      {
        optionId: "q1_a",
        text: "High-level software applications, web platforms, and mobile algorithms.",
        ahpWeights: { cse: 0.40, it: 0.30, aids: 0.20, ece: 0.05, eee: 0.01, mechanical: 0.01, civil: 0.01, chemical: 0.01, mechatronics: 0.01 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q1_b",
        text: "Intelligent data models, predictive algorithms, and automated neural networks.",
        ahpWeights: { cse: 0.25, it: 0.15, aids: 0.50, ece: 0.05, eee: 0.01, mechanical: 0.01, civil: 0.01, chemical: 0.01, mechatronics: 0.01 },
        fuzzyIntensity: 10
      },
      {
        optionId: "q1_c",
        text: "Microcontrollers, semiconductor circuits, and wireless communication hardware.",
        ahpWeights: { cse: 0.05, it: 0.05, aids: 0.05, ece: 0.50, eee: 0.25, mechanical: 0.02, civil: 0.01, chemical: 0.01, mechatronics: 0.06 },
        fuzzyIntensity: 8
      },
      {
        optionId: "q1_d",
        text: "Physical structures, mechanical assemblies, machinery, or automation robotics.",
        ahpWeights: { cse: 0.01, it: 0.01, aids: 0.02, ece: 0.05, eee: 0.10, mechanical: 0.40, civil: 0.25, chemical: 0.01, mechatronics: 0.15 },
        fuzzyIntensity: 8
      }
    ]
  },
  {
    questionNumber: 2,
    questionText: "Which type of project output gives you the highest sense of accomplishment?",
    category: "Problem Solving & Logic",
    dimension: "Project Outcome",
    difficulty: "Easy",
    options: [
      {
        optionId: "q2_a",
        text: "Deploying a fast, secure web app or cloud service used by thousands of users.",
        ahpWeights: { cse: 0.35, it: 0.40, aids: 0.15, ece: 0.04, eee: 0.01, mechanical: 0.01, civil: 0.01, chemical: 0.01, mechatronics: 0.02 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q2_b",
        text: "Training an AI model that uncovers hidden trends and makes highly accurate predictions.",
        ahpWeights: { cse: 0.20, it: 0.10, aids: 0.55, ece: 0.05, eee: 0.02, mechanical: 0.01, civil: 0.01, chemical: 0.01, mechatronics: 0.05 },
        fuzzyIntensity: 10
      },
      {
        optionId: "q2_c",
        text: "Testing a custom PCB board or chip design that communicates seamlessly over wireless protocols.",
        ahpWeights: { cse: 0.05, it: 0.05, aids: 0.05, ece: 0.55, eee: 0.20, mechanical: 0.02, civil: 0.01, chemical: 0.01, mechatronics: 0.06 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q2_d",
        text: "Building an automated robotic arm, EV motor drive, or structural bridge design.",
        ahpWeights: { cse: 0.02, it: 0.01, aids: 0.05, ece: 0.05, eee: 0.20, mechanical: 0.35, civil: 0.15, chemical: 0.02, mechatronics: 0.15 },
        fuzzyIntensity: 8
      }
    ]
  },
  {
    questionNumber: 3,
    questionText: "What is your preferred approach when troubleshooting a technical failure?",
    category: "Problem Solving & Logic",
    dimension: "Troubleshooting Style",
    difficulty: "Easy",
    options: [
      {
        optionId: "q3_a",
        text: "Debugging source code using breakpoints, stack traces, and unit test suites.",
        ahpWeights: { cse: 0.45, it: 0.35, aids: 0.12, ece: 0.04, eee: 0.01, mechanical: 0.01, civil: 0.01, chemical: 0.01, mechatronics: 0.00 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q3_b",
        text: "Analyzing statistical datasets, loss functions, and model parameters for bias.",
        ahpWeights: { cse: 0.20, it: 0.10, aids: 0.60, ece: 0.04, eee: 0.01, mechanical: 0.01, civil: 0.01, chemical: 0.01, mechatronics: 0.02 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q3_c",
        text: "Measuring voltage waveforms with oscilloscopes and testing circuit continuity.",
        ahpWeights: { cse: 0.02, it: 0.02, aids: 0.02, ece: 0.50, eee: 0.35, mechanical: 0.02, civil: 0.01, chemical: 0.01, mechatronics: 0.05 },
        fuzzyIntensity: 8
      },
      {
        optionId: "q3_d",
        text: "Inspecting mechanical tolerances, stress points, gear alignments, or fluid leaks.",
        ahpWeights: { cse: 0.01, it: 0.01, aids: 0.01, ece: 0.02, eee: 0.10, mechanical: 0.45, civil: 0.30, chemical: 0.05, mechatronics: 0.05 },
        fuzzyIntensity: 8
      }
    ]
  },
  {
    questionNumber: 4,
    questionText: "How do you view interaction between physical hardware and digital software?",
    category: "System Architecture & Hardware",
    dimension: "Hardware vs Software Balance",
    difficulty: "Easy",
    options: [
      {
        optionId: "q4_a",
        text: "I prefer pure software logic and abstractions, running on cloud server infrastructure.",
        ahpWeights: { cse: 0.45, it: 0.40, aids: 0.10, ece: 0.02, eee: 0.01, mechanical: 0.01, civil: 0.01, chemical: 0.00, mechatronics: 0.00 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q4_b",
        text: "I am fascinated by Embedded Systems & IoT where microcontrollers control sensors and actuators.",
        ahpWeights: { cse: 0.10, it: 0.05, aids: 0.05, ece: 0.40, eee: 0.15, mechanical: 0.05, civil: 0.00, chemical: 0.00, mechatronics: 0.20 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q4_c",
        text: "I am interested in high-voltage electrical grids, motor drives, and renewable power systems.",
        ahpWeights: { cse: 0.02, it: 0.02, aids: 0.01, ece: 0.15, eee: 0.65, mechanical: 0.10, civil: 0.02, chemical: 0.01, mechatronics: 0.02 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q4_d",
        text: "I love physical mechanisms, 3D CAD modeling, material dynamics, and robotics hardware.",
        ahpWeights: { cse: 0.01, it: 0.01, aids: 0.02, ece: 0.05, eee: 0.05, mechanical: 0.45, civil: 0.20, chemical: 0.01, mechatronics: 0.20 },
        fuzzyIntensity: 8
      }
    ]
  },
  {
    questionNumber: 5,
    questionText: "Which emerging technology domain excites you most for your future career?",
    category: "Innovation & Technology Trends",
    dimension: "Future Tech Trend",
    difficulty: "Easy",
    options: [
      {
        optionId: "q5_a",
        text: "Generative AI, Large Language Models (LLMs), and Autonomous AI Agents.",
        ahpWeights: { cse: 0.30, it: 0.15, aids: 0.50, ece: 0.02, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.02 },
        fuzzyIntensity: 10
      },
      {
        optionId: "q5_b",
        text: "Cybersecurity, Zero-Trust Architecture, DevSecOps, and Cloud Microservices.",
        ahpWeights: { cse: 0.40, it: 0.45, aids: 0.10, ece: 0.03, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.01 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q5_c",
        text: "Semiconductor Fabrication, 5G/6G Chip Design, and Quantum Electronics.",
        ahpWeights: { cse: 0.05, it: 0.05, aids: 0.05, ece: 0.60, eee: 0.20, mechanical: 0.01, civil: 0.00, chemical: 0.01, mechatronics: 0.03 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q5_d",
        text: "Electric Vehicles (EVs), Autonomous Drones, Smart Cities, and Green Energy Grids.",
        ahpWeights: { cse: 0.02, it: 0.02, aids: 0.05, ece: 0.10, eee: 0.25, mechanical: 0.20, civil: 0.15, chemical: 0.01, mechatronics: 0.20 },
        fuzzyIntensity: 9
      }
    ]
  },

  // 🟡 MEDIUM DIFFICULTY QUESTIONS (6 - 10)
  {
    questionNumber: 6,
    questionText: "When working in an engineering team, which role do you naturally perform best in?",
    category: "System Architecture & Hardware",
    dimension: "Team Role Affinity",
    difficulty: "Medium",
    options: [
      {
        optionId: "q6_a",
        text: "Full-Stack Developer: Writing front-end interfaces, API backend logic, and database schemas.",
        ahpWeights: { cse: 0.45, it: 0.35, aids: 0.15, ece: 0.03, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.01 },
        fuzzyIntensity: 8
      },
      {
        optionId: "q6_b",
        text: "Data Scientist / ML Engineer: Cleaning datasets, building models, and deriving insights.",
        ahpWeights: { cse: 0.20, it: 0.15, aids: 0.60, ece: 0.03, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.01 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q6_c",
        text: "Embedded / Hardware Specialist: Wiring breadboards, programming microcontrollers, and testing signals.",
        ahpWeights: { cse: 0.05, it: 0.02, aids: 0.03, ece: 0.50, eee: 0.25, mechanical: 0.03, civil: 0.00, chemical: 0.00, mechatronics: 0.12 },
        fuzzyIntensity: 8
      },
      {
        optionId: "q6_d",
        text: "Design / Structural Engineer: 3D CAD modeling, thermal/stress simulation, and structural planning.",
        ahpWeights: { cse: 0.01, it: 0.01, aids: 0.02, ece: 0.03, eee: 0.10, mechanical: 0.40, civil: 0.30, chemical: 0.03, mechatronics: 0.10 },
        fuzzyIntensity: 8
      }
    ]
  },
  {
    questionNumber: 7,
    questionText: "What kind of mathematical concepts do you feel most comfortable applying?",
    category: "Problem Solving & Logic",
    dimension: "Mathematical Focus",
    difficulty: "Medium",
    options: [
      {
        optionId: "q7_a",
        text: "Discrete Mathematics, Graph Theory, Boolean Logic, and Data Structures.",
        ahpWeights: { cse: 0.50, it: 0.30, aids: 0.15, ece: 0.03, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.01 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q7_b",
        text: "Linear Algebra, Probability & Statistics, Multivariable Calculus, and Optimization.",
        ahpWeights: { cse: 0.20, it: 0.10, aids: 0.60, ece: 0.05, eee: 0.02, mechanical: 0.01, civil: 0.01, chemical: 0.01, mechatronics: 0.00 },
        fuzzyIntensity: 10
      },
      {
        optionId: "q7_c",
        text: "Fourier Transforms, Complex Analysis, Differential Equations, and Signal Theory.",
        ahpWeights: { cse: 0.04, it: 0.02, aids: 0.04, ece: 0.50, eee: 0.30, mechanical: 0.05, civil: 0.02, chemical: 0.01, mechatronics: 0.02 },
        fuzzyIntensity: 8
      },
      {
        optionId: "q7_d",
        text: "Kinematics, Vector Statics/Dynamics, Solid Mechanics, and Fluid Dynamics.",
        ahpWeights: { cse: 0.00, it: 0.00, aids: 0.01, ece: 0.02, eee: 0.05, mechanical: 0.45, civil: 0.35, chemical: 0.07, mechatronics: 0.05 },
        fuzzyIntensity: 8
      }
    ]
  },
  {
    questionNumber: 8,
    questionText: "How do you prefer to handle large volumes of digital information?",
    category: "Data & Artificial Intelligence",
    dimension: "Data Processing Preference",
    difficulty: "Medium",
    options: [
      {
        optionId: "q8_a",
        text: "Architecting relational SQL / NoSQL databases and optimizing query execution speeds.",
        ahpWeights: { cse: 0.35, it: 0.45, aids: 0.15, ece: 0.03, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.01 },
        fuzzyIntensity: 8
      },
      {
        optionId: "q8_b",
        text: "Running feature extraction, data pipelines, and machine learning model training.",
        ahpWeights: { cse: 0.20, it: 0.15, aids: 0.60, ece: 0.03, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.01 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q8_c",
        text: "Processing real-time analog/digital sensor streams and filter packet payloads.",
        ahpWeights: { cse: 0.10, it: 0.05, aids: 0.10, ece: 0.45, eee: 0.20, mechanical: 0.02, civil: 0.00, chemical: 0.00, mechatronics: 0.08 },
        fuzzyIntensity: 8
      },
      {
        optionId: "q8_d",
        text: "Managing physical CAD models, survey datasets, and structural load calculations.",
        ahpWeights: { cse: 0.00, it: 0.00, aids: 0.02, ece: 0.02, eee: 0.05, mechanical: 0.40, civil: 0.40, chemical: 0.05, mechatronics: 0.06 },
        fuzzyIntensity: 7
      }
    ]
  },
  {
    questionNumber: 9,
    questionText: "Which ideal daily work environment suits your personal working style?",
    category: "Real-World Engineering & Infrastructure",
    dimension: "Work Environment",
    difficulty: "Medium",
    options: [
      {
        optionId: "q9_a",
        text: "Modern tech office or remote setup focusing on software coding and cloud infrastructure.",
        ahpWeights: { cse: 0.40, it: 0.40, aids: 0.15, ece: 0.03, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.01 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q9_b",
        text: "AI Research & Analytics Lab with GPU clusters, Jupyter notebooks, and data pipelines.",
        ahpWeights: { cse: 0.25, it: 0.15, aids: 0.55, ece: 0.03, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.01 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q9_c",
        text: "Electronics Hardware & VLSI Cleanroom Lab with test benches and soldering gear.",
        ahpWeights: { cse: 0.03, it: 0.02, aids: 0.03, ece: 0.55, eee: 0.25, mechanical: 0.02, civil: 0.00, chemical: 0.00, mechatronics: 0.10 },
        fuzzyIntensity: 8
      },
      {
        optionId: "q9_d",
        text: "Manufacturing floor, automotive workshop, power plant, or civil construction site.",
        ahpWeights: { cse: 0.00, it: 0.00, aids: 0.01, ece: 0.02, eee: 0.15, mechanical: 0.40, civil: 0.35, chemical: 0.02, mechatronics: 0.05 },
        fuzzyIntensity: 8
      }
    ]
  },
  {
    questionNumber: 10,
    questionText: "What drives your curiosity when examining a newly launched product or app?",
    category: "Innovation & Technology Trends",
    dimension: "Product Curiosity",
    difficulty: "Medium",
    options: [
      {
        optionId: "q10_a",
        text: "How the user interface, backend APIs, microservices, and database are structured.",
        ahpWeights: { cse: 0.40, it: 0.40, aids: 0.15, ece: 0.03, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.01 },
        fuzzyIntensity: 8
      },
      {
        optionId: "q10_b",
        text: "How recommendation algorithms, NLP models, or computer vision features function.",
        ahpWeights: { cse: 0.20, it: 0.15, aids: 0.60, ece: 0.03, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.01 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q10_c",
        text: "How the internal silicon chip, battery efficiency, and wireless antenna perform.",
        ahpWeights: { cse: 0.03, it: 0.02, aids: 0.03, ece: 0.50, eee: 0.30, mechanical: 0.02, civil: 0.00, chemical: 0.00, mechatronics: 0.10 },
        fuzzyIntensity: 8
      },
      {
        optionId: "q10_d",
        text: "How the physical housing, heat dissipation, gear mechanisms, and ergonomics are built.",
        ahpWeights: { cse: 0.01, it: 0.01, aids: 0.01, ece: 0.03, eee: 0.10, mechanical: 0.45, civil: 0.25, chemical: 0.05, mechatronics: 0.09 },
        fuzzyIntensity: 8
      }
    ]
  },

  // 🔴 HARD DIFFICULTY QUESTIONS (11 - 15)
  {
    questionNumber: 11,
    questionText: "Which type of engineering optimization challenge sounds most appealing?",
    category: "Problem Solving & Logic",
    dimension: "Optimization Challenge",
    difficulty: "Hard",
    options: [
      {
        optionId: "q11_a",
        text: "Reducing algorithmic time complexity from O(N^2) to O(N log N) in software execution.",
        ahpWeights: { cse: 0.50, it: 0.30, aids: 0.15, ece: 0.03, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.01 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q11_b",
        text: "Minimizing loss function and overfitting during deep neural network hyperparameter tuning.",
        ahpWeights: { cse: 0.20, it: 0.10, aids: 0.65, ece: 0.03, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.01 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q11_c",
        text: "Minimizing signal noise, power dissipation, and propagation delay in integrated circuits.",
        ahpWeights: { cse: 0.03, it: 0.02, aids: 0.03, ece: 0.55, eee: 0.30, mechanical: 0.02, civil: 0.00, chemical: 0.00, mechatronics: 0.05 },
        fuzzyIntensity: 8
      },
      {
        optionId: "q11_d",
        text: "Optimizing aerodynamic drag, fuel/energy efficiency, and structural load distributions.",
        ahpWeights: { cse: 0.00, it: 0.00, aids: 0.01, ece: 0.02, eee: 0.10, mechanical: 0.45, civil: 0.30, chemical: 0.05, mechatronics: 0.07 },
        fuzzyIntensity: 8
      }
    ]
  },
  {
    questionNumber: 12,
    questionText: "How do you prefer to address system reliability and high availability?",
    category: "System Architecture & Hardware",
    dimension: "System Reliability",
    difficulty: "Hard",
    options: [
      {
        optionId: "q12_a",
        text: "Implementing cloud load balancers, auto-scaling groups, and failover database clusters.",
        ahpWeights: { cse: 0.35, it: 0.45, aids: 0.15, ece: 0.03, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.01 },
        fuzzyIntensity: 8
      },
      {
        optionId: "q12_b",
        text: "Monitoring model drift, automated retraining triggers, and data quality validation.",
        ahpWeights: { cse: 0.20, it: 0.15, aids: 0.60, ece: 0.03, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.01 },
        fuzzyIntensity: 8
      },
      {
        optionId: "q12_c",
        text: "Designing redundant circuit pathways, surge protection, and hardware watchdogs.",
        ahpWeights: { cse: 0.03, it: 0.02, aids: 0.03, ece: 0.45, eee: 0.35, mechanical: 0.02, civil: 0.00, chemical: 0.00, mechatronics: 0.10 },
        fuzzyIntensity: 8
      },
      {
        optionId: "q12_d",
        text: "Applying safety factors, seismic dampers, structural reinforcement, and preventive maintenance.",
        ahpWeights: { cse: 0.00, it: 0.00, aids: 0.01, ece: 0.02, eee: 0.10, mechanical: 0.40, civil: 0.40, chemical: 0.02, mechatronics: 0.05 },
        fuzzyIntensity: 7
      }
    ]
  },
  {
    questionNumber: 13,
    questionText: "Which primary impact area inspires your long-term engineering ambitions?",
    category: "Real-World Engineering & Infrastructure",
    dimension: "Engineering Impact",
    difficulty: "Hard",
    options: [
      {
        optionId: "q13_a",
        text: "Revolutionizing digital commerce, SaaS software, and global internet platforms.",
        ahpWeights: { cse: 0.45, it: 0.40, aids: 0.10, ece: 0.03, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.01 },
        fuzzyIntensity: 8
      },
      {
        optionId: "q13_b",
        text: "Advancing artificial intelligence, healthcare diagnostics, and automated decision engines.",
        ahpWeights: { cse: 0.20, it: 0.10, aids: 0.60, ece: 0.04, eee: 0.01, mechanical: 0.01, civil: 0.00, chemical: 0.01, mechatronics: 0.03 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q13_c",
        text: "Building next-generation 5G/6G communications, IoT smart devices, and chipsets.",
        ahpWeights: { cse: 0.04, it: 0.02, aids: 0.04, ece: 0.55, eee: 0.25, mechanical: 0.02, civil: 0.00, chemical: 0.00, mechatronics: 0.08 },
        fuzzyIntensity: 8
      },
      {
        optionId: "q13_d",
        text: "Accelerating green energy transition, smart electric mobility, and sustainable infrastructure.",
        ahpWeights: { cse: 0.01, it: 0.01, aids: 0.02, ece: 0.05, eee: 0.25, mechanical: 0.25, civil: 0.25, chemical: 0.05, mechatronics: 0.11 },
        fuzzyIntensity: 9
      }
    ]
  },
  {
    questionNumber: 14,
    questionText: "What type of hands-on laboratory or practical workshop do you enjoy most?",
    category: "Real-World Engineering & Infrastructure",
    dimension: "Practical Lab Preference",
    difficulty: "Hard",
    options: [
      {
        optionId: "q14_a",
        text: "Computer software lab: Writing code, configuring Git/Docker, and building APIs.",
        ahpWeights: { cse: 0.45, it: 0.40, aids: 0.10, ece: 0.03, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.01 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q14_b",
        text: "AI & Data Science lab: Training neural nets, plotting accuracy curves, and running Python scripts.",
        ahpWeights: { cse: 0.20, it: 0.15, aids: 0.60, ece: 0.03, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.01 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q14_c",
        text: "Electronics & Microcontroller lab: Soldering circuits, testing microcontrollers, and wiring breadboards.",
        ahpWeights: { cse: 0.04, it: 0.02, aids: 0.04, ece: 0.50, eee: 0.25, mechanical: 0.03, civil: 0.00, chemical: 0.00, mechatronics: 0.12 },
        fuzzyIntensity: 8
      },
      {
        optionId: "q14_d",
        text: "Mechanical workshop / Concrete testing lab: Operating CNC machinery, lathe, 3D printers, or material stress rigs.",
        ahpWeights: { cse: 0.00, it: 0.00, aids: 0.01, ece: 0.02, eee: 0.10, mechanical: 0.40, civil: 0.35, chemical: 0.05, mechatronics: 0.07 },
        fuzzyIntensity: 8
      }
    ]
  },
  {
    questionNumber: 15,
    questionText: "If given 6 months to master a specialized skill, which path would you choose?",
    category: "Innovation & Technology Trends",
    dimension: "Specialization Mastery Path",
    difficulty: "Hard",
    options: [
      {
        optionId: "q15_a",
        text: "Mastering Full-Stack Web Architecture, React/Node.js, and Cloud DevOps Deployment.",
        ahpWeights: { cse: 0.45, it: 0.40, aids: 0.10, ece: 0.03, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.01 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q15_b",
        text: "Mastering Deep Learning, PyTorch, Natural Language Processing, and LLM Engineering.",
        ahpWeights: { cse: 0.20, it: 0.10, aids: 0.65, ece: 0.03, eee: 0.01, mechanical: 0.00, civil: 0.00, chemical: 0.00, mechatronics: 0.01 },
        fuzzyIntensity: 10
      },
      {
        optionId: "q15_c",
        text: "Mastering Verilog/SystemVerilog HDL, VLSI Chip Design, and Embedded System RTOS.",
        ahpWeights: { cse: 0.04, it: 0.02, aids: 0.04, ece: 0.55, eee: 0.25, mechanical: 0.02, civil: 0.00, chemical: 0.00, mechatronics: 0.08 },
        fuzzyIntensity: 9
      },
      {
        optionId: "q15_d",
        text: "Mastering Robotics Kinematics, SolidWorks CAD, Autonomous Drone Control, or Smart Grids.",
        ahpWeights: { cse: 0.01, it: 0.01, aids: 0.03, ece: 0.05, eee: 0.20, mechanical: 0.35, civil: 0.15, chemical: 0.02, mechatronics: 0.18 },
        fuzzyIntensity: 9
      }
    ]
  }
];

const seedAhpFuzzyQuestions = async () => {
  try {
    const ops = DEFAULT_15_QUESTIONS.map(q => ({
      updateOne: {
        filter: { questionNumber: q.questionNumber },
        update: { $set: q },
        upsert: true
      }
    }));

    const res = await AhpFuzzyQuestion.bulkWrite(ops);
    const added = res.upsertedCount || 0;
    const updated = res.modifiedCount || 0;
    console.log(`✅ AHP + Fuzzy Logic 15 Default Questions seeded (Easy/Medium/Hard): ${added} added, ${updated} updated.`);
  } catch (err) {
    console.error("Error seeding AHP + Fuzzy questions:", err.message);
  }
};

module.exports = { seedAhpFuzzyQuestions, DEFAULT_15_QUESTIONS };
