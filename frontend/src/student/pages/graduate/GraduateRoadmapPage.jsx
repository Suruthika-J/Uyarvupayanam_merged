import React, { useState, useEffect } from 'react'
import {
  FiTarget, FiCheckCircle, FiClock, FiCalendar,
  FiAward, FiArrowRight, FiBookOpen, FiCode, FiFileText, FiSend
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import graduateService from '../../../services/graduateService'

const DEFAULT_PHASES = [
  {
    phaseNumber: 1,
    title: 'Core Foundation & Skill Bridge',
    weeks: 'Weeks 1 - 4',
    icon: FiBookOpen,
    color: '#2563eb',
    milestones: [
      'Master fundamental language / technical concepts (Data Structures, OOP, SQL)',
      'Set up developer environment & Version Control (Git, GitHub profile, SSH)',
      'Complete 20+ foundational practice problems',
      'Understand API fundamentals & clean code patterns'
    ],
    deliverable: 'Clean GitHub repository with documented foundation exercises'
  },
  {
    phaseNumber: 2,
    title: 'Hands-on Projects & Tools Mastery',
    weeks: 'Weeks 5 - 8',
    icon: FiCode,
    color: '#7c3aed',
    milestones: [
      'Build Capstone Project #1 (Full-stack or Data Analytics Dashboard)',
      'Integrate real-world database & REST APIs with error handling',
      'Dockerize your application and deploy live on cloud (Vercel / Render / AWS free tier)',
      'Write clear README with architecture diagrams and live demo links'
    ],
    deliverable: '2 live deployed production-grade projects on GitHub'
  },
  {
    phaseNumber: 3,
    title: 'Resume, Portfolio & ATS Optimization',
    weeks: 'Weeks 9 - 10',
    icon: FiFileText,
    color: '#059669',
    milestones: [
      'Revamp Resume to single-column ATS-compliant format with action verbs',
      'Quantify project achievements with metrics (% speedup, volume handled, users served)',
      'Complete LinkedIn profile optimization with featured projects and headline',
      'Prepare 2-minute elevator pitch and personal portfolio site'
    ],
    deliverable: 'Audited ATS-friendly resume and active LinkedIn profile'
  },
  {
    phaseNumber: 4,
    title: 'Job Applications & Interview Sprints',
    weeks: 'Weeks 11 - 12',
    icon: FiSend,
    color: '#ea580c',
    milestones: [
      'Target 15 tailored applications per week across LinkedIn, Wellfound & Naukri',
      'Reach out directly to engineering managers & alumni with custom notes',
      'Conduct 3 timed mock technical interviews (DSA & core domains)',
      'Master STAR method responses for HR behavioral questions'
    ],
    deliverable: 'Daily application pipeline & active interview rounds'
  }
]

export default function GraduateRoadmapPage() {
  const [loading, setLoading] = useState(true)
  const [targetRole, setTargetRole] = useState('Software Engineer')
  const [phases, setPhases] = useState(DEFAULT_PHASES)
  const [completedMilestones, setCompletedMilestones] = useState({})

  useEffect(() => {
    // Load local stored progress if any
    const saved = localStorage.getItem('graduate_roadmap_progress')
    if (saved) {
      try {
        setCompletedMilestones(JSON.parse(saved))
      } catch (e) {}
    }
    fetchRoadmap()
  }, [])

  const fetchRoadmap = async () => {
    try {
      setLoading(true)
      const res = await graduateService.getRoadmap()
      if (res.success && res.phases && res.phases.length > 0) {
        setPhases(res.phases)
        if (res.targetRole) setTargetRole(res.targetRole)
      }
    } catch (err) {
      console.error('Failed to load graduate roadmap:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleMilestone = (key) => {
    setCompletedMilestones((prev) => {
      const updated = { ...prev, [key]: !prev[key] }
      localStorage.setItem('graduate_roadmap_progress', JSON.stringify(updated))
      return updated
    })
  }

  // Calculate total milestones & progress
  let totalMilestones = 0
  let doneCount = 0
  phases.forEach((p, pIdx) => {
    p.milestones.forEach((_, mIdx) => {
      totalMilestones++
      if (completedMilestones[`${pIdx}-${mIdx}`]) doneCount++
    })
  })
  const progressPercent = totalMilestones > 0 ? Math.round((doneCount / totalMilestones) * 100) : 0

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        borderRadius: 16, padding: '28px 32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)'
      }}>
        <div style={{ maxWidth: 680 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a5b4fc', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FiTarget size={16} /> 12-Week Career Transition Blueprint
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 8px', color: '#fff' }}>
            Roadmap to {targetRole}
          </h1>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: 14, lineHeight: 1.5 }}>
            A rigorous, structured path designed for college degree holders to transition into high-paying professional roles.
          </p>
        </div>

        {/* Progress Tracker Widget */}
        <div style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 14, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#a5b4fc', fontWeight: 600, textTransform: 'uppercase' }}>Blueprint Completion</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: progressPercent >= 60 ? '#10b981' : '#38bdf8' }}>
              {progressPercent}%
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              {doneCount} of {totalMilestones} Milestones Achieved
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Phases */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {phases.map((phase, pIdx) => {
          const PhaseIcon = phase.icon || FiTarget
          const phaseColor = phase.color || '#2563eb'

          return (
            <div
              key={pIdx}
              style={{
                background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
                padding: 26, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', position: 'relative'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: `${phaseColor}15`, color: phaseColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: 18
                  }}>
                    {phase.phaseNumber || pIdx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: phaseColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Phase {phase.phaseNumber || pIdx + 1} • {phase.weeks}
                    </div>
                    <h3 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                      {phase.title}
                    </h3>
                  </div>
                </div>

                {phase.deliverable && (
                  <div style={{
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: 8, padding: '6px 12px', fontSize: 12,
                    color: '#475569', display: 'flex', alignItems: 'center', gap: 6
                  }}>
                    <FiAward size={14} color={phaseColor} />
                    <strong>Deliverable:</strong> {phase.deliverable}
                  </div>
                )}
              </div>

              {/* Milestones checklist */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 10 }}>
                {phase.milestones.map((milestone, mIdx) => {
                  const key = `${pIdx}-${mIdx}`
                  const isDone = !!completedMilestones[key]

                  return (
                    <div
                      key={mIdx}
                      onClick={() => toggleMilestone(key)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                        padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                        background: isDone ? '#f0fdf4' : '#f8fafc',
                        border: `1px solid ${isDone ? '#bbf7d0' : '#e2e8f0'}`,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {}}
                        style={{ marginTop: 3, cursor: 'pointer', accentColor: '#16a34a' }}
                      />
                      <span style={{
                        fontSize: 13.5, lineHeight: 1.4,
                        color: isDone ? '#15803d' : '#334155',
                        textDecoration: isDone ? 'line-through' : 'none',
                        fontWeight: isDone ? 600 : 500
                      }}>
                        {milestone}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Navigation */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#fff', borderRadius: 14, padding: '18px 24px', border: '1px solid #e2e8f0'
      }}>
        <div style={{ fontSize: 14, color: '#64748b' }}>
          Need specialized projects for Phase 2? Check out high-demand portfolio concepts.
        </div>
        <Link
          to="/graduate/upskilling"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#0f172a', color: '#fff', textDecoration: 'none',
            padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700
          }}
        >
          Explore Portfolio Projects <FiArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
