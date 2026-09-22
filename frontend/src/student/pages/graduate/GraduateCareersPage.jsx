import React, { useState, useEffect } from 'react'
import {
  FiBriefcase, FiTrendingUp, FiArrowRight, FiCheckCircle,
  FiZap, FiCompass, FiAward, FiLayers, FiDollarSign, FiClock,
  FiChevronRight, FiFilter, FiExternalLink, FiHelpCircle
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import graduateService from '../../../services/graduateService'
import {
  generatePersonalizedCareers,
  getEffectiveAcademicHierarchy
} from '../../services/graduatePersonalizationEngine'
import GraduateCourseImage from '../../components/common/GraduateCourseImage'

export default function GraduateCareersPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({})
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedCareer, setSelectedCareer] = useState(null)

  useEffect(() => {
    fetchCareers()
  }, [])

  const fetchCareers = async () => {
    try {
      setLoading(true)
      const res = await graduateService.getCareers()
      if (res.success && res.profile) {
        setProfile(res.profile)
      } else {
        const pRes = await graduateService.getProfile()
        if (pRes.success && pRes.profile) setProfile(pRes.profile)
      }
    } catch (err) {
      console.error('Failed to load graduate careers profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const academic = getEffectiveAcademicHierarchy(profile)
  const personalizedCareers = generatePersonalizedCareers(profile)

  const categories = ['All', ...new Set(personalizedCareers.map(c => c.category))]

  const displayList = activeCategory === 'All'
    ? personalizedCareers
    : personalizedCareers.filter(c => c.category === activeCategory)

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
            <FiCompass size={16} /> PROFILE-DRIVEN GRADUATE CAREER ENGINE
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 8px', color: '#fff' }}>
            Personalized Career Pathways for {academic.degree} in {academic.domain}
          </h1>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: 14, lineHeight: 1.5 }}>
            Every career match is calculated from your completed degree, specialization, technical competencies, tools, and professional interests.
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

      {/* Category Filter Chips */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 18px', borderRadius: 20, border: 'none',
              background: activeCategory === cat ? '#0f172a' : '#f1f5f9',
              color: activeCategory === cat ? '#fff' : '#475569',
              fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            {cat === 'All' ? `All Ranked Match Pathways (${personalizedCareers.length})` : cat}
          </button>
        ))}
      </div>

      {/* Career Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
        {displayList.map((career, idx) => {
          return (
            <div
              key={idx}
              style={{
                background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
                padding: 20, display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', position: 'relative',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              <div>
                {/* Course-Specific Visual Image */}
                <div style={{ marginBottom: 14 }}>
                  <GraduateCourseImage course={career} height={160} borderRadius={12} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 20,
                    background: career.matchScore >= 80 ? '#d1fae5' : '#dbeafe',
                    color: career.matchScore >= 80 ? '#047857' : '#1d4ed8'
                  }}>
                    {career.matchScore}% Match
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '3px 8px', borderRadius: 6 }}>
                    {career.growthOutlook}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                  {career.title}
                </h3>
                <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                  {career.description}
                </p>

                {/* "Why Am I Seeing This?" Explanation Box */}
                <div style={{
                  background: '#f8fafc', padding: '10px 12px', borderRadius: 10,
                  fontSize: 12, color: '#334155', marginBottom: 14, borderLeft: '3px solid #2563eb'
                }}>
                  <div style={{ fontWeight: 800, fontSize: 11, color: '#1e40af', textTransform: 'uppercase', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiHelpCircle size={12} /> Why this matches your profile:
                  </div>
                  {career.whyItMatches}
                </div>

                {/* Strengths & Missing Skills */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  <div style={{ background: '#f0fdf4', padding: 10, borderRadius: 8, border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: 4 }}>
                      ✓ Your Strengths
                    </div>
                    <div style={{ fontSize: 11.5, color: '#15803d', fontWeight: 600 }}>
                      {career.matchingSkills.slice(0, 3).join(', ')}
                    </div>
                  </div>
                  <div style={{ background: '#fffbeb', padding: 10, borderRadius: 8, border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, color: '#92400e', textTransform: 'uppercase', marginBottom: 4 }}>
                      🎯 Skills to Learn
                    </div>
                    <div style={{ fontSize: 11.5, color: '#b45309', fontWeight: 600 }}>
                      {career.missingSkills.slice(0, 3).join(', ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ paddingTop: 14, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link
                  to={`/graduate/skill-gap?target=${encodeURIComponent(career.title)}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 700, color: '#2563eb', textDecoration: 'none'
                  }}
                >
                  Analyze Skill Gap <FiArrowRight size={14} />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#2563eb' }}>
                  {selectedCareer.matchScore}% Personalized Match
                </span>
                <h2 style={{ margin: '4px 0 10px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                  {selectedCareer.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCareer(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <GraduateCourseImage course={selectedCareer} height={180} borderRadius={12} />
            </div>

            <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
              {selectedCareer.description}
            </p>

            <div style={{ background: '#eff6ff', padding: 14, borderRadius: 12, border: '1px solid #bfdbfe', marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: '#1e40af', marginBottom: 4 }}>
                Profile Explanation:
              </div>
              <div style={{ fontSize: 13, color: '#1e3a8a' }}>
                {selectedCareer.whyItMatches}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                Recommended Action:
              </h4>
              <div style={{ fontSize: 13, color: '#475569', background: '#f8fafc', padding: 12, borderRadius: 10 }}>
                {selectedCareer.recommendedNextStep}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link
                to={`/graduate/skill-gap?target=${encodeURIComponent(selectedCareer.title)}`}
                style={{
                  flex: 1, textAlign: 'center', background: '#2563eb', color: '#fff',
                  textDecoration: 'none', padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 14
                }}
              >
                Analyze Skill Gap & Roadmap
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
