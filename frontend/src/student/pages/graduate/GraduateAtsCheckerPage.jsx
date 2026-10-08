import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axiosInstance from '../../../config/axios'
import {
  FiShield, FiCheckCircle, FiAlertCircle, FiZap, FiUploadCloud,
  FiCopy, FiCheck, FiArrowRight, FiRefreshCw, FiTrendingUp,
  FiBriefcase, FiFileText, FiClock, FiHelpCircle
} from 'react-icons/fi'
import { SCard, SBtn, SBadge, AIGenerating, AIFailure, SEmpty } from '../../components/ui'

export default function GraduateAtsCheckerPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const defaultRole = searchParams.get('targetRole') || ''
  const defaultCompany = searchParams.get('targetCompany') || ''

  // Input states
  const [activeTab, setActiveTab] = useState('profile')
  const [resumeText, setResumeText] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [targetCompany, setTargetCompany] = useState(defaultCompany)
  const [targetRole, setTargetRole] = useState(defaultRole)
  const [selectedPresetId, setSelectedPresetId] = useState('fullstack-dev')

  // Data & API states
  const [presets, setPresets] = useState([])
  const [atsHistory, setAtsHistory] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [copiedKey, setCopiedKey] = useState('')

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [pRes, hRes] = await Promise.all([
        axiosInstance.get('/graduate/ats-presets'),
        axiosInstance.get('/graduate/ats-history').catch(() => ({ data: { history: [] } }))
      ])

      if (pRes.data?.success && pRes.data.presets) {
        setPresets(pRes.data.presets)
        const defaultPreset = pRes.data.presets.find(p => p.id === 'fullstack-dev') || pRes.data.presets[0]
        if (defaultPreset && !jobDescription) {
          setJobDescription(defaultPreset.description)
        }
      }

      if (hRes.data?.history) {
        setAtsHistory(hRes.data.history)
      }
    } catch (err) {
      console.warn('Failed to load initial ATS presets/history:', err)
    }
  }

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id)
    setJobDescription(preset.description)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF resume file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.')
      return
    }
    setError('')
    setSelectedFile(file)
  }

  const handleRunAnalysis = async () => {
    setError('')
    setAnalyzing(true)

    try {
      let res
      if (activeTab === 'upload' && selectedFile) {
        const formData = new FormData()
        formData.append('resumeFile', selectedFile)
        formData.append('jobDescription', jobDescription)
        formData.append('targetCompany', targetCompany)
        formData.append('targetRole', targetRole)
        res = await axiosInstance.post('/graduate/ats-checker', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else if (activeTab === 'profile') {
        res = await axiosInstance.post('/graduate/ats-checker', {
          useProfile: true,
          jobDescription,
          targetCompany,
          targetRole
        })
      } else {
        if (!resumeText.trim()) {
          setError('Please paste your resume text before running the scan.')
          setAnalyzing(false)
          return
        }
        res = await axiosInstance.post('/graduate/ats-checker', {
          resumeText,
          jobDescription,
          targetCompany,
          targetRole
        })
      }

      if (res.data?.success && res.data.analysis) {
        setAnalysisResult(res.data.analysis)
        // Refresh ATS History
        const hRes = await axiosInstance.get('/graduate/ats-history').catch(() => ({}))
        if (hRes.data?.history) setAtsHistory(hRes.data.history)

        setTimeout(() => {
          const el = document.getElementById('ats-results-view')
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 150)
      } else {
        setError(res.data?.message || 'Failed to complete ATS scan.')
      }
    } catch (err) {
      console.error('ATS scan error:', err)
      setError(err.response?.data?.message || 'Failed to analyze resume. Please check your network and try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(''), 2500)
  }

  const score = analysisResult?.overallAtsScore || 0
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', paddingBottom: 60 }} className="s-anim-up">

      {/* HEADER BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e3a8a 100%)',
        borderRadius: 24,
        padding: '36px 36px',
        color: '#fff',
        marginBottom: 24,
        boxShadow: '0 16px 36px rgba(15,23,42,0.18)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: 780, position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#93c5fd', padding: '5px 14px', borderRadius: 99,
            fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: 12
          }}>
            <FiShield size={14} /> GRADUATE ATS SCANNER & KEYWORD ENGINE
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 10px', color: '#fff' }}>
            ATS SCORE CHECKER
          </h1>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: 14.5, lineHeight: 1.6 }}>
            Evaluate how hiring algorithms and recruiter parsers score your graduate profile & resume against target job descriptions.
          </p>
        </div>
      </div>

      {/* RESPONSIBLE DISCLAIMER NOTICE */}
      <div style={{
        marginBottom: 24, padding: '12px 18px', borderRadius: 14,
        background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a8a',
        fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10
      }}>
        <FiHelpCircle size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
        <span>
          <strong>ATS Compatibility Disclaimer:</strong> This score is an internal compatibility estimate based on resume readability and the supplied job description. Different employers use different ATS configurations.
        </span>
      </div>

      {/* INPUT SECTION GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 24, alignItems: 'start' }}>

        {/* LEFT COLUMN: RESUME SOURCE */}
        <SCard style={{ padding: 26, borderRadius: 20, background: '#fff', border: '1px solid var(--s-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
              1. Select Resume Source
            </h3>
            <span style={{ fontSize: 12, color: 'var(--s-text3)', fontWeight: 600 }}>Step 1 of 2</span>
          </div>

          <div style={{ display: 'flex', background: '#f1f5f9', padding: 4, borderRadius: 12, marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              style={{
                flex: 1, padding: '9px 12px', border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 800,
                cursor: 'pointer', background: activeTab === 'profile' ? '#fff' : 'transparent',
                color: activeTab === 'profile' ? '#2563eb' : '#64748b'
              }}
            >
              <FiZap size={13} style={{ marginRight: 4 }} /> Use Profile Telemetry
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              style={{
                flex: 1, padding: '9px 12px', border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 800,
                cursor: 'pointer', background: activeTab === 'upload' ? '#fff' : 'transparent',
                color: activeTab === 'upload' ? '#2563eb' : '#64748b'
              }}
            >
              <FiUploadCloud size={13} style={{ marginRight: 4 }} /> Upload PDF
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              style={{
                flex: 1, padding: '9px 12px', border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 800,
                cursor: 'pointer', background: activeTab === 'paste' ? '#fff' : 'transparent',
                color: activeTab === 'paste' ? '#2563eb' : '#64748b'
              }}
            >
              <FiFileText size={13} style={{ marginRight: 4 }} /> Paste Text
            </button>
          </div>

          {activeTab === 'profile' && (
            <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: 16, padding: 22, textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <FiZap size={22} />
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 6px' }}>
                Connected to Graduate Profile Telemetry
              </h4>
              <p style={{ fontSize: 13, color: 'var(--s-text3)', margin: '0 0 16px', lineHeight: 1.5 }}>
                Synthesizes your Degree, Specialization, Technical Skills, Projects, and Work Experience directly into ATS format.
              </p>
              <button
                type="button"
                onClick={() => navigate('/graduate/resume-builder')}
                style={{ background: '#fff', border: '1px solid var(--s-border)', color: 'var(--s-text)', padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                View / Edit Resume Builder →
              </button>
            </div>
          )}

          {activeTab === 'upload' && (
            <div>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 28, border: '2px dashed #94a3b8', borderRadius: 16, cursor: 'pointer', background: selectedFile ? '#f0fdf4' : '#f8fafc' }}>
                <input type="file" accept="application/pdf,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                <FiUploadCloud size={28} color={selectedFile ? '#166534' : '#64748b'} />
                {selectedFile ? (
                  <div style={{ marginTop: 8, fontSize: 13, fontWeight: 800, color: '#166534' }}>{selectedFile.name}</div>
                ) : (
                  <div style={{ marginTop: 8, fontSize: 13, fontWeight: 800, color: 'var(--s-text)' }}>Click to upload PDF resume (Max 5MB)</div>
                )}
              </label>
            </div>
          )}

          {activeTab === 'paste' && (
            <div>
              <textarea
                rows={9}
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Paste plain resume text here..."
                style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--s-border)', fontSize: 13, fontFamily: 'monospace', background: '#f8fafc' }}
              />
            </div>
          )}
        </SCard>

        {/* RIGHT COLUMN: JOB DESCRIPTION */}
        <SCard style={{ padding: 26, borderRadius: 20, background: '#fff', border: '1px solid var(--s-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
              2. Target Job Description (JD)
            </h3>
            <span style={{ fontSize: 12, color: 'var(--s-text3)', fontWeight: 600 }}>Step 2 of 2</span>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <input
              type="text"
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder="Target Role (e.g. Full Stack Developer)"
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--s-border)', fontSize: 12.5 }}
            />
            <input
              type="text"
              value={targetCompany}
              onChange={e => setTargetCompany(e.target.value)}
              placeholder="Company (e.g. TCS)"
              style={{ width: 140, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--s-border)', fontSize: 12.5 }}
            />
          </div>

          {/* Presets */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {presets.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                style={{
                  padding: '4px 10px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, border: '1px solid',
                  cursor: 'pointer',
                  background: selectedPresetId === p.id ? '#2563eb' : '#f8fafc',
                  color: selectedPresetId === p.id ? '#fff' : '#475569',
                  borderColor: selectedPresetId === p.id ? '#1d4ed8' : '#e2e8f0'
                }}
              >
                {p.title.split('(')[0].trim()}
              </button>
            ))}
          </div>

          <textarea
            rows={8}
            value={jobDescription}
            onChange={e => { setJobDescription(e.target.value); setSelectedPresetId('') }}
            placeholder="Paste job description requirements and technical keywords..."
            style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--s-border)', fontSize: 12.5, background: '#f8fafc' }}
          />

          {error && (
            <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: '#fef2f2', color: '#b91c1c', fontSize: 12.5 }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <SBtn
              variant="primary"
              onClick={handleRunAnalysis}
              disabled={analyzing}
              style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {analyzing ? 'Scanning Keywords...' : <><FiZap size={16} /> Run ATS Scan</>}
            </SBtn>
          </div>
        </SCard>

      </div>

      {/* ANALYSIS RESULTS SECTION */}
      {analysisResult && (
        <div id="ats-results-view" style={{ marginTop: 32 }} className="s-anim-up">
          
          <SCard style={{ padding: 32, borderRadius: 24, background: '#fff', border: '1px solid var(--s-border)', marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32, alignItems: 'center' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: 160, height: 160 }}>
                  <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="80" cy="80" r={radius} stroke="#e2e8f0" strokeWidth="12" fill="none" />
                    <circle
                      cx="80" cy="80" r={radius}
                      stroke={analysisResult.verdict.color}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--s-text)' }}>{score}%</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase' }}>ATS Score</span>
                  </div>
                </div>
              </div>

              <div>
                <span style={{ background: analysisResult.verdict.bg, color: analysisResult.verdict.color, border: `1px solid ${analysisResult.verdict.border}`, padding: '4px 12px', borderRadius: 99, fontSize: 12.5, fontWeight: 800 }}>
                  {analysisResult.verdict.level}
                </span>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--s-text)', margin: '8px 0 6px' }}>
                  Recruiter ATS Screening Verdict
                </h2>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  {analysisResult.verdict.summary}
                </p>
              </div>

            </div>
          </SCard>

          {/* KEYWORDS MATCHED VS MISSING */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            
            <SCard style={{ padding: 22, borderRadius: 18, background: '#fff', border: '1px solid var(--s-border)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiCheckCircle color="#166534" /> Matched Technical Keywords ({analysisResult.categoryScores.technicalSkills.matched.length})
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {analysisResult.categoryScores.technicalSkills.matched.map((m, idx) => (
                  <span key={idx} style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                    ✓ {m.skill || m}
                  </span>
                ))}
              </div>
            </SCard>

            <SCard style={{ padding: 22, borderRadius: 18, background: '#fff', border: '1px solid var(--s-border)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiAlertCircle color="#dc2626" /> Missing Keywords from JD ({analysisResult.categoryScores.technicalSkills.missing.length})
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {analysisResult.categoryScores.technicalSkills.missing.map((sk, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => copyToClipboard(sk, `sk_${idx}`)}
                    style={{ background: '#fff1f2', color: '#9f1239', border: '1px dashed #f43f5e', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    + {sk}
                  </button>
                ))}
              </div>
            </SCard>

          </div>

        </div>
      )}

      {/* HISTORY TABLE */}
      {atsHistory.length > 0 && (
        <SCard style={{ marginTop: 24, padding: 24, borderRadius: 20, background: '#fff', border: '1px solid var(--s-border)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiClock color="#2563eb" /> Recent ATS Scan History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {atsHistory.slice(0, 5).map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)' }}>{item.jobTitle || 'Custom Scan'}</div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>{item.company} • {new Date(item.scannedAt).toLocaleDateString()}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 900, color: item.overallScore >= 75 ? '#166534' : '#b45309' }}>
                  {item.overallScore}% Score
                </div>
              </div>
            ))}
          </div>
        </SCard>
      )}

    </div>
  )
}
