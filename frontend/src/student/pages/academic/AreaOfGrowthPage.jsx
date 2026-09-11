import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import recommendationService from '../../../services/recommendationService'
import { SBtn, SBadge, SLoader, SAlert } from '../../components/ui'
import {
  FiTrendingUp, FiTarget, FiBookOpen, FiClipboard, FiZap,
  FiArrowUp, FiArrowDown, FiClock, FiActivity, FiCheckCircle,
  FiBarChart2, FiCalendar, FiLayers, FiCheckSquare,
} from 'react-icons/fi'
import s from './AreaOfGrowthPage.module.css'

// ── Band → theme mapping (presentation only; band labels come from backend) ─
const BAND_THEME = {
  'Critical':       { color: '#dc2626', bg: '#fee2e2', badge: 'red' },
  'Weak':           { color: '#ea580c', bg: '#ffedd5', badge: 'orange' },
  'Needs Practice': { color: '#d97706', bg: '#fef3c7', badge: 'gold' },
  'Good':           { color: '#2563eb', bg: '#dbeafe', badge: 'blue' },
  'Excellent':      { color: '#16a34a', bg: '#dcfce7', badge: 'green' },
}

// Short, human-friendly description per band (display text only).
const BAND_MESSAGE = {
  'Critical':       'Critical — give these areas your immediate attention.',
  'Weak':           'Weak — steady focus here will move your score up fast.',
  'Needs Practice': 'Needs practice — consistent daily effort will build confidence.',
  'Good':           'Good — you are on the right track, keep refining.',
  'Excellent':      'Excellent — maintain this level with light revision.',
}

const PRIORITY_META = {
  High:   { label: 'High',   bg: '#fee2e2', color: '#b91c1c' },
  Medium: { label: 'Medium', bg: '#ffedd5', color: '#c2410c' },
  Low:    { label: 'Low',    bg: '#fef3c7', color: '#a16207' },
}

const bandTheme = (band) => BAND_THEME[band] || { color: 'var(--s-text2)', bg: 'var(--s-bg2)', badge: 'gray' }

// Map the backend priority weight (4=Critical, 3=Weak, 2=Needs Practice) to a
// readable priority label. Display-only.
const priorityOf = (weight) => {
  if (weight >= 4) return PRIORITY_META.High
  if (weight === 3) return PRIORITY_META.Medium
  return PRIORITY_META.Low
}

// ── Small formatting helpers (no recommendation logic here) ────────────────
const fmt = (n) => (Number.isFinite(Number(n)) ? String(Math.round(n)) : '—')

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

// "↑ 12% from previous" style caption for a measurement row.
const deltaCaption = (trend, delta) => {
  if (trend === 'new') return 'New'
  if (trend === 'improved') return `↑ ${fmt(delta)}% from previous`
  if (trend === 'regressed') return `↓ ${fmt(delta)}% from previous`
  return 'Steady'
}

// ── Study-plan completion persistence ───────────────────────────────────────
// The completion-checklist state is stored per student per plan DAY, keyed by
// the latest assessment snapshot's DATE. We deliberately do NOT use
// `generatedAt`: the backend stamps that fresh on every GET, which would make a
// new storage key on each fetch and silently reset checked tasks.
const planDateOf = (data) => {
  const raw =
    (data?.dataSources || []).filter((x) => x.isLatest).map((x) => x.date)[0] ||
    data?.overallPerformance?.date ||
    data?.generatedAt
  const d = raw ? new Date(raw) : null
  if (d && Number.isFinite(d.getTime())) {
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }
  return 'unknown'
}

const planStorageKey = (studentId, data) =>
  `academic-study-plan:${studentId || 'anon'}:${planDateOf(data)}`

// Keep only boolean-true entries from whatever was (possibly malformed) in
// localStorage, so corrupt/legacy payloads can never break the page.
const sanitizeDone = (value) => {
  const out = {}
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [k, v] of Object.entries(value)) {
      if (v === true) out[k] = true
    }
  }
  return out
}

