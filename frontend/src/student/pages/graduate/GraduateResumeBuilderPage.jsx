import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axiosInstance from '../../../config/axios'
import { SCard, SBtn, SInput, SBadge, AIGenerating, AIFailure, SEmpty } from '../../components/ui'
import {
  FiFileText, FiDownload, FiCheckCircle, FiZap, FiPlus, FiUser, FiEdit3,
  FiTarget, FiShield, FiBriefcase, FiTrash2, FiSave, FiLayers, FiEye,
  FiBookOpen, FiAward, FiGlobe, FiLinkedin, FiGithub, FiCheck, FiCpu
} from 'react-icons/fi'
import graduateService from '../../../services/graduateService'

const RESUME_TEMPLATES = [
  { id: 'ATS CLASSIC', name: 'ATS Classic (Single Column)', desc: 'Maximizes recruiter ATS pass rate with standard headers' },
  { id: 'MODERN ATS', name: 'Modern ATS (Clean Accents)', desc: 'Clean typography with subtle primary blue divider lines' },
  { id: 'TECHNICAL', name: 'Technical & Engineering', desc: 'Highlights core technical stack, GitHub repositories & capstones' },
  { id: 'ACADEMIC', name: 'Academic & Higher Studies', desc: 'Structured for M.Tech, MS, and GATE/GRE admission committees' },
  { id: 'RESEARCH', name: 'Research & Publications CV', desc: 'Emphasizes papers, advisor research projects and methodology' },
  { id: 'EXPERIENCED PROFESSIONAL', name: 'Experienced Professional', desc: 'Tailored for graduates with full-time work or long internships' }
]

const CATEGORY_OPTIONS = [
  { id: 'JOB', label: 'Private Jobs / Corporate' },
  { id: 'GOVERNMENT', label: 'Government / Public Sector' },
  { id: 'HIGHER_STUDIES', label: 'Higher Studies / MS / M.Tech' },
  { id: 'RESEARCH', label: 'Research & Academia' },
  { id: 'INTERNSHIP', label: 'Internship / Apprenticeship' }
]

