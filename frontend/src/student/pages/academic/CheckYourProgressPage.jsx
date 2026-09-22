import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import recommendationService from '../../../services/recommendationService'
import assessmentService from '../../../services/assessmentService'
import { SBtn, SBadge, SLoader, SAlert } from '../../components/ui'
import {
  FiTarget, FiCheckCircle, FiArrowUp, FiArrowDown, FiClock,
  FiRotateCcw, FiTrendingUp, FiBarChart2, FiAlertCircle, FiLayers, FiCalendar, FiBookOpen,
} from 'react-icons/fi'
import s from './CheckYourProgressPage.module.css'

// ── Constants (display + selection only; backend engine is the source of
// ── truth for scores, bands, priorities and the refreshed study plan).
const SUPPORTED_CLASSES = ['5', '8', '10', '12']
const DEFAULT_CLASS = '10'
const QUIZ_CATEGORIES = [
  'Logical Thinking',
  'Mathematics / Quantitative Ability',
  'Science Understanding',
  'Communication',
  'Creativity',
  'Career Interest',
  'Decision Making',
  'General Awareness',
]
const SUBJECT_TO_CATEGORY = {
  Mathematics: ['Mathematics / Quantitative Ability'],
  Science: ['Science Understanding'],
  English: ['Communication'],
  Communication: ['Communication'],
  'Logical Thinking': ['Logical Thinking'],
  'General Awareness': ['General Awareness'],
  'Decision Making': ['Decision Making'],
  Creativity: ['Creativity'],
  'Career Interest': ['Career Interest'],
}

const fmt = (n) => (Number.isFinite(Number(n)) ? String(Math.round(n)) : '—')
const round1 = (n) => Math.round((Number(n) + Number.EPSILON) * 10) / 10

const normalizeClassKey = (level) => {
  const digits = String(level ?? '').match(/\d+/)
  const key = digits ? digits[0] : DEFAULT_CLASS
  return SUPPORTED_CLASSES.includes(key) ? key : DEFAULT_CLASS
}

const classifyBand = (pct) => {
  const v = Number.isFinite(Number(pct)) ? Number(pct) : 0
  if (v < 40) return 'Critical'
  if (v < 60) return 'Weak'
  if (v < 75) return 'Needs Practice'
  if (v < 90) return 'Good'
  return 'Excellent'
}

const bandBadge = (band) => ({
  Critical: 'red',
  Weak: 'orange',
  'Needs Practice': 'gold',
  Good: 'blue',
  Excellent: 'green',
}[band] || 'gray')

