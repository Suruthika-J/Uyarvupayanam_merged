import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiSearch, FiStar } from 'react-icons/fi'
import { careerService } from '../../services'
import { SBadge, SBtn, SCard, SEmpty, SInput, SLoader, SSelect } from '../../components/ui'
import {
  CAREER_CLASS_CONFIGS,
  CAREER_CLASS_MAP,
  INTEREST_OPTIONS,
  extractCareerResponse,
  getCareerShortDescription,
} from './careerCatalog'

// â”€â”€ Career card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function CareerPathCard({ career, accent, badgeColor }) {
  const shortDesc = getCareerShortDescription(career)
  return (
    <SCard
      hover
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        borderTop: `4px solid ${accent}`,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.98), var(--s-surface))',
      }}
    >
      {/* badges + title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <SBadge color={badgeColor}>{career.level}</SBadge>
          <SBadge color="gray">{career.interestArea || 'General'}</SBadge>
          {career.isRecommended && <SBadge color="gold">â­ Recommended</SBadge>}
        </div>
        <h2 style={{
          fontFamily: 'var(--s-font-display)', fontWeight: 800,
          fontSize: 20, color: 'var(--s-text)', margin: 0,
        }}>
          {career.title}
        </h2>
      </div>

      {/* description */}
      <p style={{ margin: 0, fontSize: 14, color: 'var(--s-text3)', lineHeight: 1.75, flex: 1 }}>
        {shortDesc.length > 180 ? shortDesc.slice(0, 180) + 'â€¦' : shortDesc}
      </p>

      {/* course tags */}
      {(career.relatedCourses || []).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(career.relatedCourses || []).slice(0, 3).map((course, i) => (
            <span key={i} style={{
              fontSize: 12, background: `${accent}16`, color: accent,
              padding: '5px 10px', borderRadius: 999, fontWeight: 700,
            }}>
              {course}
            </span>
          ))}
          {career.relatedCourses.length > 3 && (
            <span style={{ fontSize: 12, color: 'var(--s-text3)', padding: '5px 10px' }}>
              +{career.relatedCourses.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: 'auto' }}>
        <Link to={`/careers/path/${career._id}`} style={{ textDecoration: 'none' }}>
          <SBtn variant="primary">View Details</SBtn>
        </Link>
      </div>
    </SCard>
  )
}

