const CollegeStudentProfile = require("../models/CollegeStudentProfile");
const CollegeCareerCatalog = require("../models/CollegeCareerCatalog");
const Recommendation = require("../models/Recommendation");
const StudentSkillProgress = require("../models/StudentSkillProgress");
const AhpFuzzyResult = require("../models/AhpFuzzyResult");

// Helper: Calculate Multi-Dimensional Match & Explanations
const evaluateCareerMatch = (profile, career) => {
  let score = 50; // Base score baseline

  const userField = (profile.field || "").toLowerCase();
  const userDegree = (profile.degreeProgramme || "").toLowerCase();
  const userDomain = (profile.domain || "").toLowerCase();
  const userSpec = (profile.specialization || "").toLowerCase();
  const userSkills = (profile.skills || []).map(s => s.toLowerCase());
  const userInterests = [
    ...(profile.careerInterests || []),
    ...(profile.academicInterests || [])
  ].map(i => i.toLowerCase());
  const userSubjects = (profile.subjects || []).map(s => s.toLowerCase());
  const userProjects = profile.projects || [];
  const userCGPA = parseFloat(profile.cgpa) || 7.5;
  const userAssessment = profile.grokAssessmentScore || 75;

  const whyFits = [];
  const skillsToImprove = [];

  // 1. Academic Relevance (25% Weight Max)
  let academicScore = 0;
  const reqFields = (career.requiredFields || []).map(f => f.toLowerCase());
  const reqDegrees = (career.requiredDegrees || []).map(d => d.toLowerCase());
  const reqDomains = (career.requiredDomains || []).map(d => d.toLowerCase());
  const reqSpecs = (career.requiredSpecializations || []).map(s => s.toLowerCase());

  if (reqFields.includes(userField) || reqFields.length === 0) {
    academicScore += 8;
  }
  if (reqDegrees.some(d => userDegree.includes(d) || d.includes(userDegree))) {
    academicScore += 8;
    whyFits.push(`Relevant degree program (${profile.degreeProgramme})`);
  }
  if (reqDomains.some(d => userDomain.includes(d) || d.includes(userDomain))) {
    academicScore += 6;
    whyFits.push(`Matching academic domain (${profile.domain})`);
  }
  if (reqSpecs.some(s => userSpec.includes(s) || s.includes(userSpec))) {
    academicScore += 3;
    whyFits.push(`Specialization alignment (${profile.specialization})`);
  }
  if (userCGPA >= 8.0) {
    whyFits.push(`Strong academic standing (CGPA ${userCGPA})`);
  }
  score += academicScore;

  // 2. Skill Alignment (25% Weight Max)
  const reqSkills = career.requiredSkills || [];
  const matchedSkills = [];
  const skillGaps = [];

  reqSkills.forEach(reqSkill => {
    const rLower = reqSkill.toLowerCase();
    const isMatched = userSkills.some(uSkill => uSkill.includes(rLower) || rLower.includes(uSkill));
    if (isMatched) {
      matchedSkills.push(reqSkill);
    } else {
      skillGaps.push(reqSkill);
    }
  });

  if (matchedSkills.length > 0) {
    whyFits.push(`Strong match in core skills (${matchedSkills.slice(0, 3).join(', ')})`);
  }
  skillGaps.forEach(sg => {
    skillsToImprove.push(sg);
  });

  if (reqSkills.length > 0) {
    const skillRatio = matchedSkills.length / reqSkills.length;
    score += Math.round(skillRatio * 25);
  } else {
    score += 15;
  }

  // 3. Interest Match (20% Weight Max)
  const careerTitle = career.title.toLowerCase();
  const careerCat = career.category.toLowerCase();
  const interestMatch = userInterests.some(int =>
    int.includes(careerTitle) || careerTitle.includes(int) || int.includes(careerCat)
  );
  if (interestMatch) {
    score += 20;
    whyFits.push(`High interest alignment with ${career.category} field`);
  } else {
    score += 5;
  }

  // 4. Assessment Performance (15% Weight Max)
  if (userAssessment >= 80) {
    score += 15;
    whyFits.push(`Strong analytical assessment performance (${userAssessment}%)`);
  } else if (userAssessment >= 65) {
    score += 10;
  } else {
    score += 5;
  }

  // 5. Subject & Project Match (15% Weight Max)
  let projectMatch = false;
  userProjects.forEach(proj => {
    const pStr = `${proj.title || ''} ${proj.techStack || ''} ${proj.description || ''}`.toLowerCase();
    if (pStr.includes(careerTitle) || pStr.includes(careerCat) || matchedSkills.some(s => pStr.includes(s.toLowerCase()))) {
      projectMatch = true;
    }
  });

  if (projectMatch) {
    score += 15;
    whyFits.push(`Practical project experience related to role`);
  } else if (userSubjects.some(sub => (career.suggestedSubjects || []).some(s => s.toLowerCase().includes(sub) || sub.includes(s.toLowerCase())))) {
    score += 10;
    whyFits.push(`Active coursework alignment`);
  } else {
    score += 5;
  }

  // Ensure whyFits has at least 2 items
  if (whyFits.length === 0) {
    whyFits.push(`Academic foundation in ${profile.degreeProgramme || 'your discipline'}`);
  }
  if (whyFits.length === 1) {
    whyFits.push(`Growth potential in ${career.category}`);
  }

  // Final Clamped Score Percentage (60% - 98%)
  const matchPercentage = Math.min(98, Math.max(60, score));

  // Match Classification Category
  let matchCategory = "Worth Exploring";
  if (matchPercentage >= 90) matchCategory = "Best Match";
  else if (matchPercentage >= 80) matchCategory = "Strong Match";
  else if (matchPercentage >= 70) matchCategory = "Good Match";
  else if (matchPercentage >= 60) matchCategory = "Potential Match";

  const explanation = `${career.title} is a ${matchCategory.toLowerCase()} (${matchPercentage}%) based on your ${profile.degreeProgramme || profile.field} background, skill profile, and career interests.`;

  return {
    careerId: career._id,
    title: career.title,
    slug: career.slug,
    category: career.category,
    shortDescription: career.shortDescription,
    typicalWorkArea: career.typicalWorkArea,
    matchPercentage,
    matchCategory,
    explanation,
    whyFits: [...new Set(whyFits)],
    skillsToImprove: [...new Set(skillsToImprove)],
    matchedSkills,
    skillGaps,
    suggestedSubjects: career.suggestedSubjects || [],
    suggestedNextSteps: career.suggestedNextSteps || [],
    relatedDegrees: career.relatedDegrees || [],
    workSectors: career.workSectors || [],
    growthOutlook: career.growthOutlook
  };
};

