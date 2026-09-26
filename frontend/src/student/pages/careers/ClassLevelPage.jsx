import React, { useState, useEffect, useMemo } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  FiArrowLeft, FiArrowRight, FiHeart, FiFlag, FiTarget, FiStar,
  FiAward, FiVideo, FiBriefcase,
  FiBookmark, FiCompass, FiLayers, FiDollarSign,
  FiFileText, FiLink, FiHelpCircle, FiBookOpen, FiChevronDown, FiChevronUp, FiMapPin
} from 'react-icons/fi'
import { classContentService } from '../../../services/classContentService'
import { userActionService } from '../../../services/userActionService'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { SBtn, SLoader, SEmpty, SBadge, SAlert } from '../../components/ui'
import { C5 } from '../../components/class5/redesign/class5Theme'
import ActivityCard from '../../components/class5/activities/ActivityCard'
import { careerService } from '../../services'
import { examService } from '../../../services/examService'
import AuthModal from '../../components/ui/AuthModal'
import { courseService } from '../../../services/courseService'
import axiosInstance from '../../../config/axios'
import StreamsInsight from '../../components/streams/StreamsInsight'
import CollegesInsight from '../../components/colleges/CollegesInsight'

// Accent for the Class N pages — matches the Journey Explorer's School track (purple).
const ACCENT = '#7C3AED'

const CLASS_SECTIONS = {
  default: [
    { id: 'Basics', label: 'Basics', icon: FiFlag, color: '#6366f1' },
    { id: 'Exams', label: 'Exams', icon: FiAward, color: '#f59e0b' },
    { id: 'Scholarships', label: 'Scholarships', icon: FiDollarSign, color: '#10b981' },
    { id: 'Skills', label: 'Skills', icon: FiTarget, color: '#10b981' },
    { id: 'Games', label: 'Games', icon: FiStar, color: '#8b5cf6' },
    { id: 'Videos', label: 'Videos', icon: FiVideo, color: '#ef4444' },
    { id: 'Habits', label: 'Habits', icon: FiHeart, color: '#f43f5e' },
  ],
  "5": [
    { id: 'Basics', label: 'Basics', icon: FiFlag, color: '#6366f1' },
    { id: 'Entrance Exams', label: 'Exams', icon: FiAward, color: '#f59e0b' },
    { id: 'Scholarships', label: 'Scholarships', icon: FiDollarSign, color: '#10b981' },
    { id: 'Skills', label: 'Skills', icon: FiTarget, color: '#10b981' },
    { id: 'Games', label: 'Games', icon: FiStar, color: '#8b5cf6' },
  ],
  "8": [
    { id: 'Basics', label: 'Basics', icon: FiFlag, color: '#6366f1' },
    { id: 'Entrance Exams', label: 'Entrance Exams', icon: FiFileText, color: '#8b5cf6' },
    { id: 'Scholarships', label: 'Scholarships', icon: FiDollarSign, color: '#10b981' },
    { id: 'Skills', label: 'Skills', icon: FiTarget, color: '#ec4899' },
    { id: 'Habits', label: 'Habits', icon: FiHeart, color: '#f43f5e' },
  ],
  "10": [
    { id: 'Streams', label: 'Streams', icon: FiLayers, color: '#16A34A' },
    { id: 'Scholarships', label: 'Scholarships', icon: FiDollarSign, color: '#10b981' },
    { id: 'Entrance Exams', label: 'Entrance Exams', icon: FiFileText, color: '#8b5cf6' },
  ],
  "12": [
    { id: 'Basics', label: 'Basics', icon: FiFlag, color: '#6366f1' },
    { id: 'Careers', label: 'Careers', icon: FiBriefcase, color: '#3b82f6' },
    { id: 'Colleges', label: 'Colleges', icon: FiMapPin, color: '#f59e0b' },
    { id: 'Scholarships', label: 'Scholarships', icon: FiDollarSign, color: '#10b981' },
    { id: 'Entrance Exams', label: 'Entrance Exams', icon: FiFileText, color: '#8b5cf6' },
    { id: 'Skills', label: 'Skills', icon: FiTarget, color: '#ec4899' },
    { id: 'Habits', label: 'Habits', icon: FiHeart, color: '#f43f5e' },
    { id: 'FAQs', label: 'FAQs', icon: FiHelpCircle, color: '#334155' }
  ]
}

const STREAM_TABS = ["Science", "Commerce", "Arts", "Diploma"];
const SCHOLARSHIP_TABS = ["Merit", "NSP"];
const CATEGORY_TABS = [
  "Engineering", "Medical", "Arts & Science", "Law", "Commerce", "Management",
  "IT & Computer", "Agriculture", "Architecture", "Design", "Hotel Management", 
  "ITI", "Polytechnic", "Media & Journalism", "Others"
];
const COLLEGE_TABS = CATEGORY_TABS;
const EXAM_TABS = {
  "5": ["Science", "Mathematics", "English", "GK", "Multiple", "Defence"],
  "8": ["Scholarship", "Mathematics", "Science", "English", "Defence"],
  "10": [],
  "12": CATEGORY_TABS,
  "default": ["Scholarship Exam", "Skill Exams", "Government Job", "Defence Career", "Future Goals"]
};

