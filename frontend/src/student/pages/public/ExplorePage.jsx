import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiArrowRight, FiBookOpen, FiSearch, FiBell,
  FiAward, FiCompass, FiTarget, FiTrendingUp, FiFlag,
  FiMapPin, FiLayers, FiCheckCircle, FiStar,
  FiUserCheck, FiBriefcase, FiZap, FiGrid,
  FiShield, FiHelpCircle, FiChevronRight, FiFileText,
  FiLock, FiX, FiCheck, FiCpu, FiMonitor, FiCode
} from 'react-icons/fi'
import { SBadge } from '../../components/ui'

// ── Demo Data for Interactive Academic Advisor ────────────────────────────────
const ADVISOR_DOMAINS = {
  college: [
    {
      id: 'engineering',
      name: 'Engineering & Technology',
      specs: [
        { id: 'cs', name: 'Computer Science & Engineering' },
        { id: 'aids', name: 'Artificial Intelligence & Data Science' },
        { id: 'ece', name: 'Electronics & Communication' },
        { id: 'mech', name: 'Mechanical Engineering' }
      ]
    },
    {
      id: 'arts_science',
      name: 'Arts & Science',
      specs: [
        { id: 'bsc_cs', name: 'B.Sc Computer Science' },
        { id: 'bcom', name: 'B.Com Accounting & Finance' },
        { id: 'bca', name: 'BCA Computer Applications' },
        { id: 'ba_eng', name: 'B.A. English Literature' }
      ]
    },
    {
      id: 'medical_ayush',
      name: 'Medical & Health Sciences',
      specs: [
        { id: 'mbbs', name: 'MBBS / BDS' },
        { id: 'bsms', name: 'BSMS (Siddha Medicine)' },
        { id: 'nursing', name: 'B.Sc Nursing' },
        { id: 'pharmacy', name: 'B.Pharm Pharmacy' }
      ]
    }
  ],
  school: [
    {
      id: 'class10_stream',
      name: 'Class 10 Stream Selection',
      specs: [
        { id: 'bio_math', name: 'Group 1: Physics, Chem, Math, Bio' },
        { id: 'cs_math', name: 'Group 2: Physics, Chem, Math, CS' },
        { id: 'commerce_acc', name: 'Group 3: Commerce, Accountancy, Econ' },
        { id: 'diploma', name: '3-Year Polytechnic Diploma' }
      ]
    }
  ],
  graduate: [
    {
      id: 'pg_specialization',
      name: 'Post-Graduate & Specialization',
      specs: [
        { id: 'mtech', name: 'M.E / M.Tech Data Engineering' },
        { id: 'mba', name: 'MBA Business Analytics / Finance' },
        { id: 'gate', name: 'GATE / PSU Government Exams' },
        { id: 'upsc_tnpsc', name: 'UPSC / TNPSC Civil Services' }
      ]
    }
  ]
}

const ADVISOR_INTERESTS = [
  { id: 'ai_logic', label: 'AI, Coding & Problem Solving' },
  { id: 'data_analytics', label: 'Data Analysis & Research' },
  { id: 'design_ui', label: 'Product Design & Creative Arts' },
  { id: 'management', label: 'Leadership & Business Operations' }
]

const SAMPLE_RESULTS = {
  cs: {
    careers: ['Software Engineer', 'Full Stack Developer', 'Cloud Solutions Architect', 'DevOps Specialist'],
    programs: ['B.E Computer Science & Engineering', 'B.Tech AI & Data Science', 'B.Sc IT'],
    skills: ['Data Structures', 'Python/Java', 'System Design', 'Cloud Computing'],
    outlook: 'High Demand (28% Annual Growth)'
  },
  aids: {
    careers: ['AI Research Engineer', 'Data Scientist', 'Machine Learning Developer', 'NLP Specialist'],
    programs: ['B.Tech AI & Data Science', 'B.Sc Data Analytics', 'M.Sc Data Science'],
    skills: ['Python/R', 'TensorFlow/PyTorch', 'Statistics', 'Deep Learning'],
    outlook: 'Top Growth Sector (35% Annual Growth)'
  },
  ece: {
    careers: ['Embedded Systems Engineer', 'VLSI Design Engineer', 'IoT Specialist', 'Telecom Engineer'],
    programs: ['B.E Electronics & Communication', 'B.E Robotics & Automation'],
    skills: ['C/C++', 'Microcontrollers', 'Circuit Design', 'Signal Processing'],
    outlook: 'Steady High Demand'
  },
  mech: {
    careers: ['Robotics Design Engineer', 'CAD/CAM Specialist', 'Automotive Engineer', 'Industrial Consultant'],
    programs: ['B.E Mechanical Engineering', 'B.E Mechatronics'],
    skills: ['AutoCAD/SolidWorks', 'Thermodynamics', 'Robotics', 'Manufacturing'],
    outlook: 'Core Industry Demand'
  },
  default: {
    careers: ['Domain Consultant', 'Specialized Professional', 'Project Analyst', 'Technical Executive'],
    programs: ['Higher Education Degree Program', 'Specialized Certification'],
    skills: ['Analytical Thinking', 'Problem Solving', 'Domain Expertise'],
    outlook: 'Positive Growth Outlook'
  }
}

