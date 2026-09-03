import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { courseService } from '../../services'
import {
  FiArrowRight, FiBookOpen, FiSearch, FiBell,
  FiAward, FiVolume2, FiVolumeX, FiPlus, FiMinus, FiType,
  FiCompass, FiTarget, FiTrendingUp, FiFlag,
  FiMapPin, FiLayers, FiCheckCircle, FiStar,
  FiUserCheck, FiBriefcase, FiZap, FiGrid,
  FiShield, FiHelpCircle, FiChevronRight, FiFileText
} from 'react-icons/fi'
import { SLoader, SBadge } from '../../components/ui'

// ── 7 Pillars of Academic & Career Progression ──────────────────────────────
const COLLEGE_JOURNEY_PILLARS = [
  {
    step: '01',
    title: 'College Entry',
    subtitle: 'Admission Gateways & Campus Discovery',
    badge: 'Campus Entry',
    category: 'Admissions & TNEA Cutoffs',
    color: '#0284c7',
    colorLight: '#e0f2fe',
    glowColor: 'rgba(2, 132, 199, 0.22)',
    icon: FiMapPin,
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    description: 'Explore 500+ verified colleges across Tamil Nadu with government TNEA cutoffs, community quotas, campus accreditations, and district registries.',
    tags: ['TNEA Cutoffs', '500+ Colleges', 'District Registry'],
    ctaText: 'Explore Colleges',
    link: '/student/colleges'
  },
  {
    step: '02',
    title: 'Degree Program',
    subtitle: 'Academic Disciplines & Qualifications',
    badge: 'Degree Programs',
    category: 'UG, PG & Diploma Courses',
    color: '#059669',
    colorLight: '#d1fae5',
    glowColor: 'rgba(5, 150, 105, 0.22)',
    icon: FiBookOpen,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    description: 'Discover multi-disciplinary degree courses spanning Engineering, Medicine, Pure Sciences, Commerce, Arts, and Allied Health Sciences.',
    tags: ['Course Mappings', 'Curriculums', 'Eligibility Criteria'],
    ctaText: 'Browse Degree Programs',
    link: '/student/courses'
  },
  {
    step: '03',
    title: 'Domain Specialization',
    subtitle: 'Niche Branches & Future Tech',
    badge: 'Specialization',
    category: 'Core & Emerging Tracks',
    color: '#7c3aed',
    colorLight: '#ede9fe',
    glowColor: 'rgba(124, 58, 237, 0.22)',
    icon: FiLayers,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    description: 'Deep-dive into high-impact specializations from AI, Data Science, and Cyber Security to Robotics, Cloud Infrastructure, and Bio-Technology.',
    tags: ['Emerging Tech', 'Specialized Electives', 'Industry Certs'],
    ctaText: 'View Specializations',
    link: '/explore'
  },
  {
    step: '04',
    title: 'Skill Acquisition',
    subtitle: 'Hands-on Technical & Core Skills',
    badge: 'Skill Mastery',
    category: 'Telemetry Gap Analysis',
    color: '#ea580c',
    colorLight: '#ffedd5',
    glowColor: 'rgba(234, 88, 12, 0.22)',
    icon: FiZap,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    description: 'Benchmark your acquired abilities against industry benchmarks, identify skill gaps, and build verifiable portfolio projects that recruiters value.',
    tags: ['Skill Gap Engine', 'Practical Projects', 'Tool Mastery'],
    ctaText: 'Build In-Demand Skills',
    link: '/student/careers'
  },
  {
    step: '05',
    title: 'Career Options',
    subtitle: 'Market Demands & Salary Insights',
    badge: 'Career Scopes',
    category: '200+ Career Directions',
    color: '#2563eb',
    colorLight: '#dbeafe',
    glowColor: 'rgba(37, 99, 235, 0.22)',
    icon: FiBriefcase,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    description: 'Evaluate transparent salary benchmarks, job growth trajectories, hiring companies, and real-world responsibilities across 200+ verified career pathways.',
    tags: ['Salary Benchmarks', 'Hiring Sectors', 'Job Growth Outlook'],
    ctaText: 'Explore Career Paths',
    link: '/student/careers'
  },
  {
    step: '06',
    title: 'Academic Advisor',
    subtitle: 'AI-Powered Direction & Mentorship',
    badge: 'Advisory Support',
    category: '1-on-1 Guidance & Chat',
    color: '#d97706',
    colorLight: '#fef3c7',
    glowColor: 'rgba(217, 119, 6, 0.22)',
    icon: FiUserCheck,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    description: 'Get real-time AI guidance tuned directly to your degree, branch, and academic year, or connect with senior peer mentors for personalized advice.',
    tags: ['AI Advisor Chat', 'Peer Mentors', 'Adaptive Study Plans'],
    ctaText: 'Consult Academic Advisor',
    link: '/explore'
  },
  {
    step: '07',
    title: 'Personalized Scopes',
    subtitle: 'Scholarships, Grants & Future Horizons',
    badge: 'Financial Aid',
    category: 'Schemes & Learning Roadmaps',
    color: '#e11d48',
    colorLight: '#ffe4e6',
    glowColor: 'rgba(225, 29, 72, 0.22)',
    icon: FiAward,
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    description: 'Unlock matched government stipends, trust scholarships, merit financial aid, and long-term learning roadmaps customized to your academic profile.',
    tags: ['College Scholarships', 'Eligibility Match', 'Milestone Roadmaps'],
    ctaText: 'Unlock Scopes & Aid',
    link: '/student/scholarships'
  }
]

