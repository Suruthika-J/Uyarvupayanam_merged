/**
 * ─────────────────────────────────────────────────────────────────
 *  Source Course Dataset — courses-after-12th (drukihsr.org)
 *  Exact courses from: https://www.drukihsr.org/druk/blog/courses-after-12th/
 *  Categories: Diploma(8), Arts(15), Certificate(3), Commerce(16),
 *              Management(12), Science(45), Engineering(43 incl. B.Arch)
 * ─────────────────────────────────────────────────────────────────
 */

const SOURCE_URL = "https://www.drukihsr.org/druk/blog/courses-after-12th/";
const SOURCE_NAME = "Dr. UK Institute of Health Sciences and Research";
const TRAJECTORY = "After 12th";

// ── Helper to build a course object ───────────────────────────────
function c(courseName, category, type, duration, eligibility, description, scope, averageSalary) {
  return {
    courseName,
    category,
    type,
    level: type,
    targetLevel: TRAJECTORY,
    trajectory: TRAJECTORY,
    duration,
    eligibility: eligibility || "12th Standard Pass (any stream)",
    shortDescription: description || `A comprehensive ${type.toLowerCase()} program in ${courseName}.`,
    scope: scope || "",
    averageSalary: averageSalary || "",
    sourceUrl: SOURCE_URL,
    sourceName: SOURCE_NAME,
    isImported: true,
    isPublished: true,
    status: "active",
  };
}

// ════════════════════════════════════════════════════════════════════
//  DIPLOMA COURSES (8) — Category: Medical
// ════════════════════════════════════════════════════════════════════
const diplomaCourses = [
  c("Diploma in Medical Laboratory Technology (DMLT)", "Medical", "Diploma", "2 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Learn clinical biochemistry, microbiology, pathology and haematology lab techniques for diagnostic support.",
    "Hospitals, Diagnostic Labs, Research Centres", "₹2.5 – 4.5 LPA"),

  c("Diploma in Patient Care (Nursing)", "Medical", "Diploma", "2 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Gain hands-on skills in bedside nursing, patient vitals monitoring, wound care and emergency first aid.",
    "Hospitals, Clinics, Home Healthcare", "₹2 – 4 LPA"),

  c("Diploma in X-Ray and Imaging Technology", "Medical", "Diploma", "2 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Master radiographic imaging, CT scan operations, MRI basics and radiation safety protocols.",
    "Radiology Departments, Imaging Centres", "₹2.5 – 5 LPA"),

  c("Diploma in Physician Assistant", "Medical", "Diploma", "2 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Train to assist physicians in clinical examinations, history taking, minor procedures and patient counseling.",
    "Multi-speciality Hospitals, Clinics", "₹2.5 – 4.5 LPA"),

  c("Diploma in Anesthesia Technology", "Medical", "Diploma", "2 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Learn anaesthesia equipment handling, pre-operative assessment, monitoring during surgery and post-anaesthesia care.",
    "Operation Theatres, ICU, Trauma Centres", "₹3 – 5 LPA"),

  c("Diploma in Operation Theatre Technology", "Medical", "Diploma", "2 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Develop proficiency in OT setup, surgical instrument handling, sterilization and assisting surgeons during operations.",
    "Surgery Departments, Nursing Homes", "₹2.5 – 4.5 LPA"),

  c("Diploma in Accident and Emergency Technology", "Medical", "Diploma", "2 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Specialise in emergency triage, trauma stabilisation, ambulance care and disaster management medical response.",
    "Emergency Departments, Ambulance Services", "₹2.5 – 4.5 LPA"),

  c("Diploma in Critical Care Management", "Medical", "Diploma", "2 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Focus on ICU patient monitoring, ventilator management, haemodynamic assessments and critical care nursing.",
    "ICU, CCU, Critical Care Units", "₹3 – 5 LPA"),
];

// ════════════════════════════════════════════════════════════════════
//  CERTIFICATION COURSES (3) — Category: Certificate
// ════════════════════════════════════════════════════════════════════
const certificationCourses = [
  c("Certificate Course in Mushroom Cultivation", "Certificate", "Certificate", "6 Months",
    "12th Standard Pass (any stream)",
    "Hands-on training in spawn production, indoor/outdoor mushroom farming, pest control and post-harvest handling.",
    "Agri-entrepreneurship, Export Business", "₹1.5 – 3 LPA"),

  c("Certificate Course in Wheat Grass Production", "Certificate", "Certificate", "6 Months",
    "12th Standard Pass (any stream)",
    "Learn organic wheat grass cultivation, juicing, packaging and marketing for the health and wellness industry.",
    "Health Food Industry, Organic Farming", "₹1.5 – 3 LPA"),

  c("Certificate Course in Exotic Vegetables and Aromatics", "Certificate", "Certificate", "6 Months",
    "12th Standard Pass (any stream)",
    "Master the cultivation of exotic vegetables, aromatic herbs and micro-greens for premium markets.",
    "Agri-tech Start-ups, Hospitality Supply", "₹1.5 – 3 LPA"),
];

