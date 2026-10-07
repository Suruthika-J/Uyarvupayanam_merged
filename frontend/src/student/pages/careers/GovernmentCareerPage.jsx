import React from 'react'
import { Link } from 'react-router-dom'
import styles from './GovernmentCareerPage.module.css'

export default function GovernmentCareerPage() {
  return (
    <div className="student-root">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Government Career</span>
          <h1 className={styles.heroTitle}>Explore Government Careers</h1>
          <p className={styles.heroDesc}>
            Choose a direction to explore — national-level recruitments conducted by Union
            government bodies, or Tamil Nadu state government examinations and boards.
          </p>
          <nav className={styles.crumb} aria-label="Breadcrumb">
            <Link to="/explore#choose-journey">Career Explorer</Link>
            <span aria-hidden="true">→</span>
            <span aria-current="page">Government Careers</span>
          </nav>
        </div>
      </section>

      {/* ── Two directions ──────────────────────────────────── */}
      <section className={styles.section} aria-labelledby="directions-heading">
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle} id="directions-heading">
            Choose a Direction
          </h2>
          <p className={styles.sectionDesc}>
            Select Central Government or State Government to continue.
          </p>
        </header>
        <div className={styles.directionGrid}>
          <Link to="/student/careers/government/central" className={styles.directionCard}>
            <h3 className={styles.directionName}>Central Government</h3>
            <p className={styles.directionDesc}>
              National-level examinations and recruitments conducted by Union government bodies
              and their agencies — UPSC, SSC, RRB, banking and more.
            </p>
            <span className={styles.directionLink}>Explore Central Government →</span>
          </Link>

          <Link to="/student/careers/government/state" className={styles.directionCard}>
            <h3 className={styles.directionName}>State Government</h3>
            <p className={styles.directionDesc}>
              Tamil Nadu state government examinations and recruitment boards — TNPSC and the
              state's recruitment organizations.
            </p>
            <span className={styles.directionLink}>Explore State Government →</span>
          </Link>
        </div>
      </section>

      <p className={styles.note}>
        Eligibility is always role-specific — the qualification, age limit, and selection stages
        shown on each page summarise that examination category. Always verify the current
        notification and official website before applying.
      </p>
    </div>
  )
}