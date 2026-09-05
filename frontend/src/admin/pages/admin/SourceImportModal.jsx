import React, { useState, useEffect, useCallback } from 'react'
import { Modal, SBtn, SBadge } from '../../components/UI'
import { courseService } from '../../../services/courseService'

const CATEGORY_ICONS = {
  Engineering: '⚙️', Medical: '🏥', Arts: '🎨', Commerce: '💼',
  Science: '🔬', Management: '📊', Certificate: '📜', Architecture: '🏛️',
}

const CATEGORY_COLORS = {
  Engineering: '#7c3aed', Medical: '#dc2626', Arts: '#f59e0b',
  Commerce: '#2563eb', Science: '#16a34a', Management: '#059669',
  Certificate: '#d97706', Architecture: '#8b5cf6',
}

export default function SourceImportModal({ onClose, onImportSuccess }) {
  const [step, setStep] = useState('loading') // loading | preview | importing | result
  const [preview, setPreview] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [importResult, setImportResult] = useState(null)
  const [error, setError] = useState(null)

  const fetchPreview = useCallback(async (cats = []) => {
    try {
      setStep('loading')
      setError(null)
      const filters = cats.length > 0 ? { categories: cats } : {}
      const res = await courseService.previewSourceImport(filters)
      if (res.success) {
        setPreview(res.preview)
        setStep('preview')
      } else {
        setError(res.message || 'Failed to load preview')
        setStep('preview')
      }
    } catch (err) {
      console.error('Preview error:', err)
      setError('Failed to connect to server. Please check if backend is running.')
      setStep('preview')
    }
  }, [])

  useEffect(() => {
    fetchPreview()
  }, [fetchPreview])

  const toggleCategory = (cat) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter(c => c !== cat)
      : [...selectedCategories, cat]
    setSelectedCategories(next)
    fetchPreview(next)
  }

  const handleImport = async () => {
    try {
      setStep('importing')
      const filters = selectedCategories.length > 0 ? { categories: selectedCategories } : {}
      const res = await courseService.importFromSource(filters)
      if (res.success) {
        setImportResult(res)
        setStep('result')
        setTimeout(() => {
          onImportSuccess()
        }, 4000)
      } else {
        setError(res.message || 'Import failed')
        setStep('preview')
      }
    } catch (err) {
      console.error('Import error:', err)
      setError('Import API error. Check console for details.')
      setStep('preview')
    }
  }

  // ── Loading State ───────────────────────────────────────────
  if (step === 'loading') {
    return (
      <Modal title="📦 Import Courses from Source" onClose={onClose} maxWidth={780}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            width: 48, height: 48, margin: '0 auto 20px',
            border: '4px solid rgba(0,0,0,0.06)', borderTopColor: 'var(--primary)',
            borderRadius: '50%', animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: 'var(--text2)', fontWeight: 600 }}>Analyzing source data & checking for duplicates...</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </Modal>
    )
  }

  // ── Result State ────────────────────────────────────────────
  if (step === 'result' && importResult) {
    const { stats, skippedNames } = importResult
    return (
      <Modal title="✅ Import Complete" onClose={onClose} maxWidth={700}>
        <div style={{ textAlign: 'center', padding: '30px 10px' }}>
          <div style={{ fontSize: 56, marginBottom: 12, animation: 'fadeUp 0.5s' }}>🎉</div>
          <h2 style={{ margin: '0 0 8px', fontFamily: 'Nunito', fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>
            Import Successful
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text2)', margin: '0 0 24px' }}>{importResult.message}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Processed', value: stats.total, color: '#6366f1', icon: '📦' },
              { label: 'New Imported', value: stats.inserted, color: '#16a34a', icon: '✅' },
              { label: 'Skipped Duplicates', value: stats.skipped, color: '#d97706', icon: '⏭️' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'var(--surface2)', borderRadius: 16, padding: 20,
                border: '1.5px solid var(--border)', textAlign: 'center'
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 950, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {skippedNames && skippedNames.length > 0 && (
            <details style={{ textAlign: 'left', marginTop: 8 }}>
              <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 8 }}>
                View {skippedNames.length} skipped duplicates
              </summary>
              <div style={{
                maxHeight: 160, overflowY: 'auto', fontSize: 12, color: 'var(--text3)',
                background: 'var(--surface2)', padding: 12, borderRadius: 10, border: '1px solid var(--border)'
              }}>
                {skippedNames.map((n, i) => <div key={i} style={{ padding: '3px 0' }}>• {n}</div>)}
              </div>
            </details>
          )}

          <div style={{ marginTop: 24 }}>
            <SBtn onClick={onClose}>Close</SBtn>
          </div>
        </div>
      </Modal>
    )
  }

  // ── Importing State ─────────────────────────────────────────
  if (step === 'importing') {
    return (
      <Modal title="📦 Importing Courses..." onClose={() => {}} maxWidth={700}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            width: 56, height: 56, margin: '0 auto 20px',
            border: '5px solid rgba(0,0,0,0.06)', borderTopColor: '#16a34a',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite'
          }} />
          <h3 style={{ margin: 0, fontFamily: 'Nunito', fontWeight: 900, color: 'var(--text)' }}>
            Importing courses securely...
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 8 }}>
            Checking duplicates and inserting new courses. Please wait.
          </p>
        </div>
      </Modal>
    )
  }

  // ── Preview State ───────────────────────────────────────────
  const categories = preview ? Object.keys(preview.categoryBreakdown) : []
  const allCategories = categories.sort()

  return (
    <Modal title="📦 Import Courses from Source" onClose={onClose} maxWidth={850}>
      {error && (
        <div style={{
          padding: 12, marginBottom: 16, borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca'
        }}>
          ⚠️ {error}
        </div>
      )}

      {preview && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Source Info Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #ede9fe 0%, #e0e7ff 50%, #dbeafe 100%)',
            borderRadius: 16, padding: 20, border: '1px solid #c7d2fe'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center',
                background: 'white', fontSize: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>🌐</div>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#3730a3' }}>
                  {preview.sourceName}
                </h4>
                <a href={preview.sourceUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: '#4f46e5', textDecoration: 'none' }}>
                  {preview.sourceUrl}
                </a>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Total in Source', val: preview.totalFromSource, bg: '#c7d2fe', color: '#3730a3' },
                { label: 'New Courses', val: preview.totalNew, bg: '#bbf7d0', color: '#166534' },
                { label: 'Already Exist', val: preview.totalDuplicates, bg: '#fde68a', color: '#92400e' },
              ].map(s => (
                <div key={s.label} style={{
                  background: s.bg, padding: '6px 14px', borderRadius: 10,
                  fontSize: 13, fontWeight: 800, color: s.color
                }}>
                  {s.val} {s.label}
                </div>
              ))}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Filter by Category (click to toggle)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {allCategories.map(cat => {
                const isSelected = selectedCategories.length === 0 || selectedCategories.includes(cat)
                const bd = preview.categoryBreakdown[cat]
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.15s',
                      border: `2px solid ${isSelected ? (CATEGORY_COLORS[cat] || '#6366f1') : 'var(--border)'}`,
                      background: isSelected ? `${CATEGORY_COLORS[cat] || '#6366f1'}14` : 'transparent',
                      color: isSelected ? (CATEGORY_COLORS[cat] || '#6366f1') : 'var(--text3)',
                      opacity: isSelected ? 1 : 0.6,
                    }}
                  >
                    <span>{CATEGORY_ICONS[cat] || '📁'}</span>
                    <span>{cat}</span>
                    <span style={{
                      background: isSelected ? (CATEGORY_COLORS[cat] || '#6366f1') : 'var(--text3)',
                      color: '#fff', padding: '1px 7px', borderRadius: 20, fontSize: 11, fontWeight: 900
                    }}>
                      {bd?.new || 0}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Course Preview List */}
          <div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10
            }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1 }}>
                New Courses to Import
              </span>
              <SBadge color="green" style={{ fontSize: 13 }}>
                {preview.totalNew} ready to import
              </SBadge>
            </div>

            {preview.totalNew === 0 ? (
              <div style={{
                textAlign: 'center', padding: '40px 20px', background: 'var(--surface2)',
                borderRadius: 16, border: '1.5px dashed var(--border)'
              }}>
                <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.4 }}>✅</div>
                <h4 style={{ margin: '0 0 6px', color: 'var(--text2)' }}>All courses already imported!</h4>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text3)' }}>
                  All {preview.totalFromSource} courses from this source already exist in your database.
                </p>
              </div>
            ) : (
              <div style={{
                maxHeight: 320, overflowY: 'auto', border: '1.5px solid var(--border)',
                borderRadius: 14, background: 'var(--surface2)',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid var(--border)', position: 'sticky', top: 0, background: 'var(--surface2)', zIndex: 1 }}>
                      {['Course Name', 'Category', 'Type', 'Duration', 'Salary'].map(h => (
                        <th key={h} style={{
                          padding: '10px 12px', textAlign: 'left', fontSize: 11,
                          fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px'
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.newCourses.map((c, i) => (
                      <tr key={i} style={{
                        borderBottom: '1px solid var(--border)',
                        background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)'
                      }}>
                        <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: 'var(--text)', maxWidth: 260 }}>
                          {c.courseName}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 12, fontWeight: 700,
                            color: CATEGORY_COLORS[c.category] || 'var(--text2)',
                          }}>
                            {CATEGORY_ICONS[c.category] || '📁'} {c.category}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>
                          {c.level || c.type}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text3)' }}>
                          {c.duration}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text3)' }}>
                          {c.averageSalary || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Duplicate Info */}
          {preview.duplicateCourses && preview.duplicateCourses.length > 0 && (
            <details>
              <summary style={{
                cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--text2)',
                padding: '10px 14px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a'
              }}>
                ⚠️ {preview.totalDuplicates} duplicate courses will be skipped
              </summary>
              <div style={{
                maxHeight: 140, overflowY: 'auto', fontSize: 12, color: 'var(--text3)',
                background: 'var(--surface2)', padding: 12, borderRadius: '0 0 10px 10px',
                border: '1px solid var(--border)', borderTop: 'none'
              }}>
                {preview.duplicateCourses.map((n, i) => (
                  <div key={i} style={{ padding: '3px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#d97706' }}>⏭</span> {n}
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <SBtn variant="outline" onClick={onClose}>Cancel</SBtn>
            <SBtn
              onClick={handleImport}
              disabled={preview.totalNew === 0}
              style={{
                background: preview.totalNew > 0 ? 'linear-gradient(135deg, #16a34a, #059669)' : undefined,
                boxShadow: preview.totalNew > 0 ? '0 4px 14px rgba(22,163,74,0.3)' : undefined,
              }}
            >
              🚀 Import {preview.totalNew} New Courses
            </SBtn>
          </div>
        </div>
      )}
    </Modal>
  )
}