// ════════════════════════════════════════════════════════════════════
//  ARTS COURSES (15) — Category: Arts
// ════════════════════════════════════════════════════════════════════
const artsCourses = [
  c("B.A. Tamil Literature", "Arts", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Deep study of classical and modern Tamil literature, Sangam poetry, grammar and literary criticism.",
    "Teaching, Translation, Content Writing, Civil Services", "₹2.5 – 5 LPA"),

  c("B.A. English Language & Literature", "Arts", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Explore English prose, poetry, drama and world literature with focus on language skills and critical thinking.",
    "Teaching, Journalism, Publishing, Corporate Communications", "₹3 – 6 LPA"),

  c("B.A. English Literature with Computer Applications", "Arts", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Combine English literature study with practical computer application skills for modern career readiness.",
    "Content Writing, IT Documentation, Digital Media", "₹3 – 6 LPA"),

  c("B.A. History", "Arts", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Study ancient, medieval and modern Indian and world history including historiography and archival research.",
    "Civil Services, Museums, Archives, Archaeology", "₹2.5 – 5 LPA"),

  c("B.A. History and Tourism", "Arts", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Blend historical knowledge with tourism management — heritage tourism, cultural preservation and travel planning.",
    "Tourism Industry, Heritage Sites, Travel Agencies", "₹2.5 – 5 LPA"),

  c("B.A. History with Civil Services", "Arts", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "History degree with integrated UPSC/TNPSC civil services preparation covering polity, economy and current affairs.",
    "Civil Services (IAS/IPS/IFS), Government Sector", "₹3 – 8 LPA"),

  c("B.A. Tourism and Travel Management", "Arts", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Learn travel industry operations, tourism marketing, hospitality management and event planning.",
    "Travel Agencies, Hotels, Airlines, Event Companies", "₹3 – 6 LPA"),

  c("B.A. Economics", "Arts", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Understand micro/macro economics, econometrics, public finance, Indian economic development and policy analysis.",
    "Banking, Government Sector, Policy Research", "₹3 – 7 LPA"),

  c("B.A. Economics with Portfolio Management", "Arts", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Economics combined with investment portfolio analysis, asset management and financial planning skills.",
    "Investment Firms, Banks, Wealth Management", "₹3.5 – 7 LPA"),

  c("B.A. Economics with Logistics & Freight Management", "Arts", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Economics paired with logistics, freight handling, supply chain and transportation management.",
    "Logistics Companies, Freight Forwarders, Ports", "₹3 – 6 LPA"),

  c("B.A. Economics with Insurance & Finance", "Arts", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Economics foundation with specialisation in insurance products, risk management and financial services.",
    "Insurance Companies, Banks, NBFCs", "₹3 – 7 LPA"),

  c("B.A. Economics with Computer Application", "Arts", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Blend of economics theory with programming, data analysis tools and IT skills for modern economic analysis.",
    "Data Analytics, Fintech, Economic Research", "₹3 – 7 LPA"),

  c("B.A. Economics with Global Business", "Arts", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Economics with international trade, global business strategy, EXIM policies and cross-cultural management.",
    "MNCs, Export-Import Firms, International Agencies", "₹3.5 – 8 LPA"),

  c("B.A. Economics with Retailing", "Arts", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Economics integrated with retail management, consumer behaviour, merchandising and store operations.",
    "Retail Chains, FMCG, E-commerce, Brand Management", "₹3 – 6 LPA"),

  c("B.A. Defence and Strategic Studies", "Arts", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Study national security, defence policy, strategic affairs, military history and international relations.",
    "Defence Services, UPSC, Intelligence, Think Tanks", "₹3 – 8 LPA"),
];