const nextStepsFor = (band) => {
  switch (band) {
    case 'Critical':
    case 'Weak':
      return 'Keep practising this area daily and retake the check-up in about a week — your updated plan in Area of Growth now prioritises it.'
    case 'Needs Practice':
      return 'Consistent daily revision will push this into strong territory. Follow your updated study plan in Area of Growth.'
    case 'Good':
      return 'You are close to excellent — a few more practice rounds will lock it in. Continue with your plan.'
    default:
      return 'Excellent — maintain this level with light weekly revision and re-test periodically.'
  }
}

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export default function CheckYourProgressPage() {
  const { student } = useStudentAuth()
  const navigate = useNavigate()
  const studentId = student?._id
  const classKey = normalizeClassKey(student?.classLevel)

  // ── Data ───────────────────────────────────────────────────────────────
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [rec, setRec] = useState(null)                 // recommendation BEFORE check-up
  const [fresh, setFresh] = useState(null)             // refreshed AFTER submit
  const [quiz, setQuiz] = useState([])                 // questions to serve
  const [plan, setPlan] = useState([])                 // [{subject, topic, count}]
  const [sources, setSources] = useState([])           // per-subject serve stats
  const [totalCount, setTotalCount] = useState(0)

  // ── Quiz state ─────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('boot')           // boot | intro | quiz | result
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // ── Result state ───────────────────────────────────────────────────────
  const [prevOverall, setPrevOverall] = useState(null)
  const [prevBand, setPrevBand] = useState(null)
  const [newOverall, setNewOverall] = useState(null)
  const [newCats, setNewCats] = useState([])

  // ── Load: recommendation → prepare re-assessment questions ─────────────
  useEffect(() => {
    if (!studentId) return
    let cancelled = false
    ;(async () => {
      setLoaded(false)
      setError('')
      try {
        const recRes = await recommendationService.getAcademicRecommendations(studentId)
        if (cancelled) return
        const data = recRes?.data || null
        setRec(data)

        if (!data?.hasAssessment) {
          setPhase('intra')
        } else {
          const qRes = await assessmentService.getReassessmentQuestions({
            userId: studentId,
            classLevel: classKey,
          })
          if (cancelled) return
          if (qRes?.code === 'NO_ASSESSMENT') {
            setPhase('intra')
          } else {
            setQuiz(qRes?.questions || [])
            setPlan(qRes?.plan || [])
            setSources(qRes?.sources || [])
            setTotalCount(qRes?.totalCount || 0)
            setPhase('intro')
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Could not prepare your check-up. Please try again.')
        }
      } finally {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId])

  // ── Previous per-subject scores (from the recommendation BEFORE this check-up)
  const priorList = useMemo(() => {
    if (!rec) return []
    return [...(rec.weakSubjects || []), ...(rec.strongSubjects || [])]
  }, [rec])

  const prevScoreFor = (subject, category) => {
    const direct = priorList.find((x) => x.level === subject || x.level === category)
    if (direct && direct.scorePercentage != null) return Number(direct.scorePercentage)
    const mapped = priorList.find((x) => (SUBJECT_TO_CATEGORY[x.level] || []).includes(category))
    return mapped && mapped.scorePercentage != null ? Number(mapped.scorePercentage) : null
  }

  const prevOverallValue = rec?.overallPerformance?.scorePercentage != null
    ? Number(rec.overallPerformance.scorePercentage)
    : null
  const prevBandValue = rec?.overallPerformance?.band || (prevOverallValue != null ? classifyBand(prevOverallValue) : null)

  const handleSelect = (opt) => {
    const q = quiz[currentIndex]
    if (!q) return
    setAnswers((prev) => ({ ...prev, [q._id]: opt.text }))
  }

  const handleSubmit = async () => {
    if (quiz.some((q) => !answers[q._id]) || submitting) return
    setPrevOverall(prevOverallValue)
    setPrevBand(prevBandValue)
    setSubmitting(true)
    setSubmitError('')
    try {
      const payload = {
        userId: studentId,
        classLevel: classKey,
        answers: quiz.map((q) => ({ questionId: q._id, selectedAnswer: answers[q._id] })),
      }
      const submitRes = await assessmentService.submitAssessment(payload)
      const pct = Number(submitRes?.result?.totalScore?.percentage)
      setNewOverall(Number.isFinite(pct) ? pct : null)
      setNewCats(submitRes?.result?.categoryScores || [])
      // Refresh the recommendation so the updated plan/priorities are reflected
      // and the engine's own band is authoritative for the new result.
      try {
        const freshRes = await recommendationService.getAcademicRecommendations(studentId)
        setFresh(freshRes?.data || null)
      } catch {
        setFresh(null)
      }
      setPhase('result')
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Submission failed — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetRun = () => {
    setAnswers({})
    setCurrentIndex(0)
    setSubmitError('')
    setPrevOverall(null)
    setPrevBand(null)
    setNewOverall(null)
    setNewCats([])
    setFresh(null)
    setLoaded(false)
    setPhase('boot')
  }

  // restart uses the same loaded question set (regenerated on next page load)
  const retake = () => {
    setAnswers({})
    setCurrentIndex(0)
    setSubmitError('')
    setNewOverall(null)
    setNewCats([])
    setFresh(null)
    setPhase('quiz')
  }

  // ── Derived result rows ────────────────────────────────────────────────
  const resultRows = useMemo(() => {
    const rows = []
    for (const item of plan) {
      const cat = (SUBJECT_TO_CATEGORY[item.subject] || [item.subject])[0]
      const catScore = newCats.find((c) => c.category === cat)
      const pct = catScore ? Number(catScore.percentage) : null
      const prior = prevScoreFor(item.subject, cat)
      if (pct == null) continue
      const delta = prior != null ? round1(pct - prior) : null
      const trend = prior == null ? 'new' : pct > prior ? 'improved' : pct < prior ? 'regressed' : 'steady'
      rows.push({
        subject: item.subject,
        topic: item.topic,
        category: cat,
        pct,
        prior,
        delta,
        trend,
        stillWeak: pct < 75,
      })
    }
    return rows
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, newCats, rec])

  const headlineTrend =
    prevOverall == null || newOverall == null ? null
      : newOverall > prevOverall ? 'Improved' : newOverall < prevOverall ? 'Declined' : 'No Change'

  const newBand = fresh?.overallPerformance?.band || (newOverall != null ? classifyBand(newOverall) : null)

  // ── Loading state ──────────────────────────────────────────────────────
  if (!loaded) {
    return (
      <div className={s.page}>
        <PageHeader />
        <div className={s.stateCard}>
          <SLoader />
          <h3 className={s.stateTitle} style={{ marginTop: 18 }}>Preparing your check-up…</h3>
          <p className={s.stateDesc}>Identifying your weakest areas and gathering questions.</p>
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={s.page}>
        <PageHeader />
        <div className={s.stateCard}>
          <div className={s.stateIcon} style={{ background: '#fee2e2', color: '#dc2626' }}>
            <FiAlertCircle size={22} />
          </div>
          <h3 className={s.stateTitle}>Couldn't prepare your check-up</h3>
          <p className={s.stateDesc}>{error}</p>
          <SBtn variant="primary" onClick={resetRun}>Try Again</SBtn>
        </div>
      </div>
    )
  }

  // ── No assessment yet ──────────────────────────────────────────────────
  if (!rec?.hasAssessment) {
    return (
      <div className={s.page}>
        <PageHeader />
        <div className={s.stateCard}>
          <div className={s.stateIcon} style={{ background: 'var(--s-primary-l)', color: 'var(--s-primary)' }}>
            <FiTarget size={22} />
          </div>
          <h3 className={s.stateTitle}>Complete your Area of Growth first</h3>
          <p className={s.stateDesc}>
            Take the quick assessment to build your baseline, then come back here for a short check-up that tracks your progress.
          </p>
          <SBtn variant="primary" onClick={() => navigate('/student/onboarding')}>Start Assessment</SBtn>
        </div>
      </div>
    )
  }

  // ── No weak areas to re-assess ─────────────────────────────────────────
  if (phase === 'intro' && totalCount === 0 && !error && plan.length === 0) {
    return (
      <div className={s.page}>
        <PageHeader />
        <div className={s.stateCard}>
          <div className={s.stateIcon} style={{ background: 'var(--s-green-l)', color: 'var(--s-green)' }}>
            <FiCheckCircle size={22} />
          </div>
          <h3 className={s.stateTitle}>No weak areas to re-assess right now</h3>
          <p className={s.stateDesc}>
            All of your assessed areas are on track. Keep following your study plan and retest periodically.
          </p>
          <SBtn variant="primary" onClick={() => navigate('/student/area-of-growth')}>
            Back to Area of Growth
          </SBtn>
        </div>
      </div>
    )
  }

  const currentQ = quiz[currentIndex]

  // ── Intro ───────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    const focusSubject = plan[0]?.subject
    return (
      <div className={s.page}>
        <PageHeader />
        <div className={`${s.hero} s-anim-up`}>
          <div className={s.heroLeft}>
            <div className={s.heroEyebrow}>Short re-assessment</div>
            <div className={s.heroTitle}>Check Your Progress</div>
            <p className={s.heroMessage}>
              A focused set of questions on the areas flagged for growth — weakest first. You will get a fresh score,
              a like-for-like comparison with your previous attempt, and an updated study plan.
            </p>

            <div className={s.statRow}>
              <div className={s.statCard}>
                <span className={s.statLabel}>Previous score</span>
                <span className={s.statValue}>{prevOverallValue != null ? `${fmt(prevOverallValue)}%` : '—'}</span>
                <div className={s.statBadge}>
                  <SBadge color={bandBadge(prevBandValue)}>{prevBandValue || '—'}</SBadge>
                </div>
              </div>
              <div className={s.statCard}>
                <span className={s.statLabel}>This check-up</span>
                <span className={s.statValue}>{totalCount || quiz.length} questions</span>
                <span className={s.statSub}>~{Math.max(1, Math.ceil((totalCount || quiz.length) / 2))} min to finish</span>
              </div>
              <div className={s.statCard}>
                <span className={s.statLabel}>Focus areas</span>
                <span className={s.statValue}>{plan.length}</span>
                <span className={s.statSub}>weakest areas first</span>
              </div>
            </div>

            <div className={s.ctaRow}>
              <SBtn variant="white" size="lg" disabled={quiz.length === 0} onClick={() => { setAnswers({}); setCurrentIndex(0); setPhase('quiz') }}>
                <FiTarget size={18} /> Start Check-up
              </SBtn>
              <SBtn
                variant="outline"
                size="lg"
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.1)' }}
                onClick={() => navigate('/student/area-of-growth')}
              >
                Back to Area of Growth
              </SBtn>
            </div>
          </div>

          <div className={s.heroRight}>
            <div className={s.focusTitle}>This check-up targets</div>
            <div className={s.planRowList}>
              {plan.map((p) => (
                <div key={`${p.subject}-${p.topic || 'all'}`} className={s.planRow}>
                  <span className={s.planRowName}>{p.subject}</span>
                  <span className={s.planRowMid}>
                    {p.topic ? (
                      <SBadge color="blue" style={{ fontSize: 11 }}>{p.topic}</SBadge>
                    ) : (
                      <span className={s.planRowNone}>core concepts</span>
                    )}
                  </span>
                  <span className={s.planRowCount}>{p.count} Qs</span>
                </div>
              ))}
            </div>
            <p className={s.heroHint}>
              Questions are pulled from your area-of-growth bank and generated on demand when needed — reused across
              future check-ups.
            </p>
          </div>
        </div>

        {(sources || []).length > 0 && (
          <p className={s.footNote}>
            Primary focus: {focusSubject || 'your weakest subject'} — from your latest Area of Growth analysis.
          </p>
        )}
      </div>
    )
  }

  // ── Quiz ────────────────────────────────────────────────────────────────
  if (phase === 'quiz' && currentQ) {
    const answered = !!answers[currentQ._id]
    const isLast = currentIndex === quiz.length - 1
    return (
      <div className={s.page}>
        <PageHeader />

        <div className={s.quizCard}>
          <div className={s.quizMetaRow}>
            <div className={s.quizSubjectWrap}>
              <span className={s.quizCat}><FiLayers size={14} /> {currentQ.category}</span>
              {currentQ.recommendationTag && (
                <span className={s.quizTopic}><FiTarget size={12} /> {currentQ.recommendationTag}</span>
              )}
            </div>
            <span className={s.quizQIndex}><FiBarChart2 size={14} /> Question {currentIndex + 1} of {quiz.length}</span>
          </div>

          <div className={s.quizProgressWrap}>
            <div className={s.quizProgress}>
              <div className={s.quizProgressFill} style={{ width: `${((currentIndex) / quiz.length) * 100}%` }} />
            </div>
            <span className={s.quizProgressLabel}>{Math.round(((currentIndex + 1) / quiz.length) * 100)}% done</span>
          </div>

          <h2 className={s.quizText}>{currentQ.questionText}</h2>

          <div className={s.optList}>
            {(currentQ.options || []).map((opt, i) => {
              const optText = typeof opt === 'string' ? opt : opt?.text
              const sel = answers[currentQ._id] === optText
              return (
                <button
                  key={`${currentQ._id}-${i}`}
                  type="button"
                  className={`${s.opt} ${sel ? s.optSel : ''}`}
                  onClick={() => handleSelect({ text: optText })}
                >
                  <span className={s.optLetter}>{String.fromCharCode(65 + i)}</span>
                  <span className={s.optText}>{optText}</span>
                  {sel && <FiCheckCircle size={18} className={s.optCheck} />}
                </button>
              )
            })}
          </div>

          {submitError && (
            <SAlert type="error" message={submitError} onClose={() => setSubmitError('')} style={{ marginTop: 14 }} />
          )}

          <div className={s.quizFoot}>
            <SBtn variant="ghost" disabled={currentIndex === 0} onClick={() => setCurrentIndex((i) => i - 1)}>
              Previous
            </SBtn>
            {!isLast ? (
              <SBtn variant="primary" disabled={!answered} onClick={() => setCurrentIndex((i) => i + 1)}>
                Next
              </SBtn>
            ) : (
              <SBtn variant="primary" disabled={!answered || submitting} onClick={handleSubmit}>
                {submitting ? 'Submitting…' : 'Submit Assessment'}
              </SBtn>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Result ──────────────────────────────────────────────────────────────
  const deltaPct = prevOverall != null && newOverall != null ? round1(newOverall - prevOverall) : null
  return (
    <div className={s.page}>
      <PageHeader />

      <div className={`${s.hero} ${newOverall >= (prevOverall ?? 0) ? s.heroUp : s.heroDown} s-anim-up`}>
        <div className={s.heroLeft}>
          <div className={s.heroEyebrow}>New score</div>
          <div className={s.heroScore}>
            {newOverall != null ? fmt(newOverall) : '—'}
            <span className={s.heroScorePct}>%</span>
          </div>
          <div className={s.heroBandRow}>
            <SBadge color={bandBadge(newBand)}>{newBand || '—'}</SBadge>
          </div>
          <div className={s.heroDelta}>
            {deltaPct != null ? (
              deltaPct >= 0 ? (
                <>
                  <FiArrowUp size={15} />
                  <strong>+{fmt(deltaPct)}%</strong> from your previous score
                  <span className={s.heroPrev}> previous {fmt(prevOverall)}%</span>
                </>
              ) : (
                <>
                  <FiArrowDown size={15} />
                  <strong>{fmt(deltaPct)}%</strong> from your previous score
                  <span className={s.heroPrev}> previous {fmt(prevOverall)}%</span>
                </>
              )
            ) : (
              <>This check-up sets a fresh baseline for your progress tracking.</>
            )}
          </div>

          <div className={s.resultMetaGrid}>
            <div className={s.resultMeta}>
              <span className={s.resultMetaLabel}>Previous score</span>
              <span className={s.resultMetaValue}>{prevOverall != null ? `${fmt(prevOverall)}%` : '—'}</span>
            </div>
            <div className={s.resultMeta}>
              <span className={s.resultMetaLabel}>Previous band</span>
              <span className={s.resultMetaValue}>
                <SBadge color={bandBadge(prevBand)}>{prevBand || '—'}</SBadge>
              </span>
            </div>
            <div className={s.resultMeta}>
              <span className={s.resultMetaLabel}>Trend</span>
              <span className={`${s.resultMetaValue} ${headlineTrend === 'Improved' ? s.trendUp : headlineTrend === 'Declined' ? s.trendDown : s.trendFlat}`}>
                {headlineTrend || 'Baseline set'}
              </span>
            </div>
            <div className={s.resultMeta}>
              <span className={s.resultMetaLabel}>New band</span>
              <span className={s.resultMetaValue}>
                <SBadge color={bandBadge(newBand)}>{newBand || '—'}</SBadge>
              </span>
            </div>
          </div>

          <div className={s.ctaRow}>
            <SBtn variant="white" size="lg" onClick={() => navigate('/student/area-of-growth')}>
              <FiTrendingUp size={18} /> View Updated Area of Growth
            </SBtn>
            <SBtn
              variant="outline"
              size="lg"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.1)' }}
              onClick={retake}
            >
              <FiRotateCcw size={16} /> Retake check-up
            </SBtn>
          </div>
          <p className={s.heroNote}>
            Your weak areas, recommended resources and daily study plan in Area of Growth have been refreshed with this
            result.
          </p>
        </div>

        <div className={s.heroRight}>
          <div className={s.focusTitle}>At a glance</div>
          <div className={s.summaryChips}>
            <span className={s.sumChipUp}>Improved <strong>{resultRows.filter((r) => r.trend === 'improved').length}</strong></span>
            <span className={s.sumChipStill}>Still weak <strong>{resultRows.filter((r) => r.stillWeak).length}</strong></span>
            <span className={s.sumChipDown}>Declined <strong>{resultRows.filter((r) => r.trend === 'regressed').length}</strong></span>
            {resultRows.filter((r) => r.trend === 'new').length > 0 && (
              <span className={s.sumChipNew}>New <strong>{resultRows.filter((r) => r.trend === 'new').length}</strong></span>
            )}
          </div>
          {fresh?.overallPerformance?.date && (
            <p className={s.heroHint} style={{ marginTop: 14 }}>
              <FiCalendar size={12} /> Assessment recorded on {fmtDate(fresh.overallPerformance.date)}
            </p>
          )}
        </div>
      </div>

      {/* ── Per-subject comparison ─────────────────────────────────────── */}
      <section className="s-anim-up s-d1">
        <SectionHead
          icon={<FiBarChart2 />}
          title="Compare with your previous score"
          subtitle="Same areas, same comparison — previous attempt vs this check-up. Areas sliding below 75% stay recommended."
        />
        {resultRows.length === 0 ? (
          <div className={s.card}><p className={s.mutedText}>No breakdown available for this check-up.</p></div>
        ) : (
          <div className={s.rowList}>
            {resultRows.map((r) => {
              const better = r.trend === 'improved'
              const worse = r.trend === 'regressed'
              const label =
                r.trend === 'new'
                  ? r.stillWeak ? 'Still weak' : 'New area'
                  : better
                    ? r.stillWeak ? 'Improved · still weak' : 'Improved'
                    : worse
                      ? r.stillWeak ? 'Still weak' : 'Declined'
                      : 'No change'
              const chipColor =
                better ? 'green'
                  : worse || r.stillWeak ? 'orange'
                    : r.trend === 'new' ? 'blue' : 'gray'
              return (
                <div key={`${r.subject}-${r.category}`} className={s.compareRow}>
                  <div className={s.rowTop}>
                    <div className={s.rowNameWrap}>
                      <span className={s.rowName}>{r.subject}</span>
                      {r.topic && <span className={s.rowTopic}>{r.topic}</span>}
                    </div>
                    <SBadge color={chipColor}>{label}</SBadge>
                  </div>
                  <div className={s.rowBars}>
                    <div className={s.rowBarCol}>
                      <span className={s.rowBarValue}>{r.prior != null ? `${fmt(r.prior)}%` : '—'}</span>
                      <span className={s.rowBarLabel}>Previous ({r.category})</span>
                      <div className={s.bar} style={{ background: 'var(--s-bg2)' }}>
                        <div className={s.barFill} style={{ width: `${Math.min(100, r.prior ?? 0)}%`, background: 'var(--s-text3)' }} />
                      </div>
                    </div>
                    <div className={s.rowArrow}>
                      {better ? <FiArrowUp size={15} /> : worse ? <FiArrowDown size={15} /> : <span className={s.rowArrowFlat}>→</span>}
                    </div>
                    <div className={s.rowBarCol}>
                      <span className={s.rowBarValue} style={{ color: 'var(--s-primary)' }}>{fmt(r.pct)}%</span>
                      <span className={s.rowBarLabel}>Now</span>
                      <div className={s.bar} style={{ background: 'var(--s-bg2)' }}>
                        <div
                          className={s.barFill}
                          style={{ width: `${Math.min(100, r.pct)}%`, background: better ? 'var(--s-green)' : r.stillWeak ? 'var(--s-accent)' : 'var(--s-primary)' }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={s.rowFoot}>
                    {r.delta != null ? (
                      <span className={better ? s.deltaUp : worse ? s.deltaDown : s.deltaFlat}>
                        {better ? '+' : ''}{fmt(r.delta)}% {better || worse ? 'from previous' : 'no change'}
                      </span>
                    ) : (
                      <span className={s.deltaNew}>first time tracked</span>
                    )}
                    {r.stillWeak && <span className={s.rowGoal}>Below the 75% target — stays a priority in your plan</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── What to do next ─────────────────────────────────────────────── */}
      <section className="s-anim-up s-d2">
        <SectionHead icon={<FiTrendingUp />} title="What to do next" subtitle="A focused next action based on your new score." />
        <div className={s.card}>
          <p className={s.nextSteps}>{nextStepsFor(newBand)}</p>
          <div className={s.ctaRow} style={{ marginTop: 16 }}>
            <SBtn variant="primary" onClick={() => navigate('/student/area-of-growth')}>
              <FiBookOpen size={16} /> Open my updated Area of Growth
            </SBtn>
          </div>
        </div>
      </section>
    </div>
  )
}

// ── Small presentational components ────────────────────────────────────────
function PageHeader() {
  return (
    <div className={s.pageHeader}>
      <div className={s.headerText}>
        <h1 className={s.pageTitle}>
          <span className={s.headerIcon}><FiTarget size={19} /></span>
          Check Your Progress
        </h1>
        <p className={s.pageSub}>Short re-assessment · new score · compare with previous · refreshed plan</p>
      </div>
    </div>
  )
}

function SectionHead({ icon, title, subtitle }) {
  return (
    <div className={s.sectionHead}>
      <span className={s.sectionIcon}>{icon}</span>
      <div>
        <h2 className={s.sectionTitle}>{title}</h2>
        {subtitle && <p className={s.sectionSub}>{subtitle}</p>}
      </div>
    </div>
  )
}