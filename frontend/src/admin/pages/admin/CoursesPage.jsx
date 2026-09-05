// CoursesPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, LevelBadge, DataTable, TR, TD, ActionBtn, FiltersRow, SearchInput, FilterSelect, PrimaryBtn, SBtn, SBadge, Modal, FormGrid, FormGroup, FormInput, FormActions } from '../../components/UI'
import { courseService } from '../../../services/courseService'
import AddCourseModal from './AddCourseModal'
import BulkImportCoursesModal from './BulkImportCoursesModal'
import SourceImportModal from './SourceImportModal'

export default function CoursesPage() {
  const navigate = useNavigate()
  const [showAddCourseModal, setShowAddCourseModal] = useState(false)
  const [showBulkImportModal, setShowBulkImportModal] = useState(false)
  const [showSourceImportModal, setShowSourceImportModal] = useState(false)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSection, setSelectedSection] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchCourses()
  }, [])

  // Reset category when section changes
  useEffect(() => {
    setSelectedCategory('All')
  }, [selectedSection])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const result = await courseService.getAllCourses()
      if (result.success) {
        setCourses(result.data)
      }
    } catch (error) {
      console.error('❌ Failed to fetch courses:', error)
      setMessage({ type: 'error', text: 'Failed to load courses' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return
    try {
      const result = await courseService.deleteCourse(id)
      if (result.success) {
        setMessage({ type: 'success', text: 'Course deleted successfully' })
        fetchCourses()
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete course' })
    }
  }

  const handleExport = () => {
    if (filtered.length === 0) return;
    const headers = ['Course Name', 'Section', 'Category', 'Duration', 'Source', 'Eligibility'];
    const rows = filtered.map(c => [
      `"${c.courseName.replace(/"/g, '""')}"`,
      `"${(c.level || '').replace(/"/g, '""')}"`,
      `"${(c.category || '').replace(/"/g, '""')}"`,
      `"${(c.duration || '').replace(/"/g, '""')}"`,
      `"${(c.isImported ? 'Imported' : 'Manual').replace(/"/g, '""')}"`,
      `"${(c.eligibility || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Courses_${new Date().toLocaleDateString()}.csv`);
    link.click();
  }

  const filtered = courses.filter(c => {
    // Check Search
    const matchesSearch = searchQuery === '' || 
      c.courseName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check Section (using level field)
    const matchesSection = selectedSection === 'All' || 
      (c.level || '').toLowerCase().replace(/\s/g, '') === selectedSection.toLowerCase().replace(/\s/g, '');

    // Check Category
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    
    return matchesSearch && matchesSection && matchesCategory;
  });

  // Dynamically derive categories based on selected section
  const availableCategories = Array.from(new Set(
    courses
      .filter(c => selectedSection === 'All' || (c.level || '').toLowerCase().replace(/\s/g, '') === selectedSection.toLowerCase().replace(/\s/g, ''))
      .map(c => c.category)
      .filter(Boolean)
  )).sort();

  // Stats
  const totalCourses = courses.length;
  const importedCount = filtered.filter(c => c.isImported).length;
  const manualCount = filtered.length - importedCount;

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>Loading courses...</div>

  return (
    <div style={{ animation:'fadeUp 0.4s ease both' }}>
      {message.text && (
        <div style={{ 
          padding: 12, marginBottom: 16, borderRadius: 8, fontSize: 13.5, fontWeight: 600,
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
        }}>
          {message.text}
        </div>
      )}

      {/* Stats Bar */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap'
      }}>
        {[
          { icon: '📚', label: 'Total Courses', value: totalCourses, color: '#6366f1' },
          { icon: '🔍', label: 'Showing', value: filtered.length, color: '#2563eb' },
          { icon: '📦', label: 'Imported', value: importedCount, color: '#16a34a' },
          { icon: '✏️', label: 'Manual', value: manualCount, color: '#d97706' },
        ].map(s => (
          <div key={s.label} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface)', border: '1.5px solid var(--border)',
            borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 700
          }}>
            <span>{s.icon}</span>
            <span style={{ color: 'var(--text3)' }}>{s.label}:</span>
            <span style={{ color: s.color, fontWeight: 900 }}>{s.value}</span>
          </div>
        ))}
      </div>

      <FiltersRow>
        <SearchInput 
          placeholder="🔍 Search courses..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <FilterSelect value={selectedSection} onChange={e=>setSelectedSection(e.target.value)}>
          <option value="All">All Sections</option>
          <option value="after10th">After 10th</option>
          <option value="after12th">After 12th</option>
          <option value="diploma">Diploma</option>
        </FilterSelect>
        <FilterSelect value={selectedCategory} onChange={e=>setSelectedCategory(e.target.value)}>
          <option value="All">All Categories</option>
          {availableCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </FilterSelect>
        <div style={{ marginLeft:'auto', display:'flex', gap:10, flexWrap: 'wrap' }}>
          <SBtn variant="outline" onClick={handleExport} disabled={filtered.length === 0}>📥 Export</SBtn>
          <SBtn variant="outline" onClick={()=>setShowBulkImportModal(true)} 
            style={{ background: 'var(--primary-l)', color: 'var(--primary)', borderColor: 'var(--primary-l)', fontWeight: 700 }}>
            ⚡ Text Import
          </SBtn>
          <SBtn 
            onClick={()=>setShowSourceImportModal(true)}
            style={{ 
              background: 'linear-gradient(135deg, #16a34a, #059669)', 
              color: '#fff', 
              border: 'none', 
              fontWeight: 800,
              boxShadow: '0 3px 12px rgba(22,163,74,0.25)',
            }}>
            🌐 Import from Source
          </SBtn>
          <PrimaryBtn onClick={()=>setShowAddCourseModal(true)}>+ Add Course</PrimaryBtn>
        </div>
      </FiltersRow>


      <Card>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <p>No courses found</p>
          </div>
        ) : (
          <DataTable columns={['Course Name', 'Type', 'Category', 'Duration', 'Source', 'Actions']} data={filtered} renderRow={(c)=>(
            <TR key={c._id}>
              <TD style={{ fontWeight:600, color:'var(--text)', maxWidth: 280 }}>{c.courseName}</TD>
              <TD><LevelBadge level={c.level || c.targetLevel}/></TD>
              <TD style={{ color:'var(--text3)' }}>{c.category}</TD>
              <TD style={{ color:'var(--text3)' }}>{c.duration}</TD>
              <TD>
                {c.isImported ? (
                  <SBadge color="green" style={{ fontSize: 11 }}>Imported</SBadge>
                ) : (
                  <SBadge color="gray" style={{ fontSize: 11 }}>Manual</SBadge>
                )}
              </TD>
              <TD>
                <div style={{ display:'flex', gap:6 }}>
                  <ActionBtn onClick={() => navigate(`/admin/courses/edit/${c._id}`)}>📝 Details</ActionBtn>
                  <ActionBtn danger onClick={() => handleDelete(c._id)}>🗑</ActionBtn>
                </div>
              </TD>
            </TR>
          )}/>
        )}
      </Card>

      {showAddCourseModal && (
        <AddCourseModal
          onClose={() => setShowAddCourseModal(false)}
          onCourseAdded={fetchCourses}
        />
      )}

      {showBulkImportModal && (
        <BulkImportCoursesModal 
          onClose={() => setShowBulkImportModal(false)}
          onImportSuccess={() => {
            setShowBulkImportModal(false)
            fetchCourses()
          }}
        />
      )}

      {showSourceImportModal && (
        <SourceImportModal
          onClose={() => setShowSourceImportModal(false)}
          onImportSuccess={() => {
            setShowSourceImportModal(false)
            setMessage({ type: 'success', text: '✅ Courses imported successfully from source!' })
            fetchCourses()
            setTimeout(() => setMessage({ type: '', text: '' }), 5000)
          }}
        />
      )}
    </div>
  )
}