// ════════════════════════════════════════════════════════════════════
//  COMMERCE COURSES (16) — Category: Commerce
// ════════════════════════════════════════════════════════════════════
const commerceCourses = [
  c("B.Com.", "Commerce", "Degree", "3 Years",
    "12th Standard Pass (Commerce / any stream)",
    "Core commerce degree covering accounting, business law, taxation, auditing and financial management.",
    "Accounting, Banking, Auditing, CA/CMA Foundation", "₹3 – 6 LPA"),

  c("B.Com. C.A.", "Commerce", "Degree", "3 Years",
    "12th Standard Pass (Commerce / any stream)",
    "Commerce degree integrated with Chartered Accountancy preparation for a seamless CA career pathway.",
    "CA Firms, Corporate Finance, Auditing", "₹4 – 10 LPA"),

  c("B.Com. E-Commerce", "Commerce", "Degree", "3 Years",
    "12th Standard Pass (Commerce / any stream)",
    "Study digital commerce, payment gateways, supply chain management, digital marketing and cyber law.",
    "E-commerce Platforms, Digital Business, Start-ups", "₹3 – 7 LPA"),

  c("B.Com. Corporate Secretaryship", "Commerce", "Degree", "3 Years",
    "12th Standard Pass (Commerce / any stream)",
    "Learn company law, secretarial practice, corporate governance and SEBI regulations for CS pathway.",
    "Corporate Legal, Compliance, Company Secretary", "₹3.5 – 7 LPA"),

  c("B.Com. Corporate Secretaryship with C.A.", "Commerce", "Degree", "3 Years",
    "12th Standard Pass (Commerce / any stream)",
    "Dual-focus programme combining company secretaryship with chartered accountancy preparation.",
    "CS + CA Firms, Corporate Governance, Legal Compliance", "₹4 – 10 LPA"),

  c("B.Com. Retail Marketing", "Commerce", "Degree", "3 Years",
    "12th Standard Pass (Commerce / any stream)",
    "Study retail operations, visual merchandising, consumer behaviour, store management and retail analytics.",
    "Retail Chains, Shopping Malls, E-commerce, FMCG", "₹3 – 6 LPA"),

  c("B.Com. Information Technology", "Commerce", "Degree", "3 Years",
    "12th Standard Pass (Commerce / any stream)",
    "Combination of commerce and IT covering ERP, database management, networking and business software.",
    "IT-enabled Services, Fintech, ERP Implementation", "₹3 – 7 LPA"),

  c("B.Com. Banking & Insurance", "Commerce", "Degree", "3 Years",
    "12th Standard Pass (Commerce / any stream)",
    "Specialised study of banking operations, insurance products, risk management and financial regulations.",
    "Banks, Insurance Companies, NBFCs", "₹3 – 6 LPA"),

  c("B.Com. Co-operation", "Commerce", "Degree", "3 Years",
    "12th Standard Pass (Commerce / any stream)",
    "Study cooperative society management, cooperative law, rural banking and cooperative accounting.",
    "Cooperative Banks, Cooperative Societies, Government", "₹2.5 – 5 LPA"),

  c("B.Com. Co-operative Management", "Commerce", "Degree", "3 Years",
    "12th Standard Pass (Commerce / any stream)",
    "Focus on management of cooperative institutions, cooperative marketing, credit societies and governance.",
    "Cooperative Sector, Rural Development, Government", "₹2.5 – 5 LPA"),

  c("B.Com – PA (Professional Accounting)", "Commerce", "Degree", "3 Years",
    "12th Standard Pass (Commerce / any stream)",
    "Integrated programme aligned with professional accounting bodies (ICAI, ACCA) for global certification.",
    "Global Accounting Firms, Big 4, ACCA pathway", "₹4 – 8 LPA"),

  c("B.Com – with Diploma in Cooperative Management", "Commerce", "Degree", "3 Years",
    "12th Standard Pass (Commerce / any stream)",
    "Commerce degree bundled with a diploma in cooperative management for dual qualification.",
    "Cooperative Banks, Rural Institutions, Government", "₹3 – 5 LPA"),

  c("B.Com Co-Operative Management", "Commerce", "Degree", "3 Years",
    "12th Standard Pass (Commerce / any stream)",
    "Comprehensive study of cooperative principles, management, law and practice in the Indian cooperative sector.",
    "Cooperative Institutions, Agricultural Cooperatives", "₹2.5 – 5 LPA"),

  c("B.Com International Business", "Commerce", "Degree", "3 Years",
    "12th Standard Pass (Commerce / any stream)",
    "Study global trade, EXIM policies, forex management, international marketing and logistics.",
    "Export Houses, MNCs, Trade Organisations", "₹3.5 – 8 LPA"),

  c("B.Com - Finance", "Commerce", "Degree", "3 Years",
    "12th Standard Pass (Commerce / any stream)",
    "Advanced study of corporate finance, financial analysis, investment management and capital markets.",
    "Banks, NBFCs, Investment Firms, Insurance", "₹3.5 – 7 LPA"),

  c("B.Com. Garment Cost Accounting", "Commerce", "Degree", "3 Years",
    "12th Standard Pass (Commerce / any stream)",
    "Specialised costing and accounting for the garment manufacturing industry including production cost analysis.",
    "Garment Industry, Textile Manufacturing, Apparel Export", "₹3 – 6 LPA"),
];