// ── 3 User Type Audiences ───────────────────────────────────────────────────
const USER_TYPES = [
  {
    key: 'school',
    title: 'School Student',
    subtitle: 'Class 5 to Class 12',
    badge: 'School Guidance',
    accentColor: '#6d28d9',
    accentBg: '#ede9fe',
    icon: FiCompass,
    desc: 'Foundational curiosity, subject-to-stream connection, Class 10 stream selection, and Class 12 college & cutoff preparation.',
    points: [
      'Class 5, 8, 10, 12 Milestone Guidance',
      'Gamified Logic & Communication Activities',
      'TNEA Engineering Cutoffs & Quota Data',
      'Entrance Exam & Scholarship Alerts'
    ],
    ctaText: 'Explore School Pathways',
    ctaLink: '/student/careers'
  },
  {
    key: 'college',
    title: 'College Student',
    subtitle: 'Degree, Diploma & Certification',
    badge: 'Higher Education',
    accentColor: '#047857',
    accentBg: '#d1fae5',
    icon: FiBookOpen,
    desc: 'Identify core academic domains, explore degree specializations, evaluate career options, and align skills with industry requirements.',
    points: [
      '500+ Verified Colleges & Course Mappings',
      'Specialization Branch Deep-Dives',
      'Career Scopes & Real-World Salary Trends',
      'Academic Advising & Mentor Requests'
    ],
    ctaText: 'Explore Degree Programs',
    ctaLink: '/student/courses'
  },
  {
    key: 'graduate',
    title: 'Graduate',
    subtitle: 'Degree Completed',
    badge: 'Career & Post-Grad',
    accentColor: '#1e40af',
    accentBg: '#dbeafe',
    icon: FiBriefcase,
    desc: 'Navigate career transitions, discover post-graduate options, prepare for competitive exams, and find specialized upskilling pathways.',
    points: [
      'Post-Graduate & Certification Discovery',
      'Competitive Exam Readiness (GATE, CAT, TNPSC)',
      'Professional Career Transitions',
      '1-on-1 Academic Advisor Support'
    ],
    ctaText: 'Explore Graduate Guidance',
    ctaLink: '/student/colleges/explorer'
  }
]