const ROLE_SPECIALIZED_DATA = {
  "artificial intelligence & machine learning": {
    coreSkills: [
      { name: "Python for AI & Data Science", suggestedProficiency: "Advanced" },
      { name: "Machine Learning & Scikit-Learn", suggestedProficiency: "Advanced" },
      { name: "Linear Algebra, Probability & Statistics", suggestedProficiency: "Advanced" },
      { name: "Deep Learning (PyTorch / TensorFlow)", suggestedProficiency: "Advanced" },
      { name: "SQL & Relational Databases", suggestedProficiency: "Advanced" }
    ],
    advancedSkills: [
      { name: "Computer Vision & OpenCV", suggestedProficiency: "Intermediate" },
      { name: "Natural Language Processing (NLP)", suggestedProficiency: "Intermediate" },
      { name: "Neural Network Architecture & Tuning", suggestedProficiency: "Intermediate" }
    ],
    optionalSkills: [
      { name: "MLOps & Model Deployment (FastAPI/Docker)", suggestedProficiency: "Basic" },
      { name: "Generative AI & LLM Prompting/Fine-tuning", suggestedProficiency: "Basic" }
    ]
  },
  "ai & machine learning": {
    coreSkills: [
      { name: "Python for AI & Data Science", suggestedProficiency: "Advanced" },
      { name: "Machine Learning & Scikit-Learn", suggestedProficiency: "Advanced" },
      { name: "Linear Algebra, Probability & Statistics", suggestedProficiency: "Advanced" },
      { name: "Deep Learning (PyTorch / TensorFlow)", suggestedProficiency: "Advanced" },
      { name: "SQL & Relational Databases", suggestedProficiency: "Advanced" }
    ],
    advancedSkills: [
      { name: "Computer Vision & OpenCV", suggestedProficiency: "Intermediate" },
      { name: "Natural Language Processing (NLP)", suggestedProficiency: "Intermediate" }
    ],
    optionalSkills: [
      { name: "MLOps & Model Deployment", suggestedProficiency: "Basic" }
    ]
  },
  "full stack web development": {
    coreSkills: [
      { name: "JavaScript / ES6 & Modern Web", suggestedProficiency: "Advanced" },
      { name: "Frontend Development (React.js / HTML / CSS)", suggestedProficiency: "Advanced" },
      { name: "Backend Architecture (Node.js & Express.js)", suggestedProficiency: "Advanced" },
      { name: "Database Engineering (MongoDB & SQL)", suggestedProficiency: "Advanced" },
      { name: "Object-Oriented Programming (Java / Python)", suggestedProficiency: "Advanced" }
    ],
    advancedSkills: [
      { name: "REST API Design & Integration", suggestedProficiency: "Intermediate" },
      { name: "State Management & Component Architecture", suggestedProficiency: "Intermediate" }
    ],
    optionalSkills: [
      { name: "Git, GitHub & CI/CD Deployment", suggestedProficiency: "Basic" }
    ]
  },
  "software engineer": {
    coreSkills: [
      { name: "Data Structures & Algorithms", suggestedProficiency: "Advanced" },
      { name: "Object-Oriented Programming (Java / Python / C++)", suggestedProficiency: "Advanced" },
      { name: "Relational & NoSQL Databases (SQL / MongoDB)", suggestedProficiency: "Advanced" },
      { name: "Web & API Engineering (Node.js / React)", suggestedProficiency: "Advanced" },
      { name: "Operating Systems & Networking Fundamentals", suggestedProficiency: "Advanced" }
    ],
    advancedSkills: [
      { name: "System Design & Microservices", suggestedProficiency: "Intermediate" },
      { name: "Version Control (Git & GitHub)", suggestedProficiency: "Intermediate" }
    ],
    optionalSkills: [
      { name: "Cloud Services & Docker", suggestedProficiency: "Basic" }
    ]
  },
  "cyber security & information assurance": {
    coreSkills: [
      { name: "Network Security & Protocols", suggestedProficiency: "Advanced" },
      { name: "Ethical Hacking & Penetration Testing", suggestedProficiency: "Advanced" },
      { name: "Linux Security & Scripting (Python/Bash)", suggestedProficiency: "Advanced" },
      { name: "Cryptography & Data Encryption", suggestedProficiency: "Advanced" },
      { name: "Security Audit Tools (Wireshark / Nmap)", suggestedProficiency: "Advanced" }
    ],
    advancedSkills: [
      { name: "SIEM & Threat Intelligence", suggestedProficiency: "Intermediate" },
      { name: "Web Application Security (OWASP Top 10)", suggestedProficiency: "Intermediate" }
    ],
    optionalSkills: [
      { name: "Cloud Security & Identity Management", suggestedProficiency: "Basic" }
    ]
  },
  "robotics engineer": {
    coreSkills: [
      { name: "Robot Operating System (ROS)", suggestedProficiency: "Advanced" },
      { name: "C++ & Python for Robotics", suggestedProficiency: "Advanced" },
      { name: "Microcontrollers & Embedded C", suggestedProficiency: "Advanced" },
      { name: "Kinematics & Dynamics", suggestedProficiency: "Advanced" },
      { name: "Control Systems & PID Tuning", suggestedProficiency: "Advanced" }
    ],
    advancedSkills: [
      { name: "Computer Vision & OpenCV", suggestedProficiency: "Intermediate" },
      { name: "SLAM & Path Planning (A*/Dijkstra)", suggestedProficiency: "Intermediate" },
      { name: "Sensor Interfacing (LiDAR, IMU, Encoders)", suggestedProficiency: "Intermediate" },
      { name: "Actuators & Motor Drives", suggestedProficiency: "Intermediate" }
    ],
    optionalSkills: [
      { name: "MATLAB & Simulink", suggestedProficiency: "Basic" },
      { name: "SolidWorks 3D Modeling", suggestedProficiency: "Basic" },
      { name: "Gazebo / Webots Simulation", suggestedProficiency: "Basic" },
      { name: "RTOS & Hardware Debugging", suggestedProficiency: "Basic" }
    ],
    roadmapItems: [
      {
        phase: "Phase 1: Robotics Fundamentals & Embedded Control",
        title: "C++, Microcontrollers & Circuit Interfacing",
        description: "Master embedded programming, GPIO control, ADC, timers, interrupts, and fundamental circuit theory.",
        items: ["Embedded C / C++", "Microcontrollers (Arduino / STM32 / ESP32)", "Circuit Theory & Sensor Interfacing", "Actuators & Motor Drivers"],
        defaultStatus: "completed"
      },
      {
        phase: "Phase 2: ROS, Kinematics & Simulation",
        title: "Robot Operating System & Mechanism Dynamics",
        description: "Build robotic nodes, define URDF models, simulate in Gazebo, and compute forward/inverse kinematics.",
        items: ["Robot Operating System (ROS 2)", "Forward & Inverse Kinematics", "Gazebo Simulation & RViz", "Control Systems & PID Tuning"],
        defaultStatus: "current"
      },
      {
        phase: "Phase 3: Autonomous Navigation & Vision",
        title: "Perception, SLAM & Path Planning",
        description: "Integrate camera vision, LiDAR point clouds, 2D/3D SLAM mapping, and obstacle avoidance algorithms.",
        items: ["Computer Vision (OpenCV)", "2D LiDAR SLAM (Cartographer / Gmapping)", "Path Planning (Nav2)", "Sensor Fusion (EKF)"],
        defaultStatus: "upcoming"
      },
      {
        phase: "Phase 4: Hardware Prototyping & Placement",
        title: "Autonomous Robotics Capstone & Industrial Interview",
        description: "Construct a physical differential drive rover or robotic arm and prepare technical interview defense.",
        items: ["Complete Physical Autonomous Mobile Robot Prototype", "ROS2 Industrial Package Certification", "Robotics System Defense Interview"],
        defaultStatus: "upcoming"
      }
    ]
  },
  "electrical engineer": {
    coreSkills: [
      { name: "Circuit Theory & Network Analysis", suggestedProficiency: "Advanced" },
      { name: "Electrical Machines (Transformers & Motors)", suggestedProficiency: "Advanced" },
      { name: "Power Systems Analysis & High Voltage", suggestedProficiency: "Advanced" },
      { name: "MATLAB & Simulink", suggestedProficiency: "Advanced" },
      { name: "Analog & Digital Electronics", suggestedProficiency: "Advanced" }
    ],
    advancedSkills: [
      { name: "Power Electronics Converters & Inverters", suggestedProficiency: "Intermediate" },
      { name: "PLC & SCADA Industrial Automation", suggestedProficiency: "Intermediate" },
      { name: "Microcontrollers & Embedded C", suggestedProficiency: "Intermediate" },
      { name: "Switchgear & Power Protection", suggestedProficiency: "Intermediate" }
    ],
    optionalSkills: [
      { name: "AutoCAD Electrical", suggestedProficiency: "Basic" },
      { name: "ETAP Power System Simulation", suggestedProficiency: "Basic" },
      { name: "PCB Design (KiCad / Altium)", suggestedProficiency: "Basic" },
      { name: "EV Powertrain & Battery Management", suggestedProficiency: "Basic" }
    ],
    roadmapItems: [
      {
        phase: "Phase 1: Circuit & Machines Foundations",
        title: "Network Theorems & Machine Physics",
        description: "Deep dive into Kirchhoff laws, AC steady state, transformer equivalent circuits, and DC/AC machines.",
        items: ["Circuit Theory & Network Theorems", "DC & Induction Machines", "Analog Circuit Design", "MATLAB Simulation"],
        defaultStatus: "completed"
      },
      {
        phase: "Phase 2: Power Systems & Transmission",
        title: "Generation, Transmission & High Voltage",
        description: "Analyze bus admittance matrices, symmetrical components, transmission line models, and fault protection.",
        items: ["Power Systems Load Flow", "Fault Analysis & Symmetrical Components", "Switchgear & Protective Relays", "ETAP Simulation"],
        defaultStatus: "current"
      },
      {
        phase: "Phase 3: Power Electronics & Industrial Drives",
        title: "Semiconductor Switching & Motor Speed Control",
        description: "Design DC-DC buck/boost converters, PWM inverters, V/f induction motor drives, and PLC automation ladders.",
        items: ["Power Electronics Converters", "VFD Motor Drives", "PLC & SCADA Programming", "Microcontroller Interfacing"],
        defaultStatus: "upcoming"
      },
      {
        phase: "Phase 4: EV Systems, Smart Grid & Placement",
        title: "Modern Energy Systems & Technical Readiness",
        description: "Master BMS battery architecture, grid-tied solar inverters, and prepare for core engineering placement.",
        items: ["Electric Vehicle Powertrain / BMS", "Smart Grid & Solar Inverter Design", "Core Electrical Technical Interview"],
        defaultStatus: "upcoming"
      }
    ]
  },
  "mechanical engineer": {
    coreSkills: [
      { name: "SolidWorks / AutoCAD 3D CAD", suggestedProficiency: "Advanced" },
      { name: "Thermodynamics & Heat Transfer", suggestedProficiency: "Advanced" },
      { name: "Fluid Mechanics & Machinery", suggestedProficiency: "Advanced" },
      { name: "Strength of Materials & Mechanics", suggestedProficiency: "Advanced" },
      { name: "Engineering Mechanics & Kinematics", suggestedProficiency: "Advanced" }
    ],
    advancedSkills: [
      { name: "Finite Element Analysis (ANSYS FEA)", suggestedProficiency: "Intermediate" },
      { name: "GD&T & Manufacturing Engineering", suggestedProficiency: "Intermediate" },
      { name: "Kinematics & Machine Element Design", suggestedProficiency: "Intermediate" },
      { name: "Hydraulics & Pneumatics Control", suggestedProficiency: "Intermediate" }
    ],
    optionalSkills: [
      { name: "Computational Fluid Dynamics (CFD)", suggestedProficiency: "Basic" },
      { name: "MATLAB / Python for Engineering", suggestedProficiency: "Basic" },
      { name: "CNC Programming & G-Codes", suggestedProficiency: "Basic" },
      { name: "Additive Manufacturing (3D Printing)", suggestedProficiency: "Basic" }
    ],
    roadmapItems: [
      {
        phase: "Phase 1: Mechanics & CAD Foundations",
        title: "Statics, Strength of Materials & 3D Modeling",
        description: "Master stress-strain tensors, bending moments, Mohr circle, and parametric 3D CAD modeling.",
        items: ["Strength of Materials & Stress Analysis", "SolidWorks 3D Modeling", "Engineering Mechanics", "Material Science & Metallurgy"],
        defaultStatus: "completed"
      },
      {
        phase: "Phase 2: Thermal-Fluids & Machine Design",
        title: "Thermodynamics, Fluid Dynamics & Element Sizing",
        description: "Analyze power cycles, pumps/turbines, gears, shafts, bearings, and heat exchangers.",
        items: ["Applied Thermodynamics", "Fluid Machinery & Pumps", "Design of Machine Elements", "Heat Transfer Analysis"],
        defaultStatus: "current"
      },
      {
        phase: "Phase 3: Simulation & Manufacturing Engineering",
        title: "ANSYS FEA, CFD & Precision Machining",
        description: "Run structural FEA simulations, fluid flow CFD, and master GD&T for production drawing approval.",
        items: ["ANSYS Mechanical FEA", "GD&T Standards (ASME Y14.5)", "CNC Machining & CAM", "Hydraulics & Pneumatics"],
        defaultStatus: "upcoming"
      },
      {
        phase: "Phase 4: Capstone Mechanism & Industrial Placement",
        title: "Automotive / Automation Product Build & Interview",
        description: "Fabricate a functional mechanism, complete simulation stress reports, and pass core technical interviews.",
        items: ["Functional Mechanism Design & Fabrication", "Certified SOLIDWORKS Associate (CSWA)", "Core Mechanical Technical Assessment"],
        defaultStatus: "upcoming"
      }
    ]
  },
  "civil engineer": {
    coreSkills: [
      { name: "Structural Analysis & Mechanics", suggestedProficiency: "Advanced" },
      { name: "AutoCAD & Revit BIM Modeling", suggestedProficiency: "Advanced" },
      { name: "Soil Mechanics & Foundation Engineering", suggestedProficiency: "Advanced" },
      { name: "Concrete Technology & RCC Design", suggestedProficiency: "Advanced" },
      { name: "Surveying & Total Station", suggestedProficiency: "Advanced" }
    ],
    advancedSkills: [
      { name: "STAAD Pro / ETABS Structural Modeling", suggestedProficiency: "Intermediate" },
      { name: "Design of Steel & Pre-stressed Structures", suggestedProficiency: "Intermediate" },
      { name: "Hydraulics & Water Resources", suggestedProficiency: "Intermediate" },
      { name: "Construction Project Management (CPM/PERT)", suggestedProficiency: "Intermediate" }
    ],
    optionalSkills: [
      { name: "GIS & Remote Sensing (ArcGIS)", suggestedProficiency: "Basic" },
      { name: "MS Project / Primavera Scheduling", suggestedProficiency: "Basic" },
      { name: "Environmental Impact Assessment", suggestedProficiency: "Basic" },
      { name: "Geotechnical Site Instrumentation", suggestedProficiency: "Basic" }
    ],
    roadmapItems: [
      {
        phase: "Phase 1: Structural Mechanics & Surveying",
        title: "Solid Mechanics, Concrete & Surveying",
        description: "Analyze determinate trusses, concrete mix designs, leveling, and 2D AutoCAD drafting.",
        items: ["Mechanics of Solids", "Concrete Technology & Lab", "Surveying & Leveling", "AutoCAD Drafting"],
        defaultStatus: "completed"
      },
      {
        phase: "Phase 2: Indeterminate Analysis & Soil Mechanics",
        title: "STAAD Pro, Foundations & Hydraulics",
        description: "Compute frame slope-deflection, bearing capacity of shallow/deep foundations, and pipe flow.",
        items: ["Structural Analysis (STAAD Pro)", "Soil Mechanics & Geotechnical Eng", "Hydraulics & Open Channel Flow", "Reinforced Concrete Design"],
        defaultStatus: "current"
      },
      {
        phase: "Phase 3: Advanced Structural & BIM Modeling",
        title: "ETABS, Steel Design & BIM Coordination",
        description: "Model multi-story earthquake-resistant buildings and integrate architectural Revit BIM models.",
        items: ["ETABS High-Rise Modeling", "Design of Steel Structures (IS 800)", "Revit BIM Modeling", "Construction Project Management"],
        defaultStatus: "upcoming"
      },
      {
        phase: "Phase 4: Capstone Structural Project & Placement",
        title: "Complete Structural Drawing Package & Site Defense",
        description: "Produce structural calculation reports, bar bending schedules, and pass civil engineering placement rounds.",
        items: ["Multi-Storey Building Structural Design", "Bar Bending & Cost Estimation", "PWD / Private Infrastructure Placement Prep"],
        defaultStatus: "upcoming"
      }
    ]
  },
  "embedded systems engineer": {
    coreSkills: [
      { name: "Embedded C / C++", suggestedProficiency: "Advanced" },
      { name: "Microcontrollers (ARM Cortex, STM32, ESP32)", suggestedProficiency: "Advanced" },
      { name: "Communication Protocols (I2C, SPI, UART, CAN)", suggestedProficiency: "Advanced" },
      { name: "RTOS (FreeRTOS Architecture)", suggestedProficiency: "Advanced" },
      { name: "Circuit Debugging (Oscilloscope, Logic Analyzer)", suggestedProficiency: "Advanced" }
    ],
    advancedSkills: [
      { name: "Embedded Linux & Device Drivers", suggestedProficiency: "Intermediate" },
      { name: "PCB Design & Schematic Layout (Altium/KiCad)", suggestedProficiency: "Intermediate" },
      { name: "IoT Protocols (MQTT, BLE, CoAP)", suggestedProficiency: "Intermediate" },
      { name: "Firmware Architecture & Bootloaders", suggestedProficiency: "Intermediate" }
    ],
    optionalSkills: [
      { name: "FPGA & Verilog / VHDL", suggestedProficiency: "Basic" },
      { name: "MATLAB Embedded Coder", suggestedProficiency: "Basic" },
      { name: "Hardware Security & Bootloaders", suggestedProficiency: "Basic" }
    ],
    roadmapItems: [
      {
        phase: "Phase 1: C & Bare-Metal Microcontrollers",
        title: "Bare-Metal Registers & Peripheral Drivers",
        description: "Write bare-metal register drivers for timers, interrupts, ADC, and UART without vendor libraries.",
        items: ["Embedded C Programming", "ARM Cortex-M Architecture", "Bare-Metal Peripheral Drivers", "Hardware Debugging (JTAG/SWD)"],
        defaultStatus: "completed"
      },
      {
        phase: "Phase 2: RTOS & Bus Protocols",
        title: "FreeRTOS Multithreading & Sensor Communication",
        description: "Implement preemptive task scheduling, semaphores, queues, and communicate over I2C, SPI, and CAN bus.",
        items: ["FreeRTOS Task Scheduling & Mutexes", "I2C, SPI & CAN Bus Protocols", "Sensors & Actuator Interfacing", "Power Optimization & Sleep Modes"],
        defaultStatus: "current"
      },
      {
        phase: "Phase 3: IoT & Embedded Linux",
        title: "Connected Devices & Linux Kernel Drivers",
        description: "Build Wi-Fi/BLE connected nodes with MQTT encryption and write custom Linux character device drivers.",
        items: ["ESP32 Wi-Fi & BLE Stack", "Embedded Linux (Yocto / Raspberry Pi)", "Linux Device Drivers", "KiCad PCB Design"],
        defaultStatus: "upcoming"
      },
      {
        phase: "Phase 4: Production Firmware & Placement",
        title: "Secure OTA Bootloader & Technical Interview",
        description: "Develop a dual-bank secure OTA bootloader and master hardware-firmware placement interview questions.",
        items: ["Secure Dual-Bank Bootloader", "Automotive CAN Diagnostic Tool", "Embedded Firmware Placement Assessment"],
        defaultStatus: "upcoming"
      }
    ]
  }
};

