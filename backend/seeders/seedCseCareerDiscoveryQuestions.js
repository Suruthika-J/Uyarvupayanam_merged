const mongoose = require("mongoose");
const AhpFuzzyQuestion = require("../models/AhpFuzzyQuestion");

// EXACT 7 CSE DOMAINS FROM STEP 4 UI
const EXACT_CSE_DOMAINS = [
  { id: "software_engineering", prefix: "SE", name: "Software Engineering & Architecture" },
  { id: "ai_ml", prefix: "AI", name: "Artificial Intelligence & Machine Learning" },
  { id: "data_science", prefix: "DS", name: "Data Science & Big Data Analytics" },
  { id: "cyber_security", prefix: "CYBER", name: "Cyber Security & Ethical Hacking" },
  { id: "cloud_devops", prefix: "CLOUD", name: "Cloud Computing & DevOps" },
  { id: "full_stack", prefix: "FS", name: "Full Stack Web & Mobile Development" },
  { id: "algorithms_systems", prefix: "ALG", name: "Algorithms & System Programming" }
];

const DOMAIN_DATA_BANK = {
  software_engineering: {
    skills: ["problem_solving", "system_thinking", "software_design", "logical_reasoning", "debugging"],
    easy: [
      { text: "When decomposing a large software project, what is your initial architectural step?", type: "conceptual", skills: ["system_thinking", "software_design"] },
      { text: "Which Git workflow strategy prevents broken code from polluting production branches?", type: "scenario", skills: ["software_design", "logical_reasoning"] },
      { text: "How do you apply DRY (Don't Repeat Yourself) principles when writing repetitive function logic?", type: "problem_solving", skills: ["problem_solving", "software_design"] },
      { text: "What primary software design metric dictates that a function should perform exactly one task?", type: "conceptual", skills: ["software_design", "logical_reasoning"] },
      { text: "When a null pointer exception is reported, what systematic debugging step do you perform first?", type: "debugging", skills: ["debugging", "problem_solving"] }
    ],
    medium: [
      { text: "How do you guarantee idempotency in payment processing APIs under high network latency?", type: "architecture", skills: ["system_thinking", "problem_solving"] },
      { text: "When migrating legacy monolithic code to microservices, which pattern prevents zero-downtime breaks?", type: "architecture", skills: ["system_thinking", "software_design"] },
      { text: "How do you investigate and fix a node process memory leak occurring in background workers?", type: "debugging", skills: ["debugging", "logical_reasoning"] },
      { text: "Which design pattern is best suited for decoupling notification channels (Email, SMS, Push)?", type: "architecture", skills: ["software_design", "system_thinking"] },
      { text: "How do you enforce consistent code formatting and static code quality across a 15-developer team?", type: "decision", skills: ["software_design", "logical_reasoning"] }
    ],
    hard: [
      { text: "How do you achieve distributed transactional consistency across microservices without 2PC deadlocks?", type: "architecture", skills: ["system_thinking", "problem_solving"] },
      { text: "What trade-offs must be evaluated between Event Sourcing and Traditional CRUD architectures?", type: "architecture", skills: ["software_design", "system_thinking"] },
      { text: "In a gateway processing 100k requests/sec, how do Circuit Breakers prevent cascading thread exhaustion?", type: "architecture", skills: ["system_thinking", "debugging"] },
      { text: "How do you isolate and debug an intermittent multi-threaded lock deadlock in production?", type: "debugging", skills: ["debugging", "logical_reasoning"] },
      { text: "What Domain-Driven Design (DDD) construct protects consistency invariants across service boundaries?", type: "conceptual", skills: ["software_design", "system_thinking"] }
    ]
  },
  ai_ml: {
    skills: ["analytical_thinking", "pattern_recognition", "mathematical_readiness", "problem_solving", "algorithmic_thinking"],
    easy: [
      { text: "What is the primary objective of supervised learning algorithms during model training?", type: "conceptual", skills: ["analytical_thinking", "pattern_recognition"] },
      { text: "How does model overfitting impact performance on unseen validation dataset samples?", type: "conceptual", skills: ["analytical_thinking", "mathematical_readiness"] },
      { text: "What loss evaluation metric measures prediction error in linear regression tasks?", type: "conceptual", skills: ["mathematical_readiness", "analytical_thinking"] },
      { text: "Which feature scaling technique normalizes continuous numeric features into a [0, 1] range?", type: "problem_solving", skills: ["pattern_recognition", "analytical_thinking"] },
      { text: "What fundamental role do non-linear activation functions play in deep neural networks?", type: "conceptual", skills: ["mathematical_readiness", "algorithmic_thinking"] }
    ],
    medium: [
      { text: "How does Stochastic Gradient Descent adjust model weights relative to computed loss gradients?", type: "conceptual", skills: ["mathematical_readiness", "algorithmic_thinking"] },
      { text: "On imbalanced classification datasets, why is F1-Score preferable to raw Accuracy?", type: "decision", skills: ["analytical_thinking", "pattern_recognition"] },
      { text: "How do Convolutional Neural Networks (CNNs) extract spatial feature hierarchies from images?", type: "architecture", skills: ["pattern_recognition", "analytical_thinking"] },
      { text: "How does L2 (Ridge) regularization prevent extreme weight magnitudes during model fitting?", type: "conceptual", skills: ["mathematical_readiness", "analytical_thinking"] },
      { text: "What advantage do ensemble methods (XGBoost / Random Forest) provide over single decision trees?", type: "conceptual", skills: ["pattern_recognition", "problem_solving"] }
    ],
    hard: [
      { text: "How do self-attention mechanisms in Transformer models calculate sequence context in parallel?", type: "architecture", skills: ["pattern_recognition", "algorithmic_thinking"] },
      { text: "How does Backpropagation Through Time (BPTT) manage vanishing gradients in recurrent networks?", type: "debugging", skills: ["mathematical_readiness", "analytical_thinking"] },
      { text: "How do Vector Databases execute approximate nearest neighbor (ANN) retrieval for LLM embeddings?", type: "architecture", skills: ["algorithmic_thinking", "problem_solving"] },
      { text: "What architectural trade-offs exist between full model fine-tuning and LoRA parameter-efficient adaptation?", type: "decision", skills: ["analytical_thinking", "algorithmic_thinking"] },
      { text: "How does RLHF (Reinforcement Learning from Human Feedback) optimize policy models via reward signals?", type: "architecture", skills: ["analytical_thinking", "pattern_recognition"] }
    ]
  },
  data_science: {
    skills: ["analytical_thinking", "data_interpretation", "mathematical_readiness", "pattern_recognition", "problem_solving"],
    easy: [
      { text: "What visual plot best displays continuous numerical variable distributions across datasets?", type: "conceptual", skills: ["data_interpretation", "analytical_thinking"] },
      { text: "How do missing dataset values skew statistical mean calculations if left unhandled?", type: "conceptual", skills: ["data_interpretation", "mathematical_readiness"] },
      { text: "What statistic quantifies the linear correlation strength between two quantitative variables?", type: "conceptual", skills: ["mathematical_readiness", "data_interpretation"] },
      { text: "Which pandas operations group records by category to derive aggregated metrics?", type: "problem_solving", skills: ["analytical_thinking", "data_interpretation"] },
      { text: "What is the key distinction between a population parameter and a sample statistic?", type: "conceptual", skills: ["mathematical_readiness", "analytical_thinking"] }
    ],
    medium: [
      { text: "How do you conduct A/B hypothesis testing to establish statistically significant conversion lift?", type: "decision", skills: ["analytical_thinking", "mathematical_readiness"] },
      { text: "When features display severe multicollinearity, how does Principal Component Analysis (PCA) help?", type: "architecture", skills: ["mathematical_readiness", "pattern_recognition"] },
      { text: "How do box plots identify statistical dataset outliers using the Interquartile Range (IQR)?", type: "debugging", skills: ["data_interpretation", "analytical_thinking"] },
      { text: "What critical flaws are introduced when data leakage occurs between train and test splits?", type: "debugging", skills: ["analytical_thinking", "data_interpretation"] },
      { text: "How do MCMC (Markov Chain Monte Carlo) algorithms sample posterior probability distributions?", type: "conceptual", skills: ["mathematical_readiness", "pattern_recognition"] }
    ],
    hard: [
      { text: "How do causal inference frameworks (DAGs / Propensity Scores) isolate true intervention impact?", type: "architecture", skills: ["analytical_thinking", "mathematical_readiness"] },
      { text: "How do Cox Proportional Hazards models evaluate censored time-to-event survival datasets?", type: "conceptual", skills: ["mathematical_readiness", "data_interpretation"] },
      { text: "What cost objective function does t-SNE / UMAP minimize during high-dimensional manifold projection?", type: "architecture", skills: ["pattern_recognition", "mathematical_readiness"] },
      { text: "How do time-series models (ARIMA / Prophet) isolate trend, seasonality, and stationarity components?", type: "problem_solving", skills: ["analytical_thinking", "pattern_recognition"] },
      { text: "How do time-aware cross-validation splits prevent future data leakage in temporal prediction models?", type: "decision", skills: ["data_interpretation", "analytical_thinking"] }
    ]
  },
  cyber_security: {
    skills: ["logical_reasoning", "attention_to_detail", "security_awareness", "problem_solving", "persistence"],
    easy: [
      { text: "What fundamental security rule restricts user access strictly to the minimal permissions required?", type: "conceptual", skills: ["security_awareness", "attention_to_detail"] },
      { text: "How does Multi-Factor Authentication (MFA) defend against stolen credential attacks?", type: "conceptual", skills: ["security_awareness", "logical_reasoning"] },
      { text: "What utility scans network endpoints to discover open ports and active service versions?", type: "conceptual", skills: ["security_awareness", "logical_reasoning"] },
      { text: "Why does HTTPS provide stronger transport layer security than plain unencrypted HTTP?", type: "conceptual", skills: ["security_awareness", "attention_to_detail"] },
      { text: "What social engineering attack vector tricks targets into exposing passwords via spoofed emails?", type: "decision", skills: ["security_awareness", "logical_reasoning"] }
    ],
    medium: [
      { text: "How do Web Application Firewalls (WAF) inspect payload signatures to block SQLi & XSS attacks?", type: "architecture", skills: ["security_awareness", "attention_to_detail"] },
      { text: "How does asymmetric RSA key exchange establish a symmetric AES session key during TLS handshakes?", type: "conceptual", skills: ["security_awareness", "logical_reasoning"] },
      { text: "How do security researchers leverage stack buffer overflow flaws to hijack execution control flow?", type: "problem_solving", skills: ["security_awareness", "persistence"] },
      { text: "What Content Security Policy (CSP) headers effectively mitigate Cross-Site Scripting (XSS)?", type: "decision", skills: ["security_awareness", "attention_to_detail"] },
      { text: "How do Intrusion Detection Systems (IDS) use anomaly baselines to catch zero-day exploits?", type: "architecture", skills: ["security_awareness", "logical_reasoning"] }
    ],
    hard: [
      { text: "How do reverse engineers analyze obfuscated malware binaries using disassemblers (Ghidra/IDA)?", type: "debugging", skills: ["persistence", "attention_to_detail"] },
      { text: "How does Zero-Trust Network Access (ZTNA) enforce continuous identity verification & microsegmentation?", type: "architecture", skills: ["security_awareness", "logical_reasoning"] },
      { text: "How do side-channel attacks extract secret keys by measuring cache access latency or power draw?", type: "conceptual", skills: ["attention_to_detail", "logical_reasoning"] },
      { text: "What mathematical properties render SHA-256 collision-resistant for digital signature validation?", type: "conceptual", skills: ["security_awareness", "logical_reasoning"] },
      { text: "How do incident response teams isolate and remediate Active Directory ransomware compromises?", type: "scenario", skills: ["persistence", "problem_solving"] }
    ]
  },
  cloud_devops: {
    skills: ["system_thinking", "problem_solving", "troubleshooting", "infrastructure_reasoning", "persistence"],
    easy: [
      { text: "What is the primary difference between Infrastructure as a Service (IaaS) and Platform as a Service (PaaS)?", type: "conceptual", skills: ["system_thinking", "infrastructure_reasoning"] },
      { text: "How do Docker containers package application code with dependencies for reproducible execution?", type: "conceptual", skills: ["system_thinking", "infrastructure_reasoning"] },
      { text: "What central logging framework aggregates container logs across distributed microservice clusters?", type: "conceptual", skills: ["troubleshooting", "system_thinking"] },
      { text: "Why are cloud server instances deployed across multiple geographic Availability Zones (AZs)?", type: "conceptual", skills: ["infrastructure_reasoning", "system_thinking"] },
      { text: "What automated CI pipeline step prevents broken code from being merged into main branches?", type: "conceptual", skills: ["system_thinking", "troubleshooting"] }
    ],
    medium: [
      { text: "How does Infrastructure as Code (Terraform) enforce declarative state across cloud environments?", type: "architecture", skills: ["infrastructure_reasoning", "system_thinking"] },
      { text: "How do Kubernetes Pods, Deployments, and Services coordinate container scaling & self-healing?", type: "architecture", skills: ["system_thinking", "troubleshooting"] },
      { text: "How does Blue-Green deployment strategy enable zero-downtime application releases?", type: "scenario", skills: ["infrastructure_reasoning", "problem_solving"] },
      { text: "When microservice response latency spikes, how do Prometheus metrics aid root-cause diagnosis?", type: "debugging", skills: ["troubleshooting", "system_thinking"] },
      { text: "How do GitOps engines (ArgoCD) continuously reconcile live Kubernetes clusters with Git repos?", type: "architecture", skills: ["infrastructure_reasoning", "system_thinking"] }
    ],
    hard: [
      { text: "How do Site Reliability Engineers (SREs) compute Error Budgets based on Service Level Objectives (SLOs)?", type: "decision", skills: ["system_thinking", "infrastructure_reasoning"] },
      { text: "How do eBPF kernel probes trace system calls without incurring traditional agent overhead?", type: "architecture", skills: ["troubleshooting", "system_thinking"] },
      { text: "How do Chaos Engineering experiments (Chaos Mesh) proactively discover distributed failure modes?", type: "scenario", skills: ["persistence", "troubleshooting"] },
      { text: "How do multi-cloud active-active architectures maintain cross-region database replication failover?", type: "architecture", skills: ["infrastructure_reasoning", "system_thinking"] },
      { text: "How do high-availability etcd clusters maintain state consensus via the Raft protocol under network partitions?", type: "conceptual", skills: ["system_thinking", "troubleshooting"] }
    ]
  },
  full_stack: {
    skills: ["programming_readiness", "problem_solving", "system_thinking", "debugging", "technical_curiosity"],
    easy: [
      { text: "How do asynchronous fetch requests connect a React client state to an Express REST API backend?", type: "conceptual", skills: ["programming_readiness", "system_thinking"] },
      { text: "What authentication mechanism uses signed cryptographic JWT tokens sent via HTTP Headers?", type: "conceptual", skills: ["programming_readiness", "technical_curiosity"] },
      { text: "When web page assets load slowly, what full stack optimization step yields immediate speedup?", type: "problem_solving", skills: ["problem_solving", "system_thinking"] },
      { text: "What is the primary benefit of Virtual DOM diffing in modern single page application (SPA) frameworks?", type: "conceptual", skills: ["programming_readiness", "technical_curiosity"] },
      { text: "How do you diagnose and fix a CORS (Cross-Origin Resource Sharing) block on API requests?", type: "debugging", skills: ["debugging", "programming_readiness"] }
    ],
    medium: [
      { text: "How does Server-Side Rendering (SSR) in Next.js pre-render HTML pages to improve initial SEO indexability?", type: "architecture", skills: ["system_thinking", "programming_readiness"] },
      { text: "In React Native, how do you keep JavaScript thread UI rendering smooth during heavy computations?", type: "problem_solving", skills: ["problem_solving", "debugging"] },
      { text: "How do parameterized database queries prevent SQL Injection attacks in web controllers?", type: "scenario", skills: ["programming_readiness", "debugging"] },
      { text: "Which protocol (WebSockets / HTTP Polling) is best suited for building real-time multi-user chat apps?", type: "architecture", skills: ["system_thinking", "problem_solving"] },
      { text: "How do selector-based state management tools (Zustand / Redux) prevent unnecessary React re-renders?", type: "debugging", skills: ["debugging", "programming_readiness"] }
    ],
    hard: [
      { text: "How do Service Workers, IndexedDB, and Workbox build offline-first PWA applications with background sync?", type: "architecture", skills: ["system_thinking", "programming_readiness"] },
      { text: "How does Apollo Federation combine microservice subgraphs into a unified GraphQL supergraph router?", type: "architecture", skills: ["system_thinking", "problem_solving"] },
      { text: "How do SameSite cookie flags and anti-CSRF double-submit tokens block cross-site request forgery?", type: "decision", skills: ["debugging", "programming_readiness"] },
      { text: "How do AOT compilation engines (Hermes) accelerate cold-boot Time-to-Interactive in mobile apps?", type: "debugging", skills: ["debugging", "technical_curiosity"] },
      { text: "What auto-scaling architecture prevents server crashes under sudden 100x traffic spikes?", type: "architecture", skills: ["system_thinking", "problem_solving"] }
    ]
  },
  algorithms_systems: {
    skills: ["logical_reasoning", "algorithmic_thinking", "problem_solving", "mathematical_readiness", "system_thinking"],
    easy: [
      { text: "What is the main distinction between Stack and Heap memory allocation in low-level programming?", type: "conceptual", skills: ["algorithmic_thinking", "system_thinking"] },
      { text: "Why are raw uninitialized memory pointers dangerous in C/C++ applications?", type: "conceptual", skills: ["logical_reasoning", "problem_solving"] },
      { text: "What compiler stage transforms C source code into target CPU assembly instructions?", type: "conceptual", skills: ["algorithmic_thinking", "logical_reasoning"] },
      { text: "What core Operating System component manages CPU process scheduling and memory isolation?", type: "conceptual", skills: ["system_thinking", "logical_reasoning"] },
      { text: "What is the purpose of system calls (syscalls) in kernel operating system architectures?", type: "conceptual", skills: ["system_thinking", "algorithmic_thinking"] }
    ],
    medium: [
      { text: "How do OS page tables translate virtual memory addresses to physical RAM frames via TLB hardware?", type: "architecture", skills: ["system_thinking", "algorithmic_thinking"] },
      { text: "How does Rust enforce compile-time memory safety without a garbage collector using Ownership rules?", type: "conceptual", skills: ["logical_reasoning", "algorithmic_thinking"] },
      { text: "When a Segmentation Fault (SIGSEGV) crash occurs, what root cause does GDB analysis typically reveal?", type: "debugging", skills: ["problem_solving", "logical_reasoning"] },
      { text: "How do atomic primitives (Compare-And-Swap) implement lock-free concurrent data structures?", type: "architecture", skills: ["algorithmic_thinking", "mathematical_readiness"] },
      { text: "How do mutexes and condition variables synchronize POSIX threads (pthreads) to prevent race conditions?", type: "problem_solving", skills: ["system_thinking", "logical_reasoning"] }
    ],
    hard: [
      { text: "How do zero-copy I/O systems (io_uring / sendfile) bypass kernel-to-user memory buffer copying?", type: "architecture", skills: ["system_thinking", "algorithmic_thinking"] },
      { text: "How do custom memory allocators (jemalloc) reduce multi-threaded heap lock contention & fragmentation?", type: "architecture", skills: ["algorithmic_thinking", "problem_solving"] },
      { text: "How do hardware virtualization extensions (Intel VT-x) trap and emulate guest kernel instructions?", type: "architecture", skills: ["system_thinking", "logical_reasoning"] },
      { text: "How do ELF linkers perform dynamic symbol resolution during shared library loading at runtime?", type: "conceptual", skills: ["logical_reasoning", "algorithmic_thinking"] },
      { text: "How do cache coherence protocols (MESI) synchronize CPU L1/L2 caches across multi-core sockets?", type: "conceptual", skills: ["system_thinking", "mathematical_readiness"] }
    ]
  }
};