function TrendChip({ trend, delta }) {
  if (trend === 'new' || delta == null) {
    return <span className={`${s.deltaChip} ${s.deltaNew}`}>New</span>
  }
  if (trend === 'improved') {
    return (
      <span className={`${s.deltaChip} ${s.deltaUp}`}>
        <FiArrowUp size={12} /> +{fmt(delta)}%
      </span>
    )
  }
  if (trend === 'regressed') {
    return (
      <span className={`${s.deltaChip} ${s.deltaDown}`}>
        <FiArrowDown size={12} /> {fmt(delta)}%
      </span>
    )
  }
  return <span className={`${s.deltaChip} ${s.deltaFlat}`}>No change</span>
}

function ProgressBar({ pct, color }) {
  const safePct = Math.max(0, Math.min(100, Number(pct) || 0))
  return (
    <div className={s.bar} style={{ background: color ? undefined : 'var(--s-bg2)' }}>
      <div
        className={s.barFill}
        style={{
          width: `${safePct}%`,
          background: color || `linear-gradient(90deg, var(--s-primary-l), var(--s-primary))`,
        }}
      />
    </div>
  )
}

// Lightweight SVG sparkline of overall scores across all attempts.
function Sparkline({ points }) {
  const list = (points || []).filter((p) => Number.isFinite(Number(p.scorePercentage)))
  if (list.length < 2) return null
  const w = 240
  const h = 48
  const xs = list.map((_, i) => (i / (list.length - 1)) * w)
  const ys = list.map((p) => h - (Math.min(100, Math.max(0, Number(p.scorePercentage))) / 100) * h)
  const path = xs.map((x, i) => `${i ? 'L' : 'M'}${x},${ys[i]}`).join(' ')
  const lastX = xs[xs.length - 1]
  const lastY = ys[ys.length - 1]
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={s.sparkline} aria-label="Score trend">
      <path d={path} fill="none" stroke="var(--s-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="3.5" fill="var(--s-primary)" />
    </svg>
  )
}