const SKILL_RESOURCE_MAP = {
  "robot operating system (ros)": {
    course: "ROS 2 Basics & Robot Navigation",
    provider: "ConstructSim & ROS.org",
    duration: "3-4 Weeks",
    url: "https://docs.ros.org/en/humble/Tutorials.html",
    overview: "Master ROS2 nodes, topics, publishers, subscribers, services, and URDF robot description files."
  },
  "c++ & python for robotics": {
    course: "Modern C++ for Robotics & Embedded Systems",
    provider: "LearnCpp & NPTEL",
    duration: "3 Weeks",
    url: "https://www.learncpp.com/",
    overview: "Object-oriented C++, pointers, memory management, and Python bindings used in robotic autonomy."
  },
  "c++ programming": {
    course: "Modern C++ Programming (OOP & Data Structures)",
    provider: "NPTEL / IIT Kharagpur",
    duration: "4 Weeks",
    url: "https://nptel.ac.in/courses/106105151",
    overview: "C++ syntax, templates, standard template library (STL), and memory-efficient algorithms."
  },
  "microcontrollers & embedded c": {
    course: "Microprocessors and Microcontrollers Architecture",
    provider: "NPTEL / IIT Madras",
    duration: "4 Weeks",
    url: "https://nptel.ac.in/courses/108105102",
    overview: "Register-level programming, timers, interrupts, ADC converters, and peripheral interfacing."
  },
  "kinematics & dynamics": {
    course: "Robotics: Kinematics and Mathematical Modeling",
    provider: "Coursera (UPenn / Northwestern)",
    duration: "3 Weeks",
    url: "https://www.coursera.org/learn/robotics-kinematics",
    overview: "Forward kinematics, Denavit-Hartenberg (DH) parameters, inverse kinematics, and Jacobian matrices."
  },
  "control systems & pid tuning": {
    course: "Control Engineering & PID Feedback Control",
    provider: "NPTEL / IIT Delhi",
    duration: "3 Weeks",
    url: "https://nptel.ac.in/courses/108102043",
    overview: "Transfer functions, Bode plots, Root Locus, Nyquist stability, and PID gain tuning."
  },
  "circuit theory & network analysis": {
    course: "Basic Electrical Circuits & Network Analysis",
    provider: "NPTEL / IIT Madras",
    duration: "4 Weeks",
    url: "https://nptel.ac.in/courses/108106172",
    overview: "Kirchhoff laws, Thevenin/Norton theorems, transient AC/DC analysis, and two-port networks."
  },
  "electrical machines (transformers & motors)": {
    course: "Electrical Machines (Transformers, DC & Induction)",
    provider: "NPTEL / IIT Roorkee",
    duration: "4 Weeks",
    url: "https://nptel.ac.in/courses/108107159",
    overview: "Magnetic circuits, single/three phase transformers, DC motors, and 3-phase induction motors."
  },
  "power systems analysis & high voltage": {
    course: "Power System Engineering & Fault Analysis",
    provider: "NPTEL / IIT Delhi",
    duration: "4 Weeks",
    url: "https://nptel.ac.in/courses/108102047",
    overview: "Transmission line parameters, load flow algorithms, symmetrical faults, and protective switchgear."
  },
  "matlab & simulink": {
    course: "MATLAB Onramp & Control Systems Modeling",
    provider: "MathWorks Training",
    duration: "2 Weeks",
    url: "https://matlabacademy.mathworks.com/",
    overview: "Interactive mathematical modeling, matrix computing, and Simulink block diagram simulation."
  },
  "power electronics converters & inverters": {
    course: "Fundamentals of Power Electronics",
    provider: "NPTEL / IIT Bombay",
    duration: "4 Weeks",
    url: "https://nptel.ac.in/courses/108101038",
    overview: "Thyristors, MOSFETs, DC-DC buck/boost converters, single/three phase PWM inverters."
  },
  "solidworks / autocad 3d cad": {
    course: "SolidWorks Mechanical Design Associate Training",
    provider: "Coursera / Dassault Systèmes",
    duration: "3 Weeks",
    url: "https://www.coursera.org/learn/solidworks",
    overview: "Parametric sketches, 3D extrusions, sweeps, lofts, assemblies, and engineering 2D drawings."
  },
  "thermodynamics & heat transfer": {
    course: "Applied Thermodynamics & Heat Transfer",
    provider: "NPTEL / IIT Kharagpur",
    duration: "4 Weeks",
    url: "https://nptel.ac.in/courses/112105123",
    overview: "First & Second Laws, Carnot cycle, Rankine/Brayton cycles, conduction, convection, radiation."
  },
  "fluid mechanics & machinery": {
    course: "Fluid Mechanics & Turbo Machines",
    provider: "NPTEL / IIT Kanpur",
    duration: "4 Weeks",
    url: "https://nptel.ac.in/courses/112104118",
    overview: "Fluid statics, Bernoulli equation, laminar/turbulent flow, boundary layers, pumps, and turbines."
  },
  "structural analysis & mechanics": {
    course: "Structural Analysis & Matrix Methods",
    provider: "NPTEL / IIT Roorkee",
    duration: "4 Weeks",
    url: "https://nptel.ac.in/courses/105107122",
    overview: "Moment distribution method, slope-deflection, truss analysis, and influence lines."
  },
  "autocad & revit bim modeling": {
    course: "BIM and Architectural Modeling with Autodesk Revit",
    provider: "Autodesk Design Academy",
    duration: "3 Weeks",
    url: "https://academy.autodesk.com/",
    overview: "3D BIM structural modeling, floor plans, sections, and multidisciplinary coordination."
  },
  "embedded c / c++": {
    course: "Embedded C Programming for ARM Cortex",
    provider: "NPTEL / FastBit Embedded",
    duration: "4 Weeks",
    url: "https://nptel.ac.in/courses/108105102",
    overview: "Bit manipulation, pointer arithmetic, memory-mapped I/O, volatile qualifiers, and linker scripts."
  }
};

function getLearningResourceForSkill(skillName, careerTitle) {
  const sLower = (skillName || "").toLowerCase().trim();
  for (const [key, res] of Object.entries(SKILL_RESOURCE_MAP)) {
    if (sLower.includes(key) || key.includes(sLower)) {
      return res;
    }
  }
  return {
    course: `${skillName} Industry Skill Accelerator`,
    provider: "NPTEL / Coursera Academic Partnership",
    duration: "3-4 Weeks",
    url: `https://www.google.com/search?q=${encodeURIComponent(skillName + " tutorial course nptel")}`,
    overview: `Structured learning modules covering fundamental principles, hands-on lab exercises, and placement application for ${careerTitle || 'Engineering'}.`
  };
}

