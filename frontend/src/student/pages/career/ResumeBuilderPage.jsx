import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { SCard, SBtn, SLoader, SInput, SBadge } from '../../components/ui'
import { FiFileText, FiDownload, FiCheckCircle, FiZap, FiPlus, FiUser, FiEdit3, FiTrash2, FiSave } from 'react-icons/fi'
import { useCollegeProfile } from '../../context/CollegeProfileContext'

export default function ResumeBuilderPage() {
  const { profile, refreshProfile } = useCollegeProfile()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resumeData, setResumeData] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Editable form fields
  const [summary, setSummary] = useState('')
  const [skillsText, setSkillsText] = useState('')
  const [projectsList, setProjectsList] = useState([])
  const [certsList, setCertsList] = useState([])

  // Modal / Inline Form states for adding items
  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [newProjectTech, setNewProjectTech] = useState('')
  const [showAddProject, setShowAddProject] = useState(false)

  const [newCert, setNewCert] = useState('')
  const [showAddCert, setShowAddCert] = useState(false)

  const fetchResume = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('studentToken')
      const res = await axios.get('http://localhost:5000/api/study-tools/resume-builder', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data?.success && res.data.resumeData) {
        const rData = res.data.resumeData
        setResumeData(rData)
        setSummary(rData.professionalSummary || '')
        setSkillsText((rData.highlightSkills || []).join(', '))
        setProjectsList(rData.projects || rData.suggestedProjects || [])
        setCertsList(rData.certifications || [])
      }
    } catch (err) {
      console.warn('Failed to load resume builder data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResume()
  }, [])

  const handleSaveResume = async () => {
    setSaving(true)
    setSaveMessage('')
    try {
      const token = localStorage.getItem('studentToken')
      const parsedSkills = skillsText.split(',').map(s => s.trim()).filter(Boolean)
      const payload = {
        professionalSummary: summary,
        skills: parsedSkills,
        certifications: certsList,
        projects: projectsList
      }
      const res = await axios.post('http://localhost:5000/api/study-tools/resume-builder/save', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data?.success) {
        setSaveMessage('Resume updates saved to student profile!')
        setEditing(false)
        if (refreshProfile) refreshProfile()
        fetchResume()
      }
    } catch (err) {
      console.error('Failed to save resume:', err)
      setSaveMessage('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddProject = () => {
    if (!newProjectTitle.trim()) return
    const updated = [...projectsList, {
      title: newProjectTitle.trim(),
      description: newProjectDesc.trim(),
      techStack: newProjectTech.trim() || 'Applied Practice'
    }]
    setProjectsList(updated)
    setNewProjectTitle('')
    setNewProjectDesc('')
    setNewProjectTech('')
    setShowAddProject(false)
  }

  const handleRemoveProject = (idx) => {
    setProjectsList(projectsList.filter((_, i) => i !== idx))
  }

  const handleAddCert = () => {
    if (!newCert.trim()) return
    setCertsList([...certsList, newCert.trim()])
    setNewCert('')
    setShowAddCert(false)
  }

  const handleRemoveCert = (idx) => {
    setCertsList(certsList.filter((_, i) => i !== idx))
  }

  if (loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <SLoader />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text3)' }}>
          Assembling profile-driven resume context...
        </div>
      </div>
    )
  }

  const secConfig = resumeData?.sectionConfig || {
    summaryTitle: 'Professional Summary',
    competenciesTitle: 'Key Competencies',
    projectsTitle: 'Portfolio & Applied Projects',
    certificationsTitle: 'Recognized Certifications',
    emptyProjectPrompt: '+ Add a Project / Case Study',
    emptyCertPrompt: '+ Add a Certification or Workshop'
  }

  const strengthScore = resumeData?.resumeStrengthScore || 70

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto' }} className="s-anim-up">
      {/* PAGE HEADER */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#d1fae5', color: '#047857', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            <FiZap size={14} /> Profile Telemetry Driven
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            Personalized Student Resume Builder
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
            Generated exclusively from your saved profile, verified skills, and academic achievements.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {editing ? (
            <SBtn variant="primary" onClick={handleSaveResume} disabled={saving} style={{ borderRadius: 12, background: '#047857' }}>
              <FiSave size={15} style={{ marginRight: 6 }} /> {saving ? 'Saving...' : 'Save Resume Changes'}
            </SBtn>
          ) : (
            <SBtn variant="secondary" onClick={() => setEditing(true)} style={{ borderRadius: 12 }}>
              <FiEdit3 size={15} style={{ marginRight: 6 }} /> Edit Resume Content
            </SBtn>
          )}
          <SBtn variant="primary" onClick={() => window.print()} style={{ borderRadius: 12 }}>
            <FiDownload size={16} style={{ marginRight: 6 }} /> Print / Export PDF
          </SBtn>
        </div>
      </div>

      {saveMessage && (
        <div style={{ padding: '10px 16px', borderRadius: 12, background: saveMessage.includes('Failed') ? '#fee2e2' : '#d1fae5', color: saveMessage.includes('Failed') ? '#b91c1c' : '#047857', fontWeight: 700, fontSize: 13, marginBottom: 20 }}>
          {saveMessage}
        </div>
      )}

      {/* RESUME STRENGTH SCORE BAR */}
      <SCard style={{ padding: 22, borderRadius: 20, marginBottom: 28, background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>Profile Resume Strength</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginTop: 2 }}>{strengthScore}% Optimized</div>
          </div>
          <SBadge color={strengthScore >= 80 ? 'green' : 'orange'}>
            {strengthScore >= 80 ? 'Profile Verified' : 'Action Recommended'}
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
              {resumeData?.degree} — {resumeData?.domain} {resumeData?.currentYear ? `(${resumeData.currentYear})` : ''} {resumeData?.cgpa ? `| CGPA: ${resumeData.cgpa}` : ''}
            </div>
            {resumeData?.targetCareer && (
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-text3)', marginTop: 4 }}>
                Target Career Direction: <span style={{ color: 'var(--s-text)', fontWeight: 800 }}>{resumeData.targetCareer}</span>
              </div>
            )}
          </div>

          {/* Section 1: Professional / Academic Summary */}
          <div style={{ marginBottom: 26 }}>
            <h4 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', borderBottom: '1px solid var(--s-border)', paddingBottom: 6, marginBottom: 10 }}>
              {secConfig.summaryTitle}
            </h4>
            {editing ? (
              <textarea
                rows={4}
                value={summary}
                onChange={e => setSummary(e.target.value)}
                style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--s-border)', fontSize: 13, lineHeight: 1.6 }}
              />
            ) : (
              <p style={{ fontSize: 14, color: 'var(--s-text)', lineHeight: 1.6, margin: 0 }}>
                {summary}
              </p>
            )}
          </div>

          {/* Section 2: Key Competencies */}
          <div style={{ marginBottom: 26 }}>
            <h4 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', borderBottom: '1px solid var(--s-border)', paddingBottom: 6, marginBottom: 12 }}>
              {secConfig.competenciesTitle}
            </h4>
            {editing ? (
              <div>
                <SInput
                  value={skillsText}
                  onChange={e => setSkillsText(e.target.value)}
                  placeholder="Comma separated competencies..."
                />
                <div style={{ fontSize: 11, color: 'var(--s-text3)', marginTop: 4 }}>Separate skills with commas (e.g. Clinical Diagnostics, Case Taking, Therapeutics)</div>
              </div>
            ) : (
              skillsText.trim() ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {skillsText.split(',').map((s, idx) => (
                    s.trim() ? (
                      <span key={idx} style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 8, background: '#f1f5f9', color: 'var(--s-text)' }}>
                        • {s.trim()}
                      </span>
                    ) : null
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--s-text3)', fontStyle: 'italic', padding: 10, background: '#f8fafc', borderRadius: 10 }}>
                  No competencies specified yet. Click "Edit Resume Content" to add your skills.
                </div>
              )
            )}
          </div>

          {/* Section 3: Portfolio / Applied Projects / Case Studies */}
          <div style={{ marginBottom: 26 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--s-border)', paddingBottom: 6, marginBottom: 12 }}>
              <h4 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', margin: 0 }}>
                {secConfig.projectsTitle}
              </h4>
              {editing && (
                <button
                  type="button"
                  onClick={() => setShowAddProject(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--s-primary)', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <FiPlus size={14} /> Add Entry
                </button>
              )}
            </div>

            {projectsList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {projectsList.map((proj, idx) => (
                  <div key={idx} style={{ borderLeft: '3px solid var(--s-primary)', paddingLeft: 12, position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--s-text)' }}>{proj.title}</div>
                      {editing && (
                        <button onClick={() => handleRemoveProject(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                    {proj.description && <div style={{ fontSize: 13, color: 'var(--s-text3)', margin: '2px 0 4px' }}>{proj.description}</div>}
                    {proj.techStack && <div style={{ fontSize: 12, fontWeight: 700, color: '#047857' }}>Tools / Focus: {proj.techStack}</div>}
                  </div>
                ))}
              </div>
            ) : (
              /* STRICT ZERO FABRICATION: Show empty state prompt instead of fake demo software projects */
              <div style={{ padding: 18, border: '2px dashed #cbd5e1', borderRadius: 14, textTransform: 'none', textAlign: 'center', background: '#f8fafc' }}>
                <div style={{ fontSize: 13, color: 'var(--s-text3)', fontWeight: 700, marginBottom: 8 }}>
                  No entries listed under {secConfig.projectsTitle}.
                </div>
                <SBtn variant="secondary" onClick={() => { setEditing(true); setShowAddProject(true); }} style={{ fontSize: 12, borderRadius: 10 }}>
                  {secConfig.emptyProjectPrompt}
                </SBtn>
              </div>
            )}

            {/* Inline Add Project Form */}
            {editing && showAddProject && (
              <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>Add New Project / Case Study</div>
                <SInput placeholder="Title (e.g. Clinical Case Analysis of Chronic Migraine)" value={newProjectTitle} onChange={e => setNewProjectTitle(e.target.value)} />
                <textarea rows={2} placeholder="Description / Findings" value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--s-border)', fontSize: 12 }} />
                <SInput placeholder="Tools / Focus (e.g. Case Taking, Diagnostics)" value={newProjectTech} onChange={e => setNewProjectTech(e.target.value)} />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <SBtn variant="secondary" onClick={() => setShowAddProject(false)} style={{ fontSize: 12 }}>Cancel</SBtn>
                  <SBtn variant="primary" onClick={handleAddProject} style={{ fontSize: 12 }}>Add to Resume</SBtn>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Certifications & Workshops */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--s-border)', paddingBottom: 6, marginBottom: 10 }}>
              <h4 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', margin: 0 }}>
                {secConfig.certificationsTitle}
              </h4>
              {editing && (
                <button
                  type="button"
                  onClick={() => setShowAddCert(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--s-primary)', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <FiPlus size={14} /> Add Certification
                </button>
              )}
            </div>

            {certsList.length > 0 ? (
              <div>
                {certsList.map((cert, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, fontWeight: 700, color: '#b45309', margin: '6px 0' }}>
                    <span>🏆 {cert}</span>
                    {editing && (
                      <button onClick={() => handleRemoveCert(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <FiTrash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* STRICT ZERO FABRICATION: Show empty state prompt instead of fake AWS certification */
              <div style={{ padding: 16, border: '2px dashed #cbd5e1', borderRadius: 14, textAlign: 'center', background: '#f8fafc' }}>
                <div style={{ fontSize: 13, color: 'var(--s-text3)', fontWeight: 700, marginBottom: 8 }}>
                  No certifications or workshops listed.
                </div>
                <SBtn variant="secondary" onClick={() => { setEditing(true); setShowAddCert(true); }} style={{ fontSize: 12, borderRadius: 10 }}>
                  {secConfig.emptyCertPrompt}
                </SBtn>
              </div>
            )}

            {/* Inline Add Cert Form */}
            {editing && showAddCert && (
              <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: '#f1f5f9', display: 'flex', gap: 8, alignItems: 'center' }}>
                <SInput placeholder="Certification Title (e.g. Clinical Research Workshop)" value={newCert} onChange={e => setNewCert(e.target.value)} style={{ flex: 1 }} />
                <SBtn variant="secondary" onClick={() => setShowAddCert(false)} style={{ fontSize: 12 }}>Cancel</SBtn>
                <SBtn variant="primary" onClick={handleAddCert} style={{ fontSize: 12 }}>Add</SBtn>
              </div>
            )}
          </div>

        </SCard>

        {/* AI & COMPLETENESS SIDEBAR */}
        <SCard style={{ padding: 24, borderRadius: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 16px' }}>
            💡 Domain Completeness Guide
          </h3>
          <div style={{ fontSize: 13, color: 'var(--s-text3)', marginBottom: 14 }}>
            Tailored suggestions for <strong style={{ color: 'var(--s-text)' }}>{resumeData?.degree || 'your degree'}</strong>:
          </div>
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
