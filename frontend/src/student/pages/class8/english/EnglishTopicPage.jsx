import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  FiArrowLeft, FiChevronLeft, FiChevronRight, FiCheckCircle, FiTarget,
  FiBookOpen, FiAward, FiFeather, FiHelpCircle, FiCheck, FiX, FiArrowUp, FiArrowDown,
} from 'react-icons/fi'
import { englishMissionsApi } from '../../../services/englishMissionsApi'
import SpaceScene from '../../../components/class8/SpaceScene'
import Planet from '../../../components/class8/Planet'
import { EM, EmButton, EmChip, EmBar, EmOption, ListenControl, LoadingState, ErrorState, LockedState } from './englishKit'
import EnglishAssessmentView from './EnglishAssessmentView'
import './englishMissions.css'

// Deterministic shuffle (stable per activityId) so the right-column order in
// match-pairs doesn't jump between renders.
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function shuffleStable(list, salt) {
  const seed = [...String(salt)].reduce((n, c) => n + c.charCodeAt(0) * 31, 3)
  const rnd = mulberry32(seed)
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const AUDIO_AREAS = new Set(['listening', 'speaking'])
const AREA_LABELS = {
  grammar: 'Grammar Galaxy', reading: 'Reading Nebula', vocabulary: 'Vocabulary Planet',
  writing: 'Writing Station', listening: 'Listening Observatory', speaking: 'Speaking Mission',
}

export default function EnglishTopicPage() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lessonStep, setLessonStep] = useState(null)   // null = overview, 0..N = lesson steps
  const [quizOpen, setQuizOpen] = useState(false)      // assessment view embedded
  const [allDone, setAllDone] = useState(false)
  const [bump, setBump] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await englishMissionsApi.getTopic(topicId)
      setData(res)
      setAllDone(res.progress.allActivitiesDone)
      setLessonStep(null)
      setQuizOpen(false)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [topicId])

  useEffect(() => { load() }, [load, bump])

  const onActivityComplete = (updatedAllDone) => {
    if (updatedAllDone) setAllDone(true)
  }

  const onAssessmentFinished = () => {
    setQuizOpen(false)
    setBump((b) => b + 1) // refetch so badges/progress reflect completion
  }

  if (loading && !data) return <SpaceScene><LoadingState /></SpaceScene>
  if (error) {
    return (
      <SpaceScene>
        <ErrorState error={error} onRetry={load} onBack={() => navigate('/student/class8/english')} />
      </SpaceScene>
    )
  }

  const { topic, progress, assessment, nextTopic } = data
  const areaLabel = AREA_LABELS[topic.areaId] || 'English'
  const steps = [topic.lesson.intro, ...topic.lesson.sections, null] // null = recap step
  const recapStep = steps.length - 1

  return (
    <SpaceScene stars={85} salt={topic.order * 7}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '30px 22px 100px' }} className="em-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
          <Link
            to={`/student/class8/english/area/${topic.areaId}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: EM.muted, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
          >
            <FiArrowLeft size={15} /> {areaLabel}
          </Link>
          <EmChip text={`Topic ${topic.order}`} tone="muted" />
        </div>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap', marginBottom: 26 }}>
          <Planet kind={topic.world} accent={topic.accent} size={86} glow />
          <div style={{ flex: 1, minWidth: 250 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 6px', color: EM.ink, letterSpacing: '-0.02em' }}>{topic.name}</h1>
            <p style={{ color: EM.muted, fontSize: 14.5, lineHeight: 1.55, margin: 0 }}>{topic.tagline}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexDirection: 'column', alignItems: 'flex-end' }}>
            {progress.assessmentCompleted ? (
              <EmChip text={`Completed · best ${progress.bestPercent}%`} tone="green" />
            ) : allDone ? (
              <EmChip text="Activities complete · assessment unlocked" tone="amber" />
            ) : (
              <EmChip text="Activities in progress" tone="violet" />
            )}
            {progress.locked && <EmChip text="Previous topic required" tone="rose" />}
          </div>
        </div>

        {/* ── Sequence banner ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: EM.panel2, border: `1px solid ${EM.line}`, borderRadius: 18, padding: '14px 18px', marginBottom: 28, flexWrap: 'wrap' }}>
          <FiTarget size={18} color={EM.sky} />
          <span style={{ color: EM.muted, fontSize: 13.5, fontWeight: 700 }}>Topic achieved when</span>
          <EmChip text={`${progress.completedActivities.length}/${topic.activities.length} activities done`} tone={allDone ? 'green' : 'muted'} />
          <FiChevronRight size={15} color={EM.faint} />
          <EmChip text={allDone ? 'Assessment unlocked' : 'AI assessment (6 questions)'} tone={allDone ? 'green' : 'muted'} />
          <div style={{ flex: 1, minWidth: 120 }}>
            <EmBar value={(progress.completedActivities.length / topic.activities.length) * 100} accent={topic.accent} height={8} />
          </div>
        </div>

        {progress.locked && (
          <div style={{ marginBottom: 24 }}>
            <LockedState
              message={`Finish the previous topic in ${areaLabel} to unlock the activities and assessment here. You can still read the lesson below.`}
              onBack={() => navigate(`/student/class8/english/area/${topic.areaId}`)}
              label="Back to this area's map"
            />
          </div>
        )}

        {/* ── Lesson ── */}
        <LessonSection
          topic={topic}
          steps={steps}
          step={lessonStep}
          setStep={setLessonStep}
          recapStep={recapStep}
          disabled={false}
        />

        {/* ── Writing practice ── */}
        {topic.practice && !progress.locked && (
          <PracticeCard topic={topic} />
        )}

        {/* ── Activities ── */}
        <section aria-labelledby="em-activities" style={{ marginTop: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <FiBookOpen size={19} color={topic.accent} />
            <h2 id="em-activities" style={{ fontSize: 21, fontWeight: 900, color: EM.ink, margin: 0 }}>Activities</h2>
            <EmChip text={`${progress.completedActivities.length}/${topic.activities.length} completed`} tone={allDone ? 'green' : 'violet'} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {topic.activities.map((a, i) => (
              <ActivityCard
                key={a.activityId}
                activity={a}
                topicId={topic.id}
                areaId={topic.areaId}
                accent={topic.accent}
                initiallyDone={progress.completedActivities.includes(a.activityId)}
                locked={progress.locked}
                onComplete={onActivityComplete}
                recap={topic.recap}
              />
            ))}
          </div>
        </section>

        {/* ── Assessment ── */}
        <section aria-labelledby="em-assessment" style={{ marginTop: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <FiAward size={19} color={EM.amber} />
            <h2 id="em-assessment" style={{ fontSize: 21, fontWeight: 900, color: EM.ink, margin: 0 }}>Assessment</h2>
            <EmChip text={`${assessment.count} questions · ${assessment.difficulty}`} tone="amber" />
          </div>

          {quizOpen ? (
            <EnglishAssessmentView
              topic={topic}
              onClose={onAssessmentFinished}
            />
          ) : (
            <AssessmentPanel
              progress={progress}
              allDone={allDone}
              assessment={assessment}
              totalActivities={topic.activities.length}
              onStart={() => setQuizOpen(true)}
              onRetake={() => setQuizOpen(true)}
              nextTopic={nextTopic}
              areaId={topic.areaId}
            />
          )}
        </section>
      </div>
    </SpaceScene>
  )
}

// ── Lesson stepper: intro → sections → recap ───────────────────────────────
function LessonSection({ topic, steps, step, setStep, recapStep }) {
  const [open, setOpen] = useState(true)
  if (!open) {
    return (
      <section style={{ marginBottom: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiBookOpen size={19} color={topic.accent} />
            <h2 style={{ fontSize: 21, fontWeight: 900, color: EM.ink, margin: 0 }}>Lesson</h2>
          </div>
          <EmButton kind="ghost" onClick={() => setOpen(true)} icon={<FiChevronRight size={16} />}>Show lesson</EmButton>
        </div>
      </section>
    )
  }

  if (step === null) {
    return (
      <section style={{ marginBottom: 30 }}>
        <div style={{ background: EM.panel, border: `1px solid ${EM.line}`, borderRadius: 24, padding: '26px 26px 22px', backdropFilter: 'blur(8px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <FiBookOpen size={19} color={topic.accent} />
            <h2 style={{ fontSize: 21, fontWeight: 900, color: EM.ink, margin: 0 }}>Lesson</h2>
          </div>
          <p style={{ color: EM.muted, fontSize: 15, lineHeight: 1.65, margin: '0 0 18px' }}>{topic.lesson.intro}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
            {topic.objectives.map((o) => (
              <EmChip key={o} text={o} tone="violet" style={{ fontSize: 12, padding: '6px 12px' }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <EmButton kind="sky" onClick={() => setStep(0)} icon={<FiChevronRight size={17} />}>
              Start lesson ({topic.lesson.sections.length} sections + recap)
            </EmButton>
          </div>
        </div>
      </section>
    )
  }

  const isRecap = step === recapStep
  const section = isRecap ? null : (step === 0 ? null : topic.lesson.sections[step - 1])
  const timeline = !isRecap && step > 0 && topic.lesson.sections[step - 1].timeline
  const audioSection = !isRecap && step === 1 && AUDIO_AREAS.has(topic.areaId)

  return (
    <section style={{ marginBottom: 30 }} className="em-pop" key={step}>
      <div style={{ background: EM.panel, border: `1px solid ${EM.line}`, borderRadius: 24, padding: '26px', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <EmChip text={isRecap ? 'Recap' : step === 0 ? 'Getting started' : `Section ${step} of ${topic.lesson.sections.length}`} tone="violet" />
          <span style={{ fontSize: 13, fontWeight: 800, color: EM.faint }}>Step {step + 1} / {steps.length}</span>
        </div>

        {isRecap ? (
          <>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: EM.ink, margin: '0 0 14px' }}>Key points to remember</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topic.recap.map((r) => (
                <li key={r} style={{ display: 'flex', gap: 10, color: EM.ink, fontSize: 15, lineHeight: 1.55, background: 'rgba(139,92,246,0.1)', border: `1px solid rgba(139,92,246,0.28)`, borderRadius: 14, padding: '12px 16px' }}>
                  <FiCheckCircle size={17} color={EM.green} style={{ flexShrink: 0, marginTop: 3 }} />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </>
        ) : step === 0 ? (
          <>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: EM.ink, margin: '0 0 10px' }}>Getting started</h3>
            <p style={{ color: EM.muted, fontSize: 15, lineHeight: 1.68, margin: 0 }}>{topic.lesson.intro}</p>
          </>
        ) : (
          <>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: EM.ink, margin: '0 0 8px' }}>{section.heading}</h3>
            {audioSection && <ListenControl text={section.body} label="Listen to the passage" accent={topic.accent} />}
            {section.body && <p style={{ color: EM.ink, fontSize: 15, lineHeight: 1.7, margin: '12px 0' }}>{section.body}</p>}
            {section.points && section.points.length > 0 && (
              <ul style={{ margin: '6px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {section.points.map((p) => (
                  <li key={p} style={{ display: 'flex', gap: 9, color: EM.muted, fontSize: 14.5, lineHeight: 1.55 }}>
                    <span style={{ color: topic.accent, fontWeight: 900 }}>•</span>
                    {p}
                  </li>
                ))}
              </ul>
            )}
            {section.examples && section.examples.length > 0 && (
              <div style={{ marginTop: 12, borderRadius: 14, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', padding: '12px 16px' }}>
                <div style={{ color: EM.sky, fontWeight: 900, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Examples</div>
                {section.examples.map((e) => (
                  <div key={e} style={{ color: EM.ink, fontSize: 14.5, lineHeight: 1.6, padding: '4px 0' }}>{e}</div>
                ))}
              </div>
            )}
            {timeline && (
              <div className="em-timeline" role="img" aria-label="Timeline of the tenses in this lesson">
                {timeline.map((t) => (
                  <div key={t.label} className="em-timeline-item">
                    <div className="em-timeline-dot" style={{ ['--dot']: t.color || EM.violet }} />
                    <div style={{ fontSize: 12.5, fontWeight: 900, color: EM.ink }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: EM.muted, lineHeight: 1.45 }}>{t.note}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22 }}>
          <EmButton kind="ghost" disabled={step === 0} onClick={() => setStep(step - 1)} icon={<FiChevronLeft size={16} />}>Back</EmButton>
          {step < steps.length - 1 ? (
            <EmButton kind="sky" onClick={() => setStep(step + 1)} icon={<FiChevronRight size={16} />}>Next</EmButton>
          ) : (
            <EmButton kind="green" onClick={() => setStep(null)} icon={<FiCheck size={16} />}>Finish lesson</EmButton>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Writing practice card ──────────────────────────────────────────────────
function PracticeCard({ topic }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState(null)

  const ask = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await englishMissionsApi.writingFeedback(topic.id, text)
      setFeedback(res.feedback)
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section style={{ marginTop: 30 }} aria-label="Writing practice">
      <div style={{ background: EM.panel, border: `1px solid ${EM.line}`, borderRadius: 24, padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <FiFeather size={19} color={topic.accent} />
          <h2 style={{ fontSize: 20, fontWeight: 900, color: EM.ink, margin: 0 }}>Writing practice</h2>
          <EmChip text="Try it now" tone="violet" />
        </div>
        <p style={{ color: EM.ink, fontSize: 15.5, lineHeight: 1.65, margin: '0 0 14px', fontWeight: 700 }}>{topic.practice.prompt}</p>
        <div style={{ marginBottom: 14 }}>
          <div style={{ color: EM.faint, fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Checklist the reader will use</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {topic.practice.rubric.map((r) => (
              <EmChip key={r} text={r} tone="muted" style={{ fontSize: 12 }} />
            ))}
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          aria-label="Your draft"
          placeholder={topic.practice.placeholder || 'Write your draft here…'}
          style={{
            width: '100%', boxSizing: 'border-box', resize: 'vertical', outline: 'none',
            background: 'rgba(10,13,34,0.5)', color: EM.ink, border: `1.5px solid ${EM.line}`,
            borderRadius: 16, padding: '14px 16px', fontSize: 15, lineHeight: 1.6, fontFamily: 'inherit',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, flexWrap: 'wrap' }}>
          <EmButton kind="primary" onClick={ask} disabled={text.trim().length < 20} loading={busy} icon={<FiHelpCircle size={16} />}>
            Ask AI for guidance
          </EmButton>
          <span style={{ color: EM.faint, fontSize: 12.5 }}>AI guidance reviews your draft against the checklist — it is advice, not a grade.</span>
        </div>
        {error && <div style={{ color: EM.rose, fontSize: 13.5, fontWeight: 700, marginTop: 12 }}>{error.message}</div>}
        {feedback && (
          <div className="em-pop" style={{ marginTop: 18, borderRadius: 18, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.35)', padding: '18px 20px' }}>
            <div style={{ color: EM.green, fontWeight: 900, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>AI guidance on your draft</div>
            {feedback.strengths.length > 0 && (
              <>
                <div style={{ color: EM.muted, fontWeight: 800, fontSize: 13, marginBottom: 6 }}>What works</div>
                <ul style={{ margin: '0 0 10px', paddingLeft: 20, color: EM.ink, fontSize: 14, lineHeight: 1.55 }}>
                  {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </>
            )}
            {feedback.improvements.length > 0 && (
              <>
                <div style={{ color: EM.muted, fontWeight: 800, fontSize: 13, marginBottom: 6 }}>Try next</div>
                <ul style={{ margin: '0 0 10px', paddingLeft: 20, color: EM.ink, fontSize: 14, lineHeight: 1.55 }}>
                  {feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </>
            )}
            {feedback.overall && <div style={{ color: EM.sky, fontWeight: 800, fontSize: 14 }}>{feedback.overall}</div>}
          </div>
        )}
      </div>
    </section>
  )
}

// ── One interactive activity ───────────────────────────────────────────────
function ActivityCard({ activity, topicId, areaId, accent, initiallyDone, locked, onComplete, recap }) {
  const [answers, setAnswers] = useState(() => blankAnswers(activity))
  const [feedback, setFeedback] = useState(null)   // per-item results after check
  const [checked, setChecked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [hint, setHint] = useState(false)
  const [done, setDone] = useState(initiallyDone)

  const submit = async () => {
    if (busy) return
    setBusy(true)
    setErr(null)
    try {
      const res = await englishMissionsApi.answerActivity(topicId, activity.activityId, answers)
      setFeedback(res.results)
      setChecked(true)
      if (res.correct) {
        setDone(true)
        onComplete(res.allActivitiesDone)
      }
    } catch (e) {
      setErr(e)
    } finally {
      setBusy(false)
    }
  }

  const canCheck = answers.every((a) => a !== null && a !== undefined && a !== '' && !(Array.isArray(a) && a.length === 0))

  return (
    <article
      className="em-fade-in"
      style={{
        background: EM.panel, border: `1px solid ${EM.line}`, borderRadius: 24,
        padding: '22px 24px', opacity: locked ? 0.6 : 1, backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
        <h3 style={{ fontSize: 17.5, fontWeight: 900, color: EM.ink, margin: 0, flex: 1 }}>{activity.title}</h3>
        {done && <EmChip text="Completed" tone="green" />}
        {activity.type === 'fill-blank' && <EmChip text="Type your answer" tone="violet" />}
        {activity.type === 'sentence-order' && <EmChip text="Arrange the lines" tone="amber" />}
      </div>
      <p style={{ color: EM.muted, fontSize: 13.5, margin: '0 0 16px' }}>{activity.instruction}</p>

      {locked ? (
        <p style={{ color: EM.rose, fontSize: 13.5, fontWeight: 700, margin: 0 }}>Complete the previous topic to unlock this activity.</p>
      ) : (
        <>
          <ActivityBody
            activity={activity}
            answers={answers}
            setAnswers={setAnswers}
            feedback={checked ? feedback : null}
            accent={accent}
            disabled={done && checked && feedback && feedback.every((f) => f.correct)}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
            <EmButton
              kind={done ? 'green' : 'sky'}
              onClick={submit}
              disabled={!canCheck || busy}
              loading={busy}
              icon={<FiCheck size={16} />}
            >
              {checked ? 'Check again' : 'Check my answers'}
            </EmButton>
            <EmButton kind="ghost" onClick={() => setHint((h) => !h)} icon={<FiHelpCircle size={15} />} style={{ padding: '10px 16px', fontSize: 13.5 }}>
              {hint ? 'Hide hint' : 'Show hint'}
            </EmButton>
            {err && <span style={{ color: err.locked ? EM.amber : EM.rose, fontSize: 13, fontWeight: 700 }}>{err.message}</span>}
          </div>

          {hint && !checked && (
            <div className="em-pop" style={{ marginTop: 14, borderRadius: 14, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.35)', padding: '12px 16px', color: EM.muted, fontSize: 13.5, lineHeight: 1.6 }}>
              <strong style={{ color: EM.amber }}>Hint: </strong>
              {recap[0] || 'Review the lesson recap above, then try each item. You can check your answers as many times as you like — your completion is recorded when every item is correct.'}
            </div>
          )}
        </>
      )}
    </article>
  )
}

function blankAnswers(activity) {
  const items = activity.items || []
  if (activity.type === 'match-pairs') return (activity.pairs || []).map(() => '')
  return items.map((it) => {
    if (activity.type === 'sentence-order') return []
    return null
  })
}

function ActivityBody({ activity, answers, setAnswers, feedback, accent, disabled }) {
  const fbc = (i) => (feedback ? feedback[i] : null)

  if (activity.type === 'mcq' || activity.type === 'error-find') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {activity.items.map((it, i) => (
          <div key={i}>
            <p style={{ color: EM.ink, fontSize: 14.5, fontWeight: 700, margin: '0 0 8px' }}>
              {i + 1}. {it.prompt}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {it.options.map((o, oi) => (
                <EmOption
                  key={oi}
                  option={o}
                  index={oi}
                  selected={answers[i] === o}
                  onSelect={(v) => setAnswers(answers.map((a, j) => (j === i ? v : a)))}
                  disabled={disabled}
                  reveal={fbc(i) ? (fbc(i).correct ? (answers[i] === o ? 'correct' : null) : (answers[i] === o ? 'wrong' : null)) : null}
                />
              ))}
            </div>
            {fbc(i) && (
              <div style={{ marginTop: 8, borderRadius: 12, background: fbc(i).correct ? 'rgba(52,211,153,0.1)' : 'rgba(251,113,133,0.1)', border: `1px solid ${fbc(i).correct ? 'rgba(52,211,153,0.35)' : 'rgba(251,113,133,0.35)'}`, padding: '10px 14px', color: EM.muted, fontSize: 13.5, lineHeight: 1.55 }}>
                {fbc(i).correct ? <FiCheck size={14} color={EM.green} /> : <FiX size={14} color={EM.rose} />}{' '}
                {fbc(i).correct ? 'Correct. ' : `Not quite — the correct answer is "${fbc(i).correctAnswer}". `}
                {fbc(i).explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (activity.type === 'true-false') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {activity.items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <p style={{ color: EM.ink, fontSize: 14.5, fontWeight: 700, margin: 0, flex: 1, minWidth: 220 }}>
              {i + 1}. {it.statement}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['True', 'False'].map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setAnswers(answers.map((a, j) => (j === i ? o === 'True' : a)))}
                  disabled={disabled}
                  style={{
                    padding: '8px 18px', borderRadius: 12, fontSize: 14, fontWeight: 800, fontFamily: 'inherit', cursor: disabled ? 'not-allowed' : 'pointer',
                    color: EM.ink, background: answers[i] === (o === 'True') ? 'rgba(139,92,246,0.28)' : 'rgba(255,255,255,0.06)', border: `2px solid ${answers[i] === (o === 'True') ? EM.violet : EM.line}`,
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
            {fbc(i) && (
              <div style={{ width: '100%', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: `1px solid ${EM.line}`, padding: '10px 14px', color: EM.muted, fontSize: 13.5, lineHeight: 1.55 }}>
                {fbc(i).correct ? <FiCheck size={14} color={EM.green} /> : <FiX size={14} color={EM.rose} />}{' '}
                {fbc(i).correct ? 'Correct. ' : `Not quite — the statement is ${fbc(i).correctAnswer}. `}
                {fbc(i).explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (activity.type === 'fill-blank') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activity.items.map((it, i) => {
          const [pre, post] = it.sentence.split('____')
          return (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', color: EM.ink, fontSize: 15, lineHeight: 1.6 }}>
                <span>{i + 1}.</span>
                <span>{pre}</span>
                <input
                  aria-label={`Blank ${i + 1}`}
                  value={answers[i] || ''}
                  onChange={(e) => setAnswers(answers.map((a, j) => (j === i ? e.target.value : a)))}
                  disabled={disabled}
                  placeholder="…"
                  style={{
                    outline: 'none', background: 'rgba(10,13,34,0.5)', color: EM.ink,
                    border: `1.5px solid ${answers[i] ? EM.violet : EM.line}`, borderRadius: 10,
                    padding: '6px 10px', fontSize: 14.5, width: 190, fontFamily: 'inherit',
                  }}
                />
                <span>{post}</span>
              </div>
              {fbc(i) && (
                <div style={{ marginTop: 6, borderRadius: 12, background: fbc(i).correct ? 'rgba(52,211,153,0.1)' : 'rgba(251,113,133,0.1)', border: `1px solid ${fbc(i).correct ? 'rgba(52,211,153,0.35)' : 'rgba(251,113,133,0.35)'}`, padding: '10px 14px', color: EM.muted, fontSize: 13.5, lineHeight: 1.55 }}>
                  {fbc(i).correct ? <FiCheck size={14} color={EM.green} /> : <FiX size={14} color={EM.rose} />}{' '}
                  {fbc(i).correct ? 'Correct. ' : `Not quite — expected one of: ${fbc(i).correctAnswer}. `}
                  {fbc(i).explanation}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  if (activity.type === 'match-pairs') {
    const rightOptions = shuffleStable(activity.rightOptions, activity.activityId)
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'center' }}>
        {activity.pairs.map((p, i) => (
          <React.Fragment key={p.left}>
            <div style={{ borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: `1px solid ${EM.line}`, padding: '10px 14px', color: EM.ink, fontWeight: 800, fontSize: 14.5 }}>
              <span style={{ color: EM.faint, fontWeight: 800, marginRight: 8 }}>{i + 1}.</span>{p.left}
            </div>
            <select
              aria-label={`Match for ${p.left}`}
              value={answers[i] || ''}
              onChange={(e) => setAnswers(answers.map((a, j) => (j === i ? e.target.value : a)))}
              disabled={disabled}
              style={{
                width: '100%', outline: 'none', background: 'rgba(10,13,34,0.5)', color: EM.ink,
                border: `1.5px solid ${answers[i] ? EM.violet : EM.line}`, borderRadius: 12, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit',
              }}
            >
              <option value="" style={{ background: '#141a3c' }}>Choose…</option>
              {rightOptions.map((r) => <option key={r} value={r} style={{ background: '#141a3c' }}>{r}</option>)}
            </select>
            {fbc(i) && (
              <div style={{ gridColumn: '1 / -1', borderRadius: 12, background: fbc(i).correct ? 'rgba(52,211,153,0.1)' : 'rgba(251,113,133,0.1)', border: `1px solid ${fbc(i).correct ? 'rgba(52,211,153,0.35)' : 'rgba(251,113,133,0.35)'}`, padding: '8px 12px', color: EM.muted, fontSize: 13, lineHeight: 1.5 }}>
                {fbc(i).correct ? 'Correct pair.' : `Not quite — "${p.left}" matches "${fbc(i).correctAnswer}".`}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }

  // sentence-order
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {activity.items.map((item, i) => {
        const ordered = answers[i] || []
        // Deterministic seeded shuffle so the answer (stored `lines` order) is
        // never revealed in the pool. Same result on every render — no hooks.
        const pool = shuffleStable(item.lines, `${activity.activityId}-${i}`)
        const rest = pool.filter((l) => !ordered.includes(l.id))
        const move = (id, dir) => {
          const cur = [...ordered]
          const pos = cur.indexOf(id)
          const swap = pos + dir
          if (swap < 0 || swap >= cur.length) return
          ;[cur[pos], cur[swap]] = [cur[swap], cur[pos]]
          setAnswers(answers.map((a, j) => (j === i ? cur : a)))
        }
        const fbcI = fbc(i)
        return (
          <div key={i}>
            {item.promptHint && <div style={{ color: EM.muted, fontSize: 13.5, marginBottom: 8 }}>{item.promptHint}</div>}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ color: EM.faint, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Your order</div>
                {ordered.length === 0 && <div style={{ color: EM.faint, fontSize: 13, borderRadius: 12, border: `1.5px dashed ${EM.line}`, padding: '14px', textAlign: 'center' }}>Tap lines below to place them here in order.</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ordered.map((id) => {
                    const line = item.lines.find((l) => l.id === id)
                    return (
                      <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, background: 'rgba(139,92,246,0.18)', border: `1px solid rgba(139,92,246,0.45)`, padding: '9px 12px' }}>
                        <button type="button" aria-label="Move up" disabled={disabled || fbcI} onClick={() => move(id, -1)} style={{ background: 'none', border: 'none', color: EM.sky, cursor: fbcI ? 'not-allowed' : 'pointer', padding: 2 }}><FiArrowUp size={15} /></button>
                        <button type="button" aria-label="Move down" disabled={disabled || fbcI} onClick={() => move(id, 1)} style={{ background: 'none', border: 'none', color: EM.sky, cursor: fbcI ? 'not-allowed' : 'pointer', padding: 2 }}><FiArrowDown size={15} /></button>
                        <span style={{ color: EM.ink, fontSize: 13.5, lineHeight: 1.45, flex: 1 }}>{line.text}</span>
                        {!fbcI && <button type="button" aria-label="Remove from order" onClick={() => setAnswers(answers.map((a, j) => (j === i ? ordered.filter((x) => x !== id) : a)))} style={{ background: 'none', border: 'none', color: EM.rose, cursor: 'pointer', padding: 2 }}><FiX size={15} /></button>}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ color: EM.faint, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Lines to use</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {rest.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => setAnswers(answers.map((a, j) => (j === i ? [...(a || []), l.id] : a)))}
                      style={{ fontFamily: 'inherit', textAlign: 'left', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: `1px solid ${EM.line}`, padding: '9px 12px', color: EM.muted, fontSize: 13.5, lineHeight: 1.45, cursor: 'pointer' }}
                    >
                      {l.text}
                    </button>
                  ))}
                  {rest.length === 0 && !fbcI && <div style={{ color: EM.green, fontSize: 13, fontWeight: 800 }}>All lines placed — check your order!</div>}
                </div>
              </div>
            </div>
            {fbcI && (
              <div style={{ marginTop: 10, borderRadius: 12, background: fbcI.correct ? 'rgba(52,211,153,0.1)' : 'rgba(251,113,133,0.1)', border: `1px solid ${fbcI.correct ? 'rgba(52,211,153,0.35)' : 'rgba(251,113,133,0.35)'}`, padding: '10px 14px', color: EM.muted, fontSize: 13.5, lineHeight: 1.55 }}>
                {fbcI.correct ? <FiCheck size={14} color={EM.green} /> : <FiX size={14} color={EM.rose} />}{' '}
                {fbcI.correct ? 'Correct order!' : 'Not quite — review the ordering clues in the lesson and try again.'}{' '}
                {fbcI.explanation}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Assessment panel (locked / ready / completed) ──────────────────────────
function AssessmentPanel({ progress, allDone, assessment, totalActivities, onStart, nextTopic, areaId }) {
  const navigate = useNavigate()
  if (progress.assessmentCompleted) {
    return (
      <div style={{ background: EM.panel, border: `1px solid ${EM.line}`, borderRadius: 24, padding: '26px', textAlign: 'center' }}>
        <FiCheckCircle size={34} color={EM.green} style={{ margin: '0 auto 12px', display: 'block' }} />
        <h3 style={{ fontSize: 21, fontWeight: 900, color: EM.ink, margin: '0 0 6px' }}>Assessment completed</h3>
        <p style={{ color: EM.muted, fontSize: 14.5, margin: '0 0 8px' }}>
          Best score: <strong style={{ color: EM.green }}>{progress.bestPercent}%</strong> ({progress.bestScore} marks) · {progress.assessmentAttempts} attempt{progress.assessmentAttempts === 1 ? '' : 's'}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 }}>
          <EmButton kind="ghost" onClick={onStart}>Retake (new questions)</EmButton>
          {nextTopic && (
            <EmButton kind="sky" onClick={() => navigate(`/student/class8/english/topic/${nextTopic.topicId}`)} icon={<FiChevronRight size={16} />}>
              Next: {nextTopic.name}
            </EmButton>
          )}
        </div>
      </div>
    )
  }
  if (allDone) {
    return (
      <div style={{ background: EM.panel, border: `1px solid ${EM.line}`, borderRadius: 24, padding: '26px', textAlign: 'center' }} className="em-rise">
        <FiAward size={34} color={EM.amber} style={{ margin: '0 auto 12px', display: 'block' }} />
        <h3 style={{ fontSize: 21, fontWeight: 900, color: EM.ink, margin: '0 0 8px' }}>Ready for take-off</h3>
        <p style={{ color: EM.muted, fontSize: 14.5, lineHeight: 1.6, maxWidth: 520, margin: '0 auto 18px' }}>
          You finished every activity, so the AI now generates a fresh {assessment.count}-question set for this topic.
          Answer everything, submit, and review every explanation. You can retake the assessment any time — each attempt gets a new set.
        </p>
        <EmButton kind="green" onClick={onStart} icon={<FiTarget size={17} />}>Start assessment</EmButton>
      </div>
    )
  }
  return (
    <div style={{ background: EM.panel, border: `1px solid ${EM.line}`, borderRadius: 24, padding: '26px', textAlign: 'center' }}>
      <FiTarget size={30} color={EM.faint} style={{ margin: '0 auto 12px', display: 'block' }} />
      <h3 style={{ fontSize: 19, fontWeight: 900, color: EM.ink, margin: '0 0 8px' }}>Assessment locked</h3>
      <p style={{ color: EM.muted, fontSize: 14.5, lineHeight: 1.6, maxWidth: 520, margin: '0 auto' }}>
        Complete <strong style={{ color: EM.ink }}>all {totalActivities} activities above</strong> ({progress.completedActivities.length} done) to unlock the AI-generated assessment.
      </p>
    </div>
  )
}