// ── 5-QUESTION DOMAIN TECHNICAL ASSESSMENT REGISTRY ─────────────────────────
const SKILL_ASSESSMENT_BANK = {
  "robot operating system (ros)": [
    {
      id: "ros_q1",
      question: "In ROS 2, which underlying communication middleware layer replaces the centralized 'roscore' master from ROS 1?",
      options: ["Data Distribution Service (DDS)", "Remote Procedure Call (gRPC)", "WebSockets Protocol", "ZeroMQ Broker"],
      correctIndex: 0,
      topic: "ROS2 Architecture",
      explanation: "ROS 2 adopts OMG Data Distribution Service (DDS) as its decentralized discovery and publish/subscribe communication layer, eliminating the single point of failure (roscore)."
    },
    {
      id: "ros_q2",
      question: "Which ROS communication paradigm is strictly asynchronous, many-to-many, and ideal for continuous sensor data streams?",
      options: ["Services", "Actions", "Topics", "Parameters"],
      correctIndex: 2,
      topic: "ROS Communication Primitives",
      explanation: "ROS Topics use unidirectional publish/subscribe messaging best suited for continuous streaming data such as LiDAR, odometry, and camera frames."
    },
    {
      id: "ros_q3",
      question: "In robot modeling with URDF (Unified Robot Description Format), which joint type allows rotational motion bounded by minimum and maximum angle limits?",
      options: ["Continuous", "Revolute", "Prismatic", "Planar"],
      correctIndex: 1,
      topic: "URDF Kinematic Modeling",
      explanation: "A 'revolute' joint rotates around an axis with defined upper and lower angle limits. A 'continuous' joint can rotate indefinitely without limits."
    },
    {
      id: "ros_q4",
      question: "When is a ROS Action preferred over a ROS Service?",
      options: ["When sending quick instant sensor updates", "When executing long-running robot tasks that require continuous feedback and cancellation capability", "When loading read-only configuration parameters", "When logging debugging statements to terminal"],
      correctIndex: 1,
      topic: "ROS Actions",
      explanation: "Actions are built on goal, feedback, and result topics, allowing clients to track execution progress and cancel long-running behaviors (such as autonomous navigation to a waypoint)."
    },
    {
      id: "ros_q5",
      question: "What is the primary role of the 'tf2' transform library in ROS and ROS 2?",
      options: ["To compress video streams from stereo cameras", "To track multiple coordinate frames over time and compute geometric coordinate transforms", "To generate motor PWM duty cycles", "To compile C++ nodes into binary executables"],
      correctIndex: 1,
      topic: "Coordinate Frame Transforms (tf2)",
      explanation: "tf2 maintains a tree of coordinate frames (e.g. world -> odom -> base_link -> laser_frame) over time, allowing nodes to transform 3D points and vectors between frames."
    }
  ],

  "c++ & python for robotics": [
    {
      id: "cpp_q1",
      question: "In modern C++ (C++11 and later), which smart pointer guarantees strict, exclusive ownership of a dynamically allocated heap object?",
      options: ["std::shared_ptr", "std::unique_ptr", "std::weak_ptr", "std::auto_ptr"],
      correctIndex: 1,
      topic: "C++ Memory Management",
      explanation: "std::unique_ptr enforces exclusive ownership with zero runtime overhead over raw pointers and automatically frees the managed resource when it goes out of scope."
    },
    {
      id: "cpp_q2",
      question: "Why should an abstract base class containing virtual methods always declare a virtual destructor in C++?",
      options: ["To allow private variables to be serialized", "To ensure derived class destructors are properly invoked when deleting through a base class pointer", "To prevent linker errors during compilation", "To allocate the object on the CPU register stack"],
      correctIndex: 1,
      topic: "Polymorphism & Object Lifecycle",
      explanation: "Deleting an object of a derived class via a pointer to base without a virtual destructor results in undefined behavior and memory/resource leaks."
    },
    {
      id: "cpp_q3",
      question: "In robotics C++ programming, what core principle does RAII (Resource Acquisition Is Initialization) establish?",
      options: ["All objects must be managed by a background garbage collector", "Resource acquisition is tied to constructor execution and cleanup to destructor execution, guaranteeing leak-free scope cleanup", "Loops must be unrolled by the compiler", "Multi-core threads must run asynchronously"],
      correctIndex: 1,
      topic: "RAII Idiom",
      explanation: "RAII guarantees that resources (memory, mutex locks, file handles, socket descriptors) are tied to object lifetime and automatically released during scope exit."
    },
    {
      id: "cpp_q4",
      question: "Which Python numerical computation library provides the vectorized array operations and matrix algebra essential for robot kinematics and OpenCV?",
      options: ["NumPy", "Tkinter", "Requests", "Flask"],
      correctIndex: 0,
      topic: "Python Vectorization",
      explanation: "NumPy provides multidimensional arrays and pre-compiled C routines that enable high-speed vectorized matrix operations indispensable for robotics mathematics."
    },
    {
      id: "cpp_q5",
      question: "What is the computational time complexity of accessing an arbitrary element in an std::vector by index in C++?",
      options: ["O(log n)", "O(1)", "O(n)", "O(n log n)"],
      correctIndex: 1,
      topic: "C++ Data Structures",
      explanation: "std::vector stores elements in contiguous memory, providing constant time O(1) random access via pointer arithmetic."
    }
  ],

  "microcontrollers & embedded c": [
    {
      id: "mc_q1",
      question: "In Embedded C firmware, why is the 'volatile' qualifier applied to variables accessed inside an Interrupt Service Routine (ISR)?",
      options: ["To place the variable in Flash ROM memory", "To instruct the compiler optimizer not to cache the variable in CPU registers, forcing fresh reads from RAM", "To automatically encrypt the variable value", "To make the variable global across the network"],
      correctIndex: 1,
      topic: "Embedded C Optimization",
      explanation: "'volatile' informs the compiler that the variable's value can change unexpectedly (by an ISR or hardware register), preventing aggressive register caching optimizations."
    },
    {
      id: "mc_q2",
      question: "If a 12-bit ADC has a reference voltage of 3.3V, what analog voltage corresponds to an ADC conversion reading of 2048?",
      options: ["0.825 V", "1.65 V", "2.475 V", "3.3 V"],
      correctIndex: 1,
      topic: "Analog-to-Digital Conversion (ADC)",
      explanation: "A 12-bit ADC has 2^12 = 4096 levels. 2048 is exactly half-scale: (2048 / 4096) * 3.3V = 1.65V."
    },
    {
      id: "mc_q3",
      question: "In microcontroller hardware timers, what is the role of the Timer Prescaler?",
      options: ["To divide the system clock frequency into a slower, manageable timer tick rate", "To boost the operating voltage of digital pins", "To filter high-frequency analog noise", "To invert the direction of PWM pulses"],
      correctIndex: 0,
      topic: "Timers & Clock Division",
      explanation: "The prescaler divides the main CPU clock frequency by a configurable factor (e.g. 8, 64, 256), allowing timer registers to count at appropriate resolution and duration."
    },
    {
      id: "mc_q4",
      question: "Which synchronous serial communication protocol utilizes separate MOSI, MISO, SCK, and CS lines for full-duplex transmission?",
      options: ["UART", "I2C", "SPI", "CAN Bus"],
      correctIndex: 2,
      topic: "Embedded Communication Busses",
      explanation: "SPI (Serial Peripheral Interface) uses dedicated Master-Out-Slave-In, Master-In-Slave-Out, Serial Clock, and Chip Select lines for high-speed full-duplex communication."
    },
    {
      id: "mc_q5",
      question: "Why must blocking delays (such as delay_ms()) and heavy calculations be strictly avoided inside an Interrupt Service Routine (ISR)?",
      options: ["They erase Flash memory sectors", "They block lower or equal priority interrupts and compromise hard real-time system responsiveness", "They reverse the microcontroller phase locked loop", "They cause stack underflow exceptions"],
      correctIndex: 1,
      topic: "Interrupt Handling Best Practices",
      explanation: "ISRs execute in privileged interrupt context. Prolonged execution in an ISR blocks other critical real-time interrupts and risks deadline violations."
    }
  ],

  "kinematics & dynamics": [
    {
      id: "kin_q1",
      question: "In robotic manipulator kinematics, what four standard parameters are defined in the Denavit-Hartenberg (DH) convention?",
      options: ["Mass, Inertia, Center of Gravity, Friction", "Link length (a), Link twist (alpha), Link offset (d), Joint angle (theta)", "Roll, Pitch, Yaw, Linear velocity", "Motor torque, Angular acceleration, Damping ratio, Gear ratio"],
      correctIndex: 1,
      topic: "Denavit-Hartenberg Parameters",
      explanation: "The standard DH convention represents transformation between adjacent link coordinate frames using 4 geometric parameters: a (length), alpha (twist), d (offset), and theta (joint angle)."
    },
    {
      id: "kin_q2",
      question: "What is the operational difference between Forward Kinematics and Inverse Kinematics for a robotic arm?",
      options: ["Forward computes joint velocities; Inverse computes joint forces", "Forward computes end-effector pose from known joint angles; Inverse calculates joint angles required for a target end-effector pose", "Forward applies to mobile rovers; Inverse applies exclusively to drones", "Forward is iterative; Inverse is always single-step"],
      correctIndex: 1,
      topic: "Forward vs Inverse Kinematics",
      explanation: "Forward kinematics calculates the spatial position/orientation of the tool from given joint variables. Inverse kinematics solves the mathematical inverse to find joint angles to reach a desired coordinate."
    },
    {
      id: "kin_q3",
      question: "What is a kinematic 'Singularity' in a robotic manipulator?",
      options: ["The physical anchor point where the robot is bolted to the floor", "A configuration where the Jacobian matrix loses rank, causing the robot to lose degrees of freedom and requiring infinite joint velocities for certain end-effector directions", "The point of maximum payload capacity", "The initial zero calibration homing position"],
      correctIndex: 1,
      topic: "Jacobian Singularities",
      explanation: "A singularity occurs when the manipulator Jacobian loses rank. At singular configurations, mobility in one or more Cartesian directions is lost, and small Cartesian speeds require unbounded joint speeds."
    },
    {
      id: "kin_q4",
      question: "According to Grübler's criterion for planar mechanisms, what is the Mobility (Degrees of Freedom) of a standard closed planar 4-bar linkage with 4 revolute joints?",
      options: ["0 (Rigid Structure)", "1 DoF", "2 DoF", "3 DoF"],
      correctIndex: 1,
      topic: "Grübler Mechanism Mobility",
      explanation: "Using Grübler's equation M = 3(n - 1) - 2j1 - j2: with n = 4 links and j1 = 4 revolute joints, M = 3(3) - 2(4) = 9 - 8 = 1 DoF."
    },
    {
      id: "kin_q5",
      question: "Why are Unit Quaternions preferred over Euler Angles (Roll, Pitch, Yaw) for 3D rotations in robotic simulations?",
      options: ["Quaternions avoid Gimbal Lock and provide smooth spherical linear interpolation (SLERP)", "Quaternions require 6 floating-point values instead of 3", "Quaternions only work in 2D coordinate spaces", "Quaternions directly compute motor drive currents"],
      correctIndex: 0,
      topic: "Spatial Rotation Representation",
      explanation: "Euler angles suffer from Gimbal Lock (loss of 1 DoF when two rotation axes align). Unit quaternions represent 3D orientations without singularities and interpolate smoothly."
    }
  ],

  "control systems & pid tuning": [
    {
      id: "ctrl_q1",
      question: "In a closed-loop PID controller, what is the primary operational effect of increasing the Derivative gain (Kd)?",
      options: ["It eliminates steady-state error completely", "It anticipates error rate-of-change, improving system damping and reducing overshoot", "It multiplies the high-frequency steady-state gain indefinitely", "It converts the transfer function to an open-loop response"],
      correctIndex: 1,
      topic: "PID Controller Tuning",
      explanation: "The derivative term (Kd) reacts to the rate of error change, introducing predictive damping that counteracts rapid changes, reducing overshoot and settling time."
    },
    {
      id: "ctrl_q2",
      question: "In classical frequency response analysis, what do a positive Phase Margin (PM) and positive Gain Margin (GM) on a Bode plot signify?",
      options: ["The closed-loop feedback system is stable", "The closed-loop system is strictly unstable with unbounded oscillations", "The system has zero damping and oscillates continuously", "The open-loop transfer function has right-half-plane poles"],
      correctIndex: 0,
      topic: "Frequency Domain Stability",
      explanation: "A positive gain margin and positive phase margin indicate that additional gain or phase lag can be tolerated before the system reaches the verge of instability (0 dB at -180 degrees)."
    },
    {
      id: "ctrl_q3",
      question: "Which term in a PID controller is responsible for driving steady-state tracking error to zero under constant disturbance?",
      options: ["Proportional (Kp)", "Integral (Ki)", "Derivative (Kd)", "Feedforward (Kff)"],
      correctIndex: 1,
      topic: "Steady-State Error Elimination",
      explanation: "The Integral term (Ki) continuously accumulates past error over time, generating increasing control effort until the steady-state error is driven to zero."
    },
    {
      id: "ctrl_q4",
      question: "For a second-order feedback system G(s) = omega_n^2 / (s^2 + 2*zeta*omega_n*s + omega_n^2), what response behavior occurs when the damping ratio zeta < 1?",
      options: ["Overdamped (no oscillations, sluggish rise)", "Critically damped (fastest rise without overshoot)", "Underdamped (oscillatory response with transient overshoot)", "Unstable divergent exponential growth"],
      correctIndex: 2,
      topic: "Second-Order Transient Response",
      explanation: "When 0 < zeta < 1, the system has complex conjugate poles, resulting in an underdamped response characterized by transient oscillations and overshoot."
    },
    {
      id: "ctrl_q5",
      question: "According to the Routh-Hurwitz stability criterion, what condition in the first column of the Routh array indicates system instability?",
      options: ["All coefficients in the column are positive", "The number of sign changes equals the number of right-half s-plane poles", "The determinant equals zero", "The first element equals 1"],
      correctIndex: 1,
      topic: "Routh-Hurwitz Stability Criterion",
      explanation: "The Routh-Hurwitz criterion states that the number of roots of the characteristic equation in the right-half s-plane equals the number of sign changes in the first column."
    }
  ],

  "circuit theory & network analysis": [
    {
      id: "circ_q1",
      question: "According to Thevenin's theorem, any linear bilateral two-terminal resistive circuit can be simplified to:",
      options: ["A single current source in parallel with a Norton resistor", "A single independent voltage source (Vth) in series with an equivalent resistance (Rth)", "A capacitor in series with an inductor", "A dependent voltage source with zero impedance"],
      correctIndex: 1,
      topic: "Thevenin Equivalent Theorem",
      explanation: "Thevenin's theorem proves that any linear two-terminal circuit can be replaced by an open-circuit voltage source (Vth) in series with the input equivalent resistance (Rth)."
    },
    {
      id: "circ_q2",
      question: "Under what condition is maximum active power transferred from an AC source with internal impedance Zs = Rs + jXs to an adjustable load impedance ZL?",
      options: ["ZL = Zs", "ZL = Rs - jXs (the complex conjugate Zs*)", "ZL = 0 (short circuit)", "ZL = infinity (open circuit)"],
      correctIndex: 1,
      topic: "Maximum Power Transfer Theorem",
      explanation: "Maximum power transfer in AC circuits occurs when the load impedance is the complex conjugate of the source impedance: ZL = Zs* (cancelling net reactance while matching resistance)."
    },
    {
      id: "circ_q3",
      question: "In a series RLC resonant circuit at its resonant frequency (f0 = 1 / [2*pi*sqrt(L*C)]), what is the net circuit impedance?",
      options: ["Zero", "Purely resistive (Z = R) and at its minimum value", "Purely reactive (Z = j*omega*L)", "Infinite"],
      correctIndex: 1,
      topic: "AC Series Resonance",
      explanation: "At series resonance, inductive reactance XL equals capacitive reactance XC, cancelling each other out. Net impedance equals purely R, maximizing current."
    },
    {
      id: "circ_q4",
      question: "What fundamental physical conservation law is the basis of Kirchhoff's Current Law (KCL)?",
      options: ["Conservation of electric charge", "Conservation of mechanical energy", "Conservation of momentum", "Conservation of magnetic flux"],
      correctIndex: 0,
      topic: "Kirchhoff Current Law",
      explanation: "KCL states that the algebraic sum of currents entering a node is zero, which is a direct consequence of the conservation of electric charge."
    },
    {
      id: "circ_q5",
      question: "In transient DC circuit analysis, how does an ideal uncharged inductor behave at the exact instant (t = 0+) after a switch is closed?",
      options: ["As a short circuit (0 ohms)", "As an open circuit (blocking instantaneous change in current)", "As a charged capacitor", "As a constant voltage source"],
      correctIndex: 1,
      topic: "Transient Inductor Behavior",
      explanation: "Since current through an inductor cannot change instantaneously (v = L*di/dt), an inductor with zero initial current behaves as an open circuit at t = 0+."
    }
  ],

  "electrical machines (transformers & motors)": [
    {
      id: "mach_q1",
      question: "Why are the magnetic cores of power transformers laminated with thin insulated silicon steel sheets?",
      options: ["To decrease structural weight", "To minimize eddy current losses by restricting circular induced current paths", "To reduce copper wire resistance", "To increase leakage reactance"],
      correctIndex: 1,
      topic: "Transformer Core Loss Reduction",
      explanation: "Laminations with insulating varnish break up closed circulating loops for induced eddy currents, significantly lowering I^2*R eddy current power losses in the core."
    },
    {
      id: "mach_q2",
      question: "In an open-circuit (no-load) test of a transformer, what losses are primarily measured?",
      options: ["Full-load copper losses", "Core / Iron losses (hysteresis and eddy current losses)", "Stray load losses", "Frictional brush losses"],
      correctIndex: 1,
      topic: "Transformer Testing",
      explanation: "During an open-circuit test with rated voltage applied, the no-load current is very small (rendering copper losses negligible), so the wattmeter reading represents core/iron losses."
    },
    {
      id: "mach_q3",
      question: "For a 3-phase induction motor running with synchronous speed Ns and rotor speed Nr, what is the rotor slip (s) when Nr = Ns?",
      options: ["s = 1", "s = 0.5", "s = 0", "s = -1"],
      correctIndex: 2,
      topic: "Induction Motor Slip",
      explanation: "Slip is defined as s = (Ns - Nr) / Ns. If the rotor were to reach synchronous speed (Nr = Ns), s = 0 (and no torque would be induced)."
    },
    {
      id: "mach_q4",
      question: "In a DC shunt motor, what happens to the motor speed if the field winding circuit accidentally opens while operating under light load?",
      options: ["The motor stops immediately", "The motor dangerously surges to excessively high runaway speeds", "The motor reverses direction smoothly", "The speed drops to zero with heavy buzzing"],
      correctIndex: 1,
      topic: "DC Shunt Motor Field Failure",
      explanation: "Speed is inversely proportional to field flux (N proportional to Eb / Phi). When the field opens, flux drops to residual magnetism, causing speed to surge dangerously to runaway speeds."
    },
    {
      id: "mach_q5",
      question: "How can a 3-phase synchronous motor be operated to deliver a leading power factor to the electrical grid?",
      options: ["By decreasing the stator terminal voltage", "By over-exciting the DC rotor field winding", "By operating with open rotor windings", "By applying heavy mechanical overload"],
      correctIndex: 1,
      topic: "Synchronous Condenser & Power Factor",
      explanation: "Over-exciting the DC field winding causes the synchronous motor to draw a leading current, behaving as a synchronous condenser that supplies reactive power to the grid."
    }
  ],

  "power systems & smart grids": [
    {
      id: "pwr_q1",
      question: "In power system load flow studies, what variables are specified as known at a Generator Bus (PV Bus)?",
      options: ["Real Power (P) and Reactive Power (Q)", "Real Power (P) and Voltage Magnitude (|V|)", "Voltage Magnitude (|V|) and Phase Angle (delta)", "Reactive Power (Q) and Phase Angle (delta)"],
      correctIndex: 1,
      topic: "Load Flow Bus Classification",
      explanation: "At a PV (generator) bus, the active power injection (P) and voltage magnitude (|V|) are held constant by governor and excitation controls."
    },
    {
      id: "pwr_q2",
      question: "What phenomenon causes the receiving-end voltage of a long, lightly-loaded transmission line to exceed the sending-end voltage?",
      options: ["Corona effect", "Ferranti effect", "Skin effect", "Proximity effect"],
      correctIndex: 1,
      topic: "Transmission Line Ferranti Effect",
      explanation: "The Ferranti effect occurs on long transmission lines under no-load or light-load conditions due to line charging capacitance drawing current through line inductance, elevating receiving voltage."
    },
    {
      id: "pwr_q3",
      question: "In symmetrical component fault analysis, which sequence network is present exclusively when a fault involves ground (e.g. Single Line-to-Ground fault)?",
      options: ["Positive sequence network", "Negative sequence network", "Zero sequence network", "Direct sequence network"],
      correctIndex: 2,
      topic: "Symmetrical Components & Faults",
      explanation: "Zero-sequence currents require a path to return to the neutral/ground. Without ground involvement, zero-sequence current cannot flow."
    },
    {
      id: "pwr_q4",
      question: "In modern smart grid wide-area monitoring (WAMS), what device provides synchronized voltage and current phasor measurements with microsecond GPS timestamps?",
      options: ["Electromechanical induction disc meter", "Phasor Measurement Unit (PMU)", "Thermal bimetallic relay", "Dynamometer wattmeter"],
      correctIndex: 1,
      topic: "Smart Grid Phasor Measurement",
      explanation: "Phasor Measurement Units (PMUs) sample grid waveforms at 30-60 samples/sec, synchronized with GPS timestamps, providing real-time synchrophasor observability."
    },
    {
      id: "pwr_q5",
      question: "What is the primary technical advantage of using 'Bundle Conductors' in Extra High Voltage (EHV) transmission lines?",
      options: ["To increase overall line resistance", "To increase effective conductor radius, thereby reducing Corona discharge, audible noise, and line reactance", "To reduce tower structural height", "To eliminate the need for ground shield wires"],
      correctIndex: 1,
      topic: "EHV Bundle Conductors",
      explanation: "Bundling multiple conductors per phase increases the geometric mean radius (GMR), lowering the electric field gradient at the conductor surface, which minimizes corona discharge and line inductance."
    }
  ],

  "power electronics & drives": [
    {
      id: "pe_q1",
      question: "In a DC-DC Buck converter operating in Continuous Conduction Mode (CCM) with duty cycle D (0 < D < 1), what is the relationship between output voltage Vo and input voltage Vs?",
      options: ["Vo = Vs / D", "Vo = D * Vs", "Vo = Vs / (1 - D)", "Vo = (1 - D) * Vs"],
      correctIndex: 1,
      topic: "Buck Converter Transfer Ratio",
      explanation: "In an ideal step-down buck converter under volt-second balance, Vo = D * Vs, producing an output voltage strictly lower than input voltage."
    },
    {
      id: "pe_q2",
      question: "In high-power medium-voltage converter drives, why are IGBTs widely preferred over power MOSFETs?",
      options: ["IGBTs have zero conduction losses", "IGBTs offer higher breakdown voltage ratings and lower on-state conduction losses at high currents due to conductivity modulation", "IGBTs switch at 50 MHz frequencies", "IGBTs do not require gate drive circuitry"],
      correctIndex: 1,
      topic: "Power Semiconductor Selection (IGBT vs MOSFET)",
      explanation: "IGBTs combine the high input impedance of MOSFETs with the low on-state saturation voltage of bipolar transistors (via minority carrier injection conductivity modulation)."
    },
    {
      id: "pe_q3",
      question: "In Sinusoidal PWM (SPWM) for 3-phase voltage source inverters, what occurs when the modulation index ma exceeds 1 (ma > 1)?",
      options: ["The inverter enters overmodulation, producing higher fundamental output voltage at the expense of lower-order harmonic distortion", "The inverter immediately trips on overvoltage", "The output frequency automatically doubles", "The DC bus capacitor discharges instantly"],
      correctIndex: 0,
      topic: "Inverter Modulation & Harmonics",
      explanation: "When modulation index ma > 1, the reference sine wave peaks above the triangular carrier wave. This increases the fundamental voltage up to square-wave mode, but introduces low-order harmonics."
    },
    {
      id: "pe_q4",
      question: "In Variable Frequency Drives (VFD) for 3-phase induction motors, why is the V/f ratio kept constant below base speed?",
      options: ["To keep the air-gap magnetic flux constant and maintain maximum rated motor torque without core saturation", "To minimize mechanical bearing wear", "To convert AC supply into direct DC battery storage", "To reduce inverter pole pairs"],
      correctIndex: 0,
      topic: "V/f Induction Motor Speed Control",
      explanation: "Motor magnetic flux is proportional to V / f. Maintaining constant V/f ensures constant rated torque throughout the speed range below base speed without saturating the magnetic core."
    },
    {
      id: "pe_q5",
      question: "What is the primary operational difference between an SCR (Thyristor) and a TRIAC?",
      options: ["An SCR conducts bidirectionally, whereas a TRIAC is unidirectional", "An SCR is unidirectional (conducts only when forward biased and gate triggered), whereas a TRIAC can conduct current in both directions", "An SCR turns off via gate signal, while a TRIAC cannot", "A TRIAC only operates on DC systems"],
      correctIndex: 1,
      topic: "Thyristors vs TRIACs",
      explanation: "An SCR is a unidirectional 4-layer PNPN device. A TRIAC is essentially two inverse-parallel connected SCRs with a common gate, allowing bidirectional AC current conduction."
    }
  ],

  "computer vision & opencv": [
    {
      id: "cv_q1",
      question: "In the Canny edge detector pipeline, what is the specific role of Non-Maximum Suppression?",
      options: ["To blur the image using a 5x5 Gaussian kernel", "To thin edge candidates down to 1-pixel width by suppressing pixels that are not local gradient maximums along the gradient direction", "To classify bounding box labels", "To compute optical flow vectors"],
      correctIndex: 1,
      topic: "Canny Edge Detection",
      explanation: "Non-Maximum Suppression inspects the gradient magnitude along the gradient vector and suppresses any pixel that is not the local maximum, yielding thin, sharp 1-pixel edges."
    },
    {
      id: "cv_q2",
      question: "Which geometric transformation matrix relates two planar perspectives of the same flat surface in projective geometry?",
      options: ["Covariance matrix", "Homography matrix (3x3)", "Laplacian matrix", "Adjacency matrix"],
      correctIndex: 1,
      topic: "Planar Homography",
      explanation: "A 3x3 Homography matrix (H) maps points from one planar projection to another (x' = H * x) and is widely used in camera calibration, image stitching, and AR."
    },
    {
      id: "cv_q3",
      question: "Why is RGB image data frequently converted to the HSV (Hue, Saturation, Value) color space for robotic vision color segmentation?",
      options: ["HSV uses less computer memory", "HSV isolates chromatic color information (Hue) from lighting intensity (Value), making color detection resilient to shadows and variable lighting", "HSV converts 2D images directly into 3D meshes", "HSV automatically performs facial detection"],
      correctIndex: 1,
      topic: "Color Space Invariance",
      explanation: "In RGB, intensity variations affect all three channels simultaneously. HSV decouples color tone (Hue) from illumination brightness (Value), allowing stable color thresholding under varying lighting."
    },
    {
      id: "cv_q4",
      question: "In deep learning object detection (e.g. YOLO, SSD), what does the metric Intersection over Union (IoU) evaluate?",
      options: ["The network inference frame rate", "The overlap ratio between the predicted bounding box and the ground-truth annotation box", "The percentage of dropped camera frames", "The learning rate schedule"],
      correctIndex: 1,
      topic: "Object Detection Evaluation (IoU)",
      explanation: "IoU measures localization accuracy by dividing the area of overlap between predicted and ground-truth bounding boxes by the total area of their union."
    },
    {
      id: "cv_q5",
      question: "What fundamental feature does the Hough Transform algorithm detect in binary edge images?",
      options: ["Image compression ratio", "Parametric geometric primitives such as straight lines and circles", "Facial expression landmarks", "Exposure dynamic range"],
      correctIndex: 1,
      topic: "Hough Transform",
      explanation: "The Hough Transform maps edge points into an accumulator parameter space (e.g. rho-theta for lines), finding geometric primitives by detecting peaks in voting space."
    }
  ],

  "slam & path planning (a*/dijkstra)": [
    {
      id: "slam_q1",
      question: "In the A* pathfinding algorithm, what condition must the heuristic function h(n) satisfy to guarantee that the search returns the strictly optimal, shortest path?",
      options: ["h(n) must be strictly greater than the actual cost", "h(n) must be admissible (it must never overestimate the true remaining cost to the goal)", "h(n) must equal zero everywhere", "h(n) must grow exponentially"],
      correctIndex: 1,
      topic: "A* Algorithm Admissibility",
      explanation: "An admissible heuristic never overestimates the true distance to the goal (h(n) <= c*(n, goal)). Admissibility guarantees that A* finds the optimal shortest path."
    },
    {
      id: "slam_q2",
      question: "Under what condition does standard Dijkstra's algorithm fail to guarantee optimal pathfinding?",
      options: ["Graphs with cycles", "Graphs with negative edge weights", "Directed acyclic graphs", "Grid maps with 8-connectivity"],
      correctIndex: 1,
      topic: "Dijkstra Limitation",
      explanation: "Dijkstra's algorithm assumes that adding an edge always increases total path cost. When negative edge weights exist, visited nodes may be finalized prematurely with suboptimal costs."
    },
    {
      id: "slam_q3",
      question: "What does the acronym SLAM represent in robotics and autonomous systems?",
      options: ["Spatial Localization and Automated Motion", "Simultaneous Localization and Mapping", "Serial Laser Actuator Mechanism", "Synchronous Link Access Management"],
      correctIndex: 1,
      topic: "SLAM Core Definition",
      explanation: "SLAM stands for Simultaneous Localization and Mapping: building a map of an unknown environment while simultaneously estimating the robot's pose within that map."
    },
    {
      id: "slam_q4",
      question: "In a 2D Occupancy Grid Map (such as in ROS 2 Nav2 Costmaps), what does each grid cell value signify?",
      options: ["The temperature of the robot chassis", "The estimated probability that a spatial coordinate cell is occupied by an obstacle", "The linear velocity of the robot", "The motor torque in Newton-meters"],
      correctIndex: 1,
      topic: "Occupancy Grid Mapping",
      explanation: "Occupancy grids discretize the environment into cells, with values ranging from 0 (free space) to 100 (definitely occupied), with 255 representing unknown space."
    },
    {
      id: "slam_q5",
      question: "Why is the Rapidly-exploring Random Tree (RRT / RRT*) algorithm preferred over grid-based A* for 6-DoF or 7-DoF robotic arm trajectory planning?",
      options: ["RRT requires no collision detection", "RRT efficiently samples high-dimensional continuous configuration spaces without suffering from exponential grid discretization explosion", "RRT always finishes in under 1 millisecond", "RRT operates exclusively on 2D images"],
      correctIndex: 1,
      topic: "Sampling-Based Path Planning (RRT)",
      explanation: "Discretizing a 6 or 7 DoF robotic arm joint space into a grid suffers from the curse of dimensionality (exponential cell explosion). RRT samples randomly in continuous space to find collision-free paths efficiently."
    }
  ]
};

