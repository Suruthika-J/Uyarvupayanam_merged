import React, { useState, useEffect } from 'react'
import {
  FiFileText, FiDownload, FiCheckCircle, FiAlertCircle,
  FiPrinter, FiPlus, FiTrash2, FiAward, FiZap
} from 'react-icons/fi'
import graduateService from '../../../services/graduateService'

export default function GraduateResumePage() {
  const [resumeData, setResumeData] = useState({
    fullName: 'Arun Kumar',
    targetTitle: 'Associate Software Engineer / Data Analyst',
    email: 'arun.graduate@example.com',
    phone: '+91 98765 43210',
    location: 'Chennai, India',
    linkedin: 'linkedin.com/in/arunkumar',
    github: 'github.com/arunkumar',
    summary: 'Proactive engineering graduate with strong analytical foundations in Python, SQL, and Full-Stack development. Experienced in building responsive web applications and REST APIs, seeking to apply scalable software practices.',
    education: {
      degree: 'B.E. Mechanical Engineering',
      college: 'Anna University Campus, Chennai',
      year: '2025',
      cgpa: '8.4 / 10.0'
    },
    skills: ['Python', 'JavaScript', 'React.js', 'Node.js', 'PostgreSQL', 'Git & GitHub', 'Docker', 'RESTful APIs'],
    projects: [
      {
        title: 'Distributed Task Queue & Notification Engine',
        tech: 'Node.js, Redis, MongoDB, Docker',
        bullets: [
          'Engineered an asynchronous worker queue handling 5,000+ daily mock notifications with Redis BullMQ.',
          'Reduced API latency by 35% through background offloading and optimized database queries.',
          'Configured containerized deployments using Docker and GitHub Actions CI/CD pipeline.'
        ]
      },
      {
        title: 'Interactive Sales Analytics & Forecasting Dashboard',
        tech: 'Python, Streamlit, Pandas, Scikit-Learn',
        bullets: [
          'Built an end-to-end data pipeline transforming 200,000+ transactional records.',
          'Implemented linear regression models predicting quarterly sales trends with 89% accuracy.',
          'Deployed interactive dashboard reducing executive report generation time from 3 hours to instant.'
        ]
      }
    ],
    experience: [
      {
        role: 'Software Development Intern',
        company: 'NexTech Solutions',
        duration: 'Jan 2025 – May 2025',
        bullets: [
          'Collaborated in a 6-member sprint team to build reusable React UI components.',
          'Integrated 12 REST API endpoints with authentication tokens and input validation.'
        ]
      }
    ]
  })

  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    // Pre-populate with profile if available
    graduateService.getProfile().then((res) => {
      if (res.success && res.profile) {
        const p = res.profile
        setResumeData((prev) => ({
          ...prev,
          fullName: p.userId?.name || prev.fullName,
          education: {
            degree: p.degree ? `${p.degree} in ${p.specialization || p.domain || ''}` : prev.education.degree,
            college: p.college || prev.education.college,
            year: p.graduationYear || prev.education.year,
            cgpa: p.cgpa ? `${p.cgpa} / 10.0` : prev.education.cgpa
          },
          skills: p.technicalSkills?.length ? p.technicalSkills.map(s => s.name) : prev.skills
        }))
      }
    }).catch(() => {})
  }, [])

  // Calculate ATS suggestions and score
  const calculateAtsScore = () => {
    let score = 50
    const suggestions = []

    // 1. Contact details
    if (resumeData.email && resumeData.phone && resumeData.linkedin) {
      score += 10
    } else {
      suggestions.push('Add full contact info: Email, Phone, and LinkedIn profile.')
    }

    // 2. Summary
    if (resumeData.summary.length > 80) {
      score += 10
    } else {
      suggestions.push('Expand professional summary to 2-3 sentences emphasizing your skills and value proposition.')
    }

    // 3. Skills count
    if (resumeData.skills.length >= 6) {
      score += 10
    } else {
      suggestions.push('Include at least 6 relevant technical skills and tools.')
    }

    // 4. Quantified bullet points (checks for % or numbers)
    const allBullets = [
      ...resumeData.projects.flatMap(p => p.bullets),
      ...resumeData.experience.flatMap(e => e.bullets)
    ]
    const hasNumbers = allBullets.some(b => /\d+|%/.test(b))
    if (hasNumbers) {
      score += 10
    } else {
      suggestions.push('Quantify your bullet points with numbers, percentages, or measurable outcomes (e.g. "Reduced time by 30%").')
    }

    // 5. Strong action verbs
    const actionVerbs = ['Engineered', 'Built', 'Optimized', 'Developed', 'Collaborated', 'Designed', 'Implemented', 'Created', 'Deployed']
    const hasActionVerbs = allBullets.some(b => actionVerbs.some(v => b.toLowerCase().includes(v.toLowerCase())))
    if (hasActionVerbs) {
      score += 10
    } else {
      suggestions.push('Begin each bullet point with strong action verbs (e.g. Engineered, Architected, Optimized).')
    }

    return { score: Math.min(100, score), suggestions }
  }

  const { score: atsScore, suggestions } = calculateAtsScore()

  const handlePrint = () => {
    window.print()
  }

  const handleAddSkill = () => {
    if (!newSkill.trim()) return
    if (!resumeData.skills.includes(newSkill.trim())) {
      setResumeData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }))
    }
    setNewSkill('')
  }

  const handleRemoveSkill = (idx) => {
    setResumeData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Banner (hidden on print) */}
      <div className="no-print" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 16, padding: '24px 30px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8', fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>
            <FiFileText size={16} /> ATS-Optimized Resume Builder
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '4px 0 6px', color: '#fff' }}>
            Graduate Resume & ATS Audit
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 13.5 }}>
            Clean, single-column ATS-friendly design that parses cleanly in recruiter Applicant Tracking Systems.
          </p>
        </div>

        <button
          onClick={handlePrint}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#2563eb', color: '#fff', border: 'none',
            padding: '11px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14,
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
          }}
        >
          <FiPrinter size={16} /> Print / Save as PDF
        </button>
      </div>

      {/* ATS Audit Score Card (hidden on print) */}
      <div className="no-print" style={{
        background: '#fff', borderRadius: 16, padding: 22,
        border: '1px solid #e2e8f0', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: atsScore >= 80 ? '#ecfdf5' : '#eff6ff',
            color: atsScore >= 80 ? '#059669' : '#2563eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 900, border: `2px solid ${atsScore >= 80 ? '#10b981' : '#3b82f6'}`
          }}>
            {atsScore}%
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
              ATS-Friendly Content Rating
            </div>
            <div style={{ fontSize: 12.5, color: '#64748b' }}>
              Single-column, text-parsable format with standard taxonomy headings
            </div>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div style={{ flex: 1, minWidth: 260, borderLeft: '1px solid #f1f5f9', paddingLeft: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#d97706', marginBottom: 4 }}>
              Optimization Suggestions:
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#475569', lineHeight: 1.4 }}>
              {suggestions.map((sug, idx) => <li key={idx}>{sug}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Quick Skills Editor Bar (hidden on print) */}
      <div className="no-print" style={{ background: '#fff', padding: '16px 20px', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Manage Skills:</span>
        <div style={{ display: 'flex', gap: 6, flex: 1, minWidth: 240 }}>
          <input
            type="text"
            placeholder="Add skill (e.g. AWS, Django)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
          />
          <button onClick={handleAddSkill} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '0 12px', cursor: 'pointer' }}>
            <FiPlus size={14} />
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {resumeData.skills.map((sk, idx) => (
            <span key={idx} style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: 6, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              {sk} <span onClick={() => handleRemoveSkill(idx)} style={{ cursor: 'pointer', color: '#ef4444' }}>×</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── THE PRINTABLE RESUME PREVIEW CONTAINER ── */}
      <div
        id="resume-canvas"
        style={{
          background: '#fff',
          maxWidth: 820,
          margin: '0 auto',
          width: '100%',
          padding: '40px 48px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#1e293b',
          lineHeight: 1.5
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 14, marginBottom: 16 }}>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 900, letterSpacing: '0.02em', color: '#0f172a' }}>
            {resumeData.fullName.toUpperCase()}
          </h1>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', marginBottom: 6 }}>
            {resumeData.targetTitle}
          </div>
          <div style={{ fontSize: 11.5, color: '#475569', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span>{resumeData.email}</span>
            <span>•</span>
            <span>{resumeData.phone}</span>
            <span>•</span>
            <span>{resumeData.location}</span>
            <span>•</span>
            <span>{resumeData.linkedin}</span>
            <span>•</span>
            <span>{resumeData.github}</span>
          </div>
        </div>

        {/* Section: Professional Summary */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 13.5, fontWeight: 900, textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.04em', borderBottom: '1px solid #cbd5e1', paddingBottom: 2 }}>
            Professional Summary
          </h2>
          <p style={{ margin: 0, fontSize: 12.5, color: '#334155', lineHeight: 1.5 }}>
            {resumeData.summary}
          </p>
        </div>

        {/* Section: Education */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 13.5, fontWeight: 900, textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.04em', borderBottom: '1px solid #cbd5e1', paddingBottom: 2 }}>
            Education
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{resumeData.education.degree}</div>
              <div style={{ fontSize: 12, color: '#475569' }}>{resumeData.education.college}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{resumeData.education.year}</div>
              <div style={{ fontSize: 12, color: '#475569' }}>CGPA: {resumeData.education.cgpa}</div>
            </div>
          </div>
        </div>

        {/* Section: Technical Skills */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 13.5, fontWeight: 900, textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.04em', borderBottom: '1px solid #cbd5e1', paddingBottom: 2 }}>
            Technical Proficiencies
          </h2>
          <div style={{ fontSize: 12.5, color: '#334155' }}>
            <strong>Core Skills & Technologies:</strong> {resumeData.skills.join(', ')}
          </div>
        </div>

        {/* Section: Projects */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 13.5, fontWeight: 900, textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.04em', borderBottom: '1px solid #cbd5e1', paddingBottom: 2 }}>
            Key Projects
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {resumeData.projects.map((proj, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{proj.title}</span>
                  <span style={{ fontSize: 11.5, color: '#64748b', fontStyle: 'italic' }}>Tech: {proj.tech}</span>
                </div>
                <ul style={{ margin: '3px 0 0', paddingLeft: 18, fontSize: 12, color: '#334155' }}>
                  {proj.bullets.map((b, bIdx) => <li key={bIdx} style={{ marginBottom: 2 }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Experience & Internships */}
        <div>
          <h2 style={{ margin: '0 0 8px', fontSize: 13.5, fontWeight: 900, textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.04em', borderBottom: '1px solid #cbd5e1', paddingBottom: 2 }}>
            Experience & Internships
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {resumeData.experience.map((exp, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{exp.role} — {exp.company}</span>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>{exp.duration}</span>
                </div>
                <ul style={{ margin: '3px 0 0', paddingLeft: 18, fontSize: 12, color: '#334155' }}>
                  {exp.bullets.map((b, bIdx) => <li key={bIdx} style={{ marginBottom: 2 }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print, header, aside, nav, button {
            display: none !important;
          }
          body, .student-root, main {
            background: #fff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #resume-canvas {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}
