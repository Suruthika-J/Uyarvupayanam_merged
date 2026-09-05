import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiMapPin, FiDownload, FiChevronDown, FiFilter, FiExternalLink } from 'react-icons/fi'
import { SCard, SBadge, SLoader, SEmpty, SInput, SSelect, SBtn } from '../../components/ui'
import { cutoffService } from '../../../services/cutoffService'
import { courseService } from '../../../services/courseService'

const CATEGORIES = ['OC', 'BC', 'BCM', 'MBC', 'SC', 'SCA', 'ST']
const YEARS = ['2024', '2023', '2022']

export default function TneaCutoffPage() {
  const [cutoffs, setCutoffs] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState('2024')
  const [search, setSearch] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('OC') // Default category to highlight

  const fetchDependencies = async () => {
    try {
      const res = await courseService.getAllCourses({ category: 'Engineering' })
      setCourses(res.data || [])
    } catch (err) {
      console.error('Failed to fetch courses:', err)
    }
  }

  const fetchCutoffs = useCallback(async () => {
    try {
      setLoading(true)
      const res = await cutoffService.getCutoffs({ year: selectedYear })
      setCutoffs(res.data || [])
    } catch (err) {
      console.error('Failed to fetch cutoffs:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedYear])

  useEffect(() => {
    fetchDependencies()
  }, [])

  useEffect(() => {
    fetchCutoffs()
  }, [fetchCutoffs])

  const filteredData = useMemo(() => {
    return cutoffs.filter(c => {
      const colName = (c.collegeId?.collegeName || c.collegeName || c.college || '').toLowerCase()
      const crsName = (c.courseId?.courseName || c.department || c.course || '').toLowerCase()
      const crsId = c.courseId?._id?.toString() || ''
      const searchMatch = colName.includes(search.toLowerCase()) || crsName.includes(search.toLowerCase())
      const courseMatch = selectedCourse === 'All' || crsId === selectedCourse
      return searchMatch && courseMatch
    })
  }, [cutoffs, search, selectedCourse])

  const handleExport = () => {
    const headers = ['College Code', 'College Name', 'Branch', ...CATEGORIES];
    const rows = filteredData.map(r => {
      const getScore = (cat) => {
        const found = r.cutoffData?.find(d => d.category.toUpperCase() === cat.toUpperCase());
        return found ? found.score : (r[cat.toLowerCase()] || '-');
      }
      return [
        r.collegeId?.collegeCode || r.collegeCode || r.coc || '',
        r.collegeId?.collegeName || r.collegeName || r.college || '',
        r.courseId?.courseName || r.department || r.course || '',
        ...CATEGORIES.map(cat => getScore(cat))
      ]
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TNEA_Cutoff_${selectedYear}_Filtered.csv`;
    a.click();
  }

  const getScore = (item, cat) => {
    const found = item.cutoffData?.find(d => d.category.toUpperCase() === cat.toUpperCase());
    if (found) return found.score;
    return item[cat.toLowerCase()] || '-';
  }

  return (
    <div className="student-root" style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto', minHeight: '90vh' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }} className="s-anim-up">
        <SBadge color="blue" style={{ marginBottom: 12 }}>Engineering Admissions</SBadge>
        <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 'clamp(30px, 5vw, 44px)', color: 'var(--s-text)', marginBottom: 12, letterSpacing: '-0.02em' }}>
          TNEA Cutoff <span style={{ color: 'var(--s-primary)' }}>Registry</span>
        </h1>
        <p style={{ fontSize: 17, color: 'var(--s-text3)', maxWidth: 650, margin: '0 auto' }}>
          Explore historical cutoff marks for engineering colleges in Tamil Nadu. Filter by year, branch, and category to plan your admissions.
        </p>
      </div>

      {/* Control Bar */}
      <div style={{ 
        background: '#fff', borderRadius: 24, padding: '24px', 
        border: '1px solid var(--s-border)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
        marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end'
      }} className="s-anim-up s-d1">
        <div style={{ flex: '1 1 300px' }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text3)', marginBottom: 8, display: 'block', textTransform: 'uppercase' }}>Search College or Branch</label>
          <SInput 
            placeholder="e.g. CEG, Computer Science..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            icon={<FiSearch />}
          />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text3)', marginBottom: 8, display: 'block', textTransform: 'uppercase' }}>Engineering Branch</label>
          <SSelect value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
            <option value="All">All Branches</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.courseName}</option>)}
          </SSelect>
        </div>
        <div style={{ flex: '0 1 120px' }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text3)', marginBottom: 8, display: 'block', textTransform: 'uppercase' }}>Year</label>
          <SSelect value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </SSelect>
        </div>
        <div style={{ flex: '0 1 120px' }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text3)', marginBottom: 8, display: 'block', textTransform: 'uppercase' }}>My Category</label>
          <SSelect value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </SSelect>
        </div>
        <SBtn variant="outline" onClick={handleExport} style={{ height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiDownload /> Export
        </SBtn>
      </div>

      {/* Main Content */}
      {loading ? <SLoader /> : filteredData.length === 0 ? (
        <SEmpty 
          icon="📊" 
          title="No Cutoff Data Found" 
          desc="Try adjusting your filters or search query to find relevant results." 
        />
      ) : (
        <div className="s-anim-up s-d2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
             <span style={{ fontSize: 14, color: 'var(--s-text3)', fontWeight: 600 }}>
                Showing <span style={{ color: 'var(--s-primary)', fontWeight: 800 }}>{filteredData.length}</span> results for {selectedYear}
             </span>
             <div style={{ fontSize: 12, color: 'var(--s-text3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiFilter /> Scores shown for <strong>{selectedCategory}</strong> by default
             </div>
          </div>

          <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 24, border: '1px solid var(--s-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid var(--s-border)' }}>
                  <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--s-text)', fontSize: 13, fontWeight: 800 }}>COLLEGE & BRANCH</th>
                  {CATEGORIES.map(cat => (
                    <th key={cat} style={{ 
                      padding: '20px 12px', textAlign: 'center', color: cat === selectedCategory ? 'var(--s-primary)' : 'var(--s-text3)', 
                      fontSize: 13, fontWeight: 800, background: cat === selectedCategory ? 'var(--s-primary-l)' : 'transparent'
                    }}>
                      {cat}
                    </th>
                  ))}
                  <th style={{ padding: '20px 24px', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, idx) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--s-border)', transition: '0.2s' }} className="table-row-hover">
                    <td style={{ padding: '24px' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--s-text)', fontSize: 15, marginBottom: 4 }}>
                          {item.collegeId?.collegeName || item.collegeName || item.college || 'N/A'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                           <SBadge color="gray" style={{ fontSize: 10 }}>{item.collegeId?.collegeCode || item.collegeCode || item.coc || 'CODE N/A'}</SBadge>
                           <span style={{ fontSize: 13, color: 'var(--s-primary)', fontWeight: 700 }}>
                             {item.courseId?.courseName || item.department || item.course || 'N/A'}
                           </span>
                        </div>
                      </div>
                    </td>
                    {CATEGORIES.map(cat => {
                      const score = getScore(item, cat)
                      return (
                        <td key={cat} style={{ 
                          padding: '24px 12px', textAlign: 'center', fontWeight: 800, 
                          color: cat === selectedCategory ? 'var(--s-primary)' : 'var(--s-text)',
                          background: cat === selectedCategory ? 'rgba(59, 130, 246, 0.03)' : 'transparent',
                          fontSize: 15
                        }}>
                          {score}
                        </td>
                      )
                    })}
                    <td style={{ padding: '24px', textAlign: 'center' }}>
                       <Link to={`/student/colleges`} style={{ textDecoration: 'none' }}>
                          <SBtn variant="ghost" size="sm" style={{ padding: '8px' }}>
                             <FiExternalLink size={16} />
                          </SBtn>
                       </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        .table-row-hover:hover {
          background: #f8fafc;
        }
      `}</style>
    </div>
  )
}