// ════════════════════════════════════════════════════════════════════
//  MANAGEMENT COURSES (12) — Category: Management
// ════════════════════════════════════════════════════════════════════
const managementCourses = [
  c("B.B.A.", "Management", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Foundational management education covering HR, marketing, finance, operations and strategic management.",
    "Corporate Management, Entrepreneurship, MBA pathway", "₹3 – 6 LPA"),

  c("B.B.A. with C.A.", "Management", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Business administration combined with Chartered Accountancy preparation for a dual career advantage.",
    "CA Firms, Corporate Finance, Business Management", "₹4 – 10 LPA"),

  c("B.B.A. International Business", "Management", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Focus on global business strategy, cross-cultural management, international trade and foreign policy.",
    "MNCs, Export-Import Firms, International Agencies", "₹3.5 – 8 LPA"),

  c("B.B.A. Retail Management", "Management", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Study retail operations, supply chain, visual merchandising, store management and consumer analytics.",
    "Retail Chains, Shopping Malls, FMCG", "₹3 – 6 LPA"),

  c("B.B.A. Service Management", "Management", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Learn service industry management covering hospitality, healthcare, IT services and customer experience.",
    "Service Industries, Hospitality, IT Services", "₹3 – 6 LPA"),

  c("B.B.A. Information Systems", "Management", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Blend of business management with information systems, ERP, database management and IT strategy.",
    "IT-enabled Business, ERP Consulting, Tech Management", "₹3.5 – 7 LPA"),

  c("B.B.A. Information Management", "Management", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Study knowledge management, data governance, business intelligence and information lifecycle management.",
    "Data Management, Business Analytics, IT Governance", "₹3.5 – 7 LPA"),

  c("B.B.A. Banking", "Management", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Specialised banking management covering CASA, lending, treasury operations and digital banking.",
    "Commercial Banks, Private Banks, RBI, NBFCs", "₹3 – 6 LPA"),

  c("B.B.A. Insurance", "Management", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Study insurance principles, underwriting, claims management, actuarial basics and risk assessment.",
    "Insurance Companies, Brokerages, Reinsurance", "₹3 – 6 LPA"),

  c("B.B.A. Marketing Management", "Management", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Specialise in consumer behaviour, brand management, digital marketing, sales strategy and market research.",
    "FMCG, Digital Agencies, Media, Brand Management", "₹3.5 – 7 LPA"),

  c("B.B.A. Financial Management", "Management", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Study investment analysis, corporate finance, financial planning, banking and capital markets.",
    "Banks, NBFCs, Investment Firms, Insurance", "₹3.5 – 7 LPA"),

  c("B.B.A. Investment", "Management", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Focus on investment analysis, portfolio management, stock markets, mutual funds and wealth management.",
    "Investment Banks, Mutual Fund Houses, Wealth Management", "₹4 – 9 LPA"),
];

