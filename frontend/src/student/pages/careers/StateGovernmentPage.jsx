import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { graduateExamService } from '../../../services/graduateExamService'
import { slugify } from '../../../utils/slugify'
import styles from './StateGovernmentPage.module.css'

/**
 * StateGovernmentPage — selects a state. States are derived from the database
 * (organizations with governmentType "State") so a newly added state
 * organization surfaces here automatically.
 */
export default function StateGovernmentPage() {
  const [states, setStates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    graduateExamService.getOrganizations({ governmentType: 'State' })
      .then((res) => {
        if (!alive) return
        const map = new Map()
        const all = res.data || []
        all.forEach((o) => {
          if (!o.state) return
          const slug = slugify(o.state)
          if (!map.has(slug)) map.set(slug, { name: o.state, slug, orgs: [] })
          map.get(slug).orgs.push(o.name)
        })
        setStates([...map.values()].sort((a, b) => a.name.localeCompare(b.name)))
      })
      .catch((err) => { if (alive) setError(err?.response?.data?.message || 'Could not load states.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  return (
    <div className="student-root">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Government Career · State</span>
          <h1 className={styles.heroTitle}>State Government</h1>
          <p className={styles.heroDesc}>
            Select a state to explore its government jobs, competitive examinations, and
            recruitment boards.
          </p>
          <nav className={styles.crumb} aria-label="Breadcrumb">
            <Link to="/student/careers/government">Government Careers</Link>
            <span aria-hidden="true">→</span>
            <span aria-current="page">State Government</span>
          </nav>
        </div>
      </section>

      {/* ── States ───────────────────────────────────────────── */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Select a State</h2>
          <p className={styles.sectionDesc}>
            State-level recruitment commissions and boards currently available.
          </p>
        </header>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--s-text3)' }}>Loading states…</p>
        ) : error ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--s-text2)' }}>{error}</p>
        ) : states.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--s-text3)' }}>
            No state organizations published yet — check back later.
          </p>
        ) : (
          <div className={styles.stateGrid}>
            {states.map((s) => (
              <Link key={s.slug} to={`/student/careers/government/state/${s.slug}`} className={styles.stateCard}>
                <h3 className={styles.stateName}>{s.name}</h3>
                <p className={styles.stateDesc}>
                  {s.orgs.length} {s.orgs.length === 1 ? 'recruitment organization' : 'recruitment organizations'}
                </p>
                <span className={styles.stateLink}>Explore →</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}