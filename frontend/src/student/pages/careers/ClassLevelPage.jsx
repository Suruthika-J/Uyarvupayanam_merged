import React, { useState, useEffect, useMemo } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  FiArrowLeft, FiArrowRight, FiHeart, FiFlag, FiTarget, FiStar,
  FiAward, FiActivity, FiVideo, FiBriefcase, FiInfo,
  FiBookmark, FiCompass, FiSearch, FiLayers, FiDollarSign,
  FiFileText, FiLink, FiHelpCircle, FiBookOpen, FiChevronDown, FiChevronUp, FiMapPin,
  FiCheckCircle, FiClock
} from 'react-icons/fi'
import { classContentService } from '../../../services/classContentService'
import { userActionService } from '../../../services/userActionService'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { SBtn, SLoader, SEmpty, SBadge, SAlert } from '../../components/ui'
import ActivityCard from '../../components/class5/activities/ActivityCard'
import { scholarshipService, careerService } from '../../services'
import { examService } from '../../../services/examService'
import AuthModal from '../../components/ui/AuthModal'
import { courseService } from '../../../services/courseService'
import { collegeService } from '../../services/index'
import axiosInstance from '../../../config/axios'

const CLASS_SECTIONS = {
  default: [
    { id: 'Basics', label: 'Basics', icon: FiFlag, color: '#6366f1' },
    { id: 'Exams', label: 'Exams', icon: FiAward, color: '#f59e0b' },
    { id: 'Scholarships', label: 'Scholarships', icon: FiDollarSign, color: '#10b981' },
    { id: 'Fun', label: 'Fun', icon: FiActivity, color: '#ec4899' },
    { id: 'Skills', label: 'Skills', icon: FiTarget, color: '#10b981' },
    { id: 'Games', label: 'Games', icon: FiStar, color: '#8b5cf6' },
    { id: 'Videos', label: 'Videos', icon: FiVideo, color: '#ef4444' },
    { id: 'Habits', label: 'Habits', icon: FiHeart, color: '#f43f5e' },
  ],
  "5": [
    { id: 'Basics', label: 'Basics', icon: FiFlag, color: '#6366f1' },
    { id: 'Scholarships', label: 'Scholarships', icon: FiDollarSign, color: '#10b981' },
    { id: 'Skills', label: 'Skills', icon: FiTarget, color: '#10b981' },
  ],
  "8": [
    { id: 'Basics', label: 'Basics', icon: FiFlag, color: '#6366f1' },
    { id: 'Entrance Exams', label: 'Entrance Exams', icon: FiFileText, color: '#8b5cf6' },
    { id: 'Scholarships', label: 'Scholarships', icon: FiDollarSign, color: '#10b981' },
    { id: 'Skills', label: 'Skills', icon: FiTarget, color: '#ec4899' },
    { id: 'Careers', label: 'Careers', icon: FiBriefcase, color: '#3b82f6' },
    { id: 'Habits', label: 'Habits', icon: FiHeart, color: '#f43f5e' },
  ],
  "10": [
    { id: 'Streams', label: 'Streams', icon: FiLayers, color: '#f59e0b' },
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

const SKILL_BADGE_STYLE = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  height: 26, padding: '0 12px', borderRadius: 99,
  fontSize: 12, fontWeight: 600, lineHeight: 1,
  fontFamily: 'var(--s-font-display)', letterSpacing: '0.02em',
  whiteSpace: 'nowrap',
};
const SKILL_BADGE_TONES = {
  gold:      { background: 'var(--s-gold-l)', color: 'var(--s-gold)' },
  primary:   { background: 'var(--s-blue-l)', color: 'var(--s-blue)' },
  secondary: { background: 'var(--s-bg2)',    color: 'var(--s-text2)' },
};

const SKILL_IMAGE_REPLACEMENTS = {
  'https://images.unsplash.com/photo-1455390582262-044cdead2708?auto=format&fit=crop&q=80&w=600': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1529156069898-49953eb1b5ce?auto=format&fit=crop&q=80&w=600': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1546410531-ea4eca38d8cb?q=80&w=1200&auto=format&fit=crop': 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1592188657297-c6473602410a?q=80&w=1200': 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1621453229864-7729f270b224?q=80&w=1200': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200',
  'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=1200&auto=format&fit=crop': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
};
const resolveCardImage = (coverImage) => SKILL_IMAGE_REPLACEMENTS[coverImage] || coverImage;

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

const CLASS_10_STREAMS_DATA = {
    Science: [
        { title: "1️⃣ Maths + Biology (PCMB)", subjects: ["Physics", "Chemistry", "Maths", "Biology"], bestFor: "Students who want both Engineering + Medical options", warning: "Heavy workload" },
        { title: "2️⃣ Maths + Computer Science (PCM + CS)", subjects: ["Physics", "Chemistry", "Maths", "Computer Science"], bestFor: "Engineering, IT / Software, Coding careers" },
        { title: "3️⃣ Biology + Nursing Track (PCB)", subjects: ["Physics", "Chemistry", "Biology"], bestFor: "Nursing, Medical field, Paramedical courses", note: "“Nursing” is not always a subject in school, but a career path after PCB" },
        { title: "4️⃣ Maths + Business Maths", subjects: ["Maths / Applied Maths", "Commerce OR Science mix"], bestFor: "Data analysis, Finance + Tech careers" }
    ],
    Commerce: [
        { title: "5️⃣ Accountancy + Business Studies + Economics", subjects: ["Accountancy", "Business Studies", "Economics", "Maths (optional)"], bestFor: "CA / CMA / CS, Business, Banking" },
        { title: "6️⃣ Commerce + Computer Science", subjects: ["Accountancy", "Business Studies", "Computer Science", "Economics"], bestFor: "FinTech, Business + IT combination" },
        { title: "7️⃣ Commerce + Business Maths", subjects: ["Accountancy", "Economics", "Business Maths"], bestFor: "Finance, Analytics, Banking exams" }
    ],
    Arts: [
        { title: "8️⃣ History + Political Science + Geography", subjects: [], bestFor: "Government exams, UPSC / TNPSC, Teaching" },
        { title: "9️⃣ Psychology + Sociology + English", subjects: [], bestFor: "Psychology, HR, Social work" },
        { title: "🔟 Arts + Computer Applications", subjects: [], bestFor: "Media, Digital careers, Design" }
    ]
};

const ExamCardDetails = ({ exam }) => {
  const [tab, setTab] = useState('Prep');
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
        {['Prep', 'Careers', 'Resources'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ 
            background: 'none', border: 'none', padding: '4px 8px', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, color: tab === t ? '#3b82f6' : '#94a3b8',
            borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent'
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
  const [activeSec, setActiveSec] = useState('Basics')
  const [activeSubTab, setActiveSubTab] = useState('All') 
  const [authData, setAuthData] = useState({ isOpen: false, message: '', pendingAction: null })
  const { isAuthenticated } = useStudentAuth()
  const [savedIds, setSavedIds] = useState(new Set())
  const [alert, setAlert] = useState({ type: '', text: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [courses, setCourses] = useState([])
  const [colleges, setColleges] = useState([]) 
  const [exams, setExams] = useState([]) 
  const [explorerData, setExplorerData] = useState([])
  const [explorerLoading, setExplorerLoading] = useState(false)
  const [expandedCourseCat, setExpandedCourseCat] = useState(null)
  const [mappingData, setMappingData] = useState([])
  const [mappingLoading, setMappingLoading] = useState(false)
  const isScopedBadge = (activeSec === 'Skills' && ['5','8','10'].includes(cleanLevel)) || (activeSec === 'Entrance Exams' && cleanLevel === '10')
  
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
      setActiveSec('Basics');
    }
    setActiveSubTab('All');
  }, [cleanLevel, location.search]);

  useEffect(() => {
    if (!['Careers', 'Colleges', 'Streams'].includes(activeSec)) return;
    
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

    } catch (err) {
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
    } catch (err) {
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

  return (
    <div className="student-root" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header Section */}
      <section style={{ 
        padding: '50px 24px', textAlign: 'center', 
        background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: '#fff',
        borderBottom: '1px solid #f1f5f9', marginBottom: 40,
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 'clamp(32px, 5vw, 48px)', margin: '0 0 16px', color: '#fff', letterSpacing: '-0.02em' }}>
            Class {cleanLevel} Guidance
          </h1>
          <p style={{ fontSize: 18, color: '#e0e7ff', maxWidth: 650, margin: '0 auto 24px' }}>
            Explore scholarships, skills, exams, habits, and future opportunities.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            {Number(cleanLevel) === 12 && (
              <SBtn variant="white" onClick={() => navigate('/student/colleges')} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 14, padding: '12px 28px', fontWeight: 800 }}>
                 🏫 Explore Colleges
              </SBtn>
            )}
            <SBtn variant="white" onClick={() => navigate('/student/signup')} style={{ borderRadius: 14, padding: '12px 28px', fontWeight: 800 }}>
               🚀 Start Exploring
            </SBtn>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        
        {/* Section Tabs */}
        <div style={{ 
          display: 'flex', gap: 6, overflowX: 'auto', padding: '8px', 
          backgroundColor:'rgba(255,255,255,0.7)', backdropFilter:'blur(20px)', borderRadius:24, boxShadow:'0 20px 25px -5px rgba(0,0,0,0.05)',
          marginBottom: activeSec === 'Streams' ? 20 : 50, border:'1px solid rgba(255,255,255,0.5)', position:'sticky', top:20, zIndex:100
        }}>
          {availableSections.map(s => {
            const isClass5BasicsActive = cleanLevel === '5' && s.id === 'Basics' && activeSec === 'Basics';
            return (
              <button
                key={s.id}
                onClick={() => { setActiveSec(s.id); setActiveSubTab('All'); }}
                style={{
                  flexShrink: 0,
                  padding: isClass5BasicsActive ? '0 12px' : '14px 24px',
                  borderRadius: isClass5BasicsActive ? 99 : 18,
                  height: isClass5BasicsActive ? 26 : 'auto',
                  minHeight: isClass5BasicsActive ? 26 : 'auto',
                  gap: isClass5BasicsActive ? 6 : 10,
                  border: 'none',
                  background: activeSec === s.id ? s.color : 'transparent',
                  color: activeSec === s.id ? '#fff' : '#475569',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: isClass5BasicsActive ? 600 : 800,
                  fontSize: isClass5BasicsActive ? 12 : 14,
                  lineHeight: isClass5BasicsActive ? 1 : 'normal',
                  fontFamily: isClass5BasicsActive ? 'var(--s-font-display)' : 'inherit',
                  letterSpacing: isClass5BasicsActive ? '0.02em' : 'normal',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isClass5BasicsActive ? `0 6px 12px -5px ${s.color}88` : (activeSec === s.id ? `0 10px 15px -3px ${s.color}44` : 'none'),
                  transform: activeSec === s.id ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <s.icon size={isClass5BasicsActive ? 14 : 18} style={{ opacity: activeSec === s.id ? 1 : 0.7 }} /> {s.label}
              </button>
            );
          })}
        </div>

        {/* Sub-Tabs for Targeted Sections */}
        {['Streams', 'Scholarships', 'Entrance Exams'].includes(activeSec) && (
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
                  padding: '8px 24px', borderRadius: 99, border: activeSubTab === tab ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  background: activeSubTab === tab ? '#eff6ff' : '#fff',
                  color: activeSubTab === tab ? '#3b82f6' : '#64748b',
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
                 <h2 style={{ fontSize:28, fontWeight:900 }}>
                   {activeSec === 'Scholarships' ? `Scholarships for Class ${cleanLevel} Students` :
                    activeSec === 'Exams' ? `Exams for Class ${cleanLevel} Students` :
                    activeSec === 'Fun' ? `Fun Learning Activities` : 
                    activeSec === 'Skills' ? `Skills to Build in Class ${cleanLevel}` : `${activeSec} Insight`}
                 </h2>
                 {activeSec === 'Scholarships' && (
                   <p style={{ color:'#64748b', fontSize: 16, marginTop: 8, margin: '8px 0 0 0' }}>Explore available scholarships you are eligible for.</p>
                 )}
                 {activeSec === 'Exams' && (
                   <p style={{ color:'#64748b', fontSize: 16, marginTop: 8, margin: '8px 0 0 0' }}>Explore useful exams, learn what to study, and prepare in a simple way.</p>
                 )}
                 {activeSec === 'Fun' && (
                   <p style={{ color:'#64748b', fontSize: 16, marginTop: 8, margin: '8px 0 0 0' }}>Learn with fun and creativity!</p>
                 )}
                 {activeSec === 'Skills' && (
                   <p style={{ color:'#64748b', fontSize: 16, marginTop: 8, margin: '8px 0 0 0' }}>Grow your abilities step by step!</p>
                 )}
               </div>
            </div>

             <div style={{ display: 'grid', gridTemplateColumns: (activeSec === 'Scholarships' || (activeSec === 'Skills' && ['5','8'].includes(cleanLevel)) || (activeSec === 'Entrance Exams' && cleanLevel === '10')) ? 'repeat(auto-fill, minmax(340px, 1fr))' : '1fr', gap: 32 }}>
               {/* --- CLASS 10 STREAMS LOGIC (STATIC CONTENT) --- */}
               {activeSec === 'Streams' && cleanLevel === '10' && activeSubTab !== 'Diploma' && (
                  <div style={{ gridColumn: '1/-1', marginBottom: 40 }}>
                    {Object.entries(CLASS_10_STREAMS_DATA)
                       .filter(([groupName]) => activeSubTab === 'All' || groupName === activeSubTab)
                       .map(([groupName, courses]) => (
                         <div key={groupName} style={{ marginBottom: 40 }}>
                            <h3 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 22, color: groupName === 'Science' ? 'var(--s-blue)' : groupName === 'Commerce' ? 'var(--s-green)' : groupName === 'Arts' ? 'var(--s-purple)' : 'var(--s-orange)', marginBottom: 20, borderBottom: `2px solid ${groupName === 'Science' ? 'var(--s-blue-l)' : groupName === 'Commerce' ? 'var(--s-green-l)' : groupName === 'Arts' ? 'var(--s-purple-l)' : 'var(--s-orange-l)'}`, paddingBottom: 10 }}>
                                {groupName === 'Science' ? "🔬 SCIENCE GROUP COURSES" : groupName === 'Commerce' ? "💼 COMMERCE GROUP COURSES" : groupName === 'Arts' ? "🎨 ARTS / HUMANITIES COURSES" : "🔧 VOCATIONAL / DIPLOMA COURSES"}
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                                {courses.map((course, cIdx) => (
                                    <div key={cIdx} style={{ background: '#fff', borderRadius: 24, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, borderTop: `4px solid ${groupName === 'Science' ? 'var(--s-blue)' : groupName === 'Commerce' ? 'var(--s-green)' : groupName === 'Arts' ? 'var(--s-purple)' : 'var(--s-orange)'}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                        <h4 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 18, margin: 0 }}>{course.title}</h4>
                                        
                                        {course.subjects.length > 0 && (
                                            <div>
                                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-text3)', textTransform: 'uppercase', letterSpacing: 1 }}>👉 Subjects</span>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                                    {course.subjects.map((sub, i) => <SBadge key={i} color="gray">{sub}</SBadge>)}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ background: 'var(--s-surface2)', padding: '12px 16px', borderRadius: 12 }}>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-primary)', textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <FiActivity /> Best For
                                            </span>
                                            <p style={{ fontSize: 14, fontWeight: 600, margin: '6px 0 0', color: 'var(--s-text)' }}>{course.bestFor}</p>
                                        </div>

                                        {course.warning && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d97706', fontSize: 13, fontWeight: 600, background: '#fef3c7', padding: '8px 12px', borderRadius: 8 }}>
                                                ⚠️ {course.warning}
                                            </div>
                                        )}

                                        {course.note && (
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--s-text2)', fontSize: 13, background: 'var(--s-surface2)', padding: '8px 12px', borderRadius: 8 }}>
                                                💡 {course.note}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                         </div>
                    ))}
                  </div>
               )}

               {/* --- CLASS 12 & DIPLOMA LOGIC (uses explorerData) --- */}
               {((activeSec === 'Careers' || activeSec === 'Colleges') && cleanLevel === '12') || (activeSec === 'Streams' && cleanLevel === '10' && (activeSubTab === 'All' || activeSubTab === 'Diploma')) ? (
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
                               background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', 
                               color:'#fff', display:'grid', placeItems:'center', fontWeight:900, fontSize:24,
                               boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)'
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
                     {/* Stream Mapping */}
                     <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', padding: 32, borderRadius: 24, color: '#fff', marginBottom: 32 }}>
                        <h3 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 20px' }}>🎓 Stream → Career Mapping</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                           <div style={{ background: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 16 }}>
                              <strong style={{ display: 'block', fontSize: 16, marginBottom: 8, color: '#93c5fd' }}>Science (PCM)</strong>
                              <span style={{ fontSize: 13, lineHeight: 1.5 }}>Engineering, Architecture, Defence, Data Science</span>
                           </div>
                           <div style={{ background: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 16 }}>
                              <strong style={{ display: 'block', fontSize: 16, marginBottom: 8, color: '#86efac' }}>Science (PCB)</strong>
                              <span style={{ fontSize: 13, lineHeight: 1.5 }}>Medical, Pharmacy, Nursing, Biotechnology</span>
                           </div>
                           <div style={{ background: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 16 }}>
                              <strong style={{ display: 'block', fontSize: 16, marginBottom: 8, color: '#fcd34d' }}>Commerce</strong>
                              <span style={{ fontSize: 13, lineHeight: 1.5 }}>CA, CS, B.Com, BBA, Banking & Finance</span>
                           </div>
                           <div style={{ background: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 16 }}>
                              <strong style={{ display: 'block', fontSize: 16, marginBottom: 8, color: '#fbcfe8' }}>Arts & Humanities</strong>
                              <span style={{ fontSize: 13, lineHeight: 1.5 }}>Law, Civil Services, Design, Journalism, Teaching</span>
                           </div>
                        </div>
                     </div>

                     {/* Decision Support & TN Info */}
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 40 }}>
                        <div style={{ background: '#eff6ff', padding: 24, borderRadius: 24 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e3a8a', marginBottom: 12 }}>💡 Smart Decision Support</h3>
                          <ul style={{ margin: 0, paddingLeft: 20, color: '#1e40af', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                            <li><strong>Like Maths?</strong> Engineering / Data fields.</li>
                            <li><strong>Like Biology?</strong> Medical / Pharma fields.</li>
                            <li><strong>Like Business?</strong> Commerce / Management paths.</li>
                            <li><strong>Creative?</strong> Design / Architecture / Arts.</li>
                          </ul>
                        </div>
                        <div style={{ background: '#fef2f2', padding: 24, borderRadius: 24 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#991b1b', marginBottom: 12 }}>❌ Common Mistakes to Avoid</h3>
                          <ul style={{ margin: 0, paddingLeft: 20, color: '#b91c1c', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                            <li>Choosing a course based on others' opinions.</li>
                            <li>Ignoring your own interests.</li>
                            <li>Not checking eligibility criteria early.</li>
                            <li>Late preparation & lack of mock tests.</li>
                          </ul>
                        </div>
                     </div>

                     {/* Tamil Nadu Priority Info */}
                     <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 24, borderRadius: 24, marginBottom: 40 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#166534', marginBottom: 12 }}>🗺️ Tamil Nadu Important Info</h3>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                           <SBadge color="green"><strong>Engineering:</strong> TNEA (No entrance, marks based)</SBadge>
                           <SBadge color="green"><strong>Medical:</strong> NEET is compulsory</SBadge>
                           <SBadge color="green"><strong>Arts & Science:</strong> Merit or CUET</SBadge>
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
                ) : activeSec === 'Fun' ? (
                  <div style={{ gridColumn: '1/-1' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 32, marginBottom: 32 }}>
                      <ActivityCard
                        title="Drawing Challenge"
                        category="Fun"
                        description="Use your imagination and create something amazing!"
                        skill="Creativity"
                        difficulty="Beginner"
                        cta="Start Activity"
                        emoji="🎨"
                        gradient="linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)"
                        onStart={() => navigate('/student/class5/fun/drawing-challenge')}
                      />
                      <ActivityCard
                        title="Story Builder"
                        category="Fun Learning"
                        description="Choose your characters, place and ideas, then create your own story!"
                        skill="Creativity"
                        difficulty="Beginner"
                        cta="Start Activity"
                        emoji="📝"
                        gradient="linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)"
                        onStart={() => navigate('/student/class5/fun/story-builder')}
                      />
                      <ActivityCard
                        title="Make Your Own Song"
                        category="Fun Learning"
                        description="Choose your ideas, create your lyrics, and make your own fun song!"
                        skill="Creativity & Expression"
                        difficulty="Beginner"
                        cta="Start Activity"
                        emoji="🎵"
                        gradient="linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)"
                        onStart={() => navigate('/student/class5/fun/make-your-own-song')}
                      />
                      <ActivityCard
                        title="Treasure Hunt"
                        category="Fun Learning"
                        description="Follow the clues, solve the puzzles, and find the hidden treasure!"
                        skill="Observation & Problem Solving"
                        difficulty="Beginner"
                        cta="Start Hunt"
                        emoji="🗺️"
                        gradient="linear-gradient(135deg, #10b981 0%, #3b82f6 100%)"
                        onStart={() => navigate('/student/class5/fun/treasure-hunt')}
                      />
                    </div>
                    {filteredContent.length === 0 ? (
                      <div style={{ textAlign:'center', padding:'50px 0', background:'#fff', borderRadius:32, border:'1px dashed #cbd5e1' }}>
                        <SEmpty title="More activities coming soon" desc="We're adding more fun activities for Class 5. Check back soon!" />
                      </div>
                    ) : (
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(360px, 1fr))', gap:32 }}>
                        {filteredContent.map(item => (
                          <div key={item._id} style={{ background:'#fff', borderRadius:32, border:'1px solid #f1f5f9', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.02)' }}>
                            <div style={{ padding:32, flex:1, display:'flex', flexDirection:'column' }}>
                              <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                                <SBadge color="purple">{item.category || 'Fun'}</SBadge>
                              </div>
                              <h3 style={{ fontSize:22, fontWeight:900, margin:'0 0 12px', lineHeight:1.3 }}>{item.title}</h3>
                              <p style={{ color:'#64748b', marginBottom:24, lineHeight:1.6 }}>{item.shortDescription}</p>
                              <SBtn variant="primary" style={{ width:'100%', marginTop:'auto', borderRadius:16, padding:'14px 0' }} onClick={() => handleCardClick(item)}>
                                Explore
                              </SBtn>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : filteredContent.length === 0 ? (
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
                  const isCompactImageCard = (activeSec === 'Skills' && ['5','8'].includes(cleanLevel)) || (activeSec === 'Entrance Exams' && cleanLevel === '10');
                  if (item.isDirect) {
                    return cleanLevel === '5' ? (
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
                             <FiBriefcase size={14}/> Provided by {item.provider || "Government / Organisation"}
                          </div>

                          <div style={{ background:'#f8fafc', borderRadius:20, padding:20, marginBottom:20, flex:1, display:'flex', flexDirection:'column', gap:16 }}>
                             {item.benefit && (
                                <div style={{ display:'flex', gap:12 }}>
                                   <div style={{ width:40, height:40, flexShrink:0, borderRadius:14, background:'#dcfce7', color:'#16a34a', display:'grid', placeItems:'center' }}>
                                      <FiDollarSign size={20} />
                                   </div>
                                   <div style={{ flex:1 }}>
                                     <div style={{ fontSize:12, fontWeight:800, color:'#166534', textTransform:'uppercase', letterSpacing:0.5 }}>What you get</div>
                                     <div style={{ fontSize:15, fontWeight:800, color:'#15803d', marginTop:2 }}>{item.benefit}</div>
                                   </div>
                                </div>
                             )}
                             {item.eligibility && (
                                <div style={{ display:'flex', gap:12 }}>
                                   <div style={{ width:40, height:40, flexShrink:0, borderRadius:14, background:'#dbeafe', color:'#2563eb', display:'grid', placeItems:'center' }}>
                                      <FiCheckCircle size={20} />
                                   </div>
                                   <div style={{ flex:1 }}>
                                     <div style={{ fontSize:12, fontWeight:800, color:'#1e40af', textTransform:'uppercase', letterSpacing:0.5 }}>Who can apply</div>
                                     <div style={{ fontSize:13, fontWeight:600, color:'#334155', lineHeight:1.5, marginTop:2 }}>{item.eligibility}</div>
                                   </div>
                                </div>
                             )}
                             {item.deadline && (
                                <div style={{ display:'flex', gap:12 }}>
                                   <div style={{ width:40, height:40, flexShrink:0, borderRadius:14, background:'#fee2e2', color:'#dc2626', display:'grid', placeItems:'center' }}>
                                      <FiClock size={20} />
                                   </div>
                                   <div style={{ flex:1 }}>
                                     <div style={{ fontSize:12, fontWeight:800, color:'#991b1b', textTransform:'uppercase', letterSpacing:0.5 }}>Apply by</div>
                                     <div style={{ fontSize:14, fontWeight:800, color:'#dc2626', marginTop:2 }}>{item.deadline}</div>
                                   </div>
                                </div>
                             )}
                          </div>
                          
                          <SBtn 
                             variant="outline"
                             style={{ width:'100%', borderRadius:16, padding:'14px 0', border: '2px solid #3b82f6', color: '#3b82f6' }} 
                             onClick={() => handleCardClick(item)}
                          >
                             Apply / View Details ↗
                          </SBtn>
                        </div>
                      </div>
                    ) : (
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
                             style={{ width:'100%', borderRadius:16, padding:'14px 0', border: '2px solid #3b82f6', color: '#3b82f6' }} 
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
                      {isCompactImageCard ? (
                        <div style={{ padding: '18px 18px 0' }}>
                          <div style={{ width: '100%', height: 220, borderRadius: 18, overflow: 'hidden', position: 'relative', background: '#f1f5f9' }}>
                            <img 
                              src={resolveCardImage(item.coverImage) || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display:'block' }}
                              onError={(e) => { if (e.target.style.display !== 'none') { e.target.onerror = null; e.target.style.display = 'none'; } }}
                            />
                            <button 
                              onClick={() => handleSaveAction(item)} 
                              style={{ 
                                position:'absolute', top:12, right:12, width:44, height:44, 
                                borderRadius:99, background:'rgba(255,255,255,0.92)', border:'none', cursor:'pointer', 
                                display:'grid', placeItems:'center', color: savedIds.has(item._id) ? '#ef4444' : '#64748b',
                                boxShadow:'0 4px 12px rgba(0,0,0,0.15)', backdropFilter:'blur(4px)'
                              }}
                            >
                              {savedIds.has(item._id) ? <FiHeart size={20} fill="#ef4444" /> : <FiBookmark size={20} />}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: 230, position:'relative' }}>
                          <img src={resolveCardImage(item.coverImage) || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                      )}
                      <div style={{ padding: isCompactImageCard ? '20px 22px 26px' : 32, flex:1, display:'flex', flexDirection:'column' }}>
                         {isScopedBadge ? (
                          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
                            {item.featured && (
                              <span style={{ ...SKILL_BADGE_STYLE, ...SKILL_BADGE_TONES.gold }}>FEATURED</span>
                            )}
                            {!(activeSec === 'Skills' && cleanLevel === '8' && String(item.category || '').toUpperCase() === 'FUN') && (
                              <span style={{ ...SKILL_BADGE_STYLE, ...SKILL_BADGE_TONES.primary }}>{item.category}</span>
                            )}
                            {item.subCategoryLabel && String(item.subCategoryLabel).split(',').map((tag, i) => {
                              const lbl = String(tag).trim()
                              if (!lbl) return null
                              if (activeSec === 'Skills' && cleanLevel === '8' && lbl.toUpperCase() === 'FUN') return null
                              return (
                                <span key={`${lbl}-${i}`} style={{ ...SKILL_BADGE_STYLE, ...SKILL_BADGE_TONES.secondary }}>{lbl.toUpperCase()}</span>
                              )
                            })}
                         </div>
                        ) : (
                         <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                            {item.featured && <SBadge color="gold">FEATURED</SBadge>}
                            <SBadge color="blue">{item.category}</SBadge>
                            {item.subCategoryLabel && <SBadge color="gray">{String(item.subCategoryLabel).toUpperCase()}</SBadge>}
                         </div>
                        )}
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

