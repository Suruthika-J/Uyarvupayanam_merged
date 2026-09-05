import React, { useState } from 'react'
import { Modal, SBtn } from '../../components/UI'
import axiosInstance from '../../../config/axios'

export default function BulkCollegeCourseMapperModal({ onClose, onSuccess }) {
  const [inputText, setInputText] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [overwriteMode, setOverwriteMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  const handleProcess = async () => {
    if (!inputText.trim()) {
      setError('Please paste some mapping data.')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const lines = inputText.split('\n').filter(l => l.trim().includes('\t') || l.trim().includes(','))
      const mappingData = lines.map(line => {
        const parts = line.includes('\t') ? line.split('\t') : line.split(',')
        return {
          collegeName: parts[0]?.trim(),
          courseName: parts[1]?.trim()
        }
      }).filter(row => row.collegeName && row.courseName)

      if (mappingData.length === 0) {
        throw new Error('Could not find valid mapping pairs. Please use Tab or Comma separated values.')
      }

      const res = await axiosInstance.post('/college-courses/bulk-map', {
        mappingData,
        sourceName: sourceName || 'Bulk Manual Paste',
        overwriteMode: overwriteMode
      })

      if (res.data.success) {
        setResults(res.data.stats)
        if (onSuccess) onSuccess()
      }
    } catch (err) {
      console.error('Bulk mapping error:', err)
      setError(err.response?.data?.message || err.message || 'Failed to process bulk mapping.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="🚀 Bulk College-Course Auto-Mapper" onClose={onClose} maxWidth={800}>
      {!results ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>
            Paste actual college-course pairs from your dataset. Each line should contain <b>College Name</b> and <b>Course Name</b> separated by a Tab or Comma.
          </p>
          
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: 'var(--text3)', marginBottom: 6 }}>DATASET NAME / SOURCE</label>
            <input 
              type="text" 
              placeholder="e.g., TNEA 2024 College Course List"
              value={sourceName}
              onChange={e => setSourceName(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: 'var(--text3)', marginBottom: 6 }}>PASTE DATA (COLLEGE, COURSE)</label>
            <textarea 
              rows={12}
              placeholder="National Engineering College, CSE&#10;Anna University, Mechanical Engineering&#10;..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              style={{ width: '100%', padding: '16px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, fontFamily: 'monospace' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: overwriteMode ? '#fff1f2' : '#f0f9ff', borderRadius: 12, border: '1px solid', borderColor: overwriteMode ? '#fecaca' : '#bae6fd', cursor: 'pointer' }} onClick={() => setOverwriteMode(!overwriteMode)}>
            <input 
              type="checkbox" 
              checked={overwriteMode}
              onChange={() => {}}
              style={{ width: 18, height: 18, accentColor: '#e11d48' }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: overwriteMode ? '#9f1239' : '#0369a1' }}>OVERWRITE EXISTING MAPPINGS</div>
              <div style={{ fontSize: 11, color: overwriteMode ? '#be123c' : '#075985' }}>If checked, current mappings for these colleges will be deleted first. Use this to clean up messy data.</div>
            </div>
          </div>

          {error && <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 600 }}>⚠️ {error}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <SBtn variant="outline" onClick={onClose}>Cancel</SBtn>
            <SBtn onClick={handleProcess} disabled={loading} style={{ background: overwriteMode ? '#e11d48' : 'var(--primary)' }}>
              {loading ? 'Processing Bulk Mapping...' : overwriteMode ? 'Wipe & Re-Map Data' : 'Start Auto-Mapping Engine'}
            </SBtn>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 50, marginBottom: 16 }}>🎯</div>
          <h3 style={{ margin: '0 0 8px', color: 'var(--text)' }}>Bulk Mapping Complete</h3>
          <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 24 }}>System has processed the dataset and updated all college records.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <div style={{ padding: 20, background: 'var(--surface2)', borderRadius: 16, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)' }}>{results.totalRows}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 800 }}>TOTAL ROWS</div>
            </div>
            <div style={{ padding: 20, background: 'var(--surface2)', borderRadius: 16, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981' }}>{results.mappingsCreated}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 800 }}>NEW MAPPINGS</div>
            </div>
            <div style={{ padding: 20, background: 'var(--surface2)', borderRadius: 16, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#f59e0b' }}>{results.duplicatesSkipped}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 800 }}>SKIPPED</div>
            </div>
          </div>

          {(results.unmatchedColleges.length > 0 || results.unmatchedCourses.length > 0) && (
            <div style={{ textAlign: 'left', background: '#fef2f2', padding: 16, borderRadius: 12, marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#991b1b' }}>UNMATCHED ENTITIES ({results.unmatchedColleges.length + results.unmatchedCourses.length})</h4>
              <div style={{ maxHeight: 150, overflowY: 'auto', fontSize: 12, color: '#b91c1c' }}>
                {results.unmatchedColleges.map((c, i) => <div key={i}>❌ College not found: {c}</div>)}
                {results.unmatchedCourses.map((c, i) => <div key={i}>❌ Course not found: {c}</div>)}
              </div>
            </div>
          )}

          <SBtn onClick={onClose} style={{ width: '100%' }}>Done</SBtn>
        </div>
      )}
    </Modal>
  )
}
