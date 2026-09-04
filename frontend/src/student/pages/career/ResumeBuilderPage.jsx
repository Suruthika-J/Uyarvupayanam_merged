import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { SCard, SBtn, SLoader, SInput, SBadge } from '../../components/ui'
import { FiFileText, FiDownload, FiCheckCircle, FiZap, FiPlus, FiUser, FiEdit3 } from 'react-icons/fi'
import { useCollegeProfile } from '../../context/CollegeProfileContext'

export default function ResumeBuilderPage() {
  const { profile } = useCollegeProfile()
  const [loading, setLoading] = useState(true)
  const [resumeData, setResumeData] = useState(null)
  const [editing, setEditing] = useState(false)

  // Editable form fields
  const [summary, setSummary] = useState('')
  const [skillsText, setSkillsText] = useState('')

  useEffect(() => {
    const fetchResume = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('studentToken')
        const res = await axios.get('http://localhost:5000/api/study-tools/resume-builder', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data?.success && res.data.resumeData) {
          setResumeData(res.data.resumeData)
          setSummary(res.data.resumeData.professionalSummary || '')
          setSkillsText((res.data.resumeData.highlightSkills || []).join(', '))
        }
      } catch (err) {
        console.warn('Failed to load resume builder data')
      } finally {
        setLoading(false)
      }
    }
    fetchResume()
  }, [])

  if (loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <SLoader />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text3)' }}>
          Auto-assembling professional resume from your student profile telemetry...
        </div>
      </div>
    )
  }

  const strengthScore = resumeData?.resumeStrengthScore || 85

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto' }} className="s-anim-up">
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#d1fae5', color: '#047857', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            <FiZap size={14} /> Telemetry Auto-Populated Resume
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            Personalized Student Resume Builder
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
            Auto-populated from your profile (Degree, CGPA, Skills, Projects, Certifications). Edit and export anytime.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <SBtn variant="secondary" onClick={() => setEditing(!editing)} style={{ borderRadius: 12 }}>
            <FiEdit3 size={15} style={{ marginRight: 6 }} /> {editing ? 'Done Editing' : 'Edit Resume Content'}
          </SBtn>
          <SBtn variant="primary" onClick={() => window.print()} style={{ borderRadius: 12 }}>
            <FiDownload size={16} style={{ marginRight: 6 }} /> Print / Export PDF
          </SBtn>
        </div>
      </div>

      {/* RESUME STRENGTH SCORE BAR */}
      <SCard style={{ padding: 22, borderRadius: 20, marginBottom: 28, background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>Profile Resume Strength</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginTop: 2 }}>{strengthScore}% Optimized</div>
          </div>
          <SBadge color={strengthScore >= 80 ? 'green' : 'orange'}>
            {strengthScore >= 80 ? 'Placement Ready' : 'Action Recommended'}
          </SBadge>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.15)', height: 8, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${strengthScore}%`, height: '100%', background: '#34d399', transition: 'width 0.5s ease' }} />
        </div>
      </SCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }} className="s-grid-1col">
        
        {/* PRINTABLE RESUME CANVAS */}
        <SCard style={{ padding: 38, borderRadius: 24, background: '#fff', border: '1px solid var(--s-border)' }}>
          {/* Header Contact Block */}
          <div style={{ borderBottom: '2px solid var(--s-primary)', paddingBottom: 16, marginBottom: 24 }}>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 4px' }}>
              {resumeData?.name || 'College Student'}
            </h2>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-primary)' }}>
              {resumeData?.degree} — {resumeData?.domain} (CGPA: {resumeData?.cgpa})
            </div>
          </div>

          {/* Professional Summary */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', borderBottom: '1px solid var(--s-border)', paddingBottom: 6, marginBottom: 8 }}>
              Professional Summary
            </h4>
            {editing ? (
              <textarea
                rows={3}
                value={summary}
                onChange={e => setSummary(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--s-border)', fontSize: 13 }}
              />
            ) : (
              <p style={{ fontSize: 14, color: 'var(--s-text)', lineHeight: 1.6, margin: 0 }}>
                {summary}
              </p>
            )}
          </div>

          {/* Portfolio & Applied Projects */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', borderBottom: '1px solid var(--s-border)', paddingBottom: 6, marginBottom: 12 }}>
              Portfolio & Academic Projects
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {resumeData?.suggestedProjects?.map((proj, idx) => (
                <div key={idx}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--s-text)' }}>{proj.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--s-text3)', margin: '2px 0 4px' }}>{proj.description}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#047857' }}>Tech Stack: {proj.techStack}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Competencies */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', borderBottom: '1px solid var(--s-border)', paddingBottom: 6, marginBottom: 12 }}>
              Key Technical Competencies
            </h4>
            {editing ? (
              <SInput
                value={skillsText}
                onChange={e => setSkillsText(e.target.value)}
                placeholder="Comma separated skills..."
              />
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {skillsText.split(',').map((s, idx) => (
                  <span key={idx} style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 8, background: '#f1f5f9', color: 'var(--s-text)' }}>
                    • {s.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Certifications */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', borderBottom: '1px solid var(--s-border)', paddingBottom: 6, marginBottom: 10 }}>
              Recognized Certifications
            </h4>
            {(resumeData?.certifications || []).map((cert, idx) => (
              <div key={idx} style={{ fontSize: 13, fontWeight: 700, color: '#b45309', margin: '4px 0' }}>
                🏆 {cert}
              </div>
            ))}
          </div>

        </SCard>

        {/* AI SUGGESTIONS SIDEBAR */}
        <SCard style={{ padding: 24, borderRadius: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 16px' }}>
            💡 Missing Section Alerts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(resumeData?.missingSectionsToImprove || []).map((sec, idx) => (
              <div key={idx} style={{ fontSize: 12, padding: 10, background: '#fef3c7', color: '#b45309', borderRadius: 10, fontWeight: 700 }}>
                • {sec}
              </div>
            ))}
          </div>
        </SCard>

      </div>
    </div>
  )
}
