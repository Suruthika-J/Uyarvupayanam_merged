import React from 'react'
import { Link } from 'react-router-dom'
import { PRIVATE_SECTORS } from '../../../data/privateCareers'
import styles from './PrivateCareerPage.module.css'

function DegreeList({ degrees }) {
  return (
    <ul className={styles.degreeList}>
      {degrees.map((d) => (
        <li key={d.role} className={styles.degreeItem}>
          <span className={styles.degreeRole}>{d.role}</span>
          <span className={styles.degreeText}>{d.degrees.join(' · ')}</span>
        </li>
      ))}
    </ul>
  )
}

function SectorCard({ sector }) {
  return (
    <article className={styles.sectorCard}>
      <div className={styles.sectorHead}>
        <h3 className={styles.sectorName}>{sector.name}</h3>
        <p className={styles.sectorSummary}>{sector.summary}</p>
      </div>

      <div className={styles.block}>
        <span className={styles.blockLabel}>Job Roles</span>
        <div className={styles.chips}>
          {sector.roles.map((r) => <span key={r} className={styles.chip}>{r}</span>)}
        </div>
      </div>

      <div className={styles.block}>
        <span className={styles.blockLabel}>Suitable Degrees (role-specific)</span>
        <DegreeList degrees={sector.degrees} />
      </div>

      <div className={styles.block}>
        <span className={styles.blockLabel}>Required Skills</span>
        <div className={styles.chips}>
          {sector.skills.map((s) => <span key={s} className={styles.chip}>{s}</span>)}
        </div>
      </div>

      <div className={styles.twoCol}>
        <div className={styles.block}>
          <span className={styles.blockLabel}>Entry-Level Opportunities</span>
          <ul className={styles.textList}>
            {sector.entryLevel.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>
        <div className={styles.block}>
          <span className={styles.blockLabel}>How to Enter the Sector</span>
          <ul className={styles.textList}>
            {sector.howToEnter.map((h) => <li key={h}>{h}</li>)}
          </ul>
        </div>
      </div>

      <div className={styles.twoCol}>
        <div className={styles.block}>
          <span className={styles.blockLabel}>Internship Opportunities</span>
          <ul className={styles.textList}>
            {sector.internships.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </div>
        <div className={styles.block}>
          <span className={styles.blockLabel}>Career Growth Path</span>
          <p className={styles.growth}>{sector.growth}</p>
        </div>
      </div>

      <div className={styles.block}>
        <span className={styles.blockLabel}>Relevant Companies / Jobs</span>
        <div className={styles.chips}>
          {sector.companies.map((c) => <span key={c} className={styles.chipCompany}>{c}</span>)}
        </div>
      </div>
    </article>
  )
}

export default function PrivateCareerPage() {
  return (
    <div className="student-root">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Private Career</span>
          <h1 className={styles.heroTitle}>Explore Private Careers</h1>
          <p className={styles.heroDesc}>
            Private-sector jobs, industries, career roles, and opportunities across fifteen
            sectors — with role-specific degree and skill guidance.
          </p>
          <nav className={styles.crumb} aria-label="Breadcrumb">
            <Link to="/explore#choose-journey">Career Explorer</Link>
            <span aria-hidden="true">→</span>
            <span aria-current="page">Private Careers</span>
          </nav>
        </div>
      </section>

      {/* ── Sectors ──────────────────────────────────────────── */}
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Private Sector Industries</h2>
          <p className={styles.sectionDesc}>
            Fifteen sectors covering the major private-industry career areas. Suitable
            degrees are listed role-by-role — a degree is never treated as valid for every
            role in a sector.
          </p>
        </header>
        <div className={styles.list}>
          {PRIVATE_SECTORS.map((sector) => <SectorCard key={sector.id} sector={sector} />)}
        </div>
      </section>

      <p className={styles.note}>
        Degree eligibility within each sector depends on the specific role, the company,
        and current hiring standards. Skills, certifications, and practical work (projects,
        internships) matter alongside the degree — treat this catalogue as a starting point
        and verify current requirements with employers.
      </p>
    </div>
  )
}