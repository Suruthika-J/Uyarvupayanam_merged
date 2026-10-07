import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  SLoader, SEmpty, SBadge, SBtn, DataTable, TR, TD, ActionBtn,
  FiltersRow, SearchInput, FilterSelect, Modal, SAlert,
} from '../../../components/UI'
import { slugify } from '../../../../utils/slugify'
import { graduateExamService } from '../../../../services/graduateExamService'

const STATUS_OPTIONS = [
  'Upcoming',
  'Application Open',
  'Application Closed',
  'Exam Scheduled',
  'Result Released',
  'Archived',
]

const STATUS_COLOR = {
  '': 'gray',
  Upcoming: 'purple',
  'Application Open': 'green',
  'Application Closed': 'red',
  'Exam Scheduled': 'blue',
  'Result Released': 'gold',
  Archived: 'gray',
}

const QUALIFICATION_FALLBACK = 'Check latest official notification'

/**
 * GraduateOrgExamsPage — examination management table for ONE organization
 * (e.g. TNPSC or UPSC). Add / Edit open the exam form; Delete softly archives.
 */
export default function GraduateOrgExamsPage() {
  const { orgId } = useParams()
  const navigate = useNavigate()

  const [org, setOrg] = useState(null)
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')

  const [viewing, setViewing] = useState(null)
  const [toasts, setToasts] = useState([])
  const [deleting, setDeleting] = useState(false)

  const toast = (type, msg) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, type, msg }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [orgRes, examRes] = await Promise.all([
        graduateExamService.getOrganization(orgId),
        graduateExamService.getExams({ organization: orgId, includeInactive: 1 }),
      ])
      setOrg(orgRes.data)
      setExams(examRes.data || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load examinations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [orgId])

  const backTo = org
    ? (org.state
        ? `/admin/graduate-exams/state/${slugify(org.state)}`
        : '/admin/graduate-exams/central')
    : '/admin/graduate-exams'

  const filtered = exams.filter((e) => {
    if (status !== 'All') {
      const matchesStatus = status === 'Archived' ? (!e.isActive || e.status === 'Archived') : e.status === status
      if (!matchesStatus) return false
    }
    if (search.trim()) {
      const term = search.trim().toLowerCase()
      const haystack = [e.examName, e.shortName, e.category, e.qualification].filter(Boolean).join(' ').toLowerCase()
      if (!haystack.includes(term)) return false
    }
    return true
  })

  const handleDelete = async (exam) => {
    if (!window.confirm(`Archive "${exam.examName}"? It will be hidden from the student Government Career pages (soft delete).`)) return
    setDeleting(true)
    try {
      await graduateExamService.deleteExam(exam._id)
      toast('success', `"${exam.examName}" archived.`)
      fetchData()
    } catch (err) {
      toast('error', err?.response?.data?.message || 'Failed to archive exam.')
    } finally {
      setDeleting(false)
    }
  }

  const handleRestore = async (exam) => {
    setDeleting(true)
    try {
      await graduateExamService.updateExam(exam._id, {
        organization: exam.organization?._id || exam.organization,
        isActive: true,
      })
      toast('success', `"${exam.examName}" restored.`)
      fetchData()
    } catch (err) {
      toast('error', err?.response?.data?.message || 'Failed to restore exam.')
    } finally {
      setDeleting(false)
    }
  }

  const lastUpdated = (exam) => {
    if (!exam.updatedAt) return '—'
    try {
      return new Date(exam.updatedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
    } catch {
      return '—'
    }
  }

  return (
    <div>
      {/* Toasts */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map((t) => (
          <SAlert key={t.id} type={t.type} style={{ minWidth: 260, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
            {t.msg}
          </SAlert>
        ))}
      </div>

      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text3)' }}>
        <Link to="/admin/graduate-exams" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Graduate Exams</Link>
        {' '}→{' '}
        <Link to={backTo} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
          {org?.governmentType === 'State' ? 'State Government' : 'Central Government'}
        </Link>
        {org?.state && (
          <>
            {' '}→{' '}
            <Link to={`/admin/graduate-exams/state/${slugify(org.state)}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              {org.state}
            </Link>
          </>
        )}
        {org && <> → {org.name}</>}
      </span>

      {loading && <SLoader />}

      {!loading && error && (
        <div style={{ marginTop: 16 }}>
          <SAlert type="error">{error}</SAlert>
        </div>
      )}

      {!loading && !error && org && (
        <>
          {/* Org header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, margin: '12px 0 8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: 'Nunito', fontSize: 22, fontWeight: 900, color: 'var(--text)', margin: 0 }}>
                {org.name}
              </h2>
              <SBadge color={org.governmentType === 'State' ? 'blue' : 'purple'}>{org.governmentType}</SBadge>
              {org.state && <SBadge color="gray">{org.state}</SBadge>}
              <SBadge color={org.isActive ? 'green' : 'gray'}>{org.isActive ? 'Active' : 'Archived'}</SBadge>
            </div>
            <SBtn onClick={() => navigate(`/admin/graduate-exams/exam/new?org=${org._id}`)}>＋ Add Exam</SBtn>
          </div>
          {org.description && (
            <p style={{ margin: '0 0 18px', color: 'var(--text2)', fontSize: 14, maxWidth: 760, lineHeight: 1.6 }}>{org.description}</p>
          )}

          {/* Filters */}
          <FiltersRow>
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by exam name, short name or category…" />
            <FilterSelect value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </FilterSelect>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text3)', marginLeft: 'auto' }}>
              {filtered.length} of {exams.length} exam{exams.length === 1 ? '' : 's'}
            </span>
          </FiltersRow>

          {exams.length === 0 ? (
            <SEmpty icon="📝" title="No examinations yet" desc="Click “＋ Add Exam” to create the first examination record for this organization." />
          ) : filtered.length === 0 ? (
            <SEmpty icon="🔍" title="No matches" desc="No examinations match the current search or filter." />
          ) : (
            <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 20, padding: '8px 12px', overflowX: 'auto' }}>
              <DataTable
                columns={['Exam', 'Organization', 'Qualification', 'Posts', 'Status', 'Last Updated', 'Actions']}
                data={filtered}
                renderRow={(exam) => (
                  <TR key={exam._id} style={!exam.isActive ? { opacity: 0.55 } : undefined}>
                    <TD>
                      <div style={{ fontWeight: 800, color: 'var(--text)' }}>{exam.examName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>
                        {[exam.shortName, exam.category].filter(Boolean).join(' · ') || '—'}
                      </div>
                    </TD>
                    <TD>{org.name}</TD>
                    <TD style={{ maxWidth: 260 }}>
                      <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
                        {exam.qualification ? (exam.qualification.length > 96 ? `${exam.qualification.slice(0, 96)}…` : exam.qualification) : QUALIFICATION_FALLBACK}
                      </span>
                    </TD>
                    <TD style={{ maxWidth: 220 }}>
                      <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
                        {exam.posts?.length ? exam.posts.slice(0, 3).join(' · ') + (exam.posts.length > 3 ? ' …' : '') : '—'}
                      </span>
                    </TD>
                    <TD>
                      <SBadge color={STATUS_COLOR[exam.status] || 'gray'}>
                        {exam.status || 'TBA'}
                      </SBadge>
                      {!exam.isActive && <div style={{ marginTop: 4, fontSize: 11, fontWeight: 800, color: '#64748b' }}>ARCHIVED</div>}
                    </TD>
                    <TD style={{ fontSize: 13, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{lastUpdated(exam)}</TD>
                    <TD>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <ActionBtn onClick={() => setViewing(exam)}>View</ActionBtn>
                        <ActionBtn style={{ color: 'var(--primary)' }} onClick={() => navigate(`/admin/graduate-exams/exam/${exam._id}`)}>Edit</ActionBtn>
                        {!exam.isActive && (
                          <ActionBtn style={{ color: 'var(--gold, #b45309)' }} onClick={() => handleRestore(exam)} disabled={deleting}>Restore</ActionBtn>
                        )}
                        <ActionBtn danger onClick={() => handleDelete(exam)} disabled={deleting}>Delete</ActionBtn>
                      </div>
                    </TD>
                  </TR>
                )}
              />
            </div>
          )}

          <p style={{ marginTop: 14, fontSize: 12.5, color: 'var(--text3)', fontWeight: 600 }}>
            Volatile details (dates, vacancies, status, application links) are never fabricated — leave them empty
            until you add them from the latest official notification. Delete softly archives the record.
          </p>
        </>
      )}

      {/* View modal */}
      {viewing && (
        <Modal title={viewing.examName} onClose={() => setViewing(null)} maxWidth={720}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <SBadge color={STATUS_COLOR[viewing.status] || 'gray'}>{viewing.status || 'TBA'}</SBadge>
            <SBadge color={viewing.governmentType === 'State' ? 'blue' : 'purple'}>{viewing.governmentType}</SBadge>
            {viewing.state && <SBadge color="gray">{viewing.state}</SBadge>}
          </div>
          <ViewFields exam={viewing} orgName={org?.name} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <SBtn variant="outline" onClick={() => setViewing(null)}>Close</SBtn>
            <SBtn onClick={() => { const id = viewing._id; setViewing(null); navigate(`/admin/graduate-exams/exam/${id}`) }}>Edit Exam</SBtn>
          </div>
        </Modal>
      )}
    </div>
  )
}

function FieldRow({ label, value, wrap = true }) {
  return (
    <div style={{ padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text3)', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.55, whiteSpace: wrap ? 'normal' : 'pre-line' }}>{value || '—'}</div>
    </div>
  )
}

function ViewFields({ exam, orgName }) {
  const list = (arr) => (arr && arr.length ? arr.join('\n') : '')
  return (
    <div>
      <FieldRow label="Organization" value={orgName} />
      <FieldRow label="Short Name" value={exam.shortName} />
      <FieldRow label="Category" value={exam.category} />
      <FieldRow label="Description" value={exam.description} />
      <FieldRow label="Qualification" value={exam.qualification} />
      <FieldRow label="Eligible Degrees" value={list(exam.eligibleDegrees)} wrap={false} />
      <FieldRow label="Age" value={[exam.minimumAge != null ? `Min ${exam.minimumAge}` : '', exam.maximumAge != null ? `Max ${exam.maximumAge}` : '', exam.ageRelaxation].filter(Boolean).join(' · ') || ''} />
      <FieldRow label="Additional Eligibility" value={exam.additionalEligibility} />
      <FieldRow label="Posts" value={list(exam.posts)} wrap={false} />
      <FieldRow label="Salary / Remuneration" value={exam.salary} />
      <FieldRow label="Selection Process" value={list(exam.selectionProcess)} wrap={false} />
      <FieldRow label="Exam Pattern" value={[exam.examPattern?.mode, exam.examPattern?.duration, exam.examPattern?.questions, exam.examPattern?.marks].filter(Boolean).join(' · ') + (exam.examPattern?.subjects?.length ? `\nSubjects:\n${exam.examPattern.subjects.join('\n')}` : '')} wrap={false} />
      <FieldRow label="Syllabus" value={list(exam.syllabus)} wrap={false} />
      <FieldRow label="Dates" value={[
        exam.notificationDate && `Notification: ${exam.notificationDate}`,
        exam.applicationStartDate && `Application start: ${exam.applicationStartDate}`,
        exam.applicationEndDate && `Application end: ${exam.applicationEndDate}`,
        exam.examDate && `Exam: ${exam.examDate}`,
        exam.resultDate && `Result: ${exam.resultDate}`,
      ].filter(Boolean).join('\n') || ''} wrap={false} />
      <FieldRow label="Official Website" value={exam.officialWebsite} />
      <FieldRow label="Notification URL" value={exam.notificationUrl} />
      <FieldRow label="Application URL" value={exam.applicationUrl} />
      <FieldRow label="Source / Reference URL" value={exam.sourceUrl} />
    </div>
  )
}