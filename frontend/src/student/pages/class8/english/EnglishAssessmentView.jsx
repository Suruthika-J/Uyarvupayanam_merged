import React, { useState, useEffect, useCallback } from 'react'
import { FiAward, FiCheck, FiTarget, FiX, FiChevronRight, FiRotateCcw, FiAlertCircle } from 'react-icons/fi'
import { englishMissionsApi } from '../../../services/englishMissionsApi'
import { EM, EmButton, EmChip, EmBar, EmOption, LoadingState } from './englishKit'

// AI-generated end-of-topic assessment:
//   1. start  -> backend generates/validates a stable question set (answer key
//                stays server-side; the questions sent here have no answers).
//   2. quiz   -> every question must be answered before Submit is enabled.
//   3. submit -> the backend grades against ITS stored set; the browser only
//                sends answers. Results + explanations arrive after grading.
//   4. results-> review, then Retake (new set, new attempt) or close.
export default function EnglishAssessmentView({ topic, onClose }) {
  const [stage, setStage] = useState('starting')   // starting | quiz | results
  const [assessment, setAssessment] = useState(null)
  const [answers, setAnswers] = useState({})
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const start = useCallback(async () => {
    setStage('starting')
    setError(null)
    setResults(null)
    try {
      const res = await englishMissionsApi.startAssessment(topic.id)
      setAssessment(res.assessment)
      setAnswers({})
      setStage('quiz')
    } catch (e) {
      setError(e)
      setStage('starting')
    }
  }, [topic.id])

  useEffect(() => { start() }, [start])

  const submit = async () => {
    if (!assessment) return
    setError(null)
    try {
      const res = await englishMissionsApi.submitAssessment(
        assessment.id,
        assessment.questions.map((q) => ({ questionId: q.id, answer: answers[q.id] }))
      )
      setResults(res)
      setStage('results')
    } catch (e) {
      setError(e)
    }
  }

  if (stage === 'starting') {
    return (
      <div style={{ background: EM.panel, border: `1px solid ${EM.line}`, borderRadius: 24, padding: '34px', textAlign: 'center' }} className="em-fade-in">
        {!error ? (
          <>
            <LoadingState text="The AI is preparing your question set…" />
            <p style={{ color: EM.muted, fontSize: 13.5, margin: '0 0 18px' }}>Generating a fresh set can take a minute or two. Please keep this tab open.</p>
            <EmButton kind="ghost" onClick={onClose}>Cancel and go back</EmButton>
          </>
        ) : (
          <>
            <FiAlertCircle size={30} color={EM.amber} style={{ margin: '0 auto 12px', display: 'block' }} />
            <h3 style={{ fontSize: 19, fontWeight: 900, color: EM.ink, margin: '0 0 6px' }}>Could not generate the assessment</h3>
            <p style={{ color: EM.muted, fontSize: 14, margin: '0 0 18px' }}>{error.message || 'Try again in a moment.'}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <EmButton onClick={start}>Try again</EmButton>
              <EmButton kind="ghost" onClick={onClose}>Go back</EmButton>
            </div>
          </>
        )}
      </div>
    )
  }

  if (stage === 'results' && results) {
    return <ResultsView results={results} topic={topic} onRetake={start} onClose={onClose} />
  }

  if (!assessment) return <LoadingState />

  const answeredCount = assessment.questions.filter((q) => answered(q, answers[q.id])).length

  return (
    <div style={{ background: EM.panel, border: `1px solid ${EM.line}`, borderRadius: 24, padding: '26px 26px 30px' }} className="em-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
        <FiTarget size={19} color={EM.amber} />
        <h3 style={{ fontSize: 20, fontWeight: 900, color: EM.ink, margin: 0 }}>{topic.name} — assessment</h3>
        <EmChip text={`Attempt ${assessment.attempt}`} tone="muted" />
      </div>
      <div style={{ color: EM.muted, fontSize: 13.5, marginBottom: 18 }}>
        Answer every question, then submit. The answer key stays hidden until you submit — you'll review each question with an explanation afterwards.
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <EmBar value={(answeredCount / assessment.questions.length) * 100} accent={EM.amber} height={9} style={{ flex: 1 }} />
        <span style={{ color: EM.muted, fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap' }}>{answeredCount}/{assessment.questions.length} answered</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {assessment.questions.map((q, qi) => (
          <QuizQuestion key={q.id} q={q} qi={qi} value={answers[q.id]} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} />
        ))}
      </div>

      {error && <div style={{ color: EM.rose, fontSize: 13.5, fontWeight: 700, marginTop: 16 }}>{error.message}</div>}

      <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <EmButton kind="ghost" onClick={onClose} icon={<FiX size={15} />}>Exit assessment</EmButton>
        <EmButton
          kind="green"
          disabled={answeredCount < assessment.questions.length}
          onClick={submit}
          icon={<FiCheck size={17} />}
        >
          Submit ({answeredCount}/{assessment.questions.length}) — answers stay hidden until then
        </EmButton>
      </div>
    </div>
  )
}

function answered(q, value) {
  if (q.type === 'fill-in-the-blank') return typeof value === 'string' && value.trim().length > 0
  return value !== undefined && value !== null && value !== ''
}