// ── 7 Pillars of College Student Academic & Career Progression ──────────────
const COLLEGE_PROGRESSION_CARDS = [
  {
    step: '01',
    num: '1',
    title: '1. College Entry',
    subtitle: 'Campus Discovery & TNEA Cutoffs',
    badge: 'Campus Entry',
    category: 'Admissions & Cutoffs',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    desc: 'Explore 500+ verified Tamil Nadu colleges with TNEA engineering cutoffs, community quotas, campus accreditations, and district registries.',
    tags: ['TNEA Cutoffs', '500+ Colleges', 'District Search'],
    link: '/student/colleges',
    ctaText: 'Explore Colleges',
    color: '#0284c7',
    colorLight: '#e0f2fe',
    icon: FiMapPin
  },
  {
    step: '02',
    num: '2',
    title: '2. Degree Program',
    subtitle: 'Undergraduate, Diploma & Masters',
    badge: 'Degree Discovery',
    category: 'UG, PG & Diploma Courses',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    desc: 'Browse multi-disciplinary degree courses across Engineering, Medicine, Pure Sciences, Commerce, Arts, and Allied Health Sciences.',
    tags: ['Course Curriculums', 'Eligibility Criteria', 'Degree Mapping'],
    link: '/student/courses',
    ctaText: 'Browse Degree Programs',
    color: '#059669',
    colorLight: '#d1fae5',
    icon: FiBookOpen
  },
  {
    step: '03',
    num: '3',
    title: '3. Domain Specialization',
    subtitle: 'Core Disciplines & Emerging Tech',
    badge: 'Specialization',
    category: 'Core & Emerging Tracks',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    desc: 'Deep-dive into high-demand branches like AI & Data Science, Robotics, Cyber Security, Cloud Computing, VLSI, and Bio-Engineering.',
    tags: ['Emerging Tech', 'Niche Electives', 'Industry Certs'],
    link: '/colleges/explorer',
    ctaText: 'View Specializations',
    color: '#7c3aed',
    colorLight: '#ede9fe',
    icon: FiLayers
  },
  {
    step: '04',
    num: '4',
    title: '4. Skill Acquisition',
    subtitle: 'Hands-on Technical & Core Skills',
    badge: 'Skill Mastery',
    category: 'Telemetry Gap Analysis',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    desc: 'Benchmark your acquired abilities against industry benchmarks, identify skill gaps, and build verifiable portfolio projects that recruiters value.',
    tags: ['Skill Gap Engine', 'Practical Projects', 'Tool Mastery'],
    link: '/student/careers',
    ctaText: 'Build In-Demand Skills',
    color: '#ea580c',
    colorLight: '#ffedd5',
    icon: FiZap
  },
  {
    step: '05',
    num: '5',
    title: '5. Career Options',
    subtitle: '200+ Career Paths & Salaries',
    badge: 'Career Scopes',
    category: '200+ Career Directions',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    desc: 'Evaluate transparent salary benchmarks, job growth trajectories, hiring companies, and real-world responsibilities across 200+ verified career pathways.',
    tags: ['Salary Insights', 'Hiring Sectors', 'Job Growth Outlook'],
    link: '/student/careers',
    ctaText: 'Explore Career Paths',
    color: '#2563eb',
    colorLight: '#dbeafe',
    icon: FiBriefcase
  },
  {
    step: '06',
    num: '6',
    title: '6. Academic Advisor',
    subtitle: 'AI Mentorship & Guidance',
    badge: 'Advisory Support',
    category: '1-on-1 Guidance & Chat',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    desc: 'Get real-time AI guidance tuned directly to your degree, branch, and academic year, or connect with senior peer mentors for personalized advice.',
    tags: ['AI Advisor Chat', 'Peer Mentors', 'Adaptive Study Plans'],
    link: '/college/advisor',
    ctaText: 'Consult Academic Advisor',
    color: '#d97706',
    colorLight: '#fef3c7',
    icon: FiUserCheck
  },
  {
    step: '07',
    num: '7',
    title: '7. Personalized Scopes',
    subtitle: 'Scholarships, Grants & Roadmaps',
    badge: 'Financial Aid',
    category: 'Schemes & Learning Roadmaps',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    desc: 'Unlock matched government stipends, trust scholarships, merit financial aid, and structured milestone learning roadmaps customized to your academic profile.',
    tags: ['College Scholarships', 'Eligibility Match', 'Milestone Roadmaps'],
    link: '/student/scholarships',
    ctaText: 'Unlock Scopes & Aid',
    color: '#e11d48',
    colorLight: '#ffe4e6',
    icon: FiAward
  }
]

