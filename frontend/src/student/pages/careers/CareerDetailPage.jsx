import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  FiArrowLeft, FiBookOpen, FiCheckCircle,
  FiMap, FiStar, FiTrendingUp, FiZap,
} from 'react-icons/fi'
import { careerService } from '../../services'
import { SBadge, SBtn, SCard, SLoader } from '../../components/ui'
import { CAREER_CLASS_MAP, CAREER_CLASS_CONFIGS } from './careerCatalog'

// â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function getConfigByLevel(level) {
  return CAREER_CLASS_CONFIGS.find((c) => c.level === level) || CAREER_CLASS_CONFIGS[0]
}

// â”€â”€ sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SectionHeader({ icon: Icon, label, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${accent}18`, color: accent,
        display: 'grid', placeItems: 'center', flexShrink: 0,
      }}>
        <Icon size={18} />
      </div>
      <h2 style={{
        fontFamily: 'var(--s-font-display)', fontWeight: 800,
        fontSize: 18, color: 'var(--s-text)', margin: 0,
      }}>
        {label}
      </h2>
    </div>
  )
}

function RoadmapStep({ step, index, accent }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{
        flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
        background: `${accent}18`, color: accent,
        display: 'grid', placeItems: 'center',
        fontFamily: 'var(--s-font-display)', fontWeight: 800, fontSize: 13,
        border: `2px solid ${accent}30`,
      }}>
        {index + 1}
      </div>
      <div style={{
        flex: 1, padding: '8px 14px', borderRadius: 12,
        background: 'var(--s-surface2)',
        border: '1px solid var(--s-border)',
        fontSize: 14.5, color: 'var(--s-text)', lineHeight: 1.65,
      }}>
        {step}
      </div>
    </div>
  )
}

function TagList({ items, accent }) {
  if (!items?.length) return <p style={{ color: 'var(--s-text3)', fontSize: 14 }}>No data available.</p>
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {items.map((item, i) => (
        <span key={i} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13.5, fontWeight: 700,
          background: `${accent}14`, color: accent,
          padding: '6px 14px', borderRadius: 999,
          border: `1px solid ${accent}28`,
        }}>
          <FiCheckCircle size={13} />
          {item}
        </span>
      ))}
    </div>
  )
}