// Helper: Generate or select 5 profile-specific questions for any skill
function generateAssessmentForSkill(skillName, careerTitle, degree, domain) {
  const sLower = (skillName || "").toLowerCase().trim();

  // 1. Direct or partial match from curated bank
  for (const [key, questions] of Object.entries(SKILL_ASSESSMENT_BANK)) {
    if (sLower.includes(key) || key.includes(sLower)) {
      return questions;
    }
  }

  // Check sub-keywords
  if (/ros|robot operating/.test(sLower)) return SKILL_ASSESSMENT_BANK["robot operating system (ros)"];
  if (/c\+\+|cpp/.test(sLower)) return SKILL_ASSESSMENT_BANK["c++ & python for robotics"];
  if (/microcontroller|embedded c|firmware|arm|cortex|dsp/.test(sLower)) return SKILL_ASSESSMENT_BANK["microcontrollers & embedded c"];
  if (/kinematic|dynamic|manipulator/.test(sLower)) return SKILL_ASSESSMENT_BANK["kinematics & dynamics"];
  if (/pid|control system|feedback|bode|nyquist/.test(sLower)) return SKILL_ASSESSMENT_BANK["control systems & pid tuning"];
  if (/circuit|network analysis|thevenin|kcl|kvl/.test(sLower)) return SKILL_ASSESSMENT_BANK["circuit theory & network analysis"];
  if (/machine|transformer|induction motor|dc motor/.test(sLower)) return SKILL_ASSESSMENT_BANK["electrical machines (transformers & motors)"];
  if (/power system|smart grid|substation|transmission/.test(sLower)) return SKILL_ASSESSMENT_BANK["power systems & smart grids"];
  if (/power electronics|converter|inverter|vfd|igbt/.test(sLower)) return SKILL_ASSESSMENT_BANK["power electronics & drives"];
  if (/vision|opencv|image processing|yolo/.test(sLower)) return SKILL_ASSESSMENT_BANK["computer vision & opencv"];
  if (/slam|path planning|a\*|navigation/.test(sLower)) return SKILL_ASSESSMENT_BANK["slam & path planning (a*/dijkstra)"];

  // 2. High-quality tailored dynamic questions for other specific skills
  const cleanSkill = skillName || "Engineering Core";
  return [
    {
      id: "gen_q1",
      question: `In professional ${careerTitle || 'Engineering'} practice, what is the primary fundamental objective of applying ${cleanSkill}?`,
      options: [
        `To establish verified mathematical models and system specifications adhering to ${domain || 'industry'} standards`,
        `To bypass standard verification benchmarks and minimize design documentation`,
        `To replace physical sensor readings with unvalidated heuristic estimates`,
        `To eliminate multithreading and parallel execution in downstream systems`
      ],
      correctIndex: 0,
      topic: `${cleanSkill} Fundamentals`,
      explanation: `Applying ${cleanSkill} in ${careerTitle || 'Engineering'} ensures rigorous compliance with domain specifications and sound mathematical modeling.`
    },
    {
      id: "gen_q2",
      question: `When implementing ${cleanSkill} in a production environment, which factor is most critical for ensuring system robustness?`,
      options: [
        `Disabling error boundary handlers to maximize raw throughput`,
        `Comprehensive boundary-value testing, continuous feedback loops, and error handling`,
        `Hardcoding static calibration parameters directly into the core runtime`,
        `Avoiding real-time telemetry logging and performance benchmarks`
      ],
      correctIndex: 1,
      topic: `${cleanSkill} Implementation Quality`,
      explanation: `Production-grade ${cleanSkill} mandates defensive programming, error handling, and rigorous boundary-condition testing.`
    },
    {
      id: "gen_q3",
      question: `What is the most effective diagnostic methodology when troubleshooting unexpected deviations in ${cleanSkill}?`,
      options: [
        `Restarting host hardware without analyzing logs or telemetry data`,
        `Systematic signal tracing, modular isolation, and comparing measurements against benchmark specifications`,
        `Immediately rewriting the entire codebase from scratch`,
        `Increasing system power supply voltage above rated tolerance`
      ],
      correctIndex: 1,
      topic: `${cleanSkill} Diagnostics & Debugging`,
      explanation: `Root-cause analysis requires isolating subsystems, checking sensor telemetry, and comparing observed outputs with verified simulation benchmarks.`
    },
    {
      id: "gen_q4",
      question: `How does proficiency in ${cleanSkill} directly enhance efficiency in ${careerTitle || 'technical roles'}?`,
      options: [
        `By enabling automated verification pipelines, reducing design cycle times, and minimizing rework`,
        `By replacing all physical testing with speculative assumptions`,
        `By eliminating the need for cross-disciplinary collaboration`,
        `By restricting the architecture to single-vendor proprietary protocols`
      ],
      correctIndex: 0,
      topic: `${cleanSkill} Performance & Scalability`,
      explanation: `Mastery of ${cleanSkill} enables engineers to architect scalable, automated, and repeatable solutions that accelerate development cycles.`
    },
    {
      id: "gen_q5",
      question: `Which international or industrial standard framework governs quality assurance and validation for ${cleanSkill}?`,
      options: [
        `IEEE / ISO / IEC recognized technical benchmarks and certification standards`,
        `Unregulated proprietary community guidelines`,
        `Deprecated legacy vacuum tube design norms`,
        `Consumer electronics packaging aesthetic criteria`
      ],
      correctIndex: 0,
      topic: `${cleanSkill} Industry Standards`,
      explanation: `Engineering competencies are governed by globally recognized IEEE, ISO, and IEC standards to guarantee safety, interoperability, and quality.`
    }
  ];
}

