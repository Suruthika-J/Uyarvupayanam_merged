import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Card, DataTable, TR, TD, ActionBtn, LevelBadge, FiltersRow, SearchInput, PrimaryBtn, Modal } from '../../components/UI'
import { seatMatrixService, streamSlug, streamLabel, STREAM_OPTIONS } from '../../../services/seatMatrixService'

const LIMIT = 15

// Per-stream accent colors — same "Class 10 Guidance" pill-tab language.
const STREAM_COLORS = {
  engineering: '#4f46e5',
  medical: '#059669',
  'arts-science': '#8b5cf6',
  law: '#d97706',
  diploma: '#64748b',
  'media-journalism': '#e11d48',
  polytechnic: '#0891b2',
  agriculture: '#65a30d',
  others: '#78716c',
}

export default function StreamCoursesHub() {
  const navigate = useNavigate()
  const params = useParams()
  const routeStream = streamSlug(params.stream) // 'engineering' when absent

  // ── Stream tabs (Level 1 summary) ────────────────────────────────────────
  const [streams, setStreams] = useState([])
  const [tabsLoading, setTabsLoading] = useState(true)
  const [activeKey, setActiveKey] = useState(null)
  const [tabsError, setTabsError] = useState('')

  // ── Active stream content (Level 2 courses) ──────────────────────────────
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [courses, setCourses] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // ── Import modal ─────────────────────────────────────────────────────────
  const [importOpen, setImportOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [importError, setImportError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const byKey = useMemo(() => new Map(streams.map((s) => [s.stream, s])), [streams])
  const firstEnabled = useMemo(
    () => STREAM_OPTIONS.find((o) => byKey.get(o.key)?.courseCount > 0)?.key || null,
    [byKey]
  )

  const fetchTabs = useCallback(async () => {
    try {
      setTabsLoading(true)
      const res = await seatMatrixService.getStreamsSummary()
      setStreams(res.data || [])
      setTabsError('')
    } catch (err) {
      console.error('Failed to load stream summary:', err)
      setTabsError('Failed to load streams. Check your connection and try again.')
    } finally {
      setTabsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTabs()
  }, [fetchTabs])

  // Keep the active tab in sync with the URL (or the first stream with data).
  useEffect(() => {
    if (tabsLoading || !streams.length) return
    const entry = byKey.get(routeStream)
    const next = entry && entry.courseCount > 0 ? routeStream : firstEnabled
    setActiveKey((k) => (k === next ? k : next))
  }, [routeStream, streams, byKey, firstEnabled, tabsLoading])

  const fetchCourses = useCallback(async () => {
    if (!activeKey) return
    try {
      setLoading(true)
      const res = await seatMatrixService.getCourses({ stream: activeKey, search: search || undefined, page, limit: LIMIT })
      setCourses(res.data || [])
      setTotal(res.count || 0)
      setTotalPages(res.totalPages || 1)
    } catch (err) {
      console.error('Failed to fetch seat-matrix courses:', err)
    } finally {
      setLoading(false)
    }
  }, [activeKey, search, page])

  useEffect(() => {
    const delay = setTimeout(fetchCourses, 300)
    return () => clearTimeout(delay)
  }, [fetchCourses])

  // Reset search/page when switching tabs.
  const changeTab = (key) => {
    if (!byKey.get(key)?.courseCount) return
    setPage(1)
    setSearch('')
    navigate(`/admin/courses-colleges/${key}`)
  }

  // ── Import helpers ───────────────────────────────────────────────────────
  const streamName = activeKey ? streamLabel(activeKey) : ''
  const streamEntry = activeKey ? byKey.get(activeKey) : null

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
      fetchTabs() // counts may have changed
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

  // Overview chips for the hero (all streams, from the live summary).
  const totals = useMemo(() => {
    return streams.reduce(
      (acc, s) => ({
        courses: acc.courses + (s.courseCount || 0),
        colleges: acc.colleges + (s.collegeCount || 0),
        seats: acc.seats + (s.totalSeats || 0),
      }),
      { courses: 0, colleges: 0, seats: 0 }
    )
  }, [streams])

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>

      {/* ── Hero (Class 10 Guidance theme) ── */}
      <section style={{
        padding: '40px 28px', textAlign: 'center', color: '#fff',
        background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
        borderRadius: 28, marginBottom: 22, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', width: 260, height: 260, borderRadius: 999,
          background: 'rgba(255,255,255,0.08)', top: -110, right: -60,
        }} />
        <div style={{
          position: 'absolute', width: 180, height: 180, borderRadius: 999,
          background: 'rgba(255,255,255,0.06)', bottom: -80, left: -40,
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 8 }}>📚</div>
          <h1 style={{
            fontFamily: 'var(--s-font-display, Outfit, sans-serif)', fontWeight: 900,
            fontSize: 'clamp(26px, 4vw, 36px)', margin: '0 0 8px', color: '#fff', letterSpacing: '-0.02em',
          }}>
            {params.stream && streamName ? `${streamName} Stream` : 'Courses & Colleges'}
          </h1>
          <p style={{ fontSize: 15, color: '#e0e7ff', maxWidth: 620, margin: '0 auto 20px', lineHeight: 1.6 }}>
            {params.stream && streamName
              ? `Courses, colleges & ${streamEntry?.totalSeats ? 'TNEA seat details' : 'college lists'} for ${streamName}.`
              : 'Choose a stream tab below — every tab shows its live courses, colleges and seat data.'}
          </p>

          {/* Live counts as Class-10 style chips */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { emoji: '🧭', value: streams.filter((s) => s.courseCount > 0).length, label: 'Active Streams' },
              { emoji: '📘', value: totals.courses.toLocaleString(), label: 'Total Courses' },
              { emoji: '🏫', value: totals.colleges.toLocaleString(), label: 'Total Colleges' },
              { emoji: '🪑', value: totals.seats.toLocaleString(), label: 'Total Seats' },
            ].map((c) => (
              <div key={c.label} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)',
                padding: '10px 18px', borderRadius: 16, backdropFilter: 'blur(6px)',
              }}>
                <span style={{ fontSize: 22 }}>{c.emoji}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 900, fontSize: 18, lineHeight: 1 }}>{c.value}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#e0e7ff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sticky tab bar (Class 10 section-tab look) ── */}
      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto', padding: 8,
        background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)',
        borderRadius: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)',
        border: '1px solid rgba(255,255,255,0.5)', position: 'sticky', top: 20, zIndex: 100,
        marginBottom: 20,
      }}>
        {STREAM_OPTIONS.map((o) => {
          const entry = byKey.get(o.key)
          const enabled = (entry?.courseCount || 0) > 0
          const isActive = activeKey === o.key
          const color = STREAM_COLORS[o.key] || '#4f46e5'
          return (
            <button
              key={o.key}
              onClick={() => enabled && changeTab(o.key)}
              disabled={!enabled}
              title={enabled ? `${o.label} — ${entry.courseCount} courses` : `${o.label} — no data imported yet`}
              style={{
                flexShrink: 0, padding: '10px 18px', borderRadius: 18, border: 'none',
                background: isActive ? color : 'transparent',
                color: isActive ? '#fff' : enabled ? '#475569' : '#cbd5e1',
                display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 13.5,
                cursor: enabled ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? `0 10px 15px -3px ${color}44` : 'none',
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                opacity: enabled ? 1 : 0.5,
              }}
            >
              <span style={{ fontSize: 17 }}>{o.icon}</span>
              <span>{o.label}</span>
              <span style={{
                fontSize: 11, fontWeight: 900,
                background: isActive ? 'rgba(255,255,255,0.25)' : enabled ? 'rgba(79,70,229,0.08)' : 'transparent',
                padding: '2px 8px', borderRadius: 99,
              }}>
                {entry?.courseCount || 0}
              </span>
            </button>
          )
        })}
      </div>

      {tabsError && (
        <Card><div style={{ padding: 30, textAlign: 'center', color: 'var(--text3)' }}>{tabsError}</div></Card>
      )}

      {!tabsError && activeKey && (
        <>
          {/* Active stream stat chips */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 18 }}>
            {[
              { emoji: '📘', value: streamEntry?.courseCount || 0, label: `${streamName} Courses` },
              { emoji: '🏫', value: (streamEntry?.collegeCount || 0).toLocaleString(), label: 'Colleges' },
              { emoji: '🔗', value: (streamEntry?.mappingCount || 0).toLocaleString(), label: 'Course–College Mappings' },
              { emoji: '🪑', value: (streamEntry?.totalSeats || 0).toLocaleString(), label: 'TNEA Seats' },
            ].map((c) => (
              <div key={c.label} style={{
                background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)',
                padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 14, display: 'grid', placeItems: 'center',
                  background: 'var(--surface2)', fontSize: 24,
                }}>{c.emoji}</div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.15, color: 'var(--text)' }}>{c.value}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{c.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Breadcrumb + search + import */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 13, fontWeight: 700, color: 'var(--text3)' }}>
            <Link to="/admin/courses-colleges" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Courses &amp; Colleges</Link>
            <span>/</span>
            <span style={{ color: 'var(--text)' }}>{streamName}</span>
          </div>

          <FiltersRow>
            <SearchInput placeholder="🔍 Search course name or branch code..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 700 }}>
                {total} course{total !== 1 ? 's' : ''}
              </span>
              <PrimaryBtn onClick={openImport}>{activeKey === 'engineering' ? '📥 Import Seat Matrix' : '📥 Import Stream PDF'}</PrimaryBtn>
            </div>
          </FiltersRow>

          <Card>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading courses...</div>
            ) : courses.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>
                {search ? 'No courses match your search.' : `No ${streamName} courses available yet — import a seat-matrix PDF to begin.`}
              </div>
            ) : (
              <DataTable
                columns={['Course', 'Code', 'Colleges', 'Duration', 'Level', 'Actions']}
                data={courses}
                renderRow={(c) => (
                  <TR key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/courses-colleges/${activeKey}/${c.id}`)}>
                    <TD>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{c.courseName}</div>
                    </TD>
                    <TD>
                      {c.branchCode ? <LevelBadge level={c.branchCode} /> : <span style={{ color: 'var(--text3)' }}>—</span>}
                    </TD>
                    <TD>
                      <span style={{ fontWeight: 800, color: c.collegeCount > 0 ? 'var(--primary)' : 'var(--text3)' }}>
                        {c.collegeCount}
                      </span>
                    </TD>
                    <TD style={{ color: 'var(--text2)' }}>{c.duration || '\u2014'}</TD>
                    <TD style={{ color: 'var(--text3)' }}>{c.level || '\u2014'}</TD>
                    <TD>
                      <ActionBtn onClick={(e) => { e.stopPropagation(); navigate(`/admin/courses-colleges/${activeKey}/${c.id}`) }}>
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
        </>
      )}

      {/* Import modal */}
      {importOpen && (
        <Modal title={`Import ${streamName} Seat Matrix (PDF)`} onClose={() => setImportOpen(false)} maxWidth={620}>
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
      {tabsLoading && !streams.length && (
        <Card><div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading streams…</div></Card>
      )}
    </div>
  )
}