import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FiBookmark, FiSearch, FiFilter, FiTrash2, FiExternalLink, 
  FiClock, FiTrendingUp, FiMapPin, FiCalendar, FiArrowRight 
} from 'react-icons/fi'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { userActionService } from '../../../services/userActionService'
import { SCard, SBtn, SBadge, SLoader, SEmpty, SInput, SSelect } from '../../components/ui'
import s from './BookmarksPage.module.css'

const TABS = [
  { id: 'All',          label: 'All Saved',      icon: FiBookmark },
  { id: 'Course',       label: 'Courses',        icon: FiTrendingUp },
  { id: 'College',      label: 'Colleges',       icon: FiMapPin },
  { id: 'Scholarship',  label: 'Scholarships',   icon: FiCalendar },
  { id: 'Exam',         label: 'Exams',          icon: FiClock },
  { id: 'ClassContent', label: 'Study Guides',   icon: FiBookmark },
]

export default function BookmarksPage() {
  const { student } = useStudentAuth()
  const navigate = useNavigate()
  
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    fetchBookmarks()
  }, [student?._id])

  const fetchBookmarks = async () => {
    if (!student?._id) return
    try {
      setLoading(true)
      const res = await userActionService.getSavedList()
      setItems(res.data || [])
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err)
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
      ClassContent: { color: 'blue',   link: `/student/class${c.targetClass}/content/${c.slug}` },
      Course:       { color: 'indigo', link: `/student/course/${c.slug}` },
      College:      { color: 'purple', link: `/student/colleges/${c._id}` },
      Scholarship:  { color: 'green',  link: `/student/scholarships/${c._id}` },
      Exam:         { color: 'orange', link: `/student/careers` },
      CareerPath:   { color: 'gold',   link: `/student/careers/path/${c._id}` }
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
        <SEmpty 
          icon={<FiBookmark size={48} />} 
          title="No items found" 
          desc="You haven't saved any items in this category yet. Start exploring to build your roadmap!"
        />
      ) : (
        <div className={s.grid}>
          {filteredItems.map(renderCard)}
        </div>
      )}
    </div>
  )
}
