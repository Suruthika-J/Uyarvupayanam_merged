const CseSkillQuestion = require("../models/CseSkillQuestion");

const DEFAULT_CSE_MCQ_QUESTIONS = [
  // 🌐 DOMAIN 1: FULL-STACK WEB & SOFTWARE
  {
    questionNumber: 1,
    questionText: "Which component in a modern full-stack web application is primarily responsible for routing HTTP requests, executing business logic, and querying the database?",
    domain: "Full-Stack Web & Software",
    difficulty: "Easy",
    skillTag: "Full Stack Web (React / Node)",
    options: [
      { optionId: "c1_a", text: "Client Browser Rendering Engine (V8 / JavaScript)", isCorrect: false, scorePoints: 0 },
      { optionId: "c1_b", text: "Backend Web Server & API Gateway (Node.js / Express / Spring)", isCorrect: true, scorePoints: 1 },
      { optionId: "c1_c", text: "Content Delivery Network (CDN Edge Node)", isCorrect: false, scorePoints: 0 },
      { optionId: "c1_d", text: "Relational Database Storage Engine", isCorrect: false, scorePoints: 0 }
    ],
    explanation: "Backend API servers handle application business logic, incoming HTTP routes, and database interactions."
  },
  {
    questionNumber: 2,
    questionText: "In RESTful API design standards, which HTTP method and response status code should be returned when a client successfully creates a new record?",
    domain: "Full-Stack Web & Software",
    difficulty: "Medium",
    skillTag: "Full Stack Web (React / Node)",
    options: [
      { optionId: "c2_a", text: "GET with 200 OK status code", isCorrect: false, scorePoints: 0 },
      { optionId: "c2_b", text: "POST with 201 Created status code", isCorrect: true, scorePoints: 2 },
      { optionId: "c2_c", text: "PUT with 204 No Content status code", isCorrect: false, scorePoints: 0 },
      { optionId: "c2_d", text: "PATCH with 304 Not Modified status code", isCorrect: false, scorePoints: 0 }
    ],
    explanation: "POST requests create new resources, and 201 Created indicates successful resource instantiation."
  },
  {
    questionNumber: 3,
    questionText: "How does JSON Web Token (JWT) stateless authentication verify request authorization without making session lookup calls to a server database?",
    domain: "Full-Stack Web & Software",
    difficulty: "Hard",
    skillTag: "Full Stack Web (React / Node)",
    options: [
      { optionId: "c3_a", text: "By checking the client IP address against a whitelist table", isCorrect: false, scorePoints: 0 },
      { optionId: "c3_b", text: "By validating the cryptographic signature encoded in the token header using a secret key", isCorrect: true, scorePoints: 3 },
      { optionId: "c3_c", text: "By storing active user session IDs in browser cookies", isCorrect: false, scorePoints: 0 },
      { optionId: "c3_d", text: "By encrypting the entire HTTP payload with SSL/TLS certificates", isCorrect: false, scorePoints: 0 }
    ],
    explanation: "JWTs contain a digital signature that servers verify cryptographically without database session lookups."
  },

  // 🧠 DOMAIN 2: ARTIFICIAL INTELLIGENCE & MACHINE LEARNING
  {
    questionNumber: 4,
    questionText: "Which machine learning paradigm uses labeled historical datasets containing known input features and ground-truth output labels to train predictive models?",
    domain: "Artificial Intelligence & ML",
    difficulty: "Easy",
    skillTag: "AI & Machine Learning",
    options: [
      { optionId: "c4_a", text: "Reinforcement Learning", isCorrect: false, scorePoints: 0 },
      { optionId: "c4_b", text: "Supervised Learning", isCorrect: true, scorePoints: 1 },
      { optionId: "c4_c", text: "Unsupervised Clustering", isCorrect: false, scorePoints: 0 },
      { optionId: "c4_d", text: "Generative Adversarial Learning", isCorrect: false, scorePoints: 0 }
    ],
    explanation: "Supervised learning algorithms learn mapping functions from labeled input-output pairs."
  },
  {
    questionNumber: 5,
    questionText: "In Deep Neural Network architectures, what is the primary mathematical purpose of non-linear Activation Functions (such as ReLU or Sigmoid)?",
    domain: "Artificial Intelligence & ML",
    difficulty: "Medium",
    skillTag: "AI & Machine Learning",
    options: [
      { optionId: "c5_a", text: "To flatten high-dimensional image tensors into 1D vectors", isCorrect: false, scorePoints: 0 },
      { optionId: "c5_b", text: "To introduce non-linearity enabling networks to learn complex non-linear relationships", isCorrect: true, scorePoints: 2 },
      { optionId: "c5_c", text: "To force network loss value down to zero immediately", isCorrect: false, scorePoints: 0 },
      { optionId: "c5_d", text: "To parallelize matrix multiplication across GPU compute cores", isCorrect: false, scorePoints: 0 }
    ],
    explanation: "Without non-linear activation functions, deep networks would reduce to simple linear regression models regardless of depth."
  },
  {
    questionNumber: 6,
    questionText: "What core innovation allows Transformer architectures (like GPT & BERT) to process long text sequences simultaneously rather than sequentially like RNNs?",
    domain: "Artificial Intelligence & ML",
    difficulty: "Hard",
    skillTag: "AI & Machine Learning",
    options: [
      { optionId: "c6_a", text: "Convolutional Sliding Filters", isCorrect: false, scorePoints: 0 },
      { optionId: "c6_b", text: "Scaled Dot-Product Self-Attention Mechanism", isCorrect: true, scorePoints: 3 },
      { optionId: "c6_c", text: "Recurrent Memory Cells (LSTM/GRU)", isCorrect: false, scorePoints: 0 },
      { optionId: "c6_d", text: "Max Pooling & Strided Reduction Layers", isCorrect: false, scorePoints: 0 }
    ],
    explanation: "Self-attention enables Transformers to compute contextual relationships across all tokens simultaneously."
  },

  // 📊 DOMAIN 3: DATA SCIENCE & ANALYTICS
  {
    questionNumber: 7,
    questionText: "In Data Science workflows using Python, which open-source library provides DataFrames for efficient tabular data cleaning, filtering, and aggregation?",
    domain: "Data Science & Analytics",
    difficulty: "Easy",
    skillTag: "Python / Data Science",
    options: [
      { optionId: "c7_a", text: "Matplotlib", isCorrect: false, scorePoints: 0 },
      { optionId: "c7_b", text: "Pandas", isCorrect: true, scorePoints: 1 },
      { optionId: "c7_c", text: "Scikit-Learn", isCorrect: false, scorePoints: 0 },
      { optionId: "c7_d", text: "Flask", isCorrect: false, scorePoints: 0 }
    ],
    explanation: "Pandas is the core Python data structure library for manipulating tabular dataset DataFrames."
  },
  {
    questionNumber: 8,
    questionText: "Which SQL clause combines rows from two relational tables based on a shared key, returning ONLY rows that have matching keys in BOTH tables?",
    domain: "Data Science & Analytics",
    difficulty: "Medium",
    skillTag: "Python / Data Science",
    options: [
      { optionId: "c8_a", text: "FULL OUTER JOIN", isCorrect: false, scorePoints: 0 },
      { optionId: "c8_b", text: "INNER JOIN", isCorrect: true, scorePoints: 2 },
      { optionId: "c8_c", text: "LEFT JOIN", isCorrect: false, scorePoints: 0 },
      { optionId: "c8_d", text: "CROSS JOIN", isCorrect: false, scorePoints: 0 }
    ],
    explanation: "INNER JOIN selects records with matching foreign-primary key values in both participating tables."
  },
  {
    questionNumber: 9,
    questionText: "When processing Big Data volumes that exceed single-machine memory limits, which distributed computing abstraction distributes data across a server cluster?",
    domain: "Data Science & Analytics",
    difficulty: "Hard",
    skillTag: "Python / Data Science",
    options: [
      { optionId: "c9_a", text: "SQL Stored Procedures", isCorrect: false, scorePoints: 0 },
      { optionId: "c9_b", text: "Resilient Distributed Datasets (RDD) in Apache Spark", isCorrect: true, scorePoints: 3 },
      { optionId: "c9_c", text: "Single-Threaded CSV Parsers", isCorrect: false, scorePoints: 0 },
      { optionId: "c9_d", text: "In-Memory SQLite Drivers", isCorrect: false, scorePoints: 0 }
    ],
    explanation: "Apache Spark RDDs partition large datasets across multiple worker nodes for parallel fault-tolerant computation."
  },

  // 🛡️ DOMAIN 4: CYBERSECURITY & DEVSECOPS
  {
    questionNumber: 10,
    questionText: "Which severe application vulnerability occurs when unsanitized user inputs are directly concatenated into backend SQL query strings?",
    domain: "Cybersecurity & DevSecOps",
    difficulty: "Easy",
    skillTag: "Cyber Security / Ethical Hacking",
    options: [
      { optionId: "c10_a", text: "Cross-Site Scripting (XSS)", isCorrect: false, scorePoints: 0 },
      { optionId: "c10_b", text: "SQL Injection (SQLi)", isCorrect: true, scorePoints: 1 },
      { optionId: "c10_c", text: "Buffer Overflow", isCorrect: false, scorePoints: 0 },
      { optionId: "c10_d", text: "Man-in-the-Middle Attack", isCorrect: false, scorePoints: 0 }
    ],
    explanation: "SQL Injection permits attackers to manipulate database command execution when inputs are unparameterized."
  },
  {
    questionNumber: 11,
    questionText: "In Asymmetric Public-Key Encryption (such as RSA or ECC), which key must be used to decrypt data that was encrypted with a user's Public Key?",
    domain: "Cybersecurity & DevSecOps",
    difficulty: "Medium",
    skillTag: "Cyber Security / Ethical Hacking",
    options: [
      { optionId: "c11_a", text: "The sender's Public Key", isCorrect: false, scorePoints: 0 },
      { optionId: "c11_b", text: "The recipient's Private Key", isCorrect: true, scorePoints: 2 },
      { optionId: "c11_c", text: "A shared symmetric passphrase", isCorrect: false, scorePoints: 0 },
      { optionId: "c11_d", text: "The Certificate Authority Root Key", isCorrect: false, scorePoints: 0 }
    ],
    explanation: "In asymmetric cryptography, data encrypted with a Public Key can only be decrypted by the matching secret Private Key."
  },
  {
    questionNumber: 12,
    questionText: "What foundational security architecture principle asserts that no entity, user, or device inside or outside the network perimeter is trusted by default?",
    domain: "Cybersecurity & DevSecOps",
    difficulty: "Hard",
    skillTag: "Cyber Security / Ethical Hacking",
    options: [
      { optionId: "c12_a", text: "Traditional Castle-and-Moat Firewall Defense", isCorrect: false, scorePoints: 0 },
      { optionId: "c12_b", text: "Zero-Trust Architecture (ZTA)", isCorrect: true, scorePoints: 3 },
      { optionId: "c12_c", text: "Single Sign-On Authentication (SSO)", isCorrect: false, scorePoints: 0 },
      { optionId: "c12_d", text: "Basic Role-Based Access Control (RBAC)", isCorrect: false, scorePoints: 0 }
    ],
    explanation: "Zero Trust enforces continuous identity verification and explicit authorization for every access request."
  },

  // ☁️ DOMAIN 5: CLOUD COMPUTING & DEVOPS
  {
    questionNumber: 13,
    questionText: "Which cloud service model provides virtual infrastructure (VMs, storage networks, firewalls) where developers manage the operating system and applications?",
    domain: "Cloud Computing & DevOps",
    difficulty: "Easy",
    skillTag: "Cloud Computing & DevOps",
    options: [
      { optionId: "c13_a", text: "Software as a Service (SaaS)", isCorrect: false, scorePoints: 0 },
      { optionId: "c13_b", text: "Infrastructure as a Service (IaaS)", isCorrect: true, scorePoints: 1 },
      { optionId: "c13_c", text: "Platform as a Service (PaaS)", isCorrect: false, scorePoints: 0 },
      { optionId: "c13_d", text: "Function as a Service (FaaS)", isCorrect: false, scorePoints: 0 }
    ],
    explanation: "IaaS providers (like AWS EC2 or GCP Compute Engine) deliver raw virtualized computing infrastructure."
  },
  {
    questionNumber: 14,
    questionText: "What is a primary architectural advantage of Docker Containers compared to traditional Virtual Machines (VMs)?",
    domain: "Cloud Computing & DevOps",
    difficulty: "Medium",
    skillTag: "Cloud Computing & DevOps",
    options: [
      { optionId: "c14_a", text: "Containers run hypervisors with full guest Operating Systems", isCorrect: false, scorePoints: 0 },
      { optionId: "c14_b", text: "Containers share the host OS kernel making them lightweight, fast, and resource-efficient", isCorrect: true, scorePoints: 2 },
      { optionId: "c14_c", text: "Containers eliminate the need for CPU memory allocation", isCorrect: false, scorePoints: 0 },
      { optionId: "c14_d", text: "Containers only run on specialized Linux hardware", isCorrect: false, scorePoints: 0 }
    ],
    explanation: "Containers virtualize at the OS level, sharing host kernel resources rather than running complete guest OS instances."
  },
  {
    questionNumber: 15,
    questionText: "According to the CAP Theorem for distributed data stores, during a network partition (P), what trade-off must system architects choose between?",
    domain: "Cloud Computing & DevOps",
    difficulty: "Hard",
    skillTag: "Cloud Computing & DevOps",
    options: [
      { optionId: "c15_a", text: "Latency vs Encryption Speed", isCorrect: false, scorePoints: 0 },
      { optionId: "c15_b", text: "Consistency (CP) vs Availability (AP)", isCorrect: true, scorePoints: 3 },
      { optionId: "c15_c", text: "Throughput vs Compression Ratio", isCorrect: false, scorePoints: 0 },
      { optionId: "c15_d", text: "Durability vs Replication Factor", isCorrect: false, scorePoints: 0 }
    ],
    explanation: "CAP Theorem states that when network partitions occur, distributed systems must choose between Consistency or Availability."
  },

  // ⚡ DOMAIN 6: ALGORITHMS & DATA STRUCTURES
  {
    questionNumber: 16,
    questionText: "What is the average time complexity for searching an item in a sorted array using Binary Search or in a balanced Binary Search Tree (BST)?",
    domain: "Algorithms & Data Structures",
    difficulty: "Easy",
    skillTag: "Problem Solving & Logic",
    options: [
      { optionId: "c16_a", text: "O(N^2)", isCorrect: false, scorePoints: 0 },
      { optionId: "c16_b", text: "O(log N)", isCorrect: true, scorePoints: 1 },
      { optionId: "c16_c", text: "O(N)", isCorrect: false, scorePoints: 0 },
      { optionId: "c16_d", text: "O(1)", isCorrect: false, scorePoints: 0 }
    ],
    explanation: "Binary search halves the search space at each step, yielding logarithmic O(log N) time complexity."
  },
  {
    questionNumber: 17,
    questionText: "Which algorithm design paradigm solves complex optimization problems by breaking them into overlapping subproblems and caching subproblem results (Memoization)?",
    domain: "Algorithms & Data Structures",
    difficulty: "Medium",
    skillTag: "Problem Solving & Logic",
    options: [
      { optionId: "c17_a", text: "Greedy Algorithm", isCorrect: false, scorePoints: 0 },
      { optionId: "c17_b", text: "Dynamic Programming (DP)", isCorrect: true, scorePoints: 2 },
      { optionId: "c17_c", text: "Divide and Conquer", isCorrect: false, scorePoints: 0 },
      { optionId: "c17_d", text: "Backtracking Search", isCorrect: false, scorePoints: 0 }
    ],
    explanation: "Dynamic Programming avoids recomputing solutions to overlapping subproblems through memoization or tabulation."
  },
  {
    questionNumber: 18,
    questionText: "In graph theory, which greedy algorithm calculates the shortest path from a starting source node to all other nodes in a weighted graph with non-negative edge weights?",
    domain: "Algorithms & Data Structures",
    difficulty: "Hard",
    skillTag: "Problem Solving & Logic",
    options: [
      { optionId: "c18_a", text: "Depth First Search (DFS)", isCorrect: false, scorePoints: 0 },
      { optionId: "c18_b", text: "Dijkstra's Algorithm", isCorrect: true, scorePoints: 3 },
      { optionId: "c18_c", text: "Kruskal's Minimum Spanning Tree Algorithm", isCorrect: false, scorePoints: 0 },
      { optionId: "c18_d", text: "Breadth First Search (BFS)", isCorrect: false, scorePoints: 0 }
    ],
    explanation: "Dijkstra's algorithm uses a priority queue to iteratively extract the closest unvisited node in weighted non-negative graphs."
  }
];

const seedCseSkillQuestions = async () => {
  try {
    const ops = DEFAULT_CSE_MCQ_QUESTIONS.map(q => ({
      updateOne: {
        filter: { questionNumber: q.questionNumber },
        update: { $set: q },
        upsert: true
      }
    }));

    const res = await CseSkillQuestion.bulkWrite(ops);
    const added = res.upsertedCount || 0;
    const updated = res.modifiedCount || 0;
    console.log(`✅ CSE Skill 18 Default MCQ Questions seeded: ${added} added, ${updated} updated.`);
  } catch (err) {
    console.error("Error seeding CSE Skill MCQ questions:", err.message);
  }
};

module.exports = { seedCseSkillQuestions, DEFAULT_CSE_MCQ_QUESTIONS };
