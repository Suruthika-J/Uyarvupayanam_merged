import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { SBtn, SCard, SInput, SSelect, SLoader, SBadge } from '../../components/ui'
import {
  FiCalendar, FiCheckSquare, FiPlus, FiClock, FiCheck,
  FiZap, FiBookOpen, FiRefreshCw, FiUser, FiAlertCircle,
  FiEdit2, FiRepeat, FiSkipForward, FiAward, FiTarget
} from 'react-icons/fi'
import { useCollegeProfile } from '../../context/CollegeProfileContext'

export default function StudyPlannerPage() {
  const { profile } = useCollegeProfile()
  const [loading, setLoading] = useState(false)
  
  // Customization inputs
  const [availableHours, setAvailableHours] = useState('10')
  const [upcomingExams, setUpcomingExams] = useState('Data Structures Exam (in 5 days)')
  const [weakSubjects, setWeakSubjects] = useState('Database Management Systems')
  const [focusAreas, setFocusAreas] = useState(profile?.subjects?.slice(0, 3).join(', ') || 'Data Structures, DBMS, Machine Learning')

  // Schedule output & state
  const [studyPlan, setStudyPlan] = useState(null)
  const [activeDayIdx, setActiveDayIdx] = useState(0)
  const [taskStatuses, setTaskStatuses] = useState({})
  const [xpEarned, setXpEarned] = useState(0)
  const [editingTask, setEditingTask] = useState(null)

  const handleGeneratePlan = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('studentToken')
      const res = await axios.post(
        'http://localhost:5000/api/study-tools/planner',
        {
          availableHoursPerWeek: availableHours,
          upcomingExams,
          weakSubjects,
          focusAreas
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data?.success && res.data.plan) {
        setStudyPlan(res.data.plan)
        setActiveDayIdx(0)
      }
    } catch (err) {
      console.warn('Generate study plan failed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleGeneratePlan()
  }, [])

  const handleCompleteTask = async (taskId) => {
    const isCompleted = taskStatuses[taskId] === 'completed'
    const newStatus = isCompleted ? 'pending' : 'completed'

    setTaskStatuses(prev => ({ ...prev, [taskId]: newStatus }))

    if (newStatus === 'completed') {
      setXpEarned(prev => prev + 25)
      try {
        const token = localStorage.getItem('studentToken')
        await axios.post(
          'http://localhost:5000/api/study-tools/planner/complete-task',
          { taskId, minutesSpent: 45 },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } catch (err) { /* silent sync fallback */ }
    }
  }

  const handleSkipTask = (taskId) => {
    setTaskStatuses(prev => ({
      ...prev,
      [taskId]: prev[taskId] === 'skipped' ? 'pending' : 'skipped'
    }))
  }

  const handleRescheduleTask = (taskId) => {
    const newTime = prompt('Enter new rescheduled time slot (e.g. 8:30 PM - 9:30 PM):')
    if (newTime && studyPlan) {
      const updatedSchedule = [...studyPlan.schedule]
      updatedSchedule.forEach(dayObj => {
        dayObj.tasks.forEach(t => {
          if (t.id === taskId) {
            t.timeSlot = newTime
          }
        })
      })
      setStudyPlan({ ...studyPlan, schedule: updatedSchedule })
    }
  }

  const handleEditTaskTopic = (taskObj) => {
    const newTopic = prompt('Edit Task Topic:', taskObj.topic)
    if (newTopic && studyPlan) {
      const updatedSchedule = [...studyPlan.schedule]
      updatedSchedule.forEach(dayObj => {
        dayObj.tasks.forEach(t => {
          if (t.id === taskObj.id) {
            t.topic = newTopic
          }
        })
      })
      setStudyPlan({ ...studyPlan, schedule: updatedSchedule })
    }
  }

  // Calculate completion percentage
  let totalTasks = 0
  let completedCount = 0
  if (studyPlan?.schedule) {
    studyPlan.schedule.forEach(day => {
      day.tasks.forEach(t => {
        totalTasks += 1
        if (taskStatuses[t.id] === 'completed') completedCount += 1
      })
    })
  }
  const completionPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto' }} className="s-anim-up">
      
      {/* ── HEADER BANNER ── */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ede9fe', color: '#6d28d9', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            <FiZap size={14} /> AI-Powered Intelligent Study Schedule
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            Personalized Academic Study Planner
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
            Generate realistic time-slotted study routines prioritizing upcoming exams, weak subjects, and target career roadmap practice.
          </p>
        </div>

        {xpEarned > 0 && (
          <div style={{ background: '#d1fae5', color: '#047857', border: '1px solid #a7f3d0', padding: '8px 16px', borderRadius: 16, fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiAward size={18} /> +{xpEarned} XP Earned Today!
          </div>
        )}
      </div>

      {/* ── CONFIGURATION PANEL ── */}
      <SCard style={{ padding: 24, borderRadius: 20, marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiCalendar color="var(--s-primary)" /> Generate My Weekly Plan
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 18 }}>
          <SSelect
            label="Available Study Hours / Week"
            value={availableHours}
            onChange={e => setAvailableHours(e.target.value)}
            options={[
              { value: '5', label: '5 Hours / Week (Light Study)' },
              { value: '10', label: '10 Hours / Week (Standard Pace)' },
              { value: '15', label: '15 Hours / Week (Intensive Prep)' },
              { value: '20', label: '20 Hours / Week (Exam Sprint)' }
            ]}
          />

          <SInput
            label="Upcoming Exams (High Priority)"
            value={upcomingExams}
            onChange={e => setUpcomingExams(e.target.value)}
            placeholder="e.g. Data Structures Exam (in 5 days)"
          />

          <SInput
            label="Weak Subjects (Priority Focus)"
            value={weakSubjects}
            onChange={e => setWeakSubjects(e.target.value)}
            placeholder="e.g. Database Management Systems"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--s-text3)', fontWeight: 600 }}>
            Student Profile: <strong>{profile?.degreeProgramme || 'Degree Student'}</strong> ({profile?.domain || 'CS'})
          </div>

          <SBtn variant="primary" onClick={handleGeneratePlan} disabled={loading} style={{ padding: '10px 24px', borderRadius: 14, fontSize: 14 }}>
            <FiRefreshCw size={15} style={{ marginRight: 6 }} /> Generate My Weekly Plan
          </SBtn>
        </div>
      </SCard>

      {/* ── PLAN STATS & DAILY SCHEDULE ── */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <SLoader label="Generating realistic time-slotted study schedule..." />
        </div>
      ) : studyPlan ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* SUMMARY OVERVIEW CARD */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#fff', padding: '24px 30px', borderRadius: 22,
            boxShadow: '0 10px 25px rgba(0,0,0,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                Active Personalized Study Plan
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: '2px 0 6px', color: '#fff' }}>
                {studyPlan.title}
              </h2>
              <p style={{ fontSize: 14, color: '#94a3b8', margin: 0, maxWidth: 650, lineHeight: 1.5 }}>
                {studyPlan.overview}
              </p>
            </div>

            <div style={{ width: 220 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: '#38bdf8', marginBottom: 6 }}>
                <span>Weekly Task Completion</span>
                <span>{completionPercent}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', height: 10, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${completionPercent}%`, height: '100%', background: '#34d399', transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, textAlign: 'right', fontWeight: 700 }}>
                {completedCount} of {totalTasks} Tasks Done
              </div>
            </div>
          </div>

          {/* DAY SELECTION TABS */}
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {studyPlan.schedule?.map((dayObj, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveDayIdx(idx)}
                style={{
                  padding: '10px 20px', borderRadius: 16, fontSize: 13, fontWeight: 800,
                  border: activeDayIdx === idx ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                  background: activeDayIdx === idx ? 'var(--s-primary)' : '#fff',
                  color: activeDayIdx === idx ? '#fff' : 'var(--s-text2)',
                  cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap'
                }}
              >
                {dayObj.day} ({dayObj.tasks?.length || 0} Sessions)
              </button>
            ))}
          </div>

          {/* ACTIVE DAY TIME-SLOTTED TASKS */}
          {studyPlan.schedule?.[activeDayIdx] && (
            <SCard style={{ padding: 28, borderRadius: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                    📅 {studyPlan.schedule[activeDayIdx].day} Schedule
                  </h3>
                  <span style={{ fontSize: 13, color: 'var(--s-text3)', fontWeight: 600 }}>
                    Target Allocation: {studyPlan.schedule[activeDayIdx].dailyTargetHours}
                  </span>
                </div>
                <SBadge color="blue">{studyPlan.schedule[activeDayIdx].tasks?.length} Time Slots</SBadge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {studyPlan.schedule[activeDayIdx].tasks?.map((task) => {
                  const status = taskStatuses[task.id] || task.status || 'pending'
                  const isDone = status === 'completed'
                  const isSkipped = status === 'skipped'

                  return (
                    <div
                      key={task.id}
                      style={{
                        padding: '18px 22px', borderRadius: 16,
                        background: isDone ? '#ecfdf5' : isSkipped ? '#f1f5f9' : '#fff',
                        border: isDone ? '1px solid #a7f3d0' : isSkipped ? '1px solid #cbd5e1' : '1px solid var(--s-border)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 260 }}>
                        <div style={{
                          padding: '6px 12px', borderRadius: 12, fontSize: 12, fontWeight: 900,
                          background: task.priority === 'HIGH' ? '#fef3c7' : '#e0f2fe',
                          color: task.priority === 'HIGH' ? '#b45309' : '#0369a1',
                          whiteSpace: 'nowrap'
                        }}>
                          ⏰ {task.timeSlot}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 15, fontWeight: 900, color: isDone ? '#047857' : 'var(--s-text)', textDecoration: isDone ? 'line-through' : 'none' }}>
                              {task.subject}
                            </span>
                            <span style={{
                              fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 8,
                              background: task.category === 'Exam Prep' ? '#fee2e2' : task.category === 'Weak Subject' ? '#fef3c7' : '#dbeafe',
                              color: task.category === 'Exam Prep' ? '#991b1b' : task.category === 'Weak Subject' ? '#92400e' : '#1e40af'
                            }}>
                              {task.category}
                            </span>
                          </div>

                          <div style={{ fontSize: 13, color: isDone ? '#065f46' : 'var(--s-text2)', fontWeight: 600 }}>
                            {task.topic}
                          </div>
                        </div>
                      </div>

                      {/* TASK ACTION BUTTONS */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Complete Button */}
                        <button
                          type="button"
                          onClick={() => handleCompleteTask(task.id)}
                          style={{
                            background: isDone ? '#047857' : '#fff',
                            color: isDone ? '#fff' : '#047857',
                            border: '1px solid #047857', padding: '6px 14px', borderRadius: 10,
                            fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                          }}
                        >
                          <FiCheck size={14} /> {isDone ? '✓ Completed' : 'Complete'}
                        </button>

                        {/* Reschedule Button */}
                        <button
                          type="button"
                          onClick={() => handleRescheduleTask(task.id)}
                          title="Reschedule Time Slot"
                          style={{
                            background: 'var(--s-surface2)', border: '1px solid var(--s-border)',
                            color: 'var(--s-text2)', padding: '6px 10px', borderRadius: 10,
                            fontSize: 12, fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          <FiRepeat size={14} /> Reschedule
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleEditTaskTopic(task)}
                          title="Edit Topic"
                          style={{
                            background: 'var(--s-surface2)', border: '1px solid var(--s-border)',
                            color: 'var(--s-text2)', padding: '6px 10px', borderRadius: 10,
                            fontSize: 12, fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          <FiEdit2 size={14} />
                        </button>

                        {/* Skip Button */}
                        <button
                          type="button"
                          onClick={() => handleSkipTask(task.id)}
                          title="Skip Task"
                          style={{
                            background: isSkipped ? '#f1f5f9' : '#fff', border: '1px solid var(--s-border)',
                            color: isSkipped ? '#64748b' : 'var(--s-text3)', padding: '6px 10px', borderRadius: 10,
                            fontSize: 12, fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          <FiSkipForward size={14} /> {isSkipped ? 'Skipped' : 'Skip'}
                        </button>
                      </div>

                    </div>
                  )
                })}
              </div>
            </SCard>
          )}

        </div>
      ) : null}
    </div>
  )
}
