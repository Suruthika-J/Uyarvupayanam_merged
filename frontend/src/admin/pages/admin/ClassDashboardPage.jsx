import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  FiArrowLeft, FiPlus, FiEye, FiEdit3, FiTrash2, FiStar, 
  FiPackage, FiCheckCircle, FiClock, FiActivity, FiSearch, 
  FiFilter, FiMoreVertical, FiLayout, FiCompass, FiAward,
  FiVideo, FiInfo, FiHeart, FiAnchor, FiExternalLink, FiDownload,
  FiTarget, FiBriefcase, FiFileText
} from 'react-icons/fi'
import { classContentService } from '../../../services/classContentService'
import { SCard, SBtn, SBadge, SLoader, SEmpty, StatCard, DataTable, TR, TD, ActionBtn, FiltersRow, SearchInput, FilterSelect, ActivityDot, Modal, FormGroup, FormInput, FormActions, FormGrid, Toggle } from '../../components/UI'

const SECTION_ICONS = {
  'Basics': FiCompass,
  'Exams': FiAward,
  'Fun': FiStar,
  'Skills': FiTarget,
  'Games': FiActivity,
  'Careers': FiBriefcase,
  'Videos': FiVideo,
  'Habits': FiHeart,
  'Streams': FiLayout,
  'Entrance Exams': FiFileText,
  'Resources': FiAnchor,
  'FAQs': FiInfo
}

const CLASS_OPTIONS = [
  { value: '5', label: 'Class 5th' },
  { value: '8', label: 'Class 8th' },
  { value: '10', label: 'Class 10th' },
  { value: '12', label: 'Class 12th' },
]