function generate105Questions() {
  const allQuestions = [];

  EXACT_CSE_DOMAINS.forEach(dom => {
    const data = DOMAIN_DATA_BANK[dom.id];
    if (!data) return;

    ["easy", "medium", "hard"].forEach(diff => {
      const diffLetter = diff[0].toUpperCase();
      const items = data[diff] || [];

      items.forEach((item, idx) => {
        const qNumStr = String(idx + 1).padStart(3, '0');
        const qId = `${dom.prefix}_${diffLetter}_${qNumStr}`;

        const dim1 = item.skills[0] || "problem_solving";
        const dim2 = item.skills[1] || "system_thinking";

        const options = [
          { id: "A", text: `Primary optimal approach: ${item.text.replace('?', '')} using domain best practices.` },
          { id: "B", text: `Secondary standard approach with moderate trade-offs in efficiency.` },
          { id: "C", text: `Basic legacy workaround that fails to scale or handle edge cases.` },
          { id: "D", text: `Incorrect approach that introduces bugs or performance bottlenecks.` }
        ];

        const fuzzyMappings = {
          A: { [dim1]: 0.9, [dim2]: 0.8 },
          B: { [dim1]: 0.6, [dim2]: 0.5 },
          C: { [dim1]: 0.3, [dim2]: 0.2 },
          D: { [dim1]: 0.1, [dim2]: 0.1 }
        };

        const xpValue = diff === "easy" ? 10 : diff === "medium" ? 20 : 30;

        allQuestions.push({
          questionId: qId,
          questionNumber: allQuestions.length + 1,
          branch: "CSE",
          domainId: dom.id,
          domainName: dom.name,
          domain: dom.id,
          difficulty: diff,
          questionType: item.type || "scenario",
          category: dom.name,
          dimension: dim1.replace('_', ' ').toUpperCase(),
          questionText: item.text,
          options: options.map(opt => ({
            id: opt.id,
            optionId: `${qId}_${opt.id}`,
            text: opt.text,
            fuzzyImpact: fuzzyMappings[opt.id],
            skillMappings: fuzzyMappings[opt.id]
          })),
          correctOption: "A",
          explanation: `Applying ${dim1} and ${dim2} delivers optimal performance for this ${dom.name} scenario.`,
          skillDimensions: [dim1, dim2],
          skillVariables: [dim1, dim2],
          fuzzyMappings: fuzzyMappings,
          xp: xpValue,
          active: true,
          status: "active"
        });
      });
    });
  });

  return allQuestions;
}

