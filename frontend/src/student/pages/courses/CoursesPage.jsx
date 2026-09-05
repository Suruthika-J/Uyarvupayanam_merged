import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiBookOpen, FiMapPin, FiChevronRight, FiSearch } from 'react-icons/fi'
import { SBadge, SLoader, SEmpty, SSelect } from '../../components/ui'
import { courseService, collegeService } from '../../services'

const ADMIN_CATEGORIES = [
  "Agriculture", "Architecture", "Arts", "Commerce", "Design", 
  "Engineering", "Hotel Management", "IT & Computer", "ITI", 
  "Law", "Management", "Media & Journalism", "Medical", 
  "Polytechnic", "Science"
];

const CATEGORY_COLORS = {
  Engineering: '#6366f1',
  Medical: '#ef4444',
  Commerce: '#10b981',
  Arts: '#8b5cf6',
  Law: '#f59e0b',
  Science: '#06b6d4',
  Management: '#ec4899',
  Polytechnic: '#3b82f6',
  default: '#64748b'
};

export default function CoursesPage() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [courses, setCourses] = useState([])
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [courseRes, collegeRes] = await Promise.all([
          courseService.getAll(),
          collegeService.getAll()
        ])
        
        if (courseRes.success) setCourses(courseRes.data || [])
        if (collegeRes.success) setColleges(collegeRes.data || [])
      } catch (err) {
        console.error('Error fetching course page data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const groupedData = useMemo(() => {
    const groups = {}
    
    // Group courses by category
    courses.forEach(course => {
      const cat = course.category || 'Others'
      if (!groups[cat]) {
        groups[cat] = { categoryName: cat, courseCount: 0, collegeCount: 0, courses: [] }
      }
      groups[cat].courseCount++
      groups[cat].courses.push(course)
    })

    // Map colleges to categories (this is an approximation based on college.type or mapping)
    // For now, we'll check if a college has courses in that category if the data allows,
    // but usually, colleges are tagged with categories too.
    colleges.forEach(college => {
      // If college has a category field, use it. Otherwise, we might need a more complex mapping.
      const cat = college.category || college.type
      if (cat && groups[cat]) {
        groups[cat].collegeCount++
      } else if (cat) {
        // Handle categories that might not have courses yet but exist in colleges
        if (!groups[cat]) {
           groups[cat] = { categoryName: cat, courseCount: 0, collegeCount: 1, courses: [] }
        } else {
           groups[cat].collegeCount++
        }
      }
    })

    // Filter by selected category if not "All Categories"
    let result = Object.values(groups)
    if (selectedCategory !== 'All Categories') {
      result = result.filter(g => g.categoryName === selectedCategory)
    }

    // Sort by priority (Engineering, Medical, etc.) or just alphabetical
    return result.sort((a, b) => a.categoryName.localeCompare(b.categoryName))
  }, [courses, colleges, selectedCategory])

  const handleCardClick = (categoryName) => {
    navigate(`/student/courses/search?category=${encodeURIComponent(categoryName)}`)
  }

  return (
    <div className="student-root" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header section */}
      <section style={{ 
        padding: '60px 24px', textAlign: 'center', 
        background: '#fff', borderBottom: '1px solid #f1f5f9', marginBottom: 40 
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <SBadge color="blue" style={{ marginBottom: 16 }}>Academic Trajectory</SBadge>
          <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 'clamp(32px, 5vw, 42px)', color: '#1e293b', marginBottom: 16 }}>
            Explore Career Specializations
          </h1>
          <p style={{ fontSize: 18, color: '#64748b', lineHeight: 1.6, maxWidth: 600, margin: '0 auto 32px' }}>
            Discover hundreds of professional programs across Tamil Nadu, grouped by industry and career outcomes.
          </p>

          <div style={{ maxWidth: 400, margin: '0 auto' }}>
             <SSelect 
               value={selectedCategory} 
               onChange={(e) => setSelectedCategory(e.target.value)}
               style={{ height: 52, borderRadius: 16, fontSize: 16, fontWeight: 700 }}
             >
               <option>All Categories</option>
               {ADMIN_CATEGORIES.map(cat => (
                 <option key={cat} value={cat}>{cat}</option>
               ))}
             </SSelect>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {loading ? (
          <div style={{ padding: '100px 0' }}><SLoader /></div>
        ) : groupedData.length === 0 ? (
          <SEmpty 
            icon={<FiSearch size={48} />} 
            title="No Results Found" 
            desc="We couldn't find any courses matching your current filter selection." 
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
            {groupedData.map(group => (
              <div 
                key={group.categoryName}
                onClick={() => handleCardClick(group.categoryName)}
                style={{
                  background: '#fff', padding: 28, borderRadius: 28, 
                  border: '1px solid #f1f5f9', cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  position: 'relative', overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                   e.currentTarget.style.transform = 'translateY(-5px)'
                   e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.05)'
                   e.currentTarget.style.borderColor = (CATEGORY_COLORS[group.categoryName] || CATEGORY_COLORS.default) + '44'
                }}
                onMouseLeave={(e) => {
                   e.currentTarget.style.transform = 'translateY(0)'
                   e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)'
                   e.currentTarget.style.borderColor = '#f1f5f9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                   <div style={{ 
                     width: 60, height: 60, borderRadius: 18, 
                     background: `linear-gradient(135deg, ${CATEGORY_COLORS[group.categoryName] || CATEGORY_COLORS.default} 0%, ${(CATEGORY_COLORS[group.categoryName] || CATEGORY_COLORS.default)}dd 100%)`,
                     color: '#fff', display: 'grid', placeItems: 'center', 
                     fontSize: 24, fontWeight: 900,
                     boxShadow: `0 10px 15px -3px ${(CATEGORY_COLORS[group.categoryName] || CATEGORY_COLORS.default)}44`
                   }}>
                     {group.categoryName.charAt(0).toUpperCase()}
                   </div>
                   <div>
                      <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#1e293b' }}>{group.categoryName}</h3>
                      <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                         <span style={{ fontSize: 13, color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiBookOpen size={14} color={CATEGORY_COLORS[group.categoryName] || CATEGORY_COLORS.default} /> {group.courseCount} Courses
                         </span>
                         <span style={{ fontSize: 13, color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiMapPin size={14} color="#f59e0b" /> {group.collegeCount} Colleges
                         </span>
                      </div>
                   </div>
                </div>
                <div style={{ 
                  background: '#f8fafc', width: 40, height: 40, borderRadius: 12, 
                  display: 'grid', placeItems: 'center', color: '#cbd5e1' 
                }}>
                   <FiChevronRight size={20} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