// Default Detailed Career Features Generator (for complete detail view)
const getComprehensiveCareerDetails = (career) => {
  const title = career.title || "";
  const tKey = title.toLowerCase().trim();
  const specialized = ROLE_SPECIALIZED_DATA[tKey] || Object.entries(ROLE_SPECIALIZED_DATA).find(([k]) => tKey.includes(k) || k.includes(tKey))?.[1];

  const reqSkills = career.requiredSkills || [];

  const coreSkills = specialized?.coreSkills || (career.coreSkills?.length > 0 ? career.coreSkills : [
    { name: reqSkills[0] || "Core Technical Fundamentals", suggestedProficiency: "Advanced" },
    { name: reqSkills[1] || "Domain Analysis & Design", suggestedProficiency: "Advanced" },
    { name: "Problem Solving & Analytical Thinking", suggestedProficiency: "Advanced" }
  ]);

  const advancedSkills = specialized?.advancedSkills || (career.advancedSkills?.length > 0 ? career.advancedSkills : [
    { name: reqSkills[2] || "System Architecture & Simulation", suggestedProficiency: "Intermediate" },
    { name: "Applied Project Engineering", suggestedProficiency: "Intermediate" }
  ]);

  const optionalSkills = specialized?.optionalSkills || (career.optionalSkills?.length > 0 ? career.optionalSkills : [
    { name: reqSkills[3] || "Industry Standards & Toolkits", suggestedProficiency: "Basic" },
    { name: "Cross-functional Collaboration", suggestedProficiency: "Basic" }
  ]);

  const typicalResponsibilities = career.typicalResponsibilities?.length > 0 ? career.typicalResponsibilities : [
    `Design, build, and optimize scalable solutions for ${title} domains.`,
    `Collaborate with cross-functional teams to translate requirements into technical specifications.`,
    `Conduct design reviews, simulation benchmarks, and quality verification.`,
    `Stay updated with emerging tools, industry standards, and open-source innovations.`
  ];

  const recommendedRoadmap = specialized?.roadmapItems || (career.recommendedRoadmap?.length > 0 ? career.recommendedRoadmap : [
    {
      phase: "Phase 1: Academic & Core Fundamentals",
      title: "Core Theory & Discipline Mastery",
      description: "Master foundational concepts, core mathematics, algorithms, and primary domain tools.",
      items: [coreSkills[0]?.name || "Core Principles", coreSkills[1]?.name || "Discipline Foundations", "Analytical Modeling"],
      defaultStatus: "completed"
    },
    {
      phase: "Phase 2: Applied Technical Skills",
      title: "Domain Specialization & Frameworks",
      description: "Acquire hands-on technical proficiency with modern industry-standard toolkits.",
      items: [coreSkills[2]?.name || "Specialization Tech", advancedSkills[0]?.name || "System Design", "Testing & Verification"],
      defaultStatus: "current"
    },
    {
      phase: "Phase 3: Portfolio & Real-world Projects",
      title: "Industry Capstone Projects",
      description: "Develop 2 comprehensive end-to-end portfolio projects with thorough documentation.",
      items: [`${title} Prototype Project`, "Hardware / Software Integration", "Industrial Case Study"],
      defaultStatus: "upcoming"
    },
    {
      phase: "Phase 4: Placement & Certification",
      title: "Career Readiness & Placement Preparation",
      description: "Complete mock technical interviews, earn domain certifications, and finalize resume.",
      items: ["Industry Recognized Certification", "Mock Technical Assessment", "Resume & Portfolio Review"],
      defaultStatus: "upcoming"
    }
  ]);

  const relatedCertifications = career.relatedCertifications?.length > 0 ? career.relatedCertifications : [
    `AWS / Azure Certified Developer Practitioner`,
    `Google Professional ${career.category} Specialist`,
    `Oracle / Meta Certified Associate`
  ];

  const relatedProjects = career.relatedProjects?.length > 0 ? career.relatedProjects : [
    {
      title: `Scalable ${title} Analytics Dashboard`,
      description: `Build an interactive dashboard displaying real-time data metrics, visual insights, and API service integration.`,
      techStack: `Python, React, Node.js, PostgreSQL`
    },
    {
      title: `Automated Pipeline & API Microservice`,
      description: `Implement a containerized microservice pipeline featuring automated data validation and deployment.`,
      techStack: `Docker, FastAPI, MongoDB, REST API`
    }
  ];

  const interviewPrep = career.interviewPrep?.length > 0 ? career.interviewPrep : [
    `Practice core algorithms and data structure problem solving daily.`,
    `Review system design patterns, scalability bottlenecks, and database normalization.`,
    `Prepare STAR-method behavioral stories highlighting technical leadership and problem-solving.`
  ];

  return {
    ...career.toObject ? career.toObject() : career,
    roleDescription: career.roleDescription || career.shortDescription,
    coreSkills,
    advancedSkills,
    optionalSkills,
    typicalResponsibilities,
    recommendedRoadmap,
    relatedCertifications,
    relatedProjects,
    interviewPrep
  };
};

