import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EnglishNav from './EnglishNav'
import EnglishBuddy from './EnglishBuddy'
import EngArt from './art'
import { TOPIC_ART, CATEGORY_ART, BADGE_ART, LEVEL_ART, SCENE_EMOJI_ART } from './artIcons'
import { GRAMMAR_TOPICS } from '../../data/english/englishGrammar'
import { getEnglishProgress } from '../../services/englishService'
import { useStudentAuth } from '../../context/StudentAuthContext'
import './english.css'

// English Basics — the grammar hub with 20 topic worlds.
// Guests can browse freely; playing sends them to Sign In and brings them back.

// eslint-disable-next-line no-misleading-character-class -- intentional: strips emoji + variation selectors
const noEmoji = (s = '') => s.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{2190}-\u{21FF}]/gu, '').replace(/\s+/g, ' ').trim()

export default function EnglishBasics() {
  const navigate = useNavigate()
  const { isAuthenticated } = useStudentAuth()

  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const state = await getEnglishProgress()
      if (cancelled) return
      setProgress(state)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  // topicId → solved count for the little star chips
  const solvedMap = {}
  ;(progress?.grammarTopics || []).forEach((t) => {
    solvedMap[t.topicId] = t.solved || 0
  })

  // Group topics by their unit, keeping the author's order
  const units = []
  const topicsByUnit = {}
  GRAMMAR_TOPICS.forEach((t) => {
    if (!topicsByUnit[t.unit]) {
      topicsByUnit[t.unit] = []
      units.push(t.unit)
    }
    topicsByUnit[t.unit].push(t)
  })

  function openTopic(topicId) {
    const path = '/student/class5/english/basics/' + topicId
    if (!isAuthenticated) {
      navigate('/student/signin', { state: { from: { pathname: path } } })
      return
    }
    navigate(path)
  }

  return (
    <div className="eng-root">
      <EnglishNav current="grammar" />

      <header className="eng-hero">
        <span className="eng-eyebrow">Class 5 · English Basics</span>
        <h1 className="eng-h1">English Basics</h1>
        <p className="eng-lede">
          Learn the little rules that make English easy — 20 worlds, each with 40 questions.
        </p>
        {!isAuthenticated && (
          <p className="eng-guest-note">Browse the lessons freely — sign in to play and earn stars.</p>
        )}
      </header>

      {loading ? (
        <div className="eng-skeleton" role="status" aria-label="Loading English Basics" />
      ) : (
        <>
          {units.map((unit) => (
            <section key={unit}>
              <h2 className="eng-unit-head">{noEmoji(unit)}</h2>
              <div className="eng-topic-grid">
                {topicsByUnit[unit].map((t) => {
                  const solved = solvedMap[t.id] || 0
                  return (
                    <button key={t.id} type="button" className="eng-topic-card" onClick={() => openTopic(t.id)}>
                      <span className="eng-topic-emoji"><EngArt k={TOPIC_ART[t.id] || 'book'} size={28} /></span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <div className="eng-topic-name">{noEmoji(t.name)}</div>
                        <p className="eng-topic-rule">{noEmoji(t.rule)}</p>
                        {solved > 0 ? (
                          <span className="eng-topic-progress"><EngArt k="star" size={16} /> {solved} solved</span>
                        ) : (
                          <span className="eng-chip">New</span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}

          <div style={{ marginTop: 28 }}>
            <EnglishBuddy
              state="happy"
              center
              size="md"
              message="Pick the topic that makes you curious — I will cheer you on through every little question!"
            />
          </div>
        </>
      )}
    </div>
  )
}