// ── 10 Key Features ─────────────────────────────────────────────────────────
const ALL_FEATURES = [
  {
    icon: FiCompass,
    title: 'Academic Guidance',
    desc: 'Step-by-step milestone roadmaps tailored for Class 5, 8, 10, 12, college, and graduate transitions.',
    color: '#6d28d9',
    bg: '#ede9fe'
  },
  {
    icon: FiBookOpen,
    title: 'Course & Degree Discovery',
    desc: 'Browse 500+ verified undergraduate, diploma, and postgraduate courses with eligibility details.',
    color: '#047857',
    bg: '#d1fae5'
  },
  {
    icon: FiMapPin,
    title: 'College Discovery',
    desc: 'Comprehensive registry of Tamil Nadu colleges filterable by district, management type, and accreditation.',
    color: '#1e40af',
    bg: '#dbeafe'
  },
  {
    icon: FiTrendingUp,
    title: 'Career Exploration',
    desc: 'Real-world data on career directions, job growth outlook, industry demands, and salary ranges.',
    color: '#b45309',
    bg: '#fef3c7'
  },
  {
    icon: FiUserCheck,
    title: 'Academic Advisor',
    desc: 'Direct mentorship ticket system for personalized guidance from verified counselors.',
    color: '#0ea5e9',
    bg: '#e0f2fe'
  },
  {
    icon: FiTarget,
    title: 'Personalized Recommendations',
    desc: 'Smart interest-profiling quiz matching student strengths to ideal academic and career paths.',
    color: '#dc2626',
    bg: '#fee2e2'
  },
  {
    icon: FiFileText,
    title: 'Entrance Exams',
    desc: 'Real-time alert tracker for national and state entrance exams with syllabus and deadlines.',
    color: '#7c3aed',
    bg: '#f3e8ff'
  },
  {
    icon: FiBell,
    title: 'Scholarships',
    desc: 'Centralized repository of government and private scholarships with eligibility matching.',
    color: '#059669',
    bg: '#ecfdf5'
  },
  {
    icon: FiLayers,
    title: 'Career Pathways',
    desc: 'Visual progression maps connecting school subjects to college degrees and industry roles.',
    color: '#2563eb',
    bg: '#eff6ff'
  },
  {
    icon: FiAward,
    title: 'Student Progress',
    desc: 'Gamified achievement badges, daily missions, skill progress, and saved bookmarks.',
    color: '#d97706',
    bg: '#fffbeb'
  }
]

// ── How It Works Steps ──────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Choose Your Academic Stage',
    desc: 'Select whether you are a School Student (Class 5-12), College Student, or Graduate.'
  },
  {
    step: '02',
    title: 'Explore Curated Pathways',
    desc: 'Search verified catalogs of 500+ courses, Tamil Nadu colleges, cutoff trends, and scholarships.'
  },
  {
    step: '03',
    title: 'Get Personalized Guidance',
    desc: 'Take our interest-profiling assessment to receive customized recommendations and mentor support.'
  },
  {
    step: '04',
    title: 'Achieve Your Goals',
    desc: 'Track your milestone progress, stay updated with real-time deadline alerts, and launch your career.'
  }
]

const STATS = [
  { value: '50,000+', label: 'Students Guided' },
  { value: '500+', label: 'Verified Colleges' },
  { value: '200+', label: 'Career Pathways' },
  { value: '100%', label: 'Free & Transparent' }
]

