import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import styles from './SchoolJourneyCards.module.css'

// Character images are dropped into frontend/public/class-journey/ as
// class5.png, class8.png, class10.png, class12.png. Until they exist, each
// card shows its class-number medallion fallback automatically.
const STAGES = [
  {
    label: 'Class 5',
    title: 'Curiosity & Basic Skills',
    desc: 'Gamified logic, drawing, song maker & communication passport.',
    link: '/student/class5',
    art: '/class-journey/class5.png?v=6',
    alt: 'Child reading a book, representing the Class 5 curiosity stage',
  },
  {
    label: 'Class 8',
    title: 'Subject-to-Stream Pre-Selection',
    desc: 'Connecting school subjects to future professions & talent exams.',
    link: '/student/class8',
    art: '/class-journey/class8.png?v=6',
    alt: 'Older child exploring subjects, representing the Class 8 pre-selection stage',
  },
  {
    label: 'Class 10',
    title: 'Stream & Diploma Decision',
    desc: 'Math/Bio vs Commerce vs 3-Year Polytechnic Diploma choice.',
    link: '/student/class10',
    art: '/class-journey/class10.png?v=6',
    alt: 'Teenager choosing between streams, representing the Class 10 decision stage',
  },
  {
    label: 'Class 12',
    title: 'Higher Ed & TNEA Cutoffs',
    desc: 'TNEA Engineering cutoff analyzer, entrance exams & degree finder.',
    link: '/student/class12',
    art: '/class-journey/class12.png?v=6',
    alt: 'Graduating student planning higher education, representing the Class 12 stage',
  },
]

// Shows the character image once loaded; otherwise renders the medallion so
// the layout is stable. NOTE: must NOT use loading="lazy" here — a lazy image
// inside a display:none box is never fetched, which deadlocks onLoad.
function StageArt({ art, alt, fallbackDigit }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className={styles.art}>
      <img
        src={art}
        alt={alt}
        className={styles.artImg}
        style={{ display: loaded ? 'block' : 'none' }}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(false)}
      />
      {!loaded && (
        <div className={styles.artFallback} role="img" aria-label={alt}>
          {fallbackDigit}
        </div>
      )}
    </div>
  )
}

export default function SchoolJourneyCards() {
  return (
    <div className={styles.stage}>
      {/* One continuous journey — dashed route behind the cards (desktop) */}
      <div className={styles.connector} aria-hidden="true" />
      <div className={styles.grid}>
        {STAGES.map((s) => (
          <Link key={s.label} to={s.link} className={styles.card} aria-label={`Explore ${s.label} guidance`}>
            <StageArt art={s.art} alt={s.alt} fallbackDigit={s.label.replace('Class ', '')} />
            <span className={styles.label}>{s.label}</span>
            <h4 className={styles.title}>{s.title}</h4>
            <p className={styles.desc}>{s.desc}</p>
            <span className={styles.btn}>
              Explore {s.label} <FiArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}