// ════════════════════════════════════════════════════════════════════
//  SCIENCE COURSES (45) — Category: Science
// ════════════════════════════════════════════════════════════════════
const scienceCourses = [
  c("B.Sc. Mathematics", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Maths)",
    "Study algebra, calculus, statistics, numerical analysis and mathematical modelling.",
    "Data Science, Actuarial Science, Teaching, Banking", "₹3 – 7 LPA"),

  c("B.Sc. Mathematics with CA", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Maths)",
    "Mathematics degree integrated with Chartered Accountancy preparation for finance-oriented careers.",
    "CA Firms, Financial Analysis, Actuarial Science", "₹4 – 8 LPA"),

  c("B.Sc. Applied Mathematics", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Maths)",
    "Focus on applied mathematical techniques for engineering, computing, economics and data science applications.",
    "IT, Data Analytics, Operations Research, Banking", "₹3.5 – 8 LPA"),

  c("B.Sc. Statistics", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Maths)",
    "Learn probability theory, statistical inference, regression analysis and data science foundations.",
    "Data Analytics, Insurance, Government Statistics", "₹3.5 – 8 LPA"),

  c("B.Sc. Physics", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Maths)",
    "Study classical mechanics, electromagnetism, quantum physics, thermodynamics and nuclear physics.",
    "Research, Teaching, ISRO/DRDO, IT Sector", "₹3 – 6 LPA"),

  c("B.Sc. Physics with Material Science", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Maths)",
    "Physics combined with material science covering nanomaterials, composites and advanced material characterisation.",
    "Materials Research, Manufacturing, Semiconductor", "₹3 – 7 LPA"),

  c("B.Sc. Physics with Nano-Technology", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Maths)",
    "Physics with nanotechnology focus — nanomaterials synthesis, nano-devices and nano-characterisation techniques.",
    "Nanotech Research, Pharma, Electronics, Defence", "₹3 – 7 LPA"),

  c("B.Sc. Physics with C.A.", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Maths)",
    "Unique combination of physics with chartered accountancy preparation for analytical career paths.",
    "CA Firms, Financial Sector, Quantitative Analysis", "₹4 – 8 LPA"),

  c("B.Sc. Plant Biology and Plant Biotechnology / B.Sc. Botany", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Explore plant taxonomy, physiology, ecology, genetics and biotechnology applications in agriculture.",
    "Agriculture, Forestry, Research, Environmental Agencies", "₹2.5 – 5 LPA"),

  c("B.Sc. Chemistry", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Maths/Biology)",
    "Learn organic, inorganic and physical chemistry, analytical techniques and industrial chemistry.",
    "Pharmaceuticals, Chemical Industries, Research Labs", "₹3 – 6 LPA"),

  c("B.Sc. Chemistry with Nanotechnology", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Maths/Biology)",
    "Chemistry with nanotechnology specialisation — nano-catalysis, nanomaterials and green nanotechnology.",
    "Nanotech Industry, Chemical Research, Pharma", "₹3 – 7 LPA"),

  c("B.Sc. Industrial Chemistry", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Maths/Biology)",
    "Study chemical manufacturing processes, quality control, industrial catalysis and chemical plant operations.",
    "Chemical Industries, Refineries, Quality Labs", "₹3 – 6 LPA"),

  c("B.Sc. Biochemistry", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Study enzyme kinetics, metabolism, molecular biology, clinical biochemistry and proteomics.",
    "Diagnostics, Pharma, Research, Clinical Labs", "₹3 – 6 LPA"),

  c("B.Sc. Biochemistry with Nanotechnology", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Biochemistry integrated with nanotechnology for drug delivery systems, biosensors and nano-medicine research.",
    "Pharma, Biotech, Nano-medicine Research", "₹3 – 7 LPA"),

  c("B.Sc. Pharmaceutical Chemistry", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Biology/Maths)",
    "Study drug chemistry, medicinal chemistry, pharmacology basics and pharmaceutical analysis.",
    "Pharma Industry, Drug Manufacturing, Quality Control", "₹3 – 7 LPA"),

  c("B.Sc. Polymer Technology", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Maths)",
    "Study polymer synthesis, characterisation, processing, compounding and applications in industry.",
    "Plastic/Rubber Industry, Packaging, Petrochemicals", "₹3 – 6 LPA"),

  c("B.C.A.", "Science", "Degree", "3 Years",
    "12th Standard Pass (Maths preferred)",
    "Comprehensive computing degree covering programming, web development, DBMS and software engineering.",
    "IT Industry, Software Development, MCA pathway", "₹3.5 – 8 LPA"),

  c("B.Sc. Computer Science", "Science", "Degree", "3 Years",
    "12th Standard Pass (Maths mandatory)",
    "Learn programming, data structures, algorithms, DBMS, networking and software engineering.",
    "IT Industry, Software Development, Start-ups", "₹4 – 10 LPA"),

  c("B.Sc. Computer Science and Applications", "Science", "Degree", "3 Years",
    "12th Standard Pass (Maths mandatory)",
    "Computer science with applied focus on real-world software development, web applications and data management.",
    "IT Services, Application Development, Tech Start-ups", "₹4 – 10 LPA"),

  c("B.Sc. Information Technology", "Science", "Degree", "3 Years",
    "12th Standard Pass (Maths mandatory)",
    "Study web technologies, database management, networking, cyber security and cloud computing.",
    "IT Services, Networking, Cyber Security", "₹3.5 – 8 LPA"),

  c("B.Sc. Software Systems", "Science", "Degree", "3 Years",
    "12th Standard Pass (Maths mandatory)",
    "Focus on software architecture, systems programming, middleware development and enterprise software design.",
    "Software Companies, Systems Integration, Product Firms", "₹4 – 10 LPA"),

  c("B.Sc. Computer Technology", "Science", "Degree", "3 Years",
    "12th Standard Pass (Maths mandatory)",
    "Study hardware-software integration, embedded systems, IoT basics and computer architecture.",
    "IT Hardware, IoT, Embedded Systems, Tech Companies", "₹3.5 – 8 LPA"),

  c("B.Sc. Multimedia & Web Technology", "Science", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Learn web design, multimedia production, animation basics, UI/UX and digital content creation.",
    "Web Studios, Digital Agencies, Media Companies", "₹3 – 7 LPA"),

  c("B.Sc. Clinical Laboratory Technology", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Advanced medical laboratory diagnostics including clinical pathology, haematology and immunology.",
    "Diagnostic Labs, Hospitals, Research Centres", "₹3 – 6 LPA"),

  c("B.Sc. Electronics", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Maths)",
    "Learn digital/analog electronics, microprocessors, embedded systems and communication engineering basics.",
    "Electronics Industry, Telecom, Defence", "₹3 – 6 LPA"),

  c("B.Sc. Electronics & Communication System", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Maths)",
    "Study communication systems, signal processing, digital electronics and wireless technology.",
    "Telecom, Broadcasting, Electronics Manufacturing", "₹3 – 6 LPA"),

  c("B.Sc. Biotechnology", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Study molecular biology, genetic engineering, fermentation technology and bioinformatics.",
    "Biotech Firms, Pharma, Research Labs, Agri-biotech", "₹3 – 7 LPA"),

  c("B.Sc. Interior Design", "Science", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Study space planning, furniture design, colour theory, lighting design and architectural interiors.",
    "Interior Design Firms, Architecture Offices, Real Estate", "₹3 – 7 LPA"),

  c("B.Sc. Interior Design with Computer Applications", "Science", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Interior design combined with CAD, 3D modelling software and digital visualisation tools.",
    "Digital Design Studios, Real Estate, Architecture", "₹3 – 8 LPA"),

  c("B.Sc. Microbiology", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Learn bacteriology, virology, immunology, environmental microbiology and industrial microbiology.",
    "Pharma, Food Industry, Clinical Labs, Research", "₹3 – 6 LPA"),

  c("B.Sc. Microbiology with Nanotechnology", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Microbiology with nanotechnology applications in antimicrobial research, drug delivery and biosensors.",
    "Nanotech Research, Pharma, Biotech", "₹3 – 7 LPA"),

  c("B.Sc. Geography", "Science", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Learn physical and human geography, GIS mapping, climatology and regional planning techniques.",
    "Urban Planning, GIS Analysis, Environmental Agencies", "₹3 – 6 LPA"),

  c("B.Sc. Advanced Zoology and Biotech with Sericulture", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Advanced zoology with biotechnology and sericulture (silk production) for niche agricultural careers.",
    "Sericulture Dept, Biotech, Entomology Research", "₹2.5 – 5 LPA"),

  c("B.Sc. Advanced Zoology and Biotechnology / B.Sc. Zoology", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Study animal classification, physiology, ecology, genetics and evolutionary biology with biotech applications.",
    "Wildlife Conservation, Research, Veterinary Sciences", "₹2.5 – 5 LPA"),

  c("B.Sc. Zoology (Wildlife Biology)", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Specialised zoology degree focusing on wildlife ecology, conservation biology and wildlife management.",
    "Wildlife Sanctuaries, Forest Dept, Conservation NGOs", "₹3 – 6 LPA"),

  c("B.Sc. Costume Design and Fashion - Vocational", "Science", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Vocational programme in costume design, fashion illustration, pattern making and garment construction.",
    "Fashion Houses, Film Industry, Theatre, Retail", "₹3 – 6 LPA"),

  c("B.Sc. Costume Design and Fashion", "Science", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Study fashion design, textile science, draping techniques, fashion marketing and trend forecasting.",
    "Fashion Industry, Textile Companies, Retail Brands", "₹3 – 7 LPA"),

  c("B.Sc. Apparel Fashion Designing", "Science", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Focus on apparel design, digital fashion illustration, garment technology and fashion merchandising.",
    "Apparel Industry, Fashion Design Studios, Export Houses", "₹3 – 7 LPA"),

  c("B.Sc. Apparel Manufacturing Merchandising", "Science", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Study apparel production management, merchandising, quality assurance and supply chain in garment industry.",
    "Garment Factories, Apparel Export, Retail Buying", "₹3 – 6 LPA"),

  c("B.Sc. Fashion Apparel Management", "Science", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Manage fashion business operations — buying, sourcing, brand management and retail strategy.",
    "Fashion Brands, Retail Management, E-commerce", "₹3 – 7 LPA"),

  c("B.Sc. Garment Production Processing / Garment Designing & Production", "Science", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Focus on garment manufacturing, fabric processing, cutting technology and production floor management.",
    "Garment Manufacturing, Textile Mills, Export Units", "₹3 – 6 LPA"),

  c("B.Sc. Nutrition & Dietetics", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Learn clinical nutrition, community nutrition, therapeutic dietetics and sports nutrition.",
    "Hospitals, Wellness Centres, Sports Industry", "₹3 – 6 LPA"),

  c("B.Sc. Food Science & Nutrition / B.Sc. Food Science & Nutrition with CA", "Science", "Degree", "3 Years",
    "12th Standard Pass (Physics, Chemistry, Biology)",
    "Study food chemistry, nutrition science, food processing, quality control with optional CA preparation.",
    "Food Industry, FSSAI, FMCG, Nutrition Counselling", "₹3 – 7 LPA"),

  c("B.Sc. Catering Science & Hotel Management", "Science", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Learn front office, food production, housekeeping, restaurant management and hospitality marketing.",
    "Hotels, Resorts, Cruise Lines, Airlines", "₹3 – 7 LPA"),

  c("B.Sc. Visual Communication & Electronic Media", "Science", "Degree", "3 Years",
    "12th Standard Pass (any stream)",
    "Study photography, filmmaking, advertising, graphic design, multimedia communication and electronic media.",
    "Media Houses, Advertising, Film Industry, Digital Studios", "₹3 – 7 LPA"),
];

