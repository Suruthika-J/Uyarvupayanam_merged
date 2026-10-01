const CollegeStudentProfile = require("../models/CollegeStudentProfile");
const CollegeCareerCatalog = require("../models/CollegeCareerCatalog");
const Recommendation = require("../models/Recommendation");
const StudentSkillProgress = require("../models/StudentSkillProgress");

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
const getStudentSkillGap = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const profile = await CollegeStudentProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    const targetTitle = profile.targetCareer || profile.careerInterests?.[0] || "Software Engineer";
    let [career, allCareers] = await Promise.all([
      CollegeCareerCatalog.findOne({
        $or: [
          { title: new RegExp(`^${targetTitle}$`, "i") },
          { slug: targetTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
          { title: new RegExp(targetTitle, "i") }
        ]
      }),
      CollegeCareerCatalog.find().select("title category requiredDomains requiredFields growthOutlook").lean()
    ]);

    if (!career) {
      career = allCareers[0] || (await CollegeCareerCatalog.findOne());
    }

    const fullCareer = getComprehensiveCareerDetails(career || { title: targetTitle });
    const userSkills = (profile.skills || []).map(s => s.toLowerCase());
    const userSubjects = (profile.subjects || []).map(s => s.toLowerCase());

    const strong = [];
    const developing = [];
    const missing = [];

    const allCareerSkills = [
      ...fullCareer.coreSkills.map(s => ({ name: s.name, type: "Core", reqProf: s.suggestedProficiency })),
      ...fullCareer.advancedSkills.map(s => ({ name: s.name, type: "Advanced", reqProf: s.suggestedProficiency })),
      ...fullCareer.optionalSkills.map(s => ({ name: s.name, type: "Optional", reqProf: s.suggestedProficiency }))
    ];

    allCareerSkills.forEach(skillObj => {
      const sName = skillObj.name;
      const sLower = sName.toLowerCase();

      // Flexible matching for acronyms and keywords (e.g. C++, ROS, Python, MATLAB, PLC)
      const hasExactSkill = userSkills.some(us => {
        const u = us.toLowerCase().trim();
        return u === sLower || sLower.includes(u) || u.includes(sLower);
      });
      const hasSubject = userSubjects.some(sub => {
        const sb = sub.toLowerCase().trim();
        return sb === sLower || sLower.includes(sb) || sb.includes(sLower);
      });

      const resource = getLearningResourceForSkill(sName, fullCareer.title);

      if (hasExactSkill) {
        strong.push({ ...skillObj, status: "Strong", currentProficiency: "Advanced", learningResource: resource });
      } else if (hasSubject) {
        developing.push({ ...skillObj, status: "Developing", currentProficiency: "Intermediate", learningResource: resource });
      } else {
        missing.push({ ...skillObj, status: "Missing", currentProficiency: "Needs Learning", learningResource: resource });
      }
    });

    const total = allCareerSkills.length || 1;
    const readinessScore = Math.min(100, Math.round(((strong.length * 1.0 + developing.length * 0.5) / total) * 100));

    // Dynamic career recommendations filtered by student's exact domain & department
    const profileText = `${profile.domain || ''} ${profile.specialization || ''} ${profile.degreeProgramme || ''} ${profile.field || ''}`.toLowerCase();
    
    let domainCareers = [];
    if (/eee|electrical|power|voltage|energy/.test(profileText)) {
      domainCareers = [
        "Electrical Engineer",
        "Robotics Engineer",
        "Embedded Systems Engineer",
        "Control Systems Engineer",
        "Power Systems Engineer",
        "Computer Hardware Engineer"
      ];
    } else if (/ece|electronics|telecom|communication|vlsi/.test(profileText)) {
      domainCareers = [
        "Embedded Systems Engineer",
        "Robotics Engineer",
        "Computer Hardware Engineer",
        "Electronics Engineer",
        "Software Developer"
      ];
    } else if (/mechanical|mech|thermal|automobile|aerospace|mechatronics/.test(profileText)) {
      domainCareers = [
        "Mechanical Engineer",
        "Robotics Engineer",
        "Aerospace Engineer",
        "Nuclear Engineer",
        "Automotive Systems Engineer"
      ];
    } else if (/civil|structural|construction|geotechnical/.test(profileText)) {
      domainCareers = [
        "Civil Engineer",
        "Structural Engineer",
        "Environmental Engineer"
      ];
    } else if (/cs|computer|it|software|data|ai|machine learning/.test(profileText)) {
      domainCareers = [
        "Software Engineer",
        "Full Stack Developer",
        "Data Scientist",
        "Machine Learning Engineer",
        "Artificial Intelligence Engineer",
        "Data Analyst"
      ];
    }

    const allCareerTitles = allCareers.map(c => c.title);
    
    // Careers from catalog that match the domain rule
    const validDomainCareers = domainCareers.filter(dc => 
      allCareerTitles.some(act => act.toLowerCase() === dc.toLowerCase())
    );

    // Also include any catalog careers whose requiredDomains match the profile text
    const catalogDomainMatches = allCareers
      .filter(c => {
        const domMatch = (c.requiredDomains || []).some(d => profileText.includes(d.toLowerCase()));
        return domMatch;
      })
      .map(c => c.title);

    const mergedRecommended = [...new Set([...validDomainCareers, ...catalogDomainMatches])];
    const finalRecommended = mergedRecommended.length > 0 ? mergedRecommended : allCareerTitles.slice(0, 6);

    res.status(200).json({
      success: true,
      targetCareer: fullCareer.title,
      readinessScore,
      skills: {
        strong,
        developing,
        missing
      },
      summary: {
        acquiredCount: strong.length,
        developingCount: developing.length,
        missingCount: missing.length,
        totalRequired: total
      },
      recommendedCareers: finalRecommended,
      allCareers: allCareerTitles
    });
  } catch (error) {
    console.error("Get student skill gap error:", error);
    res.status(500).json({ success: false, message: "Failed to compute skill gap analysis" });
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

// ── 5. GET & UPDATE Learning Roadmap ──────────────────────────────────────────
const getStudentRoadmap = async (req, res) => {
  try {
    const userId = req.student?._id || req.user?._id || req.student?.id;
    const [profile, skillProgress] = await Promise.all([
      CollegeStudentProfile.findOne({ userId }),
      StudentSkillProgress.findOne({ $or: [{ studentId: userId }, { userId }] }).lean()
    ]);

    if (!profile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    const targetTitle = profile.targetCareer || "Software Engineer";
    let career = await CollegeCareerCatalog.findOne({
      $or: [
        { title: new RegExp(`^${targetTitle}$`, "i") },
        { slug: targetTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
        { title: new RegExp(targetTitle, "i") }
      ]
    });
    if (!career) {
      career = await CollegeCareerCatalog.findOne();
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
      profileTarget: profile.targetCareer
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
  getStudentRoadmap,
  updateRoadmapProgress,
  runAcceptanceTestProfiles,
  compareCareers,
  getAllCareersAdmin,
  adminSaveCareer,
  adminDeleteCareer,
  ROLE_SPECIALIZED_DATA,
  SKILL_RESOURCE_MAP,
  getLearningResourceForSkill
};
