const mongoose = require("mongoose");
const AhpFuzzyQuestion = require("../models/AhpFuzzyQuestion");

const PDF_MASTER_QUESTION_BANK = [
  // =========================================================================
  // DOMAIN 1: CYBER SECURITY & ETHICAL HACKING (15 PDF QUESTIONS)
  // =========================================================================
  {
    questionId: "q_cyber_security_e1",
    branch: "CSE",
    domainId: "cyber_security",
    domainName: "Cyber Security & Ethical Hacking",
    domain: "cyber_security",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What does the CIA triad stand for?",
    options: [
      { id: "A", optionId: "A", text: "Confidentiality, Integrity, Availability" },
      { id: "B", optionId: "B", text: "Control, Inspection, Authentication" },
      { id: "C", optionId: "C", text: "Confidentiality, Inspection, Authorization" },
      { id: "D", optionId: "D", text: "Cryptography, Integrity, Access" }
    ],
    correctOption: "A",
    explanation: "The CIA triad stands for Confidentiality, Integrity, and Availability.",
    skillDimensions: ["attention_to_detail", "system_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cyber_security_e2",
    branch: "CSE",
    domainId: "cyber_security",
    domainName: "Cyber Security & Ethical Hacking",
    domain: "cyber_security",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "Which practice helps protect an account even if its password is compromised?",
    options: [
      { id: "A", optionId: "A", text: "Multi-factor authentication" },
      { id: "B", optionId: "B", text: "Disabling updates" },
      { id: "C", optionId: "C", text: "Using a shared password" },
      { id: "D", optionId: "D", text: "Removing session expiration" }
    ],
    correctOption: "A",
    explanation: "Multi-factor authentication (MFA) requires a second factor beyond a password.",
    skillDimensions: ["attention_to_detail", "persistence"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cyber_security_e3",
    branch: "CSE",
    domainId: "cyber_security",
    domainName: "Cyber Security & Ethical Hacking",
    domain: "cyber_security",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What is phishing?",
    options: [
      { id: "A", optionId: "A", text: "A social-engineering attack that attempts to trick users into revealing information or taking unsafe actions" },
      { id: "B", optionId: "B", text: "A disk partition method" },
      { id: "C", optionId: "C", text: "A compression algorithm" },
      { id: "D", optionId: "D", text: "A database index" }
    ],
    correctOption: "A",
    explanation: "Phishing is a social-engineering attack to trick victims into revealing sensitive information.",
    skillDimensions: ["attention_to_detail", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cyber_security_e4",
    branch: "CSE",
    domainId: "cyber_security",
    domainName: "Cyber Security & Ethical Hacking",
    domain: "cyber_security",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What does HTTPS primarily provide for web traffic?",
    options: [
      { id: "A", optionId: "A", text: "Encrypted communication and server authentication through TLS" },
      { id: "B", optionId: "B", text: "Faster CPU execution" },
      { id: "C", optionId: "C", text: "Database normalization" },
      { id: "D", optionId: "D", text: "Automatic backups" }
    ],
    correctOption: "A",
    explanation: "HTTPS encrypts HTTP communication using Transport Layer Security (TLS).",
    skillDimensions: ["system_thinking", "attention_to_detail"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cyber_security_e5",
    branch: "CSE",
    domainId: "cyber_security",
    domainName: "Cyber Security & Ethical Hacking",
    domain: "cyber_security",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What is the purpose of a firewall?",
    options: [
      { id: "A", optionId: "A", text: "Monitor and control incoming and outgoing network traffic based on security rules" },
      { id: "B", optionId: "B", text: "Accelerate GPU rendering" },
      { id: "C", optionId: "C", text: "Compress video files" },
      { id: "D", optionId: "D", text: "Generate random passwords" }
    ],
    correctOption: "A",
    explanation: "A firewall filters network traffic according to predefined security rules.",
    skillDimensions: ["system_thinking", "attention_to_detail"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cyber_security_m1",
    branch: "CSE",
    domainId: "cyber_security",
    domainName: "Cyber Security & Ethical Hacking",
    domain: "cyber_security",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "How does symmetric encryption differ from asymmetric encryption?",
    options: [
      { id: "A", optionId: "A", text: "Symmetric uses the same key for encryption and decryption; asymmetric uses a public-private key pair" },
      { id: "B", optionId: "B", text: "Symmetric requires no key" },
      { id: "C", optionId: "C", text: "Asymmetric is only used offline" },
      { id: "D", optionId: "D", text: "Symmetric cannot encrypt text" }
    ],
    correctOption: "A",
    explanation: "Symmetric encryption uses one secret key, whereas asymmetric encryption uses key pairs.",
    skillDimensions: ["analytical_thinking", "system_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cyber_security_m2",
    branch: "CSE",
    domainId: "cyber_security",
    domainName: "Cyber Security & Ethical Hacking",
    domain: "cyber_security",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "What is SQL injection?",
    options: [
      { id: "A", optionId: "A", text: "Inserting malicious SQL code into input fields to manipulate backend database queries" },
      { id: "B", optionId: "B", text: "Optimizing database queries automatically" },
      { id: "C", optionId: "C", text: "Creating table foreign keys" },
      { id: "D", optionId: "D", text: "Exporting data to CSV" }
    ],
    correctOption: "A",
    explanation: "SQL injection tampers with application database queries via untrusted input.",
    skillDimensions: ["problem_solving", "attention_to_detail"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cyber_security_m3",
    branch: "CSE",
    domainId: "cyber_security",
    domainName: "Cyber Security & Ethical Hacking",
    domain: "cyber_security",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "What fundamental security rule restricts user access strictly to the minimal permissions required?",
    options: [
      { id: "A", optionId: "A", text: "Principle of least privilege" },
      { id: "B", optionId: "B", text: "Defense in depth" },
      { id: "C", optionId: "C", text: "Open door policy" },
      { id: "D", optionId: "D", text: "Maximum access rule" }
    ],
    correctOption: "A",
    explanation: "The Principle of Least Privilege grants minimum necessary privileges to users/systems.",
    skillDimensions: ["system_thinking", "attention_to_detail"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cyber_security_m4",
    branch: "CSE",
    domainId: "cyber_security",
    domainName: "Cyber Security & Ethical Hacking",
    domain: "cyber_security",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "Why are cryptographic hash functions used for storing passwords rather than plain text?",
    options: [
      { id: "A", optionId: "A", text: "They transform passwords into one-way fixed-size outputs so original values cannot easily be reversed" },
      { id: "B", optionId: "B", text: "They make passwords shorter" },
      { id: "C", optionId: "C", text: "They automatically send password reminders" },
      { id: "D", optionId: "D", text: "They compress database tables" }
    ],
    correctOption: "A",
    explanation: "One-way cryptographic hashes store verification signatures without exposing plain text passwords.",
    skillDimensions: ["analytical_thinking", "system_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cyber_security_m5",
    branch: "CSE",
    domainId: "cyber_security",
    domainName: "Cyber Security & Ethical Hacking",
    domain: "cyber_security",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "What is Cross-Site Scripting (XSS)?",
    options: [
      { id: "A", optionId: "A", text: "Injecting malicious client-side scripts into web pages viewed by other users" },
      { id: "B", optionId: "B", text: "Overloading a network switch" },
      { id: "C", optionId: "C", text: "Format string compiler warnings" },
      { id: "D", optionId: "D", text: "Styling CSS across domains" }
    ],
    correctOption: "A",
    explanation: "XSS vulnerabilities allow attackers to execute scripts in victims' browsers.",
    skillDimensions: ["problem_solving", "attention_to_detail"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cyber_security_h1",
    branch: "CSE",
    domainId: "cyber_security",
    domainName: "Cyber Security & Ethical Hacking",
    domain: "cyber_security",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "How does a Man-in-the-Middle (MitM) attack compromise communication confidentiality and integrity?",
    options: [
      { id: "A", optionId: "A", text: "An attacker secretly intercepts and potentially alters communication between two trusting parties" },
      { id: "B", optionId: "B", text: "An attacker deletes the server database" },
      { id: "C", optionId: "C", text: "An attacker slows down local Wi-Fi speeds" },
      { id: "D", optionId: "D", text: "An attacker buys domain names" }
    ],
    correctOption: "A",
    explanation: "MitM attacks position the adversary between endpoints to eavesdrop or modify traffic.",
    skillDimensions: ["system_thinking", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cyber_security_h2",
    branch: "CSE",
    domainId: "cyber_security",
    domainName: "Cyber Security & Ethical Hacking",
    domain: "cyber_security",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "Why is salting passwords before hashing critical against rainbow table attacks?",
    options: [
      { id: "A", optionId: "A", text: "It adds unique random data to each password so identical passwords produce distinct hash values" },
      { id: "B", optionId: "B", text: "It reduces hash computation time" },
      { id: "C", optionId: "C", text: "It makes passwords shorter" },
      { id: "D", optionId: "D", text: "It disables brute force attempts" }
    ],
    correctOption: "A",
    explanation: "Salting ensures unique hashes for identical passwords, invalidating precomputed lookup tables.",
    skillDimensions: ["analytical_thinking", "system_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cyber_security_h3",
    branch: "CSE",
    domainId: "cyber_security",
    domainName: "Cyber Security & Ethical Hacking",
    domain: "cyber_security",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "What is a zero-day vulnerability?",
    options: [
      { id: "A", optionId: "A", text: "A security flaw unknown to the vendor with no official patch available" },
      { id: "B", optionId: "B", text: "A bug created on the first day of a month" },
      { id: "C", optionId: "C", text: "A hardware component with zero warranty" },
      { id: "D", optionId: "D", text: "An expired SSL certificate" }
    ],
    correctOption: "A",
    explanation: "Zero-day vulnerabilities are undisclosed flaws exploited before developers issue fixes.",
    skillDimensions: ["attention_to_detail", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cyber_security_h4",
    branch: "CSE",
    domainId: "cyber_security",
    domainName: "Cyber Security & Ethical Hacking",
    domain: "cyber_security",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "What distinguishes a Distributed Denial of Service (DDoS) attack from a standard DoS attack?",
    options: [
      { id: "A", optionId: "A", text: "Traffic originates from multiple distributed compromised systems (botnet) targeting a single resource" },
      { id: "B", optionId: "B", text: "It only targets mobile phones" },
      { id: "C", optionId: "C", text: "It requires physical server access" },
      { id: "D", optionId: "D", text: "It deletes database tables directly" }
    ],
    correctOption: "A",
    explanation: "DDoS uses botnets across distributed hosts to overwhelm target servers.",
    skillDimensions: ["system_thinking", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cyber_security_h5",
    branch: "CSE",
    domainId: "cyber_security",
    domainName: "Cyber Security & Ethical Hacking",
    domain: "cyber_security",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "Why is Perfect Forward Secrecy (PFS) valuable in session key exchange protocols?",
    options: [
      { id: "A", optionId: "A", text: "Compromise of long-term server private keys does not compromise past session keys" },
      { id: "B", optionId: "B", text: "It makes web pages load twice as fast" },
      { id: "C", optionId: "C", text: "It removes the need for digital certificates" },
      { id: "D", optionId: "D", text: "It prevents all malware downloads" }
    ],
    correctOption: "A",
    explanation: "PFS generates ephemeral session keys so historical encrypted traffic remains secure even if long-term keys leak.",
    skillDimensions: ["system_thinking", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },

  // =========================================================================
  // DOMAIN 2: DATA SCIENCE & BIG DATA ANALYTICS (15 PDF QUESTIONS)
  // =========================================================================
  {
    questionId: "q_data_science_e1",
    branch: "CSE",
    domainId: "data_science",
    domainName: "Data Science & Big Data Analytics",
    domain: "data_science",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What is the median of a numerical dataset?",
    options: [
      { id: "A", optionId: "A", text: "The middle value when data is sorted" },
      { id: "B", optionId: "B", text: "The sum divided by count" },
      { id: "C", optionId: "C", text: "The most frequent value" },
      { id: "D", optionId: "D", text: "The difference between maximum and minimum" }
    ],
    correctOption: "A",
    explanation: "The median represents the central 50th percentile mark in an ordered dataset.",
    skillDimensions: ["mathematical_readiness", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_data_science_e2",
    branch: "CSE",
    domainId: "data_science",
    domainName: "Data Science & Big Data Analytics",
    domain: "data_science",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "Which plot is commonly used to show distribution of a single continuous variable?",
    options: [
      { id: "A", optionId: "A", text: "Histogram" },
      { id: "B", optionId: "B", text: "Pie chart" },
      { id: "C", optionId: "C", text: "Gantt chart" },
      { id: "D", optionId: "D", text: "Venn diagram" }
    ],
    correctOption: "A",
    explanation: "Histograms display frequency distributions of continuous numerical features.",
    skillDimensions: ["analytical_thinking", "pattern_recognition"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_data_science_e3",
    branch: "CSE",
    domainId: "data_science",
    domainName: "Data Science & Big Data Analytics",
    domain: "data_science",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What is a primary goal of exploratory data analysis (EDA)?",
    options: [
      { id: "A", optionId: "A", text: "Understand data structure, patterns, and anomalies before formal modeling" },
      { id: "B", optionId: "B", text: "Encrypt dataset rows" },
      { id: "C", optionId: "C", text: "Delete all non-zero values" },
      { id: "D", optionId: "D", text: "Deploy web servers" }
    ],
    correctOption: "A",
    explanation: "EDA summarizes main characteristics, distributions, and outliers in dataset features.",
    skillDimensions: ["analytical_thinking", "pattern_recognition"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_data_science_e4",
    branch: "CSE",
    domainId: "data_science",
    domainName: "Data Science & Big Data Analytics",
    domain: "data_science",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "Which library is standard in Python for data manipulation using DataFrames?",
    options: [
      { id: "A", optionId: "A", text: "Pandas" },
      { id: "B", optionId: "B", text: "Flask" },
      { id: "C", optionId: "C", text: "Pygame" },
      { id: "D", optionId: "D", text: "Requests" }
    ],
    correctOption: "A",
    explanation: "Pandas provides DataFrame structures for efficient tabular data analysis.",
    skillDimensions: ["programming_readiness", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_data_science_e5",
    branch: "CSE",
    domainId: "data_science",
    domainName: "Data Science & Big Data Analytics",
    domain: "data_science",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What does imputation mean in data preprocessing?",
    options: [
      { id: "A", optionId: "A", text: "Filling in missing values with estimated or calculated replacement values" },
      { id: "B", optionId: "B", text: "Exporting tables to JSON" },
      { id: "C", optionId: "C", text: "Deleting all data columns" },
      { id: "D", optionId: "D", text: "Renaming table headers" }
    ],
    correctOption: "A",
    explanation: "Imputation replaces missing values using statistical strategies like mean, median, or KNN.",
    skillDimensions: ["analytical_thinking", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_data_science_m1",
    branch: "CSE",
    domainId: "data_science",
    domainName: "Data Science & Big Data Analytics",
    domain: "data_science",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "Why is feature scaling (e.g. standardization) important for distance-based algorithms?",
    options: [
      { id: "A", optionId: "A", text: "Prevents features with larger magnitudes from dominating distance calculations" },
      { id: "B", optionId: "B", text: "Reduces total dataset rows" },
      { id: "C", optionId: "C", text: "Guarantees linear independence" },
      { id: "D", optionId: "D", text: "Replaces missing data" }
    ],
    correctOption: "A",
    explanation: "Distance metrics (like Euclidean) are sensitive to unscaled feature ranges.",
    skillDimensions: ["mathematical_readiness", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_data_science_m2",
    branch: "CSE",
    domainId: "data_science",
    domainName: "Data Science & Big Data Analytics",
    domain: "data_science",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "What is Principal Component Analysis (PCA) used for?",
    options: [
      { id: "A", optionId: "A", text: "Dimensionality reduction while preserving maximum variance" },
      { id: "B", optionId: "B", text: "Web page scraping" },
      { id: "C", optionId: "C", text: "Creating database indexes" },
      { id: "D", optionId: "D", text: "Encrypting user credentials" }
    ],
    correctOption: "A",
    explanation: "PCA projects high-dimensional data onto orthogonal components capturing maximum variance.",
    skillDimensions: ["mathematical_readiness", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_data_science_m3",
    branch: "CSE",
    domainId: "data_science",
    domainName: "Data Science & Big Data Analytics",
    domain: "data_science",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "What is the main advantage of K-fold cross-validation over a single train-test split?",
    options: [
      { id: "A", optionId: "A", text: "Provides a more reliable estimate of model performance across different data subsets" },
      { id: "B", optionId: "B", text: "Eliminates the need for hyperparameters" },
      { id: "C", optionId: "C", text: "Speeds up model training 10x" },
      { id: "D", optionId: "D", text: "Converts categorical features to numbers" }
    ],
    correctOption: "A",
    explanation: "K-fold cross validation evaluates model stability by averaging performance over K validation folds.",
    skillDimensions: ["analytical_thinking", "pattern_recognition"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_data_science_m4",
    branch: "CSE",
    domainId: "data_science",
    domainName: "Data Science & Big Data Analytics",
    domain: "data_science",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "In A/B testing, what does a p-value represent?",
    options: [
      { id: "A", optionId: "A", text: "Probability of observing test results at least as extreme assuming null hypothesis is true" },
      { id: "B", optionId: "B", text: "Probability that variant B is 100% correct" },
      { id: "C", optionId: "C", text: "The percentage of users converted" },
      { id: "D", optionId: "D", text: "The size of sample population" }
    ],
    correctOption: "A",
    explanation: "P-value measures statistical significance under the null hypothesis assumption.",
    skillDimensions: ["mathematical_readiness", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_data_science_m5",
    branch: "CSE",
    domainId: "data_science",
    domainName: "Data Science & Big Data Analytics",
    domain: "data_science",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "Which metric is best suited for evaluating regression models?",
    options: [
      { id: "A", optionId: "A", text: "Mean Squared Error (MSE)" },
      { id: "B", optionId: "B", text: "F1-Score" },
      { id: "C", optionId: "C", text: "ROC-AUC" },
      { id: "D", optionId: "D", text: "Precision" }
    ],
    correctOption: "A",
    explanation: "MSE measures average squared difference between actual continuous values and predicted targets.",
    skillDimensions: ["mathematical_readiness", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_data_science_h1",
    branch: "CSE",
    domainId: "data_science",
    domainName: "Data Science & Big Data Analytics",
    domain: "data_science",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "How does the MapReduce programming model achieve scalability in distributed data processing?",
    options: [
      { id: "A", optionId: "A", text: "Splits computation into parallel Map tasks followed by key-grouped Reduce aggregation" },
      { id: "B", optionId: "B", text: "Executes all queries on a single central CPU thread" },
      { id: "C", optionId: "C", text: "Stores all data inside browser cache" },
      { id: "D", optionId: "D", text: "Converts SQL tables to uncompressed XML" }
    ],
    correctOption: "A",
    explanation: "MapReduce processes large datasets in parallel across clusters using Map partitioning and Reduce grouping.",
    skillDimensions: ["system_thinking", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_data_science_h2",
    branch: "CSE",
    domainId: "data_science",
    domainName: "Data Science & Big Data Analytics",
    domain: "data_science",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "Why is multicollinearity problematic in multiple linear regression?",
    options: [
      { id: "A", optionId: "A", text: "Makes coefficient estimates unstable and difficult to interpret independently" },
      { id: "B", optionId: "B", text: "Prevents calculation of R-squared" },
      { id: "C", optionId: "C", text: "Forces model to become non-linear" },
      { id: "D", optionId: "D", text: "Increases dataset memory footprint" }
    ],
    correctOption: "A",
    explanation: "High correlation between predictor variables Inflates coefficient variance and distorts statistical inference.",
    skillDimensions: ["mathematical_readiness", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_data_science_h3",
    branch: "CSE",
    domainId: "data_science",
    domainName: "Data Science & Big Data Analytics",
    domain: "data_science",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "What distinguishes Random Forest from standard Decision Trees?",
    options: [
      { id: "A", optionId: "A", text: "Ensemble of decision trees trained on bootstrap samples with random feature subsets" },
      { id: "B", optionId: "B", text: "Uses gradient descent optimization" },
      { id: "C", optionId: "C", text: "Only processes binary features" },
      { id: "D", optionId: "D", text: "Requires single CPU thread execution" }
    ],
    correctOption: "A",
    explanation: "Random Forest combines bagging and feature subspace sampling to reduce variance compared to single trees.",
    skillDimensions: ["pattern_recognition", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_data_science_h4",
    branch: "CSE",
    domainId: "data_science",
    domainName: "Data Science & Big Data Analytics",
    domain: "data_science",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "Why is ROC-AUC preferred over Accuracy for evaluating imbalanced fraud detection models?",
    options: [
      { id: "A", optionId: "A", text: "Evaluates trade-off between True Positive and False Positive rates across all classification thresholds" },
      { id: "B", optionId: "B", text: "Always yields a score of 1.0" },
      { id: "C", optionId: "C", text: "Does not require ground truth labels" },
      { id: "D", optionId: "D", text: "Ignores false positives entirely" }
    ],
    correctOption: "A",
    explanation: "ROC-AUC assesses ranking capability independent of specific decision threshold or class balance ratio.",
    skillDimensions: ["analytical_thinking", "mathematical_readiness"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_data_science_h5",
    branch: "CSE",
    domainId: "data_science",
    domainName: "Data Science & Big Data Analytics",
    domain: "data_science",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "In time-series analysis, what does stationarity require?",
    options: [
      { id: "A", optionId: "A", text: "Statistical properties like mean and variance remain constant over time" },
      { id: "B", optionId: "B", text: "Data values must strictly increase" },
      { id: "C", optionId: "C", text: "All data points must equal zero" },
      { id: "D", optionId: "D", text: "Time intervals must be randomized" }
    ],
    correctOption: "A",
    explanation: "Stationary series exhibit time-invariant mean, variance, and autocovariance structure.",
    skillDimensions: ["mathematical_readiness", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },

  // =========================================================================
  // DOMAIN 3: ARTIFICIAL INTELLIGENCE & MACHINE LEARNING (15 PDF QUESTIONS)
  // =========================================================================
  {
    questionId: "q_aiml_e1",
    branch: "CSE",
    domainId: "ai_ml",
    domainName: "Artificial Intelligence & Machine Learning",
    domain: "ai_ml",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "Which type of learning uses labeled input-output examples?",
    options: [
      { id: "A", optionId: "A", text: "Unsupervised learning" },
      { id: "B", optionId: "B", text: "Supervised learning" },
      { id: "C", optionId: "C", text: "Reinforcement learning" },
      { id: "D", optionId: "D", text: "Self-play only" }
    ],
    correctOption: "B",
    explanation: "Supervised learning trains models on labeled datasets consisting of input-output pairs.",
    skillDimensions: ["pattern_recognition", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_aiml_e2",
    branch: "CSE",
    domainId: "ai_ml",
    domainName: "Artificial Intelligence & Machine Learning",
    domain: "ai_ml",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "Which metric is commonly used for binary classification?",
    options: [
      { id: "A", optionId: "A", text: "Accuracy" },
      { id: "B", optionId: "B", text: "Mean squared error only" },
      { id: "C", optionId: "C", text: "Euclidean distance only" },
      { id: "D", optionId: "D", text: "Entropy rate" }
    ],
    correctOption: "A",
    explanation: "Accuracy measures the fraction of correct predictions over total predictions.",
    skillDimensions: ["mathematical_readiness", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_aiml_e3",
    branch: "CSE",
    domainId: "ai_ml",
    domainName: "Artificial Intelligence & Machine Learning",
    domain: "ai_ml",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What is overfitting?",
    options: [
      { id: "A", optionId: "A", text: "A model performs well on training data but poorly on unseen data" },
      { id: "B", optionId: "B", text: "A model has no parameters" },
      { id: "C", optionId: "C", text: "A dataset contains no labels" },
      { id: "D", optionId: "D", text: "Training never starts" }
    ],
    correctOption: "A",
    explanation: "Overfitting occurs when a model memorizes training noise rather than learning general patterns.",
    skillDimensions: ["analytical_thinking", "pattern_recognition"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_aiml_e4",
    branch: "CSE",
    domainId: "ai_ml",
    domainName: "Artificial Intelligence & Machine Learning",
    domain: "ai_ml",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "Which algorithm is commonly used for clustering?",
    options: [
      { id: "A", optionId: "A", text: "K-means" },
      { id: "B", optionId: "B", text: "Linear regression" },
      { id: "C", optionId: "C", text: "Naive Bayes" },
      { id: "D", optionId: "D", text: "Decision tree regression" }
    ],
    correctOption: "A",
    explanation: "K-means is an unsupervised clustering algorithm that partitions data into K centroids.",
    skillDimensions: ["pattern_recognition", "algorithmic_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_aiml_e5",
    branch: "CSE",
    domainId: "ai_ml",
    domainName: "Artificial Intelligence & Machine Learning",
    domain: "ai_ml",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What does an activation function do in a neural network?",
    options: [
      { id: "A", optionId: "A", text: "Introduces non-linearity into the model" },
      { id: "B", optionId: "B", text: "Stores database records" },
      { id: "C", optionId: "C", text: "Encrypts model weights" },
      { id: "D", optionId: "D", text: "Downloads datasets" }
    ],
    correctOption: "A",
    explanation: "Activation functions allow neural networks to learn non-linear decision boundaries.",
    skillDimensions: ["mathematical_readiness", "system_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_aiml_m1",
    branch: "CSE",
    domainId: "ai_ml",
    domainName: "Artificial Intelligence & Machine Learning",
    domain: "ai_ml",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "Why is a validation set used during model development?",
    options: [
      { id: "A", optionId: "A", text: "To tune and compare models without using the final test set" },
      { id: "B", optionId: "B", text: "To replace the training set" },
      { id: "C", optionId: "C", text: "To guarantee 100% accuracy" },
      { id: "D", optionId: "D", text: "To remove all features" }
    ],
    correctOption: "A",
    explanation: "Validation sets provide unbiased evaluation during hyperparameter tuning before final testing.",
    skillDimensions: ["analytical_thinking", "pattern_recognition"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_aiml_m2",
    branch: "CSE",
    domainId: "ai_ml",
    domainName: "Artificial Intelligence & Machine Learning",
    domain: "ai_ml",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "Precision answers which question?",
    options: [
      { id: "A", optionId: "A", text: "Of predicted positives, how many were actually positive?" },
      { id: "B", optionId: "B", text: "Of actual positives, how many were found?" },
      { id: "C", optionId: "C", text: "How fast does training run?" },
      { id: "D", optionId: "D", text: "How many features exist?" }
    ],
    correctOption: "A",
    explanation: "Precision is calculated as True Positives / (True Positives + False Positives).",
    skillDimensions: ["analytical_thinking", "mathematical_readiness"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_aiml_m3",
    branch: "CSE",
    domainId: "ai_ml",
    domainName: "Artificial Intelligence & Machine Learning",
    domain: "ai_ml",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "What is the purpose of regularization such as L2 regularization?",
    options: [
      { id: "A", optionId: "A", text: "Reduce overfitting by penalizing large weights" },
      { id: "B", optionId: "B", text: "Increase dataset size automatically" },
      { id: "C", optionId: "C", text: "Guarantee linear separability" },
      { id: "D", optionId: "D", text: "Remove the loss function" }
    ],
    correctOption: "A",
    explanation: "L2 regularization penalizes squared weight magnitudes to keep models simpler.",
    skillDimensions: ["mathematical_readiness", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_aiml_m4",
    branch: "CSE",
    domainId: "ai_ml",
    domainName: "Artificial Intelligence & Machine Learning",
    domain: "ai_ml",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "In NLP, what is an embedding?",
    options: [
      { id: "A", optionId: "A", text: "A dense vector representation capturing useful semantic relationships" },
      { id: "B", optionId: "B", text: "A database backup" },
      { id: "C", optionId: "C", text: "A compiler instruction" },
      { id: "D", optionId: "D", text: "A cryptographic certificate" }
    ],
    correctOption: "A",
    explanation: "Embeddings map tokens into continuous vector spaces where semantic similarity corresponds to geometric distance.",
    skillDimensions: ["pattern_recognition", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_aiml_m5",
    branch: "CSE",
    domainId: "ai_ml",
    domainName: "Artificial Intelligence & Machine Learning",
    domain: "ai_ml",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "What is transfer learning?",
    options: [
      { id: "A", optionId: "A", text: "Using knowledge from a pretrained model as a starting point for a related task" },
      { id: "B", optionId: "B", text: "Training without data" },
      { id: "C", optionId: "C", text: "Deleting pretrained weights" },
      { id: "D", optionId: "D", text: "Only using reinforcement learning" }
    ],
    correctOption: "A",
    explanation: "Transfer learning fine-tunes pretrained network weights on new target domains with smaller datasets.",
    skillDimensions: ["system_thinking", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_aiml_h1",
    branch: "CSE",
    domainId: "ai_ml",
    domainName: "Artificial Intelligence & Machine Learning",
    domain: "ai_ml",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "Why can accuracy be misleading on a highly imbalanced classification dataset?",
    options: [
      { id: "A", optionId: "A", text: "A majority-class predictor can obtain high accuracy while missing the minority class" },
      { id: "B", optionId: "B", text: "Accuracy cannot be calculated" },
      { id: "C", optionId: "C", text: "Accuracy always equals recall" },
      { id: "D", optionId: "D", text: "The model cannot have a confusion matrix" }
    ],
    correctOption: "A",
    explanation: "In 99:1 imbalanced datasets, predicting the majority class yields 99% accuracy but zero minority detection.",
    skillDimensions: ["analytical_thinking", "mathematical_readiness"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_aiml_h2",
    branch: "CSE",
    domainId: "ai_ml",
    domainName: "Artificial Intelligence & Machine Learning",
    domain: "ai_ml",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "What is the main purpose of attention mechanisms in transformer models?",
    options: [
      { id: "A", optionId: "A", text: "To weight relationships between tokens when computing representations" },
      { id: "B", optionId: "B", text: "To compress images only" },
      { id: "C", optionId: "C", text: "To replace all optimization" },
      { id: "D", optionId: "D", text: "To remove tokenization" }
    ],
    correctOption: "A",
    explanation: "Self-attention dynamically weights contextual relevance across token pairs regardless of sequence distance.",
    skillDimensions: ["system_thinking", "mathematical_readiness"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_aiml_h3",
    branch: "CSE",
    domainId: "ai_ml",
    domainName: "Artificial Intelligence & Machine Learning",
    domain: "ai_ml",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "What is data leakage in machine learning?",
    options: [
      { id: "A", optionId: "A", text: "Information unavailable at prediction time unintentionally influences training" },
      { id: "B", optionId: "B", text: "Lossless compression of data" },
      { id: "C", optionId: "C", text: "Deleting duplicate rows" },
      { id: "D", optionId: "D", text: "Encrypting a dataset" }
    ],
    correctOption: "A",
    explanation: "Data leakage occurs when test/future information contaminates feature engineering or model training.",
    skillDimensions: ["attention_to_detail", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_aiml_h4",
    branch: "CSE",
    domainId: "ai_ml",
    domainName: "Artificial Intelligence & Machine Learning",
    domain: "ai_ml",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "In reinforcement learning, what does the agent primarily optimize over time?",
    options: [
      { id: "A", optionId: "A", text: "Expected cumulative reward" },
      { id: "B", optionId: "B", text: "Training-set accuracy only" },
      { id: "C", optionId: "C", text: "Number of features" },
      { id: "D", optionId: "D", text: "Database size" }
    ],
    correctOption: "A",
    explanation: "RL agents learn policies that maximize discounted long-term expected cumulative rewards.",
    skillDimensions: ["algorithmic_thinking", "system_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_aiml_h5",
    branch: "CSE",
    domainId: "ai_ml",
    domainName: "Artificial Intelligence & Machine Learning",
    domain: "ai_ml",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "Why is calibration important for a model that outputs confidence probabilities?",
    options: [
      { id: "A", optionId: "A", text: "Predicted probabilities should correspond reasonably to observed outcome frequencies" },
      { id: "B", optionId: "B", text: "It guarantees zero false positives" },
      { id: "C", optionId: "C", text: "It removes the need for validation" },
      { id: "D", optionId: "D", text: "It forces all predictions to 0.5" }
    ],
    correctOption: "A",
    explanation: "Well-calibrated models output probabilities that match true empirical accuracy rates.",
    skillDimensions: ["analytical_thinking", "mathematical_readiness"],
    source: "master-question-bank-pdf",
    active: true
  },

  // =========================================================================
  // DOMAIN 4: SOFTWARE ENGINEERING & ARCHITECTURE (15 PDF QUESTIONS)
  // =========================================================================
  {
    questionId: "q_software_engineering_e1",
    branch: "CSE",
    domainId: "software_engineering",
    domainName: "Software Engineering & Architecture",
    domain: "software_engineering",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "Which software development model is most suitable when requirements are expected to evolve through repeated customer feedback?",
    options: [
      { id: "A", optionId: "A", text: "Waterfall" },
      { id: "B", optionId: "B", text: "Iterative/Agile" },
      { id: "C", optionId: "C", text: "Big Bang" },
      { id: "D", optionId: "D", text: "V-Model" }
    ],
    correctOption: "B",
    explanation: "Iterative/Agile methodologies deliver incremental software updates allowing ongoing feedback adaptivity.",
    skillDimensions: ["system_thinking", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_software_engineering_e2",
    branch: "CSE",
    domainId: "software_engineering",
    domainName: "Software Engineering & Architecture",
    domain: "software_engineering",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "Which principle states that a class should have one primary reason to change?",
    options: [
      { id: "A", optionId: "A", text: "Open/Closed Principle" },
      { id: "B", optionId: "B", text: "Single Responsibility Principle" },
      { id: "C", optionId: "C", text: "Liskov Substitution Principle" },
      { id: "D", optionId: "D", text: "Dependency Inversion Principle" }
    ],
    correctOption: "B",
    explanation: "The Single Responsibility Principle specifies that a class should encapsulate a single responsibility or reason to change.",
    skillDimensions: ["problem_solving", "system_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_software_engineering_e3",
    branch: "CSE",
    domainId: "software_engineering",
    domainName: "Software Engineering & Architecture",
    domain: "software_engineering",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What is the main purpose of version control systems such as Git?",
    options: [
      { id: "A", optionId: "A", text: "To compile source code" },
      { id: "B", optionId: "B", text: "To manage and track changes to source code" },
      { id: "C", optionId: "C", text: "To host databases" },
      { id: "D", optionId: "D", text: "To replace testing" }
    ],
    correctOption: "B",
    explanation: "Git tracks revisions, history, and collaborative branches of software source code.",
    skillDimensions: ["system_thinking", "attention_to_detail"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_software_engineering_e4",
    branch: "CSE",
    domainId: "software_engineering",
    domainName: "Software Engineering & Architecture",
    domain: "software_engineering",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "Which architectural style separates an application into presentation, business logic, and data-access responsibilities?",
    options: [
      { id: "A", optionId: "A", text: "Layered architecture" },
      { id: "B", optionId: "B", text: "Peer-to-peer" },
      { id: "C", optionId: "C", text: "Pipe-and-filter" },
      { id: "D", optionId: "D", text: "Event sourcing" }
    ],
    correctOption: "A",
    explanation: "Layered (n-tier) architecture divides concerns into distinct UI, business logic, and data storage tiers.",
    skillDimensions: ["system_thinking", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_software_engineering_e5",
    branch: "CSE",
    domainId: "software_engineering",
    domainName: "Software Engineering & Architecture",
    domain: "software_engineering",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What is unit testing primarily intended to verify?",
    options: [
      { id: "A", optionId: "A", text: "The entire production environment" },
      { id: "B", optionId: "B", text: "Individual units of code in isolation" },
      { id: "C", optionId: "C", text: "Network bandwidth" },
      { id: "D", optionId: "D", text: "Database hardware" }
    ],
    correctOption: "B",
    explanation: "Unit tests validate individual software functions or components in isolated test conditions.",
    skillDimensions: ["attention_to_detail", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_software_engineering_m1",
    branch: "CSE",
    domainId: "software_engineering",
    domainName: "Software Engineering & Architecture",
    domain: "software_engineering",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "Which SOLID principle is most directly associated with programming to abstractions rather than concrete implementations?",
    options: [
      { id: "A", optionId: "A", text: "Dependency Inversion Principle" },
      { id: "B", optionId: "B", text: "Single Responsibility Principle" },
      { id: "C", optionId: "C", text: "Interface Segregation Principle" },
      { id: "D", optionId: "D", text: "Liskov Substitution Principle" }
    ],
    correctOption: "A",
    explanation: "Dependency Inversion states high-level modules should depend on abstractions, not concrete implementations.",
    skillDimensions: ["system_thinking", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_software_engineering_m2",
    branch: "CSE",
    domainId: "software_engineering",
    domainName: "Software Engineering & Architecture",
    domain: "software_engineering",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "In a microservices architecture, why is an API gateway commonly used?",
    options: [
      { id: "A", optionId: "A", text: "To replace every database" },
      { id: "B", optionId: "B", text: "To provide a single entry point for routing and cross-cutting concerns" },
      { id: "C", optionId: "C", text: "To compile services" },
      { id: "D", optionId: "D", text: "To eliminate authentication" }
    ],
    correctOption: "B",
    explanation: "API gateways manage entry traffic, request routing, rate limiting, and authentication for microservices.",
    skillDimensions: ["system_thinking", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_software_engineering_m3",
    branch: "CSE",
    domainId: "software_engineering",
    domainName: "Software Engineering & Architecture",
    domain: "software_engineering",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "Which pattern is commonly used to create objects without exposing the exact instantiation logic to the client?",
    options: [
      { id: "A", optionId: "A", text: "Factory" },
      { id: "B", optionId: "B", text: "Observer" },
      { id: "C", optionId: "C", text: "Adapter" },
      { id: "D", optionId: "D", text: "Decorator" }
    ],
    correctOption: "A",
    explanation: "The Factory design pattern encapsulates object instantiation details behind a dedicated creation method.",
    skillDimensions: ["problem_solving", "system_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_software_engineering_m4",
    branch: "CSE",
    domainId: "software_engineering",
    domainName: "Software Engineering & Architecture",
    domain: "software_engineering",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "What is the main purpose of continuous integration (CI)?",
    options: [
      { id: "A", optionId: "A", text: "Deploy only once a year" },
      { id: "B", optionId: "B", text: "Frequently integrate and automatically validate code changes" },
      { id: "C", optionId: "C", text: "Avoid source control" },
      { id: "D", optionId: "D", text: "Remove automated tests" }
    ],
    correctOption: "B",
    explanation: "CI automatically builds and runs tests on code commits to detect integration issues early.",
    skillDimensions: ["system_thinking", "attention_to_detail"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_software_engineering_m5",
    branch: "CSE",
    domainId: "software_engineering",
    domainName: "Software Engineering & Architecture",
    domain: "software_engineering",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "Which property of an API means repeating the same request should produce the same intended result when the operation is designed to be idempotent?",
    options: [
      { id: "A", optionId: "A", text: "Idempotency" },
      { id: "B", optionId: "B", text: "Polymorphism" },
      { id: "C", optionId: "C", text: "Encapsulation" },
      { id: "D", optionId: "D", text: "Inheritance" }
    ],
    correctOption: "A",
    explanation: "Idempotence guarantees that repeated identical API operations produce the same side-effect state.",
    skillDimensions: ["analytical_thinking", "system_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_software_engineering_h1",
    branch: "CSE",
    domainId: "software_engineering",
    domainName: "Software Engineering & Architecture",
    domain: "software_engineering",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "In distributed systems, which technique helps prevent a failing downstream service from causing repeated immediate calls and cascading failure?",
    options: [
      { id: "A", optionId: "A", text: "Circuit breaker" },
      { id: "B", optionId: "B", text: "Factory method" },
      { id: "C", optionId: "C", text: "Round-robin sorting" },
      { id: "D", optionId: "D", text: "Normalization" }
    ],
    correctOption: "A",
    explanation: "Circuit breakers intercept calls to failing downstream services, tripping open to give services time to recover.",
    skillDimensions: ["system_thinking", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_software_engineering_h2",
    branch: "CSE",
    domainId: "software_engineering",
    domainName: "Software Engineering & Architecture",
    domain: "software_engineering",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "What is the primary trade-off introduced by eventual consistency?",
    options: [
      { id: "A", optionId: "A", text: "Higher consistency with no delay" },
      { id: "B", optionId: "B", text: "Temporary differences between replicas in exchange for availability/scalability" },
      { id: "C", optionId: "C", text: "No replication" },
      { id: "D", optionId: "D", text: "Guaranteed serial execution" }
    ],
    correctOption: "B",
    explanation: "Eventual consistency sacrifices immediate strong consistency across distributed nodes for high availability.",
    skillDimensions: ["system_thinking", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_software_engineering_h3",
    branch: "CSE",
    domainId: "software_engineering",
    domainName: "Software Engineering & Architecture",
    domain: "software_engineering",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "Which architecture pattern commonly uses independently deployable services communicating through events or messages?",
    options: [
      { id: "A", optionId: "A", text: "Event-driven architecture" },
      { id: "B", optionId: "B", text: "Monolithic architecture" },
      { id: "C", optionId: "C", text: "MVC only" },
      { id: "D", optionId: "D", text: "Three-tier desktop architecture" }
    ],
    correctOption: "A",
    explanation: "Event-driven architectures decouple microservices through asynchronous message brokers and event buses.",
    skillDimensions: ["system_thinking", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_software_engineering_h4",
    branch: "CSE",
    domainId: "software_engineering",
    domainName: "Software Engineering & Architecture",
    domain: "software_engineering",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "Why is observability important in a distributed production system?",
    options: [
      { id: "A", optionId: "A", text: "It removes the need for testing" },
      { id: "B", optionId: "B", text: "It enables understanding system behavior through logs, metrics, and traces" },
      { id: "C", optionId: "C", text: "It guarantees zero downtime" },
      { id: "D", optionId: "D", text: "It replaces databases" }
    ],
    correctOption: "B",
    explanation: "Observability combines telemetry logs, metrics, and distributed traces to diagnose complex distributed failures.",
    skillDimensions: ["system_thinking", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_software_engineering_h5",
    branch: "CSE",
    domainId: "software_engineering",
    domainName: "Software Engineering & Architecture",
    domain: "software_engineering",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "A service retries a request after a timeout. Which practice best reduces duplicate side effects for operations such as payments?",
    options: [
      { id: "A", optionId: "A", text: "Use idempotency keys" },
      { id: "B", optionId: "B", text: "Disable logging" },
      { id: "C", optionId: "C", text: "Increase UI animations" },
      { id: "D", optionId: "D", text: "Remove authentication" }
    ],
    correctOption: "A",
    explanation: "Idempotency keys allow servers to recognize retry attempts and return cached results without double processing.",
    skillDimensions: ["problem_solving", "system_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },

  // =========================================================================
  // DOMAIN 5: ALGORITHMS & SYSTEM PROGRAMMING (15 PDF QUESTIONS)
  // =========================================================================
  {
    questionId: "q_algorithms_systems_e1",
    branch: "CSE",
    domainId: "algorithms_systems",
    domainName: "Algorithms & System Programming",
    domain: "algorithms_systems",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What is the time complexity of binary search on a sorted array?",
    options: [
      { id: "A", optionId: "A", text: "O(1)" },
      { id: "B", optionId: "B", text: "O(log n)" },
      { id: "C", optionId: "C", text: "O(n)" },
      { id: "D", optionId: "D", text: "O(n²)" }
    ],
    correctOption: "B",
    explanation: "Binary search repeatedly halves the search space, yielding O(log n) time complexity.",
    skillDimensions: ["algorithmic_thinking", "mathematical_readiness"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_algorithms_systems_e2",
    branch: "CSE",
    domainId: "algorithms_systems",
    domainName: "Algorithms & System Programming",
    domain: "algorithms_systems",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "Which data structure follows LIFO order?",
    options: [
      { id: "A", optionId: "A", text: "Queue" },
      { id: "B", optionId: "B", text: "Stack" },
      { id: "C", optionId: "C", text: "Heap" },
      { id: "D", optionId: "D", text: "Graph" }
    ],
    correctOption: "B",
    explanation: "Stacks operate on Last-In, First-Out (LIFO) semantics.",
    skillDimensions: ["algorithmic_thinking", "system_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_algorithms_systems_e3",
    branch: "CSE",
    domainId: "algorithms_systems",
    domainName: "Algorithms & System Programming",
    domain: "algorithms_systems",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "Which data structure follows FIFO order?",
    options: [
      { id: "A", optionId: "A", text: "Stack" },
      { id: "B", optionId: "B", text: "Queue" },
      { id: "C", optionId: "C", text: "Tree" },
      { id: "D", optionId: "D", text: "Hash table" }
    ],
    correctOption: "B",
    explanation: "Queues process elements on First-In, First-Out (FIFO) ordering.",
    skillDimensions: ["algorithmic_thinking", "system_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_algorithms_systems_e4",
    branch: "CSE",
    domainId: "algorithms_systems",
    domainName: "Algorithms & System Programming",
    domain: "algorithms_systems",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What is the average-case lookup complexity of a well-designed hash table?",
    options: [
      { id: "A", optionId: "A", text: "O(log n)" },
      { id: "B", optionId: "B", text: "O(1)" },
      { id: "C", optionId: "C", text: "O(n²)" },
      { id: "D", optionId: "D", text: "O(n log n)" }
    ],
    correctOption: "B",
    explanation: "Hash tables offer O(1) constant average time complexity for lookups when collision rates are low.",
    skillDimensions: ["algorithmic_thinking", "mathematical_readiness"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_algorithms_systems_e5",
    branch: "CSE",
    domainId: "algorithms_systems",
    domainName: "Algorithms & System Programming",
    domain: "algorithms_systems",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "Which traversal visits a binary search tree in sorted key order?",
    options: [
      { id: "A", optionId: "A", text: "Preorder" },
      { id: "B", optionId: "B", text: "Postorder" },
      { id: "C", optionId: "C", text: "Inorder" },
      { id: "D", optionId: "D", text: "Level order" }
    ],
    correctOption: "C",
    explanation: "Inorder traversal (Left, Root, Right) visits binary search tree nodes in ascending sorted key order.",
    skillDimensions: ["algorithmic_thinking", "pattern_recognition"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_algorithms_systems_m1",
    branch: "CSE",
    domainId: "algorithms_systems",
    domainName: "Algorithms & System Programming",
    domain: "algorithms_systems",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "What is the typical time complexity of merge sort?",
    options: [
      { id: "A", optionId: "A", text: "O(n)" },
      { id: "B", optionId: "B", text: "O(log n)" },
      { id: "C", optionId: "C", text: "O(n log n)" },
      { id: "D", optionId: "D", text: "O(n²)" }
    ],
    correctOption: "C",
    explanation: "Merge sort recursively divides input arrays and merges sorted halves in O(n log n) time.",
    skillDimensions: ["algorithmic_thinking", "mathematical_readiness"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_algorithms_systems_m2",
    branch: "CSE",
    domainId: "algorithms_systems",
    domainName: "Algorithms & System Programming",
    domain: "algorithms_systems",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "Which algorithmic technique solves a problem by repeatedly choosing the locally best option under a condition that makes this valid?",
    options: [
      { id: "A", optionId: "A", text: "Greedy method" },
      { id: "B", optionId: "B", text: "Backtracking only" },
      { id: "C", optionId: "C", text: "Hashing" },
      { id: "D", optionId: "D", text: "Parsing" }
    ],
    correctOption: "A",
    explanation: "Greedy algorithms make locally optimal choices at each step to build global optimal solutions.",
    skillDimensions: ["algorithmic_thinking", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_algorithms_systems_m3",
    branch: "CSE",
    domainId: "algorithms_systems",
    domainName: "Algorithms & System Programming",
    domain: "algorithms_systems",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "What is dynamic programming mainly based on?",
    options: [
      { id: "A", optionId: "A", text: "Overlapping subproblems and optimal substructure" },
      { id: "B", optionId: "B", text: "Random guessing" },
      { id: "C", optionId: "C", text: "Only recursion without storage" },
      { id: "D", optionId: "D", text: "Sorting all inputs" }
    ],
    correctOption: "A",
    explanation: "Dynamic programming memoizes answers to overlapping subproblems exhibiting optimal substructure.",
    skillDimensions: ["algorithmic_thinking", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_algorithms_systems_m4",
    branch: "CSE",
    domainId: "algorithms_systems",
    domainName: "Algorithms & System Programming",
    domain: "algorithms_systems",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "Which graph algorithm finds shortest paths from a source when edge weights are non-negative?",
    options: [
      { id: "A", optionId: "A", text: "Dijkstra's algorithm" },
      { id: "B", optionId: "B", text: "DFS" },
      { id: "C", optionId: "C", text: "Kruskal's algorithm" },
      { id: "D", optionId: "D", text: "Topological sort" }
    ],
    correctOption: "A",
    explanation: "Dijkstra's algorithm computes single-source shortest paths on weighted graphs with non-negative edge costs.",
    skillDimensions: ["algorithmic_thinking", "mathematical_readiness"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_algorithms_systems_m5",
    branch: "CSE",
    domainId: "algorithms_systems",
    domainName: "Algorithms & System Programming",
    domain: "algorithms_systems",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "What is a deadlock in an operating system?",
    options: [
      { id: "A", optionId: "A", text: "A set of processes waits indefinitely for resources held by one another" },
      { id: "B", optionId: "B", text: "A process completes normally" },
      { id: "C", optionId: "C", text: "A cache hit" },
      { id: "D", optionId: "D", text: "A successful context switch" }
    ],
    correctOption: "A",
    explanation: "Deadlock occurs when circular resource dependencies prevent executing processes from making progress.",
    skillDimensions: ["system_thinking", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_algorithms_systems_h1",
    branch: "CSE",
    domainId: "algorithms_systems",
    domainName: "Algorithms & System Programming",
    domain: "algorithms_systems",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "What is the time complexity of building a binary heap from an unsorted array using bottom-up heap construction?",
    options: [
      { id: "A", optionId: "A", text: "O(log n)" },
      { id: "B", optionId: "B", text: "O(n)" },
      { id: "C", optionId: "C", text: "O(n log n)" },
      { id: "D", optionId: "D", text: "O(n²)" }
    ],
    correctOption: "B",
    explanation: "Floyd's bottom-up build-heap algorithm operates in linear O(n) time complexity.",
    skillDimensions: ["algorithmic_thinking", "mathematical_readiness"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_algorithms_systems_h2",
    branch: "CSE",
    domainId: "algorithms_systems",
    domainName: "Algorithms & System Programming",
    domain: "algorithms_systems",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "Why can recursion cause stack overflow?",
    options: [
      { id: "A", optionId: "A", text: "Each active recursive call consumes stack space and excessive depth can exhaust it" },
      { id: "B", optionId: "B", text: "Recursion always uses heap memory only" },
      { id: "C", optionId: "C", text: "The CPU cannot execute functions" },
      { id: "D", optionId: "D", text: "Recursion disables caching" }
    ],
    correctOption: "A",
    explanation: "Each function activation record uses call stack memory; deep recursion without base cases exhausts allocated stack limit.",
    skillDimensions: ["system_thinking", "algorithmic_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_algorithms_systems_h3",
    branch: "CSE",
    domainId: "algorithms_systems",
    domainName: "Algorithms & System Programming",
    domain: "algorithms_systems",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "What is virtual memory primarily used for?",
    options: [
      { id: "A", optionId: "A", text: "Provide an abstraction of memory that can extend beyond physical RAM using storage and address translation" },
      { id: "B", optionId: "B", text: "Increase CPU clock speed" },
      { id: "C", optionId: "C", text: "Replace all caches" },
      { id: "D", optionId: "D", text: "Eliminate page faults" }
    ],
    correctOption: "A",
    explanation: "Virtual memory maps process address spaces to physical RAM and secondary disk storage via MMU page tables.",
    skillDimensions: ["system_thinking", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_algorithms_systems_h4",
    branch: "CSE",
    domainId: "algorithms_systems",
    domainName: "Algorithms & System Programming",
    domain: "algorithms_systems",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "What is a race condition?",
    options: [
      { id: "A", optionId: "A", text: "Program behavior depends on timing/order of concurrent accesses to shared state" },
      { id: "B", optionId: "B", text: "A deterministic sorting result" },
      { id: "C", optionId: "C", text: "A compile-time syntax error" },
      { id: "D", optionId: "D", text: "A network cable failure" }
    ],
    correctOption: "A",
    explanation: "Race conditions occur when unsynchronized concurrent threads read and write shared data non-deterministically.",
    skillDimensions: ["system_thinking", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_algorithms_systems_h5",
    branch: "CSE",
    domainId: "algorithms_systems",
    domainName: "Algorithms & System Programming",
    domain: "algorithms_systems",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "Which synchronization primitive is commonly used to ensure mutual exclusion around a critical section?",
    options: [
      { id: "A", optionId: "A", text: "Mutex" },
      { id: "B", optionId: "B", text: "DNS" },
      { id: "C", optionId: "C", text: "Socket" },
      { id: "D", optionId: "D", text: "Compiler" }
    ],
    correctOption: "A",
    explanation: "A Mutex (Mutual Exclusion lock) ensures only one thread executes inside critical code sections at any time.",
    skillDimensions: ["system_thinking", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },

  // =========================================================================
  // DOMAIN 6: FULL STACK WEB & MOBILE DEVELOPMENT (15 PDF QUESTIONS)
  // =========================================================================
  {
    questionId: "q_full_stack_e1",
    branch: "CSE",
    domainId: "full_stack",
    domainName: "Full Stack Web & Mobile Development",
    domain: "full_stack",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "Which HTTP method is conventionally used to retrieve a resource?",
    options: [
      { id: "A", optionId: "A", text: "GET" },
      { id: "B", optionId: "B", text: "POST" },
      { id: "C", optionId: "C", text: "PATCH" },
      { id: "D", optionId: "D", text: "DELETE" }
    ],
    correctOption: "A",
    explanation: "HTTP GET requests are used to retrieve representations of resources from servers.",
    skillDimensions: ["programming_readiness", "system_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_full_stack_e2",
    branch: "CSE",
    domainId: "full_stack",
    domainName: "Full Stack Web & Mobile Development",
    domain: "full_stack",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What is the purpose of React props?",
    options: [
      { id: "A", optionId: "A", text: "Pass data from a parent component to a child component" },
      { id: "B", optionId: "B", text: "Store server databases" },
      { id: "C", optionId: "C", text: "Replace HTTP" },
      { id: "D", optionId: "D", text: "Compile CSS" }
    ],
    correctOption: "A",
    explanation: "React props allow parent components to pass read-only data inputs down component trees.",
    skillDimensions: ["programming_readiness", "system_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_full_stack_e3",
    branch: "CSE",
    domainId: "full_stack",
    domainName: "Full Stack Web & Mobile Development",
    domain: "full_stack",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "Which technology is commonly used to persist documents for a MERN application?",
    options: [
      { id: "A", optionId: "A", text: "MongoDB" },
      { id: "B", optionId: "B", text: "React" },
      { id: "C", optionId: "C", text: "Express" },
      { id: "D", optionId: "D", text: "Node.js" }
    ],
    correctOption: "A",
    explanation: "MongoDB represents the database tier (M) in the MERN tech stack.",
    skillDimensions: ["system_thinking", "programming_readiness"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_full_stack_e4",
    branch: "CSE",
    domainId: "full_stack",
    domainName: "Full Stack Web & Mobile Development",
    domain: "full_stack",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What does responsive web design aim to achieve?",
    options: [
      { id: "A", optionId: "A", text: "A usable interface across different screen sizes" },
      { id: "B", optionId: "B", text: "Only desktop support" },
      { id: "C", optionId: "C", text: "Faster database queries" },
      { id: "D", optionId: "D", text: "Automatic API authentication" }
    ],
    correctOption: "A",
    explanation: "Responsive design adapts UI layouts fluidly across mobile, tablet, and desktop viewports.",
    skillDimensions: ["problem_solving", "attention_to_detail"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_full_stack_e5",
    branch: "CSE",
    domainId: "full_stack",
    domainName: "Full Stack Web & Mobile Development",
    domain: "full_stack",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What is REST primarily a style for?",
    options: [
      { id: "A", optionId: "A", text: "Designing networked APIs around resources and HTTP semantics" },
      { id: "B", optionId: "B", text: "Writing CSS animations" },
      { id: "C", optionId: "C", text: "Creating database indexes" },
      { id: "D", optionId: "D", text: "Building native CPU instructions" }
    ],
    correctOption: "A",
    explanation: "REST (Representational State Transfer) structures network web services using resource URIs and standard HTTP methods.",
    skillDimensions: ["system_thinking", "programming_readiness"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_full_stack_m1",
    branch: "CSE",
    domainId: "full_stack",
    domainName: "Full Stack Web & Mobile Development",
    domain: "full_stack",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "What is the purpose of React state?",
    options: [
      { id: "A", optionId: "A", text: "Store component data that can change and trigger re-rendering" },
      { id: "B", optionId: "B", text: "Replace all backend data" },
      { id: "C", optionId: "C", text: "Encrypt HTTP requests" },
      { id: "D", optionId: "D", text: "Define DNS records" }
    ],
    correctOption: "A",
    explanation: "React state manages dynamic data inside components, triggering DOM re-renders when updated.",
    skillDimensions: ["programming_readiness", "system_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_full_stack_m2",
    branch: "CSE",
    domainId: "full_stack",
    domainName: "Full Stack Web & Mobile Development",
    domain: "full_stack",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "What does middleware in Express typically do?",
    options: [
      { id: "A", optionId: "A", text: "Process requests/responses or perform cross-cutting logic in the request pipeline" },
      { id: "B", optionId: "B", text: "Render only CSS" },
      { id: "C", optionId: "C", text: "Create hardware drivers" },
      { id: "D", optionId: "D", text: "Replace MongoDB" }
    ],
    correctOption: "A",
    explanation: "Express middleware functions execute code, mutate request objects, and pass control along pipeline handlers.",
    skillDimensions: ["system_thinking", "programming_readiness"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_full_stack_m3",
    branch: "CSE",
    domainId: "full_stack",
    domainName: "Full Stack Web & Mobile Development",
    domain: "full_stack",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "Why is JWT commonly used in web applications?",
    options: [
      { id: "A", optionId: "A", text: "To carry signed claims that can be used for stateless authentication/authorization flows" },
      { id: "B", optionId: "B", text: "To store plaintext passwords" },
      { id: "C", optionId: "C", text: "To replace HTTPS" },
      { id: "D", optionId: "D", text: "To guarantee user identity without verification" }
    ],
    correctOption: "A",
    explanation: "JSON Web Tokens (JWT) allow servers to authenticate client requests statelessly via cryptographically signed payloads.",
    skillDimensions: ["system_thinking", "attention_to_detail"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_full_stack_m4",
    branch: "CSE",
    domainId: "full_stack",
    domainName: "Full Stack Web & Mobile Development",
    domain: "full_stack",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "What is the purpose of CORS?",
    options: [
      { id: "A", optionId: "A", text: "Control which origins are permitted to make certain cross-origin browser requests" },
      { id: "B", optionId: "B", text: "Encrypt MongoDB data" },
      { id: "C", optionId: "C", text: "Compile React" },
      { id: "D", optionId: "D", text: "Create user passwords" }
    ],
    correctOption: "A",
    explanation: "Cross-Origin Resource Sharing (CORS) uses HTTP headers to allow servers to declare allowed requesting browser origins.",
    skillDimensions: ["system_thinking", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_full_stack_m5",
    branch: "CSE",
    domainId: "full_stack",
    domainName: "Full Stack Web & Mobile Development",
    domain: "full_stack",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "Which mobile approach allows one codebase to target multiple platforms using a cross-platform framework?",
    options: [
      { id: "A", optionId: "A", text: "Cross-platform development" },
      { id: "B", optionId: "B", text: "Manual assembly programming" },
      { id: "C", optionId: "C", text: "Server-side rendering only" },
      { id: "D", optionId: "D", text: "Database sharding" }
    ],
    correctOption: "A",
    explanation: "Cross-platform frameworks (e.g., React Native, Flutter) enable deploying single codebases to iOS and Android.",
    skillDimensions: ["system_thinking", "programming_readiness"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_full_stack_h1",
    branch: "CSE",
    domainId: "full_stack",
    domainName: "Full Stack Web & Mobile Development",
    domain: "full_stack",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "Why should API pagination be used for very large collections?",
    options: [
      { id: "A", optionId: "A", text: "It limits response size and resource usage per request" },
      { id: "B", optionId: "B", text: "It guarantees faster databases in every case" },
      { id: "C", optionId: "C", text: "It removes indexes" },
      { id: "D", optionId: "D", text: "It prevents authentication" }
    ],
    correctOption: "A",
    explanation: "Pagination breaks massive result sets into manageable chunks, reducing payload latency and database memory overhead.",
    skillDimensions: ["system_thinking", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_full_stack_h2",
    branch: "CSE",
    domainId: "full_stack",
    domainName: "Full Stack Web & Mobile Development",
    domain: "full_stack",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "What is optimistic UI update?",
    options: [
      { id: "A", optionId: "A", text: "The interface updates immediately assuming the server operation will succeed, with rollback/error handling if it fails" },
      { id: "B", optionId: "B", text: "The server never receives the request" },
      { id: "C", optionId: "C", text: "The database is always correct" },
      { id: "D", optionId: "D", text: "The UI waits for every response before changing" }
    ],
    correctOption: "A",
    explanation: "Optimistic UI renders state updates immediately to feel snappy, quietly reverting if backend requests fail.",
    skillDimensions: ["problem_solving", "attention_to_detail"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_full_stack_h3",
    branch: "CSE",
    domainId: "full_stack",
    domainName: "Full Stack Web & Mobile Development",
    domain: "full_stack",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "In React, why are stable keys important when rendering lists?",
    options: [
      { id: "A", optionId: "A", text: "They help React correctly identify elements between renders" },
      { id: "B", optionId: "B", text: "They encrypt components" },
      { id: "C", optionId: "C", text: "They prevent all network errors" },
      { id: "D", optionId: "D", text: "They replace state management" }
    ],
    correctOption: "A",
    explanation: "Stable unique keys enable React reconciliation algorithms to efficiently re-order and update DOM nodes.",
    skillDimensions: ["programming_readiness", "system_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_full_stack_h4",
    branch: "CSE",
    domainId: "full_stack",
    domainName: "Full Stack Web & Mobile Development",
    domain: "full_stack",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "What is code splitting?",
    options: [
      { id: "A", optionId: "A", text: "Loading application code in smaller chunks when needed rather than shipping everything initially" },
      { id: "B", optionId: "B", text: "Splitting a database into users" },
      { id: "C", optionId: "C", text: "Dividing one HTTP request into passwords" },
      { id: "D", optionId: "D", text: "Creating multiple Git repositories only" }
    ],
    correctOption: "A",
    explanation: "Code splitting uses dynamic imports to split JavaScript bundles into lazy-loaded chunks, boosting initial page load speeds.",
    skillDimensions: ["system_thinking", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_full_stack_h5",
    branch: "CSE",
    domainId: "full_stack",
    domainName: "Full Stack Web & Mobile Development",
    domain: "full_stack",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "For a real-time chat application, why might Socket.io/WebSockets be preferred over repeated polling?",
    options: [
      { id: "A", optionId: "A", text: "They allow the server to push events to connected clients with lower polling overhead" },
      { id: "B", optionId: "B", text: "They eliminate authentication" },
      { id: "C", optionId: "C", text: "They require no network connection" },
      { id: "D", optionId: "D", text: "They store messages automatically in MongoDB" }
    ],
    correctOption: "A",
    explanation: "WebSockets open persistent full-duplex TCP channels allowing instant server-to-client event pushes without HTTP polling overhead.",
    skillDimensions: ["system_thinking", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },

  // =========================================================================
  // DOMAIN 7: CLOUD COMPUTING & DEVOPS (15 PDF QUESTIONS)
  // =========================================================================
  {
    questionId: "q_cloud_devops_e1",
    branch: "CSE",
    domainId: "cloud_devops",
    domainName: "Cloud Computing & DevOps",
    domain: "cloud_devops",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "Which cloud service model provides virtual machines, storage, and networking resources?",
    options: [
      { id: "A", optionId: "A", text: "IaaS" },
      { id: "B", optionId: "B", text: "SaaS" },
      { id: "C", optionId: "C", text: "PaaS only" },
      { id: "D", optionId: "D", text: "FaaS only" }
    ],
    correctOption: "A",
    explanation: "Infrastructure as a Service (IaaS) delivers fundamental compute, storage, and networking infrastructure.",
    skillDimensions: ["system_thinking", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cloud_devops_e2",
    branch: "CSE",
    domainId: "cloud_devops",
    domainName: "Cloud Computing & DevOps",
    domain: "cloud_devops",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What is virtualization?",
    options: [
      { id: "A", optionId: "A", text: "Creating logical computing resources from physical resources using a virtualization layer" },
      { id: "B", optionId: "B", text: "Encrypting every file" },
      { id: "C", optionId: "C", text: "Writing UI components" },
      { id: "D", optionId: "D", text: "Deleting hardware" }
    ],
    correctOption: "A",
    explanation: "Virtualization uses hypervisors to abstract virtual machines and resources from underlying physical hardware.",
    skillDimensions: ["system_thinking", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cloud_devops_e3",
    branch: "CSE",
    domainId: "cloud_devops",
    domainName: "Cloud Computing & DevOps",
    domain: "cloud_devops",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What is CI/CD used for?",
    options: [
      { id: "A", optionId: "A", text: "Automating integration, testing, delivery, and/or deployment of software changes" },
      { id: "B", optionId: "B", text: "Replacing source control" },
      { id: "C", optionId: "C", text: "Only monitoring CPU temperature" },
      { id: "D", optionId: "D", text: "Creating database schemas manually" }
    ],
    correctOption: "A",
    explanation: "Continuous Integration / Continuous Delivery automates building, testing, and releasing code changes.",
    skillDimensions: ["system_thinking", "attention_to_detail"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cloud_devops_e4",
    branch: "CSE",
    domainId: "cloud_devops",
    domainName: "Cloud Computing & DevOps",
    domain: "cloud_devops",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What is a container?",
    options: [
      { id: "A", optionId: "A", text: "A lightweight isolated environment that packages an application and its dependencies" },
      { id: "B", optionId: "B", text: "A physical server rack" },
      { id: "C", optionId: "C", text: "A DNS record" },
      { id: "D", optionId: "D", text: "A database table" }
    ],
    correctOption: "A",
    explanation: "Containers package code and OS runtime dependencies together in lightweight OS-level virtualized units.",
    skillDimensions: ["system_thinking", "programming_readiness"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cloud_devops_e5",
    branch: "CSE",
    domainId: "cloud_devops",
    domainName: "Cloud Computing & DevOps",
    domain: "cloud_devops",
    difficulty: "easy",
    questionType: "conceptual",
    questionText: "What is autoscaling?",
    options: [
      { id: "A", optionId: "A", text: "Automatically adjusting computing resources according to demand or policy" },
      { id: "B", optionId: "B", text: "Manually changing source code" },
      { id: "C", optionId: "C", text: "Encrypting storage" },
      { id: "D", optionId: "D", text: "Deleting unused users" }
    ],
    correctOption: "A",
    explanation: "Autoscaling dynamically scales server instance counts up or down based on real-time traffic or CPU load metrics.",
    skillDimensions: ["system_thinking", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cloud_devops_m1",
    branch: "CSE",
    domainId: "cloud_devops",
    domainName: "Cloud Computing & DevOps",
    domain: "cloud_devops",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "What is Infrastructure as Code (IaC)?",
    options: [
      { id: "A", optionId: "A", text: "Managing infrastructure through version-controlled machine-readable definitions" },
      { id: "B", optionId: "B", text: "Writing infrastructure documentation only" },
      { id: "C", optionId: "C", text: "Buying hardware with code" },
      { id: "D", optionId: "D", text: "Replacing all monitoring" }
    ],
    correctOption: "A",
    explanation: "IaC (e.g., Terraform, CloudFormation) provisions and configures cloud infrastructure using declarative code files.",
    skillDimensions: ["system_thinking", "programming_readiness"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cloud_devops_m2",
    branch: "CSE",
    domainId: "cloud_devops",
    domainName: "Cloud Computing & DevOps",
    domain: "cloud_devops",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "What is a Kubernetes pod?",
    options: [
      { id: "A", optionId: "A", text: "The smallest deployable unit in Kubernetes, containing one or more containers" },
      { id: "B", optionId: "B", text: "A cloud billing account" },
      { id: "C", optionId: "C", text: "A database shard" },
      { id: "D", optionId: "D", text: "A DNS server" }
    ],
    correctOption: "A",
    explanation: "Pods wrap co-located container groups that share storage and network namespaces in Kubernetes.",
    skillDimensions: ["system_thinking", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cloud_devops_m3",
    branch: "CSE",
    domainId: "cloud_devops",
    domainName: "Cloud Computing & DevOps",
    domain: "cloud_devops",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "Why are health checks used with load balancers?",
    options: [
      { id: "A", optionId: "A", text: "To avoid routing traffic to unhealthy instances" },
      { id: "B", optionId: "B", text: "To increase source-code size" },
      { id: "C", optionId: "C", text: "To remove TLS" },
      { id: "D", optionId: "D", text: "To disable autoscaling" }
    ],
    correctOption: "A",
    explanation: "Health checks ping target backend instances to ensure traffic is only routed to responsive nodes.",
    skillDimensions: ["system_thinking", "attention_to_detail"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cloud_devops_m4",
    branch: "CSE",
    domainId: "cloud_devops",
    domainName: "Cloud Computing & DevOps",
    domain: "cloud_devops",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "What is blue-green deployment?",
    options: [
      { id: "A", optionId: "A", text: "Maintaining two production environments and switching traffic between them" },
      { id: "B", optionId: "B", text: "Deploying only on Mondays" },
      { id: "C", optionId: "C", text: "Using two databases without replication" },
      { id: "D", optionId: "D", text: "Running two IDEs" }
    ],
    correctOption: "A",
    explanation: "Blue-Green deployment runs identical live (Blue) and new (Green) environments, switching traffic seamlessly via router updates.",
    skillDimensions: ["system_thinking", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cloud_devops_m5",
    branch: "CSE",
    domainId: "cloud_devops",
    domainName: "Cloud Computing & DevOps",
    domain: "cloud_devops",
    difficulty: "medium",
    questionType: "conceptual",
    questionText: "What is observability in DevOps?",
    options: [
      { id: "A", optionId: "A", text: "Understanding system state through metrics, logs, and traces" },
      { id: "B", optionId: "B", text: "Only measuring cloud cost" },
      { id: "C", optionId: "C", text: "Writing UI styles" },
      { id: "D", optionId: "D", text: "Replacing monitoring with manual checks" }
    ],
    correctOption: "A",
    explanation: "Observability measures internal system health by analyzing output telemetry logs, metrics, and traces.",
    skillDimensions: ["system_thinking", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cloud_devops_h1",
    branch: "CSE",
    domainId: "cloud_devops",
    domainName: "Cloud Computing & DevOps",
    domain: "cloud_devops",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "What is a rolling deployment?",
    options: [
      { id: "A", optionId: "A", text: "Gradually replacing instances with a new version while keeping service available" },
      { id: "B", optionId: "B", text: "Replacing all instances simultaneously" },
      { id: "C", optionId: "C", text: "Deploying without versioning" },
      { id: "D", optionId: "D", text: "Deploying only to developer laptops" }
    ],
    correctOption: "A",
    explanation: "Rolling deployments incrementally replace old application instances with new ones to achieve zero downtime.",
    skillDimensions: ["system_thinking", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cloud_devops_h2",
    branch: "CSE",
    domainId: "cloud_devops",
    domainName: "Cloud Computing & DevOps",
    domain: "cloud_devops",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "What is a key benefit of immutable infrastructure?",
    options: [
      { id: "A", optionId: "A", text: "Servers are replaced rather than manually modified, reducing configuration drift" },
      { id: "B", optionId: "B", text: "Servers never need monitoring" },
      { id: "C", optionId: "C", text: "It eliminates backups" },
      { id: "D", optionId: "D", text: "It requires editing production servers directly" }
    ],
    correctOption: "A",
    explanation: "Immutable infrastructure deploys new pre-configured server images rather than patching running servers, preventing drift.",
    skillDimensions: ["system_thinking", "attention_to_detail"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cloud_devops_h3",
    branch: "CSE",
    domainId: "cloud_devops",
    domainName: "Cloud Computing & DevOps",
    domain: "cloud_devops",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "Why is a distributed tracing system useful in microservices?",
    options: [
      { id: "A", optionId: "A", text: "It follows a request across multiple services to locate latency or failure points" },
      { id: "B", optionId: "B", text: "It replaces authentication" },
      { id: "C", optionId: "C", text: "It stores passwords" },
      { id: "D", optionId: "D", text: "It removes network traffic" }
    ],
    correctOption: "A",
    explanation: "Distributed tracing tracks request propagation paths across microservice boundaries to pinpoint bottlenecks.",
    skillDimensions: ["system_thinking", "analytical_thinking"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cloud_devops_h4",
    branch: "CSE",
    domainId: "cloud_devops",
    domainName: "Cloud Computing & DevOps",
    domain: "cloud_devops",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "What does a Kubernetes Horizontal Pod Autoscaler generally adjust?",
    options: [
      { id: "A", optionId: "A", text: "The number of pod replicas based on configured metrics" },
      { id: "B", optionId: "B", text: "The size of a source-code file" },
      { id: "C", optionId: "C", text: "The number of database columns" },
      { id: "D", optionId: "D", text: "The DNS domain name" }
    ],
    correctOption: "A",
    explanation: "HPA scales pod deployment replicas automatically to match observed CPU/memory or custom application metrics.",
    skillDimensions: ["system_thinking", "problem_solving"],
    source: "master-question-bank-pdf",
    active: true
  },
  {
    questionId: "q_cloud_devops_h5",
    branch: "CSE",
    domainId: "cloud_devops",
    domainName: "Cloud Computing & DevOps",
    domain: "cloud_devops",
    difficulty: "hard",
    questionType: "scenario",
    questionText: "What is a major risk of storing secrets directly in a Git repository?",
    options: [
      { id: "A", optionId: "A", text: "Secrets can be exposed through repository history or unauthorized access" },
      { id: "B", optionId: "B", text: "Git automatically encrypts all secrets" },
      { id: "C", optionId: "C", text: "It prevents deployment" },
      { id: "D", optionId: "D", text: "It improves key rotation" }
    ],
    correctOption: "A",
    explanation: "Committing API keys or credentials directly to version control persists secrets permanently in git commit logs.",
    skillDimensions: ["attention_to_detail", "system_thinking"],
    source: "master-question-bank-pdf",
    active: true
  }
];

// Append B.E. ECE Master Question Bank (17 domains, 255 questions)
const { ECE_MASTER_QUESTION_BANK } = require("./seedEceMasterQuestionBank");
if (Array.isArray(ECE_MASTER_QUESTION_BANK) && ECE_MASTER_QUESTION_BANK.length > 0) {
  PDF_MASTER_QUESTION_BANK.push(...ECE_MASTER_QUESTION_BANK);
}

async function seedPdfMasterQuestionBank() {
  let inserted = 0;
  let updated = 0;

  // Delete all old generic questions not originating from master-question-bank-pdf
  await AhpFuzzyQuestion.deleteMany({
    $or: [
      { source: { $ne: "master-question-bank-pdf" } },
      { source: { $exists: false } },
      { questionId: { $regex: /^[A-Z]{2}_[EMH]_\d{3}$/ } }
    ]
  });

  for (const q of PDF_MASTER_QUESTION_BANK) {
    const res = await AhpFuzzyQuestion.updateOne(
      { questionId: q.questionId },
      { $set: q },
      { upsert: true }
    );
    const isNewDoc = Boolean(res.upsertedCount > 0 || res.upsertedId);
    if (isNewDoc) inserted++;
    else updated++;
  }

  console.log(`[PDF MASTER SEED] Complete. Inserted: ${inserted}, Updated: ${updated}, Total: ${PDF_MASTER_QUESTION_BANK.length}`);
  return { success: true, totalQuestions: PDF_MASTER_QUESTION_BANK.length, inserted, updated };
}

module.exports = {
  PDF_MASTER_QUESTION_BANK,
  seedPdfMasterQuestionBank
};