export default function GraduateResumeBuilderPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const prefilledRole = searchParams.get('targetRole') || ''
  const prefilledCompany = searchParams.get('targetCompany') || ''
  const prefilledCategory = searchParams.get('targetCategory') || 'JOB'

  // Data Loading
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Multi-Version State
  const [savedResumes, setSavedResumes] = useState([])
  const [activeResumeId, setActiveResumeId] = useState(null)

  // Resume Model State
  const [versionName, setVersionName] = useState('Primary Resume')
  const [targetRole, setTargetRole] = useState(prefilledRole || 'Software Engineer')
  const [targetCompany, setTargetCompany] = useState(prefilledCompany || '')
  const [targetCategory, setTargetCategory] = useState(prefilledCategory)
  const [selectedTemplate, setSelectedTemplate] = useState('ATS CLASSIC')
  const [jobDescription, setJobDescription] = useState('')
  const [previewMode, setPreviewMode] = useState('desktop') // 'desktop' | 'mobile'

  // Contact / Personal Info
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    degree: '',
    specialization: '',
    institution: '',
    graduationYear: '',
    cgpa: '',
    percentage: '',
    linkedin: '',
    github: '',
    portfolio: ''
  })

  // Summary & Core Sections
  const [summary, setSummary] = useState('')
  const [technicalSkills, setTechnicalSkills] = useState([])
  const [newSkill, setNewSkill] = useState('')
  const [softSkills, setSoftSkills] = useState([])

  // Dynamic Array Sections
  const [experience, setExperience] = useState([])
  const [internships, setInternships] = useState([])
  const [projects, setProjects] = useState([])
  const [certifications, setCertifications] = useState([])
  const [achievements, setAchievements] = useState([])
  const [publications, setPublications] = useState([])
  const [research, setResearch] = useState([])
  const [customSections, setCustomSections] = useState([])
  const [languages, setLanguages] = useState(['English', 'Tamil'])

  // Section Visibility Toggles
  const [visibility, setVisibility] = useState({
    summary: true,
    education: true,
    skills: true,
    experience: true,
    internships: true,
    projects: true,
    certifications: true,
    achievements: true,
    publications: true,
    research: true,
    languages: true,
    custom: true
  })

  // Strength & Readiness Score
  const [readinessScore, setReadinessScore] = useState(0)

  // Load Graduate Profile and existing saved resumes on mount
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    setError('')
    try {
      // 1. Fetch Backend Resume Suggestions (populates from GraduateProfile or CollegeStudentProfile)
      const res = await axiosInstance.get('/graduate/resume')
      const profile = res.data?.profile || {}
      const suggested = res.data?.resumeData || {}

      if (res.data?.savedResumes?.length > 0) {
        setSavedResumes(res.data.savedResumes)
        loadResumeDocIntoState(res.data.savedResumes[0])
      } else {
        // Auto-populate from Graduate Profile
        populateFromProfileData(suggested, profile)
      }
    } catch (err) {
      console.warn('Fallback to direct graduate profile fetch:', err)
      try {
        const pRes = await graduateService.getProfile()
        if (pRes.success && pRes.profile) {
          populateFromProfileData({}, pRes.profile)
        }
      } catch (e) {
        setError('Could not auto-populate profile telemetry. You can still type your details manually.')
      }
    } finally {
      setLoading(false)
    }
  }

  const populateFromProfileData = (suggested, profile) => {
    const name = suggested.name || profile.name || 'Graduate Candidate'
    const degree = suggested.degree || profile.degree || 'B.E.'
    const spec = suggested.domain || profile.specialization || profile.domain || 'Computer Science'
    const inst = suggested.college || profile.collegeName || profile.universityName || ''
    const yr = profile.graduationYear || suggested.graduationYear || '2026'
    const cgpaVal = profile.cgpa || suggested.cgpa || profile.percentage || ''

    setPersonalInfo({
      fullName: name,
      email: suggested.email || profile.email || '',
      phone: suggested.phone || profile.phone || '',
      location: profile.location || profile.state || 'Tamil Nadu',
      degree,
      specialization: spec,
      institution: inst,
      graduationYear: yr,
      cgpa: cgpaVal,
      percentage: profile.percentage || suggested.percentage || '',
      linkedin: profile.linkedin || '',
      github: profile.github || '',
      portfolio: profile.portfolio || ''
    })

    setSummary(
      suggested.professionalSummary ||
      profile.careerObjective ||
      `Proactive ${degree} graduate in ${spec} from ${inst || 'university'}. Analytical problem solver with hands-on technical skills and portfolio capstones.`
    )

    const rawSkills = suggested.highlightSkills || profile.skills || []
    setTechnicalSkills(rawSkills.map(s => typeof s === 'string' ? s : s.name))

    const expList = profile.experience || suggested.experience || []
    setExperience(expList.map(e => ({
      company: e.company || '',
      role: e.role || e.title || '',
      location: e.location || '',
      type: e.type || 'Full-time',
      startDate: e.startDate || e.duration || '',
      endDate: e.endDate || '',
      description: e.description || ''
    })))

    const projList = profile.projects || suggested.suggestedProjects || []
    setProjects(projList.map(p => ({
      title: p.title || '',
      description: p.description || '',
      techStack: p.techStack || '',
      role: p.role || 'Developer',
      githubUrl: p.githubUrl || '',
      liveUrl: p.liveUrl || ''
    })))

    setCertifications(profile.certifications || suggested.certifications || [])
    if (prefilledRole) setTargetRole(prefilledRole)
    if (prefilledCompany) setTargetCompany(prefilledCompany)
  }

  const loadResumeDocIntoState = (doc) => {
    setActiveResumeId(doc._id)
    setVersionName(doc.versionName || 'Primary Resume')
    setTargetRole(doc.targetRole || 'Software Engineer')
    setTargetCompany(doc.targetCompany || '')
    setTargetCategory(doc.targetCategory || 'JOB')
    setSelectedTemplate(doc.template || 'ATS CLASSIC')

    if (doc.personalInfo) setPersonalInfo(doc.personalInfo)
    if (doc.professionalSummary) setSummary(doc.professionalSummary)
    if (Array.isArray(doc.technicalSkills)) setTechnicalSkills(doc.technicalSkills)
    if (Array.isArray(doc.softSkills)) setSoftSkills(doc.softSkills)
    if (Array.isArray(doc.experience)) setExperience(doc.experience)
    if (Array.isArray(doc.internships)) setInternships(doc.internships)
    if (Array.isArray(doc.projects)) setProjects(doc.projects)
    if (Array.isArray(doc.certifications)) setCertifications(doc.certifications)
    if (Array.isArray(doc.achievements)) setAchievements(doc.achievements)
    if (Array.isArray(doc.publications)) setPublications(doc.publications)
    if (Array.isArray(doc.research)) setResearch(doc.research)
    if (Array.isArray(doc.customSections)) setCustomSections(doc.customSections)
    if (Array.isArray(doc.languages)) setLanguages(doc.languages)
    if (doc.sectionVisibility) setVisibility({ ...visibility, ...doc.sectionVisibility })
  }

  // Calculate Resume Readiness Percentage dynamically
  useEffect(() => {
    let score = 25
    if (personalInfo.fullName && personalInfo.email) score += 15
    if (personalInfo.degree && personalInfo.institution) score += 15
    if (summary.trim().length > 20) score += 15
    if (technicalSkills.length > 0) score += 15
    if (projects.length > 0 || experience.length > 0) score += 15
    setReadinessScore(Math.min(100, score))
  }, [personalInfo, summary, technicalSkills, projects, experience])

  const handleSaveResume = async () => {
    setSaving(true)
    setError('')
    setSuccessMsg('')
    try {
      const payload = {
        _id: activeResumeId,
        versionName,
        targetRole,
        targetCompany,
        targetCategory,
        template: selectedTemplate,
        personalInfo,
        professionalSummary: summary,
        technicalSkills,
        softSkills,
        experience,
        internships,
        projects,
        certifications,
        achievements,
        publications,
        research,
        customSections,
        languages,
        sectionVisibility: visibility
      }

      const res = await axiosInstance.post('/graduate/resume/save', payload)
      if (res.data?.success && res.data.resume) {
        setActiveResumeId(res.data.resume._id)
        setSuccessMsg(`Resume "${versionName}" saved successfully!`)
        setTimeout(() => setSuccessMsg(''), 4000)

        // Refresh saved versions list
        const vRes = await axiosInstance.get('/graduate/resume/versions')
        if (vRes.data?.resumes) setSavedResumes(vRes.data.resumes)
      }
    } catch (err) {
      console.error('Save resume error:', err)
      setError(err.response?.data?.message || 'Failed to save resume. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateAiSummary = async () => {
    setGeneratingSummary(true)
    try {
      const res = await axiosInstance.post('/graduate/resume/generate-summary', {
        targetRole,
        resumeDetails: {
          degree: personalInfo.degree,
          specialization: personalInfo.specialization,
          institution: personalInfo.institution,
          technicalSkills
        }
      })
      if (res.data?.success && res.data.summary) {
        setSummary(res.data.summary)
      }
    } catch (err) {
      console.warn('AI summary error:', err)
    } finally {
      setGeneratingSummary(false)
    }
  }

  const handleAddSkill = () => {
    if (!newSkill.trim()) return
    if (!technicalSkills.includes(newSkill.trim())) {
      setTechnicalSkills([...technicalSkills, newSkill.trim()])
    }
    setNewSkill('')
  }

  const handleRemoveSkill = (sk) => {
    setTechnicalSkills(technicalSkills.filter(s => s !== sk))
  }

  const handleCreateNewVersion = () => {
    setActiveResumeId(null)
    setVersionName(`Resume - ${targetRole || 'New Version'}`)
    setSuccessMsg('Started new resume draft. Customize your details and click Save.')
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', paddingTop: 30 }}>
        <AIGenerating
          label="Building your Graduate Career Resume Environment"
          sub="Auto-populating profile telemetry, academic credentials, and competency matrix..."
        />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }} className="s-anim-up">
      <style>{`
        @media print {
          @page { margin: 8mm 12mm; size: A4 portrait; }
          body, html, #root { background: #fff !important; color: #000 !important; }
          .no-print { display: none !important; }
          .printable-resume-card { border: none !important; box-shadow: none !important; padding: 0 !important; width: 100% !important; }
        }
      `}</style>

      {/* HEADER BAR */}
      <div className="no-print" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            <FiZap size={14} /> Profile Telemetry Auto-Populated
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            RESUME BUILDER
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
            Build a professional resume tailored to your graduate career goals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate(`/graduate/ats-checker?targetRole=${encodeURIComponent(targetRole)}&targetCompany=${encodeURIComponent(targetCompany)}`)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 12,
              fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
            }}
          >
            <FiShield size={15} /> Check ATS Score
          </button>

          <SBtn variant="secondary" onClick={handleCreateNewVersion} style={{ borderRadius: 12 }}>
            <FiPlus size={15} style={{ marginRight: 6 }} /> New Resume Version
          </SBtn>

          <SBtn variant="primary" onClick={handleSaveResume} disabled={saving} style={{ borderRadius: 12 }}>
            <FiSave size={15} style={{ marginRight: 6 }} /> {saving ? 'Saving...' : 'Save Resume'}
          </SBtn>

          <SBtn variant="secondary" onClick={() => window.print()} style={{ borderRadius: 12 }}>
            <FiDownload size={15} style={{ marginRight: 6 }} /> Print / Export PDF
          </SBtn>
        </div>
      </div>

      {/* SUCCESS / ERROR ALERTS */}
      {successMsg && (
        <div className="no-print" style={{ marginBottom: 20, padding: 14, borderRadius: 12, background: '#dcfce7', border: '1px solid #86efac', color: '#166534', fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiCheckCircle size={18} /> {successMsg}
        </div>
      )}
      {error && (
        <div className="no-print" style={{ marginBottom: 20, padding: 14, borderRadius: 12, background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13.5, fontWeight: 700 }}>
          {error}
        </div>
      )}

      {/* VERSIONS & TARGET BANNER */}
      <SCard className="no-print" style={{ padding: 20, borderRadius: 20, marginBottom: 24, background: '#fff', border: '1px solid var(--s-border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: 14, alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase' }}>Resume Version Name</label>
            <SInput value={versionName} onChange={e => setVersionName(e.target.value)} placeholder="e.g. Software Engineer Resume" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase' }}>Target Job Role</label>
            <SInput value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Full Stack Developer" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase' }}>Target Company (Optional)</label>
            <SInput value={targetCompany} onChange={e => setTargetCompany(e.target.value)} placeholder="e.g. TCS / Accenture" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase' }}>Career Category</label>
            <select
              value={targetCategory}
              onChange={e => setTargetCategory(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--s-border)', fontSize: 13, background: '#fff' }}
            >
              {CATEGORY_OPTIONS.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Saved versions drawer */}
        {savedResumes.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text3)' }}>Saved Resumes:</span>
            {savedResumes.map(r => (
              <button
                key={r._id}
                type="button"
                onClick={() => loadResumeDocIntoState(r)}
                style={{
                  padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: '1px solid',
                  cursor: 'pointer',
                  background: activeResumeId === r._id ? '#eff6ff' : '#f8fafc',
                  color: activeResumeId === r._id ? '#1e40af' : '#475569',
                  borderColor: activeResumeId === r._id ? '#93c5fd' : '#cbd5e1'
                }}
              >
                {r.versionName} ({r.targetRole})
              </button>
            ))}
          </div>
        )}
      </SCard>

      {/* MAIN BUILDER & PREVIEW GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* LEFT COLUMN: EDITABLE SECTION FORM */}
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* SECTION 1: PERSONAL & CONTACT INFO */}
          <SCard style={{ padding: 22, borderRadius: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiUser color="#2563eb" /> Personal & Contact Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <SInput label="Full Name" value={personalInfo.fullName} onChange={e => setPersonalInfo({ ...personalInfo, fullName: e.target.value })} />
              <SInput label="Email Address" value={personalInfo.email} onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })} />
              <SInput label="Phone Number" value={personalInfo.phone} onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })} />
              <SInput label="Location" value={personalInfo.location} onChange={e => setPersonalInfo({ ...personalInfo, location: e.target.value })} />
              <SInput label="Degree" value={personalInfo.degree} onChange={e => setPersonalInfo({ ...personalInfo, degree: e.target.value })} />
              <SInput label="Specialization" value={personalInfo.specialization} onChange={e => setPersonalInfo({ ...personalInfo, specialization: e.target.value })} />
              <SInput label="College / University" value={personalInfo.institution} onChange={e => setPersonalInfo({ ...personalInfo, institution: e.target.value })} />
              <SInput label="CGPA / Percentage" value={personalInfo.cgpa} onChange={e => setPersonalInfo({ ...personalInfo, cgpa: e.target.value })} />
              <SInput label="LinkedIn URL" value={personalInfo.linkedin} onChange={e => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })} icon={<FiLinkedin />} />
              <SInput label="GitHub URL" value={personalInfo.github} onChange={e => setPersonalInfo({ ...personalInfo, github: e.target.value })} icon={<FiGithub />} />
            </div>
          </SCard>

          {/* SECTION 2: PROFESSIONAL SUMMARY */}
          <SCard style={{ padding: 22, borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiFileText color="#2563eb" /> Professional Summary
              </h3>
              <button
                type="button"
                onClick={handleGenerateAiSummary}
                disabled={generatingSummary}
                style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <FiZap size={13} /> {generatingSummary ? 'Synthesizing...' : 'Generate Summary'}
              </button>
            </div>
            <textarea
              rows={4}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Synthesize a concise 3-line summary emphasizing your degree, core skills, and career focus..."
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--s-border)', fontSize: 13, lineHeight: 1.5 }}
            />
          </SCard>

          {/* SECTION 3: TECHNICAL COMPETENCIES */}
          <SCard style={{ padding: 22, borderRadius: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiCpu color="#2563eb" /> Technical Skills & Competencies
            </h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <SInput
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                placeholder="Add technical skill (e.g. React, Node.js, Python, SQL)..."
              />
              <SBtn variant="secondary" onClick={handleAddSkill} style={{ borderRadius: 10, flexShrink: 0 }}>
                <FiPlus /> Add
              </SBtn>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {technicalSkills.map(sk => (
                <span key={sk} style={{ background: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {sk}
                  <button type="button" onClick={() => handleRemoveSkill(sk)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>×</button>
                </span>
              ))}
            </div>
          </SCard>

          {/* SECTION 4: PROJECTS */}
          <SCard style={{ padding: 22, borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiBookOpen color="#2563eb" /> Portfolio & Academic Projects ({projects.length})
              </h3>
              <SBtn variant="secondary" onClick={() => setProjects([...projects, { title: '', description: '', techStack: '', githubUrl: '' }])} style={{ padding: '4px 10px', borderRadius: 8, fontSize: 12 }}>
                + Add Project
              </SBtn>
            </div>

            {projects.map((proj, idx) => (
              <div key={idx} style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <SInput label="Project Title" value={proj.title} onChange={e => {
                    const next = [...projects]
                    next[idx].title = e.target.value
                    setProjects(next)
                  }} />
                  <SInput label="Technologies Used" value={proj.techStack} onChange={e => {
                    const next = [...projects]
                    next[idx].techStack = e.target.value
                    setProjects(next)
                  }} />
                </div>
                <SInput label="Short Description" value={proj.description} onChange={e => {
                  const next = [...projects]
                  next[idx].description = e.target.value
                  setProjects(next)
                }} />
                <div style={{ textAlign: 'right', marginTop: 6 }}>
                  <button type="button" onClick={() => setProjects(projects.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    Remove Project
                  </button>
                </div>
              </div>
            ))}
          </SCard>

          {/* SECTION 5: WORK EXPERIENCE & INTERNSHIPS */}
          <SCard style={{ padding: 22, borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiBriefcase color="#2563eb" /> Work Experience & Internships ({experience.length})
              </h3>
              <SBtn variant="secondary" onClick={() => setExperience([...experience, { company: '', role: '', type: 'Full-time', duration: '', description: '' }])} style={{ padding: '4px 10px', borderRadius: 8, fontSize: 12 }}>
                + Add Experience
              </SBtn>
            </div>

            {experience.map((exp, idx) => (
              <div key={idx} style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <SInput label="Company / Organization" value={exp.company} onChange={e => {
                    const next = [...experience]
                    next[idx].company = e.target.value
                    setExperience(next)
                  }} />
                  <SInput label="Role / Title" value={exp.role} onChange={e => {
                    const next = [...experience]
                    next[idx].role = e.target.value
                    setExperience(next)
                  }} />
                </div>
                <SInput label="Description & Key Outcomes" value={exp.description} onChange={e => {
                  const next = [...experience]
                  next[idx].description = e.target.value
                  setExperience(next)
                }} />
                <div style={{ textAlign: 'right', marginTop: 6 }}>
                  <button type="button" onClick={() => setExperience(experience.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </SCard>

        </div>

        {/* RIGHT COLUMN: LIVE RESUME CANVAS PREVIEW */}
        <div style={{ position: 'sticky', top: 20 }}>
          
          {/* TEMPLATE PICKER BAR */}
          <div className="no-print" style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: 12, borderRadius: 14, border: '1px solid var(--s-border)' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text3)' }}>Template:</span>
            <select
              value={selectedTemplate}
              onChange={e => setSelectedTemplate(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--s-border)', fontSize: 12.5, fontWeight: 700, background: '#f8fafc' }}
            >
              {RESUME_TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* PRINTABLE RESUME CANVAS */}
          <SCard className="printable-resume-card" style={{ padding: 36, borderRadius: 20, background: '#fff', border: '1px solid var(--s-border)', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
            
            {/* Header Block */}
            <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: 14, marginBottom: 20, textAlign: selectedTemplate === 'MODERN ATS' ? 'left' : 'center' }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '0 0 4px', textTransform: 'uppercase' }}>
                {personalInfo.fullName || 'Graduate Candidate'}
              </h2>
              <div style={{ fontSize: 12.5, color: '#475569', display: 'flex', justifyContent: selectedTemplate === 'MODERN ATS' ? 'flex-start' : 'center', flexWrap: 'wrap', gap: 10 }}>
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                {personalInfo.location && <span>• {personalInfo.location}</span>}
                {personalInfo.linkedin && <span>• LinkedIn</span>}
                {personalInfo.github && <span>• GitHub</span>}
              </div>
            </div>

            {/* Education */}
            <div style={{ marginBottom: 18 }}>
              <h4 style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8, letterSpacing: '0.05em' }}>
                Education
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                <span>{personalInfo.degree} — {personalInfo.specialization}</span>
                <span>{personalInfo.graduationYear}</span>
              </div>
              <div style={{ fontSize: 12.5, color: '#475569' }}>
                {personalInfo.institution || 'College / University'} {personalInfo.cgpa ? `(CGPA: ${personalInfo.cgpa})` : ''}
              </div>
            </div>

            {/* Summary */}
            {summary && (
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8, letterSpacing: '0.05em' }}>
                  Professional Summary
                </h4>
                <p style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.5, margin: 0 }}>
                  {summary}
                </p>
              </div>
            )}

            {/* Technical Competencies */}
            {technicalSkills.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8, letterSpacing: '0.05em' }}>
                  Technical Competencies
                </h4>
                <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.5 }}>
                  <strong>Key Skills:</strong> {technicalSkills.join(', ')}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {experience.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8, letterSpacing: '0.05em' }}>
                  Work Experience & Internships
                </h4>
                {experience.map((e, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                      <span>{e.role} — {e.company}</span>
                      <span>{e.startDate}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{e.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8, letterSpacing: '0.05em' }}>
                  Key Portfolio Projects
                </h4>
                {projects.map((p, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: '#475569', margin: '2px 0' }}>{p.description}</div>
                    {p.techStack && <div style={{ fontSize: 11.5, fontWeight: 700, color: '#2563eb' }}>Tech: {p.techStack}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 6, letterSpacing: '0.05em' }}>
                  Certifications & Accomplishments
                </h4>
                {certifications.map((c, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#334155' }}>• {c}</div>
                ))}
              </div>
            )}

          </SCard>

        </div>

      </div>
    </div>
  )
}
