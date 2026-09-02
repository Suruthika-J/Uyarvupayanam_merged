import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { SBtn, SCard, SInput, SSelect, SLoader } from '../../components/ui'
import { FiCalendar, FiCheckSquare, FiPlus, FiClock, FiCheck, FiZap, FiBookOpen, FiRefreshCw } from 'react-icons/fi'

export default function StudyPlannerPage() {
  const [loading, setLoading] = useState(false)
  const [planType, setPlanType] = useState('Weekly')
  const [timePerDay, setTimePerDay] = useState('2 Hours')
  const [targetGoal, setTargetGoal] = useState('Exam Prep & Skill Building')
  const [focusAreas, setFocusAreas] = useState('Data Structures, Domain Core Subjects, Industry Projects')

  const [studyPlan, setStudyPlan] = useState(null)
  const [completedTasks, setCompletedTasks] = useState({})

  const handleGeneratePlan = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('studentToken')
      const res = await axios.post(
        'http://localhost:5000/api/study-tools/planner',
        { timePerDay, targetGoal, focusAreas, planType },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data?.success && res.data.plan) {
        setStudyPlan(res.data.plan)
      }
    } catch (err) {
      console.warn('Generate plan failed', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleGeneratePlan()
  }, [])

  const toggleTask = (taskKey) => {
    setCompletedTasks(prev => ({ ...prev, [taskKey]: !prev[taskKey] }))
  }

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ede9fe', color: '#6d28d9', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            <FiZap size={14} /> AI-Powered Academic Schedule
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            Personalized Study Planner
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
            Generate and track adaptive daily & weekly study routines tailored to your degree and available time.
          </p>
        </div>

        <SBtn variant="primary" onClick={handleGeneratePlan} disabled={loading} style={{ borderRadius: 12 }}>
          <FiRefreshCw size={15} style={{ marginRight: 6 }} /> Regenerate Plan
        </SBtn>
      </div>

      {/* Configuration Controls */}
      <SCard style={{ padding: 24, borderRadius: 20, marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 16px' }}>
          Customize Your Learning Schedule
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <SSelect
            label="Schedule Type"
            value={planType}
            onChange={e => setPlanType(e.target.value)}
            options={[
              { value: 'Daily', label: 'Daily Intensive Plan' },
              { value: 'Weekly', label: 'Weekly Semester Plan' },
              { value: 'Exam Prep', label: 'Exam Sprint Preparation' }
            ]}
          />

          <SSelect
            label="Daily Study Time Available"
            value={timePerDay}
            onChange={e => setTimePerDay(e.target.value)}
            options={[
              { value: '1 Hour', label: '1 Hour / Day (Light)' },
              { value: '2 Hours', label: '2 Hours / Day (Standard)' },
              { value: '4 Hours', label: '4 Hours / Day (Intensive)' },
              { value: '6 Hours', label: '6 Hours / Day (Exam Sprint)' }
            ]}
          />

          <SInput
            label="Focus Areas / Core Subjects"
            value={focusAreas}
            onChange={e => setFocusAreas(e.target.value)}
            placeholder="e.g. Data Structures, Python, GATE"
          />
        </div>
      </SCard>

      {/* Plan Render Output */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <SLoader label="Generating your custom AI study plan..." />
        </div>
      ) : studyPlan ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <SCard style={{ padding: 24, borderRadius: 20, background: 'linear-gradient(135deg,#047857 0%,#065f46 100%)', color: '#fff' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#a7f3d0', textTransform: 'uppercase' }}>Current Plan Overview</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: '4px 0 8px', color: '#fff' }}>{studyPlan.title}</h2>
            <p style={{ fontSize: 14, color: '#d1fae5', margin: 0, lineHeight: 1.6 }}>{studyPlan.overview}</p>
          </SCard>

          {/* Schedule Sessions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {studyPlan.schedule?.map((session, idx) => (
              <SCard key={idx} style={{ padding: 20, borderRadius: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-primary)' }}>{session.day}</span>
                  <span style={{ fontSize: 11, background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 8, fontWeight: 700 }}>
                    ⏱ {session.duration}
                  </span>
                </div>

                <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 12px' }}>
                  {session.topic}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {session.tasks?.map((task, tIdx) => {
                    const taskKey = `${idx}-${tIdx}`
                    const isDone = completedTasks[taskKey]
                    return (
                      <div
                        key={tIdx}
                        onClick={() => toggleTask(taskKey)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10,
                          background: isDone ? '#d1fae5' : '#f8fafc', border: '1px solid var(--s-border)',
                          cursor: 'pointer', transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ width: 20, height: 20, borderRadius: 6, border: isDone ? '2px solid #047857' : '2px solid #cbd5e1', background: isDone ? '#047857' : '#fff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>
                          {isDone && '✓'}
                        </div>
                        <span style={{ fontSize: 13, color: isDone ? '#047857' : 'var(--s-text)', textDecoration: isDone ? 'line-through' : 'none', fontWeight: 600 }}>
                          {task}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {session.learningGoal && (
                  <div style={{ fontSize: 11, color: '#64748b', background: '#f8fafc', padding: 8, borderRadius: 8, fontWeight: 700 }}>
                    🎯 Goal: {session.learningGoal}
                  </div>
                )}
              </SCard>
            ))}
          </div>

        </div>
      ) : null}
    </div>
  )
}
