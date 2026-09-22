import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import StrengthRadar from '../../components/class5/redesign/StrengthRadar'
import SortingQuiz from '../../components/class5/redesign/SortingQuiz'
import SectionHeader, { SubSection } from '../../components/class5/redesign/SectionHeader'
import Class5Card from '../../components/class5/redesign/Class5Card'
import { worldColor } from '../../components/class5/redesign/class5Theme'
import { getCareerWorlds, getSkillProfile } from '../../services/class5DiscoveryService'
import { SLoader } from '../../components/ui'

export default function DiscoverMePage() {
  const navigate = useNavigate()
  const [worlds, setWorlds] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    let mounted = true
    getCareerWorlds().then((w) => mounted && setWorlds(w))
    getSkillProfile().then((p) => mounted && setProfile(p))
    return () => { mounted = false }
  }, [])

  const skillKey = Object.keys(profile?.skills || {}).filter((k) => (profile.skills?.[k] || 0) >= 65)
  const strengthLabel = skillKey[0] ? skillKey[0][0].toUpperCase() + skillKey[0].slice(1) : null

  return (
    <div>
      <SectionHeader
        eyebrow="🧭 Discover Me"
        title="Who are you becoming?"
        subtitle="Take the sort quiz once; your career world and strength radar keep growing with every quest you play."
      />

      <SortingQuiz initialProfile={profile} />

      <SubSection
        title="Your strength radar"
        subtitle="Five strengths every career uses — yours grows as you play."
      />

      <div
        style={{
          background: '#fff',
          border: '1px solid #eaf0f6',
          borderRadius: 32,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)',
          padding: 22,
        }}
      >
        {profile ? (
          <StrengthRadar skills={profile.skills} height={320} />
        ) : (
          <SLoader />
        )}
        {strengthLabel && (
          <p style={{ textAlign: 'center', fontSize: 13.5, fontWeight: 700, color: worldColor('navy'), margin: '6px 0 0' }}>
            🌟 Early super-strength: {strengthLabel}
          </p>
        )}
      </div>

      <SubSection
        title="Career worlds"
        subtitle="Seven worlds, seven ways of thinking. Every world leads to real careers."
        actionLabel="See how talents connect to careers"
        action={() => navigate('/student/class5/real-world')}
      />

      {worlds ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
          {worlds.map((w) => (
            <Class5Card
              key={w.key}
              title={w.name}
              tag="Career world"
              tagColor={w.colorTag}
              description={`${w.tagline}. ${w.description}`}
              oneLiner={w.tagline}
              emoji={w.emoji}
              gradient={`linear-gradient(135deg, ${worldColor(w.colorTag)} 0%, #0f4c75 120%)`}
              footer={
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, marginTop: -2 }}>
                  {(w.skillTags || []).map((t) => (
                    <span key={t} style={{ fontSize: 10.5, fontWeight: 800, color: worldColor(w.colorTag), background: `${worldColor(w.colorTag)}14`, padding: '3px 9px', borderRadius: 99 }}>
                      {t}
                    </span>
                  ))}
                </div>
              }
              cta="Explore"
              ctaIcon={FiArrowRight}
              onClick={() => navigate('/student/class5/real-world')}
            />
          ))}
        </div>
      ) : (
        <SLoader />
      )}
    </div>
  )
}