// ── 1. GET Academic Advisor Recommendations ─────────────────────────────────────
const getAdvisorRecommendations = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const profile = await CollegeStudentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "College student profile not found. Please complete profile onboarding first."
      });
    }

    let careers = await CollegeCareerCatalog.find();
    if (!careers || careers.length === 0) {
      const { seedCollegeCareers } = require("../utils/collegeCareerSeeder");
      await seedCollegeCareers();
      careers = await CollegeCareerCatalog.find();
    }

    const evaluatedRecommendations = careers.map(c => evaluateCareerMatch(profile, c));
    evaluatedRecommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);

    try {
      await Recommendation.create({
        userId,
        grade: "College",
        scorePercentage: evaluatedRecommendations[0]?.matchPercentage || 85,
        performanceLevel: evaluatedRecommendations[0]?.matchCategory || "Strong Match",
        interests: profile.careerInterests || [],
        strongSkills: profile.skills || [],
        recommendedCareerPaths: evaluatedRecommendations.slice(0, 5).map(r => r.title),
        learningGuidelines: `Profile assessed for ${profile.degreeProgramme} (${profile.domain}). Best match: ${evaluatedRecommendations[0]?.title}.`
      });
    } catch (recErr) {
      console.warn("Failed to log recommendation history snapshot:", recErr.message);
    }

    res.status(200).json({
      success: true,
      profileSummary: {
        field: profile.field,
        degreeProgramme: profile.degreeProgramme,
        domain: profile.domain,
        specialization: profile.specialization,
        institution: profile.institution,
        skills: profile.skills,
        academicInterests: profile.academicInterests,
        careerInterests: profile.careerInterests,
        targetCareer: profile.targetCareer,
        profileCompletion: profile.profileCompletion
      },
      targetCareer: profile.targetCareer || evaluatedRecommendations[0]?.title,
      recommendations: evaluatedRecommendations,
      assessedAt: new Date()
    });
  } catch (error) {
    console.error("Get advisor recommendations error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── 2. GET Single Career Details ──────────────────────────────────────────────
const getCareerDetail = async (req, res) => {
  try {
    const { slug } = req.params;
    let career = await CollegeCareerCatalog.findOne({ slug });
    if (!career) {
      career = await CollegeCareerCatalog.findOne({ title: new RegExp(slug.replace(/-/g, ' '), 'i') });
    }

    if (!career) {
      return res.status(404).json({ success: false, message: "Career path not found" });
    }

    const userId = req.student?._id || req.user?._id || req.student?.id;
    const profile = userId ? await CollegeStudentProfile.findOne({ userId }) : null;
    const matchAnalysis = profile ? evaluateCareerMatch(profile, career) : null;

    const fullDetails = getComprehensiveCareerDetails(career);

    res.status(200).json({
      success: true,
      career: fullDetails,
      matchAnalysis
    });
  } catch (error) {
    console.error("Get career detail error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch career details" });
  }
};

// ── 3. SET Target Career ──────────────────────────────────────────────────────
const setTargetCareer = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const { targetCareer } = req.body;

    if (!targetCareer) {
      return res.status(400).json({ success: false, message: "targetCareer title is required" });
    }

    const profile = await CollegeStudentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    profile.targetCareer = targetCareer;
    if (!profile.careerInterests.includes(targetCareer)) {
      profile.careerInterests.unshift(targetCareer);
    }
    await profile.save();

    res.status(200).json({
      success: true,
      message: `Target career set to "${targetCareer}" successfully`,
      targetCareer: profile.targetCareer
    });
  } catch (error) {
    console.error("Set target career error:", error);
    res.status(500).json({ success: false, message: "Failed to set target career" });
  }
};

// ── 4. GET Student Skill Gap Analysis ─────────────────────────────────────────
// ── 4. GET Student Skill Gap Analysis (Powered by Custom AI Inference Engine) ──
const getStudentSkillGap = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const AhpFuzzyResult = require("../models/AhpFuzzyResult");
    const { evaluateCustomAiSkillGap } = require("../utils/customSkillGapAiEngine");

    const [profile, fuzzyResult, allCareers] = await Promise.all([
      CollegeStudentProfile.findOne({ userId }),
      AhpFuzzyResult.findOne({ userId }).sort({ createdAt: -1 }),
      CollegeCareerCatalog.find().select("title category requiredDomains requiredFields growthOutlook").lean()
    ]);

    if (!profile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    const requestedTargetRole = req.query?.careerTitle || profile.targetCareer;
    
    // Evaluate via Custom AI Skill Gap Engine (100% local, no external LLMs)
    const aiResult = evaluateCustomAiSkillGap(profile, fuzzyResult, requestedTargetRole);

    const allCareerTitles = (allCareers || []).map(c => c.title);
    if (allCareerTitles.length === 0) {
      allCareerTitles.push(
        "Artificial Intelligence & Machine Learning",
        "Full Stack Web Development",
        "Cyber Security & Information Assurance",
        "Cloud Computing & DevOps",
        "Robotics Engineer",
        "Software Engineer"
      );
    }

    res.status(200).json({
      success: true,
      engine: "Custom-AI-Inference-Engine-v1",
      targetCareer: aiResult.targetCareer,
      readinessScore: aiResult.readinessScore,
      skills: aiResult.skills,
      summary: aiResult.summary,
      recommendedCareers: allCareerTitles.slice(0, 6),
      allCareers: allCareerTitles
    });
  } catch (error) {
    console.error("Get student skill gap error:", error);
    res.status(500).json({ success: false, message: "Failed to evaluate skill gap analysis" });
  }
};

// ── 4B. POST Acquire Skill (Mark skill learned & sync to profile & progress) ────
const acquireSkillProgress = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const { skillName, careerTitle } = req.body;

    if (!skillName) {
      return res.status(400).json({ success: false, message: "skillName is required" });
    }

    const [profile, skillProgress] = await Promise.all([
      CollegeStudentProfile.findOne({ userId }),
      StudentSkillProgress.findOne({ $or: [{ studentId: userId }, { userId }] })
    ]);

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    // Add to profile skills if not already present
    const alreadyHas = (profile.skills || []).some(s => s.toLowerCase() === skillName.toLowerCase().trim());
    if (!alreadyHas) {
      profile.skills.push(skillName.trim());
      await profile.save();
    }

    // Update StudentSkillProgress completedSteps and XP
    if (skillProgress) {
      const stepKey = `skill_${skillName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
      if (!skillProgress.completedSteps.includes(stepKey)) {
        skillProgress.completedSteps.push(stepKey);
        skillProgress.xp = (skillProgress.xp || 0) + 50;
        await skillProgress.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `Skill "${skillName}" marked as acquired and added to your profile competencies.`,
      skills: profile.skills,
      acquiredSkill: skillName
    });
  } catch (error) {
    console.error("Acquire skill error:", error);
    res.status(500).json({ success: false, message: "Failed to record skill acquisition" });
  }
};

// ── 4C. GET Skill Assessment Questions (5 domain-specific verification questions) ──
const getSkillAssessmentQuestions = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const { skillName, careerTitle } = req.query;

    if (!skillName) {
      return res.status(400).json({ success: false, message: "skillName query parameter is required" });
    }

    const profile = await CollegeStudentProfile.findOne({ userId }).lean();
    const degree = profile?.degreeProgramme || "Engineering";
    const domain = profile?.domain || "Core Engineering";

    const masterQuestions = generateAssessmentForSkill(skillName, careerTitle, degree, domain);

    // Return sanitized questions (omitting correctIndex to prevent inspect-element cheating)
    const sanitizedQuestions = masterQuestions.map((q, idx) => ({
      id: q.id || `q_${idx + 1}`,
      question: q.question,
      options: q.options,
      topic: q.topic || skillName
    }));

    res.status(200).json({
      success: true,
      skillName,
      careerTitle: careerTitle || "Target Career",
      totalQuestions: sanitizedQuestions.length,
      passingScore: 60, // 60% passing requirement (at least 3 out of 5)
      questions: sanitizedQuestions
    });
  } catch (error) {
    console.error("Get skill assessment questions error:", error);
    res.status(500).json({ success: false, message: "Failed to load skill assessment questions" });
  }
};

// ── 4D. POST Verify Skill Assessment (Grade, evaluate, and acquire if >= 60%) ──
const verifySkillAssessment = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const { skillName, careerTitle, answers } = req.body; // answers: { [questionId]: selectedOptionIndex }

    if (!skillName || !answers) {
      return res.status(400).json({ success: false, message: "skillName and answers are required" });
    }

    const [profile, skillProgress] = await Promise.all([
      CollegeStudentProfile.findOne({ userId }),
      StudentSkillProgress.findOne({ $or: [{ studentId: userId }, { userId }] })
    ]);

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const degree = profile.degreeProgramme || "Engineering";
    const domain = profile.domain || "Core Engineering";

    // Retrieve master questions with correct answers
    const masterQuestions = generateAssessmentForSkill(skillName, careerTitle, degree, domain);
    let correctCount = 0;
    const totalQuestions = masterQuestions.length || 5;

    const review = masterQuestions.map((q, idx) => {
      const qId = q.id || `q_${idx + 1}`;
      const userSelectedIdx = answers[qId] !== undefined ? parseInt(answers[qId], 10) : -1;
      const isCorrect = userSelectedIdx === q.correctIndex;
      if (isCorrect) correctCount++;

      return {
        id: qId,
        question: q.question,
        userSelectedIndex: userSelectedIdx,
        userSelectedText: userSelectedIdx >= 0 ? q.options[userSelectedIdx] : "Unanswered",
        correctIndex: q.correctIndex,
        correctText: q.options[q.correctIndex],
        isCorrect,
        explanation: q.explanation || "Core foundational concept verified."
      };
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= 60; // 60% passing requirement (at least 3 out of 5)

    if (passed) {
      // 1. Add to profile skills if not already present
      const alreadyHas = (profile.skills || []).some(s => s.toLowerCase() === skillName.toLowerCase().trim());
      if (!alreadyHas) {
        profile.skills.push(skillName.trim());
        await profile.save();
      }

      // 2. Update StudentSkillProgress & reward XP
      if (skillProgress) {
        const stepKey = `skill_${skillName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
        if (!skillProgress.completedSteps.includes(stepKey)) {
          skillProgress.completedSteps.push(stepKey);
          skillProgress.xp = (skillProgress.xp || 0) + 50;
          await skillProgress.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      passed,
      scorePercentage,
      correctCount,
      totalQuestions,
      passingScore: 60,
      skillName,
      message: passed
        ? `Congratulations! You scored ${scorePercentage}% (${correctCount}/${totalQuestions}). "${skillName}" has been certified and synced to your Profile, Resume, and Study Plan!`
        : `Assessment incomplete: You scored ${scorePercentage}% (${correctCount}/${totalQuestions}). A minimum score of 60% is required to certify this skill. Please review the course resources and re-take the assessment.`,
      review
    });
  } catch (error) {
    console.error("Verify skill assessment error:", error);
    res.status(500).json({ success: false, message: "Failed to evaluate skill assessment" });
  }
};

