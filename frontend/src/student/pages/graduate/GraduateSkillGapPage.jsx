import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  FiZap, FiCheckCircle, FiAlertTriangle, FiTarget,
  FiArrowRight, FiLayers, FiTrendingUp, FiTool, FiBookOpen
} from 'react-icons/fi'
import graduateService from '../../../services/graduateService'

const POPULAR_TARGETS = [
  'Data Analyst', 'Full Stack Developer', 'Cloud DevOps Engineer',
  'Software Engineer', 'AI / ML Engineer', 'Business Analyst',
  'Cybersecurity Analyst', 'Product Specialist', 'Embedded Systems Engineer'
]

export default function GraduateSkillGapPage() {
  const [searchParams] = useSearchParams()
  const urlTarget = searchParams.get('target')

  const [loading, setLoading] = useState(true)
  const [targetRole, setTargetRole] = useState(urlTarget || 'Software Engineer')
  const [analysis, setAnalysis] = useState({
    targetRole: '',
    userSkills: [],
    missingCriticalSkills: [],
    recommendedTools: [],
    coursesSuggested: []
  })

  useEffect(() => {
    fetchGap()
  }, [])

  const fetchGap = async (customTarget) => {
    try {
      setLoading(true)
      const res = await graduateService.getSkillGap()
      if (res.success) {
        setAnalysis({
          targetRole: customTarget || res.targetRole || 'Software Engineer',
          userSkills: res.userSkills || [],
          missingCriticalSkills: res.missingCriticalSkills || [
            { name: 'System Design & Architecture', priority: 'High', reason: 'Critical for mid-level hiring' },
            { name: 'Docker & Containerization', priority: 'Medium', reason: 'Industry standard for modern deployments' },
            { name: 'REST API & Microservices', priority: 'High', reason: 'Required for backend integration' }
          ],
          recommendedTools: res.recommendedTools || ['Git & GitHub', 'Postman', 'Docker', 'Linux CLI', 'AWS Basics'],
          coursesSuggested: res.coursesSuggested || []
        })
        if (!customTarget && res.targetRole) {
          setTargetRole(res.targetRole)
        }
      }
    } catch (err) {
      console.error('Failed to load skill gap analysis:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTargetChange = (newTarget) => {
    setTargetRole(newTarget)
    fetchGap(newTarget)
  }

  // Calculate quick readiness match %
  const totalRelevant = (analysis.userSkills.length || 1) + (analysis.missingCriticalSkills.length || 1)
  const matchPercentage = Math.min(95, Math.max(35, Math.round((analysis.userSkills.length / totalRelevant) * 100)))

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 16, padding: '28px 32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FiZap size={16} /> Skill Gap & Industry Benchmarking
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 8px', color: '#fff' }}>
            Skill Gap for {targetRole}
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>
            Compare your verified college abilities against market hiring standards and bridge missing proficiencies.
          </p>
        </div>

        {/* Match Percentage Card */}
        <div style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 14, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Target Role Readiness</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: matchPercentage >= 70 ? '#10b981' : '#38bdf8' }}>
              {matchPercentage}%
            </div>
          </div>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: `conic-gradient(#2563eb ${matchPercentage * 3.6}deg, rgba(255,255,255,0.1) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>
              Fit
            </div>
          </div>
        </div>
      </div>

      {/* Target Selector */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '16px 20px',
        border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
          Select Target Role:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {POPULAR_TARGETS.map((role) => {
            const isSelected = targetRole.toLowerCase() === role.toLowerCase()
            return (
              <button
                key={role}
                onClick={() => handleTargetChange(role)}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none',
                  background: isSelected ? '#2563eb' : '#f1f5f9',
                  color: isSelected ? '#fff' : '#475569',
                  fontSize: 12.5, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                {role}
              </button>
            )
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>

        {/* Left Column: Skills You Possess */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 24,
          border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiCheckCircle size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Skills You Possess</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>From your verified profile</p>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, background: '#ecfdf5', color: '#065f46', padding: '3px 10px', borderRadius: 20 }}>
              {analysis.userSkills.length} Verified
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {analysis.userSkills.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>
                No technical skills logged yet.
                <div style={{ marginTop: 8 }}>
                  <Link to="/graduate/profile" style={{ color: '#2563eb', fontWeight: 700, fontSize: 13 }}>
                    + Update Skills in Profile
                  </Link>
                </div>
              </div>
            ) : (
              analysis.userSkills.map((sk, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FiCheckCircle size={15} color="#10b981" />
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a' }}>
                      {typeof sk === 'string' ? sk : sk.name}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: (typeof sk === 'object' && sk.proficiency === 'Advanced') ? '#ecfdf5' : '#eff6ff',
                    color: (typeof sk === 'object' && sk.proficiency === 'Advanced') ? '#059669' : '#2563eb'
                  }}>
                    {typeof sk === 'object' ? sk.proficiency : 'Intermediate'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Missing Critical Skills */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 24,
          border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiAlertTriangle size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Critical Skills Gap</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Required for competitive {targetRole} roles</p>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, background: '#fef2f2', color: '#991b1b', padding: '3px 10px', borderRadius: 20 }}>
              {analysis.missingCriticalSkills.length} High Impact
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {analysis.missingCriticalSkills.map((gap, idx) => {
              const skillName = typeof gap === 'string' ? gap : gap.name
              const priority = typeof gap === 'object' ? gap.priority : 'High'
              const reason = typeof gap === 'object' ? gap.reason : 'Essential for job qualifications'

              return (
                <div key={idx} style={{
                  padding: '12px 14px', borderRadius: 10, background: '#fefefe',
                  border: '1px solid #fecaca', display: 'flex', flexDirection: 'column', gap: 4
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
                      {skillName}
                    </span>
                    <span style={{
                      fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 12,
                      background: priority === 'High' ? '#fecaca' : '#fef3c7',
                      color: priority === 'High' ? '#b91c1c' : '#b45309',
                      textTransform: 'uppercase'
                    }}>
                      {priority} Priority
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{reason}</div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Tools & Recommendations Section */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: 24,
        border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiTool size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              Standard Industry Tools for {targetRole}
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
              Tools hiring recruiters look for on your resume
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          {analysis.recommendedTools.map((tool, idx) => (
            <div key={idx} style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
              padding: '8px 14px', fontSize: 13, fontWeight: 700, color: '#334155',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              🛠️ {tool}
            </div>
          ))}
        </div>

        {/* Action Call to Action */}
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          borderRadius: 12, padding: '18px 22px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14
        }}>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: '#1e40af' }}>
              Ready to Bridge These Gaps in 8 Weeks?
            </h4>
            <p style={{ margin: 0, fontSize: 13, color: '#1e3a8a' }}>
              Follow the structured 4-phase career roadmap with project-based milestones.
            </p>
          </div>
          <Link
            to="/graduate/roadmap"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#2563eb', color: '#fff', textDecoration: 'none',
              padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13.5,
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
            }}
          >
            Open 4-Phase Roadmap <FiArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  )
}