// ── Accessibility Toolbar Component ────────────────────────────────────────
function AccessibilityBar() {
  const [speaking, setSpeaking] = useState(false)
  const [fontScale, setFontScale] = useState(1)
  const [showPanel, setShowPanel] = useState(false)
  const synthRef = useRef(window.speechSynthesis)

  const stopSpeech = () => {
    if (synthRef.current) synthRef.current.cancel()
    setSpeaking(false)
  }

  const readPage = () => {
    if (!synthRef.current) return
    if (speaking) { stopSpeech(); return }
    synthRef.current.cancel()
    const text = document.querySelector('.public-landing-body')?.innerText || document.body.innerText
    const chunks = text.match(/.{1,200}(\s|$)/g) || [text]
    let i = 0
    const speakNext = () => {
      if (i >= chunks.length) { setSpeaking(false); return }
      const utt = new SpeechSynthesisUtterance(chunks[i++])
      utt.lang = 'en-IN'; utt.rate = 0.95; utt.pitch = 1
      utt.onend = speakNext; utt.onerror = () => setSpeaking(false)
      synthRef.current.speak(utt)
    }
    setSpeaking(true); speakNext()
  }

  const changeFontSize = (delta) => {
    setFontScale(prev => {
      const next = Math.min(1.4, Math.max(0.85, prev + delta))
      document.querySelector('.student-root')?.style.setProperty('--s-font-scale', next)
      return next
    })
  }

  useEffect(() => () => { if (synthRef.current) synthRef.current.cancel() }, [])

  return (
    <div className="s-a11y-bar" role="toolbar" aria-label="Accessibility tools">
      <button className={`s-a11y-btn ${speaking ? 'active' : ''}`} onClick={readPage} title={speaking ? 'Stop reading' : 'Read page aloud'}>
        {speaking ? <FiVolumeX size={15} /> : <FiVolume2 size={15} />}
        {speaking ? 'Stop Speech' : 'Listen to Page'}
      </button>
      <button className="s-a11y-btn" onClick={() => setShowPanel(p => !p)} title="Text size controls">
        <FiType size={15} /> Text Size
      </button>
      {showPanel && (
        <div className="s-a11y-panel s-anim-down">
          <div className="s-a11y-label">Font Scale ({Math.round(fontScale * 100)}%)</div>
          <button className="s-a11y-btn" onClick={() => changeFontSize(0.1)} style={{ justifyContent: 'center' }}><FiPlus size={14} /> Increase</button>
          <button className="s-a11y-btn" onClick={() => changeFontSize(-0.1)} style={{ justifyContent: 'center' }}><FiMinus size={14} /> Decrease</button>
          <button className="s-a11y-btn" onClick={() => changeFontSize(1 - fontScale)} style={{ justifyContent: 'center', fontSize: 12 }}>Reset</button>
        </div>
      )}
    </div>
  )
}

