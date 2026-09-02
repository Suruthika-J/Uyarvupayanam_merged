import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { SCard, SBtn, SLoader } from '../../components/ui'
import { FiFileText, FiDownload, FiCheckCircle, FiZap, FiPlus } from 'react-icons/fi'

export default function ResumeBuilderPage() {
  const [loading, setLoading] = useState(true)
  const [resumeData, setResumeData] = useState(null)

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
        }
      } catch (err) {
        console.warn('Failed to load resume builder data')
      } finally {
        setLoading(false)
      }
    }
    fetchResume()
  }, [])

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#d1fae5', color: '#047857', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            <FiZap size={14} /> Telemetry Resume Generator
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            Intelligent Student Resume Builder
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
            Auto-generate a structured professional resume from your degree, domain skills, and portfolio projects.
          </p>
        </div>

        <SBtn variant="primary" onClick={() => window.print()} style={{ borderRadius: 12 }}>
          <FiDownload size={16} style={{ marginRight: 6 }} /> Print / Export Resume
        </SBtn>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <SLoader label="Auto-assembling your resume from academic telemetry..." />
        </div>
      ) : resumeData ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }} className="s-grid-1col">
          
          {/* Printable Resume Canvas */}
          <SCard style={{ padding: 36, borderRadius: 20, background: '#fff', border: '1px solid var(--s-border)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 4px' }}>
              Student Academic Profile Resume
            </h2>
            <div style={{ fontSize: 14, color: 'var(--s-primary)', fontWeight: 700, marginBottom: 20 }}>
              Professional Resume Telemetry Output
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', borderBottom: '1px solid var(--s-border)', paddingBottom: 6, marginBottom: 8 }}>
                Professional Summary
              </h4>
              <p style={{ fontSize: 14, color: 'var(--s-text)', lineHeight: 1.6 }}>
                {resumeData.professionalSummary}
              </p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', borderBottom: '1px solid var(--s-border)', paddingBottom: 6, marginBottom: 12 }}>
                Portfolio & Applied Projects
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {resumeData.suggestedProjects?.map((proj, idx) => (
                  <div key={idx}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--s-text)' }}>{proj.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--s-text3)', margin: '2px 0 4px' }}>{proj.description}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#047857' }}>Tech Stack: {proj.techStack}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', borderBottom: '1px solid var(--s-border)', paddingBottom: 6, marginBottom: 12 }}>
                Key Technical Competencies
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {resumeData.highlightSkills?.map((s, idx) => (
                  <span key={idx} style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 8, background: '#f1f5f9', color: 'var(--s-text)' }}>
                    • {s}
                  </span>
                ))}
              </div>
            </div>
          </SCard>

          {/* AI Suggestions Sidebar */}
          <SCard style={{ padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 16px' }}>
              💡 Profile Recommendations
            </h3>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#b45309', marginBottom: 6 }}>
              Missing Resume Enhancements:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {resumeData.missingSectionsToImprove?.map((sec, idx) => (
                <div key={idx} style={{ fontSize: 12, padding: 8, background: '#fef3c7', color: '#b45309', borderRadius: 8, fontWeight: 700 }}>
                  • {sec}
                </div>
              ))}
            </div>
          </SCard>

        </div>
      ) : null}
    </div>
  )
}
