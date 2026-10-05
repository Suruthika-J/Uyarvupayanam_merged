import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axiosInstance from '../../../config/axios'
import {
  FiFileText, FiCheckCircle, FiAlertCircle, FiZap, FiUploadCloud,
  FiCopy, FiCheck, FiArrowRight, FiRefreshCw, FiTrendingUp,
  FiAward, FiShield, FiBriefcase, FiExternalLink, FiInfo
} from 'react-icons/fi'
import { SCard, SBtn, SBadge, AIGenerating, AIFailure, SEmpty } from '../../components/ui'

export default function AtsResumeCheckerPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Input states
  const [activeTab, setActiveTab] = useState(searchParams.get('source') === 'profile' ? 'profile' : 'profile')
  const [resumeText, setResumeText] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [selectedPresetId, setSelectedPresetId] = useState('fullstack-dev')

  // Data & API states
  const [presets, setPresets] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [copiedKey, setCopiedKey] = useState('')

  // Load ATS presets on mount
  useEffect(() => {
    fetchPresets()
  }, [])

  const fetchPresets = async () => {
    try {
      const res = await axiosInstance.get('/study-tools/ats-presets')
      if (res.data?.success && res.data.presets) {
        setPresets(res.data.presets)
        const defaultPreset = res.data.presets.find(p => p.id === 'fullstack-dev') || res.data.presets[0]
        if (defaultPreset && !jobDescription) {
          setJobDescription(defaultPreset.description)
          setSelectedPresetId(defaultPreset.id)
        }
      }
    } catch (err) {
      console.warn('Failed to fetch ATS presets:', err)
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
        res = await axiosInstance.post('/study-tools/ats-checker', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else if (activeTab === 'profile') {
        res = await axiosInstance.post('/study-tools/ats-checker', {
          useProfile: true,
          jobDescription
        })
      } else {
        if (!resumeText.trim()) {
          setError('Please paste your resume text before running the scan.')
          setAnalyzing(false)
          return
        }
        res = await axiosInstance.post('/study-tools/ats-checker', {
          resumeText,
          jobDescription
        })
      }

      if (res.data?.success && res.data.analysis) {
        setAnalysisResult(res.data.analysis)
        // Scroll smoothly to results
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

  // Calculate Gauge stroke values
  const score = analysisResult?.overallAtsScore || 0
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', paddingBottom: 60 }} className="s-anim-up">

      {/* ── HEADER BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
        borderRadius: 24,
        padding: '36px 36px',
        color: '#fff',
        marginBottom: 28,
        boxShadow: '0 16px 36px rgba(15,23,42,0.18)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute', top: -50, right: -50, width: 220, height: 220,
          background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0) 70%)',
          borderRadius: '50%', pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: 760, position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(165,180,252,0.3)',
            color: '#c7d2fe', padding: '5px 14px', borderRadius: 99,
            fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: 12
          }}>
            <FiShield size={14} /> AI Applicant Tracking System Scanner
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 10px', color: '#fff', letterSpacing: '-0.02em' }}>
            Resume ATS Score & Keyword Match Checker
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 14.5, lineHeight: 1.6 }}>
            Evaluate how hiring algorithms, Fortune 500 ATS parsers (Workday, Taleo, Greenhouse), and technical recruiters score your resume against live job descriptions.
          </p>
        </div>
      </div>

      {/* ── INPUT SECTION GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 24, alignItems: 'start' }}>

        {/* LEFT COLUMN: RESUME SOURCE */}
        <SCard style={{ padding: 26, borderRadius: 20, background: '#fff', border: '1px solid var(--s-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
              1. Provide Your Resume Content
            </h3>
            <span style={{ fontSize: 12, color: 'var(--s-text3)', fontWeight: 600 }}>Step 1 of 2</span>
          </div>

          {/* Source Tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: 4, borderRadius: 12, marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              style={{
                flex: 1, padding: '9px 12px', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 800,
                cursor: 'pointer', transition: 'all 0.2s ease',
                background: activeTab === 'profile' ? '#fff' : 'transparent',
                color: activeTab === 'profile' ? 'var(--s-primary)' : '#64748b',
                boxShadow: activeTab === 'profile' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <FiZap size={13} style={{ marginRight: 6 }} /> Use My Profile Resume
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              style={{
                flex: 1, padding: '9px 12px', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 800,
                cursor: 'pointer', transition: 'all 0.2s ease',
                background: activeTab === 'upload' ? '#fff' : 'transparent',
                color: activeTab === 'upload' ? 'var(--s-primary)' : '#64748b',
                boxShadow: activeTab === 'upload' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <FiUploadCloud size={13} style={{ marginRight: 6 }} /> Upload PDF
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              style={{
                flex: 1, padding: '9px 12px', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 800,
                cursor: 'pointer', transition: 'all 0.2s ease',
                background: activeTab === 'paste' ? '#fff' : 'transparent',
                color: activeTab === 'paste' ? 'var(--s-primary)' : '#64748b',
                boxShadow: activeTab === 'paste' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <FiFileText size={13} style={{ marginRight: 6 }} /> Paste Text
            </button>
          </div>

          {/* TAB 1: Profile Telemetry Mode */}
          {activeTab === 'profile' && (
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1.5px dashed #cbd5e1', borderRadius: 16, padding: 22, textAlign: 'center'
            }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <FiZap size={22} />
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--s-text)', margin: '0 0 6px' }}>
                Connected to Student Profile Telemetry
              </h4>
              <p style={{ fontSize: 13, color: 'var(--s-text3)', margin: '0 0 16px', lineHeight: 1.5 }}>
                Will synthesize your real college records: Degree, CGPA, Verified Skills, Capstone Projects, and Certifications directly into ATS format.
              </p>
              <div style={{ display: 'inline-flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => navigate('/college/career/resume')}
                  style={{
                    background: '#fff', border: '1px solid var(--s-border)', color: 'var(--s-text)',
                    padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}
                >
                  <FiExternalLink size={13} /> View / Edit Generated Resume
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Upload PDF Mode */}
          {activeTab === 'upload' && (
            <div>
              <label
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: 28, border: '2px dashed #94a3b8', borderRadius: 16, cursor: 'pointer',
                  background: selectedFile ? '#f0fdf4' : '#f8fafc', borderColor: selectedFile ? '#22c55e' : '#cbd5e1',
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: selectedFile ? '#dcfce7' : '#e2e8f0', color: selectedFile ? '#166534' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <FiUploadCloud size={24} />
                </div>
                {selectedFile ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#166534' }}>{selectedFile.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {(selectedFile.size / 1024).toFixed(1)} KB — Ready for ATS analysis (Click to change)
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text)' }}>
                      Click to choose or drag & drop your PDF resume
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--s-text3)', marginTop: 4 }}>
                      Standard ATS text will be extracted directly from your PDF (Max 5MB)
                    </div>
                  </div>
                )}
              </label>
            </div>
          )}

          {/* TAB 3: Paste Text Mode */}
          {activeTab === 'paste' && (
            <div>
              <textarea
                rows={9}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your plain resume text here (Education, Experience, Skills, Projects, Summary)..."
                style={{
                  width: '100%', padding: 14, borderRadius: 12, border: '1px solid var(--s-border)',
                  fontSize: 13, fontFamily: 'monospace', lineHeight: 1.5, resize: 'vertical',
                  background: '#f8fafc'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--s-text3)', marginTop: 6 }}>
                <span>Words: {resumeText.trim().split(/\s+/).filter(Boolean).length}</span>
                <span>Characters: {resumeText.length}</span>
              </div>
            </div>
          )}
        </SCard>

        {/* RIGHT COLUMN: JOB DESCRIPTION (JD) */}
        <SCard style={{ padding: 26, borderRadius: 20, background: '#fff', border: '1px solid var(--s-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
              2. Target Job Description (JD)
            </h3>
            <span style={{ fontSize: 12, color: 'var(--s-text3)', fontWeight: 600 }}>Step 2 of 2</span>
          </div>

          <div style={{ fontSize: 12.5, color: 'var(--s-text3)', marginBottom: 12 }}>
            Select an industry job preset or paste a custom recruiter job description:
          </div>

          {/* Presets Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {presets.map((p) => {
              const isSelected = selectedPresetId === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  style={{
                    padding: '5px 10px', borderRadius: 8, fontSize: 11.5, fontWeight: 700,
                    border: '1px solid', cursor: 'pointer', transition: 'all 0.15s ease',
                    background: isSelected ? '#3b82f6' : '#f8fafc',
                    color: isSelected ? '#fff' : '#475569',
                    borderColor: isSelected ? '#2563eb' : '#e2e8f0'
                  }}
                >
                  {p.title.split('(')[0].trim()}
                </button>
              )
            })}
          </div>

          <textarea
            rows={8}
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value)
              setSelectedPresetId('')
            }}
            placeholder="Paste the job requirements, responsibilities, and required technical skills..."
            style={{
              width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--s-border)',
              fontSize: 12.5, lineHeight: 1.5, resize: 'vertical', background: '#f8fafc'
            }}
          />

          {error && (
            <div style={{
              marginTop: 14, padding: 12, borderRadius: 10, background: '#fef2f2',
              color: '#b91c1c', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8
            }}>
              <FiAlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          <div style={{ marginTop: 18 }}>
            <SBtn
              variant="primary"
              onClick={handleRunAnalysis}
              disabled={analyzing}
              style={{
                width: '100%', padding: '13px 20px', borderRadius: 12,
                fontSize: 14.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              {analyzing ? (
                <>
                  <div style={{ width: 18, height: 18, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Analyzing ATS Keywords & Parsing...
                </>
              ) : (
                <>
                  <FiZap size={16} /> Run Instant ATS Score Check
                </>
              )}
            </SBtn>
          </div>
        </SCard>

      </div>

      {/* ── ANALYSIS RESULTS SECTION ── */}
      {analysisResult && (
        <div id="ats-results-view" style={{ marginTop: 36 }} className="s-anim-up">

          {/* MAIN VERDICT & GAUGE CARD */}
          <SCard style={{
            padding: 36, borderRadius: 24, background: '#fff', border: '1px solid var(--s-border)',
            marginBottom: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 36, alignItems: 'center' }}>
              
              {/* Circular Gauge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: 170, height: 170 }}>
                  <svg width="170" height="170" viewBox="0 0 170 170" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="85" cy="85" r={radius}
                      stroke="#e2e8f0" strokeWidth="12" fill="none"
                    />
                    <circle
                      cx="85" cy="85" r={radius}
                      stroke={analysisResult.verdict.color}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                    />
                  </svg>
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: 38, fontWeight: 900, color: 'var(--s-text)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                      {score}%
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text3)', textTransform: 'uppercase', marginTop: 4 }}>
                      ATS Match Score
                    </span>
                  </div>
                </div>
              </div>

              {/* Verdict Details */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    background: analysisResult.verdict.bg, color: analysisResult.verdict.color,
                    border: `1px solid ${analysisResult.verdict.border}`,
                    padding: '4px 14px', borderRadius: 99, fontSize: 13, fontWeight: 800, letterSpacing: '0.02em'
                  }}>
                    {analysisResult.verdict.level}
                  </span>
                  <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 700 }}>
                    {analysisResult.detectedSkillsSummary?.matchRatio}
                  </span>
                </div>

                <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--s-text)', margin: '4px 0 10px' }}>
                  ATS Recruiter Screening Outlook
                </h2>

                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: '0 0 18px' }}>
                  {analysisResult.verdict.summary}
                </p>

                {/* Quick Telemetry Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 14px', borderRadius: 10, fontSize: 12.5 }}>
                    <strong style={{ color: '#059669' }}>{analysisResult.categoryScores.technicalSkills.matched.length}</strong> Matched Tech Skills
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 14px', borderRadius: 10, fontSize: 12.5 }}>
                    <strong style={{ color: '#dc2626' }}>{analysisResult.categoryScores.technicalSkills.missing.length}</strong> Missing Tech Keywords
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 14px', borderRadius: 10, fontSize: 12.5 }}>
                    <strong style={{ color: '#2563eb' }}>{analysisResult.categoryScores.impact.verbCount}</strong> Power Action Verbs
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 14px', borderRadius: 10, fontSize: 12.5 }}>
                    <strong style={{ color: '#7c3aed' }}>{analysisResult.categoryScores.formatting.wordCount}</strong> Word Count
                  </div>
                </div>
              </div>

            </div>
          </SCard>

          {/* ── 5 CATEGORY METRIC BREAKDOWN ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              {
                title: 'Technical Skills',
                score: analysisResult.categoryScores.technicalSkills.score,
                weight: '35%',
                color: '#2563eb'
              },
              {
                title: 'Section Completeness',
                score: analysisResult.categoryScores.structure.score,
                weight: '20%',
                color: '#059669'
              },
              {
                title: 'Action & Impact',
                score: analysisResult.categoryScores.impact.score,
                weight: '20%',
                color: '#7c3aed'
              },
              {
                title: 'Formatting & Length',
                score: analysisResult.categoryScores.formatting.score,
                weight: '15%',
                color: '#d97706'
              },
              {
                title: 'Soft Skills Alignment',
                score: analysisResult.categoryScores.softSkills.score,
                weight: '10%',
                color: '#0284c7'
              }
            ].map((cat, idx) => (
              <SCard key={idx} style={{ padding: 18, borderRadius: 16, background: '#fff', border: '1px solid var(--s-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--s-text3)' }}>{cat.title}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8' }}>{cat.weight}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: cat.color, marginBottom: 8 }}>
                  {cat.score}%
                </div>
                <div style={{ height: 6, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${cat.score}%`, height: '100%', background: cat.color, borderRadius: 99, transition: 'width 0.6s ease' }} />
                </div>
              </SCard>
            ))}
          </div>

          {/* ── KEYWORD COMPARISON SECTION (MATCHED VS MISSING) ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            
            {/* Matched Keywords */}
            <SCard style={{ padding: 24, borderRadius: 20, background: '#fff', border: '1px solid var(--s-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiCheckCircle size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                    Matched Keywords in Resume ({analysisResult.categoryScores.technicalSkills.matched.length})
                  </h3>
                  <div style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>Successfully parsed by ATS algorithms</div>
                </div>
              </div>

              {analysisResult.categoryScores.technicalSkills.matched.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {analysisResult.categoryScores.technicalSkills.matched.map((item, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0',
                        padding: '5px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', gap: 6
                      }}
                    >
                      <FiCheck size={13} /> {item.skill}
                      {item.countInResume > 1 && (
                        <span style={{ fontSize: 10, background: '#a7f3d0', color: '#065f46', padding: '1px 5px', borderRadius: 99 }}>
                          {item.countInResume}x
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--s-text3)', fontStyle: 'italic' }}>
                  No exact matching keywords found for this job description.
                </div>
              )}
            </SCard>

            {/* Missing Critical Keywords */}
            <SCard style={{ padding: 24, borderRadius: 20, background: '#fff', border: '1px solid var(--s-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fee2e2', color: '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiAlertCircle size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                    Missing Keywords from JD ({analysisResult.categoryScores.technicalSkills.missing.length})
                  </h3>
                  <div style={{ fontSize: 12, color: '#991b1b', fontWeight: 600 }}>Add these to boost ATS indexing</div>
                </div>
              </div>

              {analysisResult.categoryScores.technicalSkills.missing.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {analysisResult.categoryScores.technicalSkills.missing.map((skill, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => copyToClipboard(skill, `skill_${idx}`)}
                      title="Click to copy keyword"
                      style={{
                        background: '#fff1f2', color: '#9f1239', border: '1px dashed #f43f5e',
                        padding: '5px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {copiedKey === `skill_${idx}` ? <FiCheck size={13} /> : <FiCopy size={12} />}
                      + {skill}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#047857', fontWeight: 700 }}>
                  🎉 Awesome! All primary required technical keywords were detected in your resume.
                </div>
              )}
            </SCard>

          </div>

          {/* ── AI IMPROVEMENT RECOMMENDATIONS & STRUCTURAL AUDIT ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, marginBottom: 24 }}>
            
            {/* AI Action Recommendations */}
            <SCard style={{ padding: 26, borderRadius: 20, background: '#fff', border: '1px solid var(--s-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <FiZap size={18} style={{ color: '#eab308' }} />
                <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                  AI ATS Optimization Recommendations
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {analysisResult.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 14, borderRadius: 12, border: '1px solid',
                      background: rec.type === 'high_priority' ? '#fffbeb' : '#f8fafc',
                      borderColor: rec.type === 'high_priority' ? '#fde68a' : '#e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--s-text)' }}>
                        {rec.title}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 800, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 99,
                        background: rec.type === 'high_priority' ? '#fef3c7' : '#e2e8f0',
                        color: rec.type === 'high_priority' ? '#92400e' : '#475569'
                      }}>
                        {rec.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p style={{ fontSize: 12.5, color: '#475569', margin: 0, lineHeight: 1.5 }}>
                      {rec.desc}
                    </p>
                  </div>
                ))}
              </div>
            </SCard>

            {/* Structural Compliance Checklist */}
            <SCard style={{ padding: 26, borderRadius: 20, background: '#fff', border: '1px solid var(--s-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <FiShield size={18} style={{ color: '#059669' }} />
                <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                  ATS Section Compliance Audit
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {analysisResult.categoryScores.structure.checks.map((chk, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0'
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: chk.passed ? 'var(--s-text)' : '#64748b' }}>
                      {chk.label}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99,
                      background: chk.passed ? '#dcfce7' : '#fee2e2',
                      color: chk.passed ? '#15803d' : '#b91c1c'
                    }}>
                      {chk.passed ? '✓ Present' : '✗ Missing'}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20, padding: 14, background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#1e40af', marginBottom: 4 }}>
                  💡 ATS Pro-Tip for College Students:
                </div>
                <div style={{ fontSize: 12, color: '#1e3a8a', lineHeight: 1.45 }}>
                  Always avoid multi-column templates or tables with text boxes. Use standard headers (Education, Skills, Projects, Certifications) so parsers map your credentials seamlessly.
                </div>
              </div>
            </SCard>

          </div>

          {/* ── GENERATED ROLE-TAILORED BULLET POINTS ── */}
          {analysisResult.suggestedBulletPoints?.length > 0 && (
            <SCard style={{ padding: 26, borderRadius: 20, background: '#fff', border: '1px solid var(--s-border)', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 4px' }}>
                    ✨ AI-Generated ATS-Optimized Bullet Points
                  </h3>
                  <p style={{ fontSize: 12.5, color: 'var(--s-text3)', margin: 0 }}>
                    Copy and incorporate these tailored accomplishment lines directly into your projects or experience section:
                  </p>
                </div>
                <SBtn
                  variant="secondary"
                  onClick={() => navigate('/college/career/resume')}
                  style={{ borderRadius: 10, fontSize: 12, padding: '6px 14px' }}
                >
                  Apply in Resume Builder <FiArrowRight size={13} style={{ marginLeft: 6 }} />
                </SBtn>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {analysisResult.suggestedBulletPoints.map((bullet, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14,
                      padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0'
                    }}
                  >
                    <span style={{ fontSize: 13, color: 'var(--s-text)', lineHeight: 1.5 }}>
                      • {bullet}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bullet, `bullet_${idx}`)}
                      style={{
                        background: copiedKey === `bullet_${idx}` ? '#dcfce7' : '#fff',
                        border: '1px solid var(--s-border)', color: copiedKey === `bullet_${idx}` ? '#15803d' : '#475569',
                        padding: '6px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0
                      }}
                    >
                      {copiedKey === `bullet_${idx}` ? <FiCheck size={12} /> : <FiCopy size={12} />}
                      {copiedKey === `bullet_${idx}` ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </SCard>
          )}

          {/* ACTION CTA ROW */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 10 }}>
            <SBtn
              variant="secondary"
              onClick={() => {
                setAnalysisResult(null)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              style={{ borderRadius: 12, padding: '10px 20px', fontWeight: 800 }}
            >
              <FiRefreshCw size={14} style={{ marginRight: 6 }} /> Test Another Resume / Job
            </SBtn>
            <SBtn
              variant="primary"
              onClick={() => navigate('/college/career/resume')}
              style={{ borderRadius: 12, padding: '10px 24px', fontWeight: 800 }}
            >
              <FiFileText size={15} style={{ marginRight: 6 }} /> Open Resume Builder to Update Profile
            </SBtn>
          </div>

        </div>
      )}

    </div>
  )
}