// ── Interactive 7-Pillars Journey Card Component ─────────────────────────────
function JourneyCard({ item, index }) {
  const [hovered, setHovered] = useState(false)
  const Icon = item.icon

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#ffffff',
        borderRadius: 22,
        overflow: 'hidden',
        border: hovered ? `1.5px solid ${item.color}` : '1.5px solid var(--s-border)',
        boxShadow: hovered
          ? `0 20px 42px ${item.glowColor}, 0 6px 14px rgba(0,0,0,0.06)`
          : 'var(--s-shadow)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Card Image Container */}
      <div style={{ position: 'relative', height: 215, width: '100%', overflow: 'hidden', background: '#0b1329' }}>
        <img
          src={item.image}
          alt={item.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: 'brightness(0.92)'
          }}
          loading="lazy"
        />
        {/* Soft vignette gradient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(11,19,41,0.2) 0%, rgba(11,19,41,0.78) 100%)'
        }} />

        {/* Step Badge (Top-Left) */}
        <div style={{
          position: 'absolute',
          top: 14,
          left: 14,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          color: '#ffffff',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.06em',
          padding: '4px 10px',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.18)'
        }}>
          <span style={{ color: item.color, fontWeight: 900 }}>{item.step}</span>
          <span style={{ opacity: 0.85 }}>STAGE</span>
        </div>

        {/* Category Pill (Top-Right) */}
        <div style={{
          position: 'absolute',
          top: 14,
          right: 14,
          background: item.colorLight,
          color: item.color,
          fontSize: 11,
          fontWeight: 800,
          padding: '4px 11px',
          borderRadius: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          {item.badge}
        </div>

        {/* Floating Category in Image Bottom */}
        <div style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          right: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: item.color,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 14px ${item.color}66`,
            flexShrink: 0
          }}>
            <Icon size={19} />
          </div>
          <div style={{ color: '#ffffff', fontSize: 12.5, fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
            {item.category}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{
          fontSize: 20,
          fontWeight: 900,
          color: 'var(--s-text)',
          margin: '0 0 4px',
          fontFamily: 'var(--s-font-display)',
          lineHeight: 1.25
        }}>
          {item.title}
        </h3>

        <div style={{
          fontSize: 12.5,
          fontWeight: 700,
          color: item.color,
          marginBottom: 10
        }}>
          {item.subtitle}
        </div>

        <p style={{
          fontSize: 13.5,
          color: 'var(--s-text3)',
          lineHeight: 1.6,
          margin: '0 0 16px',
          flex: 1
        }}>
          {item.description}
        </p>

        {/* Highlight Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
          {item.tags.map((tag, tIdx) => (
            <span
              key={tIdx}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#475569',
                background: '#f1f5f9',
                padding: '3px 9px',
                borderRadius: 8,
                border: '1px solid #e2e8f0'
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA Link */}
        <Link
          to={item.link}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '11px 16px',
            borderRadius: 12,
            background: hovered ? item.color : '#f8fafc',
            color: hovered ? '#ffffff' : item.color,
            border: `1.5px solid ${hovered ? item.color : '#e2e8f0'}`,
            fontSize: 13,
            fontWeight: 800,
            textDecoration: 'none',
            transition: 'all 0.25s ease'
          }}
        >
          <span>{item.ctaText}</span>
          <FiArrowRight
            size={16}
            style={{
              transform: hovered ? 'translateX(4px)' : 'translateX(0)',
              transition: 'transform 0.25s ease'
            }}
          />
        </Link>
      </div>
    </div>
  )
}

// ── Main Common Public Landing Page ──────────────────────────────────────────
export default function CommonPublicLandingPage() {
  const { isAuthenticated } = useStudentAuth()
  const navigate = useNavigate()
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  useEffect(() => {
    courseService.getAll()
      .then(res => {
        const list = Array.isArray(res) ? res : (res.data || [])
        setFeaturedCourses(list.slice(0, 4))
      })
      .catch(() => setFeaturedCourses([]))
      .finally(() => setLoadingCourses(false))
  }, [])

  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const id = hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }, [window.location.hash])

  return (
    <div className="student-root">
      <div className="public-landing-body">

        {/* ── HERO SECTION ── */}
        <section className="s-hero" id="home">
          <div className="s-hero-bg" style={{ backgroundImage: 'url(/hero-bg.jpg)' }} />
          <div className="s-hero-overlay" />
          <div className="s-hero-content" style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
            <div className="s-hero-badge s-anim-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <FiZap size={14} color="#7dd3fc" />
              Unified Academic & Career Guidance Platform
            </div>
            
            <h1 className="s-anim-up s-d1" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 900, lineHeight: 1.15, margin: '16px 0' }}>
              Your Academic Journey.<br />
              <span style={{ color: '#7dd3fc' }}>Your Career Direction.</span>
            </h1>
            
            <p className="s-anim-up s-d2" style={{ maxWidth: 780, margin: '0 auto 32px', fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#cbd5e1', lineHeight: 1.6 }}>
              Comprehensive guidance ecosystem for School Students (Class 5–12), College Students, and Graduates across Tamil Nadu. Discover degree programs, TNEA cutoffs, entrance exams, scholarships, and personalized career pathways.
            </p>

            <div className="s-hero-actions s-anim-up s-d3" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {isAuthenticated ? (
                <>
                  <Link to="/student/dashboard" className="s-btn s-btn-lg s-btn-white" style={{ textDecoration: 'none', background: '#7dd3fc', color: '#0c1520', fontWeight: 900 }}>
                    <FiGrid size={18} /> Go to My Dashboard →
                  </Link>
                  <Link to="/explore" className="s-btn s-btn-lg s-btn-outline" style={{ textDecoration: 'none' }}>
                    <FiCompass size={18} /> Explore Platform Features
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/explore" className="s-btn s-btn-lg s-btn-white" style={{ textDecoration: 'none' }}>
                    <FiCompass size={18} /> Explore the Platform
                  </Link>
                  <Link to="/student/signup" className="s-btn s-btn-lg s-btn-outline" style={{ textDecoration: 'none' }}>
                    Create Free Account <FiArrowRight size={18} />
                  </Link>
                </>
              )}
            </div>

            {!isAuthenticated ? (
              <div className="s-anim-up s-d4" style={{ marginTop: 20, fontSize: 14, color: '#94a3b8' }}>
                Already have an account? <Link to="/student/signin" style={{ color: '#7dd3fc', fontWeight: 700, textDecoration: 'none' }}>Sign In here</Link>
              </div>
            ) : (
              <div className="s-anim-up s-d4" style={{ marginTop: 20, fontSize: 14, color: '#7dd3fc', fontWeight: 700 }}>
                ✓ Logged in as Student. Your personalized academic telemetry is active on your Dashboard.
              </div>
            )}
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section className="s-stats-bar">
          <div className="s-stats-grid" style={{ maxWidth: 1160, margin: '0 auto' }}>
            {STATS.map((s, i) => (
              <div key={i} className="s-stat-item">
                <div className="s-stat-value">{s.value}</div>
                <div className="s-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7 PILLARS OF ACADEMIC & CAREER PROGRESSION SECTION ── */}
        <section className="s-section" id="journey" style={{ background: '#f8fafc', padding: '80px 0', borderBottom: '1px solid var(--s-border)' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px' }}>
            
            {/* Section Header */}
            <div className="s-section-header s-anim-up" style={{ textAlign: 'center', marginBottom: 44 }}>
              <div className="s-section-tag" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#d1fae5',
                color: '#047857',
                fontWeight: 800,
                fontSize: 12,
                padding: '5px 14px',
                borderRadius: 20
              }}>
                <FiCompass size={14} /> Higher Education & Career Blueprint
              </div>

              <h2 className="s-section-title" style={{ fontSize: 'clamp(2rem, 3.8vw, 2.75rem)', margin: '14px 0 10px', fontWeight: 900 }}>
                From College Entry to Personalized Scopes
              </h2>

              <p className="s-section-desc" style={{ maxWidth: 740, margin: '0 auto', fontSize: 15, color: 'var(--s-text2)' }}>
                Navigate every milestone of your higher education journey. Explore verified colleges, evaluate degrees, sharpen domain skills, and unlock custom career pathways and scholarships.
              </p>

              {/* Interactive Stage Sequence Flow */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: 6,
                padding: '10px 18px',
                background: '#ffffff',
                borderRadius: 30,
                border: '1px solid var(--s-border)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                maxWidth: 1040,
                margin: '28px auto 0'
              }}>
                {COLLEGE_JOURNEY_PILLARS.map((p, pIdx) => (
                  <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--s-text2)'
                    }}>
                      <span style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: p.colorLight,
                        color: p.color,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 900
                      }}>
                        {pIdx + 1}
                      </span>
                      <span>{p.title}</span>
                    </div>
                    {pIdx < COLLEGE_JOURNEY_PILLARS.length - 1 && (
                      <span style={{ color: '#cbd5e1', fontSize: 12, margin: '0 2px' }}>→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 7 Image Cards Grid + 8th Completion Banner */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 28
            }}>
              {COLLEGE_JOURNEY_PILLARS.map((item, idx) => (
                <JourneyCard key={item.step} item={item} index={idx} />
              ))}

              {/* 8th Action Showcase Banner completing the layout */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0b1329 0%, #064e3b 50%, #0f3460 100%)',
                  borderRadius: 22,
                  padding: '36px 32px',
                  color: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 12px 36px rgba(4, 120, 87, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  minHeight: 380
                }}
              >
                <div style={{
                  position: 'absolute',
                  right: -30,
                  top: -30,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(52, 211, 153, 0.15) 0%, transparent 70%)'
                }} />

                <div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.15)',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#a7f3d0',
                    marginBottom: 16
                  }}>
                    <FiZap size={13} /> Unified Student Telemetry
                  </div>

                  <h3 style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: '#ffffff',
                    margin: '0 0 12px',
                    fontFamily: 'var(--s-font-display)',
                    lineHeight: 1.25
                  }}>
                    Connect All 7 Pillars on Your Student Dashboard
                  </h3>

                  <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 20px' }}>
                    Build your academic profile once. Our AI telemetry synchronizes your enrolled degree, specialization branch, skill gap analysis, and scholarship eligibility in real time.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 26 }}>
                    {[
                      '100% Free for all students across Tamil Nadu',
                      'Personalized AI Study Planner & Ask AI Advisor',
                      'Auto-matching for government & trust scholarships'
                    ].map((pt, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#e2e8f0' }}>
                        <FiCheckCircle size={15} style={{ color: '#34d399', flexShrink: 0 }} />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link
                    to="/student/signup"
                    style={{
                      flex: 1,
                      minWidth: 160,
                      padding: '12px 20px',
                      borderRadius: 12,
                      background: '#34d399',
                      color: '#064e3b',
                      fontWeight: 800,
                      fontSize: 13.5,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(52, 211, 153, 0.35)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>Get Started Free</span>
                    <FiArrowRight size={16} />
                  </Link>

                  <Link
                    to="/explore"
                    style={{
                      padding: '12px 18px',
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: 13.5,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Explore Platform
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── USER TYPE SECTION (3 AUDIENCES) ── */}
        <section className="s-section" id="explore" style={{ background: 'var(--s-bg)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            <div className="s-section-header s-anim-up" style={{ textAlign: 'center', marginBottom: 48 }}>
              <div className="s-section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FiTarget size={14} /> Tailored Guidance
              </div>
              <h2 className="s-section-title" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', margin: '10px 0' }}>
                Designed for Every Academic Stage
              </h2>
              <p className="s-section-desc" style={{ maxWidth: 720, margin: '0 auto' }}>
                Whether you are exploring foundational streams in school, selecting your degree specialization in college, or planning your post-graduate career, Uyarvu Payanam provides data-led clarity.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
              {USER_TYPES.map((user, idx) => {
                const IconComp = user.icon
                return (
                  <div
                    key={user.key}
                    className={`s-anim-up s-d${idx + 1}`}
                    style={{
                      background: '#fff',
                      borderRadius: 20,
                      padding: 32,
                      border: '1px solid var(--s-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: 'var(--s-shadow)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 14,
                        background: user.accentBg, color: user.accentColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <IconComp size={26} />
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                        letterSpacing: '0.08em', padding: '6px 12px', borderRadius: 20,
                        background: user.accentBg, color: user.accentColor
                      }}>
                        {user.badge}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 4px' }}>
                      {user.title}
                    </h3>
                    <div style={{ fontSize: 13, fontWeight: 700, color: user.accentColor, marginBottom: 14 }}>
                      {user.subtitle}
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--s-text3)', lineHeight: 1.6, marginBottom: 20, flex: '0 0 auto' }}>
                      {user.desc}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, flex: 1 }}>
                      {user.points.map((pt, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--s-text2)' }}>
                          <FiCheckCircle size={16} style={{ color: user.accentColor, flexShrink: 0, marginTop: 2 }} />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>

                    <Link
                      to={user.ctaLink}
                      style={{
                        textDecoration: 'none',
                        padding: '12px 20px',
                        borderRadius: 12,
                        background: user.accentBg,
                        color: user.accentColor,
                        fontWeight: 700,
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{user.ctaText}</span>
                      <FiArrowRight size={16} />
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS SECTION ── */}
        <section className="s-section" id="how-it-works" style={{ background: '#0c1520', color: '#fff' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 20px' }}>
            <div className="s-section-header" style={{ textAlign: 'center', marginBottom: 56 }}>
              <div className="s-section-tag" style={{ background: 'rgba(125, 211, 252, 0.1)', color: '#7dd3fc' }}>
                <FiCompass size={14} /> Guided Journey
              </div>
              <h2 className="s-section-title" style={{ color: '#fff', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', margin: '10px 0' }}>
                How Academic Guidance Works
              </h2>
              <p className="s-section-desc" style={{ color: '#94a3b8', maxWidth: 640, margin: '0 auto' }}>
                Four simple steps to transform uncertainty into a confident academic and career decision.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
              {HOW_IT_WORKS.map((hw, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16,
                    padding: 28,
                    position: 'relative'
                  }}
                >
                  <div style={{
                    fontSize: 36, fontWeight: 900, color: '#7dd3fc',
                    fontFamily: 'var(--s-font-display)', opacity: 0.6, marginBottom: 12
                  }}>
                    {hw.step}
                  </div>
                  <h4 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>
                    {hw.title}
                  </h4>
                  <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                    {hw.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 10 FEATURE CARDS SECTION ── */}
        <section className="s-section" id="features" style={{ background: 'var(--s-surface)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            <div className="s-section-header" style={{ textAlign: 'center', marginBottom: 48 }}>
              <div className="s-section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FiLayers size={14} /> Full Ecosystem Features
              </div>
              <h2 className="s-section-title" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', margin: '10px 0' }}>
                Comprehensive Tools & Resources
              </h2>
              <p className="s-section-desc" style={{ maxWidth: 700, margin: '0 auto' }}>
                Everything you need to discover courses, evaluate colleges, track cutoffs, and prepare for career success.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
              {ALL_FEATURES.map((feat, i) => {
                const IconComp = feat.icon
                return (
                  <div
                    key={i}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--s-border)',
                      borderRadius: 16,
                      padding: 24,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                      transition: 'all 0.2s ease',
                      boxShadow: 'var(--s-shadow)'
                    }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: feat.bg, color: feat.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <IconComp size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 6px', color: 'var(--s-text)' }}>
                        {feat.title}
                      </h4>
                      <p style={{ fontSize: 13, color: 'var(--s-text3)', lineHeight: 1.55, margin: 0 }}>
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── ABOUT SECTION ── */}
        <section className="s-section" id="about" style={{ background: 'var(--s-bg)' }}>
          <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 20px' }}>
            <div style={{
              background: '#fff',
              border: '1px solid var(--s-border)',
              borderRadius: 24,
              padding: '48px 36px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 36,
              alignItems: 'center',
              boxShadow: 'var(--s-shadow-md)'
            }}>
              <div>
                <div className="s-section-tag" style={{ marginBottom: 12 }}>
                  <FiShield size={14} /> About Uyarvu Payanam
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 16px', lineHeight: 1.25 }}>
                  Bridging the Educational Information Gap Across Tamil Nadu
                </h2>
                <p style={{ fontSize: 15, color: 'var(--s-text2)', lineHeight: 1.7, marginBottom: 16 }}>
                  Career guidance is traditionally fragmented across websites or based on incomplete advice. <strong>Uyarvu Payanam</strong> ("Ascending Journey") brings together verified college registries, course catalogs, entrance exam alerts, TNEA cutoffs, and counselor mentorship under one roof.
                </p>
                <p style={{ fontSize: 14, color: 'var(--s-text3)', lineHeight: 1.6, margin: 0 }}>
                  From Class 5 curiosity activities to graduate career transitions, we ensure that every student has free, professional-grade career intelligence.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { title: 'Verified Institution Data', desc: 'Accurate college registries filterable by district and accreditation.' },
                  { title: 'Data-Led Counseling', desc: 'Real TNEA cutoff trends and community quota analysis.' },
                  { title: 'Inclusive & Accessible', desc: 'Designed with text-to-speech audio tools and mobile responsiveness.' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, background: 'var(--s-surface2)', padding: 18, borderRadius: 14 }}>
                    <FiCheckCircle size={20} style={{ color: 'var(--s-primary)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--s-text)' }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--s-text3)', marginTop: 2 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="s-cta-banner" style={{ textAlign: 'center', padding: '64px 20px' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 900 }}>
            Ready to Shape Your Academic Future?
          </h2>
          <p style={{ maxWidth: 600, margin: '12px auto 28px', fontSize: 16, opacity: 0.9 }}>
            Join thousands of students across Tamil Nadu who use Uyarvu Payanam for career clarity.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
            <Link to="/student/signup" className="s-btn s-btn-lg s-btn-white" style={{ textDecoration: 'none' }}>
              Sign Up For Free <FiArrowRight size={18} />
            </Link>
            <Link to="/student/careers" className="s-btn s-btn-lg s-btn-outline" style={{ textDecoration: 'none' }}>
              Browse Careers First
            </Link>
          </div>
        </section>

      </div>

      <AccessibilityBar />
    </div>
  )
}