// ── 6 Pillars of Graduate Progression & Career Advancement ──────────────────
const GRADUATE_PROGRESSION_CARDS = [
  {
    step: '01',
    num: '1',
    title: '1. Degree Completed',
    subtitle: 'Undergraduate & Diploma Baseline',
    badge: 'Degree Baseline',
    category: 'Completed Qualifications',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    desc: 'Consolidate your completed degree credentials, CGPA, and major coursework to assess readiness for high-yield next steps.',
    tags: ['Degree Credentials', 'CGPA Baseline', 'Coursework Audit'],
    link: '/onboarding/graduate',
    ctaText: 'Verify Degree Baseline',
    color: '#1e40af',
    colorLight: '#dbeafe',
    icon: FiAward
  },
  {
    step: '02',
    num: '2',
    title: '2. Skills & Interests',
    subtitle: 'Core Competencies & Diagnostics',
    badge: 'Skill Telemetry',
    category: 'Competency Evaluation',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    desc: 'Assess your acquired technical, analytical, and management competencies through AI diagnostic tests to uncover core strengths and gaps.',
    tags: ['Skill Diagnostics', 'Aptitude Benchmarking', 'Core Strengths'],
    link: '/student/careers',
    ctaText: 'Evaluate Competencies',
    color: '#059669',
    colorLight: '#d1fae5',
    icon: FiZap
  },
  {
    step: '03',
    num: '3',
    title: '3. Career Direction',
    subtitle: 'Industry Sectors & Roles',
    badge: 'Career Mapping',
    category: 'Target Industry Trajectories',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    desc: 'Identify target sectors from IT and Data Science to Core Engineering, Banking, and Civil Services tailored to your graduate background.',
    tags: ['Target Industries', 'Market Salary Trends', 'Growth Trajectories'],
    link: '/student/careers',
    ctaText: 'Explore Career Paths',
    color: '#7c3aed',
    colorLight: '#ede9fe',
    icon: FiBriefcase
  },
  {
    step: '04',
    num: '4',
    title: '4. Competitive Exams (GATE/CAT)',
    subtitle: 'National & State Testing Readiness',
    badge: 'Exam Readiness',
    category: 'GATE, CAT, UPSC, TNPSC',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    desc: 'Access exam registration timelines, syllabus breakdowns, previous cutoff benchmarks, and preparation strategies for national tests.',
    tags: ['GATE / CAT / GRE', 'TNPSC / UPSC', 'Cutoffs & Syllabus'],
    link: '/student/careers',
    ctaText: 'Explore Exam Guides',
    color: '#b45309',
    colorLight: '#fef3c7',
    icon: FiFileText
  },
  {
    step: '05',
    num: '5',
    title: '5. Higher Studies / Upskilling',
    subtitle: 'Masters, PhD & Certifications',
    badge: 'Post-Grad Study',
    category: 'M.Tech, MBA, M.S. & Certs',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    desc: 'Discover verified Post-Graduate programs (M.E/M.Tech, MBA, M.Sc) and industry certifications from AWS, Google, and Microsoft.',
    tags: ['Postgraduate Courses', 'Industry Certs', 'Research Fellowships'],
    link: '/student/colleges/explorer',
    ctaText: 'Discover PG Programs',
    color: '#0284c7',
    colorLight: '#e0f2fe',
    icon: FiBookOpen
  },
  {
    step: '06',
    num: '6',
    title: '6. Professional Placement',
    subtitle: 'Resume Telemetry & Mentorship',
    badge: 'Placement Launch',
    category: 'Job Readiness & Mentors',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    desc: 'Generate an AI-structured resume, practice realistic technical mock interviews, and connect with senior alumni mentors for job referrals.',
    tags: ['Resume Generator', 'Mock Interviews', 'Alumni Mentors'],
    link: '/student/signup',
    ctaText: 'Launch Career Placement',
    color: '#db2777',
    colorLight: '#ffe4e6',
    icon: FiUserCheck
  }
]

function CollegePillarCard({ item }) {
  const [hovered, setHovered] = React.useState(false)
  const Icon = item.icon

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#ffffff',
        borderRadius: 18,
        overflow: 'hidden',
        border: hovered ? `1.5px solid ${item.color}` : '1.5px solid var(--s-border)',
        boxShadow: hovered ? `0 14px 32px rgba(0,0,0,0.12)` : 'var(--s-shadow)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Image Container */}
      <div style={{ position: 'relative', height: 180, width: '100%', overflow: 'hidden', background: '#0f172a' }}>
        <img
          src={item.image}
          alt={item.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 0.5s ease',
            filter: 'brightness(0.92)'
          }}
          loading="lazy"
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.78) 100%)'
        }} />

        {/* Top Badges */}
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            color: '#ffffff',
            fontSize: 11,
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <span style={{ color: item.color }}>{item.step}</span> STAGE
          </span>

          <span style={{
            background: item.colorLight,
            color: item.color,
            fontSize: 11,
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: 16,
            textTransform: 'uppercase'
          }}>
            {item.badge}
          </span>
        </div>

        {/* Bottom category with icon */}
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: 12,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: item.color,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Icon size={16} />
          </div>
          <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
            {item.category}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h4 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 4px', color: 'var(--s-text)' }}>
          {item.title}
        </h4>
        <div style={{ fontSize: 12, fontWeight: 700, color: item.color, marginBottom: 8 }}>
          {item.subtitle}
        </div>
        <p style={{ fontSize: 13, color: 'var(--s-text3)', lineHeight: 1.55, margin: '0 0 14px', flex: 1 }}>
          {item.desc}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {item.tags.map((t, idx) => (
            <span
              key={idx}
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                color: '#475569',
                background: '#f1f5f9',
                padding: '2px 8px',
                borderRadius: 6,
                border: '1px solid #e2e8f0'
              }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Link */}
        <Link
          to={item.link}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 10,
            background: hovered ? item.color : '#f8fafc',
            color: hovered ? '#ffffff' : item.color,
            border: `1.5px solid ${hovered ? item.color : '#e2e8f0'}`,
            fontSize: 12.5,
            fontWeight: 800,
            textDecoration: 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <span>{item.ctaText}</span>
          <FiArrowRight size={15} style={{ transform: hovered ? 'translateX(3px)' : 'none', transition: 'transform 0.2s' }} />
        </Link>
      </div>
    </div>
  )
}

