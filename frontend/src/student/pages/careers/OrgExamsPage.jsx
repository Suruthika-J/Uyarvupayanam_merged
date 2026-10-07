import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { graduateExamService } from '../../../services/graduateExamService'
import { slugify } from '../../../utils/slugify'
import styles from './OrgExamsPage.module.css'

const EXAMSPACE_LINK = (org) => {
  const stateSlug = slugify(org.state)
  if (org.governmentType === 'State' && org.slug === 'tnpsc') {
    return `/student/careers/government/state/${stateSlug}/tnpsc/:slug`
  }
  if (org.governmentType === 'State') {
    return `/student/careers/government/state/${stateSlug}/organization/${org._id}/exam/:slug`
  }
  return `/student/careers/government/central/organization/${org._id}/exam/:slug`
}

/**
 * OrgExamsPage — one recruitment organization's examination list (used for
 * TNPSC, any state organization, and central organizations). All data is read
 * from the backend; nothing is hardcoded.
 */
export default function OrgExamsPage({ orgSlug }) {
  const { orgId } = useParams()
  const [org, setOrg] = useState(null)
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const orgRes = await graduateExamService.getOrganization(orgSlug || orgId)
        if (!alive) return
        const orgData = orgRes.data
        const examRes = await graduateExamService.getExams({ organization: orgData._id })
        if (!alive) return
        setOrg(orgData)
        setExams(examRes.data || [])
      } catch (err) {
        if (alive) setError(err?.response?.data?.message || 'Could not load this organization.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [orgSlug, orgId])

  if (loading) {
    return (
      <div className="student-root">
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--s-text3)' }}>Loading examinations…</div>
      </div>
    )
  }

  if (error || !org) {
    return (
      <div className="student-root">
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--s-text2)' }}>
          <p style={{ fontSize: 18, fontWeight: 800 }}>Unable to load this organization.</p>
          <p style={{ fontSize: 14 }}>{error || 'It may have been temporarily removed. Check back later.'}</p>
          <Link to="/student/careers/government" style={{ color: 'var(--s-blue)', fontWeight: 800 }}>← Government Careers</Link>
        </div>
      </div>
    )
  }

  const stateSlug = slugify(org.state)

  return (
    <div className="student-root">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>
            {org.governmentType === 'State' ? `${org.state} · ${org.name.split('(')[0].trim()}` : `Central Government · ${org.name.split('(')[0].trim()}`}
          </span>
          <h1 className={styles.heroTitle}>{org.name}</h1>
          {org.description && <p className={styles.heroDesc}>{org.description}</p>}
          {(org.officialWebsite || org.sourceUrl || org.referenceSource) && (
            <div className={styles.orgLinks}>
              {org.officialWebsite && (
                <a className={styles.orgLink} href={org.officialWebsite} target="_blank" rel="noopener noreferrer">
                  Official Website ↗
                </a>
              )}
              {org.sourceUrl && (
                <a className={styles.orgLink} href={org.sourceUrl} target="_blank" rel="noopener noreferrer">
                  Official Notification Source ↗
                </a>
              )}
              {org.referenceSource && (
                <a className={`${styles.orgLink} ${styles.orgLinkRef}`} href={org.referenceSource} target="_blank" rel="noopener noreferrer">
                  Reference Guide ↗
                </a>
              )}
            </div>
          )}
          <nav className={styles.crumb} aria-label="Breadcrumb">
            <Link to="/student/careers/government">Government Careers</Link>
            <span aria-hidden="true">→</span>
            <Link to={org.governmentType === 'State' ? '/student/careers/government/state' : '/student/careers/government/central'}>
              {org.governmentType === 'State' ? 'State Government' : 'Central Government'}
            </Link>
            {org.governmentType === 'State' && (
              <>
                <span aria-hidden="true">→</span>
                <Link to={`/student/careers/government/state/${stateSlug}`}>{org.state}</Link>
              </>
            )}
            <span aria-hidden="true">→</span>
            <span aria-current="page">{org.name}</span>
          </nav>
        </div>
      </section>

      {/* ── Examinations ─────────────────────────────────────── */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Examinations</h2>
          <p className={styles.sectionDesc}>
            Select an examination to view its posts, eligibility, pattern and application details.
          </p>
        </header>

        {exams.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--s-text3)' }}>
            No examinations published yet — check back later.
          </p>
        ) : (
          <div className={styles.examGrid}>
            {exams.map((exam) => (
              <Link key={exam._id} to={EXAMSPACE_LINK(org).replace(':slug', exam.slug)} className={styles.examCard}>
                <h3 className={styles.examName}>{exam.examName}</h3>
                {exam.category && <p className={styles.examSub}>{exam.category}</p>}
                {exam.description && <p className={styles.examDesc}>{exam.description}</p>}
                <span className={styles.examLink}>View Details →</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <p style={{ maxWidth: 760, margin: '40px auto 72px', padding: '20px 24px', background: 'var(--s-surface2)', border: '1px dashed var(--s-border)', borderRadius: 14, fontSize: 13.5, lineHeight: 1.7, color: 'var(--s-text2)' }}>
        Eligibility is always role-specific — the qualification, age limit and selection stages shown for each
        examination are summarised from the official notification. Dates, vacancies and application status are
        updated by the administration as new notifications are released, so always verify the current cycle on
        the official website before applying.
      </p>
    </div>
  )
}