function QuizQuestion({ q, qi, value, onChange }) {
  return (
    <div style={{ border: `1px solid ${EM.line}`, borderRadius: 18, padding: '18px 20px', background: 'rgba(13,17,42,0.45)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
        <span style={{
          width: 26, height: 26, borderRadius: 99, flexShrink: 0, display: 'grid', placeItems: 'center',
          background: 'rgba(245,158,11,0.2)', color: EM.amber, fontSize: 12.5, fontWeight: 900,
        }}>
          {qi + 1}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: EM.ink, fontSize: 15, fontWeight: 700, lineHeight: 1.55 }}>{q.question}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <EmChip text={q.difficulty} tone={q.difficulty === 'hard' ? 'rose' : q.difficulty === 'medium' ? 'amber' : 'muted'} />
            <EmChip text={`${q.marks} mark${q.marks === 1 ? '' : 's'}`} tone="muted" />
          </div>
        </div>
      </div>

      {q.options && q.options.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {q.options.map((o, oi) => (
            <EmOption key={oi} option={o} index={oi} selected={value === o} onSelect={(v) => onChange(v)} />
          ))}
        </div>
      ) : (
        <input
          aria-label={`Answer for question ${qi + 1}`}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type the missing word(s)…"
          style={{
            width: '100%', boxSizing: 'border-box', outline: 'none', background: 'rgba(10,13,34,0.5)', color: EM.ink,
            border: `1.5px solid ${value ? EM.violet : EM.line}`, borderRadius: 14, padding: '12px 14px', fontSize: 15, fontFamily: 'inherit',
          }}
        />
      )}
    </div>
  )
}

function ResultsView({ results, topic, onRetake, onClose }) {
  return (
    <div style={{ background: EM.panel, border: `1px solid ${EM.line}`, borderRadius: 24, padding: '28px' }} className="em-pop">
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
        <ScoreRing percent={results.percent} />
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <FiAward size={20} color={EM.green} />
            <h3 style={{ fontSize: 21, fontWeight: 900, color: EM.ink, margin: 0 }}>Assessment submitted</h3>
            <EmChip text={`Attempt ${results.attempt}`} tone="muted" />
          </div>
          <p style={{ color: EM.muted, fontSize: 14.5, margin: '0 0 10px' }}>
            Score: <strong style={{ color: EM.ink }}>{results.score}</strong> / {results.totalMarks} marks · {results.percent}%
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <EmButton kind="ghost" onClick={onRetake} icon={<FiRotateCcw size={15} />}>Retake (new questions)</EmButton>
            <EmButton kind="sky" onClick={onClose} icon={<FiChevronRight size={15} />}>Back to topic</EmButton>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {results.results.map((r, i) => (
          <div key={r.questionId} style={{ borderRadius: 18, border: `1px solid ${r.correct ? 'rgba(52,211,153,0.4)' : 'rgba(251,113,133,0.4)'}`, background: r.correct ? 'rgba(52,211,153,0.07)' : 'rgba(251,113,133,0.07)', padding: '16px 18px' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 99, display: 'grid', placeItems: 'center', background: r.correct ? 'rgba(52,211,153,0.2)' : 'rgba(251,113,133,0.2)', color: r.correct ? EM.green : EM.rose, fontWeight: 900, fontSize: 12.5 }}>
                {r.correct ? <FiCheck size={14} /> : <FiX size={14} />}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: EM.ink, fontSize: 14.5, fontWeight: 700, lineHeight: 1.5, marginBottom: 6 }}>{i + 1}. {r.question}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, fontSize: 13.5, marginBottom: 6 }}>
                  <div style={{ color: EM.muted }}>Your answer: <strong style={{ color: r.correct ? EM.green : EM.rose }}>{displayAnswer(r.studentAnswer)}</strong></div>
                  {!r.correct && <div style={{ color: EM.muted }}>Correct answer: <strong style={{ color: EM.green }}>{displayAnswer(r.correctAnswer)}</strong></div>}
                  <div style={{ color: EM.muted }}>Marks: <strong style={{ color: EM.ink }}>{r.correct ? r.marks : 0}/{r.marks}</strong></div>
                </div>
                {r.explanation && <div style={{ color: EM.muted, fontSize: 13.5, lineHeight: 1.55 }}><strong style={{ color: EM.sky }}>Why: </strong>{r.explanation}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <EmButton kind="ghost" onClick={onRetake} icon={<FiRotateCcw size={15} />}>Retake with a fresh set</EmButton>
        <EmButton kind="green" onClick={onClose} icon={<FiChevronRight size={15} />}>Done — back to topic</EmButton>
      </div>
    </div>
  )
}

function displayAnswer(v) {
  if (Array.isArray(v)) return v.length ? v.join(' → ') : '—'
  if (typeof v === 'boolean') return v ? 'True' : 'False'
  if (v === undefined || v === null || v === '') return '—'
  return String(v)
}

function ScoreRing({ percent }) {
  const r = 46
  const c = 2 * Math.PI * r
  const filled = (Math.max(0, Math.min(100, percent)) / 100) * c
  const color = percent >= 60 ? EM.green : percent >= 40 ? EM.amber : EM.rose
  return (
    <div style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
      <svg width="130" height="130" viewBox="0 0 130 130" role="img" aria-label={`${percent} percent`}>
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="11" />
        <circle
          cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`} transform="rotate(-90 65 65)"
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 27, fontWeight: 900, color: color }}>{percent}%</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: EM.faint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>score</div>
        </div>
      </div>
    </div>
  )
}