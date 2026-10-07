import React from 'react'
import { Link } from 'react-router-dom'
import styles from './CareerDirectionSection.module.css'

/**
 * Graduate tab main content: two equal, large cards — Government Career and
 * Private Career. Rendered directly after the Graduate segmented tab is
 * selected (no accordion, no section heading, no badges).
 */
export default function CareerDirectionSection() {
  return (
    <div className={styles.wrap} aria-label="Career options">
      <div className={styles.grid}>
        {/* Government */}
        <Link to="/student/careers/government" className={styles.card} style={{ '--acc': 'var(--s-blue)' }}>
          <span className={styles.cardArt}>
            <img
              src="/career-direction/government-emblem.png"
              alt="Government of India emblem"
              loading="lazy"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            />
          </span>
          <span className={styles.cardTitle}>Government Career</span>
          <span className={styles.cardDesc}>
            Explore government jobs, competitive examinations, and public-sector opportunities.
          </span>
          <span className={styles.cardCta}>
            Explore Government Careers <span className={styles.arrow} aria-hidden="true">→</span>
          </span>
        </Link>

        {/* Private */}
        <Link to="/student/careers/private" className={styles.card} style={{ '--acc': 'var(--s-primary)' }}>
          <span className={styles.cardArt}>
            <img
              src="/career-direction/private-career.png"
              alt="Private sector careers illustration"
              loading="lazy"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            />
          </span>
          <span className={styles.cardTitle}>Private Career</span>
          <span className={styles.cardDesc}>
            Explore private-sector jobs, industries, and career opportunities across different sectors.
          </span>
          <span className={styles.cardCta}>
            Explore Private Careers <span className={styles.arrow} aria-hidden="true">→</span>
          </span>
        </Link>
      </div>
    </div>
  )
}