// ── 5. GET & UPDATE Learning Roadmap ──────────────────────────────────────────
const getStudentRoadmap = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const [profile, skillProgress, ahpFuzzyDoc] = await Promise.all([
      CollegeStudentProfile.findOne({ userId }),
      StudentSkillProgress.findOne({ $or: [{ studentId: userId }, { userId }] }).lean(),
      AhpFuzzyResult.findOne({ $or: [{ userId }, { studentId: userId?.toString() }] }).sort({ createdAt: -1 }).lean()
    ]);

    if (!profile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    const onboardingDomain = ahpFuzzyDoc?.recommendedDomain?.domainName || profile.recommendedDomain;
    let targetTitle = profile.targetCareer;

    // Priority: onboarding recommended domain > profile domain > default Mamdani AI domain
    if (!targetTitle || targetTitle === "Software Engineer" || targetTitle === "General Engineering") {
      targetTitle = onboardingDomain || profile.domain || "Artificial Intelligence & Machine Learning";
    }

    let career = await CollegeCareerCatalog.findOne({
      $or: [
        { title: new RegExp(`^${targetTitle}$`, "i") },
        { slug: targetTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
        { title: new RegExp(targetTitle, "i") }
      ]
    });

    if (!career || (career.title === "Software Engineer" && targetTitle !== "Software Engineer")) {
      career = {
        title: targetTitle,
        category: profile.field || "Engineering & Technology",
        shortDescription: `Learning trajectory tailored for ${targetTitle}`,
        requiredSkills: profile.skills || []
      };
    }

    const fullCareer = getComprehensiveCareerDetails(career || { title: targetTitle });
    const rawMilestones = fullCareer.recommendedRoadmap;
    const completedSteps = skillProgress?.completedSteps || [];

    // Map each milestone with real saved progress
    const milestones = rawMilestones.map((m, idx) => {
      const stepKey = `roadmap_${fullCareer.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${idx}`;
      const isCompleted = completedSteps.includes(stepKey) || (idx === 0 && completedSteps.length === 0);
      const isCurrent = !isCompleted && (idx === 0 || completedSteps.includes(`roadmap_${fullCareer.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${idx - 1}`));
      return {
        ...m,
        id: `m-${idx + 1}`,
        stepKey,
        status: isCompleted ? "completed" : (isCurrent ? "current" : "upcoming"),
        defaultStatus: isCompleted ? "completed" : (isCurrent ? "current" : "upcoming")
      };
    });

    const completedCount = milestones.filter(m => m.status === "completed").length;
    const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

    res.status(200).json({
      success: true,
      targetCareer: fullCareer.title,
      milestones,
      progressPercent,
      completedCount,
      profileTarget: targetTitle
    });
  } catch (error) {
    console.error("Get student roadmap error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch roadmap" });
  }
};

// ── 5b. Update Roadmap Milestone Progress ─────────────────────────────────────
const updateRoadmapProgress = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const { milestoneIndex, targetCareer, isCompleted } = req.body;

    let skillProgress = await StudentSkillProgress.findOne({ $or: [{ studentId: userId }, { userId }] });
    if (!skillProgress) skillProgress = new StudentSkillProgress({ studentId: userId });

    const roleName = targetCareer || "general";
    const stepKey = `roadmap_${roleName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${milestoneIndex}`;

    if (isCompleted) {
      if (!skillProgress.completedSteps.includes(stepKey)) {
        skillProgress.completedSteps.push(stepKey);
        skillProgress.xp = (skillProgress.xp || 0) + 50;
        skillProgress.level = Math.floor(skillProgress.xp / 100) + 1;
      }
    } else {
      skillProgress.completedSteps = skillProgress.completedSteps.filter(s => s !== stepKey);
    }

    const now = new Date();
    skillProgress.lastActivityDate = now;
    await skillProgress.save();

    res.status(200).json({
      success: true,
      message: `Roadmap milestone ${isCompleted ? 'marked completed (+50 XP)' : 'reopened'}`,
      completedSteps: skillProgress.completedSteps,
      xp: skillProgress.xp,
      level: skillProgress.level
    });
  } catch (error) {
    console.error("Update roadmap progress error:", error);
    res.status(500).json({ success: false, message: "Failed to update roadmap progress" });
  }
};

// ── 6. RUN Acceptance Test Profiles Verification ─────────────────────────────
const runAcceptanceTestProfiles = async (req, res) => {
  try {
    let careers = await CollegeCareerCatalog.find();
    if (!careers || careers.length === 0) {
      const { seedCollegeCareers } = require("../utils/collegeCareerSeeder");
      await seedCollegeCareers();
      careers = await CollegeCareerCatalog.find();
    }

    const testProfiles = [
      {
        name: "CSE Student",
        field: "engineering",
        degreeProgramme: "B.E. Computer Science and Engineering",
        domain: "Computer Science",
        specialization: "Full Stack Development",
        cgpa: "8.8",
        skills: ["Python", "Java", "React", "Data Structures"],
        careerInterests: ["Software Developer", "Full Stack Engineer"]
      },
      {
        name: "Mechanical Student",
        field: "engineering",
        degreeProgramme: "B.E. Mechanical Engineering",
        domain: "Mechanical Engineering",
        specialization: "CAD / CAM Product Design",
        cgpa: "8.2",
        skills: ["CAD / 3D Modeling (AutoCAD/SolidWorks)", "Thermodynamics", "ANSYS"],
        careerInterests: ["Mechanical Engineer", "Robotics Engineer"]
      },
      {
        name: "ECE Student",
        field: "engineering",
        degreeProgramme: "B.E. Electronics and Communication",
        domain: "Electronics and Communication",
        specialization: "Embedded Systems & VLSI",
        cgpa: "8.4",
        skills: ["VLSI Design", "Microcontrollers", "Embedded C", "Signal Processing"],
        careerInterests: ["Computer Hardware Engineer", "Robotics Engineer"]
      },
      {
        name: "Data Science Student",
        field: "engineering",
        degreeProgramme: "B.Tech Data Science & AI",
        domain: "Data Science",
        specialization: "Machine Learning & Deep Learning",
        cgpa: "9.0",
        skills: ["Python / Data Science", "AI & Machine Learning", "SQL / Databases", "Statistics"],
        careerInterests: ["Data Scientist", "Machine Learning Engineer"]
      }
    ];

    const results = testProfiles.map(tp => {
      const recs = careers.map(c => evaluateCareerMatch(tp, c));
      recs.sort((a, b) => b.matchPercentage - a.matchPercentage);
      return {
        profileName: tp.name,
        degree: tp.degreeProgramme,
        topRecommendations: recs.slice(0, 3).map(r => ({
          title: r.title,
          matchPercentage: r.matchPercentage,
          matchCategory: r.matchCategory,
          whyFits: r.whyFits
        }))
      };
    });

    res.status(200).json({
      success: true,
      message: "Acceptance test profiles evaluated successfully",
      testResults: results
    });
  } catch (error) {
    console.error("Acceptance test run error:", error);
    res.status(500).json({ success: false, message: "Failed to run acceptance test profiles" });
  }
};

// ── COMPARE Careers Side-by-Side ─────────────────────────────────────────────
const compareCareers = async (req, res) => {
  try {
    const { slugs } = req.body;
    if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide an array of career slugs to compare" });
    }

    const userId = req.student?._id || req.user?._id || req.student?.id;
    const profile = userId ? await CollegeStudentProfile.findOne({ userId }) : null;

    const careers = await CollegeCareerCatalog.find({ slug: { $in: slugs } });

    const comparedData = careers.map(c => {
      const evalData = profile ? evaluateCareerMatch(profile, c) : null;
      return {
        id: c._id,
        title: c.title,
        slug: c.slug,
        category: c.category,
        shortDescription: c.shortDescription,
        roleDescription: c.roleDescription || c.shortDescription,
        typicalWorkArea: c.typicalWorkArea,
        requiredSkills: c.requiredSkills,
        matchedSkills: evalData ? evalData.matchedSkills : [],
        skillGaps: evalData ? evalData.skillGaps : c.requiredSkills,
        matchPercentage: evalData ? evalData.matchPercentage : null,
        matchCategory: evalData ? evalData.matchCategory : null,
        whyFits: evalData ? evalData.whyFits : [],
        skillsToImprove: evalData ? evalData.skillsToImprove : [],
        suggestedSubjects: c.suggestedSubjects,
        suggestedNextSteps: c.suggestedNextSteps,
        relatedDegrees: c.relatedDegrees,
        workSectors: c.workSectors,
        growthOutlook: c.growthOutlook
      };
    });

    res.status(200).json({
      success: true,
      comparison: comparedData
    });
  } catch (error) {
    console.error("Compare careers error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── ADMIN: Get All College Careers ──────────────────────────────────────────
const getAllCareersAdmin = async (req, res) => {
  try {
    const careers = await CollegeCareerCatalog.find().sort({ title: 1 });
    res.status(200).json({ success: true, careers });
  } catch (error) {
    console.error("Admin get careers error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch careers" });
  }
};

// ── ADMIN: Create / Update College Career ───────────────────────────────────
const adminSaveCareer = async (req, res) => {
  try {
    const {
      id, title, category, shortDescription, roleDescription, typicalWorkArea,
      requiredFields, requiredDegrees, requiredDomains, requiredSpecializations,
      requiredSkills, coreSkills, advancedSkills, optionalSkills, skillsToDevelop,
      suggestedSubjects, suggestedNextSteps, workSectors, growthOutlook,
      typicalResponsibilities, recommendedRoadmap, relatedCertifications, relatedProjects, interviewPrep
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({ success: false, message: "Title and Category are required" });
    }

    const slug = title.toLowerCase().replace(/[^\w]+/g, "-");

    let career;
    if (id) {
      career = await CollegeCareerCatalog.findById(id);
    }
    if (!career) {
      career = await CollegeCareerCatalog.findOne({ slug });
    }
    if (!career) {
      career = new CollegeCareerCatalog({ title, slug, category, shortDescription });
    }

    career.title = title;
    career.slug = slug;
    career.category = category;
    if (shortDescription !== undefined) career.shortDescription = shortDescription;
    if (roleDescription !== undefined) career.roleDescription = roleDescription;
    if (typicalWorkArea !== undefined) career.typicalWorkArea = typicalWorkArea;
    if (requiredFields !== undefined) career.requiredFields = requiredFields;
    if (requiredDegrees !== undefined) career.requiredDegrees = requiredDegrees;
    if (requiredDomains !== undefined) career.requiredDomains = requiredDomains;
    if (requiredSpecializations !== undefined) career.requiredSpecializations = requiredSpecializations;
    if (requiredSkills !== undefined) career.requiredSkills = requiredSkills;
    if (coreSkills !== undefined) career.coreSkills = coreSkills;
    if (advancedSkills !== undefined) career.advancedSkills = advancedSkills;
    if (optionalSkills !== undefined) career.optionalSkills = optionalSkills;
    if (skillsToDevelop !== undefined) career.skillsToDevelop = skillsToDevelop;
    if (suggestedSubjects !== undefined) career.suggestedSubjects = suggestedSubjects;
    if (suggestedNextSteps !== undefined) career.suggestedNextSteps = suggestedNextSteps;
    if (workSectors !== undefined) career.workSectors = workSectors;
    if (growthOutlook !== undefined) career.growthOutlook = growthOutlook;
    if (typicalResponsibilities !== undefined) career.typicalResponsibilities = typicalResponsibilities;
    if (recommendedRoadmap !== undefined) career.recommendedRoadmap = recommendedRoadmap;
    if (relatedCertifications !== undefined) career.relatedCertifications = relatedCertifications;
    if (relatedProjects !== undefined) career.relatedProjects = relatedProjects;
    if (interviewPrep !== undefined) career.interviewPrep = interviewPrep;

    await career.save();

    res.status(200).json({
      success: true,
      message: "College career saved successfully",
      career
    });
  } catch (error) {
    console.error("Admin save career error:", error);
    res.status(500).json({ success: false, message: "Failed to save career entity" });
  }
};

// ── ADMIN: Delete College Career ─────────────────────────────────────────────
const adminDeleteCareer = async (req, res) => {
  try {
    const { id } = req.params;
    await CollegeCareerCatalog.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Career deleted successfully" });
  } catch (error) {
    console.error("Admin delete career error:", error);
    res.status(500).json({ success: false, message: "Failed to delete career" });
  }
};

module.exports = {
  getAdvisorRecommendations,
  getCareerDetail,
  setTargetCareer,
  getStudentSkillGap,
  acquireSkillProgress,
  getSkillAssessmentQuestions,
  verifySkillAssessment,
  getStudentRoadmap,
  updateRoadmapProgress,
  runAcceptanceTestProfiles,
  compareCareers,
  getAllCareersAdmin,
  adminSaveCareer,
  adminDeleteCareer,
  ROLE_SPECIALIZED_DATA,
  SKILL_RESOURCE_MAP,
  getLearningResourceForSkill,
  SKILL_ASSESSMENT_BANK,
  generateAssessmentForSkill
};
