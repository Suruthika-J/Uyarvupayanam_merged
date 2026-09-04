import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { SCard, SBtn, SLoader, SBadge } from '../../components/ui'
import {
  FiTarget, FiCheckCircle, FiCircle, FiArrowRight, FiAward,
  FiBriefcase, FiBookOpen, FiCode, FiZap, FiCheck
} from 'react-icons/fi'
import axios from 'axios'

export default function LearningRoadmapPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [targetCareer, setTargetCareer] = useState('')
  const [milestones, setMilestones] = useState([])
  const [completedSteps, setCompletedSteps] = useState([])

  const fetchRoadmap = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('studentToken')
      const res = await axios.get('http://localhost:5000/api/college-advisor/roadmap', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.data?.success) {
        setTargetCareer(res.data.targetCareer || 'Software Engineer')
        setMilestones(res.data.milestones || [])
      }
    } catch (err) {
      console.warn('Failed to load live target roadmap:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoadmap()
  }, [])

  const toggleMilestoneComplete = (idx) => {
    setMilestones(prev => {
      const updated = [...prev]
      const currentStatus = updated[idx].defaultStatus || updated[idx].status || 'upcoming'
      if (currentStatus === 'completed') {
        updated[idx].status = 'upcoming'
        updated[idx].defaultStatus = 'upcoming'
      } else {
        updated[idx].status = 'completed'
        updated[idx].defaultStatus = 'completed'
      }
      return updated
    })
  }

  const completedCount = milestones.filter(m => (m.status || m.defaultStatus) === 'completed').length
  const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0

  if (loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <SLoader />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text3)' }}>
          Generating dynamic learning roadmap for your Target Career...
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto' }} className="s-anim-up">

      {/* HEADER SECTION */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#d1fae5', color: '#047857', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          <FiTarget size={14} /> Career Milestone Roadmap
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
          Target Career Learning Roadmap
        </h1>
        <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
          Step-by-step learning trajectory from college coursework to placement as <strong>{targetCareer}</strong>.
        </p>
      </div>

      {/* TARGET CAREER & ROADMAP PROGRESS BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#fff', padding: '26px 32px', borderRadius: 24, marginBottom: 32,
        boxShadow: '0 10px 30px rgba(0,0,0,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
            Active Career Goal
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginTop: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiTarget color="#34d399" /> {targetCareer}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
            Milestone Progress: {completedCount} of {milestones.length} Phases Completed
          </div>
        </div>

        <div style={{ width: 220 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: '#38bdf8', marginBottom: 6 }}>
            <span>Roadmap Completion</span>
            <span>{progressPercent}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', height: 10, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: '#34d399', transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </div>

      {/* MILESTONE CARDS STACK */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginBottom: 32 }}>
        {milestones.map((m, idx) => {
          const status = m.status || m.defaultStatus || (idx === 0 ? 'completed' : idx === 1 ? 'current' : 'upcoming')
          const isDone = status === 'completed'
          const isCurrent = status === 'current' || status === 'in_progress'

          const IconComp = idx === 0 ? FiBookOpen : idx === 1 ? FiCode : idx === 2 ? FiBriefcase : FiAward

          return (
            <SCard
              key={idx}
              style={{
                padding: 26, borderRadius: 22,
                borderLeft: isDone ? '6px solid #047857' : isCurrent ? '6px solid var(--s-primary)' : '1px solid var(--s-border)',
                background: isCurrent ? '#f0fdf4' : '#fff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: isDone ? '#047857' : isCurrent ? 'var(--s-primary)' : '#64748b' }}>
                  {m.phase || `Phase ${idx + 1}`}
                </span>

                <button
                  type="button"
                  onClick={() => toggleMilestoneComplete(idx)}
                  style={{
                    fontSize: 12, fontWeight: 800, padding: '5px 14px', borderRadius: 14, border: 'none',
                    background: isDone ? '#d1fae5' : isCurrent ? '#dbeafe' : '#f1f5f9',
                    color: isDone ? '#047857' : isCurrent ? '#1e40af' : '#64748b',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                  }}
                >
                  {isDone ? <><FiCheckCircle size={14} /> ✓ Completed (Click to Toggle)</> : isCurrent ? '⚡ In Active Progress' : '⏳ Mark as Completed'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 14,
                  background: isDone ? '#047857' : isCurrent ? 'var(--s-primary)' : '#f1f5f9',
                  color: isDone || isCurrent ? '#fff' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <IconComp size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: 19, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 4px' }}>{m.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: 0, lineHeight: 1.5 }}>{m.description}</p>
                </div>
              </div>

              {/* Items & Resources */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 16, borderTop: '1px solid var(--s-border)' }}>
                {(m.items || []).map((item, iIdx) => (
                  <span key={iIdx} style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 10, background: '#fff', border: '1px solid var(--s-border)', color: 'var(--s-text)' }}>
                    • {item}
                  </span>
                ))}
              </div>
            </SCard>
          )
        })}
      </div>

      {/* QUICK LINKS TO COURSES, PROJECTS & ASSESSMENTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }} className="s-grid-1col">
        <Link to="/college/study-tools/practice" style={{ textDecoration: 'none' }}>
          <SCard style={{ padding: 20, borderRadius: 16, textAlign: 'center', cursor: 'pointer' }}>
            <FiZap size={22} color="var(--s-primary)" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text)' }}>Practice & Assessment</div>
            <div style={{ fontSize: 12, color: 'var(--s-text3)', marginTop: 4 }}>Test your skills with domain questions</div>
          </SCard>
        </Link>

        <Link to="/college/career/skill-gap" style={{ textDecoration: 'none' }}>
          <SCard style={{ padding: 20, borderRadius: 16, textAlign: 'center', cursor: 'pointer' }}>
            <FiTarget size={22} color="#047857" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text)' }}>Skill Gap Matrix</div>
            <div style={{ fontSize: 12, color: 'var(--s-text3)', marginTop: 4 }}>Review acquired vs missing skills</div>
          </SCard>
        </Link>

        <Link to="/college/advisor" style={{ textDecoration: 'none' }}>
          <SCard style={{ padding: 20, borderRadius: 16, textAlign: 'center', cursor: 'pointer' }}>
            <FiAward size={22} color="#b45309" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text)' }}>Explore Other Careers</div>
            <div style={{ fontSize: 12, color: 'var(--s-text3)', marginTop: 4 }}>Re-evaluate profile recommendations</div>
          </SCard>
        </Link>
      </div>

    </div>
  )
}
