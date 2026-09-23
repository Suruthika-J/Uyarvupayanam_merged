import React, { useState } from 'react'
import { C5, worldColor, worldIcon, ICONS } from './class5Theme'
import { SBadge, SAlert } from '../../ui'
import StrengthRadar from './StrengthRadar'
import { getQuizQuestions, submitQuiz, scoreQuizLocally } from '../../../services/class5DiscoveryService'

// Playable career-sort quiz: start → 10 questions → result world + radar.
export default function SortingQuiz({ initialProfile, onCompleted }) {
  const [stage, setStage] = useState(initialProfile?.lastWorld ? 'result' : 'intro')
  const [questions, setQuestions] = useState(null)
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState([])
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(initialProfile?.lastWorld ? {
    world: { ...initialProfile.lastWorld, description: 'Your starting career world from the sorting quiz.' },
    radar: initialProfile.skills,
  } : null)

  const start = async () => {
    setBusy(true)
    const qs = await getQuizQuestions()
    setQuestions(qs)
    setIdx(0)
    setAnswers([])
    setStage('quiz')
    setBusy(false)
  }

  const choose = async (q, opt) => {
    const next = [...answers, { questionId: q.id, answerIndex: opt.index }]
    setAnswers(next)
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
    } else {
      setBusy(true)
      const res = await submitQuiz(next)
      // Prefer local scoring so the reveal is instant even when offline.
      const local = scoreQuizLocally(next, questions)
      setResult({ world: res?.resultWorld || res?.topWorld || local.topWorld, radar: res?.radar || local.radar })
      setBusy(false)
      setStage('result')
      onCompleted?.(res || { resultWorld: local.topWorld, topWorld: local.topWorld, radar: local.radar })
    }
  }

  if (stage === 'intro') {
    return (
      <div style={{ textAlign: 'center', padding: '40px 24px', maxWidth: 520, margin: '0 auto' }}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 28,
            background: 'linear-gradient(135deg,#e6f0f7,#dbeafe)',
            display: 'grid',
            placeItems: 'center',
            color: C5.navy,
            margin: '0 auto',
          }}
          aria-hidden="true"
        >
          <ICONS.compass size={44} strokeWidth={2} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: C5.ink, margin: '16px 0 8px', letterSpacing: '-0.01em' }}>
          Pick your starting world
        </h2>
        <p style={{ color: C5.muted, fontSize: 14.5, lineHeight: 1.65, maxWidth: 420, margin: '0 auto 6px' }}>
          Answer 10 fun questions. You'll reveal a career world that matches how you naturally think — it grows as you learn.
        </p>
        <p style={{ color: C5.faint, fontSize: 12.5 }}>No right answers. Only your story.</p>
        <button
          onClick={start}
          disabled={busy}
          style={{
            marginTop: 22,
            background: C5.navy,
            color: '#fff',
            border: 'none',
            borderRadius: 99,
            padding: '13px 32px',
            fontSize: 15,
            fontWeight: 800,
            fontFamily: 'var(--s-font-display)',
            cursor: busy ? 'not-allowed' : 'pointer',
            boxShadow: '0 10px 20px -8px rgba(15,76,117,0.6)',
          }}
        >
          {busy ? 'Loading…' : 'Start my sort quiz →'}
        </button>
      </div>
    )
  }

  if (stage === 'quiz' && questions) {
    const q = questions[idx]
    const pct = (idx / questions.length) * 100
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: C5.faint }}>Question {idx + 1} of {questions.length}</span>
          <div style={{ flex: 1, height: 6, borderRadius: 99, background: '#eef3f8', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: C5.navy, borderRadius: 99, transition: 'width 0.4s ease' }} />
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '12px 8px 20px' }}>
          <span
            style={{
              display: 'inline-grid',
              placeItems: 'center',
              width: 46,
              height: 46,
              borderRadius: 16,
              background: C5.navy,
              color: '#fff',
              fontSize: 15,
              fontWeight: 900,
              fontFamily: 'var(--s-font-display)',
            }}
            aria-hidden="true"
          >
            {idx + 1}
          </span>
          <h3 style={{ fontSize: 22, fontWeight: 900, color: C5.ink, lineHeight: 1.3, margin: '12px 0 22px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            {q.text}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 440, margin: '0 auto' }}>
            {q.options.map((opt) => (
              <button
                key={opt.index}
                onClick={() => choose(q, opt)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: '#fff',
                  border: `1.5px solid ${C5.line}`,
                  borderRadius: 18,
                  padding: '13px 18px',
                  fontSize: 14.5,
                  fontWeight: 700,
                  color: C5.ink,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--s-font-body)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C5.navy; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C5.line; e.currentTarget.style.transform = 'none' }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 10,
                    background: '#eef3f8',
                    color: C5.muted,
                    fontSize: 12.5,
                    fontWeight: 800,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  {opt.index + 1}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (stage === 'result' && result) {
    const w = result.world || {}
    const resultIcon = React.createElement(worldIcon(w.key || 'ocean-explorer'), { size: 42, strokeWidth: 2 })
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <SBadge color="blue" dot>Your starting world</SBadge>
          <div style={{ margin: '14px auto 6px', width: 92, height: 92, borderRadius: 30, overflow: 'hidden', background: `linear-gradient(135deg, ${worldColor(w.colorTag || 'navy')} 0%, ${C5.navy} 150%)`, display: 'grid', placeItems: 'center', color: '#fff' }} aria-hidden="true">
            {w.image ? (
              <span style={{ width: '100%', height: '100%', backgroundImage: `url(${w.image})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'block' }} />
            ) : (
              resultIcon
            )}
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 900, color: worldColor(w.colorTag || 'navy'), margin: 0, letterSpacing: '-0.02em' }}>
            {w.name}
          </h2>
          <p style={{ fontSize: 14.5, color: C5.muted, maxWidth: 460, margin: '10px auto 0', lineHeight: 1.65 }}>
            {w.tagline}. {w.description}
          </p>
        </div>

        <div
          style={{
            background: C5.bg,
            borderRadius: C5.radiusLg,
            border: `1px solid ${C5.line}`,
            boxShadow: C5.shadow,
            padding: 22,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: C5.ink }}>Your strength radar</div>
            <div style={{ fontSize: 12, color: C5.faint, fontWeight: 700 }}>Grows with every quest</div>
          </div>
          <StrengthRadar skills={result.radar} height={280} />
        </div>

        <div style={{ textAlign: 'center', marginTop: 22 }}>
          <SAlert type="info">
            Every quest, game and 5-minute challenge you finish nudges this radar up. Try one next!
          </SAlert>
          <button
            onClick={start}
            style={{
              marginTop: 16,
              background: '#fff',
              color: C5.navy,
              border: `1.5px solid ${C5.navy}`,
              borderRadius: 99,
              padding: '11px 26px',
              fontSize: 14,
              fontWeight: 800,
              fontFamily: 'var(--s-font-display)',
              cursor: 'pointer',
            }}
          >
            Retake the quiz
          </button>
        </div>
      </div>
    )
  }

  return null
}