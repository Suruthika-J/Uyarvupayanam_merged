import React, { useState, useEffect } from 'react'
import {
  FiTarget, FiCheckCircle, FiClock, FiCalendar,
  FiAward, FiArrowRight, FiBookOpen, FiCode, FiFileText, FiSend, FiHelpCircle
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import graduateService from '../../../services/graduateService'
import {
  generatePersonalizedCareers,
  generatePersonalizedRoadmap,
  getEffectiveAcademicHierarchy
} from '../../services/graduatePersonalizationEngine'

export default function GraduateRoadmapPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({})
  const [completedTasks, setCompletedTasks] = useState({})

  useEffect(() => {
    const saved = localStorage.getItem('graduate_roadmap_tasks')
    if (saved) {
      try { setCompletedTasks(JSON.parse(saved)) } catch (e) {}
    }
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await graduateService.getProfile()
      if (res.success && res.profile) setProfile(res.profile)
    } catch (err) {
      console.error('Failed to load profile for roadmap:', err)
    } finally {
      setLoading(false)
    }
  }

  const academic = getEffectiveAcademicHierarchy(profile)
  const careers = generatePersonalizedCareers(profile)
  const topCareer = careers[0]
  const roadmapPhases = generatePersonalizedRoadmap(profile, topCareer?.title)

  const toggleTask = (key) => {
    setCompletedTasks(prev => {
      const updated = { ...prev, [key]: !prev[key] }
      localStorage.setItem('graduate_roadmap_tasks', JSON.stringify(updated))
      return updated
    })
  }

  const totalTasks = roadmapPhases.reduce((acc, p) => acc + p.tasks.length, 0)
  const completedCount = Object.values(completedTasks).filter(Boolean).length
  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 16, padding: '28px 32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FiTarget size={16} /> PROFILE-DRIVEN LEARNING & PLACEMENT ROADMAP
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 8px', color: '#fff' }}>
            Roadmap to {topCareer?.title || 'Target Role'}
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>
            Tailored 4-Phase milestone path customized for your <strong>{academic.fullHierarchyText}</strong> degree.
          </p>
        </div>

        {/* Progress Card */}
        <div style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 14, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Roadmap Milestones</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#38bdf8' }}>
              {completedCount} / {totalTasks} Tasks ({progressPct}%)
            </div>
          </div>
        </div>
      </div>

      {/* 4 Phases Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {roadmapPhases.map((phase) => (
          <div
            key={phase.phaseNumber}
            style={{
              background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
              padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 800, background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: 20 }}>
                  {phase.duration}
                </span>
                <h3 style={{ margin: '8px 0 4px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  {phase.title}
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                  {phase.description}
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
              {phase.tasks.map((taskText, tIdx) => {
                const key = `p${phase.phaseNumber}-t${tIdx}`
                const isDone = !!completedTasks[key]

                return (
                  <div
                    key={key}
                    onClick={() => toggleTask(key)}
                    style={{
                      background: isDone ? '#f0fdf4' : '#f8fafc',
                      border: isDone ? '1px solid #86efac' : '1px solid #e2e8f0',
                      padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s'
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: 5,
                      border: isDone ? '2px solid #16a34a' : '2px solid #cbd5e1',
                      background: isDone ? '#16a34a' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12
                    }}>
                      {isDone && '✓'}
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: isDone ? '#15803d' : '#334155', textDecoration: isDone ? 'line-through' : 'none' }}>
                      {taskText}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
