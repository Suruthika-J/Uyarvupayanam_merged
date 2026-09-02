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
