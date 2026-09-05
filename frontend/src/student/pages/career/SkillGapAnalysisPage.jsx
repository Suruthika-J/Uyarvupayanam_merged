import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SCard, SSelect, SBtn, SLoader, SBadge } from '../../components/ui'
import {
  FiZap, FiCheckCircle, FiAlertCircle, FiPlusCircle,
  FiArrowRight, FiUser, FiTarget, FiTrendingUp, FiLayers
} from 'react-icons/fi'
import { useCollegeProfile } from '../../context/CollegeProfileContext'
import axios from 'axios'

const CAREER_TARGETS = [
  'Software Engineer', 'Software Developer', 'Data Scientist',
  'Machine Learning Engineer', 'Artificial Intelligence Engineer',
  'Data Analyst', 'Robotics Engineer', 'Mechanical Engineer',
  'Aerospace Engineer', 'Electrical Engineer', 'Civil Engineer',
  'Biomedical Engineer', 'Computer Hardware Engineer'
]

export default function SkillGapAnalysisPage() {
  const navigate = useNavigate()
  const { profile } = useCollegeProfile()

  const [loading, setLoading] = useState(true)
  const [targetRole, setTargetRole] = useState('')
  const [readinessScore, setReadinessScore] = useState(0)
  const [skills, setSkills] = useState({ strong: [], developing: [], missing: [] })
  const [updating, setUpdating] = useState(false)
  const [baselineData, setBaselineData] = useState(null)

  const fetchSkillGap = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('studentToken')
      const res = await axios.get('http://localhost:5000/api/college-advisor/skill-gap', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data?.success) {
        setTargetRole(res.data.targetCareer || profile?.specialization || profile?.domain || 'Domain Specialist')
        setReadinessScore(res.data.readinessScore || 0)
        setSkills(res.data.skills || { strong: [], developing: [], missing: [] })
        setBaselineData(res.data.baselineAssessment || null)
      }
    } catch (err) {
      console.warn('Failed to load live skill gap analysis:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSkillGap()
  }, [])

  const handleTargetRoleChange = async (newRole) => {
    setTargetRole(newRole)
    setUpdating(true)
    try {
      const token = localStorage.getItem('studentToken')
      await axios.post(
        'http://localhost:5000/api/college-advisor/target-career',
        { targetCareer: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      await fetchSkillGap()
    } catch (err) {
      alert('Failed to update target career.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <SLoader />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text3)' }}>
          Computing career skill telemetry & evaluating skill gap matrix...
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto' }} className="s-anim-up">

      {/* HEADER BAR */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            <FiZap size={14} /> AI Skill Telemetry Gap Engine
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            Target Career Skill Gap Analysis
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
            Compare your acquired competencies against required career skills (Core, Advanced, Optional).
          </p>
        </div>

        <div style={{ width: 280 }}>
          <SSelect
            label="Target Role Selection"
            value={targetRole}
            onChange={e => handleTargetRoleChange(e.target.value)}
            disabled={updating}
            options={CAREER_TARGETS.map(c => ({ value: c, label: c }))}
          />
        </div>
      </div>

      {/* PROFILE & READINESS SCORE BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
        color: '#fff', padding: '24px 28px', borderRadius: 20, marginBottom: 28,
        boxShadow: '0 8px 24px rgba(4,120,87,0.18)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#a7f3d0', textTransform: 'uppercase' }}>
            Target Career Objective
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiTarget /> {targetRole}
          </div>
          <div style={{ fontSize: 13, color: '#d1fae5', marginTop: 4 }}>
            Student Profile: <strong>{profile?.degreeProgramme || 'Degree Student'}</strong> ({profile?.domain || profile?.field || 'General'})
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '16px 24px', borderRadius: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#a7f3d0' }}>Target Readiness Score</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginTop: 2 }}>{readinessScore}%</div>
          <div style={{ fontSize: 11, color: '#d1fae5', fontWeight: 700 }}>Career Competency Match</div>
        </div>
      </div>

      {/* ASSESSED KNOWLEDGE BASELINE SUMMARY */}
      {baselineData?.currentBaseline && (
        <SCard style={{ padding: 20, borderRadius: 18, marginBottom: 28, borderLeft: '5px solid #0284c7' }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#0369a1', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiLayers size={16} /> Demonstrated Step 7 Assessment Baseline
          </div>
          <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
            {baselineData.currentBaseline}
          </div>
        </SCard>
      )}

      {/* 3-COLUMN SKILL MATRIX */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 22, marginBottom: 28 }} className="s-grid-1col">

        {/* 1. STRONG SKILLS (ACQUIRED) */}
        <SCard style={{ padding: 24, borderRadius: 20, borderTop: '4px solid #047857' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 900, color: '#047857' }}>
              <FiCheckCircle size={18} /> Strong Skills (Acquired)
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, background: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: 10 }}>
              {skills.strong.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {skills.strong.length > 0 ? skills.strong.map((s, idx) => (
              <div key={idx} style={{ padding: 12, borderRadius: 12, background: '#d1fae5', color: '#047857', fontWeight: 700, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>✓ {s.name}</span>
                  <span style={{ fontSize: 11, opacity: 0.85 }}>{s.type}</span>
                </div>
              </div>
            )) : (
              <div style={{ fontSize: 13, color: 'var(--s-text3)', padding: 10 }}>
                No core skills matched yet. Complete learning modules to build skills.
              </div>
            )}
          </div>
        </SCard>

        {/* 2. DEVELOPING SKILLS */}
        <SCard style={{ padding: 24, borderRadius: 20, borderTop: '4px solid #b45309' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 900, color: '#b45309' }}>
              <FiAlertCircle size={18} /> Developing Skills
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 10 }}>
              {skills.developing.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {skills.developing.length > 0 ? skills.developing.map((s, idx) => (
              <div key={idx} style={{ padding: 12, borderRadius: 12, background: '#fef3c7', color: '#b45309', fontWeight: 700, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>⚡ {s.name}</span>
                  <span style={{ fontSize: 11, opacity: 0.85 }}>{s.type}</span>
                </div>
              </div>
            )) : (
              <div style={{ fontSize: 13, color: 'var(--s-text3)', padding: 10 }}>
                No developing skills flagged.
              </div>
            )}
          </div>
        </SCard>

        {/* 3. MISSING SKILLS */}
        <SCard style={{ padding: 24, borderRadius: 20, borderTop: '4px solid #6d28d9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 900, color: '#6d28d9' }}>
              <FiPlusCircle size={18} /> Missing Skills (To Learn)
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: 10 }}>
              {skills.missing.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {skills.missing.length > 0 ? skills.missing.map((s, idx) => (
              <div key={idx} style={{ padding: 12, borderRadius: 12, background: '#ede9fe', color: '#6d28d9', fontWeight: 700, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>+ {s.name}</span>
                  <span style={{ fontSize: 11, opacity: 0.85 }}>{s.type}</span>
                </div>
              </div>
            )) : (
              <div style={{ fontSize: 13, color: '#047857', fontWeight: 700, padding: 10 }}>
                ✓ No skill gaps! All required skills acquired.
              </div>
            )}
          </div>
        </SCard>

      </div>

      {/* FOOTER CTA TO ROADMAP */}
      <div style={{ background: '#fff', padding: 24, borderRadius: 20, border: '1px solid var(--s-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)' }}>
            Bridge your skill gap with a structured Learning Roadmap
          </div>
          <div style={{ fontSize: 13, color: 'var(--s-text3)', marginTop: 2 }}>
            Access curated courses, certifications, hands-on projects, and interview preparation for {targetRole}.
          </div>
        </div>

        <SBtn variant="primary" onClick={() => navigate('/college/academic/roadmap')} style={{ padding: '12px 24px', borderRadius: 14, fontSize: 14 }}>
          Proceed to Learning Roadmap <FiArrowRight style={{ marginLeft: 6 }} />
        </SBtn>
      </div>

    </div>
  )
}