export default function ClassDashboardPage() {
  const { level } = useParams() // "class5", "class8" etc
  const cleanLevel = level.replace('class', '')
  const navigate = useNavigate()
  
  const [data, setData] = useState([])
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, featured: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterFeatured, setFilterFeatured] = useState('all')

  useEffect(() => {
    fetchData()
  }, [cleanLevel])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await classContentService.getAdminList(cleanLevel)
      if (res.success) {
        setData(res.data)
        setStats(res.stats)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (id) => {
    try {
      const res = await classContentService.toggleStatus(id)
      if (res.success) fetchData()
    } catch (err) { console.error('Toggle status error', err) }
  }

  const handleToggleFeature = async (id) => {
    try {
      const res = await classContentService.toggleFeature(id)
      if (res.success) fetchData()
    } catch (err) { console.error('Toggle feature error', err) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return
    try {
      const res = await classContentService.delete(id)
      if (res.success) fetchData()
    } catch (err) { console.error('Delete error', err) }
  }

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                             item.sectionType.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus
      const matchesType   = filterType === 'all'   || item.sectionType === filterType
      const matchesFeatured = filterFeatured === 'all' || 
                              (filterFeatured === 'featured' && item.featured) || 
                              (filterFeatured === 'regular' && !item.featured)
      return matchesSearch && matchesStatus && matchesType && matchesFeatured
    })
  }, [data, search, filterStatus, filterType, filterFeatured])

  if (loading) return <SLoader />

  return (
    <div className="admin-page">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <Link to="/admin/careers" style={{ width:44, height:44, borderRadius:14, border:'1px solid var(--border)', display:'grid', placeItems:'center', color:'var(--text)', background:'#fff' }}>
             <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize:28, fontWeight:900, marginBottom:4 }}>Class {cleanLevel}th Guidance Dashboard</h1>
            <p style={{ color:'var(--text3)', fontSize:14 }}>Manage content modules for Class {cleanLevel}th students.</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <SBtn variant="outline" onClick={() => window.open(`/student/class${cleanLevel}`, '_blank')}>
            <FiEye /> Student View
          </SBtn>
          <SBtn onClick={() => navigate(`/admin/career-paths/${level}/new`)}>
            <FiPlus /> Add New Content
          </SBtn>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:20, marginBottom:40 }}>
        <StatCard icon={<FiPackage color="#7c3aed" />} value={stats.total} label="Total Modules" color="#7c3aed" />
        <StatCard icon={<FiCheckCircle color="#16a34a" />} value={stats.published} label="Published" color="#16a34a" />
        <StatCard icon={<FiClock color="#f59e0b" />} value={stats.draft} label="In Draft" color="#f59e0b" />
        <StatCard icon={<FiStar color="#3b82f6" />} value={stats.featured} label="Featured" color="#3b82f6" />
      </div>

      {/* Filters */}
      <FiltersRow>
        <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title or type..." />
        <FilterSelect value={cleanLevel} onChange={e => navigate(`/admin/career-paths/class${e.target.value}`)}>
           {CLASS_OPTIONS.map(opt => (
             <option key={opt.value} value={opt.value}>{opt.label}</option>
           ))}
        </FilterSelect>
        <FilterSelect value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
           <option value="all">All Status</option>
           <option value="published">Published</option>
           <option value="draft">Draft</option>
        </FilterSelect>
        <FilterSelect value={filterFeatured} onChange={e => setFilterFeatured(e.target.value)}>
           <option value="all">All Items</option>
           <option value="featured">Featured Only</option>
           <option value="regular">Non-Featured</option>
        </FilterSelect>
        <FilterSelect value={filterType} onChange={e => setFilterType(e.target.value)}>
           <option value="all">All Sections</option>
           {Object.keys(SECTION_ICONS).map(type => (
             <option key={type} value={type}>{type}</option>
           ))}
        </FilterSelect>
      </FiltersRow>

      {/* Content Table */}
      <SCard style={{ padding:0, overflow:'hidden' }}>
         <DataTable 
           columns={['Image', 'Title / Sub-Category', 'Section', 'Featured', 'Status', 'Date', 'Actions']}
           data={filteredData}
           renderRow={(item, i) => {
             const Icon = SECTION_ICONS[item.sectionType] || FiLayout
             return (
               <TR key={item._id}>
                 <TD style={{ width:100 }}>
                   <div style={{ width:60, height:40, borderRadius:6, background:'#f3f4f6', overflow:'hidden', border:'1px solid var(--border)' }}>
                     {item.coverImage ? (
                       <img src={item.coverImage} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                     ) : (
                       <div style={{ width:'100%', height:'100%', display:'grid', placeItems:'center', color:'#9ca3af' }}><FiPackage size={14} /></div>
                     )}
                   </div>
                 </TD>
                 <TD>
                    <div>
                      <div style={{ fontWeight:800 }}>{item.title}</div>
                      <div style={{ fontSize:12, color:'var(--text3)' }}>
                         {item.subCategoryLabel || item.category || 'General'} • Order: {item.displayOrder}
                      </div>
                    </div>
                 </TD>
                 <TD>
                   <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:24, height:24, borderRadius:6, background:'var(--surface2)', display:'grid', placeItems:'center', color:'var(--primary)' }}>
                         <Icon size={12} />
                      </div>
                      <span style={{ fontSize:13, fontWeight:600 }}>{item.sectionType}</span>
                   </div>
                 </TD>
                 <TD>
                   <ActionBtn onClick={() => handleToggleFeature(item._id)} style={{ border:'none', background:'none' }}>
                     <FiStar size={16} fill={item.featured ? "#fbbf24" : "none"} color={item.featured ? "#fbbf24" : "#9ca3af"} />
                   </ActionBtn>
                 </TD>
                 <TD>
                   <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }} onClick={() => handleToggleStatus(item._id)} title="Click to toggle">
                      <ActivityDot color={item.status === 'published' ? '#16a34a' : '#f59e0b'} />
                      <span style={{ textTransform:'capitalize', fontWeight:600, fontSize:13 }}>{item.status}</span>
                   </div>
                 </TD>
                 <TD>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                 </TD>
                 <TD>
                   <div style={{ display:'flex', gap:8 }}>
                      <ActionBtn onClick={() => navigate(`/admin/career-paths/${level}/edit/${item._id}`)} title="Edit">
                         <FiEdit3 size={14} />
                      </ActionBtn>
                      <ActionBtn onClick={() => window.open(`/class${cleanLevel}/content/${item.slug}`, '_blank')} title="View as Student">
                         <FiEye size={14} />
                      </ActionBtn>
                      <ActionBtn danger onClick={() => handleDelete(item._id)} title="Delete">
                         <FiTrash2 size={14} />
                      </ActionBtn>
                   </div>
                 </TD>
               </TR>
             )
           }}
         />
         {filteredData.length === 0 && (
           <SEmpty title="No content found" desc="Try adjusting your search or add a new module." />
         )}
      </SCard>
    </div>
  )
}
