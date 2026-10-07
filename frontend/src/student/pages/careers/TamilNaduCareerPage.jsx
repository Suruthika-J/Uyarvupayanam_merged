import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { graduateExamService } from '../../../services/graduateExamService'
import { slugify } from '../../../utils/slugify'
import styles from './TamilNaduCareerPage.module.css'

/**
 * TamilNaduCareerPage — recruitment organizations of one state (e.g. Tamil
 * Nadu → TNPSC). Organization list is driven by the backend. TNPSC keeps the
 * deep "…/tnpsc" URL for backward compatibility; other organizations use the
 * generic "…/organization/:id" route.
 */
export default function TamilNaduCareerPage() {
  const { stateSlug = 'tamil-nadu' } = useParams()
  const [stateName, setStateName] = useState('')
  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await graduateExamService.getOrganizations({ governmentType: 'State' })
      const all = res.data || []
      const matched = all.filter((o) => slugify(o.state) === stateSlug)
      setOrgs(matched)
      setStateName(matched[0]?.state || stateSlug.split('-').map((w) => w[0]?.toUpperCase() + w.slice(1)).join(' '))
    } catch (err) {
      console.error('TamilNaduCareerPage load failed:', err)
      setError(err?.response?.data?.message || 'Could not load this state.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [stateSlug])

  return (
    <div className="student-root">
      {/* ── Page heading ─────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>State Government · {stateName}</span>
          <h1 className={styles.heroTitle}>{stateName} Government Jobs</h1>
          <nav className={styles.crumb} aria-label="Breadcrumb">
            <Link to="/student/careers/government">Government Careers</Link>
            <span aria-hidden="true">→</span>
            <Link to="/student/careers/government/state">State Government</Link>
            <span aria-hidden="true">→</span>
            <span aria-current="page">{stateName}</span>
          </nav>
        </div>
      </section>

      {/* ── Recruitment organizations ────────────────────────── */}
      <section className={styles.cardSection} aria-label={`${stateName} recruitment organizations`}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--s-text3)' }}>Loading organizations…</p>
        ) : error ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--s-text2)' }}>{error}</p>
        ) : orgs.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--s-text3)' }}>
            No recruitment organizations published for {stateName} yet — check back later.
          </p>
        ) : (
          orgs.map((org) => (
            <Link
              key={org._id}
              to={
                org.slug === 'tnpsc'
                  ? `/student/careers/government/state/${slugify(org.state)}/tnpsc`
                  : `/student/careers/government/state/${slugify(org.state)}/organization/${org._id}`
              }
              className={styles.boardCard}
              style={{ marginBottom: 18 }}
            >
              <h2 className={styles.boardName}>{org.name}</h2>
              {org.description && <p className={styles.boardDesc}>{org.description}</p>}
              <span className={styles.boardLink}>Explore Examinations →</span>
            </Link>
          ))
        )}
      </section>
    </div>
  )
}