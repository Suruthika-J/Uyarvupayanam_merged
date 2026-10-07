import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FiBookmark, FiSearch, FiFilter, FiTrash2, FiExternalLink, 
  FiClock, FiTrendingUp, FiMapPin, FiCalendar, FiArrowRight,
  FiBriefcase, FiBookOpen, FiPlus, FiCheck, FiZap, FiTarget
} from 'react-icons/fi'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { useStudentContext, useCollegeProfile } from '../../context/CollegeProfileContext'
import { userActionService } from '../../../services/userActionService'
import { SCard, SBtn, SBadge, SLoader, SEmpty, SInput, SSelect } from '../../components/ui'
import s from './BookmarksPage.module.css'

const TABS = [
  { id: 'All',          label: 'All Saved',      icon: FiBookmark },
  { id: 'Course',       label: 'Courses',        icon: FiTrendingUp },
  { id: 'College',      label: 'Colleges',       icon: FiMapPin },
  { id: 'Scholarship',  label: 'Scholarships',   icon: FiCalendar },
  { id: 'Exam',         label: 'Exams',          icon: FiClock },
  { id: 'Career',       label: 'Careers',        icon: FiBriefcase },
  { id: 'ClassContent', label: 'Study Guides',   icon: FiBookOpen },
]

export default function BookmarksPage() {
  const { student } = useStudentAuth()
  const { studentContext, profile } = useStudentContext()
  const navigate = useNavigate()
  
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    fetchBookmarks()
  }, [student?._id, student?.id])

  const fetchBookmarks = async () => {
    try {
      setLoading(true)
      const res = await userActionService.getSavedList()
      setItems(res?.data || [])
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleUnsave = async (contentId) => {
    try {
      await userActionService.unsaveItem(contentId)
      setItems(prev => prev.filter(item => (item.contentId?._id || item.contentId) !== contentId))
    } catch (err) {
      console.error('Error unsaving:', err)
    }
  }

  const getStatus = (item) => {
    if (item.contentType === 'Scholarship' || item.contentType === 'Exam') {
      const deadline = item.contentId?.deadline || item.metadata?.deadline
      if (!deadline) return null
      
      const date = new Date(deadline)
      const today = new Date()
      const diff = (date - today) / (1000 * 60 * 60 * 24)
      
      if (diff < 0) return { label: 'Expired', color: 'gray' }
      if (diff < 7) return { label: 'Closing Soon', color: 'orange' }
      return { label: 'Active', color: 'green' }
    }
    return null
  }

  const filteredItems = items
    .filter(item => {
      const matchesTab = activeTab === 'All' || item.contentType === activeTab
      const title = (item.contentId?.title || item.contentId?.name || item.contentId?.courseName || '').toLowerCase()
      const matchesSearch = title.includes(search.toLowerCase())
      const itemClass = String(item.contentId?.targetClass || item.contentId?.level || '')
      const matchesClass = classFilter === 'All' || itemClass.includes(classFilter)
      return matchesTab && matchesSearch && matchesClass
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.savedAt) - new Date(a.savedAt)
      return 0
    })

  const renderCard = (item) => {
    const c = item.contentId
    const type = item.contentType
    const status = getStatus(item)
    if (!c) return null

    const config = {
      ClassContent: { color: 'blue',   link: `/student/class${c.targetClass || '12'}/content/${c.slug || ''}` },
      Course:       { color: 'indigo', link: `/student/course/${c.slug || ''}` },
      College:      { color: 'purple', link: `/student/colleges/${c._id || ''}` },
      Scholarship:  { color: 'green',  link: `/student/scholarships/${c._id || ''}` },
      Exam:         { color: 'orange', link: `/student/careers` },
      CareerPath:   { color: 'gold',   link: `/student/careers/path/${c._id || ''}` },
      Career:       { color: 'gold',   link: `/student/careers` }
    }[type] || { color: 'gray', link: '#' }

    return (
      <SCard key={item._id} hover className={s.card}>
        <div className={s.cardImage}>
          <img src={c.coverImage || c.image || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=400'} alt="thumb" />
          <div className={s.cardBadges}>
            <SBadge color={config.color}>{type === 'ClassContent' ? `Class ${c.targetClass}` : type}</SBadge>
            {status && <SBadge color={status.color}>{status.label}</SBadge>}
          </div>
        </div>
        
        <div className={s.cardContent}>
          <h3 className={s.cardTitle}>{c.title || c.name || c.courseName || c.collegeName || c.scholarshipName || 'Untitled'}</h3>
          <p className={s.cardDesc}>{c.shortDescription || c.provider || c.category || c.benefit || 'Explore detailed insights and requirements for this program.'}</p>
          
          <div className={s.cardMeta}>
             {type === 'Course' && (
               <>
                 <div className={s.metaItem}><FiClock /> {c.duration}</div>
                 <div className={s.metaItem}><FiTrendingUp /> {c.averageSalary || 'Good Growth'}</div>
               </>
             )}
             {type === 'Scholarship' && (
               <div className={s.metaItem}><FiCalendar /> Ends: {c.deadline || 'Ongoing'}</div>
             )}
             {type === 'College' && (
               <div className={s.metaItem}><FiMapPin /> {c.district || 'Tamil Nadu'}</div>
             )}
          </div>

          <div className={s.cardActions}>
            <SBtn variant="primary" size="sm" onClick={() => navigate(config.link)} style={{ flex: 1 }}>
              View Details <FiArrowRight />
            </SBtn>
            <SBtn variant="outline" size="sm" onClick={() => handleUnsave(c._id)} style={{ color: '#ef4444', borderColor: '#fca5a5' }}>
              <FiTrash2 />
            </SBtn>
          </div>
        </div>
      </SCard>
    )
  }

  return (
    <div className={s.container}>
      <header className={s.header}>
        <div className={s.headerLeft}>
          <h1 className={s.title}>My Saved Resources</h1>
          <p className={s.subtitle}>Manage your personalized roadmap and bookmarked academic resources.</p>
        </div>
        <div className={s.stats}>
          <div className={s.statBox}>
             <span className={s.statValue}>{items.length}</span>
             <span className={s.statLabel}>Total Saved</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className={s.tabBar}>
        {TABS.map(tab => {
          const Icon = tab.icon
          const count = items.filter(i => tab.id === 'All' || i.contentType === tab.id).length
          return (
            <button 
              key={tab.id} 
              className={`${s.tab} ${activeTab === tab.id ? s.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              {tab.label}
              <span className={s.tabCount}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Filters Toolbar */}
      <div className={s.toolbar}>
        <div className={s.searchWrap}>
          <FiSearch className={s.searchIcon} />
          <input 
            type="text" 
            placeholder="Search saved items..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={s.searchInput}
          />
        </div>
        <div className={s.filterGroup}>
          <SSelect value={classFilter} onChange={e => setClassFilter(e.target.value)} style={{ minWidth: 140 }}>
            <option value="All">All Classes</option>
            <option value="5">Class 5</option>
            <option value="8">Class 8</option>
            <option value="10">Class 10</option>
            <option value="12">Class 12</option>
          </SSelect>
          <SSelect value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ minWidth: 160 }}>
            <option value="recent">Recently Saved</option>
            <option value="name">Name A-Z</option>
          </SSelect>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '100px 0' }}><SLoader /></div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 20, border: '1px solid var(--s-border)', margin: '20px 0' }}>
          <FiBookmark size={48} color="var(--s-primary)" style={{ marginBottom: 12, opacity: 0.8 }} />
          <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 8px' }}>
            {activeTab === 'Course' ? 'No saved courses yet' :
             activeTab === 'College' ? 'No saved colleges yet' :
             activeTab === 'Scholarship' ? 'No saved scholarships yet' :
             activeTab === 'Exam' ? 'No saved entrance exams yet' :
             activeTab === 'Career' ? 'No saved career pathways yet' :
             activeTab === 'ClassContent' ? 'No saved study guides yet' :
             'No saved resources yet'}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', maxWidth: 500, margin: '0 auto 20px', lineHeight: 1.5 }}>
            {activeTab === 'Course' ? 'Explore undergraduate and specialized courses tailored to your degree and target career.' :
             activeTab === 'College' ? 'Explore and bookmark leading institutions across Tamil Nadu offering your specialization.' :
             activeTab === 'Scholarship' ? 'Discover state, national merit, and department scholarships available for your profile.' :
             activeTab === 'Exam' ? 'Track upcoming entrance, competitive, and recruitment exams relevant to your field.' :
             activeTab === 'Career' ? 'Bookmark career trajectories generated through your AHP assessment and skill gap matrix.' :
             activeTab === 'ClassContent' ? 'Save semester notes, revision packs, and laboratory study guides.' :
             'Start bookmarking courses, colleges, scholarships, and career milestones to build your personal academic library.'}
          </p>
          <SBtn
            variant="primary"
            onClick={() => {
              if (activeTab === 'College') navigate('/student/colleges')
              else if (activeTab === 'Scholarship') navigate('/student/scholarships')
              else if (activeTab === 'Exam') navigate('/student/careers')
              else if (activeTab === 'Career') navigate('/student/careers')
              else if (activeTab === 'ClassContent') navigate('/college/study-tools/practice')
              else navigate('/student/courses')
            }}
          >
            {activeTab === 'Course' ? 'Browse Relevant Courses' :
             activeTab === 'College' ? 'Browse Colleges' :
             activeTab === 'Scholarship' ? 'Browse Scholarships' :
             activeTab === 'Exam' ? 'Browse Entrance Exams' :
             activeTab === 'Career' ? 'Explore Recommended Careers' :
             activeTab === 'ClassContent' ? 'Explore Study Materials' :
             'Browse Relevant Courses'}
            <FiArrowRight style={{ marginLeft: 6 }} />
          </SBtn>
        </div>
      ) : (
        <div className={s.grid}>
          {filteredItems.map(renderCard)}
        </div>
      )}

      {/* ── PROFILE-AWARE RECOMMENDED TO SAVE SECTION ── */}
      <div style={{ marginTop: 48, paddingTop: 32, borderTop: '2px solid var(--s-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--s-primary)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              <FiZap size={14} /> Profile Telemetry
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
              Recommended Resources for Your Profile
            </h2>
            <p style={{ fontSize: 13, color: 'var(--s-text3)', margin: '4px 0 0' }}>
              Handpicked resources matched to your degree ({studentContext?.degree || profile?.degreeProgramme || 'College'}), specialization, and target career ({studentContext?.targetCareer || profile?.targetCareer || 'Career Objective'}).
            </p>
          </div>
          {(studentContext?.targetCareer || profile?.targetCareer) && (
            <SBadge color="blue">
              <FiTarget style={{ marginRight: 4 }} /> Goal: {studentContext?.targetCareer || profile?.targetCareer}
            </SBadge>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {/* Card 1: Target Career Course */}
          <SCard style={{ padding: 22, borderRadius: 18, border: '1px solid var(--s-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <SBadge color="indigo">Course</SBadge>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#047857' }}>Suggested for you</span>
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 6px' }}>
                {(studentContext?.targetCareer || profile?.targetCareer) ? `${studentContext?.targetCareer || profile?.targetCareer} Mastery Curriculum` : `${studentContext?.course || profile?.domain || 'Computer Science'} Specialization`}
              </h4>
              <p style={{ fontSize: 13, color: 'var(--s-text3)', lineHeight: 1.5, margin: 0 }}>
                Comprehensive coursework and lab modules designed to acquire core skills for your career target.
              </p>
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
              <SBtn variant="primary" size="sm" onClick={() => navigate('/student/courses')} style={{ flex: 1 }}>
                View Course
              </SBtn>
            </div>
          </SCard>

          {/* Card 2: Interview & Placement Guide */}
          <SCard style={{ padding: 22, borderRadius: 18, border: '1px solid var(--s-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <SBadge color="blue">Study Guide</SBadge>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#047857' }}>Career Prep</span>
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 6px' }}>
                {(studentContext?.targetCareer || profile?.targetCareer) ? `${studentContext?.targetCareer || profile?.targetCareer} Placement & Interview Pack` : 'Technical Placement Revision Guide'}
              </h4>
              <p style={{ fontSize: 13, color: 'var(--s-text3)', lineHeight: 1.5, margin: 0 }}>
                Curated technical problem sets, system design templates, and mock questions.
              </p>
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
              <SBtn variant="primary" size="sm" onClick={() => navigate('/college/career/interview-prep')} style={{ flex: 1 }}>
                Open Guide
              </SBtn>
            </div>
          </SCard>

          {/* Card 3: Competitive Exam */}
          <SCard style={{ padding: 22, borderRadius: 18, border: '1px solid var(--s-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <SBadge color="orange">Entrance Exam</SBadge>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#b45309' }}>Explore</span>
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 6px' }}>
                {`GATE & TANCET Examination (${studentContext?.course || 'Engineering'})`}
              </h4>
              <p style={{ fontSize: 13, color: 'var(--s-text3)', lineHeight: 1.5, margin: 0 }}>
                National and state level entrance examinations for postgraduate studies and PSU recruitment.
              </p>
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
              <SBtn variant="primary" size="sm" onClick={() => navigate('/student/careers')} style={{ flex: 1 }}>
                View Exam Details
              </SBtn>
            </div>
          </SCard>

          {/* Card 4: Merit Scholarship */}
          <SCard style={{ padding: 22, borderRadius: 18, border: '1px solid var(--s-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <SBadge color="green">Scholarship</SBadge>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#047857' }}>Check eligibility</span>
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 6px' }}>
                Tamil Nadu Higher Education Merit & Technical Scholarship
              </h4>
              <p style={{ fontSize: 13, color: 'var(--s-text3)', lineHeight: 1.5, margin: 0 }}>
                Financial grant support for eligible college students pursuing professional degree programmes.
              </p>
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
              <SBtn variant="primary" size="sm" onClick={() => navigate('/student/scholarships')} style={{ flex: 1 }}>
                Check Eligibility
              </SBtn>
            </div>
          </SCard>
        </div>
      </div>
    </div>
  )
}
