import React, { useState, useEffect } from 'react'
import {
  FiTrendingUp, FiCode, FiAward, FiBookOpen,
  FiExternalLink, FiLayers, FiCheckCircle, FiGithub, FiZap, FiHelpCircle
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import graduateService from '../../../services/graduateService'
import {
  generatePersonalizedCareers,
  generatePersonalizedSkillGap,
  getEffectiveAcademicHierarchy
} from '../../services/graduatePersonalizationEngine'
import GraduateCourseImage from '../../components/common/GraduateCourseImage'

export default function GraduateUpskillingPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({})
  const [activeTab, setActiveTab] = useState('projects')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await graduateService.getProfile()
      if (res.success && res.profile) setProfile(res.profile)
    } catch (err) {
      console.error('Failed to load profile for upskilling:', err)
    } finally {
      setLoading(false)
    }
  }

  const academic = getEffectiveAcademicHierarchy(profile)
  const careers = generatePersonalizedCareers(profile)
  const topCareer = careers[0]
  const skillGap = generatePersonalizedSkillGap(profile, topCareer?.title)

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #115e59 100%)',
        borderRadius: 16, padding: '28px 32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)'
      }}>
        <div style={{ maxWidth: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#5eead4', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FiTrendingUp size={16} /> PROFILE-DRIVEN UPSKILLING HUB
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 8px', color: '#fff' }}>
            Personalized Upskilling for {academic.degree} in {academic.domain}
          </h1>
          <p style={{ margin: 0, color: '#ccfbf1', fontSize: 14, lineHeight: 1.5 }}>
            Acquire missing skills (<strong>{skillGap.missingCriticalSkills.slice(0, 3).join(', ')}</strong>) to qualify for {topCareer?.title || 'target roles'}.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        <button
          onClick={() => setActiveTab('projects')}
          style={{
            padding: '8px 18px', borderRadius: 20, border: 'none',
            background: activeTab === 'projects' ? '#0f172a' : '#f1f5f9',
            color: activeTab === 'projects' ? '#fff' : '#475569',
            fontWeight: 700, fontSize: 13, cursor: 'pointer'
          }}
        >
          🚀 Portfolio Capstone Projects
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          style={{
            padding: '8px 18px', borderRadius: 20, border: 'none',
            background: activeTab === 'modules' ? '#0d9488' : '#f1f5f9',
            color: activeTab === 'modules' ? '#fff' : '#475569',
            fontWeight: 700, fontSize: 13, cursor: 'pointer'
          }}
        >
          📚 Target Skill Modules
        </button>
      </div>

      {/* Content */}
      {activeTab === 'projects' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
          {[
            {
              title: `${topCareer?.title || 'Domain'} Capstone Engine`,
              domain: academic.domain,
              techStack: topCareer?.requiredSkills.slice(0, 4).join(', ') || 'Python, SQL, Excel',
              description: `Build an end-to-end industry solution demonstrating ${academic.domain} methodologies and data persistence.`,
              impact: `Directly proves candidacy for entry-level and junior ${topCareer?.title} applications.`
            },
            {
              title: `Real-Time Data & Analytics Dashboard`,
              domain: 'Analytics & Reporting',
              techStack: 'Python, SQL, Power BI, Excel, Pandas',
              description: 'Process multi-source datasets into executive business dashboards with key performance metrics.',
              impact: 'Showcases capability to turn raw technical data into business decisions.'
            }
          ].map((proj, idx) => (
            <div key={idx} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ marginBottom: 12 }}>
                  <GraduateCourseImage course={proj} height={160} borderRadius={12} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#ccfbf1', color: '#0f766e', padding: '3px 10px', borderRadius: 20 }}>
                  {proj.domain}
                </span>
                <h3 style={{ margin: '8px 0 6px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  {proj.title}
                </h3>
                <div style={{ fontSize: 12, color: '#0d9488', fontWeight: 700, marginBottom: 10 }}>
                  Tech Stack: {proj.techStack}
                </div>
                <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                  {proj.description}
                </p>
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, fontSize: 12, color: '#334155', borderLeft: '3px solid #0d9488' }}>
                  <strong>Impact:</strong> {proj.impact}
                </div>
              </div>

              <div style={{ paddingTop: 14, marginTop: 14, borderTop: '1px solid #f1f5f9' }}>
                <Link to="/graduate/placement" style={{ fontSize: 13, fontWeight: 700, color: '#0d9488', textDecoration: 'none' }}>
                  Add to Resume & Placement Portfolio →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {skillGap.learningModules.map((mod) => (
            <div key={mod.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20 }}>
              <div style={{ marginBottom: 12 }}>
                <GraduateCourseImage course={{ title: mod.resourceTitle, skill: mod.skill }} height={150} borderRadius={10} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#0d9488', background: '#ccfbf1', padding: '2px 8px', borderRadius: 6, display: 'inline-block', marginBottom: 8 }}>
                Step #{mod.step} • {mod.estimatedWeeks} Weeks
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{mod.resourceTitle}</h4>
              <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 12px' }}>{mod.whyRequired}</p>
              <button style={{ background: '#0d9488', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                {mod.actionLabel}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