const ExamCardDetails = ({ exam }) => {
  const [tab, setTab] = useState('Prep');
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
        {['Prep', 'Careers', 'Resources'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ 
            background: 'none', border: 'none', padding: '4px 8px', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, color: tab === t ? ACCENT : '#94a3b8',
            borderBottom: tab === t ? `2px solid ${ACCENT}` : '2px solid transparent'
          }}>
            {t}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 13, color: '#334155', minHeight: 120 }}>
        {tab === 'Prep' && (
           <div>
             <strong style={{ color:'#1e293b' }}>Strategy:</strong> <p style={{ margin: '4px 0 8px', whiteSpace: 'pre-line' }}>{exam.preparation?.strategy || 'N/A'}</p>
             <strong style={{ color:'#1e293b' }}>Timeline:</strong> <p style={{ margin: '4px 0' }}>{exam.preparation?.timeline || 'N/A'}</p>
           </div>
        )}
        {tab === 'Careers' && (
           <ul style={{ margin: 0, paddingLeft: 20 }}>
             {exam.careerOptions?.length > 0 ? exam.careerOptions.map((c, i) => <li key={i} style={{ marginBottom: 4 }}>{c}</li>) : <li>N/A</li>}
           </ul>
        )}
        {tab === 'Resources' && (
           <div>
             <strong style={{ color:'#1e293b' }}>Recommended Books:</strong>
             <ul style={{ margin: '4px 0 8px', paddingLeft: 20 }}>
               {exam.preparation?.books?.length > 0 ? exam.preparation.books.map((b, i) => <li key={i}>{b}</li>) : <li>N/A</li>}
             </ul>
             <strong style={{ color:'#1e293b' }}>Other Resources:</strong>
             <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
               {exam.preparation?.resources?.length > 0 ? exam.preparation.resources.map((r, i) => <li key={i}>{r}</li>) : <li>N/A</li>}
             </ul>
           </div>
        )}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------------
 * Class 10 Entrance Exams — curated cards (purple Streams theme)
 * Maintains the accuracy notes: TRUSTS is a Class 9 window; Police Constable
 * and Army GD are future options (minimum age rules), not apply-now steps.
 * ------------------------------------------------------------------------ */
const CLASS10_FLAG_TONES = {
  amber: { light: '#FEF3C7', border: '#FDE68A', text: '#B45309' },
  blue: { light: '#EFF6FF', border: '#DBEAFE', text: '#1D4ED8' },
  purple: { light: '#F5ECFF', border: '#E9D5FF', text: '#6D28D9' },
}

const CLASS10_EXAMS = [
  {
    id: 'ntse',
    name: 'National Talent Search Examination',
    abbr: 'NTSE',
    category: 'Scholarship Exam',
    conducting: 'NCERT — state stage via SCERT Tamil Nadu',
    rows: [
      { label: 'Eligibility', value: 'Currently studying in Class 10' },
      { label: 'Stages', value: 'Stage 1 (state level) ~ November → Stage 2 (national level) ~ following May' },
      { label: 'Remember', value: 'It is a scholarship exam, not a course-admission test.' },
    ],
  },
  {
    id: 'trusts',
    name: 'Tamil Nadu Rural Talent Search',
    abbr: 'TRUSTS',
    category: 'Scholarship Exam',
    conducting: 'Directorate of Government Examinations (DGE), Tamil Nadu',
    flag: { tone: 'amber', text: 'Class 9 window only' },
    rows: [
      { label: 'When', value: 'Taken while studying in Class 9 — if you are in Class 10 now, this window has already passed.' },
      { label: 'Eligibility', value: 'Rural government/aided school only; parental income ≤ ₹1,00,000 per year' },
      { label: 'Award', value: '₹1,000/year for 4 years (Class 9–12) · 50 boys + 50 girls selected per revenue district' },
      { label: 'Timeline', value: 'Exam ~August–December · results ~January–March' },
    ],
  },
  {
    id: 'tn-technical',
    name: 'Government Technical & Vocational Exams',
    category: 'Skill Certification',
    conducting: 'Directorate of Technical Education / Tamil Nadu Govt exam boards',
    rows: [
      { label: 'Covers', value: 'Drawing, Typewriting, Shorthand, Commercial Practice, Sewing, Music grade certificates' },
      { label: 'Eligibility', value: 'Open entry — no fixed class requirement; skill-grade certifications, not competitive admission exams' },
      { label: 'Purpose', value: 'Adds a certified skill credential beside your SSLC — useful for vocational and commercial career tracks' },
      { label: 'Dates', value: 'No fixed national date — exams run in cycles through the year, per subject' },
    ],
  },
  {
    id: 'tnusrb',
    name: 'TNUSRB Police Constable',
    category: 'Government Job',
    conducting: 'Tamil Nadu Uniformed Services Recruitment Board (TNUSRB)',
    flag: { tone: 'blue', text: 'Future option — apply at 18+' },
    rows: [
      { label: 'Eligibility', value: '10th Standard/SSLC pass — note: a qualification higher than 10th disqualifies you for Constable specifically' },
      { label: 'Age', value: '18–26 years (relaxed for reserved categories)' },
      { label: 'Selection', value: 'Written exam → physical measurement → physical efficiency test → medical test' },
      { label: 'Timeline', value: 'Notifications appear periodically through the year (2025 cycle: applications closed Sep 21, exam held Nov 9)' },
    ],
  },
  {
    id: 'army',
    name: 'Indian Army — Soldier GD / Agniveer',
    category: 'Defence Career',
    conducting: 'Indian Army, under the Agnipath Scheme',
    flag: { tone: 'purple', text: 'Future option — apply at 17.5+' },
    rows: [
      { label: 'Eligibility', value: 'Class 10 pass with 45% aggregate and minimum 33% in each subject' },
      { label: 'Age', value: '17.5–21 years' },
      { label: 'Selection', value: 'Common Entrance Test (General Knowledge, General Science, Maths, Logical Reasoning) → physical test → medical test' },
      { label: 'Timeline', value: 'Assumed 2026: notification ~Feb, registration Feb–Mar, written exam (CEE) ~Jun–Jul, recruitment rallies from ~Aug' },
      { label: 'Remember', value: 'This is a 4-year short-term Agniveer engagement, not a permanent-cadre enrollment.' },
    ],
  },
  {
    id: 'railway-post',
    name: 'Railway & Post Office Recruitment',
    category: 'Government Job',
    conducting: 'Railway Recruitment Boards (RRB) · Department of Posts (India Post GDS)',
    rows: [
      { label: 'Eligibility', value: '10th pass (varies slightly by specific post)' },
      { label: 'Selection', value: 'Computer-based test; RRB Group D also has a physical efficiency test' },
      { label: 'Timeline', value: 'Notification cycles vary year to year — no fixed annual date, so watch for periodic notifications' },
    ],
  },
]