// â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function CareerClassPage() {
  const { classKey } = useParams()
  const config = CAREER_CLASS_MAP[classKey]

  const [careers, setCareers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [interestFilter, setInterestFilter] = useState('All')

  // Fetch only careers for this class level using `level` query param
  useEffect(() => {
    if (!config) { setLoading(false); return }
    setLoading(true)
    careerService.getByLevel(config.level)
      .then((response) => setCareers(extractCareerResponse(response)))
      .catch(() => setCareers([]))
      .finally(() => setLoading(false))
  }, [config])

  // Client-side filter for search + interest (level already filtered by API)
  const filteredCareers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return careers.filter((career) => {
      const sameInterest = interestFilter === 'All' || career.interestArea === interestFilter
      const matchesSearch = !q || [
        career.title,
        career.description,
        career.interestArea,
        ...(career.relatedCourses || []),
        ...(career.futureOpportunities || []),
      ].some((v) => String(v || '').toLowerCase().includes(q))
      return sameInterest && matchesSearch
    })
  }, [careers, interestFilter, search])

  // â”€â”€ invalid class key â”€â”€
  if (!config) {
    return (
      <div className="student-root" style={{ padding: '40px 20px', maxWidth: 1080, margin: '0 auto' }}>
        <SEmpty
          icon="ðŸ§­"
          title="Class not found"
          desc="Choose one of the available class guidance categories to continue."
        />
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/careers" style={{ textDecoration: 'none' }}>
            <SBtn variant="primary">Back to All Classes</SBtn>
          </Link>
        </div>
      </div>
    )
  }

  const { accent, badgeColor } = config

  return (
    <div className="student-root" style={{ padding: '32px 20px 48px', maxWidth: 1180, margin: '0 auto' }}>

      {/* â”€â”€ hero banner â”€â”€ */}
      <div className="s-anim-up" style={{
        marginBottom: 28,
        padding: '28px clamp(20px, 4vw, 34px)',
        borderRadius: 28,
        background: `linear-gradient(135deg, ${accent}18 0%, rgba(255,255,255,0.96) 55%, ${accent}10 100%)`,
        border: '1px solid var(--s-border)',
        boxShadow: 'var(--s-shadow-lg)',
      }}>
        <Link
          to="/careers"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            marginBottom: 18, color: 'var(--s-text2)',
            textDecoration: 'none', fontWeight: 700, fontSize: 14,
          }}
        >
          <FiArrowLeft size={16} />
          All Career Classes
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 720 }}>
            <SBadge color={badgeColor} style={{ marginBottom: 12 }}>{config.title}</SBadge>
            <h1 style={{
              fontFamily: 'var(--s-font-display)', fontWeight: 800,
              fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--s-text)',
              margin: '0 0 10px',
            }}>
              {config.heading}
            </h1>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--s-text3)', lineHeight: 1.8 }}>
              {config.description}
            </p>
          </div>

          {/* count pill */}
          <div style={{
            minWidth: 190, padding: '18px 20px', borderRadius: 22,
            background: 'rgba(255,255,255,0.82)', border: '1px solid var(--s-border)',
          }}>
            <div style={{
              fontSize: 12, fontWeight: 800, color: 'var(--s-text3)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6,
            }}>
              Paths Available
            </div>
            <div style={{
              fontFamily: 'var(--s-font-display)',
              fontSize: 34, fontWeight: 900, color: accent,
            }}>
              {loading ? 'â€¦' : filteredCareers.length}
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€ search + filter row â”€â”€ */}
      <div className="s-anim-up s-d1" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(200px, 0.8fr)',
        gap: 14, marginBottom: 28,
      }}>
        <SInput
          placeholder={`Search ${config.title.toLowerCase()} career paths...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<FiSearch />}
        />
        <SSelect value={interestFilter} onChange={(e) => setInterestFilter(e.target.value)}>
          {INTEREST_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt === 'All' ? 'All Interests' : opt}</option>
          ))}
        </SSelect>
      </div>

      {/* â”€â”€ results count + sibling class links â”€â”€ */}
      <div className="s-anim-up s-d2" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12,
        marginBottom: 18, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--s-text2)', fontWeight: 700 }}>
          <FiStar size={15} color={accent} />
          {loading ? 'Loadingâ€¦' : `Showing ${filteredCareers.length} career path${filteredCareers.length === 1 ? '' : 's'}`}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CAREER_CLASS_CONFIGS.filter((c) => c.key !== config.key).map((c) => (
            <Link key={c.key} to={`/careers/class/${c.key}`} style={{ textDecoration: 'none' }}>
              <SBtn variant="ghost" size="sm">{c.title}</SBtn>
            </Link>
          ))}
        </div>
      </div>

      {/* â”€â”€ career grid â”€â”€ */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <SLoader />
        </div>
      ) : filteredCareers.length === 0 ? (
        <SEmpty
          icon="ðŸ›¤ï¸"
          title={`No career paths found for ${config.title}`}
          desc={search || interestFilter !== 'All'
            ? 'Try clearing your search or changing the interest filter.'
            : 'The admin hasn\'t added career paths for this class yet. Check back later!'}
        />
      ) : (
        <div className="s-anim-up s-d3" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 18,
        }}>
          {filteredCareers.map((career) => (
            <CareerPathCard
              key={career._id}
              career={career}
              accent={accent}
              badgeColor={badgeColor}
            />
          ))}
        </div>
      )}

    </div>
  )
}