// ── Interactive Feature Cards ────────────────────────────────────────────────
const FEATURE_PREVIEWS = [
  {
    id: 'courses',
    title: 'Explore Courses',
    desc: 'Browse 500+ verified undergraduate, diploma, and postgraduate courses across Tamil Nadu.',
    icon: FiBookOpen,
    color: '#047857',
    bg: '#d1fae5',
    actionType: 'navigate',
    target: '/student/courses'
  },
  {
    id: 'colleges',
    title: 'Explore Colleges',
    desc: 'Filter 500+ Tamil Nadu colleges by district, management type, and accreditation.',
    icon: FiMapPin,
    color: '#1e40af',
    bg: '#dbeafe',
    actionType: 'navigate',
    target: '/student/colleges'
  },
  {
    id: 'careers',
    title: 'Explore Careers',
    desc: 'Discover salary ranges, growth outlook, and skill requirements for 200+ career paths.',
    icon: FiTrendingUp,
    color: '#b45309',
    bg: '#fef3c7',
    actionType: 'navigate',
    target: '/student/careers'
  },
  {
    id: 'advisor',
    title: 'Academic Advisor',
    desc: 'Submit mentorship tickets to verified counselors for personalized guidance.',
    icon: FiUserCheck,
    color: '#6d28d9',
    bg: '#ede9fe',
    actionType: 'demo',
    target: '#advisor-demo'
  },
  {
    id: 'exams',
    title: 'Entrance Exams',
    desc: 'Stay updated with exam registration deadlines, syllabus, and pattern guides.',
    icon: FiFileText,
    color: '#7c3aed',
    bg: '#f3e8ff',
    actionType: 'navigate',
    target: '/student/colleges/cutoff'
  },
  {
    id: 'scholarships',
    title: 'Scholarships',
    desc: 'Centralized alerts for government and private financial aid opportunities.',
    icon: FiBell,
    color: '#059669',
    bg: '#ecfdf5',
    actionType: 'navigate',
    target: '/student/scholarships'
  },
  {
    id: 'recommendations',
    title: 'Personalized Recommendations',
    desc: 'Interest-matching quiz engine generating customized stream and course reports.',
    icon: FiTarget,
    color: '#dc2626',
    bg: '#fee2e2',
    actionType: 'modal',
    target: null
  }
]

// ── 8 Steps of Personalization Workflow ──────────────────────────────────────
const PERSONALIZATION_STEPS = [
  { step: '01', title: 'Create Account', desc: 'Sign up for free in under 60 seconds with basic details.' },
  { step: '02', title: 'Select User Type', desc: 'Choose School Student, College Student, or Graduate stage.' },
  { step: '03', title: 'Complete Academic Profile', desc: 'Add current class, district, subjects, or degree domain.' },
  { step: '04', title: 'Select Degree / Branch', desc: 'Specify your current stream or target qualification.' },
  { step: '05', title: 'Take Profiling Quiz', desc: 'Answer quick questions about your interests and career goals.' },
  { step: '06', title: 'System Evaluates Data', desc: 'Our algorithm maps your responses against career trends.' },
  { step: '07', title: 'Advisor Generates Report', desc: 'View top matching careers, degree courses, and colleges.' },
  { step: '08', title: 'Track & Save Pathways', desc: 'Bookmark choices, earn badges, and track progress on dashboard.' }
]

// ── 8 Account Benefits ───────────────────────────────────────────────────────
const ACCOUNT_BENEFITS = [
  { icon: FiUserCheck, title: 'Save Academic Profile', desc: 'Keep your academic stage, district, and preferences synchronized.' },
  { icon: FiTarget, title: 'Personalized Recommendations', desc: 'Unlock interest-matching quiz results and customized career reports.' },
  { icon: FiStar, title: 'Bookmark Courses & Colleges', desc: 'Save favorite degrees, colleges, and scholarships for instant access.' },
  { icon: FiTrendingUp, title: 'Track Career Interests', desc: 'Monitor high-demand careers, required skills, and salary outlook.' },
  { icon: FiBell, title: 'Real-Time Deadline Alerts', desc: 'Get instant notifications for exam dates, cutoffs, and scholarships.' },
  { icon: FiUserCheck, title: 'Mentorship Ticket Support', desc: 'Ask questions directly to verified academic counselors.' },
  { icon: FiAward, title: 'Gamification & Badges', desc: 'Earn achievement badges, complete daily missions, and track skills.' },
  { icon: FiGrid, title: 'Student Dashboard', desc: 'Access your unified command center for all academic guidance.' }
]