const Class10ExamPanel = () => (
  <div style={{ gridColumn: '1/-1' }}>
    {/* Context callout */}
    <div style={{ background: '#fff', border: '1px solid #eaf0f6', borderRadius: 24, padding: '20px 24px', marginBottom: 28, display: 'flex', gap: 14, alignItems: 'flex-start', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)' }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: '#F5ECFF', color: ACCENT, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <FiFileText size={20} />
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: '#0f172a' }}>Entrance exams, scholarships & recruitments around Class 10</h3>
        <p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.6, color: '#475569' }}>
          NTSE rewards top Class 10 students, technical exams add certified skills beside your SSLC, and the police &amp; army entries have
          minimum-age rules — treat those as <strong style={{ color: '#334155' }}>future options to plan for</strong>, not apply-now steps.
        </p>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 28 }}>
      {CLASS10_EXAMS.map(e => (
        <div key={e.id} style={{ background: '#fff', borderRadius: 28, border: '1px solid #eaf0f6', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} className="hover-lift">
          <div style={{ height: 6, background: 'linear-gradient(90deg, #7C3AED 0%, #a855f7 100%)' }} />
          <div style={{ padding: '20px 22px 14px' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <SBadge color="purple">{e.category}</SBadge>
              {e.flag && (
                <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 800, letterSpacing: '0.02em', padding: '5px 10px', borderRadius: 99, background: CLASS10_FLAG_TONES[e.flag.tone].light, color: CLASS10_FLAG_TONES[e.flag.tone].text, border: `1px solid ${CLASS10_FLAG_TONES[e.flag.tone].border}` }}>
                  {e.flag.text}
                </span>
              )}
            </div>
            <h3 style={{ margin: '12px 0 2px', fontSize: 19, fontWeight: 900, color: '#0f172a', lineHeight: 1.25 }}>
              {e.name}
              {e.abbr && <span style={{ color: ACCENT, fontWeight: 800, fontSize: 12.5, letterSpacing: '0.04em', marginLeft: 6 }}>({e.abbr})</span>}
            </h3>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b' }}>{e.conducting}</div>
          </div>
          <div style={{ padding: '4px 22px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {e.rows.map(r => (
              <div key={r.label} style={{ borderTop: '1px solid #f1f5f9', padding: '10px 0', display: 'flex', gap: 12 }}>
                <span style={{ width: 84, flexShrink: 0, fontSize: 10.5, fontWeight: 800, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em', paddingTop: 2 }}>{r.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155', lineHeight: 1.55 }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default function ClassLevelPage(props) {
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const level = props.level || params.level || ""
  const cleanLevel = level.toString().replace('class', '')
  const sections = CLASS_SECTIONS[cleanLevel] || CLASS_SECTIONS.default;

  const [contents, setContents] = useState([])
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSec, setActiveSec] = useState(cleanLevel === '10' ? 'Streams' : 'Basics')
  const [activeSubTab, setActiveSubTab] = useState('All') 
  const [authData, setAuthData] = useState({ isOpen: false, message: '', pendingAction: null })
  const { isAuthenticated } = useStudentAuth()
  const [savedIds, setSavedIds] = useState(new Set())
  const [alert, setAlert] = useState({ type: '', text: '' })
  const [searchQuery] = useState('')
  const [, setCourses] = useState([])
  const [, setColleges] = useState([]) 
  const [exams, setExams] = useState([]) 
  const [explorerData, setExplorerData] = useState([])
  const [explorerLoading, setExplorerLoading] = useState(false)
  const [mappingData, setMappingData] = useState([])
  const [mappingLoading, setMappingLoading] = useState(false)
  
  useEffect(() => {
    fetchContent()
    if (isAuthenticated) fetchSavedItems()
  }, [cleanLevel, isAuthenticated])

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sec = searchParams.get('section');
    if (sec && sections.some(s => s.id === sec)) {
      setActiveSec(sec);
    } else {
      setActiveSec(cleanLevel === '10' ? 'Streams' : 'Basics');
    }
    setActiveSubTab('All');
  }, [cleanLevel, location.search]);

  useEffect(() => {
    if (!['Careers', 'Colleges', 'Streams'].includes(activeSec)) return;
    // Class 10 Streams is now served by the dedicated /api/streams dataset
    if (cleanLevel === '10' && activeSec === 'Streams') return;
    // Class 12 Colleges now uses the dedicated /api/colleges-insight dataset
    if (cleanLevel === '12' && activeSec === 'Colleges') return;
    
    const fetchExplorerData = async () => {
      // Explorer data (Engineering, Medical, etc.) is only for 12th or 10th Streams
      if (!(['12', '10'].includes(cleanLevel))) {
        setExplorerData([]);
        return;
      }
      if (cleanLevel === '10' && activeSec !== 'Streams') {
        setExplorerData([]);
        return;
      }

      setExplorerLoading(true)
      try {
        if (activeSec === 'Streams' && cleanLevel === '10') {
           const res = await courseService.getAll();
           if (res.success || Array.isArray(res.data) || Array.isArray(res)) {
             let rawCourses = res.data || res;
             if (!Array.isArray(rawCourses)) rawCourses = [];
             
             let streamCourses = rawCourses.filter(c => {
               const lvl = (c.level || c.eligibility || '').toLowerCase().replace(/\s/g, '');
               const cat = (c.category || '').toLowerCase();
               return lvl.includes('after10') || cat.includes('diploma') || lvl.includes('diploma');
             });

             if (activeSubTab !== 'All') {
                if (activeSubTab === 'Diploma') {
                   streamCourses = streamCourses.filter(c => (c.category || '').toLowerCase().includes('diploma') || (c.level || '').toLowerCase().includes('diploma'));
                } else {
                   streamCourses = streamCourses.filter(c => (c.category || '').toLowerCase() === activeSubTab.toLowerCase());
                }
             }

             setExplorerData([{
               categoryName: activeSubTab === 'All' ? 'Available Courses After 10th' : `${activeSubTab} Courses`,
               courseCount: streamCourses.length,
               collegeCount: 0,
               courses: streamCourses,
               colleges: []
             }]);
           }
        } else if (cleanLevel === '12') {
          const query = { 
            search: searchQuery.trim(),
            level: cleanLevel
          }
          if (activeSubTab !== 'All') query.category = activeSubTab
          
          const res = await courseService.getExplorerData(query)
          if (res.success) {
             const data = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : [])
             setExplorerData(data)
             if (activeSec === 'Colleges') setColleges(data)
             if (activeSec === 'Careers') setCourses(data)
          }
        }
      } catch (err) {
        console.error('Error fetching explorer data', err)
      } finally {
        setExplorerLoading(false)
      }
    }
    
    const t = setTimeout(fetchExplorerData, 350)
    return () => clearTimeout(t)
  }, [activeSec, activeSubTab, searchQuery, cleanLevel])

  useEffect(() => {
    if (activeSec !== 'College Mapping') return;
    
    const fetchMapping = async () => {
      setMappingLoading(true)
      try {
        const levelFilter = cleanLevel === '10' ? 'diploma' : (cleanLevel === '12' ? 'after12th' : '')
        const res = await axiosInstance.get('/college-courses')
        if (res.data.success) {
          let data = res.data.data
          if (levelFilter) {
             data = data.map(college => ({
               ...college,
               coursesOffered: college.coursesOffered.filter(c => 
                 c.level === levelFilter || (cleanLevel === '12' && c.level === 'diploma')
               )
             })).filter(college => college.coursesOffered.length > 0)
          }
          setMappingData(data)
        }
      } catch (err) {
        console.error('Mapping fetch error', err)
      } finally {
        setMappingLoading(false)
      }
    }
    fetchMapping()
  }, [activeSec, cleanLevel, activeSubTab, searchQuery])

  const fetchContent = async () => {
    try {
      setLoading(true)

      const [contentRes, scholarshipRes, careerRes, examRes] = await Promise.all([
        classContentService.getPublicList({ targetClass: cleanLevel }).catch(() => null),
        axiosInstance.get(`/scholarships`, { 
          params: { grade: `${cleanLevel}th`, userSide: true } 
        }).catch(() => null),
        careerService.getAll({ level: cleanLevel }).catch(() => null),
        examService.getAllExams().catch(() => null)
      ])

      const contentList = contentRes?.data || (Array.isArray(contentRes) ? contentRes : [])
      const scholarshipList = scholarshipRes?.data?.data || (Array.isArray(scholarshipRes?.data) ? scholarshipRes.data : [])
      const careerList = careerRes?.data || (Array.isArray(careerRes) ? careerRes : [])
      
      if (examRes && examRes.success) {
        setExams(examRes.data || [])
      }

      // Merge curated content and career paths
      const allFetchedContent = [
        ...contentList,
        ...(careerList || []).map(c => ({
          ...c,
          sectionType: 'Careers',
          title: c.title || c.careerName,
          category: c.category || 'Featured Path',
          slug: c.slug || c._id
        }))
      ]
      
      setContents(allFetchedContent)
      
      if (scholarshipRes && scholarshipRes.success !== false) {
        const mappedScholarships = scholarshipList.map(s => ({
          ...s,
          title: s.scholarshipName,
          coverImage: s.image,
          shortDescription: s.benefit || s.eligibility || s.description || "Active scholarship for students.",
          sectionType: 'Scholarships',
          category: s.category || 'Direct',
          subCategoryLabel: s.provider,
          slug: `direct-${s._id}`,
          isDirect: true
        }))
        setScholarships(mappedScholarships)
      }

    } catch {
      setAlert({ type: 'error', text: 'Failed to load content.' })
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedItems = async () => {
    try {
      const res = await userActionService.getSavedList('ClassContent')
      if (res.success) {
        setSavedIds(new Set(res.data.map(item => item.contentId._id || item.contentId)))
      }
    } catch (err) { console.error('Saved list error', err) }
  }

  const handleSaveAction = async (item) => {
    if (!isAuthenticated) {
      setAuthData({ 
        isOpen: true, 
        message: 'Please sign in to save this to your profile.',
        pendingAction: () => handleSaveAction(item) 
      })
      return
    }

    try {
      // Determine contentType
      let contentType = 'ClassContent';
      if (item.isDirect) contentType = 'Scholarship';
      else if (item.conductingBody) contentType = 'Exam';
      else if (item.courseName) contentType = 'Course';
      else if (item.careerName) contentType = 'CareerPath';
      else if (item.sectionType === 'Careers') contentType = 'CareerPath';

      if (savedIds.has(item._id)) {
        await userActionService.unsaveItem(item._id)
        const newSet = new Set(savedIds)
        newSet.delete(item._id)
        setSavedIds(newSet)
        setAlert({ type: 'info', text: 'Removed from your library' })
      } else {
        await userActionService.saveItem(item._id, contentType)
        setSavedIds(new Set([...savedIds, item._id]))
        setAlert({ type: 'success', text: 'Saved to success path! ✨' })
      }
      setTimeout(() => setAlert({ type: '', text: '' }), 3000)
    } catch {
      setAlert({ type: 'error', text: 'Action failed.' })
    }
  }

  const availableSections = useMemo(() => {
    if (loading) return sections;
    return sections.filter(s => {
      if (s.id === 'Colleges' || s.id === 'College Mapping') return true;
      const allItems = [...(contents || []), ...(scholarships || [])];
      return allItems.some(c => c.sectionType === s.id);
    });
  }, [sections, contents, scholarships, loading]);

  useEffect(() => {
    if (!loading && availableSections.length > 0 && !availableSections.find(s => s.id === activeSec)) {
      setActiveSec(availableSections[0].id);
    }
  }, [loading, availableSections, activeSec]);

  const filteredContent = useMemo(() => {
    const allItems = [...(contents || []), ...(scholarships || [])]

    return allItems.filter(c => {
      const matchesSection = c.sectionType === activeSec
      const titleStr = c.title || ''
      const descStr = c.shortDescription || ''
      const matchesSearch = titleStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            descStr.toLowerCase().includes(searchQuery.toLowerCase())
      
      let matchesSubTab = true;
      if (activeSubTab !== 'All') {
        if (['Streams', 'Scholarships', 'Entrance Exams', 'Careers'].includes(activeSec)) {
           matchesSubTab = c.category === activeSubTab || c.subCategoryLabel === activeSubTab;
        }
      }

      return matchesSection && matchesSearch && matchesSubTab
    })
  }, [contents, scholarships, activeSec, searchQuery, activeSubTab])

  const filteredExams = useMemo(() => {
    return exams.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            e.conductingBody.toLowerCase().includes(searchQuery.toLowerCase());
      let matchesSubTab = true;
      if (activeSubTab !== 'All') {
         matchesSubTab = e.category === activeSubTab;
      }
      return matchesSearch && matchesSubTab;
    }).sort((a, b) => {
       if (a.name === 'TNEA') return -1;
       if (b.name === 'TNEA') return 1;
       return 0;
    });
  }, [exams, searchQuery, activeSubTab])

  const handleCardClick = (item) => {
    if (item.isDirect) {
      if (item.applicationLink) window.open(item.applicationLink, '_blank');
      else alert("No direct application link provided for this item.");
    } else {
      if (cleanLevel === '5' && item.title === 'Communication Skills') {
        navigate('/student/class5/skills/communicationskills');
      } else {
        navigate(`/student/career-path/class-${cleanLevel}/${item.slug}`);
      }
    }
  }

  const activeSecLabel = sections.find(s => s.id === activeSec)?.label || ''

  return (
    <div className="student-root" style={{ background: '#fbfdff', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header Section (Class 5 UI theme) */}
      <section style={{
        padding: '34px 24px 0',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #eaf3fb 0%, #fbfdff 100%)',
        borderBottom: '1px solid #eef3f8',
        marginBottom: 30,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: ACCENT, background: '#fff', border: '1px solid #dbe7f1',
            borderRadius: 99, padding: '6px 14px', marginBottom: 12,
          }}>
            Uyarvu Payanam · Class {cleanLevel}
          </span>
          <h1 style={{
            fontFamily: 'var(--s-font-display)', fontWeight: 900,
            fontSize: 'clamp(28px, 4vw, 40px)', margin: '0 0 8px',
            color: C5.ink, letterSpacing: '-0.02em',
          }}>
            Class {cleanLevel} <span style={{ color: ACCENT }}>Guidance</span>
          </h1>
          <p style={{ fontSize: 15.5, color: C5.muted, maxWidth: 620, margin: '0 auto 0', lineHeight: 1.6 }}>
            Explore scholarships, skills, exams, habits, and the future opportunities this stage opens up.
          </p>
          <div style={{ padding: '26px 0 0', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {Number(cleanLevel) === 12 && (
              <SBtn variant="white" onClick={() => navigate('/student/colleges')} style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 14, padding: '12px 28px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FiMapPin size={16} /> Explore Colleges
              </SBtn>
            )}
            <SBtn variant="white" onClick={() => document.getElementById('explorer-start')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: '#fff', color: ACCENT, border: '1px solid #dbe7f1', borderRadius: 14, padding: '12px 28px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <FiChevronDown size={16} /> Start Exploring
            </SBtn>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <section id="explorer-start" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* Breadcrumb back to the journey */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: '#94a3b8', marginBottom: 22, flexWrap: 'wrap' }}>
          <Link to="/explore" style={{ color: ACCENT, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <FiArrowLeft size={13} /> Career Journey
          </Link>
          <span aria-hidden="true">›</span>
          <span>Class {cleanLevel}</span>
          {activeSecLabel && (
            <React.Fragment>
              <span aria-hidden="true">›</span>
              <span style={{ color: '#334155' }}>{activeSecLabel}</span>
            </React.Fragment>
          )}
        </nav>

        {/* Section Tabs (Class 5 pill nav) */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8,
          background: '#f7fafc', border: '1px solid #eaf0f6',
          borderRadius: 99, padding: 6,
          marginBottom: activeSec === 'Streams' ? 20 : 36,
          position: 'sticky', top: 20, zIndex: 100,
        }}>
          {availableSections.map(s => {
            const selected = activeSec === s.id
            return (
              <button
                key={s.id}
                onClick={() => { setActiveSec(s.id); setActiveSubTab('All'); }}
                style={{
                  flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '10px 16px', borderRadius: 99, fontSize: 13.5, fontWeight: 700,
                  fontFamily: 'var(--s-font-display)', cursor: 'pointer', whiteSpace: 'nowrap',
                  color: selected ? '#fff' : C5.muted,
                  background: selected ? ACCENT : 'transparent',
                  boxShadow: selected ? '0 6px 14px -6px rgba(124,58,237,0.55)' : 'none',
                  transition: 'all 0.18s ease',
                }}
              >
                <s.icon size={16} strokeWidth={2.4} style={{ opacity: selected ? 1 : 0.75, color: selected ? '#fff' : s.color }} />
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Sub-Tabs for Targeted Sections */}
        {['Streams', 'Scholarships', 'Entrance Exams'].includes(activeSec) && !(cleanLevel === '10' && activeSec === 'Streams') && !(cleanLevel === '12' && activeSec === 'Entrance Exams') && (
          <div style={{ 
            display: 'flex', gap: 10, overflowX: 'auto', padding: '10px 10px 30px', 
            marginBottom: 30, justifyContent:'center', flexWrap:'wrap'
          }}>
            {(activeSec === 'Scholarships' ? [] : ['All']).concat(
               activeSec === 'Streams' ? STREAM_TABS : 
               activeSec === 'Scholarships' ? SCHOLARSHIP_TABS : 
               activeSec === 'Colleges' ? COLLEGE_TABS :
               activeSec === 'Careers' ? CATEGORY_TABS :
               (EXAM_TABS[cleanLevel] || EXAM_TABS.default)
            ).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                style={{
                  padding: '8px 24px', borderRadius: 99, border: activeSubTab === tab ? `2px solid ${ACCENT}` : '1px solid #e2e8f0',
                  background: activeSubTab === tab ? '#F5ECFF' : '#fff',
                  color: activeSubTab === tab ? ACCENT : '#64748b',
                  fontWeight: 700, fontSize:13, cursor: 'pointer', transition: 'all 0.2s', whiteSpace:'nowrap'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '100px 0' }}><SLoader /></div>
        ) : (
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:30 }}>
               <div>
                 <h2 style={{ fontSize:28, fontWeight:900, color: C5.ink, letterSpacing: '-0.02em' }}>
                   {activeSec === 'Scholarships' ? `Scholarships for Class ${cleanLevel} Students` :
                    activeSec === 'Exams' ? `Exams for Class ${cleanLevel} Students` :
                    activeSec === 'Skills' ? `Skills to Build in Class ${cleanLevel}` : `${activeSec} Insight`}
                 </h2>
                 {activeSec === 'Scholarships' && (
                   <p style={{ color:'#64748b', fontSize: 16, marginTop: 8, margin: '8px 0 0 0' }}>Explore available scholarships you are eligible for.</p>
                 )}
                 {activeSec === 'Exams' && (
                   <p style={{ color:'#64748b', fontSize: 16, marginTop: 8, margin: '8px 0 0 0' }}>Explore useful exams, learn what to study, and prepare in a simple way.</p>
                 )}
                 {activeSec === 'Skills' && (
                   <p style={{ color:'#64748b', fontSize: 16, marginTop: 8, margin: '8px 0 0 0' }}>Grow your abilities step by step!</p>
                 )}
               </div>
            </div>

             <div style={{ display: 'grid', gridTemplateColumns: activeSec === 'Scholarships' ? 'repeat(auto-fill, minmax(340px, 1fr))' : '1fr', gap: 32 }}>
                {activeSec === 'Careers' && cleanLevel !== '12' && filteredContent.length > 0 && (
                   <div style={{ marginBottom: 40 }}>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(360px, 1fr))', gap:32 }}>
                         {filteredContent.map(item => (
                            <div key={item._id} style={{ background:'#fff', padding:32, borderRadius:32, border:'1px solid #f1f5f9', position: 'relative' }}>
                               <button 
                                 onClick={() => handleSaveAction(item)} 
                                 style={{ 
                                   position:'absolute', top:24, right:24, width:44, height:44, 
                                   borderRadius:99, background:'#f8fafc', border:'1px solid #e2e8f0', cursor:'pointer', 
                                   display:'grid', placeItems:'center', color: savedIds.has(item._id) ? '#ef4444' : '#64748b',
                                   transition: 'all 0.2s'
                                 }}
                               >
                                 {savedIds.has(item._id) ? <FiHeart size={20} fill="#ef4444" /> : <FiBookmark size={20} />}
                               </button>
                               <SBadge color="blue">{item.category}</SBadge>
                               <h3 style={{ fontSize:22, fontWeight:900, marginTop:16 }}>{item.title}</h3>
                               <p style={{ color:'#64748b', margin:'12px 0 20px' }}>{item.shortDescription}</p>
                               <SBtn variant="outline" onClick={() => navigate(`/student/career-path/class-${cleanLevel}/${item.slug || item._id}`)}>View Guidance</SBtn>
                            </div>
                         ))}
                      </div>
                   </div>
                )}
               {/* --- CLASS 10 STREAMS (data-driven flip cards from /api/streams) --- */}
               {activeSec === 'Streams' && cleanLevel === '10' && (
                  <div style={{ gridColumn: '1/-1' }}>
                     <StreamsInsight />
                  </div>
               )}

               {/* --- CLASS 12 COLLEGES INSIGHT (live counts from /api/colleges-insight) --- */}
               {activeSec === 'Colleges' && cleanLevel === '12' ? (
                  <div style={{ gridColumn: '1/-1' }}>
                     <CollegesInsight />
                  </div>
               ) : (activeSec === 'Careers') && cleanLevel === '12' ? (
                  explorerLoading ? (
                    <div style={{ gridColumn: '1/-1', padding: '100px 0' }}><SLoader /></div>
                  ) : explorerData.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign:'center', padding:'100px 0', background:'#fff', borderRadius:32, border:'1px dashed #cbd5e1' }}>
                      <SEmpty icon={activeSec === 'Careers' ? <FiBriefcase size={48} /> : <FiMapPin size={48} />} title={`No ${activeSec.toLowerCase()} found`} desc="We couldn't find matching data for this category." />
                    </div>
                  ) : (
                    <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {explorerData.map(group => (
                        <div 
                          key={group.categoryName} 
                          onClick={() => navigate(`/student/colleges/category/${group.categoryName}`)}
                          style={{ 
                            background:'#fff', borderRadius:24, border:'1px solid #f1f5f9', 
                            padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            boxShadow:'0 10px 15px -3px rgba(0,0,0,0.04)', cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          className="insight-header-hover hover-lift"
                        >
                          <div style={{ display:'flex', alignItems:'center', gap:24 }}>
                             <div style={{ 
                               width:64, height:64, borderRadius:20, 
                               background: `linear-gradient(135deg, ${ACCENT} 0%, #a855f7 100%)`, 
                               color:'#fff', display:'grid', placeItems:'center', fontWeight:900, fontSize:24,
                               boxShadow: '0 10px 20px -5px rgba(124, 58, 237, 0.4)'
                             }}>
                                {group.categoryName.substring(0, 1).toUpperCase()}
                             </div>
                             <div>
                                <h3 style={{ margin:0, fontSize:24, fontWeight:900, color:'#1e293b', letterSpacing: '-0.02em' }}>{group.categoryName} Insight</h3>
                                <div style={{ display:'flex', gap:24, marginTop:8 }}>
                                   <span style={{ fontSize:14, color:'#64748b', fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
                                      <FiBookOpen size={16} color="#6366f1" /> {group.courseCount} Specialized Courses
                                   </span>
                                   <span style={{ fontSize:14, color:'#64748b', fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
                                      <FiMapPin size={16} color="#f59e0b" /> {group.collegeCount} Recognized Colleges
                                   </span>
                                </div>
                              </div>
                          </div>
                          <div style={{ background: '#f8fafc', width: 48, height: 48, borderRadius: 12, display: 'grid', placeItems: 'center', color: '#64748b' }}>
                             <FiArrowRight size={22} />
                          </div>
                        </div>
                      ))}
                     </div>
                   )
                ) : activeSec === 'College Mapping' ? (
                  mappingLoading ? (
                    <div style={{ gridColumn: '1/-1', padding: '100px 0' }}><SLoader /></div>
                  ) : mappingData.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign:'center', padding:'100px 0', background:'#fff', borderRadius:32, border:'1px dashed #cbd5e1' }}>
                      <SEmpty icon={<FiLink size={48} />} title="No mappings found" desc="Contact admin to map colleges to courses for this level." />
                    </div>
                  ) : (
                    mappingData.map(clg => (
                      <div key={clg._id} style={{ background:'#fff', borderRadius:24, border:'1px solid #f1f5f9', padding:24, boxShadow:'0 10px 15px -3px rgba(0,0,0,0.02)' }}>
                        <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:20 }}>
                          <div style={{ width:48, height:48, borderRadius:12, background:'var(--s-primary-l)', color:'var(--s-primary)', display:'grid', placeItems:'center', fontSize:20 }}><FiMapPin size={24} /></div>
                          <div>
                            <h3 style={{ margin:0, fontSize:18, fontWeight:900 }}>{clg.collegeName}</h3>
                            <div style={{ fontSize:13, color:'#64748b' }}><FiMapPin size={12} /> {clg.location}, {clg.district}</div>
                          </div>
                        </div>
                        
                        <div style={{ background:'#f8fafc', borderRadius:16, padding:16 }}>
                          <div style={{ fontSize:12, fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>Courses Available</div>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                            {clg.coursesOffered && clg.coursesOffered.map(c => (
                              <span key={c._id} style={{ background:'#fff', border:'1px solid #e2e8f0', padding:'6px 12px', borderRadius:8, fontSize:13, fontWeight:600 }}>
                                {c.courseName}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div style={{ marginTop:20, display:'flex', justifyContent:'flex-end' }}>
                          <SBtn variant="outline" size="sm" onClick={() => navigate(`/student/colleges/${clg._id}`)}>View College Details</SBtn>
                        </div>
                      </div>
                    ))
                  )
                ) : activeSec === 'Entrance Exams' && cleanLevel === '12' ? (
                  <div style={{ gridColumn: '1/-1' }}>
                      {/* Stream → Career Mapping (clean white card, professional) */}
                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 28, marginBottom: 24, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)' }}>
                         <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>Stream → Career Mapping</h3>
                         <p style={{ margin: '0 0 20px', fontSize: 13.5, fontWeight: 600, color: '#64748b' }}>Career directions your Class 12 stream opens up.</p>
                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                            {[
                               { name: 'Science (PCM)', careers: 'Engineering, Architecture, Defence, Data Science', tone: '#2563eb' },
                               { name: 'Science (PCB)', careers: 'Medical, Pharmacy, Nursing, Biotechnology', tone: '#059669' },
                               { name: 'Commerce', careers: 'CA, CS, B.Com, BBA, Banking & Finance', tone: '#d97706' },
                               { name: 'Arts & Humanities', careers: 'Law, Civil Services, Design, Journalism, Teaching', tone: '#7c3aed' },
                            ].map((s) => (
                               <div key={s.name} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: '14px 16px' }}>
                                  <div style={{ fontWeight: 800, fontSize: 14.5, color: s.tone, marginBottom: 6 }}>{s.name}</div>
                                  <div style={{ fontSize: 13, lineHeight: 1.5, color: '#475569' }}>{s.careers}</div>
                               </div>
                            ))}
                         </div>
                      </div>

                      {/* Tamil Nadu Entrance Facts (clean white card, professional) */}
                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, marginBottom: 36, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)' }}>
                         <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: '0 0 16px' }}>Tamil Nadu Entrance Facts</h3>
                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                            {[
                               { label: 'Engineering', fact: 'TNEA — marks based, no entrance test', tone: '#2563eb' },
                               { label: 'Medical', fact: 'NEET compulsory', tone: '#059669' },
                               { label: 'Arts & Science', fact: 'Merit or CUET', tone: '#7c3aed' },
                            ].map((f) => (
                               <div key={f.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                  <div style={{ marginTop: 4, width: 8, height: 8, borderRadius: 99, background: f.tone, flexShrink: 0 }} />
                                  <div>
                                     <div style={{ fontWeight: 800, fontSize: 13, color: '#334155' }}>{f.label}</div>
                                     <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>{f.fact}</div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>

                     {/* Exams List */}
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 32 }}>
                        {filteredExams.length === 0 ? (
                           <div style={{ gridColumn: '1/-1', textAlign:'center', padding:'50px 0', background:'#fff', borderRadius:32, border:'1px dashed #cbd5e1' }}>
                             <SEmpty title="No exams found" desc="We couldn't find any exams matching your criteria." />
                           </div>
                        ) : (
                           filteredExams.map(exam => (
                             <div key={exam._id} style={{ background: '#fff', padding: 24, borderRadius: 24, border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }} className="hover-lift">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                   <div>
                                     <SBadge color="blue">{exam.category}</SBadge>
                                     <h3 style={{ fontSize: 20, fontWeight: 900, marginTop: 12, color: '#0f172a', lineHeight: 1.2 }}>{exam.name}</h3>
                                     <p style={{ color: '#64748b', fontSize: 13, margin: '6px 0 0 0', fontWeight: 600 }}>Conducted by {exam.conductingBody}</p>
                                   </div>
                                   <SBadge color={exam.difficulty === 'Hard' || exam.difficulty === 'Very Hard' ? 'red' : exam.difficulty === 'Moderate' ? 'yellow' : 'green'}>
                                      {exam.difficulty}
                                   </SBadge>
                                </div>

                                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 16, marginBottom: 20, fontSize: 13 }}>
                                   <div style={{ display: 'flex', marginBottom: 6 }}><strong style={{ width: 85, color: '#475569', flexShrink: 0 }}>Eligibility:</strong> <span>{exam.eligibility}</span></div>
                                   <div style={{ display: 'flex', marginBottom: 6 }}><strong style={{ width: 85, color: '#475569', flexShrink: 0 }}>Subjects:</strong> <span>{exam.subjects?.join(', ')}</span></div>
                                   <div style={{ display: 'flex', marginBottom: 6 }}><strong style={{ width: 85, color: '#475569', flexShrink: 0 }}>Pattern:</strong> <span>{exam.pattern}</span></div>
                                   <div style={{ display: 'flex' }}><strong style={{ width: 85, color: '#475569', flexShrink: 0 }}>Dates:</strong> <span style={{ color: '#ea580c', fontWeight: 700 }}>{exam.importantDates}</span></div>
                                </div>

                                {/* Tabs inside Card: Preparation | Careers | Resources */}
                                <div style={{ flex: 1 }}>
                                   <ExamCardDetails exam={exam} />
                                </div>
                                
                                <SBtn variant="outline" style={{ width: '100%', marginTop: 20, borderRadius: 12 }} onClick={() => window.open(exam.officialWebsite, '_blank')}>
                                   Official Website ↗
                                </SBtn>
                             </div>
                           ))
                        )}
                     </div>
                  </div>
                ) : activeSec === 'Entrance Exams' && cleanLevel === '10' ? (
                  <Class10ExamPanel />
                ) : activeSec === 'Streams' && cleanLevel === '10' ? null
                : filteredContent.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign:'center', padding:'100px 0', background:'#fff', borderRadius:32, border:'1px dashed #cbd5e1' }}>
                  <SEmpty title="Nothing found yet" desc={`We haven't added items to ${activeSec} for Class ${cleanLevel} yet.`} />
                </div>
              ) : (
                <React.Fragment>
                  {activeSec === 'Games' && (
                    <div style={{ gridColumn: '1/-1', marginBottom: 32 }}>
                      <ActivityCard
                        title="Pattern Master"
                        category="Games"
                        description="Find the pattern and discover what comes next!"
                        skill="Logical Thinking"
                        difficulty="Beginner"
                        cta="Play Now"
                        emoji="🔍"
                        gradient="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                        onStart={() => navigate('/student/class5/games/pattern-master')}
                      />
                    </div>
                  )}
                {filteredContent.map(item => {
                  if (item.isDirect) {
                    return (
                      <div key={item._id} style={{ 
                        background:'#fff', borderRadius:32, border:'1px solid #f1f5f9', 
                        overflow:'hidden', display:'flex', flexDirection:'column', 
                        boxShadow:'0 10px 15px -3px rgba(0,0,0,0.02)', transition:'0.3s' 
                      }} className="hover-lift">
                        <div style={{ padding: 32, flex:1, display:'flex', flexDirection:'column', position: 'relative' }}>
                          <button 
                            onClick={() => handleSaveAction(item)} 
                            style={{ 
                              position:'absolute', top:24, right:24, width:44, height:44, 
                              borderRadius:99, background:'#f8fafc', border:'1px solid #e2e8f0', cursor:'pointer', 
                              display:'grid', placeItems:'center', color: savedIds.has(item._id) ? '#ef4444' : '#64748b',
                              transition: 'all 0.2s'
                            }}
                          >
                            {savedIds.has(item._id) ? <FiHeart size={20} fill="#ef4444" /> : <FiBookmark size={20} />}
                          </button>

                          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', paddingRight: 50 }}>
                             <SBadge color="green">Scholarship</SBadge>

                             {(item.grades || []).map(g => <SBadge key={g} color="purple">{g}</SBadge>)}
                          </div>
                          
                          <h3 style={{ fontSize:22, fontWeight:900, margin:'0 0 8px', lineHeight:1.3 }}>{item.scholarshipName}</h3>
                          <div style={{ fontSize:14, fontWeight:700, color:'#64748b', marginBottom:20, display:'flex', alignItems:'center', gap:6 }}>
                             <FiBriefcase size={14}/> {item.provider || "Unknown Provider"}
                          </div>
                          
                          <div style={{ background:'#f8fafc', borderRadius:16, padding:16, marginBottom:20, flex:1 }}>
                             {item.benefit && (
                                <div style={{ marginBottom:12 }}>
                                  <div style={{ fontSize:11, fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Benefit</div>
                                  <div style={{ fontSize:15, fontWeight:800, color:'#10b981' }}>{item.benefit}</div>
                                </div>
                             )}
                             {item.eligibility && (
                                <div style={{ marginBottom:12 }}>
                                  <div style={{ fontSize:11, fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Eligibility</div>
                                  <div style={{ fontSize:13, fontWeight:600, color:'#334155', lineHeight: 1.5 }}>{item.eligibility}</div>
                                </div>
                             )}
                             {item.deadline && (
                                <div>
                                  <div style={{ fontSize:11, fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Last Date</div>
                                  <div style={{ fontSize:13, fontWeight:700, color:'#ef4444' }}>{item.deadline}</div>
                                </div>
                             )}
                          </div>
                          
                          <SBtn 
                             variant="outline"
                             style={{ width:'100%', borderRadius:16, padding:'14px 0', border: `2px solid ${ACCENT}`, color: ACCENT }} 
                             onClick={() => handleCardClick(item)}
                          >
                             Apply / View Details ↗
                          </SBtn>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={item._id} style={{ 
                      background:'#fff', borderRadius:32, border:'1px solid #f1f5f9', 
                      overflow:'hidden', display:'flex', flexDirection:'column', 
                      boxShadow:'0 10px 15px -3px rgba(0,0,0,0.02)', transition:'0.3s' 
                    }} className="hover-lift">
                      <div style={{ width: '100%', height: 230, position:'relative' }}>
                        <img src={item.coverImage || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          onClick={() => handleSaveAction(item)} 
                          style={{ 
                            position:'absolute', top:20, right:20, width:48, height:48, 
                            borderRadius:99, background:'#fff', border:'none', cursor:'pointer', 
                            display:'grid', placeItems:'center', color: savedIds.has(item._id) ? '#ef4444' : '#64748b',
                            boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'
                          }}
                        >
                          {savedIds.has(item._id) ? <FiHeart size={22} fill="#ef4444" /> : <FiBookmark size={22} />}
                        </button>
                      </div>
                      <div style={{ padding: 32, flex:1, display:'flex', flexDirection:'column' }}>
                         <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                            {item.featured && <SBadge color="gold">FEATURED</SBadge>}
                            <SBadge color="blue">{item.category}</SBadge>
                            {item.subCategoryLabel && <SBadge color="gray">{String(item.subCategoryLabel).toUpperCase()}</SBadge>}
                         </div>
                         <h3 style={{ fontSize:22, fontWeight:900, margin:'0 0 12px', lineHeight:1.3 }}>{item.title}</h3>
                         <p style={{ color:'#64748b', marginBottom:24, lineHeight:1.6 }}>{item.shortDescription}</p>
                         <SBtn 
                            variant="primary"
                            style={{ width:'100%', marginTop:'auto', borderRadius:16, padding:'14px 0' }} 
                            onClick={() => handleCardClick(item)}
                         >
                            Explore Detailed Guide
                         </SBtn>
                       </div>
                     </div>
                   )
                 })
                }
                </React.Fragment>
              )}
            </div>
          </div>
        )}
      </section>

      <AuthModal isOpen={authData.isOpen} onClose={() => setAuthData({...authData, isOpen:false})} message={authData.message} onLoginSuccess={() => fetchSavedItems()} />
      {alert.text && <div style={{ position:'fixed', bottom:40, right:40, zIndex:1000 }}><SAlert type={alert.type}>{alert.text}</SAlert></div>}
    </div>
  )
}

