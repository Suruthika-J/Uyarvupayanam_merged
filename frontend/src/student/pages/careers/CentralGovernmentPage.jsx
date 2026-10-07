import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { graduateExamService } from '../../../services/graduateExamService'
import styles from './CentralGovernmentPage.module.css'

/**
 * CentralGovernmentPage — central organizations (UPSC, SSC, banking, railways,
 * other central bodies). Organization list is backend-driven; each organization
 * links to its examination pages.
 */
export default function CentralGovernmentPage() {
  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    graduateExamService.getOrganizations({ governmentType: 'Central' })
      .then((res) => { if (alive) setOrgs(res.data || []) })
      .catch((err) => { if (alive) setError(err?.response?.data?.message || 'Could not load organizations.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  return (
    <div className="student-root">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Government Career · Central</span>
          <h1 className={styles.heroTitle}>Central Government</h1>
          <p className={styles.heroDesc}>
            National-level examinations and recruitments conducted by Union government bodies
            and their agencies.
          </p>
          <nav className={styles.crumb} aria-label="Breadcrumb">
            <Link to="/student/careers/government">Government Careers</Link>
            <span aria-hidden="true">→</span>
            <span aria-current="page">Central Government</span>
          </nav>
        </div>
      </section>

      {/* ── Organizations ────────────────────────────────────── */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recruitment Organizations</h2>
          <p className={styles.sectionDesc}>
            Select an organization to explore its graduate examinations.
          </p>
        </header>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--s-text3)' }}>Loading organizations…</p>
        ) : error ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--s-text2)' }}>{error}</p>
        ) : orgs.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--s-text3)' }}>
            No central organizations published yet — check back later.
          </p>
        ) : (
          <div className={styles.list}>
            {orgs.map((org) => (
              <Link
                key={org._id}
                to={`/student/careers/government/central/organization/${org._id}`}
                className={`${styles.examCard} ${styles.orgLink}`}
              >
                <div className={styles.examHead}>
                  <h3 className={styles.examName}>{org.name}</h3>
                  <p className={styles.examOrg}>Central Government</p>
                  {org.description && <p className={styles.examSummary}>{org.description}</p>}
                </div>
                <span className={styles.explore}>Explore Examinations →</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <p className={styles.note}>
        Eligibility is always role-specific — the qualification, age limit, and selection stages
        shown for each examination summarise its official notification. Always verify the current
        notification and official website before applying.
      </p>
    </div>
  )
}