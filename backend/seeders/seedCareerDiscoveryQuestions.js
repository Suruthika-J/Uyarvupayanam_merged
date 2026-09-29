const mongoose = require("mongoose");
const AhpFuzzyQuestion = require("../models/AhpFuzzyQuestion");

// 21 CSE CAREER DOMAINS DEFINITION & SKILL EMPHASES
const CSE_CAREER_DOMAINS = [
  {
    id: "software_engineering",
    name: "Software Engineering / Product Development",
    skills: ["problem_solving", "system_thinking", "programming_readiness", "algorithmic_thinking"],
    easy: [
      {
        text: "When starting a new software feature, what is your first structural step?",
        type: "conceptual",
        options: [
          { id: "A", text: "Decompose requirements into module specifications and UML class diagrams.", impact: { system_thinking: 0.9, problem_solving: 0.8 } },
          { id: "B", text: "Start writing frontend UI code immediately without documenting APIs.", impact: { system_thinking: 0.3, problem_solving: 0.4 } },
          { id: "C", text: "Copy code snippets from forums without reading parameter definitions.", impact: { system_thinking: 0.1, problem_solving: 0.2 } },
          { id: "D", text: "Wait for a teammate to dictate every line of function logic.", impact: { system_thinking: 0.0, problem_solving: 0.1 } }
        ],
        correct: "A",
        explanation: "System thinking and requirement decomposition form the core of structured software engineering.",
        skills: ["system_thinking", "problem_solving"],
        fuzzy: { system_thinking: "high", problem_solving: "high" }
      },
      {
        text: "Which version control workflow best prevents code regression in team development?",
        type: "conceptual",
        options: [
          { id: "A", text: "Feature branching with peer code reviews and automated CI pull request checks.", impact: { programming_readiness: 0.9, attention_to_detail: 0.8 } },
          { id: "B", text: "Pushing directly to production main branch without testing.", impact: { programming_readiness: 0.2, attention_to_detail: 0.1 } },
          { id: "C", text: "Emailing zipped code folders back and forth between developers.", impact: { programming_readiness: 0.1, attention_to_detail: 0.2 } },
          { id: "D", text: "Overwriting shared server files using legacy FTP connections.", impact: { programming_readiness: 0.0, attention_to_detail: 0.1 } }
        ],
        correct: "A",
        explanation: "Feature branching and CI code reviews maintain software stability.",
        skills: ["programming_readiness", "attention_to_detail"],
        fuzzy: { programming_readiness: "high", attention_to_detail: "high" }
      },
      {
        text: "How do you handle repetitive logic found across multiple functions?",
        type: "decision",
        options: [
          { id: "A", text: "Refactor into reusable helper functions following DRY (Don't Repeat Yourself) principles.", impact: { algorithmic_thinking: 0.9, problem_solving: 0.8 } },
          { id: "B", text: "Duplicate the code block 10 times across different files.", impact: { algorithmic_thinking: 0.2, problem_solving: 0.3 } },
          { id: "C", text: "Leave duplicate code and add warning comments everywhere.", impact: { algorithmic_thinking: 0.3, problem_solving: 0.2 } },
          { id: "D", text: "Delete the feature entirely to avoid maintenance.", impact: { algorithmic_thinking: 0.0, problem_solving: 0.1 } }
        ],
        correct: "A",
        explanation: "Refactoring into modular reusable components prevents technical debt.",
        skills: ["algorithmic_thinking", "problem_solving"],
        fuzzy: { algorithmic_thinking: "high", problem_solving: "high" }
      },
      {
        text: "What primary metric indicates clean function implementation?",
        type: "conceptual",
        options: [
          { id: "A", text: "Single Responsibility Principle (SRP) where functions handle exactly one task.", impact: { attention_to_detail: 0.9, system_thinking: 0.8 } },
          { id: "B", text: "Writing 500 lines of code inside a single deeply nested loop.", impact: { attention_to_detail: 0.1, system_thinking: 0.2 } },
          { id: "C", text: "Using global variables everywhere instead of parameter passing.", impact: { attention_to_detail: 0.2, system_thinking: 0.1 } },
          { id: "D", text: "Avoiding variable names and using single-letter symbols throughout.", impact: { attention_to_detail: 0.0, system_thinking: 0.1 } }
        ],
        correct: "A",
        explanation: "Single Responsibility Principle makes code testable and maintainable.",
        skills: ["attention_to_detail", "system_thinking"],
        fuzzy: { attention_to_detail: "high", system_thinking: "high" }
      },
      {
        text: "When a bug report arrives with an unexpected null pointer exception, what is your initial step?",
        type: "debugging",
        options: [
          { id: "A", text: "Reproduce the bug locally with debugger breakpoints and inspect stack traces.", impact: { debugging_ability: 0.9, analytical_thinking: 0.8 } },
          { id: "B", text: "Wrap the failing line in an empty try-catch block to ignore the error.", impact: { debugging_ability: 0.1, analytical_thinking: 0.2 } },
          { id: "C", text: "Restart the server and hope the issue resolves itself.", impact: { debugging_ability: 0.2, analytical_thinking: 0.1 } },
          { id: "D", text: "Blame the client browser without inspecting log files.", impact: { debugging_ability: 0.0, analytical_thinking: 0.0 } }
        ],
        correct: "A",
        explanation: "Reproducing bugs and examining stack traces locates root causes systematically.",
        skills: ["debugging_ability", "analytical_thinking"],
        fuzzy: { debugging_ability: "high", analytical_thinking: "high" }
      }
    ],
    medium: [
      {
        text: "You are designing an order processing system. How do you ensure idempotent payment handling?",
        type: "architecture",
        options: [
          { id: "A", text: "Attach unique idempotency keys to payment requests and verify against database logs before charging.", impact: { system_thinking: 0.9, problem_solving: 0.9 } },
          { id: "B", text: "Allow duplicate API calls and refund users manually if double charged.", impact: { system_thinking: 0.3, problem_solving: 0.2 } },
          { id: "C", text: "Disable network retry buttons on the frontend interface.", impact: { system_thinking: 0.4, problem_solving: 0.3 } },
          { id: "D", text: "Store user credit card details in browser local storage.", impact: { system_thinking: 0.0, problem_solving: 0.1 } }
        ],
        correct: "A",
        explanation: "Idempotency keys prevent double charging under network latency or client retries.",
        skills: ["system_thinking", "problem_solving"],
        fuzzy: { system_thinking: "high", problem_solving: "high" }
      },
      {
        text: "When refactoring a legacy monolithic application, which strategy minimizes downtime?",
        type: "architecture",
        options: [
          { id: "A", text: "Apply the Strangler Fig pattern to migrate endpoints iteratively into microservices.", impact: { system_thinking: 0.9, analytical_thinking: 0.8 } },
          { id: "B", text: "Rewrite the entire codebase from scratch over 6 months without updating production.", impact: { system_thinking: 0.3, analytical_thinking: 0.4 } },
          { id: "C", text: "Delete legacy tests to speed up deployment builds.", impact: { system_thinking: 0.1, analytical_thinking: 0.2 } },
          { id: "D", text: "Keep all features in a single giant source file.", impact: { system_thinking: 0.0, analytical_thinking: 0.1 } }
        ],
        correct: "A",
        explanation: "Strangler Fig pattern allows gradual, zero-downtime microservice migration.",
        skills: ["system_thinking", "analytical_thinking"],
        fuzzy: { system_thinking: "high", analytical_thinking: "high" }
      },
      {
        text: "How do you optimize an application experiencing memory leaks in node runtimes?",
        type: "debugging",
        options: [
          { id: "A", text: "Take heap snapshots using Chrome DevTools/v8 inspector and trace uncollected event listeners.", impact: { debugging_ability: 0.9, attention_to_detail: 0.9 } },
          { id: "B", text: "Increase server RAM infinitely without investigating code allocations.", impact: { debugging_ability: 0.2, attention_to_detail: 0.2 } },
          { id: "C", text: "Schedule hourly server hard reboots via cron jobs.", impact: { debugging_ability: 0.4, attention_to_detail: 0.3 } },
          { id: "D", text: "Disable garbage collection flags in node configuration.", impact: { debugging_ability: 0.1, attention_to_detail: 0.1 } }
        ],
        correct: "A",
        explanation: "Heap profiling identifies dangling event listeners and uncollected memory references.",
        skills: ["debugging_ability", "attention_to_detail"],
        fuzzy: { debugging_ability: "high", attention_to_detail: "high" }
      },
      {
        text: "Which design pattern is best suited for decoupling notification channels (Email, SMS, Push)?",
        type: "scenario",
        options: [
          { id: "A", text: "Observer or Strategy Pattern combined with a Factory for message dispatches.", impact: { system_thinking: 0.9, algorithmic_thinking: 0.8 } },
          { id: "B", text: "Hardcoding nested if-else blocks inside the main user registration controller.", impact: { system_thinking: 0.2, algorithmic_thinking: 0.3 } },
          { id: "C", text: "Writing separate database schemas for every notification type.", impact: { system_thinking: 0.3, algorithmic_thinking: 0.2 } },
          { id: "D", text: "Sending notifications synchronously before returning HTTP responses.", impact: { system_thinking: 0.1, algorithmic_thinking: 0.1 } }
        ],
        correct: "A",
        explanation: "Strategy and Observer patterns allow pluggable notification channels.",
        skills: ["system_thinking", "algorithmic_thinking"],
        fuzzy: { system_thinking: "high", algorithmic_thinking: "high" }
      },
      {
        text: "How do you maintain high code quality across a distributed 20-developer team?",
        type: "decision",
        options: [
          { id: "A", text: "Establish strict ESLint/Prettier configs, git pre-commit hooks, and mandatory approval pull requests.", impact: { programming_readiness: 0.9, attention_to_detail: 0.8 } },
          { id: "B", text: "Rely on verbal agreements during weekly standup meetings.", impact: { programming_readiness: 0.3, attention_to_detail: 0.3 } },
          { id: "C", text: "Allow developers to push formatted code directly without review.", impact: { programming_readiness: 0.1, attention_to_detail: 0.2 } },
          { id: "D", text: "Disable compiler lint rules whenever warning messages appear.", impact: { programming_readiness: 0.0, attention_to_detail: 0.1 } }
        ],
        correct: "A",
        explanation: "Automated linting and pre-commit hooks enforce consistent code formatting.",
        skills: ["programming_readiness", "attention_to_detail"],
        fuzzy: { programming_readiness: "high", attention_to_detail: "high" }
      }
    ],
    hard: [
      {
        text: "How do you handle distributed transactional consistency across microservices without 2PC deadlocks?",
        type: "architecture",
        options: [
          { id: "A", text: "Implement the Saga Pattern using Orchestration or Choreography with compensating transactions.", impact: { system_thinking: 0.95, problem_solving: 0.9 } },
          { id: "B", text: "Use long-running ACID database transactions across WAN network connections.", impact: { system_thinking: 0.2, problem_solving: 0.3 } },
          { id: "C", text: "Store all microservice data inside a single monolithic SQL table.", impact: { system_thinking: 0.1, problem_solving: 0.2 } },
          { id: "D", text: "Ignore transaction failures and log warning messages.", impact: { system_thinking: 0.0, problem_solving: 0.1 } }
        ],
        correct: "A",
        explanation: "Saga pattern manages distributed transactions with eventual consistency and compensating actions.",
        skills: ["system_thinking", "problem_solving"],
        fuzzy: { system_thinking: "high", problem_solving: "high" }
      },
      {
        text: "When evaluating trade-offs between Event Sourcing and Traditional CRUD architecture, what is a key challenge?",
        type: "architecture",
        options: [
          { id: "A", text: "Increased complexity in event schema evolution, eventual consistency queries, and snapshotting.", impact: { analytical_thinking: 0.95, system_thinking: 0.9 } },
          { id: "B", text: "Event Sourcing cannot store historical state changes.", impact: { analytical_thinking: 0.2, system_thinking: 0.2 } },
          { id: "C", text: "Traditional CRUD requires event bus infrastructure like Kafka.", impact: { analytical_thinking: 0.3, system_thinking: 0.3 } },
          { id: "D", text: "Event Sourcing eliminates the need for database storage.", impact: { analytical_thinking: 0.1, system_thinking: 0.1 } }
        ],
        correct: "A",
        explanation: "Event Sourcing provides complete audit trails but introduces eventual consistency and migration complexity.",
        skills: ["analytical_thinking", "system_thinking"],
        fuzzy: { analytical_thinking: "high", system_thinking: "high" }
      },
      {
        text: "In a high-throughput API gateway handling 100k requests/sec, how do you prevent cascading failures?",
        type: "architecture",
        options: [
          { id: "A", text: "Implement Circuit Breaker patterns (e.g., Resilience4j/Hystrix) with bulkhead thread isolation.", impact: { system_thinking: 0.95, debugging_ability: 0.9 } },
          { id: "B", text: "Increase network request timeout values to 60 seconds.", impact: { system_thinking: 0.2, debugging_ability: 0.2 } },
          { id: "C", text: "Retry failed backend requests continuously in tight loops.", impact: { system_thinking: 0.1, debugging_ability: 0.1 } },
          { id: "D", text: "Disable load balancer health check endpoints.", impact: { system_thinking: 0.0, debugging_ability: 0.0 } }
        ],
        correct: "A",
        explanation: "Circuit breakers isolate failing downstream services and prevent cascade worker thread exhaustion.",
        skills: ["system_thinking", "debugging_ability"],
        fuzzy: { system_thinking: "high", debugging_ability: "high" }
      },
      {
        text: "How do you debug an intermittent deadlock occurring only in production multi-threaded environments?",
        type: "debugging",
        options: [
          { id: "A", text: "Analyze thread dumps (jstack/gdb), audit mutex lock ordering, and employ thread sanitizers.", impact: { debugging_ability: 0.95, attention_to_detail: 0.95 } },
          { id: "B", text: "Add print statements inside lock acquisition loops.", impact: { debugging_ability: 0.3, attention_to_detail: 0.3 } },
          { id: "C", text: "Remove lock primitives and hope race conditions do not break memory.", impact: { debugging_ability: 0.1, attention_to_detail: 0.1 } },
          { id: "D", text: "Reduce thread pool count to 1 globally.", impact: { debugging_ability: 0.2, attention_to_detail: 0.2 } }
        ],
        correct: "A",
        explanation: "Thread dump analysis and strict lock hierarchy auditing locate concurrency deadlocks.",
        skills: ["debugging_ability", "attention_to_detail"],
        fuzzy: { debugging_ability: "high", attention_to_detail: "high" }
      },
      {
        text: "What domain-driven design (DDD) construct protects domain invariants across business boundaries?",
        type: "conceptual",
        options: [
          { id: "A", text: "Aggregate Roots encapsulating entity states and enforcing boundary consistency.", impact: { system_thinking: 0.95, algorithmic_thinking: 0.85 } },
          { id: "B", text: "Anemic Domain Models with raw getters and setters.", impact: { system_thinking: 0.2, algorithmic_thinking: 0.2 } },
          { id: "C", text: "Direct database access directly from UI components.", impact: { system_thinking: 0.1, algorithmic_thinking: 0.1 } },
          { id: "D", text: "Global public data tables shared across all microservices.", impact: { system_thinking: 0.0, algorithmic_thinking: 0.1 } }
        ],
        correct: "A",
        explanation: "Aggregate Roots act as consistency boundaries in Domain-Driven Design.",
        skills: ["system_thinking", "algorithmic_thinking"],
        fuzzy: { system_thinking: "high", algorithmic_thinking: "high" }
      }
    ]
  },
  {
    id: "full_stack",
    name: "Full Stack Web & Mobile Development",
    skills: ["programming_readiness", "system_thinking", "debugging_ability", "problem_solving"],
    easy: [
      {
        text: "How do you coordinate state between a React frontend and Express backend?",
        type: "conceptual",
        options: [
          { id: "A", text: "Make asynchronous fetch/axios HTTP calls from useEffect hooks and update state.", impact: { programming_readiness: 0.9, system_thinking: 0.8 } },
          { id: "B", text: "Reload the entire page on every user mouse click.", impact: { programming_readiness: 0.2, system_thinking: 0.3 } },
          { id: "C", text: "Hardcode backend responses directly inside HTML templates.", impact: { programming_readiness: 0.1, system_thinking: 0.2 } },
          { id: "D", text: "Write SQL queries directly inside client-side JS files.", impact: { programming_readiness: 0.0, system_thinking: 0.1 } }
        ],
        correct: "A",
        explanation: "RESTful API requests connecting client state with backend controllers form full stack fundamentals.",
        skills: ["programming_readiness", "system_thinking"],
        fuzzy: { programming_readiness: "high", system_thinking: "high" }
      },
      {
        text: "What mechanism secures user sessions across decoupled Web/Mobile applications?",
        type: "conceptual",
        options: [
          { id: "A", text: "JSON Web Tokens (JWT) signed with HMAC/RSA algorithms sent via HTTP Headers.", impact: { programming_readiness: 0.9, security_awareness: 0.8 } },
          { id: "B", text: "Storing plain text user passwords in browser localStorage.", impact: { programming_readiness: 0.1, security_awareness: 0.0 } },
          { id: "C", text: "Sending user ID as unencrypted URL query parameters.", impact: { programming_readiness: 0.2, security_awareness: 0.1 } },
          { id: "D", text: "Disabling authentication on mobile devices.", impact: { programming_readiness: 0.0, security_awareness: 0.0 } }
        ],
        correct: "A",
        explanation: "JWTs provide stateless, cryptographic authentication across web and mobile platforms.",
        skills: ["programming_readiness", "security_awareness"],
        fuzzy: { programming_readiness: "high", security_awareness: "high" }
      },
      {
        text: "When a web page renders slowly due to massive image sizes, what full stack solution works best?",
        type: "problem_solving",
        options: [
          { id: "A", text: "Compress images into WebP/AVIF formats, configure CDN caching, and implement lazy loading.", impact: { problem_solving: 0.9, system_thinking: 0.8 } },
          { id: "B", text: "Tell users to upgrade their personal internet speed.", impact: { problem_solving: 0.1, system_thinking: 0.1 } },
          { id: "C", text: "Convert all images to uncompressed BMP files.", impact: { problem_solving: 0.0, system_thinking: 0.1 } },
          { id: "D", text: "Remove all visual assets from the web application.", impact: { problem_solving: 0.2, system_thinking: 0.2 } }
        ],
        correct: "A",
        explanation: "Modern image formats and CDN edge caching drastically reduce web page load latency.",
        skills: ["problem_solving", "system_thinking"],
        fuzzy: { problem_solving: "high", system_thinking: "high" }
      },
      {
        text: "What is the primary benefit of Single Page Application (SPA) frameworks like React/Vue?",
        type: "conceptual",
        options: [
          { id: "A", text: "Dynamic client-side rendering with fast DOM diffing and smooth user interaction.", impact: { programming_readiness: 0.9, attention_to_detail: 0.7 } },
          { id: "B", text: "SPAs do not require any server or hosting environment.", impact: { programming_readiness: 0.2, attention_to_detail: 0.2 } },
          { id: "C", text: "SPAs automatically write backend SQL database tables.", impact: { programming_readiness: 0.1, attention_to_detail: 0.1 } },
          { id: "D", text: "SPAs prevent all network requests from executing.", impact: { programming_readiness: 0.0, attention_to_detail: 0.0 } }
        ],
        correct: "A",
        explanation: "Virtual DOM diffing enables seamless interactive client experiences without full page reloads.",
        skills: ["programming_readiness", "attention_to_detail"],
        fuzzy: { programming_readiness: "high", attention_to_detail: "medium" }
      },
      {
        text: "When debugging a CORS (Cross-Origin Resource Sharing) error on API request, how do you fix it?",
        type: "debugging",
        options: [
          { id: "A", text: "Configure backend Access-Control-Allow-Origin headers for authorized client domains.", impact: { debugging_ability: 0.9, programming_readiness: 0.8 } },
          { id: "B", text: "Disable browser security settings on client computers permanently.", impact: { debugging_ability: 0.1, programming_readiness: 0.1 } },
          { id: "C", text: "Change HTTP GET requests to HTTP POST requests blindly.", impact: { debugging_ability: 0.3, programming_readiness: 0.2 } },
          { id: "D", text: "Delete frontend API call functions.", impact: { debugging_ability: 0.0, programming_readiness: 0.0 } }
        ],
        correct: "A",
        explanation: "Configuring server CORS headers grants permission for browser cross-origin requests.",
        skills: ["debugging_ability", "programming_readiness"],
        fuzzy: { debugging_ability: "high", programming_readiness: "high" }
      }
    ],
    medium: [
      {
        text: "How do you achieve Server-Side Rendering (SSR) with Next.js for high SEO ranking?",
        type: "architecture",
        options: [
          { id: "A", text: "Use Server Components and page routing to pre-render HTML on server before hydration.", impact: { system_thinking: 0.9, programming_readiness: 0.9 } },
          { id: "B", text: "Render empty HTML div containers and fetch all data client-side after mount.", impact: { system_thinking: 0.3, programming_readiness: 0.3 } },
          { id: "C", text: "Disable JavaScript rendering across search crawler agents.", impact: { system_thinking: 0.1, programming_readiness: 0.1 } },
          { id: "D", text: "Upload static PDF files instead of HTML web pages.", impact: { system_thinking: 0.0, programming_readiness: 0.0 } }
        ],
        correct: "A",
        explanation: "Server-side rendering populates full HTML content for search engine indexers.",
        skills: ["system_thinking", "programming_readiness"],
        fuzzy: { system_thinking: "high", programming_readiness: "high" }
      },
      {
        text: "In React Native, how do you maintain smooth 60fps UI performance during heavy data processing?",
        type: "problem_solving",
        options: [
          { id: "A", text: "Offload heavy computational logic to Native Modules or Web Workers off the JavaScript thread.", impact: { problem_solving: 0.9, debugging_ability: 0.8 } },
          { id: "B", text: "Run intensive loops directly inside component render functions.", impact: { problem_solving: 0.1, debugging_ability: 0.2 } },
          { id: "C", text: "Force frequent setState calls inside window scroll handlers.", impact: { problem_solving: 0.2, debugging_ability: 0.1 } },
          { id: "D", text: "Disable hardware acceleration on target devices.", impact: { problem_solving: 0.0, debugging_ability: 0.0 } }
        ],
        correct: "A",
        explanation: "Keeping the main JS bridge free from blocking tasks prevents dropped frames.",
        skills: ["problem_solving", "debugging_ability"],
        fuzzy: { problem_solving: "high", debugging_ability: "high" }
      },
      {
        text: "How do you prevent SQL Injection vulnerabilities in backend Node/Python controllers?",
        type: "scenario",
        options: [
          { id: "A", text: "Use parameterized queries or ORM abstractions (Prisma/Sequelize/SQLAlchemy).", impact: { security_awareness: 0.95, programming_readiness: 0.85 } },
          { id: "B", text: "Concatenate user raw input strings directly into SQL statement strings.", impact: { security_awareness: 0.0, programming_readiness: 0.1 } },
          { id: "C", text: "Filter single quotes using basic string replace regex on client-side only.", impact: { security_awareness: 0.3, programming_readiness: 0.3 } },
          { id: "D", text: "Encrypt the entire SQL database file every time a query is made.", impact: { security_awareness: 0.2, programming_readiness: 0.1 } }
        ],
        correct: "A",
        explanation: "Parameterized queries separate query logic from untrusted user parameters.",
        skills: ["security_awareness", "programming_readiness"],
        fuzzy: { security_awareness: "high", programming_readiness: "high" }
      },
      {
        text: "When implementing real-time chat between mobile clients and web dashboards, which protocol is best?",
        type: "architecture",
        options: [
          { id: "A", text: "WebSockets (Socket.io) with full-duplex TCP persistent connections.", impact: { system_thinking: 0.9, problem_solving: 0.8 } },
          { id: "B", text: "Short HTTP polling every 50 milliseconds from client browsers.", impact: { system_thinking: 0.3, problem_solving: 0.3 } },
          { id: "C", text: "Sending SMS messages between client device numbers.", impact: { system_thinking: 0.1, problem_solving: 0.1 } },
          { id: "D", text: "Writing chat messages to static server log files.", impact: { system_thinking: 0.0, problem_solving: 0.0 } }
        ],
        correct: "A",
        explanation: "WebSockets provide bi-directional low-latency real-time communication.",
        skills: ["system_thinking", "problem_solving"],
        fuzzy: { system_thinking: "high", problem_solving: "high" }
      },
      {
        text: "How do you optimize state management in large React apps to prevent unnecessary re-renders?",
        type: "debugging",
        options: [
          { id: "A", text: "Use atomic state selectors (Zustand/Redux Toolkit) and memoize with useMemo/useCallback.", impact: { debugging_ability: 0.9, attention_to_detail: 0.85 } },
          { id: "B", text: "Store all application state inside a single top-level Context Provider.", impact: { debugging_ability: 0.3, attention_to_detail: 0.3 } },
          { id: "C", text: "Mutate global state objects directly without triggering state updates.", impact: { debugging_ability: 0.1, attention_to_detail: 0.1 } },
          { id: "D", text: "Avoid state management tools and pass props through 15 component levels.", impact: { debugging_ability: 0.2, attention_to_detail: 0.2 } }
        ],
        correct: "A",
        explanation: "Selector-based state and memoization prevent cascading component tree renders.",
        skills: ["debugging_ability", "attention_to_detail"],
        fuzzy: { debugging_ability: "high", attention_to_detail: "high" }
      }
    ],
    hard: [
      {
        text: "How do you structure an offline-first PWA (Progressive Web App) with background data sync?",
        type: "architecture",
        options: [
          { id: "A", text: "Use Service Workers with IndexedDB storage, Workbox strategy caching, and Background Sync API.", impact: { system_thinking: 0.95, programming_readiness: 0.9 } },
          { id: "B", text: "Store user inputs in browser cookies and fail silently when offline.", impact: { system_thinking: 0.2, programming_readiness: 0.2 } },
          { id: "C", text: "Force users to download a 200MB native installer.", impact: { system_thinking: 0.1, programming_readiness: 0.1 } },
          { id: "D", text: "Cache entire backend database tables into client LocalStorage.", impact: { system_thinking: 0.3, programming_readiness: 0.2 } }
        ],
        correct: "A",
        explanation: "Service Workers and IndexedDB provide resilient offline web experience and background sync.",
        skills: ["system_thinking", "programming_readiness"],
        fuzzy: { system_thinking: "high", programming_readiness: "high" }
      },
      {
        text: "In microservices, how do you handle GraphQL schema stitching / federation across multiple domain teams?",
        type: "architecture",
        options: [
          { id: "A", text: "Implement Apollo Federation with subgraphs, router gateway, and unified supergraph schemas.", impact: { system_thinking: 0.95, problem_solving: 0.9 } },
          { id: "B", text: "Merge text files manually before every deployment build.", impact: { system_thinking: 0.2, problem_solving: 0.2 } },
          { id: "C", text: "Force all teams to edit a single shared monolith repository.", impact: { system_thinking: 0.3, problem_solving: 0.3 } },
          { id: "D", text: "Replace GraphQL with legacy REST GET endpoints.", impact: { system_thinking: 0.1, problem_solving: 0.1 } }
        ],
        correct: "A",
        explanation: "Apollo Federation enables autonomous subgraphs stitched into a single declarative API entry point.",
        skills: ["system_thinking", "problem_solving"],
        fuzzy: { system_thinking: "high", problem_solving: "high" }
      },
      {
        text: "How do you protect a full stack application against CSRF (Cross-Site Request Forgery) attacks?",
        type: "decision",
        options: [
          { id: "A", text: "Enforce SameSite=Strict/Lax cookie attributes and validate anti-CSRF double-submit tokens.", impact: { security_awareness: 0.95, attention_to_detail: 0.9 } },
          { id: "B", text: "Allow GET requests to perform database mutations.", impact: { security_awareness: 0.0, attention_to_detail: 0.1 } },
          { id: "C", text: "Store session cookies without HttpOnly or Secure flags.", impact: { security_awareness: 0.1, attention_to_detail: 0.1 } },
          { id: "D", text: "Disable CORS security headers on server controllers.", impact: { security_awareness: 0.0, attention_to_detail: 0.0 } }
        ],
        correct: "A",
        explanation: "SameSite cookies and anti-CSRF tokens stop unauthorized cross-site request state changes.",
        skills: ["security_awareness", "attention_to_detail"],
        fuzzy: { security_awareness: "high", attention_to_detail: "high" }
      },
      {
        text: "How do you optimize mobile application launch time (TTI - Time to Interactive) in React Native / Flutter?",
        type: "debugging",
        options: [
          { id: "A", text: "Enable Hermes engine / AOT compilation, lazy-load heavy modules, and inline critical assets.", impact: { debugging_ability: 0.95, problem_solving: 0.9 } },
          { id: "B", text: "Load all application screens into memory simultaneously during startup.", impact: { debugging_ability: 0.1, problem_solving: 0.2 } },
          { id: "C", text: "Execute heavy network requests synchronously before initial UI render.", impact: { debugging_ability: 0.2, problem_solving: 0.1 } },
          { id: "D", text: "Increase splash screen timer duration to mask loading lag.", impact: { debugging_ability: 0.0, problem_solving: 0.0 } }
        ],
        correct: "A",
        explanation: "AOT byte-code compilation and bundle splitting accelerate mobile cold boot initialization.",
        skills: ["debugging_ability", "problem_solving"],
        fuzzy: { debugging_ability: "high", problem_solving: "high" }
      },
      {
        text: "What architectural strategy guarantees web application availability under sudden 100x traffic surges?",
        type: "architecture",
        options: [
          { id: "A", text: "Auto-scaling container clusters (K8s/ECS), Redis CDN caching, and read-replica database pools.", impact: { system_thinking: 0.95, programming_readiness: 0.9 } },
          { id: "B", text: "Manually SSH into cloud instances to restart app servers.", impact: { system_thinking: 0.2, programming_readiness: 0.2 } },
          { id: "C", text: "Block inbound user requests when server CPU reaches 50%.", impact: { system_thinking: 0.3, programming_readiness: 0.1 } },
          { id: "D", text: "Store all file uploads directly on primary application instance local disk.", impact: { system_thinking: 0.1, programming_readiness: 0.1 } }
        ],
        correct: "A",
        explanation: "Horizontal autoscaling and read-replica distribution maintain elasticity under load.",
        skills: ["system_thinking", "programming_readiness"],
        fuzzy: { system_thinking: "high", programming_readiness: "high" }
      }
    ]
  }
];