// ════════════════════════════════════════════════════════════════════
//  ENGINEERING COURSES (43 including B.Arch.) — Category: Engineering / Architecture
// ════════════════════════════════════════════════════════════════════
const engineeringCourses = [
  c("B.E. Civil Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Learn structural analysis, construction management, geotechnical engineering and transportation.",
    "Construction, Infrastructure, Government PWD", "₹3 – 8 LPA"),

  c("B.E. Environmental Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study waste management, water treatment, air pollution control and environmental impact assessment.",
    "Pollution Control Boards, NGOs, Smart Cities", "₹3.5 – 8 LPA"),

  c("B.E. Geoinformatics Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study GIS, remote sensing, photogrammetry, geodesy and spatial data analysis.",
    "ISRO, Survey of India, Urban Planning, IT-GIS", "₹3.5 – 8 LPA"),

  c("B.E. Agriculture Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Learn farm machinery design, irrigation engineering, food processing and renewable energy for agriculture.",
    "Agriculture Dept, Agri-tech, Farm Mechanisation", "₹3 – 7 LPA"),

  c("B.E. Aeronautical Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study aerodynamics, propulsion, aircraft structures, avionics and flight mechanics.",
    "HAL, ISRO, DRDO, Airlines, Aerospace Companies", "₹4 – 12 LPA"),

  c("B.E. Automobile Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Learn vehicle dynamics, engine design, EV technology, automotive electronics and testing.",
    "Automotive OEMs, EV Start-ups, R&D", "₹3.5 – 10 LPA"),

  c("B.E. Mechanical Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study thermodynamics, fluid mechanics, manufacturing, machine design and robotics.",
    "Automotive, Aerospace, Manufacturing, Energy", "₹3.5 – 10 LPA"),

  c("B.E. Materials Science and Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study advanced materials, composites, smart materials, thin films and materials characterisation.",
    "Aerospace, Defence, Materials R&D, Manufacturing", "₹3.5 – 9 LPA"),

  c("B.E. Manufacturing Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Learn CNC machining, CAD/CAM, lean manufacturing, quality engineering and production systems.",
    "Manufacturing Industry, Quality Assurance, Automation", "₹3.5 – 8 LPA"),

  c("B.E. Production Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study manufacturing processes, industrial engineering, quality control and production planning.",
    "Manufacturing, Quality Assurance, Lean Consulting", "₹3.5 – 8 LPA"),

  c("B.E. Industrial Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Learn operations research, supply chain engineering, ergonomics and systems optimisation.",
    "Manufacturing, Logistics, Consulting, E-commerce", "₹3.5 – 9 LPA"),

  c("B.E. Industrial Engineering and Management", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Blend of industrial engineering with management principles for operations and strategic planning.",
    "Management Consulting, Operations, Manufacturing", "₹3.5 – 9 LPA"),

  c("B.E. Marine Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / IMU CET",
    "Study ship machinery, marine power plants, naval architecture and maritime operations.",
    "Merchant Navy, Shipyards, Port Authorities", "₹6 – 20 LPA"),

  c("B.E. Mechatronics Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Integrate mechanical, electronics and computer engineering for smart manufacturing and robotics.",
    "Robotics, Industry 4.0, Automotive, Automation", "₹4 – 10 LPA"),

  c("B.E. Mechanical and Automation Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Mechanical engineering with automation focus — PLC, SCADA, Industry 4.0 and smart factory design.",
    "Automation, Manufacturing, Automotive, Robotics", "₹4 – 10 LPA"),

  c("B.E. Robotics and Automation", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study robotic kinematics, PLC programming, AI in robotics, autonomous systems and machine vision.",
    "Manufacturing, Defence, Space, Start-ups", "₹4 – 12 LPA"),

  c("B.E. Mechanical Engineering (Sandwich)", "Engineering", "Degree", "4.5 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Mechanical engineering with alternating academic and industry training semesters for hands-on experience.",
    "Core Manufacturing, Automotive, PSUs", "₹3.5 – 10 LPA"),

  c("B.E. Aerospace Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study aerodynamics, propulsion, aircraft structures, avionics and space technology.",
    "ISRO, DRDO, HAL, Airlines, Aerospace Companies", "₹4 – 12 LPA"),

  c("B.E. Electrical and Electronics Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Learn power systems, control systems, electrical machines, power electronics and renewable energy.",
    "Power Sector, Manufacturing, Utilities, PSUs", "₹3.5 – 10 LPA"),

  c("B.E. Electronics and Instrumentation Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study measurement systems, process control, PLCs, SCADA and biomedical instrumentation.",
    "Process Industries, Automation, Medical Devices", "₹3.5 – 8 LPA"),

  c("B.E. Instrumentation and Control Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Learn process control, sensor technology, automation systems and industrial instrumentation.",
    "Process Industries, Automation, Oil & Gas", "₹3.5 – 8 LPA"),

  c("B.E. Electronics and Communication Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study digital electronics, VLSI, signal processing, communication systems and embedded systems.",
    "Telecom, Semiconductor, Defence, IoT, ISRO", "₹3.5 – 12 LPA"),

  c("B.E. Computer Science and Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study programming, data structures, algorithms, OS, DBMS, AI/ML and software engineering.",
    "IT Industry, Product Companies, Start-ups, Research", "₹4 – 20 LPA"),

  c("B.Tech. Information Technology", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Learn networking, web technologies, databases, cloud computing and information security.",
    "IT Services, Networking, Cyber Security, SaaS", "₹4 – 15 LPA"),

  c("B.E. Biomedical Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths/Biology); JEE / TNEA",
    "Blend of engineering and medical science — medical devices, biomechanics and health informatics.",
    "Medical Device Companies, Hospitals, Research", "₹3.5 – 8 LPA"),

  c("B.E. Medical Electronics", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study medical imaging systems, patient monitoring devices, therapeutic equipment and hospital automation.",
    "Medical Equipment OEMs, Hospitals, Diagnostics", "₹3.5 – 8 LPA"),

  c("B.E. Computer and Communication Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Blend of computer science with communication engineering — networking, wireless systems and IoT.",
    "Telecom, IT Companies, Networking Firms", "₹4 – 12 LPA"),

  c("B.E. Electronics and Telecommunication Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study telecommunication systems, optical fibre, satellite communication and mobile network architecture.",
    "Telecom Operators, Broadcasting, ISRO, Defence", "₹3.5 – 10 LPA"),

  c("B.Tech. Chemical Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study process engineering, reaction engineering, thermodynamics and industrial chemical processes.",
    "Petrochemicals, Pharma, Food Processing, ONGC", "₹3.5 – 10 LPA"),

  c("B.Tech. Chemical and Electrochemical Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Chemical engineering with electrochemistry focus — batteries, fuel cells, corrosion and electroplating.",
    "Battery Manufacturing, Energy Storage, Corrosion Engineering", "₹3.5 – 9 LPA"),

  c("B.Tech. Petroleum Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study drilling techniques, reservoir engineering, production optimization and petroleum refining.",
    "ONGC, Reliance, Shell, Schlumberger, IOCL", "₹5 – 15 LPA"),

  c("B.Tech. Petrochemical Technology", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study petrochemical processing, refining technology, polymer production and hydrocarbon chemistry.",
    "IOCL, BPCL, Reliance, Petrochemical Plants", "₹4 – 12 LPA"),

  c("B.E. Petrochemical Engineering", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Engineering approach to petrochemical processes, catalyst design, refinery operations and plant design.",
    "Refineries, Petrochemical Industries, PSUs", "₹4 – 12 LPA"),

  c("B.Tech. Biotechnology", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths/Biology); JEE / TNEA",
    "Study genetic engineering, bioprocess technology, bioinformatics and pharmaceutical biotechnology.",
    "Biotech Firms, Pharma, Agri-biotech, Research", "₹3.5 – 8 LPA"),

  c("B.Tech. Pharmaceutical Technology", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths/Biology); JEE / TNEA",
    "Study drug formulation, pharmaceutical manufacturing, quality control and regulatory compliance.",
    "Pharma Companies, Drug Manufacturing, R&D Labs", "₹4 – 10 LPA"),

  c("B.Tech. Food Technology", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths/Biology); JEE / TNEA",
    "Study food processing, packaging engineering, quality assurance and food plant design.",
    "FMCG, Food Processing Plants, FSSAI, R&D", "₹3.5 – 8 LPA"),

  c("B.Tech. Polymer Technology", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study polymer processing, compounding, mould design and advanced plastics engineering.",
    "Plastic Industry, Packaging, Automotive Polymers", "₹3.5 – 8 LPA"),

  c("B.Tech. Plastics Technology", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study injection moulding, extrusion, blow moulding, plastics testing and recycling technology.",
    "Plastics Industry, Packaging, Automotive Components", "₹3.5 – 8 LPA"),

  c("B.Tech. Textile Technology", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study fibre science, yarn manufacturing, weaving technology and textile processing.",
    "Textile Mills, Fashion Industry, Technical Textiles", "₹3 – 7 LPA"),

  c("B.Tech. Fashion Technology", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Technology-driven approach to fashion — CAD for fashion, garment technology and production engineering.",
    "Fashion Tech Companies, Apparel Manufacturing, Export", "₹3.5 – 8 LPA"),

  c("B.Tech. Textile Chemistry", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Study dyeing, printing, finishing, colour chemistry and chemical processing of textiles.",
    "Textile Chemical Processing, Dye Industry, Quality Labs", "₹3 – 7 LPA"),

  c("B.Tech. Handloom and Textile Technology", "Engineering", "Degree", "4 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); JEE / TNEA",
    "Specialised in handloom weaving technology, traditional textile preservation and modern production methods.",
    "Handloom Sector, Textile Ministry, Cooperative Societies", "₹3 – 6 LPA"),

  c("B.Arch.", "Architecture", "Degree", "5 Years",
    "12th Standard Pass (Physics, Chemistry, Maths); NATA / JEE Paper 2",
    "Study architectural design, building construction, town planning, landscape architecture and building services.",
    "Architecture Firms, Construction, Urban Development", "₹4 – 12 LPA"),
];

// ── Note: Entrepreneur Courses (11) are duplicates of Diploma + Certificate ──
// ── They are not included separately to avoid duplicate entries ──

// ── Export all courses as a single flat array ────────────────────
const allSourceCourses = [
  ...diplomaCourses,
  ...certificationCourses,
  ...artsCourses,
  ...commerceCourses,
  ...managementCourses,
  ...scienceCourses,
  ...engineeringCourses,
];

module.exports = {
  allSourceCourses,
  diplomaCourses,
  certificationCourses,
  artsCourses,
  commerceCourses,
  managementCourses,
  scienceCourses,
  engineeringCourses,
  SOURCE_URL,
  SOURCE_NAME,
  TRAJECTORY,
};