export default function ExplorePage() {
  const navigate = useNavigate()
  
  // Section 2 Journey Tab State
  const [activeJourney, setActiveJourney] = useState('school')

  // Section 4 Demo State
  const [demoStage, setDemoStage] = useState('college')
  const [demoDomainId, setDemoDomainId] = useState('engineering')
  const [demoSpecId, setDemoSpecId] = useState('cs')
  const [demoInterestId, setDemoInterestId] = useState('ai_logic')

  // Modal State for Restricted Features
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [modalFeatureTitle, setModalFeatureTitle] = useState('')

  // Derived Demo Data
  const availableDomains = ADVISOR_DOMAINS[demoStage] || ADVISOR_DOMAINS.college
  const currentDomainObj = availableDomains.find(d => d.id === demoDomainId) || availableDomains[0]
  const currentSpecs = currentDomainObj?.specs || []
  const demoResult = SAMPLE_RESULTS[demoSpecId] || SAMPLE_RESULTS.default

  React.useEffect(() => {
    // Automatically scroll to interactive contents section on load
    const el = document.getElementById('choose-journey')
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth' })
      }, 150)
    }
  }, [])

  const openAuthModal = (title) => {
    setModalFeatureTitle(title)
    setShowAuthModal(true)
  }

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="student-root">
      <div className="explore-page-body">

        {/* ── COMPACT HEADER ── */}
        <section className="s-hero" style={{ padding: '36px 20px 24px', minHeight: 'auto' }}>
          <div className="s-hero-bg" style={{ backgroundImage: 'url(/hero-bg.jpg)' }} />
          <div className="s-hero-overlay" />
          <div className="s-hero-content" style={{ maxWidth: 1040, margin: '0 auto', textAlign: 'center' }}>
            <div className="s-hero-badge s-anim-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <FiCompass size={14} color="#7dd3fc" />
              Interactive Platform Walkthrough & Advisor Simulator
            </div>

            <h1 className="s-anim-up s-d1" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, lineHeight: 1.2, margin: '10px 0 6px' }}>
              Explore Platform Capabilities
            </h1>

            <p className="s-anim-up s-d2" style={{ maxWidth: 700, margin: '0 auto 16px', fontSize: 'clamp(0.9rem, 1.5vw, 1rem)', color: '#cbd5e1', lineHeight: 1.5 }}>
              Select your academic stage below to test-drive features, interactive advisor recommendations, and career discovery.
            </p>
          </div>
        </section>

        {/* ── SECTION 2: CHOOSE YOUR JOURNEY ── */}
        <section className="s-section" id="choose-journey" style={{ background: 'var(--s-bg)' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 20px' }}>
            <div className="s-section-header" style={{ textAlign: 'center', marginBottom: 40 }}>
              <div className="s-section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FiLayers size={14} /> Guided Progression
              </div>
              <h2 className="s-section-title" style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)', margin: '8px 0' }}>
                Choose Your Academic & Career Journey
              </h2>
              <p className="s-section-desc" style={{ maxWidth: 680, margin: '0 auto' }}>
                Click below to preview how the platform guides School Students, College Students, and Graduates step-by-step.
              </p>
            </div>

            {/* Journey Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 36, flexWrap: 'wrap' }}>
              {[
                { id: 'school', label: '🎒 School Student (Class 5–12)', color: '#6d28d9' },
                { id: 'college', label: '🎓 College Student (Degree/Diploma)', color: '#047857' },
                { id: 'graduate', label: '💼 Graduate (Degree Completed)', color: '#1e40af' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveJourney(tab.id)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 30,
                    border: activeJourney === tab.id ? `2px solid ${tab.color}` : '1px solid var(--s-border)',
                    background: activeJourney === tab.id ? tab.color : '#fff',
                    color: activeJourney === tab.id ? '#fff' : 'var(--s-text2)',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: activeJourney === tab.id ? 'var(--s-shadow-md)' : 'none'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Journey Content Panels */}
            {activeJourney === 'school' && (
              <div className="s-anim-up" style={{ background: '#fff', borderRadius: 20, padding: 36, border: '1px solid var(--s-border)', boxShadow: 'var(--s-shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: 'var(--s-text)' }}>
                      Existing School Milestone Journey (Class 5 to 12)
                    </h3>
                    <div style={{ fontSize: 13, color: 'var(--s-text3)', marginTop: 4 }}>
                      Preserved milestone-based guidance routes built specifically for Tamil Nadu school students.
                    </div>
                  </div>
                  <SBadge color="purple">School Pathway</SBadge>
                </div>

                {/* Progression Stepper */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 24 }}>
                  {[
                    { step: 'Class 5', title: 'Curiosity & Basic Skills', desc: 'Gamified logic, drawing, song maker & communication passport.', link: '/student/class5' },
                    { step: 'Class 8', title: 'Subject-to-Stream Pre-Selection', desc: 'Connecting school subjects to future professions & talent exams.', link: '/student/class8' },
                    { step: 'Class 10', title: 'Stream & Diploma Decision', desc: 'Math/Bio vs Commerce vs 3-Year Polytechnic Diploma choice.', link: '/student/class10' },
                    { step: 'Class 12', title: 'Higher Ed & TNEA Cutoffs', desc: 'TNEA Engineering cutoff analyzer, entrance exams & degree finder.', link: '/student/class12' }
                  ].map((st, i) => (
                    <div key={i} style={{ background: 'var(--s-bg)', borderRadius: 14, padding: 20, border: '1px solid var(--s-border)', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', marginBottom: 6 }}>{st.step}</div>
                      <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 6px', color: 'var(--s-text)' }}>{st.title}</h4>
                      <p style={{ fontSize: 13, color: 'var(--s-text3)', lineHeight: 1.5, flex: 1, marginBottom: 16 }}>{st.desc}</p>
                      <Link to={st.link} style={{ fontSize: 13, fontWeight: 700, color: '#6d28d9', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        Explore {st.step} <FiArrowRight size={14} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeJourney === 'college' && (
              <div className="s-anim-up" style={{ background: '#fff', borderRadius: 20, padding: 36, border: '1px solid var(--s-border)', boxShadow: 'var(--s-shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: 'var(--s-text)' }}>
                      College Student Academic & Career Progression
                    </h3>
                    <div style={{ fontSize: 13, color: 'var(--s-text3)', marginTop: 4 }}>
                      Structured roadmap for undergraduate, diploma, and technical certification students.
                    </div>
                  </div>
                  <SBadge color="green">Degree & Specialization</SBadge>
                </div>

                {/* Horizontal Sequence Flow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 12, marginTop: 16 }}>
                  {COLLEGE_PROGRESSION_CARDS.map((item, i) => (
                    <React.Fragment key={i}>
                      <div style={{
                        padding: '8px 14px',
                        borderRadius: 20,
                        background: '#d1fae5',
                        color: '#047857',
                        fontWeight: 800,
                        fontSize: 12.5,
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        <span style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: '#047857',
                          color: '#fff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10.5,
                          fontWeight: 900
                        }}>
                          {i + 1}
                        </span>
                        <span>{item.title.replace(/^\d+\.\s*/, '')}</span>
                      </div>
                      {i < 6 && <FiChevronRight size={16} color="#94a3b8" style={{ flexShrink: 0 }} />}
                    </React.Fragment>
                  ))}
                </div>

                {/* 7 Attractive Image Cards Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 22,
                  marginTop: 24
                }}>
                  {COLLEGE_PROGRESSION_CARDS.map(item => (
                    <CollegePillarCard key={item.step} item={item} />
                  ))}
                </div>

                <div style={{ marginTop: 24, padding: 20, borderRadius: 14, background: 'var(--s-surface2)', fontSize: 14, color: 'var(--s-text2)', lineHeight: 1.6 }}>
                  💡 <strong>College Student Focus:</strong> Evaluate specific degree offerings across 500+ Tamil Nadu colleges, compare specialization branches (e.g. AI&DS vs CS vs ECE), align coursework with industry skill requirements, and consult verified counselors.
                </div>
              </div>
            )}

            {activeJourney === 'graduate' && (
              <div className="s-anim-up" style={{ background: '#fff', borderRadius: 20, padding: 36, border: '1px solid var(--s-border)', boxShadow: 'var(--s-shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: 'var(--s-text)' }}>
                      Graduate Progression & Career Advancement
                    </h3>
                    <div style={{ fontSize: 13, color: 'var(--s-text3)', marginTop: 4 }}>
                      For students who completed their degree and seek higher studies, competitive exams, or industry transitions.
                    </div>
                  </div>
                  <SBadge color="blue">Post-Grad & Industry</SBadge>
                </div>

                {/* Horizontal Sequence Flow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 12, marginTop: 16 }}>
                  {GRADUATE_PROGRESSION_CARDS.map((item, i) => (
                    <React.Fragment key={i}>
                      <div style={{
                        padding: '8px 14px',
                        borderRadius: 20,
                        background: '#dbeafe',
                        color: '#1e40af',
                        fontWeight: 800,
                        fontSize: 12.5,
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        <span style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: '#1e40af',
                          color: '#fff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10.5,
                          fontWeight: 900
                        }}>
                          {i + 1}
                        </span>
                        <span>{item.title.replace(/^\d+\.\s*/, '')}</span>
                      </div>
                      {i < 5 && <FiChevronRight size={16} color="#94a3b8" style={{ flexShrink: 0 }} />}
                    </React.Fragment>
                  ))}
                </div>

                {/* 6 Attractive Image Cards Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 22,
                  marginTop: 24
                }}>
                  {GRADUATE_PROGRESSION_CARDS.map(item => (
                    <CollegePillarCard key={item.step} item={item} />
                  ))}
                </div>

                <div style={{ marginTop: 24, padding: 20, borderRadius: 14, background: 'var(--s-surface2)', fontSize: 14, color: 'var(--s-text2)', lineHeight: 1.6 }}>
                  🚀 <strong>Graduate Focus:</strong> Discover Post-Graduate specialization degrees, access competitive exam patterns (GATE, CAT, UPSC, TNPSC), explore tech certifications, and request personalized mentorship for career shifts.
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── SECTION 3: INTERACTIVE FEATURE PREVIEW ── */}
        <section className="s-section" id="feature-previews" style={{ background: 'var(--s-surface)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            <div className="s-section-header" style={{ textAlign: 'center', marginBottom: 44 }}>
              <div className="s-section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FiZap size={14} /> Live Feature Preview
              </div>
              <h2 className="s-section-title" style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)', margin: '8px 0' }}>
                Test-Drive Core Platform Capabilities
              </h2>
              <p className="s-section-desc" style={{ maxWidth: 680, margin: '0 auto' }}>
                Public data features can be explored immediately. Personalized features explain why account creation is useful.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {FEATURE_PREVIEWS.map(fp => {
                const IconComp = fp.icon
                return (
                  <div
                    key={fp.id}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--s-border)',
                      borderRadius: 18,
                      padding: 24,
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: 'var(--s-shadow)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: fp.bg, color: fp.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconComp size={22} />
                      </div>
                      {fp.actionType === 'modal' ? (
                        <span style={{ fontSize: 11, fontWeight: 700, background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FiLock size={11} /> Requires Account
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 700, background: fp.bg, color: fp.color, padding: '4px 10px', borderRadius: 12 }}>
                          Public Access
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px', color: 'var(--s-text)' }}>{fp.title}</h4>
                    <p style={{ fontSize: 13, color: 'var(--s-text3)', lineHeight: 1.55, flex: 1, marginBottom: 20 }}>{fp.desc}</p>

                    {fp.actionType === 'navigate' && (
                      <Link to={fp.target} style={{ textDecoration: 'none', fontSize: 14, fontWeight: 700, color: fp.color, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        Launch Live View <FiArrowRight size={15} />
                      </Link>
                    )}

                    {fp.actionType === 'demo' && (
                      <button onClick={() => scrollToSection('advisor-demo')} style={{ background: 'none', border: 'none', padding: 0, fontSize: 14, fontWeight: 700, color: fp.color, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        Try Interactive Demo <FiArrowRight size={15} />
                      </button>
                    )}

                    {fp.actionType === 'modal' && (
                      <button onClick={() => openAuthModal(fp.title)} style={{ background: 'none', border: 'none', padding: 0, fontSize: 14, fontWeight: 700, color: fp.color, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        Preview Feature Info <FiLock size={14} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── SECTION 4: INTERACTIVE ACADEMIC ADVISOR DEMO ── */}
        <section className="s-section" id="advisor-demo" style={{ background: '#0c1520', color: '#fff' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 20px' }}>
            <div className="s-section-header" style={{ textAlign: 'center', marginBottom: 44 }}>
              <div className="s-section-tag" style={{ background: 'rgba(125, 211, 252, 0.1)', color: '#7dd3fc' }}>
                <FiUserCheck size={14} /> Interactive Live Demonstration
              </div>
              <h2 className="s-section-title" style={{ color: '#fff', fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)', margin: '8px 0' }}>
                Academic Advisor Recommendation Simulator
              </h2>
              <p className="s-section-desc" style={{ color: '#94a3b8', maxWidth: 680, margin: '0 auto' }}>
                Test how our intelligence engine evaluates stage, domain, specialization, and interest to suggest career directions. (No account needed for this preview).
              </p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 24,
              padding: '36px 28px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 36
            }}>
              {/* Left Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Step 1: Stage */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#7dd3fc', letterSpacing: '0.06em' }}>
                    1. Select Student Stage
                  </label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {[
                      { id: 'school', label: 'School' },
                      { id: 'college', label: 'College' },
                      { id: 'graduate', label: 'Graduate' }
                    ].map(stg => (
                      <button
                        key={stg.id}
                        onClick={() => {
                          setDemoStage(stg.id)
                          const doms = ADVISOR_DOMAINS[stg.id] || []
                          if (doms[0]) {
                            setDemoDomainId(doms[0].id)
                            if (doms[0].specs[0]) setDemoSpecId(doms[0].specs[0].id)
                          }
                        }}
                        style={{
                          flex: 1, padding: '10px 14px', borderRadius: 10,
                          border: demoStage === stg.id ? '2px solid #7dd3fc' : '1px solid rgba(255,255,255,0.15)',
                          background: demoStage === stg.id ? '#7dd3fc' : 'rgba(255,255,255,0.05)',
                          color: demoStage === stg.id ? '#0c1520' : '#fff',
                          fontWeight: 800, fontSize: 13, cursor: 'pointer'
                        }}
                      >
                        {stg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Domain */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#7dd3fc', letterSpacing: '0.06em' }}>
                    2. Select Academic Domain
                  </label>
                  <select
                    value={demoDomainId}
                    onChange={(e) => {
                      setDemoDomainId(e.target.value)
                      const dom = availableDomains.find(d => d.id === e.target.value)
                      if (dom && dom.specs[0]) setDemoSpecId(dom.specs[0].id)
                    }}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff', fontSize: 14, fontWeight: 700, marginTop: 8
                    }}
                  >
                    {availableDomains.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Step 3: Specialization */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#7dd3fc', letterSpacing: '0.06em' }}>
                    3. Select Branch / Specialization
                  </label>
                  <select
                    value={demoSpecId}
                    onChange={(e) => setDemoSpecId(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff', fontSize: 14, fontWeight: 700, marginTop: 8
                    }}
                  >
                    {currentSpecs.map(sp => (
                      <option key={sp.id} value={sp.id}>{sp.name}</option>
                    ))}
                  </select>
                </div>

                {/* Step 4: Interest Focus */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#7dd3fc', letterSpacing: '0.06em' }}>
                    4. Select Core Interest
                  </label>
                  <select
                    value={demoInterestId}
                    onChange={(e) => setDemoInterestId(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff', fontSize: 14, fontWeight: 700, marginTop: 8
                    }}
                  >
                    {ADVISOR_INTERESTS.map(int => (
                      <option key={int.id} value={int.id}>{int.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Sample Output */}
              <div style={{ background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc' }}>
                    Sample Advisor Analysis
                  </div>
                  <span style={{ fontSize: 10, background: 'rgba(125,211,252,0.15)', color: '#7dd3fc', padding: '3px 8px', borderRadius: 10, fontWeight: 700 }}>
                    Demonstration Preview
                  </span>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Target Career Directions:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {demoResult.careers.map((c, i) => (
                      <span key={i} style={{ background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                        🎯 {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Recommended Academic Programs:</div>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
                    {demoResult.programs.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Key Skill Acquisition Focus:</div>
                  <div style={{ fontSize: 13, color: '#7dd3fc', fontWeight: 700, marginTop: 4 }}>
                    {demoResult.skills.join(' • ')}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Market Demand Outlook:</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#4ade80' }}>{demoResult.outlook}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 5: HOW PERSONALIZATION WORKS ── */}
        <section className="s-section" id="how-personalization-works" style={{ background: 'var(--s-bg)' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 20px' }}>
            <div className="s-section-header" style={{ textAlign: 'center', marginBottom: 44 }}>
              <div className="s-section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FiTarget size={14} /> Personalization Pipeline
              </div>
              <h2 className="s-section-title" style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)', margin: '8px 0' }}>
                How Personalization Works
              </h2>
              <p className="s-section-desc" style={{ maxWidth: 680, margin: '0 auto' }}>
                Our 8-step profiling process turns your academic stage and preferences into custom recommendations.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
              {PERSONALIZATION_STEPS.map((ps, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid var(--s-border)', borderRadius: 16, padding: 22, boxShadow: 'var(--s-shadow)' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--s-primary)', opacity: 0.8, marginBottom: 8 }}>
                    {ps.step}
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 6px', color: 'var(--s-text)' }}>
                    {ps.title}
                  </h4>
                  <p style={{ fontSize: 13, color: 'var(--s-text3)', lineHeight: 1.5, margin: 0 }}>
                    {ps.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 6: WHY CREATE AN ACCOUNT? ── */}
        <section className="s-section" id="why-account" style={{ background: 'var(--s-surface)' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 20px' }}>
            <div className="s-section-header" style={{ textAlign: 'center', marginBottom: 44 }}>
              <div className="s-section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FiStar size={14} /> Account Benefits
              </div>
              <h2 className="s-section-title" style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)', margin: '8px 0' }}>
                Why Create a Free Account?
              </h2>
              <p className="s-section-desc" style={{ maxWidth: 680, margin: '0 auto' }}>
                Creating an account unlocks saved profiles, personalized recommendation reports, and your student dashboard.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24, marginBottom: 40 }}>
              {ACCOUNT_BENEFITS.map((ben, i) => {
                const IconComp = ben.icon
                return (
                  <div key={i} style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)', borderRadius: 16, padding: 24, display: 'flex', gap: 16 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--s-primary-l)', color: 'var(--s-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IconComp size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px', color: 'var(--s-text)' }}>{ben.title}</h4>
                      <p style={{ fontSize: 13, color: 'var(--s-text3)', lineHeight: 1.5, margin: 0 }}>{ben.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link to="/student/signup" className="s-btn s-btn-lg s-btn-white" style={{ background: 'var(--s-primary)', color: '#fff', textDecoration: 'none', display: 'inline-flex' }}>
                Create Your Free Account Now <FiArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── RESTRICTED FEATURE MODAL ── */}
        {showAuthModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(12, 21, 32, 0.75)', backdropFilter: 'blur(6px)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}>
            <div style={{ background: '#fff', borderRadius: 24, padding: 36, maxWidth: 480, width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', position: 'relative' }}>
              <button
                onClick={() => setShowAuthModal(false)}
                style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--s-text3)' }}
              >
                <FiX size={22} />
              </button>

              <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <FiLock size={26} />
              </div>

              <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 10px' }}>
                Account Required for {modalFeatureTitle || 'This Feature'}
              </h3>

              <p style={{ fontSize: 14, color: 'var(--s-text3)', lineHeight: 1.6, marginBottom: 24 }}>
                Personalized recommendations, saved courses, and student dashboard tracking require a free student account to securely save your preferences.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link to="/student/signup" className="s-btn s-btn-lg s-btn-white" style={{ background: 'var(--s-primary)', color: '#fff', justifyContent: 'center', textDecoration: 'none' }}>
                  Create Free Account <FiArrowRight size={16} />
                </Link>
                <Link to="/student/signin" className="s-btn s-btn-lg s-btn-ghost" style={{ justifyContent: 'center', textDecoration: 'none' }}>
                  Already have an account? Sign In
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