// GENERATOR FUNCTION TO POPULATE DOMAIN TEMPLATES FOR ALL 21 CSE CAREER DOMAINS
function generateFullQuestionBank() {
  const domainsList = [
    { id: "software_engineering", name: "Software Engineering / Product Development" },
    { id: "full_stack", name: "Full Stack Web & Mobile Development" },
    { id: "frontend_development", name: "Frontend Development" },
    { id: "backend_development", name: "Backend Development" },
    { id: "ai_ml", name: "Artificial Intelligence & Machine Learning" },
    { id: "data_science", name: "Data Science" },
    { id: "data_analytics", name: "Data Analytics" },
    { id: "cyber_security", name: "Cyber Security & Ethical Hacking" },
    { id: "cloud_computing", name: "Cloud Computing" },
    { id: "devops", name: "DevOps / Site Reliability Engineering" },
    { id: "data_engineering", name: "Data Engineering / Big Data" },
    { id: "database_systems", name: "Database Engineering" },
    { id: "embedded_iot", name: "Embedded Systems / IoT" },
    { id: "robotics", name: "Robotics" },
    { id: "blockchain", name: "Blockchain / Web3" },
    { id: "game_development", name: "Game Development" },
    { id: "ar_vr", name: "AR / VR / Extended Reality" },
    { id: "ui_ux", name: "UI/UX / Human Computer Interaction" },
    { id: "systems_programming", name: "Systems Programming / Computer Systems" },
    { id: "software_testing", name: "Software Testing / QA" },
    { id: "research_rd", name: "Computer Science Research / R&D" }
  ];

  const allQuestions = [];

  // Helper map for domain specific concepts
  const domainSpecificData = {
    frontend_development: {
      easy: [
        { text: "What is the primary function of the CSS flexbox box model?", skills: ["attention_to_detail", "creativity"], type: "conceptual" },
        { text: "How do modern browsers process HTML into an interactive tree structure?", skills: ["system_thinking", "programming_readiness"], type: "conceptual" },
        { text: "What accessibility attribute ensures screen readers interpret image content correctly?", skills: ["attention_to_detail", "user_centricity"], type: "decision" },
        { text: "How do JavaScript event listeners propagate through DOM elements?", skills: ["programming_readiness", "logical_reasoning"], type: "conceptual" },
        { text: "What CSS property prevents layout cumulative shift (CLS) during image loads?", skills: ["attention_to_detail", "problem_solving"], type: "debugging" }
      ],
      medium: [
        { text: "How do you optimize critical rendering path (CRP) latency for mobile users?", skills: ["system_thinking", "problem_solving"], type: "architecture" },
        { text: "What state management approach prevents prop drilling in multi-tab web suites?", skills: ["system_thinking", "programming_readiness"], type: "architecture" },
        { text: "How do virtual DOM tree diffing algorithms reduce real browser layout recalculations?", skills: ["algorithmic_thinking", "programming_readiness"], type: "conceptual" },
        { text: "When implementing responsive UI layouts across foldables, which CSS feature works best?", skills: ["creativity", "attention_to_detail"], type: "decision" },
        { text: "How do web workers execute CPU-heavy calculations without freezing the main thread?", skills: ["system_thinking", "debugging_ability"], type: "problem_solving" }
      ],
      hard: [
        { text: "How do micro-frontend architectures bundle independent remote modules at runtime?", skills: ["system_thinking", "architecture"], type: "architecture" },
        { text: "How do WebAssembly (Wasm) modules interface with JavaScript memory buffers safely?", skills: ["systems_thinking", "programming_readiness"], type: "architecture" },
        { text: "How do you profile memory leaks caused by detached DOM nodes in single-page apps?", skills: ["debugging_ability", "attention_to_detail"], type: "debugging" },
        { text: "What tree-shaking mechanisms during Webpack/Vite bundling purge unused ES module exports?", skills: ["algorithmic_thinking", "system_thinking"], type: "scenario" },
        { text: "How do Content Security Policy (CSP) headers prevent cross-site scripting (XSS)?", skills: ["security_awareness", "attention_to_detail"], type: "decision" }
      ]
    },
    backend_development: {
      easy: [
        { text: "What HTTP method is idempotent and intended for complete resource updates?", skills: ["programming_readiness", "logical_reasoning"], type: "conceptual" },
        { text: "How does asynchronous non-blocking I/O enable high concurrency in server frameworks?", skills: ["system_thinking", "programming_readiness"], type: "conceptual" },
        { text: "What index structure accelerates exact lookup queries in relational databases?", skills: ["data_interpretation", "algorithmic_thinking"], type: "conceptual" },
        { text: "Why are password hashes stored with unique random salt strings?", skills: ["security_awareness", "attention_to_detail"], type: "security" },
        { text: "What server response status code indicates an unauthenticated request?", skills: ["programming_readiness", "attention_to_detail"], type: "debugging" }
      ],
      medium: [
        { text: "How do connection pools optimize database socket connection overhead?", skills: ["system_thinking", "problem_solving"], type: "architecture" },
        { text: "When handling high read traffic, how does a Redis caching layer improve throughput?", skills: ["system_thinking", "data_interpretation"], type: "architecture" },
        { text: "How do message queues (RabbitMQ/Kafka) decouple synchronous API request processing?", skills: ["system_thinking", "problem_solving"], type: "architecture" },
        { text: "What database isolation level prevents fuzzy read phenomena during concurrent transactions?", skills: ["data_interpretation", "logical_reasoning"], type: "conceptual" },
        { text: "How do rate limiters prevent API denial-of-service (DoS) endpoint exhaustion?", skills: ["security_awareness", "system_thinking"], type: "decision" }
      ],
      hard: [
        { text: "How do distributed hash tables (DHT) and consistent hashing rebalance nodes under scaling?", skills: ["algorithmic_thinking", "system_thinking"], type: "architecture" },
        { text: "How does the Write-Ahead Logging (WAL) protocol guarantee database crash recovery?", skills: ["system_thinking", "attention_to_detail"], type: "conceptual" },
        { text: "How do gRPC protocols over HTTP/2 improve inter-service RPC transmission speed?", skills: ["system_thinking", "programming_readiness"], type: "architecture" },
        { text: "How do distributed tracing spans (OpenTelemetry) track latency across microservices?", skills: ["debugging_ability", "system_thinking"], type: "debugging" },
        { text: "How do zero-downtime database migrations alter schemas without locking write operations?", skills: ["system_thinking", "problem_solving"], type: "decision" }
      ]
    },
    ai_ml: {
      easy: [
        { text: "What is the main goal of supervised learning algorithms during model training?", skills: ["analytical_thinking", "pattern_recognition"], type: "conceptual" },
        { text: "How does overfitting affect machine learning model generalization on unseen test data?", skills: ["analytical_thinking", "mathematical_readiness"], type: "conceptual" },
        { text: "What loss function measures prediction error in linear regression tasks?", skills: ["mathematical_readiness", "analytical_thinking"], type: "conceptual" },
        { text: "Which feature scaling method normalizes numeric values into a 0 to 1 range?", skills: ["data_interpretation", "pattern_recognition"], type: "problem_solving" },
        { text: "What is the role of activation functions in non-linear neural network layers?", skills: ["mathematical_readiness", "pattern_recognition"], type: "conceptual" }
      ],
      medium: [
        { text: "How does Gradient Descent optimization adjust model weights relative to loss gradients?", skills: ["mathematical_readiness", "algorithmic_thinking"], type: "conceptual" },
        { text: "When dealing with imbalanced classification datasets, which metric is more informative than Accuracy?", skills: ["analytical_thinking", "data_interpretation"], type: "decision" },
        { text: "How do convolutional neural networks (CNNs) extract spatial features from input images?", skills: ["pattern_recognition", "analytical_thinking"], type: "architecture" },
        { text: "How does L2 regularization (Ridge) penalize large weight parameters during model fitting?", skills: ["mathematical_readiness", "analytical_thinking"], type: "conceptual" },
        { text: "What advantage do decision tree ensembles (Random Forest/XGBoost) offer over single trees?", skills: ["pattern_recognition", "problem_solving"], type: "conceptual" }
      ],
      hard: [
        { text: "How do self-attention mechanisms in Transformer models process sequence context in parallel?", skills: ["pattern_recognition", "algorithmic_thinking"], type: "architecture" },
        { text: "How does Backpropagation Through Time (BPTT) manage exploding/vanishing gradients in Recurrent Networks?", skills: ["mathematical_readiness", "debugging_ability"], type: "debugging" },
        { text: "How do Vector Databases perform fast approximate nearest neighbor (ANN) retrieval for LLM embeddings?", skills: ["algorithmic_thinking", "system_thinking"], type: "architecture" },
        { text: "What trade-offs exist between fine-tuning full model weights vs Parameter-Efficient Fine-Tuning (PEFT/LoRA)?", skills: ["analytical_thinking", "system_thinking"], type: "decision" },
        { text: "How does Reinforcement Learning from Human Feedback (RLHF) align policy models using reward functions?", skills: ["analytical_thinking", "algorithmic_thinking"], type: "architecture" }
      ]
    },
    data_science: {
      easy: [
        { text: "What chart type best displays continuous variable distributions across datasets?", skills: ["data_interpretation", "analytical_thinking"], type: "conceptual" },
        { text: "How do missing values affect statistical mean calculations if unaddressed?", skills: ["data_interpretation", "attention_to_detail"], type: "conceptual" },
        { text: "What coefficient measures linear correlation strength between two quantitative variables?", skills: ["mathematical_readiness", "data_interpretation"], type: "conceptual" },
        { text: "Which pandas operation groups rows by category to calculate aggregate metrics?", skills: ["programming_readiness", "data_interpretation"], type: "problem_solving" },
        { text: "What is the difference between population parameter and sample statistic?", skills: ["mathematical_readiness", "analytical_thinking"], type: "conceptual" }
      ],
      medium: [
        { text: "How do you conduct A/B hypothesis testing to verify feature conversion lift significance?", skills: ["analytical_thinking", "mathematical_readiness"], type: "decision" },
        { text: "When features exhibit strong multicollinearity, how does Principal Component Analysis (PCA) help?", skills: ["mathematical_readiness", "pattern_recognition"], type: "architecture" },
        { text: "How do box plots identify statistical outliers using Interquartile Range (IQR)?", skills: ["data_interpretation", "attention_to_detail"], type: "debugging" },
        { text: "What is the impact of data leakage when preprocessing training and validation sets?", skills: ["attention_to_detail", "analytical_thinking"], type: "debugging" },
        { text: "How do Markov Chain Monte Carlo (MCMC) methods sample posterior distributions in Bayesian statistics?", skills: ["mathematical_readiness", "analytical_thinking"], type: "conceptual" }
      ],
      hard: [
        { text: "How do causal inference frameworks (DAGs / Propensity Score Matching) isolate true treatment effects?", skills: ["analytical_thinking", "mathematical_readiness"], type: "architecture" },
        { text: "How do survival analysis models (Cox Proportional Hazards) handle censored time-to-event data?", skills: ["mathematical_readiness", "data_interpretation"], type: "conceptual" },
        { text: "What optimization objective does t-SNE / UMAP minimize during high-dimensional manifold embedding?", skills: ["pattern_recognition", "mathematical_readiness"], type: "architecture" },
        { text: "How do time-series forecasting models (ARIMA / Prophet) decompose stationarity, trend, and seasonality?", skills: ["analytical_thinking", "pattern_recognition"], type: "problem_solving" },
        { text: "How do cross-validation splits prevent temporal leakage in financial time-series evaluation?", skills: ["attention_to_detail", "analytical_thinking"], type: "decision" }
      ]
    },
    data_analytics: {
      easy: [
        { text: "What SQL clause filters aggregated group results after a GROUP BY statement?", skills: ["data_interpretation", "analytical_thinking"], type: "conceptual" },
        { text: "How do dashboard KPIs (Key Performance Indicators) aid executive decision making?", skills: ["data_interpretation", "communication"], type: "conceptual" },
        { text: "Which SQL JOIN returns all records from the left table and matched records from the right?", skills: ["programming_readiness", "data_interpretation"], type: "problem_solving" },
        { text: "What visualization best illustrates proportion breakdown of categorical totals?", skills: ["data_interpretation", "creativity"], type: "decision" },
        { text: "Why is data cleaning essential before compiling business intelligence reports?", skills: ["attention_to_detail", "data_interpretation"], type: "conceptual" }
      ],
      medium: [
        { text: "How do SQL Window Functions (ROW_NUMBER, RANK, NTILE) calculate running totals without row collapse?", skills: ["programming_readiness", "analytical_thinking"], type: "problem_solving" },
        { text: "How do cohort analysis tables track user retention behavior over time?", skills: ["data_interpretation", "pattern_recognition"], type: "decision" },
        { text: "When building executive dashboards, how do you handle drill-down query performance optimization?", skills: ["system_thinking", "data_interpretation"], type: "architecture" },
        { text: "What statistical test evaluates whether two categorical variables are independent?", skills: ["mathematical_readiness", "analytical_thinking"], type: "conceptual" },
        { text: "How do ETL pipelines automate raw log transformation into structured reporting tables?", skills: ["system_thinking", "programming_readiness"], type: "scenario" }
      ],
      hard: [
        { text: "How do star schema vs snowflake schema designs impact analytical query JOIN overhead in data warehouses?", skills: ["system_thinking", "data_interpretation"], type: "architecture" },
        { text: "How do Materialized Views improve response times for high-volume real-time BI dashboards?", skills: ["system_thinking", "problem_solving"], type: "architecture" },
        { text: "How do funnel analysis algorithms detect conversion drop-offs across complex multi-step user flows?", skills: ["analytical_thinking", "pattern_recognition"], type: "problem_solving" },
        { text: "What automated anomaly detection techniques spot sudden revenue metrics spikes in streaming data?", skills: ["pattern_recognition", "debugging_ability"], type: "debugging" },
        { text: "How do semantic layer models (dbt / Looker LookML) unify business definitions across departments?", skills: ["system_thinking", "communication"], type: "decision" }
      ]
    },
    cyber_security: {
      easy: [
        { text: "What fundamental security principle enforces granting minimal permissions needed for a role?", skills: ["security_awareness", "attention_to_detail"], type: "conceptual" },
        { text: "How does Multi-Factor Authentication (MFA) mitigate stolen password attacks?", skills: ["security_awareness", "logical_reasoning"], type: "conceptual" },
        { text: "What network tool scans active open ports and running services on target IP addresses?", skills: ["security_awareness", "technical_curiosity"], type: "conceptual" },
        { text: "Why are HTTPS connections safer than plain HTTP for web traffic?", skills: ["security_awareness", "system_thinking"], type: "conceptual" },
        { text: "What attack type tricks users into revealing credentials through spoofed emails?", skills: ["security_awareness", "attention_to_detail"], type: "decision" }
      ],
      medium: [
        { text: "How do Web Application Firewalls (WAF) inspect payload signatures to block SQLi and XSS attacks?", skills: ["security_awareness", "attention_to_detail"], type: "architecture" },
        { text: "How does asymmetric RSA encryption securely establish symmetric AES session keys during TLS handshakes?", skills: ["security_awareness", "mathematical_readiness"], type: "conceptual" },
        { text: "How do penetration testers execute buffer overflow exploits to hijack program execution flow?", skills: ["technical_curiosity", "debugging_ability"], type: "problem_solving" },
        { text: "What mitigation strategy prevents Cross-Site Scripting (XSS) by restricting executable script domains?", skills: ["security_awareness", "programming_readiness"], type: "decision" },
        { text: "How do Intrusion Detection Systems (IDS) use behavioral baselines to identify zero-day threats?", skills: ["pattern_recognition", "security_awareness"], type: "architecture" }
      ],
      hard: [
        { text: "How do reverse engineers dissect malware binaries using disassemblers (Ghidra/IDA Pro) and sandboxes?", skills: ["persistence", "debugging_ability"], type: "debugging" },
        { text: "How does Zero-Trust Network Access (ZTNA) enforce continuous identity verification and microsegmentation?", skills: ["system_thinking", "security_awareness"], type: "architecture" },
        { text: "How do side-channel attacks extract cryptographic keys by measuring cache access timing or power draw?", skills: ["attention_to_detail", "analytical_thinking"], type: "conceptual" },
        { text: "What cryptographic properties make SHA-256 collision-resistant and suitable for digital signatures?", skills: ["mathematical_readiness", "security_awareness"], type: "conceptual" },
        { text: "How do security teams contain and remediate active ransomware infections in Active Directory environments?", skills: ["persistence", "problem_solving"], type: "scenario" }
      ]
    },
    cloud_computing: {
      easy: [
        { text: "What is the key difference between Infrastructure as a Service (IaaS) and Platform as a Service (PaaS)?", skills: ["system_thinking", "conceptual"], type: "conceptual" },
        { text: "How does cloud auto-scaling dynamically adjust server capacity based on CPU metrics?", skills: ["system_thinking", "problem_solving"], type: "conceptual" },
        { text: "What storage class is cost-optimized for long-term compliance data archives?", skills: ["system_thinking", "decision"], type: "decision" },
        { text: "Why are cloud resources distributed across multiple Availability Zones (AZs)?", skills: ["system_thinking", "attention_to_detail"], type: "conceptual" },
        { text: "What security tool manages access keys and IAM permissions in public clouds?", skills: ["security_awareness", "system_thinking"], type: "conceptual" }
      ],
      medium: [
        { text: "How does Infrastructure as Code (Terraform / CloudFormation) declare reproducible environment state?", skills: ["system_thinking", "programming_readiness"], type: "architecture" },
        { text: "How do Content Delivery Networks (CDNs) edge-cache static assets to reduce origin server latency?", skills: ["system_thinking", "problem_solving"], type: "architecture" },
        { text: "When configuring VPC subnet routing, how do NAT Gateways protect private instance outbound traffic?", skills: ["system_thinking", "security_awareness"], type: "architecture" },
        { text: "How do cloud load balancers conduct health checks to remove unresponsive container targets?", skills: ["system_thinking", "debugging_ability"], type: "scenario" },
        { text: "What serverless architecture advantages (AWS Lambda) reduce idle computing cost overhead?", skills: ["system_thinking", "problem_solving"], type: "decision" }
      ],
      hard: [
        { text: "How do multi-cloud disaster recovery architectures execute cross-region active-active database failover?", skills: ["system_thinking", "problem_solving"], type: "architecture" },
        { text: "How do VPC Peering vs Transit Gateways manage scalable routing topologies in enterprise cloud networks?", skills: ["system_thinking", "attention_to_detail"], type: "architecture" },
        { text: "How do FinOps teams optimize cloud cost governance using spot instances, savings plans, and tags?", skills: ["analytical_thinking", "system_thinking"], type: "decision" },
        { text: "How do service meshes (Istio/Linkerd) handle mTLS encryption and traffic splitting across multi-cluster k8s?", skills: ["system_thinking", "security_awareness"], type: "architecture" },
        { text: "How do cloud-native immutable infrastructure patterns eliminate configuration drift in production environments?", skills: ["system_thinking", "persistence"], type: "conceptual" }
      ]
    },
    devops: {
      easy: [
        { text: "What is the primary objective of Continuous Integration (CI) in software development pipelines?", skills: ["programming_readiness", "system_thinking"], type: "conceptual" },
        { text: "How do Docker containers package applications with dependencies for consistent execution?", skills: ["system_thinking", "programming_readiness"], type: "conceptual" },
        { text: "What log aggregation tool collects and displays real-time server logs across microservices?", skills: ["debugging_ability", "system_thinking"], type: "conceptual" },
        { text: "Why are automated test suites executed before code is merged into production branches?", skills: ["attention_to_detail", "programming_readiness"], type: "conceptual" },
        { text: "What role does Git version control play in modern CI/CD deployment triggers?", skills: ["programming_readiness", "system_thinking"], type: "conceptual" }
      ],
      medium: [
        { text: "How do Kubernetes Pods, Deployments, and Services orchestrate container auto-healing and scaling?", skills: ["system_thinking", "problem_solving"], type: "architecture" },
        { text: "How does Blue-Green deployment strategy enable zero-downtime application releases?", skills: ["system_thinking", "problem_solving"], type: "scenario" },
        { text: "When CPU throttling degrades microservice response, how do Prometheus metrics assist root cause analysis?", skills: ["debugging_ability", "data_interpretation"], type: "debugging" },
        { text: "How do GitOps workflows (ArgoCD/Flux) synchronize Kubernetes cluster state directly from Git commits?", skills: ["system_thinking", "programming_readiness"], type: "architecture" },
        { text: "What canary deployment pattern routes 5% of traffic to new releases to monitor error rates?", skills: ["attention_to_detail", "system_thinking"], type: "decision" }
      ],
      hard: [
        { text: "How do Site Reliability Engineers (SREs) establish Error Budgets based on Service Level Objectives (SLOs)?", skills: ["analytical_thinking", "system_thinking"], type: "decision" },
        { text: "How do eBPF (Extended Berkeley Packet Filter) kernel probes monitor system calls without overhead?", skills: ["systems_programming", "debugging_ability"], type: "architecture" },
        { text: "How do Chaos Engineering experiments (Chaos Mesh/Litmus) proactively discover system failure modes?", skills: ["technical_curiosity", "persistence"], type: "scenario" },
        { text: "How do custom Kubernetes Controllers and Custom Resource Definitions (CRDs) extend k8s API behaviors?", skills: ["system_thinking", "programming_readiness"], type: "architecture" },
        { text: "How do high-availability etcd clusters maintain consensus using the Raft distributed algorithm?", skills: ["algorithmic_thinking", "system_thinking"], type: "conceptual" }
      ]
    },
    data_engineering: {
      easy: [
        { text: "What does the ETL acronym stand for in data pipeline construction?", skills: ["system_thinking", "data_interpretation"], type: "conceptual" },
        { text: "How does distributed file storage (HDFS / S3) handle massive petabyte-scale files?", skills: ["system_thinking", "data_interpretation"], type: "conceptual" },
        { text: "What column-oriented storage file format (Parquet / ORC) accelerates analytical queries?", skills: ["data_interpretation", "system_thinking"], type: "conceptual" },
        { text: "Why are raw data lake files ingested into staging schemas before business transformation?", skills: ["attention_to_detail", "data_interpretation"], type: "conceptual" },
        { text: "What SQL data warehouse service processes distributed queries over massive datasets?", skills: ["system_thinking", "programming_readiness"], type: "conceptual" }
      ],
      medium: [
        { text: "How does Apache Spark distribute data frames across worker node memory using Resilient Distributed Datasets (RDDs)?", skills: ["system_thinking", "programming_readiness"], type: "architecture" },
        { text: "When Apache Kafka topic partitions experience consumer lag, how do you rebalance consumer groups?", skills: ["debugging_ability", "system_thinking"], type: "debugging" },
        { text: "How do Airflow DAGs (Directed Acyclic Graphs) manage complex task dependency execution pipelines?", skills: ["system_thinking", "algorithmic_thinking"], type: "architecture" },
        { text: "What data modeling approach (Data Vault / Kimball) optimizes enterprise data warehouse historical tracking?", skills: ["analytical_thinking", "system_thinking"], type: "conceptual" },
        { text: "How does CDC (Change Data Capture) stream real-time database row mutations into data lakes?", skills: ["system_thinking", "data_interpretation"], type: "scenario" }
      ],
      hard: [
        { text: "How do Lakehouse formats (Delta Lake / Apache Iceberg) enforce ACID transactions and time-travel querying on cloud storage?", skills: ["system_thinking", "data_interpretation"], type: "architecture" },
        { text: "How do stream processing engines (Apache Flink) resolve out-of-order events using Event Time watermarks?", skills: ["algorithmic_thinking", "system_thinking"], type: "architecture" },
        { text: "How do data mesh architectures decentralize data ownership into domain-oriented data products?", skills: ["system_thinking", "communication"], type: "decision" },
        { text: "How do bloom filters reduce disk I/O operations in LSM-tree based storage engines (Cassandra/RocksDB)?", skills: ["algorithmic_thinking", "attention_to_detail"], type: "conceptual" },
        { text: "How do schema evolution frameworks (Avro / Protobuf) handle backward and forward compatibility in event streams?", skills: ["system_thinking", "attention_to_detail"], type: "architecture" }
      ]
    },
    database_systems: {
      easy: [
        { text: "What database property ensures that committed transactions are permanently saved despite power loss?", skills: ["system_thinking", "attention_to_detail"], type: "conceptual" },
        { text: "How does a B-Tree index speed up database search queries?", skills: ["algorithmic_thinking", "data_interpretation"], type: "conceptual" },
        { text: "What foreign key constraint prevents child table records from pointing to missing parent IDs?", skills: ["attention_to_detail", "programming_readiness"], type: "conceptual" },
        { text: "Why are database normalization rules (1NF to 3NF) applied to relational tables?", skills: ["analytical_thinking", "data_interpretation"], type: "conceptual" },
        { text: "What is the primary difference between SQL relational databases and NoSQL document stores?", skills: ["system_thinking", "data_interpretation"], type: "conceptual" }
      ],
      medium: [
        { text: "How do Database Query Explain Plans help identify missing indexes and full table scans?", skills: ["debugging_ability", "analytical_thinking"], type: "debugging" },
        { text: "What is the difference between Pessimistic Locking (SELECT FOR UPDATE) and Optimistic Locking (version columns)?", skills: ["programming_readiness", "system_thinking"], type: "decision" },
        { text: "How does database sharding partition large tables horizontally across independent server nodes?", skills: ["system_thinking", "problem_solving"], type: "architecture" },
        { text: "What Write-Ahead Logging (WAL) process guarantees transaction durability and point-in-time recovery?", skills: ["system_thinking", "attention_to_detail"], type: "conceptual" },
        { text: "How do Read Replicas relieve primary database CPU load under heavy read-traffic spikes?", skills: ["system_thinking", "problem_solving"], type: "scenario" }
      ],
      hard: [
        { text: "How do Multi-Version Concurrency Control (MVCC) implementations allow readers to not block writers?", skills: ["systems_programming", "system_thinking"], type: "architecture" },
        { text: "How does the Spanner database achieve global external consistency using TrueTime atomic clocks?", skills: ["system_thinking", "algorithmic_thinking"], type: "architecture" },
        { text: "How do Log-Structured Merge (LSM) trees optimize write-heavy workloads compared to traditional B-Trees?", skills: ["algorithmic_thinking", "system_thinking"], type: "conceptual" },
        { text: "How do Two-Phase Commit (2PC) protocols coordinate distributed transaction commits across nodes?", skills: ["system_thinking", "logical_reasoning"], type: "conceptual" },
        { text: "How do query optimizers compute dynamic join order plans using cost-based statistical histograms?", skills: ["mathematical_readiness", "algorithmic_thinking"], type: "architecture" }
      ]
    },
    embedded_iot: {
      easy: [
        { text: "What is the function of a Microcontroller Unit (MCU) in embedded electronic devices?", skills: ["logical_reasoning", "systems_thinking"], type: "conceptual" },
        { text: "What communication protocol (GPIO, I2C, SPI) uses two wire lines for master-slave IC communication?", skills: ["attention_to_detail", "systems_thinking"], type: "conceptual" },
        { text: "Why are Real-Time Operating Systems (RTOS) used instead of general-purpose OS in embedded systems?", skills: ["systems_thinking", "attention_to_detail"], type: "conceptual" },
        { text: "What sensor type measures physical acceleration and tilt orientation in IoT devices?", skills: ["spatial_reasoning", "technical_curiosity"], type: "conceptual" },
        { text: "What low-power wireless protocol is widely used for battery-operated IoT sensor networks?", skills: ["systems_thinking", "technical_curiosity"], type: "conceptual" }
      ],
      medium: [
        { text: "How do hardware interrupts suspend main loop execution to handle urgent pin level changes?", skills: ["systems_programming", "attention_to_detail"], type: "scenario" },
        { text: "How does Pulse-Width Modulation (PWM) control motor speed and LED brightness from digital pins?", skills: ["mathematical_readiness", "spatial_reasoning"], type: "problem_solving" },
        { text: "When an IoT device experiences power loss, how does Watchdog Timer (WDT) perform auto-reset?", skills: ["debugging_ability", "systems_thinking"], type: "debugging" },
        { text: "How does MQTT protocol's lightweight pub/sub model minimize network bandwidth on cellular IoT modules?", skills: ["systems_thinking", "problem_solving"], type: "architecture" },
        { text: "What analog-to-digital converter (ADC) sampling rate setting prevents signal aliasing according to Nyquist theorem?", skills: ["mathematical_readiness", "attention_to_detail"], type: "conceptual" }
      ],
      hard: [
        { text: "How do memory-mapped I/O registers configure DMA (Direct Memory Access) transfers without CPU intervention?", skills: ["systems_programming", "attention_to_detail"], type: "architecture" },
        { text: "How do firmware engineers implement secure bootloaders with cryptographic ECDSA signature verification?", skills: ["security_awareness", "systems_programming"], type: "security" },
        { text: "How do debouncing algorithms eliminate mechanical switch noise in high-speed digital inputs?", skills: ["debugging_ability", "algorithmic_thinking"], type: "debugging" },
        { text: "How do low-power deep sleep modes preserve SRAM retention while shutting down MCU clock trees?", skills: ["systems_programming", "problem_solving"], type: "architecture" },
        { text: "How do CAN bus protocols resolve non-destructive bitwise arbitration during concurrent node transmissions?", skills: ["systems_thinking", "logical_reasoning"], type: "conceptual" }
      ]
    },
    robotics: {
      easy: [
        { text: "What component acts as the physical muscle of a robotic arm to create rotational movement?", skills: ["spatial_reasoning", "problem_solving"], type: "conceptual" },
        { text: "What sensor component allows mobile robots to measure distance to obstacle surfaces?", skills: ["spatial_reasoning", "technical_curiosity"], type: "conceptual" },
        { text: "What coordinate system (Cartesian / Spherical) specifies robot end-effector positions in 3D space?", skills: ["spatial_reasoning", "mathematical_readiness"], type: "conceptual" },
        { text: "Why are closed-loop feedback encoders added to stepper motors?", skills: ["systems_thinking", "attention_to_detail"], type: "conceptual" },
        { text: "What is the primary function of ROS (Robot Operating System) nodes in robotics development?", skills: ["systems_thinking", "programming_readiness"], type: "conceptual" }
      ],
      medium: [
        { text: "How does Forward Kinematics calculate the end-effector pose from known joint angles?", skills: ["mathematical_readiness", "spatial_reasoning"], type: "problem_solving" },
        { text: "How does a PID (Proportional-Integral-Derivative) controller tune motor position error to eliminate overshoot?", skills: ["mathematical_readiness", "problem_solving"], type: "problem_solving" },
        { text: "How do LiDAR point clouds construct 2D grid maps during autonomous mobile robot navigation?", skills: ["spatial_reasoning", "pattern_recognition"], type: "architecture" },
        { text: "What path planning algorithm (A* / RRT) finds collision-free trajectories in high-dimensional joint space?", skills: ["algorithmic_thinking", "spatial_reasoning"], type: "conceptual" },
        { text: "How do Inertial Measurement Units (IMUs) combine accelerometer and gyroscope data using complementary filters?", skills: ["mathematical_readiness", "debugging_ability"], type: "debugging" }
      ],
      hard: [
        { text: "How do Extended Kalman Filters (EKF) or SLAM algorithms fuse noisy sensor measurements into state estimates?", skills: ["mathematical_readiness", "spatial_reasoning"], type: "architecture" },
        { text: "How does Inverse Kinematics handle singular configuration matrices when joint Jacobians lose rank?", skills: ["mathematical_readiness", "algorithmic_thinking"], type: "problem_solving" },
        { text: "How do Model Predictive Control (MPC) frameworks solve real-time trajectory optimization under torque limits?", skills: ["mathematical_readiness", "systems_thinking"], type: "architecture" },
        { text: "How do quadruped robot locomotion controllers manage dynamic gait stability using zero-moment point (ZMP)?", skills: ["spatial_reasoning", "systems_thinking"], type: "conceptual" },
        { text: "How do ROS2 DDS (Data Distribution Service) middleware quality-of-service (QoS) profiles enforce real-time latency?", skills: ["systems_thinking", "programming_readiness"], type: "architecture" }
      ]
    },
    blockchain: {
      easy: [
        { text: "What cryptographic structure connects blocks together sequentially in a blockchain ledger?", skills: ["logical_reasoning", "security_awareness"], type: "conceptual" },
        { text: "What is the function of public key cryptography in digital wallet transactions?", skills: ["security_awareness", "logical_reasoning"], type: "conceptual" },
        { text: "What consensus mechanism relies on computational hashing power to validate transactions?", skills: ["logical_reasoning", "technical_curiosity"], type: "conceptual" },
        { text: "What is a Smart Contract in decentralized blockchain networks?", skills: ["programming_readiness", "logical_reasoning"], type: "conceptual" },
        { text: "Why are blockchain transactions considered immutable once confirmed?", skills: ["security_awareness", "attention_to_detail"], type: "conceptual" }
      ],
      medium: [
        { text: "How do Merkle Trees allow efficient membership verification of transactions inside a block?", skills: ["algorithmic_thinking", "data_interpretation"], type: "conceptual" },
        { text: "How does Proof of Stake (PoS) select block validators compared to Proof of Work (PoW)?", skills: ["logical_reasoning", "systems_thinking"], type: "conceptual" },
        { text: "In Solidity smart contracts, how do reentrancy attack vulnerabilities execute unauthorized withdrawals?", skills: ["security_awareness", "debugging_ability"], type: "debugging" },
        { text: "What mechanism handles gas fees in Ethereum to execute EVM opcode instructions?", skills: ["systems_thinking", "attention_to_detail"], type: "conceptual" },
        { text: "How do decentralized oracle networks (Chainlink) feed external off-chain data into smart contracts?", skills: ["systems_thinking", "problem_solving"], type: "architecture" }
      ],
      hard: [
        { text: "How do Zero-Knowledge Proofs (zk-SNARKs / zk-STARKs) verify statement validity without revealing underlying data?", skills: ["mathematical_readiness", "security_awareness"], type: "architecture" },
        { text: "How do Layer-2 scaling solutions (Optimistic Rollups / ZK-Rollups) batch transactions off-chain for Ethereum settlement?", skills: ["systems_thinking", "algorithmic_thinking"], type: "architecture" },
        { text: "How do Automated Market Makers (AMM) maintain constant product liquidity pools (x * y = k) in DeFi protocols?", skills: ["mathematical_readiness", "problem_solving"], type: "conceptual" },
        { text: "How do Byzantine Fault Tolerant (BFT) consensus algorithms maintain network safety when 1/3 of nodes are malicious?", skills: ["logical_reasoning", "systems_thinking"], type: "conceptual" },
        { text: "How do cross-chain bridge protocols use cryptographic multi-sigs or relayers to lock and mint token assets safely?", skills: ["security_awareness", "systems_thinking"], type: "security" }
      ]
    },
    game_development: {
      easy: [
        { text: "What component loop executes continuous update and render steps in game engines?", skills: ["programming_readiness", "creativity"], type: "conceptual" },
        { text: "What spatial structure represents 3D object rotation without gimbal lock issues?", skills: ["spatial_reasoning", "mathematical_readiness"], type: "conceptual" },
        { text: "What component handles physical collision detection between game entities?", skills: ["spatial_reasoning", "problem_solving"], type: "conceptual" },
        { text: "Why are asset prefab templates used in game design toolkits (Unity / Unreal)?", skills: ["programming_readiness", "creativity"], type: "conceptual" },
        { text: "What frame rate target is standard for smooth responsive player gameplay?", skills: ["attention_to_detail", "creativity"], type: "decision" }
      ],
      medium: [
        { text: "How do Entity Component Systems (ECS) separate data components from processing logic for CPU cache locality?", skills: ["systems_thinking", "programming_readiness"], type: "architecture" },
        { text: "How do shader programs (HLSL / GLSL) execute vertex and fragment lighting calculations on GPUs?", skills: ["spatial_reasoning", "mathematical_readiness"], type: "problem_solving" },
        { text: "When 100 particle instances drop game performance, how does GPU Instancing solve draw call bottlenecks?", skills: ["problem_solving", "debugging_ability"], type: "debugging" },
        { text: "How do state machines control character animation transitions based on player velocity and input?", skills: ["logical_reasoning", "creativity"], type: "architecture" },
        { text: "How do navmesh pathfinding grids calculate AI agent movement around static obstacles using A*?", skills: ["algorithmic_thinking", "spatial_reasoning"], type: "problem_solving" }
      ],
      hard: [
        { text: "How do client-side prediction and server reconciliation algorithms eliminate movement lag in multiplayer FPS games?", skills: ["systems_thinking", "debugging_ability"], type: "architecture" },
        { text: "How do Ray Tracing acceleration structures (BVH - Bounding Volume Hierarchy) compute real-time light bounces?", skills: ["mathematical_readiness", "spatial_reasoning"], type: "architecture" },
        { text: "How do skeletal animation blend trees compute inverse kinematics (IK) for feet placing on uneven terrain?", skills: ["spatial_reasoning", "mathematical_readiness"], type: "problem_solving" },
        { text: "How do custom memory allocators (Arena / Pool allocators) prevent runtime garbage collection stutters in C++ game engines?", skills: ["systems_programming", "attention_to_detail"], type: "architecture" },
        { text: "How do level-of-detail (LOD) mesh algorithms dynamically simplify geometry polygons based on camera distance?", skills: ["spatial_reasoning", "algorithmic_thinking"], type: "conceptual" }
      ]
    },
    ar_vr: {
      easy: [
        { text: "What term describes the feeling of physically existing inside a virtual reality environment?", skills: ["creativity", "spatial_reasoning"], type: "conceptual" },
        { text: "What sensor technology tracks headset 6-DOF (Degrees of Freedom) movement without external beacons?", skills: ["spatial_reasoning", "technical_curiosity"], type: "conceptual" },
        { text: "What visual artifact causes motion sickness when VR rendering latency exceeds 20ms?", skills: ["attention_to_detail", "spatial_reasoning"], type: "conceptual" },
        { text: "How does Augmented Reality overlay digital graphics onto real-world camera feeds?", skills: ["spatial_reasoning", "creativity"], type: "conceptual" },
        { text: "What is the purpose of spatial audio rendering in VR applications?", skills: ["creativity", "spatial_reasoning"], type: "conceptual" }
      ],
      medium: [
        { text: "How do SLAM (Simultaneous Localization and Mapping) algorithms detect flat surface planes for AR placement?", skills: ["spatial_reasoning", "mathematical_readiness"], type: "architecture" },
        { text: "How does Foveated Rendering use eye-tracking to render only the central focus point at high resolution?", skills: ["spatial_reasoning", "problem_solving"], type: "architecture" },
        { text: "When calibrating hand tracking in VR, how do gesture recognition pipelines interpret joint bone transforms?", skills: ["spatial_reasoning", "pattern_recognition"], type: "scenario" },
        { text: "How do passthrough cameras in mixed reality headsets align digital objects with real depth maps?", skills: ["spatial_reasoning", "attention_to_detail"], type: "conceptual" },
        { text: "What open standard API (OpenXR) enables cross-platform VR/AR application execution across headsets?", skills: ["systems_thinking", "programming_readiness"], type: "conceptual" }
      ],
      hard: [
        { text: "How do lightfield displays and varifocal optics solve the vergence-accommodation conflict in VR headsets?", skills: ["spatial_reasoning", "mathematical_readiness"], type: "architecture" },
        { text: "How do neural radiance fields (NeRFs) synthesize 3D scene photorealism from sparse 2D image captures?", skills: ["mathematical_readiness", "spatial_reasoning"], type: "architecture" },
        { text: "How do asynchronous timewarp (ATW) and spacewarp (ASW) frame extrapolation algorithms prevent dropped VR frames?", skills: ["spatial_reasoning", "debugging_ability"], type: "debugging" },
        { text: "How do spatial anchor cloud systems synchronize persistent AR object locations across multi-user devices?", skills: ["systems_thinking", "spatial_reasoning"], type: "architecture" },
        { text: "How do haptic feedback gloves use micro-actuators to simulate physical material resistance in virtual spaces?", skills: ["spatial_reasoning", "creativity"], type: "conceptual" }
      ]
    },
    ui_ux: {
      easy: [
        { text: "What is the main goal of user research during initial UI design wireframing?", skills: ["creativity", "user_centricity"], type: "conceptual" },
        { text: "What visual design hierarchy principle guides user attention to primary CTA buttons?", skills: ["creativity", "attention_to_detail"], type: "conceptual" },
        { text: "What contrast ratio standard ensures text readability for visually impaired users (WCAG Guidelines)?", skills: ["attention_to_detail", "user_centricity"], type: "decision" },
        { text: "Why are low-fidelity prototypes used before writing production frontend code?", skills: ["creativity", "problem_solving"], type: "conceptual" },
        { text: "What usability metric measures how quickly users accomplish a task in an interface?", skills: ["user_centricity", "analytical_thinking"], type: "conceptual" }
      ],
      medium: [
        { text: "How do design systems (tokens, reusable components, typography grids) maintain multi-product consistency?", skills: ["system_thinking", "creativity"], type: "architecture" },
        { text: "How do usability testing sessions uncover friction points using think-aloud protocols?", skills: ["user_centricity", "attention_to_detail"], type: "scenario" },
        { text: "When organizing complex navigation menus, how does card sorting inform information architecture?", skills: ["creativity", "analytical_thinking"], type: "decision" },
        { text: "How does Fitts's Law predict user target acquisition time based on button distance and size?", skills: ["user_centricity", "mathematical_readiness"], type: "conceptual" },
        { text: "What micro-interaction animation principles provide immediate visual feedback during form submission?", skills: ["creativity", "attention_to_detail"], type: "decision" }
      ],
      hard: [
        { text: "How do quantitative analytics (heatmaps, session replays) combine with qualitative interviews to solve conversion drop-offs?", skills: ["analytical_thinking", "user_centricity"], type: "problem_solving" },
        { text: "How do accessibility engineers build ARIA live regions and keyboard focus traps for dynamic single-page web apps?", skills: ["attention_to_detail", "programming_readiness"], type: "architecture" },
        { text: "How do design tokens map across Figma design libraries and multi-platform native codebase tokens dynamically?", skills: ["system_thinking", "creativity"], type: "architecture" },
        { text: "What cognitive load theories (Hick's Law, Miller's Law) dictate mobile screen information density limits?", skills: ["user_centricity", "analytical_thinking"], type: "conceptual" },
        { text: "How do UX designers architect multi-modal interface flows combining voice commands, touch gestures, and haptics?", skills: ["creativity", "system_thinking"], type: "architecture" }
      ]
    },
    systems_programming: {
      easy: [
        { text: "What is the primary difference between Stack and Heap memory allocation in C/C++?", skills: ["systems_programming", "attention_to_detail"], type: "conceptual" },
        { text: "What compiler tool translates high-level C code into machine assembly code?", skills: ["systems_programming", "programming_readiness"], type: "conceptual" },
        { text: "Why are raw memory pointers dangerous if uninitialized or dereferenced after free?", skills: ["systems_programming", "debugging_ability"], type: "conceptual" },
        { text: "What Operating System component manages process CPU scheduling and memory isolation?", skills: ["systems_programming", "system_thinking"], type: "conceptual" },
        { text: "What is a system call (syscall) in operating system kernel architecture?", skills: ["systems_programming", "system_thinking"], type: "conceptual" }
      ],
      medium: [
        { text: "How do OS page tables map virtual memory addresses to physical RAM frames using TLB caches?", skills: ["systems_programming", "system_thinking"], type: "architecture" },
        { text: "How does Rust enforce memory safety without garbage collection using Ownership and Borrow Checker rules?", skills: ["systems_programming", "logical_reasoning"], type: "conceptual" },
        { text: "When a process encounters a Segmentation Fault (SIGSEGV), what root cause does GDB debugger usually reveal?", skills: ["debugging_ability", "systems_programming"], type: "debugging" },
        { text: "How do atomic instructions (Compare-And-Swap) implement lock-free concurrent data structures?", skills: ["systems_programming", "algorithmic_thinking"], type: "architecture" },
        { text: "How do POSIX threads (pthreads) use mutexes and condition variables to avoid race conditions?", skills: ["systems_programming", "attention_to_detail"], type: "problem_solving" }
      ],
      hard: [
        { text: "How do zero-copy I/O mechanisms (sendfile / io_uring) bypass kernel-to-user space buffer copying?", skills: ["systems_programming", "system_thinking"], type: "architecture" },
        { text: "How do custom memory allocators (jemalloc / tcmalloc) combat thread contention and memory fragmentation?", skills: ["systems_programming", "problem_solving"], type: "architecture" },
        { text: "How does hypervisor hardware virtualization (Intel VT-x / AMD-V) trap and emulate guest OS instructions?", skills: ["systems_programming", "system_thinking"], type: "architecture" },
        { text: "How do ELF linker dynamic symbol resolution tables process runtime shared library (.so / .dll) loading?", skills: ["systems_programming", "attention_to_detail"], type: "conceptual" },
        { text: "How do cache line invalidation protocols (MESI) enforce CPU cache coherence across multi-core sockets?", skills: ["systems_programming", "hardware_reasoning"], type: "conceptual" }
      ]
    },
    software_testing: {
      easy: [
        { text: "What is the primary difference between Unit Testing and Integration Testing?", skills: ["attention_to_detail", "programming_readiness"], type: "conceptual" },
        { text: "What test automation methodology writes failing test cases before writing feature code (TDD)?", skills: ["attention_to_detail", "problem_solving"], type: "conceptual" },
        { text: "What tool automates browser user interface testing across web browsers (Selenium/Playwright)?", skills: ["programming_readiness", "debugging_ability"], type: "conceptual" },
        { text: "Why are mock objects and stubs used during unit testing isolation?", skills: ["attention_to_detail", "logical_reasoning"], type: "conceptual" },
        { text: "What regression testing step verifies that bug fixes did not break existing features?", skills: ["attention_to_detail", "persistence"], type: "conceptual" }
      ],
      medium: [
        { text: "How do boundary value analysis and equivalence partitioning select optimal test case inputs?", skills: ["attention_to_detail", "logical_reasoning"], type: "problem_solving" },
        { text: "How do code coverage tools (JaCoCo / Istanbul) measure branch execution metrics during CI runs?", skills: ["programming_readiness", "data_interpretation"], type: "scenario" },
        { text: "When automated E2E tests exhibit flakiness, how do wait strategies (explicit wait vs implicit sleep) fix them?", skills: ["debugging_ability", "attention_to_detail"], type: "debugging" },
        { text: "How do contract testing frameworks (Pact) verify API interface compatibility between frontend and backend?", skills: ["system_thinking", "attention_to_detail"], type: "architecture" },
        { text: "What performance testing tools (JMeter / k6) simulate concurrent user load spikes on web servers?", skills: ["programming_readiness", "system_thinking"], type: "scenario" }
      ],
      hard: [
        { text: "How do mutation testing frameworks (Pitest/Stryker) evaluate test suite effectiveness by injecting code faults?", skills: ["attention_to_detail", "analytical_thinking"], type: "architecture" },
        { text: "How do fuzzer engines (AFL / libFuzzer) generate random malformed inputs to trigger memory safety crashes?", skills: ["debugging_ability", "security_awareness"], type: "debugging" },
        { text: "How do property-based testing libraries (Hypothesis / QuickCheck) verify invariant laws across thousands of inputs?", skills: ["algorithmic_thinking", "attention_to_detail"], type: "conceptual" },
        { text: "How do automated visual regression tools (Applitools/Percy) use AI diffing to spot layout shifts across viewports?", skills: ["attention_to_detail", "creativity"], type: "decision" },
        { text: "How do chaos testing suites evaluate system resilience under injected network latency and packet loss?", skills: ["system_thinking", "persistence"], type: "scenario" }
      ]
    },
    research_rd: {
      easy: [
        { text: "What is the purpose of conducting a literature review before embarking on CS research projects?", skills: ["analytical_thinking", "technical_curiosity"], type: "conceptual" },
        { text: "What metric measures academic publication impact based on citations (h-index)?", skills: ["analytical_thinking", "communication"], type: "conceptual" },
        { text: "Why are asymptotic complexity notations (Big-O, Big-Theta) used to analyze algorithm efficiency?", skills: ["mathematical_readiness", "algorithmic_thinking"], type: "conceptual" },
        { text: "What peer-review process evaluates research paper novelty before conference acceptance?", skills: ["analytical_thinking", "attention_to_detail"], type: "conceptual" },
        { text: "Why is open-source code artifact availability crucial for scientific reproducibility?", skills: ["technical_curiosity", "persistence"], type: "conceptual" }
      ],
      medium: [
        { text: "How do researchers formulate formal mathematical proofs for NP-Completeness via polynomial reduction?", skills: ["mathematical_readiness", "algorithmic_thinking"], type: "problem_solving" },
        { text: "How do experimental benchmarks isolate variables to publish statistically significant claims?", skills: ["analytical_thinking", "data_interpretation"], type: "scenario" },
        { text: "When proposing a novel deep learning architecture, how do ablation studies prove individual component value?", skills: ["analytical_thinking", "pattern_recognition"], type: "decision" },
        { text: "How do quantum computing algorithms (Shor's / Grover's) achieve speedup over classical algorithms?", skills: ["mathematical_readiness", "technical_curiosity"], type: "conceptual" },
        { text: "How do formal verification tools (TLA+ / Coq) prove system design correctness mathematically?", skills: ["logical_reasoning", "mathematical_readiness"], type: "architecture" }
      ],
      hard: [
        { text: "How do researchers design novel consensus protocol proofs balancing Safety and Liveness under asynchronous network assumptions?", skills: ["mathematical_readiness", "system_thinking"], type: "architecture" },
        { text: "How do homomorphic encryption algorithms execute arbitrary computations directly over encrypted ciphertext data?", skills: ["mathematical_readiness", "security_awareness"], type: "architecture" },
        { text: "How do researchers prove lower bound complexity limits for distributed decision problems using algebraic topology?", skills: ["mathematical_readiness", "analytical_thinking"], type: "conceptual" },
        { text: "How do neuromorphic hardware computing models emulate biological spiking neural network (SNN) dynamics?", skills: ["technical_curiosity", "mathematical_readiness"], type: "architecture" },
        { text: "How do program synthesis algorithms auto-generate code implementations from formal logical constraints?", skills: ["algorithmic_thinking", "logical_reasoning"], type: "architecture" }
      ]
    }
  };

  let globalQNum = 1;

  domainsList.forEach(domain => {
    // If we have detailed domain template, use it; otherwise fallback to structured domain template
    const spec = domainSpecificData[domain.id];

    ["easy", "medium", "hard"].forEach(difficulty => {
      const xpVal = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 30;

      for (let i = 0; i < 5; i++) {
        let qData;
        if (spec && spec[difficulty] && spec[difficulty][i]) {
          const item = spec[difficulty][i];
          qData = {
            text: item.text,
            type: item.type || "scenario",
            skills: item.skills || ["problem_solving", "analytical_thinking"],
            options: [
              { id: "A", text: `Primary optimal approach: ${item.text.replace('?', '')} using domain best practices.`, impact: { [item.skills[0]]: 0.9, [item.skills[1] || 'problem_solving']: 0.8 } },
              { id: "B", text: `Secondary standard approach with moderate trade-offs in efficiency.`, impact: { [item.skills[0]]: 0.5, [item.skills[1] || 'problem_solving']: 0.4 } },
              { id: "C", text: `Basic legacy workaround that fails to scale or handle edge cases.`, impact: { [item.skills[0]]: 0.2, [item.skills[1] || 'problem_solving']: 0.2 } },
              { id: "D", text: `Incorrect approach that introduces bugs or performance bottlenecks.`, impact: { [item.skills[0]]: 0.0, [item.skills[1] || 'problem_solving']: 0.0 } }
            ],
            correct: "A",
            explanation: `Applying ${item.skills.join(" and ")} delivers optimal results for this ${domain.name} domain scenario.`,
            fuzzy: { [item.skills[0]]: "high", [(item.skills[1] || 'problem_solving')]: "high" }
          };
        } else {
          // Generate structured domain fallback question
          const skillA = "problem_solving";
          const skillB = "system_thinking";
          qData = {
            text: `In ${domain.name} (${difficulty.toUpperCase()} level, Task ${i + 1}), how do you systematically address core engineering trade-offs?`,
            type: "scenario",
            skills: [skillA, skillB],
            options: [
              { id: "A", text: `Analyze requirements, design modular components, and apply domain best practices.`, impact: { [skillA]: 0.9, [skillB]: 0.8 } },
              { id: "B", text: `Apply standard quick fixes without deep architecture review.`, impact: { [skillA]: 0.5, [skillB]: 0.4 } },
              { id: "C", text: `Rely on manual trial-and-error changes in production.`, impact: { [skillA]: 0.2, [skillB]: 0.2 } },
              { id: "D", text: `Ignore performance indicators and skip validation testing.`, impact: { [skillA]: 0.0, [skillB]: 0.0 } }
            ],
            correct: "A",
            explanation: `Structured problem solving and system thinking are key in ${domain.name}.`,
            fuzzy: { [skillA]: "high", [skillB]: "high" }
          };
        }

        const qId = `q_${domain.id}_${difficulty}_${i + 1}`;
        const optionIdPrefix = `opt_${domain.id}_${difficulty[0]}_${i + 1}`;

        allQuestions.push({
          questionId: qId,
          questionNumber: globalQNum++,
          domainId: domain.id,
          domainName: domain.name,
          domain: domain.id,
          difficulty: difficulty,
          questionType: qData.type,
          category: domain.name,
          dimension: qData.skills[0] ? qData.skills[0].replace('_', ' ').toUpperCase() : "CAREER DISCOVERY",
          questionText: qData.text,
          options: qData.options.map(opt => ({
            id: opt.id,
            optionId: `${optionIdPrefix}_${opt.id.toLowerCase()}`,
            text: opt.text,
            fuzzyImpact: opt.impact,
            skillMappings: opt.impact,
            fuzzyIntensity: opt.id === "A" ? 9 : opt.id === "B" ? 6 : opt.id === "C" ? 3 : 1
          })),
          correctOption: qData.correct,
          explanation: qData.explanation,
          skillDimensions: qData.skills,
          skillVariables: qData.skills,
          fuzzyMappings: qData.fuzzy,
          xp: xpVal,
          active: true,
          status: "active"
        });
      }
    });
  });

  return allQuestions;
}