export default function AreaOfGrowthPage() {
  const { student } = useStudentAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [studyMinutes, setStudyMinutes] = useState(120)
  const [done, setDone] = useState({})

  const studentId = student?._id

  // ── Fetch: backend is the single source of truth ─────────────────────────
  // All setState calls happen inside async callbacks / event handlers, never
  // synchronously in the effect body.
  useEffect(() => {
    if (!studentId) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await recommendationService.getAcademicRecommendations(studentId, studyMinutes)
        if (cancelled) return
        setData(res?.data || null)
        // Restore the student's saved plan checkboxes for this plan snapshot
        // (keyed by assessment date — stable across refresh/navigation).
        try {
          const raw = localStorage.getItem(planStorageKey(studentId, res?.data))
          const parsed = raw ? JSON.parse(raw) : null
          setDone(sanitizeDone(parsed))
        } catch {
          setDone({})
        }
      } catch (err) {
        if (cancelled) return
        setError(
          err?.response?.data?.message ||
            'Something went wrong while loading your recommendations.'
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [studentId, studyMinutes])

  const handleMinutesChange = (minutes) => {
    setStudyMinutes(minutes) // event handler — fine to set state here
    setLoading(true)
  }

  const toggleDone = (subject, activity) => {
    setDone((prev) => {
      const key = `${subject}::${activity}`
      const next = { ...prev, [key]: !prev[key] }
      try {
        localStorage.setItem(planStorageKey(studentId, data), JSON.stringify(next))
      } catch {
        /* ignore quota errors */
      }
      return next
    })
  }

  const scrollToId = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── Derived views (pure formatting of the backend payload) ───────────────
  const allSubjects = useMemo(() => {
    const weak = data?.weakSubjects || []
    const strong = data?.strongSubjects || []
    return [...weak, ...strong].sort((a, b) => a.scorePercentage - b.scorePercentage)
  }, [data])

  const overallHistory = useMemo(() => {
    const sources = (data?.dataSources || [])
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date))
    const latestIdx = sources.map((x) => x.isLatest).lastIndexOf(true)
    const cur = sources[latestIdx] || sources[sources.length - 1] || null
    const prev = latestIdx > 0 ? sources[latestIdx - 1] : null
    const hasPrev = !!cur && !!prev && Number.isFinite(Number(prev.scorePercentage))
    return {
      sources,
      delta: hasPrev ? Math.round(Number(cur.scorePercentage) - Number(prev.scorePercentage)) : null,
      prevScore: hasPrev ? Number(prev.scorePercentage) : null,
    }
  }, [data])

  const sessions = data?.studyPlan?.sessions || []

  const planTasks = []
  sessions.forEach((session) => {
    const dist = session.distribution || {}
    planTasks.push({ subject: session.subject, activity: 'Revision', key: `${session.subject}::Revision`, minutes: dist.revision?.minutes })
    planTasks.push({ subject: session.subject, activity: 'Practice', key: `${session.subject}::Practice`, minutes: dist.practice?.minutes })
    planTasks.push({ subject: session.subject, activity: 'Quiz', key: `${session.subject}::Quiz`, minutes: dist.quiz?.minutes })
  })
  const completedTasks = planTasks.filter((t) => done[t.key]).length
  const planPct = planTasks.length ? Math.round((completedTasks / planTasks.length) * 100) : 0

  const op = data?.overallPerformance
  const summary = data?.progress?.summary || {}

  // ── Loading / error / no-assessment states ───────────────────────────────
  if (loading) {
    return (
      <div className={s.page}>
        <Header studyMinutes={studyMinutes} onMinutes={handleMinutesChange} />
        <SLoader />
      </div>
    )
  }

  if (error) {
    return (
      <div className={s.page}>
        <Header studyMinutes={studyMinutes} onMinutes={handleMinutesChange} />
        <div className={s.stateCard}>
          <div className={s.stateIcon} style={{ background: '#fee2e2', color: '#dc2626' }}>
            <FiActivity size={22} />
          </div>
          <h3 className={s.stateTitle}>Couldn't load your recommendations</h3>
          <p className={s.stateDesc}>{error}</p>
          <SBtn variant="primary" onClick={() => window.location.reload()}>Try Again</SBtn>
        </div>
      </div>
    )
  }

  if (!data?.hasAssessment) {
    return (
      <div className={s.page}>
        <Header studyMinutes={studyMinutes} onMinutes={handleMinutesChange} />
        <div className={s.stateCard}>
          <div className={s.stateIcon} style={{ background: 'var(--s-primary-l)', color: 'var(--s-primary)' }}>
            <FiTarget size={22} />
          </div>
          <h3 className={s.stateTitle}>No assessment yet</h3>
          <p className={s.stateDesc}>
            Complete the quick assessment to unlock your personalized area-of-growth plan,
            weak subjects and a daily study schedule.
          </p>
          <SBtn variant="primary" onClick={() => navigate('/student/onboarding')}>Start Assessment</SBtn>
        </div>
      </div>
    )
  }

  return (
    <div className={s.page}>
      <Header studyMinutes={studyMinutes} onMinutes={handleMinutesChange} />

      {/* ── A. Overall Performance ─────────────────────────────────────── */}
      <div className={`${s.hero} s-anim-up`}>
        <div className={s.heroLeft}>
          <div className={s.heroEyebrow}>Overall Performance</div>
          <div className={s.heroScore}>
            {fmt(op?.scorePercentage)}
            <span className={s.heroScorePct}>%</span>
          </div>
          <div className={s.heroBandRow}>
            <SBadge color={bandTheme(op?.band).badge} style={{ fontSize: 13, padding: '5px 14px' }}>
              {op?.band || '—'}
            </SBadge>
          </div>
          <p className={s.heroMessage}>
            {BAND_MESSAGE[op?.band] || 'Analysis based on your latest assessment.'}
          </p>
          <div className={s.heroDelta}>
            {overallHistory.delta != null ? (
              <>
                {overallHistory.delta >= 0 ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                <strong>{fmt(Math.abs(overallHistory.delta))}%</strong>
                {overallHistory.delta >= 0 ? ' improvement' : ' drop'} from your previous assessment
                {overallHistory.prevScore != null && (
                  <span className={s.heroPrev}> · previous {fmt(overallHistory.prevScore)}%</span>
                )}
              </>
            ) : (
              <>This is your first assessment — a baseline has been set.</>
            )}
          </div>
        </div>

        <div className={s.heroRight}>
          <div className={s.heroMetaRow}>
            <span className={s.heroMetaItem}><FiLayers size={14} /> {op?.sourceLabel || 'Assessment'}</span>
            <span className={s.heroMetaItem}><FiCalendar size={14} /> {fmtDate(op?.date)}</span>
          </div>
          <div className={s.heroChipsTitle}>Latest attempt</div>
          <div className={s.summaryChips}>
            <span className={s.sumChipUp}>Improved <strong>{summary.improved || 0}</strong></span>
            <span className={s.sumChipDown}>Regressed <strong>{summary.regressed || 0}</strong></span>
            <span className={s.sumChipNew}>New <strong>{summary.new || 0}</strong></span>
          </div>
          <Sparkline points={overallHistory.sources} />
          <div className={s.sparkCaption}>Overall score trend across attempts</div>
        </div>
      </div>

      {/* ── B. Subject-wise Analysis ───────────────────────────────────── */}
      <section className="s-anim-up s-d1">
        <SectionHead icon={<FiBarChart2 />} title="Subject-wise Analysis" subtitle="Score, band and change since your previous attempt." />
        {allSubjects.length === 0 ? (
          <div className={s.card}><p className={s.mutedText}>No subject data available yet.</p></div>
        ) : (
          <div className={s.subjectGrid}>
            {allSubjects.map((subj) => {
              const theme = bandTheme(subj.band)
              return (
                <div key={`${subj.type}-${subj.level}`} className={s.subjectCard}>
                  <div className={s.subjectTop}>
                    <span className={s.subjectName}>{subj.level}</span>
                    <SBadge color={theme.badge}>{subj.band}</SBadge>
                  </div>
                  <div className={s.subjectScore}>{fmt(subj.scorePercentage)}%</div>
                  <ProgressBar pct={subj.scorePercentage} color={theme.color} />
                  <div className={s.subjectFoot}>
                    <span className={`${s.deltaCap} ${subj.trend === 'improved' ? s.deltaCapUp : subj.trend === 'regressed' ? s.deltaCapDown : subj.trend === 'new' ? s.deltaCapNew : s.deltaCapFlat}`}>
                      {deltaCaption(subj.trend, subj.delta)}
                    </span>
                    {subj.previousScorePercentage != null && (
                      <span className={s.subjectPrev}>Previous {fmt(subj.previousScorePercentage)}%</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── C + D: Top Areas + Study Plan (two columns on wide screens) ── */}
      <div className={s.split}>

      {/* ── C. Top Areas to Improve ────────────────────────────────────── */}
      <section className="s-anim-up s-d2">
        <SectionHead icon={<FiTarget />} title="Top Areas to Improve" subtitle="Prioritized by your latest performance — weakest first." />
        {(data.weakSubjects || []).length === 0 ? (
          <div className={`${s.card} ${s.allGood}`}>
            <FiCheckCircle size={26} style={{ color: 'var(--s-green)', flexShrink: 0 }} />
            <div>
              <h3 className={s.allGoodTitle}>You have no weak subjects right now</h3>
              <p className={s.mutedText}>All assessed areas are at or above 75%. Keep up the momentum with light weekly revision.</p>
            </div>
          </div>
        ) : (
          <div className={s.weakList}>
            {(data.weakSubjects || []).map((weak, i) => {
              const theme = bandTheme(weak.band)
              const priority = priorityOf(weak.priorityWeight)
              const topics = (data.weakTopics || []).filter((t) => t.subject === weak.level)
              return (
                <div key={`${weak.type}-${weak.level}`} className={s.weakCard}>
                  <div className={s.weakRank}>{i + 1}</div>
                  <div className={s.weakBody}>
                    <div className={s.weakTitleRow}>
                      <span className={s.subjectName}>{weak.level}</span>
                      <SBadge color={theme.badge}>{weak.band}</SBadge>
                    </div>

                    <div className={s.weakStats}>
                      <div className={s.weakStat}>
                        <span className={s.weakStatLabel}>Score</span>
                        <span className={s.weakStatValue}>{fmt(weak.scorePercentage)}%</span>
                      </div>
                      <div className={s.weakStat}>
                        <span className={s.weakStatLabel}>Previous</span>
                        <span className={s.weakStatValue}>
                          {weak.previousScorePercentage != null ? `${fmt(weak.previousScorePercentage)}%` : '—'}
                        </span>
                      </div>
                      <div className={s.weakStat}>
                        <span className={s.weakStatLabel}>Change</span>
                        <TrendChip trend={weak.trend} delta={weak.delta} />
                      </div>
                      <div className={s.weakStat}>
                        <span className={s.weakStatLabel}>Priority</span>
                        <span className={s.priorityTag} style={{ background: priority.bg, color: priority.color }}>
                          {priority.label}
                        </span>
                      </div>
                    </div>

                    <div className={s.topicRow}>
                      {topics.length > 0 && <span className={s.topicLabel}>Focus topics:</span>}
                      {topics.map((t) => (
                        <span key={t.topic} className={s.topicChip} style={{ color: theme.color, background: theme.bg, borderColor: 'transparent' }}>
                          {t.topic} · {fmt(t.scorePercentage)}%
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={s.weakActions}>
                    <SBtn variant="primary" size="sm" onClick={() => scrollToId(`res-${encodeURIComponent(weak.level)}`)}>
                      Start Improving
                    </SBtn>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {data.topicsNote && <p className={s.footNote}>{data.topicsNote}</p>}
      </section>

      {/* ── D. Personalized Study Plan ─────────────────────────────────── */}
      <section id="study-plan" className="s-anim-up s-d3">
        <SectionHead icon={<FiClock />} title="Your Personalized Study Plan" subtitle="Daily minutes split by priority weight — Revision 40% / Practice 35% / Quiz 25%." />
        {sessions.length === 0 ? (
          <div className={s.card}>
            <h3 className={s.sectionCardTitle}>All clear</h3>
            <p className={s.mutedText}>{data?.studyPlan?.note || 'No subjects need extra daily focus right now.'}</p>
          </div>
        ) : (
          <>
            <div className={s.planSummary}>
              <div className={s.planSummaryItem}>
                <span className={s.planSummaryLabel}>Today's Plan</span>
                <span className={s.planSummaryValue}><FiClock size={14} /> {data?.studyPlan?.studyMinutesPerDay} min</span>
              </div>
              <div className={s.planSummaryItem}>
                <span className={s.planSummaryLabel}>Completed</span>
                <span className={s.planSummaryValue}><FiCheckSquare size={14} /> {completedTasks} / {planTasks.length}</span>
              </div>
              <div className={s.planBarWrap}>
                <div className={s.planBar}><div className={s.planBarFill} style={{ width: `${planPct}%` }} /></div>
                <span className={s.planBarLabel}>{planPct}% done</span>
              </div>
            </div>

            <div className={s.planList}>
              {sessions.map((session) => {
                const dist = session.distribution || {}
                const topics = (data.weakTopics || []).filter((t) => t.subject === session.subject).slice(0, 4)
                return (
                  <div key={session.subject} className={s.planCard}>
                    <div className={s.planHead}>
                      <div className={s.planSubjectRow}>
                        <span className={s.subjectName}>{session.subject}</span>
                        <SBadge color={bandTheme(session.band).badge}>{session.band}</SBadge>
                      </div>
                      <span className={s.minutesBadge}><FiClock size={13} /> {session.dailyMinutes} min</span>
                    </div>

                    {(data.weakTopics || []).filter((t) => t.subject === session.subject).length > 0 && (
                      <div className={s.planTopics}>
                        <span className={s.topicLabel}>Focus topics:</span>
                        <div className={s.topicRow}>
                          {topics.map((t) => (
                            <span key={t.topic} className={s.topicChip}>{t.topic}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={s.activityList}>
                      {[
                        { key: 'Revision', minutes: dist.revision?.minutes, pct: dist.revision?.percentage ?? 40, icon: <FiBookOpen />, tint: 'var(--s-blue)' },
                        { key: 'Practice', minutes: dist.practice?.minutes, pct: dist.practice?.percentage ?? 35, icon: <FiZap />, tint: 'var(--s-accent)' },
                        { key: 'Quiz', minutes: dist.quiz?.minutes, pct: dist.quiz?.percentage ?? 25, icon: <FiClipboard />, tint: 'var(--s-purple)' },
                      ].map((task) => {
                        const isDone = !!done[`${session.subject}::${task.key}`]
                        return (
                          <label key={task.key} className={`${s.activityRow} ${isDone ? s.activityDone : ''}`}>
                            <input type="checkbox" checked={isDone} onChange={() => toggleDone(session.subject, task.key)} />
                            <span className={s.activityIcon} style={{ color: task.tint }}>{task.icon}</span>
                            <span className={s.activityName}>{task.key}</span>
                            <span className={s.activityPct}>{task.pct}%</span>
                            <span className={s.activityMin}>{fmt(task.minutes)} min</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {(data?.studyPlan?.maintainSubjects || []).length > 0 && (
              <p className={s.footNote}>
                Maintain: {(data.studyPlan.maintainSubjects || []).map((m) => m.subject).join(', ')}
              </p>
            )}
          </>
        )}
      </section>

      </div>

      {/* ── E. Recommended Learning Resources ──────────────────────────── */}
      <section className="s-anim-up s-d4">
        <SectionHead icon={<FiBookOpen />} title="Recommended Learning Resources" subtitle="Revision material and practice questions for the areas that need work." />
        {(data.recommendedActivities || []).length === 0 ? (
          <div className={s.stateCard} style={{ padding: 40 }}>
            <div className={s.stateIcon} style={{ background: 'var(--s-blue-l)', color: 'var(--s-blue)' }}>
              <FiBookOpen size={22} />
            </div>
            <h3 className={s.stateTitle}>Nothing to review right now</h3>
            <p className={s.stateDesc}>No weak areas were detected, so there are no recommended resources yet.</p>
          </div>
        ) : (
          <div className={s.resGrid}>
            {(data.recommendedActivities || []).map((act) => {
              const theme = bandTheme(act.band)
              const practiceCount = (act.practiceQuestions || []).length
              return (
                <div key={`res-${act.subject}`} id={`res-${encodeURIComponent(act.subject)}`} className={s.resCard}>
                  <div className={s.resHead}>
                    <span className={s.subjectName}>{act.subject}</span>
                    <SBadge color={theme.badge}>{act.band}</SBadge>
                  </div>

                  <div className={s.resBlock}>
                    <div className={s.resBlockIcon} style={{ background: 'var(--s-blue-l)', color: 'var(--s-blue)' }}>
                      <FiBookOpen size={16} />
                    </div>
                    <div className={s.resBlockBody}>
                      <div className={s.resBlockTitle}>
                        Revision material
                        <span className={s.resBlockMeta}>{act.revisionResources?.length || 0} {act.revisionResources?.length === 1 ? 'resource' : 'resources'}</span>
                      </div>
                      {act.revisionResources?.length ? (
                        <p className={s.resBlockDesc}>{act.revisionResources[0].title}</p>
                      ) : (
                        <p className={s.resBlockDesc}>Strengthen the fundamentals of {act.subject} step by step.</p>
                      )}
                      <SBtn variant="outline" size="sm" onClick={() => scrollToId('study-plan')}>
                        Review Now
                      </SBtn>
                    </div>
                  </div>

                  <div className={s.resBlock}>
                    <div className={s.resBlockIcon} style={{ background: 'var(--s-accent-l)', color: 'var(--s-accent)' }}>
                      <FiZap size={16} />
                    </div>
                    <div className={s.resBlockBody}>
                      <div className={s.resBlockTitle}>
                        Practice questions
                        <span className={s.resBlockMeta}>{practiceCount} {practiceCount === 1 ? 'question' : 'questions'}</span>
                      </div>
                      {practiceCount ? (
                        <p className={s.resBlockDesc}>{act.practiceQuestions.slice(0, 2).map((q) => q.question).join(' · ')}</p>
                      ) : (
                        <p className={s.resBlockDesc}>No practice questions available yet.</p>
                      )}
                      <SBtn variant="outline" size="sm" onClick={() => scrollToId('study-plan')}>
                        Start Practice
                      </SBtn>
                    </div>
                  </div>

                  <div className={s.resBlock}>
                    <div className={s.resBlockIcon} style={{ background: 'var(--s-purple-l)', color: 'var(--s-purple)' }}>
                      <FiClipboard size={16} />
                    </div>
                    <div className={s.resBlockBody}>
                      <div className={s.resBlockTitle}>Quiz</div>
                      <p className={s.resBlockDesc}>Test your understanding of {act.subject} and lock in the progress.</p>
                      <SBtn variant="outline" size="sm" onClick={() => scrollToId('study-plan')}>
                        Take Quiz
                      </SBtn>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── F. Progress Tracking ───────────────────────────────────────── */}
      <section className="s-anim-up s-d5">
        <SectionHead icon={<FiActivity />} title="Your Progress" subtitle="Previous vs current performance for every measured area." />
        {(data.progress?.details || []).length === 0 ? (
          <div className={s.card}><p className={s.mutedText}>Progress will appear after your next assessment attempt.</p></div>
        ) : (
          <div className={s.progList}>
            {(data.progress?.details || []).map((d) => {
              const theme = bandTheme(d.band)
              return (
                <div key={`prog-${d.type}-${d.level}`} className={s.progRow}>
                  <div className={s.progInfo}>
                    <span className={s.progLevel}>{d.level}</span>
                    <span className={s.progSource}>{d.sourceLabel}</span>
                  </div>

                  <div className={s.progCompare}>
                    <div className={s.progCol}>
                      <span className={s.progColValue}>{d.previousScorePercentage != null ? `${fmt(d.previousScorePercentage)}%` : '—'}</span>
                      <span className={s.progColLabel}>Previous</span>
                      <ProgressBar pct={d.previousScorePercentage ?? 0} color="var(--s-text3)" />
                    </div>
                    <div className={s.progArrow}><FiArrowUp size={15} style={{ color: 'var(--s-text3)' }} /></div>
                    <div className={s.progCol}>
                      <span className={s.progColValue} style={{ color: theme.color }}>{fmt(d.currentScorePercentage)}%</span>
                      <span className={s.progColLabel}>Current</span>
                      <ProgressBar pct={d.currentScorePercentage ?? 0} color={theme.color} />
                    </div>
                  </div>

                  <div className={s.progTrend}>
                    <TrendChip trend={d.trend} delta={d.delta} />
                    <span className={s.progDeltaText}>{deltaCaption(d.trend, d.delta)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

// ── Header ─────────────────────────────────────────────────────────────────
function Header({ studyMinutes, onMinutes }) {
  return (
    <div className={s.pageHeader}>
      <div className={s.headerText}>
        <h1 className={s.pageTitle}>
          <span className={s.headerIcon}><FiTrendingUp size={19} /></span>
          Area of Growth
        </h1>
        <p className={s.pageSub}>Your personalized academic improvement journey</p>
      </div>
      <label className={s.minutesLabel}>
        Daily study time
        <select value={studyMinutes} onChange={(e) => onMinutes(Number(e.target.value))}>
          {[60, 90, 120, 150, 180, 240].map((m) => (
            <option key={m} value={m}>{m} min</option>
          ))}
        </select>
      </label>
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