// â”€â”€ error state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function NotFound({ id }) {
  return (
    <div style={{ padding: '60px 20px', maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>ðŸ§­</div>
      <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 800, color: 'var(--s-text)', margin: '0 0 10px' }}>
        Career Path Not Found
      </h2>
      <p style={{ color: 'var(--s-text3)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
        The career path you're looking for doesn't exist or may have been removed.
      </p>
      <Link to="/careers" style={{ textDecoration: 'none' }}>
        <SBtn variant="primary">Back to Careers</SBtn>
      </Link>
    </div>
  )
}

// â”€â”€ main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function CareerDetailPage() {
  const { id } = useParams()
  const [career, setCareer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    careerService.getById(id)
      .then((response) => {
        const data = response?.data ?? response
        if (!data?._id) { setNotFound(true); return }
        setCareer(data)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center' }}>
        <SLoader />
      </div>
    )
  }

  if (notFound || !career) return <NotFound id={id} />

  const config = getConfigByLevel(career.level)
  const { accent, badgeColor, key: classKey } = config
  const roadmap = career.roadmap || []
  const relatedCourses = career.relatedCourses || []
  const futureOpportunities = career.futureOpportunities || career.careerDirections || []

  return (
    <div className="student-root" style={{ padding: '32px 20px 60px', maxWidth: 980, margin: '0 auto' }}>

      {/* â”€â”€ back nav â”€â”€ */}
      <Link
        to={`/careers/class/${classKey}`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          marginBottom: 24, color: 'var(--s-text2)',
          textDecoration: 'none', fontWeight: 700, fontSize: 14,
        }}
      >
        <FiArrowLeft size={16} />
        Back to {config.title} Career Paths
      </Link>

      {/* â”€â”€ hero banner â”€â”€ */}
      <SCard className="s-anim-up" style={{
        padding: 'clamp(24px, 4vw, 40px)',
        marginBottom: 28,
        background: `linear-gradient(135deg, ${accent}18 0%, rgba(255,255,255,0.97) 55%, ${accent}0c 100%)`,
        borderTop: `5px solid ${accent}`,
        borderRadius: 28,
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <SBadge color={badgeColor}>{career.level} Level</SBadge>
          {career.interestArea && <SBadge color="gray">{career.interestArea}</SBadge>}
          {career.isRecommended && (
            <SBadge color="gold">
              <FiStar size={11} style={{ marginRight: 4 }} />
              Recommended
            </SBadge>
          )}
        </div>

        <h1 style={{
          fontFamily: 'var(--s-font-display)', fontWeight: 900,
          fontSize: 'clamp(26px, 4vw, 38px)', color: 'var(--s-text)',
          margin: '0 0 14px',
        }}>
          {career.title}
        </h1>

        <p style={{
          fontSize: 16, color: 'var(--s-text3)', lineHeight: 1.8,
          maxWidth: 780, margin: 0,
        }}>
          {career.description}
        </p>

        {career.ageGroup && (
          <div style={{
            marginTop: 18, display: 'inline-flex', alignItems: 'center',
            gap: 8, fontSize: 13.5, fontWeight: 700,
            background: `${accent}12`, color: accent,
            padding: '6px 14px', borderRadius: 999,
          }}>
            <FiZap size={13} />
            Suitable age group: {career.ageGroup}
          </div>
        )}
      </SCard>

      {/* â”€â”€ 3-col grid: roadmap | courses | opportunities â”€â”€ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

        {/* Roadmap */}
        <SCard className="s-anim-up s-d1" style={{ padding: '24px 22px', borderRadius: 22 }}>
          <SectionHeader icon={FiMap} label="Career Roadmap" accent={accent} />
          {roadmap.length === 0
            ? <p style={{ color: 'var(--s-text3)', fontSize: 14 }}>No roadmap steps added yet.</p>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {roadmap.map((step, i) => (
                  <RoadmapStep key={i} step={step} index={i} accent={accent} />
                ))}
              </div>
            )
          }
        </SCard>

        {/* Right column: courses + opportunities stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Related Courses */}
          <SCard className="s-anim-up s-d2" style={{ padding: '24px 22px', borderRadius: 22 }}>
            <SectionHeader icon={FiBookOpen} label="Suggested Courses" accent={accent} />
            {relatedCourses.length === 0
              ? <p style={{ color: 'var(--s-text3)', fontSize: 14 }}>No courses listed.</p>
              : <TagList items={relatedCourses} accent={accent} />
            }
          </SCard>

          {/* Future Opportunities */}
          <SCard className="s-anim-up s-d3" style={{ padding: '24px 22px', borderRadius: 22 }}>
            <SectionHeader icon={FiTrendingUp} label="Future Opportunities" accent={accent} />
            {futureOpportunities.length === 0
              ? <p style={{ color: 'var(--s-text3)', fontSize: 14 }}>No opportunities listed.</p>
              : <TagList items={futureOpportunities} accent={accent} />
            }
          </SCard>

        </div>
      </div>

      {/* â”€â”€ footer CTA â”€â”€ */}
      <div className="s-anim-up" style={{
        marginTop: 32, padding: '28px 28px',
        borderRadius: 24, textAlign: 'center',
        background: `linear-gradient(135deg, ${accent}12 0%, var(--s-surface2) 100%)`,
        border: '1px solid var(--s-border)',
      }}>
        <p style={{ fontSize: 15, color: 'var(--s-text3)', margin: '0 0 16px', lineHeight: 1.7 }}>
          Interested in exploring more career paths for {config.title}?
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={`/careers/class/${classKey}`} style={{ textDecoration: 'none' }}>
            <SBtn variant="primary">More {config.title} Careers</SBtn>
          </Link>
          <Link to="/careers" style={{ textDecoration: 'none' }}>
            <SBtn variant="ghost">All Classes</SBtn>
          </Link>
        </div>
      </div>

    </div>
  )
}