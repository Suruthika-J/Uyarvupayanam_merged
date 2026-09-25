import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Card, DataTable, TR, TD, ActionBtn, LevelBadge, FiltersRow, SearchInput, PrimaryBtn, Modal, StatCard } from '../../components/UI'
import { seatMatrixService, streamLabel } from '../../../services/seatMatrixService'

const LIMIT = 15

export default function CoursesCollegesPage() {
  const navigate = useNavigate()
  const { stream } = useParams()
  const streamName = streamLabel(stream)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [courses, setCourses] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Summary panel
  const [summary, setSummary] = useState({ courseCount: 0, mappingCount: 0, totalSeats: 0 })

  // Import modal
  const [importOpen, setImportOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [importError, setImportError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      const res = await seatMatrixService.getCourses({ stream, search: search || undefined, page, limit: LIMIT })
      setCourses(res.data || [])
      setTotal(res.count || 0)
      setTotalPages(res.totalPages || 1)
    } catch (err) {
      console.error('Failed to fetch seat-matrix courses:', err)
    } finally {
      setLoading(false)
    }
  }, [stream, search, page])

  const fetchSummary = useCallback(async () => {
    try {
      const res = await seatMatrixService.getSummary({ stream })
      setSummary(res.data || { courseCount: 0, mappingCount: 0, totalSeats: 0 })
    } catch (err) {
      console.error('Failed to fetch seat-matrix summary:', err)
    }
  }, [stream])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  useEffect(() => {
    const delay = setTimeout(fetchCourses, 300)
    return () => clearTimeout(delay)
  }, [fetchCourses])

  const openImport = () => {
    setFile(null)
    setImportResult(null)
    setImportError('')
    setImportOpen(true)
  }

  const handleFile = (f) => {
    if (!f) return
    if (!/\.pdf$/i.test(f.name) && f.type !== 'application/pdf') {
      setImportError('Please select a PDF file (the TNEA seat-matrix PDF).')
      return
    }
    setImportError('')
    setFile(f)
  }

  const handleImport = async () => {
    if (!file) {
      setImportError('Choose the TNEA seat-matrix PDF first.')
      return
    }
    setImporting(true)
    setImportResult(null)
    setImportError('')
    try {
      const res = await seatMatrixService.importPdf(file, { stream: streamName })
      setImportResult(res.report || {})
      fetchSummary()
      fetchCourses()
    } catch (err) {
      console.error('Seat-matrix import error:', err)
      setImportError(err.response?.data?.error || err.response?.data?.message || 'Import failed. Check that the uploaded file is a valid seat-matrix PDF.')
    } finally {
      setImporting(false)
    }
  }

  const seatRow = (r) => [
    { label: 'Rows parsed', value: r.rowsParsed },
    { label: 'Pages', value: r.pages },
    { label: 'Colleges', value: `${r.colleges?.matched ?? 0} matched · ${r.colleges?.created ?? 0} created` },
    { label: 'Courses', value: `${r.courses?.matched ?? 0} matched · ${r.courses?.created ?? 0} created` },
    { label: 'Mappings', value: `${r.mappingsCreated ?? 0} created · ${r.mappingsUpdated ?? 0} updated` },
    { label: 'Time', value: `${((r.timeTakenMs ?? 0) / 1000).toFixed(1)}s` },
  ]

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13, fontWeight: 700, color: 'var(--text3)' }}>
        <Link to="/admin/courses-colleges" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Courses &amp; Colleges</Link>
        <span>/</span>
        <Link to="/admin/courses-colleges" style={{ color: 'var(--text)', textDecoration: 'none' }}>{streamName}</Link>
      </div>

      {/* Summary panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        <StatCard icon="📘" value={summary.courseCount} label={`${streamName} Courses`} color="var(--primary)" />
        <StatCard icon="🔗" value={summary.mappingCount.toLocaleString()} label="Course–College Mappings" color="#d97706" />
        <StatCard icon="🪑" value={summary.totalSeats.toLocaleString()} label="Total Seats (TNEA 2026)" color="#16a34a" />
      </div>

      <FiltersRow>
        <SearchInput placeholder="🔍 Search course name or branch code..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 700 }}>
            {total} course{total !== 1 ? 's' : ''}
          </span>
          <PrimaryBtn onClick={openImport}>📥 Import Seat Matrix</PrimaryBtn>
        </div>
      </FiltersRow>

      <Card>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading courses...</div>
        ) : courses.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>
            {search ? 'No courses match your search.' : `No ${streamName} courses yet — import the seat-matrix PDF to begin.`}
          </div>
        ) : (
          <DataTable
            columns={['Course', 'Code', 'Colleges', 'Duration', 'Level', 'Actions']}
            data={courses}
            renderRow={(c) => (
              <TR key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/courses-colleges/${stream}/${c.id}`)}>
                <TD>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{c.courseName}</div>
                </TD>
                <TD><LevelBadge level={c.branchCode} /></TD>
                <TD>
                  <span style={{ fontWeight: 800, color: c.collegeCount > 0 ? 'var(--primary)' : 'var(--text3)' }}>
                    {c.collegeCount}
                  </span>
                </TD>
                <TD style={{ color: 'var(--text2)' }}>{c.duration || '\u2014'}</TD>
                <TD style={{ color: 'var(--text3)' }}>{c.level || '\u2014'}</TD>
                <TD>
                  <ActionBtn onClick={(e) => { e.stopPropagation(); navigate(`/admin/courses-colleges/${stream}/${c.id}`) }}>
                    View Colleges →
                  </ActionBtn>
                </TD>
              </TR>
            )}
          />
        )}
      </Card>

      {/* Pagination */}
      {!loading && courses.length > 0 && (
        <div style={{ padding: '14px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            Showing {(page - 1) * LIMIT + 1} to {Math.min(page * LIMIT, total)} of {total}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <ActionBtn disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</ActionBtn>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>Page {page} of {totalPages}</span>
            <ActionBtn disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</ActionBtn>
          </div>
        </div>
      )}

      {/* Import modal */}
      {importOpen && (
        <Modal title="Import TNEA Seat Matrix (PDF)" onClose={() => setImportOpen(false)} maxWidth={620}>
          {!importResult ? (
            <>
              <p style={{ fontSize: 13, color: 'var(--text2)', margin: '0 0 16px', lineHeight: 1.6 }}>
                Upload the official <b>General Academic Seat Matrix</b> PDF (TNEA 2026). Colleges are matched by code,
                courses by branch code, and seat counts are upserted — re-importing the same file is safe and idempotent.
              </p>

              <div
                onClick={() => document.getElementById('pdf-upload-input')?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]) }}
                style={{
                  border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 16, padding: 36, textAlign: 'center', cursor: 'pointer',
                  background: dragOver ? 'var(--primary-l)' : 'var(--surface2)', transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
                <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                  {file ? file.name : 'Click or drop the seat-matrix PDF here'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'Maximum 60 MB · PDF only'}
                </div>
                <input
                  id="pdf-upload-input"
                  type="file"
                  accept="application/pdf,.pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </div>

              {importError && (
                <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626' }}>
                  {importError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                <ActionBtn onClick={() => setImportOpen(false)}>Cancel</ActionBtn>
                <PrimaryBtn onClick={handleImport} disabled={importing || !file}>
                  {importing ? '⏳ Importing…' : 'Import Seat Matrix'}
                </PrimaryBtn>
              </div>
            </>
          ) : (
            <>
              <div style={{ padding: '14px 16px', borderRadius: 12, background: '#f0fdf4', border: '1px solid #86efac', color: '#15803d', fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
                ✅ Seat matrix imported successfully
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {seatRow(importResult).map((r) => (
                  <div key={r.label} style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--surface2)', border: '1.5px solid var(--border)' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{r.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>{r.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                <ActionBtn onClick={() => setImportOpen(false)}>Close</ActionBtn>
                <PrimaryBtn onClick={() => { setImportResult(null); setFile(null) }}>Import Another</PrimaryBtn>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  )
}