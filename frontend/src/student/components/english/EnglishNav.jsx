import React from 'react'
import { Link } from 'react-router-dom'
import { ENGLISH_ACTIVITIES } from '../../data/english/englishRewards'
import EngArt from './art'
import { ACTIVITY_ART } from './artIcons'
import './english.css'

// Sub-navigation shown at the top of every English activity: quick chips to
// hop between activities, plus a "hub" home chip. `current` is an activity id
// (writing, speaking, grammar, vocabulary, sentence-builder, listen-speak,
// daily-challenge, progress) or 'hub'.

const PATH_BY_ID = {
  ...Object.fromEntries(ENGLISH_ACTIVITIES.map((a) => [a.id, `/student/class5/english/${a.id === 'grammar' ? 'basics' : a.path.split('/').pop()}`])),
}

export default function EnglishNav({ current = 'hub', accent = '#0f4c75' }) {
  return (
    <nav className="eng-nav" aria-label="English Adventure activities" style={{ '--eng-accent': accent }}>
      <Link className={`eng-nav-link${current === 'hub' ? ' active' : ''}`} to="/student/class5/english">
        <span className="eng-nav-emoji" aria-hidden="true"><EngArt k="home" size={16} /></span> Adventure Home
      </Link>
      {ENGLISH_ACTIVITIES.map((a) => {
        const activeId = a.id === 'grammar' ? 'grammar' : a.id
        const isActive = current === activeId
        return (
          <Link
            key={a.id}
            className={`eng-nav-link${isActive ? ' active' : ''}`}
            to={PATH_BY_ID[a.id]}
            style={isActive ? { '--eng-accent': a.color } : undefined}
          >
            <span className="eng-nav-emoji" aria-hidden="true"><EngArt k={ACTIVITY_ART[a.id] || 'star'} size={16} /></span>
            {a.title}
          </Link>
        )
      })}
    </nav>
  )
}