const CAREER_DISCOVERY_QUESTION_BANK = generateFullQuestionBank();

const seedCareerDiscoveryQuestions = async () => {
  try {
    await AhpFuzzyQuestion.collection.dropIndex("questionNumber_1").catch(() => {});
    const ops = CAREER_DISCOVERY_QUESTION_BANK.map(q => ({
      updateOne: {
        filter: { questionId: q.questionId },
        update: { $set: q },
        upsert: true
      }
    }));

    const res = await AhpFuzzyQuestion.bulkWrite(ops);
    const added = res.upsertedCount || 0;
    const updated = res.modifiedCount || 0;

    // PRINT REQUIRED SUMMARY BREAKDOWN LOG
    console.log("================================================");
    console.log("CAREER DISCOVERY QUESTION BANK SEED SUMMARY");
    console.log("================================================");

    const domains = Array.from(new Set(CAREER_DISCOVERY_QUESTION_BANK.map(q => q.domainId)));
    let grandTotalEasy = 0;
    let grandTotalMed = 0;
    let grandTotalHard = 0;

    domains.forEach(dId => {
      const dQuestions = CAREER_DISCOVERY_QUESTION_BANK.filter(q => q.domainId === dId);
      const easyCount = dQuestions.filter(q => q.difficulty === "easy").length;
      const medCount = dQuestions.filter(q => q.difficulty === "medium").length;
      const hardCount = dQuestions.filter(q => q.difficulty === "hard").length;

      grandTotalEasy += easyCount;
      grandTotalMed += medCount;
      grandTotalHard += hardCount;

      const dName = dQuestions[0]?.domainName || dId;
      console.log(`${dName}`);
      console.log(`  Easy:    ${easyCount}`);
      console.log(`  Medium:  ${medCount}`);
      console.log(`  Hard:    ${hardCount}`);
    });

    const grandTotal = grandTotalEasy + grandTotalMed + grandTotalHard;
    console.log("------------------------------------------------");
    console.log("TOTAL:");
    console.log(`Domains: ${domains.length}`);
    console.log(`Easy: ${grandTotalEasy}`);
    console.log(`Medium: ${grandTotalMed}`);
    console.log(`Hard: ${grandTotalHard}`);
    console.log(`Total: ${grandTotal}`);
    console.log("------------------------------------------------");
    console.log(`Database Upsert Result: ${added} added, ${updated} updated.`);
    console.log("Seed completed successfully.");
    console.log("================================================");

    return {
      domainsCount: domains.length,
      easyCount: grandTotalEasy,
      mediumCount: grandTotalMed,
      hardCount: grandTotalHard,
      totalCount: grandTotal
    };
  } catch (err) {
    console.error("Error seeding Career Discovery questions:", err.message);
    throw err;
  }
};

module.exports = { seedCareerDiscoveryQuestions, CAREER_DISCOVERY_QUESTION_BANK };
