import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { graduateExamService } from '../../../services/graduateExamService'
import { slugify } from '../../../utils/slugify'
import styles from './GraduateExamDetailPage.module.css'

const REFER = 'Refer to the latest official notification'
const display = (v) => v || REFER

/**
 * GraduateExamDetailPage — single examination record rendered from the backend.
 * Used for both State (TNPSC & other state orgs) and Central examinations; the
 * breadcrumb and links are derived from the organization data.
 */
export default function GraduateExamDetailPage() {
  const { examId, slug: slugParam } = useParams()
  const key = slugParam || examId

  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    graduateExamService.getExam(key)
      .then((res) => { if (alive) setExam(res.data) })
      .catch((err) => { if (alive) setError(err?.response?.data?.message || 'Could not load this examination.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [key])

  if (loading) {
    return (
      <div className="student-root">
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--s-text3)' }}>Loading examination…</div>
      </div>
    )
  }

  if (error || !exam) {
    return (
      <div className="student-root">
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--s-text2)' }}>
          <p style={{ fontSize: 18, fontWeight: 800 }}>Examination not found.</p>
          <p style={{ fontSize: 14 }}>{error || 'It may have been removed. Check back later.'}</p>
          <Link to="/student/careers/government" style={{ color: 'var(--s-blue)', fontWeight: 800 }}>← Government Careers</Link>
        </div>
      </div>
    )
  }

  const org = exam.organization || {}
  const stateSlug = slugify(org.state)
  const isTnpsc = org.governmentType === 'State' && org.slug === 'tnpsc'
  const isState = org.governmentType === 'State'

  const orgHref = isTnpsc
    ? `/student/careers/government/state/${stateSlug}/tnpsc`
    : isState
      ? `/student/careers/government/state/${stateSlug}/organization/${org._id}`
      : `/student/careers/government/central/organization/${org._id}`

  const backLabel = isTnpsc ? '← Back to TNPSC Examinations' : `← Back to ${org.name} Examinations`

  const baseline = (v) => (v != null && v !== '' ? v : null)

  const dates = [
    { label: 'Notification Date', value: baseline(exam.notificationDate) },
    { label: 'Application Start', value: baseline(exam.applicationStartDate) },
    { label: 'Application End', value: baseline(exam.applicationEndDate) },
    { label: 'Exam Date', value: baseline(exam.examDate) },
    { label: 'Result Date', value: baseline(exam.resultDate) },
  ]

  const ageParts = [
    baseline(exam.minimumAge) != null ? `Min ${baseline(exam.minimumAge)} years` : '',
    baseline(exam.maximumAge) != null ? `Max ${baseline(exam.maximumAge)} years` : '',
    baseline(exam.ageRelaxation),
  ].filter(Boolean)

  const patternRows = [
    { label: 'Mode', value: baseline(exam.examPattern?.mode) },
    { label: 'Duration', value: baseline(exam.examPattern?.duration) },
    { label: 'Questions', value: baseline(exam.examPattern?.questions) },
    { label: 'Marks', value: baseline(exam.examPattern?.marks) },
  ].filter((r) => r.value != null)

  const links = [
    exam.officialWebsite && { label: 'Official Website', href: exam.officialWebsite, primary: false },
    exam.notificationUrl && { label: 'Official Notification', href: exam.notificationUrl, primary: false },
    exam.applicationUrl && { label: 'Apply Online', href: exam.applicationUrl, primary: true },
    exam.sourceUrl && { label: 'Source / Reference', href: exam.sourceUrl, primary: false },
  ].filter(Boolean)

  return (
    <div className="student-root">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>{org.name || 'Examination'}</span>
          <h1 className={styles.heroTitle}>{exam.examName}</h1>
          {exam.description && <p className={styles.heroDesc}>{exam.description}</p>}
          {exam.status && (
            <p className={styles.heroDesc}>
              <span
                style={{
                  display: 'inline-block', padding: '6px 16px', borderRadius: 999,
                  background: 'var(--s-blue-l)', color: 'var(--s-blue)',
                  fontWeight: 800, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '0.05em',
                }}
              >
                {exam.status}
              </span>
            </p>
          )}
          <nav className={styles.crumb} aria-label="Breadcrumb">
            <Link to="/student/careers/government">Government Careers</Link>
            <span aria-hidden="true">→</span>
            <Link to={isState ? '/student/careers/government/state' : '/student/careers/government/central'}>
              {isState ? 'State Government' : 'Central Government'}
            </Link>
            {isState && (
              <>
                <span aria-hidden="true">→</span>
                <Link to={`/student/careers/government/state/${stateSlug}`}>{org.state}</Link>
              </>
            )}
            <span aria-hidden="true">→</span>
            <Link to={orgHref}>{org.name}</Link>
            <span aria-hidden="true">→</span>
            <span aria-current="page">{exam.examName}</span>
          </nav>
        </div>
      </section>

      <div className={styles.content}>
        <Link to={orgHref} className={styles.backLink}>{backLabel}</Link>

        {/* ── Overview ────────────────────────────────────────── */}
        <div className={styles.overviewCard}>
          <h2 className={styles.overviewTitle}>Overview</h2>
          <div className={styles.overviewGrid}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Recruitment Organization</span>
              <span className={styles.fieldValue}>{org.name}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Exam</span>
              <span className={styles.fieldValue}>{exam.examName}</span>
            </div>
            {exam.category && (
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Category</span>
                <span className={styles.fieldValue}>{exam.category}</span>
              </div>
            )}
            {exam.shortName && (
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Short Name</span>
                <span className={styles.fieldValue}>{exam.shortName}</span>
              </div>
            )}
            {exam.governmentType && (
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Level</span>
                <span className={styles.fieldValue}>{exam.governmentType} Government{exam.state ? ` · ${exam.state}` : ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Eligibility ─────────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Eligibility</h2>
          <ul className={styles.list}>
            <li><strong style={{ color: 'var(--s-text)' }}>Educational Qualification: </strong>{display(exam.qualification)}</li>
            {(exam.eligibleDegrees || []).length > 0 && (
              <li>
                <strong style={{ color: 'var(--s-text)' }}>Eligible Degrees: </strong>
                {exam.eligibleDegrees.join(', ')}
              </li>
            )}
            <li>
              <strong style={{ color: 'var(--s-text)' }}>Age Limit: </strong>
              {ageParts.length ? ageParts.join(' · ') : REFER}
            </li>
            {exam.additionalEligibility && (
              <li>
                <strong style={{ color: 'var(--s-text)' }}>Additional Eligibility: </strong>
                {exam.additionalEligibility}
              </li>
            )}
          </ul>
        </section>

        {/* ── Posts ───────────────────────────────────────────── */}
        {exam.posts?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Posts</h2>
            <ul className={styles.list}>
              {exam.posts.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </section>
        )}

        {/* ── Selection process ───────────────────────────────── */}
        {exam.selectionProcess?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Selection Process</h2>
            <ul className={styles.list}>
              {exam.selectionProcess.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </section>
        )}

        {/* ── Exam pattern ────────────────────────────────────── */}
        {(patternRows.length > 0 || exam.examPattern?.subjects?.length > 0) && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Exam Pattern</h2>
            <table className={styles.patternTable}>
              <tbody>
                {patternRows.map((row) => (
                  <tr key={row.label}>
                    <th>{row.label}</th>
                    <td>{row.value}</td>
                  </tr>
                ))}
                {exam.examPattern?.subjects?.length > 0 && (
                  <tr>
                    <th>Subjects</th>
                    <td>
                      <ul className={styles.subjectList}>
                        {exam.examPattern.subjects.map((s) => <li key={s}>{s}</li>)}
                      </ul>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        {/* ── Syllabus ────────────────────────────────────────── */}
        {exam.syllabus?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Syllabus</h2>
            <ul className={styles.list}>
              {exam.syllabus.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </section>
        )}

        {/* ── Important dates ─────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Important Dates</h2>
          <table className={styles.patternTable}>
            <tbody>
              {dates.map((d) => (
                <tr key={d.label}>
                  <th>{d.label}</th>
                  <td>{display(d.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── Application ─────────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Application</h2>
          {links.length === 0 ? (
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--s-text2)' }}>
              {REFER} — the official links will appear here once the current cycle is published.
            </p>
          ) : (
            <div className={styles.actions}>
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`${styles.actionBtn} ${l.primary ? styles.actionPrimary : styles.actionSecondary}`}
                >
                  {l.primary ? '🚀 ' : ''}{l.label} ↗
                </a>
              ))}
            </div>
          )}
          {exam.salary && (
            <p style={{ marginTop: 14, fontSize: 14, color: 'var(--s-text2)' }}>
              <strong style={{ color: 'var(--s-text)' }}>Remuneration: </strong>{exam.salary}
            </p>
          )}
        </section>
      </div>

      <p className={styles.note}>
        Volatile details — vacancy numbers, exact age windows, dates and application status — are shown only from
        the latest official notification and updated by the administration. Always verify the current notification
        and official website before applying.
      </p>
    </div>
  )
}