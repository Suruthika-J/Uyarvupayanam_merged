import React, { useState, useEffect } from 'react'
import {
  FiBriefcase, FiTrendingUp, FiArrowRight, FiCheckCircle,
  FiZap, FiCompass, FiAward, FiLayers, FiDollarSign, FiClock,
  FiChevronRight, FiFilter, FiExternalLink
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import graduateService from '../../../services/graduateService'

export default function GraduateCareersPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    education: null,
    currentSkills: [],
    directCareers: [],
    transitionCareers: [],
    advice: ''
  })
  const [activeTab, setActiveTab] = useState('all') // 'all', 'direct', 'transition'
  const [selectedCareer, setSelectedCareer] = useState(null)

  useEffect(() => {
    fetchCareers()
  }, [])

  const fetchCareers = async () => {
    try {
      setLoading(true)
      const res = await graduateService.getCareers()
      if (res.success) {
        setData({
          education: res.education || null,
          currentSkills: res.currentSkills || [],
          directCareers: res.directCareers || [],
          transitionCareers: res.transitionCareers || [],
          advice: res.advice || ''
        })
      }
    } catch (err) {
      console.error('Failed to load graduate careers:', err)
    } finally {
      setLoading(false)
    }
  }

  const directList = data.directCareers || []
  const transitionList = data.transitionCareers || []

  const displayList =
    activeTab === 'direct'
      ? directList
      : activeTab === 'transition'
      ? transitionList
      : [...directList, ...transitionList]

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
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        borderRadius: 16, padding: '28px 32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)'
      }}>
        <div style={{ maxWidth: 720 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#93c5fd', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FiCompass size={16} /> Graduate Career Trajectories
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 8px', color: '#fff' }}>
            Career Pathways for {data.education?.degree || 'Graduates'}
          </h1>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: 14, lineHeight: 1.5 }}>
            {data.advice || 'Explore direct core engineering/science tracks or pivot into high-demand cross-domain roles with transferrable skills.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link
            to="/graduate/skill-gap"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#2563eb', color: '#fff', textDecoration: 'none',
              padding: '11px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13.5,
              boxShadow: '0 4px 12px rgba(37,99,235,0.4)'
            }}
          >
            <FiZap size={16} /> Analyze Skill Gap
          </Link>
          <Link
            to="/graduate/ai-advisor"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.12)', color: '#fff', textDecoration: 'none',
              padding: '11px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13.5,
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            Ask AI Advisor
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '8px 18px', borderRadius: 20, border: 'none',
            background: activeTab === 'all' ? '#0f172a' : '#f1f5f9',
            color: activeTab === 'all' ? '#fff' : '#475569',
            fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s'
          }}
        >
          All Pathways ({directList.length + transitionList.length})
        </button>
        <button
          onClick={() => setActiveTab('direct')}
          style={{
            padding: '8px 18px', borderRadius: 20, border: 'none',
            background: activeTab === 'direct' ? '#2563eb' : '#f1f5f9',
            color: activeTab === 'direct' ? '#fff' : '#475569',
            fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s'
          }}
        >
          🎯 Direct Core Tracks ({directList.length})
        </button>
        <button
          onClick={() => setActiveTab('transition')}
          style={{
            padding: '8px 18px', borderRadius: 20, border: 'none',
            background: activeTab === 'transition' ? '#7c3aed' : '#f1f5f9',
            color: activeTab === 'transition' ? '#fff' : '#475569',
            fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s'
          }}
        >
          ⚡ Career Switching (Cross-Domain) ({transitionList.length})
        </button>
      </div>

      {/* Section Explainer Banner if switching selected */}
      {activeTab === 'transition' && (
        <div style={{
          background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 12,
          padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FiZap size={18} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#581c87' }}>
              Switching from Non-CS to Tech / Data / Product
            </h4>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b21a8', lineHeight: 1.5 }}>
              Over 40% of tech and analytics professionals started in mechanical, civil, electrical, or science degrees.
              Your mathematical intuition, problem-solving, and domain knowledge are your <strong>superpowers</strong>.
              Below are the fastest transition paths with the exact bridge skills you need.
            </p>
          </div>
        </div>
      )}

      {/* Career Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
        {displayList.map((career, idx) => {
          const isTransition = career.type === 'transition' || career.isAlternate
          return (
            <div
              key={idx}
              style={{
                background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
                padding: 24, display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', position: 'relative',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              {/* Card Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20,
                    background: isTransition ? '#f3e8ff' : '#eff6ff',
                    color: isTransition ? '#7c3aed' : '#2563eb',
                    textTransform: 'uppercase', letterSpacing: '0.04em'
                  }}>
                    {isTransition ? '⚡ Cross-Domain Switch' : '🎯 Direct Match'}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: 6 }}>
                    {career.demand || 'High Demand'}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  {career.title || career.careerName || 'Software Specialist'}
                </h3>
                <p style={{ margin: '0 0 14px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                  {career.description || career.summary || 'Design and implement industry-standard solutions with cutting-edge tools.'}
                </p>

                {/* Metrics */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                  background: '#f8fafc', padding: '10px 14px', borderRadius: 10, marginBottom: 16
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Starting CTC</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                      {career.salaryRange || '₹4.5 - 9 LPA'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                      {isTransition ? 'Transition Time' : 'Experience Needed'}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                      {career.timeline || (isTransition ? '3 - 5 Months' : 'Fresher Friendly')}
                    </div>
                  </div>
                </div>

                {/* Transferable & Bridge Skills if transition */}
                {isTransition && career.transferableSkills && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: 4 }}>
                      ✓ Your Transferable Strengths:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {career.transferableSkills.map((ts, sIdx) => (
                        <span key={sIdx} style={{ fontSize: 11, background: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: 4 }}>
                          {ts}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Required Skills / Bridge Skills */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isTransition ? '#7c3aed' : '#2563eb', textTransform: 'uppercase', marginBottom: 6 }}>
                    {isTransition ? '⚡ Key Bridge Skills to Learn:' : '🛠️ Core Skills Needed:'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(career.bridgeSkills || career.requiredSkills || ['Python', 'SQL', 'Git', 'Analytics']).slice(0, 5).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        style={{
                          fontSize: 11.5, fontWeight: 600,
                          background: '#f1f5f9', color: '#334155',
                          padding: '3px 8px', borderRadius: 6
                        }}
                      >
                        {typeof skill === 'string' ? skill : skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ paddingTop: 14, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link
                  to={`/graduate/skill-gap?target=${encodeURIComponent(career.title || career.careerName)}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 700, color: '#2563eb', textDecoration: 'none'
                  }}
                >
                  View Gap & Roadmap <FiArrowRight size={14} />
                </Link>
                <button
                  onClick={() => setSelectedCareer(career)}
                  style={{
                    background: 'none', border: 'none',
                    fontSize: 12.5, fontWeight: 600, color: '#64748b', cursor: 'pointer'
                  }}
                >
                  Quick Details
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal for Quick Details */}
      {selectedCareer && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 20
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, maxWidth: 560, width: '100%',
            padding: 28, position: 'relative', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#2563eb' }}>
                  Career Breakdown
                </span>
                <h2 style={{ margin: '4px 0 10px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                  {selectedCareer.title || selectedCareer.careerName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCareer(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
              {selectedCareer.description || 'Specialized role focused on technical problem solving and modern stack implementation.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Market Salary</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{selectedCareer.salaryRange || '₹5 - 10 LPA'}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Industry Outlook</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>{selectedCareer.demand || 'High Growth'}</div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                Key Roles & Day-to-Day Responsibilities
              </h4>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#475569', fontSize: 13, lineHeight: 1.6 }}>
                <li>Analyze system requirements and design modular solutions</li>
                <li>Write robust, clean, and tested code or automation workflows</li>
                <li>Collaborate with cross-functional product, QA, and operations teams</li>
                <li>Stay updated with the latest frameworks, tools, and best practices</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link
                to={`/graduate/skill-gap?target=${encodeURIComponent(selectedCareer.title || selectedCareer.careerName)}`}
                style={{
                  flex: 1, textAlign: 'center', background: '#2563eb', color: '#fff',
                  textDecoration: 'none', padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 14
                }}
              >
                Start Skill Gap Analysis
              </Link>
              <button
                onClick={() => setSelectedCareer(null)}
                style={{
                  padding: '12px 18px', background: '#f1f5f9', border: 'none',
                  borderRadius: 10, fontWeight: 600, color: '#475569', cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