const CSE_105_QUESTION_BANK = generate105Questions();

const seedCseCareerDiscoveryQuestions = async () => {
  try {
    await AhpFuzzyQuestion.collection.dropIndex("questionNumber_1").catch(() => {});

    // Deactivate or remove non-matching questions to keep exactly 105 CSE questions
    await AhpFuzzyQuestion.deleteMany({
      $or: [
        { domainId: { $nin: EXACT_CSE_DOMAINS.map(d => d.id) } },
        { questionId: { $regex: /^q_/ } }
      ]
    });

    const ops = CSE_105_QUESTION_BANK.map(q => ({
      updateOne: {
        filter: { questionId: q.questionId },
        update: { $set: q },
        upsert: true
      }
    }));

    const res = await AhpFuzzyQuestion.bulkWrite(ops);

    console.log("================================================");
    console.log("CSE CAREER DISCOVERY QUESTION BANK");
    console.log("================================================");

    let totalEasy = 0;
    let totalMedium = 0;
    let totalHard = 0;

    EXACT_CSE_DOMAINS.forEach(dom => {
      const dQs = CSE_105_QUESTION_BANK.filter(q => q.domainId === dom.id);
      const easy = dQs.filter(q => q.difficulty === "easy").length;
      const med = dQs.filter(q => q.difficulty === "medium").length;
      const hard = dQs.filter(q => q.difficulty === "hard").length;

      totalEasy += easy;
      totalMedium += med;
      totalHard += hard;

      console.log(`\n${dom.name}:`);
      console.log(`Easy: ${easy} | Medium: ${med} | Hard: ${hard}`);
    });

    const totalQuestions = totalEasy + totalMedium + totalHard;

    console.log("-----------------------------------------------");
    console.log(`TOTAL EASY: ${totalEasy}`);
    console.log(`TOTAL MEDIUM: ${totalMedium}`);
    console.log(`TOTAL HARD: ${totalHard}`);
    console.log(`TOTAL QUESTIONS: ${totalQuestions}`);
    console.log("-----------------------------------------------");
    console.log(`Database sync: ${res.upsertedCount || 0} added, ${res.modifiedCount || 0} updated.`);
    console.log("Seed completed successfully.");
    console.log("================================================");

    return {
      totalEasy,
      totalMedium,
      totalHard,
      totalQuestions
    };
  } catch (err) {
    console.error("Error seeding CSE Career Discovery Questions:", err.message);
    throw err;
  }
};

module.exports = { seedCseCareerDiscoveryQuestions, CSE_105_QUESTION_BANK, EXACT_CSE_DOMAINS };
